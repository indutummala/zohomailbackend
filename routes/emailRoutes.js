const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

// Email Model
const Email = mongoose.model("Email", new mongoose.Schema({
    to: String,
    subject: String,
    text: String,
    status: { type: String, default: "pending" },
    timestamp: { type: Date, default: Date.now }
}));

// Email sending route
router.post("/send-email", async (req, res) => {
    console.log("📩 Received Data:", req.body);

    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ Missing email credentials in .env file");
        return res.status(500).json({ error: "Email credentials are missing!" });
    }

    try {
        // Save email data to MongoDB (before sending)
        const emailRecord = new Email({ to, subject, text, status: "pending" });
        await emailRecord.save();

        // Configure Nodemailer transporter
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.zoho.in",
            port: process.env.SMTP_PORT || 465,
            secure: process.env.SMTP_PORT == "465",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let mailOptions = {
            from: `"Your Name" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.response);

        // Update email status in MongoDB
        await Email.findByIdAndUpdate(emailRecord._id, { status: "sent" });

        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("❌ Email sending error:", error);
        await Email.findByIdAndUpdate(emailRecord._id, { status: "failed" });
        res.status(500).json({ error: "Failed to send email", details: error.message });
    }
});

module.exports = router;
