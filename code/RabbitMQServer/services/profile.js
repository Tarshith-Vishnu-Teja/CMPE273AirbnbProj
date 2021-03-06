var tool = require("../utili/common");
ObjectID = require('mongodb').ObjectID;
var redis = require('../db/redis');
var mysql = require('../db/mysql');
var sql_queries = require('../db/sql_queries');
var updateProfile = {
		handle_request : function (connection, msg, callback){
		var res = {};
		var obj_id = new ObjectID(msg.user_id);
		var coll = connection.mongoConn.collection('users');
		try{
			coll.update({"_id" :obj_id},{$set:{
				"email": msg.email, 
    			"first_name": msg.firstName, 
    			"last_name": msg.lastName,
    			"dob":msg.Dob,
    			"street":msg.street,
				"aptNum":msg.aptNum,
				"city":msg.city,
				"state":msg.state,
				"zipcode":msg.zipcode,
				"phone":msg.phoneNumber,
				"ssn":msg.ssn,
				"last_update_date":new Date()
				}
			}, function(err, user){
				if(err){
					res.code= "400";
					callback(null, res);
				}
				else
				{
					mysql.execute_query(function (err, result) {
		                if(err){
		                	res.code= "400";
		                	tool.logError(err);
							callback(null, res);
		                }
		                else {
		                	JSON.stringify("In RabbitMQ : trip.js : updateTrip :result of creating a new bill : " + JSON.stringify(res)) ;
		                	res.code= "200";
							callback(null, res);
		                }
		            },sql_queries.UPDATE_GUESTNAME_IN_TRIP,[ msg.firstName, msg.user_id]);
					
					
				}
			});
		}
		catch(err){
			res.code = "500";
			callback(null, res);
		}
	}
};

var userInfo = {
		handle_request : function (connection, msg, callback){
		var res = {};
		var obj_id = new ObjectID(msg.user_id);
		var coll = connection.mongoConn.collection('users');
		try{

			redis.getJsonFromRedis(msg.user_id, function(error, results){
				if(error || results == null){
					coll.findOne({"_id":obj_id}, function(err, user){
						if(err){
							res.code ="401";
							callback(null, res);
				    	}
						else if(user != null){
							redis.storeJsonInRedis(msg.user_id, user);
							res.code ="200";
							res.user = user;
							callback(null, res);
				    	}
						else{
							res.code ="500";
							callback(null, res);
						}
		    		});
				}
				else{
					res.code ="200";
					res.user = results;
					callback(null, res);
				}
			})
			
		}
		catch(err){
			res.statusCode = "400";
			callback(null, res);
		}
	}
};

var deleteUser = {
		handle_request : function (connection, msg, callback){
		var res = {};
		var obj_id = new ObjectID(msg.user_id);
		var coll = connection.mongoConn.collection('users');
		try{
			coll.update({"_id" :obj_id},{$set:{
				"is_active": "N"}
			}, function(err, user){
				if(err){
					res.code= "400";
					callback(null, res);
				}
				else{
				var coll2 = connection.mongoConn.collection('property');
				coll2.update({"host_id" :msg.user_id},{$set:{
					host_status: "REJECTED"},
				}, { multi: true },function(err, results){
				if(err){
					res.code= "400";
					callback(null, res);
				}
				else
				{
					res.code= "200";
					callback(null, res);
				}
				});
				}
			});
		}
		catch(err){
			res.statusCode = "400";
			callback(null, res);
		}
	}
}


var uploadPic = {
		handle_request : function (connection, msg, callback){
		var res = {};
		var obj_id = new ObjectID(msg.user_id);
		var coll = connection.mongoConn.collection('users');
		try{
			coll.update({"_id" :obj_id},{$set:{
				"picture_path": msg.picture_path
				}
			}, function(err, user){
				if(err){
					res.code= "400";
					callback(null, res);
				}
				else
				{
					res.code= "200";
					callback(null, res);
				}
			});
		}
		catch(err){
			res.code = "500";
			callback(null, res);
		}
	}
};
var uploadvideo = {
	handle_request : function (connection, msg, callback){
		var res = {};
		var obj_id = new ObjectID(msg.user_id);
		var coll = connection.mongoConn.collection('users');
		try{
			coll.update({"_id" :obj_id},{$set:{
				"video_path": msg.video_path
			}
			}, function(err, user){
				if(err){
					res.code= "400";
					callback(null, res);
				}
				else
				{
					res.code= "200";
					callback(null, res);
				}
			});
		}
		catch(err){
			res.code = "500";
			callback(null, res);
		}
	}
};
var reloadUser = {
	handle_request : function (connection, msg, callback){
		var res = {};
		console.log(msg);
		var obj_id = new ObjectID(msg.user_id);
		
		var coll = connection.mongoConn.collection('users');
		coll.findOne({"_id" :obj_id},
		function(err, user, id){
			if(err){
				tool.logError(err);
			}
			else {
				res.code = "200";
				res.value = user;
			}
			callback(null, res);
		});
	}
};

var getUserDetails = {
	handle_request : function (connection, msg, callback){
		var res = {};
		var obj_id = new ObjectID(msg.user_id);
		
		var users = connection.mongoConn.collection('users');
		var property = connection.mongoConn.collection('property');
		users.findOne({"_id" :obj_id}, function(err, user, id1){
			if(err){
				tool.logError(err);
				res.code = "400";
				callback(null, res);
			}
			else {
				res.user = user;
				property.find({host_id : msg.user_id}).toArray(function(error, properties, id2){
					if(error){
						tool.logError(err);
						res.code = "400";
						callback(null, res);
					}
					else{
						res.code = "200";
						res.properties = properties;
						res.user = user;
						callback(null, res);
					}
				})
			}
		});
	}
}

var updateCardDetails = {
		handle_request : function (connection, msg, callback){
			var res = {};
			var coll = connection.mongoConn.collection('users');
        	var obj_id = new ObjectID(msg.user_id);
        	coll.update({"_id" :obj_id},{$set:{
				"payment_details": msg.payment_details
				}
			}, function(err, user){
				if(err){
					res = {"statusCode" : 400};
                    callback(null, res);
				}
				else
				{
					res = {"statusCode" : 200};
                    callback(null, res);
				}
			});
		}
	}

exports.updateCardDetails= updateCardDetails;
exports.uploadvideo = uploadvideo;
exports.updateProfile = updateProfile;
exports.userInfo =userInfo ;
exports.deleteUser = deleteUser;
exports.uploadPic =uploadPic;
exports.reloadUser = reloadUser;
exports.getUserDetails = getUserDetails;