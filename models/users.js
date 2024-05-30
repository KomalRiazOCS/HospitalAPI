const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true   
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  isAdmin: Boolean
});

usersSchema.methods.GenerateAuthToken = function() {
    const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin}, config.get('jwtprivatekey'));
    return token;
}

const User = mongoose.model('User', usersSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  };

  return Joi.validate(user, schema);
}

exports.User = User; 
exports.validate = validateUser;