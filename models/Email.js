const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  text: { type: String, required: true },
  status: { type: String, default: "pending" }, // pending, sent, failed
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Email", EmailSchema);
