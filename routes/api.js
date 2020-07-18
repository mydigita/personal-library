/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
const shortid = require("shortid");

module.exports = function (app, db) {

  const bookBase = db.db("test").collection("library");

  app.route('/api/books')
    .get(function (req, res){
       bookBase.find().toArray((err, data)=>{
       res.json(data);
   });
   
    })
    
    .post(function (req, res){
      var title = req.body.title;
      const comments = [];
      const commentcount = 0;
      const _id = shortid.generate();
     if(title){
     bookBase.insertOne({_id:_id, title:title, comments:comments, commentcount:commentcount}, (err, data)=>{
     res.json({_id, title,commentcount});
   })} else{
       res.json({error:"no title given"})
     };
  
    
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'    
      bookBase.deleteMany({}, (err, data)=>{
      if(data.deletedCount>0){
        res.json({success: "complete delete successful"})
      }
    });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
    
       bookBase.find({_id:bookid}).toArray((err, data)=>{
       if(data.length == 0){
         res.json({error: "no book exist"});
       }else{
         res.json(data);
       }
   });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
     if(comment && comment.match(/[A-Za-z]/)){
      bookBase.findOneAndUpdate({_id:bookid}, {$push:{comments:comment}, $inc:{commentcount:1}}, ()=>{
      bookBase.findOne({_id:bookid},(err, data)=>{
      if(data===null){
        res.json({error:"ID not exist"})
      }else{
        res.json(data)
      }
      })
    })}else{
        res.json({error:"invalid comment"})
      }
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
        if(bookid){
        bookBase.deleteOne({_id:bookid}, (err, data)=>{
        if(data.deletedCount===1){
          //console.log("delete successful")
          res.json({success:"delete successful"})
        }
      })};
      
    
    
    });
  
};