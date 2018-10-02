/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

require('dotenv').config();

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const CONNECTION_STRING = process.env.DB;
var mongoose = require('mongoose');
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

mongoose.connect(CONNECTION_STRING);

var bookSchema = new mongoose.Schema({
  title: String, 
  comments: []
});

var Book = mongoose.model('Book', bookSchema);

  app.route('/api/books')
    .get(function (req, res){
      Book.find({}, (err, docs) => {
        if (err) { res.json(err) } 
        else { 
          let result = [];
          docs.forEach((element) => {
            let item = {}; 
            item._id = element._id; 
            item.title = element.title;
            item.commentcount = element.comments.length; 
            result.push(item); 
          })
          res.json(result);
         };
      })
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    //ME: have to check if book already exists before saving
    .post(function (req, res) {
      var title = req.body.title;
      if (title == '') { res.json('no title entered') }
      else {
        let newBook = new Book({
          title: title
        })
        newBook.save((err, doc) => {
          if (err) { res.json(err) }
          else { res.json({ _id: doc.id, title: doc.title }) };
        })
      }
    })
    
    .delete(function(req, res){
      Book.deleteMany({}, (err) => {
        if (err) { res.json(err) } 
        else { res.json('complete delete successful') };
      })
    });


  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      Book.findById({_id: bookid}, (err, doc) => {
        if (err) { res.json('no book exists') } 
        else { res.json({'_id': doc._id, 'title': doc.title, 'comments': doc.comments}) }
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      Book.findOneAndUpdate({ _id: bookid }, {$push: {comments: comment}}, 
        {new: true}, (err, doc) => {
        if (err) { res.json('no book exists') }
        else { res.json({"_id": bookid, 'title': doc.title, 
        'comments': doc.comments}) }
      })
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      Book.findByIdAndRemove({_id: bookid}, (err, doc) => {
        if (err) { res.json('no book exists') } 
        else { res.json('delete successful') };
      })
      //if successful response will be 'delete successful'
    });
  
};
