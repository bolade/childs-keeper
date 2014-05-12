var ContactController = function( $scope ){
    $scope.viewModel = {};


    $scope.reset = function(){
        console.log("resetting...");
        $scope.viewModel = {};
    }
}