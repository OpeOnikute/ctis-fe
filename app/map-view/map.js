'use strict';

angular.module('myApp.map', ['myApp', 'ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/map', {
    templateUrl: 'map-view/map.html',
    controller: 'mapCtrl'
  });
}])

.controller('mapCtrl', ['$scope', '$rootScope', 'httpFactory', 'Map', 'blockUI', 'geoLocator', '$compile',
    function($scope, $rootScope, httpFactory, Map, blockUI, geoLocator, $compile) {

    $rootScope.location = 'map';
    $scope.no_of_shuttles = 0;
    $scope.departure_location = null;

    // var mapBlockUI = blockUI.instances.get('mapBlockUI');
    // mapBlockUI.start();

    $scope.init = function () {

        Map.init($scope.getUsersLocation);

        $scope.getShuttles();
        $scope.loadBusStops();
    };

    $scope.setDepartureLocation = function (location_id){

        var location = $scope.busStops.filter(function(entry){
            return entry._id === location_id;
        });

        debugger;

        if (location.length > 0){
            $scope.departureLocation = location[0];
        }
    };

    $scope.resetDepartureLocation = function () {

        if (!$scope.userLocation) return;

        $scope.departureLocation = $scope.userLocation;
    };

    $scope.getUsersLocation = geoLocator.getCurrentLocation(function (res) {

        //passed as a callback to the map's init function cause we're adding markers
        if (!res) { alert('We were not able to get your determine your current location. Please try a different browser.')}

        var lat = res.coords.latitude;
        var lng = res.coords.longitude;

        $scope.userLocation = {
            lat: lat,
            lng: lng,
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

        Map.addMarker(lng, lat, $scope.userLocation.name, compiledContent[0]);
    });

    $scope.loadBusStops = function () {
        
        httpFactory.getJson('http://127.0.0.1:5000/locations/?type=bus_stop', {}, function (response) {
        
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
    

    $scope.getShuttles = function () {
        httpFactory.getJson('http://127.0.0.1:5000/shuttles/?en_route=false', {}, function (response) {
            if (response.status === 'success') {
                $scope.no_of_shuttles = response.data.length;
            }
        });
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