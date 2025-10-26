const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store OTPs temporarily (in production, use a database or Redis)
const otpStorage = {};

// Generate OTP function
function generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'  // Use App Password from Google
    }
});

// Send OTP email function
async function sendOTPEmail(recipientEmail, otp) {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: recipientEmail,
        subject: 'Your Login OTP',
        html: `
            <h2>Login Verification</h2>
            <p>Your OTP is: <strong style="font-size: 24px;">${otp}</strong></p>
            <p>Valid for 5 minutes.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}

// Login route - sends OTP
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Verify user credentials here (check database)
    // For demo purposes, assuming credentials are valid

    // Generate OTP
    const otp = generateOTP(6);
    
    // Store OTP with expiration time (5 minutes)
    otpStorage[email] = {
        otp: otp,
        expiresAt: Date.now() + 5 * 60 * 1000  // 5 minutes
    };

    // Send OTP to user's email
    const emailSent = await sendOTPEmail(email, otp);

    if (emailSent) {
        res.json({ 
            success: true, 
            message: 'OTP sent to your email' 
        });
    } else {
        res.json({ 
            success: false, 
            message: 'Failed to send OTP' 
        });
    }
});

// Verify OTP route
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    const storedData = otpStorage[email];

    if (!storedData) {
        return res.json({ 
            success: false, 
            message: 'No OTP found for this email' 
        });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
        delete otpStorage[email];
        return res.json({ 
            success: false, 
            message: 'OTP expired' 
        });
    }

    // Verify OTP
    if (storedData.otp === otp) {
        delete otpStorage[email];  // Clear OTP after successful verification
        return res.json({ 
            success: true, 
            message: 'OTP verified successfully' 
        });
    } else {
        return res.json({ 
            success: false, 
            message: 'Invalid OTP' 
        });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
