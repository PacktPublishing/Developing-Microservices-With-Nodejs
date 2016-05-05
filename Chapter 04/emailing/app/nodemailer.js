var nodemailer = require('nodemailer');
var seneca = require("seneca")();
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'info@micromerce.com',
        pass: 'verysecurepassword'
    }
});


/**
 * Sends an email including the content.
 */
seneca.add({area: "email", action: "send"}, function(args, done) {
    var mailOptions = {
        from: 'Micromerce Info ✔ <info@micromerce.com>',
        to: args.to, 
        subject: args.subject,
        html: args.body
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            done({code: e}, null);
        }
        done(null, {status: "sent"});
    });
});
