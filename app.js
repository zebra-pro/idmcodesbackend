const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const nodemailer = require('nodemailer') // Import nodemailer
const dotenv = require('dotenv').config()

const app = express()
const port = 3000

app.use(cors())

// Configure Multer for file uploads (save to disk)
const storage = multer.memoryStorage()

const upload = multer({ storage: storage })

// Middleware to parse JSON bodies
app.use(bodyParser.json())

// Setup Nodemailer transporter once when the server starts
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' or other email service like 'hotmail' or 'yahoo'
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
})

// Route to test server is running
app.get('/', (req, res) => {
  res.send('Server is running!')
})

// POST route to accept data and save the file
app.post('/submit', upload.single('file'), (req, res) => {
  const { name, email, phone, subject, message } = req.body
  const file = req.file
  console.log(req.body)

  // Validate received data
  if (!name || !email || !phone || !subject || !message) {
    return res
      .status(400)
      .json({ error: 'All fields are required except file.' })
  }

  // Log or handle other data (e.g., save to database)
  console.log('Data received:', { name, email, phone, subject, message })

  // Prepare email data
  let mailOptions = {
    from: 'firstacc30@gmail.com', // Sender address
    to: 'chaitanyasiva30@gmail.com', // Receiver email address
    subject: `New Submission: ${subject}`, // Email subject
    text: `You have received a new message from ${name}.\n\nMessage:\n${message}\n\nPhone: ${phone}`, // Email text content
  }

  // If a file is uploaded, attach it to the email
  if (file) {
    mailOptions.attachments = [
      {
        filename: file.originalname,
        path: file.path, // Path of the uploaded file
      },
    ]
  }

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error occurred while sending email:', error)
      return res.status(500).json({ error: 'Error sending email.' })
    }
    console.log('Email sent:', info.response)
    // Send success response to client
    res
      .status(200)
      .json({ message: 'Data received and email sent successfully!' })
  })
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
