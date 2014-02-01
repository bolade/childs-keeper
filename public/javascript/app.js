/**
 * Created with IntelliJ IDEA.
 * User: hmbadiwe
 * Date: 1/1/14
 * Time: 1:29 AM
 * To change this template use File | Settings | File Templates.
 */



var childCareApp = angular.module('childCareApp', ['ngRoute', 'ngResource', 'mgcrea.ngStrap.modal']);
childCareApp.config( function(  $routeProvider){
    $routeProvider
        .when('/', { controller : TestController, templateUrl : 'views/panel.html'})
        .when('/how-we-started', { templateUrl : 'views/how-we-started.html'})
        .when('/reviews', { templateUrl : 'views/reviews.html'})
        .when('/contact', { templateUrl : 'views/contact.html'})
        .otherwise({
            redirectTo: '/'
        });

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




function TestController( $scope, $routeParams ){
    var listing = {
        'home' : {
            include : 'views/panes/home.html'
        }
    };

    $scope.title = "title";
    $scope.tab = $routeParams.tab || 'home';
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




