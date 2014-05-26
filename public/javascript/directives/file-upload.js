childCareApp.directive('fileUpload', function(){
    return {
        restrict : 'A',
        scope : {
            supportedTypes : '@',
            maxSize : '@',
            fileInfo : '='
        },
        link : function( scope, element ){
            function isFileSupported( file ){
                var isFileTypeSupported = (function(){
                    if( scope.supportedTypes ){
                        var regEx = new RegExp(scope.supportedTypes);
                        var returnValue =  file.name.match(regEx);
                        return !!returnValue;
                    }
                    else{
                        return true;
                    }
                })();
                var isFileSizeAcceptable = (function(){
                    if( scope.maxSize ){
                        var maxFileSize = Number( scope.maxSize ) * 1000;
                        if( file.fileSize <= maxFileSize ){
                            return true;
                        }
                        else{
                            return false;
                        }
                    }
                    else{
                        return true;
                    }
                })();

                return isFileTypeSupported && isFileSizeAcceptable;

            }
            function handleFileUpload( e, data){
                var file = data.files[0];
                if( isFileSupported(  file ) ){
                    var reader = new FileReader();
                    reader.onloadend = function(){
                        scope.$apply( function(){
                            scope.fileInfo.error = undefined;
                            scope.fileInfo.name = file.name;
                            scope.fileInfo.type = file.type;
                            scope.fileInfo.trigger = !scope.fileInfo.trigger;
                            scope.fileInfo.contents = reader.result;
                        });
                    };
                    reader.readAsDataURL( file );
                }
                else{
                    scope.$apply( function(){
                        scope.fileInfo.error  =  "File either too large/not the right format" ;
                        scope.fileInfo.name = undefined;
                        scope.fileInfo.type = undefined;
                        scope.fileInfo.contents = undefined;
                        scope.fileInfo.trigger = !scope.fileInfo.trigger;
                    });

                }
            }

            if( element.is("input[type='file']")){
                element.fileupload({
                    add : handleFileUpload
                });
            }
            else if(element.is("div") ){
                element.fileupload({
                    dropZone : element,
                    add : handleFileUpload
                });
                $(document).bind('dragover', function (e) {
                    var dropZone = element,
                        timeout = window.dropZoneTimeout;
                    if (!timeout) {
                        dropZone.addClass('in');
                    } else {
                        clearTimeout(timeout);
                    }
                    var found = false,
                        node = e.target;
                    do {
                        if (node === dropZone[0]) {
                            found = true;
                            break;
                        }
                        node = node.parentNode;
                    } while (node != null);
                    if (found) {
                        dropZone.addClass('hover');
                    } else {
                        dropZone.removeClass('hover');
                    }
                    window.dropZoneTimeout = setTimeout(function () {
                        window.dropZoneTimeout = null;
                        dropZone.removeClass('in hover');
                    }, 100);
                });
            }
        }
    }

});