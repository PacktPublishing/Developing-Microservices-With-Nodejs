var express = require("express");
var bodyParser = require('body-parser');

var senecaEmailer = require("seneca")().client({
    host: "192.168.0.2", 
    port: 8080
});
var senecaProductManager = require("seneca")().client({
    host: "192.168.0.3", 
    port: 8080
});
var senecaOrderProcessor = require("seneca")().client({
    host: "192.168.0.4", 
    port: 8080
});

function api(options) {
    var seneca = this;
    
    /**
     * Gets the full list of products.
     */
    seneca.add({area: "ui", action: "products"}, function(args, done) {
        senecaProductManager.act({area: "product", action: "fetch"}, function(err, result) {
            done(err, result);
        });
    });
    
    /**
     * Get a product by id.
     */
    seneca.add({area: "ui", action: "productbyid"}, function(args, done) {
        senecaProductManager.act({area: "product", action: "fetch", criteria: "byId", id: args.id}, function(err, result) {
            done(err, result);
        });
    });
    
    /**
     * Creates an order to buy a single prodct.
     */
    seneca.add({area: "ui", action: "createorder"}, function(args, done) {
        senecaProductManager.act({area: "product", action: "fetch", criteria: "byId", id: args.id}, function(err, product) {
            if(err) done(err, null);
            senecaOrderProcessor.act(area: "orders", action: "create", products: [product], email: args.email, name: args.name, function(err, order) {
                done(err, order);
            });
        });
    });

    this.add("init:api", function(msg, respond){
        seneca.act('role:web',{ use: {
            prefix: '/api',
            pin:    'area:ui,action:*',
            map: {
              products:    {GET:true}    
              productbyid: {GET:true, suffix:'/:id'}
              createorder: {POST:true}
            }
        }}, respond)
    });
}
module.exports = api;
var seneca = require("seneca")();
seneca.use(api);

var app = require("express")();
app.use( require("body-parser").json());
app.use(seneca.export("web"));
app.listen(3000);
