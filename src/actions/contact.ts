'use server';

import { Resend } from 'resend';

export type ContactFormState = {
    status: 'idle' | 'success' | 'error';
    error?: string;
};

const REQUIREMENT_OPTIONS = [
    'Gac Fruit (Fresh / Whole)',
    'Gac Fruit Juice (Cold-Pressed)',
    'Gac Fruit Powder',
    'Multiple / Mixed Products',
] as const;

export type RequirementOption = typeof REQUIREMENT_OPTIONS[number];

export async function submitContactForm(
    _: ContactFormState,
    formData: FormData
): Promise<ContactFormState> {
    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const company = (formData.get('company') as string)?.trim();
    const requirement = (formData.get('requirement') as string)?.trim();
    const quantity = (formData.get('quantity') as string)?.trim();
    const message = (formData.get('message') as string)?.trim();

    if (!name || name.length < 2) {
        return { status: 'error', error: 'Please enter your full name.' };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { status: 'error', error: 'Please enter a valid email address.' };
    }
    if (!requirement || !REQUIREMENT_OPTIONS.includes(requirement as RequirementOption)) {
        return { status: 'error', error: 'Please select a product requirement.' };
    }
    if (!quantity || quantity.length < 2) {
        return { status: 'error', error: 'Please specify your required quantity.' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        await resend.emails.send({
            from: 'Talari Farms <noreply@talarifarms.co.in>',
            to: 'raghu.veer12529@gmail.com',
            subject: `New Inquiry from ${name} — ${requirement}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h2 style="color: #2d6a2d; margin-bottom: 4px;">New Inquiry — Talari Farms</h2>
                    <p style="color: #6b7280; margin-top: 0; margin-bottom: 24px; font-size: 14px;">Received via talarifarms.com contact form</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; width: 140px; font-weight: 600; color: #374151;">Name</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Email</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;"><a href="mailto:${email}" style="color: #2d6a2d;">${email}</a></td>
                        </tr>
                        ${company ? `
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Company</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${company}</td>
                        </tr>` : ''}
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Requirement</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${requirement}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Quantity</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${quantity}</td>
                        </tr>
                        ${message ? `
                        <tr>
                            <td style="padding: 10px 0; font-weight: 600; color: #374151; vertical-align: top;">Message</td>
                            <td style="padding: 10px 0; color: #111827;">${message.replace(/\n/g, '<br/>')}</td>
                        </tr>` : ''}
                    </table>
                    <div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px; font-size: 14px; color: #374151;">
                        Reply directly to this email to respond to ${name}.
                    </div>
                </div>
            `,
            replyTo: email,
        });
    } catch (err) {
        console.error('Failed to send email:', err);
        return { status: 'error', error: 'Failed to send your inquiry. Please try again or contact us directly.' };
    }

    return { status: 'success' };
}
