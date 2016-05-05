
module.exports = function(options) {
    
    var init = {}
        
    /**
     * Sends one SMS
     */
    init.sendSMS = function(destination, content) {
        // Code to send SMS
    }
    
    /**
     * Reads the pending list of SMS.
     */
    init.readPendingSMS = function() {
        // code to receive SMS
        return listOfSms;
    }
    
    /**
     * Sends an email.
     */
    init.sendEmail = function(subject, content) {
        // code to send emails
    }
    
    /**
     * Gets a list of pending emails.
     */
    init.readPendingEmails = function() {
        // code to read the pending emails
        return listOfEmails;
    }
    
    /**
     * This code marks an email es read so it does not get
     * fetch again by the readPendingEmails function.
     */
    init.markEmailAsRead = function(messageId) {
        // code to mark a message as read.
    }
    
    /**
     * This function queues a document to be printed and
     * sent by post.
     */
    init.queuePost = function(document) {
        // code to queue post
    }
    
    return init;
}
