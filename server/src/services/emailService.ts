import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Since the user is testing without real credentials, we will default to Ethereal if none provided.
// We will generate an ethereal test account on startup if none exists.
let isEthereal = false;

export async function initEmailService() {
  if (!process.env.SMTP_HOST && !process.env.SMTP_USER) {
    console.log('[AeroNex Email] No SMTP credentials provided. Setting up Ethereal testing account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter.options.host = 'smtp.ethereal.email';
    transporter.options.port = 587;
    transporter.options.auth = {
      user: testAccount.user,
      pass: testAccount.pass,
    };
    isEthereal = true;
    console.log('[AeroNex Email] Ethereal account ready. Emails sent will generate a preview URL.');
  }
}

export async function sendEmailAlert(to: string, subject: string, message: string) {
  try {
    const info = await transporter.sendMail({
      from: '"AeroNex Alerts" <alerts@aeronex.in>',
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0ea5e9;">AeroNex Price Alert</h2>
          <p style="font-size: 16px; color: #334155;">${message}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">You received this because you set a price alert on AeroNex. Book quickly before the price changes!</p>
        </div>
      `,
    });
    console.log(`[AeroNex Email] Alert sent to ${to}: ${info.messageId}`);
    if (isEthereal) {
      console.log(`[AeroNex Email] Ethereal Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (err) {
    console.error('[AeroNex Email] Failed to send email:', err);
  }
}
