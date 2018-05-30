module.exports = {
  checkLogin: function checkLogin (req,res,next) {
    if (!req.session.user) {
      req.flash('error','No Login');
      return res.redirect('/signin');
    }
    next();
  },


  checkNotLogin: function checkNotLogin(req,res,next){
    if (req.session.user) {
      req.flash('error','Have Login');
      return res.redirect('back');
    }
    next();
  }
}
