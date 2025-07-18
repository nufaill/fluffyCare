import { injectable } from 'tsyringe';
import nodemailer from 'nodemailer';
import  PASSWORD_RESET_MAIL_CONTENT  from '../../shared/mailTemplate';

@injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendResetEmail(to: string, subject: string, resetLink: string): Promise<void> {
    const mailOptions = {
      from: `"fluffyCare" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: PASSWORD_RESET_MAIL_CONTENT(resetLink),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendGenericEmail(to: string, subject: string, content: string): Promise<void> {
    const mailOptions = {
      from: `"fluffyCare" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: content,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOtpEmail(to: string, subject: string, otp: string): Promise<void> {
    const htmlContent = `<p>Your OTP is: <strong>${otp}</strong></p>`;
    const mailOptions = {
      from: `"fluffyCare" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
