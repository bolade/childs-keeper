var JoinController = function( $scope, $http, $state  ){
    $scope.viewModel = {
        data : {

        },
        display : {
            saving : false
        }
    };
    $scope.reset = function(){
      $scope.viewModel.data = {};
    };
    $scope.submit = function(){
       $scope.viewModel.display.saving = false;
       var submitModel = _( $scope.viewModel.data).omit( 'confirmPassword');
       $http.post('/users', submitModel)
           .success( function(){
                console.log( "Saved....");
                $state.go( 'login' );

           })
    }

}