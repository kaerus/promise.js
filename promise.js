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


(function (global) {
    "use strict"

    /* exports AMD, CommonJS module or a global Promise() */    
    if (typeof exports === 'object') {  
        module.exports = Promise;
    } else if (typeof define === 'function' && define.amd) {
        define(function () { return Promise; });
    } else if(typeof global === 'object') {
        global.Promise = Promise; 
    } else throw "Unable to export Promise";


    /* setImmediate shim */
    if(typeof global.setImmediate !== 'function') {
        if(typeof global.process !== 'undefined' && global.process && typeof global.process.nextTick === 'function') {
            global.setImmediate = global.process.nextTick;
        } else if(global.vertx && typeof global.vertx.runOnLoop === 'function') {
            global.setImmediate = global.vertx.runOnLoop;     
        } else if(typeof global.MessageChannel !== "undefined") {
            var fifo = [], channel = new global.MessageChannel();
            channel.port1.onmessage = function () { fifo.shift()() };
            global.setImmediate = function (task) { fifo[fifo.length] = task; channel.port2.postMessage(); };
        } else if(typeof global.setTimeout === 'function') {
            global.setImmediate = global.setTimeout;
        } else throw "No candidate for setImmediate";   
    }

    var PENDING = 0, FULFILLED = 1, REJECTED = 2;

    function Promise() {
        if(!(this instanceof Promise))
            return new Promise;
    }

    Promise.prototype.resolve = function() {
        var then, promise,
            state = this.state,
            value = this.resolved;  

        while(then = this.calls.shift()) {
            promise = then[PENDING];

            if(typeof then[this.state] === 'function') {
                try {
                    value = then[this.state](this.resolved);  
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
            promise.state = state;
            promise.resolved = value;
            if(promise.calls) promise.resolve();
        }
    } 

    Promise.prototype.then = function(onFulfill,onReject) {
        var self = this, promise = new Promise();

        if(!this.calls) this.calls = [];   

        this.calls[this.calls.length] = [promise, onFulfill, onReject];

        if(this.resolved) {
            global.setImmediate(function(){
                self.resolve();
            });
        }  

        return promise;
    }

    Promise.prototype.spread = function(onFulfill,onReject) {

        function spreadFulfill(value) {
            if(!Array.isArray(value)) 
                value = [value];

            return onFulfill.apply(null,value);
        }   

        return this.then(spreadFulfill,onReject);
    }

    Promise.prototype.fulfill = function(value) {
        if(this.state) return;
        /* Constructs an array of fulfillment values */
        /* if more than one argument was provided... */
        if(arguments.length > 1) 
            value = [].slice.call(arguments);

        this.state = FULFILLED;
        this.resolved = value;

        if(this.calls) this.resolve();

        return this;
    }

    Promise.prototype.reject = function(reason) {
        if(this.state) return;

        this.state = REJECTED;
        this.resolved = reason;

        if(this.calls) this.resolve();   

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
                global.setImmediate(function(){
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

}(global||window||this));

