const nodemailer = require("nodemailer");

const sendMessage = async (email,code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "baxtiyorovbehruz962@gmail.com",
      pass: "shu yer qoldi! ...",
    },
  });


  await transporter.sendMail({
    from: "baxtiyorovbehruz962@gmail.com",
    to: email,
    subject: "Lesson",
    text: code,
  });
};

module.exports = {
sendMessage      
}
