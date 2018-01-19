'use strict';

app.controller('AppCtrl', ['$rootScope', '$scope', '$transitions', '$state',
    function($rootScope, $scope, $transitions, $state) {

    $transitions.onSuccess({}, function (trans) {
        // Save the route title
        $rootScope.currTitle = $state.current.title;
        $rootScope.currState = $state.current;
    });

    //redirect to specified redirect url
    $transitions.onSuccess({}, function(trans) {

        var toState = trans.$to();
        var redirectTo = toState.redirectTo || null;

        if(redirectTo) {
            $location.path(redirectTo);
        }
    });

    $rootScope.pageTitle = function () {
        return $rootScope.app.name + ' | ' + ($rootScope.currTitle || $rootScope.app.description);
    };
}]);