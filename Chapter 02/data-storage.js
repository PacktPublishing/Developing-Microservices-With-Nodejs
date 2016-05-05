var seneca = require('seneca')()

var product = seneca.make('product')
product.name = 'Apple'
product.price = 1.99

product.save$( console.log )
