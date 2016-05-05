module.exports = function(options) {
    this.add({role: 'employee', cmd: 'add'}, function(msg, respond){
        this.make('employee').data$(msg.data).save$(respond);
    });
    
    this.find({role: 'employee', cmd: 'get'}, function(msg, respond) {
        this.make('employee').load$(msg.id, respond);
    });
}
