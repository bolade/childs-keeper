/**
 * Created with IntelliJ IDEA.
 * User: hmbadiwe
 * Date: 1/1/14
 * Time: 1:29 AM
 * To change this template use File | Settings | File Templates.
 */



var childCareApp = angular.module('childCareApp', ['ui.router', 'ngSanitize', 'ngResource', 'ngCookies',  'ui.bootstrap', 'ui.select2', 'angularSpinner', 'mgcrea.ngStrap']);
childCareApp.constant( 'minimumActivityTime', 900000 );
childCareApp.config( function(  $stateProvider, $urlRouterProvider){
    $stateProvider
        .state( 'home'                      , { url : '/home'               , templateUrl : 'views/home.html'       , controller : HomeController } )
        .state( 'listing'                   , { url : '/listing'            , templateUrl : 'views/listing.html'})
        .state( 'listing.how-we-started'    , { url : '/how-we-started'     , templateUrl : 'views/how-we-started.html'})
        .state( 'listing.reviews'           , { url : '/reviews'            , templateUrl : 'views/reviews.html', controller : ReviewController})
        .state( 'listing.contact'           , { url : '/contact'            , templateUrl : 'views/contact.html'    , controller : ContactController })
        .state( 'join'                      , { url : '/join'               , templateUrl : '/views/join.html'      , controller : JoinController } )
        .state( 'load'                      , { url : '/load'               , templateUrl : '/views/load-sites.html'      , controller : LoadController } )
        .state( 'login'                     , { url : '/login'              , templateUrl : 'views/login.html'      , controller : LoginController } )
        .state( 'review'                    , { url : '/reviews/:reviewId'             , templateUrl : '/views/edit-review.html'    , controller : WriteReviewController });
    $urlRouterProvider.otherwise('home');

});
childCareApp.factory( 'Listings', function($resource){
    return $resource('/listing/:id');
});
childCareApp.run( function($rootScope, $cookieStore, $sce, minimumActivityTime ){
   $rootScope.loginModal = {
       title : "Login",
       content : "Sample Content"
   };


    $rootScope.viewModel = {
        navState : {
            home : { 'active' : true}
        }
    };
    var recaptchaPublicKey =  '6LcsAvkSAAAAANJh4HGPYuTmEcUbRADFjrt8i8vo';
    $rootScope.recaptcha = {

        noScriptUrl : $sce.trustAsResourceUrl( 'http://www.google.com/recaptcha/api/noscript?k=' + recaptchaPublicKey ),
        challengeUrl : $sce.trustAsResourceUrl('http://www.google.com/recaptcha/api/challenge?k=' + recaptchaPublicKey )

};


    $rootScope.validUser = undefined;
    $rootScope.validateUser = function(){
        var validUser = $cookieStore.get( 'validUser');
        if( validUser && validUser.loginDate ){
            if( moment().diff( moment(validUser.loginDate)) > minimumActivityTime ){
                $cookieStore.put('validUser', undefined);
                validUser = undefined;
                $cookieStore.put( 'validUser', undefined);
            }
            else{
                validUser.loginDate = new Date();
            }
        }
        else{
            $cookieStore.put( 'validUser', undefined);
        }

        $rootScope.validUser =  validUser;
    };
    $rootScope.validateUser();

    $rootScope.$on('$stateChangeSuccess', function(event, toState){
        $rootScope.viewModel.navState = {};
        $rootScope.viewModel.navState[toState.name] = { 'active' : true };
        $rootScope.validateUser();

    });

    /*$rootScope.validUser = function(){
        var validUser = $cookieStore.get( 'validUser');
        if( validUser && validUser.loginDate ){
              if( moment().diff( moment(validUser.loginDate)) > minimumActivityTime ){
                  validUser = undefined;
              }
        }
        else{
             $cookieStore.put( 'validUser', undefined);
        }
         return validUser;
    };*/


});


childCareApp.controller( 'ListingsController', function($scope, Listings){
        $scope.listings = [];
        Listings.query(
            {
                limit:10
            },
            function(results){
                $scope.listings =results ;
            },
            function(error){
                console.log( error.data);
            }
        );
    }
);




