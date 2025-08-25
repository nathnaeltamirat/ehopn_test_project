const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to EHopN</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .welcome-text { font-size: 18px; color: #374151; line-height: 1.6; margin-bottom: 30px; }
            .features { background-color: #f9fafb; border-radius: 12px; padding: 30px; margin: 30px 0; }
            .feature-item { display: flex; align-items: center; margin-bottom: 15px; }
            .feature-icon { width: 24px; height: 24px; background-color: #10b981; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; }
            .feature-icon::before { content: "✓"; color: white; font-weight: bold; }
            .feature-text { color: #374151; font-size: 16px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
            .logo { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to EHopN!</h1>
            </div>
            <div class="content">
              <p class="welcome-text">Hi <strong>${name}</strong>,</p>
              <p class="welcome-text">Thank you for joining EHopN! We're excited to help you manage your invoices more efficiently and transform the way you handle your business documents.</p>
              
              <div class="features">
                <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 20px;">🚀 What you can do with EHopN:</h3>
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">Upload and process invoices automatically</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">Extract data using advanced OCR technology</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">Organize and search your invoices easily</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">Export data in multiple formats</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">AI-powered data extraction and validation</div>
                </div>
              </div>
              
              <p class="welcome-text">Ready to get started? Click the button below to access your dashboard:</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://ehopn-test-project.vercel.app'}/dashboard" class="cta-button">Access Your Dashboard</a>
              </div>
              
              <p class="welcome-text">If you have any questions or need assistance, our support team is here to help. Don't hesitate to reach out!</p>
              
              <p class="welcome-text">Best regards,<br><strong>The EHopN Team</strong></p>
            </div>
            <div class="footer">
              <div class="logo">EHopN</div>
              <p>Your trusted invoice management platform</p>
              <p>© 2024 EHopN. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - EHopN</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .main-text { font-size: 18px; color: #374151; line-height: 1.6; margin-bottom: 30px; }
            .reset-box { background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; }
            .reset-button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
            .warning-box { background-color: #fffbeb; border: 2px solid #fed7aa; border-radius: 12px; padding: 20px; margin: 30px 0; }
            .warning-text { color: #92400e; font-size: 14px; margin: 0; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
            .logo { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
            .security-icon { font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p class="main-text">Hi <strong>${name}</strong>,</p>
              <p class="main-text">We received a request to reset your password for your EHopN account. If you didn't make this request, you can safely ignore this email.</p>
              
              <div class="reset-box">
                <div class="security-icon">🔒</div>
                <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 20px;">Reset Your Password</h3>
                <p style="color: #374151; margin-bottom: 25px;">Click the button below to securely reset your password:</p>
                <a href="${resetUrl}" class="reset-button">Reset Password</a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This link will expire in 1 hour for your security.</p>
              </div>
              
              <div class="warning-box">
                <p class="warning-text"><strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account is secure and no action is needed.</p>
              </div>
              
              <p class="main-text">For additional security, we recommend:</p>
              <ul style="color: #374151; line-height: 1.8;">
                <li>Using a strong, unique password</li>
                <li>Enabling two-factor authentication if available</li>
                <li>Regularly reviewing your account activity</li>
              </ul>
              
              <p class="main-text">If you have any questions or need assistance, please contact our support team.</p>
              
              <p class="main-text">Best regards,<br><strong>The EHopN Security Team</strong></p>
            </div>
            <div class="footer">
              <div class="logo">EHopN</div>
              <p>Your trusted invoice management platform</p>
              <p>© 2024 EHopN. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Confirmed - EHopN</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .main-text { font-size: 18px; color: #374151; line-height: 1.6; margin-bottom: 30px; }
            .plan-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #bbf7d0; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; }
            .plan-name { font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 15px; }
            .success-icon { font-size: 48px; margin-bottom: 20px; }
            .features-list { background-color: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0; }
            .feature-item { display: flex; align-items: center; margin-bottom: 12px; }
            .feature-icon { width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; margin-right: 12px; display: flex; align-items: center; justify-content: center; }
            .feature-icon::before { content: "✓"; color: white; font-weight: bold; font-size: 12px; }
            .feature-text { color: #374151; font-size: 15px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
            .logo { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Subscription Confirmed!</h1>
            </div>
            <div class="content">
              <p class="main-text">Hi <strong>${name}</strong>,</p>
              <p class="main-text">Congratulations! Your subscription to the <strong>${planName}</strong> plan has been successfully activated. You now have access to all the premium features included in your plan.</p>
              
              <div class="plan-box">
                <div class="success-icon">✅</div>
                <div class="plan-name">${planName} Plan</div>
                <p style="color: #059669; font-weight: 600; margin: 0;">Successfully Activated</p>
              </div>
              
              <div class="features-list">
                <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 20px;">🚀 Your New Features:</h3>
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">Unlimited invoice uploads and processing</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">Advanced OCR and AI-powered data extraction</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">Priority customer support</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">Export data in multiple formats</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">Advanced analytics and reporting</div>
                </div>
                ${planName === 'Business' ? `
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">API access for integrations</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon"></div>
                  <div class="feature-text">Dedicated account manager</div>
                </div>
                ` : ''}
              </div>
              
              <p class="main-text">Ready to explore your new features? Click the button below to access your enhanced dashboard:</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://ehopn-test-project.vercel.app'}/dashboard" class="cta-button">Access Your Dashboard</a>
              </div>
              
              <p class="main-text">If you have any questions about your subscription or need help getting started with the new features, please don't hesitate to contact our support team.</p>
              
              <p class="main-text">Thank you for choosing EHopN!<br><strong>The EHopN Team</strong></p>
            </div>
            <div class="footer">
              <div class="logo">EHopN</div>
              <p>Your trusted invoice management platform</p>
              <p>© 2024 EHopN. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
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
