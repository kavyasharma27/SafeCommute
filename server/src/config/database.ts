import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_KEY || 'placeholder-key'
);

// Initialize Resend email service
export const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-key');

// Email notification function
export async function sendNotificationEmail(
  toEmail: string,
  subject: string,
  message: string,
  location?: { latitude: number; longitude: number }
) {
  // Skip if no API key configured
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder-key') {
    console.log('📧 Email skipped (Resend not configured):', subject);
    return false;
  }

  try {
    const locationHtml = location
      ? `
        <p><strong>Location:</strong></p>
        <p>
          <a href="https://maps.google.com?q=${location.latitude},${location.longitude}" target="_blank">
            📍 View on Google Maps
          </a>
        </p>
      `
      : '';

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'SafeCommute <noreply@resend.dev>',
      to: toEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 5px 5px; }
            .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; }
            .button { display: inline-block; background: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🚨 SafeCommute Alert</h2>
            </div>
            <div class="content">
              <div class="alert">
                ${message}
              </div>
              ${locationHtml}
              <p style="margin-top: 20px;">
                <a href="http://localhost:3000" class="button">Open SafeCommute App</a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated notification from SafeCommute.</p>
              <p>Stay safe! 💜</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Email error:', error);
      return false;
    }

    console.log('✅ Email sent to:', toEmail);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

// Database helper: Insert with retry
export async function insertWithRetry(table: string, data: any, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const { data: result, error } = await supabase.from(table).insert(data).select().single();
    
    if (!error) return result;
    
    if (i === retries - 1) {
      console.error(`Failed to insert into ${table}:`, error);
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
  }
}

// Database helper: Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return (
    process.env.SUPABASE_URL !== undefined &&
    process.env.SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.SUPABASE_KEY !== undefined &&
    process.env.SUPABASE_KEY !== 'placeholder-key'
  );
}

console.log('🔧 Database config loaded');
console.log('📧 Supabase configured:', isSupabaseConfigured() ? 'YES ✅' : 'NO (using fallback) ⚠️');
console.log('📧 Resend configured:', process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder-key' ? 'YES ✅' : 'NO (emails disabled) ⚠️');
