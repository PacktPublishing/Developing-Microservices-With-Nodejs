if [ ! -d "./node_modules/jshint" ]; then
  npm install jshint@2
fi

if [ ! -d "./node_modules/docco" ]; then
  npm install docco@0
fi

./node_modules/.bin/jshint gate-executor.js
./node_modules/.bin/docco gate-executor.js -o doc
cp -r doc/* ../gh-pages/gate-executor/doc
