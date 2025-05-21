const nodemailer = require('nodemailer');

// Gmail yoki o'zingizning SMTP konfiguratsiyasini kiriting
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // yoki sizning hostingiz
  port: 587,
  secure: false, // true -> 465
  auth: {
    user: 'YourEmail@gmail.com', // sizning pochtangiz
    pass: 'YouraAssword'     // Gmail App password yoki SMTP password
  }
});

/**
 * Email yuborish
 * @param {string} to - qabul qiluvchi
 * @param {string} subject - sarlavha
 * @param {string} html - HTML kontent
 */
exports.sendMail = (to, subject, html) => {
  const mailOptions = {
    from: '"MultiMax Server" <YourEmail@gmail.com>',
    to,
    subject,
    html
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Email error:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};