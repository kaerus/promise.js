<a href="http://promises-aplus.github.com/promises-spec">
    <img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"
         align="right" alt="Promises/A+ logo" />
</a>

Promise.js
==========
A Promises/A+ library with small a footprint optimized for frequent access.
Originally developed for the <a href="https://github.com/kaerus/arango-client">arango-client</a> library.   

Main features
-------------
* Conforming to the Promises/A+ specification: passing all tests.
* Small footprint: 600 bytes compressed / 1400 bytes minified.
* Simple design: easy to understand, integrate & debug.
* Runtime independent: Can be loaded as an AMD or CommonJS module. 

Install
=======
Include the promise.js file into your project using an AMD compatible loader.
You need to have ```amdefine``` to be able to require it as a CommmonJS module in node.js. 
A minified built file is included in dist/promise.js.

Usage
=====
```Javascript
/* Run an asynchronous process that returns a promise.   */
/* Note: The promise doesn't have to originate from this */
/* library as long as it is Promises/A+ compliant....... */
promise = getAjax("http://some.host.com/data");

/* When the response arives, it calls either */
/* the fulfilled block or the rejected block.*/
promise.then(function(value){
	console.log("fulfilled:", value);
},function(reason){
	console.log("rejected:", reason);
});
```

```javascript
/* chaining promises, (undefined blocks are ignored) */
promise = new Promise();

promise.then(function(value){
	return value + 1;	
}).then(function(value){
	if(value < 5) throw "value is to small";
	console.log("value:", value);
}).then(undefined,function(error){
	/* catch thrown error here */
	console.log("Error:", error);
});

/* fulfill with a random value */
promise.fulfill(Math.floor(Math.random()*10));
```

```javascript
/* promises can only be fulfilled/rejected once */
var promise = new Promise();

/* fulfill a promise with a submitted form value */
function onSubmit(){
	promise.fulfill(getElementById("formInput").val());
}

/* Reject the promise on cancel */
function onCancel(){
	promise.reject("Aborted by user");
}

/* setup the response chain */
promise.then(function(url) {
	/* returns a new promise */
	return getAjax(url); 
}).then(function(response){
	/* put response into DOM */
	var e = getElementById('content');
	e.innerHTML = response;
},function(error){
	/* if rejected from either onCancel or getAjax */
	/* or thrown error, we catch the reason here.  */
	var e = getElementById('error-message');
	e.innerHTML = error.message;
});
```
```javascript
/* This Promise library supports multiple fulfillment values (not only one) */
promise().fulfill("abc",123,{abc:123}).then(function(a,b,c) {
	console.log("a(%s) b(%s) c(%s)", a, b, c);
});

```


Test & build
============
Install the development requirements using ```npm i -d```.
Then run ```make``` for executing the tests and building/minifying into dist.


License
=======
```
Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.