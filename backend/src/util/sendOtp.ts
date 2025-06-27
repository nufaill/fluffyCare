// backend/src/utils/otpUtil.ts
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Generate a 6-digit OTP
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Setup email transporter (configure based on your email provider)
const createTransporter = () => {
  return nodemailer.createTransport({
    // Gmail configuration example - replace with your SMTP settings
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
    // Alternative SMTP configuration
    // host: process.env.SMTP_HOST,
    // port: parseInt(process.env.SMTP_PORT || '587'),
    // secure: false,
    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASS,
    // },
  });
};

export const sendOtpEmail = async (email: string, otp: string, userName?: string): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"FluffyCare" <noreply@fluffycare.com>',
    to: email,
    subject: 'Verify Your Email - FluffyCare',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .otp-box { background: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px; margin: 10px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to FluffyCare!</h1>
            <p>We're excited to have you join our community.</p>
          </div>
          
          <p>Hi${userName ? ` ${userName}` : ''},</p>
          
          <p>Thank you for signing up! To complete your registration, please verify your email address using the OTP code below:</p>
          
          <div class="otp-box">
            <p><strong>Your verification code is:</strong></p>
            <div class="otp-code">${otp}</div>
            <p><small>This code will expire in 10 minutes</small></p>
          </div>
          
          <p>If you didn't create an account with FluffyCare, please ignore this email.</p>
          
          <div class="footer">
            <p>Best regards,<br>The FluffyCare Team</p>
            <p><small>This is an automated message, please do not reply to this email.</small></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to FluffyCare!
      
      Hi${userName ? ` ${userName}` : ''},
      
      Thank you for signing up! To complete your registration, please verify your email address using this OTP code:
      
      ${otp}
      
      This code will expire in 10 minutes.
      
      If you didn't create an account with FluffyCare, please ignore this email.
      
      Best regards,
      The FluffyCare Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error);
    throw new Error('Failed to send verification email');
  }
};