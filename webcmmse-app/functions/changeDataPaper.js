const nodemailer = require('nodemailer');
module.exports = (changeDataPaper) => {
    var transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: changeDataPaper.emailSender, 
                pass: changeDataPaper.emailPass // Cambialo por tu password
            }
        }
    );
    const mailOptions = {
        from: `"CMMSE ${changeDataPaper.year}" <${changeDataPaper.emailSender}>`,
        to: changeDataPaper.emailSender, // Cambia esta parte por el destinatario
        subject: `CMMSE ${changeDataPaper.year} Paper Information Changed`,
        bcc: changeDataPaper.bcc,
        html: 
        `
        <p>The following paper on Major/Minor state has been modified:</p><br/>
        <p>Date: ${changeDataPaper.date}.</p>
        <p>Paper: ${changeDataPaper.title}.</p>
        <p>Document: ${changeDataPaper.url}.</p>
        <p>First author: ${changeDataPaper.author}, ${changeDataPaper.authorEmail}.</p><br/>
        <p>Sincerely,<br/>
        CMMSE ${changeDataPaper.year} Team
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