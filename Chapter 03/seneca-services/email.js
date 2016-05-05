module.exports = function (options) {
    
    /**
     * Sends an email.
     */
    this.add({channel: 'email', action: 'send'}, function(msg, respond) {
        // Code to send an email.
        respond(null, {ok: "ok"});
    });
    
    /**
     * Gets a list of pending emails.
     */
    this.add({channel: 'email', action: 'pending'}, function(msg, respond) {
        // Code to read pending email.
        respond(null, {ok: "ok"});
    });
    
    /**
     * Marks a message as read.
     */
    this.add({channel: 'email', action: 'read'}, function(msg, respond) {
        // Code to mark a message as read.
        respond(null, {ok: "ok"});
    });
}
