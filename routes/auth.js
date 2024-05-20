const {User} = require('../models/users.js');
const express = require('express');
const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/', async(req,res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email});
    if (!user) return res.status(400).send("Invalid user or password :(");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send("Invalid user or password :(");

    const token = user.GenerateAuthToken(); 
    res.send(token);
});

function validate(req) {
    const schema = {
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required()
    };
  
    return Joi.validate(req, schema);
  }

module.exports = router; 