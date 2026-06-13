const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    });
};

// const nodemailer = require("nodemailer");

// // Mailtrap SMTP config
// var transporter = nodemailer.createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 25,
//     auth: {
//         user: "48de5260f5d138",
//         pass: "****2b72"
//     }
// });

// const sendEmail = async (to, subject, html) => {
//     console.log(to);
//     console.log(subject);
//     console.log(html);
//     console.log(transporter)
//     try {
//         let info = await transporter.sendMail({
//             from: '"My App" <no-reply@myapp.com>',
//             to,
//             subject,
//             html
//         });
//         console.log(info);

//         console.log("EMAIL SENT TO:", to);
//         console.log("MESSAGE ID:", info.messageId);

//         return info;

//     } catch (err) {
//         console.error("EMAIL ERROR:", err);
//         throw err;
//     }
// };

module.exports = sendEmail;