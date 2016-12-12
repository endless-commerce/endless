'use strict';

const chalk = require('chalk');
const ryml = require('read-yaml');
const aws = require('aws-sdk');
const fs = require('fs');

class DynamoDbLoadDataPlugin {
  
  constructor() {
    this.commands = {
      deploy: {
        commands: {
          data: {
            usage: 'Deploy data to DynamoDB',
            lifecycleEvents: [
              'deploy-db'
            ],
          },
        },
      },
    };  
      
    this.hooks = {
      'deploy:data:deploy-db': this.deployDataToDynamoDB,
    };
  }

  deployDataToDynamoDB() {
    var endlessConfig = ryml.sync('config/config.yml'); 
    var serverlessConfig = ryml.sync('serverless.yml');
    aws.config.update({
      region: serverlessConfig.provider.region
    });
    var dynamoClient = new aws.DynamoDB.DocumentClient();
  
    console.log("Importing products into DynamoDB. Please wait.");
    var products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
    products.forEach(function(product) {
        var params = {
            TableName: endlessConfig.dynamodb.prefix+"-product",
            Item: product
        };
    
        dynamoClient.put(params, function(err, data) {
           if (err) {
               console.error("Unable to add products", product.productID, ". Error JSON:", JSON.stringify(err, null, 2));
           } else {
               console.log("PutItem succeeded:", product.productID);
           }
        });
    });

  }
}

module.exports = DynamoDbLoadDataPlugin;