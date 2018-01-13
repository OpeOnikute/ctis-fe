'use strict';

app.controller('adminShuttleTableCtrl', ['$rootScope', '$scope', '$http', 'toaster', 'httpFactory',
    function($rootScope, $scope, $http, toaster, httpFactory) {

        $scope.loading = true;

        $scope.editId = -1;

        $scope.setEditId = function (pid, shuttle) {
            $scope.editId = pid;
            $scope.shuttle = shuttle;
        };

        $scope.ajaxUpdate = function () {

            httpFactory.putJson($rootScope.app.apiURL + '/shuttles/' + $scope.shuttle.shuttle_id, $scope.shuttle, function (response) {

                $scope.loading = false;

                if (response.status === 'success') {
                    toaster.pop(response.status, 'Success', response.message || 'Shuttle updated successfully');
                    return;
                }

                toaster.pop('error', 'Error', response.message || 'An unknown error occurred. Please try again.');
            });
        };

        $scope.updateShuttle = function () {

            if (!$scope.shuttle) {
                toaster.pop('error', 'Technical issue', 'An error occurred. PLease try again.');
                return;
            }

            $scope.loading = true;

            $scope.ajaxUpdate();
        };
}]);