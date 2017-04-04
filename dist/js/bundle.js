(function () {
'use strict';

const VIRTUAL_WIDTH = 240;
const VIRTUAL_HEIGHT = 320;

const V_RIGHT = VIRTUAL_WIDTH / 2.0;
const V_TOP = VIRTUAL_HEIGHT / 2.0;
const V_LEFT = -1 * VIRTUAL_WIDTH / 2.0;
const V_BOTTOM = -1 * VIRTUAL_HEIGHT / 2.0;

const CHAR_SIZE = 8;
const TEXT_WIDTH = VIRTUAL_WIDTH / CHAR_SIZE;
const TEXT_HEIGHT = VIRTUAL_HEIGHT / CHAR_SIZE;
const PIXEL_SIZE = 1;
const ACTUAL_CHAR_SIZE = CHAR_SIZE * PIXEL_SIZE;


const CHECK_COLLISION = true;

var textureFiles$1 = {};
var stage = 0;
var tasks = null;
var gameTimer = null;
var bombs = null;
var addScore = null;
var myship_ = null;
var pause = false;
var game = null;
var resourceBase = '';

function setGame(v){game = v;}
function setPause(v){pause = v;}
function setMyShip(v){myship_ = v;}
function setAddScore(v){addScore = v;}
function setBombs(v){bombs = v;}
function setGameTimer(v){gameTimer = v;}
function setTasks(v){tasks = v;}
function setStage(v){stage = v;}
function setResourceBase(v){resourceBase = v;}

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */

EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

class Task {
  constructor(genInst,priority) {
    this.priority = priority || 10000;
    this.genInst = genInst;
    // 初期化
    this.index = 0;
  }
  
}

var nullTask = new Task((function*(){})());

/// タスク管理
class Tasks extends EventEmitter {
  constructor(){
    super();
    this.array = new Array(0);
    this.needSort = false;
    this.needCompress = false;
    this.enable = true;
    this.stopped = false;
  }
  // indexの位置のタスクを置き換える
  setNextTask(index, genInst, priority) 
  {
    if(index < 0){
      index = -(++index);
    }
    if(this.array[index].priority == 100000){
      debugger;
    }
    var t = new Task(genInst(index), priority);
    t.index = index;
    this.array[index] = t;
    this.needSort = true;
  }

  pushTask(genInst, priority) {
    let t;
    for (var i = 0; i < this.array.length; ++i) {
      if (this.array[i] == nullTask) {
        t = new Task(genInst(i), priority);
        this.array[i] = t;
        t.index = i;
        return t;
      }
    }
    t = new Task(genInst(this.array.length),priority);
    t.index = this.array.length;
    this.array[this.array.length] = t;
    this.needSort = true;
    return t;
  }

  // 配列を取得する
  getArray() {
    return this.array;
  }
  // タスクをクリアする
  clear() {
    this.array.length = 0;
  }
  // ソートが必要かチェックし、ソートする
  checkSort() {
    if (this.needSort) {
      this.array.sort(function (a, b) {
        if(a.priority > b.priority) return 1;
        if (a.priority < b.priority) return -1;
        return 0;
      });
      // インデックスの振り直し
      for (var i = 0, e = this.array.length; i < e; ++i) {
        this.array[i].index = i;
      }
     this.needSort = false;
    }
  }

  removeTask(index) {
    if(index < 0){
      index = -(++index);
    }
    if(this.array[index].priority == 100000){
      debugger;
    }
    this.array[index] = nullTask;
    this.needCompress = true;
  }
  
  compress() {
    if (!this.needCompress) {
      return;
    }
    var dest = [];
    var src = this.array;
    var destIndex = 0;
    dest = src.filter((v,i)=>{
      let ret = v != nullTask;
      if(ret){
        v.index = destIndex++;
      }
      return ret;
    });
    this.array = dest;
    this.needCompress = false;
  }
  
  process(game$$1)
  {
    if(this.enable){
      requestAnimationFrame(this.process.bind(this,game$$1));
      this.stopped = false;
      if (!pause) {
        if (!game$$1.isHidden) {
          this.checkSort();
          this.array.forEach( (task,i) =>{
            if (task != nullTask) {
              if(task.index != i ){
                debugger;
              }
              task.genInst.next(task.index);
            }
          });
          this.compress();
        }
      }    
    } else {
      this.emit('stopped');
      this.stopped = true;
    }
  }
  
  stopProcess(){
    return new Promise((resolve,reject)=>{
      this.enable = false;
      this.on('stopped',()=>{
        resolve();
      });
    });
  }
}

/// ゲーム用タイマー
class GameTimer {
  constructor(getCurrentTime) {
    this.elapsedTime = 0;
    this.currentTime = 0;
    this.pauseTime = 0;
    this.status = this.STOP;
    this.getCurrentTime = getCurrentTime;
    this.STOP = 1;
    this.START = 2;
    this.PAUSE = 3;

  }
  
  start() {
    this.elapsedTime = 0;
    this.deltaTime = 0;
    this.currentTime = this.getCurrentTime();
    this.status = this.START;
  }

  resume() {
    var nowTime = this.getCurrentTime();
    this.currentTime = this.currentTime + nowTime - this.pauseTime;
    this.status = this.START;
  }

  pause() {
    this.pauseTime = this.getCurrentTime();
    this.status = this.PAUSE;
  }

  stop() {
    this.status = this.STOP;
  }

  update() {
    if (this.status != this.START) return;
    var nowTime = this.getCurrentTime();
    this.deltaTime = nowTime - this.currentTime;
    this.elapsedTime = this.elapsedTime + this.deltaTime;
    this.currentTime = nowTime;
  }
}

var Syntax = {
  Note: "Note",
  Rest: "Rest",
  Octave: "Octave",
  OctaveShift: "OctaveShift",
  NoteLength: "NoteLength",
  NoteVelocity: "NoteVelocity",
  NoteQuantize: "NoteQuantize",
  Tempo: "Tempo",
  InfiniteLoop: "InfiniteLoop",
  LoopBegin: "LoopBegin",
  LoopExit: "LoopExit",
  LoopEnd: "LoopEnd",
  Tone:"Tone",
  WaveForm:"WaveForm",
  Envelope:"Envelope"
};

class Scanner {
  constructor(source) {
    this.source = source;
    this.index = 0;
  }

  hasNext() {
    return this.index < this.source.length;
  }

  peek() {
    return this.source.charAt(this.index) || "";
  }

  next() {
    return this.source.charAt(this.index++) || "";
  }

  forward() {
    while (this.hasNext() && this.match(/\s/)) {
      this.index += 1;
    }
  }

  match(matcher) {
    if (matcher instanceof RegExp) {
      return matcher.test(this.peek());
    }
    return this.peek() === matcher;
  }

  expect(matcher) {
    if (!this.match(matcher)) {
      this.throwUnexpectedToken();
    }
    this.index += 1;
  }

  scan(matcher) {
    let target = this.source.substr(this.index);
    let result = null;

    if (matcher instanceof RegExp) {
      let matched = matcher.exec(target);

      if (matched && matched.index === 0) {
        result = matched[0];
      }
    } else if (target.substr(0, matcher.length) === matcher) {
      result = matcher;
    }

    if (result) {
      this.index += result.length;
    }

    return result;
  }

  throwUnexpectedToken() {
    let identifier = this.peek() || "ILLEGAL";

    throw new SyntaxError(`Unexpected token: ${identifier}`);
  }
}

const NOTE_INDEXES = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

class MMLParser {
  constructor(source) {
    this.scanner = new Scanner(source);
  }

  parse() {
    let result = [];

    this._readUntil(";", () => {
      result = result.concat(this.advance());
    });

    return result;
  }

  advance() {
    switch (this.scanner.peek()) {
    case "c":
    case "d":
    case "e":
    case "f":
    case "g":
    case "a":
    case "b":
      return this.readNote();
    case "[":
      return this.readChord();
    case "r":
      return this.readRest();
    case "o":
      return this.readOctave();
    case ">":
      return this.readOctaveShift(+1);
    case "<":
      return this.readOctaveShift(-1);
    case "l":
      return this.readNoteLength();
    case "q":
      return this.readNoteQuantize();
    case "v":
      return this.readNoteVelocity();
    case "t":
      return this.readTempo();
    case "$":
      return this.readInfiniteLoop();
    case "/":
      return this.readLoop();
    case "@":
      return this.readTone();
    case "w":
      return this.readWaveForm();
    case "s":
      return this.readEnvelope();
    default:
      // do nothing
    }
    this.scanner.throwUnexpectedToken();
  }

  readNote() {
    return {
      type: Syntax.Note,
      noteNumbers: [ this._readNoteNumber(0) ],
      noteLength: this._readLength(),
    };
  }

  readChord() {
    this.scanner.expect("[");

    let noteList = [];
    let offset = 0;

    this._readUntil("]", () => {
      switch (this.scanner.peek()) {
      case "c":
      case "d":
      case "e":
      case "f":
      case "g":
      case "a":
      case "b":
        noteList.push(this._readNoteNumber(offset));
        break;
      case ">":
        this.scanner.next();
        offset += 12;
        break;
      case "<":
        this.scanner.next();
        offset -= 12;
        break;
      default:
        this.scanner.throwUnexpectedToken();
      }
    });

    this.scanner.expect("]");

    return {
      type: Syntax.Note,
      noteNumbers: noteList,
      noteLength: this._readLength(),
    };
  }

  readRest() {
    this.scanner.expect("r");

    return {
      type: Syntax.Rest,
      noteLength: this._readLength(),
    };
  }

  readOctave() {
    this.scanner.expect("o");

    return {
      type: Syntax.Octave,
      value: this._readArgument(/\d+/),
    };
  }

  readOctaveShift(direction) {
    this.scanner.expect(/<|>/);

    return {
      type: Syntax.OctaveShift,
      direction: direction|0,
      value: this._readArgument(/\d+/),
    };
  }

  readNoteLength() {
    this.scanner.expect("l");

    return {
      type: Syntax.NoteLength,
      noteLength: this._readLength(),
    };
  }

  readNoteQuantize() {
    this.scanner.expect("q");

    return {
      type: Syntax.NoteQuantize,
      value: this._readArgument(/\d+/),
    };
  }

  readNoteVelocity() {
    this.scanner.expect("v");

    return {
      type: Syntax.NoteVelocity,
      value: this._readArgument(/\d+/),
    };
  }

  readTempo() {
    this.scanner.expect("t");

    return {
      type: Syntax.Tempo,
      value: this._readArgument(/\d+(\.\d+)?/),
    };
  }

  readInfiniteLoop() {
    this.scanner.expect("$");

    return {
      type: Syntax.InfiniteLoop,
    };
  }

  readLoop() {
    this.scanner.expect("/");
    this.scanner.expect(":");

    let result = [];
    let loopBegin = { type: Syntax.LoopBegin };
    let loopEnd = { type: Syntax.LoopEnd };

    result = result.concat(loopBegin);
    this._readUntil(/[|:]/, () => {
      result = result.concat(this.advance());
    });
    result = result.concat(this._readLoopExit());

    this.scanner.expect(":");
    this.scanner.expect("/");

    loopBegin.value = this._readArgument(/\d+/) || null;

    result = result.concat(loopEnd);

    return result;
  }
  
  readTone(){
    this.scanner.expect("@");
    return {
      type: Syntax.Tone,
      value: this._readArgument(/\d+/)
    };
  }
  
  readWaveForm(){
    this.scanner.expect("w");
    this.scanner.expect("\"");
    let waveData = this.scanner.scan(/[0-9a-fA-F]+?/);
    this.scanner.expect("\"");
    return {
      type: Syntax.WaveForm,
      value: waveData
    };
  }
  
  readEnvelope(){
    this.scanner.expect("s");
    let a = this._readArgument(/\d+(\.\d+)?/);
    this.scanner.expect(",");
    let d = this._readArgument(/\d+(\.\d+)?/);
    this.scanner.expect(",");
    let s = this._readArgument(/\d+(\.\d+)?/);
    this.scanner.expect(",");
    let r = this._readArgument(/\d+(\.\d+)?/);
    return {
      type:Syntax.Envelope,
      a:a,d:d,s:s,r:r
    }
  }

  _readUntil(matcher, callback) {
    while (this.scanner.hasNext()) {
      this.scanner.forward();
      if (!this.scanner.hasNext() || this.scanner.match(matcher)) {
        break;
      }
      callback();
    }
  }

  _readArgument(matcher) {
    let num = this.scanner.scan(matcher);

    return num !== null ? +num : null;
  }

  _readNoteNumber(offset) {
    let noteIndex = NOTE_INDEXES[this.scanner.next()];

    return noteIndex + this._readAccidental() + offset;
  }

  _readAccidental() {
    if (this.scanner.match("+")) {
      return +1 * this.scanner.scan(/\++/).length;
    }
    if (this.scanner.match("-")) {
      return -1 * this.scanner.scan(/\-+/).length;
    }
    return 0;
  }

  _readDot() {
    let len = (this.scanner.scan(/\.+/) || "").length;
    let result = new Array(len);

    for (let i = 0; i < len; i++) {
      result[i] = 0;
    }

    return result;
  }

  _readLength() {
    let result = [];

    result = result.concat(this._readArgument(/\d+/));
    result = result.concat(this._readDot());

    let tie = this._readTie();

    if (tie) {
      result = result.concat(tie);
    }

    return result;
  }

  _readTie() {
    this.scanner.forward();

    if (this.scanner.match("^")) {
      this.scanner.next();
      return this._readLength();
    }

    return null;
  }

  _readLoopExit() {
    let result = [];

    if (this.scanner.match("|")) {
      this.scanner.next();

      let loopExit = { type: Syntax.LoopExit };

      result = result.concat(loopExit);

      this._readUntil(":", () => {
        result = result.concat(this.advance());
      });
    }

    return result;
  }
}

var DefaultParams = {
  tempo: 120,
  octave: 4,
  length: 4,
  velocity: 100,
  quantize: 75,
  loopCount: 2,
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var lzbase62_min = createCommonjsModule(function (module, exports) {
/*!
 * lzbase62 v1.4.6 - LZ77(LZSS) based compression algorithm in base62 for JavaScript.
 * Copyright (c) 2014-2015 polygon planet <polygon.planet.aqua@gmail.com>
 * @license MIT
 */
!function(a,b,c){"undefined"!='object'&&module.exports?module.exports=c():exports[a]=c();}("lzbase62",commonjsGlobal,function(){"use strict";function a(a){this._init(a);}function b(a){this._init(a);}function c(){var a,b,c,d,e="abcdefghijklmnopqrstuvwxyz",f="",g=e.length;for(a=0;g>a;a++)for(c=e.charAt(a),b=g-1;b>15&&f.length<v;b--)d=e.charAt(b),f+=" "+c+" "+d;for(;f.length<v;)f=" "+f;return f=f.slice(0,v)}function d(a,b){return a.length===b?a:a.subarray?a.subarray(0,b):(a.length=b,a)}function e(a,b){if(null==b?b=a.length:a=d(a,b),l&&m&&o>b){if(p)return j.apply(null,a);if(null===p)try{var c=j.apply(null,a);return b>o&&(p=!0),c}catch(e){p=!1;}}return f(a)}function f(a){for(var b,c="",d=a.length,e=0;d>e;){if(b=a.subarray?a.subarray(e,e+o):a.slice(e,e+o),e+=o,!p){if(null===p)try{c+=j.apply(null,b),b.length>o&&(p=!0);continue}catch(f){p=!1;}return g(a)}c+=j.apply(null,b);}return c}function g(a){for(var b="",c=a.length,d=0;c>d;d++)b+=j(a[d]);return b}function h(a,b){if(!k)return new Array(b);switch(a){case 8:return new Uint8Array(b);case 16:return new Uint16Array(b)}}function i(a){for(var b=[],c=a&&a.length,d=0;c>d;d++)b[d]=a.charCodeAt(d);return b}var j=String.fromCharCode,k="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array,l=!1,m=!1;try{"a"===j.apply(null,[97])&&(l=!0);}catch(n){}if(k)try{"a"===j.apply(null,new Uint8Array([97]))&&(m=!0);}catch(n){}var o=65533,p=null,q=!1;-1!=="abc\u307b\u3052".lastIndexOf("\u307b\u3052",1)&&(q=!0);var r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",s=r.length,t=Math.max(s,62)-Math.min(s,62),u=s-1,v=1024,w=304,x=o,y=x-s,z=o,A=z+2*v,B=11,C=B*(B+1),D=40,E=D*(D+1),F=s+1,G=t+20,H=s+5,I=s-t-19,J=D+7,K=J+1,L=K+1,M=L+5,N=M+5;a.prototype={_init:function(a){a=a||{},this._data=null,this._table=null,this._result=null,this._onDataCallback=a.onData,this._onEndCallback=a.onEnd;},_createTable:function(){for(var a=h(8,s),b=0;s>b;b++)a[b]=r.charCodeAt(b);return a},_onData:function(a,b){var c=e(a,b);this._onDataCallback?this._onDataCallback(c):this._result+=c;},_onEnd:function(){this._onEndCallback&&this._onEndCallback(),this._data=this._table=null;},_search:function(){var a=2,b=this._data,c=this._offset,d=u;if(this._dataLen-c<d&&(d=this._dataLen-c),a>d)return!1;var e,f,g,h,i,j,k=c-w,l=b.substring(k,c+d),m=c+a-3-k;do{if(2===a){if(f=b.charAt(c)+b.charAt(c+1),g=l.indexOf(f),!~g||g>m)break}else 3===a?f+=b.charAt(c+2):f=b.substr(c,a);if(q?(j=b.substring(k,c+a-1),h=j.lastIndexOf(f)):h=l.lastIndexOf(f,m),!~h)break;i=h,e=k+h;do if(b.charCodeAt(c+a)!==b.charCodeAt(e+a))break;while(++a<d);if(g===h){a++;break}}while(++a<d);return 2===a?!1:(this._index=w-i,this._length=a-1,!0)},compress:function(a){if(null==a||0===a.length)return"";var b="",d=this._createTable(),e=c(),f=h(8,x),g=0;this._result="",this._offset=e.length,this._data=e+a,this._dataLen=this._data.length,e=a=null;for(var i,j,k,l,m,n=-1,o=-1;this._offset<this._dataLen;)this._search()?(this._index<u?(j=this._index,k=0):(j=this._index%u,k=(this._index-j)/u),2===this._length?(f[g++]=d[k+M],f[g++]=d[j]):(f[g++]=d[k+L],f[g++]=d[j],f[g++]=d[this._length]),this._offset+=this._length,~o&&(o=-1)):(i=this._data.charCodeAt(this._offset++),C>i?(D>i?(j=i,k=0,n=F):(j=i%D,k=(i-j)/D,n=k+F),o===n?f[g++]=d[j]:(f[g++]=d[n-G],f[g++]=d[j],o=n)):(E>i?(j=i,k=0,n=H):(j=i%E,k=(i-j)/E,n=k+H),D>j?(l=j,m=0):(l=j%D,m=(j-l)/D),o===n?(f[g++]=d[l],f[g++]=d[m]):(f[g++]=d[K],f[g++]=d[n-s],f[g++]=d[l],f[g++]=d[m],o=n))),g>=y&&(this._onData(f,g),g=0);return g>0&&this._onData(f,g),this._onEnd(),b=this._result,this._result=null,null===b?"":b}},b.prototype={_init:function(a){a=a||{},this._result=null,this._onDataCallback=a.onData,this._onEndCallback=a.onEnd;},_createTable:function(){for(var a={},b=0;s>b;b++)a[r.charAt(b)]=b;return a},_onData:function(a){var b;if(this._onDataCallback){if(a)b=this._result,this._result=[];else{var c=z-v;b=this._result.slice(v,v+c),this._result=this._result.slice(0,v).concat(this._result.slice(v+c));}b.length>0&&this._onDataCallback(e(b));}},_onEnd:function(){this._onEndCallback&&this._onEndCallback();},decompress:function(a){if(null==a||0===a.length)return"";this._result=i(c());for(var b,d,f,g,h,j,k,l,m,n,o="",p=this._createTable(),q=!1,r=null,s=a.length,t=0;s>t;t++)if(d=p[a.charAt(t)],void 0!==d){if(I>d)q?(g=p[a.charAt(++t)],h=g*D+d+E*r):h=r*D+d,this._result[this._result.length]=h;else if(J>d)r=d-I,q=!1;else if(d===K)f=p[a.charAt(++t)],r=f-5,q=!0;else if(N>d){if(f=p[a.charAt(++t)],M>d?(j=(d-L)*u+f,k=p[a.charAt(++t)]):(j=(d-M)*u+f,k=2),l=this._result.slice(-j),l.length>k&&(l.length=k),m=l.length,l.length>0)for(n=0;k>n;)for(b=0;m>b&&(this._result[this._result.length]=l[b],!(++n>=k));b++);r=null;}this._result.length>=A&&this._onData();}return this._result=this._result.slice(v),this._onData(!0),this._onEnd(),o=e(this._result),this._result=null,o}};var O={compress:function(b,c){return new a(c).compress(b)},decompress:function(a,c){return new b(c).decompress(a)}};return O});
});

//// Web Audio API ラッパークラス ////

// MMLParserはmohayonaoさんのもの
// https://github.com/mohayonao/mml-iterator

// var fft = new FFT(4096, 44100);
const BUFFER_SIZE = 1024;
const TIME_BASE = 96;

// MIDIノート => 再生レート変換テーブル
var noteFreq = [];
for (var i = -69; i < 58; ++i) {
  noteFreq.push(Math.pow(2, i / 12));
}

// MIDIノート周波数 変換テーブル
var midiFreq = [];
for (let i = 0; i < 127; ++i) {
  midiFreq.push(midicps(i));
}
function midicps(noteNumber) {
  return 440 * Math.pow(2, (noteNumber - 69) * 1 / 12);
}

function decodeStr(bits, wavestr) {
  var arr = [];
  var n = bits / 4 | 0;
  var c = 0;
  var zeropos = 1 << (bits - 1);
  while (c < wavestr.length) {
    var d = 0;
    for (var i = 0; i < n; ++i) {
      d = (d << 4) + parseInt(wavestr.charAt(c++), '16');
    }
    arr.push((d - zeropos) / zeropos);
  }
  return arr;
}

var waves = [
  decodeStr(4, 'EEEEEEEEEEEEEEEE0000000000000000'),
  decodeStr(4, '00112233445566778899AABBCCDDEEFF'),
  decodeStr(4, '023466459AA8A7A977965656ACAACDEF'),
  decodeStr(4, 'BDCDCA999ACDCDB94212367776321247'),
  decodeStr(4, '7ACDEDCA742101247BDEDB7320137E78'),
  decodeStr(4, 'ACCA779BDEDA66679994101267742247'),
  decodeStr(4, '7EC9CEA7CFD8AB728D94572038513531'),
  decodeStr(4, 'EE77EE77EE77EE770077007700770077'),
  decodeStr(4, 'EEEE8888888888880000888888888888')//ノイズ用のダミー波形
];



var waveSamples = [];
function WaveSample(audioctx, ch, sampleLength, sampleRate) {

  this.sample = audioctx.createBuffer(ch, sampleLength, sampleRate || audioctx.sampleRate);
  this.loop = false;
  this.start = 0;
  this.end = (sampleLength - 1) / (sampleRate || audioctx.sampleRate);
}

function createWaveSampleFromWaves(audioctx, sampleLength) {
  for (var i = 0, end = waves.length; i < end; ++i) {
    var sample = new WaveSample(audioctx, 1, sampleLength);
    waveSamples.push(sample);
    if (i != 8) {
      var wavedata = waves[i];
      var delta = 440.0 * wavedata.length / audioctx.sampleRate;
      var stime = 0;
      var output = sample.sample.getChannelData(0);
      var len = wavedata.length;
      var index = 0;
      var endsample = 0;
      for (var j = 0; j < sampleLength; ++j) {
        index = stime | 0;
        output[j] = wavedata[index];
        stime += delta;
        if (stime >= len) {
          stime = stime - len;
          endsample = j;
        }
      }
      sample.end = endsample / audioctx.sampleRate;
      sample.loop = true;
    } else {
      // ボイス8はノイズ波形とする
      var output = sample.sample.getChannelData(0);
      for (var j = 0; j < sampleLength; ++j) {
        output[j] = Math.random() * 2.0 - 1.0;
      }
      sample.end = sampleLength / audioctx.sampleRate;
      sample.loop = true;
    }
  }
}

// 参考：http://www.g200kg.com/archives/2014/12/webaudioapiperi.html
function fourier(waveform, len) {
  var real = new Float32Array(len), imag = new Float32Array(len);
  var wavlen = waveform.length;
  for (var i = 0; i < len; ++i) {
    for (var j = 0; j < len; ++j) {
      var wavj = j / len * wavlen;
      var d = waveform[wavj | 0];
      var th = i * j / len * 2 * Math.PI;
      real[i] += Math.cos(th) * d;
      imag[i] += Math.sin(th) * d;
    }
  }
  return [real, imag];
}

function createPeriodicWaveFromWaves(audioctx) {
  return waves.map((d, i) => {
    if (i != 8) {
      let waveData = waves[i];
      let freqData = fourier(waveData, waveData.length);
      return audioctx.createPeriodicWave(freqData[0], freqData[1]);
    } else {
      let waveData = [];
      for (let j = 0, e = waves[i].length; j < e; ++j) {
        waveData.push(Math.random() * 2.0 - 1.0);
      }
      let freqData = fourier(waveData, waveData.length);
      return audioctx.createPeriodicWave(freqData[0], freqData[1]);
    }
  });
}

// ドラムサンプル

const drumSamples = [
  { name: 'bass1', path: 'base/audio/bd1_lz.json' }, // @9
  { name: 'bass2', path: 'base/audio/bd2_lz.json' }, // @10
  { name: 'closed', path: 'base/audio/closed_lz.json' }, // @11
  { name: 'cowbell', path: 'base/audio/cowbell_lz.json' },// @12
  { name: 'crash', path: 'base/audio/crash_lz.json' },// @13
  { name: 'handclap', path: 'base/audio/handclap_lz.json' }, // @14
  { name: 'hitom', path: 'base/audio/hitom_lz.json' },// @15
  { name: 'lowtom', path: 'base/audio/lowtom_lz.json' },// @16
  { name: 'midtom', path: 'base/audio/midtom_lz.json' },// @17
  { name: 'open', path: 'base/audio/open_lz.json' },// @18
  { name: 'ride', path: 'base/audio/ride_lz.json' },// @19
  { name: 'rimshot', path: 'base/audio/rimshot_lz.json' },// @20
  { name: 'sd1', path: 'base/audio/sd1_lz.json' },// @21
  { name: 'sd2', path: 'base/audio/sd2_lz.json' },// @22
  { name: 'tamb', path: 'base/audio/tamb_lz.json' },// @23
  { name:'voice',path: 'base/audio/movie_lz.json'}// @24
];

let xhr = new XMLHttpRequest();
function json(url) {
  return new Promise((resolve, reject) => {
    xhr.open("get", url, true);
    xhr.onload = function () {
      if (xhr.status == 200) {
        resolve(JSON.parse(this.responseText));
      } else {
        reject(new Error('XMLHttpRequest Error:' + xhr.status));
      }
    };
    xhr.onerror = err => { reject(err); };
    xhr.send(null);
  });
}

function readDrumSample(audioctx) {
  let pr = Promise.resolve(0);
  drumSamples.forEach((d) => {
    pr =
      pr.then(json.bind(null,resourceBase + d.path))
        .then(data => {
          let sampleStr = lzbase62_min.decompress(data.samples);
          let samples = decodeStr(4, sampleStr);
          let ws = new WaveSample(audioctx, 1, samples.length, data.sampleRate);
          let sb = ws.sample.getChannelData(0);
          for (let i = 0, e = sb.length; i < e; ++i) {
            sb[i] = samples[i];
          }
          waveSamples.push(ws);
        });
  });

  return pr;
}

// export class WaveTexture { 
//   constructor(wave) {
//     this.wave = wave || waves[0];
//     this.tex = new CanvasTexture(320, 10 * 16);
//     this.render();
//   }

//   render() {
//     var ctx = this.tex.ctx;
//     var wave = this.wave;
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//     ctx.beginPath();
//     ctx.strokeStyle = 'white';
//     for (var i = 0; i < 320; i += 10) {
//       ctx.moveTo(i, 0);
//       ctx.lineTo(i, 255);
//     }
//     for (var i = 0; i < 160; i += 10) {
//       ctx.moveTo(0, i);
//       ctx.lineTo(320, i);
//     }
//     ctx.fillStyle = 'rgba(255,255,255,0.7)';
//     ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
//     ctx.stroke();
//     for (var i = 0, c = 0; i < ctx.canvas.width; i += 10, ++c) {
//       ctx.fillRect(i, (wave[c] > 0) ? 80 - wave[c] * 80 : 80, 10, Math.abs(wave[c]) * 80);
//     }
//     this.tex.texture.needsUpdate = true;
//   }
// };

/// エンベロープジェネレーター
class EnvelopeGenerator {
  constructor(voice, attack, decay, sustain, release) {
    this.voice = voice;
    //this.keyon = false;
    this.attackTime = attack || 0.0005;
    this.decayTime = decay || 0.05;
    this.sustainLevel = sustain || 0.5;
    this.releaseTime = release || 0.5;
    this.v = 1.0;
    this.keyOnTime = 0;
    this.keyOffTime = 0;
    this.keyOn = false;
  }

  keyon(t, vel) {
    this.v = vel || 1.0;
    var v = this.v;
    var t0 = t || this.voice.audioctx.currentTime;
    var t1 = t0 + this.attackTime;
    var gain = this.voice.gain.gain;
    gain.cancelScheduledValues(t0);
    gain.setValueAtTime(0, t0);
    gain.linearRampToValueAtTime(v, t1);
    gain.linearRampToValueAtTime(this.sustainLevel * v, t1 + this.decayTime);
    //gain.setTargetAtTime(this.sustain * v, t1, t1 + this.decay / v);
    this.keyOnTime = t0;
    this.keyOffTime = 0;
    this.keyOn = true;
  }

  keyoff(t) {
    var voice = this.voice;
    var gain = voice.gain.gain;
    var t0 = t || voice.audioctx.currentTime;
    //    gain.cancelScheduledValues(this.keyOnTime);
    gain.cancelScheduledValues(t0);
    let release_time = t0 + this.releaseTime;
    gain.linearRampToValueAtTime(0, release_time);
    this.keyOffTime = t0;
    this.keyOnTime = 0;
    this.keyOn = false;
    return release_time;
  }
}

class Voice {
  constructor(audioctx) {
    this.audioctx = audioctx;
    this.sample = waveSamples[6];
    this.volume = audioctx.createGain();
    this.envelope = new EnvelopeGenerator(this,
      0.5,
      0.25,
      0.8,
      2.5
    );
    this.initProcessor();
    this.detune = 1.0;
    this.volume.gain.value = 1.0;
    this.output = this.volume;
  }

  initProcessor() {
    // if(this.processor){
    //   this.stop();
    //   this.processor.disconnect();
    //   this.processor = null;
    // }
    let processor = this.processor = this.audioctx.createBufferSource();
    let gain = this.gain = this.audioctx.createGain();
    gain.gain.value = 0.0;

    this.processor.buffer = this.sample.sample;
    this.processor.loop = this.sample.loop;
    this.processor.loopStart = 0;
    this.processor.playbackRate.value = 1.0;
    this.processor.loopEnd = this.sample.end;
    this.processor.connect(this.gain);
    this.processor.onended = () => {
      processor.disconnect();
      gain.disconnect();
    };
    gain.connect(this.volume);
  }

  // setSample (sample) {
  //     this.envelope.keyoff(0);
  //     this.processor.disconnect(this.gain);
  //     this.sample = sample;
  //     this.initProcessor();
  //     this.processor.start();
  // }

  start(startTime) {
    //   this.processor.disconnect(this.gain);
    this.initProcessor();
    this.processor.start(startTime);
  }

  stop(time) {
    this.processor.stop(time);
    //this.reset();
  }

  keyon(t, note, vel) {
    this.start(t);
    this.processor.playbackRate.setValueAtTime(noteFreq[note] * this.detune, t);
    this.keyOnTime = t;
    this.envelope.keyon(t, vel);
  }

  keyoff(t) {
    this.gain.gain.cancelScheduledValues(t/*this.keyOnTime*/);
    this.keyOffTime = this.envelope.keyoff(t);
    this.processor.stop(this.keyOffTime);
  }

  isKeyOn(t) {
    return this.envelope.keyOn && (this.keyOnTime <= t);
  }

  isKeyOff(t) {
    return !this.envelope.keyOn && (this.keyOffTime <= t);
  }

  reset() {
    this.processor.playbackRate.cancelScheduledValues(0);
    this.gain.gain.cancelScheduledValues(0);
    this.gain.gain.value = 0;
  }
}

/// ボイス


class Audio {
  constructor() {
    this.VOICES = 16;
    this.enable = false;
    this.audioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

    if (this.audioContext) {
      this.audioctx = new this.audioContext();
      this.enable = true;
    }

    this.voices = [];
    if (this.enable) {
      createWaveSampleFromWaves(this.audioctx, BUFFER_SIZE);
      this.periodicWaves = createPeriodicWaveFromWaves(this.audioctx);
      this.filter = this.audioctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 20000;
      this.filter.Q.value = 0.0001;
      this.noiseFilter = this.audioctx.createBiquadFilter();
      this.noiseFilter.type = 'lowpass';
      this.noiseFilter.frequency.value = 1000;
      this.noiseFilter.Q.value = 1.8;
      this.comp = this.audioctx.createDynamicsCompressor();
      this.filter.connect(this.comp);
      this.noiseFilter.connect(this.comp);
      this.comp.connect(this.audioctx.destination);
      // this.filter.connect(this.audioctx.destination);
      // this.noiseFilter.connect(this.audioctx.destination);
      for (var i = 0, end = this.VOICES; i < end; ++i) {
        //var v = new OscVoice(this.audioctx,this.periodicWaves[0]);
        var v = new Voice(this.audioctx);
        this.voices.push(v);
        if (i == (this.VOICES - 1)) {
          v.output.connect(this.noiseFilter);
        } else {
          v.output.connect(this.filter);
        }
      }
      this.readDrumSample = readDrumSample(this.audioctx);
      //  this.started = false;
      //this.voices[0].output.connect();
    }
  }

  start() {
    // var voices = this.voices;
    // for (var i = 0, end = voices.length; i < end; ++i)
    // {
    //   voices[i].start(0);
    // }
  }

  stop() {
    //if(this.started)
    //{
    var voices = this.voices;
    for (var i = 0, end = voices.length; i < end; ++i) {
      voices[i].stop(0);
    }
    //  this.started = false;
    //}
  }
  
  getWaveSample(no){
    return waveSamples[no];
  }
}



/**********************************************/
/* シーケンサーコマンド                       */
/**********************************************/

function calcStep(noteLength) {
  // 長さからステップを計算する
  let prev = null;
  let dotted = 0;

  let map = noteLength.map((elem) => {
    switch (elem) {
      case null:
        elem = prev;
        break;
      case 0:
        elem = (dotted *= 2);
        break;
      default:
        prev = dotted = elem;
        break;
    }

    let length = elem !== null ? elem : DefaultParams.length;

    return TIME_BASE * (4 / length);
  });
  return map.reduce((a, b) => a + b, 0);
}

class Note {
  constructor(notes, length) {

    this.notes = notes;
    if (length[0]) {
      this.step = calcStep(length);
    }
  }

  process(track) {
    this.notes.forEach((n, i) => {
      var back = track.back;
      var note = n;
      var oct = this.oct || back.oct;
      var step = this.step || back.step;
      var gate = this.gate || back.gate;
      var vel = this.vel || back.vel;
      setQueue(track, note, oct, i == 0 ? step : 0, gate, vel);
    });
  }
}

function setQueue(track, note, oct, step, gate, vel) {
  let no = note + oct * 12;
  let back = track.back;
  var step_time = (step ? track.playingTime : back.playingTime);
  // var gate_time = ((gate >= 0) ? gate * 60 : step * gate * 60 * -1.0) / (TIME_BASE * track.localTempo) + track.playingTime;

  var gate_time = ((step == 0 ? back.codeStep : step) * gate * 60) / (TIME_BASE * track.localTempo) + (step ? track.playingTime : back.playingTime);
  //let voice = track.audio.voices[track.channel];
  let voice = track.assignVoice(step_time);
  //voice.reset();
  voice.sample = back.sample;
  voice.envelope.attackTime = back.attack;
  voice.envelope.decayTime = back.decay;
  voice.envelope.sustainLevel = back.sustain;
  voice.envelope.releaseTime = back.release;
  voice.detune = back.detune;
  voice.volume.gain.setValueAtTime(back.volume, step_time);

  //voice.initProcessor();

  //console.log(track.sequencer.tempo);
  voice.keyon(step_time, no, vel);
  voice.keyoff(gate_time);
  if (step) {
    back.codeStep = step;
    back.playingTime = track.playingTime;
  }

  track.playingTime = (step * 60) / (TIME_BASE * track.localTempo) + track.playingTime;
  // back.voice = voice;
  // back.note = note;
  // back.oct = oct;
  // back.gate = gate;
  // back.vel = vel;
}


/// 音符の長さ指定

class Length {
  constructor(len) {
    this.step = calcStep(len);
  }
  process(track) {
    track.back.step = this.step;
  }
}

/// ゲートタイム指定

class GateTime {
  constructor(gate) {
    this.gate = gate / 100;
  }

  process(track) {
    track.back.gate = this.gate;
  }
}

/// ベロシティ指定

class Velocity {
  constructor(vel) {
    this.vel = vel / 100;
  }
  process(track) {
    track.back.vel = this.vel;
  }
}

/// 音色設定
class Tone {
  constructor(no) {
    this.no = no;
    //this.sample = waveSamples[this.no];
  }

  process(track) {
    //    track.back.sample = track.audio.periodicWaves[this.no];
    track.back.sample = waveSamples[this.no];
    //    track.audio.voices[track.channel].setSample(waveSamples[this.no]);
  }
}

class Rest {
  constructor(length) {
    this.step = calcStep(length);
  }
  process(track) {
    var step = this.step || track.back.step;
    track.playingTime = track.playingTime + (this.step * 60) / (TIME_BASE * track.localTempo);
    //track.back.step = this.step;
  }
}

class Octave {
  constructor(oct) {
    this.oct = oct;
  }
  process(track) {
    track.back.oct = this.oct;
  }
}


class OctaveUp {
  constructor(v) { this.v = v; }
  process(track) {
    track.back.oct += this.v;
  }
}

class OctaveDown {
  constructor(v) { this.v = v; }
  process(track) {
    track.back.oct -= this.v;
  }
}
class Tempo {
  constructor(tempo) {
    this.tempo = tempo;
  }

  process(track) {
    track.localTempo = this.tempo;
    //track.sequencer.tempo = this.tempo;
  }
}

class Envelope {
  constructor(attack, decay, sustain, release) {
    this.attack = attack;
    this.decay = decay;
    this.sustain = sustain;
    this.release = release;
  }

  process(track) {
    //var envelope = track.audio.voices[track.channel].envelope;
    track.back.attack = this.attack;
    track.back.decay = this.decay;
    track.back.sustain = this.sustain;
    track.back.release = this.release;
  }
}

class LoopData {
  constructor(obj, varname, count, seqPos) {
    this.varname = varname;
    this.count = count || DefaultParams.loopCount;
    this.obj = obj;
    this.seqPos = seqPos;
    this.outSeqPos = -1;
  }

  process(track) {
    var stack = track.stack;
    if (stack.length == 0 || stack[stack.length - 1].obj !== this) {
      var ld = this;
      stack.push(new LoopData(this, ld.varname, ld.count, track.seqPos));
    }
  }
}

class LoopEnd {
  constructor(seqPos) {
    this.seqPos = seqPos;
  }
  process(track) {
    var ld = track.stack[track.stack.length - 1];
    if (ld.outSeqPos == -1) ld.outSeqPos = this.seqPos;
    ld.count--;
    if (ld.count > 0) {
      track.seqPos = ld.seqPos;
    } else {
      track.stack.pop();
    }
  }
}

class LoopExit {
  process(track) {
    var ld = track.stack[track.stack.length - 1];
    if (ld.count <= 1 && ld.outSeqPos != -1) {
      track.seqPos = ld.outSeqPos;
      track.stack.pop();
    }
  }
}

class InfiniteLoop {
  process(track) {
    track.infinitLoopIndex = track.seqPos;
  }
}
/////////////////////////////////
/// シーケンサートラック
class Track {
  constructor(sequencer, seqdata, audio) {
    this.name = '';
    this.end = false;
    this.oneshot = false;
    this.sequencer = sequencer;
    this.seqData = seqdata;
    this.seqPos = 0;
    this.mute = false;
    this.playingTime = -1;
    this.localTempo = sequencer.tempo;
    this.trackVolume = 1.0;
    this.transpose = 0;
    this.solo = false;
    this.channel = -1;
    this.track = -1;
    this.audio = audio;
    this.infinitLoopIndex = -1;
    this.back = {
      note: 72,
      oct: 5,
      step: 96,
      gate: 0.5,
      vel: 1.0,
      attack: 0.01,
      decay: 0.05,
      sustain: 0.6,
      release: 0.07,
      detune: 1.0,
      volume: 0.5,
      //      sample:audio.periodicWaves[0]
      sample: waveSamples[0]
    };
    this.stack = [];
  }

  process(currentTime) {

    if (this.end) return;

    if (this.oneshot) {
      this.reset();
    }

    var seqSize = this.seqData.length;
    if (this.seqPos >= seqSize) {
      if (this.sequencer.repeat) {
        this.seqPos = 0;
      } else if (this.infinitLoopIndex >= 0) {
        this.seqPos = this.infinitLoopIndex;
      } else {
        this.end = true;
        return;
      }
    }

    var seq = this.seqData;
    this.playingTime = (this.playingTime > -1) ? this.playingTime : currentTime;
    var endTime = currentTime + 0.2;

    while (this.seqPos < seqSize) {
      if (this.playingTime >= endTime && !this.oneshot) {
        break;
      } else {
        var d = seq[this.seqPos];
        d.process(this);
        this.seqPos++;
      }
    }
  }

  reset() {
    // var curVoice = this.audio.voices[this.channel];
    // curVoice.gain.gain.cancelScheduledValues(0);
    // curVoice.processor.playbackRate.cancelScheduledValues(0);
    // curVoice.gain.gain.value = 0;
    this.playingTime = -1;
    this.seqPos = 0;
    this.infinitLoopIndex = -1;
    this.end = false;
    this.stack.length = 0;
  }

  assignVoice(t) {
    let ret = null;
    this.audio.voices.some((d, i) => {
      if (d.isKeyOff(t)) {
        ret = d;
        return true;
      }
      return false;
    });
    if (!ret) {
      let oldestKeyOnData = (this.audio.voices.map((d, i) => {
        return { time: d.envelope.keyOnTime, d, i };
      }).sort((a, b) => a.time - b.time))[0];
      ret = oldestKeyOnData.d;
    }
    return ret;
  }

}

function loadTracks(self, tracks, trackdata) {
  for (var i = 0; i < trackdata.length; ++i) {
    var track = new Track(self, trackdata[i].data, self.audio);
    track.channel = trackdata[i].channel;
    track.oneshot = (!trackdata[i].oneshot) ? false : true;
    track.track = i;
    tracks.push(track);
  }
  return tracks;
}

////////////////////////////
/// シーケンサー本体 
class Sequencer {
  constructor(audio) {
    this.STOP = 0 | 0;
    this.PLAY = 1 | 0;
    this.PAUSE = 2 | 0;

    this.audio = audio;
    this.tempo = 100.0;
    this.repeat = false;
    this.play = false;
    this.tracks = [];
    this.pauseTime = 0;
    this.status = this.STOP;
  }
  load(data) {
    parseMML(data);
    if (this.play) {
      this.stop();
    }
    this.tracks.length = 0;
    loadTracks(this, this.tracks, data.tracks);
  }
  start() {
    //    this.handle = window.setTimeout(function () { self.process() }, 50);
    this.audio.readDrumSample
      .then(() => {
        this.status = this.PLAY;
        this.process();
      });
  }
  process() {
    if (this.status == this.PLAY) {
      this.playTracks(this.tracks);
      this.handle = window.setTimeout(this.process.bind(this), 100);
    }
  }
  playTracks(tracks) {
    var currentTime = this.audio.audioctx.currentTime;
    //   console.log(this.audio.audioctx.currentTime);
    for (var i = 0, end = tracks.length; i < end; ++i) {
      tracks[i].process(currentTime);
    }
  }
  pause() {
    this.status = this.PAUSE;
    this.pauseTime = this.audio.audioctx.currentTime;
  }
  resume() {
    if (this.status == this.PAUSE) {
      this.status = this.PLAY;
      var tracks = this.tracks;
      var adjust = this.audio.audioctx.currentTime - this.pauseTime;
      for (var i = 0, end = tracks.length; i < end; ++i) {
        tracks[i].playingTime += adjust;
      }
      this.process();
    }
  }
  stop() {
    if (this.status != this.STOP) {
      clearTimeout(this.handle);
      //    clearInterval(this.handle);
      this.status = this.STOP;
      this.reset();
    }
  }
  reset() {
    for (var i = 0, end = this.tracks.length; i < end; ++i) {
      this.tracks[i].reset();
    }
  }
}

function parseMML(data) {
  data.tracks.forEach((d) => {
    d.data = parseMML_(d.mml);
  });
}

function parseMML_(mml) {
  let parser = new MMLParser(mml);
  let commands = parser.parse();
  let seqArray = [];
  commands.forEach((command) => {
    switch (command.type) {
      case Syntax.Note:
        seqArray.push(new Note(command.noteNumbers, command.noteLength));
        break;
      case Syntax.Rest:
        seqArray.push(new Rest(command.noteLength));
        break;
      case Syntax.Octave:
        seqArray.push(new Octave(command.value));
        break;
      case Syntax.OctaveShift:
        if (command.direction >= 0) {
          seqArray.push(new OctaveUp(1));
        } else {
          seqArray.push(new OctaveDown(1));
        }
        break;
      case Syntax.NoteLength:
        seqArray.push(new Length(command.noteLength));
        break;
      case Syntax.NoteVelocity:
        seqArray.push(new Velocity(command.value));
        break;
      case Syntax.Tempo:
        seqArray.push(new Tempo(command.value));
        break;
      case Syntax.NoteQuantize:
        seqArray.push(new GateTime(command.value));
        break;
      case Syntax.InfiniteLoop:
        seqArray.push(new InfiniteLoop());
        break;
      case Syntax.LoopBegin:
        seqArray.push(new LoopData(null, '', command.value, null));
        break;
      case Syntax.LoopExit:
        seqArray.push(new LoopExit());
        break;
      case Syntax.LoopEnd:
        seqArray.push(new LoopEnd());
        break;
      case Syntax.Tone:
        seqArray.push(new Tone(command.value));
      case Syntax.WaveForm:
        break;
      case Syntax.Envelope:
        seqArray.push(new Envelope(command.a, command.d, command.s, command.r));
        break;
    }
  });
  return seqArray;
}

// export var seqData = {
//   name: 'Test',
//   tracks: [
//     {
//       name: 'part1',
//       channel: 0,
//       data:
//       [
//         ENV(0.01, 0.02, 0.5, 0.07),
//         TEMPO(180), TONE(0), VOLUME(0.5), L(8), GT(-0.5),O(4),
//         LOOP('i',4),
//         C, C, C, C, C, C, C, C,
//         LOOP_END,
//         JUMP(5)
//       ]
//     },
//     {
//       name: 'part2',
//       channel: 1,
//       data:
//         [
//         ENV(0.01, 0.05, 0.6, 0.07),
//         TEMPO(180),TONE(6), VOLUME(0.2), L(8), GT(-0.8),
//         R(1), R(1),
//         O(6),L(1), F,
//         E,
//         OD, L(8, true), Bb, G, L(4), Bb, OU, L(4), F, L(8), D,
//         L(4, true), E, L(2), C,R(8),
//         JUMP(8)
//         ]
//     },
//     {
//       name: 'part3',
//       channel: 2,
//       data:
//         [
//         ENV(0.01, 0.05, 0.6, 0.07),
//         TEMPO(180),TONE(6), VOLUME(0.1), L(8), GT(-0.5), 
//         R(1), R(1),
//         O(6),L(1), C,C,
//         OD, L(8, true), G, D, L(4), G, OU, L(4), D, L(8),OD, G,
//         L(4, true), OU,C, L(2),OD, G, R(8),
//         JUMP(7)
//         ]
//     }
//   ]
// }

class SoundEffects {
  constructor(sequencer,data){
    this.soundEffects = [];
    data.forEach((d)=>{
      var tracks = [];
      parseMML(d);
      this.soundEffects.push(loadTracks(sequencer, tracks, d.tracks));
    });
  }
}

// export function SoundEffects(sequencer) {
//    this.soundEffects =
//     [
//     // Effect 0 ////////////////////////////////////
//     createTracks.call(sequencer,[
//     {
//       channel: 8,
//       oneshot:true,
//       data: [VOLUME(0.5),
//         ENV(0.0001, 0.01, 1.0, 0.0001),GT(-0.999),TONE(0), TEMPO(200), O(8),ST(3), C, D, E, F, G, A, B, OU, C, D, E, G, A, B,B,B,B
//       ]
//     },
//     {
//       channel: 9,
//       oneshot: true,
//       data: [VOLUME(0.5),
//         ENV(0.0001, 0.01, 1.0, 0.0001), DETUNE(0.9), GT(-0.999), TONE(0), TEMPO(200), O(5), ST(3), C, D, E, F, G, A, B, OU, C, D, E, G, A, B,B,B,B
//       ]
//     }
//     ]),
//     // Effect 1 /////////////////////////////////////
//     createTracks.call(sequencer,
//       [
//         {
//           channel: 10,
//           oneshot: true,
//           data: [
//            TONE(4), TEMPO(150), ST(4), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.0001),
//            O(6), G, A, B, O(7), B, A, G, F, E, D, C, E, G, A, B, OD, B, A, G, F, E, D, C, OD, B, A, G, F, E, D, C
//           ]
//         }
//       ]),
//     // Effect 2//////////////////////////////////////
//     createTracks.call(sequencer,
//       [
//         {
//           channel: 10,
//           oneshot: true,
//           data: [
//            TONE(0), TEMPO(150), ST(2), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.0001),
//            O(8), C,D,E,F,G,A,B,OU,C,D,E,F,OD,G,OU,A,OD,B,OU,A,OD,G,OU,F,OD,E,OU,E
//           ]
//         }
//       ]),
//       // Effect 3 ////////////////////////////////////
//       createTracks.call(sequencer,
//         [
//           {
//             channel: 10,
//             oneshot: true,
//             data: [
//              TONE(5), TEMPO(150), L(64), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.0001),
//              O(6),C,OD,C,OU,C,OD,C,OU,C,OD,C,OU,C,OD
//             ]
//           }
//         ]),
//       // Effect 4 ////////////////////////////////////////
//       createTracks.call(sequencer,
//         [
//           {
//             channel: 11,
//             oneshot: true,
//             data: [
//              TONE(8), VOLUME(2.0),TEMPO(120), L(2), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.25),
//              O(1), C
//             ]
//           }
//         ])
//    ];
//  }

/// テクスチャーとしてcanvasを使う場合のヘルパー


/// プログレスバー表示クラス
function Progress() {
  this.canvas = document.createElement('canvas');
  var width = 1;
  while (width <= VIRTUAL_WIDTH){
    width *= 2;
  }
  var height = 1;
  while (height <= VIRTUAL_HEIGHT){
    height *= 2;
  }
  this.canvas.width = width;
  this.canvas.height = height;
  this.ctx = this.canvas.getContext('2d');
  this.texture = new THREE.Texture(this.canvas);
  this.texture.magFilter = THREE.NearestFilter;
  this.texture.minFilter = THREE.LinearMipMapLinearFilter;
  // スムージングを切る
  this.ctx.msImageSmoothingEnabled = false;
  this.ctx.imageSmoothingEnabled = false;
  //this.ctx.webkitImageSmoothingEnabled = false;
  this.ctx.mozImageSmoothingEnabled = false;

  this.material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true });
  this.geometry = new THREE.PlaneGeometry(this.canvas.width, this.canvas.height);
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.position.x = (width - VIRTUAL_WIDTH) / 2;
  this.mesh.position.y =  - (height - VIRTUAL_HEIGHT) / 2;

  //this.texture.premultiplyAlpha = true;
}

/// プログレスバーを表示する。
Progress.prototype.render = function (message, percent) {
  var ctx = this.ctx;
  var width = this.canvas.width, height = this.canvas.height;
  //      ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  var textWidth = ctx.measureText(message).width;
  ctx.strokeStyle = ctx.fillStyle = 'rgba(255,255,255,1.0)';

  ctx.fillText(message, (width - textWidth) / 2, 100);
  ctx.beginPath();
  ctx.rect(20, 75, width - 20 * 2, 10);
  ctx.stroke();
  ctx.fillRect(20, 75, (width - 20 * 2) * percent / 100, 10);
  this.texture.needsUpdate = true;
};

/// imgからジオメトリを作成する


function createSpriteGeometry(size)
{
  var geometry = new THREE.Geometry();
  var sizeHalf = size / 2;
  // geometry.
  geometry.vertices.push(new THREE.Vector3(-sizeHalf, sizeHalf, 0));
  geometry.vertices.push(new THREE.Vector3(sizeHalf, sizeHalf, 0));
  geometry.vertices.push(new THREE.Vector3(sizeHalf, -sizeHalf, 0));
  geometry.vertices.push(new THREE.Vector3(-sizeHalf, -sizeHalf, 0));
  geometry.faces.push(new THREE.Face3(0, 2, 1));
  geometry.faces.push(new THREE.Face3(0, 3, 2));
  return geometry;
}

/// テクスチャー上の指定スプライトのUV座標を求める
function createSpriteUV(geometry, texture, cellWidth, cellHeight, cellNo)
{
  var width = texture.image.width;
  var height = texture.image.height;

  var uCellCount = (width / cellWidth) | 0;
  var vCellCount = (height / cellHeight) | 0;
  var vPos = vCellCount - ((cellNo / uCellCount) | 0);
  var uPos = cellNo % uCellCount;
  var uUnit = cellWidth / width; 
  var vUnit = cellHeight / height;

  geometry.faceVertexUvs[0].push([
    new THREE.Vector2((uPos) * cellWidth / width, (vPos) * cellHeight / height),
    new THREE.Vector2((uPos + 1) * cellWidth / width, (vPos - 1) * cellHeight / height),
    new THREE.Vector2((uPos + 1) * cellWidth / width, (vPos) * cellHeight / height)
  ]);
  geometry.faceVertexUvs[0].push([
    new THREE.Vector2((uPos) * cellWidth / width, (vPos) * cellHeight / height),
    new THREE.Vector2((uPos) * cellWidth / width, (vPos - 1) * cellHeight / height),
    new THREE.Vector2((uPos + 1) * cellWidth / width, (vPos - 1) * cellHeight / height)
  ]);
}

function updateSpriteUV(geometry, texture, cellWidth, cellHeight, cellNo)
{
  var width = texture.image.width;
  var height = texture.image.height;

  var uCellCount = (width / cellWidth) | 0;
  var vCellCount = (height / cellHeight) | 0;
  var vPos = vCellCount - ((cellNo / uCellCount) | 0);
  var uPos = cellNo % uCellCount;
  var uUnit = cellWidth / width;
  var vUnit = cellHeight / height;
  var uvs = geometry.faceVertexUvs[0][0];

  uvs[0].x = (uPos) * uUnit;
  uvs[0].y = (vPos) * vUnit;
  uvs[1].x = (uPos + 1) * uUnit;
  uvs[1].y = (vPos - 1) * vUnit;
  uvs[2].x = (uPos + 1) * uUnit;
  uvs[2].y = (vPos) * vUnit;

  uvs = geometry.faceVertexUvs[0][1];

  uvs[0].x = (uPos) * uUnit;
  uvs[0].y = (vPos) * vUnit;
  uvs[1].x = (uPos) * uUnit;
  uvs[1].y = (vPos - 1) * vUnit;
  uvs[2].x = (uPos + 1) * uUnit;
  uvs[2].y = (vPos - 1) * vUnit;

 
  geometry.uvsNeedUpdate = true;

}

function createSpriteMaterial(texture)
{
  // メッシュの作成・表示 ///
  var material = new THREE.MeshBasicMaterial({ map: texture /*,depthTest:true*/, transparent: true });
  material.shading = THREE.FlatShading;
  material.side = THREE.FrontSide;
  material.alphaTest = 0.5;
  material.needsUpdate = true;
//  material.
  return material;
}

// キー入力
class BasicInput{
constructor () {
  this.keyCheck = { up: false, down: false, left: false, right: false, z: false ,x:false};
  this.keyBuffer = [];
  this.keyup_ = null;
  this.keydown_ = null;
  //this.gamepadCheck = { up: false, down: false, left: false, right: false, z: false ,x:false};
  window.addEventListener('gamepadconnected',(e)=>{
    this.gamepad = e.gamepad;
  });
 
  window.addEventListener('gamepaddisconnected',(e)=>{
    delete this.gamepad;
  }); 
 
 if(window.navigator.getGamepads){
   this.gamepad = window.navigator.getGamepads()[0];
 } 
}

  clear()
  {
    for(var d in this.keyCheck){
      this.keyCheck[d] = false;
    }
    this.keyBuffer.length = 0;
  }
  
  keydown(e) {
    var e = d3.event;
    var keyBuffer = this.keyBuffer;
    var keyCheck = this.keyCheck;
    var handle = true;
     
    if (keyBuffer.length > 16) {
      keyBuffer.shift();
    }
    
    if (e.keyCode == 80 /* P */) {
      if (!pause) {
        game.pause();
      } else {
        game.resume();
      }
    }
          
    keyBuffer.push(e.keyCode);
    switch (e.keyCode) {
      case 74:
      case 37:
      case 100:
        keyCheck.left = true;
        handle = true;
        break;
      case 73:
      case 38:
      case 104:
        keyCheck.up = true;
        handle = true;
        break;
      case 76:
      case 39:
      case 102:
        keyCheck.right = true;
        handle = true;
        break;
      case 75:
      case 40:
      case 98:
        keyCheck.down = true;
        handle = true;
        break;
      case 90:
        keyCheck.z = true;
        handle = true;
        break;
      case 88:
        keyCheck.x = true;
        handle = true;
        break;
    }
    if (handle) {
      e.preventDefault();
      e.returnValue = false;
      return false;
    }
  }
  
  keyup() {
    var e = d3.event;
    var keyBuffer = this.keyBuffer;
    var keyCheck = this.keyCheck;
    var handle = false;
    switch (e.keyCode) {
      case 74:
      case 37:
      case 100:
        keyCheck.left = false;
        handle = true;
        break;
      case 73:
      case 38:
      case 104:
        keyCheck.up = false;
        handle = true;
        break;
      case 76:
      case 39:
      case 102:
        keyCheck.right = false;
        handle = true;
        break;
      case 75:
      case 40:
      case 98:
        keyCheck.down = false;
        handle = true;
        break;
      case 90:
        keyCheck.z = false;
        handle = true;
        break;
      case 88:
        keyCheck.x = false;
        handle = true;
        break;
    }
    if (handle) {
      e.preventDefault();
      e.returnValue = false;
      return false;
    }
  }
  //イベントにバインドする
  bind()
  {
    d3.select('body').on('keydown.basicInput',this.keydown.bind(this));
    d3.select('body').on('keyup.basicInput',this.keyup.bind(this));
  }
  // アンバインドする
  unbind()
  {
    d3.select('body').on('keydown.basicInput',null);
    d3.select('body').on('keyup.basicInput',null);
  }
  
  get up() {
    return this.keyCheck.up || (this.gamepad && (this.gamepad.buttons[12].pressed || this.gamepad.axes[1] < -0.1));
  }

  get down() {
    return this.keyCheck.down || (this.gamepad && (this.gamepad.buttons[13].pressed || this.gamepad.axes[1] > 0.1));
  }

  get left() {
    return this.keyCheck.left || (this.gamepad && (this.gamepad.buttons[14].pressed || this.gamepad.axes[0] < -0.1));
  }

  get right() {
    return this.keyCheck.right || (this.gamepad && (this.gamepad.buttons[15].pressed || this.gamepad.axes[0] > 0.1));
  }
  
  get z() {
     let ret = this.keyCheck.z 
    || (((!this.zButton || (this.zButton && !this.zButton) ) && this.gamepad && this.gamepad.buttons[0].pressed));
    this.zButton = this.gamepad && this.gamepad.buttons[0].pressed;
    return ret;
  }
  
  get start() {
    let ret = ((!this.startButton_ || (this.startButton_ && !this.startButton_) ) && this.gamepad && this.gamepad.buttons[9].pressed);
    this.startButton_ = this.gamepad && this.gamepad.buttons[9].pressed;
    return ret;
  }
  
  get aButton(){
     let ret = (((!this.aButton_ || (this.aButton_ && !this.aButton_) ) && this.gamepad && this.gamepad.buttons[0].pressed));
    this.aButton_ = this.gamepad && this.gamepad.buttons[0].pressed;
    return ret;
  }
  
  *update(taskIndex)
  {
    while(taskIndex >= 0){
      if(window.navigator.getGamepads){
        this.gamepad = window.navigator.getGamepads()[0];
      } 
      taskIndex = yield;     
    }
  }
}

class Comm {
  constructor(){
    var host = window.location.href.match(/\.sfpgmr\.net/ig)?'www.sfpgmr.net':'localhost';
    this.enable = false;
    try {
      this.socket = io.connect('http://' + host + ':8081/test');
      this.enable = true;
      var self = this;
      this.socket.on('sendHighScores', (data)=>{
        if(this.updateHighScores){
          this.updateHighScores(data);
        }
      });
      this.socket.on('sendHighScore', (data)=>{
        this.updateHighScore(data);
      });

      this.socket.on('sendRank', (data) => {
        this.updateHighScores(data.highScores);
      });

      this.socket.on('errorConnectionMax', function () {
        alert('同時接続の上限に達しました。');
        self.enable = false;
      });

      this.socket.on('disconnect', function () {
        if (self.enable) {
          self.enable = false;
          alert('サーバー接続が切断されました。');
        }
      });

    } catch (e) {
      //alert('Socket.IOが利用できないため、ハイスコア情報が取得できません。' + e);
    }
  }
  
  sendScore(score)
  {
    if (this.enable) {
      this.socket.emit('sendScore', score);
    }
  }
  
  disconnect()
  {
    if (this.enable) {
      this.enable = false;
      this.socket.disconnect();
    }
  }
}

//import *  as gameobj from './gameobj';
//import * as graphics from './graphics';

/// テキスト属性
class TextAttribute {
  constructor(blink, font) {
    if (blink) {
      this.blink = blink;
    } else {
      this.blink = false;
    }
    if (font) {
      this.font = font;
    } else {
      this.font = textureFiles$1.font;
    }
  }
}

/// テキストプレーン
class TextPlane{ 
  constructor (scene) {
  this.textBuffer = new Array(TEXT_HEIGHT);
  this.attrBuffer = new Array(TEXT_HEIGHT);
  this.textBackBuffer = new Array(TEXT_HEIGHT);
  this.attrBackBuffer = new Array(TEXT_HEIGHT);
  var endi = this.textBuffer.length;
  for (var i = 0; i < endi; ++i) {
    this.textBuffer[i] = new Array(TEXT_WIDTH);
    this.attrBuffer[i] = new Array(TEXT_WIDTH);
    this.textBackBuffer[i] = new Array(TEXT_WIDTH);
    this.attrBackBuffer[i] = new Array(TEXT_WIDTH);
  }


  // 描画用キャンバスのセットアップ

  this.canvas = document.createElement('canvas');
  var width = 1;
  while (width <= VIRTUAL_WIDTH){
    width *= 2;
  }
  var height = 1;
  while (height <= VIRTUAL_HEIGHT){
    height *= 2;
  }
  
  this.canvas.width = width;
  this.canvas.height = height;
  this.ctx = this.canvas.getContext('2d');
  this.texture = new THREE.Texture(this.canvas);
  this.texture.magFilter = THREE.NearestFilter;
  this.texture.minFilter = THREE.LinearMipMapLinearFilter;
  this.material = new THREE.MeshBasicMaterial({ map: this.texture,alphaTest:0.5, transparent: true,depthTest:true,shading:THREE.FlatShading});
//  this.geometry = new THREE.PlaneGeometry(sfg.VIRTUAL_WIDTH, sfg.VIRTUAL_HEIGHT);
  this.geometry = new THREE.PlaneGeometry(width, height);
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.position.z = 0.4;
  this.mesh.position.x = (width - VIRTUAL_WIDTH) / 2;
  this.mesh.position.y =  - (height - VIRTUAL_HEIGHT) / 2;
  this.fonts = { font: textureFiles$1.font, font1: textureFiles$1.font1 };
  this.blinkCount = 0;
  this.blink = false;

  // スムージングを切る
  this.ctx.msImageSmoothingEnabled = false;
  this.ctx.imageSmoothingEnabled = false;
  //this.ctx.webkitImageSmoothingEnabled = false;
  this.ctx.mozImageSmoothingEnabled = false;

  this.cls();
  scene.add(this.mesh);
}

  /// 画面消去
  cls() {
    for (var i = 0, endi = this.textBuffer.length; i < endi; ++i) {
      var line = this.textBuffer[i];
      var attr_line = this.attrBuffer[i];
      var line_back = this.textBackBuffer[i];
      var attr_line_back = this.attrBackBuffer[i];

      for (var j = 0, endj = this.textBuffer[i].length; j < endj; ++j) {
        line[j] = 0x20;
        attr_line[j] = 0x00;
        //line_back[j] = 0x20;
        //attr_line_back[j] = 0x00;
      }
    }
    this.ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  }

  /// 文字表示する
  print(x, y, str, attribute) {
    var line = this.textBuffer[y];
    var attr = this.attrBuffer[y];
    if (!attribute) {
      attribute = 0;
    }
    for (var i = 0; i < str.length; ++i) {
      var c = str.charCodeAt(i);
      if (c == 0xa) {
        ++y;
        if (y >= this.textBuffer.length) {
          // スクロール
          this.textBuffer = this.textBuffer.slice(1, this.textBuffer.length - 1);
          this.textBuffer.push(new Array(VIRTUAL_WIDTH / 8));
          this.attrBuffer = this.attrBuffer.slice(1, this.attrBuffer.length - 1);
          this.attrBuffer.push(new Array(VIRTUAL_WIDTH / 8));
          --y;
          var endj = this.textBuffer[y].length;
          for (var j = 0; j < endj; ++j) {
            this.textBuffer[y][j] = 0x20;
            this.attrBuffer[y][j] = 0x00;
          }
        }
        line = this.textBuffer[y];
        attr = this.attrBuffer[y];
        x = 0;
      } else {
        line[x] = c;
        attr[x] = attribute;
        ++x;
      }
    }
  }
  
  /// テキストデータをもとにテクスチャーに描画する
  render() {
    var ctx = this.ctx;
    this.blinkCount = (this.blinkCount + 1) & 0xf;

    var draw_blink = false;
    if (!this.blinkCount) {
      this.blink = !this.blink;
      draw_blink = true;
    }
    var update = false;
//    ctx.clearRect(0, 0, CONSOLE_WIDTH, CONSOLE_HEIGHT);
//    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var y = 0, gy = 0; y < TEXT_HEIGHT; ++y, gy += ACTUAL_CHAR_SIZE) {
      var line = this.textBuffer[y];
      var attr_line = this.attrBuffer[y];
      var line_back = this.textBackBuffer[y];
      var attr_line_back = this.attrBackBuffer[y];
      for (var x = 0, gx = 0; x < TEXT_WIDTH; ++x, gx += ACTUAL_CHAR_SIZE) {
        var process_blink = (attr_line[x] && attr_line[x].blink);
        if (line[x] != line_back[x] || attr_line[x] != attr_line_back[x] || (process_blink && draw_blink)) {
          update = true;

          line_back[x] = line[x];
          attr_line_back[x] = attr_line[x];
          var c = 0;
          if (!process_blink || this.blink) {
            c = line[x] - 0x20;
          }
          var ypos = (c >> 4) << 3;
          var xpos = (c & 0xf) << 3;
          ctx.clearRect(gx, gy, ACTUAL_CHAR_SIZE, ACTUAL_CHAR_SIZE);
          var font = attr_line[x] ? attr_line[x].font : textureFiles$1.font;
          if (c) {
            ctx.drawImage(font.image, xpos, ypos, CHAR_SIZE, CHAR_SIZE, gx, gy, ACTUAL_CHAR_SIZE, ACTUAL_CHAR_SIZE);
          }
        }
      }
    }
    this.texture.needsUpdate = update;
  }
}

class CollisionArea {
  constructor(offsetX, offsetY, width, height)
  {
    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;
    this.top = 0;
    this.bottom = 0;
    this.left = 0;
    this.right = 0;
    this.width = width || 0;
    this.height = height || 0;
    this.width_ = 0;
    this.height_ = 0;
  }
  get width() { return this.width_; }
  set width(v) {
    this.width_ = v;
    this.left = this.offsetX - v / 2;
    this.right = this.offsetX + v / 2;
  }
  get height() { return this.height_; }
  set height(v) {
    this.height_ = v;
    this.top = this.offsetY + v / 2;
    this.bottom = this.offsetY - v / 2;
  }
}

class GameObj {
  constructor(x, y, z) {
    this.x_ = x || 0;
    this.y_ = y || 0;
    this.z_ = z || 0.0;
    this.enable_ = false;
    this.width = 0;
    this.height = 0;
    this.collisionArea = new CollisionArea();
  }
  get x() { return this.x_; }
  set x(v) { this.x_ = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = v; }
}

/// 自機弾 
class MyBullet extends GameObj {
  constructor(scene,se) {
  super(0, 0, 0);

  this.collisionArea.width = 4;
  this.collisionArea.height = 6;
  this.speed = 8;
  this.power = 1;

  this.textureWidth = textureFiles$1.myship.image.width;
  this.textureHeight = textureFiles$1.myship.image.height;

  // メッシュの作成・表示 ///

  var material = createSpriteMaterial(textureFiles$1.myship);
  var geometry = createSpriteGeometry(16);
  createSpriteUV(geometry, textureFiles$1.myship, 16, 16, 1);
  this.mesh = new THREE.Mesh(geometry, material);

  this.mesh.position.x = this.x_;
  this.mesh.position.y = this.y_;
  this.mesh.position.z = this.z_;
  this.se = se;
  //se(0);
  //sequencer.playTracks(soundEffects.soundEffects[0]);
  scene.add(this.mesh);
  this.mesh.visible = this.enable_ = false;
  //  sfg.tasks.pushTask(function (taskIndex) { self.move(taskIndex); });
 }

  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  *move(taskIndex) {
    
    while (taskIndex >= 0 
      && this.enable_
      && this.y <= (V_TOP + 16) 
      && this.y >= (V_BOTTOM - 16) 
      && this.x <= (V_RIGHT + 16) 
      && this.x >= (V_LEFT - 16))
    {
      
      this.y += this.dy;
      this.x += this.dx;
      
      taskIndex = yield;
    }

    taskIndex = yield;
    tasks.removeTask(taskIndex);
    this.enable_ = this.mesh.visible = false;
}

  start(x, y, z, aimRadian,power) {
    if (this.enable_) {
      return false;
    }
    this.x = x;
    this.y = y;
    this.z = z - 0.1;
    this.power = power | 1;
    this.dx = Math.cos(aimRadian) * this.speed;
    this.dy = Math.sin(aimRadian) * this.speed;
    this.enable_ = this.mesh.visible = true;
    this.se(0);
    //sequencer.playTracks(soundEffects.soundEffects[0]);
    this.task = tasks.pushTask(this.move.bind(this));
    return true;
  }
}

/// 自機オブジェクト
class MyShip extends GameObj { 
  constructor(x, y, z,scene,se) {
  super(x, y, z);// extend

  this.collisionArea.width = 6;
  this.collisionArea.height = 8;
  this.se = se;
  this.scene = scene;
  this.textureWidth = textureFiles$1.myship.image.width;
  this.textureHeight = textureFiles$1.myship.image.height;
  this.width = 16;
  this.height = 16;

  // 移動範囲を求める
  this.top = (V_TOP - this.height / 2) | 0;
  this.bottom = (V_BOTTOM + this.height / 2) | 0;
  this.left = (V_LEFT + this.width / 2) | 0;
  this.right = (V_RIGHT - this.width / 2) | 0;

  // メッシュの作成・表示
  // マテリアルの作成
  var material = createSpriteMaterial(textureFiles$1.myship);
  // ジオメトリの作成
  var geometry = createSpriteGeometry(this.width);
  createSpriteUV(geometry, textureFiles$1.myship, this.width, this.height, 0);

  this.mesh = new THREE.Mesh(geometry, material);

  this.mesh.position.x = this.x_;
  this.mesh.position.y = this.y_;
  this.mesh.position.z = this.z_;
  this.rest = 3;
  this.myBullets = ( ()=> {
    var arr = [];
    for (var i = 0; i < 2; ++i) {
      arr.push(new MyBullet(this.scene,this.se));
    }
    return arr;
  })();
  scene.add(this.mesh);
  
  this.bulletPower = 1;

}
  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  
  shoot(aimRadian) {
    for (var i = 0, end = this.myBullets.length; i < end; ++i) {
      if (this.myBullets[i].start(this.x, this.y , this.z,aimRadian,this.bulletPower)) {
        break;
      }
    }
  }
  
  action(basicInput) {
    if (basicInput.left) {
      if (this.x > this.left) {
        this.x -= 2;
      }
    }

    if (basicInput.right) {
      if (this.x < this.right) {
        this.x += 2;
      }
    }

    if (basicInput.up) {
      if (this.y < this.top) {
        this.y += 2;
      }
    }

    if (basicInput.down) {
      if (this.y > this.bottom) {
        this.y -= 2;
      }
    }


    if (basicInput.z) {
      basicInput.keyCheck.z = false;
      this.shoot(0.5 * Math.PI);
    }

    if (basicInput.x) {
      basicInput.keyCheck.x = false;
      this.shoot(1.5 * Math.PI);
    }
  }
  
  hit() {
    this.mesh.visible = false;
    bombs.start(this.x, this.y, 0.2);
    this.se(4);
  }
  
  reset(){
    this.myBullets.forEach((d)=>{
      if(d.enable_){
        while(!tasks.array[d.task.index].genInst.next(-(1 + d.task.index)).done);
      }
    });
  }
  
  init(){
      this.x = 0;
      this.y = -100;
      this.z = 0.1;
      this.rest = 3;
      this.mesh.visible = true;
  }

}

var myship = Object.freeze({
	MyBullet: MyBullet,
	MyShip: MyShip
});

/// 敵弾
class EnemyBullet extends GameObj {
  constructor(scene, se) {
    super(0, 0, 0);
    this.NONE = 0;
    this.MOVE = 1;
    this.BOMB = 2;
    this.collisionArea.width = 2;
    this.collisionArea.height = 2;
    var tex = textureFiles$1.enemy;
    var material = createSpriteMaterial(tex);
    var geometry = createSpriteGeometry(16);
    createSpriteUV(geometry, tex, 16, 16, 0);
    this.mesh = new THREE.Mesh(geometry, material);
    this.z = 0.0;
    this.mvPattern = null;
    this.mv = null;
    this.mesh.visible = false;
    this.type = null;
    this.life = 0;
    this.dx = 0;
    this.dy = 0;
    this.speed = 2.0;
    this.enable = false;
    this.hit_ = null;
    this.status = this.NONE;
    this.scene = scene;
    scene.add(this.mesh);
    this.se = se;
  }

  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  get enable() {
    return this.enable_;
  }
  
  set enable(v) {
    this.enable_ = v;
    this.mesh.visible = v;
  }
  
  *move(taskIndex) {
    for(;this.x >= (V_LEFT - 16) &&
        this.x <= (V_RIGHT + 16) &&
        this.y >= (V_BOTTOM - 16) &&
        this.y <= (V_TOP + 16) && taskIndex >= 0;
        this.x += this.dx,this.y += this.dy)
    {
      taskIndex = yield;
    }
    
    if(taskIndex >= 0){
      taskIndex = yield;
    }
    this.mesh.visible = false;
    this.status = this.NONE;
    this.enable = false;
    tasks.removeTask(taskIndex);
  }
   
  start(x, y, z) {
    if (this.enable) {
      return false;
    }
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.enable = true;
    if (this.status != this.NONE)
    {
      debugger;
    }
    this.status = this.MOVE;
    var aimRadian = Math.atan2(myship_.y - y, myship_.x - x);
    this.mesh.rotation.z = aimRadian;
    this.dx = Math.cos(aimRadian) * (this.speed + stage.difficulty);
    this.dy = Math.sin(aimRadian) * (this.speed + stage.difficulty);
//    console.log('dx:' + this.dx + ' dy:' + this.dy);

    this.task = tasks.pushTask(this.move.bind(this));
    return true;
  }
 
  hit() {
    this.enable = false;
    tasks.removeTask(this.task.index);
    this.status = this.NONE;
  }
}


class EnemyBullets {
  constructor(scene, se) {
    this.scene = scene;
    this.enemyBullets = [];
    for (var i = 0; i < 48; ++i) {
      this.enemyBullets.push(new EnemyBullet(this.scene, se));
    }
  }
  start(x, y, z) {
    var ebs = this.enemyBullets;
    for(var i = 0,end = ebs.length;i< end;++i){
      if(!ebs[i].enable){
        ebs[i].start(x, y, z);
        break;
      }
    }
  }
  
  reset()
  {
    this.enemyBullets.forEach((d,i)=>{
      if(d.enable){
        while(!tasks.array[d.task.index].genInst.next(-(1 + d.task.index)).done);
      }
    });
  }
}

/// 敵キャラの動き ///////////////////////////////
/// 直線運動
class LineMove {
  constructor(rad, speed, step) {
    this.rad = rad;
    this.speed = speed;
    this.step = step;
    this.currentStep = step;
    this.dx = Math.cos(rad) * speed;
    this.dy = Math.sin(rad) * speed;
  }
  
  *move(self,x,y) 
  {
    
    if (self.xrev) {
      self.charRad = Math.PI - (this.rad - Math.PI / 2);
    } else {
      self.charRad = this.rad - Math.PI / 2;
    }
    
    let dy = this.dy;
    let dx = this.dx;
    const step = this.step;
    
    if(self.xrev){
      dx = -dx;      
    }
    let cancel = false;
    for(let i = 0;i < step && !cancel;++i){
      self.x += dx;
      self.y += dy;
      cancel = yield;
    }
  }
  
  clone(){
    return new LineMove(this.rad,this.speed,this.step);
  }
  
  toJSON(){
    return [
      "LineMove",
      this.rad,
      this.speed,
      this.step
    ];
  }
  
  static fromArray(array)
  {
    return new LineMove(array[1],array[2],array[3]);
  }
}

/// 円運動
class CircleMove {
  constructor(startRad, stopRad, r, speed, left) {
    this.startRad = (startRad || 0);
    this.stopRad =  (stopRad || 1.0);
    this.r = r || 100;
    this.speed = speed || 1.0;
    this.left = !left ? false : true;
    this.deltas = [];
    this.startRad_ = this.startRad * Math.PI;
    this.stopRad_ = this.stopRad * Math.PI;
    let rad = this.startRad_;
    let step = (left ? 1 : -1) * this.speed / r;
    let end = false;
    
    while (!end) {
      rad += step;
      if ((left && (rad >= this.stopRad_)) || (!left && rad <= this.stopRad_)) {
        rad = this.stopRad_;
        end = true;
      }
      this.deltas.push({
        x: this.r * Math.cos(rad),
        y: this.r * Math.sin(rad),
        rad: rad
      });
    }
  };

  
  *move(self,x,y) {
    // 初期化
    let sx,sy;
    if (self.xrev) {
      sx = x - this.r * Math.cos(this.startRad_ + Math.PI);
    } else {
      sx = x - this.r * Math.cos(this.startRad_);
    }
    sy = y - this.r * Math.sin(this.startRad_);

    let cancel = false;
    // 移動
    for(let i = 0,e = this.deltas.length;(i < e) && !cancel;++i)
    {
      var delta = this.deltas[i];
      if(self.xrev){
        self.x = sx - delta.x;
      } else {
        self.x = sx + delta.x;
      }

      self.y = sy + delta.y;
      if (self.xrev) {
        self.charRad = (Math.PI - delta.rad) + (this.left ? -1 : 0) * Math.PI;
      } else {
        self.charRad = delta.rad + (this.left ? 0 : -1) * Math.PI;
      }
      self.rad = delta.rad;
      cancel = yield;
    }
  }
  
  toJSON(){
    return [ 'CircleMove',
      this.startRad,
      this.stopRad,
      this.r,
      this.speed,
      this.left
    ];
  }
  
  clone(){
    return new CircleMove(this.startRad,this.stopRad,this.r,this.speed,this.left);
  }
  
  static fromArray(a){
    return new CircleMove(a[1],a[2],a[3],a[4],a[5]);
  }
}

/// ホームポジションに戻る
class GotoHome {

 *move(self, x, y) {
    let rad = Math.atan2(self.homeY - self.y, self.homeX - self.x);
    let speed = 4;

    self.charRad = rad - Math.PI / 2;
    let dx = Math.cos(rad) * speed;
    let dy = Math.sin(rad) * speed;
    self.z = 0.0;
    
    let cancel = false;
    for(;(Math.abs(self.x - self.homeX) >= 2 || Math.abs(self.y - self.homeY) >= 2) && !cancel
      ;self.x += dx,self.y += dy)
    {
      cancel = yield;
    }

    self.charRad = 0;
    self.x = self.homeX;
    self.y = self.homeY;
    if (self.status == self.START) {
      var groupID = self.groupID;
      var groupData = self.enemies.groupData;
      groupData[groupID].push(self);
      self.enemies.homeEnemiesCount++;
    }
    self.status = self.HOME;
  }
  
  clone()
  {
    return new GotoHome();
  }
  
  toJSON(){
    return ['GotoHome'];
  }
  
  static fromArray(a)
  {
    return new GotoHome();
  }
}


/// 待機中の敵の動き
class HomeMove{
  constructor(){
    this.CENTER_X = 0;
    this.CENTER_Y = 100;
  }

  *move(self, x, y) {

    let dx = self.homeX - this.CENTER_X;
    let dy = self.homeY - this.CENTER_Y;
    self.z = -0.1;

    while(self.status != self.ATTACK)
    {
      self.x = self.homeX + dx * self.enemies.homeDelta;
      self.y = self.homeY + dy * self.enemies.homeDelta;
      self.mesh.scale.x = self.enemies.homeDelta2;
      yield;
    }

    self.mesh.scale.x = 1.0;
    self.z = 0.0;

  }
  
  clone(){
    return new HomeMove();
  }
  
  toJSON(){
    return ['HomeMove'];
  }
  
  static fromArray(a)
  {
    return new HomeMove();
  }
}

/// 指定シーケンスに移動する
class Goto {
  constructor(pos) { this.pos = pos; };
  *move(self, x, y) {
    self.index = this.pos - 1;
  }
  
  toJSON(){
    return [
      'Goto',
      this.pos
    ];
  }
  
  clone(){
    return new Goto(this.pos);
  }
  
  static fromArray(a){
    return new Goto(a[1]);
  }
}

/// 敵弾発射
class Fire {
  *move(self, x, y) {
    let d = (stage.no / 20) * ( stage.difficulty);
    if (d > 1) { d = 1.0;}
    if (Math.random() < d) {
      self.enemies.enemyBullets.start(self.x, self.y);
    }
  }
  
  clone(){
    return new Fire();
  }
  
  toJSON(){
    return ['Fire'];
  }
  
  static fromArray(a)
  {
    return new Fire();
  }
}

/// 敵本体
class Enemy extends GameObj { 
  constructor(enemies,scene,se) {
  super(0, 0, 0);
  this.NONE =  0 ;
  this.START =  1 ;
  this.HOME =  2 ;
  this.ATTACK =  3 ;
  this.BOMB =  4 ;
  this.collisionArea.width = 12;
  this.collisionArea.height = 8;
  var tex = textureFiles$1.enemy;
  var material = createSpriteMaterial(tex);
  var geometry = createSpriteGeometry(16);
  createSpriteUV(geometry, tex, 16, 16, 0);
  this.mesh = new THREE.Mesh(geometry, material);
  this.groupID = 0;
  this.z = 0.0;
  this.index = 0;
  this.score = 0;
  this.mvPattern = null;
  this.mv = null;
  this.mesh.visible = false;
  this.status = this.NONE;
  this.type = null;
  this.life = 0;
  this.task = null;
  this.hit_ = null;
  this.scene = scene;
  this.scene.add(this.mesh);
  this.se = se;
  this.enemies = enemies;
}

  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  
  ///敵の動き
  *move(taskIndex) {
    taskIndex = yield;
    while (taskIndex >= 0){
      while(!this.mv.next().done && taskIndex >= 0)
      {
        this.mesh.scale.x = this.enemies.homeDelta2;
        this.mesh.rotation.z = this.charRad;
        taskIndex = yield;
      }

      if(taskIndex < 0){
        taskIndex = -(++taskIndex);
        return;
      }

      let end = false;
      while (!end) {
        if (this.index < (this.mvPattern.length - 1)) {
          this.index++;
          this.mv = this.mvPattern[this.index].move(this,this.x,this.y);
          end = !this.mv.next().done;
        } else {
          break;
        }
      }
      this.mesh.scale.x = this.enemies.homeDelta2;
      this.mesh.rotation.z = this.charRad;
    }
  }
  
  /// 初期化
  start(x, y, z, homeX, homeY, mvPattern, xrev,type, clearTarget,groupID) {
    if (this.enable_) {
      return false;
    }
    this.type = type;
    type(this);
    this.x = x;
    this.y = y;
    this.z = z;
    this.xrev = xrev;
    this.enable_ = true;
    this.homeX = homeX || 0;
    this.homeY = homeY || 0;
    this.index = 0;
    this.groupID = groupID;
    this.mvPattern = mvPattern;
    this.clearTarget = clearTarget || true;
    this.mesh.material.color.setHex(0xFFFFFF);
    this.mv = mvPattern[0].move(this,x,y);
    //this.mv.start(this, x, y);
    //if (this.status != this.NONE) {
    //  debugger;
    //}
    this.status = this.START;
    this.task = tasks.pushTask(this.move.bind(this), 10000);
    // if(this.task.index == 0){
    //   debugger;
    // }
    this.mesh.visible = true;
    return true;
  }
  
  hit(mybullet) {
    if (this.hit_ == null) {
      let life = this.life;
      this.life -= mybullet.power || 1;
      mybullet.power && (mybullet.power -= life); 
//      this.life--;
      if (this.life <= 0) {
        bombs.start(this.x, this.y);
        this.se(1);
        addScore(this.score);
        if (this.clearTarget) {
          this.enemies.hitEnemiesCount++;
          if (this.status == this.START) {
            this.enemies.homeEnemiesCount++;
            this.enemies.groupData[this.groupID].push(this);
          }
          this.enemies.groupData[this.groupID].goneCount++;
        }
        if(this.task.index == 0){
          console.log('hit',this.task.index);
          debugger;
        }

        this.mesh.visible = false;
        this.enable_ = false;
        this.status = this.NONE;
        tasks.array[this.task.index].genInst.next(-(this.task.index + 1));
        tasks.removeTask(this.task.index);
      } else {
        this.se(2);
        this.mesh.material.color.setHex(0xFF8080);
      }
    } else {
      this.hit_(mybullet);
    }
  }
}

function Zako(self) {
  self.score = 50;
  self.life = 1;
  updateSpriteUV(self.mesh.geometry, textureFiles$1.enemy, 16, 16, 7);
}

Zako.toJSON = function ()
{
  return 'Zako';
};

function Zako1(self) {
  self.score = 100;
  self.life = 1;
  updateSpriteUV(self.mesh.geometry, textureFiles$1.enemy, 16, 16, 6);
}

Zako1.toJSON = function ()
{
  return 'Zako1';
};

function MBoss(self) {
  self.score = 300;
  self.life = 2;
  self.mesh.blending = THREE.NormalBlending;
  updateSpriteUV(self.mesh.geometry, textureFiles$1.enemy, 16, 16, 4);
}

MBoss.toJSON = function ()
{
  return 'MBoss';
};


class Enemies{
  constructor(scene, se, enemyBullets) {
    this.enemyBullets = enemyBullets;
    this.scene = scene;
    this.nextTime = 0;
    this.currentIndex = 0;
    this.enemies = new Array(0);
    this.homeDelta2 = 1.0;
    for (var i = 0; i < 64; ++i) {
      this.enemies.push(new Enemy(this, scene, se));
    }
    for (var i = 0; i < 5; ++i) {
      this.groupData[i] = new Array(0);
    }
  }
  
  startEnemy_(enemy,data)
  {
      enemy.start(data[1], data[2], 0, data[3], data[4], this.movePatterns[Math.abs(data[5])], data[5] < 0, data[6], data[7], data[8] || 0);
  }
  
  startEnemy(data){
    var enemies = this.enemies;
    for (var i = 0, e = enemies.length; i < e; ++i) {
      var enemy = enemies[i];
      if (!enemy.enable_) {
        return this.startEnemy_(enemy,data);
      }
    }    
  }
  
  startEnemyIndexed(data,index){
    let en = this.enemies[index];
    if(en.enable_){
        tasks.removeTask(en.task.index);
        en.status = en.NONE;
        en.enable_ = false;
        en.mesh.visible = false;
    }
    this.startEnemy_(en,data);
  }

  /// 敵編隊の動きをコントロールする
  move() {
    var currentTime = gameTimer.elapsedTime;
    var moveSeqs = this.moveSeqs;
    var len = moveSeqs[stage.privateNo].length;
    // データ配列をもとに敵を生成
    while (this.currentIndex < len) {
      var data = moveSeqs[stage.privateNo][this.currentIndex];
      var nextTime = this.nextTime != null ? this.nextTime : data[0];
      if (currentTime >= (this.nextTime + data[0])) {
        this.startEnemy(data);
        this.currentIndex++;
        if (this.currentIndex < len) {
          this.nextTime = currentTime + moveSeqs[stage.privateNo][this.currentIndex][0];
        }
      } else {
        break;
      }
    }
    // ホームポジションに敵がすべて整列したか確認する。
    if (this.homeEnemiesCount == this.totalEnemiesCount && this.status == this.START) {
      // 整列していたら整列モードに移行する。
      this.status = this.HOME;
      this.endTime = gameTimer.elapsedTime + 0.5 * (2.0 - stage.difficulty);
    }

    // ホームポジションで一定時間待機する
    if (this.status == this.HOME) {
      if (gameTimer.elapsedTime > this.endTime) {
        this.status = this.ATTACK;
        this.endTime = gameTimer.elapsedTime + (stage.DIFFICULTY_MAX - stage.difficulty) * 3;
        this.group = 0;
        this.count = 0;
      }
    }

    // 攻撃する
    if (this.status == this.ATTACK && gameTimer.elapsedTime > this.endTime) {
      this.endTime = gameTimer.elapsedTime + (stage.DIFFICULTY_MAX - stage.difficulty) * 3;
      var groupData = this.groupData;
      var attackCount = (1 + 0.25 * (stage.difficulty)) | 0;
      var group = groupData[this.group];

      if (!group || group.length == 0) {
        this.group = 0;
        var group = groupData[0];
      }

      if (group.length > 0 && group.length > group.goneCount) {
        if (!group.index) {
          group.index = 0;
        }
        if (!this.group) {
          var count = 0, endg = group.length;
          while (count < endg && attackCount > 0) {
            var en = group[group.index];
            if (en.enable_ && en.status == en.HOME) {
              en.status = en.ATTACK;
              --attackCount;
            }
            count++;
            group.index++;
            if (group.index >= group.length) group.index = 0;
          }
        } else {
          for (var i = 0, end = group.length; i < end; ++i) {
            var en = group[i];
            if (en.enable_ && en.status == en.HOME) {
              en.status = en.ATTACK;
            }
          }
        }
      }

      this.group++;
      if (this.group >= this.groupData.length) {
        this.group = 0;
      }

    }

    // ホームポジションでの待機動作
    this.homeDeltaCount += 0.025;
    this.homeDelta = Math.sin(this.homeDeltaCount) * 0.08;
    this.homeDelta2 = 1.0 + Math.sin(this.homeDeltaCount * 8) * 0.1;

  }

  reset() {
    for (var i = 0, end = this.enemies.length; i < end; ++i) {
      var en = this.enemies[i];
      if (en.enable_) {
        tasks.removeTask(en.task.index);
        en.status = en.NONE;
        en.enable_ = false;
        en.mesh.visible = false;
      }
    }
  }

  calcEnemiesCount() {
    var seqs = this.moveSeqs[stage.privateNo];
    this.totalEnemiesCount = 0;
    for (var i = 0, end = seqs.length; i < end; ++i) {
      if (seqs[i][7]) {
        this.totalEnemiesCount++;
      }
    }
  }

  start() {
    this.nextTime = 0;
    this.currentIndex = 0;
    this.totalEnemiesCount = 0;
    this.hitEnemiesCount = 0;
    this.homeEnemiesCount = 0;
    this.status = this.START;
    var groupData = this.groupData;
    for (var i = 0, end = groupData.length; i < end; ++i) {
      groupData[i].length = 0;
      groupData[i].goneCount = 0;
    }
  }
  
  loadPatterns(){
    this.movePatterns = [];
    let this_ = this;    
    return new Promise((resolve,reject)=>{
      d3.json('./data/enemyMovePattern.json',(err,data)=>{
        if(err){
          reject(err);
        }
        data.forEach((comArray,i)=>{
          let com = [];
          this.movePatterns.push(com);
          comArray.forEach((d,i)=>{
            com.push(this.createMovePatternFromArray(d));
          });
        });
        resolve();
      });
    });
  }
  
  createMovePatternFromArray(arr){
    let obj;
    switch(arr[0]){
      case 'LineMove':
        obj = LineMove.fromArray(arr);
        break;
      case 'CircleMove':
        obj =  CircleMove.fromArray(arr);
        break;
      case 'GotoHome':
        obj =   GotoHome.fromArray(arr);
        break;
      case 'HomeMove':
        obj =   HomeMove.fromArray(arr);
        break;
      case 'Goto':
        obj =   Goto.fromArray(arr);
        break;
      case 'Fire':
        obj =   Fire.fromArray(arr);
        break;
    }
    return obj;
//    throw new Error('MovePattern Not Found.');
  }
  
  loadFormations(){
    this.moveSeqs = [];
    return new Promise((resolve,reject)=>{
      d3.json('./data/enemyFormationPattern.json',(err,data)=>{
        if(err) reject(err);
        data.forEach((form,i)=>{
          let stage$$1 = [];
          this.moveSeqs.push(stage$$1);
          form.forEach((d,i)=>{
            d[6] = getEnemyFunc(d[6]);
            stage$$1.push(d);
          });          
        });
        resolve();
      });
    });
  }
  
}

var enemyFuncs = new Map([
      ["Zako",Zako],
      ["Zako1",Zako1],
      ["MBoss",MBoss]
    ]);

function getEnemyFunc(funcName)
{
  return enemyFuncs.get(funcName);
}

Enemies.prototype.totalEnemiesCount = 0;
Enemies.prototype.hitEnemiesCount = 0;
Enemies.prototype.homeEnemiesCount = 0;
Enemies.prototype.homeDelta = 0;
Enemies.prototype.homeDeltaCount = 0;
Enemies.prototype.homeDelta2 = 0;
Enemies.prototype.groupData = [];
Enemies.prototype.NONE = 0 | 0;
Enemies.prototype.START = 1 | 0;
Enemies.prototype.HOME = 2 | 0;
Enemies.prototype.ATTACK = 3 | 0;

/// 爆発
class Bomb extends GameObj 
{
  constructor(scene,se) {
    super(0,0,0);
    var tex = textureFiles$1.bomb;
    var material = createSpriteMaterial(tex);
    material.blending = THREE.AdditiveBlending;
    material.needsUpdate = true;
    var geometry = createSpriteGeometry(16);
    createSpriteUV(geometry, tex, 16, 16, 0);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.z = 0.1;
    this.index = 0;
    this.mesh.visible = false;
    this.scene = scene;
    this.se = se;
    scene.add(this.mesh);
  }
  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  
  start(x, y, z, delay) {
    if (this.enable_) {
      return false;
    }
    this.delay = delay | 0;
    this.x = x;
    this.y = y;
    this.z = z | 0.00002;
    this.enable_ = true;
    updateSpriteUV(this.mesh.geometry, textureFiles$1.bomb, 16, 16, this.index);
    this.task = tasks.pushTask(this.move.bind(this));
    this.mesh.material.opacity = 1.0;
    return true;
  }
  
  *move(taskIndex) {
    
    for( let i = 0,e = this.delay;i < e && taskIndex >= 0;++i)
    {
      taskIndex = yield;      
    }
    this.mesh.visible = true;

    for(let i = 0;i < 7 && taskIndex >= 0;++i)
    {
      updateSpriteUV(this.mesh.geometry, textureFiles$1.bomb, 16, 16, i);
      taskIndex = yield;
    }
    
    this.enable_ = false;
    this.mesh.visible = false;
    tasks.removeTask(taskIndex);
  }
}

class Bombs {
  constructor(scene, se) {
    this.bombs = new Array(0);
    for (var i = 0; i < 32; ++i) {
      this.bombs.push(new Bomb(scene, se));
    }
  }
  
  start(x, y, z) {
    var boms = this.bombs;
    var count = 3;
    for (var i = 0, end = boms.length; i < end; ++i) {
      if (!boms[i].enable_) {
        if (count == 2) {
          boms[i].start(x, y, z, 0);
        } else {
          boms[i].start(x + (Math.random() * 16 - 8), y + (Math.random() * 16 - 8), z, Math.random() * 8);
        }
        count--;
        if (!count) break;
      }
    }
  }

  reset(){
    this.bombs.forEach((d)=>{
      if(d.enable_){
        while(!tasks.array[d.task.index].genInst.next(-(1+d.task.index)).done);
      }
    });
  }
}

var seqData = {
  name: 'Test',
  tracks: [
/*    {
      name: 'part1',
      channel: 0,
      mml:
      `
       s0.01,0.2,0.2,0.03 @2 
       t140  q35 v30 l1r1r1r1r1 $l16o3 cccccccc<ggggaabb> cccccccc<gggg>cc<bb b-b-b-b-b-b-b-b-ffffggg+g+ g+g+g+g+g+g+g+g+ggggaabb >
             `
      },*/
    {
      name: 'part1',
      channel: 1,
      mml:
      `
       s0.01,0.2,0.2,0.03 @2 
       t160  q55 v20 o2 l8 $bbbb bbbb
             `
      },
    {
      name: 'part1',
      channel: 2,
      mml:
      `
       s0.01,0.2,0.2,0.05 @4 
       t160  q75 v20 o4 l8 $[bd+]1 [bd+][bd+] r8[f+>c+<] r8[d+b-] r8[bd+]2.r8r4
             `
      },

    {
      name: 'base',
      channel: 3,
      mml:
      `s0.01,0.01,1.0,0.05 o5 t160 @10 v60 q20 $l4grg8g8r`
    }
    ,
    {
      name: 'part4',
      channel: 4,
      mml:
      `s0.01,0.01,1.0,0.05 o5 t160 @21 v60 q80 $/:l4rv60b8.v30b16rl16v60b8r8:/3l4rb8.b16rl16br16bb`
    }
    ,
    {
      name: 'part5',
      channel: 5,
      mml:
      `s0.01,0.01,1.0,0.05 o5 t160 @11 l8 $ q20 v60 r8a8 r8a8`
    }
    ,
    {
      name: 'part5',
      channel: 4,
      mml:
      `s0.01,0.01,1.0,0.05 o5 t160 @20 q95 $v20 l4 rgrg `
    }
  ]
};

var soundEffectData = [
  // 0
  {
    name: '',
    tracks: [
      {
        channel: 12,
        oneshot: true,
        mml: 's0.0001,0.0001,1.0,0.001 @4 t240 q127 v50 l128 o8 cdefgab < cdegabbbb'
      },
      {
        channel: 13,
        oneshot: true,
        mml: 's0.0001,0.0001,1.0,0.001 @4 t240 q127 v50 l128 o7 cdefgab < cdegabbbb'
      }
    ]
  },
  // 1
  {
    name: '',
    tracks: [
      {
        channel: 14,
        oneshot: true,
        mml: 's0.0001,0.0001,1.0,0.0001 @4 t200 q127 v50 l64 o6 g ab<bagfedcegab>bagfedc>dbagfedc'
      }
    ]
  },
  // 2 
  {
    name: '',
    tracks: [
      {
        channel: 14,
        oneshot: true,
        mml: 's0.0001,0.0001,1.0,0.0001 @4 t150 q127 v50 l128 o6 cdefgab>cdef<g>a>b<a>g<f>e<e'
      }
    ]
  },
  // 3 
  {
    name: '',
    tracks: [
      {
        channel: 14,
        oneshot: true,
        mml: 's0.0001,0.0001,1.0,0.0001 @5 t200 q127 v50 l64 o6 c<c>c<c>c<c>c<'
      }
    ]
  },
  // 4 
  {
    name: '',
    tracks: [
      {
        channel: 15,
        oneshot: true,
        mml: 's0.0001,0.0001,1.0,0.25 @8 t120 q127 v50 l2 o0 c'
      }
    ]
  }
];

//var STAGE_MAX = 1;
//import * as song from './song';
class ScoreEntry {
  constructor(name, score) {
    this.name = name;
    this.score = score;
  }
}


class Stage extends EventEmitter {
  constructor() {
    super();
    this.MAX = 1;
    this.DIFFICULTY_MAX = 2.0;
    this.no = 1;
    this.privateNo = 0;
    this.difficulty = 1;
  }

  reset() {
    this.no = 1;
    this.privateNo = 0;
    this.difficulty = 1;
  }

  advance() {
    this.no++;
    this.privateNo++;
    this.update();
  }

  jump(stageNo) {
    this.no = stageNo;
    this.privateNo = this.no - 1;
    this.update();
  }

  update() {
    if (this.difficulty < this.DIFFICULTY_MAX) {
      this.difficulty = 1 + 0.05 * (this.no - 1);
    }

    if (this.privateNo >= this.MAX) {
      this.privateNo = 0;
  //    this.no = 1;
    }
    this.emit('update',this);
  }
}

class Game {
  constructor() {
    this.CONSOLE_WIDTH = 0;
    this.CONSOLE_HEIGHT = 0;
    this.RENDERER_PRIORITY = 100000 | 0;
    this.renderer = null;
    this.stats = null;
    this.scene = null;
    this.camera = null;
    this.author = null;
    this.progress = null;
    this.textPlane = null;
    this.basicInput = new BasicInput();
    this.tasks = new Tasks();
    setTasks(this.tasks);
    this.waveGraph = null;
    this.start = false;
    this.baseTime = new Date;
    this.d = -0.2;
    this.audio_ = null;
    this.sequencer = null;
    this.piano = null;
    this.score = 0;
    this.highScore = 0;
    this.highScores = [];
    this.isHidden = false;
    this.myship_ = null;
    this.enemies = null;
    this.enemyBullets = null;
    this.PI = Math.PI;
    this.comm_ = null;
    this.handleName = '';
    this.storage = null;
    this.rank = -1;
    this.soundEffects = null;
    this.ens = null;
    this.enbs = null;
    this.stage = new Stage();
    setStage(this.stage);
    this.title = null;// タイトルメッシュ
    this.spaceField = null;// 宇宙空間パーティクル
    this.editHandleName = null;
    setAddScore(this.addScore.bind(this));
    this.checkVisibilityAPI();
    this.audio_ = new Audio();
  }

  exec() {
    
    if (!this.checkBrowserSupport('#content')){
      return;
    }

    this.sequencer = new Sequencer(this.audio_);
    this.soundEffects = new SoundEffects(this.sequencer,soundEffectData);

    document.addEventListener(window.visibilityChange, this.onVisibilityChange.bind(this), false);
    setGameTimer(new GameTimer(this.getCurrentTime.bind(this)));

    /// ゲームコンソールの初期化
    this.initConsole();
    this.loadResources()
      .then(() => {
        this.scene.remove(this.progress.mesh);
        this.renderer.render(this.scene, this.camera);
        this.tasks.clear();
        this.tasks.pushTask(this.basicInput.update.bind(this.basicInput));
        this.tasks.pushTask(this.init.bind(this));
        this.start = true;
        this.main();
      });
  }

  checkVisibilityAPI() {
    // hidden プロパティおよび可視性の変更イベントの名前を設定
    if (typeof document.hidden !== "undefined") { // Opera 12.10 や Firefox 18 以降でサポート 
      this.hidden = "hidden";
      window.visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
      this.hidden = "mozHidden";
      window.visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.hidden = "msHidden";
      window.visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.hidden = "webkitHidden";
      window.visibilityChange = "webkitvisibilitychange";
    }
  }
  
  calcScreenSize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    if (width >= height) {
      width = height * VIRTUAL_WIDTH / VIRTUAL_HEIGHT;
      while (width > window.innerWidth) {
        --height;
        width = height * VIRTUAL_WIDTH / VIRTUAL_HEIGHT;
      }
    } else {
      height = width * VIRTUAL_HEIGHT / VIRTUAL_WIDTH;
      while (height > window.innerHeight) {
        --width;
        height = width * VIRTUAL_HEIGHT / VIRTUAL_WIDTH;
      }
    }
    this.CONSOLE_WIDTH = width;
    this.CONSOLE_HEIGHT = height;
  }
  
  /// コンソール画面の初期化
  initConsole(consoleClass) {
    // レンダラーの作成
    this.renderer = new THREE.WebGLRenderer({ antialias: false, sortObjects: true });
    var renderer = this.renderer;
    this.calcScreenSize();
    renderer.setSize(this.CONSOLE_WIDTH, this.CONSOLE_HEIGHT);
    renderer.setClearColor(0, 1);
    renderer.domElement.id = 'console';
    renderer.domElement.className = consoleClass || 'console';
    renderer.domElement.style.zIndex = 0;


    d3.select('#content').node().appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
      this.calcScreenSize();
      renderer.setSize(this.CONSOLE_WIDTH, this.CONSOLE_HEIGHT);
    });

    // シーンの作成
    this.scene = new THREE.Scene();

    // カメラの作成
    this.camera = new THREE.PerspectiveCamera(90.0, VIRTUAL_WIDTH / VIRTUAL_HEIGHT);
    this.camera.position.z = VIRTUAL_HEIGHT / 2;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // ライトの作成
    //var light = new THREE.DirectionalLight(0xffffff);
    //light.position = new THREE.Vector3(0.577, 0.577, 0.577);
    //scene.add(light);

    //var ambient = new THREE.AmbientLight(0xffffff);
    //scene.add(ambient);
    renderer.clear();
  }

  /// エラーで終了する。
  ExitError(e) {
    //ctx.fillStyle = "red";
    //ctx.fillRect(0, 0, CONSOLE_WIDTH, CONSOLE_HEIGHT);
    //ctx.fillStyle = "white";
    //ctx.fillText("Error : " + e, 0, 20);
    ////alert(e);
    this.start = false;
    throw e;
  }

  onVisibilityChange() {
    var h = document[this.hidden];
    this.isHidden = h;
    if (h) {
      this.pause();
    } else {
      this.resume();
    }
  }

  pause() {
    if (gameTimer.status == gameTimer.START) {
      gameTimer.pause();
    }
    if (this.sequencer.status == this.sequencer.PLAY) {
      this.sequencer.pause();
    }
    setPause(true);
  }

  resume() {
    if (gameTimer.status == gameTimer.PAUSE) {
      gameTimer.resume();
    }
    if (this.sequencer.status == this.sequencer.PAUSE) {
      this.sequencer.resume();
    }
    setPause(false);
  }

  /// 現在時間の取得
  getCurrentTime() {
    return this.audio_.audioctx.currentTime;
  }

  /// ブラウザの機能チェック
  checkBrowserSupport() {
    var content = '<img class="errorimg" src="http://public.blu.livefilestore.com/y2pbY3aqBz6wz4ah87RXEVk5ClhD2LujC5Ns66HKvR89ajrFdLM0TxFerYYURt83c_bg35HSkqc3E8GxaFD8-X94MLsFV5GU6BYp195IvegevQ/20131001.png?psid=1" width="479" height="640" class="alignnone" />';
    // WebGLのサポートチェック
    if (!Detector.webgl) {
      d3.select('#content').append('div').classed('error', true).html(
        content + '<p class="errortext">ブラウザが<br/>WebGLをサポートしていないため<br/>動作いたしません。</p>');
      return false;
    }

    // Web Audio APIラッパー
    if (!this.audio_.enable) {
      d3.select('#content').append('div').classed('error', true).html(
        content + '<p class="errortext">ブラウザが<br/>Web Audio APIをサポートしていないため<br/>動作いたしません。</p>');
      return false;
    }

    // ブラウザがPage Visibility API をサポートしない場合に警告 
    if (typeof this.hidden === 'undefined') {
      d3.select('#content').append('div').classed('error', true).html(
        content + '<p class="errortext">ブラウザが<br/>Page Visibility APIをサポートしていないため<br/>動作いたしません。</p>');
      return false;
    }

    if (typeof localStorage === 'undefined') {
      d3.select('#content').append('div').classed('error', true).html(
        content + '<p class="errortext">ブラウザが<br/>Web Local Storageをサポートしていないため<br/>動作いたしません。</p>');
      return false;
    } else {
      this.storage = localStorage;
    }
    return true;
  }
 
  /// ゲームメイン
  main() {
    // タスクの呼び出し
    // メインに描画
    if (this.start) {
      this.tasks.process(this);
    }
  }

  loadResources() {
    /// ゲーム中のテクスチャー定義
    var textures = {
      font: 'base/graphic/Font.png',
      font1: 'base/graphic/Font2.png',
      author: 'base/graphic/author.png',
      title: 'base/graphic/TITLE.png',
      myship: 'base/graphic/myship2.png',
      enemy: 'base/graphic/enemy.png',
      bomb: 'base/graphic/bomb.png'
    };
    /// テクスチャーのロード
  
    var loadPromise = this.audio_.readDrumSample;
    var loader = new THREE.TextureLoader();
    function loadTexture(src) {
      return new Promise((resolve, reject) => {
        loader.load(src, (texture) => {
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.LinearMipMapLinearFilter;
          resolve(texture);
        }, null, (xhr) => { reject(xhr); });
      });
    }

    var texLength = Object.keys(textures).length;
    var texCount = 0;
    this.progress = new Progress();
    this.progress.mesh.position.z = 0.001;
    this.progress.render('Loading Resouces ...', 0);
    this.scene.add(this.progress.mesh);
    for (var n in textures) {
      ((name, texPath) => {
        loadPromise = loadPromise
          .then(() => {
            return loadTexture(resourceBase + texPath);
          })
          .then((tex) => {
            texCount++;
            this.progress.render('Loading Resouces ...', (texCount / texLength * 100) | 0);
            textureFiles$1[name] = tex;
            this.renderer.render(this.scene, this.camera);
            return Promise.resolve();
          });
      })(n, textures[n]);
    }
    return loadPromise;
  }

*render(taskIndex) {
  while(taskIndex >= 0){
    this.renderer.render(this.scene, this.camera);
    this.textPlane.render();
    this.stats && this.stats.update();
    taskIndex = yield;
  }
}

initActors()
{
  let promises = [];
  this.scene = this.scene || new THREE.Scene();
  this.enemyBullets = this.enemyBullets || new EnemyBullets(this.scene, this.se.bind(this));
  this.enemies = this.enemies || new Enemies(this.scene, this.se.bind(this), this.enemyBullets);
  promises.push(this.enemies.loadPatterns());
  promises.push(this.enemies.loadFormations());
  this.bombs = this.bombs || new Bombs(this.scene, this.se.bind(this));
  setBombs(this.bombs);
  this.myship_ = this.myship_ || new MyShip(0, -100, 0.1, this.scene, this.se.bind(this));
  setMyShip(this.myship_);
  this.myship_.mesh.visible = false;

  this.spaceField = null;
  return Promise.all(promises);
}

initCommAndHighScore()
{
  // ハンドルネームの取得
  this.handleName = this.storage.getItem('handleName');

  this.textPlane = new TextPlane(this.scene);
  // textPlane.print(0, 0, "Web Audio API Test", new TextAttribute(true));
  // スコア情報 通信用
  this.comm_ = new Comm();
  this.comm_.updateHighScores = (data) => {
    this.highScores = data;
    this.highScore = this.highScores[0].score;
  };

  this.comm_.updateHighScore = (data) => {
    if (this.highScore < data.score) {
      this.highScore = data.score;
      this.printScore();
    }
  };
  
}

*init(taskIndex) {
    taskIndex = yield;
    this.initCommAndHighScore();
    this.basicInput.bind();
    this.initActors()
    .then(()=>{
      this.tasks.pushTask(this.render.bind(this), this.RENDERER_PRIORITY);
      this.tasks.setNextTask(taskIndex, this.printAuthor.bind(this));
    });
}

/// 作者表示
*printAuthor(taskIndex) {
  const wait = 60;
  this.basicInput.keyBuffer.length = 0;
  
  let nextTask = ()=>{
    this.scene.remove(this.author);
    //scene.needsUpdate = true;
    this.tasks.setNextTask(taskIndex, this.initTitle.bind(this));
  };
  
  let checkKeyInput = ()=> {
    if (this.basicInput.keyBuffer.length > 0 || this.basicInput.start) {
      this.basicInput.keyBuffer.length = 0;
      nextTask();
      return true;
    }
    return false;
  };  

  // 初期化
  var canvas = document.createElement('canvas');
  var w = textureFiles$1.author.image.width;
  var h = textureFiles$1.author.image.height;
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(textureFiles$1.author.image, 0, 0);
  var data = ctx.getImageData(0, 0, w, h);
  var geometry = new THREE.Geometry();

  geometry.vert_start = [];
  geometry.vert_end = [];

  {
    var i = 0;

    for (var y = 0; y < h; ++y) {
      for (var x = 0; x < w; ++x) {
        var color = new THREE.Color();

        var r = data.data[i++];
        var g = data.data[i++];
        var b = data.data[i++];
        var a = data.data[i++];
        if (a != 0) {
          color.setRGB(r / 255.0, g / 255.0, b / 255.0);
          var vert = new THREE.Vector3(((x - w / 2.0)), ((y - h / 2)) * -1, 0.0);
          var vert2 = new THREE.Vector3(1200 * Math.random() - 600, 1200 * Math.random() - 600, 1200 * Math.random() - 600);
          geometry.vert_start.push(new THREE.Vector3(vert2.x - vert.x, vert2.y - vert.y, vert2.z - vert.z));
          geometry.vertices.push(vert2);
          geometry.vert_end.push(vert);
          geometry.colors.push(color);
        }
      }
    }
  }

  // マテリアルを作成
  //var texture = THREE.ImageUtils.loadTexture('images/particle1.png');
  var material = new THREE.PointsMaterial({size: 20, blending: THREE.AdditiveBlending,
    transparent: true, vertexColors: true, depthTest: false//, map: texture
  });

  this.author = new THREE.Points(geometry, material);
  //    author.position.x author.position.y=  =0.0, 0.0, 0.0);

  //mesh.sortParticles = false;
  //var mesh1 = new THREE.ParticleSystem();
  //mesh.scale.x = mesh.scale.y = 8.0;

  this.scene.add(this.author);  

 
  // 作者表示ステップ１
  for(let count = 1.0;count > 0;(count <= 0.01)?count -= 0.0005:count -= 0.0025)
  {
    // 何かキー入力があった場合は次のタスクへ
    if(checkKeyInput()){
      return;
    }
    
    let end = this.author.geometry.vertices.length;
    let v = this.author.geometry.vertices;
    let d = this.author.geometry.vert_start;
    let v2 = this.author.geometry.vert_end;
    for (var i = 0; i < end; ++i) {
      v[i].x = v2[i].x + d[i].x * count;
      v[i].y = v2[i].y + d[i].y * count;
      v[i].z = v2[i].z + d[i].z * count;
    }
    this.author.geometry.verticesNeedUpdate = true;
    this.author.rotation.x = this.author.rotation.y = this.author.rotation.z = count * 4.0;
    this.author.material.opacity = 1.0;
    yield;
  }
  this.author.rotation.x = this.author.rotation.y = this.author.rotation.z = 0.0;

  for (let i = 0,e = this.author.geometry.vertices.length; i < e; ++i) {
    this.author.geometry.vertices[i].x = this.author.geometry.vert_end[i].x;
    this.author.geometry.vertices[i].y = this.author.geometry.vert_end[i].y;
    this.author.geometry.vertices[i].z = this.author.geometry.vert_end[i].z;
  }
  this.author.geometry.verticesNeedUpdate = true;

  // 待ち
  for(let i = 0;i < wait;++i){
    // 何かキー入力があった場合は次のタスクへ
    if(checkKeyInput()){
      return;
    }
    if (this.author.material.size > 2) {
      this.author.material.size -= 0.5;
      this.author.material.needsUpdate = true;
    }    
    yield;
  }

  // フェードアウト
  for(let count = 0.0;count <= 1.0;count += 0.05)
  {
    // 何かキー入力があった場合は次のタスクへ
    if(checkKeyInput()){
      return;
    }
    this.author.material.opacity = 1.0 - count;
    this.author.material.needsUpdate = true;
    
    yield;
  }

  this.author.material.opacity = 0.0; 
  this.author.material.needsUpdate = true;

  // 待ち
  for(let i = 0;i < wait;++i){
    // 何かキー入力があった場合は次のタスクへ
    if(checkKeyInput()){
      return;
    }
    yield;
  }
  nextTask();
}

/// タイトル画面初期化 ///
*initTitle(taskIndex) {
  
  taskIndex = yield;
  
  this.basicInput.clear();

  // タイトルメッシュの作成・表示 ///
  var material = new THREE.MeshBasicMaterial({ map: textureFiles$1.title });
  material.shading = THREE.FlatShading;
  //material.antialias = false;
  material.transparent = true;
  material.alphaTest = 0.5;
  material.depthTest = true;
  this.title = new THREE.Mesh(
    new THREE.PlaneGeometry(textureFiles$1.title.image.width, textureFiles$1.title.image.height),
    material
    );
  this.title.scale.x = this.title.scale.y = 0.8;
  this.title.position.y = 80;
  this.scene.add(this.title);
  this.showSpaceField();
  /// テキスト表示
  this.textPlane.print(3, 25, "Push z or START button", new TextAttribute(true));
  gameTimer.start();
  this.showTitle.endTime = gameTimer.elapsedTime + 10/*秒*/;
  this.tasks.setNextTask(taskIndex, this.showTitle.bind(this));
  return;
}

/// 背景パーティクル表示
showSpaceField() {
  /// 背景パーティクル表示
  if (!this.spaceField) {
    var geometry = new THREE.Geometry();

    geometry.endy = [];
    for (var i = 0; i < 250; ++i) {
      var color = new THREE.Color();
      var z = -1800.0 * Math.random() - 300.0;
      color.setHSL(0.05 + Math.random() * 0.05, 1.0, (-2100 - z) / -2100);
      var endy = VIRTUAL_HEIGHT / 2 - z * VIRTUAL_HEIGHT / VIRTUAL_WIDTH;
      var vert2 = new THREE.Vector3((VIRTUAL_WIDTH - z * 2) * Math.random() - ((VIRTUAL_WIDTH - z * 2) / 2)
        , endy * 2 * Math.random() - endy, z);
      geometry.vertices.push(vert2);
      geometry.endy.push(endy);

      geometry.colors.push(color);
    }

    // マテリアルを作成
    //var texture = THREE.ImageUtils.loadTexture('images/particle1.png');
    var material = new THREE.PointsMaterial({
      size: 4, blending: THREE.AdditiveBlending,
      transparent: true, vertexColors: true, depthTest: true//, map: texture
    });

    this.spaceField = new THREE.Points(geometry, material);
    this.spaceField.position.x = this.spaceField.position.y = this.spaceField.position.z = 0.0;
    this.scene.add(this.spaceField);
    this.tasks.pushTask(this.moveSpaceField.bind(this));
  }
}

/// 宇宙空間の表示
*moveSpaceField(taskIndex) {
  while(true){
    var verts = this.spaceField.geometry.vertices;
    var endys = this.spaceField.geometry.endy;
    for (var i = 0, end = verts.length; i < end; ++i) {
      verts[i].y -= 4;
      if (verts[i].y < -endys[i]) {
        verts[i].y = endys[i];
      }
    }
    this.spaceField.geometry.verticesNeedUpdate = true;
    taskIndex = yield;
  }
}

/// タイトル表示
*showTitle(taskIndex) {
 while(true){
  gameTimer.update();

  if (this.basicInput.z || this.basicInput.start ) {
    this.scene.remove(this.title);
    this.tasks.setNextTask(taskIndex, this.initHandleName.bind(this));
  }
  if (this.showTitle.endTime < gameTimer.elapsedTime) {
    this.scene.remove(this.title);
    this.tasks.setNextTask(taskIndex, this.initTop10.bind(this));
  }
  yield;
 }
}

/// ハンドルネームのエントリ前初期化
*initHandleName(taskIndex) {
  let end = false;
  if (this.editHandleName){
    this.tasks.setNextTask(taskIndex, this.gameInit.bind(this));
  } else {
    this.editHandleName = this.handleName || '';
    this.textPlane.cls();
    this.textPlane.print(4, 18, 'Input your handle name.');
    this.textPlane.print(8, 19, '(Max 8 Char)');
    this.textPlane.print(10, 21, this.editHandleName);
    //    textPlane.print(10, 21, handleName[0], TextAttribute(true));
    this.basicInput.unbind();
    var elm = d3.select('#content').append('input');
    let this_ = this;
    elm
      .attr('type', 'text')
      .attr('pattern', '[a-zA-Z0-9_\@\#\$\-]{0,8}')
      .attr('maxlength', 8)
      .attr('id', 'input-area')
      .attr('value', this_.editHandleName)
      .call(function (d) {
        d.node().selectionStart = this_.editHandleName.length;
      })
      .on('blur', function () {
        d3.event.preventDefault();
        d3.event.stopImmediatePropagation();
        //let this_ = this;
        setTimeout( () => { this.focus(); }, 10);
        return false;
      })
      .on('keyup', function() {
        if (d3.event.keyCode == 13) {
          this_.editHandleName = this.value;
          let s = this.selectionStart;
          let e = this.selectionEnd;
          this_.textPlane.print(10, 21, this_.editHandleName);
          this_.textPlane.print(10 + s, 21, '_', new TextAttribute(true));
          d3.select(this).on('keyup', null);
          this_.basicInput.bind();
          // このタスクを終わらせる
          this_.tasks.array[taskIndex].genInst.next(-(taskIndex + 1));
          // 次のタスクを設定する
          this_.tasks.setNextTask(taskIndex, this_.gameInit.bind(this_));
          this_.storage.setItem('handleName', this_.editHandleName);
          d3.select('#input-area').remove();
          return false;
        }
        this_.editHandleName = this.value;
        let s = this.selectionStart;
        this_.textPlane.print(10, 21, '           ');
        this_.textPlane.print(10, 21, this_.editHandleName);
        this_.textPlane.print(10 + s, 21, '_', new TextAttribute(true));
      })
      .call(function(){
        let s = this.node().selectionStart;
        this_.textPlane.print(10, 21, '           ');
        this_.textPlane.print(10, 21, this_.editHandleName);
        this_.textPlane.print(10 + s, 21, '_', new TextAttribute(true));
        this.node().focus();
      });

    while(taskIndex >= 0)
    {
      this.basicInput.clear();
      if(this.basicInput.aButton || this.basicInput.start)
      {
          var inputArea = d3.select('#input-area');
          var inputNode = inputArea.node();
          this.editHandleName = inputNode.value;
          let s = inputNode.selectionStart;
          let e = inputNode.selectionEnd;
          this.textPlane.print(10, 21, this.editHandleName);
          this.textPlane.print(10 + s, 21, '_', new TextAttribute(true));
          inputArea.on('keyup', null);
          this.basicInput.bind();
          // このタスクを終わらせる
          //this.tasks.array[taskIndex].genInst.next(-(taskIndex + 1));
          // 次のタスクを設定する
          this.tasks.setNextTask(taskIndex, this.gameInit.bind(this));
          this.storage.setItem('handleName', this.editHandleName);
          inputArea.remove();
          return;        
      }
      taskIndex = yield;
    }
    taskIndex = -(++taskIndex);
  }
}

/// スコア加算
addScore(s) {
  this.score += s;
  if (this.score > this.highScore) {
    this.highScore = this.score;
  }
}

/// スコア表示
printScore() {
  var s = ('00000000' + this.score.toString()).slice(-8);
  this.textPlane.print(1, 1, s);

  var h = ('00000000' + this.highScore.toString()).slice(-8);
  this.textPlane.print(12, 1, h);

}

/// サウンドエフェクト
se(index) {
  this.sequencer.playTracks(this.soundEffects.soundEffects[index]);
}

/// ゲームの初期化
*gameInit(taskIndex) {

  taskIndex = yield;
  

  // オーディオの開始
  this.audio_.start();
  this.sequencer.load(seqData);
  this.sequencer.start();
  stage.reset();
  this.textPlane.cls();
  this.enemies.reset();

  // 自機の初期化
  this.myship_.init();
  gameTimer.start();
  this.score = 0;
  this.textPlane.print(2, 0, 'Score    High Score');
  this.textPlane.print(20, 39, 'Rest:   ' + myship_.rest);
  this.printScore();
  this.tasks.setNextTask(taskIndex, this.stageInit.bind(this)/*gameAction*/);
}

/// ステージの初期化
*stageInit(taskIndex) {
  
  taskIndex = yield;
  
  this.textPlane.print(0, 39, 'Stage:' + stage.no);
  gameTimer.start();
  this.enemies.reset();
  this.enemies.start();
  this.enemies.calcEnemiesCount(stage.privateNo);
  this.enemies.hitEnemiesCount = 0;
  this.textPlane.print(8, 15, 'Stage ' + (stage.no) + ' Start !!', new TextAttribute(true));
  this.tasks.setNextTask(taskIndex, this.stageStart.bind(this));
}

/// ステージ開始
*stageStart(taskIndex) {
  let endTime = gameTimer.elapsedTime + 2;
  while(taskIndex >= 0 && endTime >= gameTimer.elapsedTime){
    gameTimer.update();
    myship_.action(this.basicInput);
    taskIndex = yield;    
  }
  this.textPlane.print(8, 15, '                  ', new TextAttribute(true));
  this.tasks.setNextTask(taskIndex, this.gameAction.bind(this), 5000);
}

/// ゲーム中
*gameAction(taskIndex) {
  while (taskIndex >= 0){
    this.printScore();
    myship_.action(this.basicInput);
    gameTimer.update();
    //console.log(sfg.gameTimer.elapsedTime);
    this.enemies.move();

    if (!this.processCollision()) {
      // 面クリアチェック
      if (this.enemies.hitEnemiesCount == this.enemies.totalEnemiesCount) {
        this.printScore();
        this.stage.advance();
        this.tasks.setNextTask(taskIndex, this.stageInit.bind(this));
        return;
      }
    } else {
      this.myShipBomb.endTime = gameTimer.elapsedTime + 3;
      this.tasks.setNextTask(taskIndex, this.myShipBomb.bind(this));
      return;
    }
    taskIndex = yield; 
  }
}

/// 当たり判定
processCollision(taskIndex) {
  //　自機弾と敵とのあたり判定
  let myBullets = myship_.myBullets;
  this.ens = this.enemies.enemies;
  for (var i = 0, end = myBullets.length; i < end; ++i) {
    let myb = myBullets[i];
    if (myb.enable_) {
      var mybco = myBullets[i].collisionArea;
      var left = mybco.left + myb.x;
      var right = mybco.right + myb.x;
      var top = mybco.top + myb.y;
      var bottom = mybco.bottom - myb.speed + myb.y;
      for (var j = 0, endj = this.ens.length; j < endj; ++j) {
        var en = this.ens[j];
        if (en.enable_) {
          var enco = en.collisionArea;
          if (top > (en.y + enco.bottom) &&
            (en.y + enco.top) > bottom &&
            left < (en.x + enco.right) &&
            (en.x + enco.left) < right
            ) {
            en.hit(myb);
            if (myb.power <= 0) {
              myb.enable_ = false;
            }
            break;
          }
        }
      }
    }
  }

  // 敵と自機とのあたり判定
  if (CHECK_COLLISION) {
    let myco = myship_.collisionArea;
    let left = myship_.x + myco.left;
    let right = myco.right + myship_.x;
    let top = myco.top + myship_.y;
    let bottom = myco.bottom + myship_.y;

    for (var i = 0, end = this.ens.length; i < end; ++i) {
      let en = this.ens[i];
      if (en.enable_) {
        let enco = en.collisionArea;
        if (top > (en.y + enco.bottom) &&
          (en.y + enco.top) > bottom &&
          left < (en.x + enco.right) &&
          (en.x + enco.left) < right
          ) {
          en.hit(myship);
          myship_.hit();
          return true;
        }
      }
    }
    // 敵弾と自機とのあたり判定
    this.enbs = this.enemyBullets.enemyBullets;
    for (var i = 0, end = this.enbs.length; i < end; ++i) {
      let en = this.enbs[i];
      if (en.enable) {
        let enco = en.collisionArea;
        if (top > (en.y + enco.bottom) &&
          (en.y + enco.top) > bottom &&
          left < (en.x + enco.right) &&
          (en.x + enco.left) < right
          ) {
          en.hit();
          myship_.hit();
          return true;
        }
      }
    }

  }
  return false;
}

/// 自機爆発 
*myShipBomb(taskIndex) {
  while(gameTimer.elapsedTime <= this.myShipBomb.endTime && taskIndex >= 0){
    this.enemies.move();
    gameTimer.update();
    taskIndex = yield;  
  }
  myship_.rest--;
  if (myship_.rest <= 0) {
    this.textPlane.print(10, 18, 'GAME OVER', new TextAttribute(true));
    this.printScore();
    this.textPlane.print(20, 39, 'Rest:   ' + myship_.rest);
    if(this.comm_.enable){
      this.comm_.socket.on('sendRank', this.checkRankIn);
      this.comm_.sendScore(new ScoreEntry(this.editHandleName, this.score));
    }
    this.gameOver.endTime = gameTimer.elapsedTime + 5;
    this.rank = -1;
    this.tasks.setNextTask(taskIndex, this.gameOver.bind(this));
    this.sequencer.stop();
  } else {
    myship_.mesh.visible = true;
    this.textPlane.print(20, 39, 'Rest:   ' + myship_.rest);
    this.textPlane.print(8, 15, 'Stage ' + (stage.no) + ' Start !!', new TextAttribute(true));
    this.stageStart.endTime = gameTimer.elapsedTime + 2;
    this.tasks.setNextTask(taskIndex, this.stageStart.bind(this));
  }
}

/// ゲームオーバー
*gameOver(taskIndex) {
  while(this.gameOver.endTime >= gameTimer.elapsedTime && taskIndex >= 0)
  {
    gameTimer.update();
    taskIndex = yield;
  }
  

  this.textPlane.cls();
  this.enemies.reset();
  this.enemyBullets.reset();
  if (this.rank >= 0) {
    this.tasks.setNextTask(taskIndex, this.initTop10.bind(this));
  } else {
    this.tasks.setNextTask(taskIndex, this.initTitle.bind(this));
  }
}

/// ランキングしたかどうかのチェック
checkRankIn(data) {
  this.rank = data.rank;
}


/// ハイスコアエントリの表示
printTop10() {
  var rankname = [' 1st', ' 2nd', ' 3rd', ' 4th', ' 5th', ' 6th', ' 7th', ' 8th', ' 9th', '10th'];
  this.textPlane.print(8, 4, 'Top 10 Score');
  var y = 8;
  for (var i = 0, end = this.highScores.length; i < end; ++i) {
    var scoreStr = '00000000' + this.highScores[i].score;
    scoreStr = scoreStr.substr(scoreStr.length - 8, 8);
    if (this.rank == i) {
      this.textPlane.print(3, y, rankname[i] + ' ' + scoreStr + ' ' + this.highScores[i].name, new TextAttribute(true));
    } else {
      this.textPlane.print(3, y, rankname[i] + ' ' + scoreStr + ' ' + this.highScores[i].name);
    }
    y += 2;
  }
}


*initTop10(taskIndex) {
  taskIndex = yield;
  this.textPlane.cls();
  this.printTop10();
  this.showTop10.endTime = gameTimer.elapsedTime + 5;
  this.tasks.setNextTask(taskIndex, this.showTop10.bind(this));
}

*showTop10(taskIndex) {
  while(this.showTop10.endTime >= gameTimer.elapsedTime && this.basicInput.keyBuffer.length == 0 && taskIndex >= 0)
  {
    gameTimer.update();
    taskIndex = yield;
  } 
  
  this.basicInput.keyBuffer.length = 0;
  this.textPlane.cls();
  this.tasks.setNextTask(taskIndex, this.initTitle.bind(this));
}
}

//var STAGE_MAX = 1;
// import * as util from './util.js';
// import * as audio from './audio.js';
// //import * as song from './song';
// import * as graphics from './graphics.js';
// import * as io from './io.js';
// import * as comm from './comm.js';
// import * as text from './text.js';
// import * as gameobj from './gameobj.js';
// import * as myship from './myship.js';
// import * as enemies from './enemies.js';
// import * as effectobj from './effectobj.js';
/// メイン
window.onload = function () {
  let reg = new RegExp('(.*\/)');
  let r = reg.exec(window.location.href);
  let root = r[1];
  if(window.location.href.match(/devver/)){
    setResourceBase('../../dist/res/');
  } else {
    setResourceBase('./res/');
  }
  setGame(new Game());
  game.exec();
};

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvZ2xvYmFsLmpzIiwiLi4vLi4vc3JjL2pzL2V2ZW50RW1pdHRlcjMuanMiLCIuLi8uLi9zcmMvanMvdXRpbC5qcyIsIi4uLy4uL3NyYy9qcy9TeW50YXguanMiLCIuLi8uLi9zcmMvanMvU2Nhbm5lci5qcyIsIi4uLy4uL3NyYy9qcy9NTUxQYXJzZXIuanMiLCIuLi8uLi9zcmMvanMvRGVmYXVsdFBhcmFtcy5qcyIsIi4uLy4uL3NyYy9qcy9semJhc2U2Mi5taW4uanMiLCIuLi8uLi9zcmMvanMvYXVkaW8uanMiLCIuLi8uLi9zcmMvanMvZ3JhcGhpY3MuanMiLCIuLi8uLi9zcmMvanMvaW8uanMiLCIuLi8uLi9zcmMvanMvY29tbS5qcyIsIi4uLy4uL3NyYy9qcy90ZXh0LmpzIiwiLi4vLi4vc3JjL2pzL2dhbWVvYmouanMiLCIuLi8uLi9zcmMvanMvbXlzaGlwLmpzIiwiLi4vLi4vc3JjL2pzL2VuZW1pZXMuanMiLCIuLi8uLi9zcmMvanMvZWZmZWN0b2JqLmpzIiwiLi4vLi4vc3JjL2pzL3NlcURhdGEuanMiLCIuLi8uLi9zcmMvanMvZ2FtZS5qcyIsIi4uLy4uL3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBWSVJUVUFMX1dJRFRIID0gMjQwO1xyXG5leHBvcnQgY29uc3QgVklSVFVBTF9IRUlHSFQgPSAzMjA7XHJcblxyXG5leHBvcnQgY29uc3QgVl9SSUdIVCA9IFZJUlRVQUxfV0lEVEggLyAyLjA7XHJcbmV4cG9ydCBjb25zdCBWX1RPUCA9IFZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG5leHBvcnQgY29uc3QgVl9MRUZUID0gLTEgKiBWSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG5leHBvcnQgY29uc3QgVl9CT1RUT00gPSAtMSAqIFZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG5cclxuZXhwb3J0IGNvbnN0IENIQVJfU0laRSA9IDg7XHJcbmV4cG9ydCBjb25zdCBURVhUX1dJRFRIID0gVklSVFVBTF9XSURUSCAvIENIQVJfU0laRTtcclxuZXhwb3J0IGNvbnN0IFRFWFRfSEVJR0hUID0gVklSVFVBTF9IRUlHSFQgLyBDSEFSX1NJWkU7XHJcbmV4cG9ydCBjb25zdCBQSVhFTF9TSVpFID0gMTtcclxuZXhwb3J0IGNvbnN0IEFDVFVBTF9DSEFSX1NJWkUgPSBDSEFSX1NJWkUgKiBQSVhFTF9TSVpFO1xyXG5leHBvcnQgY29uc3QgU1BSSVRFX1NJWkVfWCA9IDE2LjA7XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVfU0laRV9ZID0gMTYuMDtcclxuZXhwb3J0IGNvbnN0IENIRUNLX0NPTExJU0lPTiA9IHRydWU7XHJcbmV4cG9ydCBjb25zdCBERUJVRyA9IGZhbHNlO1xyXG5leHBvcnQgdmFyIHRleHR1cmVGaWxlcyA9IHt9O1xyXG5leHBvcnQgdmFyIHN0YWdlID0gMDtcclxuZXhwb3J0IHZhciB0YXNrcyA9IG51bGw7XHJcbmV4cG9ydCB2YXIgZ2FtZVRpbWVyID0gbnVsbDtcclxuZXhwb3J0IHZhciBib21icyA9IG51bGw7XHJcbmV4cG9ydCB2YXIgYWRkU2NvcmUgPSBudWxsO1xyXG5leHBvcnQgdmFyIG15c2hpcF8gPSBudWxsO1xyXG5leHBvcnQgdmFyIHBhdXNlID0gZmFsc2U7XHJcbmV4cG9ydCB2YXIgZ2FtZSA9IG51bGw7XHJcbmV4cG9ydCB2YXIgcmVzb3VyY2VCYXNlID0gJyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0R2FtZSh2KXtnYW1lID0gdjt9XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQYXVzZSh2KXtwYXVzZSA9IHY7fVxyXG5leHBvcnQgZnVuY3Rpb24gc2V0TXlTaGlwKHYpe215c2hpcF8gPSB2O31cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEFkZFNjb3JlKHYpe2FkZFNjb3JlID0gdjt9XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRCb21icyh2KXtib21icyA9IHY7fVxyXG5leHBvcnQgZnVuY3Rpb24gc2V0R2FtZVRpbWVyKHYpe2dhbWVUaW1lciA9IHY7fVxyXG5leHBvcnQgZnVuY3Rpb24gc2V0VGFza3Modil7dGFza3MgPSB2O31cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0YWdlKHYpe3N0YWdlID0gdjt9XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRSZXNvdXJjZUJhc2Uodil7cmVzb3VyY2VCYXNlID0gdjt9XHJcblxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vL1xyXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cclxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcclxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3JcclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxyXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxyXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxyXG4vL1xyXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cclxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcclxuICB0aGlzLmZuID0gZm47XHJcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcclxuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xyXG59XHJcblxyXG4vKipcclxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcclxuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cclxuICpcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cclxuXHJcbi8qKlxyXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxyXG4gKlxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXHJcbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XHJcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcclxuXHJcbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xyXG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XHJcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xyXG5cclxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcclxuICB9XHJcblxyXG4gIHJldHVybiBlZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcclxuXHJcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXHJcbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICwgYXJnc1xyXG4gICAgLCBpO1xyXG5cclxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xyXG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XHJcblxyXG4gICAgc3dpdGNoIChsZW4pIHtcclxuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xyXG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xyXG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcclxuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xyXG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xyXG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxyXG4gICAgICAsIGo7XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xyXG5cclxuICAgICAgc3dpdGNoIChsZW4pIHtcclxuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcclxuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xyXG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cclxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XHJcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXHJcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcclxuICBlbHNlIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcclxuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcclxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcclxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xyXG4gIGVsc2Uge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XHJcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xyXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cclxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcclxuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcclxuXHJcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXHJcbiAgICAsIGV2ZW50cyA9IFtdO1xyXG5cclxuICBpZiAoZm4pIHtcclxuICAgIGlmIChsaXN0ZW5lcnMuZm4pIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cclxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpXHJcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXHJcbiAgICAgICkge1xyXG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVycyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXHJcbiAgICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXHJcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcclxuICAgICAgICApIHtcclxuICAgICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL1xyXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cclxuICAvL1xyXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XHJcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xyXG5cclxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudF07XHJcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cclxuLy9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcclxuXHJcbi8vXHJcbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8vXHJcbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XHJcblxyXG4vL1xyXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cclxuLy9cclxuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XHJcbn1cclxuXHJcbiIsIlxyXG5cInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9ldmVudEVtaXR0ZXIzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBUYXNrIHtcclxuICBjb25zdHJ1Y3RvcihnZW5JbnN0LHByaW9yaXR5KSB7XHJcbiAgICB0aGlzLnByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMTAwMDA7XHJcbiAgICB0aGlzLmdlbkluc3QgPSBnZW5JbnN0O1xyXG4gICAgLy8g5Yid5pyf5YyWXHJcbiAgICB0aGlzLmluZGV4ID0gMDtcclxuICB9XHJcbiAgXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgbnVsbFRhc2sgPSBuZXcgVGFzaygoZnVuY3Rpb24qKCl7fSkoKSk7XHJcblxyXG4vLy8g44K/44K544Kv566h55CGXHJcbmV4cG9ydCBjbGFzcyBUYXNrcyBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcbiAgY29uc3RydWN0b3IoKXtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLmFycmF5ID0gbmV3IEFycmF5KDApO1xyXG4gICAgdGhpcy5uZWVkU29ydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSBmYWxzZTtcclxuICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xyXG4gIH1cclxuICAvLyBpbmRleOOBruS9jee9ruOBruOCv+OCueOCr+OCkue9ruOBjeaPm+OBiOOCi1xyXG4gIHNldE5leHRUYXNrKGluZGV4LCBnZW5JbnN0LCBwcmlvcml0eSkgXHJcbiAge1xyXG4gICAgaWYoaW5kZXggPCAwKXtcclxuICAgICAgaW5kZXggPSAtKCsraW5kZXgpO1xyXG4gICAgfVxyXG4gICAgaWYodGhpcy5hcnJheVtpbmRleF0ucHJpb3JpdHkgPT0gMTAwMDAwKXtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB2YXIgdCA9IG5ldyBUYXNrKGdlbkluc3QoaW5kZXgpLCBwcmlvcml0eSk7XHJcbiAgICB0LmluZGV4ID0gaW5kZXg7XHJcbiAgICB0aGlzLmFycmF5W2luZGV4XSA9IHQ7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHB1c2hUYXNrKGdlbkluc3QsIHByaW9yaXR5KSB7XHJcbiAgICBsZXQgdDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hcnJheS5sZW5ndGg7ICsraSkge1xyXG4gICAgICBpZiAodGhpcy5hcnJheVtpXSA9PSBudWxsVGFzaykge1xyXG4gICAgICAgIHQgPSBuZXcgVGFzayhnZW5JbnN0KGkpLCBwcmlvcml0eSk7XHJcbiAgICAgICAgdGhpcy5hcnJheVtpXSA9IHQ7XHJcbiAgICAgICAgdC5pbmRleCA9IGk7XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHQgPSBuZXcgVGFzayhnZW5JbnN0KHRoaXMuYXJyYXkubGVuZ3RoKSxwcmlvcml0eSk7XHJcbiAgICB0LmluZGV4ID0gdGhpcy5hcnJheS5sZW5ndGg7XHJcbiAgICB0aGlzLmFycmF5W3RoaXMuYXJyYXkubGVuZ3RoXSA9IHQ7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gdHJ1ZTtcclxuICAgIHJldHVybiB0O1xyXG4gIH1cclxuXHJcbiAgLy8g6YWN5YiX44KS5Y+W5b6X44GZ44KLXHJcbiAgZ2V0QXJyYXkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hcnJheTtcclxuICB9XHJcbiAgLy8g44K/44K544Kv44KS44Kv44Oq44Ki44GZ44KLXHJcbiAgY2xlYXIoKSB7XHJcbiAgICB0aGlzLmFycmF5Lmxlbmd0aCA9IDA7XHJcbiAgfVxyXG4gIC8vIOOCveODvOODiOOBjOW/heimgeOBi+ODgeOCp+ODg+OCr+OBl+OAgeOCveODvOODiOOBmeOCi1xyXG4gIGNoZWNrU29ydCgpIHtcclxuICAgIGlmICh0aGlzLm5lZWRTb3J0KSB7XHJcbiAgICAgIHRoaXMuYXJyYXkuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIGlmKGEucHJpb3JpdHkgPiBiLnByaW9yaXR5KSByZXR1cm4gMTtcclxuICAgICAgICBpZiAoYS5wcmlvcml0eSA8IGIucHJpb3JpdHkpIHJldHVybiAtMTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIOOCpOODs+ODh+ODg+OCr+OCueOBruaMr+OCiuebtOOBl1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgZSA9IHRoaXMuYXJyYXkubGVuZ3RoOyBpIDwgZTsgKytpKSB7XHJcbiAgICAgICAgdGhpcy5hcnJheVtpXS5pbmRleCA9IGk7XHJcbiAgICAgIH1cclxuICAgICB0aGlzLm5lZWRTb3J0ID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZW1vdmVUYXNrKGluZGV4KSB7XHJcbiAgICBpZihpbmRleCA8IDApe1xyXG4gICAgICBpbmRleCA9IC0oKytpbmRleCk7XHJcbiAgICB9XHJcbiAgICBpZih0aGlzLmFycmF5W2luZGV4XS5wcmlvcml0eSA9PSAxMDAwMDApe1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIHRoaXMuYXJyYXlbaW5kZXhdID0gbnVsbFRhc2s7XHJcbiAgICB0aGlzLm5lZWRDb21wcmVzcyA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGNvbXByZXNzKCkge1xyXG4gICAgaWYgKCF0aGlzLm5lZWRDb21wcmVzcykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgZGVzdCA9IFtdO1xyXG4gICAgdmFyIHNyYyA9IHRoaXMuYXJyYXk7XHJcbiAgICB2YXIgZGVzdEluZGV4ID0gMDtcclxuICAgIGRlc3QgPSBzcmMuZmlsdGVyKCh2LGkpPT57XHJcbiAgICAgIGxldCByZXQgPSB2ICE9IG51bGxUYXNrO1xyXG4gICAgICBpZihyZXQpe1xyXG4gICAgICAgIHYuaW5kZXggPSBkZXN0SW5kZXgrKztcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmV0O1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLmFycmF5ID0gZGVzdDtcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIHByb2Nlc3MoZ2FtZSlcclxuICB7XHJcbiAgICBpZih0aGlzLmVuYWJsZSl7XHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnByb2Nlc3MuYmluZCh0aGlzLGdhbWUpKTtcclxuICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XHJcbiAgICAgIGlmICghc2ZnLnBhdXNlKSB7XHJcbiAgICAgICAgaWYgKCFnYW1lLmlzSGlkZGVuKSB7XHJcbiAgICAgICAgICB0aGlzLmNoZWNrU29ydCgpO1xyXG4gICAgICAgICAgdGhpcy5hcnJheS5mb3JFYWNoKCAodGFzayxpKSA9PntcclxuICAgICAgICAgICAgaWYgKHRhc2sgIT0gbnVsbFRhc2spIHtcclxuICAgICAgICAgICAgICBpZih0YXNrLmluZGV4ICE9IGkgKXtcclxuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB0YXNrLmdlbkluc3QubmV4dCh0YXNrLmluZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLmNvbXByZXNzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICAgIFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5lbWl0KCdzdG9wcGVkJyk7XHJcbiAgICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHN0b3BQcm9jZXNzKCl7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUscmVqZWN0KT0+e1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm9uKCdzdG9wcGVkJywoKT0+e1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6DnlKjjgr/jgqTjg57jg7xcclxuZXhwb3J0IGNsYXNzIEdhbWVUaW1lciB7XHJcbiAgY29uc3RydWN0b3IoZ2V0Q3VycmVudFRpbWUpIHtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IDA7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICAgIHRoaXMuZ2V0Q3VycmVudFRpbWUgPSBnZXRDdXJyZW50VGltZTtcclxuICAgIHRoaXMuU1RPUCA9IDE7XHJcbiAgICB0aGlzLlNUQVJUID0gMjtcclxuICAgIHRoaXMuUEFVU0UgPSAzO1xyXG5cclxuICB9XHJcbiAgXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gMDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgfVxyXG5cclxuICByZXN1bWUoKSB7XHJcbiAgICB2YXIgbm93VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lICsgbm93VGltZSAtIHRoaXMucGF1c2VUaW1lO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gIH1cclxuXHJcbiAgcGF1c2UoKSB7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyAhPSB0aGlzLlNUQVJUKSByZXR1cm47XHJcbiAgICB2YXIgbm93VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gbm93VGltZSAtIHRoaXMuY3VycmVudFRpbWU7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gdGhpcy5lbGFwc2VkVGltZSArIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IG5vd1RpbWU7XHJcbiAgfVxyXG59XHJcblxyXG4iLCJleHBvcnQgZGVmYXVsdCB7XHJcbiAgTm90ZTogXCJOb3RlXCIsXHJcbiAgUmVzdDogXCJSZXN0XCIsXHJcbiAgT2N0YXZlOiBcIk9jdGF2ZVwiLFxyXG4gIE9jdGF2ZVNoaWZ0OiBcIk9jdGF2ZVNoaWZ0XCIsXHJcbiAgTm90ZUxlbmd0aDogXCJOb3RlTGVuZ3RoXCIsXHJcbiAgTm90ZVZlbG9jaXR5OiBcIk5vdGVWZWxvY2l0eVwiLFxyXG4gIE5vdGVRdWFudGl6ZTogXCJOb3RlUXVhbnRpemVcIixcclxuICBUZW1wbzogXCJUZW1wb1wiLFxyXG4gIEluZmluaXRlTG9vcDogXCJJbmZpbml0ZUxvb3BcIixcclxuICBMb29wQmVnaW46IFwiTG9vcEJlZ2luXCIsXHJcbiAgTG9vcEV4aXQ6IFwiTG9vcEV4aXRcIixcclxuICBMb29wRW5kOiBcIkxvb3BFbmRcIixcclxuICBUb25lOlwiVG9uZVwiLFxyXG4gIFdhdmVGb3JtOlwiV2F2ZUZvcm1cIixcclxuICBFbnZlbG9wZTpcIkVudmVsb3BlXCJcclxufTtcclxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2Nhbm5lciB7XHJcbiAgY29uc3RydWN0b3Ioc291cmNlKSB7XHJcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gIH1cclxuXHJcbiAgaGFzTmV4dCgpIHtcclxuICAgIHJldHVybiB0aGlzLmluZGV4IDwgdGhpcy5zb3VyY2UubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgcGVlaygpIHtcclxuICAgIHJldHVybiB0aGlzLnNvdXJjZS5jaGFyQXQodGhpcy5pbmRleCkgfHwgXCJcIjtcclxuICB9XHJcblxyXG4gIG5leHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UuY2hhckF0KHRoaXMuaW5kZXgrKykgfHwgXCJcIjtcclxuICB9XHJcblxyXG4gIGZvcndhcmQoKSB7XHJcbiAgICB3aGlsZSAodGhpcy5oYXNOZXh0KCkgJiYgdGhpcy5tYXRjaCgvXFxzLykpIHtcclxuICAgICAgdGhpcy5pbmRleCArPSAxO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbWF0Y2gobWF0Y2hlcikge1xyXG4gICAgaWYgKG1hdGNoZXIgaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuICAgICAgcmV0dXJuIG1hdGNoZXIudGVzdCh0aGlzLnBlZWsoKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5wZWVrKCkgPT09IG1hdGNoZXI7XHJcbiAgfVxyXG5cclxuICBleHBlY3QobWF0Y2hlcikge1xyXG4gICAgaWYgKCF0aGlzLm1hdGNoKG1hdGNoZXIpKSB7XHJcbiAgICAgIHRoaXMudGhyb3dVbmV4cGVjdGVkVG9rZW4oKTtcclxuICAgIH1cclxuICAgIHRoaXMuaW5kZXggKz0gMTtcclxuICB9XHJcblxyXG4gIHNjYW4obWF0Y2hlcikge1xyXG4gICAgbGV0IHRhcmdldCA9IHRoaXMuc291cmNlLnN1YnN0cih0aGlzLmluZGV4KTtcclxuICAgIGxldCByZXN1bHQgPSBudWxsO1xyXG5cclxuICAgIGlmIChtYXRjaGVyIGluc3RhbmNlb2YgUmVnRXhwKSB7XHJcbiAgICAgIGxldCBtYXRjaGVkID0gbWF0Y2hlci5leGVjKHRhcmdldCk7XHJcblxyXG4gICAgICBpZiAobWF0Y2hlZCAmJiBtYXRjaGVkLmluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgcmVzdWx0ID0gbWF0Y2hlZFswXTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh0YXJnZXQuc3Vic3RyKDAsIG1hdGNoZXIubGVuZ3RoKSA9PT0gbWF0Y2hlcikge1xyXG4gICAgICByZXN1bHQgPSBtYXRjaGVyO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgdGhpcy5pbmRleCArPSByZXN1bHQubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICB0aHJvd1VuZXhwZWN0ZWRUb2tlbigpIHtcclxuICAgIGxldCBpZGVudGlmaWVyID0gdGhpcy5wZWVrKCkgfHwgXCJJTExFR0FMXCI7XHJcblxyXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIHRva2VuOiAke2lkZW50aWZpZXJ9YCk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBTeW50YXggZnJvbSBcIi4vU3ludGF4XCI7XHJcbmltcG9ydCBTY2FubmVyIGZyb20gXCIuL1NjYW5uZXJcIjtcclxuXHJcbmNvbnN0IE5PVEVfSU5ERVhFUyA9IHsgYzogMCwgZDogMiwgZTogNCwgZjogNSwgZzogNywgYTogOSwgYjogMTEgfTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1NTFBhcnNlciB7XHJcbiAgY29uc3RydWN0b3Ioc291cmNlKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIgPSBuZXcgU2Nhbm5lcihzb3VyY2UpO1xyXG4gIH1cclxuXHJcbiAgcGFyc2UoKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgdGhpcy5fcmVhZFVudGlsKFwiO1wiLCAoKSA9PiB7XHJcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5hZHZhbmNlKCkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIGFkdmFuY2UoKSB7XHJcbiAgICBzd2l0Y2ggKHRoaXMuc2Nhbm5lci5wZWVrKCkpIHtcclxuICAgIGNhc2UgXCJjXCI6XHJcbiAgICBjYXNlIFwiZFwiOlxyXG4gICAgY2FzZSBcImVcIjpcclxuICAgIGNhc2UgXCJmXCI6XHJcbiAgICBjYXNlIFwiZ1wiOlxyXG4gICAgY2FzZSBcImFcIjpcclxuICAgIGNhc2UgXCJiXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWROb3RlKCk7XHJcbiAgICBjYXNlIFwiW1wiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkQ2hvcmQoKTtcclxuICAgIGNhc2UgXCJyXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRSZXN0KCk7XHJcbiAgICBjYXNlIFwib1wiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkT2N0YXZlKCk7XHJcbiAgICBjYXNlIFwiPlwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkT2N0YXZlU2hpZnQoKzEpO1xyXG4gICAgY2FzZSBcIjxcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZE9jdGF2ZVNoaWZ0KC0xKTtcclxuICAgIGNhc2UgXCJsXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWROb3RlTGVuZ3RoKCk7XHJcbiAgICBjYXNlIFwicVwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkTm90ZVF1YW50aXplKCk7XHJcbiAgICBjYXNlIFwidlwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkTm90ZVZlbG9jaXR5KCk7XHJcbiAgICBjYXNlIFwidFwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkVGVtcG8oKTtcclxuICAgIGNhc2UgXCIkXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRJbmZpbml0ZUxvb3AoKTtcclxuICAgIGNhc2UgXCIvXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRMb29wKCk7XHJcbiAgICBjYXNlIFwiQFwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkVG9uZSgpO1xyXG4gICAgY2FzZSBcIndcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZFdhdmVGb3JtKCk7XHJcbiAgICBjYXNlIFwic1wiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkRW52ZWxvcGUoKTtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIC8vIGRvIG5vdGhpbmdcclxuICAgIH1cclxuICAgIHRoaXMuc2Nhbm5lci50aHJvd1VuZXhwZWN0ZWRUb2tlbigpO1xyXG4gIH1cclxuXHJcbiAgcmVhZE5vdGUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguTm90ZSxcclxuICAgICAgbm90ZU51bWJlcnM6IFsgdGhpcy5fcmVhZE5vdGVOdW1iZXIoMCkgXSxcclxuICAgICAgbm90ZUxlbmd0aDogdGhpcy5fcmVhZExlbmd0aCgpLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWRDaG9yZCgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJbXCIpO1xyXG5cclxuICAgIGxldCBub3RlTGlzdCA9IFtdO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcblxyXG4gICAgdGhpcy5fcmVhZFVudGlsKFwiXVwiLCAoKSA9PiB7XHJcbiAgICAgIHN3aXRjaCAodGhpcy5zY2FubmVyLnBlZWsoKSkge1xyXG4gICAgICBjYXNlIFwiY1wiOlxyXG4gICAgICBjYXNlIFwiZFwiOlxyXG4gICAgICBjYXNlIFwiZVwiOlxyXG4gICAgICBjYXNlIFwiZlwiOlxyXG4gICAgICBjYXNlIFwiZ1wiOlxyXG4gICAgICBjYXNlIFwiYVwiOlxyXG4gICAgICBjYXNlIFwiYlwiOlxyXG4gICAgICAgIG5vdGVMaXN0LnB1c2godGhpcy5fcmVhZE5vdGVOdW1iZXIob2Zmc2V0KSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCI+XCI6XHJcbiAgICAgICAgdGhpcy5zY2FubmVyLm5leHQoKTtcclxuICAgICAgICBvZmZzZXQgKz0gMTI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCI8XCI6XHJcbiAgICAgICAgdGhpcy5zY2FubmVyLm5leHQoKTtcclxuICAgICAgICBvZmZzZXQgLT0gMTI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhpcy5zY2FubmVyLnRocm93VW5leHBlY3RlZFRva2VuKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJdXCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5Ob3RlLFxyXG4gICAgICBub3RlTnVtYmVyczogbm90ZUxpc3QsXHJcbiAgICAgIG5vdGVMZW5ndGg6IHRoaXMuX3JlYWRMZW5ndGgoKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkUmVzdCgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJyXCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5SZXN0LFxyXG4gICAgICBub3RlTGVuZ3RoOiB0aGlzLl9yZWFkTGVuZ3RoKCksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZE9jdGF2ZSgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJvXCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5PY3RhdmUsXHJcbiAgICAgIHZhbHVlOiB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkT2N0YXZlU2hpZnQoZGlyZWN0aW9uKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KC88fD4vKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguT2N0YXZlU2hpZnQsXHJcbiAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9ufDAsXHJcbiAgICAgIHZhbHVlOiB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkTm90ZUxlbmd0aCgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJsXCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5Ob3RlTGVuZ3RoLFxyXG4gICAgICBub3RlTGVuZ3RoOiB0aGlzLl9yZWFkTGVuZ3RoKCksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZE5vdGVRdWFudGl6ZSgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJxXCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5Ob3RlUXVhbnRpemUsXHJcbiAgICAgIHZhbHVlOiB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkTm90ZVZlbG9jaXR5KCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcInZcIik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4Lk5vdGVWZWxvY2l0eSxcclxuICAgICAgdmFsdWU6IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKy8pLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWRUZW1wbygpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJ0XCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5UZW1wbyxcclxuICAgICAgdmFsdWU6IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKyhcXC5cXGQrKT8vKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkSW5maW5pdGVMb29wKCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIiRcIik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4LkluZmluaXRlTG9vcCxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkTG9vcCgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCIvXCIpO1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIjpcIik7XHJcblxyXG4gICAgbGV0IHJlc3VsdCA9IFtdO1xyXG4gICAgbGV0IGxvb3BCZWdpbiA9IHsgdHlwZTogU3ludGF4Lkxvb3BCZWdpbiB9O1xyXG4gICAgbGV0IGxvb3BFbmQgPSB7IHR5cGU6IFN5bnRheC5Mb29wRW5kIH07XHJcblxyXG4gICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChsb29wQmVnaW4pO1xyXG4gICAgdGhpcy5fcmVhZFVudGlsKC9bfDpdLywgKCkgPT4ge1xyXG4gICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuYWR2YW5jZSgpKTtcclxuICAgIH0pO1xyXG4gICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLl9yZWFkTG9vcEV4aXQoKSk7XHJcblxyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIjpcIik7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiL1wiKTtcclxuXHJcbiAgICBsb29wQmVnaW4udmFsdWUgPSB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKSB8fCBudWxsO1xyXG5cclxuICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQobG9vcEVuZCk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcbiAgXHJcbiAgcmVhZFRvbmUoKXtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJAXCIpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4LlRvbmUsXHJcbiAgICAgIHZhbHVlOiB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgcmVhZFdhdmVGb3JtKCl7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwid1wiKTtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJcXFwiXCIpO1xyXG4gICAgbGV0IHdhdmVEYXRhID0gdGhpcy5zY2FubmVyLnNjYW4oL1swLTlhLWZBLUZdKz8vKTtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJcXFwiXCIpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4LldhdmVGb3JtLFxyXG4gICAgICB2YWx1ZTogd2F2ZURhdGFcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHJlYWRFbnZlbG9wZSgpe1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcInNcIik7XHJcbiAgICBsZXQgYSA9IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKyhcXC5cXGQrKT8vKTtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCIsXCIpO1xyXG4gICAgbGV0IGQgPSB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsoXFwuXFxkKyk/Lyk7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiLFwiKTtcclxuICAgIGxldCBzID0gdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrKFxcLlxcZCspPy8pO1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIixcIik7XHJcbiAgICBsZXQgciA9IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKyhcXC5cXGQrKT8vKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6U3ludGF4LkVudmVsb3BlLFxyXG4gICAgICBhOmEsZDpkLHM6cyxyOnJcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9yZWFkVW50aWwobWF0Y2hlciwgY2FsbGJhY2spIHtcclxuICAgIHdoaWxlICh0aGlzLnNjYW5uZXIuaGFzTmV4dCgpKSB7XHJcbiAgICAgIHRoaXMuc2Nhbm5lci5mb3J3YXJkKCk7XHJcbiAgICAgIGlmICghdGhpcy5zY2FubmVyLmhhc05leHQoKSB8fCB0aGlzLnNjYW5uZXIubWF0Y2gobWF0Y2hlcikpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX3JlYWRBcmd1bWVudChtYXRjaGVyKSB7XHJcbiAgICBsZXQgbnVtID0gdGhpcy5zY2FubmVyLnNjYW4obWF0Y2hlcik7XHJcblxyXG4gICAgcmV0dXJuIG51bSAhPT0gbnVsbCA/ICtudW0gOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgX3JlYWROb3RlTnVtYmVyKG9mZnNldCkge1xyXG4gICAgbGV0IG5vdGVJbmRleCA9IE5PVEVfSU5ERVhFU1t0aGlzLnNjYW5uZXIubmV4dCgpXTtcclxuXHJcbiAgICByZXR1cm4gbm90ZUluZGV4ICsgdGhpcy5fcmVhZEFjY2lkZW50YWwoKSArIG9mZnNldDtcclxuICB9XHJcblxyXG4gIF9yZWFkQWNjaWRlbnRhbCgpIHtcclxuICAgIGlmICh0aGlzLnNjYW5uZXIubWF0Y2goXCIrXCIpKSB7XHJcbiAgICAgIHJldHVybiArMSAqIHRoaXMuc2Nhbm5lci5zY2FuKC9cXCsrLykubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2Nhbm5lci5tYXRjaChcIi1cIikpIHtcclxuICAgICAgcmV0dXJuIC0xICogdGhpcy5zY2FubmVyLnNjYW4oL1xcLSsvKS5sZW5ndGg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcblxyXG4gIF9yZWFkRG90KCkge1xyXG4gICAgbGV0IGxlbiA9ICh0aGlzLnNjYW5uZXIuc2NhbigvXFwuKy8pIHx8IFwiXCIpLmxlbmd0aDtcclxuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXkobGVuKTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIHJlc3VsdFtpXSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIF9yZWFkTGVuZ3RoKCkge1xyXG4gICAgbGV0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrLykpO1xyXG4gICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLl9yZWFkRG90KCkpO1xyXG5cclxuICAgIGxldCB0aWUgPSB0aGlzLl9yZWFkVGllKCk7XHJcblxyXG4gICAgaWYgKHRpZSkge1xyXG4gICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRpZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIF9yZWFkVGllKCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmZvcndhcmQoKTtcclxuXHJcbiAgICBpZiAodGhpcy5zY2FubmVyLm1hdGNoKFwiXlwiKSkge1xyXG4gICAgICB0aGlzLnNjYW5uZXIubmV4dCgpO1xyXG4gICAgICByZXR1cm4gdGhpcy5fcmVhZExlbmd0aCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgX3JlYWRMb29wRXhpdCgpIHtcclxuICAgIGxldCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICBpZiAodGhpcy5zY2FubmVyLm1hdGNoKFwifFwiKSkge1xyXG4gICAgICB0aGlzLnNjYW5uZXIubmV4dCgpO1xyXG5cclxuICAgICAgbGV0IGxvb3BFeGl0ID0geyB0eXBlOiBTeW50YXguTG9vcEV4aXQgfTtcclxuXHJcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQobG9vcEV4aXQpO1xyXG5cclxuICAgICAgdGhpcy5fcmVhZFVudGlsKFwiOlwiLCAoKSA9PiB7XHJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLmFkdmFuY2UoKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG59XHJcbiIsImV4cG9ydCBkZWZhdWx0IHtcclxuICB0ZW1wbzogMTIwLFxyXG4gIG9jdGF2ZTogNCxcclxuICBsZW5ndGg6IDQsXHJcbiAgdmVsb2NpdHk6IDEwMCxcclxuICBxdWFudGl6ZTogNzUsXHJcbiAgbG9vcENvdW50OiAyLFxyXG59O1xyXG4iLCIvKiFcclxuICogbHpiYXNlNjIgdjEuNC42IC0gTFo3NyhMWlNTKSBiYXNlZCBjb21wcmVzc2lvbiBhbGdvcml0aG0gaW4gYmFzZTYyIGZvciBKYXZhU2NyaXB0LlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNSBwb2x5Z29uIHBsYW5ldCA8cG9seWdvbi5wbGFuZXQuYXF1YUBnbWFpbC5jb20+XHJcbiAqIEBsaWNlbnNlIE1JVFxyXG4gKi9cclxuIWZ1bmN0aW9uKGEsYixjKXtcInVuZGVmaW5lZFwiIT10eXBlb2YgZXhwb3J0cz9cInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1jKCk6ZXhwb3J0c1thXT1jKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShjKTpiW2FdPWMoKX0oXCJsemJhc2U2MlwiLHRoaXMsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBhKGEpe3RoaXMuX2luaXQoYSl9ZnVuY3Rpb24gYihhKXt0aGlzLl9pbml0KGEpfWZ1bmN0aW9uIGMoKXt2YXIgYSxiLGMsZCxlPVwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixmPVwiXCIsZz1lLmxlbmd0aDtmb3IoYT0wO2c+YTthKyspZm9yKGM9ZS5jaGFyQXQoYSksYj1nLTE7Yj4xNSYmZi5sZW5ndGg8djtiLS0pZD1lLmNoYXJBdChiKSxmKz1cIiBcIitjK1wiIFwiK2Q7Zm9yKDtmLmxlbmd0aDx2OylmPVwiIFwiK2Y7cmV0dXJuIGY9Zi5zbGljZSgwLHYpfWZ1bmN0aW9uIGQoYSxiKXtyZXR1cm4gYS5sZW5ndGg9PT1iP2E6YS5zdWJhcnJheT9hLnN1YmFycmF5KDAsYik6KGEubGVuZ3RoPWIsYSl9ZnVuY3Rpb24gZShhLGIpe2lmKG51bGw9PWI/Yj1hLmxlbmd0aDphPWQoYSxiKSxsJiZtJiZvPmIpe2lmKHApcmV0dXJuIGouYXBwbHkobnVsbCxhKTtpZihudWxsPT09cCl0cnl7dmFyIGM9ai5hcHBseShudWxsLGEpO3JldHVybiBiPm8mJihwPSEwKSxjfWNhdGNoKGUpe3A9ITF9fXJldHVybiBmKGEpfWZ1bmN0aW9uIGYoYSl7Zm9yKHZhciBiLGM9XCJcIixkPWEubGVuZ3RoLGU9MDtkPmU7KXtpZihiPWEuc3ViYXJyYXk/YS5zdWJhcnJheShlLGUrbyk6YS5zbGljZShlLGUrbyksZSs9bywhcCl7aWYobnVsbD09PXApdHJ5e2MrPWouYXBwbHkobnVsbCxiKSxiLmxlbmd0aD5vJiYocD0hMCk7Y29udGludWV9Y2F0Y2goZil7cD0hMX1yZXR1cm4gZyhhKX1jKz1qLmFwcGx5KG51bGwsYil9cmV0dXJuIGN9ZnVuY3Rpb24gZyhhKXtmb3IodmFyIGI9XCJcIixjPWEubGVuZ3RoLGQ9MDtjPmQ7ZCsrKWIrPWooYVtkXSk7cmV0dXJuIGJ9ZnVuY3Rpb24gaChhLGIpe2lmKCFrKXJldHVybiBuZXcgQXJyYXkoYik7c3dpdGNoKGEpe2Nhc2UgODpyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYik7Y2FzZSAxNjpyZXR1cm4gbmV3IFVpbnQxNkFycmF5KGIpfX1mdW5jdGlvbiBpKGEpe2Zvcih2YXIgYj1bXSxjPWEmJmEubGVuZ3RoLGQ9MDtjPmQ7ZCsrKWJbZF09YS5jaGFyQ29kZUF0KGQpO3JldHVybiBifXZhciBqPVN0cmluZy5mcm9tQ2hhckNvZGUsaz1cInVuZGVmaW5lZFwiIT10eXBlb2YgVWludDhBcnJheSYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFVpbnQxNkFycmF5LGw9ITEsbT0hMTt0cnl7XCJhXCI9PT1qLmFwcGx5KG51bGwsWzk3XSkmJihsPSEwKX1jYXRjaChuKXt9aWYoayl0cnl7XCJhXCI9PT1qLmFwcGx5KG51bGwsbmV3IFVpbnQ4QXJyYXkoWzk3XSkpJiYobT0hMCl9Y2F0Y2gobil7fXZhciBvPTY1NTMzLHA9bnVsbCxxPSExOy0xIT09XCJhYmNcXHUzMDdiXFx1MzA1MlwiLmxhc3RJbmRleE9mKFwiXFx1MzA3YlxcdTMwNTJcIiwxKSYmKHE9ITApO3ZhciByPVwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODlcIixzPXIubGVuZ3RoLHQ9TWF0aC5tYXgocyw2MiktTWF0aC5taW4ocyw2MiksdT1zLTEsdj0xMDI0LHc9MzA0LHg9byx5PXgtcyx6PW8sQT16KzIqdixCPTExLEM9QiooQisxKSxEPTQwLEU9RCooRCsxKSxGPXMrMSxHPXQrMjAsSD1zKzUsST1zLXQtMTksSj1EKzcsSz1KKzEsTD1LKzEsTT1MKzUsTj1NKzU7YS5wcm90b3R5cGU9e19pbml0OmZ1bmN0aW9uKGEpe2E9YXx8e30sdGhpcy5fZGF0YT1udWxsLHRoaXMuX3RhYmxlPW51bGwsdGhpcy5fcmVzdWx0PW51bGwsdGhpcy5fb25EYXRhQ2FsbGJhY2s9YS5vbkRhdGEsdGhpcy5fb25FbmRDYWxsYmFjaz1hLm9uRW5kfSxfY3JlYXRlVGFibGU6ZnVuY3Rpb24oKXtmb3IodmFyIGE9aCg4LHMpLGI9MDtzPmI7YisrKWFbYl09ci5jaGFyQ29kZUF0KGIpO3JldHVybiBhfSxfb25EYXRhOmZ1bmN0aW9uKGEsYil7dmFyIGM9ZShhLGIpO3RoaXMuX29uRGF0YUNhbGxiYWNrP3RoaXMuX29uRGF0YUNhbGxiYWNrKGMpOnRoaXMuX3Jlc3VsdCs9Y30sX29uRW5kOmZ1bmN0aW9uKCl7dGhpcy5fb25FbmRDYWxsYmFjayYmdGhpcy5fb25FbmRDYWxsYmFjaygpLHRoaXMuX2RhdGE9dGhpcy5fdGFibGU9bnVsbH0sX3NlYXJjaDpmdW5jdGlvbigpe3ZhciBhPTIsYj10aGlzLl9kYXRhLGM9dGhpcy5fb2Zmc2V0LGQ9dTtpZih0aGlzLl9kYXRhTGVuLWM8ZCYmKGQ9dGhpcy5fZGF0YUxlbi1jKSxhPmQpcmV0dXJuITE7dmFyIGUsZixnLGgsaSxqLGs9Yy13LGw9Yi5zdWJzdHJpbmcoayxjK2QpLG09YythLTMtaztkb3tpZigyPT09YSl7aWYoZj1iLmNoYXJBdChjKStiLmNoYXJBdChjKzEpLGc9bC5pbmRleE9mKGYpLCF+Z3x8Zz5tKWJyZWFrfWVsc2UgMz09PWE/Zis9Yi5jaGFyQXQoYysyKTpmPWIuc3Vic3RyKGMsYSk7aWYocT8oaj1iLnN1YnN0cmluZyhrLGMrYS0xKSxoPWoubGFzdEluZGV4T2YoZikpOmg9bC5sYXN0SW5kZXhPZihmLG0pLCF+aClicmVhaztpPWgsZT1rK2g7ZG8gaWYoYi5jaGFyQ29kZUF0KGMrYSkhPT1iLmNoYXJDb2RlQXQoZSthKSlicmVhazt3aGlsZSgrK2E8ZCk7aWYoZz09PWgpe2ErKzticmVha319d2hpbGUoKythPGQpO3JldHVybiAyPT09YT8hMToodGhpcy5faW5kZXg9dy1pLHRoaXMuX2xlbmd0aD1hLTEsITApfSxjb21wcmVzczpmdW5jdGlvbihhKXtpZihudWxsPT1hfHwwPT09YS5sZW5ndGgpcmV0dXJuXCJcIjt2YXIgYj1cIlwiLGQ9dGhpcy5fY3JlYXRlVGFibGUoKSxlPWMoKSxmPWgoOCx4KSxnPTA7dGhpcy5fcmVzdWx0PVwiXCIsdGhpcy5fb2Zmc2V0PWUubGVuZ3RoLHRoaXMuX2RhdGE9ZSthLHRoaXMuX2RhdGFMZW49dGhpcy5fZGF0YS5sZW5ndGgsZT1hPW51bGw7Zm9yKHZhciBpLGosayxsLG0sbj0tMSxvPS0xO3RoaXMuX29mZnNldDx0aGlzLl9kYXRhTGVuOyl0aGlzLl9zZWFyY2goKT8odGhpcy5faW5kZXg8dT8oaj10aGlzLl9pbmRleCxrPTApOihqPXRoaXMuX2luZGV4JXUsaz0odGhpcy5faW5kZXgtaikvdSksMj09PXRoaXMuX2xlbmd0aD8oZltnKytdPWRbaytNXSxmW2crK109ZFtqXSk6KGZbZysrXT1kW2srTF0sZltnKytdPWRbal0sZltnKytdPWRbdGhpcy5fbGVuZ3RoXSksdGhpcy5fb2Zmc2V0Kz10aGlzLl9sZW5ndGgsfm8mJihvPS0xKSk6KGk9dGhpcy5fZGF0YS5jaGFyQ29kZUF0KHRoaXMuX29mZnNldCsrKSxDPmk/KEQ+aT8oaj1pLGs9MCxuPUYpOihqPWklRCxrPShpLWopL0Qsbj1rK0YpLG89PT1uP2ZbZysrXT1kW2pdOihmW2crK109ZFtuLUddLGZbZysrXT1kW2pdLG89bikpOihFPmk/KGo9aSxrPTAsbj1IKTooaj1pJUUsaz0oaS1qKS9FLG49aytIKSxEPmo/KGw9aixtPTApOihsPWolRCxtPShqLWwpL0QpLG89PT1uPyhmW2crK109ZFtsXSxmW2crK109ZFttXSk6KGZbZysrXT1kW0tdLGZbZysrXT1kW24tc10sZltnKytdPWRbbF0sZltnKytdPWRbbV0sbz1uKSkpLGc+PXkmJih0aGlzLl9vbkRhdGEoZixnKSxnPTApO3JldHVybiBnPjAmJnRoaXMuX29uRGF0YShmLGcpLHRoaXMuX29uRW5kKCksYj10aGlzLl9yZXN1bHQsdGhpcy5fcmVzdWx0PW51bGwsbnVsbD09PWI/XCJcIjpifX0sYi5wcm90b3R5cGU9e19pbml0OmZ1bmN0aW9uKGEpe2E9YXx8e30sdGhpcy5fcmVzdWx0PW51bGwsdGhpcy5fb25EYXRhQ2FsbGJhY2s9YS5vbkRhdGEsdGhpcy5fb25FbmRDYWxsYmFjaz1hLm9uRW5kfSxfY3JlYXRlVGFibGU6ZnVuY3Rpb24oKXtmb3IodmFyIGE9e30sYj0wO3M+YjtiKyspYVtyLmNoYXJBdChiKV09YjtyZXR1cm4gYX0sX29uRGF0YTpmdW5jdGlvbihhKXt2YXIgYjtpZih0aGlzLl9vbkRhdGFDYWxsYmFjayl7aWYoYSliPXRoaXMuX3Jlc3VsdCx0aGlzLl9yZXN1bHQ9W107ZWxzZXt2YXIgYz16LXY7Yj10aGlzLl9yZXN1bHQuc2xpY2Uodix2K2MpLHRoaXMuX3Jlc3VsdD10aGlzLl9yZXN1bHQuc2xpY2UoMCx2KS5jb25jYXQodGhpcy5fcmVzdWx0LnNsaWNlKHYrYykpfWIubGVuZ3RoPjAmJnRoaXMuX29uRGF0YUNhbGxiYWNrKGUoYikpfX0sX29uRW5kOmZ1bmN0aW9uKCl7dGhpcy5fb25FbmRDYWxsYmFjayYmdGhpcy5fb25FbmRDYWxsYmFjaygpfSxkZWNvbXByZXNzOmZ1bmN0aW9uKGEpe2lmKG51bGw9PWF8fDA9PT1hLmxlbmd0aClyZXR1cm5cIlwiO3RoaXMuX3Jlc3VsdD1pKGMoKSk7Zm9yKHZhciBiLGQsZixnLGgsaixrLGwsbSxuLG89XCJcIixwPXRoaXMuX2NyZWF0ZVRhYmxlKCkscT0hMSxyPW51bGwscz1hLmxlbmd0aCx0PTA7cz50O3QrKylpZihkPXBbYS5jaGFyQXQodCldLHZvaWQgMCE9PWQpe2lmKEk+ZClxPyhnPXBbYS5jaGFyQXQoKyt0KV0saD1nKkQrZCtFKnIpOmg9cipEK2QsdGhpcy5fcmVzdWx0W3RoaXMuX3Jlc3VsdC5sZW5ndGhdPWg7ZWxzZSBpZihKPmQpcj1kLUkscT0hMTtlbHNlIGlmKGQ9PT1LKWY9cFthLmNoYXJBdCgrK3QpXSxyPWYtNSxxPSEwO2Vsc2UgaWYoTj5kKXtpZihmPXBbYS5jaGFyQXQoKyt0KV0sTT5kPyhqPShkLUwpKnUrZixrPXBbYS5jaGFyQXQoKyt0KV0pOihqPShkLU0pKnUrZixrPTIpLGw9dGhpcy5fcmVzdWx0LnNsaWNlKC1qKSxsLmxlbmd0aD5rJiYobC5sZW5ndGg9ayksbT1sLmxlbmd0aCxsLmxlbmd0aD4wKWZvcihuPTA7az5uOylmb3IoYj0wO20+YiYmKHRoaXMuX3Jlc3VsdFt0aGlzLl9yZXN1bHQubGVuZ3RoXT1sW2JdLCEoKytuPj1rKSk7YisrKTtyPW51bGx9dGhpcy5fcmVzdWx0Lmxlbmd0aD49QSYmdGhpcy5fb25EYXRhKCl9cmV0dXJuIHRoaXMuX3Jlc3VsdD10aGlzLl9yZXN1bHQuc2xpY2UodiksdGhpcy5fb25EYXRhKCEwKSx0aGlzLl9vbkVuZCgpLG89ZSh0aGlzLl9yZXN1bHQpLHRoaXMuX3Jlc3VsdD1udWxsLG99fTt2YXIgTz17Y29tcHJlc3M6ZnVuY3Rpb24oYixjKXtyZXR1cm4gbmV3IGEoYykuY29tcHJlc3MoYil9LGRlY29tcHJlc3M6ZnVuY3Rpb24oYSxjKXtyZXR1cm4gbmV3IGIoYykuZGVjb21wcmVzcyhhKX19O3JldHVybiBPfSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vLy8gV2ViIEF1ZGlvIEFQSSDjg6njg4Pjg5Hjg7zjgq/jg6njgrkgLy8vL1xyXG5cclxuLy8gTU1MUGFyc2Vy44GvbW9oYXlvbmFv44GV44KT44Gu44KC44GuXHJcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tb2hheW9uYW8vbW1sLWl0ZXJhdG9yXHJcblxyXG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL1N5bnRheC5qc1wiO1xyXG5pbXBvcnQgU2Nhbm5lciBmcm9tIFwiLi9TY2FubmVyLmpzXCI7XHJcbmltcG9ydCBNTUxQYXJzZXIgZnJvbSBcIi4vTU1MUGFyc2VyLmpzXCI7XHJcbmltcG9ydCBEZWZhdWx0UGFyYW1zIGZyb20gXCIuL0RlZmF1bHRQYXJhbXMuanNcIjtcclxuaW1wb3J0IGx6YmFzZTYyIGZyb20gXCIuL2x6YmFzZTYyLm1pbi5qc1wiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwuanMnO1xyXG5cclxuLy8gdmFyIGZmdCA9IG5ldyBGRlQoNDA5NiwgNDQxMDApO1xyXG5jb25zdCBCVUZGRVJfU0laRSA9IDEwMjQ7XHJcbmNvbnN0IFRJTUVfQkFTRSA9IDk2O1xyXG5cclxuLy8gTUlESeODjuODvOODiCA9PiDlho3nlJ/jg6zjg7zjg4jlpInmj5vjg4bjg7zjg5bjg6tcclxudmFyIG5vdGVGcmVxID0gW107XHJcbmZvciAodmFyIGkgPSAtNjk7IGkgPCA1ODsgKytpKSB7XHJcbiAgbm90ZUZyZXEucHVzaChNYXRoLnBvdygyLCBpIC8gMTIpKTtcclxufVxyXG5cclxuLy8gTUlESeODjuODvOODiOWRqOazouaVsCDlpInmj5vjg4bjg7zjg5bjg6tcclxudmFyIG1pZGlGcmVxID0gW107XHJcbmZvciAobGV0IGkgPSAwOyBpIDwgMTI3OyArK2kpIHtcclxuICBtaWRpRnJlcS5wdXNoKG1pZGljcHMoaSkpO1xyXG59XHJcbmZ1bmN0aW9uIG1pZGljcHMobm90ZU51bWJlcikge1xyXG4gIHJldHVybiA0NDAgKiBNYXRoLnBvdygyLCAobm90ZU51bWJlciAtIDY5KSAqIDEgLyAxMik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVTdHIoYml0cywgd2F2ZXN0cikge1xyXG4gIHZhciBhcnIgPSBbXTtcclxuICB2YXIgbiA9IGJpdHMgLyA0IHwgMDtcclxuICB2YXIgYyA9IDA7XHJcbiAgdmFyIHplcm9wb3MgPSAxIDw8IChiaXRzIC0gMSk7XHJcbiAgd2hpbGUgKGMgPCB3YXZlc3RyLmxlbmd0aCkge1xyXG4gICAgdmFyIGQgPSAwO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpIHtcclxuICAgICAgZCA9IChkIDw8IDQpICsgcGFyc2VJbnQod2F2ZXN0ci5jaGFyQXQoYysrKSwgJzE2Jyk7XHJcbiAgICB9XHJcbiAgICBhcnIucHVzaCgoZCAtIHplcm9wb3MpIC8gemVyb3Bvcyk7XHJcbiAgfVxyXG4gIHJldHVybiBhcnI7XHJcbn1cclxuXHJcbnZhciB3YXZlcyA9IFtcclxuICBkZWNvZGVTdHIoNCwgJ0VFRUVFRUVFRUVFRUVFRUUwMDAwMDAwMDAwMDAwMDAwJyksXHJcbiAgZGVjb2RlU3RyKDQsICcwMDExMjIzMzQ0NTU2Njc3ODg5OUFBQkJDQ0RERUVGRicpLFxyXG4gIGRlY29kZVN0cig0LCAnMDIzNDY2NDU5QUE4QTdBOTc3OTY1NjU2QUNBQUNERUYnKSxcclxuICBkZWNvZGVTdHIoNCwgJ0JEQ0RDQTk5OUFDRENEQjk0MjEyMzY3Nzc2MzIxMjQ3JyksXHJcbiAgZGVjb2RlU3RyKDQsICc3QUNERURDQTc0MjEwMTI0N0JERURCNzMyMDEzN0U3OCcpLFxyXG4gIGRlY29kZVN0cig0LCAnQUNDQTc3OUJERURBNjY2Nzk5OTQxMDEyNjc3NDIyNDcnKSxcclxuICBkZWNvZGVTdHIoNCwgJzdFQzlDRUE3Q0ZEOEFCNzI4RDk0NTcyMDM4NTEzNTMxJyksXHJcbiAgZGVjb2RlU3RyKDQsICdFRTc3RUU3N0VFNzdFRTc3MDA3NzAwNzcwMDc3MDA3NycpLFxyXG4gIGRlY29kZVN0cig0LCAnRUVFRTg4ODg4ODg4ODg4ODAwMDA4ODg4ODg4ODg4ODgnKS8v44OO44Kk44K655So44Gu44OA44Of44O85rOi5b2iXHJcbl07XHJcblxyXG5cclxuXHJcbnZhciB3YXZlU2FtcGxlcyA9IFtdO1xyXG5leHBvcnQgZnVuY3Rpb24gV2F2ZVNhbXBsZShhdWRpb2N0eCwgY2gsIHNhbXBsZUxlbmd0aCwgc2FtcGxlUmF0ZSkge1xyXG5cclxuICB0aGlzLnNhbXBsZSA9IGF1ZGlvY3R4LmNyZWF0ZUJ1ZmZlcihjaCwgc2FtcGxlTGVuZ3RoLCBzYW1wbGVSYXRlIHx8IGF1ZGlvY3R4LnNhbXBsZVJhdGUpO1xyXG4gIHRoaXMubG9vcCA9IGZhbHNlO1xyXG4gIHRoaXMuc3RhcnQgPSAwO1xyXG4gIHRoaXMuZW5kID0gKHNhbXBsZUxlbmd0aCAtIDEpIC8gKHNhbXBsZVJhdGUgfHwgYXVkaW9jdHguc2FtcGxlUmF0ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXYXZlU2FtcGxlRnJvbVdhdmVzKGF1ZGlvY3R4LCBzYW1wbGVMZW5ndGgpIHtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gd2F2ZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZhciBzYW1wbGUgPSBuZXcgV2F2ZVNhbXBsZShhdWRpb2N0eCwgMSwgc2FtcGxlTGVuZ3RoKTtcclxuICAgIHdhdmVTYW1wbGVzLnB1c2goc2FtcGxlKTtcclxuICAgIGlmIChpICE9IDgpIHtcclxuICAgICAgdmFyIHdhdmVkYXRhID0gd2F2ZXNbaV07XHJcbiAgICAgIHZhciBkZWx0YSA9IDQ0MC4wICogd2F2ZWRhdGEubGVuZ3RoIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgdmFyIHN0aW1lID0gMDtcclxuICAgICAgdmFyIG91dHB1dCA9IHNhbXBsZS5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgIHZhciBsZW4gPSB3YXZlZGF0YS5sZW5ndGg7XHJcbiAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgIHZhciBlbmRzYW1wbGUgPSAwO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNhbXBsZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgaW5kZXggPSBzdGltZSB8IDA7XHJcbiAgICAgICAgb3V0cHV0W2pdID0gd2F2ZWRhdGFbaW5kZXhdO1xyXG4gICAgICAgIHN0aW1lICs9IGRlbHRhO1xyXG4gICAgICAgIGlmIChzdGltZSA+PSBsZW4pIHtcclxuICAgICAgICAgIHN0aW1lID0gc3RpbWUgLSBsZW47XHJcbiAgICAgICAgICBlbmRzYW1wbGUgPSBqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzYW1wbGUuZW5kID0gZW5kc2FtcGxlIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgc2FtcGxlLmxvb3AgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g44Oc44Kk44K5OOOBr+ODjuOCpOOCuuazouW9ouOBqOOBmeOCi1xyXG4gICAgICB2YXIgb3V0cHV0ID0gc2FtcGxlLnNhbXBsZS5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzYW1wbGVMZW5ndGg7ICsraikge1xyXG4gICAgICAgIG91dHB1dFtqXSA9IE1hdGgucmFuZG9tKCkgKiAyLjAgLSAxLjA7XHJcbiAgICAgIH1cclxuICAgICAgc2FtcGxlLmVuZCA9IHNhbXBsZUxlbmd0aCAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHNhbXBsZS5sb29wID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIOWPguiAg++8mmh0dHA6Ly93d3cuZzIwMGtnLmNvbS9hcmNoaXZlcy8yMDE0LzEyL3dlYmF1ZGlvYXBpcGVyaS5odG1sXHJcbmZ1bmN0aW9uIGZvdXJpZXIod2F2ZWZvcm0sIGxlbikge1xyXG4gIHZhciByZWFsID0gbmV3IEZsb2F0MzJBcnJheShsZW4pLCBpbWFnID0gbmV3IEZsb2F0MzJBcnJheShsZW4pO1xyXG4gIHZhciB3YXZsZW4gPSB3YXZlZm9ybS5sZW5ndGg7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBsZW47ICsraikge1xyXG4gICAgICB2YXIgd2F2aiA9IGogLyBsZW4gKiB3YXZsZW47XHJcbiAgICAgIHZhciBkID0gd2F2ZWZvcm1bd2F2aiB8IDBdO1xyXG4gICAgICB2YXIgdGggPSBpICogaiAvIGxlbiAqIDIgKiBNYXRoLlBJO1xyXG4gICAgICByZWFsW2ldICs9IE1hdGguY29zKHRoKSAqIGQ7XHJcbiAgICAgIGltYWdbaV0gKz0gTWF0aC5zaW4odGgpICogZDtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIFtyZWFsLCBpbWFnXTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGVyaW9kaWNXYXZlRnJvbVdhdmVzKGF1ZGlvY3R4KSB7XHJcbiAgcmV0dXJuIHdhdmVzLm1hcCgoZCwgaSkgPT4ge1xyXG4gICAgaWYgKGkgIT0gOCkge1xyXG4gICAgICBsZXQgd2F2ZURhdGEgPSB3YXZlc1tpXTtcclxuICAgICAgbGV0IGZyZXFEYXRhID0gZm91cmllcih3YXZlRGF0YSwgd2F2ZURhdGEubGVuZ3RoKTtcclxuICAgICAgcmV0dXJuIGF1ZGlvY3R4LmNyZWF0ZVBlcmlvZGljV2F2ZShmcmVxRGF0YVswXSwgZnJlcURhdGFbMV0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IHdhdmVEYXRhID0gW107XHJcbiAgICAgIGZvciAobGV0IGogPSAwLCBlID0gd2F2ZXNbaV0ubGVuZ3RoOyBqIDwgZTsgKytqKSB7XHJcbiAgICAgICAgd2F2ZURhdGEucHVzaChNYXRoLnJhbmRvbSgpICogMi4wIC0gMS4wKTtcclxuICAgICAgfVxyXG4gICAgICBsZXQgZnJlcURhdGEgPSBmb3VyaWVyKHdhdmVEYXRhLCB3YXZlRGF0YS5sZW5ndGgpO1xyXG4gICAgICByZXR1cm4gYXVkaW9jdHguY3JlYXRlUGVyaW9kaWNXYXZlKGZyZXFEYXRhWzBdLCBmcmVxRGF0YVsxXSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIOODieODqeODoOOCteODs+ODl+ODq1xyXG5cclxuY29uc3QgZHJ1bVNhbXBsZXMgPSBbXHJcbiAgeyBuYW1lOiAnYmFzczEnLCBwYXRoOiAnYmFzZS9hdWRpby9iZDFfbHouanNvbicgfSwgLy8gQDlcclxuICB7IG5hbWU6ICdiYXNzMicsIHBhdGg6ICdiYXNlL2F1ZGlvL2JkMl9sei5qc29uJyB9LCAvLyBAMTBcclxuICB7IG5hbWU6ICdjbG9zZWQnLCBwYXRoOiAnYmFzZS9hdWRpby9jbG9zZWRfbHouanNvbicgfSwgLy8gQDExXHJcbiAgeyBuYW1lOiAnY293YmVsbCcsIHBhdGg6ICdiYXNlL2F1ZGlvL2Nvd2JlbGxfbHouanNvbicgfSwvLyBAMTJcclxuICB7IG5hbWU6ICdjcmFzaCcsIHBhdGg6ICdiYXNlL2F1ZGlvL2NyYXNoX2x6Lmpzb24nIH0sLy8gQDEzXHJcbiAgeyBuYW1lOiAnaGFuZGNsYXAnLCBwYXRoOiAnYmFzZS9hdWRpby9oYW5kY2xhcF9sei5qc29uJyB9LCAvLyBAMTRcclxuICB7IG5hbWU6ICdoaXRvbScsIHBhdGg6ICdiYXNlL2F1ZGlvL2hpdG9tX2x6Lmpzb24nIH0sLy8gQDE1XHJcbiAgeyBuYW1lOiAnbG93dG9tJywgcGF0aDogJ2Jhc2UvYXVkaW8vbG93dG9tX2x6Lmpzb24nIH0sLy8gQDE2XHJcbiAgeyBuYW1lOiAnbWlkdG9tJywgcGF0aDogJ2Jhc2UvYXVkaW8vbWlkdG9tX2x6Lmpzb24nIH0sLy8gQDE3XHJcbiAgeyBuYW1lOiAnb3BlbicsIHBhdGg6ICdiYXNlL2F1ZGlvL29wZW5fbHouanNvbicgfSwvLyBAMThcclxuICB7IG5hbWU6ICdyaWRlJywgcGF0aDogJ2Jhc2UvYXVkaW8vcmlkZV9sei5qc29uJyB9LC8vIEAxOVxyXG4gIHsgbmFtZTogJ3JpbXNob3QnLCBwYXRoOiAnYmFzZS9hdWRpby9yaW1zaG90X2x6Lmpzb24nIH0sLy8gQDIwXHJcbiAgeyBuYW1lOiAnc2QxJywgcGF0aDogJ2Jhc2UvYXVkaW8vc2QxX2x6Lmpzb24nIH0sLy8gQDIxXHJcbiAgeyBuYW1lOiAnc2QyJywgcGF0aDogJ2Jhc2UvYXVkaW8vc2QyX2x6Lmpzb24nIH0sLy8gQDIyXHJcbiAgeyBuYW1lOiAndGFtYicsIHBhdGg6ICdiYXNlL2F1ZGlvL3RhbWJfbHouanNvbicgfSwvLyBAMjNcclxuICB7IG5hbWU6J3ZvaWNlJyxwYXRoOiAnYmFzZS9hdWRpby9tb3ZpZV9sei5qc29uJ30vLyBAMjRcclxuXTtcclxuXHJcbmxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuZnVuY3Rpb24ganNvbih1cmwpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgeGhyLm9wZW4oXCJnZXRcIiwgdXJsLCB0cnVlKTtcclxuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmICh4aHIuc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZSh0aGlzLnJlc3BvbnNlVGV4dCkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1hNTEh0dHBSZXF1ZXN0IEVycm9yOicgKyB4aHIuc3RhdHVzKSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB4aHIub25lcnJvciA9IGVyciA9PiB7IHJlamVjdChlcnIpOyB9O1xyXG4gICAgeGhyLnNlbmQobnVsbCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWREcnVtU2FtcGxlKGF1ZGlvY3R4KSB7XHJcbiAgbGV0IHByID0gUHJvbWlzZS5yZXNvbHZlKDApO1xyXG4gIGRydW1TYW1wbGVzLmZvckVhY2goKGQpID0+IHtcclxuICAgIHByID1cclxuICAgICAgcHIudGhlbihqc29uLmJpbmQobnVsbCxzZmcucmVzb3VyY2VCYXNlICsgZC5wYXRoKSlcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIGxldCBzYW1wbGVTdHIgPSBsemJhc2U2Mi5kZWNvbXByZXNzKGRhdGEuc2FtcGxlcyk7XHJcbiAgICAgICAgICBsZXQgc2FtcGxlcyA9IGRlY29kZVN0cig0LCBzYW1wbGVTdHIpO1xyXG4gICAgICAgICAgbGV0IHdzID0gbmV3IFdhdmVTYW1wbGUoYXVkaW9jdHgsIDEsIHNhbXBsZXMubGVuZ3RoLCBkYXRhLnNhbXBsZVJhdGUpO1xyXG4gICAgICAgICAgbGV0IHNiID0gd3Muc2FtcGxlLmdldENoYW5uZWxEYXRhKDApO1xyXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGUgPSBzYi5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgICAgICAgICAgc2JbaV0gPSBzYW1wbGVzW2ldO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgd2F2ZVNhbXBsZXMucHVzaCh3cyk7XHJcbiAgICAgICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBwcjtcclxufVxyXG5cclxuLy8gZXhwb3J0IGNsYXNzIFdhdmVUZXh0dXJlIHsgXHJcbi8vICAgY29uc3RydWN0b3Iod2F2ZSkge1xyXG4vLyAgICAgdGhpcy53YXZlID0gd2F2ZSB8fCB3YXZlc1swXTtcclxuLy8gICAgIHRoaXMudGV4ID0gbmV3IENhbnZhc1RleHR1cmUoMzIwLCAxMCAqIDE2KTtcclxuLy8gICAgIHRoaXMucmVuZGVyKCk7XHJcbi8vICAgfVxyXG5cclxuLy8gICByZW5kZXIoKSB7XHJcbi8vICAgICB2YXIgY3R4ID0gdGhpcy50ZXguY3R4O1xyXG4vLyAgICAgdmFyIHdhdmUgPSB0aGlzLndhdmU7XHJcbi8vICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcclxuLy8gICAgIGN0eC5iZWdpblBhdGgoKTtcclxuLy8gICAgIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSc7XHJcbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyMDsgaSArPSAxMCkge1xyXG4vLyAgICAgICBjdHgubW92ZVRvKGksIDApO1xyXG4vLyAgICAgICBjdHgubGluZVRvKGksIDI1NSk7XHJcbi8vICAgICB9XHJcbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2MDsgaSArPSAxMCkge1xyXG4vLyAgICAgICBjdHgubW92ZVRvKDAsIGkpO1xyXG4vLyAgICAgICBjdHgubGluZVRvKDMyMCwgaSk7XHJcbi8vICAgICB9XHJcbi8vICAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC43KSc7XHJcbi8vICAgICBjdHgucmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XHJcbi8vICAgICBjdHguc3Ryb2tlKCk7XHJcbi8vICAgICBmb3IgKHZhciBpID0gMCwgYyA9IDA7IGkgPCBjdHguY2FudmFzLndpZHRoOyBpICs9IDEwLCArK2MpIHtcclxuLy8gICAgICAgY3R4LmZpbGxSZWN0KGksICh3YXZlW2NdID4gMCkgPyA4MCAtIHdhdmVbY10gKiA4MCA6IDgwLCAxMCwgTWF0aC5hYnMod2F2ZVtjXSkgKiA4MCk7XHJcbi8vICAgICB9XHJcbi8vICAgICB0aGlzLnRleC50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuLy8gICB9XHJcbi8vIH07XHJcblxyXG4vLy8g44Ko44Oz44OZ44Ot44O844OX44K444Kn44ON44Os44O844K/44O8XHJcbmV4cG9ydCBjbGFzcyBFbnZlbG9wZUdlbmVyYXRvciB7XHJcbiAgY29uc3RydWN0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuICAgIHRoaXMudm9pY2UgPSB2b2ljZTtcclxuICAgIC8vdGhpcy5rZXlvbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5hdHRhY2tUaW1lID0gYXR0YWNrIHx8IDAuMDAwNTtcclxuICAgIHRoaXMuZGVjYXlUaW1lID0gZGVjYXkgfHwgMC4wNTtcclxuICAgIHRoaXMuc3VzdGFpbkxldmVsID0gc3VzdGFpbiB8fCAwLjU7XHJcbiAgICB0aGlzLnJlbGVhc2VUaW1lID0gcmVsZWFzZSB8fCAwLjU7XHJcbiAgICB0aGlzLnYgPSAxLjA7XHJcbiAgICB0aGlzLmtleU9uVGltZSA9IDA7XHJcbiAgICB0aGlzLmtleU9mZlRpbWUgPSAwO1xyXG4gICAgdGhpcy5rZXlPbiA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAga2V5b24odCwgdmVsKSB7XHJcbiAgICB0aGlzLnYgPSB2ZWwgfHwgMS4wO1xyXG4gICAgdmFyIHYgPSB0aGlzLnY7XHJcbiAgICB2YXIgdDAgPSB0IHx8IHRoaXMudm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICB2YXIgdDEgPSB0MCArIHRoaXMuYXR0YWNrVGltZTtcclxuICAgIHZhciBnYWluID0gdGhpcy52b2ljZS5nYWluLmdhaW47XHJcbiAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbiAgICBnYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwKTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodiwgdDEpO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLnN1c3RhaW5MZXZlbCAqIHYsIHQxICsgdGhpcy5kZWNheVRpbWUpO1xyXG4gICAgLy9nYWluLnNldFRhcmdldEF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MSwgdDEgKyB0aGlzLmRlY2F5IC8gdik7XHJcbiAgICB0aGlzLmtleU9uVGltZSA9IHQwO1xyXG4gICAgdGhpcy5rZXlPZmZUaW1lID0gMDtcclxuICAgIHRoaXMua2V5T24gPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAga2V5b2ZmKHQpIHtcclxuICAgIHZhciB2b2ljZSA9IHRoaXMudm9pY2U7XHJcbiAgICB2YXIgZ2FpbiA9IHZvaWNlLmdhaW4uZ2FpbjtcclxuICAgIHZhciB0MCA9IHQgfHwgdm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICAvLyAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aGlzLmtleU9uVGltZSk7XHJcbiAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbiAgICBsZXQgcmVsZWFzZV90aW1lID0gdDAgKyB0aGlzLnJlbGVhc2VUaW1lO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCByZWxlYXNlX3RpbWUpO1xyXG4gICAgdGhpcy5rZXlPZmZUaW1lID0gdDA7XHJcbiAgICB0aGlzLmtleU9uVGltZSA9IDA7XHJcbiAgICB0aGlzLmtleU9uID0gZmFsc2U7XHJcbiAgICByZXR1cm4gcmVsZWFzZV90aW1lO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyBWb2ljZSB7XHJcbiAgY29uc3RydWN0b3IoYXVkaW9jdHgpIHtcclxuICAgIHRoaXMuYXVkaW9jdHggPSBhdWRpb2N0eDtcclxuICAgIHRoaXMuc2FtcGxlID0gd2F2ZVNhbXBsZXNbNl07XHJcbiAgICB0aGlzLnZvbHVtZSA9IGF1ZGlvY3R4LmNyZWF0ZUdhaW4oKTtcclxuICAgIHRoaXMuZW52ZWxvcGUgPSBuZXcgRW52ZWxvcGVHZW5lcmF0b3IodGhpcyxcclxuICAgICAgMC41LFxyXG4gICAgICAwLjI1LFxyXG4gICAgICAwLjgsXHJcbiAgICAgIDIuNVxyXG4gICAgKTtcclxuICAgIHRoaXMuaW5pdFByb2Nlc3NvcigpO1xyXG4gICAgdGhpcy5kZXR1bmUgPSAxLjA7XHJcbiAgICB0aGlzLnZvbHVtZS5nYWluLnZhbHVlID0gMS4wO1xyXG4gICAgdGhpcy5vdXRwdXQgPSB0aGlzLnZvbHVtZTtcclxuICB9XHJcblxyXG4gIGluaXRQcm9jZXNzb3IoKSB7XHJcbiAgICAvLyBpZih0aGlzLnByb2Nlc3Nvcil7XHJcbiAgICAvLyAgIHRoaXMuc3RvcCgpO1xyXG4gICAgLy8gICB0aGlzLnByb2Nlc3Nvci5kaXNjb25uZWN0KCk7XHJcbiAgICAvLyAgIHRoaXMucHJvY2Vzc29yID0gbnVsbDtcclxuICAgIC8vIH1cclxuICAgIGxldCBwcm9jZXNzb3IgPSB0aGlzLnByb2Nlc3NvciA9IHRoaXMuYXVkaW9jdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XHJcbiAgICBsZXQgZ2FpbiA9IHRoaXMuZ2FpbiA9IHRoaXMuYXVkaW9jdHguY3JlYXRlR2FpbigpO1xyXG4gICAgZ2Fpbi5nYWluLnZhbHVlID0gMC4wO1xyXG5cclxuICAgIHRoaXMucHJvY2Vzc29yLmJ1ZmZlciA9IHRoaXMuc2FtcGxlLnNhbXBsZTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3AgPSB0aGlzLnNhbXBsZS5sb29wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcFN0YXJ0ID0gMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IDEuMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3BFbmQgPSB0aGlzLnNhbXBsZS5lbmQ7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5jb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5vbmVuZGVkID0gKCkgPT4ge1xyXG4gICAgICBwcm9jZXNzb3IuZGlzY29ubmVjdCgpO1xyXG4gICAgICBnYWluLmRpc2Nvbm5lY3QoKTtcclxuICAgIH07XHJcbiAgICBnYWluLmNvbm5lY3QodGhpcy52b2x1bWUpO1xyXG4gIH1cclxuXHJcbiAgLy8gc2V0U2FtcGxlIChzYW1wbGUpIHtcclxuICAvLyAgICAgdGhpcy5lbnZlbG9wZS5rZXlvZmYoMCk7XHJcbiAgLy8gICAgIHRoaXMucHJvY2Vzc29yLmRpc2Nvbm5lY3QodGhpcy5nYWluKTtcclxuICAvLyAgICAgdGhpcy5zYW1wbGUgPSBzYW1wbGU7XHJcbiAgLy8gICAgIHRoaXMuaW5pdFByb2Nlc3NvcigpO1xyXG4gIC8vICAgICB0aGlzLnByb2Nlc3Nvci5zdGFydCgpO1xyXG4gIC8vIH1cclxuXHJcbiAgc3RhcnQoc3RhcnRUaW1lKSB7XHJcbiAgICAvLyAgIHRoaXMucHJvY2Vzc29yLmRpc2Nvbm5lY3QodGhpcy5nYWluKTtcclxuICAgIHRoaXMuaW5pdFByb2Nlc3NvcigpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoc3RhcnRUaW1lKTtcclxuICB9XHJcblxyXG4gIHN0b3AodGltZSkge1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RvcCh0aW1lKTtcclxuICAgIC8vdGhpcy5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAga2V5b24odCwgbm90ZSwgdmVsKSB7XHJcbiAgICB0aGlzLnN0YXJ0KHQpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLnNldFZhbHVlQXRUaW1lKG5vdGVGcmVxW25vdGVdICogdGhpcy5kZXR1bmUsIHQpO1xyXG4gICAgdGhpcy5rZXlPblRpbWUgPSB0O1xyXG4gICAgdGhpcy5lbnZlbG9wZS5rZXlvbih0LCB2ZWwpO1xyXG4gIH1cclxuXHJcbiAga2V5b2ZmKHQpIHtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0Lyp0aGlzLmtleU9uVGltZSovKTtcclxuICAgIHRoaXMua2V5T2ZmVGltZSA9IHRoaXMuZW52ZWxvcGUua2V5b2ZmKHQpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RvcCh0aGlzLmtleU9mZlRpbWUpO1xyXG4gIH1cclxuXHJcbiAgaXNLZXlPbih0KSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnZlbG9wZS5rZXlPbiAmJiAodGhpcy5rZXlPblRpbWUgPD0gdCk7XHJcbiAgfVxyXG5cclxuICBpc0tleU9mZih0KSB7XHJcbiAgICByZXR1cm4gIXRoaXMuZW52ZWxvcGUua2V5T24gJiYgKHRoaXMua2V5T2ZmVGltZSA8PSB0KTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg5zjgqTjgrlcclxuZXhwb3J0IGNsYXNzIE9zY1ZvaWNlIHtcclxuICBjb25zdHJ1Y3RvcihhdWRpb2N0eCwgcGVyaW9kaWNXYXZlKSB7XHJcbiAgICB0aGlzLmF1ZGlvY3R4ID0gYXVkaW9jdHg7XHJcbiAgICB0aGlzLnNhbXBsZSA9IHBlcmlvZGljV2F2ZTtcclxuICAgIHRoaXMudm9sdW1lID0gYXVkaW9jdHguY3JlYXRlR2FpbigpO1xyXG4gICAgdGhpcy5lbnZlbG9wZSA9IG5ldyBFbnZlbG9wZUdlbmVyYXRvcih0aGlzLFxyXG4gICAgICAwLjUsXHJcbiAgICAgIDAuMjUsXHJcbiAgICAgIDAuOCxcclxuICAgICAgMi41XHJcbiAgICApO1xyXG4gICAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbiAgICB0aGlzLmRldHVuZSA9IDEuMDtcclxuICAgIHRoaXMudm9sdW1lLmdhaW4udmFsdWUgPSAxLjA7XHJcbiAgICB0aGlzLm91dHB1dCA9IHRoaXMudm9sdW1lO1xyXG4gIH1cclxuXHJcbiAgaW5pdFByb2Nlc3NvcigpIHtcclxuICAgIGxldCBwcm9jZXNzb3IgPSB0aGlzLnByb2Nlc3NvciA9IHRoaXMuYXVkaW9jdHguY3JlYXRlT3NjaWxsYXRvcigpO1xyXG4gICAgbGV0IGdhaW4gPSB0aGlzLmdhaW4gPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUdhaW4oKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMC4wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc2V0UGVyaW9kaWNXYXZlKHRoaXMuc2FtcGxlKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmNvbm5lY3QodGhpcy5nYWluKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLm9uZW5kZWQgPSAoKSA9PiB7XHJcbiAgICAgIHByb2Nlc3Nvci5kaXNjb25uZWN0KCk7XHJcbiAgICAgIGdhaW4uZGlzY29ubmVjdCgpO1xyXG4gICAgfTtcclxuICAgIHRoaXMuZ2Fpbi5jb25uZWN0KHRoaXMudm9sdW1lKTtcclxuICB9XHJcblxyXG4gIHN0YXJ0KHN0YXJ0VGltZSkge1xyXG4gICAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdGFydChzdGFydFRpbWUpO1xyXG4gIH1cclxuXHJcbiAgc3RvcCh0aW1lKSB7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdG9wKHRpbWUpO1xyXG4gIH1cclxuXHJcbiAga2V5b24odCwgbm90ZSwgdmVsKSB7XHJcbiAgICB0aGlzLnN0YXJ0KHQpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IuZnJlcXVlbmN5LnNldFZhbHVlQXRUaW1lKG1pZGlGcmVxW25vdGVdICogdGhpcy5kZXR1bmUsIHQpO1xyXG4gICAgdGhpcy5rZXlPblRpbWUgPSB0O1xyXG4gICAgdGhpcy5lbnZlbG9wZS5rZXlvbih0LCB2ZWwpO1xyXG4gIH1cclxuXHJcbiAga2V5b2ZmKHQpIHtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0Lyp0aGlzLmtleU9uVGltZSovKTtcclxuICAgIHRoaXMua2V5T2ZmVGltZSA9IHRoaXMuZW52ZWxvcGUua2V5b2ZmKHQpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RvcCh0aGlzLmtleU9mZlRpbWUpO1xyXG4gIH1cclxuXHJcbiAgaXNLZXlPbih0KSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnZlbG9wZS5rZXlPbiAmJiAodGhpcy5rZXlPblRpbWUgPD0gdCk7XHJcbiAgfVxyXG5cclxuICBpc0tleU9mZih0KSB7XHJcbiAgICByZXR1cm4gIXRoaXMuZW52ZWxvcGUua2V5T24gJiYgKHRoaXMua2V5T2ZmVGltZSA8PSB0KTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBdWRpbyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLlZPSUNFUyA9IDE2O1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQ7XHJcblxyXG4gICAgaWYgKHRoaXMuYXVkaW9Db250ZXh0KSB7XHJcbiAgICAgIHRoaXMuYXVkaW9jdHggPSBuZXcgdGhpcy5hdWRpb0NvbnRleHQoKTtcclxuICAgICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudm9pY2VzID0gW107XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgY3JlYXRlV2F2ZVNhbXBsZUZyb21XYXZlcyh0aGlzLmF1ZGlvY3R4LCBCVUZGRVJfU0laRSk7XHJcbiAgICAgIHRoaXMucGVyaW9kaWNXYXZlcyA9IGNyZWF0ZVBlcmlvZGljV2F2ZUZyb21XYXZlcyh0aGlzLmF1ZGlvY3R4KTtcclxuICAgICAgdGhpcy5maWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgICB0aGlzLmZpbHRlci50eXBlID0gJ2xvd3Bhc3MnO1xyXG4gICAgICB0aGlzLmZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAyMDAwMDtcclxuICAgICAgdGhpcy5maWx0ZXIuUS52YWx1ZSA9IDAuMDAwMTtcclxuICAgICAgdGhpcy5ub2lzZUZpbHRlciA9IHRoaXMuYXVkaW9jdHguY3JlYXRlQmlxdWFkRmlsdGVyKCk7XHJcbiAgICAgIHRoaXMubm9pc2VGaWx0ZXIudHlwZSA9ICdsb3dwYXNzJztcclxuICAgICAgdGhpcy5ub2lzZUZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAxMDAwO1xyXG4gICAgICB0aGlzLm5vaXNlRmlsdGVyLlEudmFsdWUgPSAxLjg7XHJcbiAgICAgIHRoaXMuY29tcCA9IHRoaXMuYXVkaW9jdHguY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKCk7XHJcbiAgICAgIHRoaXMuZmlsdGVyLmNvbm5lY3QodGhpcy5jb21wKTtcclxuICAgICAgdGhpcy5ub2lzZUZpbHRlci5jb25uZWN0KHRoaXMuY29tcCk7XHJcbiAgICAgIHRoaXMuY29tcC5jb25uZWN0KHRoaXMuYXVkaW9jdHguZGVzdGluYXRpb24pO1xyXG4gICAgICAvLyB0aGlzLmZpbHRlci5jb25uZWN0KHRoaXMuYXVkaW9jdHguZGVzdGluYXRpb24pO1xyXG4gICAgICAvLyB0aGlzLm5vaXNlRmlsdGVyLmNvbm5lY3QodGhpcy5hdWRpb2N0eC5kZXN0aW5hdGlvbik7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLlZPSUNFUzsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgLy92YXIgdiA9IG5ldyBPc2NWb2ljZSh0aGlzLmF1ZGlvY3R4LHRoaXMucGVyaW9kaWNXYXZlc1swXSk7XHJcbiAgICAgICAgdmFyIHYgPSBuZXcgVm9pY2UodGhpcy5hdWRpb2N0eCk7XHJcbiAgICAgICAgdGhpcy52b2ljZXMucHVzaCh2KTtcclxuICAgICAgICBpZiAoaSA9PSAodGhpcy5WT0lDRVMgLSAxKSkge1xyXG4gICAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLm5vaXNlRmlsdGVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLmZpbHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucmVhZERydW1TYW1wbGUgPSByZWFkRHJ1bVNhbXBsZSh0aGlzLmF1ZGlvY3R4KTtcclxuICAgICAgLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAvL3RoaXMudm9pY2VzWzBdLm91dHB1dC5jb25uZWN0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdGFydCgpIHtcclxuICAgIC8vIHZhciB2b2ljZXMgPSB0aGlzLnZvaWNlcztcclxuICAgIC8vIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2b2ljZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgIHZvaWNlc1tpXS5zdGFydCgwKTtcclxuICAgIC8vIH1cclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICAvL2lmKHRoaXMuc3RhcnRlZClcclxuICAgIC8ve1xyXG4gICAgdmFyIHZvaWNlcyA9IHRoaXMudm9pY2VzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHZvaWNlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2b2ljZXNbaV0uc3RvcCgwKTtcclxuICAgIH1cclxuICAgIC8vICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIC8vfVxyXG4gIH1cclxuICBcclxuICBnZXRXYXZlU2FtcGxlKG5vKXtcclxuICAgIHJldHVybiB3YXZlU2FtcGxlc1tub107XHJcbiAgfVxyXG59XHJcblxyXG5cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiDjgrfjg7zjgrHjg7PjgrXjg7zjgrPjg57jg7Pjg4kgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuZnVuY3Rpb24gY2FsY1N0ZXAobm90ZUxlbmd0aCkge1xyXG4gIC8vIOmVt+OBleOBi+OCieOCueODhuODg+ODl+OCkuioiOeul+OBmeOCi1xyXG4gIGxldCBwcmV2ID0gbnVsbDtcclxuICBsZXQgZG90dGVkID0gMDtcclxuXHJcbiAgbGV0IG1hcCA9IG5vdGVMZW5ndGgubWFwKChlbGVtKSA9PiB7XHJcbiAgICBzd2l0Y2ggKGVsZW0pIHtcclxuICAgICAgY2FzZSBudWxsOlxyXG4gICAgICAgIGVsZW0gPSBwcmV2O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDA6XHJcbiAgICAgICAgZWxlbSA9IChkb3R0ZWQgKj0gMik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcHJldiA9IGRvdHRlZCA9IGVsZW07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGxlbmd0aCA9IGVsZW0gIT09IG51bGwgPyBlbGVtIDogRGVmYXVsdFBhcmFtcy5sZW5ndGg7XHJcblxyXG4gICAgcmV0dXJuIFRJTUVfQkFTRSAqICg0IC8gbGVuZ3RoKTtcclxuICB9KTtcclxuICByZXR1cm4gbWFwLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTm90ZSB7XHJcbiAgY29uc3RydWN0b3Iobm90ZXMsIGxlbmd0aCkge1xyXG5cclxuICAgIHRoaXMubm90ZXMgPSBub3RlcztcclxuICAgIGlmIChsZW5ndGhbMF0pIHtcclxuICAgICAgdGhpcy5zdGVwID0gY2FsY1N0ZXAobGVuZ3RoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRoaXMubm90ZXMuZm9yRWFjaCgobiwgaSkgPT4ge1xyXG4gICAgICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgICAgIHZhciBub3RlID0gbjtcclxuICAgICAgdmFyIG9jdCA9IHRoaXMub2N0IHx8IGJhY2sub2N0O1xyXG4gICAgICB2YXIgc3RlcCA9IHRoaXMuc3RlcCB8fCBiYWNrLnN0ZXA7XHJcbiAgICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgICAgdmFyIHZlbCA9IHRoaXMudmVsIHx8IGJhY2sudmVsO1xyXG4gICAgICBzZXRRdWV1ZSh0cmFjaywgbm90ZSwgb2N0LCBpID09IDAgPyBzdGVwIDogMCwgZ2F0ZSwgdmVsKTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgU2VxRGF0YSB7XHJcbiAgY29uc3RydWN0b3Iobm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpIHtcclxuICAgIHRoaXMubm90ZSA9IG5vdGU7XHJcbiAgICB0aGlzLm9jdCA9IG9jdDtcclxuICAgIC8vdGhpcy5ubyA9IG5vdGUubm8gKyBvY3QgKiAxMjtcclxuICAgIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLmdhdGUgPSBnYXRlO1xyXG4gICAgdGhpcy52ZWwgPSB2ZWw7XHJcbiAgICB0aGlzLnNhbXBsZSA9IHdhdmVcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcy5ub3RlIHx8IGJhY2subm90ZTtcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLCBub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRRdWV1ZSh0cmFjaywgbm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpIHtcclxuICBsZXQgbm8gPSBub3RlICsgb2N0ICogMTI7XHJcbiAgbGV0IGJhY2sgPSB0cmFjay5iYWNrO1xyXG4gIHZhciBzdGVwX3RpbWUgPSAoc3RlcCA/IHRyYWNrLnBsYXlpbmdUaW1lIDogYmFjay5wbGF5aW5nVGltZSk7XHJcbiAgLy8gdmFyIGdhdGVfdGltZSA9ICgoZ2F0ZSA+PSAwKSA/IGdhdGUgKiA2MCA6IHN0ZXAgKiBnYXRlICogNjAgKiAtMS4wKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKSArIHRyYWNrLnBsYXlpbmdUaW1lO1xyXG5cclxuICB2YXIgZ2F0ZV90aW1lID0gKChzdGVwID09IDAgPyBiYWNrLmNvZGVTdGVwIDogc3RlcCkgKiBnYXRlICogNjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgKHN0ZXAgPyB0cmFjay5wbGF5aW5nVGltZSA6IGJhY2sucGxheWluZ1RpbWUpO1xyXG4gIC8vbGV0IHZvaWNlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdO1xyXG4gIGxldCB2b2ljZSA9IHRyYWNrLmFzc2lnblZvaWNlKHN0ZXBfdGltZSk7XHJcbiAgLy92b2ljZS5yZXNldCgpO1xyXG4gIHZvaWNlLnNhbXBsZSA9IGJhY2suc2FtcGxlO1xyXG4gIHZvaWNlLmVudmVsb3BlLmF0dGFja1RpbWUgPSBiYWNrLmF0dGFjaztcclxuICB2b2ljZS5lbnZlbG9wZS5kZWNheVRpbWUgPSBiYWNrLmRlY2F5O1xyXG4gIHZvaWNlLmVudmVsb3BlLnN1c3RhaW5MZXZlbCA9IGJhY2suc3VzdGFpbjtcclxuICB2b2ljZS5lbnZlbG9wZS5yZWxlYXNlVGltZSA9IGJhY2sucmVsZWFzZTtcclxuICB2b2ljZS5kZXR1bmUgPSBiYWNrLmRldHVuZTtcclxuICB2b2ljZS52b2x1bWUuZ2Fpbi5zZXRWYWx1ZUF0VGltZShiYWNrLnZvbHVtZSwgc3RlcF90aW1lKTtcclxuXHJcbiAgLy92b2ljZS5pbml0UHJvY2Vzc29yKCk7XHJcblxyXG4gIC8vY29uc29sZS5sb2codHJhY2suc2VxdWVuY2VyLnRlbXBvKTtcclxuICB2b2ljZS5rZXlvbihzdGVwX3RpbWUsIG5vLCB2ZWwpO1xyXG4gIHZvaWNlLmtleW9mZihnYXRlX3RpbWUpO1xyXG4gIGlmIChzdGVwKSB7XHJcbiAgICBiYWNrLmNvZGVTdGVwID0gc3RlcDtcclxuICAgIGJhY2sucGxheWluZ1RpbWUgPSB0cmFjay5wbGF5aW5nVGltZTtcclxuICB9XHJcblxyXG4gIHRyYWNrLnBsYXlpbmdUaW1lID0gKHN0ZXAgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbykgKyB0cmFjay5wbGF5aW5nVGltZTtcclxuICAvLyBiYWNrLnZvaWNlID0gdm9pY2U7XHJcbiAgLy8gYmFjay5ub3RlID0gbm90ZTtcclxuICAvLyBiYWNrLm9jdCA9IG9jdDtcclxuICAvLyBiYWNrLmdhdGUgPSBnYXRlO1xyXG4gIC8vIGJhY2sudmVsID0gdmVsO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gUyhub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICBpZiAoUy5sZW5ndGggIT0gYXJncy5sZW5ndGgpIHtcclxuICAgIGlmICh0eXBlb2YgKGFyZ3NbYXJncy5sZW5ndGggLSAxXSkgPT0gJ29iamVjdCcgJiYgIShhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gaW5zdGFuY2VvZiBOb3RlKSkge1xyXG4gICAgICB2YXIgYXJnczEgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XHJcbiAgICAgIHZhciBsID0gYXJncy5sZW5ndGggLSAxO1xyXG4gICAgICByZXR1cm4gbmV3IFNlcURhdGEoXHJcbiAgICAgICAgKChsICE9IDApID8gbm90ZSA6IGZhbHNlKSB8fCBhcmdzMS5ub3RlIHx8IGFyZ3MxLm4gfHwgbnVsbCxcclxuICAgICAgICAoKGwgIT0gMSkgPyBvY3QgOiBmYWxzZSkgfHwgYXJnczEub2N0IHx8IGFyZ3MxLm8gfHwgbnVsbCxcclxuICAgICAgICAoKGwgIT0gMikgPyBzdGVwIDogZmFsc2UpIHx8IGFyZ3MxLnN0ZXAgfHwgYXJnczEucyB8fCBudWxsLFxyXG4gICAgICAgICgobCAhPSAzKSA/IGdhdGUgOiBmYWxzZSkgfHwgYXJnczEuZ2F0ZSB8fCBhcmdzMS5nIHx8IG51bGwsXHJcbiAgICAgICAgKChsICE9IDQpID8gdmVsIDogZmFsc2UpIHx8IGFyZ3MxLnZlbCB8fCBhcmdzMS52IHx8IG51bGxcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG5ldyBTZXFEYXRhKG5vdGUgfHwgbnVsbCwgb2N0IHx8IG51bGwsIHN0ZXAgfHwgbnVsbCwgZ2F0ZSB8fCBudWxsLCB2ZWwgfHwgbnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMxKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKHN0ZXApLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMihub3RlLCBsZW4sIGRvdCwgb2N0LCBnYXRlLCB2ZWwpIHtcclxuICByZXR1cm4gUyhub3RlLCBvY3QsIGwobGVuLCBkb3QpLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMyhub3RlLCBzdGVwLCBnYXRlLCB2ZWwsIG9jdCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuXHJcbi8vLyDpn7PnrKbjga7plbfjgZXmjIflrppcclxuXHJcbmNsYXNzIExlbmd0aCB7XHJcbiAgY29uc3RydWN0b3IobGVuKSB7XHJcbiAgICB0aGlzLnN0ZXAgPSBjYWxjU3RlcChsZW4pO1xyXG4gIH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBTdGVwIHtcclxuICBjb25zdHJ1Y3RvcihzdGVwKSB7XHJcbiAgICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG4gIH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Ky44O844OI44K/44Kk44Og5oyH5a6aXHJcblxyXG5jbGFzcyBHYXRlVGltZSB7XHJcbiAgY29uc3RydWN0b3IoZ2F0ZSkge1xyXG4gICAgdGhpcy5nYXRlID0gZ2F0ZSAvIDEwMDtcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRyYWNrLmJhY2suZ2F0ZSA9IHRoaXMuZ2F0ZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg5njg63jgrfjg4bjgqPmjIflrppcclxuXHJcbmNsYXNzIFZlbG9jaXR5IHtcclxuICBjb25zdHJ1Y3Rvcih2ZWwpIHtcclxuICAgIHRoaXMudmVsID0gdmVsIC8gMTAwO1xyXG4gIH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLnZlbCA9IHRoaXMudmVsO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOmfs+iJsuioreWumlxyXG5jbGFzcyBUb25lIHtcclxuICBjb25zdHJ1Y3Rvcihubykge1xyXG4gICAgdGhpcy5ubyA9IG5vO1xyXG4gICAgLy90aGlzLnNhbXBsZSA9IHdhdmVTYW1wbGVzW3RoaXMubm9dO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgLy8gICAgdHJhY2suYmFjay5zYW1wbGUgPSB0cmFjay5hdWRpby5wZXJpb2RpY1dhdmVzW3RoaXMubm9dO1xyXG4gICAgdHJhY2suYmFjay5zYW1wbGUgPSB3YXZlU2FtcGxlc1t0aGlzLm5vXTtcclxuICAgIC8vICAgIHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXS5zZXRTYW1wbGUod2F2ZVNhbXBsZXNbdGhpcy5ub10pO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgUmVzdCB7XHJcbiAgY29uc3RydWN0b3IobGVuZ3RoKSB7XHJcbiAgICB0aGlzLnN0ZXAgPSBjYWxjU3RlcChsZW5ndGgpO1xyXG4gIH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB2YXIgc3RlcCA9IHRoaXMuc3RlcCB8fCB0cmFjay5iYWNrLnN0ZXA7XHJcbiAgICB0cmFjay5wbGF5aW5nVGltZSA9IHRyYWNrLnBsYXlpbmdUaW1lICsgKHRoaXMuc3RlcCAqIDYwKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKTtcclxuICAgIC8vdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgT2N0YXZlIHtcclxuICBjb25zdHJ1Y3RvcihvY3QpIHtcclxuICAgIHRoaXMub2N0ID0gb2N0O1xyXG4gIH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLm9jdCA9IHRoaXMub2N0O1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmNsYXNzIE9jdGF2ZVVwIHtcclxuICBjb25zdHJ1Y3Rvcih2KSB7IHRoaXMudiA9IHY7IH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLm9jdCArPSB0aGlzLnY7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBPY3RhdmVEb3duIHtcclxuICBjb25zdHJ1Y3Rvcih2KSB7IHRoaXMudiA9IHY7IH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLm9jdCAtPSB0aGlzLnY7XHJcbiAgfVxyXG59XHJcbmNsYXNzIFRlbXBvIHtcclxuICBjb25zdHJ1Y3Rvcih0ZW1wbykge1xyXG4gICAgdGhpcy50ZW1wbyA9IHRlbXBvO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdHJhY2subG9jYWxUZW1wbyA9IHRoaXMudGVtcG87XHJcbiAgICAvL3RyYWNrLnNlcXVlbmNlci50ZW1wbyA9IHRoaXMudGVtcG87XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBFbnZlbG9wZSB7XHJcbiAgY29uc3RydWN0b3IoYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSkge1xyXG4gICAgdGhpcy5hdHRhY2sgPSBhdHRhY2s7XHJcbiAgICB0aGlzLmRlY2F5ID0gZGVjYXk7XHJcbiAgICB0aGlzLnN1c3RhaW4gPSBzdXN0YWluO1xyXG4gICAgdGhpcy5yZWxlYXNlID0gcmVsZWFzZTtcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIC8vdmFyIGVudmVsb3BlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLmVudmVsb3BlO1xyXG4gICAgdHJhY2suYmFjay5hdHRhY2sgPSB0aGlzLmF0dGFjaztcclxuICAgIHRyYWNrLmJhY2suZGVjYXkgPSB0aGlzLmRlY2F5O1xyXG4gICAgdHJhY2suYmFjay5zdXN0YWluID0gdGhpcy5zdXN0YWluO1xyXG4gICAgdHJhY2suYmFjay5yZWxlYXNlID0gdGhpcy5yZWxlYXNlO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODh+ODgeODpeODvOODs1xyXG5jbGFzcyBEZXR1bmUge1xyXG4gIGNvbnN0cnVjdG9yKGRldHVuZSkge1xyXG4gICAgdGhpcy5kZXR1bmUgPSBkZXR1bmU7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICAvL3ZhciB2b2ljZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXTtcclxuICAgIHRyYWNrLmJhY2suZGV0dW5lID0gdGhpcy5kZXR1bmU7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBWb2x1bWUge1xyXG4gIGNvbnN0cnVjdG9yKHZvbHVtZSkge1xyXG4gICAgdGhpcy52b2x1bWUgPSB2b2x1bWUgLyAxMDAuMDtcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIC8vIFxyXG4gICAgdHJhY2suYmFjay52b2x1bWUgPSB0aGlzLnZvbHVtZTtcclxuICAgIC8vIHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXS52b2x1bWUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLnZvbHVtZSwgdHJhY2sucGxheWluZ1RpbWUpO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgTG9vcERhdGEge1xyXG4gIGNvbnN0cnVjdG9yKG9iaiwgdmFybmFtZSwgY291bnQsIHNlcVBvcykge1xyXG4gICAgdGhpcy52YXJuYW1lID0gdmFybmFtZTtcclxuICAgIHRoaXMuY291bnQgPSBjb3VudCB8fCBEZWZhdWx0UGFyYW1zLmxvb3BDb3VudDtcclxuICAgIHRoaXMub2JqID0gb2JqO1xyXG4gICAgdGhpcy5zZXFQb3MgPSBzZXFQb3M7XHJcbiAgICB0aGlzLm91dFNlcVBvcyA9IC0xO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdmFyIHN0YWNrID0gdHJhY2suc3RhY2s7XHJcbiAgICBpZiAoc3RhY2subGVuZ3RoID09IDAgfHwgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0ub2JqICE9PSB0aGlzKSB7XHJcbiAgICAgIHZhciBsZCA9IHRoaXM7XHJcbiAgICAgIHN0YWNrLnB1c2gobmV3IExvb3BEYXRhKHRoaXMsIGxkLnZhcm5hbWUsIGxkLmNvdW50LCB0cmFjay5zZXFQb3MpKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIExvb3BFbmQge1xyXG4gIGNvbnN0cnVjdG9yKHNlcVBvcykge1xyXG4gICAgdGhpcy5zZXFQb3MgPSBzZXFQb3M7XHJcbiAgfVxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHZhciBsZCA9IHRyYWNrLnN0YWNrW3RyYWNrLnN0YWNrLmxlbmd0aCAtIDFdO1xyXG4gICAgaWYgKGxkLm91dFNlcVBvcyA9PSAtMSkgbGQub3V0U2VxUG9zID0gdGhpcy5zZXFQb3M7XHJcbiAgICBsZC5jb3VudC0tO1xyXG4gICAgaWYgKGxkLmNvdW50ID4gMCkge1xyXG4gICAgICB0cmFjay5zZXFQb3MgPSBsZC5zZXFQb3M7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0cmFjay5zdGFjay5wb3AoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIExvb3BFeGl0IHtcclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB2YXIgbGQgPSB0cmFjay5zdGFja1t0cmFjay5zdGFjay5sZW5ndGggLSAxXTtcclxuICAgIGlmIChsZC5jb3VudCA8PSAxICYmIGxkLm91dFNlcVBvcyAhPSAtMSkge1xyXG4gICAgICB0cmFjay5zZXFQb3MgPSBsZC5vdXRTZXFQb3M7XHJcbiAgICAgIHRyYWNrLnN0YWNrLnBvcCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgSW5maW5pdGVMb29wIHtcclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5pbmZpbml0TG9vcEluZGV4ID0gdHJhY2suc2VxUG9zO1xyXG4gIH1cclxufVxyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8vIOOCt+ODvOOCseODs+OCteODvOODiOODqeODg+OCr1xyXG5jbGFzcyBUcmFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2VxdWVuY2VyLCBzZXFkYXRhLCBhdWRpbykge1xyXG4gICAgdGhpcy5uYW1lID0gJyc7XHJcbiAgICB0aGlzLmVuZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5vbmVzaG90ID0gZmFsc2U7XHJcbiAgICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICAgIHRoaXMuc2VxRGF0YSA9IHNlcWRhdGE7XHJcbiAgICB0aGlzLnNlcVBvcyA9IDA7XHJcbiAgICB0aGlzLm11dGUgPSBmYWxzZTtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAtMTtcclxuICAgIHRoaXMubG9jYWxUZW1wbyA9IHNlcXVlbmNlci50ZW1wbztcclxuICAgIHRoaXMudHJhY2tWb2x1bWUgPSAxLjA7XHJcbiAgICB0aGlzLnRyYW5zcG9zZSA9IDA7XHJcbiAgICB0aGlzLnNvbG8gPSBmYWxzZTtcclxuICAgIHRoaXMuY2hhbm5lbCA9IC0xO1xyXG4gICAgdGhpcy50cmFjayA9IC0xO1xyXG4gICAgdGhpcy5hdWRpbyA9IGF1ZGlvO1xyXG4gICAgdGhpcy5pbmZpbml0TG9vcEluZGV4ID0gLTE7XHJcbiAgICB0aGlzLmJhY2sgPSB7XHJcbiAgICAgIG5vdGU6IDcyLFxyXG4gICAgICBvY3Q6IDUsXHJcbiAgICAgIHN0ZXA6IDk2LFxyXG4gICAgICBnYXRlOiAwLjUsXHJcbiAgICAgIHZlbDogMS4wLFxyXG4gICAgICBhdHRhY2s6IDAuMDEsXHJcbiAgICAgIGRlY2F5OiAwLjA1LFxyXG4gICAgICBzdXN0YWluOiAwLjYsXHJcbiAgICAgIHJlbGVhc2U6IDAuMDcsXHJcbiAgICAgIGRldHVuZTogMS4wLFxyXG4gICAgICB2b2x1bWU6IDAuNSxcclxuICAgICAgLy8gICAgICBzYW1wbGU6YXVkaW8ucGVyaW9kaWNXYXZlc1swXVxyXG4gICAgICBzYW1wbGU6IHdhdmVTYW1wbGVzWzBdXHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YWNrID0gW107XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKGN1cnJlbnRUaW1lKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZW5kKSByZXR1cm47XHJcblxyXG4gICAgaWYgKHRoaXMub25lc2hvdCkge1xyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlcVNpemUgPSB0aGlzLnNlcURhdGEubGVuZ3RoO1xyXG4gICAgaWYgKHRoaXMuc2VxUG9zID49IHNlcVNpemUpIHtcclxuICAgICAgaWYgKHRoaXMuc2VxdWVuY2VyLnJlcGVhdCkge1xyXG4gICAgICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLmluZmluaXRMb29wSW5kZXggPj0gMCkge1xyXG4gICAgICAgIHRoaXMuc2VxUG9zID0gdGhpcy5pbmZpbml0TG9vcEluZGV4O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZW5kID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VxID0gdGhpcy5zZXFEYXRhO1xyXG4gICAgdGhpcy5wbGF5aW5nVGltZSA9ICh0aGlzLnBsYXlpbmdUaW1lID4gLTEpID8gdGhpcy5wbGF5aW5nVGltZSA6IGN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIGVuZFRpbWUgPSBjdXJyZW50VGltZSArIDAuMi8qc2VjKi87XHJcblxyXG4gICAgd2hpbGUgKHRoaXMuc2VxUG9zIDwgc2VxU2l6ZSkge1xyXG4gICAgICBpZiAodGhpcy5wbGF5aW5nVGltZSA+PSBlbmRUaW1lICYmICF0aGlzLm9uZXNob3QpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgZCA9IHNlcVt0aGlzLnNlcVBvc107XHJcbiAgICAgICAgZC5wcm9jZXNzKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2VxUG9zKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgLy8gdmFyIGN1clZvaWNlID0gdGhpcy5hdWRpby52b2ljZXNbdGhpcy5jaGFubmVsXTtcclxuICAgIC8vIGN1clZvaWNlLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICAvLyBjdXJWb2ljZS5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIC8vIGN1clZvaWNlLmdhaW4uZ2Fpbi52YWx1ZSA9IDA7XHJcbiAgICB0aGlzLnBsYXlpbmdUaW1lID0gLTE7XHJcbiAgICB0aGlzLnNlcVBvcyA9IDA7XHJcbiAgICB0aGlzLmluZmluaXRMb29wSW5kZXggPSAtMTtcclxuICAgIHRoaXMuZW5kID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0YWNrLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG5cclxuICBhc3NpZ25Wb2ljZSh0KSB7XHJcbiAgICBsZXQgcmV0ID0gbnVsbDtcclxuICAgIHRoaXMuYXVkaW8udm9pY2VzLnNvbWUoKGQsIGkpID0+IHtcclxuICAgICAgaWYgKGQuaXNLZXlPZmYodCkpIHtcclxuICAgICAgICByZXQgPSBkO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgaWYgKCFyZXQpIHtcclxuICAgICAgbGV0IG9sZGVzdEtleU9uRGF0YSA9ICh0aGlzLmF1ZGlvLnZvaWNlcy5tYXAoKGQsIGkpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0aW1lOiBkLmVudmVsb3BlLmtleU9uVGltZSwgZCwgaSB9O1xyXG4gICAgICB9KS5zb3J0KChhLCBiKSA9PiBhLnRpbWUgLSBiLnRpbWUpKVswXTtcclxuICAgICAgcmV0ID0gb2xkZXN0S2V5T25EYXRhLmQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRUcmFja3Moc2VsZiwgdHJhY2tzLCB0cmFja2RhdGEpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYWNrZGF0YS5sZW5ndGg7ICsraSkge1xyXG4gICAgdmFyIHRyYWNrID0gbmV3IFRyYWNrKHNlbGYsIHRyYWNrZGF0YVtpXS5kYXRhLCBzZWxmLmF1ZGlvKTtcclxuICAgIHRyYWNrLmNoYW5uZWwgPSB0cmFja2RhdGFbaV0uY2hhbm5lbDtcclxuICAgIHRyYWNrLm9uZXNob3QgPSAoIXRyYWNrZGF0YVtpXS5vbmVzaG90KSA/IGZhbHNlIDogdHJ1ZTtcclxuICAgIHRyYWNrLnRyYWNrID0gaTtcclxuICAgIHRyYWNrcy5wdXNoKHRyYWNrKTtcclxuICB9XHJcbiAgcmV0dXJuIHRyYWNrcztcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlVHJhY2tzKHRyYWNrZGF0YSkge1xyXG4gIHZhciB0cmFja3MgPSBbXTtcclxuICBsb2FkVHJhY2tzKHRoaXMsIHRyYWNrcywgdHJhY2tkYXRhLnRyYWNrcyk7XHJcbiAgcmV0dXJuIHRyYWNrcztcclxufVxyXG5cclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8g44K344O844Kx44Oz44K144O85pys5L2TIFxyXG5leHBvcnQgY2xhc3MgU2VxdWVuY2VyIHtcclxuICBjb25zdHJ1Y3RvcihhdWRpbykge1xyXG4gICAgdGhpcy5TVE9QID0gMCB8IDA7XHJcbiAgICB0aGlzLlBMQVkgPSAxIHwgMDtcclxuICAgIHRoaXMuUEFVU0UgPSAyIHwgMDtcclxuXHJcbiAgICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgICB0aGlzLnRlbXBvID0gMTAwLjA7XHJcbiAgICB0aGlzLnJlcGVhdCA9IGZhbHNlO1xyXG4gICAgdGhpcy5wbGF5ID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYWNrcyA9IFtdO1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgfVxyXG4gIGxvYWQoZGF0YSkge1xyXG4gICAgcGFyc2VNTUwoZGF0YSk7XHJcbiAgICBpZiAodGhpcy5wbGF5KSB7XHJcbiAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy50cmFja3MubGVuZ3RoID0gMDtcclxuICAgIGxvYWRUcmFja3ModGhpcywgdGhpcy50cmFja3MsIGRhdGEudHJhY2tzKTtcclxuICB9XHJcbiAgc3RhcnQoKSB7XHJcbiAgICAvLyAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgc2VsZi5wcm9jZXNzKCkgfSwgNTApO1xyXG4gICAgdGhpcy5hdWRpby5yZWFkRHJ1bVNhbXBsZVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBMQVk7XHJcbiAgICAgICAgdGhpcy5wcm9jZXNzKCk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuICBwcm9jZXNzKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuUExBWSkge1xyXG4gICAgICB0aGlzLnBsYXlUcmFja3ModGhpcy50cmFja3MpO1xyXG4gICAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgfVxyXG4gIH1cclxuICBwbGF5VHJhY2tzKHRyYWNrcykge1xyXG4gICAgdmFyIGN1cnJlbnRUaW1lID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICAgIC8vICAgY29uc29sZS5sb2codGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZSk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdHJhY2tzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHRyYWNrc1tpXS5wcm9jZXNzKGN1cnJlbnRUaW1lKTtcclxuICAgIH1cclxuICB9XHJcbiAgcGF1c2UoKSB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUEFVU0U7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IHRoaXMuYXVkaW8uYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgfVxyXG4gIHJlc3VtZSgpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlBBVVNFKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QTEFZO1xyXG4gICAgICB2YXIgdHJhY2tzID0gdGhpcy50cmFja3M7XHJcbiAgICAgIHZhciBhZGp1c3QgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICB0cmFja3NbaV0ucGxheWluZ1RpbWUgKz0gYWRqdXN0O1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvY2VzcygpO1xyXG4gICAgfVxyXG4gIH1cclxuICBzdG9wKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuU1RPUCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5oYW5kbGUpO1xyXG4gICAgICAvLyAgICBjbGVhckludGVydmFsKHRoaXMuaGFuZGxlKTtcclxuICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmVzZXQoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy50cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdGhpcy50cmFja3NbaV0ucmVzZXQoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlTU1MKGRhdGEpIHtcclxuICBkYXRhLnRyYWNrcy5mb3JFYWNoKChkKSA9PiB7XHJcbiAgICBkLmRhdGEgPSBwYXJzZU1NTF8oZC5tbWwpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZU1NTF8obW1sKSB7XHJcbiAgbGV0IHBhcnNlciA9IG5ldyBNTUxQYXJzZXIobW1sKTtcclxuICBsZXQgY29tbWFuZHMgPSBwYXJzZXIucGFyc2UoKTtcclxuICBsZXQgc2VxQXJyYXkgPSBbXTtcclxuICBjb21tYW5kcy5mb3JFYWNoKChjb21tYW5kKSA9PiB7XHJcbiAgICBzd2l0Y2ggKGNvbW1hbmQudHlwZSkge1xyXG4gICAgICBjYXNlIFN5bnRheC5Ob3RlOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IE5vdGUoY29tbWFuZC5ub3RlTnVtYmVycywgY29tbWFuZC5ub3RlTGVuZ3RoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4LlJlc3Q6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgUmVzdChjb21tYW5kLm5vdGVMZW5ndGgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguT2N0YXZlOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IE9jdGF2ZShjb21tYW5kLnZhbHVlKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4Lk9jdGF2ZVNoaWZ0OlxyXG4gICAgICAgIGlmIChjb21tYW5kLmRpcmVjdGlvbiA+PSAwKSB7XHJcbiAgICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBPY3RhdmVVcCgxKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNlcUFycmF5LnB1c2gobmV3IE9jdGF2ZURvd24oMSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguTm90ZUxlbmd0aDpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBMZW5ndGgoY29tbWFuZC5ub3RlTGVuZ3RoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4Lk5vdGVWZWxvY2l0eTpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBWZWxvY2l0eShjb21tYW5kLnZhbHVlKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4LlRlbXBvOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IFRlbXBvKGNvbW1hbmQudmFsdWUpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguTm90ZVF1YW50aXplOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IEdhdGVUaW1lKGNvbW1hbmQudmFsdWUpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguSW5maW5pdGVMb29wOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IEluZmluaXRlTG9vcCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguTG9vcEJlZ2luOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IExvb3BEYXRhKG51bGwsICcnLCBjb21tYW5kLnZhbHVlLCBudWxsKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4Lkxvb3BFeGl0OlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IExvb3BFeGl0KCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5Mb29wRW5kOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IExvb3BFbmQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4LlRvbmU6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgVG9uZShjb21tYW5kLnZhbHVlKSk7XHJcbiAgICAgIGNhc2UgU3ludGF4LldhdmVGb3JtOlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5FbnZlbG9wZTpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBFbnZlbG9wZShjb21tYW5kLmEsIGNvbW1hbmQuZCwgY29tbWFuZC5zLCBjb21tYW5kLnIpKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9KTtcclxuICByZXR1cm4gc2VxQXJyYXk7XHJcbn1cclxuXHJcbi8vIGV4cG9ydCB2YXIgc2VxRGF0YSA9IHtcclxuLy8gICBuYW1lOiAnVGVzdCcsXHJcbi8vICAgdHJhY2tzOiBbXHJcbi8vICAgICB7XHJcbi8vICAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbi8vICAgICAgIGNoYW5uZWw6IDAsXHJcbi8vICAgICAgIGRhdGE6XHJcbi8vICAgICAgIFtcclxuLy8gICAgICAgICBFTlYoMC4wMSwgMC4wMiwgMC41LCAwLjA3KSxcclxuLy8gICAgICAgICBURU1QTygxODApLCBUT05FKDApLCBWT0xVTUUoMC41KSwgTCg4KSwgR1QoLTAuNSksTyg0KSxcclxuLy8gICAgICAgICBMT09QKCdpJyw0KSxcclxuLy8gICAgICAgICBDLCBDLCBDLCBDLCBDLCBDLCBDLCBDLFxyXG4vLyAgICAgICAgIExPT1BfRU5ELFxyXG4vLyAgICAgICAgIEpVTVAoNSlcclxuLy8gICAgICAgXVxyXG4vLyAgICAgfSxcclxuLy8gICAgIHtcclxuLy8gICAgICAgbmFtZTogJ3BhcnQyJyxcclxuLy8gICAgICAgY2hhbm5lbDogMSxcclxuLy8gICAgICAgZGF0YTpcclxuLy8gICAgICAgICBbXHJcbi8vICAgICAgICAgRU5WKDAuMDEsIDAuMDUsIDAuNiwgMC4wNyksXHJcbi8vICAgICAgICAgVEVNUE8oMTgwKSxUT05FKDYpLCBWT0xVTUUoMC4yKSwgTCg4KSwgR1QoLTAuOCksXHJcbi8vICAgICAgICAgUigxKSwgUigxKSxcclxuLy8gICAgICAgICBPKDYpLEwoMSksIEYsXHJcbi8vICAgICAgICAgRSxcclxuLy8gICAgICAgICBPRCwgTCg4LCB0cnVlKSwgQmIsIEcsIEwoNCksIEJiLCBPVSwgTCg0KSwgRiwgTCg4KSwgRCxcclxuLy8gICAgICAgICBMKDQsIHRydWUpLCBFLCBMKDIpLCBDLFIoOCksXHJcbi8vICAgICAgICAgSlVNUCg4KVxyXG4vLyAgICAgICAgIF1cclxuLy8gICAgIH0sXHJcbi8vICAgICB7XHJcbi8vICAgICAgIG5hbWU6ICdwYXJ0MycsXHJcbi8vICAgICAgIGNoYW5uZWw6IDIsXHJcbi8vICAgICAgIGRhdGE6XHJcbi8vICAgICAgICAgW1xyXG4vLyAgICAgICAgIEVOVigwLjAxLCAwLjA1LCAwLjYsIDAuMDcpLFxyXG4vLyAgICAgICAgIFRFTVBPKDE4MCksVE9ORSg2KSwgVk9MVU1FKDAuMSksIEwoOCksIEdUKC0wLjUpLCBcclxuLy8gICAgICAgICBSKDEpLCBSKDEpLFxyXG4vLyAgICAgICAgIE8oNiksTCgxKSwgQyxDLFxyXG4vLyAgICAgICAgIE9ELCBMKDgsIHRydWUpLCBHLCBELCBMKDQpLCBHLCBPVSwgTCg0KSwgRCwgTCg4KSxPRCwgRyxcclxuLy8gICAgICAgICBMKDQsIHRydWUpLCBPVSxDLCBMKDIpLE9ELCBHLCBSKDgpLFxyXG4vLyAgICAgICAgIEpVTVAoNylcclxuLy8gICAgICAgICBdXHJcbi8vICAgICB9XHJcbi8vICAgXVxyXG4vLyB9XHJcblxyXG5leHBvcnQgY2xhc3MgU291bmRFZmZlY3RzIHtcclxuICBjb25zdHJ1Y3RvcihzZXF1ZW5jZXIsZGF0YSl7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IFtdO1xyXG4gICAgZGF0YS5mb3JFYWNoKChkKT0+e1xyXG4gICAgICB2YXIgdHJhY2tzID0gW107XHJcbiAgICAgIHBhcnNlTU1MKGQpO1xyXG4gICAgICB0aGlzLnNvdW5kRWZmZWN0cy5wdXNoKGxvYWRUcmFja3Moc2VxdWVuY2VyLCB0cmFja3MsIGQudHJhY2tzKSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBTb3VuZEVmZmVjdHMoc2VxdWVuY2VyKSB7XHJcbi8vICAgIHRoaXMuc291bmRFZmZlY3RzID1cclxuLy8gICAgIFtcclxuLy8gICAgIC8vIEVmZmVjdCAwIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLyAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFtcclxuLy8gICAgIHtcclxuLy8gICAgICAgY2hhbm5lbDogOCxcclxuLy8gICAgICAgb25lc2hvdDp0cnVlLFxyXG4vLyAgICAgICBkYXRhOiBbVk9MVU1FKDAuNSksXHJcbi8vICAgICAgICAgRU5WKDAuMDAwMSwgMC4wMSwgMS4wLCAwLjAwMDEpLEdUKC0wLjk5OSksVE9ORSgwKSwgVEVNUE8oMjAwKSwgTyg4KSxTVCgzKSwgQywgRCwgRSwgRiwgRywgQSwgQiwgT1UsIEMsIEQsIEUsIEcsIEEsIEIsQixCLEJcclxuLy8gICAgICAgXVxyXG4vLyAgICAgfSxcclxuLy8gICAgIHtcclxuLy8gICAgICAgY2hhbm5lbDogOSxcclxuLy8gICAgICAgb25lc2hvdDogdHJ1ZSxcclxuLy8gICAgICAgZGF0YTogW1ZPTFVNRSgwLjUpLFxyXG4vLyAgICAgICAgIEVOVigwLjAwMDEsIDAuMDEsIDEuMCwgMC4wMDAxKSwgREVUVU5FKDAuOSksIEdUKC0wLjk5OSksIFRPTkUoMCksIFRFTVBPKDIwMCksIE8oNSksIFNUKDMpLCBDLCBELCBFLCBGLCBHLCBBLCBCLCBPVSwgQywgRCwgRSwgRywgQSwgQixCLEIsQlxyXG4vLyAgICAgICBdXHJcbi8vICAgICB9XHJcbi8vICAgICBdKSxcclxuLy8gICAgIC8vIEVmZmVjdCAxIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8gICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuLy8gICAgICAgW1xyXG4vLyAgICAgICAgIHtcclxuLy8gICAgICAgICAgIGNoYW5uZWw6IDEwLFxyXG4vLyAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuLy8gICAgICAgICAgIGRhdGE6IFtcclxuLy8gICAgICAgICAgICBUT05FKDQpLCBURU1QTygxNTApLCBTVCg0KSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjAwMDEpLFxyXG4vLyAgICAgICAgICAgIE8oNiksIEcsIEEsIEIsIE8oNyksIEIsIEEsIEcsIEYsIEUsIEQsIEMsIEUsIEcsIEEsIEIsIE9ELCBCLCBBLCBHLCBGLCBFLCBELCBDLCBPRCwgQiwgQSwgRywgRiwgRSwgRCwgQ1xyXG4vLyAgICAgICAgICAgXVxyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgXSksXHJcbi8vICAgICAvLyBFZmZlY3QgMi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbi8vICAgICAgIFtcclxuLy8gICAgICAgICB7XHJcbi8vICAgICAgICAgICBjaGFubmVsOiAxMCxcclxuLy8gICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbi8vICAgICAgICAgICBkYXRhOiBbXHJcbi8vICAgICAgICAgICAgVE9ORSgwKSwgVEVNUE8oMTUwKSwgU1QoMiksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuLy8gICAgICAgICAgICBPKDgpLCBDLEQsRSxGLEcsQSxCLE9VLEMsRCxFLEYsT0QsRyxPVSxBLE9ELEIsT1UsQSxPRCxHLE9VLEYsT0QsRSxPVSxFXHJcbi8vICAgICAgICAgICBdXHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgICBdKSxcclxuLy8gICAgICAgLy8gRWZmZWN0IDMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vICAgICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuLy8gICAgICAgICBbXHJcbi8vICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgIGNoYW5uZWw6IDEwLFxyXG4vLyAgICAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4vLyAgICAgICAgICAgICBkYXRhOiBbXHJcbi8vICAgICAgICAgICAgICBUT05FKDUpLCBURU1QTygxNTApLCBMKDY0KSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjAwMDEpLFxyXG4vLyAgICAgICAgICAgICAgTyg2KSxDLE9ELEMsT1UsQyxPRCxDLE9VLEMsT0QsQyxPVSxDLE9EXHJcbi8vICAgICAgICAgICAgIF1cclxuLy8gICAgICAgICAgIH1cclxuLy8gICAgICAgICBdKSxcclxuLy8gICAgICAgLy8gRWZmZWN0IDQgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLyAgICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbi8vICAgICAgICAgW1xyXG4vLyAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICBjaGFubmVsOiAxMSxcclxuLy8gICAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuLy8gICAgICAgICAgICAgZGF0YTogW1xyXG4vLyAgICAgICAgICAgICAgVE9ORSg4KSwgVk9MVU1FKDIuMCksVEVNUE8oMTIwKSwgTCgyKSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjI1KSxcclxuLy8gICAgICAgICAgICAgIE8oMSksIENcclxuLy8gICAgICAgICAgICAgXVxyXG4vLyAgICAgICAgICAgfVxyXG4vLyAgICAgICAgIF0pXHJcbi8vICAgIF07XHJcbi8vICB9XHJcblxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwuanMnOyBcclxuXHJcbi8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zjgajjgZfjgaZjYW52YXPjgpLkvb/jgYbloLTlkIjjga7jg5jjg6vjg5Hjg7xcclxuZXhwb3J0IGZ1bmN0aW9uIENhbnZhc1RleHR1cmUod2lkdGgsIGhlaWdodCkge1xyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aCB8fCBzZmcuVklSVFVBTF9XSURUSDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgc2ZnLlZJUlRVQUxfSEVJR0hUO1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMDAxO1xyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxufVxyXG5cclxuLy8vIOODl+ODreOCsOODrOOCueODkOODvOihqOekuuOCr+ODqeOCuVxyXG5leHBvcnQgZnVuY3Rpb24gUHJvZ3Jlc3MoKSB7XHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTs7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gc2ZnLlZJUlRVQUxfV0lEVEgpe1xyXG4gICAgd2lkdGggKj0gMjtcclxuICB9XHJcbiAgdmFyIGhlaWdodCA9IDE7XHJcbiAgd2hpbGUgKGhlaWdodCA8PSBzZmcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gKHdpZHRoIC0gc2ZnLlZJUlRVQUxfV0lEVEgpIC8gMjtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9ICAtIChoZWlnaHQgLSBzZmcuVklSVFVBTF9IRUlHSFQpIC8gMjtcclxuXHJcbiAgLy90aGlzLnRleHR1cmUucHJlbXVsdGlwbHlBbHBoYSA9IHRydWU7XHJcbn1cclxuXHJcbi8vLyDjg5fjg63jgrDjg6zjgrnjg5Djg7zjgpLooajnpLrjgZnjgovjgIJcclxuUHJvZ3Jlc3MucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChtZXNzYWdlLCBwZXJjZW50KSB7XHJcbiAgdmFyIGN0eCA9IHRoaXMuY3R4O1xyXG4gIHZhciB3aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoLCBoZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XHJcbiAgLy8gICAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwwLDAsMCknO1xyXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdmFyIHRleHRXaWR0aCA9IGN0eC5tZWFzdXJlVGV4dChtZXNzYWdlKS53aWR0aDtcclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMS4wKSc7XHJcblxyXG4gIGN0eC5maWxsVGV4dChtZXNzYWdlLCAod2lkdGggLSB0ZXh0V2lkdGgpIC8gMiwgMTAwKTtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LnJlY3QoMjAsIDc1LCB3aWR0aCAtIDIwICogMiwgMTApO1xyXG4gIGN0eC5zdHJva2UoKTtcclxuICBjdHguZmlsbFJlY3QoMjAsIDc1LCAod2lkdGggLSAyMCAqIDIpICogcGVyY2VudCAvIDEwMCwgMTApO1xyXG4gIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbn1cclxuXHJcbi8vLyBpbWfjgYvjgonjgrjjgqrjg6Hjg4jjg6rjgpLkvZzmiJDjgZnjgotcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdlb21ldHJ5RnJvbUltYWdlKGltYWdlKSB7XHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3ID0gdGV4dHVyZUZpbGVzLmF1dGhvci50ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoID0gdGV4dHVyZUZpbGVzLmF1dGhvci50ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuICBjYW52YXMud2lkdGggPSB3O1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBoO1xyXG4gIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcclxuICB2YXIgZGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgdywgaCk7XHJcbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcbiAge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdzsgKyt4KSB7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcblxyXG4gICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIHNmZyA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBiID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGEgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICBpZiAoYSAhPSAwKSB7XHJcbiAgICAgICAgICBjb2xvci5zZXRSR0IociAvIDI1NS4wLCBzZmcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKCh4IC0gdyAvIDIuMCkpICogMi4wLCAoKHkgLSBoIC8gMikpICogLTIuMCwgMC4wKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlR2VvbWV0cnkoc2l6ZSlcclxue1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG4gIHZhciBzaXplSGFsZiA9IHNpemUgLyAyO1xyXG4gIC8vIGdlb21ldHJ5LlxyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoLXNpemVIYWxmLCBzaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZUhhbGYsIHNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyhzaXplSGFsZiwgLXNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygtc2l6ZUhhbGYsIC1zaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsIDIsIDEpKTtcclxuICBnZW9tZXRyeS5mYWNlcy5wdXNoKG5ldyBUSFJFRS5GYWNlMygwLCAzLCAyKSk7XHJcbiAgcmV0dXJuIGdlb21ldHJ5O1xyXG59XHJcblxyXG4vLy8g44OG44Kv44K544OB44Oj44O85LiK44Gu5oyH5a6a44K544OX44Op44Kk44OI44GuVVbluqfmqJnjgpLmsYLjgoHjgotcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXh0dXJlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQsIGNlbGxObylcclxue1xyXG4gIHZhciB3aWR0aCA9IHRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IHRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICB2YXIgdUNlbGxDb3VudCA9ICh3aWR0aCAvIGNlbGxXaWR0aCkgfCAwO1xyXG4gIHZhciB2Q2VsbENvdW50ID0gKGhlaWdodCAvIGNlbGxIZWlnaHQpIHwgMDtcclxuICB2YXIgdlBvcyA9IHZDZWxsQ291bnQgLSAoKGNlbGxObyAvIHVDZWxsQ291bnQpIHwgMCk7XHJcbiAgdmFyIHVQb3MgPSBjZWxsTm8gJSB1Q2VsbENvdW50O1xyXG4gIHZhciB1VW5pdCA9IGNlbGxXaWR0aCAvIHdpZHRoOyBcclxuICB2YXIgdlVuaXQgPSBjZWxsSGVpZ2h0IC8gaGVpZ2h0O1xyXG5cclxuICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdLnB1c2goW1xyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MgKyAxKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpXHJcbiAgXSk7XHJcbiAgZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXS5wdXNoKFtcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcykgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KVxyXG4gIF0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleHR1cmUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbE5vKVxyXG57XHJcbiAgdmFyIHdpZHRoID0gdGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gdGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIHZhciB1Q2VsbENvdW50ID0gKHdpZHRoIC8gY2VsbFdpZHRoKSB8IDA7XHJcbiAgdmFyIHZDZWxsQ291bnQgPSAoaGVpZ2h0IC8gY2VsbEhlaWdodCkgfCAwO1xyXG4gIHZhciB2UG9zID0gdkNlbGxDb3VudCAtICgoY2VsbE5vIC8gdUNlbGxDb3VudCkgfCAwKTtcclxuICB2YXIgdVBvcyA9IGNlbGxObyAlIHVDZWxsQ291bnQ7XHJcbiAgdmFyIHVVbml0ID0gY2VsbFdpZHRoIC8gd2lkdGg7XHJcbiAgdmFyIHZVbml0ID0gY2VsbEhlaWdodCAvIGhlaWdodDtcclxuICB2YXIgdXZzID0gZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVswXTtcclxuXHJcbiAgdXZzWzBdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMF0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG4gIHV2c1sxXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1sxXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG4gIHV2c1syXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1syXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcblxyXG4gIHV2cyA9IGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMV07XHJcblxyXG4gIHV2c1swXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzBdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuICB1dnNbMV0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1sxXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG4gIHV2c1syXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1syXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG5cclxuIFxyXG4gIGdlb21ldHJ5LnV2c05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleHR1cmUpXHJcbntcclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0ZXh0dXJlIC8qLGRlcHRoVGVzdDp0cnVlKi8sIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIG1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuRnJvbnRTaWRlO1xyXG4gIG1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbi8vICBtYXRlcmlhbC5cclxuICByZXR1cm4gbWF0ZXJpYWw7XHJcbn1cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcblxyXG4vLyDjgq3jg7zlhaXliptcclxuZXhwb3J0IGNsYXNzIEJhc2ljSW5wdXR7XHJcbmNvbnN0cnVjdG9yICgpIHtcclxuICB0aGlzLmtleUNoZWNrID0geyB1cDogZmFsc2UsIGRvd246IGZhbHNlLCBsZWZ0OiBmYWxzZSwgcmlnaHQ6IGZhbHNlLCB6OiBmYWxzZSAseDpmYWxzZX07XHJcbiAgdGhpcy5rZXlCdWZmZXIgPSBbXTtcclxuICB0aGlzLmtleXVwXyA9IG51bGw7XHJcbiAgdGhpcy5rZXlkb3duXyA9IG51bGw7XHJcbiAgLy90aGlzLmdhbWVwYWRDaGVjayA9IHsgdXA6IGZhbHNlLCBkb3duOiBmYWxzZSwgbGVmdDogZmFsc2UsIHJpZ2h0OiBmYWxzZSwgejogZmFsc2UgLHg6ZmFsc2V9O1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkY29ubmVjdGVkJywoZSk9PntcclxuICAgIHRoaXMuZ2FtZXBhZCA9IGUuZ2FtZXBhZDtcclxuICB9KTtcclxuIFxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkZGlzY29ubmVjdGVkJywoZSk9PntcclxuICAgIGRlbGV0ZSB0aGlzLmdhbWVwYWQ7XHJcbiAgfSk7IFxyXG4gXHJcbiBpZih3aW5kb3cubmF2aWdhdG9yLmdldEdhbWVwYWRzKXtcclxuICAgdGhpcy5nYW1lcGFkID0gd2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcygpWzBdO1xyXG4gfSBcclxufVxyXG5cclxuICBjbGVhcigpXHJcbiAge1xyXG4gICAgZm9yKHZhciBkIGluIHRoaXMua2V5Q2hlY2spe1xyXG4gICAgICB0aGlzLmtleUNoZWNrW2RdID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIH1cclxuICBcclxuICBrZXlkb3duKGUpIHtcclxuICAgIHZhciBlID0gZDMuZXZlbnQ7XHJcbiAgICB2YXIga2V5QnVmZmVyID0gdGhpcy5rZXlCdWZmZXI7XHJcbiAgICB2YXIga2V5Q2hlY2sgPSB0aGlzLmtleUNoZWNrO1xyXG4gICAgdmFyIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgXHJcbiAgICBpZiAoa2V5QnVmZmVyLmxlbmd0aCA+IDE2KSB7XHJcbiAgICAgIGtleUJ1ZmZlci5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoZS5rZXlDb2RlID09IDgwIC8qIFAgKi8pIHtcclxuICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICBzZmcuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNmZy5nYW1lLnJlc3VtZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAgICAgICBcclxuICAgIGtleUJ1ZmZlci5wdXNoKGUua2V5Q29kZSk7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDczOlxyXG4gICAgICBjYXNlIDM4OlxyXG4gICAgICBjYXNlIDEwNDpcclxuICAgICAgICBrZXlDaGVjay51cCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NjpcclxuICAgICAgY2FzZSAzOTpcclxuICAgICAgY2FzZSAxMDI6XHJcbiAgICAgICAga2V5Q2hlY2sucmlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA5MDpcclxuICAgICAgICBrZXlDaGVjay56ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDg4OlxyXG4gICAgICAgIGtleUNoZWNrLnggPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGtleXVwKCkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gZmFsc2U7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3MzpcclxuICAgICAgY2FzZSAzODpcclxuICAgICAgY2FzZSAxMDQ6XHJcbiAgICAgICAga2V5Q2hlY2sudXAgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc2OlxyXG4gICAgICBjYXNlIDM5OlxyXG4gICAgICBjYXNlIDEwMjpcclxuICAgICAgICBrZXlDaGVjay5yaWdodCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgOTA6XHJcbiAgICAgICAga2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgODg6XHJcbiAgICAgICAga2V5Q2hlY2sueCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8v44Kk44OZ44Oz44OI44Gr44OQ44Kk44Oz44OJ44GZ44KLXHJcbiAgYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsdGhpcy5rZXlkb3duLmJpbmQodGhpcykpO1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleXVwLmJhc2ljSW5wdXQnLHRoaXMua2V5dXAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIC8vIOOCouODs+ODkOOCpOODs+ODieOBmeOCi1xyXG4gIHVuYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCB1cCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLnVwIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEyXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdIDwgLTAuMSkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRvd24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5kb3duIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEzXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdID4gMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgbGVmdCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLmxlZnQgfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTRdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMF0gPCAtMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgcmlnaHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5yaWdodCB8fCAodGhpcy5nYW1lcGFkICYmICh0aGlzLmdhbWVwYWQuYnV0dG9uc1sxNV0ucHJlc3NlZCB8fCB0aGlzLmdhbWVwYWQuYXhlc1swXSA+IDAuMSkpO1xyXG4gIH1cclxuICBcclxuICBnZXQgeigpIHtcclxuICAgICBsZXQgcmV0ID0gdGhpcy5rZXlDaGVjay56IFxyXG4gICAgfHwgKCgoIXRoaXMuekJ1dHRvbiB8fCAodGhpcy56QnV0dG9uICYmICF0aGlzLnpCdXR0b24pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLnpCdXR0b24gPSB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCBzdGFydCgpIHtcclxuICAgIGxldCByZXQgPSAoKCF0aGlzLnN0YXJ0QnV0dG9uXyB8fCAodGhpcy5zdGFydEJ1dHRvbl8gJiYgIXRoaXMuc3RhcnRCdXR0b25fKSApICYmIHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkKSA7XHJcbiAgICB0aGlzLnN0YXJ0QnV0dG9uXyA9IHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IGFCdXR0b24oKXtcclxuICAgICBsZXQgcmV0ID0gKCgoIXRoaXMuYUJ1dHRvbl8gfHwgKHRoaXMuYUJ1dHRvbl8gJiYgIXRoaXMuYUJ1dHRvbl8pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLmFCdXR0b25fID0gdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQ7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuICAqdXBkYXRlKHRhc2tJbmRleClcclxuICB7XHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIGlmKHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMpe1xyXG4gICAgICAgIHRoaXMuZ2FtZXBhZCA9IHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVswXTtcclxuICAgICAgfSBcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7ICAgICBcclxuICAgIH1cclxuICB9XHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdmFyIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvXFwuc2ZwZ21yXFwubmV0L2lnKT8nd3d3LnNmcGdtci5uZXQnOidsb2NhbGhvc3QnO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovLycgKyBob3N0ICsgJzo4MDgxL3Rlc3QnKTtcclxuICAgICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kSGlnaFNjb3JlcycsIChkYXRhKT0+e1xyXG4gICAgICAgIGlmKHRoaXMudXBkYXRlSGlnaFNjb3Jlcyl7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRIaWdoU2NvcmUnLCAoZGF0YSk9PntcclxuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZShkYXRhKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZFJhbmsnLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgIHRoaXMudXBkYXRlSGlnaFNjb3JlcyhkYXRhLmhpZ2hTY29yZXMpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvckNvbm5lY3Rpb25NYXgnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgYWxlcnQoJ+WQjOaZguaOpee2muOBruS4iumZkOOBq+mBlOOBl+OBvuOBl+OBn+OAgicpO1xyXG4gICAgICAgIHNlbGYuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHNlbGYuZW5hYmxlKSB7XHJcbiAgICAgICAgICBzZWxmLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgYWxlcnQoJ+OCteODvOODkOODvOaOpee2muOBjOWIh+aWreOBleOCjOOBvuOBl+OBn+OAgicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAvL2FsZXJ0KCdTb2NrZXQuSU/jgYzliKnnlKjjgafjgY3jgarjgYTjgZ/jgoHjgIHjg4/jgqTjgrnjgrPjgqLmg4XloLHjgYzlj5blvpfjgafjgY3jgb7jgZvjgpPjgIInICsgZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHNlbmRTY29yZShzY29yZSlcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnc2VuZFNjb3JlJywgc2NvcmUpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBkaXNjb25uZWN0KClcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcbi8vaW1wb3J0ICogIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqJztcclxuLy9pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcbi8vLyDjg4bjgq3jgrnjg4jlsZ7mgKdcclxuZXhwb3J0IGNsYXNzIFRleHRBdHRyaWJ1dGUge1xyXG4gIGNvbnN0cnVjdG9yKGJsaW5rLCBmb250KSB7XHJcbiAgICBpZiAoYmxpbmspIHtcclxuICAgICAgdGhpcy5ibGluayA9IGJsaW5rO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5ibGluayA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGZvbnQpIHtcclxuICAgICAgdGhpcy5mb250ID0gZm9udDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZm9udCA9IHNmZy50ZXh0dXJlRmlsZXMuZm9udDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg4bjgq3jgrnjg4jjg5fjg6zjg7zjg7NcclxuZXhwb3J0IGNsYXNzIFRleHRQbGFuZXsgXHJcbiAgY29uc3RydWN0b3IgKHNjZW5lKSB7XHJcbiAgdGhpcy50ZXh0QnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdGhpcy5hdHRyQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdGhpcy50ZXh0QmFja0J1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMuYXR0ckJhY2tCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB2YXIgZW5kaSA9IHRoaXMudGV4dEJ1ZmZlci5sZW5ndGg7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmRpOyArK2kpIHtcclxuICAgIHRoaXMudGV4dEJ1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgICB0aGlzLmF0dHJCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy50ZXh0QmFja0J1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgICB0aGlzLmF0dHJCYWNrQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICB9XHJcblxyXG5cclxuICAvLyDmj4/nlLvnlKjjgq3jg6Pjg7Pjg5Djgrnjga7jgrvjg4Pjg4jjgqLjg4Pjg5dcclxuXHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB2YXIgd2lkdGggPSAxO1xyXG4gIHdoaWxlICh3aWR0aCA8PSBzZmcuVklSVFVBTF9XSURUSCl7XHJcbiAgICB3aWR0aCAqPSAyO1xyXG4gIH1cclxuICB2YXIgaGVpZ2h0ID0gMTtcclxuICB3aGlsZSAoaGVpZ2h0IDw9IHNmZy5WSVJUVUFMX0hFSUdIVCl7XHJcbiAgICBoZWlnaHQgKj0gMjtcclxuICB9XHJcbiAgXHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIHRoaXMudGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuY2FudmFzKTtcclxuICB0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICB0aGlzLnRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSxhbHBoYVRlc3Q6MC41LCB0cmFuc3BhcmVudDogdHJ1ZSxkZXB0aFRlc3Q6dHJ1ZSxzaGFkaW5nOlRIUkVFLkZsYXRTaGFkaW5nfSk7XHJcbi8vICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoc2ZnLlZJUlRVQUxfV0lEVEgsIHNmZy5WSVJUVUFMX0hFSUdIVCk7XHJcbiAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHdpZHRoLCBoZWlnaHQpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gMC40O1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gKHdpZHRoIC0gc2ZnLlZJUlRVQUxfV0lEVEgpIC8gMjtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9ICAtIChoZWlnaHQgLSBzZmcuVklSVFVBTF9IRUlHSFQpIC8gMjtcclxuICB0aGlzLmZvbnRzID0geyBmb250OiBzZmcudGV4dHVyZUZpbGVzLmZvbnQsIGZvbnQxOiBzZmcudGV4dHVyZUZpbGVzLmZvbnQxIH07XHJcbiAgdGhpcy5ibGlua0NvdW50ID0gMDtcclxuICB0aGlzLmJsaW5rID0gZmFsc2U7XHJcblxyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5jbHMoKTtcclxuICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxufVxyXG5cclxuICAvLy8g55S76Z2i5raI5Y67XHJcbiAgY2xzKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZGkgPSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoOyBpIDwgZW5kaTsgKytpKSB7XHJcbiAgICAgIHZhciBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW2ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lID0gdGhpcy5hdHRyQnVmZmVyW2ldO1xyXG4gICAgICB2YXIgbGluZV9iYWNrID0gdGhpcy50ZXh0QmFja0J1ZmZlcltpXTtcclxuICAgICAgdmFyIGF0dHJfbGluZV9iYWNrID0gdGhpcy5hdHRyQmFja0J1ZmZlcltpXTtcclxuXHJcbiAgICAgIGZvciAodmFyIGogPSAwLCBlbmRqID0gdGhpcy50ZXh0QnVmZmVyW2ldLmxlbmd0aDsgaiA8IGVuZGo7ICsraikge1xyXG4gICAgICAgIGxpbmVbal0gPSAweDIwO1xyXG4gICAgICAgIGF0dHJfbGluZVtqXSA9IDB4MDA7XHJcbiAgICAgICAgLy9saW5lX2JhY2tbal0gPSAweDIwO1xyXG4gICAgICAgIC8vYXR0cl9saW5lX2JhY2tbal0gPSAweDAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgc2ZnLlZJUlRVQUxfV0lEVEgsIHNmZy5WSVJUVUFMX0hFSUdIVCk7XHJcbiAgfVxyXG5cclxuICAvLy8g5paH5a2X6KGo56S644GZ44KLXHJcbiAgcHJpbnQoeCwgeSwgc3RyLCBhdHRyaWJ1dGUpIHtcclxuICAgIHZhciBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW3ldO1xyXG4gICAgdmFyIGF0dHIgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICBpZiAoIWF0dHJpYnV0ZSkge1xyXG4gICAgICBhdHRyaWJ1dGUgPSAwO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcclxuICAgICAgdmFyIGMgPSBzdHIuY2hhckNvZGVBdChpKTtcclxuICAgICAgaWYgKGMgPT0gMHhhKSB7XHJcbiAgICAgICAgKyt5O1xyXG4gICAgICAgIGlmICh5ID49IHRoaXMudGV4dEJ1ZmZlci5sZW5ndGgpIHtcclxuICAgICAgICAgIC8vIOOCueOCr+ODreODvOODq1xyXG4gICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gdGhpcy50ZXh0QnVmZmVyLnNsaWNlKDEsIHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggLSAxKTtcclxuICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlci5wdXNoKG5ldyBBcnJheShzZmcuVklSVFVBTF9XSURUSCAvIDgpKTtcclxuICAgICAgICAgIHRoaXMuYXR0ckJ1ZmZlciA9IHRoaXMuYXR0ckJ1ZmZlci5zbGljZSgxLCB0aGlzLmF0dHJCdWZmZXIubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICB0aGlzLmF0dHJCdWZmZXIucHVzaChuZXcgQXJyYXkoc2ZnLlZJUlRVQUxfV0lEVEggLyA4KSk7XHJcbiAgICAgICAgICAtLXk7XHJcbiAgICAgICAgICB2YXIgZW5kaiA9IHRoaXMudGV4dEJ1ZmZlclt5XS5sZW5ndGg7XHJcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGVuZGo7ICsraikge1xyXG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXJbeV1bal0gPSAweDIwO1xyXG4gICAgICAgICAgICB0aGlzLmF0dHJCdWZmZXJbeV1bal0gPSAweDAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW3ldO1xyXG4gICAgICAgIGF0dHIgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICAgICAgeCA9IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGluZVt4XSA9IGM7XHJcbiAgICAgICAgYXR0clt4XSA9IGF0dHJpYnV0ZTtcclxuICAgICAgICArK3g7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLy8vIOODhuOCreOCueODiOODh+ODvOOCv+OCkuOCguOBqOOBq+ODhuOCr+OCueODgeODo+ODvOOBq+aPj+eUu+OBmeOCi1xyXG4gIHJlbmRlcigpIHtcclxuICAgIHZhciBjdHggPSB0aGlzLmN0eDtcclxuICAgIHRoaXMuYmxpbmtDb3VudCA9ICh0aGlzLmJsaW5rQ291bnQgKyAxKSAmIDB4ZjtcclxuXHJcbiAgICB2YXIgZHJhd19ibGluayA9IGZhbHNlO1xyXG4gICAgaWYgKCF0aGlzLmJsaW5rQ291bnQpIHtcclxuICAgICAgdGhpcy5ibGluayA9ICF0aGlzLmJsaW5rO1xyXG4gICAgICBkcmF3X2JsaW5rID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciB1cGRhdGUgPSBmYWxzZTtcclxuLy8gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBDT05TT0xFX1dJRFRILCBDT05TT0xFX0hFSUdIVCk7XHJcbi8vICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgZm9yICh2YXIgeSA9IDAsIGd5ID0gMDsgeSA8IHNmZy5URVhUX0hFSUdIVDsgKyt5LCBneSArPSBzZmcuQUNUVUFMX0NIQVJfU0laRSkge1xyXG4gICAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgICAgdmFyIGF0dHJfbGluZSA9IHRoaXMuYXR0ckJ1ZmZlclt5XTtcclxuICAgICAgdmFyIGxpbmVfYmFjayA9IHRoaXMudGV4dEJhY2tCdWZmZXJbeV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmVfYmFjayA9IHRoaXMuYXR0ckJhY2tCdWZmZXJbeV07XHJcbiAgICAgIGZvciAodmFyIHggPSAwLCBneCA9IDA7IHggPCBzZmcuVEVYVF9XSURUSDsgKyt4LCBneCArPSBzZmcuQUNUVUFMX0NIQVJfU0laRSkge1xyXG4gICAgICAgIHZhciBwcm9jZXNzX2JsaW5rID0gKGF0dHJfbGluZVt4XSAmJiBhdHRyX2xpbmVbeF0uYmxpbmspO1xyXG4gICAgICAgIGlmIChsaW5lW3hdICE9IGxpbmVfYmFja1t4XSB8fCBhdHRyX2xpbmVbeF0gIT0gYXR0cl9saW5lX2JhY2tbeF0gfHwgKHByb2Nlc3NfYmxpbmsgJiYgZHJhd19ibGluaykpIHtcclxuICAgICAgICAgIHVwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgbGluZV9iYWNrW3hdID0gbGluZVt4XTtcclxuICAgICAgICAgIGF0dHJfbGluZV9iYWNrW3hdID0gYXR0cl9saW5lW3hdO1xyXG4gICAgICAgICAgdmFyIGMgPSAwO1xyXG4gICAgICAgICAgaWYgKCFwcm9jZXNzX2JsaW5rIHx8IHRoaXMuYmxpbmspIHtcclxuICAgICAgICAgICAgYyA9IGxpbmVbeF0gLSAweDIwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdmFyIHlwb3MgPSAoYyA+PiA0KSA8PCAzO1xyXG4gICAgICAgICAgdmFyIHhwb3MgPSAoYyAmIDB4ZikgPDwgMztcclxuICAgICAgICAgIGN0eC5jbGVhclJlY3QoZ3gsIGd5LCBzZmcuQUNUVUFMX0NIQVJfU0laRSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUpO1xyXG4gICAgICAgICAgdmFyIGZvbnQgPSBhdHRyX2xpbmVbeF0gPyBhdHRyX2xpbmVbeF0uZm9udCA6IHNmZy50ZXh0dXJlRmlsZXMuZm9udDtcclxuICAgICAgICAgIGlmIChjKSB7XHJcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoZm9udC5pbWFnZSwgeHBvcywgeXBvcywgc2ZnLkNIQVJfU0laRSwgc2ZnLkNIQVJfU0laRSwgZ3gsIGd5LCBzZmcuQUNUVUFMX0NIQVJfU0laRSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdXBkYXRlO1xyXG4gIH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb2xsaXNpb25BcmVhIHtcclxuICBjb25zdHJ1Y3RvcihvZmZzZXRYLCBvZmZzZXRZLCB3aWR0aCwgaGVpZ2h0KVxyXG4gIHtcclxuICAgIHRoaXMub2Zmc2V0WCA9IG9mZnNldFggfHwgMDtcclxuICAgIHRoaXMub2Zmc2V0WSA9IG9mZnNldFkgfHwgMDtcclxuICAgIHRoaXMudG9wID0gMDtcclxuICAgIHRoaXMuYm90dG9tID0gMDtcclxuICAgIHRoaXMubGVmdCA9IDA7XHJcbiAgICB0aGlzLnJpZ2h0ID0gMDtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aCB8fCAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgIHRoaXMud2lkdGhfID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0XyA9IDA7XHJcbiAgfVxyXG4gIGdldCB3aWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGhfOyB9XHJcbiAgc2V0IHdpZHRoKHYpIHtcclxuICAgIHRoaXMud2lkdGhfID0gdjtcclxuICAgIHRoaXMubGVmdCA9IHRoaXMub2Zmc2V0WCAtIHYgLyAyO1xyXG4gICAgdGhpcy5yaWdodCA9IHRoaXMub2Zmc2V0WCArIHYgLyAyO1xyXG4gIH1cclxuICBnZXQgaGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHRfOyB9XHJcbiAgc2V0IGhlaWdodCh2KSB7XHJcbiAgICB0aGlzLmhlaWdodF8gPSB2O1xyXG4gICAgdGhpcy50b3AgPSB0aGlzLm9mZnNldFkgKyB2IC8gMjtcclxuICAgIHRoaXMuYm90dG9tID0gdGhpcy5vZmZzZXRZIC0gdiAvIDI7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3IoeCwgeSwgeikge1xyXG4gICAgdGhpcy54XyA9IHggfHwgMDtcclxuICAgIHRoaXMueV8gPSB5IHx8IDA7XHJcbiAgICB0aGlzLnpfID0geiB8fCAwLjA7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgIHRoaXMud2lkdGggPSAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSAwO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhID0gbmV3IENvbGxpc2lvbkFyZWEoKTtcclxuICB9XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB2OyB9XHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcbmltcG9ydCAqIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqLmpzJztcclxuaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcy5qcyc7XHJcblxyXG52YXIgbXlCdWxsZXRzID0gW107XHJcblxyXG4vLy8g6Ieq5qmf5by+IFxyXG5leHBvcnQgY2xhc3MgTXlCdWxsZXQgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoMCwgMCwgMCk7XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS53aWR0aCA9IDQ7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDY7XHJcbiAgdGhpcy5zcGVlZCA9IDg7XHJcbiAgdGhpcy5wb3dlciA9IDE7XHJcblxyXG4gIHRoaXMudGV4dHVyZVdpZHRoID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2Uud2lkdGg7XHJcbiAgdGhpcy50ZXh0dXJlSGVpZ2h0ID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcblxyXG4gIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLCAxNiwgMTYsIDEpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdGhpcy54XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMueV87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB0aGlzLnpfO1xyXG4gIHRoaXMuc2UgPSBzZTtcclxuICAvL3NlKDApO1xyXG4gIC8vc2VxdWVuY2VyLnBsYXlUcmFja3Moc291bmRFZmZlY3RzLnNvdW5kRWZmZWN0c1swXSk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgdGhpcy5tZXNoLnZpc2libGUgPSB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAvLyAgc2ZnLnRhc2tzLnB1c2hUYXNrKGZ1bmN0aW9uICh0YXNrSW5kZXgpIHsgc2VsZi5tb3ZlKHRhc2tJbmRleCk7IH0pO1xyXG4gfVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIFxyXG4gICAgd2hpbGUgKHRhc2tJbmRleCA+PSAwIFxyXG4gICAgICAmJiB0aGlzLmVuYWJsZV9cclxuICAgICAgJiYgdGhpcy55IDw9IChzZmcuVl9UT1AgKyAxNikgXHJcbiAgICAgICYmIHRoaXMueSA+PSAoc2ZnLlZfQk9UVE9NIC0gMTYpIFxyXG4gICAgICAmJiB0aGlzLnggPD0gKHNmZy5WX1JJR0hUICsgMTYpIFxyXG4gICAgICAmJiB0aGlzLnggPj0gKHNmZy5WX0xFRlQgLSAxNikpXHJcbiAgICB7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnkgKz0gdGhpcy5keTtcclxuICAgICAgdGhpcy54ICs9IHRoaXMuZHg7XHJcbiAgICAgIFxyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuXHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG59XHJcblxyXG4gIHN0YXJ0KHgsIHksIHosIGFpbVJhZGlhbixwb3dlcikge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMueiA9IHogLSAwLjE7XHJcbiAgICB0aGlzLnBvd2VyID0gcG93ZXIgfCAxO1xyXG4gICAgdGhpcy5keCA9IE1hdGguY29zKGFpbVJhZGlhbikgKiB0aGlzLnNwZWVkO1xyXG4gICAgdGhpcy5keSA9IE1hdGguc2luKGFpbVJhZGlhbikgKiB0aGlzLnNwZWVkO1xyXG4gICAgdGhpcy5lbmFibGVfID0gdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy5zZSgwKTtcclxuICAgIC8vc2VxdWVuY2VyLnBsYXlUcmFja3Moc291bmRFZmZlY3RzLnNvdW5kRWZmZWN0c1swXSk7XHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g6Ieq5qmf44Kq44OW44K444Kn44Kv44OIXHJcbmV4cG9ydCBjbGFzcyBNeVNoaXAgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmogeyBcclxuICBjb25zdHJ1Y3Rvcih4LCB5LCB6LHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoeCwgeSwgeik7Ly8gZXh0ZW5kXHJcblxyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS53aWR0aCA9IDY7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDg7XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICB0aGlzLnRleHR1cmVXaWR0aCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLndpZHRoO1xyXG4gIHRoaXMudGV4dHVyZUhlaWdodCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLmhlaWdodDtcclxuICB0aGlzLndpZHRoID0gMTY7XHJcbiAgdGhpcy5oZWlnaHQgPSAxNjtcclxuXHJcbiAgLy8g56e75YuV56+E5Zuy44KS5rGC44KB44KLXHJcbiAgdGhpcy50b3AgPSAoc2ZnLlZfVE9QIC0gdGhpcy5oZWlnaHQgLyAyKSB8IDA7XHJcbiAgdGhpcy5ib3R0b20gPSAoc2ZnLlZfQk9UVE9NICsgdGhpcy5oZWlnaHQgLyAyKSB8IDA7XHJcbiAgdGhpcy5sZWZ0ID0gKHNmZy5WX0xFRlQgKyB0aGlzLndpZHRoIC8gMikgfCAwO1xyXG4gIHRoaXMucmlnaHQgPSAoc2ZnLlZfUklHSFQgLSB0aGlzLndpZHRoIC8gMikgfCAwO1xyXG5cclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLpcclxuICAvLyDjg57jg4bjg6rjgqLjg6vjga7kvZzmiJBcclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbChzZmcudGV4dHVyZUZpbGVzLm15c2hpcCk7XHJcbiAgLy8g44K444Kq44Oh44OI44Oq44Gu5L2c5oiQXHJcbiAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkodGhpcy53aWR0aCk7XHJcbiAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCk7XHJcblxyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdGhpcy54XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMueV87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB0aGlzLnpfO1xyXG4gIHRoaXMucmVzdCA9IDM7XHJcbiAgdGhpcy5teUJ1bGxldHMgPSAoICgpPT4ge1xyXG4gICAgdmFyIGFyciA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyOyArK2kpIHtcclxuICAgICAgYXJyLnB1c2gobmV3IE15QnVsbGV0KHRoaXMuc2NlbmUsdGhpcy5zZSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFycjtcclxuICB9KSgpO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIFxyXG4gIHRoaXMuYnVsbGV0UG93ZXIgPSAxO1xyXG5cclxufVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gIFxyXG4gIHNob290KGFpbVJhZGlhbikge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMubXlCdWxsZXRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLm15QnVsbGV0c1tpXS5zdGFydCh0aGlzLngsIHRoaXMueSAsIHRoaXMueixhaW1SYWRpYW4sdGhpcy5idWxsZXRQb3dlcikpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBhY3Rpb24oYmFzaWNJbnB1dCkge1xyXG4gICAgaWYgKGJhc2ljSW5wdXQubGVmdCkge1xyXG4gICAgICBpZiAodGhpcy54ID4gdGhpcy5sZWZ0KSB7XHJcbiAgICAgICAgdGhpcy54IC09IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5yaWdodCkge1xyXG4gICAgICBpZiAodGhpcy54IDwgdGhpcy5yaWdodCkge1xyXG4gICAgICAgIHRoaXMueCArPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQudXApIHtcclxuICAgICAgaWYgKHRoaXMueSA8IHRoaXMudG9wKSB7XHJcbiAgICAgICAgdGhpcy55ICs9IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5kb3duKSB7XHJcbiAgICAgIGlmICh0aGlzLnkgPiB0aGlzLmJvdHRvbSkge1xyXG4gICAgICAgIHRoaXMueSAtPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LnopIHtcclxuICAgICAgYmFzaWNJbnB1dC5rZXlDaGVjay56ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc2hvb3QoMC41ICogTWF0aC5QSSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQueCkge1xyXG4gICAgICBiYXNpY0lucHV0LmtleUNoZWNrLnggPSBmYWxzZTtcclxuICAgICAgdGhpcy5zaG9vdCgxLjUgKiBNYXRoLlBJKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHNmZy5ib21icy5zdGFydCh0aGlzLngsIHRoaXMueSwgMC4yKTtcclxuICAgIHRoaXMuc2UoNCk7XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLm15QnVsbGV0cy5mb3JFYWNoKChkKT0+e1xyXG4gICAgICBpZihkLmVuYWJsZV8pe1xyXG4gICAgICAgIHdoaWxlKCFzZmcudGFza3MuYXJyYXlbZC50YXNrLmluZGV4XS5nZW5JbnN0Lm5leHQoLSgxICsgZC50YXNrLmluZGV4KSkuZG9uZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBpbml0KCl7XHJcbiAgICAgIHRoaXMueCA9IDA7XHJcbiAgICAgIHRoaXMueSA9IC0xMDA7XHJcbiAgICAgIHRoaXMueiA9IDAuMTtcclxuICAgICAgdGhpcy5yZXN0ID0gMztcclxuICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqLmpzJztcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MuanMnO1xyXG5cclxuLy8vIOaVteW8vlxyXG5leHBvcnQgY2xhc3MgRW5lbXlCdWxsZXQgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSkge1xyXG4gICAgc3VwZXIoMCwgMCwgMCk7XHJcbiAgICB0aGlzLk5PTkUgPSAwO1xyXG4gICAgdGhpcy5NT1ZFID0gMTtcclxuICAgIHRoaXMuQk9NQiA9IDI7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSAyO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDI7XHJcbiAgICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5lbmVteTtcclxuICAgIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleCk7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIHRoaXMueiA9IDAuMDtcclxuICAgIHRoaXMubXZQYXR0ZXJuID0gbnVsbDtcclxuICAgIHRoaXMubXYgPSBudWxsO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMudHlwZSA9IG51bGw7XHJcbiAgICB0aGlzLmxpZmUgPSAwO1xyXG4gICAgdGhpcy5keCA9IDA7XHJcbiAgICB0aGlzLmR5ID0gMDtcclxuICAgIHRoaXMuc3BlZWQgPSAyLjA7XHJcbiAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5oaXRfID0gbnVsbDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgICB0aGlzLnNlID0gc2U7XHJcbiAgfVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBnZXQgZW5hYmxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW5hYmxlXztcclxuICB9XHJcbiAgXHJcbiAgc2V0IGVuYWJsZSh2KSB7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB2O1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSB2O1xyXG4gIH1cclxuICBcclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIGZvcig7dGhpcy54ID49IChzZmcuVl9MRUZUIC0gMTYpICYmXHJcbiAgICAgICAgdGhpcy54IDw9IChzZmcuVl9SSUdIVCArIDE2KSAmJlxyXG4gICAgICAgIHRoaXMueSA+PSAoc2ZnLlZfQk9UVE9NIC0gMTYpICYmXHJcbiAgICAgICAgdGhpcy55IDw9IChzZmcuVl9UT1AgKyAxNikgJiYgdGFza0luZGV4ID49IDA7XHJcbiAgICAgICAgdGhpcy54ICs9IHRoaXMuZHgsdGhpcy55ICs9IHRoaXMuZHkpXHJcbiAgICB7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZih0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgfVxyXG4gICBcclxuICBzdGFydCh4LCB5LCB6KSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy54ID0geCB8fCAwO1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG4gICAgdGhpcy56ID0geiB8fCAwO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuTk9ORSlcclxuICAgIHtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTU9WRTtcclxuICAgIHZhciBhaW1SYWRpYW4gPSBNYXRoLmF0YW4yKHNmZy5teXNoaXBfLnkgLSB5LCBzZmcubXlzaGlwXy54IC0geCk7XHJcbiAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IGFpbVJhZGlhbjtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhhaW1SYWRpYW4pICogKHRoaXMuc3BlZWQgKyBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4oYWltUmFkaWFuKSAqICh0aGlzLnNwZWVkICsgc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4vLyAgICBjb25zb2xlLmxvZygnZHg6JyArIHRoaXMuZHggKyAnIGR5OicgKyB0aGlzLmR5KTtcclxuXHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRoaXMudGFzay5pbmRleCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRW5lbXlCdWxsZXRzIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ4OyArK2kpIHtcclxuICAgICAgdGhpcy5lbmVteUJ1bGxldHMucHVzaChuZXcgRW5lbXlCdWxsZXQodGhpcy5zY2VuZSwgc2UpKTtcclxuICAgIH1cclxuICB9XHJcbiAgc3RhcnQoeCwgeSwgeikge1xyXG4gICAgdmFyIGVicyA9IHRoaXMuZW5lbXlCdWxsZXRzO1xyXG4gICAgZm9yKHZhciBpID0gMCxlbmQgPSBlYnMubGVuZ3RoO2k8IGVuZDsrK2kpe1xyXG4gICAgICBpZighZWJzW2ldLmVuYWJsZSl7XHJcbiAgICAgICAgZWJzW2ldLnN0YXJ0KHgsIHksIHopO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KClcclxuICB7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cy5mb3JFYWNoKChkLGkpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlKXtcclxuICAgICAgICB3aGlsZSghc2ZnLnRhc2tzLmFycmF5W2QudGFzay5pbmRleF0uZ2VuSW5zdC5uZXh0KC0oMSArIGQudGFzay5pbmRleCkpLmRvbmUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXjgq3jg6Pjg6njga7li5XjgY0gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8g55u057ea6YGL5YuVXHJcbmNsYXNzIExpbmVNb3ZlIHtcclxuICBjb25zdHJ1Y3RvcihyYWQsIHNwZWVkLCBzdGVwKSB7XHJcbiAgICB0aGlzLnJhZCA9IHJhZDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcclxuICAgIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLmN1cnJlbnRTdGVwID0gc3RlcDtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhyYWQpICogc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG4gIH1cclxuICBcclxuICAqbW92ZShzZWxmLHgseSkgXHJcbiAge1xyXG4gICAgXHJcbiAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgIHNlbGYuY2hhclJhZCA9IE1hdGguUEkgLSAodGhpcy5yYWQgLSBNYXRoLlBJIC8gMik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLmNoYXJSYWQgPSB0aGlzLnJhZCAtIE1hdGguUEkgLyAyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZHkgPSB0aGlzLmR5O1xyXG4gICAgbGV0IGR4ID0gdGhpcy5keDtcclxuICAgIGNvbnN0IHN0ZXAgPSB0aGlzLnN0ZXA7XHJcbiAgICBcclxuICAgIGlmKHNlbGYueHJldil7XHJcbiAgICAgIGR4ID0gLWR4OyAgICAgIFxyXG4gICAgfVxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgZm9yKGxldCBpID0gMDtpIDwgc3RlcCAmJiAhY2FuY2VsOysraSl7XHJcbiAgICAgIHNlbGYueCArPSBkeDtcclxuICAgICAgc2VsZi55ICs9IGR5O1xyXG4gICAgICBjYW5jZWwgPSB5aWVsZDtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2xvbmUoKXtcclxuICAgIHJldHVybiBuZXcgTGluZU1vdmUodGhpcy5yYWQsdGhpcy5zcGVlZCx0aGlzLnN0ZXApO1xyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbXHJcbiAgICAgIFwiTGluZU1vdmVcIixcclxuICAgICAgdGhpcy5yYWQsXHJcbiAgICAgIHRoaXMuc3BlZWQsXHJcbiAgICAgIHRoaXMuc3RlcFxyXG4gICAgXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhcnJheSlcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IExpbmVNb3ZlKGFycmF5WzFdLGFycmF5WzJdLGFycmF5WzNdKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDlhobpgYvli5VcclxuY2xhc3MgQ2lyY2xlTW92ZSB7XHJcbiAgY29uc3RydWN0b3Ioc3RhcnRSYWQsIHN0b3BSYWQsIHIsIHNwZWVkLCBsZWZ0KSB7XHJcbiAgICB0aGlzLnN0YXJ0UmFkID0gKHN0YXJ0UmFkIHx8IDApO1xyXG4gICAgdGhpcy5zdG9wUmFkID0gIChzdG9wUmFkIHx8IDEuMCk7XHJcbiAgICB0aGlzLnIgPSByIHx8IDEwMDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZCB8fCAxLjA7XHJcbiAgICB0aGlzLmxlZnQgPSAhbGVmdCA/IGZhbHNlIDogdHJ1ZTtcclxuICAgIHRoaXMuZGVsdGFzID0gW107XHJcbiAgICB0aGlzLnN0YXJ0UmFkXyA9IHRoaXMuc3RhcnRSYWQgKiBNYXRoLlBJO1xyXG4gICAgdGhpcy5zdG9wUmFkXyA9IHRoaXMuc3RvcFJhZCAqIE1hdGguUEk7XHJcbiAgICBsZXQgcmFkID0gdGhpcy5zdGFydFJhZF87XHJcbiAgICBsZXQgc3RlcCA9IChsZWZ0ID8gMSA6IC0xKSAqIHRoaXMuc3BlZWQgLyByO1xyXG4gICAgbGV0IGVuZCA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB3aGlsZSAoIWVuZCkge1xyXG4gICAgICByYWQgKz0gc3RlcDtcclxuICAgICAgaWYgKChsZWZ0ICYmIChyYWQgPj0gdGhpcy5zdG9wUmFkXykpIHx8ICghbGVmdCAmJiByYWQgPD0gdGhpcy5zdG9wUmFkXykpIHtcclxuICAgICAgICByYWQgPSB0aGlzLnN0b3BSYWRfO1xyXG4gICAgICAgIGVuZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5kZWx0YXMucHVzaCh7XHJcbiAgICAgICAgeDogdGhpcy5yICogTWF0aC5jb3MocmFkKSxcclxuICAgICAgICB5OiB0aGlzLnIgKiBNYXRoLnNpbihyYWQpLFxyXG4gICAgICAgIHJhZDogcmFkXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIFxyXG4gICptb3ZlKHNlbGYseCx5KSB7XHJcbiAgICAvLyDliJ3mnJ/ljJZcclxuICAgIGxldCBzeCxzeTtcclxuICAgIGlmIChzZWxmLnhyZXYpIHtcclxuICAgICAgc3ggPSB4IC0gdGhpcy5yICogTWF0aC5jb3ModGhpcy5zdGFydFJhZF8gKyBNYXRoLlBJKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN4ID0geCAtIHRoaXMuciAqIE1hdGguY29zKHRoaXMuc3RhcnRSYWRfKTtcclxuICAgIH1cclxuICAgIHN5ID0geSAtIHRoaXMuciAqIE1hdGguc2luKHRoaXMuc3RhcnRSYWRfKTtcclxuXHJcbiAgICBsZXQgY2FuY2VsID0gZmFsc2U7XHJcbiAgICAvLyDnp7vli5VcclxuICAgIGZvcihsZXQgaSA9IDAsZSA9IHRoaXMuZGVsdGFzLmxlbmd0aDsoaSA8IGUpICYmICFjYW5jZWw7KytpKVxyXG4gICAge1xyXG4gICAgICB2YXIgZGVsdGEgPSB0aGlzLmRlbHRhc1tpXTtcclxuICAgICAgaWYoc2VsZi54cmV2KXtcclxuICAgICAgICBzZWxmLnggPSBzeCAtIGRlbHRhLng7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2VsZi54ID0gc3ggKyBkZWx0YS54O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzZWxmLnkgPSBzeSArIGRlbHRhLnk7XHJcbiAgICAgIGlmIChzZWxmLnhyZXYpIHtcclxuICAgICAgICBzZWxmLmNoYXJSYWQgPSAoTWF0aC5QSSAtIGRlbHRhLnJhZCkgKyAodGhpcy5sZWZ0ID8gLTEgOiAwKSAqIE1hdGguUEk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2VsZi5jaGFyUmFkID0gZGVsdGEucmFkICsgKHRoaXMubGVmdCA/IDAgOiAtMSkgKiBNYXRoLlBJO1xyXG4gICAgICB9XHJcbiAgICAgIHNlbGYucmFkID0gZGVsdGEucmFkO1xyXG4gICAgICBjYW5jZWwgPSB5aWVsZDtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gWyAnQ2lyY2xlTW92ZScsXHJcbiAgICAgIHRoaXMuc3RhcnRSYWQsXHJcbiAgICAgIHRoaXMuc3RvcFJhZCxcclxuICAgICAgdGhpcy5yLFxyXG4gICAgICB0aGlzLnNwZWVkLFxyXG4gICAgICB0aGlzLmxlZnRcclxuICAgIF07XHJcbiAgfVxyXG4gIFxyXG4gIGNsb25lKCl7XHJcbiAgICByZXR1cm4gbmV3IENpcmNsZU1vdmUodGhpcy5zdGFydFJhZCx0aGlzLnN0b3BSYWQsdGhpcy5yLHRoaXMuc3BlZWQsdGhpcy5sZWZ0KTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKXtcclxuICAgIHJldHVybiBuZXcgQ2lyY2xlTW92ZShhWzFdLGFbMl0sYVszXSxhWzRdLGFbNV0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBq+aIu+OCi1xyXG5jbGFzcyBHb3RvSG9tZSB7XHJcblxyXG4gKm1vdmUoc2VsZiwgeCwgeSkge1xyXG4gICAgbGV0IHJhZCA9IE1hdGguYXRhbjIoc2VsZi5ob21lWSAtIHNlbGYueSwgc2VsZi5ob21lWCAtIHNlbGYueCk7XHJcbiAgICBsZXQgc3BlZWQgPSA0O1xyXG5cclxuICAgIHNlbGYuY2hhclJhZCA9IHJhZCAtIE1hdGguUEkgLyAyO1xyXG4gICAgbGV0IGR4ID0gTWF0aC5jb3MocmFkKSAqIHNwZWVkO1xyXG4gICAgbGV0IGR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG4gICAgc2VsZi56ID0gMC4wO1xyXG4gICAgXHJcbiAgICBsZXQgY2FuY2VsID0gZmFsc2U7XHJcbiAgICBmb3IoOyhNYXRoLmFicyhzZWxmLnggLSBzZWxmLmhvbWVYKSA+PSAyIHx8IE1hdGguYWJzKHNlbGYueSAtIHNlbGYuaG9tZVkpID49IDIpICYmICFjYW5jZWxcclxuICAgICAgO3NlbGYueCArPSBkeCxzZWxmLnkgKz0gZHkpXHJcbiAgICB7XHJcbiAgICAgIGNhbmNlbCA9IHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGYuY2hhclJhZCA9IDA7XHJcbiAgICBzZWxmLnggPSBzZWxmLmhvbWVYO1xyXG4gICAgc2VsZi55ID0gc2VsZi5ob21lWTtcclxuICAgIGlmIChzZWxmLnN0YXR1cyA9PSBzZWxmLlNUQVJUKSB7XHJcbiAgICAgIHZhciBncm91cElEID0gc2VsZi5ncm91cElEO1xyXG4gICAgICB2YXIgZ3JvdXBEYXRhID0gc2VsZi5lbmVtaWVzLmdyb3VwRGF0YTtcclxuICAgICAgZ3JvdXBEYXRhW2dyb3VwSURdLnB1c2goc2VsZik7XHJcbiAgICAgIHNlbGYuZW5lbWllcy5ob21lRW5lbWllc0NvdW50Kys7XHJcbiAgICB9XHJcbiAgICBzZWxmLnN0YXR1cyA9IHNlbGYuSE9NRTtcclxuICB9XHJcbiAgXHJcbiAgY2xvbmUoKVxyXG4gIHtcclxuICAgIHJldHVybiBuZXcgR290b0hvbWUoKTtcclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gWydHb3RvSG9tZSddO1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUFycmF5KGEpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBHb3RvSG9tZSgpO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbi8vLyDlvoXmqZ/kuK3jga7mlbXjga7li5XjgY1cclxuY2xhc3MgSG9tZU1vdmV7XHJcbiAgY29uc3RydWN0b3IoKXtcclxuICAgIHRoaXMuQ0VOVEVSX1ggPSAwO1xyXG4gICAgdGhpcy5DRU5URVJfWSA9IDEwMDtcclxuICB9XHJcblxyXG4gICptb3ZlKHNlbGYsIHgsIHkpIHtcclxuXHJcbiAgICBsZXQgZHggPSBzZWxmLmhvbWVYIC0gdGhpcy5DRU5URVJfWDtcclxuICAgIGxldCBkeSA9IHNlbGYuaG9tZVkgLSB0aGlzLkNFTlRFUl9ZO1xyXG4gICAgc2VsZi56ID0gLTAuMTtcclxuXHJcbiAgICB3aGlsZShzZWxmLnN0YXR1cyAhPSBzZWxmLkFUVEFDSylcclxuICAgIHtcclxuICAgICAgc2VsZi54ID0gc2VsZi5ob21lWCArIGR4ICogc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTtcclxuICAgICAgc2VsZi55ID0gc2VsZi5ob21lWSArIGR5ICogc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTtcclxuICAgICAgc2VsZi5tZXNoLnNjYWxlLnggPSBzZWxmLmVuZW1pZXMuaG9tZURlbHRhMjtcclxuICAgICAgeWllbGQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZi5tZXNoLnNjYWxlLnggPSAxLjA7XHJcbiAgICBzZWxmLnogPSAwLjA7XHJcblxyXG4gIH1cclxuICBcclxuICBjbG9uZSgpe1xyXG4gICAgcmV0dXJuIG5ldyBIb21lTW92ZSgpO1xyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbJ0hvbWVNb3ZlJ107XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYSlcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEhvbWVNb3ZlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5oyH5a6a44K344O844Kx44Oz44K544Gr56e75YuV44GZ44KLXHJcbmNsYXNzIEdvdG8ge1xyXG4gIGNvbnN0cnVjdG9yKHBvcykgeyB0aGlzLnBvcyA9IHBvczsgfTtcclxuICAqbW92ZShzZWxmLCB4LCB5KSB7XHJcbiAgICBzZWxmLmluZGV4ID0gdGhpcy5wb3MgLSAxO1xyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICdHb3RvJyxcclxuICAgICAgdGhpcy5wb3NcclxuICAgIF07XHJcbiAgfVxyXG4gIFxyXG4gIGNsb25lKCl7XHJcbiAgICByZXR1cm4gbmV3IEdvdG8odGhpcy5wb3MpO1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUFycmF5KGEpe1xyXG4gICAgcmV0dXJuIG5ldyBHb3RvKGFbMV0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOaVteW8vueZuuWwhFxyXG5jbGFzcyBGaXJlIHtcclxuICAqbW92ZShzZWxmLCB4LCB5KSB7XHJcbiAgICBsZXQgZCA9IChzZmcuc3RhZ2Uubm8gLyAyMCkgKiAoIHNmZy5zdGFnZS5kaWZmaWN1bHR5KTtcclxuICAgIGlmIChkID4gMSkgeyBkID0gMS4wO31cclxuICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgZCkge1xyXG4gICAgICBzZWxmLmVuZW1pZXMuZW5lbXlCdWxsZXRzLnN0YXJ0KHNlbGYueCwgc2VsZi55KTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2xvbmUoKXtcclxuICAgIHJldHVybiBuZXcgRmlyZSgpO1xyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbJ0ZpcmUnXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKVxyXG4gIHtcclxuICAgIHJldHVybiBuZXcgRmlyZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOaVteacrOS9k1xyXG5leHBvcnQgY2xhc3MgRW5lbXkgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmogeyBcclxuICBjb25zdHJ1Y3RvcihlbmVtaWVzLHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoMCwgMCwgMCk7XHJcbiAgdGhpcy5OT05FID0gIDAgO1xyXG4gIHRoaXMuU1RBUlQgPSAgMSA7XHJcbiAgdGhpcy5IT01FID0gIDIgO1xyXG4gIHRoaXMuQVRUQUNLID0gIDMgO1xyXG4gIHRoaXMuQk9NQiA9ICA0IDtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSAxMjtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gODtcclxuICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5lbmVteTtcclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgdGhpcy5ncm91cElEID0gMDtcclxuICB0aGlzLnogPSAwLjA7XHJcbiAgdGhpcy5pbmRleCA9IDA7XHJcbiAgdGhpcy5zY29yZSA9IDA7XHJcbiAgdGhpcy5tdlBhdHRlcm4gPSBudWxsO1xyXG4gIHRoaXMubXYgPSBudWxsO1xyXG4gIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgdGhpcy50eXBlID0gbnVsbDtcclxuICB0aGlzLmxpZmUgPSAwO1xyXG4gIHRoaXMudGFzayA9IG51bGw7XHJcbiAgdGhpcy5oaXRfID0gbnVsbDtcclxuICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgdGhpcy5lbmVtaWVzID0gZW5lbWllcztcclxufVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBcclxuICAvLy/mlbXjga7li5XjgY1cclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgd2hpbGUgKHRhc2tJbmRleCA+PSAwKXtcclxuICAgICAgd2hpbGUoIXRoaXMubXYubmV4dCgpLmRvbmUgJiYgdGFza0luZGV4ID49IDApXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLm1lc2guc2NhbGUueCA9IHRoaXMuZW5lbWllcy5ob21lRGVsdGEyO1xyXG4gICAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ID0gdGhpcy5jaGFyUmFkO1xyXG4gICAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYodGFza0luZGV4IDwgMCl7XHJcbiAgICAgICAgdGFza0luZGV4ID0gLSgrK3Rhc2tJbmRleCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgZW5kID0gZmFsc2U7XHJcbiAgICAgIHdoaWxlICghZW5kKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5kZXggPCAodGhpcy5tdlBhdHRlcm4ubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgIHRoaXMuaW5kZXgrKztcclxuICAgICAgICAgIHRoaXMubXYgPSB0aGlzLm12UGF0dGVyblt0aGlzLmluZGV4XS5tb3ZlKHRoaXMsdGhpcy54LHRoaXMueSk7XHJcbiAgICAgICAgICBlbmQgPSAhdGhpcy5tdi5uZXh0KCkuZG9uZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubWVzaC5zY2FsZS54ID0gdGhpcy5lbmVtaWVzLmhvbWVEZWx0YTI7XHJcbiAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ID0gdGhpcy5jaGFyUmFkO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvLy8g5Yid5pyf5YyWXHJcbiAgc3RhcnQoeCwgeSwgeiwgaG9tZVgsIGhvbWVZLCBtdlBhdHRlcm4sIHhyZXYsdHlwZSwgY2xlYXJUYXJnZXQsZ3JvdXBJRCkge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgdHlwZSh0aGlzKTtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0gejtcclxuICAgIHRoaXMueHJldiA9IHhyZXY7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0cnVlO1xyXG4gICAgdGhpcy5ob21lWCA9IGhvbWVYIHx8IDA7XHJcbiAgICB0aGlzLmhvbWVZID0gaG9tZVkgfHwgMDtcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gICAgdGhpcy5ncm91cElEID0gZ3JvdXBJRDtcclxuICAgIHRoaXMubXZQYXR0ZXJuID0gbXZQYXR0ZXJuO1xyXG4gICAgdGhpcy5jbGVhclRhcmdldCA9IGNsZWFyVGFyZ2V0IHx8IHRydWU7XHJcbiAgICB0aGlzLm1lc2gubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KDB4RkZGRkZGKTtcclxuICAgIHRoaXMubXYgPSBtdlBhdHRlcm5bMF0ubW92ZSh0aGlzLHgseSk7XHJcbiAgICAvL3RoaXMubXYuc3RhcnQodGhpcywgeCwgeSk7XHJcbiAgICAvL2lmICh0aGlzLnN0YXR1cyAhPSB0aGlzLk5PTkUpIHtcclxuICAgIC8vICBkZWJ1Z2dlcjtcclxuICAgIC8vfVxyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gICAgdGhpcy50YXNrID0gc2ZnLnRhc2tzLnB1c2hUYXNrKHRoaXMubW92ZS5iaW5kKHRoaXMpLCAxMDAwMCk7XHJcbiAgICAvLyBpZih0aGlzLnRhc2suaW5kZXggPT0gMCl7XHJcbiAgICAvLyAgIGRlYnVnZ2VyO1xyXG4gICAgLy8gfVxyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGhpdChteWJ1bGxldCkge1xyXG4gICAgaWYgKHRoaXMuaGl0XyA9PSBudWxsKSB7XHJcbiAgICAgIGxldCBsaWZlID0gdGhpcy5saWZlO1xyXG4gICAgICB0aGlzLmxpZmUgLT0gbXlidWxsZXQucG93ZXIgfHwgMTtcclxuICAgICAgbXlidWxsZXQucG93ZXIgJiYgKG15YnVsbGV0LnBvd2VyIC09IGxpZmUpOyBcclxuLy8gICAgICB0aGlzLmxpZmUtLTtcclxuICAgICAgaWYgKHRoaXMubGlmZSA8PSAwKSB7XHJcbiAgICAgICAgc2ZnLmJvbWJzLnN0YXJ0KHRoaXMueCwgdGhpcy55KTtcclxuICAgICAgICB0aGlzLnNlKDEpO1xyXG4gICAgICAgIHNmZy5hZGRTY29yZSh0aGlzLnNjb3JlKTtcclxuICAgICAgICBpZiAodGhpcy5jbGVhclRhcmdldCkge1xyXG4gICAgICAgICAgdGhpcy5lbmVtaWVzLmhpdEVuZW1pZXNDb3VudCsrO1xyXG4gICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuU1RBUlQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmVtaWVzLmhvbWVFbmVtaWVzQ291bnQrKztcclxuICAgICAgICAgICAgdGhpcy5lbmVtaWVzLmdyb3VwRGF0YVt0aGlzLmdyb3VwSURdLnB1c2godGhpcyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmVuZW1pZXMuZ3JvdXBEYXRhW3RoaXMuZ3JvdXBJRF0uZ29uZUNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMudGFzay5pbmRleCA9PSAwKXtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdoaXQnLHRoaXMudGFzay5pbmRleCk7XHJcbiAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgICAgICAgc2ZnLnRhc2tzLmFycmF5W3RoaXMudGFzay5pbmRleF0uZ2VuSW5zdC5uZXh0KC0odGhpcy50YXNrLmluZGV4ICsgMSkpO1xyXG4gICAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRoaXMudGFzay5pbmRleCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zZSgyKTtcclxuICAgICAgICB0aGlzLm1lc2gubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KDB4RkY4MDgwKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5oaXRfKG15YnVsbGV0KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBaYWtvKHNlbGYpIHtcclxuICBzZWxmLnNjb3JlID0gNTA7XHJcbiAgc2VsZi5saWZlID0gMTtcclxuICBncmFwaGljcy51cGRhdGVTcHJpdGVVVihzZWxmLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuZW5lbXksIDE2LCAxNiwgNyk7XHJcbn1cclxuXHJcblpha28udG9KU09OID0gZnVuY3Rpb24gKClcclxue1xyXG4gIHJldHVybiAnWmFrbyc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBaYWtvMShzZWxmKSB7XHJcbiAgc2VsZi5zY29yZSA9IDEwMDtcclxuICBzZWxmLmxpZmUgPSAxO1xyXG4gIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHNlbGYubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5lbmVteSwgMTYsIDE2LCA2KTtcclxufVxyXG5cclxuWmFrbzEudG9KU09OID0gZnVuY3Rpb24gKClcclxue1xyXG4gIHJldHVybiAnWmFrbzEnO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gTUJvc3Moc2VsZikge1xyXG4gIHNlbGYuc2NvcmUgPSAzMDA7XHJcbiAgc2VsZi5saWZlID0gMjtcclxuICBzZWxmLm1lc2guYmxlbmRpbmcgPSBUSFJFRS5Ob3JtYWxCbGVuZGluZztcclxuICBncmFwaGljcy51cGRhdGVTcHJpdGVVVihzZWxmLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuZW5lbXksIDE2LCAxNiwgNCk7XHJcbn1cclxuXHJcbk1Cb3NzLnRvSlNPTiA9IGZ1bmN0aW9uICgpXHJcbntcclxuICByZXR1cm4gJ01Cb3NzJztcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBFbmVtaWVze1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSwgZW5lbXlCdWxsZXRzKSB7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IGVuZW15QnVsbGV0cztcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMubmV4dFRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xyXG4gICAgdGhpcy5lbmVtaWVzID0gbmV3IEFycmF5KDApO1xyXG4gICAgdGhpcy5ob21lRGVsdGEyID0gMS4wO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgKytpKSB7XHJcbiAgICAgIHRoaXMuZW5lbWllcy5wdXNoKG5ldyBFbmVteSh0aGlzLCBzY2VuZSwgc2UpKTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgKytpKSB7XHJcbiAgICAgIHRoaXMuZ3JvdXBEYXRhW2ldID0gbmV3IEFycmF5KDApO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdGFydEVuZW15XyhlbmVteSxkYXRhKVxyXG4gIHtcclxuICAgICAgZW5lbXkuc3RhcnQoZGF0YVsxXSwgZGF0YVsyXSwgMCwgZGF0YVszXSwgZGF0YVs0XSwgdGhpcy5tb3ZlUGF0dGVybnNbTWF0aC5hYnMoZGF0YVs1XSldLCBkYXRhWzVdIDwgMCwgZGF0YVs2XSwgZGF0YVs3XSwgZGF0YVs4XSB8fCAwKTtcclxuICB9XHJcbiAgXHJcbiAgc3RhcnRFbmVteShkYXRhKXtcclxuICAgIHZhciBlbmVtaWVzID0gdGhpcy5lbmVtaWVzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGUgPSBlbmVtaWVzLmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgICB2YXIgZW5lbXkgPSBlbmVtaWVzW2ldO1xyXG4gICAgICBpZiAoIWVuZW15LmVuYWJsZV8pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGFydEVuZW15XyhlbmVteSxkYXRhKTtcclxuICAgICAgfVxyXG4gICAgfSAgICBcclxuICB9XHJcbiAgXHJcbiAgc3RhcnRFbmVteUluZGV4ZWQoZGF0YSxpbmRleCl7XHJcbiAgICBsZXQgZW4gPSB0aGlzLmVuZW1pZXNbaW5kZXhdO1xyXG4gICAgaWYoZW4uZW5hYmxlXyl7XHJcbiAgICAgICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2soZW4udGFzay5pbmRleCk7XHJcbiAgICAgICAgZW4uc3RhdHVzID0gZW4uTk9ORTtcclxuICAgICAgICBlbi5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgZW4ubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXJ0RW5lbXlfKGVuLGRhdGEpO1xyXG4gIH1cclxuXHJcbiAgLy8vIOaVtee3qOmaiuOBruWLleOBjeOCkuOCs+ODs+ODiOODreODvOODq+OBmeOCi1xyXG4gIG1vdmUoKSB7XHJcbiAgICB2YXIgY3VycmVudFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lO1xyXG4gICAgdmFyIG1vdmVTZXFzID0gdGhpcy5tb3ZlU2VxcztcclxuICAgIHZhciBsZW4gPSBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXS5sZW5ndGg7XHJcbiAgICAvLyDjg4fjg7zjgr/phY3liJfjgpLjgoLjgajjgavmlbXjgpLnlJ/miJBcclxuICAgIHdoaWxlICh0aGlzLmN1cnJlbnRJbmRleCA8IGxlbikge1xyXG4gICAgICB2YXIgZGF0YSA9IG1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dW3RoaXMuY3VycmVudEluZGV4XTtcclxuICAgICAgdmFyIG5leHRUaW1lID0gdGhpcy5uZXh0VGltZSAhPSBudWxsID8gdGhpcy5uZXh0VGltZSA6IGRhdGFbMF07XHJcbiAgICAgIGlmIChjdXJyZW50VGltZSA+PSAodGhpcy5uZXh0VGltZSArIGRhdGFbMF0pKSB7XHJcbiAgICAgICAgdGhpcy5zdGFydEVuZW15KGRhdGEpO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgbGVuKSB7XHJcbiAgICAgICAgICB0aGlzLm5leHRUaW1lID0gY3VycmVudFRpbWUgKyBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXVt0aGlzLmN1cnJlbnRJbmRleF1bMF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7PjgavmlbXjgYzjgZnjgbnjgabmlbTliJfjgZfjgZ/jgYvnorroqo3jgZnjgovjgIJcclxuICAgIGlmICh0aGlzLmhvbWVFbmVtaWVzQ291bnQgPT0gdGhpcy50b3RhbEVuZW1pZXNDb3VudCAmJiB0aGlzLnN0YXR1cyA9PSB0aGlzLlNUQVJUKSB7XHJcbiAgICAgIC8vIOaVtOWIl+OBl+OBpuOBhOOBn+OCieaVtOWIl+ODouODvOODieOBq+enu+ihjOOBmeOCi+OAglxyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuSE9NRTtcclxuICAgICAgdGhpcy5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDAuNSAqICgyLjAgLSBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Ob44O844Og44Od44K444K344On44Oz44Gn5LiA5a6a5pmC6ZaT5b6F5qmf44GZ44KLXHJcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5IT01FKSB7XHJcbiAgICAgIGlmIChzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lID4gdGhpcy5lbmRUaW1lKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLkFUVEFDSztcclxuICAgICAgICB0aGlzLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgKHNmZy5zdGFnZS5ESUZGSUNVTFRZX01BWCAtIHNmZy5zdGFnZS5kaWZmaWN1bHR5KSAqIDM7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IDA7XHJcbiAgICAgICAgdGhpcy5jb3VudCA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyDmlLvmkoPjgZnjgotcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLkFUVEFDSyAmJiBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lID4gdGhpcy5lbmRUaW1lKSB7XHJcbiAgICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAoc2ZnLnN0YWdlLkRJRkZJQ1VMVFlfTUFYIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpICogMztcclxuICAgICAgdmFyIGdyb3VwRGF0YSA9IHRoaXMuZ3JvdXBEYXRhO1xyXG4gICAgICB2YXIgYXR0YWNrQ291bnQgPSAoMSArIDAuMjUgKiAoc2ZnLnN0YWdlLmRpZmZpY3VsdHkpKSB8IDA7XHJcbiAgICAgIHZhciBncm91cCA9IGdyb3VwRGF0YVt0aGlzLmdyb3VwXTtcclxuXHJcbiAgICAgIGlmICghZ3JvdXAgfHwgZ3JvdXAubGVuZ3RoID09IDApIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gMDtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBncm91cERhdGFbMF07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChncm91cC5sZW5ndGggPiAwICYmIGdyb3VwLmxlbmd0aCA+IGdyb3VwLmdvbmVDb3VudCkge1xyXG4gICAgICAgIGlmICghZ3JvdXAuaW5kZXgpIHtcclxuICAgICAgICAgIGdyb3VwLmluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmdyb3VwKSB7XHJcbiAgICAgICAgICB2YXIgY291bnQgPSAwLCBlbmRnID0gZ3JvdXAubGVuZ3RoO1xyXG4gICAgICAgICAgd2hpbGUgKGNvdW50IDwgZW5kZyAmJiBhdHRhY2tDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIGVuID0gZ3JvdXBbZ3JvdXAuaW5kZXhdO1xyXG4gICAgICAgICAgICBpZiAoZW4uZW5hYmxlXyAmJiBlbi5zdGF0dXMgPT0gZW4uSE9NRSkge1xyXG4gICAgICAgICAgICAgIGVuLnN0YXR1cyA9IGVuLkFUVEFDSztcclxuICAgICAgICAgICAgICAtLWF0dGFja0NvdW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgIGdyb3VwLmluZGV4Kys7XHJcbiAgICAgICAgICAgIGlmIChncm91cC5pbmRleCA+PSBncm91cC5sZW5ndGgpIGdyb3VwLmluZGV4ID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGdyb3VwLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBlbiA9IGdyb3VwW2ldO1xyXG4gICAgICAgICAgICBpZiAoZW4uZW5hYmxlXyAmJiBlbi5zdGF0dXMgPT0gZW4uSE9NRSkge1xyXG4gICAgICAgICAgICAgIGVuLnN0YXR1cyA9IGVuLkFUVEFDSztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ncm91cCsrO1xyXG4gICAgICBpZiAodGhpcy5ncm91cCA+PSB0aGlzLmdyb3VwRGF0YS5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7Pjgafjga7lvoXmqZ/li5XkvZxcclxuICAgIHRoaXMuaG9tZURlbHRhQ291bnQgKz0gMC4wMjU7XHJcbiAgICB0aGlzLmhvbWVEZWx0YSA9IE1hdGguc2luKHRoaXMuaG9tZURlbHRhQ291bnQpICogMC4wODtcclxuICAgIHRoaXMuaG9tZURlbHRhMiA9IDEuMCArIE1hdGguc2luKHRoaXMuaG9tZURlbHRhQ291bnQgKiA4KSAqIDAuMTtcclxuXHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmFyIGVuID0gdGhpcy5lbmVtaWVzW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gICAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKGVuLnRhc2suaW5kZXgpO1xyXG4gICAgICAgIGVuLnN0YXR1cyA9IGVuLk5PTkU7XHJcbiAgICAgICAgZW4uZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgIGVuLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjYWxjRW5lbWllc0NvdW50KCkge1xyXG4gICAgdmFyIHNlcXMgPSB0aGlzLm1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dO1xyXG4gICAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gc2Vxcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBpZiAoc2Vxc1tpXVs3XSkge1xyXG4gICAgICAgIHRoaXMudG90YWxFbmVtaWVzQ291bnQrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLm5leHRUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICAgIHRoaXMudG90YWxFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgdGhpcy5oaXRFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgdGhpcy5ob21lRW5lbWllc0NvdW50ID0gMDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICAgIHZhciBncm91cERhdGEgPSB0aGlzLmdyb3VwRGF0YTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBncm91cERhdGEubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgZ3JvdXBEYXRhW2ldLmxlbmd0aCA9IDA7XHJcbiAgICAgIGdyb3VwRGF0YVtpXS5nb25lQ291bnQgPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBsb2FkUGF0dGVybnMoKXtcclxuICAgIHRoaXMubW92ZVBhdHRlcm5zID0gW107XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzOyAgICBcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgIGQzLmpzb24oJy4vZGF0YS9lbmVteU1vdmVQYXR0ZXJuLmpzb24nLChlcnIsZGF0YSk9PntcclxuICAgICAgICBpZihlcnIpe1xyXG4gICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRhdGEuZm9yRWFjaCgoY29tQXJyYXksaSk9PntcclxuICAgICAgICAgIGxldCBjb20gPSBbXTtcclxuICAgICAgICAgIHRoaXMubW92ZVBhdHRlcm5zLnB1c2goY29tKTtcclxuICAgICAgICAgIGNvbUFycmF5LmZvckVhY2goKGQsaSk9PntcclxuICAgICAgICAgICAgY29tLnB1c2godGhpcy5jcmVhdGVNb3ZlUGF0dGVybkZyb21BcnJheShkKSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgY3JlYXRlTW92ZVBhdHRlcm5Gcm9tQXJyYXkoYXJyKXtcclxuICAgIGxldCBvYmo7XHJcbiAgICBzd2l0Y2goYXJyWzBdKXtcclxuICAgICAgY2FzZSAnTGluZU1vdmUnOlxyXG4gICAgICAgIG9iaiA9IExpbmVNb3ZlLmZyb21BcnJheShhcnIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdDaXJjbGVNb3ZlJzpcclxuICAgICAgICBvYmogPSAgQ2lyY2xlTW92ZS5mcm9tQXJyYXkoYXJyKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnR290b0hvbWUnOlxyXG4gICAgICAgIG9iaiA9ICAgR290b0hvbWUuZnJvbUFycmF5KGFycik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ0hvbWVNb3ZlJzpcclxuICAgICAgICBvYmogPSAgIEhvbWVNb3ZlLmZyb21BcnJheShhcnIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdHb3RvJzpcclxuICAgICAgICBvYmogPSAgIEdvdG8uZnJvbUFycmF5KGFycik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ0ZpcmUnOlxyXG4gICAgICAgIG9iaiA9ICAgRmlyZS5mcm9tQXJyYXkoYXJyKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiBvYmo7XHJcbi8vICAgIHRocm93IG5ldyBFcnJvcignTW92ZVBhdHRlcm4gTm90IEZvdW5kLicpO1xyXG4gIH1cclxuICBcclxuICBsb2FkRm9ybWF0aW9ucygpe1xyXG4gICAgdGhpcy5tb3ZlU2VxcyA9IFtdO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntcclxuICAgICAgZDMuanNvbignLi9kYXRhL2VuZW15Rm9ybWF0aW9uUGF0dGVybi5qc29uJywoZXJyLGRhdGEpPT57XHJcbiAgICAgICAgaWYoZXJyKSByZWplY3QoZXJyKTtcclxuICAgICAgICBkYXRhLmZvckVhY2goKGZvcm0saSk9PntcclxuICAgICAgICAgIGxldCBzdGFnZSA9IFtdO1xyXG4gICAgICAgICAgdGhpcy5tb3ZlU2Vxcy5wdXNoKHN0YWdlKTtcclxuICAgICAgICAgIGZvcm0uZm9yRWFjaCgoZCxpKT0+e1xyXG4gICAgICAgICAgICBkWzZdID0gZ2V0RW5lbXlGdW5jKGRbNl0pO1xyXG4gICAgICAgICAgICBzdGFnZS5wdXNoKGQpO1xyXG4gICAgICAgICAgfSk7ICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbn1cclxuXHJcbnZhciBlbmVteUZ1bmNzID0gbmV3IE1hcChbXHJcbiAgICAgIFtcIlpha29cIixaYWtvXSxcclxuICAgICAgW1wiWmFrbzFcIixaYWtvMV0sXHJcbiAgICAgIFtcIk1Cb3NzXCIsTUJvc3NdXHJcbiAgICBdKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbmVteUZ1bmMoZnVuY05hbWUpXHJcbntcclxuICByZXR1cm4gZW5lbXlGdW5jcy5nZXQoZnVuY05hbWUpO1xyXG59XHJcblxyXG5FbmVtaWVzLnByb3RvdHlwZS50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhpdEVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVFbmVtaWVzQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGEgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGFDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVEZWx0YTIgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ncm91cERhdGEgPSBbXTtcclxuRW5lbWllcy5wcm90b3R5cGUuTk9ORSA9IDAgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5TVEFSVCA9IDEgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5IT01FID0gMiB8IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLkFUVEFDSyA9IDMgfCAwO1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbC5qcyc7IFxyXG5pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmouanMnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzLmpzJztcclxuXHJcblxyXG4vLy8g54iG55m6XHJcbmV4cG9ydCBjbGFzcyBCb21iIGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIFxyXG57XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICAgIHN1cGVyKDAsMCwwKTtcclxuICAgIHZhciB0ZXggPSBzZmcudGV4dHVyZUZpbGVzLmJvbWI7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gICAgbWF0ZXJpYWwuYmxlbmRpbmcgPSBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nO1xyXG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gICAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMTtcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuc2UgPSBzZTtcclxuICAgIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIH1cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBcclxuICBzdGFydCh4LCB5LCB6LCBkZWxheSkge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRlbGF5ID0gZGVsYXkgfCAwO1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLnogPSB6IHwgMC4wMDAwMjtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRydWU7XHJcbiAgICBncmFwaGljcy51cGRhdGVTcHJpdGVVVih0aGlzLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuYm9tYiwgMTYsIDE2LCB0aGlzLmluZGV4KTtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLm1lc2gubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBcclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIFxyXG4gICAgZm9yKCBsZXQgaSA9IDAsZSA9IHRoaXMuZGVsYXk7aSA8IGUgJiYgdGFza0luZGV4ID49IDA7KytpKVxyXG4gICAge1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDsgICAgICBcclxuICAgIH1cclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuXHJcbiAgICBmb3IobGV0IGkgPSAwO2kgPCA3ICYmIHRhc2tJbmRleCA+PSAwOysraSlcclxuICAgIHtcclxuICAgICAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYodGhpcy5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmJvbWIsIDE2LCAxNiwgaSk7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJvbWJzIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHRoaXMuYm9tYnMgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyArK2kpIHtcclxuICAgICAgdGhpcy5ib21icy5wdXNoKG5ldyBCb21iKHNjZW5lLCBzZSkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdGFydCh4LCB5LCB6KSB7XHJcbiAgICB2YXIgYm9tcyA9IHRoaXMuYm9tYnM7XHJcbiAgICB2YXIgY291bnQgPSAzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGJvbXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgaWYgKCFib21zW2ldLmVuYWJsZV8pIHtcclxuICAgICAgICBpZiAoY291bnQgPT0gMikge1xyXG4gICAgICAgICAgYm9tc1tpXS5zdGFydCh4LCB5LCB6LCAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9tc1tpXS5zdGFydCh4ICsgKE1hdGgucmFuZG9tKCkgKiAxNiAtIDgpLCB5ICsgKE1hdGgucmFuZG9tKCkgKiAxNiAtIDgpLCB6LCBNYXRoLnJhbmRvbSgpICogOCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvdW50LS07XHJcbiAgICAgICAgaWYgKCFjb3VudCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLmJvbWJzLmZvckVhY2goKGQpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlXyl7XHJcbiAgICAgICAgd2hpbGUoIXNmZy50YXNrcy5hcnJheVtkLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKDErZC50YXNrLmluZGV4KSkuZG9uZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuIiwiXHJcbmV4cG9ydCB2YXIgc2VxRGF0YSA9IHtcclxuICBuYW1lOiAnVGVzdCcsXHJcbiAgdHJhY2tzOiBbXHJcbi8qICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQxJyxcclxuICAgICAgY2hhbm5lbDogMCxcclxuICAgICAgbW1sOlxyXG4gICAgICBgXHJcbiAgICAgICBzMC4wMSwwLjIsMC4yLDAuMDMgQDIgXHJcbiAgICAgICB0MTQwICBxMzUgdjMwIGwxcjFyMXIxcjEgJGwxNm8zIGNjY2NjY2NjPGdnZ2dhYWJiPiBjY2NjY2NjYzxnZ2dnPmNjPGJiIGItYi1iLWItYi1iLWItYi1mZmZmZ2dnK2crIGcrZytnK2crZytnK2crZytnZ2dnYWFiYiA+XHJcbiAgICAgICAgICAgICBgXHJcbiAgICAgIH0sKi9cclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQxJyxcclxuICAgICAgY2hhbm5lbDogMSxcclxuICAgICAgbW1sOlxyXG4gICAgICBgXHJcbiAgICAgICBzMC4wMSwwLjIsMC4yLDAuMDMgQDIgXHJcbiAgICAgICB0MTYwICBxNTUgdjIwIG8yIGw4ICRiYmJiIGJiYmJcclxuICAgICAgICAgICAgIGBcclxuICAgICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQxJyxcclxuICAgICAgY2hhbm5lbDogMixcclxuICAgICAgbW1sOlxyXG4gICAgICBgXHJcbiAgICAgICBzMC4wMSwwLjIsMC4yLDAuMDUgQDQgXHJcbiAgICAgICB0MTYwICBxNzUgdjIwIG80IGw4ICRbYmQrXTEgW2JkK11bYmQrXSByOFtmKz5jKzxdIHI4W2QrYi1dIHI4W2JkK10yLnI4cjRcclxuICAgICAgICAgICAgIGBcclxuICAgICAgfSxcclxuXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdiYXNlJyxcclxuICAgICAgY2hhbm5lbDogMyxcclxuICAgICAgbW1sOlxyXG4gICAgICBgczAuMDEsMC4wMSwxLjAsMC4wNSBvNSB0MTYwIEAxMCB2NjAgcTIwICRsNGdyZzhnOHJgXHJcbiAgICB9XHJcbiAgICAsXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0NCcsXHJcbiAgICAgIGNoYW5uZWw6IDQsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYHMwLjAxLDAuMDEsMS4wLDAuMDUgbzUgdDE2MCBAMjEgdjYwIHE4MCAkLzpsNHJ2NjBiOC52MzBiMTZybDE2djYwYjhyODovM2w0cmI4LmIxNnJsMTZicjE2YmJgXHJcbiAgICB9XHJcbiAgICAsXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0NScsXHJcbiAgICAgIGNoYW5uZWw6IDUsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYHMwLjAxLDAuMDEsMS4wLDAuMDUgbzUgdDE2MCBAMTEgbDggJCBxMjAgdjYwIHI4YTggcjhhOGBcclxuICAgIH1cclxuICAgICxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQ1JyxcclxuICAgICAgY2hhbm5lbDogNCxcclxuICAgICAgbW1sOlxyXG4gICAgICBgczAuMDEsMC4wMSwxLjAsMC4wNSBvNSB0MTYwIEAyMCBxOTUgJHYyMCBsNCByZ3JnIGBcclxuICAgIH1cclxuICBdXHJcbn07XHJcblxyXG5leHBvcnQgdmFyIHNvdW5kRWZmZWN0RGF0YSA9IFtcclxuICAvLyAwXHJcbiAge1xyXG4gICAgbmFtZTogJycsXHJcbiAgICB0cmFja3M6IFtcclxuICAgICAge1xyXG4gICAgICAgIGNoYW5uZWw6IDEyLFxyXG4gICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgbW1sOiAnczAuMDAwMSwwLjAwMDEsMS4wLDAuMDAxIEA0IHQyNDAgcTEyNyB2NTAgbDEyOCBvOCBjZGVmZ2FiIDwgY2RlZ2FiYmJiJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgY2hhbm5lbDogMTMsXHJcbiAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICBtbWw6ICdzMC4wMDAxLDAuMDAwMSwxLjAsMC4wMDEgQDQgdDI0MCBxMTI3IHY1MCBsMTI4IG83IGNkZWZnYWIgPCBjZGVnYWJiYmInXHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9LFxyXG4gIC8vIDFcclxuICB7XHJcbiAgICBuYW1lOiAnJyxcclxuICAgIHRyYWNrczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgY2hhbm5lbDogMTQsXHJcbiAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICBtbWw6ICdzMC4wMDAxLDAuMDAwMSwxLjAsMC4wMDAxIEA0IHQyMDAgcTEyNyB2NTAgbDY0IG82IGcgYWI8YmFnZmVkY2VnYWI+YmFnZmVkYz5kYmFnZmVkYydcclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgLy8gMiBcclxuICB7XHJcbiAgICBuYW1lOiAnJyxcclxuICAgIHRyYWNrczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgY2hhbm5lbDogMTQsXHJcbiAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICBtbWw6ICdzMC4wMDAxLDAuMDAwMSwxLjAsMC4wMDAxIEA0IHQxNTAgcTEyNyB2NTAgbDEyOCBvNiBjZGVmZ2FiPmNkZWY8Zz5hPmI8YT5nPGY+ZTxlJ1xyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuICAvLyAzIFxyXG4gIHtcclxuICAgIG5hbWU6ICcnLFxyXG4gICAgdHJhY2tzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBjaGFubmVsOiAxNCxcclxuICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgIG1tbDogJ3MwLjAwMDEsMC4wMDAxLDEuMCwwLjAwMDEgQDUgdDIwMCBxMTI3IHY1MCBsNjQgbzYgYzxjPmM8Yz5jPGM+YzwnXHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9LFxyXG4gIC8vIDQgXHJcbiAge1xyXG4gICAgbmFtZTogJycsXHJcbiAgICB0cmFja3M6IFtcclxuICAgICAge1xyXG4gICAgICAgIGNoYW5uZWw6IDE1LFxyXG4gICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgbW1sOiAnczAuMDAwMSwwLjAwMDEsMS4wLDAuMjUgQDggdDEyMCBxMTI3IHY1MCBsMiBvMCBjJ1xyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfVxyXG5dO1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vdmFyIFNUQUdFX01BWCA9IDE7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbC5qcyc7IFxyXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8uanMnO1xyXG4vL2ltcG9ydCAqIGFzIHNvbmcgZnJvbSAnLi9zb25nJztcclxuaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcy5qcyc7XHJcbmltcG9ydCAqIGFzIGlvIGZyb20gJy4vaW8uanMnO1xyXG5pbXBvcnQgKiBhcyBjb21tIGZyb20gJy4vY29tbS5qcyc7XHJcbmltcG9ydCAqIGFzIHRleHQgZnJvbSAnLi90ZXh0LmpzJztcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmouanMnO1xyXG5pbXBvcnQgKiBhcyBteXNoaXAgZnJvbSAnLi9teXNoaXAuanMnO1xyXG5pbXBvcnQgKiBhcyBlbmVtaWVzIGZyb20gJy4vZW5lbWllcy5qcyc7XHJcbmltcG9ydCAqIGFzIGVmZmVjdG9iaiBmcm9tICcuL2VmZmVjdG9iai5qcyc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9ldmVudEVtaXR0ZXIzLmpzJztcclxuaW1wb3J0IHtzZXFEYXRhLHNvdW5kRWZmZWN0RGF0YX0gZnJvbSAnLi9zZXFEYXRhLmpzJztcclxuXHJcblxyXG5jbGFzcyBTY29yZUVudHJ5IHtcclxuICBjb25zdHJ1Y3RvcihuYW1lLCBzY29yZSkge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuc2NvcmUgPSBzY29yZTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5jbGFzcyBTdGFnZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5NQVggPSAxO1xyXG4gICAgdGhpcy5ESUZGSUNVTFRZX01BWCA9IDIuMDtcclxuICAgIHRoaXMubm8gPSAxO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gICAgdGhpcy5kaWZmaWN1bHR5ID0gMTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgICB0aGlzLmRpZmZpY3VsdHkgPSAxO1xyXG4gIH1cclxuXHJcbiAgYWR2YW5jZSgpIHtcclxuICAgIHRoaXMubm8rKztcclxuICAgIHRoaXMucHJpdmF0ZU5vKys7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAganVtcChzdGFnZU5vKSB7XHJcbiAgICB0aGlzLm5vID0gc3RhZ2VObztcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gdGhpcy5ubyAtIDE7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgaWYgKHRoaXMuZGlmZmljdWx0eSA8IHRoaXMuRElGRklDVUxUWV9NQVgpIHtcclxuICAgICAgdGhpcy5kaWZmaWN1bHR5ID0gMSArIDAuMDUgKiAodGhpcy5ubyAtIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnByaXZhdGVObyA+PSB0aGlzLk1BWCkge1xyXG4gICAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgLy8gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsdGhpcyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLkNPTlNPTEVfV0lEVEggPSAwO1xyXG4gICAgdGhpcy5DT05TT0xFX0hFSUdIVCA9IDA7XHJcbiAgICB0aGlzLlJFTkRFUkVSX1BSSU9SSVRZID0gMTAwMDAwIHwgMDtcclxuICAgIHRoaXMucmVuZGVyZXIgPSBudWxsO1xyXG4gICAgdGhpcy5zdGF0cyA9IG51bGw7XHJcbiAgICB0aGlzLnNjZW5lID0gbnVsbDtcclxuICAgIHRoaXMuY2FtZXJhID0gbnVsbDtcclxuICAgIHRoaXMuYXV0aG9yID0gbnVsbDtcclxuICAgIHRoaXMucHJvZ3Jlc3MgPSBudWxsO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUgPSBudWxsO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0ID0gbmV3IGlvLkJhc2ljSW5wdXQoKTtcclxuICAgIHRoaXMudGFza3MgPSBuZXcgdXRpbC5UYXNrcygpO1xyXG4gICAgc2ZnLnNldFRhc2tzKHRoaXMudGFza3MpO1xyXG4gICAgdGhpcy53YXZlR3JhcGggPSBudWxsO1xyXG4gICAgdGhpcy5zdGFydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5iYXNlVGltZSA9IG5ldyBEYXRlO1xyXG4gICAgdGhpcy5kID0gLTAuMjtcclxuICAgIHRoaXMuYXVkaW9fID0gbnVsbDtcclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbnVsbDtcclxuICAgIHRoaXMucGlhbm8gPSBudWxsO1xyXG4gICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICB0aGlzLmhpZ2hTY29yZSA9IDA7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBbXTtcclxuICAgIHRoaXMuaXNIaWRkZW4gPSBmYWxzZTtcclxuICAgIHRoaXMubXlzaGlwXyA9IG51bGw7XHJcbiAgICB0aGlzLmVuZW1pZXMgPSBudWxsO1xyXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSBudWxsO1xyXG4gICAgdGhpcy5QSSA9IE1hdGguUEk7XHJcbiAgICB0aGlzLmNvbW1fID0gbnVsbDtcclxuICAgIHRoaXMuaGFuZGxlTmFtZSA9ICcnO1xyXG4gICAgdGhpcy5zdG9yYWdlID0gbnVsbDtcclxuICAgIHRoaXMucmFuayA9IC0xO1xyXG4gICAgdGhpcy5zb3VuZEVmZmVjdHMgPSBudWxsO1xyXG4gICAgdGhpcy5lbnMgPSBudWxsO1xyXG4gICAgdGhpcy5lbmJzID0gbnVsbDtcclxuICAgIHRoaXMuc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcclxuICAgIHNmZy5zZXRTdGFnZSh0aGlzLnN0YWdlKTtcclxuICAgIHRoaXMudGl0bGUgPSBudWxsOy8vIOOCv+OCpOODiOODq+ODoeODg+OCt+ODpVxyXG4gICAgdGhpcy5zcGFjZUZpZWxkID0gbnVsbDsvLyDlroflrpnnqbrplpPjg5Hjg7zjg4bjgqPjgq/jg6tcclxuICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSBudWxsO1xyXG4gICAgc2ZnLnNldEFkZFNjb3JlKHRoaXMuYWRkU2NvcmUuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmNoZWNrVmlzaWJpbGl0eUFQSSgpO1xyXG4gICAgdGhpcy5hdWRpb18gPSBuZXcgYXVkaW8uQXVkaW8oKTtcclxuICB9XHJcblxyXG4gIGV4ZWMoKSB7XHJcbiAgICBcclxuICAgIGlmICghdGhpcy5jaGVja0Jyb3dzZXJTdXBwb3J0KCcjY29udGVudCcpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbmV3IGF1ZGlvLlNlcXVlbmNlcih0aGlzLmF1ZGlvXyk7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IG5ldyBhdWRpby5Tb3VuZEVmZmVjdHModGhpcy5zZXF1ZW5jZXIsc291bmRFZmZlY3REYXRhKTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlLCB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICBzZmcuc2V0R2FtZVRpbWVyKG5ldyB1dGlsLkdhbWVUaW1lcih0aGlzLmdldEN1cnJlbnRUaW1lLmJpbmQodGhpcykpKTtcclxuXHJcbiAgICAvLy8g44Ky44O844Og44Kz44Oz44K944O844Or44Gu5Yid5pyf5YyWXHJcbiAgICB0aGlzLmluaXRDb25zb2xlKCk7XHJcbiAgICB0aGlzLmxvYWRSZXNvdXJjZXMoKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy5wcm9ncmVzcy5tZXNoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICAgICAgdGhpcy50YXNrcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5iYXNpY0lucHV0LnVwZGF0ZS5iaW5kKHRoaXMuYmFzaWNJbnB1dCkpO1xyXG4gICAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5pbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubWFpbigpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIGNoZWNrVmlzaWJpbGl0eUFQSSgpIHtcclxuICAgIC8vIGhpZGRlbiDjg5fjg63jg5Hjg4bjgqPjgYrjgojjgbPlj6/oppbmgKfjga7lpInmm7TjgqTjg5njg7Pjg4jjga7lkI3liY3jgpLoqK3lrppcclxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQuaGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7IC8vIE9wZXJhIDEyLjEwIOOChCBGaXJlZm94IDE4IOS7pemZjeOBp+OCteODneODvOODiCBcclxuICAgICAgdGhpcy5oaWRkZW4gPSBcImhpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwidmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQubW96SGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJtb3pIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIm1venZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1zSGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJtc0hpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwibXN2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC53ZWJraXRIaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy5oaWRkZW4gPSBcIndlYmtpdEhpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwid2Via2l0dmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBjYWxjU2NyZWVuU2l6ZSgpIHtcclxuICAgIHZhciB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgdmFyIGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgIGlmICh3aWR0aCA+PSBoZWlnaHQpIHtcclxuICAgICAgd2lkdGggPSBoZWlnaHQgKiBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICAgICAgd2hpbGUgKHdpZHRoID4gd2luZG93LmlubmVyV2lkdGgpIHtcclxuICAgICAgICAtLWhlaWdodDtcclxuICAgICAgICB3aWR0aCA9IGhlaWdodCAqIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBoZWlnaHQgPSB3aWR0aCAqIHNmZy5WSVJUVUFMX0hFSUdIVCAvIHNmZy5WSVJUVUFMX1dJRFRIO1xyXG4gICAgICB3aGlsZSAoaGVpZ2h0ID4gd2luZG93LmlubmVySGVpZ2h0KSB7XHJcbiAgICAgICAgLS13aWR0aDtcclxuICAgICAgICBoZWlnaHQgPSB3aWR0aCAqIHNmZy5WSVJUVUFMX0hFSUdIVCAvIHNmZy5WSVJUVUFMX1dJRFRIO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLkNPTlNPTEVfV0lEVEggPSB3aWR0aDtcclxuICAgIHRoaXMuQ09OU09MRV9IRUlHSFQgPSBoZWlnaHQ7XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDjgrPjg7Pjgr3jg7zjg6vnlLvpnaLjga7liJ3mnJ/ljJZcclxuICBpbml0Q29uc29sZShjb25zb2xlQ2xhc3MpIHtcclxuICAgIC8vIOODrOODs+ODgOODqeODvOOBruS9nOaIkFxyXG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHsgYW50aWFsaWFzOiBmYWxzZSwgc29ydE9iamVjdHM6IHRydWUgfSk7XHJcbiAgICB2YXIgcmVuZGVyZXIgPSB0aGlzLnJlbmRlcmVyO1xyXG4gICAgdGhpcy5jYWxjU2NyZWVuU2l6ZSgpO1xyXG4gICAgcmVuZGVyZXIuc2V0U2l6ZSh0aGlzLkNPTlNPTEVfV0lEVEgsIHRoaXMuQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigwLCAxKTtcclxuICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuaWQgPSAnY29uc29sZSc7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LmNsYXNzTmFtZSA9IGNvbnNvbGVDbGFzcyB8fCAnY29uc29sZSc7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLnpJbmRleCA9IDA7XHJcblxyXG5cclxuICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5ub2RlKCkuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgdGhpcy5jYWxjU2NyZWVuU2l6ZSgpO1xyXG4gICAgICByZW5kZXJlci5zZXRTaXplKHRoaXMuQ09OU09MRV9XSURUSCwgdGhpcy5DT05TT0xFX0hFSUdIVCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyDjgrfjg7zjg7Pjga7kvZzmiJBcclxuICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuXHJcbiAgICAvLyDjgqvjg6Hjg6njga7kvZzmiJBcclxuICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDkwLjAsIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSBzZmcuVklSVFVBTF9IRUlHSFQgLyAyO1xyXG4gICAgdGhpcy5jYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuXHJcbiAgICAvLyDjg6njgqTjg4jjga7kvZzmiJBcclxuICAgIC8vdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYpO1xyXG4gICAgLy9saWdodC5wb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKDAuNTc3LCAwLjU3NywgMC41NzcpO1xyXG4gICAgLy9zY2VuZS5hZGQobGlnaHQpO1xyXG5cclxuICAgIC8vdmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmKTtcclxuICAgIC8vc2NlbmUuYWRkKGFtYmllbnQpO1xyXG4gICAgcmVuZGVyZXIuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8vLyDjgqjjg6njg7zjgafntYLkuobjgZnjgovjgIJcclxuICBFeGl0RXJyb3IoZSkge1xyXG4gICAgLy9jdHguZmlsbFN0eWxlID0gXCJyZWRcIjtcclxuICAgIC8vY3R4LmZpbGxSZWN0KDAsIDAsIENPTlNPTEVfV0lEVEgsIENPTlNPTEVfSEVJR0hUKTtcclxuICAgIC8vY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgIC8vY3R4LmZpbGxUZXh0KFwiRXJyb3IgOiBcIiArIGUsIDAsIDIwKTtcclxuICAgIC8vLy9hbGVydChlKTtcclxuICAgIHRoaXMuc3RhcnQgPSBmYWxzZTtcclxuICAgIHRocm93IGU7XHJcbiAgfVxyXG5cclxuICBvblZpc2liaWxpdHlDaGFuZ2UoKSB7XHJcbiAgICB2YXIgaCA9IGRvY3VtZW50W3RoaXMuaGlkZGVuXTtcclxuICAgIHRoaXMuaXNIaWRkZW4gPSBoO1xyXG4gICAgaWYgKGgpIHtcclxuICAgICAgdGhpcy5wYXVzZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yZXN1bWUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBhdXNlKCkge1xyXG4gICAgaWYgKHNmZy5nYW1lVGltZXIuc3RhdHVzID09IHNmZy5nYW1lVGltZXIuU1RBUlQpIHtcclxuICAgICAgc2ZnLmdhbWVUaW1lci5wYXVzZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2VxdWVuY2VyLnN0YXR1cyA9PSB0aGlzLnNlcXVlbmNlci5QTEFZKSB7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLnBhdXNlKCk7XHJcbiAgICB9XHJcbiAgICBzZmcuc2V0UGF1c2UodHJ1ZSk7XHJcbiAgfVxyXG5cclxuICByZXN1bWUoKSB7XHJcbiAgICBpZiAoc2ZnLmdhbWVUaW1lci5zdGF0dXMgPT0gc2ZnLmdhbWVUaW1lci5QQVVTRSkge1xyXG4gICAgICBzZmcuZ2FtZVRpbWVyLnJlc3VtZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2VxdWVuY2VyLnN0YXR1cyA9PSB0aGlzLnNlcXVlbmNlci5QQVVTRSkge1xyXG4gICAgICB0aGlzLnNlcXVlbmNlci5yZXN1bWUoKTtcclxuICAgIH1cclxuICAgIHNmZy5zZXRQYXVzZShmYWxzZSk7XHJcbiAgfVxyXG5cclxuICAvLy8g54++5Zyo5pmC6ZaT44Gu5Y+W5b6XXHJcbiAgZ2V0Q3VycmVudFRpbWUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdWRpb18uYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgfVxyXG5cclxuICAvLy8g44OW44Op44Km44K244Gu5qmf6IO944OB44Kn44OD44KvXHJcbiAgY2hlY2tCcm93c2VyU3VwcG9ydCgpIHtcclxuICAgIHZhciBjb250ZW50ID0gJzxpbWcgY2xhc3M9XCJlcnJvcmltZ1wiIHNyYz1cImh0dHA6Ly9wdWJsaWMuYmx1LmxpdmVmaWxlc3RvcmUuY29tL3kycGJZM2FxQno2d3o0YWg4N1JYRVZrNUNsaEQyTHVqQzVOczY2SEt2Ujg5YWpyRmRMTTBUeEZlcllZVVJ0ODNjX2JnMzVIU2txYzNFOEd4YUZEOC1YOTRNTHNGVjVHVTZCWXAxOTVJdmVnZXZRLzIwMTMxMDAxLnBuZz9wc2lkPTFcIiB3aWR0aD1cIjQ3OVwiIGhlaWdodD1cIjY0MFwiIGNsYXNzPVwiYWxpZ25ub25lXCIgLz4nO1xyXG4gICAgLy8gV2ViR0zjga7jgrXjg53jg7zjg4jjg4Hjgqfjg4Pjgq9cclxuICAgIGlmICghRGV0ZWN0b3Iud2ViZ2wpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYkdM44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXZWIgQXVkaW8gQVBJ44Op44OD44OR44O8XHJcbiAgICBpZiAoIXRoaXMuYXVkaW9fLmVuYWJsZSkge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViIEF1ZGlvIEFQSeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44OW44Op44Km44K244GMUGFnZSBWaXNpYmlsaXR5IEFQSSDjgpLjgrXjg53jg7zjg4jjgZfjgarjgYTloLTlkIjjgavorablkYogXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuaGlkZGVuID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+UGFnZSBWaXNpYmlsaXR5IEFQSeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWIgTG9jYWwgU3RvcmFnZeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiBcclxuICAvLy8g44Ky44O844Og44Oh44Kk44OzXHJcbiAgbWFpbigpIHtcclxuICAgIC8vIOOCv+OCueOCr+OBruWRvOOBs+WHuuOBl1xyXG4gICAgLy8g44Oh44Kk44Oz44Gr5o+P55S7XHJcbiAgICBpZiAodGhpcy5zdGFydCkge1xyXG4gICAgICB0aGlzLnRhc2tzLnByb2Nlc3ModGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBsb2FkUmVzb3VyY2VzKCkge1xyXG4gICAgLy8vIOOCsuODvOODoOS4reOBruODhuOCr+OCueODgeODo+ODvOWumue+qVxyXG4gICAgdmFyIHRleHR1cmVzID0ge1xyXG4gICAgICBmb250OiAnYmFzZS9ncmFwaGljL0ZvbnQucG5nJyxcclxuICAgICAgZm9udDE6ICdiYXNlL2dyYXBoaWMvRm9udDIucG5nJyxcclxuICAgICAgYXV0aG9yOiAnYmFzZS9ncmFwaGljL2F1dGhvci5wbmcnLFxyXG4gICAgICB0aXRsZTogJ2Jhc2UvZ3JhcGhpYy9USVRMRS5wbmcnLFxyXG4gICAgICBteXNoaXA6ICdiYXNlL2dyYXBoaWMvbXlzaGlwMi5wbmcnLFxyXG4gICAgICBlbmVteTogJ2Jhc2UvZ3JhcGhpYy9lbmVteS5wbmcnLFxyXG4gICAgICBib21iOiAnYmFzZS9ncmFwaGljL2JvbWIucG5nJ1xyXG4gICAgfTtcclxuICAgIC8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zjga7jg63jg7zjg4lcclxuICBcclxuICAgIHZhciBsb2FkUHJvbWlzZSA9IHRoaXMuYXVkaW9fLnJlYWREcnVtU2FtcGxlO1xyXG4gICAgdmFyIGxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XHJcbiAgICBmdW5jdGlvbiBsb2FkVGV4dHVyZShzcmMpIHtcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBsb2FkZXIubG9hZChzcmMsICh0ZXh0dXJlKSA9PiB7XHJcbiAgICAgICAgICB0ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICAgICAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICAgICAgICAgIHJlc29sdmUodGV4dHVyZSk7XHJcbiAgICAgICAgfSwgbnVsbCwgKHhocikgPT4geyByZWplY3QoeGhyKSB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRleExlbmd0aCA9IE9iamVjdC5rZXlzKHRleHR1cmVzKS5sZW5ndGg7XHJcbiAgICB2YXIgdGV4Q291bnQgPSAwO1xyXG4gICAgdGhpcy5wcm9ncmVzcyA9IG5ldyBncmFwaGljcy5Qcm9ncmVzcygpO1xyXG4gICAgdGhpcy5wcm9ncmVzcy5tZXNoLnBvc2l0aW9uLnogPSAwLjAwMTtcclxuICAgIHRoaXMucHJvZ3Jlc3MucmVuZGVyKCdMb2FkaW5nIFJlc291Y2VzIC4uLicsIDApO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5wcm9ncmVzcy5tZXNoKTtcclxuICAgIGZvciAodmFyIG4gaW4gdGV4dHVyZXMpIHtcclxuICAgICAgKChuYW1lLCB0ZXhQYXRoKSA9PiB7XHJcbiAgICAgICAgbG9hZFByb21pc2UgPSBsb2FkUHJvbWlzZVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbG9hZFRleHR1cmUoc2ZnLnJlc291cmNlQmFzZSArIHRleFBhdGgpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKCh0ZXgpID0+IHtcclxuICAgICAgICAgICAgdGV4Q291bnQrKztcclxuICAgICAgICAgICAgdGhpcy5wcm9ncmVzcy5yZW5kZXIoJ0xvYWRpbmcgUmVzb3VjZXMgLi4uJywgKHRleENvdW50IC8gdGV4TGVuZ3RoICogMTAwKSB8IDApO1xyXG4gICAgICAgICAgICBzZmcudGV4dHVyZUZpbGVzW25hbWVdID0gdGV4O1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KShuLCB0ZXh0dXJlc1tuXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbG9hZFByb21pc2U7XHJcbiAgfVxyXG5cclxuKnJlbmRlcih0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5yZW5kZXIoKTtcclxuICAgIHRoaXMuc3RhdHMgJiYgdGhpcy5zdGF0cy51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxufVxyXG5cclxuaW5pdEFjdG9ycygpXHJcbntcclxuICBsZXQgcHJvbWlzZXMgPSBbXTtcclxuICB0aGlzLnNjZW5lID0gdGhpcy5zY2VuZSB8fCBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICB0aGlzLmVuZW15QnVsbGV0cyA9IHRoaXMuZW5lbXlCdWxsZXRzIHx8IG5ldyBlbmVtaWVzLkVuZW15QnVsbGV0cyh0aGlzLnNjZW5lLCB0aGlzLnNlLmJpbmQodGhpcykpO1xyXG4gIHRoaXMuZW5lbWllcyA9IHRoaXMuZW5lbWllcyB8fCBuZXcgZW5lbWllcy5FbmVtaWVzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSwgdGhpcy5lbmVteUJ1bGxldHMpO1xyXG4gIHByb21pc2VzLnB1c2godGhpcy5lbmVtaWVzLmxvYWRQYXR0ZXJucygpKTtcclxuICBwcm9taXNlcy5wdXNoKHRoaXMuZW5lbWllcy5sb2FkRm9ybWF0aW9ucygpKTtcclxuICB0aGlzLmJvbWJzID0gdGhpcy5ib21icyB8fCBuZXcgZWZmZWN0b2JqLkJvbWJzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgc2ZnLnNldEJvbWJzKHRoaXMuYm9tYnMpO1xyXG4gIHRoaXMubXlzaGlwXyA9IHRoaXMubXlzaGlwXyB8fCBuZXcgbXlzaGlwLk15U2hpcCgwLCAtMTAwLCAwLjEsIHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgc2ZnLnNldE15U2hpcCh0aGlzLm15c2hpcF8pO1xyXG4gIHRoaXMubXlzaGlwXy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5zcGFjZUZpZWxkID0gbnVsbDtcclxuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG59XHJcblxyXG5pbml0Q29tbUFuZEhpZ2hTY29yZSgpXHJcbntcclxuICAvLyDjg4/jg7Pjg4njg6vjg43jg7zjg6Djga7lj5blvpdcclxuICB0aGlzLmhhbmRsZU5hbWUgPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSgnaGFuZGxlTmFtZScpO1xyXG5cclxuICB0aGlzLnRleHRQbGFuZSA9IG5ldyB0ZXh0LlRleHRQbGFuZSh0aGlzLnNjZW5lKTtcclxuICAvLyB0ZXh0UGxhbmUucHJpbnQoMCwgMCwgXCJXZWIgQXVkaW8gQVBJIFRlc3RcIiwgbmV3IFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIC8vIOOCueOCs+OCouaDheWgsSDpgJrkv6HnlKhcclxuICB0aGlzLmNvbW1fID0gbmV3IGNvbW0uQ29tbSgpO1xyXG4gIHRoaXMuY29tbV8udXBkYXRlSGlnaFNjb3JlcyA9IChkYXRhKSA9PiB7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBkYXRhO1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLmhpZ2hTY29yZXNbMF0uc2NvcmU7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21tXy51cGRhdGVIaWdoU2NvcmUgPSAoZGF0YSkgPT4ge1xyXG4gICAgaWYgKHRoaXMuaGlnaFNjb3JlIDwgZGF0YS5zY29yZSkge1xyXG4gICAgICB0aGlzLmhpZ2hTY29yZSA9IGRhdGEuc2NvcmU7XHJcbiAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbn1cclxuXHJcbippbml0KHRhc2tJbmRleCkge1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB0aGlzLmluaXRDb21tQW5kSGlnaFNjb3JlKCk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgdGhpcy5pbml0QWN0b3JzKClcclxuICAgIC50aGVuKCgpPT57XHJcbiAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5yZW5kZXIuYmluZCh0aGlzKSwgdGhpcy5SRU5ERVJFUl9QUklPUklUWSk7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnByaW50QXV0aG9yLmJpbmQodGhpcykpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vLyDkvZzogIXooajnpLpcclxuKnByaW50QXV0aG9yKHRhc2tJbmRleCkge1xyXG4gIGNvbnN0IHdhaXQgPSA2MDtcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgXHJcbiAgbGV0IG5leHRUYXNrID0gKCk9PntcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMuYXV0aG9yKTtcclxuICAgIC8vc2NlbmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICBcclxuICBsZXQgY2hlY2tLZXlJbnB1dCA9ICgpPT4ge1xyXG4gICAgaWYgKHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID4gMCB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQpIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gICAgICBuZXh0VGFzaygpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9ICBcclxuXHJcbiAgLy8g5Yid5pyf5YyWXHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3ID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSBzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZS5oZWlnaHQ7XHJcbiAgY2FudmFzLndpZHRoID0gdztcclxuICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgY3R4LmRyYXdJbWFnZShzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZSwgMCwgMCk7XHJcbiAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG5cclxuICBnZW9tZXRyeS52ZXJ0X3N0YXJ0ID0gW107XHJcbiAgZ2VvbWV0cnkudmVydF9lbmQgPSBbXTtcclxuXHJcbiAge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdzsgKyt4KSB7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcblxyXG4gICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGcgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYiA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBhID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgaWYgKGEgIT0gMCkge1xyXG4gICAgICAgICAgY29sb3Iuc2V0UkdCKHIgLyAyNTUuMCwgZyAvIDI1NS4wLCBiIC8gMjU1LjApO1xyXG4gICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSksICgoeSAtIGggLyAyKSkgKiAtMSwgMC4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0MiA9IG5ldyBUSFJFRS5WZWN0b3IzKDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwLCAxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCwgMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDApO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9zdGFydC5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHZlcnQyLnggLSB2ZXJ0LngsIHZlcnQyLnkgLSB2ZXJ0LnksIHZlcnQyLnogLSB2ZXJ0LnopKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9lbmQucHVzaCh2ZXJ0KTtcclxuICAgICAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIOODnuODhuODquOCouODq+OCkuS9nOaIkFxyXG4gIC8vdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCdpbWFnZXMvcGFydGljbGUxLnBuZycpO1xyXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7c2l6ZTogMjAsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiBmYWxzZS8vLCBtYXA6IHRleHR1cmVcclxuICB9KTtcclxuXHJcbiAgdGhpcy5hdXRob3IgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgLy8gICAgYXV0aG9yLnBvc2l0aW9uLnggYXV0aG9yLnBvc2l0aW9uLnk9ICA9MC4wLCAwLjAsIDAuMCk7XHJcblxyXG4gIC8vbWVzaC5zb3J0UGFydGljbGVzID0gZmFsc2U7XHJcbiAgLy92YXIgbWVzaDEgPSBuZXcgVEhSRUUuUGFydGljbGVTeXN0ZW0oKTtcclxuICAvL21lc2guc2NhbGUueCA9IG1lc2guc2NhbGUueSA9IDguMDtcclxuXHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5hdXRob3IpOyAgXHJcblxyXG4gXHJcbiAgLy8g5L2c6ICF6KGo56S644K544OG44OD44OX77yRXHJcbiAgZm9yKGxldCBjb3VudCA9IDEuMDtjb3VudCA+IDA7KGNvdW50IDw9IDAuMDEpP2NvdW50IC09IDAuMDAwNTpjb3VudCAtPSAwLjAwMjUpXHJcbiAge1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBlbmQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7XHJcbiAgICBsZXQgdiA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gICAgbGV0IGQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X3N0YXJ0O1xyXG4gICAgbGV0IHYyID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZbaV0ueCA9IHYyW2ldLnggKyBkW2ldLnggKiBjb3VudDtcclxuICAgICAgdltpXS55ID0gdjJbaV0ueSArIGRbaV0ueSAqIGNvdW50O1xyXG4gICAgICB2W2ldLnogPSB2MltpXS56ICsgZFtpXS56ICogY291bnQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5hdXRob3Iucm90YXRpb24ueCA9IHRoaXMuYXV0aG9yLnJvdGF0aW9uLnkgPSB0aGlzLmF1dGhvci5yb3RhdGlvbi56ID0gY291bnQgKiA0LjA7XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIHRoaXMuYXV0aG9yLnJvdGF0aW9uLnggPSB0aGlzLmF1dGhvci5yb3RhdGlvbi55ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueiA9IDAuMDtcclxuXHJcbiAgZm9yIChsZXQgaSA9IDAsZSA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNbaV0ueCA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLng7XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS55ID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmRbaV0ueTtcclxuICAgIHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnogPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X2VuZFtpXS56O1xyXG4gIH1cclxuICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAvLyDlvoXjgaFcclxuICBmb3IobGV0IGkgPSAwO2kgPCB3YWl0OysraSl7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplID4gMikge1xyXG4gICAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplIC09IDAuNTtcclxuICAgICAgdGhpcy5hdXRob3IubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfSAgICBcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuXHJcbiAgLy8g44OV44Kn44O844OJ44Ki44Km44OIXHJcbiAgZm9yKGxldCBjb3VudCA9IDAuMDtjb3VudCA8PSAxLjA7Y291bnQgKz0gMC4wNSlcclxuICB7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjAgLSBjb3VudDtcclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG5cclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMC4wOyBcclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gIC8vIOW+heOBoVxyXG4gIGZvcihsZXQgaSA9IDA7aSA8IHdhaXQ7KytpKXtcclxuICAgIC8vIOS9leOBi+OCreODvOWFpeWKm+OBjOOBguOBo+OBn+WgtOWQiOOBr+asoeOBruOCv+OCueOCr+OBuFxyXG4gICAgaWYoY2hlY2tLZXlJbnB1dCgpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIG5leHRUYXNrKCk7XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vnlLvpnaLliJ3mnJ/ljJYgLy8vXHJcbippbml0VGl0bGUodGFza0luZGV4KSB7XHJcbiAgXHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgXHJcbiAgdGhpcy5iYXNpY0lucHV0LmNsZWFyKCk7XHJcblxyXG4gIC8vIOOCv+OCpOODiOODq+ODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHNmZy50ZXh0dXJlRmlsZXMudGl0bGUgfSk7XHJcbiAgbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gIC8vbWF0ZXJpYWwuYW50aWFsaWFzID0gZmFsc2U7XHJcbiAgbWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xyXG4gIG1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuICBtYXRlcmlhbC5kZXB0aFRlc3QgPSB0cnVlO1xyXG4gIHRoaXMudGl0bGUgPSBuZXcgVEhSRUUuTWVzaChcclxuICAgIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2Uud2lkdGgsIHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2UuaGVpZ2h0KSxcclxuICAgIG1hdGVyaWFsXHJcbiAgICApO1xyXG4gIHRoaXMudGl0bGUuc2NhbGUueCA9IHRoaXMudGl0bGUuc2NhbGUueSA9IDAuODtcclxuICB0aGlzLnRpdGxlLnBvc2l0aW9uLnkgPSA4MDtcclxuICB0aGlzLnNjZW5lLmFkZCh0aGlzLnRpdGxlKTtcclxuICB0aGlzLnNob3dTcGFjZUZpZWxkKCk7XHJcbiAgLy8vIOODhuOCreOCueODiOihqOekulxyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIDI1LCBcIlB1c2ggeiBvciBTVEFSVCBidXR0b25cIiwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuc2hvd1RpdGxlLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMTAvKuenkiovO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUaXRsZS5iaW5kKHRoaXMpKTtcclxuICByZXR1cm47XHJcbn1cclxuXHJcbi8vLyDog4zmma/jg5Hjg7zjg4bjgqPjgq/jg6vooajnpLpcclxuc2hvd1NwYWNlRmllbGQoKSB7XHJcbiAgLy8vIOiDjOaZr+ODkeODvOODhuOCo+OCr+ODq+ihqOekulxyXG4gIGlmICghdGhpcy5zcGFjZUZpZWxkKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgICBnZW9tZXRyeS5lbmR5ID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1MDsgKytpKSB7XHJcbiAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG4gICAgICB2YXIgeiA9IC0xODAwLjAgKiBNYXRoLnJhbmRvbSgpIC0gMzAwLjA7XHJcbiAgICAgIGNvbG9yLnNldEhTTCgwLjA1ICsgTWF0aC5yYW5kb20oKSAqIDAuMDUsIDEuMCwgKC0yMTAwIC0geikgLyAtMjEwMCk7XHJcbiAgICAgIHZhciBlbmR5ID0gc2ZnLlZJUlRVQUxfSEVJR0hUIC8gMiAtIHogKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgdmFyIHZlcnQyID0gbmV3IFRIUkVFLlZlY3RvcjMoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpICogTWF0aC5yYW5kb20oKSAtICgoc2ZnLlZJUlRVQUxfV0lEVEggLSB6ICogMikgLyAyKVxyXG4gICAgICAgICwgZW5keSAqIDIgKiBNYXRoLnJhbmRvbSgpIC0gZW5keSwgeik7XHJcbiAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICBnZW9tZXRyeS5lbmR5LnB1c2goZW5keSk7XHJcblxyXG4gICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Oe44OG44Oq44Ki44Or44KS5L2c5oiQXHJcbiAgICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7XHJcbiAgICAgIHNpemU6IDQsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSwgdmVydGV4Q29sb3JzOiB0cnVlLCBkZXB0aFRlc3Q6IHRydWUvLywgbWFwOiB0ZXh0dXJlXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNwYWNlRmllbGQgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLnNwYWNlRmllbGQucG9zaXRpb24ueCA9IHRoaXMuc3BhY2VGaWVsZC5wb3NpdGlvbi55ID0gdGhpcy5zcGFjZUZpZWxkLnBvc2l0aW9uLnogPSAwLjA7XHJcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnNwYWNlRmllbGQpO1xyXG4gICAgdGhpcy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmVTcGFjZUZpZWxkLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOWuh+WumeepuumWk+OBruihqOekulxyXG4qbW92ZVNwYWNlRmllbGQodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodHJ1ZSl7XHJcbiAgICB2YXIgdmVydHMgPSB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkudmVydGljZXM7XHJcbiAgICB2YXIgZW5keXMgPSB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkuZW5keTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2ZXJ0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2ZXJ0c1tpXS55IC09IDQ7XHJcbiAgICAgIGlmICh2ZXJ0c1tpXS55IDwgLWVuZHlzW2ldKSB7XHJcbiAgICAgICAgdmVydHNbaV0ueSA9IGVuZHlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCv+OCpOODiOODq+ihqOekulxyXG4qc2hvd1RpdGxlKHRhc2tJbmRleCkge1xyXG4gd2hpbGUodHJ1ZSl7XHJcbiAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuXHJcbiAgaWYgKHRoaXMuYmFzaWNJbnB1dC56IHx8IHRoaXMuYmFzaWNJbnB1dC5zdGFydCApIHtcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMudGl0bGUpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdEhhbmRsZU5hbWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIGlmICh0aGlzLnNob3dUaXRsZS5lbmRUaW1lIDwgc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSkge1xyXG4gICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy50aXRsZSk7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VG9wMTAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIHlpZWxkO1xyXG4gfVxyXG59XHJcblxyXG4vLy8g44OP44Oz44OJ44Or44ON44O844Og44Gu44Ko44Oz44OI44Oq5YmN5Yid5pyf5YyWXHJcbippbml0SGFuZGxlTmFtZSh0YXNrSW5kZXgpIHtcclxuICBsZXQgZW5kID0gZmFsc2U7XHJcbiAgaWYgKHRoaXMuZWRpdEhhbmRsZU5hbWUpe1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuZ2FtZUluaXQuYmluZCh0aGlzKSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSB0aGlzLmhhbmRsZU5hbWUgfHwgJyc7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDQsIDE4LCAnSW5wdXQgeW91ciBoYW5kbGUgbmFtZS4nKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE5LCAnKE1heCA4IENoYXIpJyk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXMuZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgLy8gICAgdGV4dFBsYW5lLnByaW50KDEwLCAyMSwgaGFuZGxlTmFtZVswXSwgVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQudW5iaW5kKCk7XHJcbiAgICB2YXIgZWxtID0gZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnaW5wdXQnKTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICBlbG1cclxuICAgICAgLmF0dHIoJ3R5cGUnLCAndGV4dCcpXHJcbiAgICAgIC5hdHRyKCdwYXR0ZXJuJywgJ1thLXpBLVowLTlfXFxAXFwjXFwkXFwtXXswLDh9JylcclxuICAgICAgLmF0dHIoJ21heGxlbmd0aCcsIDgpXHJcbiAgICAgIC5hdHRyKCdpZCcsICdpbnB1dC1hcmVhJylcclxuICAgICAgLmF0dHIoJ3ZhbHVlJywgdGhpc18uZWRpdEhhbmRsZU5hbWUpXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgZC5ub2RlKCkuc2VsZWN0aW9uU3RhcnQgPSB0aGlzXy5lZGl0SGFuZGxlTmFtZS5sZW5ndGg7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGQzLmV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIC8vbGV0IHRoaXNfID0gdGhpcztcclxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7IHRoaXMuZm9jdXMoKTsgfSwgMTApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChkMy5ldmVudC5rZXlDb2RlID09IDEzKSB7XHJcbiAgICAgICAgICB0aGlzXy5lZGl0SGFuZGxlTmFtZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICBsZXQgcyA9IHRoaXMuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgICBsZXQgZSA9IHRoaXMuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwLCAyMSwgdGhpc18uZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgICBkMy5zZWxlY3QodGhpcykub24oJ2tleXVwJywgbnVsbCk7XHJcbiAgICAgICAgICB0aGlzXy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgICAgICAgIC8vIOOBk+OBruOCv+OCueOCr+OCkue1guOCj+OCieOBm+OCi1xyXG4gICAgICAgICAgdGhpc18udGFza3MuYXJyYXlbdGFza0luZGV4XS5nZW5JbnN0Lm5leHQoLSh0YXNrSW5kZXggKyAxKSk7XHJcbiAgICAgICAgICAvLyDmrKHjga7jgr/jgrnjgq/jgpLoqK3lrprjgZnjgotcclxuICAgICAgICAgIHRoaXNfLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpc18uZ2FtZUluaXQuYmluZCh0aGlzXykpO1xyXG4gICAgICAgICAgdGhpc18uc3RvcmFnZS5zZXRJdGVtKCdoYW5kbGVOYW1lJywgdGhpc18uZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KCcjaW5wdXQtYXJlYScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzXy5lZGl0SGFuZGxlTmFtZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsICcgICAgICAgICAgICcpO1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwgJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcclxuICAgICAgICBsZXQgcyA9IHRoaXMubm9kZSgpLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsICcgICAgICAgICAgICcpO1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwgJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgICB0aGlzLm5vZGUoKS5mb2N1cygpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMClcclxuICAgIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmNsZWFyKCk7XHJcbiAgICAgIGlmKHRoaXMuYmFzaWNJbnB1dC5hQnV0dG9uIHx8IHRoaXMuYmFzaWNJbnB1dC5zdGFydClcclxuICAgICAge1xyXG4gICAgICAgICAgdmFyIGlucHV0QXJlYSA9IGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKTtcclxuICAgICAgICAgIHZhciBpbnB1dE5vZGUgPSBpbnB1dEFyZWEubm9kZSgpO1xyXG4gICAgICAgICAgdGhpcy5lZGl0SGFuZGxlTmFtZSA9IGlucHV0Tm9kZS52YWx1ZTtcclxuICAgICAgICAgIGxldCBzID0gaW5wdXROb2RlLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgbGV0IGUgPSBpbnB1dE5vZGUuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgICBpbnB1dEFyZWEub24oJ2tleXVwJywgbnVsbCk7XHJcbiAgICAgICAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgICAgICAgLy8g44GT44Gu44K/44K544Kv44KS57WC44KP44KJ44Gb44KLXHJcbiAgICAgICAgICAvL3RoaXMudGFza3MuYXJyYXlbdGFza0luZGV4XS5nZW5JbnN0Lm5leHQoLSh0YXNrSW5kZXggKyAxKSk7XHJcbiAgICAgICAgICAvLyDmrKHjga7jgr/jgrnjgq/jgpLoqK3lrprjgZnjgotcclxuICAgICAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgdGhpcy5zdG9yYWdlLnNldEl0ZW0oJ2hhbmRsZU5hbWUnLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGlucHV0QXJlYS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybjsgICAgICAgIFxyXG4gICAgICB9XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgdGFza0luZGV4ID0gLSgrK3Rhc2tJbmRleCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44K544Kz44Ki5Yqg566XXHJcbmFkZFNjb3JlKHMpIHtcclxuICB0aGlzLnNjb3JlICs9IHM7XHJcbiAgaWYgKHRoaXMuc2NvcmUgPiB0aGlzLmhpZ2hTY29yZSkge1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLnNjb3JlO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCueOCs+OCouihqOekulxyXG5wcmludFNjb3JlKCkge1xyXG4gIHZhciBzID0gKCcwMDAwMDAwMCcgKyB0aGlzLnNjb3JlLnRvU3RyaW5nKCkpLnNsaWNlKC04KTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgxLCAxLCBzKTtcclxuXHJcbiAgdmFyIGggPSAoJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3JlLnRvU3RyaW5nKCkpLnNsaWNlKC04KTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgxMiwgMSwgaCk7XHJcblxyXG59XHJcblxyXG4vLy8g44K144Km44Oz44OJ44Ko44OV44Kn44Kv44OIXHJcbnNlKGluZGV4KSB7XHJcbiAgdGhpcy5zZXF1ZW5jZXIucGxheVRyYWNrcyh0aGlzLnNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbaW5kZXhdKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODoOOBruWIneacn+WMllxyXG4qZ2FtZUluaXQodGFza0luZGV4KSB7XHJcblxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG5cclxuICAvLyDjgqrjg7zjg4fjgqPjgqrjga7plovlp4tcclxuICB0aGlzLmF1ZGlvXy5zdGFydCgpO1xyXG4gIHRoaXMuc2VxdWVuY2VyLmxvYWQoc2VxRGF0YSk7XHJcbiAgdGhpcy5zZXF1ZW5jZXIuc3RhcnQoKTtcclxuICBzZmcuc3RhZ2UucmVzZXQoKTtcclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuXHJcbiAgLy8g6Ieq5qmf44Gu5Yid5pyf5YyWXHJcbiAgdGhpcy5teXNoaXBfLmluaXQoKTtcclxuICBzZmcuZ2FtZVRpbWVyLnN0YXJ0KCk7XHJcbiAgdGhpcy5zY29yZSA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMiwgMCwgJ1Njb3JlICAgIEhpZ2ggU2NvcmUnKTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICB0aGlzLnByaW50U2NvcmUoKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZUluaXQuYmluZCh0aGlzKS8qZ2FtZUFjdGlvbiovKTtcclxufVxyXG5cclxuLy8vIOOCueODhuODvOOCuOOBruWIneacn+WMllxyXG4qc3RhZ2VJbml0KHRhc2tJbmRleCkge1xyXG4gIFxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDAsIDM5LCAnU3RhZ2U6JyArIHNmZy5zdGFnZS5ubyk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuZW5lbWllcy5yZXNldCgpO1xyXG4gIHRoaXMuZW5lbWllcy5zdGFydCgpO1xyXG4gIHRoaXMuZW5lbWllcy5jYWxjRW5lbWllc0NvdW50KHNmZy5zdGFnZS5wcml2YXRlTm8pO1xyXG4gIHRoaXMuZW5lbWllcy5oaXRFbmVtaWVzQ291bnQgPSAwO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE1LCAnU3RhZ2UgJyArIChzZmcuc3RhZ2Uubm8pICsgJyBTdGFydCAhIScsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlU3RhcnQuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8vLyDjgrnjg4bjg7zjgrjplovlp4tcclxuKnN0YWdlU3RhcnQodGFza0luZGV4KSB7XHJcbiAgbGV0IGVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMjtcclxuICB3aGlsZSh0YXNrSW5kZXggPj0gMCAmJiBlbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpe1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIHNmZy5teXNoaXBfLmFjdGlvbih0aGlzLmJhc2ljSW5wdXQpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7ICAgIFxyXG4gIH1cclxuICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJyAgICAgICAgICAgICAgICAgICcsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVBY3Rpb24uYmluZCh0aGlzKSwgNTAwMCk7XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6DkuK1cclxuKmdhbWVBY3Rpb24odGFza0luZGV4KSB7XHJcbiAgd2hpbGUgKHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgc2ZnLm15c2hpcF8uYWN0aW9uKHRoaXMuYmFzaWNJbnB1dCk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKTtcclxuICAgIHRoaXMuZW5lbWllcy5tb3ZlKCk7XHJcblxyXG4gICAgaWYgKCF0aGlzLnByb2Nlc3NDb2xsaXNpb24oKSkge1xyXG4gICAgICAvLyDpnaLjgq/jg6rjgqLjg4Hjgqfjg4Pjgq9cclxuICAgICAgaWYgKHRoaXMuZW5lbWllcy5oaXRFbmVtaWVzQ291bnQgPT0gdGhpcy5lbmVtaWVzLnRvdGFsRW5lbWllc0NvdW50KSB7XHJcbiAgICAgICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5hZHZhbmNlKCk7XHJcbiAgICAgICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VJbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5teVNoaXBCb21iLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMztcclxuICAgICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMubXlTaGlwQm9tYi5iaW5kKHRoaXMpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkOyBcclxuICB9XHJcbn1cclxuXHJcbi8vLyDlvZPjgZ/jgorliKTlrppcclxucHJvY2Vzc0NvbGxpc2lvbih0YXNrSW5kZXgpIHtcclxuICAvL+OAgOiHquapn+W8vuOBqOaVteOBqOOBruOBguOBn+OCiuWIpOWumlxyXG4gIGxldCBteUJ1bGxldHMgPSBzZmcubXlzaGlwXy5teUJ1bGxldHM7XHJcbiAgdGhpcy5lbnMgPSB0aGlzLmVuZW1pZXMuZW5lbWllcztcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gbXlCdWxsZXRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICBsZXQgbXliID0gbXlCdWxsZXRzW2ldO1xyXG4gICAgaWYgKG15Yi5lbmFibGVfKSB7XHJcbiAgICAgIHZhciBteWJjbyA9IG15QnVsbGV0c1tpXS5jb2xsaXNpb25BcmVhO1xyXG4gICAgICB2YXIgbGVmdCA9IG15YmNvLmxlZnQgKyBteWIueDtcclxuICAgICAgdmFyIHJpZ2h0ID0gbXliY28ucmlnaHQgKyBteWIueDtcclxuICAgICAgdmFyIHRvcCA9IG15YmNvLnRvcCArIG15Yi55O1xyXG4gICAgICB2YXIgYm90dG9tID0gbXliY28uYm90dG9tIC0gbXliLnNwZWVkICsgbXliLnk7XHJcbiAgICAgIGZvciAodmFyIGogPSAwLCBlbmRqID0gdGhpcy5lbnMubGVuZ3RoOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgdmFyIGVuID0gdGhpcy5lbnNbal07XHJcbiAgICAgICAgaWYgKGVuLmVuYWJsZV8pIHtcclxuICAgICAgICAgIHZhciBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgICAoZW4ueSArIGVuY28udG9wKSA+IGJvdHRvbSAmJlxyXG4gICAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgZW4uaGl0KG15Yik7XHJcbiAgICAgICAgICAgIGlmIChteWIucG93ZXIgPD0gMCkge1xyXG4gICAgICAgICAgICAgIG15Yi5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDmlbXjgajoh6rmqZ/jgajjga7jgYLjgZ/jgorliKTlrppcclxuICBpZiAoc2ZnLkNIRUNLX0NPTExJU0lPTikge1xyXG4gICAgbGV0IG15Y28gPSBzZmcubXlzaGlwXy5jb2xsaXNpb25BcmVhO1xyXG4gICAgbGV0IGxlZnQgPSBzZmcubXlzaGlwXy54ICsgbXljby5sZWZ0O1xyXG4gICAgbGV0IHJpZ2h0ID0gbXljby5yaWdodCArIHNmZy5teXNoaXBfLng7XHJcbiAgICBsZXQgdG9wID0gbXljby50b3AgKyBzZmcubXlzaGlwXy55O1xyXG4gICAgbGV0IGJvdHRvbSA9IG15Y28uYm90dG9tICsgc2ZnLm15c2hpcF8ueTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5lbnMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgbGV0IGVuID0gdGhpcy5lbnNbaV07XHJcbiAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgbGV0IGVuY28gPSBlbi5jb2xsaXNpb25BcmVhO1xyXG4gICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICBlbi5oaXQobXlzaGlwKTtcclxuICAgICAgICAgIHNmZy5teXNoaXBfLmhpdCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDmlbXlvL7jgajoh6rmqZ/jgajjga7jgYLjgZ/jgorliKTlrppcclxuICAgIHRoaXMuZW5icyA9IHRoaXMuZW5lbXlCdWxsZXRzLmVuZW15QnVsbGV0cztcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLmVuYnMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgbGV0IGVuID0gdGhpcy5lbmJzW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlKSB7XHJcbiAgICAgICAgbGV0IGVuY28gPSBlbi5jb2xsaXNpb25BcmVhO1xyXG4gICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICBlbi5oaXQoKTtcclxuICAgICAgICAgIHNmZy5teXNoaXBfLmhpdCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/niIbnmbogXHJcbipteVNoaXBCb21iKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPD0gdGhpcy5teVNoaXBCb21iLmVuZFRpbWUgJiYgdGFza0luZGV4ID49IDApe1xyXG4gICAgdGhpcy5lbmVtaWVzLm1vdmUoKTtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDsgIFxyXG4gIH1cclxuICBzZmcubXlzaGlwXy5yZXN0LS07XHJcbiAgaWYgKHNmZy5teXNoaXBfLnJlc3QgPD0gMCkge1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDE4LCAnR0FNRSBPVkVSJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDIwLCAzOSwgJ1Jlc3Q6ICAgJyArIHNmZy5teXNoaXBfLnJlc3QpO1xyXG4gICAgaWYodGhpcy5jb21tXy5lbmFibGUpe1xyXG4gICAgICB0aGlzLmNvbW1fLnNvY2tldC5vbignc2VuZFJhbmsnLCB0aGlzLmNoZWNrUmFua0luKTtcclxuICAgICAgdGhpcy5jb21tXy5zZW5kU2NvcmUobmV3IFNjb3JlRW50cnkodGhpcy5lZGl0SGFuZGxlTmFtZSwgdGhpcy5zY29yZSkpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5nYW1lT3Zlci5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbiAgICB0aGlzLnJhbmsgPSAtMTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVPdmVyLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5zZXF1ZW5jZXIuc3RvcCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBzZmcubXlzaGlwXy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIHRoaXMuc3RhZ2VTdGFydC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCsuODvOODoOOCquODvOODkOODvFxyXG4qZ2FtZU92ZXIodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodGhpcy5nYW1lT3Zlci5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGFza0luZGV4ID49IDApXHJcbiAge1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxuICBcclxuXHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAgdGhpcy5lbmVteUJ1bGxldHMucmVzZXQoKTtcclxuICBpZiAodGhpcy5yYW5rID49IDApIHtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUb3AxMC5iaW5kKHRoaXMpKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODqeODs+OCreODs+OCsOOBl+OBn+OBi+OBqeOBhuOBi+OBruODgeOCp+ODg+OCr1xyXG5jaGVja1JhbmtJbihkYXRhKSB7XHJcbiAgdGhpcy5yYW5rID0gZGF0YS5yYW5rO1xyXG59XHJcblxyXG5cclxuLy8vIOODj+OCpOOCueOCs+OCouOCqOODs+ODiOODquOBruihqOekulxyXG5wcmludFRvcDEwKCkge1xyXG4gIHZhciByYW5rbmFtZSA9IFsnIDFzdCcsICcgMm5kJywgJyAzcmQnLCAnIDR0aCcsICcgNXRoJywgJyA2dGgnLCAnIDd0aCcsICcgOHRoJywgJyA5dGgnLCAnMTB0aCddO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDQsICdUb3AgMTAgU2NvcmUnKTtcclxuICB2YXIgeSA9IDg7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuaGlnaFNjb3Jlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIHNjb3JlU3RyID0gJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3Jlc1tpXS5zY29yZTtcclxuICAgIHNjb3JlU3RyID0gc2NvcmVTdHIuc3Vic3RyKHNjb3JlU3RyLmxlbmd0aCAtIDgsIDgpO1xyXG4gICAgaWYgKHRoaXMucmFuayA9PSBpKSB7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyB0aGlzLmhpZ2hTY29yZXNbaV0ubmFtZSwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCB5LCByYW5rbmFtZVtpXSArICcgJyArIHNjb3JlU3RyICsgJyAnICsgdGhpcy5oaWdoU2NvcmVzW2ldLm5hbWUpO1xyXG4gICAgfVxyXG4gICAgeSArPSAyO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbippbml0VG9wMTAodGFza0luZGV4KSB7XHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5wcmludFRvcDEwKCk7XHJcbiAgdGhpcy5zaG93VG9wMTAuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyA1O1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUb3AxMC5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuKnNob3dUb3AxMCh0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0aGlzLnNob3dUb3AxMC5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPT0gMCAmJiB0YXNrSW5kZXggPj0gMClcclxuICB7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfSBcclxuICBcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG59XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLy92YXIgU1RBR0VfTUFYID0gMTtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcbi8vIGltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcclxuLy8gaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpby5qcyc7XHJcbi8vIC8vaW1wb3J0ICogYXMgc29uZyBmcm9tICcuL3NvbmcnO1xyXG4vLyBpbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzLmpzJztcclxuLy8gaW1wb3J0ICogYXMgaW8gZnJvbSAnLi9pby5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIGNvbW0gZnJvbSAnLi9jb21tLmpzJztcclxuLy8gaW1wb3J0ICogYXMgdGV4dCBmcm9tICcuL3RleHQuanMnO1xyXG4vLyBpbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iai5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIG15c2hpcCBmcm9tICcuL215c2hpcC5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIGVuZW1pZXMgZnJvbSAnLi9lbmVtaWVzLmpzJztcclxuLy8gaW1wb3J0ICogYXMgZWZmZWN0b2JqIGZyb20gJy4vZWZmZWN0b2JqLmpzJztcclxuaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZS5qcyc7XHJcblxyXG4vLy8g44Oh44Kk44OzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgbGV0IHJlZyA9IG5ldyBSZWdFeHAoJyguKlxcLyknKTtcclxuICBsZXQgciA9IHJlZy5leGVjKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcclxuICBsZXQgcm9vdCA9IHJbMV07XHJcbiAgaWYod2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL2RldnZlci8pKXtcclxuICAgIHNmZy5zZXRSZXNvdXJjZUJhc2UoJy4uLy4uL2Rpc3QvcmVzLycpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBzZmcuc2V0UmVzb3VyY2VCYXNlKCcuL3Jlcy8nKTtcclxuICB9XHJcbiAgc2ZnLnNldEdhbWUobmV3IEdhbWUoKSk7XHJcbiAgc2ZnLmdhbWUuZXhlYygpO1xyXG59O1xyXG4iXSwibmFtZXMiOlsidGV4dHVyZUZpbGVzIiwiZ2FtZSIsInNmZy5wYXVzZSIsInRoaXMiLCJzZmcucmVzb3VyY2VCYXNlIiwibHpiYXNlNjIiLCJzZmcuVklSVFVBTF9XSURUSCIsInNmZy5WSVJUVUFMX0hFSUdIVCIsInNmZy5nYW1lIiwic2ZnLnRleHR1cmVGaWxlcyIsInNmZy5URVhUX0hFSUdIVCIsInNmZy5URVhUX1dJRFRIIiwic2ZnLkFDVFVBTF9DSEFSX1NJWkUiLCJzZmcuQ0hBUl9TSVpFIiwiZ2FtZW9iai5HYW1lT2JqIiwiZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwiLCJncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSIsImdyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWIiwic2ZnLlZfVE9QIiwic2ZnLlZfQk9UVE9NIiwic2ZnLlZfUklHSFQiLCJzZmcuVl9MRUZUIiwic2ZnLnRhc2tzIiwic2ZnLmJvbWJzIiwic2ZnLm15c2hpcF8iLCJzZmcuc3RhZ2UiLCJzZmcuYWRkU2NvcmUiLCJncmFwaGljcy51cGRhdGVTcHJpdGVVViIsInNmZy5nYW1lVGltZXIiLCJzdGFnZSIsImlvLkJhc2ljSW5wdXQiLCJ1dGlsLlRhc2tzIiwic2ZnLnNldFRhc2tzIiwic2ZnLnNldFN0YWdlIiwic2ZnLnNldEFkZFNjb3JlIiwiYXVkaW8uQXVkaW8iLCJhdWRpby5TZXF1ZW5jZXIiLCJhdWRpby5Tb3VuZEVmZmVjdHMiLCJzZmcuc2V0R2FtZVRpbWVyIiwidXRpbC5HYW1lVGltZXIiLCJzZmcuc2V0UGF1c2UiLCJncmFwaGljcy5Qcm9ncmVzcyIsImVuZW1pZXMuRW5lbXlCdWxsZXRzIiwiZW5lbWllcy5FbmVtaWVzIiwiZWZmZWN0b2JqLkJvbWJzIiwic2ZnLnNldEJvbWJzIiwibXlzaGlwLk15U2hpcCIsInNmZy5zZXRNeVNoaXAiLCJ0ZXh0LlRleHRQbGFuZSIsImNvbW0uQ29tbSIsInRleHQuVGV4dEF0dHJpYnV0ZSIsInNmZy5DSEVDS19DT0xMSVNJT04iLCJzZmcuc2V0UmVzb3VyY2VCYXNlIiwic2ZnLnNldEdhbWUiXSwibWFwcGluZ3MiOiI7OztBQUFPLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQztBQUNqQyxBQUFPLE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQzs7QUFFbEMsQUFBTyxNQUFNLE9BQU8sR0FBRyxhQUFhLEdBQUcs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QUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztNQUM3QixHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU07TUFDdEIsSUFBSTtNQUNKLENBQUMsQ0FBQzs7RUFFTixJQUFJLFVBQVUsS0FBSyxPQUFPLFNBQVMsQ0FBQyxFQUFFLEVBQUU7SUFDdEMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztJQUU5RSxRQUFRLEdBQUc7TUFDVCxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDMUQsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUM5RCxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUNsRSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDdEUsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUMxRSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztLQUMvRTs7SUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO01BQ2xELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztJQUVELFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtJQUNMLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7SUFFTixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUMzQixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O01BRXBGLFFBQVEsR0FBRztRQUNULEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDMUQsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDOUQsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQ2xFO1VBQ0UsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQzVCOztVQUVELFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDckQ7S0FDRjtHQUNGOztFQUVELE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7OztBQVVGLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0VBQzFELElBQUksUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDO01BQ3RDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0VBRTFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3BFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO09BQ2hEO0lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUc7TUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRO0tBQzVCLENBQUM7R0FDSDs7RUFFRCxPQUFPLElBQUksQ0FBQztDQUNiLENBQUM7Ozs7Ozs7Ozs7QUFVRixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRTtFQUM5RCxJQUFJLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLElBQUksRUFBRSxJQUFJLENBQUM7TUFDNUMsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQzs7RUFFMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDcEUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7T0FDaEQ7SUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRztNQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVE7S0FDNUIsQ0FBQztHQUNIOztFQUVELE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FB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QUFDLENBQUMsQ0FBQSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLE9BQU8sVUFBVSxFQUFFLFdBQVcsRUFBRSxPQUFPLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQSxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQSxDQUFDLElBQUks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QUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDaEg7O0VBRUQsSUFBSSxJQUFJLEdBQUc7SUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDakg7O0VBRUQsSUFBSSxJQUFJLEdBQUc7SUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNsSDs7RUFFRCxJQUFJLEtBQUssR0FBRztJQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNsSDs7RUFFRCxJQUFJLENBQUMsR0FBRztLQUNMLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNyQixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElB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QUMsQ0FBQztFQUN6REMsY0FBdUIsQ0FBQyxRQUFRLEVBQUVSLGNBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQzs7RUFFdkYsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDOztFQUUvQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztFQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztFQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztFQUMvQixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztFQUNkLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxLQUFLO0lBQ3RCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7TUFDMUIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVDO0lBQ0QsT0FBTyxHQUFHLENBQUM7R0FDWixHQUFHLENBQUM7RUFDTCxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7RUFFckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7O0NBRXRCO0VBQ0MsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtFQUMzQixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLElB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QUMsQ0FBQzs7RUFFSCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7Ozs7Ozs7RUFPbkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzs7O0VBSTVCLElBQUksSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFLEtBQUssSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU07RUFDN0U7O0lBRUUsR0FBRyxhQUFhLEVBQUUsQ0FBQztNQUNqQixPQUFPO0tBQ1I7O0lBRUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztJQUMvQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7SUFDdEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO0lBQ3hDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO01BQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztNQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7TUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0tBQ25DO0lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0lBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7SUFDdkYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztJQUNuQyxLQUFLLENBQUM7R0FDUDtFQUNELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs7RUFFL0UsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtJQUNuRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUN6RTtFQUNELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQzs7O0VBRy9DLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7O0lBRXpCLEdBQUcsYUFBYSxFQUFFLENBQUM7TUFDakIsT0FBTztLQUNSO0lBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO01BQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUM7TUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztLQUN6QztJQUNELEtBQUssQ0FBQztHQUNQOzs7RUFHRCxJQUFJLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxJQUFJO0VBQzlDOztJQUVFLEdBQUcsYUFBYSxFQUFFLENBQUM7TUFDakIsT0FBTztLQUNSO0lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUM7SUFDM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzs7SUFFeEMsS0FBSyxDQUFDO0dBQ1A7O0VBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztFQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDOzs7RUFHeEMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFFekIsR0FBRyxhQUFhLEVBQUUsQ0FBQztNQUNqQixPQUFPO0tBQ1I7SUFDRCxLQUFLLENBQUM7R0FDUDtFQUNELFFBQVEsRUFBRSxDQUFDO0NBQ1o7OztBQUdELENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTs7RUFFcEIsU0FBUyxHQUFHLEtBQUssQ0FBQzs7RUFFbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7O0VBR3hCLElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxFQUFFQSxjQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7RUFDNUUsUUFBUSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztFQUVyQyxRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztFQUM1QixRQUFRLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztFQUN6QixRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztFQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUk7SUFDekIsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDQSxjQUFnQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFQSxjQUFnQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2hHLFFBQVE7S0FDUCxDQUFDO0VBQ0osSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDM0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztFQUV0QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLHdCQUF3QixFQUFFLElBQUl5QyxhQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDcEZ0QixTQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7RUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUdBLFNBQWEsQ0FBQyxXQUFXLEdBQUcsRUFBRSxNQUFNO0VBQzdELElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQzdELE9BQU87Q0FDUjs7O0FBR0QsY0FBYyxHQUFHOztFQUVmLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO0lBQ3BCLElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDOztJQUVwQyxRQUFRLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO01BQzVCLElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO01BQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUM7TUFDeEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztNQUNwRSxJQUFJLElBQUksR0FBR3JCLGNBQWtCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBR0EsY0FBa0IsR0FBR0QsYUFBaUIsQ0FBQztNQUMvRSxJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQ0EsYUFBaUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDQSxhQUFpQixHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1VBQ3pHLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztNQUN4QyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztNQUM5QixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7TUFFekIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDN0I7Ozs7SUFJRCxJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUM7TUFDdEMsSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtNQUN6QyxXQUFXLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUk7S0FDdkQsQ0FBQyxDQUFDOztJQUVILElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDM0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDckQ7Q0FDRjs7O0FBR0QsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO0VBQ3pCLE1BQU0sSUFBSSxDQUFDO0lBQ1QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBQzlDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztJQUMxQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO01BQ2hELEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO01BQ2hCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUMxQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUN2QjtLQUNGO0lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0lBQ25ELFNBQVMsR0FBRyxLQUFLLENBQUM7R0FDbkI7Q0FDRjs7O0FBR0QsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO0NBQ3JCLE1BQU0sSUFBSSxDQUFDO0VBQ1ZzQixTQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7O0VBRXZCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUc7SUFDL0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0dBQ25FO0VBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBR0EsU0FBYSxDQUFDLFdBQVcsRUFBRTtJQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDOUQ7RUFDRCxLQUFLLENBQUM7RUFDTjtDQUNEOzs7QUFHRCxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUU7RUFDekIsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDO0VBQ2hCLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztHQUM3RCxNQUFNO0lBQ0wsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztJQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUseUJBQXlCLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDOztJQUVsRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3pCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztJQUNqQixHQUFHO09BQ0EsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7T0FDcEIsSUFBSSxDQUFDLFNBQVMsRUFBRSwyQkFBMkIsQ0FBQztPQUM1QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztPQUNwQixJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQztPQUN4QixJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUM7T0FDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1FBQ2pCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7T0FDdkQsQ0FBQztPQUNELEVBQUUsQ0FBQyxNQUFNLEVBQUUsWUFBWTtRQUN0QixFQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsQ0FBQzs7UUFFcEMsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sS0FBSyxDQUFDO09BQ2QsQ0FBQztPQUNELEVBQUUsQ0FBQyxPQUFPLEVBQUUsV0FBVztRQUN0QixJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRTtVQUMxQixLQUFLLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7VUFDbEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztVQUM1QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1VBQzFCLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1VBQ3BELEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJc0IsYUFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1VBQ3JFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztVQUNsQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDOztVQUV4QixLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7O1VBRTVELEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1VBQy9ELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7VUFDMUQsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztVQUNsQyxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsS0FBSyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDNUIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUM3QyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRCxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSUEsYUFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO09BQ3RFLENBQUM7T0FDRCxJQUFJLENBQUMsVUFBVTtRQUNkLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxjQUFjLENBQUM7UUFDbkMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUM3QyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRCxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSUEsYUFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNyQixDQUFDLENBQUM7O0lBRUwsTUFBTSxTQUFTLElBQUksQ0FBQztJQUNwQjtNQUNFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7TUFDeEIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUs7TUFDbkQ7VUFDSSxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1VBQ3pDLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztVQUNqQyxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7VUFDdEMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQztVQUNqQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO1VBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1VBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJQSxhQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7VUFDcEUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7VUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7OztVQUl2QixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztVQUM1RCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1VBQ3hELFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztVQUNuQixPQUFPO09BQ1Y7TUFDRCxTQUFTLEdBQUcsS0FBSyxDQUFDO0tBQ25CO0lBQ0QsU0FBUyxHQUFHLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztHQUM1QjtDQUNGOzs7QUFHRCxRQUFRLENBQUMsQ0FBQyxFQUFFO0VBQ1YsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7RUFDaEIsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUU7SUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0dBQzdCO0NBQ0Y7OztBQUdELFVBQVUsR0FBRztFQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7RUFFOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMzRCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztDQUVoQzs7O0FBR0QsRUFBRSxDQUFDLEtBQUssRUFBRTtFQUNSLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Q0FDbEU7OztBQUdELENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRTs7RUFFbkIsU0FBUyxHQUFHLEtBQUssQ0FBQzs7OztFQUlsQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0VBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzdCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7RUFDdkJ6QixLQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7RUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDOzs7RUFHckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztFQUNwQkcsU0FBYSxDQUFDLEtBQUssRUFBRSxDQUFDO0VBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0VBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0VBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsVUFBVSxHQUFHSixPQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDNUQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0VBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO0NBQzVFOzs7QUFHRCxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUU7O0VBRXBCLFNBQVMsR0FBRyxLQUFLLENBQUM7O0VBRWxCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxHQUFHQyxLQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDckRHLFNBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztFQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0VBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7RUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQ0gsS0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0VBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztFQUNqQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLFFBQVEsSUFBSUEsS0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsRUFBRSxJQUFJeUIsYUFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQ25HLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQy9EOzs7QUFHRCxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7RUFDckIsSUFBSSxPQUFPLEdBQUd0QixTQUFhLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztFQUM1QyxNQUFNLFNBQVMsSUFBSSxDQUFDLElBQUksT0FBTyxJQUFJQSxTQUFhLENBQUMsV0FBVyxDQUFDO0lBQzNEQSxTQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDdkJKLE9BQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BDLFNBQVMsR0FBRyxLQUFLLENBQUM7R0FDbkI7RUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLG9CQUFvQixFQUFFLElBQUkwQixhQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDaEYsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3JFOzs7QUFHRCxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7RUFDckIsT0FBTyxTQUFTLElBQUksQ0FBQyxDQUFDO0lBQ3BCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNsQjFCLE9BQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BDSSxTQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7O0lBRXZCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7O0lBRXBCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRTs7TUFFNUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFO1FBQ2xFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdELE9BQU87T0FDUjtLQUNGLE1BQU07TUFDTCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sR0FBR0EsU0FBYSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7TUFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7TUFDOUQsT0FBTztLQUNSLEFBQUM7SUFDRixTQUFTLEdBQUcsS0FBSyxDQUFDO0dBQ25CO0NBQ0Y7OztBQUdELGdCQUFnQixDQUFDLFNBQVMsRUFBRTs7RUFFMUIsSUFBSSxTQUFTLEdBQUdKLE9BQVcsQ0FBQyxTQUFTLENBQUM7RUFDdEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztFQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0lBQ3BELElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QixJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUU7TUFDZixJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO01BQ3ZDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztNQUM5QixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7TUFDaEMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO01BQzVCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO01BQzlDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQ3JELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFO1VBQ2QsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQztVQUM1QixJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDNUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksTUFBTTtZQUMxQixJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzFCLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLEtBQUs7Y0FDeEI7WUFDRixFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1osSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRTtjQUNsQixHQUFHLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQzthQUNyQjtZQUNELE1BQU07V0FDUDtTQUNGO09BQ0Y7S0FDRjtHQUNGOzs7RUFHRCxJQUFJMkIsZUFBbUIsRUFBRTtJQUN2QixJQUFJLElBQUksR0FBRzNCLE9BQVcsQ0FBQyxhQUFhLENBQUM7SUFDckMsSUFBSSxJQUFJLEdBQUdBLE9BQVcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHQSxPQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUdBLE9BQVcsQ0FBQyxDQUFDLENBQUM7SUFDbkMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBR0EsT0FBVyxDQUFDLENBQUMsQ0FBQzs7SUFFekMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7TUFDbkQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNyQixJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUU7UUFDZCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO1FBQzVCLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztVQUM1QixDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxNQUFNO1VBQzFCLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7VUFDMUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSztZQUN4QjtVQUNGLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7VUFDZkEsT0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1VBQ2xCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7T0FDRjtLQUNGOztJQUVELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUM7SUFDM0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7TUFDcEQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUN0QixJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUU7UUFDYixJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO1FBQzVCLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztVQUM1QixDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxNQUFNO1VBQzFCLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7VUFDMUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSztZQUN4QjtVQUNGLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztVQUNUQSxPQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7VUFDbEIsT0FBTyxJQUFJLENBQUM7U0FDYjtPQUNGO0tBQ0Y7O0dBRUY7RUFDRCxPQUFPLEtBQUssQ0FBQztDQUNkOzs7QUFHRCxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7RUFDckIsTUFBTUksU0FBYSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sSUFBSSxTQUFTLElBQUksQ0FBQyxDQUFDO0lBQzNFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEJBLFNBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN2QixTQUFTLEdBQUcsS0FBSyxDQUFDO0dBQ25CO0VBQ0RKLE9BQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztFQUNuQixJQUFJQSxPQUFXLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRTtJQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJMEIsYUFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBRzFCLE9BQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1RCxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO01BQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO01BQ25ELElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDdkU7SUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBR0ksU0FBYSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDdEQsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzVELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDdkIsTUFBTTtJQUNMSixPQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUdBLE9BQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1RCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLFFBQVEsSUFBSUMsS0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsRUFBRSxJQUFJeUIsYUFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25HLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxHQUFHdEIsU0FBYSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDL0Q7Q0FDRjs7O0FBR0QsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFO0VBQ25CLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUlBLFNBQWEsQ0FBQyxXQUFXLElBQUksU0FBUyxJQUFJLENBQUM7RUFDMUU7SUFDRUEsU0FBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3ZCLFNBQVMsR0FBRyxLQUFLLENBQUM7R0FDbkI7OztFQUdELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7RUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztFQUNyQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO0VBQzFCLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUU7SUFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDOUQsTUFBTTtJQUNMLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0dBQzlEO0NBQ0Y7OztBQUdELFdBQVcsQ0FBQyxJQUFJLEVBQUU7RUFDaEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQ3ZCOzs7O0FBSUQsVUFBVSxHQUFHO0VBQ1gsSUFBSSxRQUFRLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztFQUNoRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0VBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNWLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0lBQzFELElBQUksUUFBUSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNyRCxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuRCxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFO01BQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUlzQixhQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDeEgsTUFBTTtNQUNMLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDMUY7SUFDRCxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ1I7Q0FDRjs7O0FBR0QsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO0VBQ3BCLFNBQVMsR0FBRyxLQUFLLENBQUM7RUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUNyQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7RUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUd0QixTQUFhLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztFQUN2RCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUM5RDs7QUFFRCxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUU7RUFDcEIsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sSUFBSUEsU0FBYSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLFNBQVMsSUFBSSxDQUFDO0VBQ3BIO0lBQ0VBLFNBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN2QixTQUFTLEdBQUcsS0FBSyxDQUFDO0dBQ25COztFQUVELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7RUFDckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUM5RDtDQUNBOztBQ3QvQkQ7QUFDQSxBQUNBOzs7Ozs7Ozs7OztBQVdBLEFBRUE7QUFDQSxNQUFNLENBQUMsTUFBTSxHQUFHLFlBQVk7RUFDMUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDL0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3ZDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNoQixHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0Q3dCLGVBQW1CLENBQUMsaUJBQWlCLENBQUMsQ0FBQztHQUN4QyxNQUFNO0lBQ0xBLGVBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDL0I7RUFDREMsT0FBVyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQztFQUN4QjdDLElBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNqQixDQUFDOzsifQ==
