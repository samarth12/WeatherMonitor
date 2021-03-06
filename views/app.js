var app = angular.module('app', ['ngRoute', 'ngResource', 'ngStorage']);

app.factory('Weather', ['$resource', function($resource){
  return $resource('/Weather/:id', null, {
    'update': { method:'PUT' }
  });
}]);

app.controller('weatherController', ['$scope', 'Weather', '$http', '$localStorage', '$sessionStorage', function($scope, Weather, $http, $localStorage, $sessionStorage){
	//Page load actions
	$scope.dataArray =[];

	$scope.isError = false;
	$scope.errorMsg = "";
	
	if($localStorage.cityList == undefined){
		$localStorage.cityList = [];
	}

	$scope.word = /^[\A-Za-z ]*$/;
	
	$scope.add = function() {
		
		if($scope.cityName == undefined){
			$scope.isError = true;
			$scope.errorMsg = "Invalid location name";

		} else {
			fetchWeatherRecordsForCity($scope.cityName);
		}
		
	}

	fetchWeatherRecordsForCity = function(city){
		$http({method: 'GET', url: '/fetch/'+city}).
		  success(function(data, status, headers, config) {
		    // this callback will be called asynchronously
		    // when the response is available

		    if(data.cod==404){
		    	$scope.isError = true;
				$scope.errorMsg = data.message;
		    } else {
		    	$scope.isError = false;
				$scope.errorMsg = "";
		    }

		    if(data.name!=null && $localStorage.cityList.indexOf(data.name) == -1){
				$localStorage.cityList.push(data.name);
			}

		    var temp = data.main.temp - 273.15;
		    var temp_min = data.main.temp_min - 273.15;
		    var temp_max = data.main.temp_max - 273.15;
		    var humidity = data.main.humidity;
		    var windspeed = data.wind.speed;
		    var name = data.name;

		    var json = {
		    	"temp": temp.toFixed(0),
		    	"temp_min": temp_min.toFixed(0),
		    	"temp_max": temp_max.toFixed(0),
		    	"humidity": humidity,
		    	"windspeed": windspeed,
		    	"name": name,
		    	"description": data.weather[0].description
		    };

		    for(var i=0; i<$scope.dataArray.length; i++){
		    	if($scope.dataArray[i].name == name){
		    		$scope.dataArray.splice(i, 1);
		    	}
		    }

		    $scope.dataArray.push(json);

		    $scope.cityName = '';
		    
		  }).
		  error(function(data, status, headers, config) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		    console.log('error');
		  });
	}

	$scope.removeCity = function(city){
		for(var i=0; i<$scope.dataArray.length; i++){
		    	if($scope.dataArray[i].name == city){
		    		$scope.dataArray.splice(i, 1);
		    	}
		    }

		for(var i=0; i<$localStorage.cityList.length; i++){
			console.log($localStorage.cityList[i]);
		    	if($localStorage.cityList[i] != null && $localStorage.cityList[i].toUpperCase() == city.toUpperCase()){
		    		$localStorage.cityList.splice(i, 1);
		    	}
		    }
	}


	onPageLoad = function(){
		angular.forEach($localStorage.cityList, function(city){
			fetchWeatherRecordsForCity(city);
		})
	};
	onPageLoad();

	
}]);
