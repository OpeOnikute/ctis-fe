'use strict';

angular.module('myApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'home-view/home.html',
    controller: 'homeCtrl'
  });
}])
.controller('homeCtrl', ['$rootScope', function($rootScope) {
    $rootScope.location = 'home';
}]);