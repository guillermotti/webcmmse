const nodemailer = require('nodemailer');
module.exports = register => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: register.emailSender,
      pass: register.emailPass // Cambialo por tu password
    }
  });
  const mailOptions = {
    from: `"CMMSE ${register.year}" <${register.emailSender}>`,
    to: register.emails, // Cambia esta parte por el destinatario
    subject: `CMMSE ${register.year} Signup Information`,
    bcc: register.bcc,
    html: `
        <p>Dear <strong>${register.name}</strong>:</p> <br/>
        <p>Thanks for participating in the CMMSE ${
          register.year
        } conference.</p> <br/>
        <p>Now, you can complete your registration (Conference Information, Payment Information
            and Paper submission) through the conference web. Obviously, you can also modify your Personal Information.</p><br/>
        <p>Note that this email is an automatic response. <strong>Please don't reply to this email. </strong>
        Direct all questions to cmmse@usal.es</p><br/><br/>
        <p>Sincerely,<br/>
        CMMSE ${register.year} Team
        </p>
        `
  };
  transporter.sendMail(mailOptions, function(err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
};
