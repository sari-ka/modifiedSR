const mongoose = require('mongoose');

const VillageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Sarpanch Email
  password: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  contact: { type: String, required: true },
  upi_id: { type: String },
  approved: { type: Boolean, default: false },
  sarpanch: { type: Boolean, default: true },

  problems: [
    {
      title: { type: String },
      estimatedamt: { type: Number },
      description: { type: String },
      status: { type: String, enum: ["upcoming", "ongoing", "past","pending"], default: "pending" },
      assigned_trust: { type: mongoose.Schema.Types.ObjectId, ref: "Trust", default: null },
      money_trust: { type: Number, default: 0 },
      posted_time: { type: Date, default: Date.now },
      solved_time: { type: Date },
      done_by_village: { type: String,enum: ["accepted", "started", "done","false"], default: "false" },
      done_by_trust: { type: String,enum: ["accepted", "started", "done","false"], default: "false" },
      accepted_trust:{ type: mongoose.Schema.Types.ObjectId, ref: "Trust", default: null}
    },
  ],

  feedback: [
    {
      trust_id: { type: mongoose.Schema.Types.ObjectId, ref: "Trust" },
      message: String,
      rating: Number,
    },
  ],

  money_lent: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Trust" },
      amount: Number,
      date: { type: Date, default: Date.now },
    },
  ],

  trusts: [
    {
      trust_name: { type: String },
      total_money: { type: Number },
    },
  ],

  user: [
    {
      user_name: { type: String },
      total_money: { type: Number },
    },
  ],

  rating: { type: Number, default: 0 },
});

const Village = mongoose.model("Village", VillageSchema);
module.exports = Village;
