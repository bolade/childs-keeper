
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var mongoClient = require('mongodb').MongoClient;

var collection = undefined;
var MAX_LISTINGS = 100;
mongoClient.connect('mongodb://127.0.0.1:27017/child-keeper', function(err, db){
    if( err ){
        throw err;
    }
    else{
        collection = db.collection( "child-care-centers")
    }
});


var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

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
