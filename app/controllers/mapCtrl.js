'use strict';

app.controller('mapCtrl', ['$scope', '$rootScope', 'httpFactory', 'Map', 'blockUI', 'geoLocator', '$compile',
    function($scope, $rootScope, httpFactory, Map, blockUI, geoLocator, $compile) {

    $rootScope.location = 'map';
    $scope.shuttleCount = 0;
    $scope.departureLocation = null;

    // var mapBlockUI = blockUI.instances.get('mapBlockUI');
    // mapBlockUI.start();

    $scope.init = function () {

        try {
            Map.init($scope.addUsersLocationToMap);
        } catch (e) {
            $scope.errorMessage = 'We could not load the map. Please check your internet connection and try again.';
        }

        $scope.getShuttles();
        $scope.loadBusStops();
    };

    /**
     * * The default the departure location is set as the user's current location, when initializing
     * @param location_id
     */
    $scope.setDepartureLocation = function (location_id){

        var location = $scope.busStops.filter(function(entry){
            return entry._id === location_id;
        });

        if (location.length > 0){
            $scope.departureLocation = location[0];
        }
    };

    $scope.selectedColours = [];

    $scope.selectRandomColor = function () {
        var colours = ['black', 'darkmagenta', 'green', 'red', 'blue'];
        var selected = Math.floor(Math.random() * colours.length);

        var style = '{"background-color": "' + colours[selected] + '"}';

        if ($scope.selectedColours.indexOf(colours[selected]) >= 0) {
            return $scope.selectRandomColor();
        }

        $scope.selectedColours.push(colours[selected]);

        return style;
    };

    $scope.resetDepartureLocation = function () {

        if (!$scope.userLocation) return;

        $scope.departureLocation = $scope.userLocation;
    };

    $scope.getUsersLocation = function (callback) {

        geoLocator.getCurrentLocation(function (res) {

            //passed as a callback to the map's init function cause we're adding markers
            if (!res) {
                alert('We were not able to get your determine your current location. Please try a different browser, enable location in your browser settings.');
                callback(false);
            }

            callback({
                lat: res.coords.latitude,
                lng: res.coords.longitude,
                name: 'Your current location',
                description: 'This is your current location.'
            });
        });
    };

    $scope.addUsersLocationToMap =  function () {

        $scope.getUsersLocation(function (location) {

            if (!location) return;

            $scope.userLocation = {
                lat: location.lat,
                lng: location.lng,
                name: 'Your current location',
                description: 'This is your current location.'
            };

            //default departure location is the user's current position
            $scope.departureLocation = $scope.userLocation;

            var content = '<div id="content">'+
                '<div id="siteNotice">'+
                '</div>'+
                '<h3 id="firstHeading" class="firstHeading">' + $scope.userLocation.name + '</h3>'+
                '<div id="bodyContent">'+
                '<p>' + $scope.userLocation.description + '</p>'+
                '<small ng-show="departureLocation.lat !== userLocation.lat && (departureLocation.lng !== userLocation.lng)">You can <a ng-click="resetDepartureLocation()">set this as your departure location</a>.</small>' +
                '</div>' +
                '</div>';

            var compiledContent = $compile(content)($scope);

            Map.addMarker(location.lng, location.lat, $scope.userLocation.name, compiledContent[0]);
        });
    };

    $scope.loadBusStops = function () {
        
        httpFactory.getJson($rootScope.app.apiURL + '/locations/?type=bus_stop', {}, function (response) {
        
            if (response.status === 'success') {

                var locations = response.data;

                $scope.busStops = locations;

                for (var index in locations) {
                    if (!locations.hasOwnProperty(index)) continue;
                    var location = locations[index];

                    var descriptionContent = location.description || '<small>No description is currently available.</small>';

                    var meta = '<small>This is a bus-stop. You can <a ng-click="setDepartureLocation(' + location._id + ')" href="">set this as your departure location</a>.</small>';

                    var content = '<div id="content">'+
                        '<div id="siteNotice">'+
                        '</div>'+
                        '<h3 id="firstHeading" class="firstHeading">' + location.name + '</h3>'+
                        '<div id="bodyContent">'+
                        '<p>' + descriptionContent + '</p>'+
                        '<p>' + meta + '</p>'+
                        '</div>'+
                        '</div>';

                    var compiledContent = $compile(content)($scope);

                    Map.addMarker(location.longitude, location.latitude, location.name, compiledContent[0]);
                }
            }
        });
    };

    $scope.determineNearestShuttle = function (shuttles) {

        if (!shuttles) return false;

        return shuttles.reduce(function(currentClosest, currentValue){
            return currentValue.distance_matrix.distance < currentClosest.distance_matrix.distance ? currentValue : currentClosest;
        });
    };

    $scope.getShuttles = function () {

        if (!$scope.userLocation) {

            $scope.getUsersLocation(function (location) {

                $scope.userLocation = location;

                httpFactory.getJson($rootScope.app.apiURL + '/shuttles/', {en_route: true, user_location: location.lat + ', ' + location.lng}, function (response) {
                    if (response.status === 'success') {
                        var shuttles = response.data;
                        $scope.shuttleCount = shuttles.length;
                        $scope.nearestShuttle = $scope.determineNearestShuttle(shuttles);
                    }
                });
            });
        } else {
            httpFactory.getJson($rootScope.app.apiURL + '/shuttles/', {en_route: true, user_location: $scope.userLocation.lat + ', ' + $scope.userLocation.lng}, function (response) {
                if (response.status === 'success') {
                    var shuttles = response.data;
                    $scope.shuttleCount = shuttles.length;
                    $scope.nearestShuttle = $scope.determineNearestShuttle(shuttles);
                }
            });
        }
    };

    // $scope.place = {};
    //
    // $scope.search = function() {
    //     $scope.apiError = false;
    //     Map.search($scope.searchPlace)
    //         .then(
    //             function(res) { // success
    //                 Map.addMarker(res);
    //                 $scope.place.name = res.name;
    //                 $scope.place.lat = res.geometry.location.lat();
    //                 $scope.place.lng = res.geometry.location.lng();
    //             },
    //             function(status) { // error
    //                 $scope.apiError = true;
    //                 $scope.apiStatus = status;
    //             }
    //         );
    // };
    //
    // $scope.send = function() {
    //     alert($scope.place.name + ' : ' + $scope.place.lat + ', ' + $scope.place.lng);
    // };

    $scope.init();
}]);