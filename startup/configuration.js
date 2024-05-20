const config = require('config');

module.exports = function() {
    const token = config.get('jwtprivatekey');
    if(!token){
    console.log('Secret key is not defined');
    process.exit(1);
    }
}