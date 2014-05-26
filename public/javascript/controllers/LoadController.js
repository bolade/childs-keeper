var LoadController = function( $scope, $http ){
    $scope.viewModel = {
          data : {
              upload : 1,
              fileContents : {}
          }
    };
    $scope.submitFile = function(){
        console.log( $scope.viewModel.data );
        $http.post('/load', $scope.viewModel.data )
            .success( function(){

            })
            .error( function(){
                alert( "Something's jacked up!");
            });
    }

}