import Mailjet from "node-mailjet";
import {
  MAILJET_API_KEY,
  MAILJET_API_SECRET,
  NEXT_PUBLIC_BASE_URL,
} from "@/lib/env";
import { APP_CONFIG } from "@/lib/constants";

const mailjet = new Mailjet({
  apiKey: MAILJET_API_KEY,
  apiSecret: MAILJET_API_SECRET,
});

export async function sendLoginEmail({
  email,
  otp,
  token,
}: {
  email: string;
  otp: string;
  token: string;
}) {
  const magicLink = `${
    NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }/auth/magic-link?token=${token}`;

  const textContent = `Hello!

Your login verification code is: ${otp}

This code will expire in 10 minutes.

Alternatively, you can click this magic link to log in instantly:
${magicLink}

This magic link will expire in 15 minutes.

If you didn't request this login, please ignore this email.

Best regards,
The ${APP_CONFIG.name} Team`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin-bottom: 10px;">Welcome to ${APP_CONFIG.name}.</h1>
        <p style="color: #666; font-size: 16px;">Complete your login with one of the options below</p>
      </div>
      
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0; font-size: 18px;">Option 1: Use Verification Code</h2>
        <p style="color: #666; margin-bottom: 15px;">Enter this 6-digit code on the login page:</p>
        <div style="background-color: white; border: 2px solid #e9ecef; border-radius: 6px; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #333;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 14px; margin-top: 10px; margin-bottom: 0;">⏰ Expires in 10 minutes</p>
      </div>
      
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h2 style="color: #333; margin-top: 0; font-size: 18px;">Option 2: One-Click Login</h2>
        <p style="color: #666; margin-bottom: 15px;">Click the button below to log in instantly:</p>
        <div style="text-align: center;">
          <a href="${magicLink}" style="display: inline-block; background-color: #007bff; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px;">
            🔗 Log in with Magic Link
          </a>
        </div>
        <p style="color: #888; font-size: 14px; margin-top: 10px; margin-bottom: 0;">⏰ Expires in 15 minutes</p>
      </div>
      
      <div style="border-top: 1px solid #e9ecef; padding-top: 20px; color: #666; font-size: 14px; text-align: center;">
        <p>If you didn't request this login, please ignore this email.</p>
        <p style="margin-bottom: 0;">Best regards,<br><strong>The ${APP_CONFIG.name} Team</strong></p>
      </div>
    </div>
  `;

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "aravindsivan51@gmail.com",
          Name: "Aravind Ivan",
        },
        To: [
          {
            Email: email,
            Name: "",
          },
        ],
        Subject: `🔐 Your Login Code and Magic Link - ${APP_CONFIG.name}`,
        TextPart: textContent,
        HTMLPart: htmlContent,
      },
    ],
  });

  return request;
}
