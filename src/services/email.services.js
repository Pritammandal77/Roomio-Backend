import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (to, otp) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Verify your email - Roomio",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Roomio Verification</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; -webkit-font-smoothing: antialiased;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    
                    <!-- Top Accent Border -->
                    <tr>
                      <td style="background-color: #4f46e5; height: 6px;"></td>
                    </tr>

                    <!-- Main Body Content -->
                    <tr>
                      <td style="padding: 40px 32px; text-align: center;">
                        
                        <!-- Header/Brand -->
                        <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 8px 0; letter-spacing: -0.5px;">
                          Roomio
                        </h1>
                        <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin: 0 0 32px 0;">
                          Verify your email address to complete your account setup.
                        </p>

                        <!-- OTP Display Box -->
                        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px 24px; margin: 0 auto 32px auto; display: inline-block;">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #4f46e5; letter-spacing: 6px; padding-left: 6px;">${otp}</span>
                        </div>

                        <!-- Info/Security Disclaimers -->
                        <p style="font-size: 13px; line-height: 20px; color: #6b7280; margin: 0 0 24px 0;">
                          This code will expire in <strong style="color: #111827;">5 minutes</strong>.<br>
                          If you did not request this code, you can safely ignore this email.
                        </p>

                        <!-- Decorative Divider Line -->
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px 0;" />

                        <!-- Footer -->
                        <p style="font-size: 12px; line-height: 18px; color: #9ca3af; margin: 0;">
                          Build with discipline. Find your perfect roommate.<br>
                          &copy; ${new Date().getFullYear()} Roomio. All rights reserved.
                        </p>

                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });
  } catch (err) {
    console.error("Email error:", err);
    throw new Error("Email sending failed");
  }
};
