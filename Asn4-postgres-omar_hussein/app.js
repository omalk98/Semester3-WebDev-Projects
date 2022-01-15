/********************************************************************************* * BTI325 – Assignment 4 
 * * I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
 * * No part of this assignment has been copied manually or electronically from any other source 
 * * (including web sites) or distributed to other students. * 
 * 
 * * Name: Omar Hussein Student ID: 118073204 Date: Nov, 13, 2021  
 *********************************************************************************/
var http = require("http");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// Connect to a PostgreSQL --- Load the PG module
const {Client} = require('pg')

//Create a CLIENT object to connect ot PostgreSQL DB in Heroku
const connection = new Client({
  host:'ec2-35-169-204-98.compute-1.amazonaws.com',
  user:'oemwllezldfnoq',
  port:'5432',
  password:'9b7f2fdf5b80ea16217d16574147d44d7742fef6efa6c8067b5ed885ade8af36',
  database:'d477m4q1p2hjl7',
  ssl:{rejectUnauthorized:false}
})
 
connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected to PostgreSQL DB in Heroku...')
})

 
//start body-parser configuration
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
//end body-parser configuration
 
//create app server
var server = app.listen(3000,  "127.0.0.1", function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("Example app listening at http://%s:%s", host, port)
 
});
 
//rest api to get all results
app.get('/employees', function (req, res) {
   connection.query('select * from emp.employee', function (error, results, fields) {
	  if (error) throw error;
	  res.end(JSON.stringify(results.rows));
	});
});
 
//rest api to get a single employee data
app.get('/employees/:id', function (req, res) {
   console.log(req);
   connection.query('select * from emp.employee where id=$1', [req.params.id], function (error, results, fields) {
	  if (error) throw error;
	  res.end(JSON.stringify(results.rows));
	});
});
 
//rest api to create a new record into mysql database
app.post('/employees', function (req, res) {
   
   console.log(req.body);
   connection.query('INSERT INTO emp.employee (id, employee_name, employee_salary, employee_age) values ($1, $2, $3, $4)', [req.body.id,req.body.employee_name,req.body.employee_salary, req.body.employee_age], function (error, results, fields) {
	  if (error) throw error;
	  res.end(JSON.stringify(results));
	});
});
 
//rest api to update record into mysql database
app.put('/employees', function (req, res) {
  console.log(req.body);
   connection.query('UPDATE emp.employee SET employee_name=$1,employee_salary=$2,employee_age=$3 where id=$4', [req.body.employee_name,req.body.employee_salary, req.body.employee_age, req.body.id], function (error, results, fields) {
	  if (error) throw error;
	  res.end(JSON.stringify(results));
	});
});
 
//rest api to delete record from mysql database
app.delete('/employees', function (req, res) {
   console.log(req.body);
   connection.query('DELETE FROM emp.employee WHERE id=$1', [req.body.id], function (error, results, fields) {
	  if (error) throw error;
	  res.end('Record has been deleted!');
	});
});