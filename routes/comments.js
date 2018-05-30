'use strict';
const express = require('express');

const router = express.Router();

const checkLogin = require('../middlewares/check').checkLogin;
const CommentModel = require('../models/comments');


//POST /comments create a msg
router.post('/',checkLogin,function(req,res,next){

  const author = req.session.user._id;
  const postId = req.fields.postId;
  const content = req.fields.content;

  //verify params
  try {

    if (!content.length) {
      throw new Error('please input the content');
    }
  } catch(e) {
    req.flash('error',e.message);
    return res.redirect('back');
  }

  const comment = {
    author: author,
    postId: postId,
    content: content
  }

  CommentModel.create(comment)
    .then(function() {
      req.flash('success','leave message success');
      // success to prev page
      res.redirect('back');
    }).catch(next)

});


//GET /comments/:commentId/remove delete a msg
router.get('/:commentId/remove',checkLogin,function(req,res,next){

  const commentId = req.params.commentId;
  const author = req.session.user._id;

  CommentModel.getCommentById(commentId)
    .then(function (comment) {
      if (!comment) {
        throw new Error('Leave msg is not exist');
      }

      if (comment.author.toString() !== author.toString()) {
        throw new Error('No authority delete msg');
      }

      CommentModel.delCommentById(commentId)
        .then(function (){
          req.flash('success','delete msg success');
          //delete msg success to prev page
          res.redirect('back');
        }).catch(next)

    })

});

module.exports = router;
