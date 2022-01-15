var mongoose = require('mongoose');
var Schema = mongoose.Schema;
BookSchema = new Schema({
    _id : Number,
    title : String,
	isbn : String,
    pageCount : Number,
    thumbnailUrl : String,
    publishedDate : String
});
module.exports = mongoose.model('Book', BookSchema);
