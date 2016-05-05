module.exports = function (options) {
    
    /**
     * Queues a post message for printing and sending.
     */
    this.add({channel: 'post', action: 'queue'}, function(msg, respond) {
        // Code to queue a post message.
        respond(null, {ok: "ok"});
    });
}
