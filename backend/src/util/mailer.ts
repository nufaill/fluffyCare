import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS, 
  },
});

export const sendMail = async ({ to, subject, html }: MailOptions) => {
  await transporter.sendMail({
    from: `"Your App Name" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};
