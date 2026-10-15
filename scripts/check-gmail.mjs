// Checks Gmail credentials locally before putting them in Netlify (no deploy needed).
// Usage: npm run check-gmail   → asks for the Gmail address and app password, logs in, and sends a short test email to yourself.
// Nothing is saved or sent anywhere except to Gmail.
import readline from 'node:readline/promises';
import nodemailer from 'nodemailer';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const user = (process.env.GMAIL_USER || await rl.question('Gmail address (GMAIL_USER): ')).trim();
const pass = (process.env.GMAIL_APP_PASSWORD || await rl.question('App password, 16 letters (GMAIL_APP_PASSWORD): ')).replace(/\s+/g, '');
rl.close();

if (pass.length !== 16) console.log(`\n⚠️  The app password has ${pass.length} letters; Google app passwords have exactly 16.`);

const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
try {
  await transport.verify();
  await transport.sendMail({ from: `"TommyCare" <${user}>`, to: user, subject: 'TommyCare · בדיקת Gmail', text: 'הפרטים תקינים. אפשר להכניס אותם ל-Netlify.' });
  console.log(`\n✅ Login OK and a test email was sent to ${user}.`);
  console.log('   Put these exact values in Netlify → tommycare → Environment variables:');
  console.log(`   GMAIL_USER = ${user}`);
  console.log('   GMAIL_APP_PASSWORD = the same 16 letters (mark as secret)');
} catch (err) {
  console.log(`\n❌ Gmail rejected the login: ${err.message}`);
  console.log('   • The app password must be created on the SAME Google account as the Gmail address above');
  console.log('     (https://myaccount.google.com/apppasswords), and 2-Step Verification must be on.');
  console.log('   • Use the app password (16 letters), not your normal Gmail password.');
  process.exitCode = 1;
}
