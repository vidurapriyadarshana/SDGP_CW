import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const mailConfig = {
  provider: process.env.EMAIL_PROVIDER || 'mock',
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: process.env.SMTP_FROM || '"Quiz Web App" <noreply@quizapp.com>',
};

export const isMailConfigured = 
  mailConfig.provider.toLowerCase() === 'nodemailer' &&
  !!(
    mailConfig.host &&
    mailConfig.auth.user &&
    mailConfig.auth.pass
  );

export const mailTransporter = isMailConfigured
  ? nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: mailConfig.auth,
    })
  : null;
