export interface IEmailService {
  sendResetEmail(to: string, subject: string, resetLink: string): Promise<void>;
  sendGenericEmail(to: string, subject: string, content: string): Promise<void>;
  sendOtpEmail(to: string, subject: string, otp: string): Promise<void>;
}