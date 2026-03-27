import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import twilio from 'twilio';
import { supabase } from '@/lib/supabase';

// Helper to check if a key is a real key or a placeholder
const isRealKey = (key: string | undefined) => key && key.trim() !== '' && !key.includes('YOUR_');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fullName, email, phone, doctor, date, notes } = body;

        // 1. Save to Supabase
        const { error: dbError } = await supabase.from('appointments').insert([
            {
                full_name: fullName,
                email,
                phone,
                doctor_name: doctor,
                preferred_date: date,
                notes
            }
        ]);

        if (dbError) throw dbError;

        // 2. Send Email (Only if key is set)
        if (isRealKey(process.env.RESEND_API_KEY)) {
            const resend = new Resend(process.env.RESEND_API_KEY!);
            await resend.emails.send({
                from: 'HealthConnect <onboarding@resend.dev>', // resend.dev is the default test domain
                to: [email],
                subject: 'Your Appointment is Confirmed!',
                html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background-color:#0f172a;">
  <div style="background-color:#1e293b;border-radius:16px;padding:40px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.5);text-align:center;border:1px solid #334155;">
    <h1 style="color:#a78bfa;margin-bottom:8px;font-size:28px;font-weight:800;letter-spacing:-0.5px;">HealthConnect</h1>
    <h2 style="color:#f8fafc;margin-bottom:24px;font-size:20px;font-weight:600;">Appointment Confirmed!</h2>
    <hr style="border:none;border-top:1px solid #334155;margin:24px 0;" />
    
    <p style="color:#cbd5e1;font-size:16px;line-height:1.6;text-align:left;">
      Hi <strong style="color:#f8fafc;">${fullName}</strong>,
    </p>
    <p style="color:#cbd5e1;font-size:16px;line-height:1.6;text-align:left;">
      Your appointment details have been successfully received and confirmed. We look forward to seeing you!
    </p>
    
    <div style="background-color:#0f172a;border-radius:8px;padding:24px;margin:32px 0;text-align:left;border:1px solid #334155;">
      <p style="margin:0 0 12px 0;color:#f8fafc;font-size:15px;">
        <span style="color:#94a3b8;display:inline-block;width:100px;">Doctor:</span>
        <strong>${doctor}</strong>
      </p>
      <p style="margin:0 0 12px 0;color:#f8fafc;font-size:15px;">
        <span style="color:#94a3b8;display:inline-block;width:100px;">Date:</span>
        <strong>${date}</strong>
      </p>
      <p style="margin:0 0 12px 0;color:#f8fafc;font-size:15px;">
        <span style="color:#94a3b8;display:inline-block;width:100px;">Patient:</span>
        <strong>${fullName}</strong>
      </p>
      <p style="margin:0;color:#f8fafc;font-size:15px;">
        <span style="color:#94a3b8;display:inline-block;width:100px;">Phone:</span>
        <strong>${phone}</strong>
      </p>
    </div>
    
    <p style="color:#94a3b8;font-size:14px;line-height:1.5;">
      If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.
    </p>
    
    <div style="margin-top:40px;">
      <a href="http://localhost:3000" style="background-color:#8b5cf6;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;box-shadow:0 4px 6px -1px rgba(139, 92, 246, 0.4);">Return to Dashboard</a>
    </div>
  </div>
  
  <p style="color:#64748b;font-size:12px;text-align:center;margin-top:24px;">
    &copy; ${new Date().getFullYear()} HealthConnect. All rights reserved.
  </p>
</div>`
            }).catch(err => console.error("Resend Error:", err));
        } else {
            console.log("Skipping Email: Missing real RESEND_API_KEY");
        }

        // 3. Send SMS (Only if keys are set)
        if (isRealKey(process.env.TWILIO_ACCOUNT_SID) && isRealKey(process.env.TWILIO_AUTH_TOKEN) && isRealKey(process.env.TWILIO_PHONE_NUMBER)) {
            const smsClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
            await smsClient.messages.create({
                body: `Hi ${fullName}, your HealthConnect appointment with ${doctor} on ${date} is confirmed!`,
                from: process.env.TWILIO_PHONE_NUMBER!,
                to: phone
            }).catch(err => console.error("Twilio Error:", err));
        } else {
            console.log("Skipping SMS: Missing real TWILIO keys");
        }

        return NextResponse.json({ success: true, message: "Appointment booked and notifications handled." });

    } catch (err: any) {
        console.error("Booking API Error:", err);
        return NextResponse.json({ success: false, error: err.message || "Failed to book appointment" }, { status: 500 });
    }
}
