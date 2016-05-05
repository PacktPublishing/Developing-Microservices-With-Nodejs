if [ ! -d "./node_modules/mocha" ]; then
  npm install mocha@1
fi

./node_modules/.bin/mocha test/zig.test.js
