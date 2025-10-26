// Import necessary modules
const express = require('express');
const cors = require('cors');

// Create an Express application
const app = express();
const PORT = 3000; // The port your backend server will listen on

// === Middleware ===
// Enable CORS for all routes (allows requests from your frontend)
app.use(cors());
// Enable Express to parse JSON data in request bodies
app.use(express.json());
// Enable Express to parse URL-encoded data (like form submissions)
app.use(express.urlencoded({ extended: true }));

// === API Endpoint for Contact Form ===
// This is the URL your frontend will send data to
app.post('/api/contact', (req, res) => {
    console.log('Contact form data received:');
    console.log(req.body); // The data sent from the frontend will be in req.body

    // Extract data from the request body
    const { name, email, phone, message } = req.body;

    // --- SERVER-SIDE VALIDATION (VERY IMPORTANT!) ---
    // Always validate data on the server, even if you validate on the frontend.
    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Full Name is required.' });
    }
    if (!email || email.trim() === '' || !email.includes('@')) { // Basic email check
        return res.status(400).json({ success: false, message: 'A valid Email Address is required.' });
    }
    if (!message || message.trim() === '') {
        return res.status(400).json({ success: false, message: 'Message is required.' });
    }
    // You can add more complex validation here (e.g., phone number format, message length)

    // --- DATA PROCESSING (What to do with the data) ---
    // For now, we're just logging it and sending a success response.
    // In a real application, you would:
    // 1. Save to a database (e.g., MongoDB, PostgreSQL)
    // 2. Send an email notification (e.g., using Nodemailer)
    // 3. Integrate with a CRM, etc.
    console.log(`Processing submission from ${name} (${email}). Message: ${message}`);


    // --- SEND RESPONSE BACK TO FRONTEND ---
    // If everything is okay after validation and processing:
    res.status(200).json({ success: true, message: 'Message received successfully! We will get back to you soon.' });
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});