'use strict';

app.controller('mapCtrl', ['$scope', '$rootScope', 'httpFactory', 'Map', 'blockUI', 'geoLocator', '$compile', '$filter', 'helpers',
    function($scope, $rootScope, httpFactory, Map, blockUI, geoLocator, $compile, $filter, helpers) {

    var mapBlockUI = blockUI.instances.get('mapBlockUI');

    $rootScope.location = 'map';
    $scope.shuttleCount = 0;
    $scope.departureLocation = null;

    $scope.init = function () {

        if ($scope.loading === true) {
            mapBlockUI.start({
                message: 'Loading locations....'
            });
        }

        try {
            Map.init($scope.addUsersLocationToMap, $scope.getShuttles);
            $scope.loadBusStops();
            $scope.addBuildings();
        } catch (e) {
            console.error(e);
            $scope.errorMessage = 'We could not load the map. Please check your internet connection and try again.';
        }

        if ($scope.loading === false) {
            mapBlockUI.stop();
        }
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
            $scope.executeShuttleGetRequest();
        }
    };

    $scope.resetDepartureLocation = function () {

        if (!$scope.userLocation) return;

        $scope.departureLocation = $scope.userLocation;

        $scope.executeShuttleGetRequest();
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

    $scope.getUsersLocation = function (callback) {

        geoLocator.getCurrentLocation(function (res) {

            //passed as a callback to the map's init function cause we're adding markers
            if (!res) {
                alert('We were not able to get your determine your current location. Please try a different browser, enable location in your browser settings.');
                callback(false);
            }

            callback({
                latitude: res.coords.latitude,
                longitude: res.coords.longitude,
                name: 'Your current location',
                description: 'This is your current location.'
            });
        });
    };

    $scope.addUsersLocationToMap =  function (next) {

        $scope.loading = true;

        $scope.getUsersLocation(function (location) {

            $scope.loading = false;

            if (!location) return;

            $scope.userLocation = {
                latitude: location.latitude,
                longitude: location.longitude,
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
                '<small ng-show="departureLocation.latitude !== userLocation.latitude && (departureLocation.longitude !== userLocation.longitude)">You can <a ng-click="resetDepartureLocation()">set this as your departure location</a>.</small>' +
                '</div>' +
                '</div>';

            var compiledContent = $compile(content)($scope);

            var userIcon = $rootScope.app.icons.user;

            Map.addMarker(location.longitude, location.latitude, $scope.userLocation.name, compiledContent[0], userIcon);
            Map.setCenter(location.longitude, location.latitude);

            if (next) {
                next();
            }
        });
    };

    $scope.addBuildings = function () {

        if (!$scope.departureLocation) {
            setTimeout($scope.addBuildings, 3000);
            return;
        }

        $scope.loading = true;

        //add the buildings to the map
        httpFactory.getJson($rootScope.app.apiURL + '/locations', {type: 'building', origin: $scope.departureLocation.latitude + ', ' + $scope.departureLocation.longitude}, function (response) {

            $scope.loading = false;

            if (response.status === 'success') {
                var locations = response.data;

                for (var index in locations) {
                    if (!locations.hasOwnProperty(index)) continue;
                    var location = locations[index];

                    var descriptionContent = location.description || '<small>No description is currently available.</small>';

                    var directionContent = helpers.parseDirectionContent(location.directions);

                    var content = '<div id="content">'+
                        '<div id="siteNotice">'+
                        '</div>'+
                        '<h3 id="firstHeading" class="firstHeading">' + location.name + '</h3>'+
                        '<div id="bodyContent">'+
                        '<p>' + descriptionContent + '</p>'+
                        (directionContent ? '<p>' + directionContent + '</p>' : '' ) +
                        '</div>'+
                        '</div>';

                    var buildingIcon = $rootScope.app.icons.building;

                    Map.addMarker(location.longitude, location.latitude, location.name, content, buildingIcon);
                }
            }
        });
    };

    $scope.loadBusStops = function () {

        //wait for the departure location to be set and re-try
        if (!$scope.departureLocation) {
            setTimeout($scope.loadBusStops, 3000);
            return;
        }

        $scope.loading = true;

        httpFactory.getJson($rootScope.app.apiURL + '/locations', {type: 'bus_stop', origin: $scope.departureLocation.latitude + ', ' + $scope.departureLocation.longitude}, function (response) {

            $scope.loading = false;

            if (response.status === 'success') {

                var locations = response.data;

                $scope.busStops = locations;

                for (var index in locations) {
                    if (!locations.hasOwnProperty(index)) continue;
                    var location = locations[index];

                    var descriptionContent = location.description || '<small>No description is currently available.</small>';

                    var conditionTrue = 'departureLocation.latitude === ' + location.latitude + ' && departureLocation.longitude === ' + location.longitude;
                    var conditionFalse = 'departureLocation.latitude !== ' + location.latitude + ' || departureLocation.longitude !== ' + location.longitude;

                    var meta = '<small ng-if="' + conditionTrue + '">This is set as your current departure location. Click <a ng-click="resetDepartureLocation()">here</a> to reset</small>'
                         + '<small ng-if="' + conditionFalse + '">This is a bus-stop. You can <a ng-click="setDepartureLocation(' + location._id + ')" href="">set this as your departure location</a>.</small>';

                    var directionContent = helpers.parseDirectionContent(location.directions);

                    var content = '<div id="content">'+
                        '<div id="siteNotice">'+
                        '</div>'+
                        '<h3 id="firstHeading" class="firstHeading">' + location.name + '</h3>'+
                        '<div id="bodyContent">'+
                        '<p>' + descriptionContent + '</p>'+
                        '<p>' + meta + '</p>'+
                        (directionContent ? '<p>' + directionContent + '</p>' : '' ) +
                        '</div>'+
                        '</div>';

                    var compiledContent = $compile(content)($scope);

                    Map.addMarker(location.longitude, location.latitude, location.name, compiledContent[0], $rootScope.app.icons.busStop);
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

        if ($scope.userLocation) {
            return $scope.executeShuttleGetRequest();
        }

        $scope.getUsersLocation(function (location) {

            $scope.userLocation = location;

            $scope.executeShuttleGetRequest();
        });
    };

    $scope.executeShuttleGetRequest = function () {

        if (!$scope.departureLocation) return;

        $scope.loading = true;

        var departureLocation = $scope.departureLocation;

        httpFactory.getJson($rootScope.app.apiURL + '/shuttles/', {en_route: true, user_location: departureLocation.latitude + ', ' + departureLocation.longitude}, function (response) {

            $scope.loading = false;

            if (response.status === 'success') {
                var shuttles = response.data;
                $scope.shuttleCount = shuttles.length;
                $scope.nearestShuttle = $scope.determineNearestShuttle(shuttles);
                $scope.addShuttlesToMap(shuttles);
            }
        });
    };

    $scope.addShuttlesToMap = function (shuttleArray) {

        for ( var shuttle in shuttleArray) {
            if (!shuttleArray.hasOwnProperty(shuttle)) continue;

            var shuttleData = shuttleArray[shuttle];

            var content = '<div id="content">'+
                '<div id="siteNotice">'+
                '</div>'+
                '<h3 id="firstHeading" class="firstHeading">' + $filter('capitalize')(shuttleData.brand) + '</h3>'+
                '<div id="bodyContent">'+
                '<p><label>Seats:</label> ' + (shuttleData.no_of_seats || 'N/A') + '</p>'+
                '<p><label>Size:</label> ' + (shuttleData.size || 'N/A') + '</p>'+
                '</div>'+
                '</div>';

            var compiledContent = $compile(content)($scope);

            var shuttleIcon = $rootScope.app.icons.shuttle;

            Map.addMarker(shuttleData.longitude, shuttleData.latitude, shuttleData.brand, compiledContent[0], shuttleIcon);
        }
    };

    $scope.getDirections = function (lat, lng, mode) {

        if (!$scope.departureLocation) return;

        var departureLocation = $scope.departureLocation;

        httpFactory.getJson($rootScope.app.apiURL + '/directions/', {mode: mode, destination: lat + ', ' + lng, origin: departureLocation.lat + ', ' + departureLocation.lng},
            function (response) {
                if (response.status === 'success') {
                    return response.data;
                }
            });
    };

    $scope.init();
}]);