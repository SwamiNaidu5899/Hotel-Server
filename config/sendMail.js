const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a transporter using Gmail's SMTP server
const transporter = nodemailer.createTransport({
    service: 'gmail', // Gmail's service
    auth: {
        user: process.env.Email_Main,  // The email address (loaded from environment variable)
        pass: process.env.Email_Pwd,   // The password or app password (loaded from environment variable)
    },
});

// Function to send an email
const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: process.env.Email_Main,  // Sender's email address
        to: to,                        // Recipient's email address
        subject: subject,              // Email subject
        html: htmlContent,             // Email body in HTML format
    };

    try {
        // Send the email using the transporter
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        // Catch any errors and display a message
        console.error("Error sending email:", error.message);
        throw new Error("Failed to send email");
    }
};

// Export the sendEmail function
module.exports = { sendEmail };
