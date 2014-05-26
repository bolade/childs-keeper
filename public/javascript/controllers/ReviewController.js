var ReviewController = function( $scope ){
    $scope.viewModel = {};
    $scope.viewModel.activeTab = 0;
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
};