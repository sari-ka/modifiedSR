const mongoose = require('mongoose')

const IndividualSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  upi_id: { type: String },
  contact: { type: String, required: true },

  funding: [
    {
      recipient_type: { type: String, enum: ["Trust", "Village"], required: true },
      recipient_id: { type: mongoose.Schema.Types.ObjectId, required: true },
      amount: Number,
      date: { type: Date, default: Date.now },
    },
  ],

  resources_shared: [
    {
      recipient_type: { type: String, enum: ["Trust", "Village"], required: true },
      recipient_id: { type: mongoose.Schema.Types.ObjectId, required: true },
      resources: [String],
    },
  ],

  rating: { type: Number, default: 0 }, // Individual rating based on contributions
});

const Individual = mongoose.model("individual", IndividualSchema);
module.exports = Individual