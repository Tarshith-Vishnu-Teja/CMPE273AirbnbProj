var app = angular.module('billApp',[]);
    	app.controller('billController',function($scope,$http){

    		$http({
	            method:"GET",
	            url:"/api/billing/view"
	            }).success(function(data){
	        	if(data.status_code == "200" ){
		        	$scope.property_dtls=data.property_dtls;
		        	$scope.bill_dtls=data.bill_dtls;
		        	$scope.user_dtls=data.user_dtls;
		        	console.log($scope.data);
	        	}
	        	else{
	        		$scope.data=null;	
	        	}
	        })	
    	})
