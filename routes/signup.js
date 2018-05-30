'use strict';
const fs = require('fs');
const path = require('path');
const sha1 = require('sha1');

const express = require('express');

const router = express.Router();

const UserModel = require('../models/users');

const checkNotLogin = require('../middlewares/check').checkNotLogin;

//GET /signup
router.get('/',checkNotLogin,function(req,res,next){
  res.render('signup')
});

//POST /signup user sign
router.post('/',checkNotLogin,function(req,res,next){
  console.log("the signup page of post method:");

  const name = req.fields.name;
  const gender = req.fields.gender;
  const bio = req.fields.bio;
  const avatar = req.files.avatar.path.split(path.sep).pop();
  let password = req.fields.password;
  const confirmpassword = req.fields.confirmpassword;
  console.log("the gender is :" +gender);

  //verified parms
  try{
    console.log("enter the try catch method");
    if (!(name.length >= 1 && name.length <=10)) {
      throw new Error('please input 1-10 character of name');
    }
    console.log("verified name");
    if (['m','f','x'].indexOf(gender)=== -1) {
      throw new Error('the gender is only m or f or x');
    }
    console.log("verified gender");
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('the character of personal profile is limit 1-30');
    }

console.log("verified bio");
    if (!req.files.avatar.name) {
      throw new Error('no avatar');
    }
    console.log("verified avatar");
    if (password.length< 6) {
      throw new Error('the password must six and more character');
    }
    console.log("verified password");
    if (password !== confirmpassword) {
      throw new Error('you input password is not same');
    }
    console.log("finish the try catch method");

  } catch (e) {
    console.log("enter the try catch method and catch exception");

    //sign in failed, async delete avatar
    fs.unlink(req.files.avatar.path);
    req.flash('error',e.messages);
    return res.redirect('/signup');
  }

  //scrypt the password

  password = sha1(password);


  let user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  };

  console.log("user info :"+ user.name + ": " + user.bio +": " + user.avatar);

  //user write info to db
  UserModel.create(user)
    .then(function(result){
      //the user is value of insert mongodb,include '_id'
      user = result.ops[0];
      //delete password info and will user info write to session
      delete user.password;
      req.session.user = user;
      // write to flash
      req.flash('succes','sign in success');
      // jump to main page
      res.redirect('/posts');
    }).catch(function(e){
      //sign in failed and delete avatar by async
      fs.unlink(req.files.avatar.path);
      //user name have used and jump to sign in page not to error page
      if (e.message.match('duplicate key')) {
        req.flash('error','user name have used');
        return res.redirect('/signup');
      }
      next(e);
    })


  //res.send('sign');
});


module.exports = router
