const transporter = require("../config/mailConfig");
const Email = require("../models/Email"); // Import model (if using DB)

exports.sendEmail = async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const mailOptions = {
    from: process.env.ZOHO_USER,
    to,
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Save email to the database (optional)
    const email = new Email({ to, subject, message });
    await email.save();

    res.status(200).json({ success: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
};
