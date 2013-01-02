/*Copyright (c) Kaerus 2012 (kaerus.com), Anders Elo <anders @ kaerus com>*/
define("promise",["require"],function(e){function o(){if(!(this instanceof o))return new o}if(typeof setImmediate!="function")if(typeof process!="undefined"&&process&&typeof process.nextTick=="function")setImmediate=process.nextTick;else if(typeof MessageChannel!="undefined"){var t=[],n=new MessageChannel;n.port1.onmessage=function(){t.shift()()},setImmediate=function(e){t.push(e),n.port2.postMessage()}}else setImmediate=setTimeout;var r=0,i=1,s=2;return o.prototype.resolve=function(){var e,t,n=this.state,s=this.resolved;while(e=this.on.shift()){t=e[r];if(e[this.state]!==undefined){try{s=e[this.state].apply(null,this.resolved)}catch(u){t.reject(u);continue}if(s instanceof o||s&&s.then){s.then(function(){t.fulfill.apply(t,arguments)},function(e){t.reject.apply(t,arguments)});continue}s!==undefined?(s=[s],n=i):s=this.resolved}t.state=n,t.resolved=s,t.on&&t.resolve()}},o.prototype.then=function(e,t){var n=this,r=new o;return this.on||(this.on=[]),e=typeof e=="function"?e:undefined,t=typeof t=="function"?t:undefined,this.on.push([r,e,t]),this.resolved&&setImmediate(function(){n.resolve()}),r},o.prototype.fulfill=function(){if(this.state)return;return this.state=i,this.resolved=arguments,this.on&&this.resolve(),this},o.prototype.reject=function(e){if(this.state)return;return this.state=s,this.resolved=arguments,this.on&&this.resolve(),this},o});