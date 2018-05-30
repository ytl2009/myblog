'use strict';
const express = require('express');
const router = express.Router();

const PostModel = require('../models/posts');

const CommentModel = require('../models/comments');

const checkLogin = require('../middlewares/check').checkLogin;

router.get('/',function (req,res,next){
  const author = req.query.author;

  PostModel.getPosts(author)
    .then(function (posts) {
      res.render('posts',{
        posts: posts
      })
    }).catch(next);

});


router.post('/create',checkLogin,function(req,res,next){
  const author = req.session.user._id;
  const title = req.fields.title;
  const content = req.fields.content;

  //verify the params
  try {
    if (!title.length) {
      throw new Error('please input title of article');
    }

    if (!content.length) {
      throw new Error('please input content of article');
    }

  } catch(e) {
    req.flash('error',e.message);
    return res.redirect('back');
  }

  let post = {
    author: author,
    title: title,
    content: content
  };

  PostModel.create(post)
    .then(function (result){

      //insert post value to mongodb include _id
      post = result.ops[0];
      req.flash('success','publish success');
      //publish success to jump article page
      res.redirect(`/posts/${post._id}`);
    }).catch(next);

});


router.get('/create',checkLogin,function(req,res,next){
  res.render('create');
});

//GET /posts/:postId single a article
router.get('/:postId',function(req,res,next){

  const postId = req.params.postId;

  Promise.all([
    PostModel.getPostById(postId),//get article info
    PostModel.incPv(postId)//pv add 1
    ])
      .then(function (result) {
        const post = result[0];
        const comments = result[1];
        if (!post) {
          throw new Error('the article is not exist');
        }

        res.render('post',{
          post: post,
          comments: comments
        })
      }).catch(next);

});


//GET /posts/:postId/edit update article page
router.get('/:postId/edit',checkLogin,function(req,res,next){

  const postId = req.params.postId;
  const author = req.session.user._id;

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('the article is not exist');
      }

      if (author.toString() !== post.author._id.toString()) {
        throw new Error('Authority not enough');
      }

      res.render('edit',{
        post:post
      })
    }).catch(next);

});


//POST /posts/:postId/edit update a article
router.post('/:postId/edit',checkLogin,function(req,res,next){

  const postId = req.params.postId;
  const author = req.session.user._id;
  const title = req.fields.title;
  const content = req.fields.content;


  // verify params

  try {
    if (!title.length) {
      throw new Error('please input the title of article');
    }

    if (!content.length) {
      throw new Error('please input the content of article');
    }
  }catch(e){
    req.flash('error',e.message);
    return res.redirect('back');

  }

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('the article is not exist');
      }

      if (post.author._id.toString() !== author.toString()) {
        throw new Error('No autority');
      }

      PostModel.updatePostById(postId, {title: title,content: content})
        .then(function () {
          req.flash('success','Edit article success');
          //success to prev page
          res.redirect(`/posts/${postId}`);
        }).catch(next);
    })

});


//GET /posts/:postId/remove delet a article
router.get('/:postId/remove',checkLogin,function(req,res,next){
  const postId = req.params.postId;
  const author = req.session.user._id;

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('the article is not exist');
      }

      if (post.author._id.toString() !== author.toString()) {
        throw new Error('No autority');
      }

      PostModel.delPostById(postId)
        .then(function () {
          req.flash('success','Delete article success');

          // success to main page
          res.redirect('/posts');
        }).catch(next)

    })

});

module.exports = router;


