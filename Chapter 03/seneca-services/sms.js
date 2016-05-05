module.exports = function (options) {
    
    /**
     * Sends an email.
     */
    this.add({channel: 'sms', action: 'send'}, function(msg, respond) {
        // Code to send a sms.
        respond(null, {ok: "ok"});
    });
    
    /**
     * Receives the pending SMS.
     */
    this.add({channel: 'sms', action: 'pending'}, function(msg, respond) {
        // Code to read pending sms.
        respond(null, {ok: "ok"});
    });
}
