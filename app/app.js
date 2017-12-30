'use strict';

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
    // return target.replace(new RegExp(search, 'g'), replacement);
};

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
    'ngRoute',
    'ui.router',
    'ui.bootstrap',
    'myApp.version',
    'blockUI',
    'ngStorage',
    'oc.lazyLoad',
    'ngMessages'
]);

app.config(['$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', '$locationProvider', '$routeProvider', 'JS_REQUIRES',
    function($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, $locationProvider, $routeProvider, jsRequires) {

    $locationProvider.hashPrefix('!');

    app.controller = $controllerProvider.register;
    app.directive = $compileProvider.directive;
    app.filter = $filterProvider.register;
    app.factory = $provide.factory;
    app.service = $provide.service;
    app.constant = $provide.constant;
    app.value = $provide.value;

    // LAZY MODULES
    $ocLazyLoadProvider.config({
        debug: false,
        events: true,
        modules: jsRequires.modules
    });

    // For any unmatched url, redirect to /
    $urlRouterProvider.otherwise("/home");

    $stateProvider.state('home', {
        url: "/home",
        templateUrl: 'views/home.html',
        resolve: loadSequence('homeCtrl'),
        title: 'Home'
    }).state('map', {
        url: "/map",
        templateUrl: 'views/map.html',
        resolve: loadSequence('mapCtrl'),
        title: 'Map'
    }).state('faq', {
        url: "/faq",
        templateUrl: 'views/faq.html',
        title: 'FAQ'
    }).state('driver', {
        url: "/driver",
        templateUrl: 'components/driver/views/index.html',
        resolve: loadSequence('toaster', 'mainCtrl'),
        redirectTo: "/driver/dashboard"
    }).state('driver.dashboard', {
        url: "/dashboard",
        templateUrl: 'components/driver/views/app.html',
        abstract: true
    }).state('driver.dashboard.home', {
        url: "",
        templateUrl: 'components/driver/views/dashboard.html',
        title: 'Driver - Dashboard'
    }).state('driver.dashboard.shuttles', {
        url: "/shuttles",
        title: 'Driver - Shuttles',
        ncyBreadcrumb: {
            label: 'Shuttles'
        }
    }).state('driver.dashboard.shuttles.manage', {
        url: "/manage",
        templateUrl: 'components/driver/views/manageShuttles.html',
        title: 'Driver - Manage Shuttles'
    }).state('driver.dashboard.shuttles.add', {
        url: "/add",
        templateUrl: 'components/driver/views/addShuttle.html',
        title: 'Driver - Add New Shuttle'
    }).state('driver.login', {
        url: "/login",
        templateUrl: 'components/driver/views/login.html',
        title: 'Driver - Login'
    }).state('driver.signup', {
        url: "/signup",
        templateUrl: 'components/driver/views/signup.html',
        title: 'Driver - Sign Up'
    });

    // Generates a resolve object previously configured in constant.JS_REQUIRES (config.constant.js)
    function loadSequence() {
        var _args = arguments;
        return {
            deps: ['$ocLazyLoad', '$q',
                function ($ocLL, $q) {
                    var promise = $q.when(1);
                    for (var i = 0, len = _args.length; i < len; i++) {
                        promise = promiseThen(_args[i]);
                    }
                    return promise;

                    function promiseThen(_arg) {
                        if (typeof _arg === 'function')
                            return promise.then(_arg);
                        else
                            return promise.then(function () {
                                var nowLoad = requiredData(_arg);
                                if (!nowLoad)
                                    return $.error('Route resolve: Bad resource name [' + _arg + ']');
                                return $ocLL.load(nowLoad);
                            });
                    }

                    function requiredData(name) {
                        if (jsRequires.modules)
                            for (var m in jsRequires.modules)
                                if (jsRequires.modules[m].name && jsRequires.modules[m].name === name)
                                    return jsRequires.modules[m];
                        return jsRequires.scripts && jsRequires.scripts[name];
                    }
                }]
        };
    }
}]);

app.run(['$rootScope', '$state', '$stateParams', '$location', '$trace', '$transitions',
    function ($rootScope, $state, $stateParams, $location, $trace, $transitions) {

        $transitions.onBefore( { to: 'driver.**' }, function(trans) {
            var authProvider = trans.injector().get('authProvider');
            // If isAuthenticated returns false, the transition is cancelled.
            $rootScope.redirectUrl = '/driver/dashboard';

            if (!authProvider.isLoggedIn()) {
                $location.path('/driver/login');
            }
        });

        // Set some reference to access them from any scope
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        // GLOBAL APP SCOPE
        // set below basic information
        $rootScope.app = {
            name: 'CTIS', // name of your project
            author: 'Ope Onikute', // author's name or company name
            description: 'CTIS Client-Side', // brief description
            year: ((new Date()).getFullYear()), // automatic current year (for copyright information)
            isMobile: (function () {// true if the browser is a mobile device
                var check = false;
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    check = true;
                }
                return check;
            })(),
            layout: {
                isNavbarFixed: true, //true if you want to initialize the template with fixed header
                isSidebarFixed: true, // true if you want to initialize the template with fixed sidebar
                isSidebarClosed: false, // true if you want to initialize the template with closed sidebar
                isFooterFixed: false, // true if you want to initialize the template with fixed footer
                theme: 'theme-1', // indicate the theme chosen for your project
                logo: '/front/img/farmworthLogo.svg' // relative path of the project logo
            },
            apiURL: 'http://localhost:5000',
            pollIntervalLength: 30000
        };

        $trace.enable('TRANSITION');
    }]);

app.config(function(blockUIConfig) {
    // Disable automatically blocking of the user interface
    blockUIConfig.autoBlock = false;
 });

app.filter('capitalize', function() {
    return function(input) {
        return (input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : 'N/A';
    }
});

app.service('Map', ['$rootScope', 'httpFactory', 'blockUI', 'geoLocator', '$compile',
    function($rootScope, httpFactory, blockUI, geoLocator, $compile) {

    var self = this;

    var mapBlockUI = blockUI.instances.get('mapBlockUI');

    self.init = function(next) {

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
        httpFactory.getJson($rootScope.app.apiURL + '/locations/?type=building', {}, function (response) {

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
}]);

app.service('geoLocator', function () {

    var self = this;

    self.getCurrentLocation = function (callback) {

        if (!navigator.geolocation) {
            return callback(false);
        }

        //returns position.coords.latitude and position.coords.longitude
        return navigator.geolocation.getCurrentPosition(callback);
    }

});

app.factory('authProvider', function ($rootScope, $sessionStorage) {

    return {
        setUser: function (aUser) {

            if ($sessionStorage.user) {
                $rootScope.user = $sessionStorage.user;
                return;
            }

            $rootScope.user = aUser;
            $sessionStorage.user = $rootScope.user;
        },
        isLoggedIn: function () {

            if ($sessionStorage.user) {
                $rootScope.user = $sessionStorage.user;
            }

            return $rootScope.user || false;
        }
    }
});

app.factory('formHelper', function ($rootScope) {

    return {
        resetForm: function (formName) {

            if (!$rootScope[formName]) {
                return console.warn('Tried to clear form that doesn\'t exist in scope: ' + formName);
            }

            $rootScope[formName].$setPristine();
            $rootScope[formName].$setUntouched();
            $rootScope[formName].$submitted = false;

            delete $rootScope[formName];
            return true;
        },
        convertStrToBool:  function (str) {

            var buffer = {
                'true': true,
                'false': false
            };

            return buffer[str] || false;
        }
    }
});

app.factory('httpFactory', function ($http) {

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

            $http.get(url).then(
                function(ngResponse){

                    var response = ngResponse.data;

                    callback(response);
                },
                function(errResponse){
                    callback(errResponse);
                });
        },
        postJson: function (url, data, callback) {

            $http
                .post(url, data)
                .then(
                    function (ngResponse) {
                        var response = ngResponse.data;
                        callback(response);
                    },

                    function(errResponse){
                        callback(errResponse);
                    })
                .catch(
                    function (err) {
                        callback(err);
                    });
            },

        putJson: function (url, data, callback) {

            $http.put(url, data).then(
                function (ngResponse) {
                    var response = ngResponse.data;
                    callback(response);
                },
                function(errResponse){
                    callback(errResponse);
                });
        }
    }
});


