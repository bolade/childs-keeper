
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
var mongoPostal = require('mongo-postal');

var XLSX  = require('xlsx');
var fs = require('fs');

var mongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var localStrategy = require('passport-local').Strategy;

var collectionName = 'child-care-centers';
var MAX_LISTINGS = 100;

var mongoUrl = 'mongodb://127.0.0.1:27017/child-keeper';

var app = express();
var csv = require('fast-csv');

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


function initializeCollection(collectionName, collections, db, fn){
    var collectionNames = _(collections).map(function(collection){
        return collection.collectionName;
    });
    if( !_(collectionNames).contains( collectionName ) ){
        if( fn ){
            db.createCollection(collectionName, fn );
        }
        else{
            db.createCollection(collectionName );
        }

    }
    else{
        if( (typeof fn) == "function" ){
            fn( undefined, db.collection(collectionName));
        }
    }
}


function initializeDatabase(){
    mongoClient.connect( mongoUrl, function(err,db){
        db.collections( function( err, collections ){
           if( err ) throw err;
           initializeCollection( "child-care-centers", collections, db, function(err, collection){
               if( err ) throw err;
               initializeCollection( "users", collections, db, function(err, collection){
                   if( err )throw err;
                   console.log( "Users collection added");
                   initializeCollection( "postal_codes", collections, db, function( err, collection ){
                       if( err ) throw err;
                       console.log( "Initializing postal codes");
                       initializeZipcodes( collection );
                   })
               } );
           })
        });
    });
}

function initializeZipcodes(collection){
    console.log( "Collection...");
    collection.ensureIndex( { zipcode: 1 }, function( err, indexName ){
        console.log( "Index " + indexName + " created");
    } );
    console.log("Ensuring 2d geospatial index on loc");
    collection.ensureIndex( { loc: "2d" }, { w: 1}, function( err, indexName ){
        console.log( "Index " + indexName + " created");
    } );
    collection.count( function( err, count){
        if( err )throw err;
        if( count == 0  ){
            //something weird
            console.log( "Database empty. Loading...");
            var stream = fs.createReadStream( 'data/us-zipcodes/US.txt');
            csv.fromStream( stream,
                {
                    headers :
                        [ 'country_code', 'postal_code', 'place_name',
                            'admin_name1', 'admin_code1',
                            'admin_name2',
                            'admin_code2',
                            'admin_name3',
                            'admin_code3',
                            'latitude',
                            'longitude',
                            'accuracy'
                        ],
                    delimiter : '\t'

                } )
                .transform( function( data ){
                    return {
                        country : data.country_code,
                        zipcode : data.postal_code,
                        city : data.place_name,
                        state_long : data.admin_name1,
                        state_short : data.admin_code1,
                        // Convert the provided longitude and latitude properties into a mono loc object
                        // (http://www.mongodb.org/display/DOCS/Geospatial+Indexing)
                        loc : [
                            parseFloat(data.longitude),
                            parseFloat(data.latitude)
                        ]
                    };
                })
                .on( "record", function(data){
                    collection.insert( data, { w : 1}, function( err, record ){
                        if( err ) throw err;
                        console.log( "Loaded record: " + JSON.stringify( record ));
                    })
                })
                .on( "end", function(){
                    console.log( "Completed");
                })

        }
    });





}


function findById(id, fn) {
    mongoClient.connect( mongoUrl, function(err,db){
        var collection = db.collection( collectionName );
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
        var collection = db.collection( "users");
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

function parseBinarySpreadSheet( fileContents ){
    function cellRawText(cell){
        if( cell ){
            return String(cell.v);
        }
        else{
            return '';
        }
    }
    var recordList = undefined;
    if( fileContents && fileContents.contents ){
        var contentsArray = fileContents.contents.split(',');
        var buffer = new Buffer(contentsArray[1], 'base64');
        var obj = XLSX.read( buffer );
        var workbook =  obj.Sheets[obj.SheetNames[0]] ;
        var index = 2;
        recordList = [];
        do{
            var record = {};
            record.name  = cellRawText( workbook[ 'A' + index ] );
            record.address = cellRawText( workbook[ 'B' + index ] );
            record.city = cellRawText( workbook[ 'C' + index ] );
            record.state = cellRawText( workbook[ 'D' + index ] );
            record.zipCode = cellRawText( workbook[ 'E' + index ] );
            record.phone = cellRawText( workbook[ 'F' + index ] );
            record.webSite = cellRawText( workbook[ 'G' + index ] );
            recordList.push( record );
            index += 1;
        }while(workbook['A' + index]);
    }
    return recordList;
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

app.post('/users', function( req, res){
   var data = req.body;

    mongoClient.connect( mongoUrl, function( err, db ){
       var collection = db.collection( "users" );
        collection.findOne( {userName : data.userName}, function( err, doc){
           if( err ) throw err;
           if( doc ){
               res.send( 403, "User already exists");
           }
           else{
              data.createDate = new Date();
              collection.insert( data, function(err){
                  if(err) throw err;
                  res.send( 200, "User saved.");

              } );
           }
        });

    });
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

//app.get('/users', user.list);
app.get('/listing', function(req, res){
    mongoClient.connect( mongoUrl, function( err, db ){
        var collection = db.collection( "child-care-centers" );
        var limit = Number(req.query.limit  || MAX_LISTINGS );
        collection.find().limit(limit).toArray( function(err, results){
            if( err ){
                res.status( 403 ).send( "Error establishing connection" );
            }
            else{
                res.status( 200 ).json(results) ;
            }
        });

    });
});
app.post('/load', function( req, res ){
    var parsedSpreadSheet = parseBinarySpreadSheet(req.body.fileContents );
    if( parsedSpreadSheet ){
        mongoClient.connect( mongoUrl, function( err, db ){
            var upload = Number( req.body.upload );
            if( upload ){
                 db.dropCollection( "child-care-centers", function( err, result){
                     if( err ) throw err;
                     db.createCollection("child-care-centers", function( err, collection ){
                         if( err ) throw err;
                         collection.insert( parsedSpreadSheet, function( err, result){
                             if( err )throw err;
                         } );
                     })
                 });
            }
            else{
                var collection = db.collection("child-care-centers");
                collection.insert( parsedSpreadSheet, function( err, result){
                    if( err )throw err;
                });

            }
            res.send( 200, parsedSpreadSheet );

        });
    }
    else{
        res.send( 406, "Error parsing data");
    }

});
app.get('/search', function( req, res ){
   var term = req.query.term;

    mongoClient.connect( mongoUrl, function( err, db ){
        var collection = db.collection( "child-care-centers" );
        if( term ){
            var regex = new RegExp( term, 'i' );
            collection.find( {name : regex}).limit(MAX_LISTINGS).toArray( function( err, results){
                if( err ){
                    res.status( 403 ).send( "Error establishing connection" );
                }
                else{
                    res.status( 200 ).json(results) ;
                }
            });

        }
        else{
            collection.find().limit(MAX_LISTINGS).toArray( function(err, results){
                if( err ){
                    res.status( 403 ).send( "Error establishing connection" );
                }
                else{
                    res.status( 200 ).json(results) ;
                }
            });
        }

    });

});

app.get( '/reviews/:reviewId', function( req, res ){

    mongoClient.connect( mongoUrl, function( err, db ){
        var collection = db.collection( "child-care-centers" );
        console.log( "Review id : " + req.params.reviewId );
        collection.findOne( { _id : ObjectID( req.params.reviewId )}, function( err, data){
            if( err )throw err;
            console.log( data );
            res.send( 200, data )
        } );
    } );
});
app.post( '/reviews/:reviewId', function( req, res ){

    mongoClient.connect( mongoUrl, function( err, db ){
        var collection = db.collection( "child-care-centers" );
        console.log( "Review id : " + req.params.reviewId );
        var review = {
            comments : req.body.comments,
            review : req.body.review
        };

        collection.update(
            { _id : ObjectID( req.params.reviewId) },
            { $push : { reviews : { $each : [ review ] } } },
            function( err, add ){
                if( err ) res.send( 401, "Error saving review");
                console.log( "Saved review : " + JSON.stringify( review ));
                res.send( 200, "Review Saved!" );
            }
        )
    } );
});

app.get( '/postal-search', function( req, res ){
    var zipcode = req.query[ 'zip-code'];
    if( zipcode ){
        mongoClient.connect( mongoUrl, function( err, db ){
            var postalCollection = db.collection( "postal_codes" );
            var childCareCenters = db.collection( "child-care-centers");
            var params = {
                dbCollection : postalCollection,
                zipcode : zipcode,
                radiusMiles : req.query.radius || 10
            };
            mongoPostal.findPostals( params, function(err, postals){
                if( err ) throw err;
                if( postals.length > 0 ){
                    var zipcodes = _(postals).map( function(postal){
                        return postal.zipcode;
                    });
                    console.log( "zip codes : ");
                    console.log( zipcodes );
                    childCareCenters.find( { zipCode : { "$in" : zipcodes  } }).toArray( function( err, results){
                        if( err ) throw err;
                        res.send( 200, results );
                    });
                }
                else{
                    res.send( 200, [] );
                }

            })
        });

    }
    else{
        res.send( 401, 'Invalid request');
    }
});

initializeDatabase();

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
