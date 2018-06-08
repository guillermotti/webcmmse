const nodemailer = require('nodemailer');
module.exports = (proofPayment) => {
    var transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: proofPayment.emailSender, 
                pass: proofPayment.emailPass // Cambialo por tu password
            }
        }
    );
    const mailOptions = {
        from: `"CMMSE ${proofPayment.year}" <${proofPayment.emailSender}>`,
        to: proofPayment.emailSender, // Cambia esta parte por el destinatario
        subject: `CMMSE ${proofPayment.year} New Proof Of Payment Uploaded`,
        bcc: proofPayment.bcc,
        html: 
        `
        <p>A new proof of payment has been uploaded with the following data:</p><br/>
        <p>Date: ${proofPayment.date}.</p>
        <p>User: ${proofPayment.user}.</p>
        <p>Document: ${proofPayment.url}.</p>
        <p>Sincerely,<br/>
        CMMSE ${proofPayment.year} Team
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