
const Post = require('../lib/mongo').Post;

const CommentModel = require('./comments');


const marked = require('marked');

//add count of message for post page
Post.plugin('addCommentsCount',{
  afterFind: function (posts) {
    return Promise.all(posts.map(function (post){
      return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
        post.commentsCount = commentsCount;
        return post;
      });
    }));
  },


  afterFindOne: function (post) {
    if (post) {
      return CommentModel.getCommentsCount(post._id).then(function (count) {
        post.commentsCount = count;
        return post;
      });
    }
    return post;
  }

})


//transformed the content of post to html
Post.plugin('contentToHtml',{
  afterFind: function (posts) {
    return posts.map(function (post){
      post.content = marked(post.content);
      return post;
    })
  },

  afterFindOne: function (post) {
    if (post) {
      post.content = marked(post.content);

    }
    return post;
  }


})

module.exports = {
  // create a article
  create: function create (post) {
    return Post.create(post).exec();
  },

  //get article by id
  getPostById: function getPostById (postId) {
    return Post.findOne({_id: postId})
      .populate({path: 'author', model: 'User'})
      .addCreateAt()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  //list of article
  getPosts: function getPosts (author){
    const query = {};
    if (author) {
      query.author = author;
    }

    return Post.find(query)
      .populate({path: 'author',model: 'User'})
      .sort({_id:-1})
      .addCreateAt()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },


  // add pv by article id
  incPv: function incPv (postId) {
    return Post.update({_id: postId},{$inc:{pv: 1}})
    .exec();
  },

  //get article by id
  getRawPostById: function getRawPostById (postId) {
    return Post.findOne({ _id: postId})
      .populate({ path: 'author', model: 'User'})
      .exec();
  },

  // update a article by Id
  updatePostById: function updatePostById (postId,data) {
    return Post.update({_id: postId},{$set: data}).exec();
  },


  //delete a article by article Id and user id
  delPostById: function delPostById (postId,author) {
    return Post.deleteOne({_id: postId,author: author})
    .exec()
    .then(function (res) {
      // first delete article and then delete all message
      if (res.result.ok && res.result.n >0) {
        return CommentModel.delCommentsByPostId(postId);
      }

    });
  }

}
