'use strict';


app.controller('dashboardCtrl', ['$rootScope', '$scope', 'httpFactory', 'toaster', 'geoLocator',
    function($rootScope, $scope, httpFactory, toaster, geoLocator) {

    $scope.shuttle = null;
    $scope.shuttles = [];
    $scope.transitMode = false;

    $scope.getShuttles =  function(){

        $scope.loadingShuttles = true;

        httpFactory.getJson($rootScope.app.apiURL + '/shuttles', {user_id: $rootScope.user._id}, function (response) {

            $scope.loadingShuttles = false;

            if (response.status === 'success') {
                $scope.shuttles = response.data;
                return;
            }

            toaster.pop('error', 'Error', response.message || 'We could not fetch your shuttles for some reason. Please try again.');
        });
    };

    $scope.toggleTransitMode = function (shuttleId) {

        if ($scope.shuttle) {
            toaster.pop('error', 'Error', 'You are already in transit in another shuttle. Please dis-engage before activating a new shuttle.');
            return;
        }

        var pollIntervalLength = $rootScope.app.pollIntervalLength;

        var url = $rootScope.app.apiURL + '/shuttles/' + shuttleId + '/mode/' + $rootScope.user._id;

        //get the driver's current location
        geoLocator.getCurrentLocation(function (res) {

            //passed as a callback to the map's init function cause we're adding markers
            if (!res) {
                toaster.pop('error', 'Error', 'We were not able to get your determine your current location. Please try a different browser, or enable `locations` in your browser settings.');
                return;
            }

            var lat = res.coords.latitude;
            var lng = res.coords.longitude;

            var payload = {
                location: {
                    latitude: lat,
                    longitude: lng
                }
            };

            $scope.loadingTransit = true;

            httpFactory.putJson(url, payload, function (response) {

                $scope.loadingTransit = false;

                if (response.status === 'success') {

                    var shuttle = response.data;
                    var mode = shuttle.en_route;

                    $scope.shuttle = shuttle;
                    $scope.transitMode = mode;

                    if ($scope.shuttleIdBuffer) {
                        $scope.shuttleIdBuffer = null;
                    }

                    //handle the toggle off state
                    if (mode === false) {
                        $scope.shuttle = null;
                    }

                    //start or stop polling the driver's location
                    $scope.pollLocationUpdates(pollIntervalLength, mode);

                    return;
                }

                toaster.pop('error', 'Error', response.message || 'Couldn\'t switch modes. Please try again.');
            });
        });
    };

    $scope.selectShuttle = function (shuttle_id) {

        //reset if the same shuttle is clicked twice.
        if ($scope.shuttleIdBuffer === shuttle_id) {
            $scope.shuttleIdBuffer = null;
            return;
        }

        $scope.shuttleIdBuffer = shuttle_id;
    };

    $scope.toggleSelectedShuttle = function () {

        var selectedShuttleId = $scope.shuttleIdBuffer;

        if (!selectedShuttleId) {
            toaster.pop('error', 'Error', 'You have not selected any shuttle.');
            return;
        }

        $scope.toggleTransitMode(selectedShuttleId);
    };

    $scope.updateShuttleLocation = function () {

        if (!$scope.shuttle) return;

        geoLocator.getCurrentLocation(function (res) {

            //passed as a callback to the map's init function cause we're adding markers
            if (!res) {
                toaster.pop('error', 'Error', 'We were not able to get your determine your current location. Please try a different browser, or enable `locations` in your browser settings.');
                return;
            }

            var payload = {
                lat: res.coords.latitude,
                lng: res.coords.longitude
            };

            var url = rootScope.app.apiURL + '/shuttles/'+ $scope.shuttle.id + '/location/' + $rootScope.user._id;

            httpFactory.putJson(url, payload, function (response) {
                if (response.status !== 'success') {

                    var errorMessage = response.message || 'We could not update your location. Please check your internet connection.';

                    toaster.pop('error', 'Error', errorMessage);
                }
            });
        });

    };

    /**
     * This function sets up recurring updates of the driver's location
     * @param frequency - seconds
     * @param start - specifies if the polling is to be started or stopped
     */
    $scope.pollLocationUpdates =  function (frequency, start) {

        if ($scope.transitMode && start) {
            $scope.pollInterval = setInterval($scope.updateShuttleLocation, frequency);
        }

        if (start === false) {
            clearInterval($scope.pollInterval);
        }
    };

    $scope.getShuttles();
}]);

app.controller('driverCtrl', ['$rootScope', function($rootScope) {
}]);

app.controller('driverLoginCtrl', ['$rootScope', '$scope', '$http', '$location', 'authProvider',
    function($rootScope, $scope, $http, $location, authProvider) {

        $rootScope.location = 'driver | Login';

        var self = $scope;

        self.user = {};

        var defaultServerResponse = {
            status: 'error',
            message: 'Technical issue: An error occurred. Please try again.'
        };

        self.submitForm = function(isValid) {

            var baseUrl = 'http://localhost:5000';

            var url = baseUrl + '/users/login?account_type=driver';

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

                        $location.path('/driver/dashboard');
                    }

                    self.loading = false;
                },
                function() {

                    self.serverResponse = defaultServerResponse;

                    self.loading = false;
                });
        }
    }]);

app.controller('driverSignupCtrl', ['$rootScope', '$scope', '$http', '$location', 'authProvider',
    function($rootScope, $scope, $http, $location, authProvider) {

        $rootScope.location = 'driver | Login';

        var self = $scope;

        self.user = {
            accountType: 'driver'
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

                        $location.path('/driver/dashboard');
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


            httpFactory.postJson($scope.app.apiURL + '/shuttles/' + $rootScope.user._id, $scope.shuttle, function(response) {

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

