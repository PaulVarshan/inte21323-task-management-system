import 'dotenv/config';

// Using the provided Brevo API Key
const BREVO_API_KEY = process.env.BREVO_API_KEY || "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";

export const sendResetEmail = async (toEmail: string, otpCode: string) => {
  const url = 'https://api.brevo.com/v3/smtp/email';

  const payload = {
    sender: { name: "Task Management App", email: "paulvarshan2004@gmail.com" },
    to: [{ email: toEmail }],
    subject: "Password Reset Request",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 16px;">We received a request to reset your password. Here is your One-Time Password (OTP). This code will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f1f5f9; color: #0f172a; padding: 16px 24px; border-radius: 6px; font-weight: bold; font-size: 24px; letter-spacing: 4px; display: inline-block;">${otpCode}</div>
        </div>
        <p style="color: #64748b; font-size: 14px;">If you did not request a password reset, please ignore this email or contact support.</p>
      </div>
    `
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo Email Error:", errorData);
      throw new Error("Failed to send reset email");
    }

    console.log("Reset email sent successfully");
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw new Error("Failed to send reset email");
  }
};

export const sendWelcomeEmail = async (to: string, username: string, plainTextPassword: string) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: "paulvarshan2004@gmail.com", name: "Task Management System" },
        to: [{ email: to }],
        subject: "Welcome to Task Management System - Your Account Details",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0ea5e9; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to Task Management System!</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #333;">Hello <strong>${username}</strong>,</p>
              <p style="font-size: 16px; color: #333;">An administrator has created an account for you. Below are your temporary login credentials:</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> ${to}</p>
                <p style="margin: 5px 0; font-size: 16px;"><strong>Password:</strong> ${plainTextPassword}</p>
              </div>
              
              <p style="font-size: 16px; color: #333; margin-top: 20px;">For your security, we highly recommend that you log in and change your password immediately.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/login" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Log In Now</a>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 14px;">
              <p style="margin: 0;">If you have any questions, please contact your system administrator.</p>
            </div>
          </div>
        `
      })
    });
    
    if (!response.ok) throw new Error("Failed to send welcome email");
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};
