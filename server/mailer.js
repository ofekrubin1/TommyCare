// Sends through a Gmail account using an app password (secrets GMAIL_USER, GMAIL_APP_PASSWORD), over SMTP with
// Cloudflare's TCP sockets (worker-mailer). Only works inside the Cloudflare runtime (also `wrangler dev`).
import { WorkerMailer } from 'worker-mailer';

export async function sendMail(env, { to, subject, html, text }) {
  const user = env.GMAIL_USER;
  const pass = (env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!user || !pass) throw new Error('Email is not configured: set the GMAIL_USER and GMAIL_APP_PASSWORD secrets.');
  let mailer;
  try {
    mailer = await WorkerMailer.connect({ host: 'smtp.gmail.com', port: 465, secure: true, credentials: { username: user, password: pass }, authType: 'plain' });
    await mailer.send({ from: { name: 'TommyCare', email: user }, to: to.split(',').map((s) => s.trim()).filter(Boolean), subject, html, text });
  } catch (err) {
    if (/535|auth/i.test(err.message)) throw new Error('Gmail דחה את פרטי ההתחברות: GMAIL_USER או GMAIL_APP_PASSWORD לא נכונים.');
    throw err;
  } finally {
    await mailer?.close().catch(() => {});
  }
}
