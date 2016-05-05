var mandrill = require("mandrill-api/mandrill");
var mandrillClient = new mandrill.Mandrill("5Tje9eDkVK4o7ZROEhb1Lw");

mandrillClient.users.info({}, function(result){
    console.log(result);
}, function(e){
    console.log(e);
});
