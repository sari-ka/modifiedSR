const exp=require('express')
const individualApp=exp.Router();
const eah=require('express-async-handler')
const Individual = require('../models/IndividualSchema')
const Trust = require('../models/TrustSchema'); 
const Village = require('../models/TrustSchema'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
individualApp.use(exp.json())

const receiptUploadPath = path.join(__dirname, '../uploads/receipts');
fs.mkdirSync(receiptUploadPath, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptUploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

individualApp.post('/upload-receipt', upload.single('receipt'), async (req, res) => {
  const { type, refName, upiId, amount, email } = req.body;

  console.log('Received receipt upload:', {
    type, refName, upiId, amount, email,
    file: req.file ? req.file.originalname : 'No file'
  });

  if (!type || !refName || !upiId || !amount || !email || !req.file) {
    return res.status(400).json({ error: 'Please provide all required fields including file.' });
  }

  try {
    const individual = await Individual.findOne({ email });
    if (!individual) {
      return res.status(404).json({ error: 'Individual not found' });
    }

    individual.receipts.push({
      type,
      ref_name: refName,
      upi_id: upiId,
      receipt_img: `/uploads/receipts/${req.file.filename}`,
      amount,
      status: 'pending',
      submitted_on: new Date()
    });

    await individual.save();

    console.log('Receipt saved for:', email);
    res.status(200).json({ message: 'Receipt uploaded successfully' });

  } catch (error) {
    console.error('Error saving receipt:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


individualApp.get('/individual',eah(async(req,res)=>{
     const individualList = await Individual.find();
     res.send({message:"Individuals",payload:individualList})
}))

individualApp.get('/individual/:mail',eah(async(req,res)=>{
    const mail=req.params.mail
    const individual = await Individual.find({email : mail});
    res.send({message:"Individual ",payload:individual})
}))

individualApp.post('/individual',eah(async(req,res)=>{
    const individual = req.body
    const dbres = await Individual.findOne({email:individual.email})
    if(dbres)
        res.status(409).send({message:"individual already existed",payload:individual})
    else{
        const individualDoc = Individual(individual)
        let r=await individualDoc.save()
        res.status(201).send({message:"Individual added" ,payload:individualDoc})
    }
}))


individualApp.put('/individual',eah(async(req,res)=>{
    const individual=req.body;
    let updatedindividual=await Individual.findOneAndUpdate({email:individual.email},{$set:{...individual}},{new:true})
    res.send({message:"updated",payload:updatedindividual})
}))

individualApp.get('/individual-total-funding', async (req, res) => {
  try {
    const individualList = await Individual.find();

    // Calculate total funded amount for each individual
    const individualsWithFundedAmount = await Promise.all(individualList.map(async (individual) => {
      const approvedReceipts = individual.receipts.filter(receipt => receipt.status === 'approved');
      const totalFundedAmount = approvedReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
      return { email: individual.email, totalFundedAmount }; // Only return email and total funded amount
    }));

    res.send({ message: "Total funded amounts for individuals", payload: individualsWithFundedAmount });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error fetching total funded amounts" });
  }
});


module.exports=individualApp