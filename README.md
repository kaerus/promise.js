<a href="http://promises-aplus.github.com/promises-spec">
    <img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"
         align="right" alt="Promises/A+ logo" />
</a>
[![build status](https://secure.travis-ci.org/kaerus/promise.js)](http://travis-ci.org/kaerus/promise.js)
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
* Whenable promises: Use when(task) to bundle one or several functions/promises into a single promise. 

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

Example of how to wrap a promise around an asynchronous process.
```
<!doctype html>
<html>
    <head><title>Promise</title>
        <script src="./promise.js"></script>
    </head>
<body>
    <h1 id="h1"></h1>
    <h2 id="h2"></h2>
    <div id="content"></div>
    <script>
        document.getElementById('h1').innerHTML = "Ajaxed promise";
        function getAjax(url) {
        	var promise = new Promise(),
        		xhr = new XMLHttpRequest, timer;

            /* This will be called after getAjax(...) returns */
            xhr.onreadystatechange = function() {
            	if(xhr.readyState === 4 && xhr.status) {
            		clearTimeout(timer);
            		if(xhr.status > 399) promise.reject(xhr.statusText);
                    else promise.fulfill(xhr.responseText);   	
            	}
            }

            /* send an asynchronous XmlHttp GET request */
            xhr.open("GET",url,true);
            xhr.send(null);

            /* set a timeout that fires after 5 secs */
            timer = setTimeout(function() { 
                xhr.abort();
                promise.reject("operation timedout!"); 
            },5000);

            /* return this promise */
        	return promise;
        }

        /* When the response arives it calls either the fulfilled block or the rejected block. */
        getAjax("http://earthquake.usgs.gov/earthquakes/feed/geojson/significant/month").then(function(value){
            /* validates JSON data */
            var data = JSON.parse(value);
        	document.getElementById('h2').innerHTML = "Fulfilled";
            document.getElementById('content').innerHTML = JSON.stringify(data);
        },function(reason){
        	document.getElementById('h2').innerHTML = "Rejected";
            document.getElementById('content').innerHTML = reason;
        });
    </script>
</body>
</html>
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

Example how to defer a synchronous process
```
var deferred = Promise().when(function(){
	var retval = syncProc();
	/* if syncProc() throws the error will */
	/* end up in the rejection handler.    */
	if(retval) this.fulfill(retval);
	else this.reject("Operation failed");
});

/* Process the result whenever its ready */
deferred.then(...);
```
You may also wrap a promise around multiple functions or promises.
```
var tasks = [];
tasks.push(someFunction);
tasks.push(somePromise);
Promise().when(tasks).then(function(values){
	console.log("Tasks returned", values);
}, function(error){
	console.log("Tasks failed", error);
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