'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.map',
    'myApp.home',
    'myApp.version',
    'blockUI'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/home'});
}]).
config(function(blockUIConfig) {
    // Disable automatically blocking of the user interface
    blockUIConfig.autoBlock = false;
 }).
filter('capitalize', function() {
    return function(input) {
        return (input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : 'N/A';
    }
}).
service('Map', ['httpFactory', 'blockUI', 'geoLocator', '$compile',
    function(httpFactory, blockUI, geoLocator, $compile) {

    var self = this;

    var mapBlockUI = blockUI.instances.get('mapBlockUI');

    this.init = function(next) {

        var options = {
            center: new google.maps.LatLng(6.670385, 3.158345), //center of the map is the chapel
            zoom: 17
        };

        self.map = new google.maps.Map(
            document.getElementById("map"), options
        );

        mapBlockUI.start({
            message: 'Loading locations....'
        });

        //add the buildings to the map
        httpFactory.getJson('http://127.0.0.1:5000/locations/?type=building', {}, function (response) {

            if (response.status === 'success') {
                var locations = response.data;

                for (var index in locations) {
                    if (!locations.hasOwnProperty(index)) continue;
                    var location = locations[index];

                    var descriptionContent = location.description || '<small>No description is currently available.</small>';

                    var content = '<div id="content">'+
                        '<div id="siteNotice">'+
                        '</div>'+
                        '<h3 id="firstHeading" class="firstHeading">' + location.name + '</h3>'+
                        '<div id="bodyContent">'+
                        '<p>' + descriptionContent + '</p>'+
                        '</div>'+
                        '</div>';

                    self.addMarker(location.longitude, location.latitude, location.name, content)
                }
            }

            mapBlockUI.stop();

            if (next) {
                next();
            }
        });
        // this.places = new google.maps.places.PlacesService(this.map);
    };

    // this.search = function(str) {
    //     var d = $q.defer();
    //     this.places.textSearch({query: str}, function(results, status) {
    //         if (status === 'OK') {
    //             d.resolve(results[0]);
    //         }
    //         else d.reject(status);
    //     });
    //     return d.promise;
    // };

    self.addMarker = function(long, lat, title, content) {

        var marker = new google.maps.Marker({
            map: self.map,
            position: {lat: lat, lng: long},
            animation: google.maps.Animation.DROP,
            title: title
        });

        marker.setMap(self.map);

        marker.addListener('click', function(){

            if (self.infoWindow) self.infoWindow.close();

            self.infoWindow = new google.maps.InfoWindow({
                content: content
            });

            self.infoWindow.open(self.map, marker);
        });
    };
}]).
service('geoLocator', function () {

    var self = this;

    self.getCurrentLocation = function (callback) {

        if (!navigator.geolocation) {
            return callback(false);
        }

        //returns position.coords.latitude and position.coords.longitude
        return navigator.geolocation.getCurrentPosition(callback);
    }

})
.factory('httpFactory', function ($http) {

    return {
        getJson: function (url, params, callback) {

            //add the encoded url params
            if (typeof params === 'object'){

                var prefix,
                    count = 0;

                for (var key in params){

                    if(!params.hasOwnProperty(key)) continue;

                    prefix = count === 0 ? '?' : '&';

                    url += prefix + key + '=' + encodeURI(params[key]);

                    count += 1;
                }
            }

            $http.get(url).then(function(ngResponse){

                var response = ngResponse.data;

                callback(response);
            });
        },
        postJson: function (url, data, callback) {

            $http.post(url, data).then(function (ngResponse) {

                var response = ngResponse.data;

                callback(response);
            });
        },
        putJson: function (url, data, callback) {

            $http.put(url, data).then(function (ngResponse) {

                var response = ngResponse.data;

                callback(response);
            });
        }
    }
});


