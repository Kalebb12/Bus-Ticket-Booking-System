const nodemailer = require("nodemailer");
const AppError = require("../utils/appError")
require("dotenv").config();

const sendEmail = async ({ to, subject, text, html , attachments},next) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      service: 'gmail',
      secure: false, // Use `true` for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    return next(new AppError("❌ Email sending error:", error));
  }
}; 

module.exports = sendEmail;
