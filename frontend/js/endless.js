var endless = angular.module('endless', ['ngRoute']);

endless.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "template/home.html"
    })
    .when("/login/", {
        templateUrl : "template/login.html"
    })
    .when("/contact/", {
        templateUrl : "template/contact.html"
    })
    .when("/product/", {
        templateUrl : "template/product.html"
    })
    .when("/single/", {
        templateUrl : "template/single.html"
    })
    .when("/account/", {
        templateUrl : "template/account.html"
    })
    .when("/checkout/", {
        templateUrl : "template/checkout.html"
    })
    .when("/product/:productid?", {
        templateUrl : "template/product.htm",
        controller : "productCtrl"
    })
    .otherwise({
        template : "<div class='container'>404 not found</div>"
    });
    
    $locationProvider.html5Mode(true);
});

/*endless.controller('Hello', function($scope, $http) {
    $http.get('https://jdmkge31x4.execute-api.eu-west-1.amazonaws.com/prod/product/get/1').
        then(function(response) {
            $scope.greeting = response.data;
        });
});*/

endless.controller("productCtrl", function ($scope, $http) {
    $http.get('https://jdmkge31x4.execute-api.eu-west-1.amazonaws.com/prod/product/view/1').
        then(function(response) {
            $scope.product = response.data;
        });
});