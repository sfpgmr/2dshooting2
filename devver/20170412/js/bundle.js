(function () {
'use strict';

// export const CAM_Z
// export const VIRTUAL_WIDTH = 240;
// export const VIRTUAL_HEIGHT = 320;

// export const V_RIGHT = VIRTUAL_WIDTH / 2.0;
// export const V_TOP = VIRTUAL_HEIGHT / 2.0;
// export const V_LEFT = -1 * VIRTUAL_WIDTH / 2.0;
// export const V_BOTTOM = -1 * VIRTUAL_HEIGHT / 2.0;

// export const CHAR_SIZE = 8;
// export const TEXT_WIDTH = VIRTUAL_WIDTH / CHAR_SIZE;
// export const TEXT_HEIGHT = VIRTUAL_HEIGHT / CHAR_SIZE;
// export const PIXEL_SIZE = 1;
// export const ACTUAL_CHAR_SIZE = CHAR_SIZE * PIXEL_SIZE;
// export const SPRITE_SIZE_X = 16.0;
// export const SPRITE_SIZE_Y = 16.0;
// export const CHECK_COLLISION = true;
// export const DEBUG = false;
// export var textureFiles = {};
// export var stage = 0;
// export var tasks = null;
// export var gameTimer = null;
// export var bombs = null;
// export var addScore = null;
// export var myship_ = null;
// export var pause = false;
// export var game = null;
// export var resourceBase = '';

// export function setGame(v){game = v;}
// export function setPause(v){pause = v;}
// export function setMyShip(v){myship_ = v;}
// export function setAddScore(v){addScore = v;}
// export function setBombs(v){bombs = v;}
// export function setGameTimer(v){gameTimer = v;}
// export function setTasks(v){tasks = v;}
// export function setStage(v){stage = v;}
// export function setResourceBase(v){resourceBase = v;}

class sfglobal {
  constructor() {
    this.CAMERA_Z = 100.0;
    this.ANGLE_OF_VIEW  = 10.0;
    this.VIRTUAL_WIDTH = 240.0;
    this.VIRTUAL_HEIGHT = 320.0;
    this.ACTUAL_HEIGHT = this.CAMERA_Z * Math.tan(this.ANGLE_OF_VIEW * Math.PI / 360) * 2;
    this.ACTUAL_WIDTH = this.ACTUAL_HEIGHT * this.VIRTUAL_WIDTH / this.VIRTUAL_HEIGHT;

    // this.V_RIGHT = this.VIRTUAL_WIDTH / 2.0;
    // this.V_TOP = this.VIRTUAL_HEIGHT / 2.0;
    // this.V_LEFT = -1 * this.VIRTUAL_WIDTH / 2.0;
    // this.V_BOTTOM = -1 * this.VIRTUAL_HEIGHT / 2.0;
    this.V_RIGHT = this.ACTUAL_WIDTH / 2.0;
    this.V_TOP = this.ACTUAL_HEIGHT / 2.0;
    this.V_LEFT = -1 * this.ACTUAL_WIDTH / 2.0;
    this.V_BOTTOM = -1 * this.ACTUAL_HEIGHT / 2.0;

    this.CHAR_SIZE = 8;
    this.TEXT_WIDTH = this.VIRTUAL_WIDTH / this.CHAR_SIZE;
    this.TEXT_HEIGHT = this.VIRTUAL_HEIGHT / this.CHAR_SIZE;
    this.PIXEL_SIZE = 1;
    this.ACTUAL_CHAR_SIZE = this.CHAR_SIZE * this.PIXEL_SIZE;
    this.SPRITE_SIZE_X = 16.0;
    this.SPRITE_SIZE_Y = 16.0;
    this.CHECK_COLLISION = true;
    this.DEBUG = false;
    this.textureFiles = {};
    this.stage = 0;
    this.tasks = null;
    this.gameTimer = null;
    this.bombs = null;
    this.addScore = null;
    this.myship_ = null;
    this.pause = false;
    this.game = null;
    this.resourceBase = '';
  }
}
const sfg = new sfglobal();

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
  
  process(game)
  {
    if(this.enable){
      requestAnimationFrame(this.process.bind(this,game));
      this.stopped = false;
      if (!sfg.pause) {
        if (!game.isHidden) {
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
      pr.then(json.bind(null,sfg.resourceBase + d.path))
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
  while (width <= sfg.VIRTUAL_WIDTH){
    width *= 2;
  }
  var height = 1;
  while (height <= sfg.VIRTUAL_HEIGHT){
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
  this.mesh.position.x = (width - sfg.VIRTUAL_WIDTH) / 2;
  this.mesh.position.y =  - (height - sfg.VIRTUAL_HEIGHT) / 2;

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




/// テクスチャー上の指定スプライトのUV座標を求める

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
      if (!sfg.pause) {
        sfg.game.pause();
      } else {
        sfg.game.resume();
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
      this.font = sfg.textureFiles.font;
    }
  }
}

/// テキストプレーン
class TextPlane{ 
  constructor (scene) {
  this.textBuffer = new Array(sfg.TEXT_HEIGHT);
  this.attrBuffer = new Array(sfg.TEXT_HEIGHT);
  this.textBackBuffer = new Array(sfg.TEXT_HEIGHT);
  this.attrBackBuffer = new Array(sfg.TEXT_HEIGHT);
  var endi = this.textBuffer.length;
  for (var i = 0; i < endi; ++i) {
    this.textBuffer[i] = new Array(sfg.TEXT_WIDTH);
    this.attrBuffer[i] = new Array(sfg.TEXT_WIDTH);
    this.textBackBuffer[i] = new Array(sfg.TEXT_WIDTH);
    this.attrBackBuffer[i] = new Array(sfg.TEXT_WIDTH);
  }


  // 描画用キャンバスのセットアップ

  this.canvas = document.createElement('canvas');
  var width = 1;
  while (width <= sfg.VIRTUAL_WIDTH){
    width *= 2;
  }
  var height = 1;
  while (height <= sfg.VIRTUAL_HEIGHT){
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
  this.geometry = new THREE.PlaneGeometry(sfg.ACTUAL_WIDTH * width / sfg.VIRTUAL_WIDTH , sfg.ACTUAL_HEIGHT *  height / sfg.VIRTUAL_HEIGHT );
//  this.geometry = new THREE.PlaneGeometry(sfg.ACTUAL_WIDTH , sfg.ACTUAL_HEIGHT);
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.position.z = 0.2;
  this.mesh.position.x = (sfg.ACTUAL_WIDTH * width / sfg.VIRTUAL_WIDTH - sfg.ACTUAL_WIDTH) / 2;
  this.mesh.position.y = - (sfg.ACTUAL_HEIGHT * height / sfg.VIRTUAL_HEIGHT - sfg.ACTUAL_HEIGHT) / 2;
  this.fonts = { font: sfg.textureFiles.font, font1: sfg.textureFiles.font1 };
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
    this.ctx.clearRect(0, 0, sfg.VIRTUAL_WIDTH, sfg.VIRTUAL_HEIGHT);
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
          this.textBuffer.push(new Array(sfg.VIRTUAL_WIDTH / 8));
          this.attrBuffer = this.attrBuffer.slice(1, this.attrBuffer.length - 1);
          this.attrBuffer.push(new Array(sfg.VIRTUAL_WIDTH / 8));
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

    for (var y = 0, gy = 0; y < sfg.TEXT_HEIGHT; ++y, gy += sfg.ACTUAL_CHAR_SIZE) {
      var line = this.textBuffer[y];
      var attr_line = this.attrBuffer[y];
      var line_back = this.textBackBuffer[y];
      var attr_line_back = this.attrBackBuffer[y];
      for (var x = 0, gx = 0; x < sfg.TEXT_WIDTH; ++x, gx += sfg.ACTUAL_CHAR_SIZE) {
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
          ctx.clearRect(gx, gy, sfg.ACTUAL_CHAR_SIZE, sfg.ACTUAL_CHAR_SIZE);
          var font = attr_line[x] ? attr_line[x].font : sfg.textureFiles.font;
          if (c) {
            ctx.drawImage(font.image, xpos, ypos, sfg.CHAR_SIZE, sfg.CHAR_SIZE, gx, gy, sfg.ACTUAL_CHAR_SIZE, sfg.ACTUAL_CHAR_SIZE);
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


/// 自機オブジェクト
class MyShip extends GameObj { 
  constructor(x, y, z,scene,se) {
  super(x, y, z);// extend

  this.collisionArea.width = 6;
  this.collisionArea.height = 8;
  this.se = se;
  this.scene = scene;
  //this.textureWidth = sfg.textureFiles.myship.image.width;
  //this.textureHeight = sfg.textureFiles.myship.image.height;

  // メッシュの作成・表示
  // マテリアルの作成
  //var material = graphics.createSpriteMaterial(sfg.textureFiles.myship);
  // ジオメトリの作成
  //var geometry = graphics.createSpriteGeometry(this.width);
  //graphics.createSpriteUV(geometry, sfg.textureFiles.myship, this.width, this.height, 0);

  //this.mesh = new THREE.Mesh(geometry, material);
  this.mesh = sfg.game.meshMyShip;
  let bbox = new THREE.Box3().setFromObject(this.mesh);
  let d = bbox.getSize();

  this.width = 0;
  this.height = 0;

  // 移動範囲を求める
  this.top = (sfg.V_TOP - this.height / 2) | 0;
  this.bottom = (sfg.V_BOTTOM + this.height / 2) | 0;
  this.left = (sfg.V_LEFT + this.width / 2) | 0;
  this.right = (sfg.V_RIGHT - this.width / 2) | 0;


  this.mesh.position.x = this.x_;
  this.mesh.position.y = this.y_;
  this.mesh.position.z = this.z_;
  this.rest = 3;
  // this.myBullets = ( ()=> {
  //   var arr = [];
  //   for (var i = 0; i < 2; ++i) {
  //     arr.push(new MyBullet(this.scene,this.se));
  //   }
  //   return arr;
  // })();
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
        this.x -= 0.15;
      }
    }

    if (basicInput.right) {
      if (this.x < this.right) {
        this.x += 0.15;
      }
    }

    if (basicInput.up) {
      if (this.y < this.top) {
        this.y += 0.15;
      }
    }

    if (basicInput.down) {
      if (this.y > this.bottom) {
        this.y -= 0.15;
      }
    }

    if(basicInput.left && this.mesh.rotation.z < 0.4){
      this.mesh.rotation.z += 0.01; 
    } else if(basicInput.right && this.mesh.rotation.z > -0.4){
      this.mesh.rotation.z -= 0.01;
    } else if(this.mesh.rotation.z != 0){
      if(this.mesh.rotation.z < 0){
        this.mesh.rotation.z += 0.05;
        if(this.mesh.rotation.z > 0){
          this.mesh.rotation.z = 0;
        }
      }
      if(this.mesh.rotation.z > 0){
        this.mesh.rotation.z -= 0.05;
        if(this.mesh.rotation.z < 0){
          this.mesh.rotation.z = 0;
        }
      }
    }



    // if (basicInput.z) {
    //   basicInput.keyCheck.z = false;
    //   this.shoot(0.5 * Math.PI);
    // }

    // if (basicInput.x) {
    //   basicInput.keyCheck.x = false;
    //   this.shoot(1.5 * Math.PI);
    // }
  }
  
  hit() {
    this.mesh.visible = false;
    sfg.bombs.start(this.x, this.y, 0.2);
    this.se(4);
  }
  
  reset(){
    this.myBullets.forEach((d)=>{
      if(d.enable_){
        while(!sfg.tasks.array[d.task.index].genInst.next(-(1 + d.task.index)).done);
      }
    });
  }
  
  init(){
      this.x = 0;
//      this.y = -100;
      this.y = 0;
      this.z = 0;
      this.rest = 3;
      this.mesh.visible = true;
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
//import * as enemies from './enemies.js';
//import * as effectobj from './effectobj.js';
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
    sfg.tasks = this.tasks;
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
    sfg.stage = this.stage;
    this.title = null;// タイトルメッシュ
    this.spaceField = null;// 宇宙空間パーティクル
    this.editHandleName = null;
    sfg.addScore = this.addScore.bind(this);
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
    sfg.gameTimer = new GameTimer(this.getCurrentTime.bind(this));

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
      width = height * sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT;
      while (width > window.innerWidth) {
        --height;
        width = height * sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT;
      }
    } else {
      height = width * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
      while (height > window.innerHeight) {
        --width;
        height = width * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
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
    this.camera = new THREE.PerspectiveCamera(sfg.ANGLE_OF_VIEW, sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT);
    this.camera.position.z = sfg.CAMERA_Z;//sfg.VIRTUAL_HEIGHT / (Math.tan(2 * Math.PI * 5 / 360) * 2);//sfg.VIRTUAL_HEIGHT / 2;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // ライトの作成
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0.577, 0.577, 0.577);
    this.scene.add(light);

    var ambient = new THREE.AmbientLight(0xc0c0c0);
    this.scene.add(ambient);
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
    if (sfg.gameTimer.status == sfg.gameTimer.START) {
      sfg.gameTimer.pause();
    }
    if (this.sequencer.status == this.sequencer.PLAY) {
      this.sequencer.pause();
    }
    sfg.pause = true;
  }

  resume() {
    if (sfg.gameTimer.status == sfg.gameTimer.PAUSE) {
      sfg.gameTimer.resume();
    }
    if (this.sequencer.status == this.sequencer.PAUSE) {
      this.sequencer.resume();
    }
    sfg.pause = false;
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
      title: 'base/graphic/TITLE.png'
    };

    /// テクスチャーのロード
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
    var loadPromise = this.audio_.readDrumSample;
    for (var n in textures) {
      ((name, texPath) => {
        loadPromise = loadPromise
          .then(() => {
            return loadTexture(sfg.resourceBase + texPath);
          })
          .then((tex) => {
            texCount++;
            this.progress.render('Loading Resouces ...', (texCount / texLength * 100) | 0);
            sfg.textureFiles[name] = tex;
            this.renderer.render(this.scene, this.camera);
            return Promise.resolve();
          });
      })(n, textures[n]);
    }

    let self = this;

    loadPromise = loadPromise.then(()=>{
      return new Promise((resolve,reject)=>{
        var json = './data/test.json';// jsonパスの指定
          // jsonファイルの読み込み
          var loader = new THREE.JSONLoader();
          loader.load(json, (geometry, materials) => {
            var faceMaterial = new THREE.MultiMaterial(materials);
            self.meshMyShip = new THREE.Mesh(geometry, faceMaterial);
            self.meshMyShip.rotation.set(90, 0, 0);
            self.meshMyShip.position.set(0, 0, 0.0);
            self.meshMyShip.scale.set(1,1,1);
            self.scene.add(self.meshMyShip); // シーンへメッシュの追加
            resolve();
          });
      })
    });

    
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
  //this.enemyBullets = this.enemyBullets || new enemies.EnemyBullets(this.scene, this.se.bind(this));
  //this.enemies = this.enemies || new enemies.Enemies(this.scene, this.se.bind(this), this.enemyBullets);
  //promises.push(this.enemies.loadPatterns());
  //promises.push(this.enemies.loadFormations());
  //this.bombs = this.bombs || new effectobj.Bombs(this.scene, this.se.bind(this));
  //sfg.bomb = this.bombs;
  this.myship_ = this.myship_ || new MyShip(0, -100, 0.1, this.scene, this.se.bind(this));
  sfg.myship_ = this.myship_;
  this.myship_.mesh.visible = false;

  //this.spaceField = null;
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
      //this.tasks.setNextTask(taskIndex, this.printAuthor.bind(this));
      this.tasks.setNextTask(taskIndex, this.gameInit.bind(this));
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
  var w = sfg.textureFiles.author.image.width;
  var h = sfg.textureFiles.author.image.height;
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(sfg.textureFiles.author.image, 0, 0);
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
  var material = new THREE.MeshBasicMaterial({ map: sfg.textureFiles.title });
  material.shading = THREE.FlatShading;
  //material.antialias = false;
  material.transparent = true;
  material.alphaTest = 0.5;
  material.depthTest = true;
  this.title = new THREE.Mesh(
    new THREE.PlaneGeometry(sfg.textureFiles.title.image.width, sfg.textureFiles.title.image.height),
    material
    );
  this.title.scale.x = this.title.scale.y = 0.8;
  this.title.position.y = 80;
  this.scene.add(this.title);
  this.showSpaceField();
  /// テキスト表示
  this.textPlane.print(3, 25, "Push z or START button", new TextAttribute(true));
  sfg.gameTimer.start();
  this.showTitle.endTime = sfg.gameTimer.elapsedTime + 10/*秒*/;
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
      var endy = sfg.VIRTUAL_HEIGHT / 2 - z * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
      var vert2 = new THREE.Vector3((sfg.VIRTUAL_WIDTH - z * 2) * Math.random() - ((sfg.VIRTUAL_WIDTH - z * 2) / 2)
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
  sfg.gameTimer.update();

  if (this.basicInput.z || this.basicInput.start ) {
    this.scene.remove(this.title);
    this.tasks.setNextTask(taskIndex, this.initHandleName.bind(this));
  }
  if (this.showTitle.endTime < sfg.gameTimer.elapsedTime) {
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
  sfg.stage.reset();
  this.textPlane.cls();
  //this.enemies.reset();

  // 自機の初期化
  this.myship_.init();
  sfg.gameTimer.start();
  this.score = 0;
  this.textPlane.print(2, 0, 'Score    High Score');
  this.textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
  this.printScore();
  this.tasks.setNextTask(taskIndex, this.stageInit.bind(this)/*gameAction*/);
}

/// ステージの初期化
*stageInit(taskIndex) {
  
  taskIndex = yield;
  
  this.textPlane.print(0, 39, 'Stage:' + sfg.stage.no);
  sfg.gameTimer.start();
  //this.enemies.reset();
  //this.enemies.start();
  //this.enemies.calcEnemiesCount(sfg.stage.privateNo);
  //this.enemies.hitEnemiesCount = 0;
  this.textPlane.print(8, 15, 'Stage ' + (sfg.stage.no) + ' Start !!', new TextAttribute(true));
  this.tasks.setNextTask(taskIndex, this.stageStart.bind(this));
}

/// ステージ開始
*stageStart(taskIndex) {
  let endTime = sfg.gameTimer.elapsedTime + 2;
  while(taskIndex >= 0 && endTime >= sfg.gameTimer.elapsedTime){
    sfg.gameTimer.update();
    sfg.myship_.action(this.basicInput);
    taskIndex = yield;    
  }
  this.textPlane.print(8, 15, '                  ', new TextAttribute(true));
  this.tasks.setNextTask(taskIndex, this.gameAction.bind(this), 5000);
}

/// ゲーム中
*gameAction(taskIndex) {
  while (taskIndex >= 0){
    this.printScore();
    sfg.myship_.action(this.basicInput);
    sfg.gameTimer.update();
    //console.log(sfg.gameTimer.elapsedTime);
    //this.enemies.move();

    // if (!this.processCollision()) {
    //   // 面クリアチェック
    //   if (this.enemies.hitEnemiesCount == this.enemies.totalEnemiesCount) {
    //     this.printScore();
    //     this.stage.advance();
    //     this.tasks.setNextTask(taskIndex, this.stageInit.bind(this));
    //     return;
    //   }
    // } else {
    //   this.myShipBomb.endTime = sfg.gameTimer.elapsedTime + 3;
    //   this.tasks.setNextTask(taskIndex, this.myShipBomb.bind(this));
    //   return;
    // };
    taskIndex = yield; 
  }
}

/// 当たり判定
processCollision(taskIndex) {
  // //　自機弾と敵とのあたり判定
  // let myBullets = sfg.myship_.myBullets;
  // this.ens = this.enemies.enemies;
  // for (var i = 0, end = myBullets.length; i < end; ++i) {
  //   let myb = myBullets[i];
  //   if (myb.enable_) {
  //     var mybco = myBullets[i].collisionArea;
  //     var left = mybco.left + myb.x;
  //     var right = mybco.right + myb.x;
  //     var top = mybco.top + myb.y;
  //     var bottom = mybco.bottom - myb.speed + myb.y;
  //     for (var j = 0, endj = this.ens.length; j < endj; ++j) {
  //       var en = this.ens[j];
  //       if (en.enable_) {
  //         var enco = en.collisionArea;
  //         if (top > (en.y + enco.bottom) &&
  //           (en.y + enco.top) > bottom &&
  //           left < (en.x + enco.right) &&
  //           (en.x + enco.left) < right
  //           ) {
  //           en.hit(myb);
  //           if (myb.power <= 0) {
  //             myb.enable_ = false;
  //           }
  //           break;
  //         }
  //       }
  //     }
  //   }
  // }

  // // 敵と自機とのあたり判定
  // if (sfg.CHECK_COLLISION) {
  //   let myco = sfg.myship_.collisionArea;
  //   let left = sfg.myship_.x + myco.left;
  //   let right = myco.right + sfg.myship_.x;
  //   let top = myco.top + sfg.myship_.y;
  //   let bottom = myco.bottom + sfg.myship_.y;

  //   for (var i = 0, end = this.ens.length; i < end; ++i) {
  //     let en = this.ens[i];
  //     if (en.enable_) {
  //       let enco = en.collisionArea;
  //       if (top > (en.y + enco.bottom) &&
  //         (en.y + enco.top) > bottom &&
  //         left < (en.x + enco.right) &&
  //         (en.x + enco.left) < right
  //         ) {
  //         en.hit(myship);
  //         sfg.myship_.hit();
  //         return true;
  //       }
  //     }
  //   }
  //   // 敵弾と自機とのあたり判定
  //   this.enbs = this.enemyBullets.enemyBullets;
  //   for (var i = 0, end = this.enbs.length; i < end; ++i) {
  //     let en = this.enbs[i];
  //     if (en.enable) {
  //       let enco = en.collisionArea;
  //       if (top > (en.y + enco.bottom) &&
  //         (en.y + enco.top) > bottom &&
  //         left < (en.x + enco.right) &&
  //         (en.x + enco.left) < right
  //         ) {
  //         en.hit();
  //         sfg.myship_.hit();
  //         return true;
  //       }
  //     }
  //   }

  // }
  return false;
}

/// 自機爆発 
// *myShipBomb(taskIndex) {
//   while(sfg.gameTimer.elapsedTime <= this.myShipBomb.endTime && taskIndex >= 0){
//     this.enemies.move();
//     sfg.gameTimer.update();
//     taskIndex = yield;  
//   }
//   sfg.myship_.rest--;
//   if (sfg.myship_.rest <= 0) {
//     this.textPlane.print(10, 18, 'GAME OVER', new text.TextAttribute(true));
//     this.printScore();
//     this.textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
//     if(this.comm_.enable){
//       this.comm_.socket.on('sendRank', this.checkRankIn);
//       this.comm_.sendScore(new ScoreEntry(this.editHandleName, this.score));
//     }
//     this.gameOver.endTime = sfg.gameTimer.elapsedTime + 5;
//     this.rank = -1;
//     this.tasks.setNextTask(taskIndex, this.gameOver.bind(this));
//     this.sequencer.stop();
//   } else {
//     sfg.myship_.mesh.visible = true;
//     this.textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
//     this.textPlane.print(8, 15, 'Stage ' + (sfg.stage.no) + ' Start !!', new text.TextAttribute(true));
//     this.stageStart.endTime = sfg.gameTimer.elapsedTime + 2;
//     this.tasks.setNextTask(taskIndex, this.stageStart.bind(this));
//   }
// }

/// ゲームオーバー
*gameOver(taskIndex) {
  while(this.gameOver.endTime >= sfg.gameTimer.elapsedTime && taskIndex >= 0)
  {
    sfg.gameTimer.update();
    taskIndex = yield;
  }
  

  this.textPlane.cls();
  //this.enemies.reset();
  //this.enemyBullets.reset();
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
  this.showTop10.endTime = sfg.gameTimer.elapsedTime + 5;
  this.tasks.setNextTask(taskIndex, this.showTop10.bind(this));
}

*showTop10(taskIndex) {
  while(this.showTop10.endTime >= sfg.gameTimer.elapsedTime && this.basicInput.keyBuffer.length == 0 && taskIndex >= 0)
  {
    sfg.gameTimer.update();
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
    sfg.resourceBase = '../../dist/res/';
  } else {
    sfg.resourceBase = './res/';
  }
  sfg.game = new Game();
  sfg.game.exec();
};

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvZ2xvYmFsLmpzIiwiLi4vLi4vc3JjL2pzL2V2ZW50RW1pdHRlcjMuanMiLCIuLi8uLi9zcmMvanMvdXRpbC5qcyIsIi4uLy4uL3NyYy9qcy9TeW50YXguanMiLCIuLi8uLi9zcmMvanMvU2Nhbm5lci5qcyIsIi4uLy4uL3NyYy9qcy9NTUxQYXJzZXIuanMiLCIuLi8uLi9zcmMvanMvRGVmYXVsdFBhcmFtcy5qcyIsIi4uLy4uL3NyYy9qcy9semJhc2U2Mi5taW4uanMiLCIuLi8uLi9zcmMvanMvYXVkaW8uanMiLCIuLi8uLi9zcmMvanMvZ3JhcGhpY3MuanMiLCIuLi8uLi9zcmMvanMvaW8uanMiLCIuLi8uLi9zcmMvanMvY29tbS5qcyIsIi4uLy4uL3NyYy9qcy90ZXh0LmpzIiwiLi4vLi4vc3JjL2pzL2dhbWVvYmouanMiLCIuLi8uLi9zcmMvanMvbXlzaGlwLmpzIiwiLi4vLi4vc3JjL2pzL3NlcURhdGEuanMiLCIuLi8uLi9zcmMvanMvZ2FtZS5qcyIsIi4uLy4uL3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGV4cG9ydCBjb25zdCBDQU1fWlxyXG4vLyBleHBvcnQgY29uc3QgVklSVFVBTF9XSURUSCA9IDI0MDtcclxuLy8gZXhwb3J0IGNvbnN0IFZJUlRVQUxfSEVJR0hUID0gMzIwO1xyXG5cclxuLy8gZXhwb3J0IGNvbnN0IFZfUklHSFQgPSBWSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG4vLyBleHBvcnQgY29uc3QgVl9UT1AgPSBWSVJUVUFMX0hFSUdIVCAvIDIuMDtcclxuLy8gZXhwb3J0IGNvbnN0IFZfTEVGVCA9IC0xICogVklSVFVBTF9XSURUSCAvIDIuMDtcclxuLy8gZXhwb3J0IGNvbnN0IFZfQk9UVE9NID0gLTEgKiBWSVJUVUFMX0hFSUdIVCAvIDIuMDtcclxuXHJcbi8vIGV4cG9ydCBjb25zdCBDSEFSX1NJWkUgPSA4O1xyXG4vLyBleHBvcnQgY29uc3QgVEVYVF9XSURUSCA9IFZJUlRVQUxfV0lEVEggLyBDSEFSX1NJWkU7XHJcbi8vIGV4cG9ydCBjb25zdCBURVhUX0hFSUdIVCA9IFZJUlRVQUxfSEVJR0hUIC8gQ0hBUl9TSVpFO1xyXG4vLyBleHBvcnQgY29uc3QgUElYRUxfU0laRSA9IDE7XHJcbi8vIGV4cG9ydCBjb25zdCBBQ1RVQUxfQ0hBUl9TSVpFID0gQ0hBUl9TSVpFICogUElYRUxfU0laRTtcclxuLy8gZXhwb3J0IGNvbnN0IFNQUklURV9TSVpFX1ggPSAxNi4wO1xyXG4vLyBleHBvcnQgY29uc3QgU1BSSVRFX1NJWkVfWSA9IDE2LjA7XHJcbi8vIGV4cG9ydCBjb25zdCBDSEVDS19DT0xMSVNJT04gPSB0cnVlO1xyXG4vLyBleHBvcnQgY29uc3QgREVCVUcgPSBmYWxzZTtcclxuLy8gZXhwb3J0IHZhciB0ZXh0dXJlRmlsZXMgPSB7fTtcclxuLy8gZXhwb3J0IHZhciBzdGFnZSA9IDA7XHJcbi8vIGV4cG9ydCB2YXIgdGFza3MgPSBudWxsO1xyXG4vLyBleHBvcnQgdmFyIGdhbWVUaW1lciA9IG51bGw7XHJcbi8vIGV4cG9ydCB2YXIgYm9tYnMgPSBudWxsO1xyXG4vLyBleHBvcnQgdmFyIGFkZFNjb3JlID0gbnVsbDtcclxuLy8gZXhwb3J0IHZhciBteXNoaXBfID0gbnVsbDtcclxuLy8gZXhwb3J0IHZhciBwYXVzZSA9IGZhbHNlO1xyXG4vLyBleHBvcnQgdmFyIGdhbWUgPSBudWxsO1xyXG4vLyBleHBvcnQgdmFyIHJlc291cmNlQmFzZSA9ICcnO1xyXG5cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNldEdhbWUodil7Z2FtZSA9IHY7fVxyXG4vLyBleHBvcnQgZnVuY3Rpb24gc2V0UGF1c2Uodil7cGF1c2UgPSB2O31cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNldE15U2hpcCh2KXtteXNoaXBfID0gdjt9XHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBzZXRBZGRTY29yZSh2KXthZGRTY29yZSA9IHY7fVxyXG4vLyBleHBvcnQgZnVuY3Rpb24gc2V0Qm9tYnModil7Ym9tYnMgPSB2O31cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNldEdhbWVUaW1lcih2KXtnYW1lVGltZXIgPSB2O31cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNldFRhc2tzKHYpe3Rhc2tzID0gdjt9XHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBzZXRTdGFnZSh2KXtzdGFnZSA9IHY7fVxyXG4vLyBleHBvcnQgZnVuY3Rpb24gc2V0UmVzb3VyY2VCYXNlKHYpe3Jlc291cmNlQmFzZSA9IHY7fVxyXG5cclxuY2xhc3Mgc2ZnbG9iYWwge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5DQU1FUkFfWiA9IDEwMC4wO1xyXG4gICAgdGhpcy5BTkdMRV9PRl9WSUVXICA9IDEwLjA7XHJcbiAgICB0aGlzLlZJUlRVQUxfV0lEVEggPSAyNDAuMDtcclxuICAgIHRoaXMuVklSVFVBTF9IRUlHSFQgPSAzMjAuMDtcclxuICAgIHRoaXMuQUNUVUFMX0hFSUdIVCA9IHRoaXMuQ0FNRVJBX1ogKiBNYXRoLnRhbih0aGlzLkFOR0xFX09GX1ZJRVcgKiBNYXRoLlBJIC8gMzYwKSAqIDI7XHJcbiAgICB0aGlzLkFDVFVBTF9XSURUSCA9IHRoaXMuQUNUVUFMX0hFSUdIVCAqIHRoaXMuVklSVFVBTF9XSURUSCAvIHRoaXMuVklSVFVBTF9IRUlHSFQ7XHJcblxyXG4gICAgLy8gdGhpcy5WX1JJR0hUID0gdGhpcy5WSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG4gICAgLy8gdGhpcy5WX1RPUCA9IHRoaXMuVklSVFVBTF9IRUlHSFQgLyAyLjA7XHJcbiAgICAvLyB0aGlzLlZfTEVGVCA9IC0xICogdGhpcy5WSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG4gICAgLy8gdGhpcy5WX0JPVFRPTSA9IC0xICogdGhpcy5WSVJUVUFMX0hFSUdIVCAvIDIuMDtcclxuICAgIHRoaXMuVl9SSUdIVCA9IHRoaXMuQUNUVUFMX1dJRFRIIC8gMi4wO1xyXG4gICAgdGhpcy5WX1RPUCA9IHRoaXMuQUNUVUFMX0hFSUdIVCAvIDIuMDtcclxuICAgIHRoaXMuVl9MRUZUID0gLTEgKiB0aGlzLkFDVFVBTF9XSURUSCAvIDIuMDtcclxuICAgIHRoaXMuVl9CT1RUT00gPSAtMSAqIHRoaXMuQUNUVUFMX0hFSUdIVCAvIDIuMDtcclxuXHJcbiAgICB0aGlzLkNIQVJfU0laRSA9IDg7XHJcbiAgICB0aGlzLlRFWFRfV0lEVEggPSB0aGlzLlZJUlRVQUxfV0lEVEggLyB0aGlzLkNIQVJfU0laRTtcclxuICAgIHRoaXMuVEVYVF9IRUlHSFQgPSB0aGlzLlZJUlRVQUxfSEVJR0hUIC8gdGhpcy5DSEFSX1NJWkU7XHJcbiAgICB0aGlzLlBJWEVMX1NJWkUgPSAxO1xyXG4gICAgdGhpcy5BQ1RVQUxfQ0hBUl9TSVpFID0gdGhpcy5DSEFSX1NJWkUgKiB0aGlzLlBJWEVMX1NJWkU7XHJcbiAgICB0aGlzLlNQUklURV9TSVpFX1ggPSAxNi4wO1xyXG4gICAgdGhpcy5TUFJJVEVfU0laRV9ZID0gMTYuMDtcclxuICAgIHRoaXMuQ0hFQ0tfQ09MTElTSU9OID0gdHJ1ZTtcclxuICAgIHRoaXMuREVCVUcgPSBmYWxzZTtcclxuICAgIHRoaXMudGV4dHVyZUZpbGVzID0ge307XHJcbiAgICB0aGlzLnN0YWdlID0gMDtcclxuICAgIHRoaXMudGFza3MgPSBudWxsO1xyXG4gICAgdGhpcy5nYW1lVGltZXIgPSBudWxsO1xyXG4gICAgdGhpcy5ib21icyA9IG51bGw7XHJcbiAgICB0aGlzLmFkZFNjb3JlID0gbnVsbDtcclxuICAgIHRoaXMubXlzaGlwXyA9IG51bGw7XHJcbiAgICB0aGlzLnBhdXNlID0gZmFsc2U7XHJcbiAgICB0aGlzLmdhbWUgPSBudWxsO1xyXG4gICAgdGhpcy5yZXNvdXJjZUJhc2UgPSAnJztcclxuICB9XHJcbn1cclxuY29uc3Qgc2ZnID0gbmV3IHNmZ2xvYmFsKCk7XHJcbmV4cG9ydCBkZWZhdWx0IHNmZztcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy9cclxuLy8gV2Ugc3RvcmUgb3VyIEVFIG9iamVjdHMgaW4gYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXHJcbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXHJcbi8vIGB+YCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBvdmVycmlkZGVuIG9yXHJcbi8vIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cclxuLy8gV2UgYWxzbyBhc3N1bWUgdGhhdCBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIGV2ZW50IG5hbWVcclxuLy8gaXMgYW4gRVM2IFN5bWJvbC5cclxuLy9cclxudmFyIHByZWZpeCA9IHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSAnZnVuY3Rpb24nID8gJ34nIDogZmFsc2U7XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XHJcbiAgdGhpcy5mbiA9IGZuO1xyXG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXHJcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXHJcbiAqXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XHJcblxyXG4vKipcclxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cclxuICpcclxuICogQHR5cGUge09iamVjdH1cclxuICogQHByaXZhdGVcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBXZSBvbmx5IG5lZWQgdG8ga25vdyBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzLlxyXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcclxuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxyXG4gICAgLCBhdmFpbGFibGUgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2dF07XHJcblxyXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcclxuICBpZiAoIWF2YWlsYWJsZSkgcmV0dXJuIFtdO1xyXG4gIGlmIChhdmFpbGFibGUuZm4pIHJldHVybiBbYXZhaWxhYmxlLmZuXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdmFpbGFibGUubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xyXG4gICAgZWVbaV0gPSBhdmFpbGFibGVbaV0uZm47XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZWU7XHJcbn07XHJcblxyXG4vKipcclxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcclxuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxyXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAsIGFyZ3NcclxuICAgICwgaTtcclxuXHJcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBsaXN0ZW5lcnMuZm4pIHtcclxuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xyXG5cclxuICAgIHN3aXRjaCAobGVuKSB7XHJcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcclxuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcclxuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XHJcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcclxuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcclxuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcclxuICAgICAgLCBqO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHJcbiAgICAgIHN3aXRjaCAobGVuKSB7XHJcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcclxuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXHJcbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xyXG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKVxyXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XHJcbiAgZWxzZSB7XHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcclxuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXHJcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XHJcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXHJcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcclxuICBlbHNlIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcclxuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIGxpc3RlbmVycyBtYXRjaGluZyB0aGlzIGNvbnRleHQuXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XHJcblxyXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxyXG4gICAgLCBldmVudHMgPSBbXTtcclxuXHJcbiAgaWYgKGZuKSB7XHJcbiAgICBpZiAobGlzdGVuZXJzLmZuKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXHJcbiAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVycy5vbmNlKVxyXG4gICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVycy5jb250ZXh0ICE9PSBjb250ZXh0KVxyXG4gICAgICApIHtcclxuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnMpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxyXG4gICAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKVxyXG4gICAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy9cclxuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXHJcbiAgLy9cclxuICBpZiAoZXZlbnRzLmxlbmd0aCkge1xyXG4gICAgdGhpcy5fZXZlbnRzW2V2dF0gPSBldmVudHMubGVuZ3RoID09PSAxID8gZXZlbnRzWzBdIDogZXZlbnRzO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xyXG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcclxuXHJcbiAgaWYgKGV2ZW50KSBkZWxldGUgdGhpcy5fZXZlbnRzW3ByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRdO1xyXG4gIGVsc2UgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8vXHJcbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XHJcblxyXG4vL1xyXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cclxuLy9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vL1xyXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cclxuLy9cclxuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xyXG5cclxuLy9cclxuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXHJcbi8vXHJcbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xyXG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xyXG59XHJcblxyXG4iLCJcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCBzZmcgZnJvbSAnLi9nbG9iYWwuanMnOyBcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL2V2ZW50RW1pdHRlcjMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRhc2sge1xyXG4gIGNvbnN0cnVjdG9yKGdlbkluc3QscHJpb3JpdHkpIHtcclxuICAgIHRoaXMucHJpb3JpdHkgPSBwcmlvcml0eSB8fCAxMDAwMDtcclxuICAgIHRoaXMuZ2VuSW5zdCA9IGdlbkluc3Q7XHJcbiAgICAvLyDliJ3mnJ/ljJZcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gIH1cclxuICBcclxufVxyXG5cclxuZXhwb3J0IHZhciBudWxsVGFzayA9IG5ldyBUYXNrKChmdW5jdGlvbiooKXt9KSgpKTtcclxuXHJcbi8vLyDjgr/jgrnjgq/nrqHnkIZcclxuZXhwb3J0IGNsYXNzIFRhc2tzIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuYXJyYXkgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gZmFsc2U7XHJcbiAgICB0aGlzLm5lZWRDb21wcmVzcyA9IGZhbHNlO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XHJcbiAgfVxyXG4gIC8vIGluZGV444Gu5L2N572u44Gu44K/44K544Kv44KS572u44GN5o+b44GI44KLXHJcbiAgc2V0TmV4dFRhc2soaW5kZXgsIGdlbkluc3QsIHByaW9yaXR5KSBcclxuICB7XHJcbiAgICBpZihpbmRleCA8IDApe1xyXG4gICAgICBpbmRleCA9IC0oKytpbmRleCk7XHJcbiAgICB9XHJcbiAgICBpZih0aGlzLmFycmF5W2luZGV4XS5wcmlvcml0eSA9PSAxMDAwMDApe1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIHZhciB0ID0gbmV3IFRhc2soZ2VuSW5zdChpbmRleCksIHByaW9yaXR5KTtcclxuICAgIHQuaW5kZXggPSBpbmRleDtcclxuICAgIHRoaXMuYXJyYXlbaW5kZXhdID0gdDtcclxuICAgIHRoaXMubmVlZFNvcnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVzaFRhc2soZ2VuSW5zdCwgcHJpb3JpdHkpIHtcclxuICAgIGxldCB0O1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFycmF5Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLmFycmF5W2ldID09IG51bGxUYXNrKSB7XHJcbiAgICAgICAgdCA9IG5ldyBUYXNrKGdlbkluc3QoaSksIHByaW9yaXR5KTtcclxuICAgICAgICB0aGlzLmFycmF5W2ldID0gdDtcclxuICAgICAgICB0LmluZGV4ID0gaTtcclxuICAgICAgICByZXR1cm4gdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdCA9IG5ldyBUYXNrKGdlbkluc3QodGhpcy5hcnJheS5sZW5ndGgpLHByaW9yaXR5KTtcclxuICAgIHQuaW5kZXggPSB0aGlzLmFycmF5Lmxlbmd0aDtcclxuICAgIHRoaXMuYXJyYXlbdGhpcy5hcnJheS5sZW5ndGhdID0gdDtcclxuICAgIHRoaXMubmVlZFNvcnQgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHQ7XHJcbiAgfVxyXG5cclxuICAvLyDphY3liJfjgpLlj5blvpfjgZnjgotcclxuICBnZXRBcnJheSgpIHtcclxuICAgIHJldHVybiB0aGlzLmFycmF5O1xyXG4gIH1cclxuICAvLyDjgr/jgrnjgq/jgpLjgq/jg6rjgqLjgZnjgotcclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMuYXJyYXkubGVuZ3RoID0gMDtcclxuICB9XHJcbiAgLy8g44K944O844OI44GM5b+F6KaB44GL44OB44Kn44OD44Kv44GX44CB44K944O844OI44GZ44KLXHJcbiAgY2hlY2tTb3J0KCkge1xyXG4gICAgaWYgKHRoaXMubmVlZFNvcnQpIHtcclxuICAgICAgdGhpcy5hcnJheS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgaWYoYS5wcmlvcml0eSA+IGIucHJpb3JpdHkpIHJldHVybiAxO1xyXG4gICAgICAgIGlmIChhLnByaW9yaXR5IDwgYi5wcmlvcml0eSkgcmV0dXJuIC0xO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9KTtcclxuICAgICAgLy8g44Kk44Oz44OH44OD44Kv44K544Gu5oyv44KK55u044GXXHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlID0gdGhpcy5hcnJheS5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgICAgICB0aGlzLmFycmF5W2ldLmluZGV4ID0gaTtcclxuICAgICAgfVxyXG4gICAgIHRoaXMubmVlZFNvcnQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlbW92ZVRhc2soaW5kZXgpIHtcclxuICAgIGlmKGluZGV4IDwgMCl7XHJcbiAgICAgIGluZGV4ID0gLSgrK2luZGV4KTtcclxuICAgIH1cclxuICAgIGlmKHRoaXMuYXJyYXlbaW5kZXhdLnByaW9yaXR5ID09IDEwMDAwMCl7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hcnJheVtpbmRleF0gPSBudWxsVGFzaztcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgY29tcHJlc3MoKSB7XHJcbiAgICBpZiAoIXRoaXMubmVlZENvbXByZXNzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBkZXN0ID0gW107XHJcbiAgICB2YXIgc3JjID0gdGhpcy5hcnJheTtcclxuICAgIHZhciBkZXN0SW5kZXggPSAwO1xyXG4gICAgZGVzdCA9IHNyYy5maWx0ZXIoKHYsaSk9PntcclxuICAgICAgbGV0IHJldCA9IHYgIT0gbnVsbFRhc2s7XHJcbiAgICAgIGlmKHJldCl7XHJcbiAgICAgICAgdi5pbmRleCA9IGRlc3RJbmRleCsrO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9KTtcclxuICAgIHRoaXMuYXJyYXkgPSBkZXN0O1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgcHJvY2VzcyhnYW1lKVxyXG4gIHtcclxuICAgIGlmKHRoaXMuZW5hYmxlKXtcclxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMsZ2FtZSkpO1xyXG4gICAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcclxuICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICBpZiAoIWdhbWUuaXNIaWRkZW4pIHtcclxuICAgICAgICAgIHRoaXMuY2hlY2tTb3J0KCk7XHJcbiAgICAgICAgICB0aGlzLmFycmF5LmZvckVhY2goICh0YXNrLGkpID0+e1xyXG4gICAgICAgICAgICBpZiAodGFzayAhPSBudWxsVGFzaykge1xyXG4gICAgICAgICAgICAgIGlmKHRhc2suaW5kZXggIT0gaSApe1xyXG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHRhc2suZ2VuSW5zdC5uZXh0KHRhc2suaW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuY29tcHJlc3MoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gICAgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmVtaXQoJ3N0b3BwZWQnKTtcclxuICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc3RvcFByb2Nlc3MoKXtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub24oJ3N0b3BwZWQnLCgpPT57XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCsuODvOODoOeUqOOCv+OCpOODnuODvFxyXG5leHBvcnQgY2xhc3MgR2FtZVRpbWVyIHtcclxuICBjb25zdHJ1Y3RvcihnZXRDdXJyZW50VGltZSkge1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IDA7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gICAgdGhpcy5nZXRDdXJyZW50VGltZSA9IGdldEN1cnJlbnRUaW1lO1xyXG4gICAgdGhpcy5TVE9QID0gMTtcclxuICAgIHRoaXMuU1RBUlQgPSAyO1xyXG4gICAgdGhpcy5QQVVTRSA9IDM7XHJcblxyXG4gIH1cclxuICBcclxuICBzdGFydCgpIHtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSAwO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICB9XHJcblxyXG4gIHJlc3VtZSgpIHtcclxuICAgIHZhciBub3dUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMuY3VycmVudFRpbWUgKyBub3dUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgfVxyXG5cclxuICBwYXVzZSgpIHtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBBVVNFO1xyXG4gIH1cclxuXHJcbiAgc3RvcCgpIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuU1RBUlQpIHJldHVybjtcclxuICAgIHZhciBub3dUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBub3dUaW1lIC0gdGhpcy5jdXJyZW50VGltZTtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSB0aGlzLmVsYXBzZWRUaW1lICsgdGhpcy5kZWx0YVRpbWU7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gbm93VGltZTtcclxuICB9XHJcbn1cclxuXHJcbiIsImV4cG9ydCBkZWZhdWx0IHtcclxuICBOb3RlOiBcIk5vdGVcIixcclxuICBSZXN0OiBcIlJlc3RcIixcclxuICBPY3RhdmU6IFwiT2N0YXZlXCIsXHJcbiAgT2N0YXZlU2hpZnQ6IFwiT2N0YXZlU2hpZnRcIixcclxuICBOb3RlTGVuZ3RoOiBcIk5vdGVMZW5ndGhcIixcclxuICBOb3RlVmVsb2NpdHk6IFwiTm90ZVZlbG9jaXR5XCIsXHJcbiAgTm90ZVF1YW50aXplOiBcIk5vdGVRdWFudGl6ZVwiLFxyXG4gIFRlbXBvOiBcIlRlbXBvXCIsXHJcbiAgSW5maW5pdGVMb29wOiBcIkluZmluaXRlTG9vcFwiLFxyXG4gIExvb3BCZWdpbjogXCJMb29wQmVnaW5cIixcclxuICBMb29wRXhpdDogXCJMb29wRXhpdFwiLFxyXG4gIExvb3BFbmQ6IFwiTG9vcEVuZFwiLFxyXG4gIFRvbmU6XCJUb25lXCIsXHJcbiAgV2F2ZUZvcm06XCJXYXZlRm9ybVwiLFxyXG4gIEVudmVsb3BlOlwiRW52ZWxvcGVcIlxyXG59O1xyXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBTY2FubmVyIHtcclxuICBjb25zdHJ1Y3Rvcihzb3VyY2UpIHtcclxuICAgIHRoaXMuc291cmNlID0gc291cmNlO1xyXG4gICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgfVxyXG5cclxuICBoYXNOZXh0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPCB0aGlzLnNvdXJjZS5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICBwZWVrKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc291cmNlLmNoYXJBdCh0aGlzLmluZGV4KSB8fCBcIlwiO1xyXG4gIH1cclxuXHJcbiAgbmV4dCgpIHtcclxuICAgIHJldHVybiB0aGlzLnNvdXJjZS5jaGFyQXQodGhpcy5pbmRleCsrKSB8fCBcIlwiO1xyXG4gIH1cclxuXHJcbiAgZm9yd2FyZCgpIHtcclxuICAgIHdoaWxlICh0aGlzLmhhc05leHQoKSAmJiB0aGlzLm1hdGNoKC9cXHMvKSkge1xyXG4gICAgICB0aGlzLmluZGV4ICs9IDE7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBtYXRjaChtYXRjaGVyKSB7XHJcbiAgICBpZiAobWF0Y2hlciBpbnN0YW5jZW9mIFJlZ0V4cCkge1xyXG4gICAgICByZXR1cm4gbWF0Y2hlci50ZXN0KHRoaXMucGVlaygpKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnBlZWsoKSA9PT0gbWF0Y2hlcjtcclxuICB9XHJcblxyXG4gIGV4cGVjdChtYXRjaGVyKSB7XHJcbiAgICBpZiAoIXRoaXMubWF0Y2gobWF0Y2hlcikpIHtcclxuICAgICAgdGhpcy50aHJvd1VuZXhwZWN0ZWRUb2tlbigpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5pbmRleCArPSAxO1xyXG4gIH1cclxuXHJcbiAgc2NhbihtYXRjaGVyKSB7XHJcbiAgICBsZXQgdGFyZ2V0ID0gdGhpcy5zb3VyY2Uuc3Vic3RyKHRoaXMuaW5kZXgpO1xyXG4gICAgbGV0IHJlc3VsdCA9IG51bGw7XHJcblxyXG4gICAgaWYgKG1hdGNoZXIgaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuICAgICAgbGV0IG1hdGNoZWQgPSBtYXRjaGVyLmV4ZWModGFyZ2V0KTtcclxuXHJcbiAgICAgIGlmIChtYXRjaGVkICYmIG1hdGNoZWQuaW5kZXggPT09IDApIHtcclxuICAgICAgICByZXN1bHQgPSBtYXRjaGVkWzBdO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHRhcmdldC5zdWJzdHIoMCwgbWF0Y2hlci5sZW5ndGgpID09PSBtYXRjaGVyKSB7XHJcbiAgICAgIHJlc3VsdCA9IG1hdGNoZXI7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICB0aGlzLmluZGV4ICs9IHJlc3VsdC5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIHRocm93VW5leHBlY3RlZFRva2VuKCkge1xyXG4gICAgbGV0IGlkZW50aWZpZXIgPSB0aGlzLnBlZWsoKSB8fCBcIklMTEVHQUxcIjtcclxuXHJcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgdG9rZW46ICR7aWRlbnRpZmllcn1gKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9TeW50YXhcIjtcclxuaW1wb3J0IFNjYW5uZXIgZnJvbSBcIi4vU2Nhbm5lclwiO1xyXG5cclxuY29uc3QgTk9URV9JTkRFWEVTID0geyBjOiAwLCBkOiAyLCBlOiA0LCBmOiA1LCBnOiA3LCBhOiA5LCBiOiAxMSB9O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTU1MUGFyc2VyIHtcclxuICBjb25zdHJ1Y3Rvcihzb3VyY2UpIHtcclxuICAgIHRoaXMuc2Nhbm5lciA9IG5ldyBTY2FubmVyKHNvdXJjZSk7XHJcbiAgfVxyXG5cclxuICBwYXJzZSgpIHtcclxuICAgIGxldCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICB0aGlzLl9yZWFkVW50aWwoXCI7XCIsICgpID0+IHtcclxuICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLmFkdmFuY2UoKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgYWR2YW5jZSgpIHtcclxuICAgIHN3aXRjaCAodGhpcy5zY2FubmVyLnBlZWsoKSkge1xyXG4gICAgY2FzZSBcImNcIjpcclxuICAgIGNhc2UgXCJkXCI6XHJcbiAgICBjYXNlIFwiZVwiOlxyXG4gICAgY2FzZSBcImZcIjpcclxuICAgIGNhc2UgXCJnXCI6XHJcbiAgICBjYXNlIFwiYVwiOlxyXG4gICAgY2FzZSBcImJcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZE5vdGUoKTtcclxuICAgIGNhc2UgXCJbXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRDaG9yZCgpO1xyXG4gICAgY2FzZSBcInJcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZFJlc3QoKTtcclxuICAgIGNhc2UgXCJvXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRPY3RhdmUoKTtcclxuICAgIGNhc2UgXCI+XCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRPY3RhdmVTaGlmdCgrMSk7XHJcbiAgICBjYXNlIFwiPFwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkT2N0YXZlU2hpZnQoLTEpO1xyXG4gICAgY2FzZSBcImxcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZE5vdGVMZW5ndGgoKTtcclxuICAgIGNhc2UgXCJxXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWROb3RlUXVhbnRpemUoKTtcclxuICAgIGNhc2UgXCJ2XCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWROb3RlVmVsb2NpdHkoKTtcclxuICAgIGNhc2UgXCJ0XCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRUZW1wbygpO1xyXG4gICAgY2FzZSBcIiRcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZEluZmluaXRlTG9vcCgpO1xyXG4gICAgY2FzZSBcIi9cIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZExvb3AoKTtcclxuICAgIGNhc2UgXCJAXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRUb25lKCk7XHJcbiAgICBjYXNlIFwid1wiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkV2F2ZUZvcm0oKTtcclxuICAgIGNhc2UgXCJzXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRFbnZlbG9wZSgpO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgLy8gZG8gbm90aGluZ1xyXG4gICAgfVxyXG4gICAgdGhpcy5zY2FubmVyLnRocm93VW5leHBlY3RlZFRva2VuKCk7XHJcbiAgfVxyXG5cclxuICByZWFkTm90ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5Ob3RlLFxyXG4gICAgICBub3RlTnVtYmVyczogWyB0aGlzLl9yZWFkTm90ZU51bWJlcigwKSBdLFxyXG4gICAgICBub3RlTGVuZ3RoOiB0aGlzLl9yZWFkTGVuZ3RoKCksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZENob3JkKCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIltcIik7XHJcblxyXG4gICAgbGV0IG5vdGVMaXN0ID0gW107XHJcbiAgICBsZXQgb2Zmc2V0ID0gMDtcclxuXHJcbiAgICB0aGlzLl9yZWFkVW50aWwoXCJdXCIsICgpID0+IHtcclxuICAgICAgc3dpdGNoICh0aGlzLnNjYW5uZXIucGVlaygpKSB7XHJcbiAgICAgIGNhc2UgXCJjXCI6XHJcbiAgICAgIGNhc2UgXCJkXCI6XHJcbiAgICAgIGNhc2UgXCJlXCI6XHJcbiAgICAgIGNhc2UgXCJmXCI6XHJcbiAgICAgIGNhc2UgXCJnXCI6XHJcbiAgICAgIGNhc2UgXCJhXCI6XHJcbiAgICAgIGNhc2UgXCJiXCI6XHJcbiAgICAgICAgbm90ZUxpc3QucHVzaCh0aGlzLl9yZWFkTm90ZU51bWJlcihvZmZzZXQpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIj5cIjpcclxuICAgICAgICB0aGlzLnNjYW5uZXIubmV4dCgpO1xyXG4gICAgICAgIG9mZnNldCArPSAxMjtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIjxcIjpcclxuICAgICAgICB0aGlzLnNjYW5uZXIubmV4dCgpO1xyXG4gICAgICAgIG9mZnNldCAtPSAxMjtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aGlzLnNjYW5uZXIudGhyb3dVbmV4cGVjdGVkVG9rZW4oKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIl1cIik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4Lk5vdGUsXHJcbiAgICAgIG5vdGVOdW1iZXJzOiBub3RlTGlzdCxcclxuICAgICAgbm90ZUxlbmd0aDogdGhpcy5fcmVhZExlbmd0aCgpLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWRSZXN0KCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcInJcIik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4LlJlc3QsXHJcbiAgICAgIG5vdGVMZW5ndGg6IHRoaXMuX3JlYWRMZW5ndGgoKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkT2N0YXZlKCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIm9cIik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4Lk9jdGF2ZSxcclxuICAgICAgdmFsdWU6IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKy8pLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWRPY3RhdmVTaGlmdChkaXJlY3Rpb24pIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoLzx8Pi8pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5PY3RhdmVTaGlmdCxcclxuICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb258MCxcclxuICAgICAgdmFsdWU6IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKy8pLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWROb3RlTGVuZ3RoKCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcImxcIik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4Lk5vdGVMZW5ndGgsXHJcbiAgICAgIG5vdGVMZW5ndGg6IHRoaXMuX3JlYWRMZW5ndGgoKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkTm90ZVF1YW50aXplKCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcInFcIik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4Lk5vdGVRdWFudGl6ZSxcclxuICAgICAgdmFsdWU6IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKy8pLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWROb3RlVmVsb2NpdHkoKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwidlwiKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguTm90ZVZlbG9jaXR5LFxyXG4gICAgICB2YWx1ZTogdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrLyksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZFRlbXBvKCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcInRcIik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4LlRlbXBvLFxyXG4gICAgICB2YWx1ZTogdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrKFxcLlxcZCspPy8pLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWRJbmZpbml0ZUxvb3AoKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiJFwiKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguSW5maW5pdGVMb29wLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWRMb29wKCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIi9cIik7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiOlwiKTtcclxuXHJcbiAgICBsZXQgcmVzdWx0ID0gW107XHJcbiAgICBsZXQgbG9vcEJlZ2luID0geyB0eXBlOiBTeW50YXguTG9vcEJlZ2luIH07XHJcbiAgICBsZXQgbG9vcEVuZCA9IHsgdHlwZTogU3ludGF4Lkxvb3BFbmQgfTtcclxuXHJcbiAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KGxvb3BCZWdpbik7XHJcbiAgICB0aGlzLl9yZWFkVW50aWwoL1t8Ol0vLCAoKSA9PiB7XHJcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5hZHZhbmNlKCkpO1xyXG4gICAgfSk7XHJcbiAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuX3JlYWRMb29wRXhpdCgpKTtcclxuXHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiOlwiKTtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCIvXCIpO1xyXG5cclxuICAgIGxvb3BCZWdpbi52YWx1ZSA9IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKy8pIHx8IG51bGw7XHJcblxyXG4gICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChsb29wRW5kKTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuICBcclxuICByZWFkVG9uZSgpe1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIkBcIik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguVG9uZSxcclxuICAgICAgdmFsdWU6IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKy8pXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICByZWFkV2F2ZUZvcm0oKXtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJ3XCIpO1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIlxcXCJcIik7XHJcbiAgICBsZXQgd2F2ZURhdGEgPSB0aGlzLnNjYW5uZXIuc2NhbigvWzAtOWEtZkEtRl0rPy8pO1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIlxcXCJcIik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguV2F2ZUZvcm0sXHJcbiAgICAgIHZhbHVlOiB3YXZlRGF0YVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgcmVhZEVudmVsb3BlKCl7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwic1wiKTtcclxuICAgIGxldCBhID0gdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrKFxcLlxcZCspPy8pO1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIixcIik7XHJcbiAgICBsZXQgZCA9IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKyhcXC5cXGQrKT8vKTtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCIsXCIpO1xyXG4gICAgbGV0IHMgPSB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsoXFwuXFxkKyk/Lyk7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiLFwiKTtcclxuICAgIGxldCByID0gdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrKFxcLlxcZCspPy8pO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTpTeW50YXguRW52ZWxvcGUsXHJcbiAgICAgIGE6YSxkOmQsczpzLHI6clxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX3JlYWRVbnRpbChtYXRjaGVyLCBjYWxsYmFjaykge1xyXG4gICAgd2hpbGUgKHRoaXMuc2Nhbm5lci5oYXNOZXh0KCkpIHtcclxuICAgICAgdGhpcy5zY2FubmVyLmZvcndhcmQoKTtcclxuICAgICAgaWYgKCF0aGlzLnNjYW5uZXIuaGFzTmV4dCgpIHx8IHRoaXMuc2Nhbm5lci5tYXRjaChtYXRjaGVyKSkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBfcmVhZEFyZ3VtZW50KG1hdGNoZXIpIHtcclxuICAgIGxldCBudW0gPSB0aGlzLnNjYW5uZXIuc2NhbihtYXRjaGVyKTtcclxuXHJcbiAgICByZXR1cm4gbnVtICE9PSBudWxsID8gK251bSA6IG51bGw7XHJcbiAgfVxyXG5cclxuICBfcmVhZE5vdGVOdW1iZXIob2Zmc2V0KSB7XHJcbiAgICBsZXQgbm90ZUluZGV4ID0gTk9URV9JTkRFWEVTW3RoaXMuc2Nhbm5lci5uZXh0KCldO1xyXG5cclxuICAgIHJldHVybiBub3RlSW5kZXggKyB0aGlzLl9yZWFkQWNjaWRlbnRhbCgpICsgb2Zmc2V0O1xyXG4gIH1cclxuXHJcbiAgX3JlYWRBY2NpZGVudGFsKCkge1xyXG4gICAgaWYgKHRoaXMuc2Nhbm5lci5tYXRjaChcIitcIikpIHtcclxuICAgICAgcmV0dXJuICsxICogdGhpcy5zY2FubmVyLnNjYW4oL1xcKysvKS5sZW5ndGg7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zY2FubmVyLm1hdGNoKFwiLVwiKSkge1xyXG4gICAgICByZXR1cm4gLTEgKiB0aGlzLnNjYW5uZXIuc2NhbigvXFwtKy8pLmxlbmd0aDtcclxuICAgIH1cclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuXHJcbiAgX3JlYWREb3QoKSB7XHJcbiAgICBsZXQgbGVuID0gKHRoaXMuc2Nhbm5lci5zY2FuKC9cXC4rLykgfHwgXCJcIikubGVuZ3RoO1xyXG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheShsZW4pO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgcmVzdWx0W2ldID0gMDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgX3JlYWRMZW5ndGgoKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKSk7XHJcbiAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuX3JlYWREb3QoKSk7XHJcblxyXG4gICAgbGV0IHRpZSA9IHRoaXMuX3JlYWRUaWUoKTtcclxuXHJcbiAgICBpZiAodGllKSB7XHJcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGllKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgX3JlYWRUaWUoKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZm9yd2FyZCgpO1xyXG5cclxuICAgIGlmICh0aGlzLnNjYW5uZXIubWF0Y2goXCJeXCIpKSB7XHJcbiAgICAgIHRoaXMuc2Nhbm5lci5uZXh0KCk7XHJcbiAgICAgIHJldHVybiB0aGlzLl9yZWFkTGVuZ3RoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBfcmVhZExvb3BFeGl0KCkge1xyXG4gICAgbGV0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgIGlmICh0aGlzLnNjYW5uZXIubWF0Y2goXCJ8XCIpKSB7XHJcbiAgICAgIHRoaXMuc2Nhbm5lci5uZXh0KCk7XHJcblxyXG4gICAgICBsZXQgbG9vcEV4aXQgPSB7IHR5cGU6IFN5bnRheC5Mb29wRXhpdCB9O1xyXG5cclxuICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChsb29wRXhpdCk7XHJcblxyXG4gICAgICB0aGlzLl9yZWFkVW50aWwoXCI6XCIsICgpID0+IHtcclxuICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuYWR2YW5jZSgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQge1xyXG4gIHRlbXBvOiAxMjAsXHJcbiAgb2N0YXZlOiA0LFxyXG4gIGxlbmd0aDogNCxcclxuICB2ZWxvY2l0eTogMTAwLFxyXG4gIHF1YW50aXplOiA3NSxcclxuICBsb29wQ291bnQ6IDIsXHJcbn07XHJcbiIsIi8qIVxyXG4gKiBsemJhc2U2MiB2MS40LjYgLSBMWjc3KExaU1MpIGJhc2VkIGNvbXByZXNzaW9uIGFsZ29yaXRobSBpbiBiYXNlNjIgZm9yIEphdmFTY3JpcHQuXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNC0yMDE1IHBvbHlnb24gcGxhbmV0IDxwb2x5Z29uLnBsYW5ldC5hcXVhQGdtYWlsLmNvbT5cclxuICogQGxpY2Vuc2UgTUlUXHJcbiAqL1xyXG4hZnVuY3Rpb24oYSxiLGMpe1widW5kZWZpbmVkXCIhPXR5cGVvZiBleHBvcnRzP1widW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWMoKTpleHBvcnRzW2FdPWMoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKGMpOmJbYV09YygpfShcImx6YmFzZTYyXCIsdGhpcyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGEoYSl7dGhpcy5faW5pdChhKX1mdW5jdGlvbiBiKGEpe3RoaXMuX2luaXQoYSl9ZnVuY3Rpb24gYygpe3ZhciBhLGIsYyxkLGU9XCJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5elwiLGY9XCJcIixnPWUubGVuZ3RoO2ZvcihhPTA7Zz5hO2ErKylmb3IoYz1lLmNoYXJBdChhKSxiPWctMTtiPjE1JiZmLmxlbmd0aDx2O2ItLSlkPWUuY2hhckF0KGIpLGYrPVwiIFwiK2MrXCIgXCIrZDtmb3IoO2YubGVuZ3RoPHY7KWY9XCIgXCIrZjtyZXR1cm4gZj1mLnNsaWNlKDAsdil9ZnVuY3Rpb24gZChhLGIpe3JldHVybiBhLmxlbmd0aD09PWI/YTphLnN1YmFycmF5P2Euc3ViYXJyYXkoMCxiKTooYS5sZW5ndGg9YixhKX1mdW5jdGlvbiBlKGEsYil7aWYobnVsbD09Yj9iPWEubGVuZ3RoOmE9ZChhLGIpLGwmJm0mJm8+Yil7aWYocClyZXR1cm4gai5hcHBseShudWxsLGEpO2lmKG51bGw9PT1wKXRyeXt2YXIgYz1qLmFwcGx5KG51bGwsYSk7cmV0dXJuIGI+byYmKHA9ITApLGN9Y2F0Y2goZSl7cD0hMX19cmV0dXJuIGYoYSl9ZnVuY3Rpb24gZihhKXtmb3IodmFyIGIsYz1cIlwiLGQ9YS5sZW5ndGgsZT0wO2Q+ZTspe2lmKGI9YS5zdWJhcnJheT9hLnN1YmFycmF5KGUsZStvKTphLnNsaWNlKGUsZStvKSxlKz1vLCFwKXtpZihudWxsPT09cCl0cnl7Yys9ai5hcHBseShudWxsLGIpLGIubGVuZ3RoPm8mJihwPSEwKTtjb250aW51ZX1jYXRjaChmKXtwPSExfXJldHVybiBnKGEpfWMrPWouYXBwbHkobnVsbCxiKX1yZXR1cm4gY31mdW5jdGlvbiBnKGEpe2Zvcih2YXIgYj1cIlwiLGM9YS5sZW5ndGgsZD0wO2M+ZDtkKyspYis9aihhW2RdKTtyZXR1cm4gYn1mdW5jdGlvbiBoKGEsYil7aWYoIWspcmV0dXJuIG5ldyBBcnJheShiKTtzd2l0Y2goYSl7Y2FzZSA4OnJldHVybiBuZXcgVWludDhBcnJheShiKTtjYXNlIDE2OnJldHVybiBuZXcgVWludDE2QXJyYXkoYil9fWZ1bmN0aW9uIGkoYSl7Zm9yKHZhciBiPVtdLGM9YSYmYS5sZW5ndGgsZD0wO2M+ZDtkKyspYltkXT1hLmNoYXJDb2RlQXQoZCk7cmV0dXJuIGJ9dmFyIGo9U3RyaW5nLmZyb21DaGFyQ29kZSxrPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBVaW50OEFycmF5JiZcInVuZGVmaW5lZFwiIT10eXBlb2YgVWludDE2QXJyYXksbD0hMSxtPSExO3RyeXtcImFcIj09PWouYXBwbHkobnVsbCxbOTddKSYmKGw9ITApfWNhdGNoKG4pe31pZihrKXRyeXtcImFcIj09PWouYXBwbHkobnVsbCxuZXcgVWludDhBcnJheShbOTddKSkmJihtPSEwKX1jYXRjaChuKXt9dmFyIG89NjU1MzMscD1udWxsLHE9ITE7LTEhPT1cImFiY1xcdTMwN2JcXHUzMDUyXCIubGFzdEluZGV4T2YoXCJcXHUzMDdiXFx1MzA1MlwiLDEpJiYocT0hMCk7dmFyIHI9XCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OVwiLHM9ci5sZW5ndGgsdD1NYXRoLm1heChzLDYyKS1NYXRoLm1pbihzLDYyKSx1PXMtMSx2PTEwMjQsdz0zMDQseD1vLHk9eC1zLHo9byxBPXorMip2LEI9MTEsQz1CKihCKzEpLEQ9NDAsRT1EKihEKzEpLEY9cysxLEc9dCsyMCxIPXMrNSxJPXMtdC0xOSxKPUQrNyxLPUorMSxMPUsrMSxNPUwrNSxOPU0rNTthLnByb3RvdHlwZT17X2luaXQ6ZnVuY3Rpb24oYSl7YT1hfHx7fSx0aGlzLl9kYXRhPW51bGwsdGhpcy5fdGFibGU9bnVsbCx0aGlzLl9yZXN1bHQ9bnVsbCx0aGlzLl9vbkRhdGFDYWxsYmFjaz1hLm9uRGF0YSx0aGlzLl9vbkVuZENhbGxiYWNrPWEub25FbmR9LF9jcmVhdGVUYWJsZTpmdW5jdGlvbigpe2Zvcih2YXIgYT1oKDgscyksYj0wO3M+YjtiKyspYVtiXT1yLmNoYXJDb2RlQXQoYik7cmV0dXJuIGF9LF9vbkRhdGE6ZnVuY3Rpb24oYSxiKXt2YXIgYz1lKGEsYik7dGhpcy5fb25EYXRhQ2FsbGJhY2s/dGhpcy5fb25EYXRhQ2FsbGJhY2soYyk6dGhpcy5fcmVzdWx0Kz1jfSxfb25FbmQ6ZnVuY3Rpb24oKXt0aGlzLl9vbkVuZENhbGxiYWNrJiZ0aGlzLl9vbkVuZENhbGxiYWNrKCksdGhpcy5fZGF0YT10aGlzLl90YWJsZT1udWxsfSxfc2VhcmNoOmZ1bmN0aW9uKCl7dmFyIGE9MixiPXRoaXMuX2RhdGEsYz10aGlzLl9vZmZzZXQsZD11O2lmKHRoaXMuX2RhdGFMZW4tYzxkJiYoZD10aGlzLl9kYXRhTGVuLWMpLGE+ZClyZXR1cm4hMTt2YXIgZSxmLGcsaCxpLGosaz1jLXcsbD1iLnN1YnN0cmluZyhrLGMrZCksbT1jK2EtMy1rO2Rve2lmKDI9PT1hKXtpZihmPWIuY2hhckF0KGMpK2IuY2hhckF0KGMrMSksZz1sLmluZGV4T2YoZiksIX5nfHxnPm0pYnJlYWt9ZWxzZSAzPT09YT9mKz1iLmNoYXJBdChjKzIpOmY9Yi5zdWJzdHIoYyxhKTtpZihxPyhqPWIuc3Vic3RyaW5nKGssYythLTEpLGg9ai5sYXN0SW5kZXhPZihmKSk6aD1sLmxhc3RJbmRleE9mKGYsbSksIX5oKWJyZWFrO2k9aCxlPWsraDtkbyBpZihiLmNoYXJDb2RlQXQoYythKSE9PWIuY2hhckNvZGVBdChlK2EpKWJyZWFrO3doaWxlKCsrYTxkKTtpZihnPT09aCl7YSsrO2JyZWFrfX13aGlsZSgrK2E8ZCk7cmV0dXJuIDI9PT1hPyExOih0aGlzLl9pbmRleD13LWksdGhpcy5fbGVuZ3RoPWEtMSwhMCl9LGNvbXByZXNzOmZ1bmN0aW9uKGEpe2lmKG51bGw9PWF8fDA9PT1hLmxlbmd0aClyZXR1cm5cIlwiO3ZhciBiPVwiXCIsZD10aGlzLl9jcmVhdGVUYWJsZSgpLGU9YygpLGY9aCg4LHgpLGc9MDt0aGlzLl9yZXN1bHQ9XCJcIix0aGlzLl9vZmZzZXQ9ZS5sZW5ndGgsdGhpcy5fZGF0YT1lK2EsdGhpcy5fZGF0YUxlbj10aGlzLl9kYXRhLmxlbmd0aCxlPWE9bnVsbDtmb3IodmFyIGksaixrLGwsbSxuPS0xLG89LTE7dGhpcy5fb2Zmc2V0PHRoaXMuX2RhdGFMZW47KXRoaXMuX3NlYXJjaCgpPyh0aGlzLl9pbmRleDx1PyhqPXRoaXMuX2luZGV4LGs9MCk6KGo9dGhpcy5faW5kZXgldSxrPSh0aGlzLl9pbmRleC1qKS91KSwyPT09dGhpcy5fbGVuZ3RoPyhmW2crK109ZFtrK01dLGZbZysrXT1kW2pdKTooZltnKytdPWRbaytMXSxmW2crK109ZFtqXSxmW2crK109ZFt0aGlzLl9sZW5ndGhdKSx0aGlzLl9vZmZzZXQrPXRoaXMuX2xlbmd0aCx+byYmKG89LTEpKTooaT10aGlzLl9kYXRhLmNoYXJDb2RlQXQodGhpcy5fb2Zmc2V0KyspLEM+aT8oRD5pPyhqPWksaz0wLG49Rik6KGo9aSVELGs9KGktaikvRCxuPWsrRiksbz09PW4/ZltnKytdPWRbal06KGZbZysrXT1kW24tR10sZltnKytdPWRbal0sbz1uKSk6KEU+aT8oaj1pLGs9MCxuPUgpOihqPWklRSxrPShpLWopL0Usbj1rK0gpLEQ+aj8obD1qLG09MCk6KGw9aiVELG09KGotbCkvRCksbz09PW4/KGZbZysrXT1kW2xdLGZbZysrXT1kW21dKTooZltnKytdPWRbS10sZltnKytdPWRbbi1zXSxmW2crK109ZFtsXSxmW2crK109ZFttXSxvPW4pKSksZz49eSYmKHRoaXMuX29uRGF0YShmLGcpLGc9MCk7cmV0dXJuIGc+MCYmdGhpcy5fb25EYXRhKGYsZyksdGhpcy5fb25FbmQoKSxiPXRoaXMuX3Jlc3VsdCx0aGlzLl9yZXN1bHQ9bnVsbCxudWxsPT09Yj9cIlwiOmJ9fSxiLnByb3RvdHlwZT17X2luaXQ6ZnVuY3Rpb24oYSl7YT1hfHx7fSx0aGlzLl9yZXN1bHQ9bnVsbCx0aGlzLl9vbkRhdGFDYWxsYmFjaz1hLm9uRGF0YSx0aGlzLl9vbkVuZENhbGxiYWNrPWEub25FbmR9LF9jcmVhdGVUYWJsZTpmdW5jdGlvbigpe2Zvcih2YXIgYT17fSxiPTA7cz5iO2IrKylhW3IuY2hhckF0KGIpXT1iO3JldHVybiBhfSxfb25EYXRhOmZ1bmN0aW9uKGEpe3ZhciBiO2lmKHRoaXMuX29uRGF0YUNhbGxiYWNrKXtpZihhKWI9dGhpcy5fcmVzdWx0LHRoaXMuX3Jlc3VsdD1bXTtlbHNle3ZhciBjPXotdjtiPXRoaXMuX3Jlc3VsdC5zbGljZSh2LHYrYyksdGhpcy5fcmVzdWx0PXRoaXMuX3Jlc3VsdC5zbGljZSgwLHYpLmNvbmNhdCh0aGlzLl9yZXN1bHQuc2xpY2UoditjKSl9Yi5sZW5ndGg+MCYmdGhpcy5fb25EYXRhQ2FsbGJhY2soZShiKSl9fSxfb25FbmQ6ZnVuY3Rpb24oKXt0aGlzLl9vbkVuZENhbGxiYWNrJiZ0aGlzLl9vbkVuZENhbGxiYWNrKCl9LGRlY29tcHJlc3M6ZnVuY3Rpb24oYSl7aWYobnVsbD09YXx8MD09PWEubGVuZ3RoKXJldHVyblwiXCI7dGhpcy5fcmVzdWx0PWkoYygpKTtmb3IodmFyIGIsZCxmLGcsaCxqLGssbCxtLG4sbz1cIlwiLHA9dGhpcy5fY3JlYXRlVGFibGUoKSxxPSExLHI9bnVsbCxzPWEubGVuZ3RoLHQ9MDtzPnQ7dCsrKWlmKGQ9cFthLmNoYXJBdCh0KV0sdm9pZCAwIT09ZCl7aWYoST5kKXE/KGc9cFthLmNoYXJBdCgrK3QpXSxoPWcqRCtkK0Uqcik6aD1yKkQrZCx0aGlzLl9yZXN1bHRbdGhpcy5fcmVzdWx0Lmxlbmd0aF09aDtlbHNlIGlmKEo+ZClyPWQtSSxxPSExO2Vsc2UgaWYoZD09PUspZj1wW2EuY2hhckF0KCsrdCldLHI9Zi01LHE9ITA7ZWxzZSBpZihOPmQpe2lmKGY9cFthLmNoYXJBdCgrK3QpXSxNPmQ/KGo9KGQtTCkqdStmLGs9cFthLmNoYXJBdCgrK3QpXSk6KGo9KGQtTSkqdStmLGs9MiksbD10aGlzLl9yZXN1bHQuc2xpY2UoLWopLGwubGVuZ3RoPmsmJihsLmxlbmd0aD1rKSxtPWwubGVuZ3RoLGwubGVuZ3RoPjApZm9yKG49MDtrPm47KWZvcihiPTA7bT5iJiYodGhpcy5fcmVzdWx0W3RoaXMuX3Jlc3VsdC5sZW5ndGhdPWxbYl0sISgrK24+PWspKTtiKyspO3I9bnVsbH10aGlzLl9yZXN1bHQubGVuZ3RoPj1BJiZ0aGlzLl9vbkRhdGEoKX1yZXR1cm4gdGhpcy5fcmVzdWx0PXRoaXMuX3Jlc3VsdC5zbGljZSh2KSx0aGlzLl9vbkRhdGEoITApLHRoaXMuX29uRW5kKCksbz1lKHRoaXMuX3Jlc3VsdCksdGhpcy5fcmVzdWx0PW51bGwsb319O3ZhciBPPXtjb21wcmVzczpmdW5jdGlvbihiLGMpe3JldHVybiBuZXcgYShjKS5jb21wcmVzcyhiKX0sZGVjb21wcmVzczpmdW5jdGlvbihhLGMpe3JldHVybiBuZXcgYihjKS5kZWNvbXByZXNzKGEpfX07cmV0dXJuIE99KTsiLCJcInVzZSBzdHJpY3RcIjtcclxuLy8vLyBXZWIgQXVkaW8gQVBJIOODqeODg+ODkeODvOOCr+ODqeOCuSAvLy8vXHJcblxyXG4vLyBNTUxQYXJzZXLjga9tb2hheW9uYW/jgZXjgpPjga7jgoLjga5cclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL21vaGF5b25hby9tbWwtaXRlcmF0b3JcclxuXHJcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vU3ludGF4LmpzXCI7XHJcbmltcG9ydCBTY2FubmVyIGZyb20gXCIuL1NjYW5uZXIuanNcIjtcclxuaW1wb3J0IE1NTFBhcnNlciBmcm9tIFwiLi9NTUxQYXJzZXIuanNcIjtcclxuaW1wb3J0IERlZmF1bHRQYXJhbXMgZnJvbSBcIi4vRGVmYXVsdFBhcmFtcy5qc1wiO1xyXG5pbXBvcnQgbHpiYXNlNjIgZnJvbSBcIi4vbHpiYXNlNjIubWluLmpzXCI7XHJcbmltcG9ydCBzZmcgZnJvbSAnLi9nbG9iYWwuanMnOyBcclxuXHJcbi8vIHZhciBmZnQgPSBuZXcgRkZUKDQwOTYsIDQ0MTAwKTtcclxuY29uc3QgQlVGRkVSX1NJWkUgPSAxMDI0O1xyXG5jb25zdCBUSU1FX0JBU0UgPSA5NjtcclxuXHJcbi8vIE1JREnjg47jg7zjg4ggPT4g5YaN55Sf44Os44O844OI5aSJ5o+b44OG44O844OW44OrXHJcbnZhciBub3RlRnJlcSA9IFtdO1xyXG5mb3IgKHZhciBpID0gLTY5OyBpIDwgNTg7ICsraSkge1xyXG4gIG5vdGVGcmVxLnB1c2goTWF0aC5wb3coMiwgaSAvIDEyKSk7XHJcbn1cclxuXHJcbi8vIE1JREnjg47jg7zjg4jlkajms6LmlbAg5aSJ5o+b44OG44O844OW44OrXHJcbnZhciBtaWRpRnJlcSA9IFtdO1xyXG5mb3IgKGxldCBpID0gMDsgaSA8IDEyNzsgKytpKSB7XHJcbiAgbWlkaUZyZXEucHVzaChtaWRpY3BzKGkpKTtcclxufVxyXG5mdW5jdGlvbiBtaWRpY3BzKG5vdGVOdW1iZXIpIHtcclxuICByZXR1cm4gNDQwICogTWF0aC5wb3coMiwgKG5vdGVOdW1iZXIgLSA2OSkgKiAxIC8gMTIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU3RyKGJpdHMsIHdhdmVzdHIpIHtcclxuICB2YXIgYXJyID0gW107XHJcbiAgdmFyIG4gPSBiaXRzIC8gNCB8IDA7XHJcbiAgdmFyIGMgPSAwO1xyXG4gIHZhciB6ZXJvcG9zID0gMSA8PCAoYml0cyAtIDEpO1xyXG4gIHdoaWxlIChjIDwgd2F2ZXN0ci5sZW5ndGgpIHtcclxuICAgIHZhciBkID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgIGQgPSAoZCA8PCA0KSArIHBhcnNlSW50KHdhdmVzdHIuY2hhckF0KGMrKyksICcxNicpO1xyXG4gICAgfVxyXG4gICAgYXJyLnB1c2goKGQgLSB6ZXJvcG9zKSAvIHplcm9wb3MpO1xyXG4gIH1cclxuICByZXR1cm4gYXJyO1xyXG59XHJcblxyXG52YXIgd2F2ZXMgPSBbXHJcbiAgZGVjb2RlU3RyKDQsICdFRUVFRUVFRUVFRUVFRUVFMDAwMDAwMDAwMDAwMDAwMCcpLFxyXG4gIGRlY29kZVN0cig0LCAnMDAxMTIyMzM0NDU1NjY3Nzg4OTlBQUJCQ0NEREVFRkYnKSxcclxuICBkZWNvZGVTdHIoNCwgJzAyMzQ2NjQ1OUFBOEE3QTk3Nzk2NTY1NkFDQUFDREVGJyksXHJcbiAgZGVjb2RlU3RyKDQsICdCRENEQ0E5OTlBQ0RDREI5NDIxMjM2Nzc3NjMyMTI0NycpLFxyXG4gIGRlY29kZVN0cig0LCAnN0FDREVEQ0E3NDIxMDEyNDdCREVEQjczMjAxMzdFNzgnKSxcclxuICBkZWNvZGVTdHIoNCwgJ0FDQ0E3NzlCREVEQTY2Njc5OTk0MTAxMjY3NzQyMjQ3JyksXHJcbiAgZGVjb2RlU3RyKDQsICc3RUM5Q0VBN0NGRDhBQjcyOEQ5NDU3MjAzODUxMzUzMScpLFxyXG4gIGRlY29kZVN0cig0LCAnRUU3N0VFNzdFRTc3RUU3NzAwNzcwMDc3MDA3NzAwNzcnKSxcclxuICBkZWNvZGVTdHIoNCwgJ0VFRUU4ODg4ODg4ODg4ODgwMDAwODg4ODg4ODg4ODg4JykvL+ODjuOCpOOCuueUqOOBruODgOODn+ODvOazouW9olxyXG5dO1xyXG5cclxuXHJcblxyXG52YXIgd2F2ZVNhbXBsZXMgPSBbXTtcclxuZXhwb3J0IGZ1bmN0aW9uIFdhdmVTYW1wbGUoYXVkaW9jdHgsIGNoLCBzYW1wbGVMZW5ndGgsIHNhbXBsZVJhdGUpIHtcclxuXHJcbiAgdGhpcy5zYW1wbGUgPSBhdWRpb2N0eC5jcmVhdGVCdWZmZXIoY2gsIHNhbXBsZUxlbmd0aCwgc2FtcGxlUmF0ZSB8fCBhdWRpb2N0eC5zYW1wbGVSYXRlKTtcclxuICB0aGlzLmxvb3AgPSBmYWxzZTtcclxuICB0aGlzLnN0YXJ0ID0gMDtcclxuICB0aGlzLmVuZCA9IChzYW1wbGVMZW5ndGggLSAxKSAvIChzYW1wbGVSYXRlIHx8IGF1ZGlvY3R4LnNhbXBsZVJhdGUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlV2F2ZVNhbXBsZUZyb21XYXZlcyhhdWRpb2N0eCwgc2FtcGxlTGVuZ3RoKSB7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHdhdmVzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICB2YXIgc2FtcGxlID0gbmV3IFdhdmVTYW1wbGUoYXVkaW9jdHgsIDEsIHNhbXBsZUxlbmd0aCk7XHJcbiAgICB3YXZlU2FtcGxlcy5wdXNoKHNhbXBsZSk7XHJcbiAgICBpZiAoaSAhPSA4KSB7XHJcbiAgICAgIHZhciB3YXZlZGF0YSA9IHdhdmVzW2ldO1xyXG4gICAgICB2YXIgZGVsdGEgPSA0NDAuMCAqIHdhdmVkYXRhLmxlbmd0aCAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHZhciBzdGltZSA9IDA7XHJcbiAgICAgIHZhciBvdXRwdXQgPSBzYW1wbGUuc2FtcGxlLmdldENoYW5uZWxEYXRhKDApO1xyXG4gICAgICB2YXIgbGVuID0gd2F2ZWRhdGEubGVuZ3RoO1xyXG4gICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICB2YXIgZW5kc2FtcGxlID0gMDtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzYW1wbGVMZW5ndGg7ICsraikge1xyXG4gICAgICAgIGluZGV4ID0gc3RpbWUgfCAwO1xyXG4gICAgICAgIG91dHB1dFtqXSA9IHdhdmVkYXRhW2luZGV4XTtcclxuICAgICAgICBzdGltZSArPSBkZWx0YTtcclxuICAgICAgICBpZiAoc3RpbWUgPj0gbGVuKSB7XHJcbiAgICAgICAgICBzdGltZSA9IHN0aW1lIC0gbGVuO1xyXG4gICAgICAgICAgZW5kc2FtcGxlID0gajtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2FtcGxlLmVuZCA9IGVuZHNhbXBsZSAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHNhbXBsZS5sb29wID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIOODnOOCpOOCuTjjga/jg47jgqTjgrrms6LlvaLjgajjgZnjgotcclxuICAgICAgdmFyIG91dHB1dCA9IHNhbXBsZS5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2FtcGxlTGVuZ3RoOyArK2opIHtcclxuICAgICAgICBvdXRwdXRbal0gPSBNYXRoLnJhbmRvbSgpICogMi4wIC0gMS4wO1xyXG4gICAgICB9XHJcbiAgICAgIHNhbXBsZS5lbmQgPSBzYW1wbGVMZW5ndGggLyBhdWRpb2N0eC5zYW1wbGVSYXRlO1xyXG4gICAgICBzYW1wbGUubG9vcCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyDlj4LogIPvvJpodHRwOi8vd3d3LmcyMDBrZy5jb20vYXJjaGl2ZXMvMjAxNC8xMi93ZWJhdWRpb2FwaXBlcmkuaHRtbFxyXG5mdW5jdGlvbiBmb3VyaWVyKHdhdmVmb3JtLCBsZW4pIHtcclxuICB2YXIgcmVhbCA9IG5ldyBGbG9hdDMyQXJyYXkobGVuKSwgaW1hZyA9IG5ldyBGbG9hdDMyQXJyYXkobGVuKTtcclxuICB2YXIgd2F2bGVuID0gd2F2ZWZvcm0ubGVuZ3RoO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGVuOyArK2opIHtcclxuICAgICAgdmFyIHdhdmogPSBqIC8gbGVuICogd2F2bGVuO1xyXG4gICAgICB2YXIgZCA9IHdhdmVmb3JtW3dhdmogfCAwXTtcclxuICAgICAgdmFyIHRoID0gaSAqIGogLyBsZW4gKiAyICogTWF0aC5QSTtcclxuICAgICAgcmVhbFtpXSArPSBNYXRoLmNvcyh0aCkgKiBkO1xyXG4gICAgICBpbWFnW2ldICs9IE1hdGguc2luKHRoKSAqIGQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBbcmVhbCwgaW1hZ107XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVBlcmlvZGljV2F2ZUZyb21XYXZlcyhhdWRpb2N0eCkge1xyXG4gIHJldHVybiB3YXZlcy5tYXAoKGQsIGkpID0+IHtcclxuICAgIGlmIChpICE9IDgpIHtcclxuICAgICAgbGV0IHdhdmVEYXRhID0gd2F2ZXNbaV07XHJcbiAgICAgIGxldCBmcmVxRGF0YSA9IGZvdXJpZXIod2F2ZURhdGEsIHdhdmVEYXRhLmxlbmd0aCk7XHJcbiAgICAgIHJldHVybiBhdWRpb2N0eC5jcmVhdGVQZXJpb2RpY1dhdmUoZnJlcURhdGFbMF0sIGZyZXFEYXRhWzFdKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCB3YXZlRGF0YSA9IFtdO1xyXG4gICAgICBmb3IgKGxldCBqID0gMCwgZSA9IHdhdmVzW2ldLmxlbmd0aDsgaiA8IGU7ICsraikge1xyXG4gICAgICAgIHdhdmVEYXRhLnB1c2goTWF0aC5yYW5kb20oKSAqIDIuMCAtIDEuMCk7XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGZyZXFEYXRhID0gZm91cmllcih3YXZlRGF0YSwgd2F2ZURhdGEubGVuZ3RoKTtcclxuICAgICAgcmV0dXJuIGF1ZGlvY3R4LmNyZWF0ZVBlcmlvZGljV2F2ZShmcmVxRGF0YVswXSwgZnJlcURhdGFbMV0pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG4vLyDjg4njg6njg6DjgrXjg7Pjg5fjg6tcclxuXHJcbmNvbnN0IGRydW1TYW1wbGVzID0gW1xyXG4gIHsgbmFtZTogJ2Jhc3MxJywgcGF0aDogJ2Jhc2UvYXVkaW8vYmQxX2x6Lmpzb24nIH0sIC8vIEA5XHJcbiAgeyBuYW1lOiAnYmFzczInLCBwYXRoOiAnYmFzZS9hdWRpby9iZDJfbHouanNvbicgfSwgLy8gQDEwXHJcbiAgeyBuYW1lOiAnY2xvc2VkJywgcGF0aDogJ2Jhc2UvYXVkaW8vY2xvc2VkX2x6Lmpzb24nIH0sIC8vIEAxMVxyXG4gIHsgbmFtZTogJ2Nvd2JlbGwnLCBwYXRoOiAnYmFzZS9hdWRpby9jb3diZWxsX2x6Lmpzb24nIH0sLy8gQDEyXHJcbiAgeyBuYW1lOiAnY3Jhc2gnLCBwYXRoOiAnYmFzZS9hdWRpby9jcmFzaF9sei5qc29uJyB9LC8vIEAxM1xyXG4gIHsgbmFtZTogJ2hhbmRjbGFwJywgcGF0aDogJ2Jhc2UvYXVkaW8vaGFuZGNsYXBfbHouanNvbicgfSwgLy8gQDE0XHJcbiAgeyBuYW1lOiAnaGl0b20nLCBwYXRoOiAnYmFzZS9hdWRpby9oaXRvbV9sei5qc29uJyB9LC8vIEAxNVxyXG4gIHsgbmFtZTogJ2xvd3RvbScsIHBhdGg6ICdiYXNlL2F1ZGlvL2xvd3RvbV9sei5qc29uJyB9LC8vIEAxNlxyXG4gIHsgbmFtZTogJ21pZHRvbScsIHBhdGg6ICdiYXNlL2F1ZGlvL21pZHRvbV9sei5qc29uJyB9LC8vIEAxN1xyXG4gIHsgbmFtZTogJ29wZW4nLCBwYXRoOiAnYmFzZS9hdWRpby9vcGVuX2x6Lmpzb24nIH0sLy8gQDE4XHJcbiAgeyBuYW1lOiAncmlkZScsIHBhdGg6ICdiYXNlL2F1ZGlvL3JpZGVfbHouanNvbicgfSwvLyBAMTlcclxuICB7IG5hbWU6ICdyaW1zaG90JywgcGF0aDogJ2Jhc2UvYXVkaW8vcmltc2hvdF9sei5qc29uJyB9LC8vIEAyMFxyXG4gIHsgbmFtZTogJ3NkMScsIHBhdGg6ICdiYXNlL2F1ZGlvL3NkMV9sei5qc29uJyB9LC8vIEAyMVxyXG4gIHsgbmFtZTogJ3NkMicsIHBhdGg6ICdiYXNlL2F1ZGlvL3NkMl9sei5qc29uJyB9LC8vIEAyMlxyXG4gIHsgbmFtZTogJ3RhbWInLCBwYXRoOiAnYmFzZS9hdWRpby90YW1iX2x6Lmpzb24nIH0sLy8gQDIzXHJcbiAgeyBuYW1lOid2b2ljZScscGF0aDogJ2Jhc2UvYXVkaW8vbW92aWVfbHouanNvbid9Ly8gQDI0XHJcbl07XHJcblxyXG5sZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbmZ1bmN0aW9uIGpzb24odXJsKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIHhoci5vcGVuKFwiZ2V0XCIsIHVybCwgdHJ1ZSk7XHJcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAoeGhyLnN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UodGhpcy5yZXNwb25zZVRleHQpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdYTUxIdHRwUmVxdWVzdCBFcnJvcjonICsgeGhyLnN0YXR1cykpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgeGhyLm9uZXJyb3IgPSBlcnIgPT4geyByZWplY3QoZXJyKTsgfTtcclxuICAgIHhoci5zZW5kKG51bGwpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkRHJ1bVNhbXBsZShhdWRpb2N0eCkge1xyXG4gIGxldCBwciA9IFByb21pc2UucmVzb2x2ZSgwKTtcclxuICBkcnVtU2FtcGxlcy5mb3JFYWNoKChkKSA9PiB7XHJcbiAgICBwciA9XHJcbiAgICAgIHByLnRoZW4oanNvbi5iaW5kKG51bGwsc2ZnLnJlc291cmNlQmFzZSArIGQucGF0aCkpXHJcbiAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICBsZXQgc2FtcGxlU3RyID0gbHpiYXNlNjIuZGVjb21wcmVzcyhkYXRhLnNhbXBsZXMpO1xyXG4gICAgICAgICAgbGV0IHNhbXBsZXMgPSBkZWNvZGVTdHIoNCwgc2FtcGxlU3RyKTtcclxuICAgICAgICAgIGxldCB3cyA9IG5ldyBXYXZlU2FtcGxlKGF1ZGlvY3R4LCAxLCBzYW1wbGVzLmxlbmd0aCwgZGF0YS5zYW1wbGVSYXRlKTtcclxuICAgICAgICAgIGxldCBzYiA9IHdzLnNhbXBsZS5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBlID0gc2IubGVuZ3RoOyBpIDwgZTsgKytpKSB7XHJcbiAgICAgICAgICAgIHNiW2ldID0gc2FtcGxlc1tpXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHdhdmVTYW1wbGVzLnB1c2god3MpO1xyXG4gICAgICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gcHI7XHJcbn1cclxuXHJcbi8vIGV4cG9ydCBjbGFzcyBXYXZlVGV4dHVyZSB7IFxyXG4vLyAgIGNvbnN0cnVjdG9yKHdhdmUpIHtcclxuLy8gICAgIHRoaXMud2F2ZSA9IHdhdmUgfHwgd2F2ZXNbMF07XHJcbi8vICAgICB0aGlzLnRleCA9IG5ldyBDYW52YXNUZXh0dXJlKDMyMCwgMTAgKiAxNik7XHJcbi8vICAgICB0aGlzLnJlbmRlcigpO1xyXG4vLyAgIH1cclxuXHJcbi8vICAgcmVuZGVyKCkge1xyXG4vLyAgICAgdmFyIGN0eCA9IHRoaXMudGV4LmN0eDtcclxuLy8gICAgIHZhciB3YXZlID0gdGhpcy53YXZlO1xyXG4vLyAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XHJcbi8vICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbi8vICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xyXG4vLyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjA7IGkgKz0gMTApIHtcclxuLy8gICAgICAgY3R4Lm1vdmVUbyhpLCAwKTtcclxuLy8gICAgICAgY3R4LmxpbmVUbyhpLCAyNTUpO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjA7IGkgKz0gMTApIHtcclxuLy8gICAgICAgY3R4Lm1vdmVUbygwLCBpKTtcclxuLy8gICAgICAgY3R4LmxpbmVUbygzMjAsIGkpO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNyknO1xyXG4vLyAgICAgY3R4LnJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4vLyAgICAgY3R4LnN0cm9rZSgpO1xyXG4vLyAgICAgZm9yICh2YXIgaSA9IDAsIGMgPSAwOyBpIDwgY3R4LmNhbnZhcy53aWR0aDsgaSArPSAxMCwgKytjKSB7XHJcbi8vICAgICAgIGN0eC5maWxsUmVjdChpLCAod2F2ZVtjXSA+IDApID8gODAgLSB3YXZlW2NdICogODAgOiA4MCwgMTAsIE1hdGguYWJzKHdhdmVbY10pICogODApO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgdGhpcy50ZXgudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbi8vICAgfVxyXG4vLyB9O1xyXG5cclxuLy8vIOOCqOODs+ODmeODreODvOODl+OCuOOCp+ODjeODrOODvOOCv+ODvFxyXG5leHBvcnQgY2xhc3MgRW52ZWxvcGVHZW5lcmF0b3Ige1xyXG4gIGNvbnN0cnVjdG9yKHZvaWNlLCBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlKSB7XHJcbiAgICB0aGlzLnZvaWNlID0gdm9pY2U7XHJcbiAgICAvL3RoaXMua2V5b24gPSBmYWxzZTtcclxuICAgIHRoaXMuYXR0YWNrVGltZSA9IGF0dGFjayB8fCAwLjAwMDU7XHJcbiAgICB0aGlzLmRlY2F5VGltZSA9IGRlY2F5IHx8IDAuMDU7XHJcbiAgICB0aGlzLnN1c3RhaW5MZXZlbCA9IHN1c3RhaW4gfHwgMC41O1xyXG4gICAgdGhpcy5yZWxlYXNlVGltZSA9IHJlbGVhc2UgfHwgMC41O1xyXG4gICAgdGhpcy52ID0gMS4wO1xyXG4gICAgdGhpcy5rZXlPblRpbWUgPSAwO1xyXG4gICAgdGhpcy5rZXlPZmZUaW1lID0gMDtcclxuICAgIHRoaXMua2V5T24gPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGtleW9uKHQsIHZlbCkge1xyXG4gICAgdGhpcy52ID0gdmVsIHx8IDEuMDtcclxuICAgIHZhciB2ID0gdGhpcy52O1xyXG4gICAgdmFyIHQwID0gdCB8fCB0aGlzLnZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIHQxID0gdDAgKyB0aGlzLmF0dGFja1RpbWU7XHJcbiAgICB2YXIgZ2FpbiA9IHRoaXMudm9pY2UuZ2Fpbi5nYWluO1xyXG4gICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4gICAgZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCk7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYsIHQxKTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluTGV2ZWwgKiB2LCB0MSArIHRoaXMuZGVjYXlUaW1lKTtcclxuICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDEsIHQxICsgdGhpcy5kZWNheSAvIHYpO1xyXG4gICAgdGhpcy5rZXlPblRpbWUgPSB0MDtcclxuICAgIHRoaXMua2V5T2ZmVGltZSA9IDA7XHJcbiAgICB0aGlzLmtleU9uID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGtleW9mZih0KSB7XHJcbiAgICB2YXIgdm9pY2UgPSB0aGlzLnZvaWNlO1xyXG4gICAgdmFyIGdhaW4gPSB2b2ljZS5nYWluLmdhaW47XHJcbiAgICB2YXIgdDAgPSB0IHx8IHZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgLy8gICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModGhpcy5rZXlPblRpbWUpO1xyXG4gICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4gICAgbGV0IHJlbGVhc2VfdGltZSA9IHQwICsgdGhpcy5yZWxlYXNlVGltZTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgcmVsZWFzZV90aW1lKTtcclxuICAgIHRoaXMua2V5T2ZmVGltZSA9IHQwO1xyXG4gICAgdGhpcy5rZXlPblRpbWUgPSAwO1xyXG4gICAgdGhpcy5rZXlPbiA9IGZhbHNlO1xyXG4gICAgcmV0dXJuIHJlbGVhc2VfdGltZTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgVm9pY2Uge1xyXG4gIGNvbnN0cnVjdG9yKGF1ZGlvY3R4KSB7XHJcbiAgICB0aGlzLmF1ZGlvY3R4ID0gYXVkaW9jdHg7XHJcbiAgICB0aGlzLnNhbXBsZSA9IHdhdmVTYW1wbGVzWzZdO1xyXG4gICAgdGhpcy52b2x1bWUgPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgICB0aGlzLmVudmVsb3BlID0gbmV3IEVudmVsb3BlR2VuZXJhdG9yKHRoaXMsXHJcbiAgICAgIDAuNSxcclxuICAgICAgMC4yNSxcclxuICAgICAgMC44LFxyXG4gICAgICAyLjVcclxuICAgICk7XHJcbiAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICAgIHRoaXMuZGV0dW5lID0gMS4wO1xyXG4gICAgdGhpcy52b2x1bWUuZ2Fpbi52YWx1ZSA9IDEuMDtcclxuICAgIHRoaXMub3V0cHV0ID0gdGhpcy52b2x1bWU7XHJcbiAgfVxyXG5cclxuICBpbml0UHJvY2Vzc29yKCkge1xyXG4gICAgLy8gaWYodGhpcy5wcm9jZXNzb3Ipe1xyXG4gICAgLy8gICB0aGlzLnN0b3AoKTtcclxuICAgIC8vICAgdGhpcy5wcm9jZXNzb3IuZGlzY29ubmVjdCgpO1xyXG4gICAgLy8gICB0aGlzLnByb2Nlc3NvciA9IG51bGw7XHJcbiAgICAvLyB9XHJcbiAgICBsZXQgcHJvY2Vzc29yID0gdGhpcy5wcm9jZXNzb3IgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG4gICAgbGV0IGdhaW4gPSB0aGlzLmdhaW4gPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUdhaW4oKTtcclxuICAgIGdhaW4uZ2Fpbi52YWx1ZSA9IDAuMDtcclxuXHJcbiAgICB0aGlzLnByb2Nlc3Nvci5idWZmZXIgPSB0aGlzLnNhbXBsZS5zYW1wbGU7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5sb29wID0gdGhpcy5zYW1wbGUubG9vcDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3BTdGFydCA9IDA7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUudmFsdWUgPSAxLjA7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5sb29wRW5kID0gdGhpcy5zYW1wbGUuZW5kO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IuY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iub25lbmRlZCA9ICgpID0+IHtcclxuICAgICAgcHJvY2Vzc29yLmRpc2Nvbm5lY3QoKTtcclxuICAgICAgZ2Fpbi5kaXNjb25uZWN0KCk7XHJcbiAgICB9O1xyXG4gICAgZ2Fpbi5jb25uZWN0KHRoaXMudm9sdW1lKTtcclxuICB9XHJcblxyXG4gIC8vIHNldFNhbXBsZSAoc2FtcGxlKSB7XHJcbiAgLy8gICAgIHRoaXMuZW52ZWxvcGUua2V5b2ZmKDApO1xyXG4gIC8vICAgICB0aGlzLnByb2Nlc3Nvci5kaXNjb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgLy8gICAgIHRoaXMuc2FtcGxlID0gc2FtcGxlO1xyXG4gIC8vICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICAvLyAgICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoKTtcclxuICAvLyB9XHJcblxyXG4gIHN0YXJ0KHN0YXJ0VGltZSkge1xyXG4gICAgLy8gICB0aGlzLnByb2Nlc3Nvci5kaXNjb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0YXJ0KHN0YXJ0VGltZSk7XHJcbiAgfVxyXG5cclxuICBzdG9wKHRpbWUpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0b3AodGltZSk7XHJcbiAgICAvL3RoaXMucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIGtleW9uKHQsIG5vdGUsIHZlbCkge1xyXG4gICAgdGhpcy5zdGFydCh0KTtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShub3RlRnJlcVtub3RlXSAqIHRoaXMuZGV0dW5lLCB0KTtcclxuICAgIHRoaXMua2V5T25UaW1lID0gdDtcclxuICAgIHRoaXMuZW52ZWxvcGUua2V5b24odCwgdmVsKTtcclxuICB9XHJcblxyXG4gIGtleW9mZih0KSB7XHJcbiAgICB0aGlzLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModC8qdGhpcy5rZXlPblRpbWUqLyk7XHJcbiAgICB0aGlzLmtleU9mZlRpbWUgPSB0aGlzLmVudmVsb3BlLmtleW9mZih0KTtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0b3AodGhpcy5rZXlPZmZUaW1lKTtcclxuICB9XHJcblxyXG4gIGlzS2V5T24odCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW52ZWxvcGUua2V5T24gJiYgKHRoaXMua2V5T25UaW1lIDw9IHQpO1xyXG4gIH1cclxuXHJcbiAgaXNLZXlPZmYodCkge1xyXG4gICAgcmV0dXJuICF0aGlzLmVudmVsb3BlLmtleU9uICYmICh0aGlzLmtleU9mZlRpbWUgPD0gdCk7XHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICB0aGlzLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICB0aGlzLmdhaW4uZ2Fpbi52YWx1ZSA9IDA7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Oc44Kk44K5XHJcbmV4cG9ydCBjbGFzcyBPc2NWb2ljZSB7XHJcbiAgY29uc3RydWN0b3IoYXVkaW9jdHgsIHBlcmlvZGljV2F2ZSkge1xyXG4gICAgdGhpcy5hdWRpb2N0eCA9IGF1ZGlvY3R4O1xyXG4gICAgdGhpcy5zYW1wbGUgPSBwZXJpb2RpY1dhdmU7XHJcbiAgICB0aGlzLnZvbHVtZSA9IGF1ZGlvY3R4LmNyZWF0ZUdhaW4oKTtcclxuICAgIHRoaXMuZW52ZWxvcGUgPSBuZXcgRW52ZWxvcGVHZW5lcmF0b3IodGhpcyxcclxuICAgICAgMC41LFxyXG4gICAgICAwLjI1LFxyXG4gICAgICAwLjgsXHJcbiAgICAgIDIuNVxyXG4gICAgKTtcclxuICAgIHRoaXMuaW5pdFByb2Nlc3NvcigpO1xyXG4gICAgdGhpcy5kZXR1bmUgPSAxLjA7XHJcbiAgICB0aGlzLnZvbHVtZS5nYWluLnZhbHVlID0gMS4wO1xyXG4gICAgdGhpcy5vdXRwdXQgPSB0aGlzLnZvbHVtZTtcclxuICB9XHJcblxyXG4gIGluaXRQcm9jZXNzb3IoKSB7XHJcbiAgICBsZXQgcHJvY2Vzc29yID0gdGhpcy5wcm9jZXNzb3IgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZU9zY2lsbGF0b3IoKTtcclxuICAgIGxldCBnYWluID0gdGhpcy5nYWluID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgICB0aGlzLmdhaW4uZ2Fpbi52YWx1ZSA9IDAuMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLnNldFBlcmlvZGljV2F2ZSh0aGlzLnNhbXBsZSk7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5jb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5vbmVuZGVkID0gKCkgPT4ge1xyXG4gICAgICBwcm9jZXNzb3IuZGlzY29ubmVjdCgpO1xyXG4gICAgICBnYWluLmRpc2Nvbm5lY3QoKTtcclxuICAgIH07XHJcbiAgICB0aGlzLmdhaW4uY29ubmVjdCh0aGlzLnZvbHVtZSk7XHJcbiAgfVxyXG5cclxuICBzdGFydChzdGFydFRpbWUpIHtcclxuICAgIHRoaXMuaW5pdFByb2Nlc3NvcigpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoc3RhcnRUaW1lKTtcclxuICB9XHJcblxyXG4gIHN0b3AodGltZSkge1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RvcCh0aW1lKTtcclxuICB9XHJcblxyXG4gIGtleW9uKHQsIG5vdGUsIHZlbCkge1xyXG4gICAgdGhpcy5zdGFydCh0KTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZShtaWRpRnJlcVtub3RlXSAqIHRoaXMuZGV0dW5lLCB0KTtcclxuICAgIHRoaXMua2V5T25UaW1lID0gdDtcclxuICAgIHRoaXMuZW52ZWxvcGUua2V5b24odCwgdmVsKTtcclxuICB9XHJcblxyXG4gIGtleW9mZih0KSB7XHJcbiAgICB0aGlzLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModC8qdGhpcy5rZXlPblRpbWUqLyk7XHJcbiAgICB0aGlzLmtleU9mZlRpbWUgPSB0aGlzLmVudmVsb3BlLmtleW9mZih0KTtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0b3AodGhpcy5rZXlPZmZUaW1lKTtcclxuICB9XHJcblxyXG4gIGlzS2V5T24odCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW52ZWxvcGUua2V5T24gJiYgKHRoaXMua2V5T25UaW1lIDw9IHQpO1xyXG4gIH1cclxuXHJcbiAgaXNLZXlPZmYodCkge1xyXG4gICAgcmV0dXJuICF0aGlzLmVudmVsb3BlLmtleU9uICYmICh0aGlzLmtleU9mZlRpbWUgPD0gdCk7XHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICB0aGlzLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICB0aGlzLmdhaW4uZ2Fpbi52YWx1ZSA9IDA7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQXVkaW8ge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5WT0lDRVMgPSAxNjtcclxuICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fCB3aW5kb3cubW96QXVkaW9Db250ZXh0O1xyXG5cclxuICAgIGlmICh0aGlzLmF1ZGlvQ29udGV4dCkge1xyXG4gICAgICB0aGlzLmF1ZGlvY3R4ID0gbmV3IHRoaXMuYXVkaW9Db250ZXh0KCk7XHJcbiAgICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnZvaWNlcyA9IFtdO1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlKSB7XHJcbiAgICAgIGNyZWF0ZVdhdmVTYW1wbGVGcm9tV2F2ZXModGhpcy5hdWRpb2N0eCwgQlVGRkVSX1NJWkUpO1xyXG4gICAgICB0aGlzLnBlcmlvZGljV2F2ZXMgPSBjcmVhdGVQZXJpb2RpY1dhdmVGcm9tV2F2ZXModGhpcy5hdWRpb2N0eCk7XHJcbiAgICAgIHRoaXMuZmlsdGVyID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcclxuICAgICAgdGhpcy5maWx0ZXIudHlwZSA9ICdsb3dwYXNzJztcclxuICAgICAgdGhpcy5maWx0ZXIuZnJlcXVlbmN5LnZhbHVlID0gMjAwMDA7XHJcbiAgICAgIHRoaXMuZmlsdGVyLlEudmFsdWUgPSAwLjAwMDE7XHJcbiAgICAgIHRoaXMubm9pc2VGaWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgICB0aGlzLm5vaXNlRmlsdGVyLnR5cGUgPSAnbG93cGFzcyc7XHJcbiAgICAgIHRoaXMubm9pc2VGaWx0ZXIuZnJlcXVlbmN5LnZhbHVlID0gMTAwMDtcclxuICAgICAgdGhpcy5ub2lzZUZpbHRlci5RLnZhbHVlID0gMS44O1xyXG4gICAgICB0aGlzLmNvbXAgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3NvcigpO1xyXG4gICAgICB0aGlzLmZpbHRlci5jb25uZWN0KHRoaXMuY29tcCk7XHJcbiAgICAgIHRoaXMubm9pc2VGaWx0ZXIuY29ubmVjdCh0aGlzLmNvbXApO1xyXG4gICAgICB0aGlzLmNvbXAuY29ubmVjdCh0aGlzLmF1ZGlvY3R4LmRlc3RpbmF0aW9uKTtcclxuICAgICAgLy8gdGhpcy5maWx0ZXIuY29ubmVjdCh0aGlzLmF1ZGlvY3R4LmRlc3RpbmF0aW9uKTtcclxuICAgICAgLy8gdGhpcy5ub2lzZUZpbHRlci5jb25uZWN0KHRoaXMuYXVkaW9jdHguZGVzdGluYXRpb24pO1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5WT0lDRVM7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICAgIC8vdmFyIHYgPSBuZXcgT3NjVm9pY2UodGhpcy5hdWRpb2N0eCx0aGlzLnBlcmlvZGljV2F2ZXNbMF0pO1xyXG4gICAgICAgIHZhciB2ID0gbmV3IFZvaWNlKHRoaXMuYXVkaW9jdHgpO1xyXG4gICAgICAgIHRoaXMudm9pY2VzLnB1c2godik7XHJcbiAgICAgICAgaWYgKGkgPT0gKHRoaXMuVk9JQ0VTIC0gMSkpIHtcclxuICAgICAgICAgIHYub3V0cHV0LmNvbm5lY3QodGhpcy5ub2lzZUZpbHRlcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHYub3V0cHV0LmNvbm5lY3QodGhpcy5maWx0ZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0aGlzLnJlYWREcnVtU2FtcGxlID0gcmVhZERydW1TYW1wbGUodGhpcy5hdWRpb2N0eCk7XHJcbiAgICAgIC8vICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgICAgLy90aGlzLnZvaWNlc1swXS5vdXRwdXQuY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhcnQoKSB7XHJcbiAgICAvLyB2YXIgdm9pY2VzID0gdGhpcy52b2ljZXM7XHJcbiAgICAvLyBmb3IgKHZhciBpID0gMCwgZW5kID0gdm9pY2VzLmxlbmd0aDsgaSA8IGVuZDsgKytpKVxyXG4gICAgLy8ge1xyXG4gICAgLy8gICB2b2ljZXNbaV0uc3RhcnQoMCk7XHJcbiAgICAvLyB9XHJcbiAgfVxyXG5cclxuICBzdG9wKCkge1xyXG4gICAgLy9pZih0aGlzLnN0YXJ0ZWQpXHJcbiAgICAvL3tcclxuICAgIHZhciB2b2ljZXMgPSB0aGlzLnZvaWNlcztcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2b2ljZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdm9pY2VzW2ldLnN0b3AoMCk7XHJcbiAgICB9XHJcbiAgICAvLyAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcbiAgICAvL31cclxuICB9XHJcbiAgXHJcbiAgZ2V0V2F2ZVNhbXBsZShubyl7XHJcbiAgICByZXR1cm4gd2F2ZVNhbXBsZXNbbm9dO1xyXG4gIH1cclxufVxyXG5cclxuXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuLyog44K344O844Kx44Oz44K144O844Kz44Oe44Oz44OJICAgICAgICAgICAgICAgICAgICAgICAqL1xyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbmZ1bmN0aW9uIGNhbGNTdGVwKG5vdGVMZW5ndGgpIHtcclxuICAvLyDplbfjgZXjgYvjgonjgrnjg4bjg4Pjg5fjgpLoqIjnrpfjgZnjgotcclxuICBsZXQgcHJldiA9IG51bGw7XHJcbiAgbGV0IGRvdHRlZCA9IDA7XHJcblxyXG4gIGxldCBtYXAgPSBub3RlTGVuZ3RoLm1hcCgoZWxlbSkgPT4ge1xyXG4gICAgc3dpdGNoIChlbGVtKSB7XHJcbiAgICAgIGNhc2UgbnVsbDpcclxuICAgICAgICBlbGVtID0gcHJldjtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAwOlxyXG4gICAgICAgIGVsZW0gPSAoZG90dGVkICo9IDIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHByZXYgPSBkb3R0ZWQgPSBlbGVtO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBsZW5ndGggPSBlbGVtICE9PSBudWxsID8gZWxlbSA6IERlZmF1bHRQYXJhbXMubGVuZ3RoO1xyXG5cclxuICAgIHJldHVybiBUSU1FX0JBU0UgKiAoNCAvIGxlbmd0aCk7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIG1hcC5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE5vdGUge1xyXG4gIGNvbnN0cnVjdG9yKG5vdGVzLCBsZW5ndGgpIHtcclxuXHJcbiAgICB0aGlzLm5vdGVzID0gbm90ZXM7XHJcbiAgICBpZiAobGVuZ3RoWzBdKSB7XHJcbiAgICAgIHRoaXMuc3RlcCA9IGNhbGNTdGVwKGxlbmd0aCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0aGlzLm5vdGVzLmZvckVhY2goKG4sIGkpID0+IHtcclxuICAgICAgdmFyIGJhY2sgPSB0cmFjay5iYWNrO1xyXG4gICAgICB2YXIgbm90ZSA9IG47XHJcbiAgICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgICAgdmFyIHN0ZXAgPSB0aGlzLnN0ZXAgfHwgYmFjay5zdGVwO1xyXG4gICAgICB2YXIgZ2F0ZSA9IHRoaXMuZ2F0ZSB8fCBiYWNrLmdhdGU7XHJcbiAgICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgICAgc2V0UXVldWUodHJhY2ssIG5vdGUsIG9jdCwgaSA9PSAwID8gc3RlcCA6IDAsIGdhdGUsIHZlbCk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFNlcURhdGEge1xyXG4gIGNvbnN0cnVjdG9yKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgICB0aGlzLm5vdGUgPSBub3RlO1xyXG4gICAgdGhpcy5vY3QgPSBvY3Q7XHJcbiAgICAvL3RoaXMubm8gPSBub3RlLm5vICsgb2N0ICogMTI7XHJcbiAgICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG4gICAgdGhpcy5nYXRlID0gZ2F0ZTtcclxuICAgIHRoaXMudmVsID0gdmVsO1xyXG4gICAgdGhpcy5zYW1wbGUgPSB3YXZlXHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgICB2YXIgbm90ZSA9IHRoaXMubm90ZSB8fCBiYWNrLm5vdGU7XHJcbiAgICB2YXIgb2N0ID0gdGhpcy5vY3QgfHwgYmFjay5vY3Q7XHJcbiAgICB2YXIgc3RlcCA9IHRoaXMuc3RlcCB8fCBiYWNrLnN0ZXA7XHJcbiAgICB2YXIgZ2F0ZSA9IHRoaXMuZ2F0ZSB8fCBiYWNrLmdhdGU7XHJcbiAgICB2YXIgdmVsID0gdGhpcy52ZWwgfHwgYmFjay52ZWw7XHJcbiAgICBzZXRRdWV1ZSh0cmFjaywgbm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2V0UXVldWUodHJhY2ssIG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgbGV0IG5vID0gbm90ZSArIG9jdCAqIDEyO1xyXG4gIGxldCBiYWNrID0gdHJhY2suYmFjaztcclxuICB2YXIgc3RlcF90aW1lID0gKHN0ZXAgPyB0cmFjay5wbGF5aW5nVGltZSA6IGJhY2sucGxheWluZ1RpbWUpO1xyXG4gIC8vIHZhciBnYXRlX3RpbWUgPSAoKGdhdGUgPj0gMCkgPyBnYXRlICogNjAgOiBzdGVwICogZ2F0ZSAqIDYwICogLTEuMCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbykgKyB0cmFjay5wbGF5aW5nVGltZTtcclxuXHJcbiAgdmFyIGdhdGVfdGltZSA9ICgoc3RlcCA9PSAwID8gYmFjay5jb2RlU3RlcCA6IHN0ZXApICogZ2F0ZSAqIDYwKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKSArIChzdGVwID8gdHJhY2sucGxheWluZ1RpbWUgOiBiYWNrLnBsYXlpbmdUaW1lKTtcclxuICAvL2xldCB2b2ljZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXTtcclxuICBsZXQgdm9pY2UgPSB0cmFjay5hc3NpZ25Wb2ljZShzdGVwX3RpbWUpO1xyXG4gIC8vdm9pY2UucmVzZXQoKTtcclxuICB2b2ljZS5zYW1wbGUgPSBiYWNrLnNhbXBsZTtcclxuICB2b2ljZS5lbnZlbG9wZS5hdHRhY2tUaW1lID0gYmFjay5hdHRhY2s7XHJcbiAgdm9pY2UuZW52ZWxvcGUuZGVjYXlUaW1lID0gYmFjay5kZWNheTtcclxuICB2b2ljZS5lbnZlbG9wZS5zdXN0YWluTGV2ZWwgPSBiYWNrLnN1c3RhaW47XHJcbiAgdm9pY2UuZW52ZWxvcGUucmVsZWFzZVRpbWUgPSBiYWNrLnJlbGVhc2U7XHJcbiAgdm9pY2UuZGV0dW5lID0gYmFjay5kZXR1bmU7XHJcbiAgdm9pY2Uudm9sdW1lLmdhaW4uc2V0VmFsdWVBdFRpbWUoYmFjay52b2x1bWUsIHN0ZXBfdGltZSk7XHJcblxyXG4gIC8vdm9pY2UuaW5pdFByb2Nlc3NvcigpO1xyXG5cclxuICAvL2NvbnNvbGUubG9nKHRyYWNrLnNlcXVlbmNlci50ZW1wbyk7XHJcbiAgdm9pY2Uua2V5b24oc3RlcF90aW1lLCBubywgdmVsKTtcclxuICB2b2ljZS5rZXlvZmYoZ2F0ZV90aW1lKTtcclxuICBpZiAoc3RlcCkge1xyXG4gICAgYmFjay5jb2RlU3RlcCA9IHN0ZXA7XHJcbiAgICBiYWNrLnBsYXlpbmdUaW1lID0gdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgfVxyXG5cclxuICB0cmFjay5wbGF5aW5nVGltZSA9IChzdGVwICogNjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgLy8gYmFjay52b2ljZSA9IHZvaWNlO1xyXG4gIC8vIGJhY2subm90ZSA9IG5vdGU7XHJcbiAgLy8gYmFjay5vY3QgPSBvY3Q7XHJcbiAgLy8gYmFjay5nYXRlID0gZ2F0ZTtcclxuICAvLyBiYWNrLnZlbCA9IHZlbDtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIFMobm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpIHtcclxuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcbiAgaWYgKFMubGVuZ3RoICE9IGFyZ3MubGVuZ3RoKSB7XHJcbiAgICBpZiAodHlwZW9mIChhcmdzW2FyZ3MubGVuZ3RoIC0gMV0pID09ICdvYmplY3QnICYmICEoYXJnc1thcmdzLmxlbmd0aCAtIDFdIGluc3RhbmNlb2YgTm90ZSkpIHtcclxuICAgICAgdmFyIGFyZ3MxID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xyXG4gICAgICB2YXIgbCA9IGFyZ3MubGVuZ3RoIC0gMTtcclxuICAgICAgcmV0dXJuIG5ldyBTZXFEYXRhKFxyXG4gICAgICAgICgobCAhPSAwKSA/IG5vdGUgOiBmYWxzZSkgfHwgYXJnczEubm90ZSB8fCBhcmdzMS5uIHx8IG51bGwsXHJcbiAgICAgICAgKChsICE9IDEpID8gb2N0IDogZmFsc2UpIHx8IGFyZ3MxLm9jdCB8fCBhcmdzMS5vIHx8IG51bGwsXHJcbiAgICAgICAgKChsICE9IDIpID8gc3RlcCA6IGZhbHNlKSB8fCBhcmdzMS5zdGVwIHx8IGFyZ3MxLnMgfHwgbnVsbCxcclxuICAgICAgICAoKGwgIT0gMykgPyBnYXRlIDogZmFsc2UpIHx8IGFyZ3MxLmdhdGUgfHwgYXJnczEuZyB8fCBudWxsLFxyXG4gICAgICAgICgobCAhPSA0KSA/IHZlbCA6IGZhbHNlKSB8fCBhcmdzMS52ZWwgfHwgYXJnczEudiB8fCBudWxsXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBuZXcgU2VxRGF0YShub3RlIHx8IG51bGwsIG9jdCB8fCBudWxsLCBzdGVwIHx8IG51bGwsIGdhdGUgfHwgbnVsbCwgdmVsIHx8IG51bGwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMShub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgbChzdGVwKSwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gUzIobm90ZSwgbGVuLCBkb3QsIG9jdCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKGxlbiwgZG90KSwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gUzMobm90ZSwgc3RlcCwgZ2F0ZSwgdmVsLCBvY3QpIHtcclxuICByZXR1cm4gUyhub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCk7XHJcbn1cclxuXHJcblxyXG4vLy8g6Z+z56ym44Gu6ZW344GV5oyH5a6aXHJcblxyXG5jbGFzcyBMZW5ndGgge1xyXG4gIGNvbnN0cnVjdG9yKGxlbikge1xyXG4gICAgdGhpcy5zdGVwID0gY2FsY1N0ZXAobGVuKTtcclxuICB9XHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgU3RlcCB7XHJcbiAgY29uc3RydWN0b3Ioc3RlcCkge1xyXG4gICAgdGhpcy5zdGVwID0gc3RlcDtcclxuICB9XHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCsuODvOODiOOCv+OCpOODoOaMh+WumlxyXG5cclxuY2xhc3MgR2F0ZVRpbWUge1xyXG4gIGNvbnN0cnVjdG9yKGdhdGUpIHtcclxuICAgIHRoaXMuZ2F0ZSA9IGdhdGUgLyAxMDA7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLmdhdGUgPSB0aGlzLmdhdGU7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44OZ44Ot44K344OG44Kj5oyH5a6aXHJcblxyXG5jbGFzcyBWZWxvY2l0eSB7XHJcbiAgY29uc3RydWN0b3IodmVsKSB7XHJcbiAgICB0aGlzLnZlbCA9IHZlbCAvIDEwMDtcclxuICB9XHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdHJhY2suYmFjay52ZWwgPSB0aGlzLnZlbDtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDpn7PoibLoqK3lrppcclxuY2xhc3MgVG9uZSB7XHJcbiAgY29uc3RydWN0b3Iobm8pIHtcclxuICAgIHRoaXMubm8gPSBubztcclxuICAgIC8vdGhpcy5zYW1wbGUgPSB3YXZlU2FtcGxlc1t0aGlzLm5vXTtcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIC8vICAgIHRyYWNrLmJhY2suc2FtcGxlID0gdHJhY2suYXVkaW8ucGVyaW9kaWNXYXZlc1t0aGlzLm5vXTtcclxuICAgIHRyYWNrLmJhY2suc2FtcGxlID0gd2F2ZVNhbXBsZXNbdGhpcy5ub107XHJcbiAgICAvLyAgICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RoaXMubm9dKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFJlc3Qge1xyXG4gIGNvbnN0cnVjdG9yKGxlbmd0aCkge1xyXG4gICAgdGhpcy5zdGVwID0gY2FsY1N0ZXAobGVuZ3RoKTtcclxuICB9XHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdmFyIHN0ZXAgPSB0aGlzLnN0ZXAgfHwgdHJhY2suYmFjay5zdGVwO1xyXG4gICAgdHJhY2sucGxheWluZ1RpbWUgPSB0cmFjay5wbGF5aW5nVGltZSArICh0aGlzLnN0ZXAgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbyk7XHJcbiAgICAvL3RyYWNrLmJhY2suc3RlcCA9IHRoaXMuc3RlcDtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIE9jdGF2ZSB7XHJcbiAgY29uc3RydWN0b3Iob2N0KSB7XHJcbiAgICB0aGlzLm9jdCA9IG9jdDtcclxuICB9XHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdHJhY2suYmFjay5vY3QgPSB0aGlzLm9jdDtcclxuICB9XHJcbn1cclxuXHJcblxyXG5jbGFzcyBPY3RhdmVVcCB7XHJcbiAgY29uc3RydWN0b3IodikgeyB0aGlzLnYgPSB2OyB9XHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdHJhY2suYmFjay5vY3QgKz0gdGhpcy52O1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgT2N0YXZlRG93biB7XHJcbiAgY29uc3RydWN0b3IodikgeyB0aGlzLnYgPSB2OyB9XHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdHJhY2suYmFjay5vY3QgLT0gdGhpcy52O1xyXG4gIH1cclxufVxyXG5jbGFzcyBUZW1wbyB7XHJcbiAgY29uc3RydWN0b3IodGVtcG8pIHtcclxuICAgIHRoaXMudGVtcG8gPSB0ZW1wbztcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRyYWNrLmxvY2FsVGVtcG8gPSB0aGlzLnRlbXBvO1xyXG4gICAgLy90cmFjay5zZXF1ZW5jZXIudGVtcG8gPSB0aGlzLnRlbXBvO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgRW52ZWxvcGUge1xyXG4gIGNvbnN0cnVjdG9yKGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuICAgIHRoaXMuYXR0YWNrID0gYXR0YWNrO1xyXG4gICAgdGhpcy5kZWNheSA9IGRlY2F5O1xyXG4gICAgdGhpcy5zdXN0YWluID0gc3VzdGFpbjtcclxuICAgIHRoaXMucmVsZWFzZSA9IHJlbGVhc2U7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICAvL3ZhciBlbnZlbG9wZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXS5lbnZlbG9wZTtcclxuICAgIHRyYWNrLmJhY2suYXR0YWNrID0gdGhpcy5hdHRhY2s7XHJcbiAgICB0cmFjay5iYWNrLmRlY2F5ID0gdGhpcy5kZWNheTtcclxuICAgIHRyYWNrLmJhY2suc3VzdGFpbiA9IHRoaXMuc3VzdGFpbjtcclxuICAgIHRyYWNrLmJhY2sucmVsZWFzZSA9IHRoaXMucmVsZWFzZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg4fjg4Hjg6Xjg7zjg7NcclxuY2xhc3MgRGV0dW5lIHtcclxuICBjb25zdHJ1Y3RvcihkZXR1bmUpIHtcclxuICAgIHRoaXMuZGV0dW5lID0gZGV0dW5lO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgLy92YXIgdm9pY2UgPSB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF07XHJcbiAgICB0cmFjay5iYWNrLmRldHVuZSA9IHRoaXMuZGV0dW5lO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgVm9sdW1lIHtcclxuICBjb25zdHJ1Y3Rvcih2b2x1bWUpIHtcclxuICAgIHRoaXMudm9sdW1lID0gdm9sdW1lIC8gMTAwLjA7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICAvLyBcclxuICAgIHRyYWNrLmJhY2sudm9sdW1lID0gdGhpcy52b2x1bWU7XHJcbiAgICAvLyB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0udm9sdW1lLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy52b2x1bWUsIHRyYWNrLnBsYXlpbmdUaW1lKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIExvb3BEYXRhIHtcclxuICBjb25zdHJ1Y3RvcihvYmosIHZhcm5hbWUsIGNvdW50LCBzZXFQb3MpIHtcclxuICAgIHRoaXMudmFybmFtZSA9IHZhcm5hbWU7XHJcbiAgICB0aGlzLmNvdW50ID0gY291bnQgfHwgRGVmYXVsdFBhcmFtcy5sb29wQ291bnQ7XHJcbiAgICB0aGlzLm9iaiA9IG9iajtcclxuICAgIHRoaXMuc2VxUG9zID0gc2VxUG9zO1xyXG4gICAgdGhpcy5vdXRTZXFQb3MgPSAtMTtcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHZhciBzdGFjayA9IHRyYWNrLnN0YWNrO1xyXG4gICAgaWYgKHN0YWNrLmxlbmd0aCA9PSAwIHx8IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdLm9iaiAhPT0gdGhpcykge1xyXG4gICAgICB2YXIgbGQgPSB0aGlzO1xyXG4gICAgICBzdGFjay5wdXNoKG5ldyBMb29wRGF0YSh0aGlzLCBsZC52YXJuYW1lLCBsZC5jb3VudCwgdHJhY2suc2VxUG9zKSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBMb29wRW5kIHtcclxuICBjb25zdHJ1Y3RvcihzZXFQb3MpIHtcclxuICAgIHRoaXMuc2VxUG9zID0gc2VxUG9zO1xyXG4gIH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB2YXIgbGQgPSB0cmFjay5zdGFja1t0cmFjay5zdGFjay5sZW5ndGggLSAxXTtcclxuICAgIGlmIChsZC5vdXRTZXFQb3MgPT0gLTEpIGxkLm91dFNlcVBvcyA9IHRoaXMuc2VxUG9zO1xyXG4gICAgbGQuY291bnQtLTtcclxuICAgIGlmIChsZC5jb3VudCA+IDApIHtcclxuICAgICAgdHJhY2suc2VxUG9zID0gbGQuc2VxUG9zO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHJhY2suc3RhY2sucG9wKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBMb29wRXhpdCB7XHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdmFyIGxkID0gdHJhY2suc3RhY2tbdHJhY2suc3RhY2subGVuZ3RoIC0gMV07XHJcbiAgICBpZiAobGQuY291bnQgPD0gMSAmJiBsZC5vdXRTZXFQb3MgIT0gLTEpIHtcclxuICAgICAgdHJhY2suc2VxUG9zID0gbGQub3V0U2VxUG9zO1xyXG4gICAgICB0cmFjay5zdGFjay5wb3AoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEluZmluaXRlTG9vcCB7XHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdHJhY2suaW5maW5pdExvb3BJbmRleCA9IHRyYWNrLnNlcVBvcztcclxuICB9XHJcbn1cclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vLyDjgrfjg7zjgrHjg7PjgrXjg7zjg4jjg6njg4Pjgq9cclxuY2xhc3MgVHJhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNlcXVlbmNlciwgc2VxZGF0YSwgYXVkaW8pIHtcclxuICAgIHRoaXMubmFtZSA9ICcnO1xyXG4gICAgdGhpcy5lbmQgPSBmYWxzZTtcclxuICAgIHRoaXMub25lc2hvdCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zZXF1ZW5jZXIgPSBzZXF1ZW5jZXI7XHJcbiAgICB0aGlzLnNlcURhdGEgPSBzZXFkYXRhO1xyXG4gICAgdGhpcy5zZXFQb3MgPSAwO1xyXG4gICAgdGhpcy5tdXRlID0gZmFsc2U7XHJcbiAgICB0aGlzLnBsYXlpbmdUaW1lID0gLTE7XHJcbiAgICB0aGlzLmxvY2FsVGVtcG8gPSBzZXF1ZW5jZXIudGVtcG87XHJcbiAgICB0aGlzLnRyYWNrVm9sdW1lID0gMS4wO1xyXG4gICAgdGhpcy50cmFuc3Bvc2UgPSAwO1xyXG4gICAgdGhpcy5zb2xvID0gZmFsc2U7XHJcbiAgICB0aGlzLmNoYW5uZWwgPSAtMTtcclxuICAgIHRoaXMudHJhY2sgPSAtMTtcclxuICAgIHRoaXMuYXVkaW8gPSBhdWRpbztcclxuICAgIHRoaXMuaW5maW5pdExvb3BJbmRleCA9IC0xO1xyXG4gICAgdGhpcy5iYWNrID0ge1xyXG4gICAgICBub3RlOiA3MixcclxuICAgICAgb2N0OiA1LFxyXG4gICAgICBzdGVwOiA5NixcclxuICAgICAgZ2F0ZTogMC41LFxyXG4gICAgICB2ZWw6IDEuMCxcclxuICAgICAgYXR0YWNrOiAwLjAxLFxyXG4gICAgICBkZWNheTogMC4wNSxcclxuICAgICAgc3VzdGFpbjogMC42LFxyXG4gICAgICByZWxlYXNlOiAwLjA3LFxyXG4gICAgICBkZXR1bmU6IDEuMCxcclxuICAgICAgdm9sdW1lOiAwLjUsXHJcbiAgICAgIC8vICAgICAgc2FtcGxlOmF1ZGlvLnBlcmlvZGljV2F2ZXNbMF1cclxuICAgICAgc2FtcGxlOiB3YXZlU2FtcGxlc1swXVxyXG4gICAgfVxyXG4gICAgdGhpcy5zdGFjayA9IFtdO1xyXG4gIH1cclxuXHJcbiAgcHJvY2VzcyhjdXJyZW50VGltZSkge1xyXG5cclxuICAgIGlmICh0aGlzLmVuZCkgcmV0dXJuO1xyXG5cclxuICAgIGlmICh0aGlzLm9uZXNob3QpIHtcclxuICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZXFTaXplID0gdGhpcy5zZXFEYXRhLmxlbmd0aDtcclxuICAgIGlmICh0aGlzLnNlcVBvcyA+PSBzZXFTaXplKSB7XHJcbiAgICAgIGlmICh0aGlzLnNlcXVlbmNlci5yZXBlYXQpIHtcclxuICAgICAgICB0aGlzLnNlcVBvcyA9IDA7XHJcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pbmZpbml0TG9vcEluZGV4ID49IDApIHtcclxuICAgICAgICB0aGlzLnNlcVBvcyA9IHRoaXMuaW5maW5pdExvb3BJbmRleDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVuZCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlcSA9IHRoaXMuc2VxRGF0YTtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAodGhpcy5wbGF5aW5nVGltZSA+IC0xKSA/IHRoaXMucGxheWluZ1RpbWUgOiBjdXJyZW50VGltZTtcclxuICAgIHZhciBlbmRUaW1lID0gY3VycmVudFRpbWUgKyAwLjIvKnNlYyovO1xyXG5cclxuICAgIHdoaWxlICh0aGlzLnNlcVBvcyA8IHNlcVNpemUpIHtcclxuICAgICAgaWYgKHRoaXMucGxheWluZ1RpbWUgPj0gZW5kVGltZSAmJiAhdGhpcy5vbmVzaG90KSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGQgPSBzZXFbdGhpcy5zZXFQb3NdO1xyXG4gICAgICAgIGQucHJvY2Vzcyh0aGlzKTtcclxuICAgICAgICB0aGlzLnNlcVBvcysrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIC8vIHZhciBjdXJWb2ljZSA9IHRoaXMuYXVkaW8udm9pY2VzW3RoaXMuY2hhbm5lbF07XHJcbiAgICAvLyBjdXJWb2ljZS5nYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgLy8gY3VyVm9pY2UucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICAvLyBjdXJWb2ljZS5nYWluLmdhaW4udmFsdWUgPSAwO1xyXG4gICAgdGhpcy5wbGF5aW5nVGltZSA9IC0xO1xyXG4gICAgdGhpcy5zZXFQb3MgPSAwO1xyXG4gICAgdGhpcy5pbmZpbml0TG9vcEluZGV4ID0gLTE7XHJcbiAgICB0aGlzLmVuZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdGFjay5sZW5ndGggPSAwO1xyXG4gIH1cclxuXHJcbiAgYXNzaWduVm9pY2UodCkge1xyXG4gICAgbGV0IHJldCA9IG51bGw7XHJcbiAgICB0aGlzLmF1ZGlvLnZvaWNlcy5zb21lKChkLCBpKSA9PiB7XHJcbiAgICAgIGlmIChkLmlzS2V5T2ZmKHQpKSB7XHJcbiAgICAgICAgcmV0ID0gZDtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIGlmICghcmV0KSB7XHJcbiAgICAgIGxldCBvbGRlc3RLZXlPbkRhdGEgPSAodGhpcy5hdWRpby52b2ljZXMubWFwKChkLCBpKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdGltZTogZC5lbnZlbG9wZS5rZXlPblRpbWUsIGQsIGkgfTtcclxuICAgICAgfSkuc29ydCgoYSwgYikgPT4gYS50aW1lIC0gYi50aW1lKSlbMF07XHJcbiAgICAgIHJldCA9IG9sZGVzdEtleU9uRGF0YS5kO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBsb2FkVHJhY2tzKHNlbGYsIHRyYWNrcywgdHJhY2tkYXRhKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja2RhdGEubGVuZ3RoOyArK2kpIHtcclxuICAgIHZhciB0cmFjayA9IG5ldyBUcmFjayhzZWxmLCB0cmFja2RhdGFbaV0uZGF0YSwgc2VsZi5hdWRpbyk7XHJcbiAgICB0cmFjay5jaGFubmVsID0gdHJhY2tkYXRhW2ldLmNoYW5uZWw7XHJcbiAgICB0cmFjay5vbmVzaG90ID0gKCF0cmFja2RhdGFbaV0ub25lc2hvdCkgPyBmYWxzZSA6IHRydWU7XHJcbiAgICB0cmFjay50cmFjayA9IGk7XHJcbiAgICB0cmFja3MucHVzaCh0cmFjayk7XHJcbiAgfVxyXG4gIHJldHVybiB0cmFja3M7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVRyYWNrcyh0cmFja2RhdGEpIHtcclxuICB2YXIgdHJhY2tzID0gW107XHJcbiAgbG9hZFRyYWNrcyh0aGlzLCB0cmFja3MsIHRyYWNrZGF0YS50cmFja3MpO1xyXG4gIHJldHVybiB0cmFja3M7XHJcbn1cclxuXHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8vIOOCt+ODvOOCseODs+OCteODvOacrOS9kyBcclxuZXhwb3J0IGNsYXNzIFNlcXVlbmNlciB7XHJcbiAgY29uc3RydWN0b3IoYXVkaW8pIHtcclxuICAgIHRoaXMuU1RPUCA9IDAgfCAwO1xyXG4gICAgdGhpcy5QTEFZID0gMSB8IDA7XHJcbiAgICB0aGlzLlBBVVNFID0gMiB8IDA7XHJcblxyXG4gICAgdGhpcy5hdWRpbyA9IGF1ZGlvO1xyXG4gICAgdGhpcy50ZW1wbyA9IDEwMC4wO1xyXG4gICAgdGhpcy5yZXBlYXQgPSBmYWxzZTtcclxuICAgIHRoaXMucGxheSA9IGZhbHNlO1xyXG4gICAgdGhpcy50cmFja3MgPSBbXTtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gIH1cclxuICBsb2FkKGRhdGEpIHtcclxuICAgIHBhcnNlTU1MKGRhdGEpO1xyXG4gICAgaWYgKHRoaXMucGxheSkge1xyXG4gICAgICB0aGlzLnN0b3AoKTtcclxuICAgIH1cclxuICAgIHRoaXMudHJhY2tzLmxlbmd0aCA9IDA7XHJcbiAgICBsb2FkVHJhY2tzKHRoaXMsIHRoaXMudHJhY2tzLCBkYXRhLnRyYWNrcyk7XHJcbiAgfVxyXG4gIHN0YXJ0KCkge1xyXG4gICAgLy8gICAgdGhpcy5oYW5kbGUgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHNlbGYucHJvY2VzcygpIH0sIDUwKTtcclxuICAgIHRoaXMuYXVkaW8ucmVhZERydW1TYW1wbGVcclxuICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QTEFZO1xyXG4gICAgICAgIHRoaXMucHJvY2VzcygpO1xyXG4gICAgICB9KTtcclxuICB9XHJcbiAgcHJvY2VzcygpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlBMQVkpIHtcclxuICAgICAgdGhpcy5wbGF5VHJhY2tzKHRoaXMudHJhY2tzKTtcclxuICAgICAgdGhpcy5oYW5kbGUgPSB3aW5kb3cuc2V0VGltZW91dCh0aGlzLnByb2Nlc3MuYmluZCh0aGlzKSwgMTAwKTtcclxuICAgIH1cclxuICB9XHJcbiAgcGxheVRyYWNrcyh0cmFja3MpIHtcclxuICAgIHZhciBjdXJyZW50VGltZSA9IHRoaXMuYXVkaW8uYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICAvLyAgIGNvbnNvbGUubG9nKHRoaXMuYXVkaW8uYXVkaW9jdHguY3VycmVudFRpbWUpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRyYWNrcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB0cmFja3NbaV0ucHJvY2VzcyhjdXJyZW50VGltZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHBhdXNlKCkge1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBBVVNFO1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gIH1cclxuICByZXN1bWUoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5QQVVTRSkge1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUExBWTtcclxuICAgICAgdmFyIHRyYWNrcyA9IHRoaXMudHJhY2tzO1xyXG4gICAgICB2YXIgYWRqdXN0ID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZSAtIHRoaXMucGF1c2VUaW1lO1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdHJhY2tzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgdHJhY2tzW2ldLnBsYXlpbmdUaW1lICs9IGFkanVzdDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnByb2Nlc3MoKTtcclxuICAgIH1cclxuICB9XHJcbiAgc3RvcCgpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyAhPSB0aGlzLlNUT1ApIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaGFuZGxlKTtcclxuICAgICAgLy8gICAgY2xlYXJJbnRlcnZhbCh0aGlzLmhhbmRsZSk7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJlc2V0KCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMudHJhY2tzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHRoaXMudHJhY2tzW2ldLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZU1NTChkYXRhKSB7XHJcbiAgZGF0YS50cmFja3MuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgZC5kYXRhID0gcGFyc2VNTUxfKGQubW1sKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VNTUxfKG1tbCkge1xyXG4gIGxldCBwYXJzZXIgPSBuZXcgTU1MUGFyc2VyKG1tbCk7XHJcbiAgbGV0IGNvbW1hbmRzID0gcGFyc2VyLnBhcnNlKCk7XHJcbiAgbGV0IHNlcUFycmF5ID0gW107XHJcbiAgY29tbWFuZHMuZm9yRWFjaCgoY29tbWFuZCkgPT4ge1xyXG4gICAgc3dpdGNoIChjb21tYW5kLnR5cGUpIHtcclxuICAgICAgY2FzZSBTeW50YXguTm90ZTpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBOb3RlKGNvbW1hbmQubm90ZU51bWJlcnMsIGNvbW1hbmQubm90ZUxlbmd0aCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5SZXN0OlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IFJlc3QoY29tbWFuZC5ub3RlTGVuZ3RoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4Lk9jdGF2ZTpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBPY3RhdmUoY29tbWFuZC52YWx1ZSkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5PY3RhdmVTaGlmdDpcclxuICAgICAgICBpZiAoY29tbWFuZC5kaXJlY3Rpb24gPj0gMCkge1xyXG4gICAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgT2N0YXZlVXAoMSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBPY3RhdmVEb3duKDEpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4Lk5vdGVMZW5ndGg6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgTGVuZ3RoKGNvbW1hbmQubm90ZUxlbmd0aCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5Ob3RlVmVsb2NpdHk6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgVmVsb2NpdHkoY29tbWFuZC52YWx1ZSkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5UZW1wbzpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBUZW1wbyhjb21tYW5kLnZhbHVlKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4Lk5vdGVRdWFudGl6ZTpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBHYXRlVGltZShjb21tYW5kLnZhbHVlKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4LkluZmluaXRlTG9vcDpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBJbmZpbml0ZUxvb3AoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4Lkxvb3BCZWdpbjpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBMb29wRGF0YShudWxsLCAnJywgY29tbWFuZC52YWx1ZSwgbnVsbCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5Mb29wRXhpdDpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBMb29wRXhpdCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguTG9vcEVuZDpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBMb29wRW5kKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5Ub25lOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IFRvbmUoY29tbWFuZC52YWx1ZSkpO1xyXG4gICAgICBjYXNlIFN5bnRheC5XYXZlRm9ybTpcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguRW52ZWxvcGU6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgRW52ZWxvcGUoY29tbWFuZC5hLCBjb21tYW5kLmQsIGNvbW1hbmQucywgY29tbWFuZC5yKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgcmV0dXJuIHNlcUFycmF5O1xyXG59XHJcblxyXG4vLyBleHBvcnQgdmFyIHNlcURhdGEgPSB7XHJcbi8vICAgbmFtZTogJ1Rlc3QnLFxyXG4vLyAgIHRyYWNrczogW1xyXG4vLyAgICAge1xyXG4vLyAgICAgICBuYW1lOiAncGFydDEnLFxyXG4vLyAgICAgICBjaGFubmVsOiAwLFxyXG4vLyAgICAgICBkYXRhOlxyXG4vLyAgICAgICBbXHJcbi8vICAgICAgICAgRU5WKDAuMDEsIDAuMDIsIDAuNSwgMC4wNyksXHJcbi8vICAgICAgICAgVEVNUE8oMTgwKSwgVE9ORSgwKSwgVk9MVU1FKDAuNSksIEwoOCksIEdUKC0wLjUpLE8oNCksXHJcbi8vICAgICAgICAgTE9PUCgnaScsNCksXHJcbi8vICAgICAgICAgQywgQywgQywgQywgQywgQywgQywgQyxcclxuLy8gICAgICAgICBMT09QX0VORCxcclxuLy8gICAgICAgICBKVU1QKDUpXHJcbi8vICAgICAgIF1cclxuLy8gICAgIH0sXHJcbi8vICAgICB7XHJcbi8vICAgICAgIG5hbWU6ICdwYXJ0MicsXHJcbi8vICAgICAgIGNoYW5uZWw6IDEsXHJcbi8vICAgICAgIGRhdGE6XHJcbi8vICAgICAgICAgW1xyXG4vLyAgICAgICAgIEVOVigwLjAxLCAwLjA1LCAwLjYsIDAuMDcpLFxyXG4vLyAgICAgICAgIFRFTVBPKDE4MCksVE9ORSg2KSwgVk9MVU1FKDAuMiksIEwoOCksIEdUKC0wLjgpLFxyXG4vLyAgICAgICAgIFIoMSksIFIoMSksXHJcbi8vICAgICAgICAgTyg2KSxMKDEpLCBGLFxyXG4vLyAgICAgICAgIEUsXHJcbi8vICAgICAgICAgT0QsIEwoOCwgdHJ1ZSksIEJiLCBHLCBMKDQpLCBCYiwgT1UsIEwoNCksIEYsIEwoOCksIEQsXHJcbi8vICAgICAgICAgTCg0LCB0cnVlKSwgRSwgTCgyKSwgQyxSKDgpLFxyXG4vLyAgICAgICAgIEpVTVAoOClcclxuLy8gICAgICAgICBdXHJcbi8vICAgICB9LFxyXG4vLyAgICAge1xyXG4vLyAgICAgICBuYW1lOiAncGFydDMnLFxyXG4vLyAgICAgICBjaGFubmVsOiAyLFxyXG4vLyAgICAgICBkYXRhOlxyXG4vLyAgICAgICAgIFtcclxuLy8gICAgICAgICBFTlYoMC4wMSwgMC4wNSwgMC42LCAwLjA3KSxcclxuLy8gICAgICAgICBURU1QTygxODApLFRPTkUoNiksIFZPTFVNRSgwLjEpLCBMKDgpLCBHVCgtMC41KSwgXHJcbi8vICAgICAgICAgUigxKSwgUigxKSxcclxuLy8gICAgICAgICBPKDYpLEwoMSksIEMsQyxcclxuLy8gICAgICAgICBPRCwgTCg4LCB0cnVlKSwgRywgRCwgTCg0KSwgRywgT1UsIEwoNCksIEQsIEwoOCksT0QsIEcsXHJcbi8vICAgICAgICAgTCg0LCB0cnVlKSwgT1UsQywgTCgyKSxPRCwgRywgUig4KSxcclxuLy8gICAgICAgICBKVU1QKDcpXHJcbi8vICAgICAgICAgXVxyXG4vLyAgICAgfVxyXG4vLyAgIF1cclxuLy8gfVxyXG5cclxuZXhwb3J0IGNsYXNzIFNvdW5kRWZmZWN0cyB7XHJcbiAgY29uc3RydWN0b3Ioc2VxdWVuY2VyLGRhdGEpe1xyXG4gICAgdGhpcy5zb3VuZEVmZmVjdHMgPSBbXTtcclxuICAgIGRhdGEuZm9yRWFjaCgoZCk9PntcclxuICAgICAgdmFyIHRyYWNrcyA9IFtdO1xyXG4gICAgICBwYXJzZU1NTChkKTtcclxuICAgICAgdGhpcy5zb3VuZEVmZmVjdHMucHVzaChsb2FkVHJhY2tzKHNlcXVlbmNlciwgdHJhY2tzLCBkLnRyYWNrcykpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBleHBvcnQgZnVuY3Rpb24gU291bmRFZmZlY3RzKHNlcXVlbmNlcikge1xyXG4vLyAgICB0aGlzLnNvdW5kRWZmZWN0cyA9XHJcbi8vICAgICBbXHJcbi8vICAgICAvLyBFZmZlY3QgMCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8gICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixbXHJcbi8vICAgICB7XHJcbi8vICAgICAgIGNoYW5uZWw6IDgsXHJcbi8vICAgICAgIG9uZXNob3Q6dHJ1ZSxcclxuLy8gICAgICAgZGF0YTogW1ZPTFVNRSgwLjUpLFxyXG4vLyAgICAgICAgIEVOVigwLjAwMDEsIDAuMDEsIDEuMCwgMC4wMDAxKSxHVCgtMC45OTkpLFRPTkUoMCksIFRFTVBPKDIwMCksIE8oOCksU1QoMyksIEMsIEQsIEUsIEYsIEcsIEEsIEIsIE9VLCBDLCBELCBFLCBHLCBBLCBCLEIsQixCXHJcbi8vICAgICAgIF1cclxuLy8gICAgIH0sXHJcbi8vICAgICB7XHJcbi8vICAgICAgIGNoYW5uZWw6IDksXHJcbi8vICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbi8vICAgICAgIGRhdGE6IFtWT0xVTUUoMC41KSxcclxuLy8gICAgICAgICBFTlYoMC4wMDAxLCAwLjAxLCAxLjAsIDAuMDAwMSksIERFVFVORSgwLjkpLCBHVCgtMC45OTkpLCBUT05FKDApLCBURU1QTygyMDApLCBPKDUpLCBTVCgzKSwgQywgRCwgRSwgRiwgRywgQSwgQiwgT1UsIEMsIEQsIEUsIEcsIEEsIEIsQixCLEJcclxuLy8gICAgICAgXVxyXG4vLyAgICAgfVxyXG4vLyAgICAgXSksXHJcbi8vICAgICAvLyBFZmZlY3QgMSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbi8vICAgICAgIFtcclxuLy8gICAgICAgICB7XHJcbi8vICAgICAgICAgICBjaGFubmVsOiAxMCxcclxuLy8gICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbi8vICAgICAgICAgICBkYXRhOiBbXHJcbi8vICAgICAgICAgICAgVE9ORSg0KSwgVEVNUE8oMTUwKSwgU1QoNCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuLy8gICAgICAgICAgICBPKDYpLCBHLCBBLCBCLCBPKDcpLCBCLCBBLCBHLCBGLCBFLCBELCBDLCBFLCBHLCBBLCBCLCBPRCwgQiwgQSwgRywgRiwgRSwgRCwgQywgT0QsIEIsIEEsIEcsIEYsIEUsIEQsIENcclxuLy8gICAgICAgICAgIF1cclxuLy8gICAgICAgICB9XHJcbi8vICAgICAgIF0pLFxyXG4vLyAgICAgLy8gRWZmZWN0IDIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLyAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4vLyAgICAgICBbXHJcbi8vICAgICAgICAge1xyXG4vLyAgICAgICAgICAgY2hhbm5lbDogMTAsXHJcbi8vICAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4vLyAgICAgICAgICAgZGF0YTogW1xyXG4vLyAgICAgICAgICAgIFRPTkUoMCksIFRFTVBPKDE1MCksIFNUKDIpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbi8vICAgICAgICAgICAgTyg4KSwgQyxELEUsRixHLEEsQixPVSxDLEQsRSxGLE9ELEcsT1UsQSxPRCxCLE9VLEEsT0QsRyxPVSxGLE9ELEUsT1UsRVxyXG4vLyAgICAgICAgICAgXVxyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgXSksXHJcbi8vICAgICAgIC8vIEVmZmVjdCAzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLyAgICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbi8vICAgICAgICAgW1xyXG4vLyAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICBjaGFubmVsOiAxMCxcclxuLy8gICAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuLy8gICAgICAgICAgICAgZGF0YTogW1xyXG4vLyAgICAgICAgICAgICAgVE9ORSg1KSwgVEVNUE8oMTUwKSwgTCg2NCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuLy8gICAgICAgICAgICAgIE8oNiksQyxPRCxDLE9VLEMsT0QsQyxPVSxDLE9ELEMsT1UsQyxPRFxyXG4vLyAgICAgICAgICAgICBdXHJcbi8vICAgICAgICAgICB9XHJcbi8vICAgICAgICAgXSksXHJcbi8vICAgICAgIC8vIEVmZmVjdCA0IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8gICAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4vLyAgICAgICAgIFtcclxuLy8gICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgY2hhbm5lbDogMTEsXHJcbi8vICAgICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbi8vICAgICAgICAgICAgIGRhdGE6IFtcclxuLy8gICAgICAgICAgICAgIFRPTkUoOCksIFZPTFVNRSgyLjApLFRFTVBPKDEyMCksIEwoMiksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4yNSksXHJcbi8vICAgICAgICAgICAgICBPKDEpLCBDXHJcbi8vICAgICAgICAgICAgIF1cclxuLy8gICAgICAgICAgIH1cclxuLy8gICAgICAgICBdKVxyXG4vLyAgICBdO1xyXG4vLyAgfVxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IHNmZyBmcm9tICcuL2dsb2JhbC5qcyc7IFxyXG5cclxuLy8vIOODhuOCr+OCueODgeODo+ODvOOBqOOBl+OBpmNhbnZhc+OCkuS9v+OBhuWgtOWQiOOBruODmOODq+ODkeODvFxyXG5leHBvcnQgZnVuY3Rpb24gQ2FudmFzVGV4dHVyZSh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoIHx8IHNmZy5WSVJUVUFMX1dJRFRIO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodCB8fCBzZmcuVklSVFVBTF9IRUlHSFQ7XHJcbiAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIHRoaXMudGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuY2FudmFzKTtcclxuICB0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICB0aGlzLnRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gMC4wMDE7XHJcbiAgLy8g44K544Og44O844K444Oz44Kw44KS5YiH44KLXHJcbiAgdGhpcy5jdHgubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAvL3RoaXMuY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG59XHJcblxyXG4vLy8g44OX44Ot44Kw44Os44K544OQ44O86KGo56S644Kv44Op44K5XHJcbmV4cG9ydCBmdW5jdGlvbiBQcm9ncmVzcygpIHtcclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpOztcclxuICB2YXIgd2lkdGggPSAxO1xyXG4gIHdoaWxlICh3aWR0aCA8PSBzZmcuVklSVFVBTF9XSURUSCl7XHJcbiAgICB3aWR0aCAqPSAyO1xyXG4gIH1cclxuICB2YXIgaGVpZ2h0ID0gMTtcclxuICB3aGlsZSAoaGVpZ2h0IDw9IHNmZy5WSVJUVUFMX0hFSUdIVCl7XHJcbiAgICBoZWlnaHQgKj0gMjtcclxuICB9XHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIHRoaXMudGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuY2FudmFzKTtcclxuICB0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICB0aGlzLnRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLCB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAod2lkdGggLSBzZmcuVklSVFVBTF9XSURUSCkgLyAyO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gIC0gKGhlaWdodCAtIHNmZy5WSVJUVUFMX0hFSUdIVCkgLyAyO1xyXG5cclxuICAvL3RoaXMudGV4dHVyZS5wcmVtdWx0aXBseUFscGhhID0gdHJ1ZTtcclxufVxyXG5cclxuLy8vIOODl+ODreOCsOODrOOCueODkOODvOOCkuihqOekuuOBmeOCi+OAglxyXG5Qcm9ncmVzcy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKG1lc3NhZ2UsIHBlcmNlbnQpIHtcclxuICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgdmFyIHdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgsIGhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodDtcclxuICAvLyAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLDAsMCwwKSc7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB2YXIgdGV4dFdpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KG1lc3NhZ2UpLndpZHRoO1xyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwxLjApJztcclxuXHJcbiAgY3R4LmZpbGxUZXh0KG1lc3NhZ2UsICh3aWR0aCAtIHRleHRXaWR0aCkgLyAyLCAxMDApO1xyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgucmVjdCgyMCwgNzUsIHdpZHRoIC0gMjAgKiAyLCAxMCk7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG4gIGN0eC5maWxsUmVjdCgyMCwgNzUsICh3aWR0aCAtIDIwICogMikgKiBwZXJjZW50IC8gMTAwLCAxMCk7XHJcbiAgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxufVxyXG5cclxuLy8vIGltZ+OBi+OCieOCuOOCquODoeODiOODquOCkuS9nOaIkOOBmeOCi1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR2VvbWV0cnlGcm9tSW1hZ2UoaW1hZ2UpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHcgPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG4gIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3LCBoKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuICB7XHJcbiAgICB2YXIgaSA9IDA7XHJcblxyXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoOyArK3kpIHtcclxuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3OyArK3gpIHtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcclxuXHJcbiAgICAgICAgdmFyIHIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgc2ZnID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYSA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIGlmIChhICE9IDApIHtcclxuICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIHNmZyAvIDI1NS4wLCBiIC8gMjU1LjApO1xyXG4gICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSkgKiAyLjAsICgoeSAtIGggLyAyKSkgKiAtMi4wLCAwLjApO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCh2ZXJ0KTtcclxuICAgICAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVHZW9tZXRyeShzaXplKVxyXG57XHJcbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcbiAgdmFyIHNpemVIYWxmID0gc2l6ZSAvIDI7XHJcbiAgLy8gZ2VvbWV0cnkuXHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygtc2l6ZUhhbGYsIHNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyhzaXplSGFsZiwgc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHNpemVIYWxmLCAtc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKC1zaXplSGFsZiwgLXNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkuZmFjZXMucHVzaChuZXcgVEhSRUUuRmFjZTMoMCwgMiwgMSkpO1xyXG4gIGdlb21ldHJ5LmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsIDMsIDIpKTtcclxuICByZXR1cm4gZ2VvbWV0cnk7XHJcbn1cclxuXHJcbi8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zkuIrjga7mjIflrprjgrnjg5fjg6njgqTjg4jjga5VVuW6p+aomeOCkuaxguOCgeOCi1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleHR1cmUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbE5vKVxyXG57XHJcbiAgdmFyIHdpZHRoID0gdGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gdGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIHZhciB1Q2VsbENvdW50ID0gKHdpZHRoIC8gY2VsbFdpZHRoKSB8IDA7XHJcbiAgdmFyIHZDZWxsQ291bnQgPSAoaGVpZ2h0IC8gY2VsbEhlaWdodCkgfCAwO1xyXG4gIHZhciB2UG9zID0gdkNlbGxDb3VudCAtICgoY2VsbE5vIC8gdUNlbGxDb3VudCkgfCAwKTtcclxuICB2YXIgdVBvcyA9IGNlbGxObyAlIHVDZWxsQ291bnQ7XHJcbiAgdmFyIHVVbml0ID0gY2VsbFdpZHRoIC8gd2lkdGg7IFxyXG4gIHZhciB2VW5pdCA9IGNlbGxIZWlnaHQgLyBoZWlnaHQ7XHJcblxyXG4gIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF0ucHVzaChbXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcykgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodClcclxuICBdKTtcclxuICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdLnB1c2goW1xyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MgLSAxKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpXHJcbiAgXSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4dHVyZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCBjZWxsTm8pXHJcbntcclxuICB2YXIgd2lkdGggPSB0ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSB0ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuXHJcbiAgdmFyIHVDZWxsQ291bnQgPSAod2lkdGggLyBjZWxsV2lkdGgpIHwgMDtcclxuICB2YXIgdkNlbGxDb3VudCA9IChoZWlnaHQgLyBjZWxsSGVpZ2h0KSB8IDA7XHJcbiAgdmFyIHZQb3MgPSB2Q2VsbENvdW50IC0gKChjZWxsTm8gLyB1Q2VsbENvdW50KSB8IDApO1xyXG4gIHZhciB1UG9zID0gY2VsbE5vICUgdUNlbGxDb3VudDtcclxuICB2YXIgdVVuaXQgPSBjZWxsV2lkdGggLyB3aWR0aDtcclxuICB2YXIgdlVuaXQgPSBjZWxsSGVpZ2h0IC8gaGVpZ2h0O1xyXG4gIHZhciB1dnMgPSBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzBdO1xyXG5cclxuICB1dnNbMF0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1swXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcbiAgdXZzWzFdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzFdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcbiAgdXZzWzJdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzJdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuXHJcbiAgdXZzID0gZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVsxXTtcclxuXHJcbiAgdXZzWzBdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMF0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG4gIHV2c1sxXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzFdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcbiAgdXZzWzJdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzJdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcblxyXG4gXHJcbiAgZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWU7XHJcblxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlTWF0ZXJpYWwodGV4dHVyZSlcclxue1xyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRleHR1cmUgLyosZGVwdGhUZXN0OnRydWUqLywgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gIG1hdGVyaWFsLnNpZGUgPSBUSFJFRS5Gcm9udFNpZGU7XHJcbiAgbWF0ZXJpYWwuYWxwaGFUZXN0ID0gMC41O1xyXG4gIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuLy8gIG1hdGVyaWFsLlxyXG4gIHJldHVybiBtYXRlcmlhbDtcclxufVxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcblxyXG4vLyDjgq3jg7zlhaXliptcclxuZXhwb3J0IGNsYXNzIEJhc2ljSW5wdXR7XHJcbmNvbnN0cnVjdG9yICgpIHtcclxuICB0aGlzLmtleUNoZWNrID0geyB1cDogZmFsc2UsIGRvd246IGZhbHNlLCBsZWZ0OiBmYWxzZSwgcmlnaHQ6IGZhbHNlLCB6OiBmYWxzZSAseDpmYWxzZX07XHJcbiAgdGhpcy5rZXlCdWZmZXIgPSBbXTtcclxuICB0aGlzLmtleXVwXyA9IG51bGw7XHJcbiAgdGhpcy5rZXlkb3duXyA9IG51bGw7XHJcbiAgLy90aGlzLmdhbWVwYWRDaGVjayA9IHsgdXA6IGZhbHNlLCBkb3duOiBmYWxzZSwgbGVmdDogZmFsc2UsIHJpZ2h0OiBmYWxzZSwgejogZmFsc2UgLHg6ZmFsc2V9O1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkY29ubmVjdGVkJywoZSk9PntcclxuICAgIHRoaXMuZ2FtZXBhZCA9IGUuZ2FtZXBhZDtcclxuICB9KTtcclxuIFxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkZGlzY29ubmVjdGVkJywoZSk9PntcclxuICAgIGRlbGV0ZSB0aGlzLmdhbWVwYWQ7XHJcbiAgfSk7IFxyXG4gXHJcbiBpZih3aW5kb3cubmF2aWdhdG9yLmdldEdhbWVwYWRzKXtcclxuICAgdGhpcy5nYW1lcGFkID0gd2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcygpWzBdO1xyXG4gfSBcclxufVxyXG5cclxuICBjbGVhcigpXHJcbiAge1xyXG4gICAgZm9yKHZhciBkIGluIHRoaXMua2V5Q2hlY2spe1xyXG4gICAgICB0aGlzLmtleUNoZWNrW2RdID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIH1cclxuICBcclxuICBrZXlkb3duKGUpIHtcclxuICAgIHZhciBlID0gZDMuZXZlbnQ7XHJcbiAgICB2YXIga2V5QnVmZmVyID0gdGhpcy5rZXlCdWZmZXI7XHJcbiAgICB2YXIga2V5Q2hlY2sgPSB0aGlzLmtleUNoZWNrO1xyXG4gICAgdmFyIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgXHJcbiAgICBpZiAoa2V5QnVmZmVyLmxlbmd0aCA+IDE2KSB7XHJcbiAgICAgIGtleUJ1ZmZlci5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoZS5rZXlDb2RlID09IDgwIC8qIFAgKi8pIHtcclxuICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICBzZmcuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNmZy5nYW1lLnJlc3VtZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAgICAgICBcclxuICAgIGtleUJ1ZmZlci5wdXNoKGUua2V5Q29kZSk7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDczOlxyXG4gICAgICBjYXNlIDM4OlxyXG4gICAgICBjYXNlIDEwNDpcclxuICAgICAgICBrZXlDaGVjay51cCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NjpcclxuICAgICAgY2FzZSAzOTpcclxuICAgICAgY2FzZSAxMDI6XHJcbiAgICAgICAga2V5Q2hlY2sucmlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA5MDpcclxuICAgICAgICBrZXlDaGVjay56ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDg4OlxyXG4gICAgICAgIGtleUNoZWNrLnggPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGtleXVwKCkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gZmFsc2U7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3MzpcclxuICAgICAgY2FzZSAzODpcclxuICAgICAgY2FzZSAxMDQ6XHJcbiAgICAgICAga2V5Q2hlY2sudXAgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc2OlxyXG4gICAgICBjYXNlIDM5OlxyXG4gICAgICBjYXNlIDEwMjpcclxuICAgICAgICBrZXlDaGVjay5yaWdodCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgOTA6XHJcbiAgICAgICAga2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgODg6XHJcbiAgICAgICAga2V5Q2hlY2sueCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8v44Kk44OZ44Oz44OI44Gr44OQ44Kk44Oz44OJ44GZ44KLXHJcbiAgYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsdGhpcy5rZXlkb3duLmJpbmQodGhpcykpO1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleXVwLmJhc2ljSW5wdXQnLHRoaXMua2V5dXAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIC8vIOOCouODs+ODkOOCpOODs+ODieOBmeOCi1xyXG4gIHVuYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCB1cCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLnVwIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEyXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdIDwgLTAuMSkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRvd24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5kb3duIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEzXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdID4gMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgbGVmdCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLmxlZnQgfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTRdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMF0gPCAtMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgcmlnaHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5yaWdodCB8fCAodGhpcy5nYW1lcGFkICYmICh0aGlzLmdhbWVwYWQuYnV0dG9uc1sxNV0ucHJlc3NlZCB8fCB0aGlzLmdhbWVwYWQuYXhlc1swXSA+IDAuMSkpO1xyXG4gIH1cclxuICBcclxuICBnZXQgeigpIHtcclxuICAgICBsZXQgcmV0ID0gdGhpcy5rZXlDaGVjay56IFxyXG4gICAgfHwgKCgoIXRoaXMuekJ1dHRvbiB8fCAodGhpcy56QnV0dG9uICYmICF0aGlzLnpCdXR0b24pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLnpCdXR0b24gPSB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCBzdGFydCgpIHtcclxuICAgIGxldCByZXQgPSAoKCF0aGlzLnN0YXJ0QnV0dG9uXyB8fCAodGhpcy5zdGFydEJ1dHRvbl8gJiYgIXRoaXMuc3RhcnRCdXR0b25fKSApICYmIHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkKSA7XHJcbiAgICB0aGlzLnN0YXJ0QnV0dG9uXyA9IHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IGFCdXR0b24oKXtcclxuICAgICBsZXQgcmV0ID0gKCgoIXRoaXMuYUJ1dHRvbl8gfHwgKHRoaXMuYUJ1dHRvbl8gJiYgIXRoaXMuYUJ1dHRvbl8pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLmFCdXR0b25fID0gdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQ7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuICAqdXBkYXRlKHRhc2tJbmRleClcclxuICB7XHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIGlmKHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMpe1xyXG4gICAgICAgIHRoaXMuZ2FtZXBhZCA9IHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVswXTtcclxuICAgICAgfSBcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7ICAgICBcclxuICAgIH1cclxuICB9XHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdmFyIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvXFwuc2ZwZ21yXFwubmV0L2lnKT8nd3d3LnNmcGdtci5uZXQnOidsb2NhbGhvc3QnO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovLycgKyBob3N0ICsgJzo4MDgxL3Rlc3QnKTtcclxuICAgICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kSGlnaFNjb3JlcycsIChkYXRhKT0+e1xyXG4gICAgICAgIGlmKHRoaXMudXBkYXRlSGlnaFNjb3Jlcyl7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRIaWdoU2NvcmUnLCAoZGF0YSk9PntcclxuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZShkYXRhKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZFJhbmsnLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgIHRoaXMudXBkYXRlSGlnaFNjb3JlcyhkYXRhLmhpZ2hTY29yZXMpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvckNvbm5lY3Rpb25NYXgnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgYWxlcnQoJ+WQjOaZguaOpee2muOBruS4iumZkOOBq+mBlOOBl+OBvuOBl+OBn+OAgicpO1xyXG4gICAgICAgIHNlbGYuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHNlbGYuZW5hYmxlKSB7XHJcbiAgICAgICAgICBzZWxmLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgYWxlcnQoJ+OCteODvOODkOODvOaOpee2muOBjOWIh+aWreOBleOCjOOBvuOBl+OBn+OAgicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAvL2FsZXJ0KCdTb2NrZXQuSU/jgYzliKnnlKjjgafjgY3jgarjgYTjgZ/jgoHjgIHjg4/jgqTjgrnjgrPjgqLmg4XloLHjgYzlj5blvpfjgafjgY3jgb7jgZvjgpPjgIInICsgZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHNlbmRTY29yZShzY29yZSlcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnc2VuZFNjb3JlJywgc2NvcmUpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBkaXNjb25uZWN0KClcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IHNmZyBmcm9tICcuL2dsb2JhbC5qcyc7IFxyXG4vL2ltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbi8vaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcblxyXG4vLy8g44OG44Kt44K544OI5bGe5oCnXHJcbmV4cG9ydCBjbGFzcyBUZXh0QXR0cmlidXRlIHtcclxuICBjb25zdHJ1Y3RvcihibGluaywgZm9udCkge1xyXG4gICAgaWYgKGJsaW5rKSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBibGluaztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChmb250KSB7XHJcbiAgICAgIHRoaXMuZm9udCA9IGZvbnQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmZvbnQgPSBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44OG44Kt44K544OI44OX44Os44O844OzXHJcbmV4cG9ydCBjbGFzcyBUZXh0UGxhbmV7IFxyXG4gIGNvbnN0cnVjdG9yIChzY2VuZSkge1xyXG4gIHRoaXMudGV4dEJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMuYXR0ckJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMudGV4dEJhY2tCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLmF0dHJCYWNrQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdmFyIGVuZGkgPSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW5kaTsgKytpKSB7XHJcbiAgICB0aGlzLnRleHRCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMudGV4dEJhY2tCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQmFja0J1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8g5o+P55S755So44Kt44Oj44Oz44OQ44K544Gu44K744OD44OI44Ki44OD44OXXHJcblxyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gc2ZnLlZJUlRVQUxfV0lEVEgpe1xyXG4gICAgd2lkdGggKj0gMjtcclxuICB9XHJcbiAgdmFyIGhlaWdodCA9IDE7XHJcbiAgd2hpbGUgKGhlaWdodCA8PSBzZmcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIFxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsYWxwaGFUZXN0OjAuNSwgdHJhbnNwYXJlbnQ6IHRydWUsZGVwdGhUZXN0OnRydWUsc2hhZGluZzpUSFJFRS5GbGF0U2hhZGluZ30pO1xyXG4vLyAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcuQUNUVUFMX1dJRFRIICogd2lkdGggLyBzZmcuVklSVFVBTF9XSURUSCAsIHNmZy5BQ1RVQUxfSEVJR0hUICogIGhlaWdodCAvIHNmZy5WSVJUVUFMX0hFSUdIVCApO1xyXG4vLyAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy5BQ1RVQUxfV0lEVEggLCBzZmcuQUNUVUFMX0hFSUdIVCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAoc2ZnLkFDVFVBTF9XSURUSCAqIHdpZHRoIC8gc2ZnLlZJUlRVQUxfV0lEVEggLSBzZmcuQUNUVUFMX1dJRFRIKSAvIDI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSAtIChzZmcuQUNUVUFMX0hFSUdIVCAqIGhlaWdodCAvIHNmZy5WSVJUVUFMX0hFSUdIVCAtIHNmZy5BQ1RVQUxfSEVJR0hUKSAvIDI7XHJcbiAgdGhpcy5mb250cyA9IHsgZm9udDogc2ZnLnRleHR1cmVGaWxlcy5mb250LCBmb250MTogc2ZnLnRleHR1cmVGaWxlcy5mb250MSB9O1xyXG4gIHRoaXMuYmxpbmtDb3VudCA9IDA7XHJcbiAgdGhpcy5ibGluayA9IGZhbHNlO1xyXG5cclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuY2xzKCk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbn1cclxuXHJcbiAgLy8vIOeUu+mdoua2iOWOu1xyXG4gIGNscygpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmRpID0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aDsgaSA8IGVuZGk7ICsraSkge1xyXG4gICAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGF0dHJfbGluZSA9IHRoaXMuYXR0ckJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGxpbmVfYmFjayA9IHRoaXMudGV4dEJhY2tCdWZmZXJbaV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmVfYmFjayA9IHRoaXMuYXR0ckJhY2tCdWZmZXJbaV07XHJcblxyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMudGV4dEJ1ZmZlcltpXS5sZW5ndGg7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICBsaW5lW2pdID0gMHgyMDtcclxuICAgICAgICBhdHRyX2xpbmVbal0gPSAweDAwO1xyXG4gICAgICAgIC8vbGluZV9iYWNrW2pdID0gMHgyMDtcclxuICAgICAgICAvL2F0dHJfbGluZV9iYWNrW2pdID0gMHgwMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIH1cclxuXHJcbiAgLy8vIOaWh+Wtl+ihqOekuuOBmeOCi1xyXG4gIHByaW50KHgsIHksIHN0ciwgYXR0cmlidXRlKSB7XHJcbiAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgIHZhciBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgaWYgKCFhdHRyaWJ1dGUpIHtcclxuICAgICAgYXR0cmlidXRlID0gMDtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgIGlmIChjID09IDB4YSkge1xyXG4gICAgICAgICsreTtcclxuICAgICAgICBpZiAoeSA+PSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6tcclxuICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IHRoaXMudGV4dEJ1ZmZlci5zbGljZSgxLCB0aGlzLnRleHRCdWZmZXIubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICB0aGlzLnRleHRCdWZmZXIucHVzaChuZXcgQXJyYXkoc2ZnLlZJUlRVQUxfV0lEVEggLyA4KSk7XHJcbiAgICAgICAgICB0aGlzLmF0dHJCdWZmZXIgPSB0aGlzLmF0dHJCdWZmZXIuc2xpY2UoMSwgdGhpcy5hdHRyQnVmZmVyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgdGhpcy5hdHRyQnVmZmVyLnB1c2gobmV3IEFycmF5KHNmZy5WSVJUVUFMX1dJRFRIIC8gOCkpO1xyXG4gICAgICAgICAgLS15O1xyXG4gICAgICAgICAgdmFyIGVuZGogPSB0aGlzLnRleHRCdWZmZXJbeV0ubGVuZ3RoO1xyXG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyW3ldW2pdID0gMHgyMDtcclxuICAgICAgICAgICAgdGhpcy5hdHRyQnVmZmVyW3ldW2pdID0gMHgwMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgICAgICBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgICAgIHggPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxpbmVbeF0gPSBjO1xyXG4gICAgICAgIGF0dHJbeF0gPSBhdHRyaWJ1dGU7XHJcbiAgICAgICAgKyt4O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDjg4bjgq3jgrnjg4jjg4fjg7zjgr/jgpLjgoLjgajjgavjg4bjgq/jgrnjg4Hjg6Pjg7zjgavmj4/nlLvjgZnjgotcclxuICByZW5kZXIoKSB7XHJcbiAgICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICB0aGlzLmJsaW5rQ291bnQgPSAodGhpcy5ibGlua0NvdW50ICsgMSkgJiAweGY7XHJcblxyXG4gICAgdmFyIGRyYXdfYmxpbmsgPSBmYWxzZTtcclxuICAgIGlmICghdGhpcy5ibGlua0NvdW50KSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSAhdGhpcy5ibGluaztcclxuICAgICAgZHJhd19ibGluayA9IHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgdXBkYXRlID0gZmFsc2U7XHJcbi8vICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4vLyAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwLCBneSA9IDA7IHkgPCBzZmcuVEVYVF9IRUlHSFQ7ICsreSwgZ3kgKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmUgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICAgIHZhciBsaW5lX2JhY2sgPSB0aGlzLnRleHRCYWNrQnVmZmVyW3ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lX2JhY2sgPSB0aGlzLmF0dHJCYWNrQnVmZmVyW3ldO1xyXG4gICAgICBmb3IgKHZhciB4ID0gMCwgZ3ggPSAwOyB4IDwgc2ZnLlRFWFRfV0lEVEg7ICsreCwgZ3ggKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgICB2YXIgcHJvY2Vzc19ibGluayA9IChhdHRyX2xpbmVbeF0gJiYgYXR0cl9saW5lW3hdLmJsaW5rKTtcclxuICAgICAgICBpZiAobGluZVt4XSAhPSBsaW5lX2JhY2tbeF0gfHwgYXR0cl9saW5lW3hdICE9IGF0dHJfbGluZV9iYWNrW3hdIHx8IChwcm9jZXNzX2JsaW5rICYmIGRyYXdfYmxpbmspKSB7XHJcbiAgICAgICAgICB1cGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIGxpbmVfYmFja1t4XSA9IGxpbmVbeF07XHJcbiAgICAgICAgICBhdHRyX2xpbmVfYmFja1t4XSA9IGF0dHJfbGluZVt4XTtcclxuICAgICAgICAgIHZhciBjID0gMDtcclxuICAgICAgICAgIGlmICghcHJvY2Vzc19ibGluayB8fCB0aGlzLmJsaW5rKSB7XHJcbiAgICAgICAgICAgIGMgPSBsaW5lW3hdIC0gMHgyMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHZhciB5cG9zID0gKGMgPj4gNCkgPDwgMztcclxuICAgICAgICAgIHZhciB4cG9zID0gKGMgJiAweGYpIDw8IDM7XHJcbiAgICAgICAgICBjdHguY2xlYXJSZWN0KGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIHZhciBmb250ID0gYXR0cl9saW5lW3hdID8gYXR0cl9saW5lW3hdLmZvbnQgOiBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICAgICAgICBpZiAoYykge1xyXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGZvbnQuaW1hZ2UsIHhwb3MsIHlwb3MsIHNmZy5DSEFSX1NJWkUsIHNmZy5DSEFSX1NJWkUsIGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHVwZGF0ZTtcclxuICB9XHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29sbGlzaW9uQXJlYSB7XHJcbiAgY29uc3RydWN0b3Iob2Zmc2V0WCwgb2Zmc2V0WSwgd2lkdGgsIGhlaWdodClcclxuICB7XHJcbiAgICB0aGlzLm9mZnNldFggPSBvZmZzZXRYIHx8IDA7XHJcbiAgICB0aGlzLm9mZnNldFkgPSBvZmZzZXRZIHx8IDA7XHJcbiAgICB0aGlzLnRvcCA9IDA7XHJcbiAgICB0aGlzLmJvdHRvbSA9IDA7XHJcbiAgICB0aGlzLmxlZnQgPSAwO1xyXG4gICAgdGhpcy5yaWdodCA9IDA7XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGggfHwgMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDA7XHJcbiAgICB0aGlzLndpZHRoXyA9IDA7XHJcbiAgICB0aGlzLmhlaWdodF8gPSAwO1xyXG4gIH1cclxuICBnZXQgd2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoXzsgfVxyXG4gIHNldCB3aWR0aCh2KSB7XHJcbiAgICB0aGlzLndpZHRoXyA9IHY7XHJcbiAgICB0aGlzLmxlZnQgPSB0aGlzLm9mZnNldFggLSB2IC8gMjtcclxuICAgIHRoaXMucmlnaHQgPSB0aGlzLm9mZnNldFggKyB2IC8gMjtcclxuICB9XHJcbiAgZ2V0IGhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0XzsgfVxyXG4gIHNldCBoZWlnaHQodikge1xyXG4gICAgdGhpcy5oZWlnaHRfID0gdjtcclxuICAgIHRoaXMudG9wID0gdGhpcy5vZmZzZXRZICsgdiAvIDI7XHJcbiAgICB0aGlzLmJvdHRvbSA9IHRoaXMub2Zmc2V0WSAtIHYgLyAyO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHgsIHksIHopIHtcclxuICAgIHRoaXMueF8gPSB4IHx8IDA7XHJcbiAgICB0aGlzLnlfID0geSB8fCAwO1xyXG4gICAgdGhpcy56XyA9IHogfHwgMC4wO1xyXG4gICAgdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgICB0aGlzLndpZHRoID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gMDtcclxuICAgIHRoaXMuY29sbGlzaW9uQXJlYSA9IG5ldyBDb2xsaXNpb25BcmVhKCk7XHJcbiAgfVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdjsgfVxyXG59XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBzZmcgZnJvbSAnLi9nbG9iYWwuanMnOyBcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmouanMnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzLmpzJztcclxuXHJcbnZhciBteUJ1bGxldHMgPSBbXTtcclxuXHJcbi8vLyDoh6rmqZ/lvL4gXHJcbmV4cG9ydCBjbGFzcyBNeUJ1bGxldCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICBzdXBlcigwLCAwLCAwKTtcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNDtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gNjtcclxuICB0aGlzLnNwZWVkID0gODtcclxuICB0aGlzLnBvd2VyID0gMTtcclxuXHJcbiAgdGhpcy50ZXh0dXJlV2lkdGggPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS53aWR0aDtcclxuICB0aGlzLnRleHR1cmVIZWlnaHQgPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuXHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwoc2ZnLnRleHR1cmVGaWxlcy5teXNoaXApO1xyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAsIDE2LCAxNiwgMSk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIC8vc2UoMCk7XHJcbiAgLy9zZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzBdKTtcclxuICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB0aGlzLm1lc2gudmlzaWJsZSA9IHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gIC8vICBzZmcudGFza3MucHVzaFRhc2soZnVuY3Rpb24gKHRhc2tJbmRleCkgeyBzZWxmLm1vdmUodGFza0luZGV4KTsgfSk7XHJcbiB9XHJcblxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gICptb3ZlKHRhc2tJbmRleCkge1xyXG4gICAgXHJcbiAgICB3aGlsZSAodGFza0luZGV4ID49IDAgXHJcbiAgICAgICYmIHRoaXMuZW5hYmxlX1xyXG4gICAgICAmJiB0aGlzLnkgPD0gKHNmZy5WX1RPUCArIDE2KSBcclxuICAgICAgJiYgdGhpcy55ID49IChzZmcuVl9CT1RUT00gLSAxNikgXHJcbiAgICAgICYmIHRoaXMueCA8PSAoc2ZnLlZfUklHSFQgKyAxNikgXHJcbiAgICAgICYmIHRoaXMueCA+PSAoc2ZnLlZfTEVGVCAtIDE2KSlcclxuICAgIHtcclxuICAgICAgXHJcbiAgICAgIHRoaXMueSArPSB0aGlzLmR5O1xyXG4gICAgICB0aGlzLnggKz0gdGhpcy5keDtcclxuICAgICAgXHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2sodGFza0luZGV4KTtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbn1cclxuXHJcbiAgc3RhcnQoeCwgeSwgeiwgYWltUmFkaWFuLHBvd2VyKSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0geiAtIDAuMTtcclxuICAgIHRoaXMucG93ZXIgPSBwb3dlciB8IDE7XHJcbiAgICB0aGlzLmR4ID0gTWF0aC5jb3MoYWltUmFkaWFuKSAqIHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4oYWltUmFkaWFuKSAqIHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLnNlKDApO1xyXG4gICAgLy9zZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzBdKTtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/jgqrjg5bjgrjjgqfjgq/jg4hcclxuZXhwb3J0IGNsYXNzIE15U2hpcCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7IFxyXG4gIGNvbnN0cnVjdG9yKHgsIHksIHosc2NlbmUsc2UpIHtcclxuICBzdXBlcih4LCB5LCB6KTsvLyBleHRlbmRcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNjtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gODtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gIC8vdGhpcy50ZXh0dXJlV2lkdGggPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS53aWR0aDtcclxuICAvL3RoaXMudGV4dHVyZUhlaWdodCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLmhlaWdodDtcclxuXHJcbiAgLy8g44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6XHJcbiAgLy8g44Oe44OG44Oq44Ki44Or44Gu5L2c5oiQXHJcbiAgLy92YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbChzZmcudGV4dHVyZUZpbGVzLm15c2hpcCk7XHJcbiAgLy8g44K444Kq44Oh44OI44Oq44Gu5L2c5oiQXHJcbiAgLy92YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSh0aGlzLndpZHRoKTtcclxuICAvL2dyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLm15c2hpcCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDApO1xyXG5cclxuICAvL3RoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoID0gc2ZnLmdhbWUubWVzaE15U2hpcDtcclxuICBsZXQgYmJveCA9IG5ldyBUSFJFRS5Cb3gzKCkuc2V0RnJvbU9iamVjdCh0aGlzLm1lc2gpO1xyXG4gIGxldCBkID0gYmJveC5nZXRTaXplKCk7XHJcblxyXG4gIHRoaXMud2lkdGggPSAwO1xyXG4gIHRoaXMuaGVpZ2h0ID0gMDtcclxuXHJcbiAgLy8g56e75YuV56+E5Zuy44KS5rGC44KB44KLXHJcbiAgdGhpcy50b3AgPSAoc2ZnLlZfVE9QIC0gdGhpcy5oZWlnaHQgLyAyKSB8IDA7XHJcbiAgdGhpcy5ib3R0b20gPSAoc2ZnLlZfQk9UVE9NICsgdGhpcy5oZWlnaHQgLyAyKSB8IDA7XHJcbiAgdGhpcy5sZWZ0ID0gKHNmZy5WX0xFRlQgKyB0aGlzLndpZHRoIC8gMikgfCAwO1xyXG4gIHRoaXMucmlnaHQgPSAoc2ZnLlZfUklHSFQgLSB0aGlzLndpZHRoIC8gMikgfCAwO1xyXG5cclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcbiAgdGhpcy5yZXN0ID0gMztcclxuICAvLyB0aGlzLm15QnVsbGV0cyA9ICggKCk9PiB7XHJcbiAgLy8gICB2YXIgYXJyID0gW107XHJcbiAgLy8gICBmb3IgKHZhciBpID0gMDsgaSA8IDI7ICsraSkge1xyXG4gIC8vICAgICBhcnIucHVzaChuZXcgTXlCdWxsZXQodGhpcy5zY2VuZSx0aGlzLnNlKSk7XHJcbiAgLy8gICB9XHJcbiAgLy8gICByZXR1cm4gYXJyO1xyXG4gIC8vIH0pKCk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgXHJcbiAgdGhpcy5idWxsZXRQb3dlciA9IDE7XHJcblxyXG59XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgXHJcbiAgc2hvb3QoYWltUmFkaWFuKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5teUJ1bGxldHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgaWYgKHRoaXMubXlCdWxsZXRzW2ldLnN0YXJ0KHRoaXMueCwgdGhpcy55ICwgdGhpcy56LGFpbVJhZGlhbix0aGlzLmJ1bGxldFBvd2VyKSkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGFjdGlvbihiYXNpY0lucHV0KSB7XHJcbiAgICBpZiAoYmFzaWNJbnB1dC5sZWZ0KSB7XHJcbiAgICAgIGlmICh0aGlzLnggPiB0aGlzLmxlZnQpIHtcclxuICAgICAgICB0aGlzLnggLT0gMC4xNTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LnJpZ2h0KSB7XHJcbiAgICAgIGlmICh0aGlzLnggPCB0aGlzLnJpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy54ICs9IDAuMTU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC51cCkge1xyXG4gICAgICBpZiAodGhpcy55IDwgdGhpcy50b3ApIHtcclxuICAgICAgICB0aGlzLnkgKz0gMC4xNTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LmRvd24pIHtcclxuICAgICAgaWYgKHRoaXMueSA+IHRoaXMuYm90dG9tKSB7XHJcbiAgICAgICAgdGhpcy55IC09IDAuMTU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZihiYXNpY0lucHV0LmxlZnQgJiYgdGhpcy5tZXNoLnJvdGF0aW9uLnogPCAwLjQpe1xyXG4gICAgICB0aGlzLm1lc2gucm90YXRpb24ueiArPSAwLjAxOyBcclxuICAgIH0gZWxzZSBpZihiYXNpY0lucHV0LnJpZ2h0ICYmIHRoaXMubWVzaC5yb3RhdGlvbi56ID4gLTAuNCl7XHJcbiAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi56IC09IDAuMDE7XHJcbiAgICB9IGVsc2UgaWYodGhpcy5tZXNoLnJvdGF0aW9uLnogIT0gMCl7XHJcbiAgICAgIGlmKHRoaXMubWVzaC5yb3RhdGlvbi56IDwgMCl7XHJcbiAgICAgICAgdGhpcy5tZXNoLnJvdGF0aW9uLnogKz0gMC4wNTtcclxuICAgICAgICBpZih0aGlzLm1lc2gucm90YXRpb24ueiA+IDApe1xyXG4gICAgICAgICAgdGhpcy5tZXNoLnJvdGF0aW9uLnogPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZih0aGlzLm1lc2gucm90YXRpb24ueiA+IDApe1xyXG4gICAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi56IC09IDAuMDU7XHJcbiAgICAgICAgaWYodGhpcy5tZXNoLnJvdGF0aW9uLnogPCAwKXtcclxuICAgICAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIC8vIGlmIChiYXNpY0lucHV0LnopIHtcclxuICAgIC8vICAgYmFzaWNJbnB1dC5rZXlDaGVjay56ID0gZmFsc2U7XHJcbiAgICAvLyAgIHRoaXMuc2hvb3QoMC41ICogTWF0aC5QSSk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gaWYgKGJhc2ljSW5wdXQueCkge1xyXG4gICAgLy8gICBiYXNpY0lucHV0LmtleUNoZWNrLnggPSBmYWxzZTtcclxuICAgIC8vICAgdGhpcy5zaG9vdCgxLjUgKiBNYXRoLlBJKTtcclxuICAgIC8vIH1cclxuICB9XHJcbiAgXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHNmZy5ib21icy5zdGFydCh0aGlzLngsIHRoaXMueSwgMC4yKTtcclxuICAgIHRoaXMuc2UoNCk7XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLm15QnVsbGV0cy5mb3JFYWNoKChkKT0+e1xyXG4gICAgICBpZihkLmVuYWJsZV8pe1xyXG4gICAgICAgIHdoaWxlKCFzZmcudGFza3MuYXJyYXlbZC50YXNrLmluZGV4XS5nZW5JbnN0Lm5leHQoLSgxICsgZC50YXNrLmluZGV4KSkuZG9uZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBpbml0KCl7XHJcbiAgICAgIHRoaXMueCA9IDA7XHJcbi8vICAgICAgdGhpcy55ID0gLTEwMDtcclxuICAgICAgdGhpcy55ID0gMDtcclxuICAgICAgdGhpcy56ID0gMDtcclxuICAgICAgdGhpcy5yZXN0ID0gMztcclxuICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbiIsIlxyXG5leHBvcnQgdmFyIHNlcURhdGEgPSB7XHJcbiAgbmFtZTogJ1Rlc3QnLFxyXG4gIHRyYWNrczogW1xyXG4vKiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDAsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYFxyXG4gICAgICAgczAuMDEsMC4yLDAuMiwwLjAzIEAyIFxyXG4gICAgICAgdDE0MCAgcTM1IHYzMCBsMXIxcjFyMXIxICRsMTZvMyBjY2NjY2NjYzxnZ2dnYWFiYj4gY2NjY2NjY2M8Z2dnZz5jYzxiYiBiLWItYi1iLWItYi1iLWItZmZmZmdnZytnKyBnK2crZytnK2crZytnK2crZ2dnZ2FhYmIgPlxyXG4gICAgICAgICAgICAgYFxyXG4gICAgICB9LCovXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDEsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYFxyXG4gICAgICAgczAuMDEsMC4yLDAuMiwwLjAzIEAyIFxyXG4gICAgICAgdDE2MCAgcTU1IHYyMCBvMiBsOCAkYmJiYiBiYmJiXHJcbiAgICAgICAgICAgICBgXHJcbiAgICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDIsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYFxyXG4gICAgICAgczAuMDEsMC4yLDAuMiwwLjA1IEA0IFxyXG4gICAgICAgdDE2MCAgcTc1IHYyMCBvNCBsOCAkW2JkK10xIFtiZCtdW2JkK10gcjhbZis+Yys8XSByOFtkK2ItXSByOFtiZCtdMi5yOHI0XHJcbiAgICAgICAgICAgICBgXHJcbiAgICAgIH0sXHJcblxyXG4gICAge1xyXG4gICAgICBuYW1lOiAnYmFzZScsXHJcbiAgICAgIGNoYW5uZWw6IDMsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYHMwLjAxLDAuMDEsMS4wLDAuMDUgbzUgdDE2MCBAMTAgdjYwIHEyMCAkbDRncmc4ZzhyYFxyXG4gICAgfVxyXG4gICAgLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAncGFydDQnLFxyXG4gICAgICBjaGFubmVsOiA0LFxyXG4gICAgICBtbWw6XHJcbiAgICAgIGBzMC4wMSwwLjAxLDEuMCwwLjA1IG81IHQxNjAgQDIxIHY2MCBxODAgJC86bDRydjYwYjgudjMwYjE2cmwxNnY2MGI4cjg6LzNsNHJiOC5iMTZybDE2YnIxNmJiYFxyXG4gICAgfVxyXG4gICAgLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAncGFydDUnLFxyXG4gICAgICBjaGFubmVsOiA1LFxyXG4gICAgICBtbWw6XHJcbiAgICAgIGBzMC4wMSwwLjAxLDEuMCwwLjA1IG81IHQxNjAgQDExIGw4ICQgcTIwIHY2MCByOGE4IHI4YThgXHJcbiAgICB9XHJcbiAgICAsXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0NScsXHJcbiAgICAgIGNoYW5uZWw6IDQsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYHMwLjAxLDAuMDEsMS4wLDAuMDUgbzUgdDE2MCBAMjAgcTk1ICR2MjAgbDQgcmdyZyBgXHJcbiAgICB9XHJcbiAgXVxyXG59O1xyXG5cclxuZXhwb3J0IHZhciBzb3VuZEVmZmVjdERhdGEgPSBbXHJcbiAgLy8gMFxyXG4gIHtcclxuICAgIG5hbWU6ICcnLFxyXG4gICAgdHJhY2tzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBjaGFubmVsOiAxMixcclxuICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgIG1tbDogJ3MwLjAwMDEsMC4wMDAxLDEuMCwwLjAwMSBANCB0MjQwIHExMjcgdjUwIGwxMjggbzggY2RlZmdhYiA8IGNkZWdhYmJiYidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNoYW5uZWw6IDEzLFxyXG4gICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgbW1sOiAnczAuMDAwMSwwLjAwMDEsMS4wLDAuMDAxIEA0IHQyNDAgcTEyNyB2NTAgbDEyOCBvNyBjZGVmZ2FiIDwgY2RlZ2FiYmJiJ1xyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuICAvLyAxXHJcbiAge1xyXG4gICAgbmFtZTogJycsXHJcbiAgICB0cmFja3M6IFtcclxuICAgICAge1xyXG4gICAgICAgIGNoYW5uZWw6IDE0LFxyXG4gICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgbW1sOiAnczAuMDAwMSwwLjAwMDEsMS4wLDAuMDAwMSBANCB0MjAwIHExMjcgdjUwIGw2NCBvNiBnIGFiPGJhZ2ZlZGNlZ2FiPmJhZ2ZlZGM+ZGJhZ2ZlZGMnXHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9LFxyXG4gIC8vIDIgXHJcbiAge1xyXG4gICAgbmFtZTogJycsXHJcbiAgICB0cmFja3M6IFtcclxuICAgICAge1xyXG4gICAgICAgIGNoYW5uZWw6IDE0LFxyXG4gICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgbW1sOiAnczAuMDAwMSwwLjAwMDEsMS4wLDAuMDAwMSBANCB0MTUwIHExMjcgdjUwIGwxMjggbzYgY2RlZmdhYj5jZGVmPGc+YT5iPGE+ZzxmPmU8ZSdcclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgLy8gMyBcclxuICB7XHJcbiAgICBuYW1lOiAnJyxcclxuICAgIHRyYWNrczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgY2hhbm5lbDogMTQsXHJcbiAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICBtbWw6ICdzMC4wMDAxLDAuMDAwMSwxLjAsMC4wMDAxIEA1IHQyMDAgcTEyNyB2NTAgbDY0IG82IGM8Yz5jPGM+YzxjPmM8J1xyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuICAvLyA0IFxyXG4gIHtcclxuICAgIG5hbWU6ICcnLFxyXG4gICAgdHJhY2tzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBjaGFubmVsOiAxNSxcclxuICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgIG1tbDogJ3MwLjAwMDEsMC4wMDAxLDEuMCwwLjI1IEA4IHQxMjAgcTEyNyB2NTAgbDIgbzAgYydcclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH1cclxuXTtcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG4vL3ZhciBTVEFHRV9NQVggPSAxO1xyXG5pbXBvcnQgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpby5qcyc7XHJcbi8vaW1wb3J0ICogYXMgc29uZyBmcm9tICcuL3NvbmcnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzLmpzJztcclxuaW1wb3J0ICogYXMgaW8gZnJvbSAnLi9pby5qcyc7XHJcbmltcG9ydCAqIGFzIGNvbW0gZnJvbSAnLi9jb21tLmpzJztcclxuaW1wb3J0ICogYXMgdGV4dCBmcm9tICcuL3RleHQuanMnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iai5qcyc7XHJcbmltcG9ydCAqIGFzIG15c2hpcCBmcm9tICcuL215c2hpcC5qcyc7XHJcbi8vaW1wb3J0ICogYXMgZW5lbWllcyBmcm9tICcuL2VuZW1pZXMuanMnO1xyXG4vL2ltcG9ydCAqIGFzIGVmZmVjdG9iaiBmcm9tICcuL2VmZmVjdG9iai5qcyc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9ldmVudEVtaXR0ZXIzLmpzJztcclxuaW1wb3J0IHtzZXFEYXRhLHNvdW5kRWZmZWN0RGF0YX0gZnJvbSAnLi9zZXFEYXRhLmpzJztcclxuXHJcblxyXG5jbGFzcyBTY29yZUVudHJ5IHtcclxuICBjb25zdHJ1Y3RvcihuYW1lLCBzY29yZSkge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuc2NvcmUgPSBzY29yZTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5jbGFzcyBTdGFnZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5NQVggPSAxO1xyXG4gICAgdGhpcy5ESUZGSUNVTFRZX01BWCA9IDIuMDtcclxuICAgIHRoaXMubm8gPSAxO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gICAgdGhpcy5kaWZmaWN1bHR5ID0gMTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgICB0aGlzLmRpZmZpY3VsdHkgPSAxO1xyXG4gIH1cclxuXHJcbiAgYWR2YW5jZSgpIHtcclxuICAgIHRoaXMubm8rKztcclxuICAgIHRoaXMucHJpdmF0ZU5vKys7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAganVtcChzdGFnZU5vKSB7XHJcbiAgICB0aGlzLm5vID0gc3RhZ2VObztcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gdGhpcy5ubyAtIDE7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgaWYgKHRoaXMuZGlmZmljdWx0eSA8IHRoaXMuRElGRklDVUxUWV9NQVgpIHtcclxuICAgICAgdGhpcy5kaWZmaWN1bHR5ID0gMSArIDAuMDUgKiAodGhpcy5ubyAtIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnByaXZhdGVObyA+PSB0aGlzLk1BWCkge1xyXG4gICAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgLy8gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsdGhpcyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLkNPTlNPTEVfV0lEVEggPSAwO1xyXG4gICAgdGhpcy5DT05TT0xFX0hFSUdIVCA9IDA7XHJcbiAgICB0aGlzLlJFTkRFUkVSX1BSSU9SSVRZID0gMTAwMDAwIHwgMDtcclxuICAgIHRoaXMucmVuZGVyZXIgPSBudWxsO1xyXG4gICAgdGhpcy5zdGF0cyA9IG51bGw7XHJcbiAgICB0aGlzLnNjZW5lID0gbnVsbDtcclxuICAgIHRoaXMuY2FtZXJhID0gbnVsbDtcclxuICAgIHRoaXMuYXV0aG9yID0gbnVsbDtcclxuICAgIHRoaXMucHJvZ3Jlc3MgPSBudWxsO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUgPSBudWxsO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0ID0gbmV3IGlvLkJhc2ljSW5wdXQoKTtcclxuICAgIHRoaXMudGFza3MgPSBuZXcgdXRpbC5UYXNrcygpO1xyXG4gICAgc2ZnLnRhc2tzID0gdGhpcy50YXNrcztcclxuICAgIHRoaXMud2F2ZUdyYXBoID0gbnVsbDtcclxuICAgIHRoaXMuc3RhcnQgPSBmYWxzZTtcclxuICAgIHRoaXMuYmFzZVRpbWUgPSBuZXcgRGF0ZTtcclxuICAgIHRoaXMuZCA9IC0wLjI7XHJcbiAgICB0aGlzLmF1ZGlvXyA9IG51bGw7XHJcbiAgICB0aGlzLnNlcXVlbmNlciA9IG51bGw7XHJcbiAgICB0aGlzLnBpYW5vID0gbnVsbDtcclxuICAgIHRoaXMuc2NvcmUgPSAwO1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSAwO1xyXG4gICAgdGhpcy5oaWdoU2NvcmVzID0gW107XHJcbiAgICB0aGlzLmlzSGlkZGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLm15c2hpcF8gPSBudWxsO1xyXG4gICAgdGhpcy5lbmVtaWVzID0gbnVsbDtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gbnVsbDtcclxuICAgIHRoaXMuUEkgPSBNYXRoLlBJO1xyXG4gICAgdGhpcy5jb21tXyA9IG51bGw7XHJcbiAgICB0aGlzLmhhbmRsZU5hbWUgPSAnJztcclxuICAgIHRoaXMuc3RvcmFnZSA9IG51bGw7XHJcbiAgICB0aGlzLnJhbmsgPSAtMTtcclxuICAgIHRoaXMuc291bmRFZmZlY3RzID0gbnVsbDtcclxuICAgIHRoaXMuZW5zID0gbnVsbDtcclxuICAgIHRoaXMuZW5icyA9IG51bGw7XHJcbiAgICB0aGlzLnN0YWdlID0gbmV3IFN0YWdlKCk7XHJcbiAgICBzZmcuc3RhZ2UgPSB0aGlzLnN0YWdlO1xyXG4gICAgdGhpcy50aXRsZSA9IG51bGw7Ly8g44K/44Kk44OI44Or44Oh44OD44K344OlXHJcbiAgICB0aGlzLnNwYWNlRmllbGQgPSBudWxsOy8vIOWuh+WumeepuumWk+ODkeODvOODhuOCo+OCr+ODq1xyXG4gICAgdGhpcy5lZGl0SGFuZGxlTmFtZSA9IG51bGw7XHJcbiAgICBzZmcuYWRkU2NvcmUgPSB0aGlzLmFkZFNjb3JlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLmNoZWNrVmlzaWJpbGl0eUFQSSgpO1xyXG4gICAgdGhpcy5hdWRpb18gPSBuZXcgYXVkaW8uQXVkaW8oKTtcclxuICB9XHJcblxyXG4gIGV4ZWMoKSB7XHJcbiAgICBcclxuICAgIGlmICghdGhpcy5jaGVja0Jyb3dzZXJTdXBwb3J0KCcjY29udGVudCcpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbmV3IGF1ZGlvLlNlcXVlbmNlcih0aGlzLmF1ZGlvXyk7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IG5ldyBhdWRpby5Tb3VuZEVmZmVjdHModGhpcy5zZXF1ZW5jZXIsc291bmRFZmZlY3REYXRhKTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlLCB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyID0gbmV3IHV0aWwuR2FtZVRpbWVyKHRoaXMuZ2V0Q3VycmVudFRpbWUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8vIOOCsuODvOODoOOCs+ODs+OCveODvOODq+OBruWIneacn+WMllxyXG4gICAgdGhpcy5pbml0Q29uc29sZSgpO1xyXG4gICAgdGhpcy5sb2FkUmVzb3VyY2VzKClcclxuICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMucHJvZ3Jlc3MubWVzaCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgICAgIHRoaXMudGFza3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMuYmFzaWNJbnB1dC51cGRhdGUuYmluZCh0aGlzLmJhc2ljSW5wdXQpKTtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMuaW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1haW4oKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBjaGVja1Zpc2liaWxpdHlBUEkoKSB7XHJcbiAgICAvLyBoaWRkZW4g44OX44Ot44OR44OG44Kj44GK44KI44Gz5Y+v6KaW5oCn44Gu5aSJ5pu044Kk44OZ44Oz44OI44Gu5ZCN5YmN44KS6Kit5a6aXHJcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50LmhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikgeyAvLyBPcGVyYSAxMi4xMCDjgoQgRmlyZWZveCAxOCDku6XpmY3jgafjgrXjg53jg7zjg4ggXHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJoaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcInZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibW96SGlkZGVuXCI7XHJcbiAgICAgIHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlID0gXCJtb3p2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tc0hpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibXNIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIm1zdmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQud2Via2l0SGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJ3ZWJraXRIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIndlYmtpdHZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2FsY1NjcmVlblNpemUoKSB7XHJcbiAgICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHZhciBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICBpZiAod2lkdGggPj0gaGVpZ2h0KSB7XHJcbiAgICAgIHdpZHRoID0gaGVpZ2h0ICogc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQ7XHJcbiAgICAgIHdoaWxlICh3aWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XHJcbiAgICAgICAgLS1oZWlnaHQ7XHJcbiAgICAgICAgd2lkdGggPSBoZWlnaHQgKiBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgd2hpbGUgKGhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xyXG4gICAgICAgIC0td2lkdGg7XHJcbiAgICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5DT05TT0xFX1dJRFRIID0gd2lkdGg7XHJcbiAgICB0aGlzLkNPTlNPTEVfSEVJR0hUID0gaGVpZ2h0O1xyXG4gIH1cclxuICBcclxuICAvLy8g44Kz44Oz44K944O844Or55S76Z2i44Gu5Yid5pyf5YyWXHJcbiAgaW5pdENvbnNvbGUoY29uc29sZUNsYXNzKSB7XHJcbiAgICAvLyDjg6zjg7Pjg4Djg6njg7zjga7kvZzmiJBcclxuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7IGFudGlhbGlhczogZmFsc2UsIHNvcnRPYmplY3RzOiB0cnVlIH0pO1xyXG4gICAgdmFyIHJlbmRlcmVyID0gdGhpcy5yZW5kZXJlcjtcclxuICAgIHRoaXMuY2FsY1NjcmVlblNpemUoKTtcclxuICAgIHJlbmRlcmVyLnNldFNpemUodGhpcy5DT05TT0xFX1dJRFRILCB0aGlzLkNPTlNPTEVfSEVJR0hUKTtcclxuICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMCwgMSk7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ2NvbnNvbGUnO1xyXG4gICAgcmVuZGVyZXIuZG9tRWxlbWVudC5jbGFzc05hbWUgPSBjb25zb2xlQ2xhc3MgfHwgJ2NvbnNvbGUnO1xyXG4gICAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS56SW5kZXggPSAwO1xyXG5cclxuXHJcbiAgICBkMy5zZWxlY3QoJyNjb250ZW50Jykubm9kZSgpLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2FsY1NjcmVlblNpemUoKTtcclxuICAgICAgcmVuZGVyZXIuc2V0U2l6ZSh0aGlzLkNPTlNPTEVfV0lEVEgsIHRoaXMuQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8g44K344O844Oz44Gu5L2c5oiQXHJcbiAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcblxyXG4gICAgLy8g44Kr44Oh44Op44Gu5L2c5oiQXHJcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYShzZmcuQU5HTEVfT0ZfVklFVywgc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueiA9IHNmZy5DQU1FUkFfWjsvL3NmZy5WSVJUVUFMX0hFSUdIVCAvIChNYXRoLnRhbigyICogTWF0aC5QSSAqIDUgLyAzNjApICogMik7Ly9zZmcuVklSVFVBTF9IRUlHSFQgLyAyO1xyXG4gICAgdGhpcy5jYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuXHJcbiAgICAvLyDjg6njgqTjg4jjga7kvZzmiJBcclxuICAgIHZhciBsaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmKTtcclxuICAgIGxpZ2h0LnBvc2l0aW9uLnNldCgwLjU3NywgMC41NzcsIDAuNTc3KTtcclxuICAgIHRoaXMuc2NlbmUuYWRkKGxpZ2h0KTtcclxuXHJcbiAgICB2YXIgYW1iaWVudCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhjMGMwYzApO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQoYW1iaWVudCk7XHJcbiAgICByZW5kZXJlci5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLy8vIOOCqOODqeODvOOBp+e1guS6huOBmeOCi+OAglxyXG4gIEV4aXRFcnJvcihlKSB7XHJcbiAgICAvL2N0eC5maWxsU3R5bGUgPSBcInJlZFwiO1xyXG4gICAgLy9jdHguZmlsbFJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgLy9jdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gICAgLy9jdHguZmlsbFRleHQoXCJFcnJvciA6IFwiICsgZSwgMCwgMjApO1xyXG4gICAgLy8vL2FsZXJ0KGUpO1xyXG4gICAgdGhpcy5zdGFydCA9IGZhbHNlO1xyXG4gICAgdGhyb3cgZTtcclxuICB9XHJcblxyXG4gIG9uVmlzaWJpbGl0eUNoYW5nZSgpIHtcclxuICAgIHZhciBoID0gZG9jdW1lbnRbdGhpcy5oaWRkZW5dO1xyXG4gICAgdGhpcy5pc0hpZGRlbiA9IGg7XHJcbiAgICBpZiAoaCkge1xyXG4gICAgICB0aGlzLnBhdXNlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlc3VtZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcGF1c2UoKSB7XHJcbiAgICBpZiAoc2ZnLmdhbWVUaW1lci5zdGF0dXMgPT0gc2ZnLmdhbWVUaW1lci5TVEFSVCkge1xyXG4gICAgICBzZmcuZ2FtZVRpbWVyLnBhdXNlKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zZXF1ZW5jZXIuc3RhdHVzID09IHRoaXMuc2VxdWVuY2VyLlBMQVkpIHtcclxuICAgICAgdGhpcy5zZXF1ZW5jZXIucGF1c2UoKTtcclxuICAgIH1cclxuICAgIHNmZy5wYXVzZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICByZXN1bWUoKSB7XHJcbiAgICBpZiAoc2ZnLmdhbWVUaW1lci5zdGF0dXMgPT0gc2ZnLmdhbWVUaW1lci5QQVVTRSkge1xyXG4gICAgICBzZmcuZ2FtZVRpbWVyLnJlc3VtZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2VxdWVuY2VyLnN0YXR1cyA9PSB0aGlzLnNlcXVlbmNlci5QQVVTRSkge1xyXG4gICAgICB0aGlzLnNlcXVlbmNlci5yZXN1bWUoKTtcclxuICAgIH1cclxuICAgIHNmZy5wYXVzZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8vIOePvuWcqOaZgumWk+OBruWPluW+l1xyXG4gIGdldEN1cnJlbnRUaW1lKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXVkaW9fLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gIH1cclxuXHJcbiAgLy8vIOODluODqeOCpuOCtuOBruapn+iDveODgeOCp+ODg+OCr1xyXG4gIGNoZWNrQnJvd3NlclN1cHBvcnQoKSB7XHJcbiAgICB2YXIgY29udGVudCA9ICc8aW1nIGNsYXNzPVwiZXJyb3JpbWdcIiBzcmM9XCJodHRwOi8vcHVibGljLmJsdS5saXZlZmlsZXN0b3JlLmNvbS95MnBiWTNhcUJ6Nnd6NGFoODdSWEVWazVDbGhEMkx1akM1TnM2NkhLdlI4OWFqckZkTE0wVHhGZXJZWVVSdDgzY19iZzM1SFNrcWMzRThHeGFGRDgtWDk0TUxzRlY1R1U2QllwMTk1SXZlZ2V2US8yMDEzMTAwMS5wbmc/cHNpZD0xXCIgd2lkdGg9XCI0NzlcIiBoZWlnaHQ9XCI2NDBcIiBjbGFzcz1cImFsaWdubm9uZVwiIC8+JztcclxuICAgIC8vIFdlYkdM44Gu44K144Od44O844OI44OB44Kn44OD44KvXHJcbiAgICBpZiAoIURldGVjdG9yLndlYmdsKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWJHTOOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2ViIEF1ZGlvIEFQSeODqeODg+ODkeODvFxyXG4gICAgaWYgKCF0aGlzLmF1ZGlvXy5lbmFibGUpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYiBBdWRpbyBBUEnjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOODluODqeOCpuOCtuOBjFBhZ2UgVmlzaWJpbGl0eSBBUEkg44KS44K144Od44O844OI44GX44Gq44GE5aC05ZCI44Gr6K2m5ZGKIFxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmhpZGRlbiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPlBhZ2UgVmlzaWJpbGl0eSBBUEnjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgbG9jYWxTdG9yYWdlID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViIExvY2FsIFN0b3JhZ2XjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gXHJcbiAgLy8vIOOCsuODvOODoOODoeOCpOODs1xyXG4gIG1haW4oKSB7XHJcbiAgICAvLyDjgr/jgrnjgq/jga7lkbzjgbPlh7rjgZdcclxuICAgIC8vIOODoeOCpOODs+OBq+aPj+eUu1xyXG4gICAgaWYgKHRoaXMuc3RhcnQpIHtcclxuICAgICAgdGhpcy50YXNrcy5wcm9jZXNzKHRoaXMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbG9hZFJlc291cmNlcygpIHtcclxuICAgIC8vLyDjgrLjg7zjg6DkuK3jga7jg4bjgq/jgrnjg4Hjg6Pjg7zlrprnvqlcclxuICAgIHZhciB0ZXh0dXJlcyA9IHtcclxuICAgICAgZm9udDogJ2Jhc2UvZ3JhcGhpYy9Gb250LnBuZycsXHJcbiAgICAgIGZvbnQxOiAnYmFzZS9ncmFwaGljL0ZvbnQyLnBuZycsXHJcbiAgICAgIGF1dGhvcjogJ2Jhc2UvZ3JhcGhpYy9hdXRob3IucG5nJyxcclxuICAgICAgdGl0bGU6ICdiYXNlL2dyYXBoaWMvVElUTEUucG5nJ1xyXG4gICAgfTtcclxuXHJcbiAgICAvLy8g44OG44Kv44K544OB44Oj44O844Gu44Ot44O844OJXHJcbiAgICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICAgIGZ1bmN0aW9uIGxvYWRUZXh0dXJlKHNyYykge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGxvYWRlci5sb2FkKHNyYywgKHRleHR1cmUpID0+IHtcclxuICAgICAgICAgIHRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgICAgICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gICAgICAgICAgcmVzb2x2ZSh0ZXh0dXJlKTtcclxuICAgICAgICB9LCBudWxsLCAoeGhyKSA9PiB7IHJlamVjdCh4aHIpIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4TGVuZ3RoID0gT2JqZWN0LmtleXModGV4dHVyZXMpLmxlbmd0aDtcclxuICAgIHZhciB0ZXhDb3VudCA9IDA7XHJcblxyXG4gICAgdGhpcy5wcm9ncmVzcyA9IG5ldyBncmFwaGljcy5Qcm9ncmVzcygpO1xyXG4gICAgdGhpcy5wcm9ncmVzcy5tZXNoLnBvc2l0aW9uLnogPSAwLjAwMTtcclxuICAgIHRoaXMucHJvZ3Jlc3MucmVuZGVyKCdMb2FkaW5nIFJlc291Y2VzIC4uLicsIDApO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5wcm9ncmVzcy5tZXNoKTtcclxuICAgIHZhciBsb2FkUHJvbWlzZSA9IHRoaXMuYXVkaW9fLnJlYWREcnVtU2FtcGxlO1xyXG4gICAgZm9yICh2YXIgbiBpbiB0ZXh0dXJlcykge1xyXG4gICAgICAoKG5hbWUsIHRleFBhdGgpID0+IHtcclxuICAgICAgICBsb2FkUHJvbWlzZSA9IGxvYWRQcm9taXNlXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBsb2FkVGV4dHVyZShzZmcucmVzb3VyY2VCYXNlICsgdGV4UGF0aCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oKHRleCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXhDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAodGV4Q291bnQgLyB0ZXhMZW5ndGggKiAxMDApIHwgMCk7XHJcbiAgICAgICAgICAgIHNmZy50ZXh0dXJlRmlsZXNbbmFtZV0gPSB0ZXg7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pKG4sIHRleHR1cmVzW25dKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgbG9hZFByb21pc2UgPSBsb2FkUHJvbWlzZS50aGVuKCgpPT57XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgICAgdmFyIGpzb24gPSAnLi9kYXRhL3Rlc3QuanNvbic7Ly8ganNvbuODkeOCueOBruaMh+WumlxyXG4gICAgICAgICAgLy8ganNvbuODleOCoeOCpOODq+OBruiqreOBv+i+vOOBv1xyXG4gICAgICAgICAgdmFyIGxvYWRlciA9IG5ldyBUSFJFRS5KU09OTG9hZGVyKCk7XHJcbiAgICAgICAgICBsb2FkZXIubG9hZChqc29uLCAoZ2VvbWV0cnksIG1hdGVyaWFscykgPT4ge1xyXG4gICAgICAgICAgICB2YXIgZmFjZU1hdGVyaWFsID0gbmV3IFRIUkVFLk11bHRpTWF0ZXJpYWwobWF0ZXJpYWxzKTtcclxuICAgICAgICAgICAgc2VsZi5tZXNoTXlTaGlwID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIGZhY2VNYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIHNlbGYubWVzaE15U2hpcC5yb3RhdGlvbi5zZXQoOTAsIDAsIDApO1xyXG4gICAgICAgICAgICBzZWxmLm1lc2hNeVNoaXAucG9zaXRpb24uc2V0KDAsIDAsIDAuMCk7XHJcbiAgICAgICAgICAgIHNlbGYubWVzaE15U2hpcC5zY2FsZS5zZXQoMSwxLDEpO1xyXG4gICAgICAgICAgICBzZWxmLnNjZW5lLmFkZChzZWxmLm1lc2hNeVNoaXApOyAvLyDjgrfjg7zjg7Pjgbjjg6Hjg4Pjgrfjg6Xjga7ov73liqBcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBcclxuICAgIHJldHVybiBsb2FkUHJvbWlzZTtcclxuICB9XHJcblxyXG4qcmVuZGVyKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnJlbmRlcigpO1xyXG4gICAgdGhpcy5zdGF0cyAmJiB0aGlzLnN0YXRzLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfVxyXG59XHJcblxyXG5pbml0QWN0b3JzKClcclxue1xyXG4gIGxldCBwcm9taXNlcyA9IFtdO1xyXG4gIHRoaXMuc2NlbmUgPSB0aGlzLnNjZW5lIHx8IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIC8vdGhpcy5lbmVteUJ1bGxldHMgPSB0aGlzLmVuZW15QnVsbGV0cyB8fCBuZXcgZW5lbWllcy5FbmVteUJ1bGxldHModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICAvL3RoaXMuZW5lbWllcyA9IHRoaXMuZW5lbWllcyB8fCBuZXcgZW5lbWllcy5FbmVtaWVzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSwgdGhpcy5lbmVteUJ1bGxldHMpO1xyXG4gIC8vcHJvbWlzZXMucHVzaCh0aGlzLmVuZW1pZXMubG9hZFBhdHRlcm5zKCkpO1xyXG4gIC8vcHJvbWlzZXMucHVzaCh0aGlzLmVuZW1pZXMubG9hZEZvcm1hdGlvbnMoKSk7XHJcbiAgLy90aGlzLmJvbWJzID0gdGhpcy5ib21icyB8fCBuZXcgZWZmZWN0b2JqLkJvbWJzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgLy9zZmcuYm9tYiA9IHRoaXMuYm9tYnM7XHJcbiAgdGhpcy5teXNoaXBfID0gdGhpcy5teXNoaXBfIHx8IG5ldyBteXNoaXAuTXlTaGlwKDAsIC0xMDAsIDAuMSwgdGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICBzZmcubXlzaGlwXyA9IHRoaXMubXlzaGlwXztcclxuICB0aGlzLm15c2hpcF8ubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gIC8vdGhpcy5zcGFjZUZpZWxkID0gbnVsbDtcclxuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG59XHJcblxyXG5pbml0Q29tbUFuZEhpZ2hTY29yZSgpXHJcbntcclxuICAvLyDjg4/jg7Pjg4njg6vjg43jg7zjg6Djga7lj5blvpdcclxuICB0aGlzLmhhbmRsZU5hbWUgPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSgnaGFuZGxlTmFtZScpO1xyXG5cclxuICB0aGlzLnRleHRQbGFuZSA9IG5ldyB0ZXh0LlRleHRQbGFuZSh0aGlzLnNjZW5lKTtcclxuICAvLyB0ZXh0UGxhbmUucHJpbnQoMCwgMCwgXCJXZWIgQXVkaW8gQVBJIFRlc3RcIiwgbmV3IFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIC8vIOOCueOCs+OCouaDheWgsSDpgJrkv6HnlKhcclxuICB0aGlzLmNvbW1fID0gbmV3IGNvbW0uQ29tbSgpO1xyXG4gIHRoaXMuY29tbV8udXBkYXRlSGlnaFNjb3JlcyA9IChkYXRhKSA9PiB7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBkYXRhO1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLmhpZ2hTY29yZXNbMF0uc2NvcmU7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21tXy51cGRhdGVIaWdoU2NvcmUgPSAoZGF0YSkgPT4ge1xyXG4gICAgaWYgKHRoaXMuaGlnaFNjb3JlIDwgZGF0YS5zY29yZSkge1xyXG4gICAgICB0aGlzLmhpZ2hTY29yZSA9IGRhdGEuc2NvcmU7XHJcbiAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbn1cclxuXHJcbippbml0KHRhc2tJbmRleCkge1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB0aGlzLmluaXRDb21tQW5kSGlnaFNjb3JlKCk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgdGhpcy5pbml0QWN0b3JzKClcclxuICAgIC50aGVuKCgpPT57XHJcbiAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5yZW5kZXIuYmluZCh0aGlzKSwgdGhpcy5SRU5ERVJFUl9QUklPUklUWSk7XHJcbiAgICAgIC8vdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMucHJpbnRBdXRob3IuYmluZCh0aGlzKSk7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vLyDkvZzogIXooajnpLpcclxuKnByaW50QXV0aG9yKHRhc2tJbmRleCkge1xyXG4gIGNvbnN0IHdhaXQgPSA2MDtcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgXHJcbiAgbGV0IG5leHRUYXNrID0gKCk9PntcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMuYXV0aG9yKTtcclxuICAgIC8vc2NlbmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICBcclxuICBsZXQgY2hlY2tLZXlJbnB1dCA9ICgpPT4ge1xyXG4gICAgaWYgKHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID4gMCB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQpIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gICAgICBuZXh0VGFzaygpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9ICBcclxuXHJcbiAgLy8g5Yid5pyf5YyWXHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3ID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSBzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZS5oZWlnaHQ7XHJcbiAgY2FudmFzLndpZHRoID0gdztcclxuICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgY3R4LmRyYXdJbWFnZShzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZSwgMCwgMCk7XHJcbiAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG5cclxuICBnZW9tZXRyeS52ZXJ0X3N0YXJ0ID0gW107XHJcbiAgZ2VvbWV0cnkudmVydF9lbmQgPSBbXTtcclxuXHJcbiAge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdzsgKyt4KSB7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcblxyXG4gICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGcgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYiA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBhID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgaWYgKGEgIT0gMCkge1xyXG4gICAgICAgICAgY29sb3Iuc2V0UkdCKHIgLyAyNTUuMCwgZyAvIDI1NS4wLCBiIC8gMjU1LjApO1xyXG4gICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSksICgoeSAtIGggLyAyKSkgKiAtMSwgMC4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0MiA9IG5ldyBUSFJFRS5WZWN0b3IzKDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwLCAxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCwgMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDApO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9zdGFydC5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHZlcnQyLnggLSB2ZXJ0LngsIHZlcnQyLnkgLSB2ZXJ0LnksIHZlcnQyLnogLSB2ZXJ0LnopKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9lbmQucHVzaCh2ZXJ0KTtcclxuICAgICAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIOODnuODhuODquOCouODq+OCkuS9nOaIkFxyXG4gIC8vdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCdpbWFnZXMvcGFydGljbGUxLnBuZycpO1xyXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7c2l6ZTogMjAsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiBmYWxzZS8vLCBtYXA6IHRleHR1cmVcclxuICB9KTtcclxuXHJcbiAgdGhpcy5hdXRob3IgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgLy8gICAgYXV0aG9yLnBvc2l0aW9uLnggYXV0aG9yLnBvc2l0aW9uLnk9ICA9MC4wLCAwLjAsIDAuMCk7XHJcblxyXG4gIC8vbWVzaC5zb3J0UGFydGljbGVzID0gZmFsc2U7XHJcbiAgLy92YXIgbWVzaDEgPSBuZXcgVEhSRUUuUGFydGljbGVTeXN0ZW0oKTtcclxuICAvL21lc2guc2NhbGUueCA9IG1lc2guc2NhbGUueSA9IDguMDtcclxuXHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5hdXRob3IpOyAgXHJcblxyXG4gXHJcbiAgLy8g5L2c6ICF6KGo56S644K544OG44OD44OX77yRXHJcbiAgZm9yKGxldCBjb3VudCA9IDEuMDtjb3VudCA+IDA7KGNvdW50IDw9IDAuMDEpP2NvdW50IC09IDAuMDAwNTpjb3VudCAtPSAwLjAwMjUpXHJcbiAge1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBlbmQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7XHJcbiAgICBsZXQgdiA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gICAgbGV0IGQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X3N0YXJ0O1xyXG4gICAgbGV0IHYyID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZbaV0ueCA9IHYyW2ldLnggKyBkW2ldLnggKiBjb3VudDtcclxuICAgICAgdltpXS55ID0gdjJbaV0ueSArIGRbaV0ueSAqIGNvdW50O1xyXG4gICAgICB2W2ldLnogPSB2MltpXS56ICsgZFtpXS56ICogY291bnQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5hdXRob3Iucm90YXRpb24ueCA9IHRoaXMuYXV0aG9yLnJvdGF0aW9uLnkgPSB0aGlzLmF1dGhvci5yb3RhdGlvbi56ID0gY291bnQgKiA0LjA7XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIHRoaXMuYXV0aG9yLnJvdGF0aW9uLnggPSB0aGlzLmF1dGhvci5yb3RhdGlvbi55ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueiA9IDAuMDtcclxuXHJcbiAgZm9yIChsZXQgaSA9IDAsZSA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNbaV0ueCA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLng7XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS55ID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmRbaV0ueTtcclxuICAgIHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnogPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X2VuZFtpXS56O1xyXG4gIH1cclxuICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAvLyDlvoXjgaFcclxuICBmb3IobGV0IGkgPSAwO2kgPCB3YWl0OysraSl7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplID4gMikge1xyXG4gICAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplIC09IDAuNTtcclxuICAgICAgdGhpcy5hdXRob3IubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfSAgICBcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuXHJcbiAgLy8g44OV44Kn44O844OJ44Ki44Km44OIXHJcbiAgZm9yKGxldCBjb3VudCA9IDAuMDtjb3VudCA8PSAxLjA7Y291bnQgKz0gMC4wNSlcclxuICB7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjAgLSBjb3VudDtcclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG5cclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMC4wOyBcclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gIC8vIOW+heOBoVxyXG4gIGZvcihsZXQgaSA9IDA7aSA8IHdhaXQ7KytpKXtcclxuICAgIC8vIOS9leOBi+OCreODvOWFpeWKm+OBjOOBguOBo+OBn+WgtOWQiOOBr+asoeOBruOCv+OCueOCr+OBuFxyXG4gICAgaWYoY2hlY2tLZXlJbnB1dCgpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIG5leHRUYXNrKCk7XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vnlLvpnaLliJ3mnJ/ljJYgLy8vXHJcbippbml0VGl0bGUodGFza0luZGV4KSB7XHJcbiAgXHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgXHJcbiAgdGhpcy5iYXNpY0lucHV0LmNsZWFyKCk7XHJcblxyXG4gIC8vIOOCv+OCpOODiOODq+ODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHNmZy50ZXh0dXJlRmlsZXMudGl0bGUgfSk7XHJcbiAgbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gIC8vbWF0ZXJpYWwuYW50aWFsaWFzID0gZmFsc2U7XHJcbiAgbWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xyXG4gIG1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuICBtYXRlcmlhbC5kZXB0aFRlc3QgPSB0cnVlO1xyXG4gIHRoaXMudGl0bGUgPSBuZXcgVEhSRUUuTWVzaChcclxuICAgIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2Uud2lkdGgsIHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2UuaGVpZ2h0KSxcclxuICAgIG1hdGVyaWFsXHJcbiAgICApO1xyXG4gIHRoaXMudGl0bGUuc2NhbGUueCA9IHRoaXMudGl0bGUuc2NhbGUueSA9IDAuODtcclxuICB0aGlzLnRpdGxlLnBvc2l0aW9uLnkgPSA4MDtcclxuICB0aGlzLnNjZW5lLmFkZCh0aGlzLnRpdGxlKTtcclxuICB0aGlzLnNob3dTcGFjZUZpZWxkKCk7XHJcbiAgLy8vIOODhuOCreOCueODiOihqOekulxyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIDI1LCBcIlB1c2ggeiBvciBTVEFSVCBidXR0b25cIiwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuc2hvd1RpdGxlLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMTAvKuenkiovO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUaXRsZS5iaW5kKHRoaXMpKTtcclxuICByZXR1cm47XHJcbn1cclxuXHJcbi8vLyDog4zmma/jg5Hjg7zjg4bjgqPjgq/jg6vooajnpLpcclxuc2hvd1NwYWNlRmllbGQoKSB7XHJcbiAgLy8vIOiDjOaZr+ODkeODvOODhuOCo+OCr+ODq+ihqOekulxyXG4gIGlmICghdGhpcy5zcGFjZUZpZWxkKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgICBnZW9tZXRyeS5lbmR5ID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1MDsgKytpKSB7XHJcbiAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG4gICAgICB2YXIgeiA9IC0xODAwLjAgKiBNYXRoLnJhbmRvbSgpIC0gMzAwLjA7XHJcbiAgICAgIGNvbG9yLnNldEhTTCgwLjA1ICsgTWF0aC5yYW5kb20oKSAqIDAuMDUsIDEuMCwgKC0yMTAwIC0geikgLyAtMjEwMCk7XHJcbiAgICAgIHZhciBlbmR5ID0gc2ZnLlZJUlRVQUxfSEVJR0hUIC8gMiAtIHogKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgdmFyIHZlcnQyID0gbmV3IFRIUkVFLlZlY3RvcjMoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpICogTWF0aC5yYW5kb20oKSAtICgoc2ZnLlZJUlRVQUxfV0lEVEggLSB6ICogMikgLyAyKVxyXG4gICAgICAgICwgZW5keSAqIDIgKiBNYXRoLnJhbmRvbSgpIC0gZW5keSwgeik7XHJcbiAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICBnZW9tZXRyeS5lbmR5LnB1c2goZW5keSk7XHJcblxyXG4gICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Oe44OG44Oq44Ki44Or44KS5L2c5oiQXHJcbiAgICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7XHJcbiAgICAgIHNpemU6IDQsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSwgdmVydGV4Q29sb3JzOiB0cnVlLCBkZXB0aFRlc3Q6IHRydWUvLywgbWFwOiB0ZXh0dXJlXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNwYWNlRmllbGQgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLnNwYWNlRmllbGQucG9zaXRpb24ueCA9IHRoaXMuc3BhY2VGaWVsZC5wb3NpdGlvbi55ID0gdGhpcy5zcGFjZUZpZWxkLnBvc2l0aW9uLnogPSAwLjA7XHJcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnNwYWNlRmllbGQpO1xyXG4gICAgdGhpcy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmVTcGFjZUZpZWxkLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOWuh+WumeepuumWk+OBruihqOekulxyXG4qbW92ZVNwYWNlRmllbGQodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodHJ1ZSl7XHJcbiAgICB2YXIgdmVydHMgPSB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkudmVydGljZXM7XHJcbiAgICB2YXIgZW5keXMgPSB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkuZW5keTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2ZXJ0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2ZXJ0c1tpXS55IC09IDQ7XHJcbiAgICAgIGlmICh2ZXJ0c1tpXS55IDwgLWVuZHlzW2ldKSB7XHJcbiAgICAgICAgdmVydHNbaV0ueSA9IGVuZHlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCv+OCpOODiOODq+ihqOekulxyXG4qc2hvd1RpdGxlKHRhc2tJbmRleCkge1xyXG4gd2hpbGUodHJ1ZSl7XHJcbiAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuXHJcbiAgaWYgKHRoaXMuYmFzaWNJbnB1dC56IHx8IHRoaXMuYmFzaWNJbnB1dC5zdGFydCApIHtcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMudGl0bGUpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdEhhbmRsZU5hbWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIGlmICh0aGlzLnNob3dUaXRsZS5lbmRUaW1lIDwgc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSkge1xyXG4gICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy50aXRsZSk7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VG9wMTAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIHlpZWxkO1xyXG4gfVxyXG59XHJcblxyXG4vLy8g44OP44Oz44OJ44Or44ON44O844Og44Gu44Ko44Oz44OI44Oq5YmN5Yid5pyf5YyWXHJcbippbml0SGFuZGxlTmFtZSh0YXNrSW5kZXgpIHtcclxuICBsZXQgZW5kID0gZmFsc2U7XHJcbiAgaWYgKHRoaXMuZWRpdEhhbmRsZU5hbWUpe1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuZ2FtZUluaXQuYmluZCh0aGlzKSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSB0aGlzLmhhbmRsZU5hbWUgfHwgJyc7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDQsIDE4LCAnSW5wdXQgeW91ciBoYW5kbGUgbmFtZS4nKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE5LCAnKE1heCA4IENoYXIpJyk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXMuZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgLy8gICAgdGV4dFBsYW5lLnByaW50KDEwLCAyMSwgaGFuZGxlTmFtZVswXSwgVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQudW5iaW5kKCk7XHJcbiAgICB2YXIgZWxtID0gZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnaW5wdXQnKTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICBlbG1cclxuICAgICAgLmF0dHIoJ3R5cGUnLCAndGV4dCcpXHJcbiAgICAgIC5hdHRyKCdwYXR0ZXJuJywgJ1thLXpBLVowLTlfXFxAXFwjXFwkXFwtXXswLDh9JylcclxuICAgICAgLmF0dHIoJ21heGxlbmd0aCcsIDgpXHJcbiAgICAgIC5hdHRyKCdpZCcsICdpbnB1dC1hcmVhJylcclxuICAgICAgLmF0dHIoJ3ZhbHVlJywgdGhpc18uZWRpdEhhbmRsZU5hbWUpXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgZC5ub2RlKCkuc2VsZWN0aW9uU3RhcnQgPSB0aGlzXy5lZGl0SGFuZGxlTmFtZS5sZW5ndGg7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGQzLmV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIC8vbGV0IHRoaXNfID0gdGhpcztcclxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7IHRoaXMuZm9jdXMoKTsgfSwgMTApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChkMy5ldmVudC5rZXlDb2RlID09IDEzKSB7XHJcbiAgICAgICAgICB0aGlzXy5lZGl0SGFuZGxlTmFtZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICBsZXQgcyA9IHRoaXMuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgICBsZXQgZSA9IHRoaXMuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwLCAyMSwgdGhpc18uZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgICBkMy5zZWxlY3QodGhpcykub24oJ2tleXVwJywgbnVsbCk7XHJcbiAgICAgICAgICB0aGlzXy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgICAgICAgIC8vIOOBk+OBruOCv+OCueOCr+OCkue1guOCj+OCieOBm+OCi1xyXG4gICAgICAgICAgdGhpc18udGFza3MuYXJyYXlbdGFza0luZGV4XS5nZW5JbnN0Lm5leHQoLSh0YXNrSW5kZXggKyAxKSk7XHJcbiAgICAgICAgICAvLyDmrKHjga7jgr/jgrnjgq/jgpLoqK3lrprjgZnjgotcclxuICAgICAgICAgIHRoaXNfLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpc18uZ2FtZUluaXQuYmluZCh0aGlzXykpO1xyXG4gICAgICAgICAgdGhpc18uc3RvcmFnZS5zZXRJdGVtKCdoYW5kbGVOYW1lJywgdGhpc18uZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KCcjaW5wdXQtYXJlYScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzXy5lZGl0SGFuZGxlTmFtZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsICcgICAgICAgICAgICcpO1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwgJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcclxuICAgICAgICBsZXQgcyA9IHRoaXMubm9kZSgpLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsICcgICAgICAgICAgICcpO1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwgJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgICB0aGlzLm5vZGUoKS5mb2N1cygpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMClcclxuICAgIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmNsZWFyKCk7XHJcbiAgICAgIGlmKHRoaXMuYmFzaWNJbnB1dC5hQnV0dG9uIHx8IHRoaXMuYmFzaWNJbnB1dC5zdGFydClcclxuICAgICAge1xyXG4gICAgICAgICAgdmFyIGlucHV0QXJlYSA9IGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKTtcclxuICAgICAgICAgIHZhciBpbnB1dE5vZGUgPSBpbnB1dEFyZWEubm9kZSgpO1xyXG4gICAgICAgICAgdGhpcy5lZGl0SGFuZGxlTmFtZSA9IGlucHV0Tm9kZS52YWx1ZTtcclxuICAgICAgICAgIGxldCBzID0gaW5wdXROb2RlLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgbGV0IGUgPSBpbnB1dE5vZGUuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgICBpbnB1dEFyZWEub24oJ2tleXVwJywgbnVsbCk7XHJcbiAgICAgICAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgICAgICAgLy8g44GT44Gu44K/44K544Kv44KS57WC44KP44KJ44Gb44KLXHJcbiAgICAgICAgICAvL3RoaXMudGFza3MuYXJyYXlbdGFza0luZGV4XS5nZW5JbnN0Lm5leHQoLSh0YXNrSW5kZXggKyAxKSk7XHJcbiAgICAgICAgICAvLyDmrKHjga7jgr/jgrnjgq/jgpLoqK3lrprjgZnjgotcclxuICAgICAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgdGhpcy5zdG9yYWdlLnNldEl0ZW0oJ2hhbmRsZU5hbWUnLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGlucHV0QXJlYS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybjsgICAgICAgIFxyXG4gICAgICB9XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgdGFza0luZGV4ID0gLSgrK3Rhc2tJbmRleCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44K544Kz44Ki5Yqg566XXHJcbmFkZFNjb3JlKHMpIHtcclxuICB0aGlzLnNjb3JlICs9IHM7XHJcbiAgaWYgKHRoaXMuc2NvcmUgPiB0aGlzLmhpZ2hTY29yZSkge1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLnNjb3JlO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCueOCs+OCouihqOekulxyXG5wcmludFNjb3JlKCkge1xyXG4gIHZhciBzID0gKCcwMDAwMDAwMCcgKyB0aGlzLnNjb3JlLnRvU3RyaW5nKCkpLnNsaWNlKC04KTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgxLCAxLCBzKTtcclxuXHJcbiAgdmFyIGggPSAoJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3JlLnRvU3RyaW5nKCkpLnNsaWNlKC04KTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgxMiwgMSwgaCk7XHJcblxyXG59XHJcblxyXG4vLy8g44K144Km44Oz44OJ44Ko44OV44Kn44Kv44OIXHJcbnNlKGluZGV4KSB7XHJcbiAgdGhpcy5zZXF1ZW5jZXIucGxheVRyYWNrcyh0aGlzLnNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbaW5kZXhdKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODoOOBruWIneacn+WMllxyXG4qZ2FtZUluaXQodGFza0luZGV4KSB7XHJcblxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG5cclxuICAvLyDjgqrjg7zjg4fjgqPjgqrjga7plovlp4tcclxuICB0aGlzLmF1ZGlvXy5zdGFydCgpO1xyXG4gIHRoaXMuc2VxdWVuY2VyLmxvYWQoc2VxRGF0YSk7XHJcbiAgdGhpcy5zZXF1ZW5jZXIuc3RhcnQoKTtcclxuICBzZmcuc3RhZ2UucmVzZXQoKTtcclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICAvL3RoaXMuZW5lbWllcy5yZXNldCgpO1xyXG5cclxuICAvLyDoh6rmqZ/jga7liJ3mnJ/ljJZcclxuICB0aGlzLm15c2hpcF8uaW5pdCgpO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLnNjb3JlID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgyLCAwLCAnU2NvcmUgICAgSGlnaCBTY29yZScpO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDIwLCAzOSwgJ1Jlc3Q6ICAgJyArIHNmZy5teXNoaXBfLnJlc3QpO1xyXG4gIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlSW5pdC5iaW5kKHRoaXMpLypnYW1lQWN0aW9uKi8pO1xyXG59XHJcblxyXG4vLy8g44K544OG44O844K444Gu5Yid5pyf5YyWXHJcbipzdGFnZUluaXQodGFza0luZGV4KSB7XHJcbiAgXHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgXHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMCwgMzksICdTdGFnZTonICsgc2ZnLnN0YWdlLm5vKTtcclxuICBzZmcuZ2FtZVRpbWVyLnN0YXJ0KCk7XHJcbiAgLy90aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuICAvL3RoaXMuZW5lbWllcy5zdGFydCgpO1xyXG4gIC8vdGhpcy5lbmVtaWVzLmNhbGNFbmVtaWVzQ291bnQoc2ZnLnN0YWdlLnByaXZhdGVObyk7XHJcbiAgLy90aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vLy8g44K544OG44O844K46ZaL5aeLXHJcbipzdGFnZVN0YXJ0KHRhc2tJbmRleCkge1xyXG4gIGxldCBlbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgd2hpbGUodGFza0luZGV4ID49IDAgJiYgZW5kVGltZSA+PSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKXtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICBzZmcubXlzaGlwXy5hY3Rpb24odGhpcy5iYXNpY0lucHV0KTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkOyAgICBcclxuICB9XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgMTUsICcgICAgICAgICAgICAgICAgICAnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lQWN0aW9uLmJpbmQodGhpcyksIDUwMDApO1xyXG59XHJcblxyXG4vLy8g44Ky44O844Og5LitXHJcbipnYW1lQWN0aW9uKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlICh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIHNmZy5teXNoaXBfLmFjdGlvbih0aGlzLmJhc2ljSW5wdXQpO1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIC8vY29uc29sZS5sb2coc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSk7XHJcbiAgICAvL3RoaXMuZW5lbWllcy5tb3ZlKCk7XHJcblxyXG4gICAgLy8gaWYgKCF0aGlzLnByb2Nlc3NDb2xsaXNpb24oKSkge1xyXG4gICAgLy8gICAvLyDpnaLjgq/jg6rjgqLjg4Hjgqfjg4Pjgq9cclxuICAgIC8vICAgaWYgKHRoaXMuZW5lbWllcy5oaXRFbmVtaWVzQ291bnQgPT0gdGhpcy5lbmVtaWVzLnRvdGFsRW5lbWllc0NvdW50KSB7XHJcbiAgICAvLyAgICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICAvLyAgICAgdGhpcy5zdGFnZS5hZHZhbmNlKCk7XHJcbiAgICAvLyAgICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VJbml0LmJpbmQodGhpcykpO1xyXG4gICAgLy8gICAgIHJldHVybjtcclxuICAgIC8vICAgfVxyXG4gICAgLy8gfSBlbHNlIHtcclxuICAgIC8vICAgdGhpcy5teVNoaXBCb21iLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMztcclxuICAgIC8vICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMubXlTaGlwQm9tYi5iaW5kKHRoaXMpKTtcclxuICAgIC8vICAgcmV0dXJuO1xyXG4gICAgLy8gfTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkOyBcclxuICB9XHJcbn1cclxuXHJcbi8vLyDlvZPjgZ/jgorliKTlrppcclxucHJvY2Vzc0NvbGxpc2lvbih0YXNrSW5kZXgpIHtcclxuICAvLyAvL+OAgOiHquapn+W8vuOBqOaVteOBqOOBruOBguOBn+OCiuWIpOWumlxyXG4gIC8vIGxldCBteUJ1bGxldHMgPSBzZmcubXlzaGlwXy5teUJ1bGxldHM7XHJcbiAgLy8gdGhpcy5lbnMgPSB0aGlzLmVuZW1pZXMuZW5lbWllcztcclxuICAvLyBmb3IgKHZhciBpID0gMCwgZW5kID0gbXlCdWxsZXRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgLy8gICBsZXQgbXliID0gbXlCdWxsZXRzW2ldO1xyXG4gIC8vICAgaWYgKG15Yi5lbmFibGVfKSB7XHJcbiAgLy8gICAgIHZhciBteWJjbyA9IG15QnVsbGV0c1tpXS5jb2xsaXNpb25BcmVhO1xyXG4gIC8vICAgICB2YXIgbGVmdCA9IG15YmNvLmxlZnQgKyBteWIueDtcclxuICAvLyAgICAgdmFyIHJpZ2h0ID0gbXliY28ucmlnaHQgKyBteWIueDtcclxuICAvLyAgICAgdmFyIHRvcCA9IG15YmNvLnRvcCArIG15Yi55O1xyXG4gIC8vICAgICB2YXIgYm90dG9tID0gbXliY28uYm90dG9tIC0gbXliLnNwZWVkICsgbXliLnk7XHJcbiAgLy8gICAgIGZvciAodmFyIGogPSAwLCBlbmRqID0gdGhpcy5lbnMubGVuZ3RoOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgLy8gICAgICAgdmFyIGVuID0gdGhpcy5lbnNbal07XHJcbiAgLy8gICAgICAgaWYgKGVuLmVuYWJsZV8pIHtcclxuICAvLyAgICAgICAgIHZhciBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAvLyAgICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gIC8vICAgICAgICAgICAoZW4ueSArIGVuY28udG9wKSA+IGJvdHRvbSAmJlxyXG4gIC8vICAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gIC8vICAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gIC8vICAgICAgICAgICApIHtcclxuICAvLyAgICAgICAgICAgZW4uaGl0KG15Yik7XHJcbiAgLy8gICAgICAgICAgIGlmIChteWIucG93ZXIgPD0gMCkge1xyXG4gIC8vICAgICAgICAgICAgIG15Yi5lbmFibGVfID0gZmFsc2U7XHJcbiAgLy8gICAgICAgICAgIH1cclxuICAvLyAgICAgICAgICAgYnJlYWs7XHJcbiAgLy8gICAgICAgICB9XHJcbiAgLy8gICAgICAgfVxyXG4gIC8vICAgICB9XHJcbiAgLy8gICB9XHJcbiAgLy8gfVxyXG5cclxuICAvLyAvLyDmlbXjgajoh6rmqZ/jgajjga7jgYLjgZ/jgorliKTlrppcclxuICAvLyBpZiAoc2ZnLkNIRUNLX0NPTExJU0lPTikge1xyXG4gIC8vICAgbGV0IG15Y28gPSBzZmcubXlzaGlwXy5jb2xsaXNpb25BcmVhO1xyXG4gIC8vICAgbGV0IGxlZnQgPSBzZmcubXlzaGlwXy54ICsgbXljby5sZWZ0O1xyXG4gIC8vICAgbGV0IHJpZ2h0ID0gbXljby5yaWdodCArIHNmZy5teXNoaXBfLng7XHJcbiAgLy8gICBsZXQgdG9wID0gbXljby50b3AgKyBzZmcubXlzaGlwXy55O1xyXG4gIC8vICAgbGV0IGJvdHRvbSA9IG15Y28uYm90dG9tICsgc2ZnLm15c2hpcF8ueTtcclxuXHJcbiAgLy8gICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5lbnMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAvLyAgICAgbGV0IGVuID0gdGhpcy5lbnNbaV07XHJcbiAgLy8gICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgLy8gICAgICAgbGV0IGVuY28gPSBlbi5jb2xsaXNpb25BcmVhO1xyXG4gIC8vICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gIC8vICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAvLyAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgLy8gICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gIC8vICAgICAgICAgKSB7XHJcbiAgLy8gICAgICAgICBlbi5oaXQobXlzaGlwKTtcclxuICAvLyAgICAgICAgIHNmZy5teXNoaXBfLmhpdCgpO1xyXG4gIC8vICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgLy8gICAgICAgfVxyXG4gIC8vICAgICB9XHJcbiAgLy8gICB9XHJcbiAgLy8gICAvLyDmlbXlvL7jgajoh6rmqZ/jgajjga7jgYLjgZ/jgorliKTlrppcclxuICAvLyAgIHRoaXMuZW5icyA9IHRoaXMuZW5lbXlCdWxsZXRzLmVuZW15QnVsbGV0cztcclxuICAvLyAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLmVuYnMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAvLyAgICAgbGV0IGVuID0gdGhpcy5lbmJzW2ldO1xyXG4gIC8vICAgICBpZiAoZW4uZW5hYmxlKSB7XHJcbiAgLy8gICAgICAgbGV0IGVuY28gPSBlbi5jb2xsaXNpb25BcmVhO1xyXG4gIC8vICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gIC8vICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAvLyAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgLy8gICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gIC8vICAgICAgICAgKSB7XHJcbiAgLy8gICAgICAgICBlbi5oaXQoKTtcclxuICAvLyAgICAgICAgIHNmZy5teXNoaXBfLmhpdCgpO1xyXG4gIC8vICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgLy8gICAgICAgfVxyXG4gIC8vICAgICB9XHJcbiAgLy8gICB9XHJcblxyXG4gIC8vIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/niIbnmbogXHJcbi8vICpteVNoaXBCb21iKHRhc2tJbmRleCkge1xyXG4vLyAgIHdoaWxlKHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPD0gdGhpcy5teVNoaXBCb21iLmVuZFRpbWUgJiYgdGFza0luZGV4ID49IDApe1xyXG4vLyAgICAgdGhpcy5lbmVtaWVzLm1vdmUoKTtcclxuLy8gICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbi8vICAgICB0YXNrSW5kZXggPSB5aWVsZDsgIFxyXG4vLyAgIH1cclxuLy8gICBzZmcubXlzaGlwXy5yZXN0LS07XHJcbi8vICAgaWYgKHNmZy5teXNoaXBfLnJlc3QgPD0gMCkge1xyXG4vLyAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDE4LCAnR0FNRSBPVkVSJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbi8vICAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuLy8gICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDIwLCAzOSwgJ1Jlc3Q6ICAgJyArIHNmZy5teXNoaXBfLnJlc3QpO1xyXG4vLyAgICAgaWYodGhpcy5jb21tXy5lbmFibGUpe1xyXG4vLyAgICAgICB0aGlzLmNvbW1fLnNvY2tldC5vbignc2VuZFJhbmsnLCB0aGlzLmNoZWNrUmFua0luKTtcclxuLy8gICAgICAgdGhpcy5jb21tXy5zZW5kU2NvcmUobmV3IFNjb3JlRW50cnkodGhpcy5lZGl0SGFuZGxlTmFtZSwgdGhpcy5zY29yZSkpO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgdGhpcy5nYW1lT3Zlci5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbi8vICAgICB0aGlzLnJhbmsgPSAtMTtcclxuLy8gICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVPdmVyLmJpbmQodGhpcykpO1xyXG4vLyAgICAgdGhpcy5zZXF1ZW5jZXIuc3RvcCgpO1xyXG4vLyAgIH0gZWxzZSB7XHJcbi8vICAgICBzZmcubXlzaGlwXy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4vLyAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbi8vICAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuLy8gICAgIHRoaXMuc3RhZ2VTdGFydC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbi8vICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG4vLyAgIH1cclxuLy8gfVxyXG5cclxuLy8vIOOCsuODvOODoOOCquODvOODkOODvFxyXG4qZ2FtZU92ZXIodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodGhpcy5nYW1lT3Zlci5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGFza0luZGV4ID49IDApXHJcbiAge1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxuICBcclxuXHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgLy90aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuICAvL3RoaXMuZW5lbXlCdWxsZXRzLnJlc2V0KCk7XHJcbiAgaWYgKHRoaXMucmFuayA+PSAwKSB7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VG9wMTAuYmluZCh0aGlzKSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUaXRsZS5iaW5kKHRoaXMpKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg6njg7Pjgq3jg7PjgrDjgZfjgZ/jgYvjganjgYbjgYvjga7jg4Hjgqfjg4Pjgq9cclxuY2hlY2tSYW5rSW4oZGF0YSkge1xyXG4gIHRoaXMucmFuayA9IGRhdGEucmFuaztcclxufVxyXG5cclxuXHJcbi8vLyDjg4/jgqTjgrnjgrPjgqLjgqjjg7Pjg4jjg6rjga7ooajnpLpcclxucHJpbnRUb3AxMCgpIHtcclxuICB2YXIgcmFua25hbWUgPSBbJyAxc3QnLCAnIDJuZCcsICcgM3JkJywgJyA0dGgnLCAnIDV0aCcsICcgNnRoJywgJyA3dGgnLCAnIDh0aCcsICcgOXRoJywgJzEwdGgnXTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCA0LCAnVG9wIDEwIFNjb3JlJyk7XHJcbiAgdmFyIHkgPSA4O1xyXG4gIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLmhpZ2hTY29yZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZhciBzY29yZVN0ciA9ICcwMDAwMDAwMCcgKyB0aGlzLmhpZ2hTY29yZXNbaV0uc2NvcmU7XHJcbiAgICBzY29yZVN0ciA9IHNjb3JlU3RyLnN1YnN0cihzY29yZVN0ci5sZW5ndGggLSA4LCA4KTtcclxuICAgIGlmICh0aGlzLnJhbmsgPT0gaSkge1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCB5LCByYW5rbmFtZVtpXSArICcgJyArIHNjb3JlU3RyICsgJyAnICsgdGhpcy5oaWdoU2NvcmVzW2ldLm5hbWUsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMywgeSwgcmFua25hbWVbaV0gKyAnICcgKyBzY29yZVN0ciArICcgJyArIHRoaXMuaGlnaFNjb3Jlc1tpXS5uYW1lKTtcclxuICAgIH1cclxuICAgIHkgKz0gMjtcclxuICB9XHJcbn1cclxuXHJcblxyXG4qaW5pdFRvcDEwKHRhc2tJbmRleCkge1xyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIHRoaXMudGV4dFBsYW5lLmNscygpO1xyXG4gIHRoaXMucHJpbnRUb3AxMCgpO1xyXG4gIHRoaXMuc2hvd1RvcDEwLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgNTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zaG93VG9wMTAuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbipzaG93VG9wMTAodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodGhpcy5zaG93VG9wMTAuZW5kVGltZSA+PSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICYmIHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID09IDAgJiYgdGFza0luZGV4ID49IDApXHJcbiAge1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH0gXHJcbiAgXHJcbiAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIHRoaXMudGV4dFBsYW5lLmNscygpO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUaXRsZS5iaW5kKHRoaXMpKTtcclxufVxyXG59XHJcblxyXG5cclxuXHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vdmFyIFNUQUdFX01BWCA9IDE7XHJcbmltcG9ydCBzZmcgZnJvbSAnLi9nbG9iYWwuanMnOyBcclxuLy8gaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xyXG4vLyBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvLmpzJztcclxuLy8gLy9pbXBvcnQgKiBhcyBzb25nIGZyb20gJy4vc29uZyc7XHJcbi8vIGltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MuanMnO1xyXG4vLyBpbXBvcnQgKiBhcyBpbyBmcm9tICcuL2lvLmpzJztcclxuLy8gaW1wb3J0ICogYXMgY29tbSBmcm9tICcuL2NvbW0uanMnO1xyXG4vLyBpbXBvcnQgKiBhcyB0ZXh0IGZyb20gJy4vdGV4dC5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqLmpzJztcclxuLy8gaW1wb3J0ICogYXMgbXlzaGlwIGZyb20gJy4vbXlzaGlwLmpzJztcclxuLy8gaW1wb3J0ICogYXMgZW5lbWllcyBmcm9tICcuL2VuZW1pZXMuanMnO1xyXG4vLyBpbXBvcnQgKiBhcyBlZmZlY3RvYmogZnJvbSAnLi9lZmZlY3RvYmouanMnO1xyXG5pbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lLmpzJztcclxuXHJcbi8vLyDjg6HjgqTjg7Ncclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICBsZXQgcmVnID0gbmV3IFJlZ0V4cCgnKC4qXFwvKScpO1xyXG4gIGxldCByID0gcmVnLmV4ZWMod2luZG93LmxvY2F0aW9uLmhyZWYpO1xyXG4gIGxldCByb290ID0gclsxXTtcclxuICBpZih3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvZGV2dmVyLykpe1xyXG4gICAgc2ZnLnJlc291cmNlQmFzZSA9ICcuLi8uLi9kaXN0L3Jlcy8nO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBzZmcucmVzb3VyY2VCYXNlID0gJy4vcmVzLyc7XHJcbiAgfVxyXG4gIHNmZy5nYW1lID0gbmV3IEdhbWUoKTtcclxuICBzZmcuZ2FtZS5leGVjKCk7XHJcbn07XHJcbiJdLCJuYW1lcyI6WyJ0aGlzIiwibHpiYXNlNjIiLCJnYW1lb2JqLkdhbWVPYmoiLCJpby5CYXNpY0lucHV0IiwidXRpbC5UYXNrcyIsImF1ZGlvLkF1ZGlvIiwiYXVkaW8uU2VxdWVuY2VyIiwiYXVkaW8uU291bmRFZmZlY3RzIiwidXRpbC5HYW1lVGltZXIiLCJncmFwaGljcy5Qcm9ncmVzcyIsIm15c2hpcC5NeVNoaXAiLCJ0ZXh0LlRleHRQbGFuZSIsImNvbW0uQ29tbSIsInRleHQuVGV4dEF0dHJpYnV0ZSJdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVDQSxNQUFNLFFBQVEsQ0FBQztFQUNiLFdBQVcsR0FBRztJQUNaLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ3RCLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDO0lBQzNCLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0lBQzNCLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO0lBQzVCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEYsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQzs7Ozs7O0lBTWxGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7SUFDdkMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQztJQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO0lBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7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QUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUN0RSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO01BQzFFLEtBQUssQ0FBQyxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0tBQy9FOztJQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7TUFDbEQsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUI7O0lBRUQsU0FBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztHQUM3QyxNQUFNO0lBQ0wsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU07UUFDekIsQ0FBQyxDQUFDOztJQUVOLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO01BQzNCLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7TUFFcEYsUUFBUSxHQUFHO1FBQ1QsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUMxRCxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUM5RCxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDbEU7VUFDRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7V0FDNUI7O1VBRUQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztPQUNyRDtLQUNGO0dBQ0Y7O0VBRUQsT0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOzs7Ozs7Ozs7O0FBVUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUU7RUFDMUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxJQUFJLENBQUM7TUFDdEMsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQzs7RUFFMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDcEUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7T0FDaEQ7SUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRztNQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVE7S0FDNUIsQ0FBQztHQUNIOztFQUVELE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7OztBQVVGLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0VBQzlELElBQUksUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksSUFBSSxFQUFFLElBQUksQ0FBQztNQUM1QyxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDOztFQUUxQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNwRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFB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QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQTRCLFdBQVcsRUFBRSxRQUFhLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxBQUF5RCxDQUFBLENBQUMsQ0FBQyxVQUFVLENBQUNBLGNBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsT0FBTyxVQUFVLEVBQUUsV0FBVyxFQUFFLE9BQU8sV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLGdFQUFnRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQSxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7OztBQ0o5NEo7Ozs7O0FBS0EsQUFDQSxBQUNBLEFBQ0EsQUFDQSxB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QUFNLENBQUMsS0FBSztRQUNmLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDeEMsTUFBTTtNQUNSLEtBQUssTUFBTSxDQUFDLFlBQVk7UUFDdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMzQyxNQUFNO01BQ1IsS0FBSyxNQUFNLENBQUMsWUFBWTtRQUN0QixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsQ0FBQztRQUNsQyxNQUFNO01BQ1IsS0FBSyxNQUFNLENBQUMsU0FBUztRQUNuQixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzNELE1BQU07TUFDUixLQUFLLE1BQU0sQ0FBQyxRQUFRO1FBQ2xCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLE1BQU07TUFDUixLQUFLLE1BQU0sQ0FBQyxPQUFPO1FBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzdCLE1BQU07TUFDUixLQUFLLE1BQU0sQ0FBQyxJQUFJO1FBQ2QsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztNQUN6QyxLQUFLLE1BQU0sQ0FBQyxRQUFRO1FBQ2xCLE1BQU07TUFDUixLQUFLLE1BQU0sQ0FBQyxRQUFRO1FBQ2xCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEUsTUFBTTtL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QUFDLElBQUksQ0FBQyxDQUFDO0dBQy9DOztFQUVELElBQUksRUFBRSxHQUFHO0lBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDaEg7O0VBRUQsSUFBSSxJQUFJLEdBQUc7SUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDakg7O0VBRUQsSUFBSSxJQUFJLEdBQUc7SUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNsSDs7RUFFRCxJQUFJLEtBQUssR0FBRztJQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNsSDs7RUFFRCxJQUFJLENBQUMsR0FBRztLQUNMLElBQUksR0FBRyxH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Q0FBQyxTQUFTLEVBQUU7TUFDZCxTQUFTLEdBQUcsQ0FBQyxDQUFDO0tBQ2Y7SUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtNQUNuQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQzFCLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRTtRQUNaLEVBQUUsQ0FBQyxDQUFDO1FBQ0osSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7O1VBRS9CLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1VBQ3ZFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUN2RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztVQUN2RSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDdkQsRUFBRSxDQUFDLENBQUM7VUFDSixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztVQUNyQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcs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QUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7RUFFdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7RUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzs7O0VBR2hCLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUM3QyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDbkQsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzlDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O0VBR2hELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0VBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0VBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0VBQy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7OztFQVFkLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztFQUVyQixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzs7Q0FFdEI7RUFDQyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0VBQzNCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxF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QUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMxQjtPQUNGO01BQ0QsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDN0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1VBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDMUI7T0FDRjtLQUNGOzs7Ozs7Ozs7Ozs7O0dBYUY7O0VBRUQsR0FBRyxHQUFHO0lBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQzFCLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNyQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ1o7O0VBRUQsS0FBSyxFQUFFO0lBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUc7TUFDMUIsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ1gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDOUU7S0FDRixDQUFDLENBQUM7R0FDSjs7RUFFRCxJQUFJLEVBQUU7TUFDRixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7TUFFWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO01BQ1gsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7TUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7R0FDNUI7O0NBRUY7O0FDcE9NLElBQUksT0FBTyxHQUFHO0VBQ25CLElBQUksRUFBRSxNQUFNO0VBQ1osTUFBTSxFQUFFOzs7Ozs7Ozs7O0lBVU47TUFDRSxJQUFJLEVBQUUsT0FBTztNQUNiLE9BQU8sRUFBRSxDQUFDO01BQ1YsR0FBRztNQUNILENBQUM7OzthQUdNLENBQUM7T0FDUDtJQUNIO01BQ0UsSUFBSSxFQUFFLE9BQU87TUFDYixPQUFPLEVBQUUsQ0FBQztNQUNWLEdBQUc7TUFDSCxDQUFDOzs7YUFHTSxDQUFDO09BQ1A7O0lBRUg7TUFDRSxJQUFJLEVBQUUsTUFBTTtNQUNaLE9BQU8sRUFBRSxDQUFDO01BQ1YsR0FBRztNQUNILENBQUMsa0RBQWtELENBQUM7S0FDckQ7O0lBRUQ7TUFDRSxJQUFJLEVBQUUsT0FBTztNQUNiLE9BQU8sRUFBRSxDQUFDO01BQ1YsR0FBRztNQUNILENBQUMsMkZBQTJGLENBQUM7S0FDOUY7O0lBRUQ7TUFDRSxJQUFJLEVBQUUsT0FBTztNQUNiLE9BQU8sRUFBRSxDQUFDO01BQ1YsR0FBRztNQUNILENBQUMsc0RBQXNELENBQUM7S0FDekQ7O0lBRUQ7TUFDRSxJQUFJLEVBQUUsT0FBTztNQUNiLE9BQU8sRUFBRSxDQUFDO01BQ1YsR0FBRztNQUNILENBQUMsaURBQWlELENBQUM7S0FDcEQ7R0FDRjtDQUNGLENBQUM7O0FBRUYsQUFBTyxJQUFJLGVBQWUsR0FBRzs7RUFFM0I7SUFDRSxJQUFJLEVBQUUsRUFBRTtJQUNSLE1BQU0sRUFBRTtNQUNOO1FBQ0UsT0FBTyxFQUFFLEVBQUU7UUFDWCxPQUFPLEVBQUUsSUFBSTtRQUNiLEdBQUcsRUFBRSx1RUFBdUU7T0FDN0U7TUFDRDtRQUNFLE9BQU8sRUFBRSxFQUFFO1FBQ1gsT0FBTyxFQUFFLElBQUk7UUFDYixHQUFHLEVBQUUsdUVBQXVFO09BQzdFO0tBQ0Y7R0FDRjs7RUFFRDtJQUNFLElBQUksRUFBRSxFQUFFO0lBQ1IsTUFBTSxFQUFFO01BQ047UUFDRSxPQUFPLEVBQUUsRUFBRTtRQUNYLE9BQU8sRUFBRSxJQUFJO1FBQ2IsR0FBRyxFQUFFLHFGQUFxRjtPQUMzRjtLQUNGO0dBQ0Y7O0VBRUQ7SUFDRSxJQUFJLEVBQUUsRUFBRTtJQUNSLE1BQU0sRUFBRTtNQUNOO1FBQ0UsT0FBTyxFQUFFLEVBQUU7UUFDWCxPQUFPLEVBQUUsSUFBSTtRQUNiLEdBQUcsRUFBRSxpRkFBaUY7T0FDdkY7S0FDRjtHQUNGOztFQUVEO0lBQ0UsSUFBSSxFQUFFLEVBQUU7SUFDUixNQUFNLEVBQUU7TUFDTjtRQUNFLE9BQU8sRUFBRSxFQUFFO1FBQ1gsT0FBTyxFQUFFLElBQUk7UUFDYixHQUFHLEVBQUUsa0VBQWtFO09BQ3hFO0tBQ0Y7R0FDRjs7RUFFRDtJQUNFLElBQUksRUFBRSxFQUFFO0lBQ1IsTUFBTSxFQUFFO01BQ047UUFDRSxPQUFPLEVBQUUsRUFBRTtRQUNYLE9BQU8sRUFBRSxJQUFJO1FBQ2IsR0FBRyxFQUFFLGtEQUFrRDtPQUN4RDtLQUNGO0dBQ0Y7Q0FDRixDQUFDOztBQzFIRjtBQUNBLEFBQ0EsQUFDQSxBQUNBO0FBQ0EsQUFDQSxBQUNBLEFBQ0EsQUFDQSxBQUNBLEFBQ0E7O0FBRUEsQUFDQSxBQUdBLEFBUUEsTUFBTSxLQUFLLFNBQVMsWUFBWSxDQUFDO0VBQy9CLFdBQVcsR0FBRztJQUNaLEtBQUssRUFBRSxDQUFDO0lBQ1IsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDYixJQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQztJQUMxQixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNaLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0dBQ3JCOztFQUVELEtBQUssR0FBRztJQUNOLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ1osSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7R0FDckI7O0VBRUQsT0FBTyxHQUFHO0lBQ1IsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQ1YsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUNmOztFQUVELElBQUksQ0FBQyxPQUFPLEVBQUU7SUFDWixJQUFJLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUNmOztFQUVELE1BQU0sR0FBRztJQUNQLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFO01BQ3pDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzVDOztJQUVELElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO01BQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDOztLQUVwQjtJQUNELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzFCO0NBQ0Y7O0FBRUQsQUFBTyxNQUFNLElBQUksQ0FBQztFQUNoQixXQUFXLEdBQUc7SUFDWixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztJQUN2QixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztJQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztJQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztJQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUlDLFVBQWEsRUFBRSxDQUFDO0lBQ3RDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSUMsS0FBVSxFQUFFLENBQUM7SUFDOUIsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUM7SUFDekIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUNkLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDcEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDekIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDZixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUN6QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztJQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7SUFDekIsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQzNCLEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJQyxLQUFXLEVBQUUsQ0FBQztHQUNqQzs7RUFFRCxJQUFJLEdBQUc7O0lBRUwsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztNQUN4QyxPQUFPO0tBQ1I7O0lBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJQyxTQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSUMsWUFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDOztJQUUzRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDOUYsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJQyxTQUFjLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7O0lBR25FLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNuQixJQUFJLENBQUMsYUFBYSxFQUFFO09BQ2pCLElBQUksQ0FBQyxNQUFNO1FBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNiLENBQUMsQ0FBQztHQUNOOztFQUVELGtCQUFrQixHQUFHOztJQUVuQixJQUFJLE9BQU8sUUFBUSxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUU7TUFDMUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7TUFDdkIsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGtCQUFrQixDQUFDO0tBQzlDLE1BQU0sSUFBSSxPQUFPLFFBQVEsQ0FBQyxTQUFTLEtBQUssV0FBVyxFQUFFO01BQ3BELElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDO01BQzFCLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxxQkFBcUIsQ0FBQztLQUNqRCxNQUFNLElBQUksT0FBTyxRQUFRLENBQUMsUUFBUSxLQUFLLFdBQVcsRUFBRTtNQUNuRCxJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQztNQUN6QixNQUFNLENBQUMsZ0JBQWdCLEdBQUcsb0JBQW9CLENBQUM7S0FDaEQsTUFBTSxJQUFJLE9BQU8sUUFBUSxDQUFDLFlBQVksS0FBSyxXQUFXLEVBQUU7TUFDdkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUM7TUFDN0IsTUFBTSxDQUFDLGdCQUFnQixHQUFHLHdCQUF3QixDQUFDO0tBQ3BEO0dBQ0Y7O0VBRUQsY0FBYyxHQUFHO0lBQ2YsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUM5QixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ2hDLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRTtNQUNuQixLQUFLLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQztNQUN4RCxPQUFPLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFO1FBQ2hDLEVBQUUsTUFBTSxDQUFDO1FBQ1QsS0FBSyxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUM7T0FDekQ7S0FDRixNQUFNO01BQ0wsTUFBTSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUM7TUFDeEQsT0FBTyxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRTtRQUNsQyxFQUFFLEtBQUssQ0FBQztRQUNSLE1BQU0sR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDO09BQ3pEO0tBQ0Y7SUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUMzQixJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztHQUM5Qjs7O0VBR0QsV0FBVyxDQUFDLFlBQVksRUFBRTs7SUFFeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2pGLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDN0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3RCLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDMUQsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDO0lBQ25DLFFBQVEsQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLFlBQVksSUFBSSxTQUFTLENBQUM7SUFDMUQsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzs7O0lBR3JDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7SUFFOUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxNQUFNO01BQ3RDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztNQUN0QixRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQzNELENBQUMsQ0FBQzs7O0lBR0gsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7O0lBRy9CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNyRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztJQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7SUFHL0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7SUFFdEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNsQjs7O0VBR0QsU0FBUyxDQUFDLENBQUMsRUFBRTs7Ozs7O0lBTVgsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbkIsTUFBTSxDQUFDLENBQUM7R0FDVDs7RUFFRCxrQkFBa0IsR0FBRztJQUNuQixJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLElBQUksQ0FBQyxFQUFFO01BQ0wsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2QsTUFBTTtNQUNMLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNmO0dBQ0Y7O0VBRUQsS0FBSyxHQUFHO0lBQ04sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRTtNQUMvQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3ZCO0lBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtNQUNoRCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3hCO0lBQ0QsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7R0FDbEI7O0VBRUQsTUFBTSxHQUFHO0lBQ1AsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRTtNQUMvQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3hCO0lBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRTtNQUNqRCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3pCO0lBQ0QsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7R0FDbkI7OztFQUdELGNBQWMsR0FBRztJQUNmLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO0dBQ3pDOzs7RUFHRCxtQkFBbUIsR0FBRztJQUNwQixJQUFJLE9BQU8sR0FBRyxrUEFBa1AsQ0FBQzs7SUFFalEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7TUFDbkIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJO1FBQzdELE9BQU8sR0FBRyxvRUFBb0UsQ0FBQyxDQUFDO01BQ2xGLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7OztJQUdELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtNQUN2QixFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUk7UUFDN0QsT0FBTyxHQUFHLDRFQUE0RSxDQUFDLENBQUM7TUFDMUYsT0FBTyxLQUFLLENBQUM7S0FDZDs7O0lBR0QsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssV0FBVyxFQUFFO01BQ3RDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSTtRQUM3RCxPQUFPLEdBQUcsa0ZBQWtGLENBQUMsQ0FBQztNQUNoRyxPQUFPLEtBQUssQ0FBQztLQUNkOztJQUVELElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFO01BQ3ZDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSTtRQUM3RCxPQUFPLEdBQUcsZ0ZBQWdGLENBQUMsQ0FBQztNQUM5RixPQUFPLEtBQUssQ0FBQztLQUNkLE1BQU07TUFDTCxJQUFJLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQztLQUM3QjtJQUNELE9BQU8sSUFBSSxDQUFDO0dBQ2I7OztFQUdELElBQUksR0FBRzs7O0lBR0wsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO01BQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDMUI7R0FDRjs7RUFFRCxhQUFhLEdBQUc7O0lBRWQsSUFBSSxRQUFRLEdBQUc7TUFDYixJQUFJLEVBQUUsdUJBQXVCO01BQzdCLEtBQUssRUFBRSx3QkFBd0I7TUFDL0IsTUFBTSxFQUFFLHlCQUF5QjtNQUNqQyxLQUFLLEVBQUUsd0JBQXdCO0tBQ2hDLENBQUM7OztJQUdGLElBQUksTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZDLFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRTtNQUN4QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sS0FBSztRQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sS0FBSztVQUM1QixPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7VUFDeEMsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsd0JBQXdCLENBQUM7VUFDbkQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2xCLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBLEVBQUUsQ0FBQyxDQUFDO09BQ3BDLENBQUMsQ0FBQztLQUNKOztJQUVELElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzdDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQzs7SUFFakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJQyxRQUFpQixFQUFFLENBQUM7SUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDdEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztJQUM3QyxLQUFLLElBQUksQ0FBQyxJQUFJLFFBQVEsRUFBRTtNQUN0QixDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sS0FBSztRQUNsQixXQUFXLEdBQUcsV0FBVztXQUN0QixJQUFJLENBQUMsTUFBTTtZQUNWLE9BQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUM7V0FDaEQsQ0FBQztXQUNELElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSztZQUNiLFFBQVEsRUFBRSxDQUFDO1lBQ1gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxRQUFRLEdBQUcsU0FBUyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMvRSxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztXQUMxQixDQUFDLENBQUM7T0FDTixFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNwQjs7SUFFRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7O0lBRWhCLFdBQVcsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUk7TUFDakMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUc7UUFDbkMsSUFBSSxJQUFJLEdBQUcsa0JBQWtCLENBQUM7O1VBRTVCLElBQUksTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1VBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFNBQVMsS0FBSztZQUN6QyxJQUFJLFlBQVksR0FBRyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoQyxPQUFPLEVBQUUsQ0FBQztXQUNYLENBQUMsQ0FBQztPQUNOLENBQUM7S0FDSCxDQUFDLENBQUM7OztJQUdILE9BQU8sV0FBVyxDQUFDO0dBQ3BCOztBQUVILENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtFQUNqQixNQUFNLFNBQVMsSUFBSSxDQUFDLENBQUM7SUFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN4QixJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEMsU0FBUyxHQUFHLEtBQUssQ0FBQztHQUNuQjtDQUNGOztBQUVELFVBQVU7QUFDVjtFQUNFLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztFQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7Ozs7Ozs7RUFPN0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUlDLE1BQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUMvRixHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7RUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQzs7O0VBR2xDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM5Qjs7QUFFRCxvQkFBb0I7QUFDcEI7O0VBRUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7RUFFckQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJQyxTQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOzs7RUFHaEQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJQyxJQUFTLEVBQUUsQ0FBQztFQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLENBQUMsSUFBSSxLQUFLO0lBQ3RDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7R0FDM0MsQ0FBQzs7RUFFRixJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxDQUFDLElBQUksS0FBSztJQUNyQyxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRTtNQUMvQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7TUFDNUIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ25CO0dBQ0YsQ0FBQzs7Q0FFSDs7QUFFRCxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7SUFDYixTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsSUFBSSxDQUFDLFVBQVUsRUFBRTtLQUNoQixJQUFJLENBQUMsSUFBSTtNQUNSLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOztNQUVwRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUM3RCxDQUFDLENBQUM7Q0FDTjs7O0FBR0QsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFO0VBQ3RCLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNoQixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztFQUVyQyxJQUFJLFFBQVEsR0FBRyxJQUFJO0lBQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7SUFFL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDOUQsQ0FBQTs7RUFFRCxJQUFJLGFBQWEsR0FBRyxLQUFLO0lBQ3ZCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRTtNQUNqRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO01BQ3JDLFFBQVEsRUFBRSxDQUFDO01BQ1gsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUNELE9BQU8sS0FBSyxDQUFDO0dBQ2QsQ0FBQTs7O0VBR0QsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUM5QyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0VBQzVDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7RUFDN0MsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7RUFDakIsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7RUFDbEIsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNsQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDbkQsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUN4QyxJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7RUFFcEMsUUFBUSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7RUFDekIsUUFBUSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7O0VBRXZCO0lBQ0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztJQUVWLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7TUFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUMxQixJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7UUFFOUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtVQUNWLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztVQUM5QyxJQUFJLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztVQUN2RSxJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztVQUNsSCxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ2xHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1VBQzlCLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1VBQzdCLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzdCO09BQ0Y7S0FDRjtHQUNGOzs7O0VBSUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtJQUNqRixXQUFXLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUs7R0FDeEQsQ0FBQyxDQUFDOztFQUVILElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQzs7Ozs7OztFQU9uRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Ozs7RUFJNUIsSUFBSSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQUUsS0FBSyxJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTTtFQUM3RTs7SUFFRSxHQUFHLGFBQWEsRUFBRSxDQUFDO01BQ2pCLE9BQU87S0FDUjs7SUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQy9DLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7SUFDeEMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7TUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO01BQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztNQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7S0FDbkM7SUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7SUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztJQUN2RixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0lBQ25DLEtBQUssQ0FBQztHQUNQO0VBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDOztFQUUvRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0lB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T0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0VBQ3BCLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7RUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7RUFDZixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUM7RUFDbEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUM1RCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7RUFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7Q0FDNUU7OztBQUdELENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTs7RUFFcEIsU0FBUyxHQUFHLEtBQUssQ0FBQzs7RUFFbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNyRCxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDOzs7OztFQUt0QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLFFBQVEsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsRUFBRSxJQUFJQSxhQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDbkcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDL0Q7OztBQUdELENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtFQUNy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
