childCareApp.directive( 'validateEquals', function(){
    return {
        restrict : 'A',
        require : 'ngModel',
        link : function( scope, elem, attrs, ngModelCtrl){
            function validateEqual(myValue){
                var valid = ( myValue === scope.$eval( attrs.validateEquals));
                ngModelCtrl.$setValidity( 'equal', valid );
            }
            ngModelCtrl.$parsers.push( validateEqual );
            ngModelCtrl.$formatters.push( validateEqual );
            scope.$watch( attrs.validateEquals, function(){
               ngModelCtrl.$setViewValue( ngModelCtrl.$viewValue );
            });
        }
    };
});