'use strict';

const aws = require('aws-sdk');

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);
};


module.exports.view = (event, context, callback) => {
        
    var docClient = new aws.DynamoDB.DocumentClient()
    
    var table = "dev-demostore-product";
    var title = event.path.urlkey;
    
    var params = {
        TableName: table,
        Key:{
            "productID": title
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            callback(null, JSON.stringify(data, null, 2));
        }
    }); 

};
