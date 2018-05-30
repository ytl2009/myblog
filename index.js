'use strict';

const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const flash = require('connect-flash');
const config = require('config-lite')(__dirname);
const routes = require('./routes');
const pkg = require('./package');
const winston = require('winston');
const expressWinston = require('express-winston');
const engines = require('consolidate');

const app = express();

app.set('views',path.join(__dirname,'views'));
app.engine('ejs',engines.ejs);

app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

app.use(session({
  name: config.session.key,
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: config.session.maxAge
  },
  store: new MongoStore({
    url: config.mongodb
  })
}));


app.use(flash());

//handle form and upload file middware
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname,'public/img'),
  keepExtensions: true
}));

//set global var model ejs
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

//add neccesary var of model
app.use(function(req,res,next){
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});

//output normal log
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}))


routes(app);


//output error log
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}))

app.use(function (err, req,res, next) {
  console.error(err);
  req.flash('error',err.message);
  res.redirect('/posts');
})


app.listen(config.port,function(){
  console.log(`${pkg.name} listen on port ${config.port}`);
});

