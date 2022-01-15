/********************************************************************************* * 
* BTI325 – Assignment 5 
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source 
* (including web sites) or distributed to other students.  
* Name: Omar Hussein        Student ID: 118073204        Date: Dec, 1, 2021 
* ********************************************************************************/

const mongoose   = require('mongoose')

const { Schema } = mongoose;
UserSchema       = new Schema({
    _id : Number,
    firstName : {
        type    : String,
        require : true
    },
	lastName : {
        type    : String,
        require : true
    },
    username : {
        type    : String,
        unique  : true,
        require : true
    },
    email : {
        type    : String,
        unique  : true,
        require : true
    },
    dob : {
        type    : Date,
        require : true
    },
    dateCreated: {
        type    : Date,
        default : Date.now,
        require : true
    },
    gender : {
        type    : String,
        require : true
    }
});

module.exports = mongoose.model('User', UserSchema);