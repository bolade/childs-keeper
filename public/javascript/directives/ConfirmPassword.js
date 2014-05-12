childCareApp.directive( 'confirmPassword', function(){
    return {
        restrict : 'E',
        require : 'ngModel',
        scope : {
            confirmPassword : '='
        }
    };
});