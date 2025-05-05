const mongoose = require('mongoose')

const IndividualSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  upi_id: { type: String },
  acc_name: { type: String },
  contact: { type: String, required: true },

  receipts: [
    {
      type: { type: String, enum: ['trust', 'village'], required: true },
      ref_name: { type: String, required: true },
      upi_id: String,
      receipt_img: String, // stored path
      amount: Number,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      submitted_on: { type: Date, default: Date.now }
    }
  ]
});

const Individual = mongoose.model("individual", IndividualSchema);
module.exports = Individual