var seneca = require('seneca')().use('employees-storage')

var employee =  {
    name: "David",
    surname: "Gonzalez",
    position: "Software Developer"
}

function add_employee() {
    seneca.act({role: 'employee', cmd: 'add', data: employee}, function (err, msg) {
        console.log(msg);
    });
}

add_employee();
