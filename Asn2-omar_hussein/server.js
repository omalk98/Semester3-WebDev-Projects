/********************************************************************************* * BTI325 – Assignment 2 
 * * I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
 * * No part of this assignment has been copied manually or electronically from any other source 
 * * (including web sites) or distributed to other students. * 
 * 
 * * Name: Omar Hussein Student ID: 118073204 Date: Oct, 13, 2021  
 *********************************************************************************/
const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const app = express();
const PORT =  process.env.PORT || 5500;
var JSONdata;



app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "/views/index.html"));
});
app.get("/data", (req, res) => {
    JSONdata = JSON.parse(fs.readFileSync(path.join(__dirname, "/data/mydata.json")));
    res.status(201).send("<div style=\"text-align: center; font-size: 25pt; color: red;\"><u>JSON data is loaded and ready!</u></div>");
    console.log(JSONdata);
});

app.get("/data/isbn/:index_no", (req, res) => {
    if (JSONdata) {
            res.status(200).send(`<div style=\"text-align: center; font-size: 25pt; color: blue; border: solid black 2px; width: 20%; margin-left: auto; margin-right: auto; background-color: grey;\"><u>Book ISBN:</u> ${JSONdata[req.params.index_no].isbn}</div>`);
    }
    else res.status(404).send("Error 404: data not ready");
});

app.get("/data/search/isbn", (req, res) => {
    res.status(200).send(`<form method="POST" action="/data/search/isbn" enctype="multipart/form-data">
    <input type="text" name="isbn" placeholder="Enter ISBN">
    <input type="submit" value="Search">
    </form>`);
});
app.post("/data/search/isbn", multer().none(), (req, res) => {
    if (JSONdata) {
        let reqBook;
        for (book of JSONdata){
            if (book.isbn == req.body.isbn) {
                reqBook = book;
                break;
            }
        }
        if (reqBook) {
            res.status(200).send(`<table style="width: 90%; border: solid black 2px; margin-left: auto; margin-right: auto;"> <tr><td>ID</td><td>Title</td><td>Authros</td><td>Publish Date</td><td>Thumbnail</td><td>ISBN</td></tr>
            <tr><td>${reqBook._id || reqBook._id.$oid}</td><td>${reqBook.title}</td><td>${JSON.stringify(reqBook.authors)}</td><td>${(reqBook.publishedDate) ? reqBook.publishedDate.$date.substr(0, 10) : undefined}</td><td><img src="${reqBook.thumbnailUrl}" alt="thumbnail"></td><td>${reqBook.isbn}</td></tr>`);
        }
        else res.status(404).send("Error 404: book not found");
    }
    else res.status(404).send("Error 404: data not ready");
});

app.get("/data/search/title", (req, res) => {
    res.status(200).send(`<form method="POST" action="/data/search/title" enctype="multipart/form-data">
    <input type="text" name="title" placeholder="Enter Title">
    <input type="submit" value="Search">
    </form>`);
});
app.post("/data/search/title", multer().none(), (req, res) => {
    if (JSONdata) {
        let reqBook = [], i = 0;
        for (book of JSONdata){
            if (book.title.includes(req.body.title)) {
                reqBook[i++] = book;
            }
        }
        if (reqBook) {
            let table = `<table style="width: 90%; border: solid black 2px; margin-left: auto; margin-right: auto;"> <tr><td>ID</td><td>Title</td><td>Authros</td><td>Page Count</td><td>Thumbnail</td><td>ISBN</td></tr>`;
            i = 0;
            for (book of reqBook) {
                let row = `<tr><td>${reqBook[i]._id || reqBook[i]._id.$oid}</td><td>${reqBook[i].title}</td><td>${JSON.stringify(reqBook[i].authors)}</td><td>${reqBook[i].pageCount}</td><td><img src="${reqBook[i].thumbnailUrl}" alt="thumbnail"></td><td>${reqBook[i++].isbn}</td></tr>`;
                table += row;
            }
            res.status(200).send(table);
        }
        else res.status(404).send("Error 404: book not found");
    }
    else res.status(404).send("Error 404: data not ready");
});

app.get("*", (req,res) =>{
    res.status(404).send("Error 404: page not found");
});

app.listen(PORT, () => {console.log(`App listening at http://localhost:${PORT}`);});