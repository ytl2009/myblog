
const marked = require('marked');
const Comment = require('../lib/mongo').Comment;


//transform content of comment to html
Comment.plugin('contentToHtml', {
  afterFind: function (comments) {
    return comments.map(function (comment) {
      comment.content = marked(comment.content);
      return comment;
    });
  }
})

module.exports = {

  //create a message
  create: function create(comment) {
    return Comment.create(comment).exec();
  },

  //get a message by Id
  getCommentById: function getCommentById (commentId) {
    return Comment.findOne({ _id: commentId}).exec();
  },

  // delete a message by Id
  delCommentById: function delCommentById (commentId) {
    return Comment.deleteOne({ _id: commentId}).exec();
  },

  // delete all message by Id
  delCommentsByPostId: function delCommentsByPostId (postId) {
    return Comment.deleteMany({ postId: postId }).exec();
  },


  //get all message by Id
  getComments: function getComments(postId) {
    return Comment
      .find({postId: postId})
      .populate({path: 'author', model: 'User'})
      .sort({ _id: -1})
      .addCreateAt()
      .contentToHtml()
      .exec()
  },


  // get count of message by Id
  getCommentsCount: function getCommentsCount (postId) {
    return Comment.count({postId: postId}).exec();
  }

}
