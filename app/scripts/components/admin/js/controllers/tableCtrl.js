'use strict';

app.controller('adminShuttleTableCtrl', ['$rootScope', '$scope', '$http', 'toaster', 'httpFactory',
    function($rootScope, $scope, $http, toaster, httpFactory) {

        $scope.loading = true;

        $scope.getShuttleDetails = function () {

            httpFactory.getJson($rootScope.app.apiURL + '/shuttles', {}, function(response){

                if (response.status !== 'success') {
                    toaster.pop('error', 'Error', response.message || 'An error occurred. Please try again.');
                    return;
                }

                $scope.data = response.data;

                $scope.loading = false;
            });
        };

        //Invoke the function immediately.
        $scope.getShuttleDetails();

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

app.controller('userTableCtrl', ['$rootScope', '$scope', '$http', 'toaster', 'httpFactory',
    function($rootScope, $scope, $http, toaster, httpFactory) {

        $scope.loading = true;

        $scope.getUserDetails = function () {

            httpFactory.getJson($rootScope.app.apiURL + '/users', {}, function(response){

                if (response.status !== 'success') {
                    toaster.pop('error', 'Error', response.message || 'An error occurred. Please try again.');
                    return;
                }

                $scope.data = response.data;

                $scope.loading = false;
            });
        };

        //Invoke the function immediately.
        $scope.getUserDetails();

        $scope.editId = -1;

        $scope.setEditId = function (pid, user) {
            $scope.editId = pid;
            $scope.user = user;
        };

        $scope.ajaxUpdate = function () {

            httpFactory.putJson($rootScope.app.apiURL + '/users/' + $scope.user._id, $scope.user, function (response) {

                $scope.loading = false;

                if (response.status === 'success') {
                    toaster.pop(response.status, 'Success', response.message || 'User updated successfully');
                    return;
                }

                toaster.pop('error', 'Error', response.message || 'An unknown error occurred. Please try again.');
            });
        };

        $scope.updateUser = function () {

            if (!$scope.user) {
                toaster.pop('error', 'Technical issue', 'An error occurred. PLease try again.');
                return;
            }

            $scope.loading = true;

            $scope.ajaxUpdate();
        };
}]);

app.controller('locationTableCtrl', ['$rootScope', '$scope', '$http', 'toaster', 'httpFactory',
    function($rootScope, $scope, $http, toaster, httpFactory) {

        $scope.locationTypes = $rootScope.app.locationTypes;

        $scope.loading = true;

        $scope.getLocationDetails = function () {

            httpFactory.getJson($rootScope.app.apiURL + '/locations', {}, function(response){

                if (response.status !== 'success') {
                    toaster.pop('error', 'Error', response.message || 'An error occurred. Please try again.');
                    return;
                }

                $scope.data = response.data;

                $scope.loading = false;
            });
        };

        //Invoke the function immediately.
        $scope.getLocationDetails();

        $scope.editId = -1;

        $scope.setEditId = function (pid, location) {
            $scope.editId = pid;
            $scope.location = location;
        };

        $scope.ajaxUpdate = function () {

            httpFactory.putJson($rootScope.app.apiURL + '/locations/' + $scope.location._id, $scope.location, function (response) {

                $scope.loading = false;

                if (response.status === 'success') {
                    toaster.pop(response.status, 'Success', response.message || 'Location updated successfully');
                    return;
                }

                toaster.pop('error', 'Error', response.message || 'An unknown error occurred. Please try again.');
            });
        };

        $scope.updateLocation = function () {

            if (!$scope.location) {
                toaster.pop('error', 'Technical issue', 'An error occurred. PLease try again.');
                return;
            }

            $scope.loading = true;

            $scope.ajaxUpdate();
        };
    }]);