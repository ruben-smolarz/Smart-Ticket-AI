// mailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendMail = async (to, subject, text) => {
  try {
    // Use ONLY environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_SMTP_HOST,
      port: process.env.MAILTRAP_SMTP_PORT,
      auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS,
      },
    });

    // Use 'transporter', not 'transport'
    const info = await transporter.sendMail({
      from: '"SmartTicket AI" <noreply@smartticket.com>', // Professional name
      to,
      subject,
      text,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    // Do not throw the error if you do not want to stop the Inngest workflow,
    // or throw it if you want Inngest to retry the execution.
    throw error; 
  }
};