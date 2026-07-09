import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  logger.info('SMTP transporter configured successfully');
} else {
  logger.info('SMTP credentials missing. Email service will run in MOCK mode (printing codes to console).');
}

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: 'CivicSafe - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2563eb; margin: 0; font-size: 24px;">CivicSafe Verification</h2>
          <p style="color: #6b7280; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Secure & Clean Incident Tracker</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6;">
          <p style="font-size: 16px; color: #1f2937; margin-top: 0;">Hello,</p>
          <p style="font-size: 15px; color: #4b5563; line-height: 22px;">Thank you for registering with CivicSafe. To verify your email address, please use the 6-digit One-Time Password (OTP) code below:</p>
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 6px; padding: 12px 30px; background-color: #eff6ff; border: 1.5px dashed #3b82f6; border-radius: 8px;">
              ${otp}
            </div>
          </div>
          <p style="font-size: 13px; color: #9ca3af; margin-bottom: 0;">This OTP code is valid for 5 minutes and can only be used once.</p>
        </div>
      </div>
    `,
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Verification OTP sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send verification email via SMTP', { error });
      throw new Error('Could not send verification email. Please try again later.');
    }
  } else {
    logger.info(`
============================================
[MOCK EMAIL SENT]
To: ${email}
Subject: CivicSafe - Email Verification OTP
OTP Code: ${otp}
============================================
    `);
  }
};
