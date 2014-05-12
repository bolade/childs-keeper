
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport =require('passport');
var flash = require('connect-flash');
var _ = require('underscore');

var mongoClient = require('mongodb').MongoClient;
var localStrategy = require('passport-local').Strategy;

var collection = undefined;
var MAX_LISTINGS = 100;

var mongoUrl = 'mongodb://127.0.0.1:27017/child-keeper';
mongoClient.connect( mongoUrl, function(err, db){
    if( err ){
        throw err;
    }
    else{
        collection = db.collection( "child-care-centers")
    }
});


var app = express();

// all environments
app.set('port', process.env.PORT || 9000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


function findById(id, fn) {
    mongoClient.connect( mongoUrl, function(err,db){
        collection = db.collection( "child-care-centers");
        collection.findOne( {"_id" : id}, function( err, user){
            if( err ){
                fn(err, null);
            }
            else{
                fn( null, user );
            }
        });
    });
}

function findByUserName(userName, fn) {
    console.log( "find by user name mongo");
    mongoClient.connect( mongoUrl, function(err,db){
        collection = db.collection( "users");
        collection.findOne( {"userName" : userName}, function( err, user){
            console.log( "handling user query : ");
             if( err ){
                 fn(err, null);
             }
             else{
                 fn( null, user );
             }
        });
    });
}
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
});
passport.use( new localStrategy(
    {
        usernameField : 'userName',
        passwordField : 'password'
    },
    function( userName, password, done ){
        process.nextTick( function(){

            findByUserName(userName, function( err, user ){
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown user ' + userName }); }
                if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
                console.log( "user...");
                console.log(user);
                return done(null, user);
            })
        });
    }
));

/*app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });*/

app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            return res.send(401, "Error authenticating user");
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            var respData = _(user).omit('password');
            respData.loginDate = new Date();
            return res.send( 200, respData );
        });
    })(req, res, next);
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

//app.get('/users', user.list);
app.get('/listing', function(req, res){
    if( collection ){
        var limit = Number(req.query.limit  || MAX_LISTINGS );
        collection.find().limit(limit).toArray( function(err, results){
            if( err ){
                res.status( 403 ).send( "Error establishing connection" );
            }
            else{
                res.status( 200 ).json(results) ;
            }
        });

    }
    else{
        res.status( 403 ).send( "Error establishing connection" );
    }
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
