var LoginController = function($scope, $http, $cookieStore, $state ){
    $scope.viewModel = {};
    $scope.login = function(){
        console.log("logging in...");
        $http.post( '/login', $scope.viewModel )
            .success(
                function( successResp){
                    $cookieStore.put('validUser', successResp );
                    $state.go( 'home');

                }
        )
            .error( function( errorResp ){
               console.log( "Error logging in ...");
               console.log( errorResp );
            });
    }

}