/* 
 * Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
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

var root;

try{root = global} catch(e){try {root = window} catch(e){root = this}};

(function () {
    "use strict"

    /* setImmediate shim */
    var setImmediate = root.setImmediate;

    if(typeof setImmediate !== 'function') {
        if(typeof root.process !== 'undefined' && root.process && typeof root.process.nextTick === 'function') {
            setImmediate = root.process.nextTick;
        } else if(root.vertx && typeof root.vertx.runOnLoop === 'function') {
            setImmediate = root.vertx.runOnLoop;     
        } else if(typeof root.MessageChannel !== "undefined") {
            var fifo = [], channel = new root.MessageChannel();
            channel.port1.onmessage = function () { fifo.shift()() };
            setImmediate = function (task) { fifo[fifo.length] = task; channel.port2.postMessage(); };
        } else if(typeof root.setTimeout === 'function') {
            setImmediate = root.setTimeout;
        } else throw "No candidate for setImmediate";   
    }

    var PENDING = 0, FULFILLED = 1, REJECTED = 2;

    function Promise(obj) {
        /* mixin */
        if(obj){
            for(var key in Promise.prototype)
                obj[key] = Promise.prototype[key];
            
            return obj;
        }

        if(!(this instanceof Promise))
            return new Promise;
    }

    Promise.prototype.resolve = function() {
        var then, promise,
            state = this._state,
            value = this.resolved;   
                
        while(then = this._calls.shift()) {
            promise = then[PENDING];

            if(typeof then[this._state] === 'function') {
                try {
                    value = then[this._state](this.resolved);    
                } catch(e) {
                    promise.reject(e); 

                    continue;   
                }    

                if(value instanceof Promise || (value && typeof value.then === 'function') )  {
                    value.then(function(v){
                        promise.fulfill(v); 
                    }, function(r){
                        promise.reject(r);
                    });

                    continue;
                } else {
                    state = FULFILLED;
                }  
            }
            promise._state = state;
            promise.resolved = value;
            if(promise._calls) promise.resolve();
        }
    } 

    Promise.prototype.then = function(onFulfill,onReject) {
        var self = this, promise = new Promise();

        if(!this._calls) this._calls = [];   

        this._calls[this._calls.length] = [promise, onFulfill, onReject];

        if(this.resolved) {
            setImmediate(function(){
                self.resolve();
            });
        }  

        return promise;
    }

    Promise.prototype.spread = function(onFulfill,onReject) {
        var self = this;

        function spreadFulfill(value) {
            if(!Array.isArray(value)) 
                value = [value];

            return onFulfill.apply(self,value);
        }   

        return this.then(spreadFulfill,onReject);
    }

    Promise.prototype.fulfill = function(value) {
        if(this._state) return;
        /* Constructs an array of fulfillment values */
        /* if more than one argument was provided... */
        if(arguments.length > 1) 
            value = [].slice.call(arguments);

        this._state = FULFILLED;
        this.resolved = value;

        if(this._timer) this.timeout(null);
        if(this._calls) this.resolve();

        return this;
    }

    Promise.prototype.reject = function(reason) {
        if(this._state) return;

        this._state = REJECTED;
        this.resolved = reason;

        if(this._timer) this.timeout(null);
        if(this._calls) this.resolve();   

        return this;        
    }

    Promise.prototype.when = function(task) {
        var promise, last = promise = this, values = [];

        /* Single task */
        if(!Array.isArray(task)) 
            return defer(this,task);
        
        /* Helper for deferring a function/process */
        function defer(promise,proc) {
            var value;
            if(proc instanceof Promise || (proc && typeof proc.then === 'function')){
                /* If proc is a promise, then wait for fulfillment */
                proc.then(function(value) {
                    promise.fulfill(value);
                }, function(reason) {
                    promise.reject(reason);
                });
            } else {
                setImmediate(function(){
                    try {
                        value = proc.call(promise);
                        /* proc can resolve the promise itself */
                        /* in which case fullfill gets ignored */
                        promise.fulfill(value);
                    } catch (e) {
                        promise.reject(e);
                    }
                });
            }    
            
            return promise;    
        }

        function deferred(promised,i) {
            defer(promised,task[i]).then(function(v) {
                values[i] = v; 
            });

            return function(){return promised}
        }

        for(var i = 0; i < task.length; i++) {
            promise = last;
            last = promise.then(deferred(promise,i));
        }
        /* return the collected fulfillment values */
        return promise.then(function(){return values});
    } 

    Promise.prototype.attach = function(obj) {
        this.attached = obj;

        return this;
    }

    Promise.prototype.abort = function(message) {
        if(this.attached && typeof this.attached.abort === 'function') 
            this.attached.abort();

        this.reject(message);

        return this;
    }

    Promise.prototype.timeout = function(time,func) {
        if(time === null) {
            clearTimeout(this._timer);
            return this;
        } 
        
        if(this._state) return this;

        var self = this;

        if(!func) func = function() {
            self.abort("timed out");
        }
        
        this._timer = setTimeout(func,time);   

        return this;
    }

    /* exports AMD, CommonJS module or a global Promise() */    
    if (typeof exports === 'object') {  
        if (typeof module !== undefined && module.exports) {
            exports = module.exports = Promise;
        } else exports.Promise = Promise;
    } else if (typeof define === 'function' && define.amd) {
        define(function () { return Promise; });
    } else if(typeof root === 'object') {
        root.Promise = Promise; 
    } else throw "Unable to export Promise";

}());

