var ReviewController = function( $scope, $http ){
    $scope.viewModel = {};
    $scope.viewModel.activeTab = 1;
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
        console.log( "term : " + term );
        return $http.get('/search', { params : {"term" : term} } )
            .then( function(res){
                var sortedList = _(res.data).sortBy( "name" );
                return sortedList;
            });
    }
};