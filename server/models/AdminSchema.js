const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  verified_trusts: [
    {
      trust_id: { type: mongoose.Schema.Types.ObjectId, ref: "Trust" },
      approval_date: { type: Date, default: Date.now },
    },
  ],

  verified_villages: [
    {
      village_id: { type: mongoose.Schema.Types.ObjectId, ref: "Village" },
      approval_date: { type: Date, default: Date.now },
    },
  ],

  rewards: [
    {
      recipient_type: { type: String, enum: ["trust", "individual", "village"], required: true },
      recipient_id: { type: mongoose.Schema.Types.ObjectId, required: true },
      reward_type: { type: String, enum: ["certificate", "funding", "recognition"] },
      date: { type: Date, default: Date.now },
    },
  ],
});


module.exports = mongoose.model("admin", AdminSchema);