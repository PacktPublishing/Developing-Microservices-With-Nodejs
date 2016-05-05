var mandrill = require("mandrill-api/mandrill");
var mandrillClient = new mandrill.Mandrill("eAiueS-mhF5ber5Bi0I9dg");

var plugin = function(options) {
    var seneca = this;
    /**
     * Sends an email using a template email.
     */
    seneca.add({area: "email", action: "send", template: "*"}, function(args, done) {
        console.log("sending");
        var message = {
            "subject": args.subject,
            "to": [{
                "email": args.to,
                "name": args.toName,
                "type": "to"
            }],
            "from_email": "info@micromerce.com",
            "from_name": "Micromerce",
            "global_merge_vars": args.vars,
        }
        mandrillClient.messages.sendTemplate(
            {"template_name": args.template, "template_content": {}, "message": message}, 
        function(result) {
            done(null, {status: result.status});
        }, function(e) {
            done({code: e.name}, null);
        });
    });
    
    /**
     * Sends an email including the content.
     */
    seneca.add({area: "email", action: "send", cc: "*"}, function(args, done) {
        var message = {
            "html": args.content,
            "subject": args.subject,
            "to": [{
                "email": args.to,
                "name": args.toName,
                "type": "to"
            },{
                "email": args.cc,
                "name": args.ccName,
                "type": "cc"
            }],
            "from_email": "info@micromerce.com",
            "from_name": "Micromerce"
        }
        mandrillClient.messages.send({"message": message}, function(result) {
            done(null, {status: result.status});
        }, function(e) {
            done({code: e.name}, null);
        });
    });
};


var seneca = require("seneca")();
seneca.use(plugin);
seneca.act({area: "email", action: "send", subject: "The Subject", to: "test@test.com", toName: "Test Testingtong"}, function(err, result){
    console.log(err);
    console.log(result);
});
