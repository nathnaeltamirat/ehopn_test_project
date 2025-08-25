const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORDWORD
    }
  });
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured. Skipping welcome email.');
      return { success: true, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to EHopN - Your Invoice Management Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to EHopN! 🎉</h2>
          <p>Hi ${name},</p>
          <p>Thank you for joining EHopN! We're excited to help you manage your invoices more efficiently.</p>
          <p>With EHopN, you can:</p>
          <ul>
            <li>Upload and process invoices automatically</li>
            <li>Extract data using advanced OCR technology</li>
            <li>Organize and search your invoices easily</li>
            <li>Export data in multiple formats</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The EHopN Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Welcome email sent successfully' };
  } catch (error) {
    console.error('Send welcome email error:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured. Skipping password reset email.');
      return { success: true, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'https://ehopn-test-project.vercel.app';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - EHopN',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password for your EHopN account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <p>Best regards,<br>The EHopN Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('Send password reset email error:', error);
    return { success: false, error: error.message };
  }
};

// Send subscription confirmation email
const sendSubscriptionEmail = async (email, name, planName) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured. Skipping subscription email.');
      return { success: true, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Subscription Confirmed - ${planName} Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Subscription Confirmed! 🎉</h2>
          <p>Hi ${name},</p>
          <p>Your subscription to the <strong>${planName}</strong> plan has been successfully activated!</p>
          <p>You now have access to all the features included in your plan.</p>
          <p>If you have any questions about your subscription, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The EHopN Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Subscription email sent successfully' };
  } catch (error) {
    console.error('Send subscription email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSubscriptionEmail
};
