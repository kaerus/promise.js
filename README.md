<a href="http://promises-aplus.github.com/promises-spec">
    <img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"
         align="right" alt="Promises/A+ logo" />
</a>

Promise.js
==========
A Promises/A+ library, originally developed for the <a href="https://github.com/kaerus/arango-client">ArangoDB client</a>. 

Main features
-------------
* Conforming to the Promises/A+ specification: passing v1.1.0 tests.
* Tiny footprint: No dependencies, 650 bytes compressed or 1500 bytes minified.
* Simple design: fast, easy to understand, integrate & debug.
* Runtime independent: Can be loaded as an AMD or CommonJS module. 
* Flexible fulfillments: Allows multiple fulfillment values catched with then(value) or spread(arguments).

Install
=======
Include this promise.js library into your project using an AMD or CommonJS module loader.
Without any loader the library gets exported as a global Promise constructor.
A minified built file of the library is included in dist/promise.js.

Usage
=====
Example a simple webpage using promises.
```
<!doctype html>
<html>
	<head><title>Promise</title>
		<script src="promise.js"></script>
	</head>
<body>
	<h1 id="h1"></h1>
	<h2 id="h2"></h2>
	<h2 id="h3"></h2>
	<script>
		document.getElementById('h1').innerHTML = "Fulfill a promise";

		Promise().fulfill("Hello").then(function(a){
			var doc = document.getElementById('h2');
			doc.innerHTML = a;
			return "World!";
		}).then(function(b){
			var doc = document.getElementById('h3');
			doc.innerHTML = b;
		});
	</script>
</body>
</html>
```

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
	console.log(error);
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
	promise.reject("Aborted");
}

/* setup the resolver chain */
promise.then(function(url) {
	var ajaxedPromise = getAjax(url);

	return ajaxedPromise.then(function(data){
		return data;
	},function(error){
		return "Failed to fetch content";
	});
}).then(function(response){
	/* put response into DOM */
	var e = getElementById('content');
	e.innerHTML = response;
},function(error){
	/* if rejected from either onCancel */
	/* or thrown error, we end up here. */
	var e = getElementById('error-message');
	e.innerHTML = error.message;
});
```

```javascript
/* Multiple fulfillment values can be placed inside an array */
promise().fulfill([1,2,3]).then(function(value) {
	console.log("a(%s) b(%s) c(%s)", value[0], value[1], value[2]);
});

/* Use spread() to receive the individual elements as arguments */
promise().fulfill([1,2,3]).spread(function(a,b,c) {
	console.log("a(%s) b(%s) c(%s)", a, b, c);
});

/* You can also fulfill with multiple fullfilment arguments. */
promise().fulfill("abc",123,{abc:123}).spread(function(a,b,c) {
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