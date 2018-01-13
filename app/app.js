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
    'ngSanitize',
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
        resolve: loadSequence('toaster', 'mainCtrl', 'driverDirectives'),
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
        resolve: loadSequence('driverShuttleTableCtrl'),
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
    }).state('admin', {
        url: "/admin",
        templateUrl: 'components/admin/views/index.html',
        resolve: loadSequence('toaster', 'adminMainCtrl', 'adminDirectives'),
        redirectTo: "/admin/dashboard"
    }).state('admin.login', {
        url: "/login",
        templateUrl: 'components/admin/views/login.html',
        title: 'Admin - Login'
    }).state('admin.signup', {
        url: "/signup",
        templateUrl: 'components/admin/views/signup.html',
        title: 'Admin - Sign Up'
    }).state('admin.dashboard', {
        url: "/dashboard",
        templateUrl: 'components/admin/views/app.html',
        abstract: true
    }).state('admin.dashboard.home', {
        url: "",
        templateUrl: 'components/admin/views/dashboard.html',
        title: 'Admin - Dashboard'
    }).state('admin.dashboard.shuttles', {
        url: "/shuttles",
        title: 'Admin - Shuttles',
        resolve: loadSequence('adminTableCtrl'),
        ncyBreadcrumb: {
            label: 'Shuttles'
        }
    }).state('admin.dashboard.shuttles.manage', {
        url: "/manage",
        templateUrl: 'components/admin/views/manageShuttles.html',
        title: 'Admin - Manage Shuttles'
    }).state('admin.dashboard.shuttles.add', {
        url: "/add",
        templateUrl: 'components/admin/views/addShuttle.html',
        resolve: loadSequence('ui.select'),
        title: 'Admin - Add New Shuttle'
    }).state('admin.dashboard.users', {
        url: "/users",
        title: 'Admin - Users',
        resolve: loadSequence('adminTableCtrl'),
        ncyBreadcrumb: {
            label: 'Shuttles'
        }
    }).state('admin.dashboard.users.manage', {
        url: "/manage",
        templateUrl: 'components/admin/views/manageUsers.html',
        title: 'Admin - Manage users'
    }).state('admin.dashboard.users.add', {
        url: "/add",
        templateUrl: 'components/admin/views/addUser.html',
        resolve: loadSequence('ui.select'),
        title: 'Admin - Add New User'
    }).state('admin.dashboard.locations', {
        url: "/locations",
        title: 'Admin - Locations',
        resolve: loadSequence('adminTableCtrl'),
        ncyBreadcrumb: {
            label: 'Shuttles'
        }
    }).state('admin.dashboard.locations.manage', {
        url: "/manage",
        templateUrl: 'components/admin/views/manageLocations.html',
        title: 'Admin - Manage locations'
    }).state('admin.dashboard.locations.add', {
        url: "/add",
        templateUrl: 'components/admin/views/addLocation.html',
        resolve: loadSequence('ui.select'),
        title: 'Admin - Add New Location'
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

function requireAuth($rootScope, $state, $transitions, $location, stateName) {
    $transitions.onBefore( { to: stateName + '.**' }, function(trans) {
        var authProvider = trans.injector().get('authProvider');
        // If isAuthenticated returns false, the transition is cancelled.
        $rootScope.redirectUrl = '/'+ stateName + '/dashboard';

        var toState = trans.to();

        if (!authProvider.isLoggedIn()) {
            //allow only the signup page to be accessed

            if (toState.name !== stateName + '.signup') {
                $location.path('/' + stateName +'/login');
            }
        }
    });
}

app.run(['$rootScope', '$state', '$stateParams', '$location', '$trace', '$transitions',
    function ($rootScope, $state, $stateParams, $location, $trace, $transitions) {

        requireAuth($rootScope, $state, $transitions, $location, 'driver');
        requireAuth($rootScope, $state, $transitions, $location, 'admin');

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
            pollIntervalLength: 30000,
            locationTypes: ['bus_stop', 'building'],
            icons: {
                shuttle: '/img/icons/ic_directions_bus_black.png',
                driving: '/img/icons/ic_directions_car_black.png',
                transit: '/img/icons/ic_directions_bus_black.png',
                user: '/img/icons/ic_person_pin_circle.png',
                building: '/img/icons/building.png',
                walking: '/img/icons/ic_directions_walk_black.png',
                busStop: '/img/icons/bus-stop-1.png'
            }
        };

        $trace.enable('TRANSITION');
    }]);

app.config(function(blockUIConfig) {
    // Disable automatically blocking of the user interface
    blockUIConfig.autoBlock = false;
 });

app.filter('capitalize', function() {
    return function(input) {
        if (input === 'N/A') return input;
        input = input.replace('_', ' ');
        return (input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : 'N/A';
    }
});

app.service('Map', function() {

    var self = this;

    self.init = function(next, after) {

        var options = {
            center: new google.maps.LatLng(6.670385, 3.158345), //center of the map is the chapel
            zoom: 18
        };

        self.map = new google.maps.Map(
            document.getElementById("map"), options
        );

        if (next) {
            next(after);
        }
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

    self.addMarker = function(long, lat, title, content, icon) {

        var marker = new google.maps.Marker({
            map: self.map,
            position: {lat: lat, lng: long},
            animation: google.maps.Animation.DROP,
            title: title,
            icon: icon || null
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

    self.setCenter = function (lng, lat) {
        self.map.setCenter(new google.maps.LatLng(lat,lng));
    }
});

app.service('geoLocator', function () {

    var self = this;

    self.getCurrentLocation = function (callback, errCallback) {

        if (!navigator.geolocation) {
            return callback(false);
        }

        //returns position.coords.latitude and position.coords.longitude
        //provide the same callback as both success and error callback
        return navigator.geolocation.getCurrentPosition(callback, errCallback);
    }
});

app.factory('modalHelper', function ($uibModal) {

    return {
        openModal: function (options) {
            return $uibModal.open({
                animation: options.animationsEnabled || true,
                templateUrl: options.templateUrl,
                controller: options.controller,
                size: options.size,
                resolve: options.locals || {}
            });
        },
        dismissModal:  function ($uibModalInstance, reason) {
            return $uibModalInstance.dismiss(reason);
        },
        closeModal:  function ($uibModalInstance, selected) {
            return $uibModalInstance.close(selected);
        }
    };
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

app.factory('helpers', function ($rootScope, $filter) {
    return {
        parseDirectionContent: function (directions) {

            var str = '<div class="line-bottom">' +
                '<h4 class="cu-txt-header">Directions</h4>' +
                '</div>';

            if (!directions) return '';

            //ensure it's not empty
            if (angular.equals(directions, {})) return '';

            for (var direction in directions) {
                if (!directions.hasOwnProperty(direction)) continue;

                var routes = directions[direction]['routes'];

                if (!routes) continue;

                if (routes.length <= 0) continue;

                str +=' <div class="pad-vertical">' +
                    '<p class="cu-txt-header"><strong>' +  $filter('capitalize')(direction) + '</strong> <span><img class="direction-image" src="' + $rootScope.app.icons[direction] + '"></span></p>' +
                    '<p>' +
                    '<small><strong>Routes:</strong> ' + routes.length + '</small>' +
                    '</p>' +
                    '<small>' +
                    '<ul>';

                for (var routeIndex in routes) {

                    if (!routes.hasOwnProperty(routeIndex)) continue;

                    var route = routes[routeIndex];

                    str += '<li>' +
                        '<p><strong>Distance:</strong> ' + route.distance.text + '</p>' +
                        '<p><strong>Duration:</strong> ' + route.duration.text + '</p>' +
                        // '<p><strong>Instructions:</strong> <p>' + route.html_instructions + '</p></p>' +
                        '</li>';
                }

                str += '</ul>' +
                    '</small>' +
                    '</div>';
            }

            return str;
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


