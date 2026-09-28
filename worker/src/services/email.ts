export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendPasswordResetEmail(
  apiKey: string,
  toEmail: string,
  code: string,
  fromEmail?: string
): Promise<SendEmailResult> {
  const sender = fromEmail || "Muninn <onboarding@resend.dev>";
  const subject = `Muninn: ${code} is your verification code`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #0d121f; border: 1px solid #1e293b; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: rgba(249, 115, 22, 0.12); border: 1px solid rgba(249, 115, 22, 0.35); color: #f97316; font-size: 20px; font-weight: bold; text-align: center;">
                ᚦ
              </div>
              <h1 style="margin: 16px 0 6px; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">Muninn Living Memory</h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Password Recovery Verification</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0; border-top: 1px solid #1e293b; border-bottom: 1px solid #1e293b;">
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                We received a request to reset the password for your Muninn account associated with <strong style="color: #ffffff;">${toEmail}</strong>.
              </p>
              <p style="margin: 0 0 12px; font-size: 13px; color: #94a3b8;">
                Use the single-use 6-digit code below to complete your password reset:
              </p>
              <div style="margin: 20px 0; padding: 18px 12px; background-color: #111827; border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 12px; text-align: center;">
                <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #f59e0b; display: inline-block;">
                  ${code}
                </span>
              </div>
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                This code will expire in <strong>15 minutes</strong>. If you did not initiate this request, no action is required and your account remains safe.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0; font-size: 11px; color: #475569; line-height: 1.5;">
                Muninn Living Memory &middot; Edge Runtime Verification
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `Muninn Password Reset\n\nYour 6-digit verification code is: ${code}\n\nThis code expires in 15 minutes. If you did not request this, please ignore this email.\n\nMuninn Living Memory`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [toEmail],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Resend Error] Status ${res.status}: ${errText}`);
      return { success: false, error: errText };
    }

    const data = (await res.json()) as { id?: string };
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error(`[Resend Exception]`, err);
    return { success: false, error: err?.message || "Failed to send verification email" };
  }
}
