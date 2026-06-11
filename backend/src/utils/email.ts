import nodemailer from "nodemailer"

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  const testAccount = await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  })

  const info = await transporter.sendMail({
    from: '"Task Manager" <noreply@taskmanager.com>',
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 2rem; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #534AB7;">Reset Your Password</h2>
        <p style="color: #555;">Click the button below to set a new password.</p>
        <a href="${resetUrl}" style="display:inline-block; margin: 1.5rem 0; padding: 12px 28px; background: #534AB7; color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 13px;">This link expires in 1 hour.</p>
      </div>
    `
  })

  console.log("Preview URL: " + nodemailer.getTestMessageUrl(info))
  return nodemailer.getTestMessageUrl(info)
}
