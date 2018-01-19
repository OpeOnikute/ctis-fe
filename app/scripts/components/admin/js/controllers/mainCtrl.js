'use strict';


app.controller('dashboardCtrl', ['$rootScope', '$scope', 'httpFactory', 'toaster',
    function($rootScope, $scope, httpFactory, toaster) {

    $scope.shuttle = null;
    $scope.shuttles = [];

    $scope.getShuttles =  function(){

        $scope.loadingShuttles = true;

        httpFactory.getJson($rootScope.app.apiURL + '/shuttles', {}, function (response) {

            $scope.loadingShuttles = false;

            if (response.status === 'success') {
                $scope.shuttles = response.data;
                return;
            }

            toaster.pop('error', 'Error', response.message || 'We could not fetch your shuttles for some reason. Please try again.');
        });
    };

    $scope.getShuttles();
}]);

app.controller('adminCtrl', ['$rootScope', function($rootScope) {
}]);

app.controller('adminLoginCtrl', ['$rootScope', '$scope', '$http', '$location', 'authProvider',
    function($rootScope, $scope, $http, $location, authProvider) {

        var self = $scope;

        self.admin = {};

        var defaultServerResponse = {
            status: 'error',
            message: 'Technical issue: An error occurred. Please try again.'
        };

        self.submitForm = function(isValid) {

            var baseUrl = 'http://localhost:5000';

            var url = baseUrl + '/users/login?accountType=admin';

            //reset the server response
            self.serverResponse = false;

            if (!isValid) {
                return;
            }

            self.loading = true;

            $http.post(url, self.admin).then(
                function(successResponse){

                    var response = successResponse.data;

                    self.serverResponse = defaultServerResponse;

                    if (response) {
                        self.serverResponse = response;
                    }

                    if (response.status === 'success') {

                        authProvider.setUser(response.data.user);

                        if ($rootScope.redirectUrl) {
                            $location.path($rootScope.redirectUrl);
                            $rootScope.redirectUrl = null;
                            return;
                        }

                        $location.path('/admin/dashboard');
                    }

                    self.loading = false;
                },
                function() {

                    self.serverResponse = defaultServerResponse;

                    self.loading = false;
                });
        }
    }]);

app.controller('adminSignupCtrl', ['$rootScope', '$scope', '$http', '$location', 'authProvider',
    function($rootScope, $scope, $http, $location, authProvider) {

        var self = $scope;

        self.user = {
            accountType: 'admin'
        };

        var defaultServerResponse = {
            status: 'error',
            message: 'Technical issue: An error occurred. Please try again.'
        };

        self.submitForm = function(isValid) {

            var baseUrl = 'http://localhost:5000';

            var url = baseUrl + '/users/signup';

            //reset the server response
            self.serverResponse = false;

            if (!isValid) {
                return;
            }

            self.loading = true;

            $http.post(url, self.user).then(
                function(successResponse){

                    var response = successResponse.data;

                    self.serverResponse = defaultServerResponse;

                    if (response) {
                        self.serverResponse = response;
                    }

                    if (response.status === 'success') {

                        authProvider.setUser(response.data.user);

                        if ($rootScope.redirectUrl) {
                            $location.path($rootScope.redirectUrl);
                            $rootScope.redirectUrl = null;
                            return;
                        }

                        $location.path('/admin/dashboard');
                    }

                    self.loading = false;
                },
                function() {

                    self.serverResponse = defaultServerResponse;

                    self.loading = false;
                });
        }
    }]);

app.controller('createShuttleCtrl', ['$rootScope', '$scope', '$http', 'toaster', 'httpFactory', 'formHelper',
    function ($rootScope, $scope, $http, toaster, httpFactory, formHelper) {

        $scope.shuttle = {};

        $scope.loadingDrivers = true;

        httpFactory.getJson($scope.app.apiURL + '/drivers/', {}, function(response) {

            $scope.loadingDrivers = false;

            var status = response.status || 'error';

            if (status !== 'success') {
                toaster.pop(status, status.toUpperCase(), response.message || 'An error occurred and we could not get the drivers. Please try again.');
                return;
            }

            $scope.drivers = response.data;
        });

        $scope.createShuttle = function (formValid) {

            if (!formValid) {
                toaster.pop('error', 'Form Invalid', 'The form you filled seems to be invalid.');
                return;
            }

            if (!$scope.shuttle) {
                toaster.pop('error', 'Technical issue', 'An error occurred. Please try again.');
                return;
            }

            $scope.shuttle.ac = formHelper.convertStrToBool($scope.shuttle.ac);

            $scope.loading = true;

            httpFactory.postJson($scope.app.apiURL + '/shuttles/' + $scope.shuttle.driver._id, $scope.shuttle, function(response) {

                $scope.loading = false;

                var status = response.status || 'error';

                if (status !== 'success') {
                    toaster.pop(status, status.toUpperCase(), response.message || 'An error occurred. Please try again.');
                    return;
                }

                $scope.shuttle = {};

                $rootScope.createShuttleForm = $scope.createShuttleForm;
                //clear the form inputs
                formHelper.resetForm('createShuttleForm');

                toaster.pop(status, status.toUpperCase(), response.message || 'Shuttle created successfully.');
            });
        };
    }]);

app.controller('createUserCtrl', ['$rootScope', '$scope', '$http', 'toaster', 'httpFactory', 'formHelper',
    function ($rootScope, $scope, $http, toaster, httpFactory, formHelper) {

        $scope.user = {};

        $scope.createUser = function (formValid) {

            if (!formValid) {
                toaster.pop('error', 'Form Invalid', 'The form you filled seems to be invalid.');
                return;
            }

            if (!$scope.user) {
                toaster.pop('error', 'Technical issue', 'An error occurred. Please try again.');
                return;
            }

            $scope.loading = true;

            httpFactory.postJson($scope.app.apiURL + '/users/', $scope.user, function(response) {

                $scope.loading = false;

                var status = response.status || 'error';

                if (status !== 'success') {
                    toaster.pop(status, status.toUpperCase(), response.message || 'An error occurred. Please try again.');
                    return;
                }

                $scope.user = {};

                $rootScope.createUserForm = $scope.createUserForm;
                //clear the form inputs
                formHelper.resetForm('createUserForm');

                toaster.pop(status, status.toUpperCase(), response.message || 'User created successfully.');
            });
        };
    }]);

app.controller('createLocationCtrl', ['$rootScope', '$scope', '$http', 'toaster', 'httpFactory', 'formHelper',
    function ($rootScope, $scope, $http, toaster, httpFactory, formHelper) {

        $scope.locationTypes = $rootScope.app.locationTypes;

        $scope.location = {};

        $scope.createLocation = function (formValid) {

            if (!formValid) {
                toaster.pop('error', 'Form Invalid', 'The form you filled seems to be invalid.');
                return;
            }

            if (!$scope.location) {
                toaster.pop('error', 'Technical issue', 'An error occurred. Please try again.');
                return;
            }

            $scope.loading = true;

            httpFactory.postJson($scope.app.apiURL + '/locations/', $scope.location, function(response) {

                $scope.loading = false;

                var status = response.status || 'error';

                if (status !== 'success') {
                    toaster.pop(status, status.toUpperCase(), response.message || 'An error occurred. Please try again.');
                    return;
                }

                $scope.location = {};

                $rootScope.createLocationForm = $scope.createLocationForm;
                //clear the form inputs
                formHelper.resetForm('createLocationForm');

                toaster.pop(status, status.toUpperCase(), response.message || 'Location created successfully.');
            });
        };
    }]);

app.controller('addDirectionsCtrl', ['$rootScope', '$scope', '$http', 'toaster', 'httpFactory', 'formHelper',
    function ($rootScope, $scope, $http, toaster, httpFactory, formHelper) {

        $scope.directions = {};

        $scope.loadingLocations = true;

        httpFactory.getJson($scope.app.apiURL + '/locations/', {}, function(response) {

            $scope.loadingLocations = false;

            if (response.status === 'success') {
                $scope.locations = response.data;
            }
        });

        $scope.addDirections = function (formValid) {

            if (!formValid) {
                toaster.pop('error', 'Form Invalid', 'The form you filled seems to be invalid.');
                return;
            }

            if (!$scope.directions) {
                toaster.pop('error', 'Technical issue', 'An error occurred. Please try again.');
                return;
            }

            $scope.directions.location_id = $scope.directions.location._id;
            console.log($scope.directions);
            $scope.loading = true;

            httpFactory.postJson($scope.app.apiURL + '/locations/' + $scope.directions.location_id + '/directions', $scope.directions, function(response) {

                $scope.loading = false;

                var status = response.status || 'error';

                if (status !== 'success') {
                    toaster.pop(status, status.toUpperCase(), response.message || 'An error occurred. Please try again.');
                    return;
                }

                $scope.directions = {};

                $rootScope.addDirectionsForm = $scope.addDirectionsForm;
                //clear the form inputs
                formHelper.resetForm('addDirectionsForm');

                toaster.pop(status, status.toUpperCase(), response.message || 'Directions added successfully.');
            });
        };
}]);

