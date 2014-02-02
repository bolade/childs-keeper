/**
 * Created with IntelliJ IDEA.
 * User: hmbadiwe
 * Date: 1/1/14
 * Time: 1:29 AM
 * To change this template use File | Settings | File Templates.
 */



var childCareApp = angular.module('childCareApp', ['ui.router', 'ngResource', 'mgcrea.ngStrap.modal']);
childCareApp.config( function(  $stateProvider, $urlRouterProvider){
    $stateProvider
        .state( 'home'              , { url : '/home'           , templateUrl : 'views/home.html'})
        .state( 'listing'           , { url : '/listing'           , templateUrl : 'views/listing.html'})
        .state( 'listing.how-we-started'    , { url : '/how-we-started' , templateUrl : 'views/how-we-started.html'})
        .state( 'listing.reviews'           , { url : '/reviews'        , templateUrl : 'views/reviews.html'})
        .state( 'listing.contact'           , { url : '/contact'        , templateUrl : 'views/contact.html'});
    $urlRouterProvider.otherwise('home');

});
childCareApp.factory( 'Listings', function($resource){
    return $resource('/listing/:id');
});
childCareApp.run( function($rootScope){
   $rootScope.loginModal = {
       title : "Login",
       content : "Sample Content"
   };
});




function TestController( $scope ){
    var listing = {
        'home' : {
            include : 'views/panes/home.html'
        }
    };

    $scope.title = "title";

}

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




