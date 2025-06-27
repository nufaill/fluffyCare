//backnd/src/shared/mailTemplate.ts
 const PASSWORD_RESET_MAIL_CONTENT = (resetLink: string) => `
  <h2>Password Reset Request</h2>
  <p>Click the link below to reset your password:</p>
  <a href="${resetLink}">${resetLink}</a>
  <p>This link will expire in 1 hour.</p>
`;
export  default PASSWORD_RESET_MAIL_CONTENT;