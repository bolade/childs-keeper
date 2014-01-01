/**
 * Created with IntelliJ IDEA.
 * User: hmbadiwe
 * Date: 1/1/14
 * Time: 1:29 AM
 * To change this template use File | Settings | File Templates.
 */



var childCareApp = angular.module('childCareApp', ['ngRoute']);
childCareApp.config( function(  $routeProvider){
    $routeProvider
        .when('/', { controller : TestController, templateUrl : 'views/panel.html'})
        .when( '/:tab', {controller : TestController, templateUrl : 'views/panel.html'})
        .otherwise({
            redirectTo: '/'
        });

});


function TestController( $scope, $routeParams ){
    $scope.title = "title";
    console.log( "I'm here !");
}



