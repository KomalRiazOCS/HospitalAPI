const auth = require('../middleware/auth.js');
const {User,validate} = require('../models/users.js');
const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/', async(req,res) => { 
    console.log('inside uers');
    try{
        const { error } = validate(req.body); 
        if (error) return res.status(400).send(error.details[0].message);
    
        let user = await User.findOne({ email: req.body.email});
        if (user) return res.status(400).send("User already registered");
    
        user = new User(_.pick(req.body,['name', 'password', 'email']));
    
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    
        await user.save();
    
        const token = user.GenerateAuthToken();
        res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
    }catch(err){
        console.log('Error' , err);
    }
    
});

router.get('/me', auth,  async(req,res) => { 
    let user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

module.exports = router; 