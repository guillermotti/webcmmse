const nodemailer = require('nodemailer');
module.exports = (newPaper) => {
    var transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: newPaper.emailSender, 
                pass: newPaper.emailPass // Cambialo por tu password
            }
        }
    );
    const mailOptions = {
        from: `"CMMSE ${newPaper.year}" <${newPaper.emailSender}>`,
        to: newPaper.emailSender, // Cambia esta parte por el destinatario
        subject: `CMMSE ${newPaper.year} New Paper Uploaded`,
        bcc: newPaper.bcc,
        html: 
        `
        <p>A new paper has been uploaded with the following data:</p><br/>
        <p>Date: ${newPaper.date}.</p>
        <p>User: ${newPaper.user}.</p>
        <p>Title: ${newPaper.title}.</p>
        <p>Document: ${newPaper.url}.</p>
        <p>First author: ${newPaper.author}, ${newPaper.authorEmail}.</p><br/>
        <p>Sincerely,<br/>
        CMMSE ${newPaper.year} Team
        </p>
        `
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}