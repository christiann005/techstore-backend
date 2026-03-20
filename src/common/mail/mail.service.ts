import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationCode(email: string, code: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verification Code - TECHSTORE',
        html: `
          <div style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; border-radius: 20px;">
            <h1 style="color: #3b82f6;">TECHSTORE Verification</h1>
            <p>Your verification code is:</p>
            <div style="background-color: #1e293b; padding: 20px; text-align: center; border-radius: 10px; font-size: 32px; font-weight: 900; letter-spacing: 10px; color: #fff; border: 1px solid #334155;">
              ${code}
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 20px;">This code is valid for 5 minutes.</p>
          </div>
        `,
      });
    } catch (err: any) {
      // Surface a clearer error for authentication issues with the SMTP provider
      if (err && err.code === 'EAUTH') {
        throw new Error('Email authentication failed. Check MAIL_USER and MAIL_PASS (use an app password or proper SMTP credentials)');
      }
      throw err;
    }
  }

  async sendResetPassword(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset - TECHSTORE',
      html: `
        <div style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; border-radius: 20px;">
          <h1 style="color: #3b82f6;">Password Reset</h1>
          <p>Use this code to reset your password:</p>
          <div style="background-color: #1e293b; padding: 20px; text-align: center; border-radius: 10px; font-size: 32px; font-weight: 900; letter-spacing: 10px; color: #fff; border: 1px solid #334155;">
            ${code}
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">This code is valid for 5 minutes.</p>
        </div>
      `,
    });
  }
}
