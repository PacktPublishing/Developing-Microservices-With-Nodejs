seneca.add({area: "product", action: "fetch"}, function(args, done) {
    var products = this.make("products");
    products.list$({}, function(err, result) {
        done(err, result);
    });
});
