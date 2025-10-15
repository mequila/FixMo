# 🚨 Railway OTP Endpoint 500 Error - Fix Guide

## Problem
The `/auth/send-otp` endpoint returns a **500 Internal Server Error** on Railway but works locally.

## Root Cause
The backend server on Railway is **missing email service environment variables** needed to send OTP emails. When the OTP endpoint tries to send an email, it fails because the email configuration is not set up.

---

## ✅ Solution: Configure Email Service on Railway

### Option 1: Gmail SMTP (Recommended for Testing)

1. **Go to Railway Dashboard**
   - Open your project: `fixmo-backend-production`
   - Click on your backend service
   - Go to **Variables** tab

2. **Add these environment variables:**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@fixmo.com
```

3. **Get Gmail App Password:**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification (if not already enabled)
   - Go to: https://myaccount.google.com/apppasswords
   - Generate an "App Password" for "Mail"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
   - Use this as `EMAIL_PASSWORD` (without spaces: `abcdefghijklmnop`)

4. **Save and Redeploy**
   - Click "Save Changes" or "Add Variable"
   - Railway will automatically redeploy your backend

---

### Option 2: SendGrid (Recommended for Production)

1. **Create SendGrid Account**
   - Go to: https://sendgrid.com/
   - Sign up for free account (100 emails/day free tier)
   - Verify your account

2. **Get API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Give it full access permissions
   - Copy the API key (starts with `SG.`)

3. **Add to Railway Variables:**

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-sendgrid-api-key-here
EMAIL_FROM=noreply@fixmo.com
```

4. **Verify Sender Email (Important!)**
   - Go to SendGrid → Settings → Sender Authentication
   - Add and verify `noreply@fixmo.com` (or your domain email)
   - Or use Single Sender Verification for testing

---

### Option 3: Mailgun

1. **Create Mailgun Account**
   - Go to: https://www.mailgun.com/
   - Sign up (free tier: 5,000 emails/month for 3 months)

2. **Get SMTP Credentials**
   - Go to Sending → Domain Settings → SMTP credentials
   - Note the username and password

3. **Add to Railway Variables:**

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
EMAIL_FROM=noreply@fixmo.com
```

---

## 🔍 How to Verify It's Working

### 1. Check Railway Logs

After adding variables and redeploying:

```bash
# In Railway dashboard, go to Deployments tab
# Click on latest deployment
# Check logs for:
✅ "Email service initialized successfully"
✅ "OTP sent to email: test@example.com"

# Or errors like:
❌ "Email service not configured"
❌ "SMTP connection failed"
```

### 2. Test the Endpoint

Use this curl command (replace with your email):

```bash
curl -X POST https://fixmo-backend-production.up.railway.app/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

**Expected Response (Success):**
```json
{
  "message": "OTP sent to email successfully"
}
```

**Current Response (Before Fix):**
```json
{
  "error": "Internal server error",
  "message": "Email service not configured"
}
```

### 3. Test from Mobile App

1. Open your app
2. Go to registration/login screen
3. Enter your email
4. Click "Next" or "Send OTP"
5. **Check your email inbox** (and spam folder!)
6. You should receive an email with a 6-digit OTP code

---

## 🐛 Troubleshooting

### Still Getting 500 Error After Adding Variables?

**1. Check if Variables are Actually Set:**
```bash
# In Railway logs, look for:
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
```

**2. Ensure Redeploy Happened:**
- Railway should auto-redeploy after adding variables
- If not, manually trigger a redeploy
- Check deployment status is "Success"

**3. Check Email Credentials:**
```bash
# Test locally first with same credentials
# In your backend project:
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.verify((err, success) => {
  console.log(err ? 'Failed: ' + err : 'Email config works!');
});
"
```

---

### Gmail "Less Secure App" Error?

**Solution:** Use App Passwords (not your regular Gmail password)
- Regular Gmail password won't work with SMTP
- You MUST use an App Password (see steps above)
- Make sure 2-Step Verification is enabled first

---

### SendGrid "Sender Not Verified" Error?

**Solution:** Verify your sender email
- Go to SendGrid → Settings → Sender Authentication
- Verify the email you're using in `EMAIL_FROM`
- For testing, use Single Sender Verification
- For production, authenticate your domain

---

### Emails Going to Spam?

**Solutions:**
1. **Add SPF/DKIM Records** (for production)
   - If using your own domain for `EMAIL_FROM`
   - Configure DNS records as per your email service docs

2. **Use Verified Domains**
   - SendGrid and Mailgun require sender verification
   - Follow their domain authentication steps

3. **Test with Different Email Providers**
   - Try Gmail, Yahoo, Outlook
   - Some spam filters are stricter than others

---

## 📋 Quick Checklist

- [ ] Added email environment variables to Railway
- [ ] Used correct SMTP credentials (App Password for Gmail)
- [ ] Railway service redeployed successfully
- [ ] Checked Railway deployment logs for errors
- [ ] Tested `/auth/send-otp` endpoint with curl
- [ ] Received OTP email in inbox
- [ ] OTP code is 6 digits
- [ ] OTP expires in 5-10 minutes
- [ ] Mobile app can successfully trigger OTP

---

## 🎯 Expected Behavior After Fix

1. **User enters email in app**
2. **App calls** `POST /auth/send-otp`
3. **Backend:**
   - Generates random 6-digit OTP
   - Saves to database with 5-minute expiry
   - Sends email via configured SMTP service
4. **User receives email** with OTP code
5. **User enters OTP** in app
6. **App calls** `POST /auth/verify-otp`
7. **Backend verifies OTP** and allows registration

---

## 📞 Need More Help?

If you're still seeing 500 errors after following this guide:

1. **Check Railway Logs:**
   ```
   Railway Dashboard → Your Service → Deployments → Latest → Logs
   ```
   Look for error messages related to email/SMTP

2. **Check Backend Code:**
   Ensure your backend has proper error handling for email service
   ```javascript
   // In your backend send-otp route
   try {
     await emailService.sendOTP(email, otp);
     res.json({ message: "OTP sent successfully" });
   } catch (error) {
     console.error('Email send error:', error);
     res.status(500).json({ 
       error: "Failed to send OTP", 
       details: error.message 
     });
   }
   ```

3. **Test Locally First:**
   - Add email variables to your local `.env`
   - Test OTP endpoint locally
   - Once working locally, deploy to Railway

---

## 🔧 Backend Code Example (For Reference)

Your backend should have something like this:

```javascript
// Email service configuration
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send OTP endpoint
app.post('/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to database
    await prisma.oTPVerification.upsert({
      where: { email },
      update: { 
        otp, 
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
        verified: false 
      },
      create: { 
        email, 
        otp, 
        expires_at: new Date(Date.now() + 5 * 60 * 1000) 
      },
    });
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your FixMo OTP Code',
      html: `
        <h2>Your OTP Code</h2>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
      `,
    });
    
    res.json({ message: 'OTP sent to email successfully' });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ 
      error: 'Failed to send OTP',
      message: error.message 
    });
  }
});
```

---

## 🚀 Next Steps After Fix

Once OTP is working:

1. **Test full registration flow:**
   - Request OTP
   - Receive email
   - Verify OTP
   - Complete registration

2. **Monitor email delivery:**
   - Check Railway logs for email send success
   - Monitor email service quotas
   - Set up alerts for failed emails

3. **Production considerations:**
   - Use production email service (SendGrid/Mailgun)
   - Set up domain authentication
   - Configure email templates
   - Add rate limiting for OTP requests

---

**Last Updated:** October 4, 2025
