var JoinController = function( $scope, $http, $state  ){
    $scope.viewModel = {
        data : {

        },
        display : {
            saving : false,
            passwordWarning : false

        }
    };

    $scope.invalidPasswordState = function(){
        var password = $scope.viewModel.data.password || '';
        return ( password.length > 0 && $scope.signUpForm.confirmPassword.$invalid);
    }
    $scope.reset = function(){
      $scope.viewModel.data = {};
    };

    $scope.submit = function(){
       $scope.viewModel.display.error = undefined;
       $scope.viewModel.display.saving = false;
       var submitModel = _( $scope.viewModel.data).omit( 'confirmPassword');
       $http.post('/users', submitModel)
           .success( function(){
                console.log( "Saved....");
                $state.go( 'login' );
           })
           .error( function(error){
               $scope.viewModel.display.error = error;
           })
    }


}