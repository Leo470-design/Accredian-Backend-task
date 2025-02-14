const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// POST: Save Referral Data & Send Email
app.post('/api/referrals', async (req, res) => {
  try {
    const { referrerName, referrerEmail, refereeName, refereeEmail, course } = req.body;

    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail || !course) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const referral = await prisma.referral.create({
      data: { referrerName, referrerEmail, refereeName, refereeEmail, course },
    });

    // Send Email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: refereeEmail,
      subject: 'You have been referred to a course!',
      text: `Hello ${refereeName},\n\n${referrerName} has referred you to the "${course}" course.\n\nCheck it out!`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Referral submitted successfully!', referral });
  } catch (error) {
    res.status(500).json({ error: 'Error processing request', details: error.message });
  }
});

// GET: Fetch All Referrals
app.get('/api/referrals', async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany();
    res.status(200).json(referrals);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching referrals' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
