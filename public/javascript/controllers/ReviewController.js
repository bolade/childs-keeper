var ReviewController = function( $scope, $http, $timeout ){
    $scope.viewModel = {};
    $scope.viewModel.activeTab = 1;
    $scope.viewModel.radius = 10;
    $scope.viewModel.childCareCenters = [];
    $scope.viewModel.zipCode = '77406';
    $scope.viewModel.tabs = [
        {
             "title" : "Read Reviews",
             "template" : "views/tabs/read-reviews.html"
        },
        {
            "title" : "Write Reviews",
            "template" : "views/tabs/write-reviews.html"
        }
    ];
    $scope.getMatchingListings = function(term){
        return $http.get('/search', { params : {"term" : term} } )
            .then( function(res){
                var sortedList = _(res.data).sortBy( "name" );
                return sortedList;
            });
    };

    $scope.search = function(){
        if( $scope.viewModel.zipCode ){
            $scope.viewModel.searching = true;
            $http.get('postal-search', { params : { "zip-code" : $scope.viewModel.zipCode, "radius" : $scope.viewModel.radius }})
                .then( function(res){
                    $timeout( function(){
                        $scope.viewModel.childCareCenters = res.data;
                        $scope.viewModel.searching = false;
                    }, 2000 );

                },
                function(err){
                    $scope.viewModel.searching = false;
                })
        }
    }


};