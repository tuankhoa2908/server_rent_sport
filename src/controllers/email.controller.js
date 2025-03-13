const nodemailer = require("nodemailer");
const asyncHandler = require('express-async-handler');

module.exports = {
    sendEmail: asyncHandler(async (data, req, res) => {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                user: process.env.MAIL_ID,
                pass: process.env.PASSWORD_MAIL,
            },
        });

        const info = await transporter.sendMail({
            from: '"Hey 👻" <foo@gmail.com>', // sender address
            to: data.to, // list of receivers
            subject: data.subject, // Subject line
            text: data.text, // plain text body
            html: data.html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    }
    )
}