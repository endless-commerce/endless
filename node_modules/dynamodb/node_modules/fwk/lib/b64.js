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

/**
 * b64.js
 * 
 * Base 64 number encoding utility functions
 *
 */

/**
 * b64encode(num)
 * Base64 encode an integer
 * @param num the integer
 */
exports.b64encode = function(num) {
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  var res = "";
  var sent = 1;
  while (sent <= num) {
    res = _keyStr.charAt((Math.floor(num / sent) % 64)) + res;
    sent *= 64;
  }
  return res;
};


/**
 * b64decode(num)
 * Base64 decode an integer
 * @param input the b64 encoded number
 */
exports.b64decode = function(input) {	    
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  var res = 0, i = 0;
  while (i < input.length) {
    var enc = _keyStr.indexOf(input.charAt(i));
    res <<= 6;
    res += enc;
    i++;
  }
  return res;
};    
