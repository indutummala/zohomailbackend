const transporter = require("../config/mailConfig");
const Email = require("../models/Email");

exports.sendEmail = async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    // Save email in MongoDB before sending
    const emailRecord = new Email({ to, subject, text, status: "pending" });
    await emailRecord.save();

    const mailOptions = {
      from: `"Your Name" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);

    // Update email status to 'sent'
    await Email.findByIdAndUpdate(emailRecord._id, { status: "sent" });

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    await Email.findByIdAndUpdate(emailRecord._id, { status: "failed" });

    res.status(500).json({ error: "Failed to send email", details: error.message });
  }
};
