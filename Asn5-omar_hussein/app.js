/********************************************************************************* * 
* BTI325 – Assignment 5 
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source 
* (including web sites) or distributed to other students.  
* Name: Omar Hussein        Student ID: 118073204        Date: Dec, 3, 2021 
* ********************************************************************************/

require('dotenv').config({ path : './.data/.env' });
const fs            = require("fs");
const path          = require('path');
const express       = require('express');
//const https         = require('https');
const exphbs        = require('express-handlebars');
const mongoose      = require('mongoose');
const multer        = require('multer');
const session       = require('express-session');
const bcrypt        = require('bcryptjs');

const database      = require('./js/database/config/database');
const User          = require('./js/database/models/user_model');
const Book          = require('./js/database/models/book_model');
const Pass          = require('./js/database/models/password_model');
const Sess          = require('./js/database/models/session_model');
const id_gen        = require('./js/scripts/id_gen');

const app       = express();
const HBS       = exphbs.create({extname: '.hbs'});
let sessionVariables = {
    fl_name     : "",
    mfo         : false,
    err_msg     : "",
    HTTP_HOST   : process.env.HOST || 'http://localhost',
    HTTP_PORT   : process.env.PORT || 8800
}

app.use(session({ 
    secret              : 'Session Logging in Action!',
    cookie              : { maxAge: 3600000 },
    saveUninitialized   : false,
    resave              : false,
    authenticated       : false,
 }));
app.use(express.urlencoded({ extended: 'true' }));
app.use(express.json({ type: 'application/vnd.api+json' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer().none());

app.engine('.hbs', HBS.engine);
app.set('view engine', 'hbs');

// const sslServer = https.createServer({
//     key: fs.readFileSync(path.join(__dirname, '.data', '.cert', 'key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, '.data', '.cert', 'cert.pem')),
//     app
// });

mongoose.connect(database.url);

app.get('/', (req, res) => {
    res.status(200).redirect('/home');
});

app.get('/home', (req, res) => {
    res.status(200).render('index', { title: 'Simple API', logged: req.session.authenticated, vars: sessionVariables});
});

app.get('/signup', (req, res) => {
    res.status(200).render('signup', { title: 'Sign-up', logged: req.session.authenticated, vars: sessionVariables });
    sessionVariables.err_msg = "";
});

app.post('/signup', /*multer().none(),*/ (req, res) => {
    sessionVariables.err_msg = "";
    if (req.body.firstName !== "" && req.body.lastName !== "" && req.body.username !== "" && req.body.email !== "" && req.body.password !== "" && req.body.re_password !== "") {
        if (req.body.password === req.body.re_password) {
            let uid = id_gen.generateUID();
            User.create({
                _id         : uid,
                firstName   : req.body.firstName,
                lastName    : req.body.lastName,
                username    : req.body.username,
                email       : req.body.email,
                dob         : req.body.dob,
                gender      : req.body.gender
            }, (err, user) => {
                if (err) {
                    console.log(err);
                    res.status(400).redirect('/signup');
                    return;
                }
                console.log("New User Profile Created.");
                req.session.authenticated = true;
                req.session.user = {
                    uid             : uid,
                    sid             : id_gen.generateSID(),
                    user            : user.username,
                    email           : user.email,
                    session_begin   : Date.now()
                };
                sessionVariables.mfo = user.gender === "Male";
                sessionVariables.fl_name = `${user.firstName} ${user.lastName}`;
                res.status(201).redirect('/home');
            });
            Pass.create({
                _id     : uid,
                hash    : bcrypt.hashSync(req.body.password, 5)
            }, (err) => {
                if (err){
                    console.log(err);
                    User.deleteOne({ _id: uid });
                    console.log('Error Occured. Abort Account Creation.');
                    return;
                }
                console.log("Password Secured. Account Complete.");
            });
        }
    }
    else {
        console.log('Error occured');
        res.status(400).send("Error Occured.");
    }
});

app.get('/login', (req, res) => { 
    if(req.session.authenticated)
        res.status(200).redirect('/home');
    else 
        res.status(200).render('login', {title: 'Login', logged: req.session.authenticated, vars: sessionVariables,  hide: true});
    sessionVariables.err_msg = "";
});

app.post('/login', /*multer().none(),*/ (req, res) => {
    sessionVariables.err_msg = "";
    User.findOne({$or:[{username:`${req.body.username}`}, {email:`${req.body.username}`}]}, (err, user) => {
        if (err){
            console.log(err);
            return;
        }
        if (user) {
            Pass.findById(user._id, (err, pw) => {
                if(err){
                    console.log(err);
                    return;
                }
                if (bcrypt.compareSync(req.body.password, pw.hash)) {
                    console.log('Login Sucessful.');
                    req.session.authenticated = true;
                    req.session.user = { 
                        uid             : user._id,
                        sid             : id_gen.generateSID(), 
                        user            : user.username, 
                        email           : user.email, 
                        session_begin   : Date.now() 
                    };
                    sessionVariables.mfo = user.gender === "Male";
                    sessionVariables.fl_name = `${user.firstName} ${user.lastName}`;
                    res.status(200).redirect('/home');
                }
                else {
                    console.log("Invalid Password Login Attempt!");
                    req.session.authenticated = false;
                    sessionVariables.err_msg = "Incorrect Password";
                    res.status(401).redirect('/home');
                }
            });
        }
        else {
            console.log("Invalid User Login Attempt.");
            req.session.authenticated = false;
            sessionVariables.err_msg = "User Does Not Exist";
            console.log(sessionVariables.err_msg)
            res.status(401).redirect('/home');
        }
    });
});

app.post('/signout', (req, res) => {
    req.session.authenticated = false;
    req.session.user.session_end = Date.now();
    req.session.user.time_spent = req.session.user.session_end - req.session.user.session_begin;
    Sess.create({
        uid             : req.session.user.uid,
        sessionID       : req.session.user.sid,
        username        : req.session.user.user,
        email           : req.session.user.email,
        session_begin   : req.session.user.session_begin,
        session_end     : req.session.user.session_end, 
        time_spent_ms   : req.session.user.time_spent
    }, (err) => {
        if (err){
            console.log(err);
            return;
        }
    });
    console.log("Signout Sucessful.");
    res.status(200).redirect('/home');
});

app.get('/dashboard', (req, res) => {
    res.status(200).render('dashboard', { title: 'Dashboard', srch_err_msg: sessionVariables.err_msg, logged: req.session.authenticated, vars : sessionVariables });
    sessionVariables.err_msg = "";
});

app.post('/dashboard/search', /*multer().none(),*/ (req, res) => {
    sessionVariables.err_msg = "";
    function findBy(queryString) {
        Book.find(queryString, (err, books) => {
            if (err){
                console.log(err);
                return;
            }
            if (books)
                res.json(books);
            else {
                res.status(404).send('No Books Found');
            }
        });
    }

    if (req.session.authenticated) {
        if (req.body.isbn) {
            findBy({ isbn: `${req.body.isbn}` });
        }
        else if (req.body.title) {
            findBy({ title: { $regex: `.*${req.body.title}.*` } });
        }
        else if (req.body.id) {
            findBy({ _id: `${req.body.id}` });
        }
        else {
            sessionVariables.err_msg = "No Input";
            res.status(404).redirect('/dashboard');
        }
    }
    else {
        sessionVariables.err_msg = "Login to use API";
        res.status(403).redirect('/dashboard');
    }
});

app.get('*', (req, res) => {
  res.status(404).render('error', {title: 'Error', logged: req.session.authenticated, vars: sessionVariables });
});

app.listen(sessionVariables.HTTP_PORT, () => {
    console.log(`Simple API listening at : ${sessionVariables.HTTP_HOST}:${sessionVariables.HTTP_PORT}`);
});
// sslServer.listen(sessionVariables.HTTP_PORT, () => {
//     console.log(`Simple API listening at : ${sessionVariables.HTTP_HOST}:${sessionVariables.HTTP_PORT}`);
// });