<a href="http://promises-aplus.github.com/promises-spec">
    <img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"
         align="right" alt="Promises/A+ logo" />
</a>

Promise.js
==========
A performant Promises/A+ library. 
+Passing all Promises/A+ specification tests.
+Small footprint, only 640 bytes compressed / 1400 bytes minified.
+Works in browsers (clientside) & node.js (serverside).
+Uses ```process.nextTick``` or ```MessageChannel``` for faster processing.

Usage
=====
Include the promise.js file into your project using an AMD compatible loader.
A minified version is included in dist/promise.js
In node.js you need install ```amdefine``` to be able to require the module. 


Test & build
============
Install the development requirements using ```npm i -d```
Run ```make``` for running the tests and building.


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