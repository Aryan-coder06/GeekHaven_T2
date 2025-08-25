import nodemailer from "nodemailer";

// uses .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
export default nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
