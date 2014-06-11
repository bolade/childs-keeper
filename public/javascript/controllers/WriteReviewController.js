function WriteReviewController( $scope, $http, $stateParams, reviewService ){
    console.log( $stateParams );
    $scope.center = {};

    reviewService.get( $stateParams)
        .$promise
        .then(
            function( resp ){
                 $scope.center = resp;
            }
    );
    $scope.submitReview = function(){
        console.log( $scope.center );
        reviewService
            .save( $scope.center)
            .$promise
            .then(
                function( ){

                },
                function( err ){
                   console.log( err );
                }
            )
    }


}