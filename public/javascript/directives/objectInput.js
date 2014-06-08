childCareApp.directive( 'objectInput', function( $sce ){
    return {
        priority : -1,
        require : '?ngModel',
        restrict : 'A',
        link : function( scope, elem, attrib, ngModelController ){
            console.log( "Found objectInput directive" );
            if( ngModelController ){
                ngModelController.$render = function(){
                   var obj = ngModelController.$viewValue;
                   if( obj ){
                       if( typeof (obj) == "object" ){
                           elem.html( $sce.getTrustedHtml( obj.name ));
                       }
                       else{
                           elem.html( $sce.getTrustedHtml( obj ));
                       }
                   }
                   else{
                       elem.html( '');
                   }
                };
            }

        }
    } ;
});