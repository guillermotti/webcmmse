const nodemailer = require('nodemailer');
module.exports = password => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: password.emailSender,
      pass: password.emailPass // Cambialo por tu password
    }
  });
  const mailOptions = {
    from: `"CMMSE ${password.year}" <${password.emailSender}>`,
    to: password.email, // Cambia esta parte por el destinatario
    subject: `CMMSE ${password.year} New Password`,
    html: `
        <p>Dear <strong>${password.name}</strong>:</p> <br/>
        <p>This is your new password: ${password.password}</p><br/>
        <p>For security reasons, we recommend you to change as soon as possible this password entering on your profile.</p><br/>
        <p>Note that this email is an automatic response. <strong>Please don't reply to this email. </strong>
        Direct all questions to cmmse@usal.es</p><br/><br/>
        <p>Sincerely,<br/>
        CMMSE ${password.year} Team
        </p>
        `
  };
  transporter.sendMail(mailOptions, function(err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
};
