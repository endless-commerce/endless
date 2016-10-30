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
 * Top-Level fwk Library
 */

var base = require("./base.js");
var cache = require("./cache.js");
var b64 = require("./b64.js");
var lock = require("./lock.js");
var mplex = require("./mplex.js");
var cfg = require("./cfg.js");

exports.method = base.method;
exports.getter = base.getter;
exports.setter = base.setter;
exports.responds = base.responds;
exports.remove = base.remove;
exports.unique = base.unique;
exports.shallow = base.shallow;
exports.clone = base.clone;
exports.mkhash = base.mkhash;
exports.forEach = base.forEach;

exports.cache = cache.cache;

exports.lock = lock.lock;

exports.mplex = mplex.mplex;

exports.populateConfig = cfg.populateConfig;
exports.baseConfig = cfg.baseConfig;

exports.b64encode = b64.b64encode;
exports.b64decode = b64.b64decode;
