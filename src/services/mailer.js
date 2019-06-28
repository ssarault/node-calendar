let mailer = require('nodemailer');

let transporter = mailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: '',
        pass: ''
    }
});


module.exports = {
    sendMail(to, subject, message) {
        let mailOptions = {
            to: to,
            subject: subject,
            text: message
        };

        transporter.sendMail(mailOptions, (err, info) => {
            console.log('Email sent');  
        });

    }
}