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

    return await response.json();
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
