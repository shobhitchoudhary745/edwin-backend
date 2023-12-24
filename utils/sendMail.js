const nodemailer = require("nodemailer");

const sendMail = async (response, mail, name, docLink) => {
  try {
    let transporter = await nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "katelin.lang94@ethereal.email",
        pass: "BGCmxcgN1J7MX7m84X",
      },
    });

    const mailOptions = {
      from: "<katelin.lang94@ethereal.email>",
      // to: "shreyasmudak@gmail.com",
      to: `${mail}`,
      subject: "Hello from admin for quote response",
      text: `${response}`,
      html: `<html>
      <body>
      <p>
      Hi <b>${name}</b>
      </p>
      <p style='margin-top: 1rem'>
      Thank you for connecting with us! This mail is sent to you regarding your quote request.
      </p>
      <p style='margin-top: 1rem'>
      ${response}
      </p>
      <div style='margin-top: 1rem'>
      <p>
      Please refer below document for clarification.
      </p>
      <a href="${docLink}" target="_blank">Click here</a>
      </div>
      <div style='margin-top: 2rem'>
      <p>Thank you,</p>
      <p>Team Edwin</p>
      </div>
      </body>
      </html>`,
    };

    let info = await transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log("err ", err);
      } else {
        console.log("mail sent");
      }
    });

    console.log("Message sent ", info);
  } catch (error) {
    console.log("err ", err);
  }
};

module.exports = sendMail;
