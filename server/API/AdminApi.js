const exp = require('express')
const AdminApp = exp.Router();
const eah = require('express-async-handler')
const mongoose = require('mongoose')
const Admin = require('../models/AdminSchema')
const Village = require('../models/VillageSchema')
const Individual = require('../models/IndividualSchema')
const Trust = require('../models/TrustSchema')
AdminApp.use(exp.json())

AdminApp.get('/admin/:mail', eah(async (req, res) => {
    const adminMail = req.params.mail
    const admin = await Admin.findOne({ email: adminMail });
    if (!admin) {
        return res.status(404).send({ message: "Admin not found" })
    }
    res.status(200).send({ message: "Admin details", payload: admin })
}))

// Get all verified villages
AdminApp.get('/admins/verified-villages', eah(async (req, res) => {
    const verifiedVillages = await Village.find({ approved: true });
    res.status(200).send({ message: "Verified villages fetched", payload: verifiedVillages });
  }));

  // Get all verified Trusts (approved = true)
AdminApp.get('/admins/verified-trusts', eah(async (req, res) => {
    const verifiedTrusts = await Trust.find({ approved: true });
    res.status(200).send({ message: "Verified trusts fetched", payload: verifiedTrusts });
  }));
  
  AdminApp.get('/admins/pending-receipts', eah(async (req, res) => {
    const individualsWithPending = await Individual.find({ "receipts.status": "pending" });
  
    const pendingReceipts = [];
  
    individualsWithPending.forEach(ind => {
      ind.receipts.forEach(receipt => {
        if (receipt.status === 'pending') {
          pendingReceipts.push({
            individualEmail: ind.email,
            individualName: ind.name,
            contact: ind.contact,
            address: ind.address,
            receiptId: receipt._id,
            type: receipt.type,
            ref_name: receipt.ref_name,
            upi_id: receipt.upi_id,
            receipt_img: receipt.receipt_img,
            amount: receipt.amount,
            submitted_on: receipt.submitted_on,
            status: receipt.status
          });
        }
      });
    });
  
    res.status(200).send({ message: "Pending receipts fetched successfully", payload: pendingReceipts });
  }));
  
  // Update receipt status
// PATCH /admin/receipt/:email/:receiptId
AdminApp.patch('/admin/receipt/:email/:receiptId', async (req, res) => {
  const { email, receiptId } = req.params;
  const { status } = req.body;

  try {
    const individual = await Individual.findOne({ email });
    if (!individual) {
      return res.status(404).json({ message: "Individual not found" });
    }

    const receipt = individual.receipts.id(receiptId);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    receipt.status = status;
    await individual.save();

    if (status !== 'approved') {
      return res.status(200).json({ message: 'Receipt status updated only' });
    }

    const { type, amount, ref_name } = receipt; // ref_name = name of trust or village

    if (type === 'trust') {
      const trust = await Trust.findOne({ name: ref_name });
      if (!trust) {
        return res.status(404).json({ message: "Trust not found by name" });
      }

      trust.funding.total_received += amount;
      await trust.save();
    } else if (type === 'village') {
      const village = await Village.findOne({ name: ref_name });
      if (!village) {
        return res.status(404).json({ message: "Village not found by name" });
      }

      const userIndex = village.user.findIndex(user => user.user_name === individual.email);
      if (userIndex !== -1) {
        village.user[userIndex].total_money += amount;
      } else {
        village.user.push({ user_name: individual.email, total_money: amount });
      }

      await village.save();
    }

    return res.status(200).json({ message: 'Receipt approved and data updated successfully' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while updating receipt status' });
  }
});

// Route to verify a village by setting 'approved' status to true
AdminApp.patch('/admin/verify-village/:id', eah(async (req, res) => {
  const villageId = req.params.id;
  
  // Find the village by ID
  const village = await Village.findById(villageId);
  
  if (!village) {
    return res.status(404).send({ message: "Village not found" });
  }

  // Update the village's 'approved' status to true
  village.approved = true;
  await village.save();

  res.status(200).send({ message: "Village verified successfully", payload: village });
}));

// Route to verify a trust by setting 'approved' status to true
AdminApp.patch('/admin/verify-trust/:id', eah(async (req, res) => {
  const trustId = req.params.id;
  
  // Find the trust by ID
  const trust = await Trust.findById(trustId);
  
  if (!trust) {
    return res.status(404).send({ message: "Trust not found" });
  }

  // Update the trust's 'approved' status to true
  trust.approved = true;
  await trust.save();

  res.status(200).send({ message: "Trust verified successfully", payload: trust });
}));

// Route to get all unverified trusts
AdminApp.get('/admins/unverified-trusts', eah(async (req, res) => {
  const unverifiedTrusts = await Trust.find({ approved: false });

  if (!unverifiedTrusts) {
    return res.status(404).send({ message: "No unverified trusts found" });
  }

  res.status(200).send({ message: "Unverified trusts", payload: unverifiedTrusts });
}));

// Route to approve (verify) a trust by updating its 'approved' status to true
AdminApp.patch('/admin/approve-trust/:id', eah(async (req, res) => {
  const trustId = req.params.id;
  
  // Find the trust by ID
  const trust = await Trust.findById(trustId);

  if (!trust) {
    return res.status(404).send({ message: "Trust not found" });
  }

  // Update the 'approved' status to true
  trust.approved = true;
  await trust.save();

  res.status(200).send({ message: "Trust approved successfully", payload: trust });
}));

// Route to get all unverified villages
AdminApp.get('/admins/unverified-villages', eah(async (req, res) => {
  const unverifiedVillages = await Village.find({ approved: false });
  
  if (!unverifiedVillages) {
    return res.status(404).send({ message: "No unverified villages found" });
  }

  res.status(200).send({ message: "Unverified villages", payload: unverifiedVillages });
}));

// Route to approve (verify) a village by updating its 'approved' status to true
AdminApp.patch('/admin/approve-village/:id', eah(async (req, res) => {
  const villageId = req.params.id;
  
  // Find the village by ID
  const village = await Village.findById(villageId);

  if (!village) {
    return res.status(404).send({ message: "Village not found" });
  }

  // Update the 'approved' status to true
  village.approved = true;
  await village.save();

  res.status(200).send({ message: "Village approved successfully", payload: village });
}));



module.exports = AdminApp