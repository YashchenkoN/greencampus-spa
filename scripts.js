var greenCampusApp = angular.module('greenCampusApp', ['ngRoute']);
var server = 'http://localhost:8080';
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

var localStorageManager = {
    setValue: function(key, value) {
        window.localStorage.setItem(key, JSON.stringify(value));
    },
    getValue: function(key) {
        try {
            return JSON.parse(window.localStorage.getItem(key));
        } catch (e) {

        }
    },
    clear: function() {
    	window.localStorage.clear();
    }
};

greenCampusApp.config(function($routeProvider) {
    $routeProvider
		.when('/', {
            templateUrl : 'pages/home.html',
            controller  : 'mainController'
        })
		.when('/about', {
        	templateUrl : 'pages/about.html'
        })
        .when('/course/all', {
 			templateUrl : 'pages/courses.html',
            controller  : 'CoursesController'
        })
        .when('/course/:courseId', {
        	templateUrl : 'pages/course.html',
        	controller : 'CourseController'
        })
        .when('/users', {
        	templateUrl : 'pages/users.html',
        	controller : 'UsersController'
        })
        .when('/user/:userId', {
        	templateUrl : 'pages/user.html',
        	controller : 'UserController'
        })
        .when('/login', {
        	templateUrl : 'pages/login.html'
        });
    }
);

greenCampusApp.controller('LayoutController', function ($scope, $window) {
	var current = localStorageManager.getValue("authenticated");
	if (!current) {
		localStorageManager.setValue("authenticated", false);
	}
	console.log(localStorageManager.getValue("authenticated"));
	$scope.authenticated = localStorageManager.getValue("authenticated");
});

greenCampusApp.controller('mainController', function($scope, $http) {
	var campus = this;
    campus.courses = [];
    $http.get(server + '/api/course/?size=3').success(function (data) {
        campus.courses = data.entities;
        console.log(data.entities);
    });
});

greenCampusApp.controller('CoursesController', function($scope, $http) {
	var campus = this;
    campus.courses = [];
    $http.get(server + '/api/course/').success(function (data) {
        campus.courses = chunk(data.entities, 3);
    });
});

greenCampusApp.controller('CourseController', function($scope, $http, $routeParams) {
	var campus = this;
    campus.course = [];
    $http.get(server + '/api/course/' + $routeParams.courseId).success(function (data) {
        campus.course = data.entity;
        console.log(data.entity);
    });
});

greenCampusApp.controller('UsersController', function($scope, $http) {
	var campus = this;
    campus.users = [];
    $http.get(server + '/api/user/').success(function (data) {
        campus.users = chunk(data.entities, 4);
    });
});

greenCampusApp.controller('UserController', function($scope, $http, $routeParams) {
	var campus = this;
    campus.course = [];
    $http.get(server + '/api/user/' + $routeParams.userId).success(function (data) {
        campus.user = data.entity;
    });
});

greenCampusApp.controller('LoginController', function($scope, $http, $location, $window) {
	$scope.login = function () {
		console.log(Base64.encode($scope.email + ':' + $scope.password));
		$http.defaults.headers.post.Authorization = 'Basic ' + Base64.encode($scope.email + ':' + $scope.password);
		$http.post(server + '/login/http-basic', {
			headers: { 'Authorization' : 'Basic ' + Base64.encode($scope.email + ':' + $scope.password) }
		})
		.success(function (data) {
			if (data) {
				localStorageManager.setValue("authenticated", true);
				localStorageManager.setValue("user", data);
				console.log(data);
				$window.location.reload();
			} else {
				console.log('error');
				$http.defaults.headers.post.Authorization = null;
			}
		})
		.error(function (err) {
			console.log('bad credentials');
			$http.defaults.headers.post.Authorization = null;
		});
	}

	if (localStorageManager.getValue("authenticated")) {
		$location.path('/');
	}
});

greenCampusApp.controller('LogoutController', function($scope, $window) {
	$scope.logout = function() {
		localStorageManager.clear();
		$window.location.reload();
	}
});

function chunk(arr, size) {
	var newArr = [];
    for (var i = 0; i < arr.length; i += size) {
    	newArr.push(arr.slice(i, i + size));
    }
    return newArr;
}