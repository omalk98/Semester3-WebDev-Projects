/********************************************************************************* * 
* BTI325 – Assignment 5 
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source 
* (including web sites) or distributed to other students.  
* Name: Omar Hussein        Student ID: 118073204        Date: Dec, 1, 2021 
* ********************************************************************************/

const fs = require('fs')
const path = require('path');

module.exports.generateUID = () => {
    let UC = JSON.parse(fs.readFileSync(path.join(__dirname, '../../.data/.user_count.json')));
    ++UC.userCount;
    fs.writeFileSync(path.join(__dirname, '../../.data/.user_count.json'), JSON.stringify(UC));
    return Number(UC.userCount);
}

module.exports.generateSID = () => { return Number(String(Math.floor(1000000 + Math.random() * 9999999)) + Number(Date.now())); }