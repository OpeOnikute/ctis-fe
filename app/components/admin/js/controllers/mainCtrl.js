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

