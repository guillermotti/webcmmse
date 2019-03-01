const nodemailer = require('nodemailer');
module.exports = changePaperState => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: changePaperState.emailSender,
      pass: changePaperState.emailPass // Cambialo por tu password
    }
  });
  let acceptedExplanation = '.';
  if (changePaperState.state === 'ACCEPTED') {
    acceptedExplanation =
      ', for presentation at CMMSE (20 min + questions). See cmmse.usal.es for instructions regarding the publication of the Proccedings';
  }
  const mailOptions = {
    from: `"CMMSE ${changePaperState.year}" <${changePaperState.emailSender}>`,
    to: changePaperState.email, // Cambia esta parte por el destinatario
    subject: `CMMSE ${changePaperState.year} Paper State Changed`,
    bcc: changePaperState.bcc,
    html: `
        <p>Dear <strong>${changePaperState.name}</strong>:</p> <br/>
        <p>Your paper state has been changed to <strong>${
          changePaperState.state
        }</strong>${acceptedExplanation}</p><br/>
        <p>Paper: ${changePaperState.title}.</p><br/>
        <p>Document: ${changePaperState.url}.</p><br/>
        <p>First author: ${changePaperState.author}, ${
      changePaperState.authorEmail
    }.</p><br/>
        <p>Sincerely,<br/>
        CMMSE ${changePaperState.year} Team
        </p>
        `
  };
  transporter.sendMail(mailOptions, function(err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
};
