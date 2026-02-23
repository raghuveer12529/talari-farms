import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        // Skip sending if SMTP credentials are not configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.warn('⚠️  Email not sent: SMTP credentials not configured');
            console.log('📧 Would have sent email to:', options.to);
            console.log('📧 Subject:', options.subject);
            return false;
        }

        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Talari Farms" <noreply@talarifarms.com>',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });

        console.log('✅ Email sent successfully to:', options.to);
        return true;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        return false;
    }
}
