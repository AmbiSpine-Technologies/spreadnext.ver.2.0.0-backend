// // src/utils/email.js
// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export const sendResetEmail = async (to, resetLink) => {
//   const mailOptions = {
//     from: `"SpreadNext Admin" <${process.env.EMAIL_FROM}>`,
//     to,
//     subject: 'Password Reset Request',
//     html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
//   };
//   await transporter.sendMail(mailOptions);
// };


import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // Aapka 16-digit App Password bina spaces ke
  },
});

export const sendResetEmail = async (to, resetLink) => {
  const mailOptions = {
    from: `"SpreadNext Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2>Password Reset</h2>
        <p>You requested a password reset for your SpreadNext Admin account.</p>
        <p>Click the button below to reset it. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="background: #004aad; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};