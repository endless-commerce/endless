'use strict';

const chalk = require('chalk');
const s3 = require('s3');
const ryml = require('read-yaml');
const url = require('url');

class S3DeployPlugin {
  
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    
    this.commands = {
      deploy: {
        commands: {
          frontend: {
            usage: 'Deploy frontend to S3',
            lifecycleEvents: [
              'deploy-s3'
            ],
          },
        },
      },
    };  
      
    this.hooks = {
      'deploy:frontend:deploy-s3': this.afterDeployDeployToS3,
      'after:deploy:deploy': this.afterDeployDeployToS3,
      'before:remove:remove': this.beforeRemoveRemoveS3
    };
  }

  afterDeployDeployToS3() {      
    var endlessConfig = ryml.sync('config/config.yml'); 
    var serverlessConfig = ryml.sync('serverless.yml');    
	var s3client = s3.createClient();
	var s3params = {
	  localDir: endlessConfig.s3.localDir,
	  deleteRemoved: true, 
	  s3Params: {
	    Bucket: endlessConfig.s3.bucketName,
	    Prefix: "",
	    ACL: endlessConfig.s3.acl
	  },
	};
	var uploader = s3client.uploadDir(s3params);
	
    console.log(`Endless: ${chalk.yellow('Uploading frontend to S3...')}`);
	uploader.on('progress', function() {
	  process.stdout.write(`${chalk.yellow('.')}`);
	});
	
	uploader.on('end', function() {
	  let url = getWebsiteUrlHttp(endlessConfig.s3.bucketName,serverlessConfig.provider.region);		
	  let message = `
	  
${chalk.yellow.underline('Endless Information')}
${chalk.yellow('frontend:')} ${url}`;
	  console.log(message);
	});
  }
  
  beforeRemoveRemoveS3() {
    var endlessConfig = ryml.sync('config/config.yml');
	var s3client = s3.createClient();
	var s3params = {
	    Bucket: endlessConfig.s3.bucketName,
	    Prefix: ""
	};
	          
    console.log(`Endless: ${chalk.yellow('Remove objects in S3 frontend bucket...')}`);
    s3client.deleteDir(s3params);
  }
  
}

module.exports = S3DeployPlugin;


function getWebsiteUrlHttp(bucket, endpoint) {
  var parts = {
    protocol: "http:",
    hostname: bucket + '.s3-website-' + endpoint + ".amazonaws.com",
  };
  return url.format(parts);
}