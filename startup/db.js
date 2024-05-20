const mongoose = require('mongoose');
const config = require('config');

module.exports = function() {
    mongoose.connect(config.get('db'))
    .then(() => console.log(`Connected to ${config.get('db')}...`))
    .catch(err => console.error(`Could not connect to ${config.get('db')}...`));
}
