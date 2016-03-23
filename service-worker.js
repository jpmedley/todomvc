/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren */
'use strict';


// *** Start of auto-included sw-toolbox code. ***
/*
  Copyright 2014 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.toolbox = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";function debug(e,n){n=n||{};var t=n.debug||globalOptions.debug;t&&console.log("[sw-toolbox] "+e)}function openCache(e){var n;return e&&e.cache&&(n=e.cache.name),n=n||globalOptions.cache.name,caches.open(n)}function fetchAndCache(e,n){n=n||{};var t=n.successResponses||globalOptions.successResponses;return fetch(e.clone()).then(function(c){return"GET"===e.method&&t.test(c.status)&&openCache(n).then(function(t){t.put(e,c).then(function(){var c=n.cache||globalOptions.cache;(c.maxEntries||c.maxAgeSeconds)&&c.name&&queueCacheExpiration(e,t,c)})}),c.clone()})}function queueCacheExpiration(e,n,t){var c=cleanupCache.bind(null,e,n,t);cleanupQueue=cleanupQueue?cleanupQueue.then(c):c()}function cleanupCache(e,n,t){var c=e.url,a=t.maxAgeSeconds,u=t.maxEntries,o=t.name,r=Date.now();return debug("Updating LRU order for "+c+". Max entries is "+u+", max age is "+a),idbCacheExpiration.getDb(o).then(function(e){return idbCacheExpiration.setTimestampForUrl(e,c,r)}).then(function(e){return idbCacheExpiration.expireEntries(e,u,a,r)}).then(function(e){debug("Successfully updated IDB.");var t=e.map(function(e){return n["delete"](e)});return Promise.all(t).then(function(){debug("Done with cache cleanup.")})})["catch"](function(e){debug(e)})}function renameCache(e,n,t){return debug("Renaming cache: ["+e+"] to ["+n+"]",t),caches["delete"](n).then(function(){return Promise.all([caches.open(e),caches.open(n)]).then(function(n){var t=n[0],c=n[1];return t.keys().then(function(e){return Promise.all(e.map(function(e){return t.match(e).then(function(n){return c.put(e,n)})}))}).then(function(){return caches["delete"](e)})})})}var globalOptions=require("./options"),idbCacheExpiration=require("./idb-cache-expiration"),cleanupQueue;module.exports={debug:debug,fetchAndCache:fetchAndCache,openCache:openCache,renameCache:renameCache};
},{"./idb-cache-expiration":2,"./options":3}],2:[function(require,module,exports){
"use strict";function openDb(e){return new Promise(function(r,n){var t=indexedDB.open(DB_PREFIX+e,DB_VERSION);t.onupgradeneeded=function(){var e=t.result.createObjectStore(STORE_NAME,{keyPath:URL_PROPERTY});e.createIndex(TIMESTAMP_PROPERTY,TIMESTAMP_PROPERTY,{unique:!1})},t.onsuccess=function(){r(t.result)},t.onerror=function(){n(t.error)}})}function getDb(e){return e in cacheNameToDbPromise||(cacheNameToDbPromise[e]=openDb(e)),cacheNameToDbPromise[e]}function setTimestampForUrl(e,r,n){return new Promise(function(t,o){var i=e.transaction(STORE_NAME,"readwrite"),u=i.objectStore(STORE_NAME);u.put({url:r,timestamp:n}),i.oncomplete=function(){t(e)},i.onabort=function(){o(i.error)}})}function expireOldEntries(e,r,n){return r?new Promise(function(t,o){var i=1e3*r,u=[],c=e.transaction(STORE_NAME,"readwrite"),s=c.objectStore(STORE_NAME),a=s.index(TIMESTAMP_PROPERTY);a.openCursor().onsuccess=function(e){var r=e.target.result;if(r&&n-i>r.value[TIMESTAMP_PROPERTY]){var t=r.value[URL_PROPERTY];u.push(t),s["delete"](t),r["continue"]()}},c.oncomplete=function(){t(u)},c.onabort=o}):Promise.resolve([])}function expireExtraEntries(e,r){return r?new Promise(function(n,t){var o=[],i=e.transaction(STORE_NAME,"readwrite"),u=i.objectStore(STORE_NAME),c=u.index(TIMESTAMP_PROPERTY),s=c.count();c.count().onsuccess=function(){var e=s.result;e>r&&(c.openCursor().onsuccess=function(n){var t=n.target.result;if(t){var i=t.value[URL_PROPERTY];o.push(i),u["delete"](i),e-o.length>r&&t["continue"]()}})},i.oncomplete=function(){n(o)},i.onabort=t}):Promise.resolve([])}function expireEntries(e,r,n,t){return expireOldEntries(e,n,t).then(function(n){return expireExtraEntries(e,r).then(function(e){return n.concat(e)})})}var DB_PREFIX="sw-toolbox-",DB_VERSION=1,STORE_NAME="store",URL_PROPERTY="url",TIMESTAMP_PROPERTY="timestamp",cacheNameToDbPromise={};module.exports={getDb:getDb,setTimestampForUrl:setTimestampForUrl,expireEntries:expireEntries};
},{}],3:[function(require,module,exports){
"use strict";var scope;scope=self.registration?self.registration.scope:self.scope||new URL("./",self.location).href,module.exports={cache:{name:"$$$toolbox-cache$$$"+scope+"$$$",maxAgeSeconds:null,maxEntries:null},debug:!1,networkTimeoutSeconds:null,preCacheItems:[],successResponses:/^0|([123]\d\d)|(40[14567])|410$/};
},{}],4:[function(require,module,exports){
"use strict";var url=new URL("./",self.location),basePath=url.pathname,pathRegexp=require("path-to-regexp"),Route=function(e,t,i,s){t instanceof RegExp?this.fullUrlRegExp=t:(0!==t.indexOf("/")&&(t=basePath+t),this.keys=[],this.regexp=pathRegexp(t,this.keys)),this.method=e,this.options=s,this.handler=i};Route.prototype.makeHandler=function(e){var t;if(this.regexp){var i=this.regexp.exec(e);t={},this.keys.forEach(function(e,s){t[e.name]=i[s+1]})}return function(e){return this.handler(e,t,this.options)}.bind(this)},module.exports=Route;
},{"path-to-regexp":13}],5:[function(require,module,exports){
"use strict";function regexEscape(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}var Route=require("./route"),keyMatch=function(e,t){for(var r=e.entries(),o=r.next();!o.done;){var n=new RegExp(o.value[0]);if(n.test(t))return o.value[1];o=r.next()}return null},Router=function(){this.routes=new Map,this["default"]=null};["get","post","put","delete","head","any"].forEach(function(e){Router.prototype[e]=function(t,r,o){return this.add(e,t,r,o)}}),Router.prototype.add=function(e,t,r,o){o=o||{};var n;t instanceof RegExp?n=RegExp:(n=o.origin||self.location.origin,n=n instanceof RegExp?n.source:regexEscape(n)),e=e.toLowerCase();var u=new Route(e,t,r,o);this.routes.has(n)||this.routes.set(n,new Map);var a=this.routes.get(n);a.has(e)||a.set(e,new Map);var s=a.get(e),i=u.regexp||u.fullUrlRegExp;s.set(i.source,u)},Router.prototype.matchMethod=function(e,t){var r=new URL(t),o=r.origin,n=r.pathname;return this._match(e,keyMatch(this.routes,o),n)||this._match(e,this.routes.get(RegExp),t)},Router.prototype._match=function(e,t,r){if(t){var o=t.get(e.toLowerCase());if(o){var n=keyMatch(o,r);if(n)return n.makeHandler(r)}}return null},Router.prototype.match=function(e){return this.matchMethod(e.method,e.url)||this.matchMethod("any",e.url)},module.exports=new Router;
},{"./route":4}],6:[function(require,module,exports){
"use strict";function cacheFirst(e,r,t){return helpers.debug("Strategy: cache first ["+e.url+"]",t),helpers.openCache(t).then(function(r){return r.match(e).then(function(r){return r?r:helpers.fetchAndCache(e,t)})})}var helpers=require("../helpers");module.exports=cacheFirst;
},{"../helpers":1}],7:[function(require,module,exports){
"use strict";function cacheOnly(e,r,c){return helpers.debug("Strategy: cache only ["+e.url+"]",c),helpers.openCache(c).then(function(r){return r.match(e)})}var helpers=require("../helpers");module.exports=cacheOnly;
},{"../helpers":1}],8:[function(require,module,exports){
"use strict";function fastest(e,n,t){return helpers.debug("Strategy: fastest ["+e.url+"]",t),new Promise(function(r,s){var c=!1,o=[],a=function(e){o.push(e.toString()),c?s(new Error('Both cache and network failed: "'+o.join('", "')+'"')):c=!0},h=function(e){e instanceof Response?r(e):a("No result returned")};helpers.fetchAndCache(e.clone(),t).then(h,a),cacheOnly(e,n,t).then(h,a)})}var helpers=require("../helpers"),cacheOnly=require("./cacheOnly");module.exports=fastest;
},{"../helpers":1,"./cacheOnly":7}],9:[function(require,module,exports){
module.exports={networkOnly:require("./networkOnly"),networkFirst:require("./networkFirst"),cacheOnly:require("./cacheOnly"),cacheFirst:require("./cacheFirst"),fastest:require("./fastest")};
},{"./cacheFirst":6,"./cacheOnly":7,"./fastest":8,"./networkFirst":10,"./networkOnly":11}],10:[function(require,module,exports){
"use strict";function networkFirst(e,r,t){t=t||{};var s=t.successResponses||globalOptions.successResponses,n=t.networkTimeoutSeconds||globalOptions.networkTimeoutSeconds;return helpers.debug("Strategy: network first ["+e.url+"]",t),helpers.openCache(t).then(function(r){var o,u,c=[];if(n){var i=new Promise(function(t){o=setTimeout(function(){r.match(e).then(function(e){e&&t(e)})},1e3*n)});c.push(i)}var a=helpers.fetchAndCache(e,t).then(function(e){if(o&&clearTimeout(o),s.test(e.status))return e;throw helpers.debug("Response was an HTTP error: "+e.statusText,t),u=e,new Error("Bad response")})["catch"](function(){return helpers.debug("Network or response error, fallback to cache ["+e.url+"]",t),r.match(e).then(function(e){return e||u})});return c.push(a),Promise.race(c)})}var globalOptions=require("../options"),helpers=require("../helpers");module.exports=networkFirst;
},{"../helpers":1,"../options":3}],11:[function(require,module,exports){
"use strict";function networkOnly(e,r,t){return helpers.debug("Strategy: network only ["+e.url+"]",t),fetch(e)}var helpers=require("../helpers");module.exports=networkOnly;
},{"../helpers":1}],12:[function(require,module,exports){
"use strict";function cache(e,t){return helpers.openCache(t).then(function(t){return t.add(e)})}function uncache(e,t){return helpers.openCache(t).then(function(t){return t["delete"](e)})}function precache(e){Array.isArray(e)||(e=[e]),options.preCacheItems=options.preCacheItems.concat(e)}require("serviceworker-cache-polyfill");var options=require("./options"),router=require("./router"),helpers=require("./helpers"),strategies=require("./strategies");helpers.debug("Service Worker Toolbox is loading");var flatten=function(e){return e.reduce(function(e,t){return e.concat(t)},[])};self.addEventListener("install",function(e){var t=options.cache.name+"$$$inactive$$$";helpers.debug("install event fired"),helpers.debug("creating cache ["+t+"]"),e.waitUntil(helpers.openCache({cache:{name:t}}).then(function(e){return Promise.all(options.preCacheItems).then(flatten).then(function(t){return helpers.debug("preCache list: "+(t.join(", ")||"(none)")),e.addAll(t)})}))}),self.addEventListener("activate",function(e){helpers.debug("activate event fired");var t=options.cache.name+"$$$inactive$$$";e.waitUntil(helpers.renameCache(t,options.cache.name))}),self.addEventListener("fetch",function(e){var t=router.match(e.request);t?e.respondWith(t(e.request)):router["default"]&&"GET"===e.request.method&&e.respondWith(router["default"](e.request))}),module.exports={networkOnly:strategies.networkOnly,networkFirst:strategies.networkFirst,cacheOnly:strategies.cacheOnly,cacheFirst:strategies.cacheFirst,fastest:strategies.fastest,router:router,options:options,cache:cache,uncache:uncache,precache:precache};
},{"./helpers":1,"./options":3,"./router":5,"./strategies":9,"serviceworker-cache-polyfill":15}],13:[function(require,module,exports){
function parse(e){for(var t,r=[],n=0,o=0,p="";null!=(t=PATH_REGEXP.exec(e));){var a=t[0],i=t[1],s=t.index;if(p+=e.slice(o,s),o=s+a.length,i)p+=i[1];else{p&&(r.push(p),p="");var u=t[2],c=t[3],l=t[4],f=t[5],g=t[6],x=t[7],h="+"===g||"*"===g,m="?"===g||"*"===g,y=u||"/",T=l||f||(x?".*":"[^"+y+"]+?");r.push({name:c||n++,prefix:u||"",delimiter:y,optional:m,repeat:h,pattern:escapeGroup(T)})}}return o<e.length&&(p+=e.substr(o)),p&&r.push(p),r}function compile(e){return tokensToFunction(parse(e))}function tokensToFunction(e){for(var t=new Array(e.length),r=0;r<e.length;r++)"object"==typeof e[r]&&(t[r]=new RegExp("^"+e[r].pattern+"$"));return function(r){for(var n="",o=r||{},p=0;p<e.length;p++){var a=e[p];if("string"!=typeof a){var i,s=o[a.name];if(null==s){if(a.optional)continue;throw new TypeError('Expected "'+a.name+'" to be defined')}if(isarray(s)){if(!a.repeat)throw new TypeError('Expected "'+a.name+'" to not repeat, but received "'+s+'"');if(0===s.length){if(a.optional)continue;throw new TypeError('Expected "'+a.name+'" to not be empty')}for(var u=0;u<s.length;u++){if(i=encodeURIComponent(s[u]),!t[p].test(i))throw new TypeError('Expected all "'+a.name+'" to match "'+a.pattern+'", but received "'+i+'"');n+=(0===u?a.prefix:a.delimiter)+i}}else{if(i=encodeURIComponent(s),!t[p].test(i))throw new TypeError('Expected "'+a.name+'" to match "'+a.pattern+'", but received "'+i+'"');n+=a.prefix+i}}else n+=a}return n}}function escapeString(e){return e.replace(/([.+*?=^!:${}()[\]|\/])/g,"\\$1")}function escapeGroup(e){return e.replace(/([=!:$\/()])/g,"\\$1")}function attachKeys(e,t){return e.keys=t,e}function flags(e){return e.sensitive?"":"i"}function regexpToRegexp(e,t){var r=e.source.match(/\((?!\?)/g);if(r)for(var n=0;n<r.length;n++)t.push({name:n,prefix:null,delimiter:null,optional:!1,repeat:!1,pattern:null});return attachKeys(e,t)}function arrayToRegexp(e,t,r){for(var n=[],o=0;o<e.length;o++)n.push(pathToRegexp(e[o],t,r).source);var p=new RegExp("(?:"+n.join("|")+")",flags(r));return attachKeys(p,t)}function stringToRegexp(e,t,r){for(var n=parse(e),o=tokensToRegExp(n,r),p=0;p<n.length;p++)"string"!=typeof n[p]&&t.push(n[p]);return attachKeys(o,t)}function tokensToRegExp(e,t){t=t||{};for(var r=t.strict,n=t.end!==!1,o="",p=e[e.length-1],a="string"==typeof p&&/\/$/.test(p),i=0;i<e.length;i++){var s=e[i];if("string"==typeof s)o+=escapeString(s);else{var u=escapeString(s.prefix),c=s.pattern;s.repeat&&(c+="(?:"+u+c+")*"),c=s.optional?u?"(?:"+u+"("+c+"))?":"("+c+")?":u+"("+c+")",o+=c}}return r||(o=(a?o.slice(0,-2):o)+"(?:\\/(?=$))?"),o+=n?"$":r&&a?"":"(?=\\/|$)",new RegExp("^"+o,flags(t))}function pathToRegexp(e,t,r){return t=t||[],isarray(t)?r||(r={}):(r=t,t=[]),e instanceof RegExp?regexpToRegexp(e,t,r):isarray(e)?arrayToRegexp(e,t,r):stringToRegexp(e,t,r)}var isarray=require("isarray");module.exports=pathToRegexp,module.exports.parse=parse,module.exports.compile=compile,module.exports.tokensToFunction=tokensToFunction,module.exports.tokensToRegExp=tokensToRegExp;var PATH_REGEXP=new RegExp(["(\\\\.)","([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))"].join("|"),"g");
},{"isarray":14}],14:[function(require,module,exports){
module.exports=Array.isArray||function(r){return"[object Array]"==Object.prototype.toString.call(r)};
},{}],15:[function(require,module,exports){
Cache.prototype.addAll||(Cache.prototype.addAll=function(t){function e(t){this.name="NetworkError",this.code=19,this.message=t}var r=this;return e.prototype=Object.create(Error.prototype),Promise.resolve().then(function(){if(arguments.length<1)throw new TypeError;return t=t.map(function(t){return t instanceof Request?t:String(t)}),Promise.all(t.map(function(t){"string"==typeof t&&(t=new Request(t));var r=new URL(t.url).protocol;if("http:"!==r&&"https:"!==r)throw new e("Invalid scheme");return fetch(t.clone())}))}).then(function(e){return Promise.all(e.map(function(e,n){return r.put(t[n],e)}))}).then(function(){})});
},{}]},{},[12])(12)
});



// *** End of auto-included sw-toolbox code. ***




/* eslint-disable quotes, comma-spacing */
var PrecacheConfig = [["bower_components/bootstrap/dist/css/bootstrap-theme.css","1e175b53796c46cb6835cbfb219fb248"],["bower_components/bootstrap/dist/css/bootstrap-theme.css.map","faebce397b393cd48125abdc529aa503"],["bower_components/bootstrap/dist/css/bootstrap-theme.min.css","ffb12f89f706291cb139b73c164a7722"],["bower_components/bootstrap/dist/css/bootstrap.css","e2958a4ebe9166dbaa6c59311b281021"],["bower_components/bootstrap/dist/css/bootstrap.css.map","3d2931e768a0bf96442072dcd0019aa6"],["bower_components/bootstrap/dist/css/bootstrap.min.css","385b964b68acb68d23cb43a5218fade9"],["bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.eot","7ad17c6085dee9a33787bac28fb23d46"],["bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.svg","32941d6330044744c02493835b799e90"],["bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf","e49d52e74b7689a0727def99da31f3eb"],["bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff","68ed1dac06bf0409c18ae7bc62889170"],["bower_components/bootstrap/dist/js/bootstrap.js","f91d38466de6410297c6dcd8287abbca"],["bower_components/bootstrap/dist/js/bootstrap.min.js","abda843684d022f3bc22bc83927fe05f"],["bower_components/font-roboto/roboto.html","3c017dcd17189b99a03dbeffb81bc254"],["bower_components/iron-a11y-keys-behavior/bower.json","67c71ae20f455bf4426f9b7464e24886"],["bower_components/iron-a11y-keys-behavior/index.html","760aeb6d4a35fa468684a5bc529f10af"],["bower_components/iron-a11y-keys-behavior/iron-a11y-keys-behavior.html","d9c684064d13803e0ce0900fc9d6f323"],["bower_components/iron-behaviors/bower.json","2cea62d1a28621891b6e5ff47587410d"],["bower_components/iron-behaviors/index.html","224d488d9de603f8a42e9eba8457cffa"],["bower_components/iron-behaviors/iron-button-state.html","be2733f80ff640a2d620689ed00b5143"],["bower_components/iron-behaviors/iron-control-state.html","ea90d72621453c093298e4245665b8f2"],["bower_components/iron-checked-element-behavior/bower.json","48481eff3e42b2c8a3b4e3608b3788bf"],["bower_components/iron-checked-element-behavior/index.html","610778b47d072c4783f599220c046b29"],["bower_components/iron-checked-element-behavior/iron-checked-element-behavior.html","31aa54a1d33aade125a0cc0eeb674c26"],["bower_components/iron-flex-layout/bower.json","b2df0f01417e1695720fa88535c58c04"],["bower_components/iron-flex-layout/index.html","196e49064318640b296a576da99dc554"],["bower_components/iron-flex-layout/iron-flex-layout.html","4eee72c859741818ec41b53423db183c"],["bower_components/iron-form-element-behavior/bower.json","c976e757400160a5a7f0311f4610afc2"],["bower_components/iron-form-element-behavior/index.html","af04489de5b0e8c97e460f662f1ceee4"],["bower_components/iron-form-element-behavior/iron-form-element-behavior.html","8ffdd1ce0a492d317776bb1bb4a443a0"],["bower_components/iron-icon/bower.json","75f833a55b69bd486137e5c38d809e24"],["bower_components/iron-icon/hero.svg","0278623c57b9862ea2bff1432eb49933"],["bower_components/iron-icon/index.html","2949f48a7ae6e2335b0efd7d59516712"],["bower_components/iron-icon/iron-icon.html","9903dc81fca6438b406a3d73220a878b"],["bower_components/iron-icons/av-icons.html","135278ebb5bf85b478063c24d5e71441"],["bower_components/iron-icons/bower.json","efcf6dad5a76417a2415361cacf660e5"],["bower_components/iron-icons/communication-icons.html","93782a0657611ad3897060a3c054802e"],["bower_components/iron-icons/device-icons.html","dd6c4498745bb99ec5c2b57fefe99ca0"],["bower_components/iron-icons/editor-icons.html","abdcc7717c9ce2b3d3c2d4380ed6748d"],["bower_components/iron-icons/hardware-icons.html","e7aabeaceedf47612babe21d6bbf17eb"],["bower_components/iron-icons/hero.svg","60035aea4470fd477c688c79710d6e43"],["bower_components/iron-icons/image-icons.html","8cd4977dd4d8487fa23b6db99f89257f"],["bower_components/iron-icons/index.html","5c93cb678247b40950db668dea597df0"],["bower_components/iron-icons/iron-icons.html","754627dd13f895fe7c847b05be080ecb"],["bower_components/iron-icons/maps-icons.html","2ac88477e07b734e1f1a5ebc8d4cf01a"],["bower_components/iron-icons/notification-icons.html","9f9fd929a86fd5e9958a36d4f2c7ee26"],["bower_components/iron-icons/social-icons.html","57c7367e36156264f8e2c7844ca1c9cf"],["bower_components/iron-iconset-svg/bower.json","708d96c7146cdbdb7de051b3ebee6b90"],["bower_components/iron-iconset-svg/index.html","2949f48a7ae6e2335b0efd7d59516712"],["bower_components/iron-iconset-svg/iron-iconset-svg.html","16623955b0dd63fed0ca4f3d28612406"],["bower_components/iron-menu-behavior/bower.json","48ea903f15c7b8bab20e4dd1a43b9242"],["bower_components/iron-menu-behavior/index.html","45ccb0dd85090060ee5aafaf8cc32ea4"],["bower_components/iron-menu-behavior/iron-menu-behavior.html","b5545e88d6383fa68c939ef0e96d56c1"],["bower_components/iron-menu-behavior/iron-menubar-behavior.html","c7959efe1503561d6610aa1f83bf7124"],["bower_components/iron-meta/bower.json","704a88697e1bf4d730aaa16d0730f97d"],["bower_components/iron-meta/hero.svg","11d270cff1c5a86b9d2be21a7c422935"],["bower_components/iron-meta/index.html","dd0b2fc459101527718f4e8be836cb8b"],["bower_components/iron-meta/iron-meta.html","8691947fe9eeca635dd4d4bb9c85ad05"],["bower_components/iron-pages/bower.json","f072dc4d00c4033a7790b5ff1b8b09ed"],["bower_components/iron-pages/hero.svg","0c8190688d5ec9e7ffd9b57a20b21a8a"],["bower_components/iron-pages/index.html","aa1b5c22921fc76e13306213a01be8ae"],["bower_components/iron-pages/iron-pages.html","151ed074ccc943f9b67231bcced30d44"],["bower_components/iron-resizable-behavior/bower.json","c7aede541b0d77489bc77bd5e649d054"],["bower_components/iron-resizable-behavior/index.html","97869841e903c8dc4022a56bc4c9e777"],["bower_components/iron-resizable-behavior/iron-resizable-behavior.html","76c0f3ccd6df61f819b6593b33d11926"],["bower_components/iron-selector/bower.json","fd06d0fb3509031ce6fd0be57a58fee4"],["bower_components/iron-selector/index.html","43df6f0cb57ff4447c63d2f20f96e059"],["bower_components/iron-selector/iron-multi-selectable.html","a44463e2c9e3f5820fd53b6b3613cbb7"],["bower_components/iron-selector/iron-selectable.html","cba9ea0fff4fa7e56208a577c445b817"],["bower_components/iron-selector/iron-selection.html","dc6c67f88de6ce7e9053b7b00ec1a88d"],["bower_components/iron-selector/iron-selector.html","3de824eb02f385da6459c40171c6d461"],["bower_components/iron-validatable-behavior/bower.json","f4499866252ece9a3d990486fc44124f"],["bower_components/iron-validatable-behavior/index.html","230e2151859e88473e6cdb8fb186b107"],["bower_components/iron-validatable-behavior/iron-validatable-behavior.html","8d143052cceac296ba3fd430301a3cc1"],["bower_components/jquery/dist/jquery.js","107fbe9555bfc88ec5cab524c790fe34"],["bower_components/jquery/dist/jquery.min.js","4a356126b9573eb7bd1e9a7494737410"],["bower_components/jquery/dist/jquery.min.map","2d03a9e84c18b0c9ca7ae86efd7857f8"],["bower_components/paper-behaviors/bower.json","b6cfc1e6036dc13322ad7a98315a65d4"],["bower_components/paper-behaviors/index.html","edc64430268956b5b4a594838c943be4"],["bower_components/paper-behaviors/paper-button-behavior.html","6e99668c53158e992aaa19763990f5d5"],["bower_components/paper-behaviors/paper-checked-element-behavior.html","e20f5b98229a013c389748422b1694e1"],["bower_components/paper-behaviors/paper-inky-focus-behavior.html","ec5cb962fbb967d6bd639aa52096b25c"],["bower_components/paper-behaviors/paper-ripple-behavior.html","d43647d9b826b11f0f47e33039afd51a"],["bower_components/paper-icon-button/bower.json","8faeb20cd9f4e141e1f7f7f53efea252"],["bower_components/paper-icon-button/index.html","0f16505e162860acb941563551a694f1"],["bower_components/paper-icon-button/paper-icon-button.html","1d9b0c9955e7d6b2badffd4340111c1e"],["bower_components/paper-ripple/bower.json","645eb5e9a68957dad2b557655e6f752c"],["bower_components/paper-ripple/hero.svg","95e64a6f0017cbecafa96d292aaacba8"],["bower_components/paper-ripple/index.html","e8e9df84e7a741cd76d144eda9e99c97"],["bower_components/paper-ripple/paper-ripple.html","44e5fe3eb64711d2e88a1e8ac9d46a84"],["bower_components/paper-styles/bower.json","5002715b957d1bb2a32c28b10c3b4767"],["bower_components/paper-styles/color.html","e9e4d4624934ac19c50e0f4937da3d27"],["bower_components/paper-styles/default-theme.html","acd047a4504f1136a7b20c7ab4785e8d"],["bower_components/paper-styles/demo-pages.html","0dcb49e05fd1d12644de01f6755acca0"],["bower_components/paper-styles/demo.css","a6afbbe17d5350a006d50bc1ac0bd59e"],["bower_components/paper-styles/index.html","5f3534b7a20255ac4bae58e0fa1452c0"],["bower_components/paper-styles/paper-styles-classes.html","152826dd4271452e7f557b5133a83b95"],["bower_components/paper-styles/paper-styles.html","d4ef97c5d9b546ab2c0f56478cbaa1ec"],["bower_components/paper-styles/shadow.html","488252cfb8073fe0871e21fe6937d4b9"],["bower_components/paper-styles/typography.html","da0f2a791bda7f6dfc2409cc92725a85"],["bower_components/paper-tabs/bower.json","e9baf7c3ad7c516ab3ce10aacd742bd9"],["bower_components/paper-tabs/hero.svg","a6d790c602b8ef19885a2ffb41ca6282"],["bower_components/paper-tabs/index.html","ccba0695010520665571956f09ed0fce"],["bower_components/paper-tabs/paper-tab.html","8710fa2347fe83ce836b4700ef001582"],["bower_components/paper-tabs/paper-tabs-icons.html","0f4cfe2aab9adc37ad0deea2bbe09a04"],["bower_components/paper-tabs/paper-tabs.html","9faaeb4cea972e1ef0d27328e72b6ce4"],["bower_components/polymer/polymer-micro.html","4270199034530500f7672ae3c9b38df7"],["bower_components/polymer/polymer-mini.html","c085b343cc17fcff734c17bfcb726faf"],["bower_components/polymer/polymer.html","ddfd0dac7a0a73f6c8a4da76ee5e3334"],["bower_components/prefixfree/prefixfree.min.js","a28f497e172759cfb1370a0a9d9c082f"],["bower_components/webcomponentsjs/CustomElements.js","55ab623ea0ea6d96eca3f9d6e06f6acb"],["bower_components/webcomponentsjs/CustomElements.min.js","269a74d5bb170b58339af7e74c3c6a7d"],["bower_components/webcomponentsjs/HTMLImports.js","e3ad74a217e59a6ed6fe0dbea31e5af3"],["bower_components/webcomponentsjs/HTMLImports.min.js","faff0c0725625e1c434547c6f2d43077"],["bower_components/webcomponentsjs/MutationObserver.js","00b60d44dfc4f405b7b805e91c032f63"],["bower_components/webcomponentsjs/MutationObserver.min.js","d8781b8f02524baf7761d2d09b97ba9e"],["bower_components/webcomponentsjs/ShadowDOM.js","ea9c7af2e93b0b8abd9cbc1faf8bc47f"],["bower_components/webcomponentsjs/ShadowDOM.min.js","855be935b1d5808c903071bc565ffd82"],["bower_components/webcomponentsjs/webcomponents-lite.js","cc2988a2eaa78bce9fb0382f8ba49699"],["bower_components/webcomponentsjs/webcomponents-lite.min.js","27a0e01fb89513c40a80e68a2eada152"],["bower_components/webcomponentsjs/webcomponents.js","ec1d156d1010b726b232a42b4662af26"],["bower_components/webcomponentsjs/webcomponents.min.js","6609c670ae071dd796e04701fd72d918"],["site-assets/editcloud9.png","0651c0ffe389b801ef719b4bba28d0ea"],["site-assets/favicon.ico","5e7dc741807bd9aa3084c667efe5b87b"],["site-assets/logo-icon.png","250024222b75b2de0c020e43cbea19a1"],["site-assets/logo.svg","f9894342c9b4d84a2ea3c0ad5825c94f"],["site-assets/main.css","6e40b4ac74b071f8dc4f8519987836a9"],["site-assets/main.min.css","b87579a040b30157df25feceb45545de"],["site-assets/main.min.js","382789902b523e88f6c33b14049e2284"],["site-assets/screenshot.png","bfe3f85e744aa9f12a33a9227c90504f"],["site-assets/sw-loader.js","1d341680226d8b57e599465196495775"]];
/* eslint-enable quotes, comma-spacing */
var CacheNamePrefix = 'sw-precache-v1--' + (self.registration ? self.registration.scope : '') + '-';


var IgnoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var getCacheBustedUrl = function (url, now) {
    now = now || Date.now();

    var urlWithCacheBusting = new URL(url);
    urlWithCacheBusting.search += (urlWithCacheBusting.search ? '&' : '') +
      'sw-precache=' + now;

    return urlWithCacheBusting.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var populateCurrentCacheNames = function (precacheConfig,
    cacheNamePrefix, baseUrl) {
    var absoluteUrlToCacheName = {};
    var currentCacheNamesToAbsoluteUrl = {};

    precacheConfig.forEach(function(cacheOption) {
      var absoluteUrl = new URL(cacheOption[0], baseUrl).toString();
      var cacheName = cacheNamePrefix + absoluteUrl + '-' + cacheOption[1];
      currentCacheNamesToAbsoluteUrl[cacheName] = absoluteUrl;
      absoluteUrlToCacheName[absoluteUrl] = cacheName;
    });

    return {
      absoluteUrlToCacheName: absoluteUrlToCacheName,
      currentCacheNamesToAbsoluteUrl: currentCacheNamesToAbsoluteUrl
    };
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var mappings = populateCurrentCacheNames(PrecacheConfig, CacheNamePrefix, self.location);
var AbsoluteUrlToCacheName = mappings.absoluteUrlToCacheName;
var CurrentCacheNamesToAbsoluteUrl = mappings.currentCacheNamesToAbsoluteUrl;

function deleteAllCaches() {
  return caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  });
}

self.addEventListener('install', function(event) {
  var now = Date.now();

  event.waitUntil(
    caches.keys().then(function(allCacheNames) {
      return Promise.all(
        Object.keys(CurrentCacheNamesToAbsoluteUrl).filter(function(cacheName) {
          return allCacheNames.indexOf(cacheName) === -1;
        }).map(function(cacheName) {
          var urlWithCacheBusting = getCacheBustedUrl(CurrentCacheNamesToAbsoluteUrl[cacheName],
            now);

          return caches.open(cacheName).then(function(cache) {
            var request = new Request(urlWithCacheBusting, {credentials: 'same-origin'});
            return fetch(request).then(function(response) {
              if (response.ok) {
                return cache.put(CurrentCacheNamesToAbsoluteUrl[cacheName], response);
              }

              console.error('Request for %s returned a response with status %d, so not attempting to cache it.',
                urlWithCacheBusting, response.status);
              // Get rid of the empty cache if we can't add a successful response to it.
              return caches.delete(cacheName);
            });
          });
        })
      ).then(function() {
        return Promise.all(
          allCacheNames.filter(function(cacheName) {
            return cacheName.indexOf(CacheNamePrefix) === 0 &&
                   !(cacheName in CurrentCacheNamesToAbsoluteUrl);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      });
    }).then(function() {
      if (typeof self.skipWaiting === 'function') {
        // Force the SW to transition from installing -> active state
        self.skipWaiting();
      }
    })
  );
});

if (self.clients && (typeof self.clients.claim === 'function')) {
  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
}

self.addEventListener('message', function(event) {
  if (event.data.command === 'delete_all') {
    console.log('About to delete all caches...');
    deleteAllCaches().then(function() {
      console.log('Caches deleted.');
      event.ports[0].postMessage({
        error: null
      });
    }).catch(function(error) {
      console.log('Caches not deleted:', error);
      event.ports[0].postMessage({
        error: error
      });
    });
  }
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    var urlWithoutIgnoredParameters = stripIgnoredUrlParameters(event.request.url,
      IgnoreUrlParametersMatching);

    var cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    var directoryIndex = 'index.html';
    if (!cacheName && directoryIndex) {
      urlWithoutIgnoredParameters = addDirectoryIndex(urlWithoutIgnoredParameters, directoryIndex);
      cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    }

    var navigateFallback = '';
    // Ideally, this would check for event.request.mode === 'navigate', but that is not widely
    // supported yet:
    // https://code.google.com/p/chromium/issues/detail?id=540967
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1209081
    if (!cacheName && navigateFallback && event.request.headers.has('accept') &&
        event.request.headers.get('accept').includes('text/html') &&
        /* eslint-disable quotes, comma-spacing */
        isPathWhitelisted([], event.request.url)) {
        /* eslint-enable quotes, comma-spacing */
      var navigateFallbackUrl = new URL(navigateFallback, self.location);
      cacheName = AbsoluteUrlToCacheName[navigateFallbackUrl.toString()];
    }

    if (cacheName) {
      event.respondWith(
        // Rely on the fact that each cache we manage should only have one entry, and return that.
        caches.open(cacheName).then(function(cache) {
          return cache.keys().then(function(keys) {
            return cache.match(keys[0]).then(function(response) {
              if (response) {
                return response;
              }
              // If for some reason the response was deleted from the cache,
              // raise and exception and fall back to the fetch() triggered in the catch().
              throw Error('The cache ' + cacheName + ' is empty.');
            });
          });
        }).catch(function(e) {
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});


// Runtime cache configuration, using the sw-toolbox library.

toolbox.router.get(/localhost:8080\/examples\/jquery\//, toolbox.fastest, {"cache":{"maxEntries":100,"name":"examples-v2"}});



