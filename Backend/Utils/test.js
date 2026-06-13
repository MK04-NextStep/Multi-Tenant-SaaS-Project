const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "770a98ddd125b5",
    pass: "****3c23"
  }
});

(async () => {
  try {
    await transporter.verify();
    console.log("SMTP connection works");
  } catch (err) {
    console.error(err);
  }
})();