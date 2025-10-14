const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});


const sendMail = async (to, subject, html) => {
    try {
       let info =  await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
       });
       return info;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

module.exports = sendMail;