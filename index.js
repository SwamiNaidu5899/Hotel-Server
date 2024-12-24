const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const blogRoutes = require('./routes/blogRoutes');
const roomRoutes = require('./routes/roomRoutes');
const authRoutes = require('./routes/authRoutes')
const bookingRoutes = require('./routes/bookingRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection with retry logic
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
  }
}
connectDB();

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  host: 'ds.cloudxwebs.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api', bookingRoutes);

// Contact Form - Send Email
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('Please fill out all fields');
  }

  const htmlMessage = `
    <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 8px; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          You have received a new message from <strong style="color: #333;">${name}</strong> (${email}).
        </p>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #4CAF50;">
          <h4 style="font-size: 18px; color: #333; font-weight: bold; margin-bottom: 12px;">Message:</h4>
          <p style="font-size: 16px; color: #444; line-height: 1.6;">${message}</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;" />
        <p style="font-size: 14px; color: #777; text-align: center;">
          This is an automated message from your website. If you did not request this, please ignore it.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${email}" style="display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; font-size: 16px; padding: 12px 30px; border-radius: 4px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            Reply to ${name}
          </a>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: email,
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact Form Submission: ${name}`,
    html: htmlMessage,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).send('Error sending email');
  }
});


app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT =  8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
