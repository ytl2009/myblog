'use strict';

const sha1 = require('sha1');
const express = require('express');

const router = express.Router();

const Usermodel = require('../models/users');

const checkNotLogin = require('../middlewares/check').checkNotLogin;


//GET /signin page
router.get('/',checkNotLogin,function(req,res,next){
  res.render('signin');
});

//POST /signin page
router.post('/',checkNotLogin,function(req,res,next){
  const name = req.fields.name;
  const password = req.fields.password;

  //verified params
  try {
    if (!name.length) {
      throw new Error('please input user name');
    }

    if (!password.length) {
      throw new Error('please input user password');
    }

  } catch (e) {
    req.flash('error',e.message);
    return res.redirect('back');
  }

  Usermodel.getUserByName(name)
    .then(function (user){
      if (!user) {
        req.flash('error','user is not exist');
        return res.redirect('back');
      }

      //verified password is or not
      if (sha1(password) != user.password) {
        req.flash('error','user name or password fault');
        return res.redirect('back');
      }

      req.flash('success','Log in success');

      //user info write to session
      delete user.password;
      req.session.user = user;

      //jump to main page
      res.redirect('/posts');

    }).catch(next);

});


module.exports = router;

