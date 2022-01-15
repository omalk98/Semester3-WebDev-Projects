/********************************************************************************* * 
* BTI325 – Assignment 5 
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source 
* (including web sites) or distributed to other students.  
* Name: Omar Hussein        Student ID: 118073204        Date: Dec, 3, 2021 
* ********************************************************************************/

const mongoose   = require('mongoose')

const { Schema } = mongoose;
PassSchema       = new Schema({
    _id : {
        type    : Number,
        require : true
    },
    hash : {
        type    : String,
        require : true
    }
});

module.exports = mongoose.model('Password', PassSchema);