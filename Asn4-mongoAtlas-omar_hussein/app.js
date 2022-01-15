/********************************************************************************* * BTI325 – Assignment 4 
 * * I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
 * * No part of this assignment has been copied manually or electronically from any other source 
 * * (including web sites) or distributed to other students. * 
 * 
 * * Name: Omar Hussein Student ID: 118073204 Date: Nov, 14, 2021  
 *********************************************************************************/
var express  = require('express');
var mongoose = require('mongoose');
var app      = express();
var database = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
 
var port     = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json


mongoose.connect(database.url);

var Book = require('./models/book');

 
 
//get all book data from db
app.get('/api/books', (req, res) => {
	// use mongoose to get all todos in the database
	Book.find((err, books) => {
		// if there is an error retrieving, send the error otherwise send data
		if (err)
			res.send(err)
		res.json(books); // return all books in JSON format
	});
});

// get a book with ID of 1
app.get('/api/books/:book_id', (req, res) => {
	let id = req.params.book_id;
	Book.findById(id, function(err, book) {
		if (err)
			res.send(err)
 
		res.json(book);
	});
 
});


// create book and send back all books after creation
app.post('/api/books', (req, res) => {

    // create mongose method to create a new record into collection
    console.log(req.body);

	Book.create({
		_id : req.body._id,
		title : req.body.title,
		isbn : req.body.isbn,
		pageCount : req.body.pageCount,
		thumbnailUrl : req.body.thumbnailUrl,
		publishedDate : req.body.publishedDate
	}, (err) => {
		if (err)
			res.send(err);
 
		// get and return all the books after newly created book record
		Book.find((err, books) => {
			if (err)
				res.send(err)
			res.json(books);
		});
	});
 
});


// create book and send back all books after creation
app.put('/api/books/:book_id', (req, res) => {
	// create mongose method to update an existing record into collection
    console.log(req.body);

	let id = req.params.book_id;
	var data = {
		_id : req.body._id,
		title : req.body.title,
		isbn : req.body.isbn,
		pageCount : req.body.pageCount,
		thumbnailUrl : req.body.thumbnailUrl,
		publishedDate : req.body.publishedDate
	}

	// save the user
	Book.findByIdAndUpdate(id, data, (err, book) => {
	if (err) throw err;

	res.send('Successful! Book updated - '+ book.title);
	});
});

// delete a employee by id
app.delete('/api/books/:book_id', (req, res) => {
	console.log(req.params.book_id);
	let id = req.params.book_id;
	Book.remove({
		_id : id
	}, (err) => {
		if (err)
			res.send(err);
		else
			res.send('Successful! Book has been Deleted.');	
	});
});

app.listen(port);
console.log("App listening on : http://localhost:" + port);