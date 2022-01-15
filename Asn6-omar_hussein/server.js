/********************************************************************************* * 
* BTI325 – Assignment 5 
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source 
* (including web sites) or distributed to other students.  
* Name: Omar Hussein        Student ID: 118073204        Date: Dec, 3, 2021 
* ********************************************************************************/

require('dotenv').config({ path : './.data/.env' });
const path          = require('path');
const express       = require('express');
const exphbs        = require('express-handlebars');
const mongoose      = require('mongoose');
const multer        = require('multer');
const session       = require('express-session');

const database      = require('./js/database/config/database');
const routes        = require('./js/scripts/routes');

const app       = express();
const HBS       = exphbs.create({extname: '.hbs', defaultLayout: 'main'});
let sessionVariables = {
    HTTP_HOST   : process.env.HOST || 'http://localhost',
    HTTP_PORT   : process.env.PORT || 8800
}
app.use(express.urlencoded({ extended: 'true' }));
app.use(express.json({ type: 'application/vnd.api+json' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer().none());
app.use(session({ 
    secret              : 'Session Logging in Action!',
    cookie              : { maxAge: 3600000 },
    saveUninitialized   : false,
    resave              : false,
    authenticated       : false,
}));
app.use('/', routes);

app.engine('.hbs', HBS.engine);
app.set('view engine', 'hbs');

mongoose.connect(database.url);

app.listen(sessionVariables.HTTP_PORT, () => {
    console.log(`Simple API listening at : ${sessionVariables.HTTP_HOST}:${sessionVariables.HTTP_PORT}`);
});