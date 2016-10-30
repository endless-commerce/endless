// Copyright Teleportd
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');
var base = require("./base.js");

/**
 * cfg.js
 * 
 * This modules groups a few functions that lets any other module
 * build a config objects from a working directory config.js file
 * (containing default values). This config object is merged with any
 * configuration parameter passed form the command-line or the
 * environment.
 * 
 * Command line objects are passed using the format: 
 * --OPTION_NAME=value
 *
 * Example:
 * =================================
 * var cfg = require("./config.js");
 * my.cfg = fwk.populateConfig(cfg.config);
 * =================================
 * 
 * with './config.js' containing:
 * =================================
 * var fwk = require('fwk');
 * var config = fwk.baseConfig();
 * 
 * config['PIPES_PORT'] = 22222;
 * config['PIPES_TIMEOUT'] = 30000;
 * 
 * exports.config = config;
 * =================================
 */

var parse_arg = /^--([0-9A-Z_]+)=(.+)$/;


/** 
 * populateConfig(baseConfig)
 * Populates a default config object using arguments and env variables. 
 * The default object should be created using this module baseCondig() function
 */
exports.populateConfig = function(config) {  
  process.argv.forEach(function(val, index, array) {
			 var result = parse_arg.exec(val);
			 if(result) {
			   /** we use != here since we might have numerical / string conversion */
			   if(config.hasOwnProperty(result[1]) && 
			      config[result[1]] != result[2]) {
                             if(!config['SILENT_CONFIG'])
			       util.debug('config(arg): ' + result[1] + '=' + config[result[1]] + ' -> ' + result[1] + '=' + result[2]);
			     config[result[1]] = result[2];
			   }			   
			 }			   
		       });
  var env = process.env;
  for(var i in env) {
    if(config.hasOwnProperty(i) && 
       config[i] != process.env[i]) {
      if(!config['SILENT_CONFIG'])
        util.debug('config(env): ' + i + '=' + config[i] + ' -> ' + i + '=' + process.env[i]);
      config[i] = process.env[i];
    }	       
  }
  return config;
};

/**
 * extractArgvs()
 * Helper function to extract command line arguments
 */
exports.extractArgvs = function() {
  var remaining = [];
  process.argv.forEach(function(val, index, array) {
			 var result = parse_arg.exec(val);
			 if(!result) {
			   remaining.push(val);
			 }			   
		       });
  return remaining;  
};

/** 
 * Generates a base config object to be populated by populateConfig()
 */
exports.baseConfig = function() {

  /** 
   * fwk base config 
   */
  var base_config = {
    'SILENT_CONFIG': false,
    'DEBUG': false,
    'HMAC_ALGO': 'sha512',
  };
  
  return base.shallow(base_config);
};
