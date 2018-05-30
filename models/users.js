'use strict';
const User = require('../lib/mongo').User;

module.exports = {
  // sign in a user
  create: function create (user) {
    console.log("enter the User create method");

    return User.create(user).exec();
  },

  // get user info by user name
  getUserByName: function getUserByName(name) {
    return User.findOne({name: name})
      .addCreateAt()
      .exec();
  }
};
