import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"NoQ App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP for NoQ Registration",
    html: `
      <div style="font-family: Arial;">
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      </div>
    `,
  });
};