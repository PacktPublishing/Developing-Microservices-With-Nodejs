var seneca = require("seneca")()
			.use("email")
			.use("sms")
			.use("post");
seneca.listen({port: 1932, host: "10.0.0.7"});

// interact with the existing email service using "seneca"

var senecaEmail = require("seneca").client({host: "new-email-service-ip", port: 1932});

// interact with the new email service using "senecaEmail"
