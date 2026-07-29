const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Send single email
const sendEmail = async (to, subject, text, html, attachments = []) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'SIM Technology Institute'}" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send bulk emails
const sendBulkEmails = async (recipients, subject, text, html, attachments = []) => {
  const results = [];
  const transporter = createTransporter();
  
  for (const recipient of recipients) {
    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'SIM Technology Institute'}" <${process.env.SMTP_FROM}>`,
        to: recipient.email,
        subject,
        text: text.replace(/{{name}}/g, recipient.name || 'Student'),
        html: html.replace(/{{name}}/g, recipient.name || 'Student'),
        attachments
      };

      const info = await transporter.sendMail(mailOptions);
      results.push({ email: recipient.email, success: true, messageId: info.messageId });
      console.log(`Email sent to ${recipient.email}:`, info.messageId);
    } catch (error) {
      console.error(`Error sending email to ${recipient.email}:`, error);
      results.push({ email: recipient.email, success: false, error: error.message });
    }
  }

  return results;
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('Email configuration error:', error);
    return { success: false, message: `Email configuration error: ${error.message}` };
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  verifyEmailConfig
};
