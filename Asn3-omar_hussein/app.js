// include express module, working with express framework
var express = require('express');
// include path module, allows working with local storage system
var path = require('path');
// create a variable named app to represent the express object
var app = express();
// include express-handlebars module, working with hbs files for dynamic rendering
const exphbs = require('express-handlebars');
const fs = require("fs");
const multer = require("multer");
var bookData;
var userData;
const HBS = exphbs.create({
    helpers: {
        to_zero: (pageCount) => {
            return Number(pageCount) == 0 ? "zero" : pageCount;
        }
    },
    extname: '.hbs'  
});
cleanData = (data) => {
    for (book of data) {
        if (book._id.$oid) book._id = book._id.$oid;
        if (book.publishedDate) book.publishedDate = book.publishedDate.$date ? book.publishedDate.$date.substr(0,10) : "Unavailable"
    }
}
// use the environment supplied port {$env:port=3001}, if not available, default to port 3000
const port = process.env.port || 3000;
// use the stylesheets supplied in the folder to display pretty pages
app.use(express.static(path.join(__dirname, 'public')));
// set engine to read .hbs files
app.engine('.hbs', HBS.engine);
// set viewing engine to hbs
app.set('view engine', 'hbs');
// app main route
app.get('/', (req, res) => {
    // use hbs engine to render index page using main.hbs as its skeleton
  res.status(200).render('index', { title: 'Express' });
});
// route for localhost:{$port}/users
app.get('/users', (req, res) => {
  if (!userData) {
    userData = JSON.parse(fs.readFileSync(path.join(__dirname, "/data/user_data.json")));
  }
  res.status(200).render('table_users', {data: userData, title: 'User Data'});
});
app.get("/data", (req, res) => {
    if(!bookData){
        bookData = JSON.parse(fs.readFileSync(path.join(__dirname, "/data/book_data.json")));
    }
    res.status(201).render('data_loaded.hbs', {title: 'Data Ready!'});
    console.log("JSON data loaded successfuly.");
    cleanData(bookData);
});

app.get("/data/isbn/:index_no", (req, res) => {
    if (bookData) {
            res.status(200).render('isbn', {isbn: bookData[req.params.index_no].isbn, title: 'ISBN by Index Number'});
    }
    else res.status(404).render('error', { title: 'Error', message: 'Data not Ready', link: `http://localhost:${port}/data` });
});

app.get("/data/search/isbn", (req, res) => {
    res.status(200).render('form', {title: 'Search ISBN', form_type: 'isbn'});
});
app.post("/data/search/isbn", multer().none(), (req, res) => {
    if (bookData) {
        let reqBook;
        for (book of bookData){
            if (book.isbn == req.body.isbn) {
                reqBook = book;
                break;
            }
        }
        if (reqBook) {
            res.status(200).render('table_single', {data: reqBook, layout: false, title: 'Book by ISBN'});
        }
        else res.status(404).render('error', { title: 'Error', message:'Book not Found' });
    }
    else res.status(404).render('error', { title: 'Error', message: 'Data not Ready', link: `http://localhost:${port}/data` });
});

app.get("/data/search/title", (req, res) => {
    res.status(200).render('form', {title: 'Search Title', form_type: 'title'});
});+
app.post("/data/search/title", multer().none(), (req, res) => {
    if (bookData) {
        let reqBook = [], i = 0;
        for (book of bookData){
            if (book.title.includes(req.body.title)) {
                reqBook[i++] = book;
            }
        }
        if (reqBook) {
            res.status(200).render('table_multi', {data: reqBook, layout: false, title: 'Books by Title'});
        }
        else res.status(404).render('error', { title: 'Error', message:'Book not Found' });
    }
    else res.status(404).render('error', { title: 'Error', message: 'Data not Ready', link: `http://localhost:${port}/data` });
});
app.get('/data/allData', (req, res) => {
    if(bookData){
        res.status(200).render('table_multi', {data: bookData, layout: false, title: 'All Data'});
    }
    else res.status(404).render('error', { title: 'Error', message: 'Data not Ready', link: `http://localhost:${port}/data` });
});
app.get('/data/allData/noZero', (req, res) => {
    if(bookData){
        res.status(200).render('table_no_zero', {data: bookData, layout: false, title: 'All Data'});
    }
    else res.status(404).render('error', { title: 'Error', message: 'Data not Ready', link: `http://localhost:${port}/data` });
});
app.get('/data/allData/highlight', (req, res) => {
    if(bookData){
        res.status(200).render('table_highlight', {data: bookData, layout: false, title: 'All Data'});
    }
    else res.status(404).render('error', { title: 'Error', message: 'Data not Ready', link: `http://localhost:${port}/data` });
});
// any other unrecognised route
app.get('*', (req, res) => {
    // use hbs engine to render error page with main.hbs as its skeleton
  res.status(404).render('error', { title: 'Error', message:'Wrong Route' });
});
// app will listen to requests at the specified port above 
app.listen(port, () => {
    // display to the console the link which the application will be listening at
  console.log(`Example app listening at http://localhost:${port}`)
});
