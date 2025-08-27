const express = require('express');
const nodemailer = require('nodemailer');
const multiparty = require('multiparty');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({ origin: ['http://localhost:4000', 'http://127.0.0.1:5500'] })); // Allow specific origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend (adjust path if frontend is outside backend folder)
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // Update path as needed

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

// Handle form submission
app.post('/send', (req, res) => {
    console.log('Received POST /send request', {
        headers: req.headers,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });

    let form = new multiparty.Form();
    let data = {};

    form.parse(req, (err, fields) => {
        if (err) {
            console.error('Form parsing error:', err.message);
            return res.status(500).json({ message: 'Error parsing form', error: err.message });
        }

        console.log('Parsed form fields:', fields);
        Object.keys(fields).forEach((property) => {
            data[property] = fields[property][0]; // Extract first value
        });

        const { name, email, message } = data;

        if (!name || !email || !message) {
            console.log('Missing fields:', data);
            return res.status(400).json({ message: 'Missing required fields', fields: data });
        }

        const mail = {
            from: process.env.EMAIL,
            replyTo: email,
            to: process.env.RECIPIENT_EMAIL,
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        };

        transporter.sendMail(mail, (err, result) => {
            if (err) {
                console.error('Nodemailer error:', {
                    message: err.message,
                    code: err.code,
                    command: err.command,
                    stack: err.stack,
                });
                return res.status(500).json({ message: 'Failed to send email', error: err.message });
            }
            console.log('Email sent successfully:', result);
            res.status(200).json({ message: 'Email sent successfully' });
        });
    });
});

// Catch-all for debugging
app.use((req, res) => {
    console.log(`Unhandled request: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Not found' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Global error:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});