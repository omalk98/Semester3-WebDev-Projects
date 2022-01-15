const fs            = require("fs");
const path          = require('path');
const express       = require('express');
const bcrypt        = require('bcryptjs');
const User          = require('../database/models/user_model');
const Book          = require('../database/models/book_model');
const Pass          = require('../database/models/password_model');
const Sess          = require('../database/models/session_model');
const id_gen        = require('./id_gen');

const router        = express.Router();

let sessionVariables = {
    fl_name     : "",
    mfo         : false,
    err_msg     : ""
}

router.get('/', (req, res) => {
    res.status(200).redirect('/home');
});

router.get('/home', (req, res) => {
    if (!req.session.authenticated)
        res.status(200).render('index', { title: 'Simple API', logged: req.session.authenticated, vars: sessionVariables});
    else
        fs.readdir(path.join(__dirname, '../..', 'public', 'images'),(err, imgs) => {
            if(err){
                console.log(err);
                return;
            }
            res.status(200).render('index', { title: 'Simple API', logged: req.session.authenticated, vars: sessionVariables, p_pic: (sessionVariables.mfo) ? imgs[1] : imgs[0]});
        });
});

router.get('/signup', (req, res) => {
    if (!req.session.authenticated)
        res.status(200).render('signup', { title: 'Sign-up', logged: req.session.authenticated, vars: sessionVariables });
    else
        fs.readdir(path.join(__dirname, '../../', 'public', 'images'),(err, imgs) => {
            if(err){
                console.log(err);
                return;
            }
            res.status(200).render('signup', { title: 'Sign-up', logged: req.session.authenticated, vars: sessionVariables, p_pic: (sessionVariables.mfo) ? imgs[1] : imgs[0] });
        });
    sessionVariables.err_msg = "";
});

router.post('/signup', (req, res) => {
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
                    sessionVariables.err_msg = "Something went wrong!";
                    res.status(404).redirect('/error');
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

router.get('/login', (req, res) => { 
    if(req.session.authenticated)
        res.status(307).redirect('/home');
    else 
        res.status(200).render('login', {title: 'Login', logged: req.session.authenticated, vars: sessionVariables,  hide: true});
    sessionVariables.err_msg = "";
});

router.post('/login', (req, res) => {
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
                    sessionVariables.err_msg = "Something went wrong!";
                    res.status(404).redirect('/error');
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
                    res.status(202).redirect('/home');
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

router.post('/signout', (req, res) => {
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

router.get('/dashboard', (req, res) => {
    if(!req.session.authenticated)
        res.status(200).render('dashboard', { title: 'Dashboard', srch_err_msg: sessionVariables.err_msg, logged: req.session.authenticated, vars : sessionVariables });
    else
        fs.readdir(path.join(__dirname, '../../', 'public', 'images'),(err, imgs) => {
            if(err){
                console.log(err);
                return;
            }
            res.status(200).render('dashboard', { title: 'Dashboard', srch_err_msg: sessionVariables.err_msg, logged: req.session.authenticated, vars : sessionVariables, p_pic: (sessionVariables.mfo) ? imgs[1] : imgs[0] });
        });
    sessionVariables.err_msg = "";
});

function findBy(queryString, res) {
    Book.find(queryString, (err, books) => {
        if (err){
            console.log(err);
            return;
        }
        if (books)
            res.status(202).json(books);
        else {
            res.status(404).send('No Books Found');
        }
    });
}
router.post('/dashboard/search', (req, res) => {
    sessionVariables.err_msg = "";

    if (req.session.authenticated) {
        if (req.body.isbn) {
            findBy({ isbn: `${req.body.isbn}` }, res);
        }
        else if (req.body.title) {
            findBy({ title: {$regex: `.*${req.body.title}.*`, $options: 'i' } }, res);
        }
        else if (req.body.id) {
            findBy({ _id: `${req.body.id}` }, res);
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

router.get('/eAPI', (req, res) => {
    if (!req.session.authenticated)
        res.render('external_api', { title: 'External API', err_msg: sessionVariables.err_msg, logged: req.session.authenticated, vars : sessionVariables });
    else
        fs.readdir(path.join(__dirname, 'public', 'images'),(err, imgs) => {
            if(err){
                console.log(err);
                return;
            }
            console.log(((sessionVariables.mfo) ? imgs[1] : imgs[0]));
            res.status(200).render('signup', { title: 'Sign-up', logged: req.session.authenticated, vars: sessionVariables, p_pic: (sessionVariables.mfo) ? imgs[1] : imgs[0] });
        });
    sessionVariables.err_msg = "";
});

router.get('/eAPI/:uid/:srch_type/:srch_key', (req, res) => {
    User.findById(req.params.uid, (err, user)=> {
        if(err){
            console.log(err);
            return;
        }
        if (!user) {
            console.log('No mathing UserID found.');
            res.status(404).send('No mathing UserID found.');
            return;
        }
        if (req.params.srch_type === "id") {
            findBy({ _id: `${req.params.srch_key}` }, res);
        }
        else if (req.params.srch_type === "title") {
        findBy({ title: {$regex: `.*${req.params.srch_key}.*`, $options: 'i' } }, res);
        }
        else if (req.params.srch_type === "isbn") {
            findBy({ isbn: `${req.params.srch_key}` }, res);
        }
    });
});

router.get('*', (req, res) => {
  res.status(404).render('error', {title: 'Error', logged: req.session.authenticated, vars: sessionVariables });
});

module.exports = router;