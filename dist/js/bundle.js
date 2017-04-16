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
    this.models = {};
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
//  this.geometry = new THREE.PlaneGeometry(this.canvas.width, this.canvas.height);
//  this.geometry = new THREE.PlaneGeometry(this.canvas.width, this.canvas.height);
    this.geometry = new THREE.PlaneGeometry(sfg.ACTUAL_WIDTH * width / sfg.VIRTUAL_WIDTH , sfg.ACTUAL_HEIGHT *  height / sfg.VIRTUAL_HEIGHT );
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  // this.mesh.position.x = (width - sfg.VIRTUAL_WIDTH) / 2;
  // this.mesh.position.y =  - (height - sfg.VIRTUAL_HEIGHT) / 2;
  this.mesh.position.x = (sfg.ACTUAL_WIDTH * width / sfg.VIRTUAL_WIDTH - sfg.ACTUAL_WIDTH) / 2;
  this.mesh.position.y = - (sfg.ACTUAL_HEIGHT * height / sfg.VIRTUAL_HEIGHT - sfg.ACTUAL_HEIGHT) / 2;
  this.percent = 0;

  //this.texture.premultiplyAlpha = true;
}

/// プログレスバーを表示する。
Progress.prototype.render = function (message, percent) {
  percent = percent > 100 ? 100:percent;
  this.percent = percent;
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
class MyBullet extends GameObj {
  constructor(scene,se) {
  super(0, 0, 0);

  this.speed = 0.5;
  this.power = 1;


  this.mesh = sfg.game.meshes.bullet.clone();
  let bbox = new THREE.Box3().setFromObject(this.mesh);
  let d = bbox.getSize();

  // this.bb = new THREE.BoundingBoxHelper( this.mesh, 0xffff00 );
	// sfg.game.scene.add( this.bb );

  
  this.width = d.x;
  this.height = d.y;

  this.collisionArea.width = d.x;
  this.collisionArea.height = d.y;


  // 移動範囲を求める
  this.top = (sfg.V_TOP - this.height ) ;
  this.bottom = (sfg.V_BOTTOM + this.height );
  this.left = (sfg.V_LEFT + this.width ) ;
  this.right = (sfg.V_RIGHT - this.width );


  this.mesh.position.x = this.x_;
  this.mesh.position.y = this.y_;
  this.mesh.position.z = this.z_;

  // this.textureWidth = sfg.textureFiles.myship.image.width;
  // this.textureHeight = sfg.textureFiles.myship.image.height;

  // // メッシュの作成・表示 ///

  // var material = graphics.createSpriteMaterial(sfg.textureFiles.myship);
  // var geometry = graphics.createSpriteGeometry(16);
  // graphics.createSpriteUV(geometry, sfg.textureFiles.myship, 16, 16, 1);
  // this.mesh = new THREE.Mesh(geometry, material);

  // this.mesh.position.x = this.x_;
  // this.mesh.position.y = this.y_;
  // this.mesh.position.z = this.z_;
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
      && this.y <= this.top 
      && this.y >= this.bottom 
      && this.x <= this.right 
      && this.x >= this.left)
    {
      
      this.y += this.dy;
      this.x += this.dx;
      
      taskIndex = yield;
    }

    taskIndex = yield;
    sfg.tasks.removeTask(taskIndex);
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
    this.task = sfg.tasks.pushTask(this.move.bind(this));
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
  //this.textureWidth = sfg.textureFiles.myship.image.width;
  //this.textureHeight = sfg.textureFiles.myship.image.height;

  // メッシュの作成・表示
  // マテリアルの作成
  //var material = graphics.createSpriteMaterial(sfg.textureFiles.myship);
  // ジオメトリの作成
  //var geometry = graphics.createSpriteGeometry(this.width);
  //graphics.createSpriteUV(geometry, sfg.textureFiles.myship, this.width, this.height, 0);

  //this.mesh = new THREE.Mesh(geometry, material);
  this.mesh = sfg.game.meshes.myship;
  let bbox = new THREE.Box3().setFromObject(this.mesh);
  let d = bbox.getSize();

  //this.bb = new THREE.BoxHelper( this.mesh, 0xffffff );
	//sfg.game.scene.add( this.bb );

  
  this.width = d.x;
  this.height = d.y;

  // 移動範囲を求める
  this.top = (sfg.V_TOP - this.height / 2) ;
  this.bottom = (sfg.V_BOTTOM + this.height / 2);
  this.left = (sfg.V_LEFT + this.width / 2) ;
  this.right = (sfg.V_RIGHT - this.width / 2);


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

    if(basicInput.left && this.mesh.rotation.y > -0.4){
      this.mesh.rotation.y -= 0.02; 
    } else if(basicInput.right && this.mesh.rotation.y < 0.4){
      this.mesh.rotation.y += 0.02;
    } else if(this.mesh.rotation.y != 0 && !(basicInput.left || basicInput.right) ){
      if(this.mesh.rotation.y < 0){
        this.mesh.rotation.y += 0.05;
        if(this.mesh.rotation.y > 0){
          this.mesh.rotation.y = 0;
        }
      }
      if(this.mesh.rotation.y > 0){
        this.mesh.rotation.y -= 0.05;
        if(this.mesh.rotation.y < 0){
          this.mesh.rotation.y = 0;
        }
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

    // this.bb.position.x = this.mesh.position.x;
    // this.bb.position.y = this.mesh.position.y;
    // this.bb.position.z = this.mesh.position.z;
    // this.bb.rotation.y = this.mesh.rotation.y;
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

/**
 * @author SFPGMR
 */
// Shader Toyより拝借して少し改造
// https://www.shadertoy.com/view/4scSR8
// by Timothy Lottes
//
let vertexShader = 
`
varying vec2 vUv;
void main()	{
		vUv = uv;
    gl_Position = vec4( position, 1.0 );
  }
`;
  let fragmentShader = 
`
uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float time;
varying vec2 vUv;

#define RGBA(r, g, b, a)	vec4(float(r)/255.0, float(g)/255.0, float(b)/255.0, float(a)/255.0)

//const vec3 kBackgroundColor = RGBA(0x00, 0x00, 0x00, 0x00).rgb; // medium-blue sky
const vec3 kBackgroundColor = RGBA(0xff, 0x00, 0xff, 0xff).rgb; // test magenta

// Emulated input resolution.
// Fix resolution to set amount.
// Note: 256x224 is the most common resolution of the SNES, and that of Super Mario World.
vec2 res = vec2(
  640.0 / 1.0,
  480.0 / 1.0
);

// Hardness of scanline.
//	-8.0 = soft
// -16.0 = medium
float sHardScan = -8.0;

// Hardness of pixels in scanline.
// -2.0 = soft
// -4.0 = hard
const float kHardPix = -3.0;

// Display warp.
// 0.0 = none
// 1.0 / 8.0 = extreme
const vec2 kWarp = vec2(1.0 / 32.0, 1.0 / 24.0);
//const vec2 kWarp = vec2(0);

// Amount of shadow mask.
float kMaskDark = 0.5;
float kMaskLight = 1.5;

//------------------------------------------------------------------------

// sRGB to Linear.
// Assuing using sRGB typed textures this should not be needed.
float toLinear1(float c) {
	return (c <= 0.04045) ?
		(c / 12.92) :
		pow((c + 0.055) / 1.055, 2.4);
}
vec3 toLinear(vec3 c) {
	return vec3(toLinear1(c.r), toLinear1(c.g), toLinear1(c.b));
}

// Linear to sRGB.
// Assuing using sRGB typed textures this should not be needed.
float toSrgb1(float c) {
	return(c < 0.0031308 ?
		(c * 12.92) :
		(1.055 * pow(c, 0.41666) - 0.055));
}
vec3 toSrgb(vec3 c) {
	return vec3(toSrgb1(c.r), toSrgb1(c.g), toSrgb1(c.b));
}

// Nearest emulated sample given floating point position and texel offset.
// Also zero's off screen.
vec4 fetch(vec2 pos, vec2 off)
{
	pos = floor(pos * res + off) / res;
	if (max(abs(pos.x - 0.5), abs(pos.y - 0.5)) > 0.5)
		return vec4(vec3(0.0), 0.0);
   	
//    vec4 sampledColor = texture(iChannel0, pos.xy, -16.0);
    vec4 sampledColor = texture2D(tDiffuse, pos.xy, -16.0);
    
    sampledColor = vec4(
        (sampledColor.rgb * sampledColor.a) +
        	(kBackgroundColor * (1.0 - sampledColor.a)),
        1.0
    );
    
	return vec4(
        toLinear(sampledColor.rgb),
        sampledColor.a
    );
}

// Distance in emulated pixels to nearest texel.
vec2 dist(vec2 pos) {
	pos = pos * res;
	return -((pos - floor(pos)) - vec2(0.5));
}

// 1D Gaussian.
float gaus(float pos, float scale) {
	return exp2(scale * pos * pos);
}

// 3-tap Gaussian filter along horz line.
vec3 horz3(vec2 pos, float off)
{
	vec3 b = fetch(pos, vec2(-1.0, off)).rgb;
	vec3 c = fetch(pos, vec2( 0.0, off)).rgb;
	vec3 d = fetch(pos, vec2(+1.0, off)).rgb;
	float dst = dist(pos).x;
	// Convert distance to weight.
	float scale = kHardPix;
	float wb = gaus(dst - 1.0, scale);
	float wc = gaus(dst + 0.0, scale);
	float wd = gaus(dst + 1.0, scale);
	// Return filtered sample.
	return (b * wb + c * wc + d * wd) / (wb + wc + wd);
}

// 5-tap Gaussian filter along horz line.
vec3 horz5(vec2 pos, float off)
{
	vec3 a = fetch(pos, vec2(-2.0, off)).rgb;
	vec3 b = fetch(pos, vec2(-1.0, off)).rgb;
	vec3 c = fetch(pos, vec2( 0.0, off)).rgb;
	vec3 d = fetch(pos, vec2(+1.0, off)).rgb;
	vec3 e = fetch(pos, vec2(+2.0, off)).rgb;
	float dst = dist(pos).x;
	// Convert distance to weight.
	float scale = kHardPix;
	float wa = gaus(dst - 2.0, scale);
	float wb = gaus(dst - 1.0, scale);
	float wc = gaus(dst + 0.0, scale);
	float wd = gaus(dst + 1.0, scale);
	float we = gaus(dst + 2.0, scale);
	// Return filtered sample.
	return (a * wa + b * wb + c * wc + d * wd + e * we) / (wa + wb + wc + wd + we);
}

// Return scanline weight.
float scan(vec2 pos, float off) {
	float dst = dist(pos).y;
	return gaus(dst + off, sHardScan);
}

// Allow nearest three lines to effect pixel.
vec3 tri(vec2 pos)
{
	vec3 a = horz3(pos, -1.0);
	vec3 b = horz5(pos,  0.0);
	vec3 c = horz3(pos, +1.0);
	float wa = scan(pos, -1.0);
	float wb = scan(pos,  0.0);
	float wc = scan(pos, +1.0);
	return a * wa + b * wb + c * wc;
}

// Distortion of scanlines, and end of screen alpha.
vec2 warp(vec2 pos)
{
	pos = pos * 2.0 - 1.0;
	pos *= vec2(
		1.0 + (pos.y * pos.y) * kWarp.x,
		1.0 + (pos.x * pos.x) * kWarp.y
	);
	return pos * 0.5 + 0.5;
}

// Shadow mask.
vec3 mask(vec2 pos)
{
	pos.x += pos.y * 3.0;
	vec3 mask = vec3(kMaskDark, kMaskDark, kMaskDark);
	pos.x = fract(pos.x / 6.0);
	if (pos.x < 0.333)
		mask.r = kMaskLight;
	else if (pos.x < 0.666)
		mask.g = kMaskLight;
	else
		mask.b = kMaskLight;
	return mask;
}

// Draw dividing bars.
float bar(float pos, float bar) {
	pos -= bar;
	return (pos * pos < 4.0) ? 0.0 : 1.0;
}

float rand(vec2 co) {
	return fract(sin(dot(co.xy , vec2(12.9898, 78.233))) * 43758.5453);
}

// Entry.
void main()
{
//    vec2 pos = warp(gl_FragCoord.xy / resolution.xy);
    vec2 pos = gl_FragCoord.xy / resolution.xy;
    
	  // Unmodified.
    if(gl_FragCoord.x > resolution.x * 0.5){
		vec3 c = tri(pos) * mask(gl_FragCoord.xy);
    gl_FragColor = vec4(
        toSrgb(c),
        1.0
    );
    } else {
      gl_FragColor = texture2D(tDiffuse,vUv);
    }
}
`;

//     let geometry = new THREE.PlaneBufferGeometry( 1920, 1080 );
let uniforms = {
      tDiffuse: { value: null },
      resolution: { value: new THREE.Vector2() },
			time:       { value: 0.0 }
    };
//     uniforms.resolution.value.x = WIDTH;
//     uniforms.resolution.value.y = HEIGHT;
//     let material = new THREE.ShaderMaterial( {
//       uniforms: uniforms,
//       vertexShader: vertShader,
//       fragmentShader: fragShader
//     } );
//     let mesh = new THREE.Mesh( geometry, material );
//     mesh.position.z = -5000;
//     scene.add( mesh );
//   }

class SFCrtShaderPass extends THREE.Pass {
	constructor(width,height){
		super();

		this.uniforms = THREE.UniformsUtils.clone( uniforms );
		this.uniforms.resolution.value.x = width;
		this.uniforms.resolution.value.y = height;
		this.material = new THREE.ShaderMaterial( {
			uniforms: this.uniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		} );

		this.camera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1 );
		this.scene  = new THREE.Scene();

		this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
		this.scene.add( this.quad );

	}

  setSize(width,height){
		this.uniforms.resolution.value.x = width;
		this.uniforms.resolution.value.y = height;
  }

	render(renderer, writeBuffer, readBuffer, delta, maskActive){
		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}
}

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
        //this.renderer.render(this.scene, this.camera);
        this.composer.render();
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
      this.composer.setSize(this.CONSOLE_WIDTH, this.CONSOLE_HEIGHT);
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

    var ambient = new THREE.AmbientLight(0x808080);
    this.scene.add(ambient);
    renderer.clear();

//    this.composer = new THREE.Effec
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.setSize(this.CONSOLE_WIDTH, this.CONSOLE_HEIGHT);

    this.renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.renderPass.enabled = true;
    this.renderPass.renderToScreen = false;
    this.composer.addPass(this.renderPass);


    this.crtShaderPass = new SFCrtShaderPass(this.CONSOLE_WIDTH,this.CONSOLE_HEIGHT);
    this.crtShaderPass.enbled = true;
    this.crtShaderPass.renderToScreen = true;
    this.composer.addPass(this.crtShaderPass);


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
    var percent = 10;

    this.progress = new Progress();
    this.progress.mesh.position.z = 0.001;
    this.progress.render('Loading Resources ...', percent);
    this.scene.add(this.progress.mesh);
    //this.renderer.render(this.scene, this.camera);
    this.composer.render();

    var loadPromise = this.audio_.readDrumSample;
    for (var n in textures) {
      ((name, texPath) => {
        loadPromise = loadPromise
          .then(() => {
            return loadTexture(sfg.resourceBase + texPath);
          })
          .then((tex) => {
            percent += 10; 
            this.progress.render('Loading Resources ...', percent);
            sfg.textureFiles[name] = tex;
            //this.renderer.render(this.scene, this.camera);
            this.composer.render();
            return Promise.resolve();
          });
      })(n, textures[n]);
    }

    loadPromise = loadPromise.then(this.loadModels.bind(this));
    
    return loadPromise;
  }

loadModels(){
  let loader = new THREE.JSONLoader();
  this.meshes = {};
  let meshes = {
    'myship':'./data/myship.json',
    'bullet':'./data/bullet.json',
    'building':'./data/building.json'
  };
  let promises = Promise.resolve(0);
  let meshes_ = this.meshes;
  let this_ = this;
  for(let i in meshes){
    promises = promises.then(()=>{
      return new Promise((resolve,reject)=>{
          loader.load(meshes[i], (geometry, materials) => {
            var faceMaterial = new THREE.MultiMaterial(materials);
            meshes_[i] = new THREE.Mesh(geometry, faceMaterial);
            meshes_[i].rotation.set(0, 0, 0);
            meshes_[i].position.set(0, 0, 0.0);
            meshes_[i].scale.set(1,1,1);
            let percent = this_.progress.percent + 10;
            this.progress.render('Loading Resources ...', percent);
            //this.renderer.render(this.scene, this.camera);
            this.composer.render();

            //this_.scene.add(meshes_[i]); // シーンへメッシュの追加
            resolve();
          });
      });
    });
  }
  return promises;
}

*render(taskIndex) {
  while(taskIndex >= 0){
   // this.crtShaderPass.uniforms.time.value += 0.01;
    this.composer.render();
//    this.renderer.render(this.scene, this.camera);
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

  // 背景描画のテスト
  this.meshes.building.position.z = -350.0;
  this.meshes.building.position.y = 60.0;

  this.backgrounds = [{mesh:this.meshes.building.clone()},{mesh:this.meshes.building.clone()}];
  let bks = this.backgrounds;
  bks.forEach((b)=>{
   b.bbox = new THREE.Box3().setFromObject(b.mesh);
   b.size = b.bbox.getSize();
  });
  
  bks[0].mesh.position.y = 0;
  bks[1].mesh.position.y = bks[0].size.y;

  this.scene.add(this.backgrounds[0].mesh);
  this.scene.add(this.backgrounds[1].mesh);



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
    // 背景スクロールテスト
    this.backgrounds.forEach((b,i)=>{
        b.mesh.position.y -= 0.25;
        if(b.mesh.position.y < -200.0){
          --i;
          if(i < 0) i = 1;
          let before = this.backgrounds[i];
          b.mesh.position.y = before.mesh.position.y + before.size.y;
        }
    });

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvZ2xvYmFsLmpzIiwiLi4vLi4vc3JjL2pzL2V2ZW50RW1pdHRlcjMuanMiLCIuLi8uLi9zcmMvanMvdXRpbC5qcyIsIi4uLy4uL3NyYy9qcy9TeW50YXguanMiLCIuLi8uLi9zcmMvanMvU2Nhbm5lci5qcyIsIi4uLy4uL3NyYy9qcy9NTUxQYXJzZXIuanMiLCIuLi8uLi9zcmMvanMvRGVmYXVsdFBhcmFtcy5qcyIsIi4uLy4uL3NyYy9qcy9semJhc2U2Mi5taW4uanMiLCIuLi8uLi9zcmMvanMvYXVkaW8uanMiLCIuLi8uLi9zcmMvanMvZ3JhcGhpY3MuanMiLCIuLi8uLi9zcmMvanMvaW8uanMiLCIuLi8uLi9zcmMvanMvY29tbS5qcyIsIi4uLy4uL3NyYy9qcy90ZXh0LmpzIiwiLi4vLi4vc3JjL2pzL2dhbWVvYmouanMiLCIuLi8uLi9zcmMvanMvbXlzaGlwLmpzIiwiLi4vLi4vc3JjL2pzL3NlcURhdGEuanMiLCIuLi8uLi9zcmMvanMvc2ZDcnRTaGFkZXJQYXNzLmpzIiwiLi4vLi4vc3JjL2pzL2dhbWUuanMiLCIuLi8uLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBleHBvcnQgY29uc3QgQ0FNX1pcclxuLy8gZXhwb3J0IGNvbnN0IFZJUlRVQUxfV0lEVEggPSAyNDA7XHJcbi8vIGV4cG9ydCBjb25zdCBWSVJUVUFMX0hFSUdIVCA9IDMyMDtcclxuXHJcbi8vIGV4cG9ydCBjb25zdCBWX1JJR0hUID0gVklSVFVBTF9XSURUSCAvIDIuMDtcclxuLy8gZXhwb3J0IGNvbnN0IFZfVE9QID0gVklSVFVBTF9IRUlHSFQgLyAyLjA7XHJcbi8vIGV4cG9ydCBjb25zdCBWX0xFRlQgPSAtMSAqIFZJUlRVQUxfV0lEVEggLyAyLjA7XHJcbi8vIGV4cG9ydCBjb25zdCBWX0JPVFRPTSA9IC0xICogVklSVFVBTF9IRUlHSFQgLyAyLjA7XHJcblxyXG4vLyBleHBvcnQgY29uc3QgQ0hBUl9TSVpFID0gODtcclxuLy8gZXhwb3J0IGNvbnN0IFRFWFRfV0lEVEggPSBWSVJUVUFMX1dJRFRIIC8gQ0hBUl9TSVpFO1xyXG4vLyBleHBvcnQgY29uc3QgVEVYVF9IRUlHSFQgPSBWSVJUVUFMX0hFSUdIVCAvIENIQVJfU0laRTtcclxuLy8gZXhwb3J0IGNvbnN0IFBJWEVMX1NJWkUgPSAxO1xyXG4vLyBleHBvcnQgY29uc3QgQUNUVUFMX0NIQVJfU0laRSA9IENIQVJfU0laRSAqIFBJWEVMX1NJWkU7XHJcbi8vIGV4cG9ydCBjb25zdCBTUFJJVEVfU0laRV9YID0gMTYuMDtcclxuLy8gZXhwb3J0IGNvbnN0IFNQUklURV9TSVpFX1kgPSAxNi4wO1xyXG4vLyBleHBvcnQgY29uc3QgQ0hFQ0tfQ09MTElTSU9OID0gdHJ1ZTtcclxuLy8gZXhwb3J0IGNvbnN0IERFQlVHID0gZmFsc2U7XHJcbi8vIGV4cG9ydCB2YXIgdGV4dHVyZUZpbGVzID0ge307XHJcbi8vIGV4cG9ydCB2YXIgc3RhZ2UgPSAwO1xyXG4vLyBleHBvcnQgdmFyIHRhc2tzID0gbnVsbDtcclxuLy8gZXhwb3J0IHZhciBnYW1lVGltZXIgPSBudWxsO1xyXG4vLyBleHBvcnQgdmFyIGJvbWJzID0gbnVsbDtcclxuLy8gZXhwb3J0IHZhciBhZGRTY29yZSA9IG51bGw7XHJcbi8vIGV4cG9ydCB2YXIgbXlzaGlwXyA9IG51bGw7XHJcbi8vIGV4cG9ydCB2YXIgcGF1c2UgPSBmYWxzZTtcclxuLy8gZXhwb3J0IHZhciBnYW1lID0gbnVsbDtcclxuLy8gZXhwb3J0IHZhciByZXNvdXJjZUJhc2UgPSAnJztcclxuXHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBzZXRHYW1lKHYpe2dhbWUgPSB2O31cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNldFBhdXNlKHYpe3BhdXNlID0gdjt9XHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBzZXRNeVNoaXAodil7bXlzaGlwXyA9IHY7fVxyXG4vLyBleHBvcnQgZnVuY3Rpb24gc2V0QWRkU2NvcmUodil7YWRkU2NvcmUgPSB2O31cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNldEJvbWJzKHYpe2JvbWJzID0gdjt9XHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBzZXRHYW1lVGltZXIodil7Z2FtZVRpbWVyID0gdjt9XHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBzZXRUYXNrcyh2KXt0YXNrcyA9IHY7fVxyXG4vLyBleHBvcnQgZnVuY3Rpb24gc2V0U3RhZ2Uodil7c3RhZ2UgPSB2O31cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNldFJlc291cmNlQmFzZSh2KXtyZXNvdXJjZUJhc2UgPSB2O31cclxuXHJcbmNsYXNzIHNmZ2xvYmFsIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuQ0FNRVJBX1ogPSAxMDAuMDtcclxuICAgIHRoaXMuQU5HTEVfT0ZfVklFVyAgPSAxMC4wO1xyXG4gICAgdGhpcy5WSVJUVUFMX1dJRFRIID0gMjQwLjA7XHJcbiAgICB0aGlzLlZJUlRVQUxfSEVJR0hUID0gMzIwLjA7XHJcbiAgICB0aGlzLkFDVFVBTF9IRUlHSFQgPSB0aGlzLkNBTUVSQV9aICogTWF0aC50YW4odGhpcy5BTkdMRV9PRl9WSUVXICogTWF0aC5QSSAvIDM2MCkgKiAyO1xyXG4gICAgdGhpcy5BQ1RVQUxfV0lEVEggPSB0aGlzLkFDVFVBTF9IRUlHSFQgKiB0aGlzLlZJUlRVQUxfV0lEVEggLyB0aGlzLlZJUlRVQUxfSEVJR0hUO1xyXG5cclxuICAgIC8vIHRoaXMuVl9SSUdIVCA9IHRoaXMuVklSVFVBTF9XSURUSCAvIDIuMDtcclxuICAgIC8vIHRoaXMuVl9UT1AgPSB0aGlzLlZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG4gICAgLy8gdGhpcy5WX0xFRlQgPSAtMSAqIHRoaXMuVklSVFVBTF9XSURUSCAvIDIuMDtcclxuICAgIC8vIHRoaXMuVl9CT1RUT00gPSAtMSAqIHRoaXMuVklSVFVBTF9IRUlHSFQgLyAyLjA7XHJcbiAgICB0aGlzLlZfUklHSFQgPSB0aGlzLkFDVFVBTF9XSURUSCAvIDIuMDtcclxuICAgIHRoaXMuVl9UT1AgPSB0aGlzLkFDVFVBTF9IRUlHSFQgLyAyLjA7XHJcbiAgICB0aGlzLlZfTEVGVCA9IC0xICogdGhpcy5BQ1RVQUxfV0lEVEggLyAyLjA7XHJcbiAgICB0aGlzLlZfQk9UVE9NID0gLTEgKiB0aGlzLkFDVFVBTF9IRUlHSFQgLyAyLjA7XHJcblxyXG4gICAgdGhpcy5DSEFSX1NJWkUgPSA4O1xyXG4gICAgdGhpcy5URVhUX1dJRFRIID0gdGhpcy5WSVJUVUFMX1dJRFRIIC8gdGhpcy5DSEFSX1NJWkU7XHJcbiAgICB0aGlzLlRFWFRfSEVJR0hUID0gdGhpcy5WSVJUVUFMX0hFSUdIVCAvIHRoaXMuQ0hBUl9TSVpFO1xyXG4gICAgdGhpcy5QSVhFTF9TSVpFID0gMTtcclxuICAgIHRoaXMuQUNUVUFMX0NIQVJfU0laRSA9IHRoaXMuQ0hBUl9TSVpFICogdGhpcy5QSVhFTF9TSVpFO1xyXG4gICAgdGhpcy5TUFJJVEVfU0laRV9YID0gMTYuMDtcclxuICAgIHRoaXMuU1BSSVRFX1NJWkVfWSA9IDE2LjA7XHJcbiAgICB0aGlzLkNIRUNLX0NPTExJU0lPTiA9IHRydWU7XHJcbiAgICB0aGlzLkRFQlVHID0gZmFsc2U7XHJcbiAgICB0aGlzLnRleHR1cmVGaWxlcyA9IHt9O1xyXG4gICAgdGhpcy5tb2RlbHMgPSB7fTtcclxuICAgIHRoaXMuc3RhZ2UgPSAwO1xyXG4gICAgdGhpcy50YXNrcyA9IG51bGw7XHJcbiAgICB0aGlzLmdhbWVUaW1lciA9IG51bGw7XHJcbiAgICB0aGlzLmJvbWJzID0gbnVsbDtcclxuICAgIHRoaXMuYWRkU2NvcmUgPSBudWxsO1xyXG4gICAgdGhpcy5teXNoaXBfID0gbnVsbDtcclxuICAgIHRoaXMucGF1c2UgPSBmYWxzZTtcclxuICAgIHRoaXMuZ2FtZSA9IG51bGw7XHJcbiAgICB0aGlzLnJlc291cmNlQmFzZSA9ICcnO1xyXG4gIH1cclxufVxyXG5jb25zdCBzZmcgPSBuZXcgc2ZnbG9iYWwoKTtcclxuZXhwb3J0IGRlZmF1bHQgc2ZnO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vL1xyXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cclxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcclxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3JcclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxyXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxyXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxyXG4vL1xyXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cclxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcclxuICB0aGlzLmZuID0gZm47XHJcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcclxuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xyXG59XHJcblxyXG4vKipcclxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcclxuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cclxuICpcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cclxuXHJcbi8qKlxyXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxyXG4gKlxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXHJcbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XHJcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcclxuXHJcbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xyXG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XHJcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xyXG5cclxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcclxuICB9XHJcblxyXG4gIHJldHVybiBlZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcclxuXHJcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXHJcbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICwgYXJnc1xyXG4gICAgLCBpO1xyXG5cclxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xyXG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XHJcblxyXG4gICAgc3dpdGNoIChsZW4pIHtcclxuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xyXG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xyXG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcclxuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xyXG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xyXG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxyXG4gICAgICAsIGo7XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xyXG5cclxuICAgICAgc3dpdGNoIChsZW4pIHtcclxuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcclxuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xyXG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cclxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XHJcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXHJcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcclxuICBlbHNlIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcclxuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcclxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcclxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xyXG4gIGVsc2Uge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XHJcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xyXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cclxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcclxuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcclxuXHJcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXHJcbiAgICAsIGV2ZW50cyA9IFtdO1xyXG5cclxuICBpZiAoZm4pIHtcclxuICAgIGlmIChsaXN0ZW5lcnMuZm4pIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cclxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpXHJcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXHJcbiAgICAgICkge1xyXG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVycyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXHJcbiAgICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXHJcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcclxuICAgICAgICApIHtcclxuICAgICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL1xyXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cclxuICAvL1xyXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XHJcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xyXG5cclxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudF07XHJcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cclxuLy9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcclxuXHJcbi8vXHJcbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8vXHJcbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XHJcblxyXG4vL1xyXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cclxuLy9cclxuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XHJcbn1cclxuXHJcbiIsIlxyXG5cInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IHNmZyBmcm9tICcuL2dsb2JhbC5qcyc7IFxyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vZXZlbnRFbWl0dGVyMy5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVGFzayB7XHJcbiAgY29uc3RydWN0b3IoZ2VuSW5zdCxwcmlvcml0eSkge1xyXG4gICAgdGhpcy5wcmlvcml0eSA9IHByaW9yaXR5IHx8IDEwMDAwO1xyXG4gICAgdGhpcy5nZW5JbnN0ID0gZ2VuSW5zdDtcclxuICAgIC8vIOWIneacn+WMllxyXG4gICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgfVxyXG4gIFxyXG59XHJcblxyXG5leHBvcnQgdmFyIG51bGxUYXNrID0gbmV3IFRhc2soKGZ1bmN0aW9uKigpe30pKCkpO1xyXG5cclxuLy8vIOOCv+OCueOCr+euoeeQhlxyXG5leHBvcnQgY2xhc3MgVGFza3MgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCl7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5hcnJheSA9IG5ldyBBcnJheSgwKTtcclxuICAgIHRoaXMubmVlZFNvcnQgPSBmYWxzZTtcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gZmFsc2U7XHJcbiAgICB0aGlzLmVuYWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcclxuICB9XHJcbiAgLy8gaW5kZXjjga7kvY3nva7jga7jgr/jgrnjgq/jgpLnva7jgY3mj5vjgYjjgotcclxuICBzZXROZXh0VGFzayhpbmRleCwgZ2VuSW5zdCwgcHJpb3JpdHkpIFxyXG4gIHtcclxuICAgIGlmKGluZGV4IDwgMCl7XHJcbiAgICAgIGluZGV4ID0gLSgrK2luZGV4KTtcclxuICAgIH1cclxuICAgIGlmKHRoaXMuYXJyYXlbaW5kZXhdLnByaW9yaXR5ID09IDEwMDAwMCl7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG4gICAgdmFyIHQgPSBuZXcgVGFzayhnZW5JbnN0KGluZGV4KSwgcHJpb3JpdHkpO1xyXG4gICAgdC5pbmRleCA9IGluZGV4O1xyXG4gICAgdGhpcy5hcnJheVtpbmRleF0gPSB0O1xyXG4gICAgdGhpcy5uZWVkU29ydCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwdXNoVGFzayhnZW5JbnN0LCBwcmlvcml0eSkge1xyXG4gICAgbGV0IHQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXJyYXkubGVuZ3RoOyArK2kpIHtcclxuICAgICAgaWYgKHRoaXMuYXJyYXlbaV0gPT0gbnVsbFRhc2spIHtcclxuICAgICAgICB0ID0gbmV3IFRhc2soZ2VuSW5zdChpKSwgcHJpb3JpdHkpO1xyXG4gICAgICAgIHRoaXMuYXJyYXlbaV0gPSB0O1xyXG4gICAgICAgIHQuaW5kZXggPSBpO1xyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0ID0gbmV3IFRhc2soZ2VuSW5zdCh0aGlzLmFycmF5Lmxlbmd0aCkscHJpb3JpdHkpO1xyXG4gICAgdC5pbmRleCA9IHRoaXMuYXJyYXkubGVuZ3RoO1xyXG4gICAgdGhpcy5hcnJheVt0aGlzLmFycmF5Lmxlbmd0aF0gPSB0O1xyXG4gICAgdGhpcy5uZWVkU29ydCA9IHRydWU7XHJcbiAgICByZXR1cm4gdDtcclxuICB9XHJcblxyXG4gIC8vIOmFjeWIl+OCkuWPluW+l+OBmeOCi1xyXG4gIGdldEFycmF5KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXJyYXk7XHJcbiAgfVxyXG4gIC8vIOOCv+OCueOCr+OCkuOCr+ODquOCouOBmeOCi1xyXG4gIGNsZWFyKCkge1xyXG4gICAgdGhpcy5hcnJheS5sZW5ndGggPSAwO1xyXG4gIH1cclxuICAvLyDjgr3jg7zjg4jjgYzlv4XopoHjgYvjg4Hjgqfjg4Pjgq/jgZfjgIHjgr3jg7zjg4jjgZnjgotcclxuICBjaGVja1NvcnQoKSB7XHJcbiAgICBpZiAodGhpcy5uZWVkU29ydCkge1xyXG4gICAgICB0aGlzLmFycmF5LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICBpZihhLnByaW9yaXR5ID4gYi5wcmlvcml0eSkgcmV0dXJuIDE7XHJcbiAgICAgICAgaWYgKGEucHJpb3JpdHkgPCBiLnByaW9yaXR5KSByZXR1cm4gLTE7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyDjgqTjg7Pjg4fjg4Pjgq/jgrnjga7mjK/jgornm7TjgZdcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGUgPSB0aGlzLmFycmF5Lmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgICAgIHRoaXMuYXJyYXlbaV0uaW5kZXggPSBpO1xyXG4gICAgICB9XHJcbiAgICAgdGhpcy5uZWVkU29ydCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVtb3ZlVGFzayhpbmRleCkge1xyXG4gICAgaWYoaW5kZXggPCAwKXtcclxuICAgICAgaW5kZXggPSAtKCsraW5kZXgpO1xyXG4gICAgfVxyXG4gICAgaWYodGhpcy5hcnJheVtpbmRleF0ucHJpb3JpdHkgPT0gMTAwMDAwKXtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFycmF5W2luZGV4XSA9IG51bGxUYXNrO1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBjb21wcmVzcygpIHtcclxuICAgIGlmICghdGhpcy5uZWVkQ29tcHJlc3MpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGRlc3QgPSBbXTtcclxuICAgIHZhciBzcmMgPSB0aGlzLmFycmF5O1xyXG4gICAgdmFyIGRlc3RJbmRleCA9IDA7XHJcbiAgICBkZXN0ID0gc3JjLmZpbHRlcigodixpKT0+e1xyXG4gICAgICBsZXQgcmV0ID0gdiAhPSBudWxsVGFzaztcclxuICAgICAgaWYocmV0KXtcclxuICAgICAgICB2LmluZGV4ID0gZGVzdEluZGV4Kys7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJldDtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5hcnJheSA9IGRlc3Q7XHJcbiAgICB0aGlzLm5lZWRDb21wcmVzcyA9IGZhbHNlO1xyXG4gIH1cclxuICBcclxuICBwcm9jZXNzKGdhbWUpXHJcbiAge1xyXG4gICAgaWYodGhpcy5lbmFibGUpe1xyXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5wcm9jZXNzLmJpbmQodGhpcyxnYW1lKSk7XHJcbiAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xyXG4gICAgICBpZiAoIXNmZy5wYXVzZSkge1xyXG4gICAgICAgIGlmICghZ2FtZS5pc0hpZGRlbikge1xyXG4gICAgICAgICAgdGhpcy5jaGVja1NvcnQoKTtcclxuICAgICAgICAgIHRoaXMuYXJyYXkuZm9yRWFjaCggKHRhc2ssaSkgPT57XHJcbiAgICAgICAgICAgIGlmICh0YXNrICE9IG51bGxUYXNrKSB7XHJcbiAgICAgICAgICAgICAgaWYodGFzay5pbmRleCAhPSBpICl7XHJcbiAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgdGFzay5nZW5JbnN0Lm5leHQodGFzay5pbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5jb21wcmVzcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSAgICBcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZW1pdCgnc3RvcHBlZCcpO1xyXG4gICAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdG9wUHJvY2Vzcygpe1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntcclxuICAgICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vbignc3RvcHBlZCcsKCk9PntcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Ky44O844Og55So44K/44Kk44Oe44O8XHJcbmV4cG9ydCBjbGFzcyBHYW1lVGltZXIge1xyXG4gIGNvbnN0cnVjdG9yKGdldEN1cnJlbnRUaW1lKSB7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgICB0aGlzLmdldEN1cnJlbnRUaW1lID0gZ2V0Q3VycmVudFRpbWU7XHJcbiAgICB0aGlzLlNUT1AgPSAxO1xyXG4gICAgdGhpcy5TVEFSVCA9IDI7XHJcbiAgICB0aGlzLlBBVVNFID0gMztcclxuXHJcbiAgfVxyXG4gIFxyXG4gIHN0YXJ0KCkge1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IDA7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IDA7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gIH1cclxuXHJcbiAgcmVzdW1lKCkge1xyXG4gICAgdmFyIG5vd1RpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZSArIG5vd1RpbWUgLSB0aGlzLnBhdXNlVGltZTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICB9XHJcblxyXG4gIHBhdXNlKCkge1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUEFVU0U7XHJcbiAgfVxyXG5cclxuICBzdG9wKCkge1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVEFSVCkgcmV0dXJuO1xyXG4gICAgdmFyIG5vd1RpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IG5vd1RpbWUgLSB0aGlzLmN1cnJlbnRUaW1lO1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IHRoaXMuZWxhcHNlZFRpbWUgKyB0aGlzLmRlbHRhVGltZTtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSBub3dUaW1lO1xyXG4gIH1cclxufVxyXG5cclxuIiwiZXhwb3J0IGRlZmF1bHQge1xyXG4gIE5vdGU6IFwiTm90ZVwiLFxyXG4gIFJlc3Q6IFwiUmVzdFwiLFxyXG4gIE9jdGF2ZTogXCJPY3RhdmVcIixcclxuICBPY3RhdmVTaGlmdDogXCJPY3RhdmVTaGlmdFwiLFxyXG4gIE5vdGVMZW5ndGg6IFwiTm90ZUxlbmd0aFwiLFxyXG4gIE5vdGVWZWxvY2l0eTogXCJOb3RlVmVsb2NpdHlcIixcclxuICBOb3RlUXVhbnRpemU6IFwiTm90ZVF1YW50aXplXCIsXHJcbiAgVGVtcG86IFwiVGVtcG9cIixcclxuICBJbmZpbml0ZUxvb3A6IFwiSW5maW5pdGVMb29wXCIsXHJcbiAgTG9vcEJlZ2luOiBcIkxvb3BCZWdpblwiLFxyXG4gIExvb3BFeGl0OiBcIkxvb3BFeGl0XCIsXHJcbiAgTG9vcEVuZDogXCJMb29wRW5kXCIsXHJcbiAgVG9uZTpcIlRvbmVcIixcclxuICBXYXZlRm9ybTpcIldhdmVGb3JtXCIsXHJcbiAgRW52ZWxvcGU6XCJFbnZlbG9wZVwiXHJcbn07XHJcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjYW5uZXIge1xyXG4gIGNvbnN0cnVjdG9yKHNvdXJjZSkge1xyXG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XHJcbiAgICB0aGlzLmluZGV4ID0gMDtcclxuICB9XHJcblxyXG4gIGhhc05leHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pbmRleCA8IHRoaXMuc291cmNlLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIHBlZWsoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UuY2hhckF0KHRoaXMuaW5kZXgpIHx8IFwiXCI7XHJcbiAgfVxyXG5cclxuICBuZXh0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc291cmNlLmNoYXJBdCh0aGlzLmluZGV4KyspIHx8IFwiXCI7XHJcbiAgfVxyXG5cclxuICBmb3J3YXJkKCkge1xyXG4gICAgd2hpbGUgKHRoaXMuaGFzTmV4dCgpICYmIHRoaXMubWF0Y2goL1xccy8pKSB7XHJcbiAgICAgIHRoaXMuaW5kZXggKz0gMTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG1hdGNoKG1hdGNoZXIpIHtcclxuICAgIGlmIChtYXRjaGVyIGluc3RhbmNlb2YgUmVnRXhwKSB7XHJcbiAgICAgIHJldHVybiBtYXRjaGVyLnRlc3QodGhpcy5wZWVrKCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucGVlaygpID09PSBtYXRjaGVyO1xyXG4gIH1cclxuXHJcbiAgZXhwZWN0KG1hdGNoZXIpIHtcclxuICAgIGlmICghdGhpcy5tYXRjaChtYXRjaGVyKSkge1xyXG4gICAgICB0aGlzLnRocm93VW5leHBlY3RlZFRva2VuKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmluZGV4ICs9IDE7XHJcbiAgfVxyXG5cclxuICBzY2FuKG1hdGNoZXIpIHtcclxuICAgIGxldCB0YXJnZXQgPSB0aGlzLnNvdXJjZS5zdWJzdHIodGhpcy5pbmRleCk7XHJcbiAgICBsZXQgcmVzdWx0ID0gbnVsbDtcclxuXHJcbiAgICBpZiAobWF0Y2hlciBpbnN0YW5jZW9mIFJlZ0V4cCkge1xyXG4gICAgICBsZXQgbWF0Y2hlZCA9IG1hdGNoZXIuZXhlYyh0YXJnZXQpO1xyXG5cclxuICAgICAgaWYgKG1hdGNoZWQgJiYgbWF0Y2hlZC5pbmRleCA9PT0gMCkge1xyXG4gICAgICAgIHJlc3VsdCA9IG1hdGNoZWRbMF07XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAodGFyZ2V0LnN1YnN0cigwLCBtYXRjaGVyLmxlbmd0aCkgPT09IG1hdGNoZXIpIHtcclxuICAgICAgcmVzdWx0ID0gbWF0Y2hlcjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgIHRoaXMuaW5kZXggKz0gcmVzdWx0Lmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgdGhyb3dVbmV4cGVjdGVkVG9rZW4oKSB7XHJcbiAgICBsZXQgaWRlbnRpZmllciA9IHRoaXMucGVlaygpIHx8IFwiSUxMRUdBTFwiO1xyXG5cclxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCB0b2tlbjogJHtpZGVudGlmaWVyfWApO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgU3ludGF4IGZyb20gXCIuL1N5bnRheFwiO1xyXG5pbXBvcnQgU2Nhbm5lciBmcm9tIFwiLi9TY2FubmVyXCI7XHJcblxyXG5jb25zdCBOT1RFX0lOREVYRVMgPSB7IGM6IDAsIGQ6IDIsIGU6IDQsIGY6IDUsIGc6IDcsIGE6IDksIGI6IDExIH07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNTUxQYXJzZXIge1xyXG4gIGNvbnN0cnVjdG9yKHNvdXJjZSkge1xyXG4gICAgdGhpcy5zY2FubmVyID0gbmV3IFNjYW5uZXIoc291cmNlKTtcclxuICB9XHJcblxyXG4gIHBhcnNlKCkge1xyXG4gICAgbGV0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgIHRoaXMuX3JlYWRVbnRpbChcIjtcIiwgKCkgPT4ge1xyXG4gICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuYWR2YW5jZSgpKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBhZHZhbmNlKCkge1xyXG4gICAgc3dpdGNoICh0aGlzLnNjYW5uZXIucGVlaygpKSB7XHJcbiAgICBjYXNlIFwiY1wiOlxyXG4gICAgY2FzZSBcImRcIjpcclxuICAgIGNhc2UgXCJlXCI6XHJcbiAgICBjYXNlIFwiZlwiOlxyXG4gICAgY2FzZSBcImdcIjpcclxuICAgIGNhc2UgXCJhXCI6XHJcbiAgICBjYXNlIFwiYlwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkTm90ZSgpO1xyXG4gICAgY2FzZSBcIltcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZENob3JkKCk7XHJcbiAgICBjYXNlIFwiclwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkUmVzdCgpO1xyXG4gICAgY2FzZSBcIm9cIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZE9jdGF2ZSgpO1xyXG4gICAgY2FzZSBcIj5cIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZE9jdGF2ZVNoaWZ0KCsxKTtcclxuICAgIGNhc2UgXCI8XCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRPY3RhdmVTaGlmdCgtMSk7XHJcbiAgICBjYXNlIFwibFwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkTm90ZUxlbmd0aCgpO1xyXG4gICAgY2FzZSBcInFcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZE5vdGVRdWFudGl6ZSgpO1xyXG4gICAgY2FzZSBcInZcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZE5vdGVWZWxvY2l0eSgpO1xyXG4gICAgY2FzZSBcInRcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZFRlbXBvKCk7XHJcbiAgICBjYXNlIFwiJFwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkSW5maW5pdGVMb29wKCk7XHJcbiAgICBjYXNlIFwiL1wiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkTG9vcCgpO1xyXG4gICAgY2FzZSBcIkBcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZFRvbmUoKTtcclxuICAgIGNhc2UgXCJ3XCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRXYXZlRm9ybSgpO1xyXG4gICAgY2FzZSBcInNcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZEVudmVsb3BlKCk7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICAvLyBkbyBub3RoaW5nXHJcbiAgICB9XHJcbiAgICB0aGlzLnNjYW5uZXIudGhyb3dVbmV4cGVjdGVkVG9rZW4oKTtcclxuICB9XHJcblxyXG4gIHJlYWROb3RlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4Lk5vdGUsXHJcbiAgICAgIG5vdGVOdW1iZXJzOiBbIHRoaXMuX3JlYWROb3RlTnVtYmVyKDApIF0sXHJcbiAgICAgIG5vdGVMZW5ndGg6IHRoaXMuX3JlYWRMZW5ndGgoKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkQ2hvcmQoKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiW1wiKTtcclxuXHJcbiAgICBsZXQgbm90ZUxpc3QgPSBbXTtcclxuICAgIGxldCBvZmZzZXQgPSAwO1xyXG5cclxuICAgIHRoaXMuX3JlYWRVbnRpbChcIl1cIiwgKCkgPT4ge1xyXG4gICAgICBzd2l0Y2ggKHRoaXMuc2Nhbm5lci5wZWVrKCkpIHtcclxuICAgICAgY2FzZSBcImNcIjpcclxuICAgICAgY2FzZSBcImRcIjpcclxuICAgICAgY2FzZSBcImVcIjpcclxuICAgICAgY2FzZSBcImZcIjpcclxuICAgICAgY2FzZSBcImdcIjpcclxuICAgICAgY2FzZSBcImFcIjpcclxuICAgICAgY2FzZSBcImJcIjpcclxuICAgICAgICBub3RlTGlzdC5wdXNoKHRoaXMuX3JlYWROb3RlTnVtYmVyKG9mZnNldCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiPlwiOlxyXG4gICAgICAgIHRoaXMuc2Nhbm5lci5uZXh0KCk7XHJcbiAgICAgICAgb2Zmc2V0ICs9IDEyO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiPFwiOlxyXG4gICAgICAgIHRoaXMuc2Nhbm5lci5uZXh0KCk7XHJcbiAgICAgICAgb2Zmc2V0IC09IDEyO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRoaXMuc2Nhbm5lci50aHJvd1VuZXhwZWN0ZWRUb2tlbigpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiXVwiKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguTm90ZSxcclxuICAgICAgbm90ZU51bWJlcnM6IG5vdGVMaXN0LFxyXG4gICAgICBub3RlTGVuZ3RoOiB0aGlzLl9yZWFkTGVuZ3RoKCksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZFJlc3QoKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiclwiKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguUmVzdCxcclxuICAgICAgbm90ZUxlbmd0aDogdGhpcy5fcmVhZExlbmd0aCgpLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWRPY3RhdmUoKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwib1wiKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguT2N0YXZlLFxyXG4gICAgICB2YWx1ZTogdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrLyksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZE9jdGF2ZVNoaWZ0KGRpcmVjdGlvbikge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdCgvPHw+Lyk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4Lk9jdGF2ZVNoaWZ0LFxyXG4gICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbnwwLFxyXG4gICAgICB2YWx1ZTogdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrLyksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZE5vdGVMZW5ndGgoKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwibFwiKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguTm90ZUxlbmd0aCxcclxuICAgICAgbm90ZUxlbmd0aDogdGhpcy5fcmVhZExlbmd0aCgpLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWROb3RlUXVhbnRpemUoKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwicVwiKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguTm90ZVF1YW50aXplLFxyXG4gICAgICB2YWx1ZTogdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrLyksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZE5vdGVWZWxvY2l0eSgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJ2XCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5Ob3RlVmVsb2NpdHksXHJcbiAgICAgIHZhbHVlOiB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkVGVtcG8oKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwidFwiKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguVGVtcG8sXHJcbiAgICAgIHZhbHVlOiB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsoXFwuXFxkKyk/LyksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZEluZmluaXRlTG9vcCgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCIkXCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5JbmZpbml0ZUxvb3AsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZExvb3AoKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiL1wiKTtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCI6XCIpO1xyXG5cclxuICAgIGxldCByZXN1bHQgPSBbXTtcclxuICAgIGxldCBsb29wQmVnaW4gPSB7IHR5cGU6IFN5bnRheC5Mb29wQmVnaW4gfTtcclxuICAgIGxldCBsb29wRW5kID0geyB0eXBlOiBTeW50YXguTG9vcEVuZCB9O1xyXG5cclxuICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQobG9vcEJlZ2luKTtcclxuICAgIHRoaXMuX3JlYWRVbnRpbCgvW3w6XS8sICgpID0+IHtcclxuICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLmFkdmFuY2UoKSk7XHJcbiAgICB9KTtcclxuICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5fcmVhZExvb3BFeGl0KCkpO1xyXG5cclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCI6XCIpO1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIi9cIik7XHJcblxyXG4gICAgbG9vcEJlZ2luLnZhbHVlID0gdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrLykgfHwgbnVsbDtcclxuXHJcbiAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KGxvb3BFbmQpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG4gIFxyXG4gIHJlYWRUb25lKCl7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiQFwiKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5Ub25lLFxyXG4gICAgICB2YWx1ZTogdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrLylcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHJlYWRXYXZlRm9ybSgpe1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIndcIik7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiXFxcIlwiKTtcclxuICAgIGxldCB3YXZlRGF0YSA9IHRoaXMuc2Nhbm5lci5zY2FuKC9bMC05YS1mQS1GXSs/Lyk7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiXFxcIlwiKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5XYXZlRm9ybSxcclxuICAgICAgdmFsdWU6IHdhdmVEYXRhXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICByZWFkRW52ZWxvcGUoKXtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJzXCIpO1xyXG4gICAgbGV0IGEgPSB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsoXFwuXFxkKyk/Lyk7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiLFwiKTtcclxuICAgIGxldCBkID0gdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrKFxcLlxcZCspPy8pO1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIixcIik7XHJcbiAgICBsZXQgcyA9IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKyhcXC5cXGQrKT8vKTtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCIsXCIpO1xyXG4gICAgbGV0IHIgPSB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsoXFwuXFxkKyk/Lyk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOlN5bnRheC5FbnZlbG9wZSxcclxuICAgICAgYTphLGQ6ZCxzOnMscjpyXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBfcmVhZFVudGlsKG1hdGNoZXIsIGNhbGxiYWNrKSB7XHJcbiAgICB3aGlsZSAodGhpcy5zY2FubmVyLmhhc05leHQoKSkge1xyXG4gICAgICB0aGlzLnNjYW5uZXIuZm9yd2FyZCgpO1xyXG4gICAgICBpZiAoIXRoaXMuc2Nhbm5lci5oYXNOZXh0KCkgfHwgdGhpcy5zY2FubmVyLm1hdGNoKG1hdGNoZXIpKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9yZWFkQXJndW1lbnQobWF0Y2hlcikge1xyXG4gICAgbGV0IG51bSA9IHRoaXMuc2Nhbm5lci5zY2FuKG1hdGNoZXIpO1xyXG5cclxuICAgIHJldHVybiBudW0gIT09IG51bGwgPyArbnVtIDogbnVsbDtcclxuICB9XHJcblxyXG4gIF9yZWFkTm90ZU51bWJlcihvZmZzZXQpIHtcclxuICAgIGxldCBub3RlSW5kZXggPSBOT1RFX0lOREVYRVNbdGhpcy5zY2FubmVyLm5leHQoKV07XHJcblxyXG4gICAgcmV0dXJuIG5vdGVJbmRleCArIHRoaXMuX3JlYWRBY2NpZGVudGFsKCkgKyBvZmZzZXQ7XHJcbiAgfVxyXG5cclxuICBfcmVhZEFjY2lkZW50YWwoKSB7XHJcbiAgICBpZiAodGhpcy5zY2FubmVyLm1hdGNoKFwiK1wiKSkge1xyXG4gICAgICByZXR1cm4gKzEgKiB0aGlzLnNjYW5uZXIuc2NhbigvXFwrKy8pLmxlbmd0aDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNjYW5uZXIubWF0Y2goXCItXCIpKSB7XHJcbiAgICAgIHJldHVybiAtMSAqIHRoaXMuc2Nhbm5lci5zY2FuKC9cXC0rLykubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIDA7XHJcbiAgfVxyXG5cclxuICBfcmVhZERvdCgpIHtcclxuICAgIGxldCBsZW4gPSAodGhpcy5zY2FubmVyLnNjYW4oL1xcLisvKSB8fCBcIlwiKS5sZW5ndGg7XHJcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5KGxlbik7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICByZXN1bHRbaV0gPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBfcmVhZExlbmd0aCgpIHtcclxuICAgIGxldCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKy8pKTtcclxuICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5fcmVhZERvdCgpKTtcclxuXHJcbiAgICBsZXQgdGllID0gdGhpcy5fcmVhZFRpZSgpO1xyXG5cclxuICAgIGlmICh0aWUpIHtcclxuICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBfcmVhZFRpZSgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5mb3J3YXJkKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuc2Nhbm5lci5tYXRjaChcIl5cIikpIHtcclxuICAgICAgdGhpcy5zY2FubmVyLm5leHQoKTtcclxuICAgICAgcmV0dXJuIHRoaXMuX3JlYWRMZW5ndGgoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIF9yZWFkTG9vcEV4aXQoKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgaWYgKHRoaXMuc2Nhbm5lci5tYXRjaChcInxcIikpIHtcclxuICAgICAgdGhpcy5zY2FubmVyLm5leHQoKTtcclxuXHJcbiAgICAgIGxldCBsb29wRXhpdCA9IHsgdHlwZTogU3ludGF4Lkxvb3BFeGl0IH07XHJcblxyXG4gICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KGxvb3BFeGl0KTtcclxuXHJcbiAgICAgIHRoaXMuX3JlYWRVbnRpbChcIjpcIiwgKCkgPT4ge1xyXG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5hZHZhbmNlKCkpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdCB7XHJcbiAgdGVtcG86IDEyMCxcclxuICBvY3RhdmU6IDQsXHJcbiAgbGVuZ3RoOiA0LFxyXG4gIHZlbG9jaXR5OiAxMDAsXHJcbiAgcXVhbnRpemU6IDc1LFxyXG4gIGxvb3BDb3VudDogMixcclxufTtcclxuIiwiLyohXHJcbiAqIGx6YmFzZTYyIHYxLjQuNiAtIExaNzcoTFpTUykgYmFzZWQgY29tcHJlc3Npb24gYWxnb3JpdGhtIGluIGJhc2U2MiBmb3IgSmF2YVNjcmlwdC5cclxuICogQ29weXJpZ2h0IChjKSAyMDE0LTIwMTUgcG9seWdvbiBwbGFuZXQgPHBvbHlnb24ucGxhbmV0LmFxdWFAZ21haWwuY29tPlxyXG4gKiBAbGljZW5zZSBNSVRcclxuICovXHJcbiFmdW5jdGlvbihhLGIsYyl7XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGV4cG9ydHM/XCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YygpOmV4cG9ydHNbYV09YygpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoYyk6YlthXT1jKCl9KFwibHpiYXNlNjJcIix0aGlzLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gYShhKXt0aGlzLl9pbml0KGEpfWZ1bmN0aW9uIGIoYSl7dGhpcy5faW5pdChhKX1mdW5jdGlvbiBjKCl7dmFyIGEsYixjLGQsZT1cImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCIsZj1cIlwiLGc9ZS5sZW5ndGg7Zm9yKGE9MDtnPmE7YSsrKWZvcihjPWUuY2hhckF0KGEpLGI9Zy0xO2I+MTUmJmYubGVuZ3RoPHY7Yi0tKWQ9ZS5jaGFyQXQoYiksZis9XCIgXCIrYytcIiBcIitkO2Zvcig7Zi5sZW5ndGg8djspZj1cIiBcIitmO3JldHVybiBmPWYuc2xpY2UoMCx2KX1mdW5jdGlvbiBkKGEsYil7cmV0dXJuIGEubGVuZ3RoPT09Yj9hOmEuc3ViYXJyYXk/YS5zdWJhcnJheSgwLGIpOihhLmxlbmd0aD1iLGEpfWZ1bmN0aW9uIGUoYSxiKXtpZihudWxsPT1iP2I9YS5sZW5ndGg6YT1kKGEsYiksbCYmbSYmbz5iKXtpZihwKXJldHVybiBqLmFwcGx5KG51bGwsYSk7aWYobnVsbD09PXApdHJ5e3ZhciBjPWouYXBwbHkobnVsbCxhKTtyZXR1cm4gYj5vJiYocD0hMCksY31jYXRjaChlKXtwPSExfX1yZXR1cm4gZihhKX1mdW5jdGlvbiBmKGEpe2Zvcih2YXIgYixjPVwiXCIsZD1hLmxlbmd0aCxlPTA7ZD5lOyl7aWYoYj1hLnN1YmFycmF5P2Euc3ViYXJyYXkoZSxlK28pOmEuc2xpY2UoZSxlK28pLGUrPW8sIXApe2lmKG51bGw9PT1wKXRyeXtjKz1qLmFwcGx5KG51bGwsYiksYi5sZW5ndGg+byYmKHA9ITApO2NvbnRpbnVlfWNhdGNoKGYpe3A9ITF9cmV0dXJuIGcoYSl9Yys9ai5hcHBseShudWxsLGIpfXJldHVybiBjfWZ1bmN0aW9uIGcoYSl7Zm9yKHZhciBiPVwiXCIsYz1hLmxlbmd0aCxkPTA7Yz5kO2QrKyliKz1qKGFbZF0pO3JldHVybiBifWZ1bmN0aW9uIGgoYSxiKXtpZighaylyZXR1cm4gbmV3IEFycmF5KGIpO3N3aXRjaChhKXtjYXNlIDg6cmV0dXJuIG5ldyBVaW50OEFycmF5KGIpO2Nhc2UgMTY6cmV0dXJuIG5ldyBVaW50MTZBcnJheShiKX19ZnVuY3Rpb24gaShhKXtmb3IodmFyIGI9W10sYz1hJiZhLmxlbmd0aCxkPTA7Yz5kO2QrKyliW2RdPWEuY2hhckNvZGVBdChkKTtyZXR1cm4gYn12YXIgaj1TdHJpbmcuZnJvbUNoYXJDb2RlLGs9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFVpbnQ4QXJyYXkmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBVaW50MTZBcnJheSxsPSExLG09ITE7dHJ5e1wiYVwiPT09ai5hcHBseShudWxsLFs5N10pJiYobD0hMCl9Y2F0Y2gobil7fWlmKGspdHJ5e1wiYVwiPT09ai5hcHBseShudWxsLG5ldyBVaW50OEFycmF5KFs5N10pKSYmKG09ITApfWNhdGNoKG4pe312YXIgbz02NTUzMyxwPW51bGwscT0hMTstMSE9PVwiYWJjXFx1MzA3YlxcdTMwNTJcIi5sYXN0SW5kZXhPZihcIlxcdTMwN2JcXHUzMDUyXCIsMSkmJihxPSEwKTt2YXIgcj1cIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5XCIscz1yLmxlbmd0aCx0PU1hdGgubWF4KHMsNjIpLU1hdGgubWluKHMsNjIpLHU9cy0xLHY9MTAyNCx3PTMwNCx4PW8seT14LXMsej1vLEE9eisyKnYsQj0xMSxDPUIqKEIrMSksRD00MCxFPUQqKEQrMSksRj1zKzEsRz10KzIwLEg9cys1LEk9cy10LTE5LEo9RCs3LEs9SisxLEw9SysxLE09TCs1LE49TSs1O2EucHJvdG90eXBlPXtfaW5pdDpmdW5jdGlvbihhKXthPWF8fHt9LHRoaXMuX2RhdGE9bnVsbCx0aGlzLl90YWJsZT1udWxsLHRoaXMuX3Jlc3VsdD1udWxsLHRoaXMuX29uRGF0YUNhbGxiYWNrPWEub25EYXRhLHRoaXMuX29uRW5kQ2FsbGJhY2s9YS5vbkVuZH0sX2NyZWF0ZVRhYmxlOmZ1bmN0aW9uKCl7Zm9yKHZhciBhPWgoOCxzKSxiPTA7cz5iO2IrKylhW2JdPXIuY2hhckNvZGVBdChiKTtyZXR1cm4gYX0sX29uRGF0YTpmdW5jdGlvbihhLGIpe3ZhciBjPWUoYSxiKTt0aGlzLl9vbkRhdGFDYWxsYmFjaz90aGlzLl9vbkRhdGFDYWxsYmFjayhjKTp0aGlzLl9yZXN1bHQrPWN9LF9vbkVuZDpmdW5jdGlvbigpe3RoaXMuX29uRW5kQ2FsbGJhY2smJnRoaXMuX29uRW5kQ2FsbGJhY2soKSx0aGlzLl9kYXRhPXRoaXMuX3RhYmxlPW51bGx9LF9zZWFyY2g6ZnVuY3Rpb24oKXt2YXIgYT0yLGI9dGhpcy5fZGF0YSxjPXRoaXMuX29mZnNldCxkPXU7aWYodGhpcy5fZGF0YUxlbi1jPGQmJihkPXRoaXMuX2RhdGFMZW4tYyksYT5kKXJldHVybiExO3ZhciBlLGYsZyxoLGksaixrPWMtdyxsPWIuc3Vic3RyaW5nKGssYytkKSxtPWMrYS0zLWs7ZG97aWYoMj09PWEpe2lmKGY9Yi5jaGFyQXQoYykrYi5jaGFyQXQoYysxKSxnPWwuaW5kZXhPZihmKSwhfmd8fGc+bSlicmVha31lbHNlIDM9PT1hP2YrPWIuY2hhckF0KGMrMik6Zj1iLnN1YnN0cihjLGEpO2lmKHE/KGo9Yi5zdWJzdHJpbmcoayxjK2EtMSksaD1qLmxhc3RJbmRleE9mKGYpKTpoPWwubGFzdEluZGV4T2YoZixtKSwhfmgpYnJlYWs7aT1oLGU9aytoO2RvIGlmKGIuY2hhckNvZGVBdChjK2EpIT09Yi5jaGFyQ29kZUF0KGUrYSkpYnJlYWs7d2hpbGUoKythPGQpO2lmKGc9PT1oKXthKys7YnJlYWt9fXdoaWxlKCsrYTxkKTtyZXR1cm4gMj09PWE/ITE6KHRoaXMuX2luZGV4PXctaSx0aGlzLl9sZW5ndGg9YS0xLCEwKX0sY29tcHJlc3M6ZnVuY3Rpb24oYSl7aWYobnVsbD09YXx8MD09PWEubGVuZ3RoKXJldHVyblwiXCI7dmFyIGI9XCJcIixkPXRoaXMuX2NyZWF0ZVRhYmxlKCksZT1jKCksZj1oKDgseCksZz0wO3RoaXMuX3Jlc3VsdD1cIlwiLHRoaXMuX29mZnNldD1lLmxlbmd0aCx0aGlzLl9kYXRhPWUrYSx0aGlzLl9kYXRhTGVuPXRoaXMuX2RhdGEubGVuZ3RoLGU9YT1udWxsO2Zvcih2YXIgaSxqLGssbCxtLG49LTEsbz0tMTt0aGlzLl9vZmZzZXQ8dGhpcy5fZGF0YUxlbjspdGhpcy5fc2VhcmNoKCk/KHRoaXMuX2luZGV4PHU/KGo9dGhpcy5faW5kZXgsaz0wKTooaj10aGlzLl9pbmRleCV1LGs9KHRoaXMuX2luZGV4LWopL3UpLDI9PT10aGlzLl9sZW5ndGg/KGZbZysrXT1kW2srTV0sZltnKytdPWRbal0pOihmW2crK109ZFtrK0xdLGZbZysrXT1kW2pdLGZbZysrXT1kW3RoaXMuX2xlbmd0aF0pLHRoaXMuX29mZnNldCs9dGhpcy5fbGVuZ3RoLH5vJiYobz0tMSkpOihpPXRoaXMuX2RhdGEuY2hhckNvZGVBdCh0aGlzLl9vZmZzZXQrKyksQz5pPyhEPmk/KGo9aSxrPTAsbj1GKTooaj1pJUQsaz0oaS1qKS9ELG49aytGKSxvPT09bj9mW2crK109ZFtqXTooZltnKytdPWRbbi1HXSxmW2crK109ZFtqXSxvPW4pKTooRT5pPyhqPWksaz0wLG49SCk6KGo9aSVFLGs9KGktaikvRSxuPWsrSCksRD5qPyhsPWosbT0wKToobD1qJUQsbT0oai1sKS9EKSxvPT09bj8oZltnKytdPWRbbF0sZltnKytdPWRbbV0pOihmW2crK109ZFtLXSxmW2crK109ZFtuLXNdLGZbZysrXT1kW2xdLGZbZysrXT1kW21dLG89bikpKSxnPj15JiYodGhpcy5fb25EYXRhKGYsZyksZz0wKTtyZXR1cm4gZz4wJiZ0aGlzLl9vbkRhdGEoZixnKSx0aGlzLl9vbkVuZCgpLGI9dGhpcy5fcmVzdWx0LHRoaXMuX3Jlc3VsdD1udWxsLG51bGw9PT1iP1wiXCI6Yn19LGIucHJvdG90eXBlPXtfaW5pdDpmdW5jdGlvbihhKXthPWF8fHt9LHRoaXMuX3Jlc3VsdD1udWxsLHRoaXMuX29uRGF0YUNhbGxiYWNrPWEub25EYXRhLHRoaXMuX29uRW5kQ2FsbGJhY2s9YS5vbkVuZH0sX2NyZWF0ZVRhYmxlOmZ1bmN0aW9uKCl7Zm9yKHZhciBhPXt9LGI9MDtzPmI7YisrKWFbci5jaGFyQXQoYildPWI7cmV0dXJuIGF9LF9vbkRhdGE6ZnVuY3Rpb24oYSl7dmFyIGI7aWYodGhpcy5fb25EYXRhQ2FsbGJhY2spe2lmKGEpYj10aGlzLl9yZXN1bHQsdGhpcy5fcmVzdWx0PVtdO2Vsc2V7dmFyIGM9ei12O2I9dGhpcy5fcmVzdWx0LnNsaWNlKHYsditjKSx0aGlzLl9yZXN1bHQ9dGhpcy5fcmVzdWx0LnNsaWNlKDAsdikuY29uY2F0KHRoaXMuX3Jlc3VsdC5zbGljZSh2K2MpKX1iLmxlbmd0aD4wJiZ0aGlzLl9vbkRhdGFDYWxsYmFjayhlKGIpKX19LF9vbkVuZDpmdW5jdGlvbigpe3RoaXMuX29uRW5kQ2FsbGJhY2smJnRoaXMuX29uRW5kQ2FsbGJhY2soKX0sZGVjb21wcmVzczpmdW5jdGlvbihhKXtpZihudWxsPT1hfHwwPT09YS5sZW5ndGgpcmV0dXJuXCJcIjt0aGlzLl9yZXN1bHQ9aShjKCkpO2Zvcih2YXIgYixkLGYsZyxoLGosayxsLG0sbixvPVwiXCIscD10aGlzLl9jcmVhdGVUYWJsZSgpLHE9ITEscj1udWxsLHM9YS5sZW5ndGgsdD0wO3M+dDt0KyspaWYoZD1wW2EuY2hhckF0KHQpXSx2b2lkIDAhPT1kKXtpZihJPmQpcT8oZz1wW2EuY2hhckF0KCsrdCldLGg9ZypEK2QrRSpyKTpoPXIqRCtkLHRoaXMuX3Jlc3VsdFt0aGlzLl9yZXN1bHQubGVuZ3RoXT1oO2Vsc2UgaWYoSj5kKXI9ZC1JLHE9ITE7ZWxzZSBpZihkPT09SylmPXBbYS5jaGFyQXQoKyt0KV0scj1mLTUscT0hMDtlbHNlIGlmKE4+ZCl7aWYoZj1wW2EuY2hhckF0KCsrdCldLE0+ZD8oaj0oZC1MKSp1K2Ysaz1wW2EuY2hhckF0KCsrdCldKTooaj0oZC1NKSp1K2Ysaz0yKSxsPXRoaXMuX3Jlc3VsdC5zbGljZSgtaiksbC5sZW5ndGg+ayYmKGwubGVuZ3RoPWspLG09bC5sZW5ndGgsbC5sZW5ndGg+MClmb3Iobj0wO2s+bjspZm9yKGI9MDttPmImJih0aGlzLl9yZXN1bHRbdGhpcy5fcmVzdWx0Lmxlbmd0aF09bFtiXSwhKCsrbj49aykpO2IrKyk7cj1udWxsfXRoaXMuX3Jlc3VsdC5sZW5ndGg+PUEmJnRoaXMuX29uRGF0YSgpfXJldHVybiB0aGlzLl9yZXN1bHQ9dGhpcy5fcmVzdWx0LnNsaWNlKHYpLHRoaXMuX29uRGF0YSghMCksdGhpcy5fb25FbmQoKSxvPWUodGhpcy5fcmVzdWx0KSx0aGlzLl9yZXN1bHQ9bnVsbCxvfX07dmFyIE89e2NvbXByZXNzOmZ1bmN0aW9uKGIsYyl7cmV0dXJuIG5ldyBhKGMpLmNvbXByZXNzKGIpfSxkZWNvbXByZXNzOmZ1bmN0aW9uKGEsYyl7cmV0dXJuIG5ldyBiKGMpLmRlY29tcHJlc3MoYSl9fTtyZXR1cm4gT30pOyIsIlwidXNlIHN0cmljdFwiO1xyXG4vLy8vIFdlYiBBdWRpbyBBUEkg44Op44OD44OR44O844Kv44Op44K5IC8vLy9cclxuXHJcbi8vIE1NTFBhcnNlcuOBr21vaGF5b25hb+OBleOCk+OBruOCguOBrlxyXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbW9oYXlvbmFvL21tbC1pdGVyYXRvclxyXG5cclxuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9TeW50YXguanNcIjtcclxuaW1wb3J0IFNjYW5uZXIgZnJvbSBcIi4vU2Nhbm5lci5qc1wiO1xyXG5pbXBvcnQgTU1MUGFyc2VyIGZyb20gXCIuL01NTFBhcnNlci5qc1wiO1xyXG5pbXBvcnQgRGVmYXVsdFBhcmFtcyBmcm9tIFwiLi9EZWZhdWx0UGFyYW1zLmpzXCI7XHJcbmltcG9ydCBsemJhc2U2MiBmcm9tIFwiLi9semJhc2U2Mi5taW4uanNcIjtcclxuaW1wb3J0IHNmZyBmcm9tICcuL2dsb2JhbC5qcyc7IFxyXG5cclxuLy8gdmFyIGZmdCA9IG5ldyBGRlQoNDA5NiwgNDQxMDApO1xyXG5jb25zdCBCVUZGRVJfU0laRSA9IDEwMjQ7XHJcbmNvbnN0IFRJTUVfQkFTRSA9IDk2O1xyXG5cclxuLy8gTUlESeODjuODvOODiCA9PiDlho3nlJ/jg6zjg7zjg4jlpInmj5vjg4bjg7zjg5bjg6tcclxudmFyIG5vdGVGcmVxID0gW107XHJcbmZvciAodmFyIGkgPSAtNjk7IGkgPCA1ODsgKytpKSB7XHJcbiAgbm90ZUZyZXEucHVzaChNYXRoLnBvdygyLCBpIC8gMTIpKTtcclxufVxyXG5cclxuLy8gTUlESeODjuODvOODiOWRqOazouaVsCDlpInmj5vjg4bjg7zjg5bjg6tcclxudmFyIG1pZGlGcmVxID0gW107XHJcbmZvciAobGV0IGkgPSAwOyBpIDwgMTI3OyArK2kpIHtcclxuICBtaWRpRnJlcS5wdXNoKG1pZGljcHMoaSkpO1xyXG59XHJcbmZ1bmN0aW9uIG1pZGljcHMobm90ZU51bWJlcikge1xyXG4gIHJldHVybiA0NDAgKiBNYXRoLnBvdygyLCAobm90ZU51bWJlciAtIDY5KSAqIDEgLyAxMik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVTdHIoYml0cywgd2F2ZXN0cikge1xyXG4gIHZhciBhcnIgPSBbXTtcclxuICB2YXIgbiA9IGJpdHMgLyA0IHwgMDtcclxuICB2YXIgYyA9IDA7XHJcbiAgdmFyIHplcm9wb3MgPSAxIDw8IChiaXRzIC0gMSk7XHJcbiAgd2hpbGUgKGMgPCB3YXZlc3RyLmxlbmd0aCkge1xyXG4gICAgdmFyIGQgPSAwO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpIHtcclxuICAgICAgZCA9IChkIDw8IDQpICsgcGFyc2VJbnQod2F2ZXN0ci5jaGFyQXQoYysrKSwgJzE2Jyk7XHJcbiAgICB9XHJcbiAgICBhcnIucHVzaCgoZCAtIHplcm9wb3MpIC8gemVyb3Bvcyk7XHJcbiAgfVxyXG4gIHJldHVybiBhcnI7XHJcbn1cclxuXHJcbnZhciB3YXZlcyA9IFtcclxuICBkZWNvZGVTdHIoNCwgJ0VFRUVFRUVFRUVFRUVFRUUwMDAwMDAwMDAwMDAwMDAwJyksXHJcbiAgZGVjb2RlU3RyKDQsICcwMDExMjIzMzQ0NTU2Njc3ODg5OUFBQkJDQ0RERUVGRicpLFxyXG4gIGRlY29kZVN0cig0LCAnMDIzNDY2NDU5QUE4QTdBOTc3OTY1NjU2QUNBQUNERUYnKSxcclxuICBkZWNvZGVTdHIoNCwgJ0JEQ0RDQTk5OUFDRENEQjk0MjEyMzY3Nzc2MzIxMjQ3JyksXHJcbiAgZGVjb2RlU3RyKDQsICc3QUNERURDQTc0MjEwMTI0N0JERURCNzMyMDEzN0U3OCcpLFxyXG4gIGRlY29kZVN0cig0LCAnQUNDQTc3OUJERURBNjY2Nzk5OTQxMDEyNjc3NDIyNDcnKSxcclxuICBkZWNvZGVTdHIoNCwgJzdFQzlDRUE3Q0ZEOEFCNzI4RDk0NTcyMDM4NTEzNTMxJyksXHJcbiAgZGVjb2RlU3RyKDQsICdFRTc3RUU3N0VFNzdFRTc3MDA3NzAwNzcwMDc3MDA3NycpLFxyXG4gIGRlY29kZVN0cig0LCAnRUVFRTg4ODg4ODg4ODg4ODAwMDA4ODg4ODg4ODg4ODgnKS8v44OO44Kk44K655So44Gu44OA44Of44O85rOi5b2iXHJcbl07XHJcblxyXG5cclxuXHJcbnZhciB3YXZlU2FtcGxlcyA9IFtdO1xyXG5leHBvcnQgZnVuY3Rpb24gV2F2ZVNhbXBsZShhdWRpb2N0eCwgY2gsIHNhbXBsZUxlbmd0aCwgc2FtcGxlUmF0ZSkge1xyXG5cclxuICB0aGlzLnNhbXBsZSA9IGF1ZGlvY3R4LmNyZWF0ZUJ1ZmZlcihjaCwgc2FtcGxlTGVuZ3RoLCBzYW1wbGVSYXRlIHx8IGF1ZGlvY3R4LnNhbXBsZVJhdGUpO1xyXG4gIHRoaXMubG9vcCA9IGZhbHNlO1xyXG4gIHRoaXMuc3RhcnQgPSAwO1xyXG4gIHRoaXMuZW5kID0gKHNhbXBsZUxlbmd0aCAtIDEpIC8gKHNhbXBsZVJhdGUgfHwgYXVkaW9jdHguc2FtcGxlUmF0ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXYXZlU2FtcGxlRnJvbVdhdmVzKGF1ZGlvY3R4LCBzYW1wbGVMZW5ndGgpIHtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gd2F2ZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZhciBzYW1wbGUgPSBuZXcgV2F2ZVNhbXBsZShhdWRpb2N0eCwgMSwgc2FtcGxlTGVuZ3RoKTtcclxuICAgIHdhdmVTYW1wbGVzLnB1c2goc2FtcGxlKTtcclxuICAgIGlmIChpICE9IDgpIHtcclxuICAgICAgdmFyIHdhdmVkYXRhID0gd2F2ZXNbaV07XHJcbiAgICAgIHZhciBkZWx0YSA9IDQ0MC4wICogd2F2ZWRhdGEubGVuZ3RoIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgdmFyIHN0aW1lID0gMDtcclxuICAgICAgdmFyIG91dHB1dCA9IHNhbXBsZS5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgIHZhciBsZW4gPSB3YXZlZGF0YS5sZW5ndGg7XHJcbiAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgIHZhciBlbmRzYW1wbGUgPSAwO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNhbXBsZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgaW5kZXggPSBzdGltZSB8IDA7XHJcbiAgICAgICAgb3V0cHV0W2pdID0gd2F2ZWRhdGFbaW5kZXhdO1xyXG4gICAgICAgIHN0aW1lICs9IGRlbHRhO1xyXG4gICAgICAgIGlmIChzdGltZSA+PSBsZW4pIHtcclxuICAgICAgICAgIHN0aW1lID0gc3RpbWUgLSBsZW47XHJcbiAgICAgICAgICBlbmRzYW1wbGUgPSBqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzYW1wbGUuZW5kID0gZW5kc2FtcGxlIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgc2FtcGxlLmxvb3AgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g44Oc44Kk44K5OOOBr+ODjuOCpOOCuuazouW9ouOBqOOBmeOCi1xyXG4gICAgICB2YXIgb3V0cHV0ID0gc2FtcGxlLnNhbXBsZS5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzYW1wbGVMZW5ndGg7ICsraikge1xyXG4gICAgICAgIG91dHB1dFtqXSA9IE1hdGgucmFuZG9tKCkgKiAyLjAgLSAxLjA7XHJcbiAgICAgIH1cclxuICAgICAgc2FtcGxlLmVuZCA9IHNhbXBsZUxlbmd0aCAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHNhbXBsZS5sb29wID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIOWPguiAg++8mmh0dHA6Ly93d3cuZzIwMGtnLmNvbS9hcmNoaXZlcy8yMDE0LzEyL3dlYmF1ZGlvYXBpcGVyaS5odG1sXHJcbmZ1bmN0aW9uIGZvdXJpZXIod2F2ZWZvcm0sIGxlbikge1xyXG4gIHZhciByZWFsID0gbmV3IEZsb2F0MzJBcnJheShsZW4pLCBpbWFnID0gbmV3IEZsb2F0MzJBcnJheShsZW4pO1xyXG4gIHZhciB3YXZsZW4gPSB3YXZlZm9ybS5sZW5ndGg7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBsZW47ICsraikge1xyXG4gICAgICB2YXIgd2F2aiA9IGogLyBsZW4gKiB3YXZsZW47XHJcbiAgICAgIHZhciBkID0gd2F2ZWZvcm1bd2F2aiB8IDBdO1xyXG4gICAgICB2YXIgdGggPSBpICogaiAvIGxlbiAqIDIgKiBNYXRoLlBJO1xyXG4gICAgICByZWFsW2ldICs9IE1hdGguY29zKHRoKSAqIGQ7XHJcbiAgICAgIGltYWdbaV0gKz0gTWF0aC5zaW4odGgpICogZDtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIFtyZWFsLCBpbWFnXTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGVyaW9kaWNXYXZlRnJvbVdhdmVzKGF1ZGlvY3R4KSB7XHJcbiAgcmV0dXJuIHdhdmVzLm1hcCgoZCwgaSkgPT4ge1xyXG4gICAgaWYgKGkgIT0gOCkge1xyXG4gICAgICBsZXQgd2F2ZURhdGEgPSB3YXZlc1tpXTtcclxuICAgICAgbGV0IGZyZXFEYXRhID0gZm91cmllcih3YXZlRGF0YSwgd2F2ZURhdGEubGVuZ3RoKTtcclxuICAgICAgcmV0dXJuIGF1ZGlvY3R4LmNyZWF0ZVBlcmlvZGljV2F2ZShmcmVxRGF0YVswXSwgZnJlcURhdGFbMV0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IHdhdmVEYXRhID0gW107XHJcbiAgICAgIGZvciAobGV0IGogPSAwLCBlID0gd2F2ZXNbaV0ubGVuZ3RoOyBqIDwgZTsgKytqKSB7XHJcbiAgICAgICAgd2F2ZURhdGEucHVzaChNYXRoLnJhbmRvbSgpICogMi4wIC0gMS4wKTtcclxuICAgICAgfVxyXG4gICAgICBsZXQgZnJlcURhdGEgPSBmb3VyaWVyKHdhdmVEYXRhLCB3YXZlRGF0YS5sZW5ndGgpO1xyXG4gICAgICByZXR1cm4gYXVkaW9jdHguY3JlYXRlUGVyaW9kaWNXYXZlKGZyZXFEYXRhWzBdLCBmcmVxRGF0YVsxXSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIOODieODqeODoOOCteODs+ODl+ODq1xyXG5cclxuY29uc3QgZHJ1bVNhbXBsZXMgPSBbXHJcbiAgeyBuYW1lOiAnYmFzczEnLCBwYXRoOiAnYmFzZS9hdWRpby9iZDFfbHouanNvbicgfSwgLy8gQDlcclxuICB7IG5hbWU6ICdiYXNzMicsIHBhdGg6ICdiYXNlL2F1ZGlvL2JkMl9sei5qc29uJyB9LCAvLyBAMTBcclxuICB7IG5hbWU6ICdjbG9zZWQnLCBwYXRoOiAnYmFzZS9hdWRpby9jbG9zZWRfbHouanNvbicgfSwgLy8gQDExXHJcbiAgeyBuYW1lOiAnY293YmVsbCcsIHBhdGg6ICdiYXNlL2F1ZGlvL2Nvd2JlbGxfbHouanNvbicgfSwvLyBAMTJcclxuICB7IG5hbWU6ICdjcmFzaCcsIHBhdGg6ICdiYXNlL2F1ZGlvL2NyYXNoX2x6Lmpzb24nIH0sLy8gQDEzXHJcbiAgeyBuYW1lOiAnaGFuZGNsYXAnLCBwYXRoOiAnYmFzZS9hdWRpby9oYW5kY2xhcF9sei5qc29uJyB9LCAvLyBAMTRcclxuICB7IG5hbWU6ICdoaXRvbScsIHBhdGg6ICdiYXNlL2F1ZGlvL2hpdG9tX2x6Lmpzb24nIH0sLy8gQDE1XHJcbiAgeyBuYW1lOiAnbG93dG9tJywgcGF0aDogJ2Jhc2UvYXVkaW8vbG93dG9tX2x6Lmpzb24nIH0sLy8gQDE2XHJcbiAgeyBuYW1lOiAnbWlkdG9tJywgcGF0aDogJ2Jhc2UvYXVkaW8vbWlkdG9tX2x6Lmpzb24nIH0sLy8gQDE3XHJcbiAgeyBuYW1lOiAnb3BlbicsIHBhdGg6ICdiYXNlL2F1ZGlvL29wZW5fbHouanNvbicgfSwvLyBAMThcclxuICB7IG5hbWU6ICdyaWRlJywgcGF0aDogJ2Jhc2UvYXVkaW8vcmlkZV9sei5qc29uJyB9LC8vIEAxOVxyXG4gIHsgbmFtZTogJ3JpbXNob3QnLCBwYXRoOiAnYmFzZS9hdWRpby9yaW1zaG90X2x6Lmpzb24nIH0sLy8gQDIwXHJcbiAgeyBuYW1lOiAnc2QxJywgcGF0aDogJ2Jhc2UvYXVkaW8vc2QxX2x6Lmpzb24nIH0sLy8gQDIxXHJcbiAgeyBuYW1lOiAnc2QyJywgcGF0aDogJ2Jhc2UvYXVkaW8vc2QyX2x6Lmpzb24nIH0sLy8gQDIyXHJcbiAgeyBuYW1lOiAndGFtYicsIHBhdGg6ICdiYXNlL2F1ZGlvL3RhbWJfbHouanNvbicgfSwvLyBAMjNcclxuICB7IG5hbWU6J3ZvaWNlJyxwYXRoOiAnYmFzZS9hdWRpby9tb3ZpZV9sei5qc29uJ30vLyBAMjRcclxuXTtcclxuXHJcbmxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuZnVuY3Rpb24ganNvbih1cmwpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgeGhyLm9wZW4oXCJnZXRcIiwgdXJsLCB0cnVlKTtcclxuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmICh4aHIuc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZSh0aGlzLnJlc3BvbnNlVGV4dCkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1hNTEh0dHBSZXF1ZXN0IEVycm9yOicgKyB4aHIuc3RhdHVzKSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB4aHIub25lcnJvciA9IGVyciA9PiB7IHJlamVjdChlcnIpOyB9O1xyXG4gICAgeGhyLnNlbmQobnVsbCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWREcnVtU2FtcGxlKGF1ZGlvY3R4KSB7XHJcbiAgbGV0IHByID0gUHJvbWlzZS5yZXNvbHZlKDApO1xyXG4gIGRydW1TYW1wbGVzLmZvckVhY2goKGQpID0+IHtcclxuICAgIHByID1cclxuICAgICAgcHIudGhlbihqc29uLmJpbmQobnVsbCxzZmcucmVzb3VyY2VCYXNlICsgZC5wYXRoKSlcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIGxldCBzYW1wbGVTdHIgPSBsemJhc2U2Mi5kZWNvbXByZXNzKGRhdGEuc2FtcGxlcyk7XHJcbiAgICAgICAgICBsZXQgc2FtcGxlcyA9IGRlY29kZVN0cig0LCBzYW1wbGVTdHIpO1xyXG4gICAgICAgICAgbGV0IHdzID0gbmV3IFdhdmVTYW1wbGUoYXVkaW9jdHgsIDEsIHNhbXBsZXMubGVuZ3RoLCBkYXRhLnNhbXBsZVJhdGUpO1xyXG4gICAgICAgICAgbGV0IHNiID0gd3Muc2FtcGxlLmdldENoYW5uZWxEYXRhKDApO1xyXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGUgPSBzYi5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgICAgICAgICAgc2JbaV0gPSBzYW1wbGVzW2ldO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgd2F2ZVNhbXBsZXMucHVzaCh3cyk7XHJcbiAgICAgICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBwcjtcclxufVxyXG5cclxuLy8gZXhwb3J0IGNsYXNzIFdhdmVUZXh0dXJlIHsgXHJcbi8vICAgY29uc3RydWN0b3Iod2F2ZSkge1xyXG4vLyAgICAgdGhpcy53YXZlID0gd2F2ZSB8fCB3YXZlc1swXTtcclxuLy8gICAgIHRoaXMudGV4ID0gbmV3IENhbnZhc1RleHR1cmUoMzIwLCAxMCAqIDE2KTtcclxuLy8gICAgIHRoaXMucmVuZGVyKCk7XHJcbi8vICAgfVxyXG5cclxuLy8gICByZW5kZXIoKSB7XHJcbi8vICAgICB2YXIgY3R4ID0gdGhpcy50ZXguY3R4O1xyXG4vLyAgICAgdmFyIHdhdmUgPSB0aGlzLndhdmU7XHJcbi8vICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcclxuLy8gICAgIGN0eC5iZWdpblBhdGgoKTtcclxuLy8gICAgIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSc7XHJcbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyMDsgaSArPSAxMCkge1xyXG4vLyAgICAgICBjdHgubW92ZVRvKGksIDApO1xyXG4vLyAgICAgICBjdHgubGluZVRvKGksIDI1NSk7XHJcbi8vICAgICB9XHJcbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2MDsgaSArPSAxMCkge1xyXG4vLyAgICAgICBjdHgubW92ZVRvKDAsIGkpO1xyXG4vLyAgICAgICBjdHgubGluZVRvKDMyMCwgaSk7XHJcbi8vICAgICB9XHJcbi8vICAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC43KSc7XHJcbi8vICAgICBjdHgucmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XHJcbi8vICAgICBjdHguc3Ryb2tlKCk7XHJcbi8vICAgICBmb3IgKHZhciBpID0gMCwgYyA9IDA7IGkgPCBjdHguY2FudmFzLndpZHRoOyBpICs9IDEwLCArK2MpIHtcclxuLy8gICAgICAgY3R4LmZpbGxSZWN0KGksICh3YXZlW2NdID4gMCkgPyA4MCAtIHdhdmVbY10gKiA4MCA6IDgwLCAxMCwgTWF0aC5hYnMod2F2ZVtjXSkgKiA4MCk7XHJcbi8vICAgICB9XHJcbi8vICAgICB0aGlzLnRleC50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuLy8gICB9XHJcbi8vIH07XHJcblxyXG4vLy8g44Ko44Oz44OZ44Ot44O844OX44K444Kn44ON44Os44O844K/44O8XHJcbmV4cG9ydCBjbGFzcyBFbnZlbG9wZUdlbmVyYXRvciB7XHJcbiAgY29uc3RydWN0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuICAgIHRoaXMudm9pY2UgPSB2b2ljZTtcclxuICAgIC8vdGhpcy5rZXlvbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5hdHRhY2tUaW1lID0gYXR0YWNrIHx8IDAuMDAwNTtcclxuICAgIHRoaXMuZGVjYXlUaW1lID0gZGVjYXkgfHwgMC4wNTtcclxuICAgIHRoaXMuc3VzdGFpbkxldmVsID0gc3VzdGFpbiB8fCAwLjU7XHJcbiAgICB0aGlzLnJlbGVhc2VUaW1lID0gcmVsZWFzZSB8fCAwLjU7XHJcbiAgICB0aGlzLnYgPSAxLjA7XHJcbiAgICB0aGlzLmtleU9uVGltZSA9IDA7XHJcbiAgICB0aGlzLmtleU9mZlRpbWUgPSAwO1xyXG4gICAgdGhpcy5rZXlPbiA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAga2V5b24odCwgdmVsKSB7XHJcbiAgICB0aGlzLnYgPSB2ZWwgfHwgMS4wO1xyXG4gICAgdmFyIHYgPSB0aGlzLnY7XHJcbiAgICB2YXIgdDAgPSB0IHx8IHRoaXMudm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICB2YXIgdDEgPSB0MCArIHRoaXMuYXR0YWNrVGltZTtcclxuICAgIHZhciBnYWluID0gdGhpcy52b2ljZS5nYWluLmdhaW47XHJcbiAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbiAgICBnYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwKTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodiwgdDEpO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLnN1c3RhaW5MZXZlbCAqIHYsIHQxICsgdGhpcy5kZWNheVRpbWUpO1xyXG4gICAgLy9nYWluLnNldFRhcmdldEF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MSwgdDEgKyB0aGlzLmRlY2F5IC8gdik7XHJcbiAgICB0aGlzLmtleU9uVGltZSA9IHQwO1xyXG4gICAgdGhpcy5rZXlPZmZUaW1lID0gMDtcclxuICAgIHRoaXMua2V5T24gPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAga2V5b2ZmKHQpIHtcclxuICAgIHZhciB2b2ljZSA9IHRoaXMudm9pY2U7XHJcbiAgICB2YXIgZ2FpbiA9IHZvaWNlLmdhaW4uZ2FpbjtcclxuICAgIHZhciB0MCA9IHQgfHwgdm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICAvLyAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aGlzLmtleU9uVGltZSk7XHJcbiAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbiAgICBsZXQgcmVsZWFzZV90aW1lID0gdDAgKyB0aGlzLnJlbGVhc2VUaW1lO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCByZWxlYXNlX3RpbWUpO1xyXG4gICAgdGhpcy5rZXlPZmZUaW1lID0gdDA7XHJcbiAgICB0aGlzLmtleU9uVGltZSA9IDA7XHJcbiAgICB0aGlzLmtleU9uID0gZmFsc2U7XHJcbiAgICByZXR1cm4gcmVsZWFzZV90aW1lO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyBWb2ljZSB7XHJcbiAgY29uc3RydWN0b3IoYXVkaW9jdHgpIHtcclxuICAgIHRoaXMuYXVkaW9jdHggPSBhdWRpb2N0eDtcclxuICAgIHRoaXMuc2FtcGxlID0gd2F2ZVNhbXBsZXNbNl07XHJcbiAgICB0aGlzLnZvbHVtZSA9IGF1ZGlvY3R4LmNyZWF0ZUdhaW4oKTtcclxuICAgIHRoaXMuZW52ZWxvcGUgPSBuZXcgRW52ZWxvcGVHZW5lcmF0b3IodGhpcyxcclxuICAgICAgMC41LFxyXG4gICAgICAwLjI1LFxyXG4gICAgICAwLjgsXHJcbiAgICAgIDIuNVxyXG4gICAgKTtcclxuICAgIHRoaXMuaW5pdFByb2Nlc3NvcigpO1xyXG4gICAgdGhpcy5kZXR1bmUgPSAxLjA7XHJcbiAgICB0aGlzLnZvbHVtZS5nYWluLnZhbHVlID0gMS4wO1xyXG4gICAgdGhpcy5vdXRwdXQgPSB0aGlzLnZvbHVtZTtcclxuICB9XHJcblxyXG4gIGluaXRQcm9jZXNzb3IoKSB7XHJcbiAgICAvLyBpZih0aGlzLnByb2Nlc3Nvcil7XHJcbiAgICAvLyAgIHRoaXMuc3RvcCgpO1xyXG4gICAgLy8gICB0aGlzLnByb2Nlc3Nvci5kaXNjb25uZWN0KCk7XHJcbiAgICAvLyAgIHRoaXMucHJvY2Vzc29yID0gbnVsbDtcclxuICAgIC8vIH1cclxuICAgIGxldCBwcm9jZXNzb3IgPSB0aGlzLnByb2Nlc3NvciA9IHRoaXMuYXVkaW9jdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XHJcbiAgICBsZXQgZ2FpbiA9IHRoaXMuZ2FpbiA9IHRoaXMuYXVkaW9jdHguY3JlYXRlR2FpbigpO1xyXG4gICAgZ2Fpbi5nYWluLnZhbHVlID0gMC4wO1xyXG5cclxuICAgIHRoaXMucHJvY2Vzc29yLmJ1ZmZlciA9IHRoaXMuc2FtcGxlLnNhbXBsZTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3AgPSB0aGlzLnNhbXBsZS5sb29wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcFN0YXJ0ID0gMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IDEuMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3BFbmQgPSB0aGlzLnNhbXBsZS5lbmQ7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5jb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5vbmVuZGVkID0gKCkgPT4ge1xyXG4gICAgICBwcm9jZXNzb3IuZGlzY29ubmVjdCgpO1xyXG4gICAgICBnYWluLmRpc2Nvbm5lY3QoKTtcclxuICAgIH07XHJcbiAgICBnYWluLmNvbm5lY3QodGhpcy52b2x1bWUpO1xyXG4gIH1cclxuXHJcbiAgLy8gc2V0U2FtcGxlIChzYW1wbGUpIHtcclxuICAvLyAgICAgdGhpcy5lbnZlbG9wZS5rZXlvZmYoMCk7XHJcbiAgLy8gICAgIHRoaXMucHJvY2Vzc29yLmRpc2Nvbm5lY3QodGhpcy5nYWluKTtcclxuICAvLyAgICAgdGhpcy5zYW1wbGUgPSBzYW1wbGU7XHJcbiAgLy8gICAgIHRoaXMuaW5pdFByb2Nlc3NvcigpO1xyXG4gIC8vICAgICB0aGlzLnByb2Nlc3Nvci5zdGFydCgpO1xyXG4gIC8vIH1cclxuXHJcbiAgc3RhcnQoc3RhcnRUaW1lKSB7XHJcbiAgICAvLyAgIHRoaXMucHJvY2Vzc29yLmRpc2Nvbm5lY3QodGhpcy5nYWluKTtcclxuICAgIHRoaXMuaW5pdFByb2Nlc3NvcigpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoc3RhcnRUaW1lKTtcclxuICB9XHJcblxyXG4gIHN0b3AodGltZSkge1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RvcCh0aW1lKTtcclxuICAgIC8vdGhpcy5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAga2V5b24odCwgbm90ZSwgdmVsKSB7XHJcbiAgICB0aGlzLnN0YXJ0KHQpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLnNldFZhbHVlQXRUaW1lKG5vdGVGcmVxW25vdGVdICogdGhpcy5kZXR1bmUsIHQpO1xyXG4gICAgdGhpcy5rZXlPblRpbWUgPSB0O1xyXG4gICAgdGhpcy5lbnZlbG9wZS5rZXlvbih0LCB2ZWwpO1xyXG4gIH1cclxuXHJcbiAga2V5b2ZmKHQpIHtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0Lyp0aGlzLmtleU9uVGltZSovKTtcclxuICAgIHRoaXMua2V5T2ZmVGltZSA9IHRoaXMuZW52ZWxvcGUua2V5b2ZmKHQpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RvcCh0aGlzLmtleU9mZlRpbWUpO1xyXG4gIH1cclxuXHJcbiAgaXNLZXlPbih0KSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnZlbG9wZS5rZXlPbiAmJiAodGhpcy5rZXlPblRpbWUgPD0gdCk7XHJcbiAgfVxyXG5cclxuICBpc0tleU9mZih0KSB7XHJcbiAgICByZXR1cm4gIXRoaXMuZW52ZWxvcGUua2V5T24gJiYgKHRoaXMua2V5T2ZmVGltZSA8PSB0KTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg5zjgqTjgrlcclxuZXhwb3J0IGNsYXNzIE9zY1ZvaWNlIHtcclxuICBjb25zdHJ1Y3RvcihhdWRpb2N0eCwgcGVyaW9kaWNXYXZlKSB7XHJcbiAgICB0aGlzLmF1ZGlvY3R4ID0gYXVkaW9jdHg7XHJcbiAgICB0aGlzLnNhbXBsZSA9IHBlcmlvZGljV2F2ZTtcclxuICAgIHRoaXMudm9sdW1lID0gYXVkaW9jdHguY3JlYXRlR2FpbigpO1xyXG4gICAgdGhpcy5lbnZlbG9wZSA9IG5ldyBFbnZlbG9wZUdlbmVyYXRvcih0aGlzLFxyXG4gICAgICAwLjUsXHJcbiAgICAgIDAuMjUsXHJcbiAgICAgIDAuOCxcclxuICAgICAgMi41XHJcbiAgICApO1xyXG4gICAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbiAgICB0aGlzLmRldHVuZSA9IDEuMDtcclxuICAgIHRoaXMudm9sdW1lLmdhaW4udmFsdWUgPSAxLjA7XHJcbiAgICB0aGlzLm91dHB1dCA9IHRoaXMudm9sdW1lO1xyXG4gIH1cclxuXHJcbiAgaW5pdFByb2Nlc3NvcigpIHtcclxuICAgIGxldCBwcm9jZXNzb3IgPSB0aGlzLnByb2Nlc3NvciA9IHRoaXMuYXVkaW9jdHguY3JlYXRlT3NjaWxsYXRvcigpO1xyXG4gICAgbGV0IGdhaW4gPSB0aGlzLmdhaW4gPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUdhaW4oKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMC4wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc2V0UGVyaW9kaWNXYXZlKHRoaXMuc2FtcGxlKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmNvbm5lY3QodGhpcy5nYWluKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLm9uZW5kZWQgPSAoKSA9PiB7XHJcbiAgICAgIHByb2Nlc3Nvci5kaXNjb25uZWN0KCk7XHJcbiAgICAgIGdhaW4uZGlzY29ubmVjdCgpO1xyXG4gICAgfTtcclxuICAgIHRoaXMuZ2Fpbi5jb25uZWN0KHRoaXMudm9sdW1lKTtcclxuICB9XHJcblxyXG4gIHN0YXJ0KHN0YXJ0VGltZSkge1xyXG4gICAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdGFydChzdGFydFRpbWUpO1xyXG4gIH1cclxuXHJcbiAgc3RvcCh0aW1lKSB7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdG9wKHRpbWUpO1xyXG4gIH1cclxuXHJcbiAga2V5b24odCwgbm90ZSwgdmVsKSB7XHJcbiAgICB0aGlzLnN0YXJ0KHQpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IuZnJlcXVlbmN5LnNldFZhbHVlQXRUaW1lKG1pZGlGcmVxW25vdGVdICogdGhpcy5kZXR1bmUsIHQpO1xyXG4gICAgdGhpcy5rZXlPblRpbWUgPSB0O1xyXG4gICAgdGhpcy5lbnZlbG9wZS5rZXlvbih0LCB2ZWwpO1xyXG4gIH1cclxuXHJcbiAga2V5b2ZmKHQpIHtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0Lyp0aGlzLmtleU9uVGltZSovKTtcclxuICAgIHRoaXMua2V5T2ZmVGltZSA9IHRoaXMuZW52ZWxvcGUua2V5b2ZmKHQpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RvcCh0aGlzLmtleU9mZlRpbWUpO1xyXG4gIH1cclxuXHJcbiAgaXNLZXlPbih0KSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbnZlbG9wZS5rZXlPbiAmJiAodGhpcy5rZXlPblRpbWUgPD0gdCk7XHJcbiAgfVxyXG5cclxuICBpc0tleU9mZih0KSB7XHJcbiAgICByZXR1cm4gIXRoaXMuZW52ZWxvcGUua2V5T24gJiYgKHRoaXMua2V5T2ZmVGltZSA8PSB0KTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBdWRpbyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLlZPSUNFUyA9IDE2O1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQ7XHJcblxyXG4gICAgaWYgKHRoaXMuYXVkaW9Db250ZXh0KSB7XHJcbiAgICAgIHRoaXMuYXVkaW9jdHggPSBuZXcgdGhpcy5hdWRpb0NvbnRleHQoKTtcclxuICAgICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudm9pY2VzID0gW107XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgY3JlYXRlV2F2ZVNhbXBsZUZyb21XYXZlcyh0aGlzLmF1ZGlvY3R4LCBCVUZGRVJfU0laRSk7XHJcbiAgICAgIHRoaXMucGVyaW9kaWNXYXZlcyA9IGNyZWF0ZVBlcmlvZGljV2F2ZUZyb21XYXZlcyh0aGlzLmF1ZGlvY3R4KTtcclxuICAgICAgdGhpcy5maWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgICB0aGlzLmZpbHRlci50eXBlID0gJ2xvd3Bhc3MnO1xyXG4gICAgICB0aGlzLmZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAyMDAwMDtcclxuICAgICAgdGhpcy5maWx0ZXIuUS52YWx1ZSA9IDAuMDAwMTtcclxuICAgICAgdGhpcy5ub2lzZUZpbHRlciA9IHRoaXMuYXVkaW9jdHguY3JlYXRlQmlxdWFkRmlsdGVyKCk7XHJcbiAgICAgIHRoaXMubm9pc2VGaWx0ZXIudHlwZSA9ICdsb3dwYXNzJztcclxuICAgICAgdGhpcy5ub2lzZUZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAxMDAwO1xyXG4gICAgICB0aGlzLm5vaXNlRmlsdGVyLlEudmFsdWUgPSAxLjg7XHJcbiAgICAgIHRoaXMuY29tcCA9IHRoaXMuYXVkaW9jdHguY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKCk7XHJcbiAgICAgIHRoaXMuZmlsdGVyLmNvbm5lY3QodGhpcy5jb21wKTtcclxuICAgICAgdGhpcy5ub2lzZUZpbHRlci5jb25uZWN0KHRoaXMuY29tcCk7XHJcbiAgICAgIHRoaXMuY29tcC5jb25uZWN0KHRoaXMuYXVkaW9jdHguZGVzdGluYXRpb24pO1xyXG4gICAgICAvLyB0aGlzLmZpbHRlci5jb25uZWN0KHRoaXMuYXVkaW9jdHguZGVzdGluYXRpb24pO1xyXG4gICAgICAvLyB0aGlzLm5vaXNlRmlsdGVyLmNvbm5lY3QodGhpcy5hdWRpb2N0eC5kZXN0aW5hdGlvbik7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLlZPSUNFUzsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgLy92YXIgdiA9IG5ldyBPc2NWb2ljZSh0aGlzLmF1ZGlvY3R4LHRoaXMucGVyaW9kaWNXYXZlc1swXSk7XHJcbiAgICAgICAgdmFyIHYgPSBuZXcgVm9pY2UodGhpcy5hdWRpb2N0eCk7XHJcbiAgICAgICAgdGhpcy52b2ljZXMucHVzaCh2KTtcclxuICAgICAgICBpZiAoaSA9PSAodGhpcy5WT0lDRVMgLSAxKSkge1xyXG4gICAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLm5vaXNlRmlsdGVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLmZpbHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucmVhZERydW1TYW1wbGUgPSByZWFkRHJ1bVNhbXBsZSh0aGlzLmF1ZGlvY3R4KTtcclxuICAgICAgLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAvL3RoaXMudm9pY2VzWzBdLm91dHB1dC5jb25uZWN0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdGFydCgpIHtcclxuICAgIC8vIHZhciB2b2ljZXMgPSB0aGlzLnZvaWNlcztcclxuICAgIC8vIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2b2ljZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgIHZvaWNlc1tpXS5zdGFydCgwKTtcclxuICAgIC8vIH1cclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICAvL2lmKHRoaXMuc3RhcnRlZClcclxuICAgIC8ve1xyXG4gICAgdmFyIHZvaWNlcyA9IHRoaXMudm9pY2VzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHZvaWNlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2b2ljZXNbaV0uc3RvcCgwKTtcclxuICAgIH1cclxuICAgIC8vICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIC8vfVxyXG4gIH1cclxuICBcclxuICBnZXRXYXZlU2FtcGxlKG5vKXtcclxuICAgIHJldHVybiB3YXZlU2FtcGxlc1tub107XHJcbiAgfVxyXG59XHJcblxyXG5cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiDjgrfjg7zjgrHjg7PjgrXjg7zjgrPjg57jg7Pjg4kgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuZnVuY3Rpb24gY2FsY1N0ZXAobm90ZUxlbmd0aCkge1xyXG4gIC8vIOmVt+OBleOBi+OCieOCueODhuODg+ODl+OCkuioiOeul+OBmeOCi1xyXG4gIGxldCBwcmV2ID0gbnVsbDtcclxuICBsZXQgZG90dGVkID0gMDtcclxuXHJcbiAgbGV0IG1hcCA9IG5vdGVMZW5ndGgubWFwKChlbGVtKSA9PiB7XHJcbiAgICBzd2l0Y2ggKGVsZW0pIHtcclxuICAgICAgY2FzZSBudWxsOlxyXG4gICAgICAgIGVsZW0gPSBwcmV2O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDA6XHJcbiAgICAgICAgZWxlbSA9IChkb3R0ZWQgKj0gMik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcHJldiA9IGRvdHRlZCA9IGVsZW07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGxlbmd0aCA9IGVsZW0gIT09IG51bGwgPyBlbGVtIDogRGVmYXVsdFBhcmFtcy5sZW5ndGg7XHJcblxyXG4gICAgcmV0dXJuIFRJTUVfQkFTRSAqICg0IC8gbGVuZ3RoKTtcclxuICB9KTtcclxuICByZXR1cm4gbWFwLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTm90ZSB7XHJcbiAgY29uc3RydWN0b3Iobm90ZXMsIGxlbmd0aCkge1xyXG5cclxuICAgIHRoaXMubm90ZXMgPSBub3RlcztcclxuICAgIGlmIChsZW5ndGhbMF0pIHtcclxuICAgICAgdGhpcy5zdGVwID0gY2FsY1N0ZXAobGVuZ3RoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRoaXMubm90ZXMuZm9yRWFjaCgobiwgaSkgPT4ge1xyXG4gICAgICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgICAgIHZhciBub3RlID0gbjtcclxuICAgICAgdmFyIG9jdCA9IHRoaXMub2N0IHx8IGJhY2sub2N0O1xyXG4gICAgICB2YXIgc3RlcCA9IHRoaXMuc3RlcCB8fCBiYWNrLnN0ZXA7XHJcbiAgICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgICAgdmFyIHZlbCA9IHRoaXMudmVsIHx8IGJhY2sudmVsO1xyXG4gICAgICBzZXRRdWV1ZSh0cmFjaywgbm90ZSwgb2N0LCBpID09IDAgPyBzdGVwIDogMCwgZ2F0ZSwgdmVsKTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgU2VxRGF0YSB7XHJcbiAgY29uc3RydWN0b3Iobm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpIHtcclxuICAgIHRoaXMubm90ZSA9IG5vdGU7XHJcbiAgICB0aGlzLm9jdCA9IG9jdDtcclxuICAgIC8vdGhpcy5ubyA9IG5vdGUubm8gKyBvY3QgKiAxMjtcclxuICAgIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLmdhdGUgPSBnYXRlO1xyXG4gICAgdGhpcy52ZWwgPSB2ZWw7XHJcbiAgICB0aGlzLnNhbXBsZSA9IHdhdmVcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcy5ub3RlIHx8IGJhY2subm90ZTtcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLCBub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRRdWV1ZSh0cmFjaywgbm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpIHtcclxuICBsZXQgbm8gPSBub3RlICsgb2N0ICogMTI7XHJcbiAgbGV0IGJhY2sgPSB0cmFjay5iYWNrO1xyXG4gIHZhciBzdGVwX3RpbWUgPSAoc3RlcCA/IHRyYWNrLnBsYXlpbmdUaW1lIDogYmFjay5wbGF5aW5nVGltZSk7XHJcbiAgLy8gdmFyIGdhdGVfdGltZSA9ICgoZ2F0ZSA+PSAwKSA/IGdhdGUgKiA2MCA6IHN0ZXAgKiBnYXRlICogNjAgKiAtMS4wKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKSArIHRyYWNrLnBsYXlpbmdUaW1lO1xyXG5cclxuICB2YXIgZ2F0ZV90aW1lID0gKChzdGVwID09IDAgPyBiYWNrLmNvZGVTdGVwIDogc3RlcCkgKiBnYXRlICogNjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgKHN0ZXAgPyB0cmFjay5wbGF5aW5nVGltZSA6IGJhY2sucGxheWluZ1RpbWUpO1xyXG4gIC8vbGV0IHZvaWNlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdO1xyXG4gIGxldCB2b2ljZSA9IHRyYWNrLmFzc2lnblZvaWNlKHN0ZXBfdGltZSk7XHJcbiAgLy92b2ljZS5yZXNldCgpO1xyXG4gIHZvaWNlLnNhbXBsZSA9IGJhY2suc2FtcGxlO1xyXG4gIHZvaWNlLmVudmVsb3BlLmF0dGFja1RpbWUgPSBiYWNrLmF0dGFjaztcclxuICB2b2ljZS5lbnZlbG9wZS5kZWNheVRpbWUgPSBiYWNrLmRlY2F5O1xyXG4gIHZvaWNlLmVudmVsb3BlLnN1c3RhaW5MZXZlbCA9IGJhY2suc3VzdGFpbjtcclxuICB2b2ljZS5lbnZlbG9wZS5yZWxlYXNlVGltZSA9IGJhY2sucmVsZWFzZTtcclxuICB2b2ljZS5kZXR1bmUgPSBiYWNrLmRldHVuZTtcclxuICB2b2ljZS52b2x1bWUuZ2Fpbi5zZXRWYWx1ZUF0VGltZShiYWNrLnZvbHVtZSwgc3RlcF90aW1lKTtcclxuXHJcbiAgLy92b2ljZS5pbml0UHJvY2Vzc29yKCk7XHJcblxyXG4gIC8vY29uc29sZS5sb2codHJhY2suc2VxdWVuY2VyLnRlbXBvKTtcclxuICB2b2ljZS5rZXlvbihzdGVwX3RpbWUsIG5vLCB2ZWwpO1xyXG4gIHZvaWNlLmtleW9mZihnYXRlX3RpbWUpO1xyXG4gIGlmIChzdGVwKSB7XHJcbiAgICBiYWNrLmNvZGVTdGVwID0gc3RlcDtcclxuICAgIGJhY2sucGxheWluZ1RpbWUgPSB0cmFjay5wbGF5aW5nVGltZTtcclxuICB9XHJcblxyXG4gIHRyYWNrLnBsYXlpbmdUaW1lID0gKHN0ZXAgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbykgKyB0cmFjay5wbGF5aW5nVGltZTtcclxuICAvLyBiYWNrLnZvaWNlID0gdm9pY2U7XHJcbiAgLy8gYmFjay5ub3RlID0gbm90ZTtcclxuICAvLyBiYWNrLm9jdCA9IG9jdDtcclxuICAvLyBiYWNrLmdhdGUgPSBnYXRlO1xyXG4gIC8vIGJhY2sudmVsID0gdmVsO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gUyhub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICBpZiAoUy5sZW5ndGggIT0gYXJncy5sZW5ndGgpIHtcclxuICAgIGlmICh0eXBlb2YgKGFyZ3NbYXJncy5sZW5ndGggLSAxXSkgPT0gJ29iamVjdCcgJiYgIShhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gaW5zdGFuY2VvZiBOb3RlKSkge1xyXG4gICAgICB2YXIgYXJnczEgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XHJcbiAgICAgIHZhciBsID0gYXJncy5sZW5ndGggLSAxO1xyXG4gICAgICByZXR1cm4gbmV3IFNlcURhdGEoXHJcbiAgICAgICAgKChsICE9IDApID8gbm90ZSA6IGZhbHNlKSB8fCBhcmdzMS5ub3RlIHx8IGFyZ3MxLm4gfHwgbnVsbCxcclxuICAgICAgICAoKGwgIT0gMSkgPyBvY3QgOiBmYWxzZSkgfHwgYXJnczEub2N0IHx8IGFyZ3MxLm8gfHwgbnVsbCxcclxuICAgICAgICAoKGwgIT0gMikgPyBzdGVwIDogZmFsc2UpIHx8IGFyZ3MxLnN0ZXAgfHwgYXJnczEucyB8fCBudWxsLFxyXG4gICAgICAgICgobCAhPSAzKSA/IGdhdGUgOiBmYWxzZSkgfHwgYXJnczEuZ2F0ZSB8fCBhcmdzMS5nIHx8IG51bGwsXHJcbiAgICAgICAgKChsICE9IDQpID8gdmVsIDogZmFsc2UpIHx8IGFyZ3MxLnZlbCB8fCBhcmdzMS52IHx8IG51bGxcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG5ldyBTZXFEYXRhKG5vdGUgfHwgbnVsbCwgb2N0IHx8IG51bGwsIHN0ZXAgfHwgbnVsbCwgZ2F0ZSB8fCBudWxsLCB2ZWwgfHwgbnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMxKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKHN0ZXApLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMihub3RlLCBsZW4sIGRvdCwgb2N0LCBnYXRlLCB2ZWwpIHtcclxuICByZXR1cm4gUyhub3RlLCBvY3QsIGwobGVuLCBkb3QpLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMyhub3RlLCBzdGVwLCBnYXRlLCB2ZWwsIG9jdCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuXHJcbi8vLyDpn7PnrKbjga7plbfjgZXmjIflrppcclxuXHJcbmNsYXNzIExlbmd0aCB7XHJcbiAgY29uc3RydWN0b3IobGVuKSB7XHJcbiAgICB0aGlzLnN0ZXAgPSBjYWxjU3RlcChsZW4pO1xyXG4gIH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBTdGVwIHtcclxuICBjb25zdHJ1Y3RvcihzdGVwKSB7XHJcbiAgICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG4gIH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Ky44O844OI44K/44Kk44Og5oyH5a6aXHJcblxyXG5jbGFzcyBHYXRlVGltZSB7XHJcbiAgY29uc3RydWN0b3IoZ2F0ZSkge1xyXG4gICAgdGhpcy5nYXRlID0gZ2F0ZSAvIDEwMDtcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRyYWNrLmJhY2suZ2F0ZSA9IHRoaXMuZ2F0ZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg5njg63jgrfjg4bjgqPmjIflrppcclxuXHJcbmNsYXNzIFZlbG9jaXR5IHtcclxuICBjb25zdHJ1Y3Rvcih2ZWwpIHtcclxuICAgIHRoaXMudmVsID0gdmVsIC8gMTAwO1xyXG4gIH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLnZlbCA9IHRoaXMudmVsO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOmfs+iJsuioreWumlxyXG5jbGFzcyBUb25lIHtcclxuICBjb25zdHJ1Y3Rvcihubykge1xyXG4gICAgdGhpcy5ubyA9IG5vO1xyXG4gICAgLy90aGlzLnNhbXBsZSA9IHdhdmVTYW1wbGVzW3RoaXMubm9dO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgLy8gICAgdHJhY2suYmFjay5zYW1wbGUgPSB0cmFjay5hdWRpby5wZXJpb2RpY1dhdmVzW3RoaXMubm9dO1xyXG4gICAgdHJhY2suYmFjay5zYW1wbGUgPSB3YXZlU2FtcGxlc1t0aGlzLm5vXTtcclxuICAgIC8vICAgIHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXS5zZXRTYW1wbGUod2F2ZVNhbXBsZXNbdGhpcy5ub10pO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgUmVzdCB7XHJcbiAgY29uc3RydWN0b3IobGVuZ3RoKSB7XHJcbiAgICB0aGlzLnN0ZXAgPSBjYWxjU3RlcChsZW5ndGgpO1xyXG4gIH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB2YXIgc3RlcCA9IHRoaXMuc3RlcCB8fCB0cmFjay5iYWNrLnN0ZXA7XHJcbiAgICB0cmFjay5wbGF5aW5nVGltZSA9IHRyYWNrLnBsYXlpbmdUaW1lICsgKHRoaXMuc3RlcCAqIDYwKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKTtcclxuICAgIC8vdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgT2N0YXZlIHtcclxuICBjb25zdHJ1Y3RvcihvY3QpIHtcclxuICAgIHRoaXMub2N0ID0gb2N0O1xyXG4gIH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLm9jdCA9IHRoaXMub2N0O1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmNsYXNzIE9jdGF2ZVVwIHtcclxuICBjb25zdHJ1Y3Rvcih2KSB7IHRoaXMudiA9IHY7IH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLm9jdCArPSB0aGlzLnY7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBPY3RhdmVEb3duIHtcclxuICBjb25zdHJ1Y3Rvcih2KSB7IHRoaXMudiA9IHY7IH1cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5iYWNrLm9jdCAtPSB0aGlzLnY7XHJcbiAgfVxyXG59XHJcbmNsYXNzIFRlbXBvIHtcclxuICBjb25zdHJ1Y3Rvcih0ZW1wbykge1xyXG4gICAgdGhpcy50ZW1wbyA9IHRlbXBvO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdHJhY2subG9jYWxUZW1wbyA9IHRoaXMudGVtcG87XHJcbiAgICAvL3RyYWNrLnNlcXVlbmNlci50ZW1wbyA9IHRoaXMudGVtcG87XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBFbnZlbG9wZSB7XHJcbiAgY29uc3RydWN0b3IoYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSkge1xyXG4gICAgdGhpcy5hdHRhY2sgPSBhdHRhY2s7XHJcbiAgICB0aGlzLmRlY2F5ID0gZGVjYXk7XHJcbiAgICB0aGlzLnN1c3RhaW4gPSBzdXN0YWluO1xyXG4gICAgdGhpcy5yZWxlYXNlID0gcmVsZWFzZTtcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIC8vdmFyIGVudmVsb3BlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLmVudmVsb3BlO1xyXG4gICAgdHJhY2suYmFjay5hdHRhY2sgPSB0aGlzLmF0dGFjaztcclxuICAgIHRyYWNrLmJhY2suZGVjYXkgPSB0aGlzLmRlY2F5O1xyXG4gICAgdHJhY2suYmFjay5zdXN0YWluID0gdGhpcy5zdXN0YWluO1xyXG4gICAgdHJhY2suYmFjay5yZWxlYXNlID0gdGhpcy5yZWxlYXNlO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODh+ODgeODpeODvOODs1xyXG5jbGFzcyBEZXR1bmUge1xyXG4gIGNvbnN0cnVjdG9yKGRldHVuZSkge1xyXG4gICAgdGhpcy5kZXR1bmUgPSBkZXR1bmU7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICAvL3ZhciB2b2ljZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXTtcclxuICAgIHRyYWNrLmJhY2suZGV0dW5lID0gdGhpcy5kZXR1bmU7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBWb2x1bWUge1xyXG4gIGNvbnN0cnVjdG9yKHZvbHVtZSkge1xyXG4gICAgdGhpcy52b2x1bWUgPSB2b2x1bWUgLyAxMDAuMDtcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIC8vIFxyXG4gICAgdHJhY2suYmFjay52b2x1bWUgPSB0aGlzLnZvbHVtZTtcclxuICAgIC8vIHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXS52b2x1bWUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLnZvbHVtZSwgdHJhY2sucGxheWluZ1RpbWUpO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgTG9vcERhdGEge1xyXG4gIGNvbnN0cnVjdG9yKG9iaiwgdmFybmFtZSwgY291bnQsIHNlcVBvcykge1xyXG4gICAgdGhpcy52YXJuYW1lID0gdmFybmFtZTtcclxuICAgIHRoaXMuY291bnQgPSBjb3VudCB8fCBEZWZhdWx0UGFyYW1zLmxvb3BDb3VudDtcclxuICAgIHRoaXMub2JqID0gb2JqO1xyXG4gICAgdGhpcy5zZXFQb3MgPSBzZXFQb3M7XHJcbiAgICB0aGlzLm91dFNlcVBvcyA9IC0xO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdmFyIHN0YWNrID0gdHJhY2suc3RhY2s7XHJcbiAgICBpZiAoc3RhY2subGVuZ3RoID09IDAgfHwgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0ub2JqICE9PSB0aGlzKSB7XHJcbiAgICAgIHZhciBsZCA9IHRoaXM7XHJcbiAgICAgIHN0YWNrLnB1c2gobmV3IExvb3BEYXRhKHRoaXMsIGxkLnZhcm5hbWUsIGxkLmNvdW50LCB0cmFjay5zZXFQb3MpKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIExvb3BFbmQge1xyXG4gIGNvbnN0cnVjdG9yKHNlcVBvcykge1xyXG4gICAgdGhpcy5zZXFQb3MgPSBzZXFQb3M7XHJcbiAgfVxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHZhciBsZCA9IHRyYWNrLnN0YWNrW3RyYWNrLnN0YWNrLmxlbmd0aCAtIDFdO1xyXG4gICAgaWYgKGxkLm91dFNlcVBvcyA9PSAtMSkgbGQub3V0U2VxUG9zID0gdGhpcy5zZXFQb3M7XHJcbiAgICBsZC5jb3VudC0tO1xyXG4gICAgaWYgKGxkLmNvdW50ID4gMCkge1xyXG4gICAgICB0cmFjay5zZXFQb3MgPSBsZC5zZXFQb3M7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0cmFjay5zdGFjay5wb3AoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIExvb3BFeGl0IHtcclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB2YXIgbGQgPSB0cmFjay5zdGFja1t0cmFjay5zdGFjay5sZW5ndGggLSAxXTtcclxuICAgIGlmIChsZC5jb3VudCA8PSAxICYmIGxkLm91dFNlcVBvcyAhPSAtMSkge1xyXG4gICAgICB0cmFjay5zZXFQb3MgPSBsZC5vdXRTZXFQb3M7XHJcbiAgICAgIHRyYWNrLnN0YWNrLnBvcCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgSW5maW5pdGVMb29wIHtcclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5pbmZpbml0TG9vcEluZGV4ID0gdHJhY2suc2VxUG9zO1xyXG4gIH1cclxufVxyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8vIOOCt+ODvOOCseODs+OCteODvOODiOODqeODg+OCr1xyXG5jbGFzcyBUcmFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2VxdWVuY2VyLCBzZXFkYXRhLCBhdWRpbykge1xyXG4gICAgdGhpcy5uYW1lID0gJyc7XHJcbiAgICB0aGlzLmVuZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5vbmVzaG90ID0gZmFsc2U7XHJcbiAgICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICAgIHRoaXMuc2VxRGF0YSA9IHNlcWRhdGE7XHJcbiAgICB0aGlzLnNlcVBvcyA9IDA7XHJcbiAgICB0aGlzLm11dGUgPSBmYWxzZTtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAtMTtcclxuICAgIHRoaXMubG9jYWxUZW1wbyA9IHNlcXVlbmNlci50ZW1wbztcclxuICAgIHRoaXMudHJhY2tWb2x1bWUgPSAxLjA7XHJcbiAgICB0aGlzLnRyYW5zcG9zZSA9IDA7XHJcbiAgICB0aGlzLnNvbG8gPSBmYWxzZTtcclxuICAgIHRoaXMuY2hhbm5lbCA9IC0xO1xyXG4gICAgdGhpcy50cmFjayA9IC0xO1xyXG4gICAgdGhpcy5hdWRpbyA9IGF1ZGlvO1xyXG4gICAgdGhpcy5pbmZpbml0TG9vcEluZGV4ID0gLTE7XHJcbiAgICB0aGlzLmJhY2sgPSB7XHJcbiAgICAgIG5vdGU6IDcyLFxyXG4gICAgICBvY3Q6IDUsXHJcbiAgICAgIHN0ZXA6IDk2LFxyXG4gICAgICBnYXRlOiAwLjUsXHJcbiAgICAgIHZlbDogMS4wLFxyXG4gICAgICBhdHRhY2s6IDAuMDEsXHJcbiAgICAgIGRlY2F5OiAwLjA1LFxyXG4gICAgICBzdXN0YWluOiAwLjYsXHJcbiAgICAgIHJlbGVhc2U6IDAuMDcsXHJcbiAgICAgIGRldHVuZTogMS4wLFxyXG4gICAgICB2b2x1bWU6IDAuNSxcclxuICAgICAgLy8gICAgICBzYW1wbGU6YXVkaW8ucGVyaW9kaWNXYXZlc1swXVxyXG4gICAgICBzYW1wbGU6IHdhdmVTYW1wbGVzWzBdXHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YWNrID0gW107XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKGN1cnJlbnRUaW1lKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZW5kKSByZXR1cm47XHJcblxyXG4gICAgaWYgKHRoaXMub25lc2hvdCkge1xyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlcVNpemUgPSB0aGlzLnNlcURhdGEubGVuZ3RoO1xyXG4gICAgaWYgKHRoaXMuc2VxUG9zID49IHNlcVNpemUpIHtcclxuICAgICAgaWYgKHRoaXMuc2VxdWVuY2VyLnJlcGVhdCkge1xyXG4gICAgICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLmluZmluaXRMb29wSW5kZXggPj0gMCkge1xyXG4gICAgICAgIHRoaXMuc2VxUG9zID0gdGhpcy5pbmZpbml0TG9vcEluZGV4O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZW5kID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VxID0gdGhpcy5zZXFEYXRhO1xyXG4gICAgdGhpcy5wbGF5aW5nVGltZSA9ICh0aGlzLnBsYXlpbmdUaW1lID4gLTEpID8gdGhpcy5wbGF5aW5nVGltZSA6IGN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIGVuZFRpbWUgPSBjdXJyZW50VGltZSArIDAuMi8qc2VjKi87XHJcblxyXG4gICAgd2hpbGUgKHRoaXMuc2VxUG9zIDwgc2VxU2l6ZSkge1xyXG4gICAgICBpZiAodGhpcy5wbGF5aW5nVGltZSA+PSBlbmRUaW1lICYmICF0aGlzLm9uZXNob3QpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgZCA9IHNlcVt0aGlzLnNlcVBvc107XHJcbiAgICAgICAgZC5wcm9jZXNzKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2VxUG9zKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgLy8gdmFyIGN1clZvaWNlID0gdGhpcy5hdWRpby52b2ljZXNbdGhpcy5jaGFubmVsXTtcclxuICAgIC8vIGN1clZvaWNlLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICAvLyBjdXJWb2ljZS5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIC8vIGN1clZvaWNlLmdhaW4uZ2Fpbi52YWx1ZSA9IDA7XHJcbiAgICB0aGlzLnBsYXlpbmdUaW1lID0gLTE7XHJcbiAgICB0aGlzLnNlcVBvcyA9IDA7XHJcbiAgICB0aGlzLmluZmluaXRMb29wSW5kZXggPSAtMTtcclxuICAgIHRoaXMuZW5kID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0YWNrLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG5cclxuICBhc3NpZ25Wb2ljZSh0KSB7XHJcbiAgICBsZXQgcmV0ID0gbnVsbDtcclxuICAgIHRoaXMuYXVkaW8udm9pY2VzLnNvbWUoKGQsIGkpID0+IHtcclxuICAgICAgaWYgKGQuaXNLZXlPZmYodCkpIHtcclxuICAgICAgICByZXQgPSBkO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgaWYgKCFyZXQpIHtcclxuICAgICAgbGV0IG9sZGVzdEtleU9uRGF0YSA9ICh0aGlzLmF1ZGlvLnZvaWNlcy5tYXAoKGQsIGkpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0aW1lOiBkLmVudmVsb3BlLmtleU9uVGltZSwgZCwgaSB9O1xyXG4gICAgICB9KS5zb3J0KChhLCBiKSA9PiBhLnRpbWUgLSBiLnRpbWUpKVswXTtcclxuICAgICAgcmV0ID0gb2xkZXN0S2V5T25EYXRhLmQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRUcmFja3Moc2VsZiwgdHJhY2tzLCB0cmFja2RhdGEpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYWNrZGF0YS5sZW5ndGg7ICsraSkge1xyXG4gICAgdmFyIHRyYWNrID0gbmV3IFRyYWNrKHNlbGYsIHRyYWNrZGF0YVtpXS5kYXRhLCBzZWxmLmF1ZGlvKTtcclxuICAgIHRyYWNrLmNoYW5uZWwgPSB0cmFja2RhdGFbaV0uY2hhbm5lbDtcclxuICAgIHRyYWNrLm9uZXNob3QgPSAoIXRyYWNrZGF0YVtpXS5vbmVzaG90KSA/IGZhbHNlIDogdHJ1ZTtcclxuICAgIHRyYWNrLnRyYWNrID0gaTtcclxuICAgIHRyYWNrcy5wdXNoKHRyYWNrKTtcclxuICB9XHJcbiAgcmV0dXJuIHRyYWNrcztcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlVHJhY2tzKHRyYWNrZGF0YSkge1xyXG4gIHZhciB0cmFja3MgPSBbXTtcclxuICBsb2FkVHJhY2tzKHRoaXMsIHRyYWNrcywgdHJhY2tkYXRhLnRyYWNrcyk7XHJcbiAgcmV0dXJuIHRyYWNrcztcclxufVxyXG5cclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8g44K344O844Kx44Oz44K144O85pys5L2TIFxyXG5leHBvcnQgY2xhc3MgU2VxdWVuY2VyIHtcclxuICBjb25zdHJ1Y3RvcihhdWRpbykge1xyXG4gICAgdGhpcy5TVE9QID0gMCB8IDA7XHJcbiAgICB0aGlzLlBMQVkgPSAxIHwgMDtcclxuICAgIHRoaXMuUEFVU0UgPSAyIHwgMDtcclxuXHJcbiAgICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgICB0aGlzLnRlbXBvID0gMTAwLjA7XHJcbiAgICB0aGlzLnJlcGVhdCA9IGZhbHNlO1xyXG4gICAgdGhpcy5wbGF5ID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYWNrcyA9IFtdO1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgfVxyXG4gIGxvYWQoZGF0YSkge1xyXG4gICAgcGFyc2VNTUwoZGF0YSk7XHJcbiAgICBpZiAodGhpcy5wbGF5KSB7XHJcbiAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy50cmFja3MubGVuZ3RoID0gMDtcclxuICAgIGxvYWRUcmFja3ModGhpcywgdGhpcy50cmFja3MsIGRhdGEudHJhY2tzKTtcclxuICB9XHJcbiAgc3RhcnQoKSB7XHJcbiAgICAvLyAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgc2VsZi5wcm9jZXNzKCkgfSwgNTApO1xyXG4gICAgdGhpcy5hdWRpby5yZWFkRHJ1bVNhbXBsZVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBMQVk7XHJcbiAgICAgICAgdGhpcy5wcm9jZXNzKCk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuICBwcm9jZXNzKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuUExBWSkge1xyXG4gICAgICB0aGlzLnBsYXlUcmFja3ModGhpcy50cmFja3MpO1xyXG4gICAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgfVxyXG4gIH1cclxuICBwbGF5VHJhY2tzKHRyYWNrcykge1xyXG4gICAgdmFyIGN1cnJlbnRUaW1lID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICAgIC8vICAgY29uc29sZS5sb2codGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZSk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdHJhY2tzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHRyYWNrc1tpXS5wcm9jZXNzKGN1cnJlbnRUaW1lKTtcclxuICAgIH1cclxuICB9XHJcbiAgcGF1c2UoKSB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUEFVU0U7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IHRoaXMuYXVkaW8uYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgfVxyXG4gIHJlc3VtZSgpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlBBVVNFKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QTEFZO1xyXG4gICAgICB2YXIgdHJhY2tzID0gdGhpcy50cmFja3M7XHJcbiAgICAgIHZhciBhZGp1c3QgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICB0cmFja3NbaV0ucGxheWluZ1RpbWUgKz0gYWRqdXN0O1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvY2VzcygpO1xyXG4gICAgfVxyXG4gIH1cclxuICBzdG9wKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuU1RPUCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5oYW5kbGUpO1xyXG4gICAgICAvLyAgICBjbGVhckludGVydmFsKHRoaXMuaGFuZGxlKTtcclxuICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmVzZXQoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy50cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdGhpcy50cmFja3NbaV0ucmVzZXQoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlTU1MKGRhdGEpIHtcclxuICBkYXRhLnRyYWNrcy5mb3JFYWNoKChkKSA9PiB7XHJcbiAgICBkLmRhdGEgPSBwYXJzZU1NTF8oZC5tbWwpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZU1NTF8obW1sKSB7XHJcbiAgbGV0IHBhcnNlciA9IG5ldyBNTUxQYXJzZXIobW1sKTtcclxuICBsZXQgY29tbWFuZHMgPSBwYXJzZXIucGFyc2UoKTtcclxuICBsZXQgc2VxQXJyYXkgPSBbXTtcclxuICBjb21tYW5kcy5mb3JFYWNoKChjb21tYW5kKSA9PiB7XHJcbiAgICBzd2l0Y2ggKGNvbW1hbmQudHlwZSkge1xyXG4gICAgICBjYXNlIFN5bnRheC5Ob3RlOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IE5vdGUoY29tbWFuZC5ub3RlTnVtYmVycywgY29tbWFuZC5ub3RlTGVuZ3RoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4LlJlc3Q6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgUmVzdChjb21tYW5kLm5vdGVMZW5ndGgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguT2N0YXZlOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IE9jdGF2ZShjb21tYW5kLnZhbHVlKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4Lk9jdGF2ZVNoaWZ0OlxyXG4gICAgICAgIGlmIChjb21tYW5kLmRpcmVjdGlvbiA+PSAwKSB7XHJcbiAgICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBPY3RhdmVVcCgxKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNlcUFycmF5LnB1c2gobmV3IE9jdGF2ZURvd24oMSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguTm90ZUxlbmd0aDpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBMZW5ndGgoY29tbWFuZC5ub3RlTGVuZ3RoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4Lk5vdGVWZWxvY2l0eTpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBWZWxvY2l0eShjb21tYW5kLnZhbHVlKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4LlRlbXBvOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IFRlbXBvKGNvbW1hbmQudmFsdWUpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguTm90ZVF1YW50aXplOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IEdhdGVUaW1lKGNvbW1hbmQudmFsdWUpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguSW5maW5pdGVMb29wOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IEluZmluaXRlTG9vcCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguTG9vcEJlZ2luOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IExvb3BEYXRhKG51bGwsICcnLCBjb21tYW5kLnZhbHVlLCBudWxsKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4Lkxvb3BFeGl0OlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IExvb3BFeGl0KCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5Mb29wRW5kOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IExvb3BFbmQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4LlRvbmU6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgVG9uZShjb21tYW5kLnZhbHVlKSk7XHJcbiAgICAgIGNhc2UgU3ludGF4LldhdmVGb3JtOlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5FbnZlbG9wZTpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBFbnZlbG9wZShjb21tYW5kLmEsIGNvbW1hbmQuZCwgY29tbWFuZC5zLCBjb21tYW5kLnIpKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9KTtcclxuICByZXR1cm4gc2VxQXJyYXk7XHJcbn1cclxuXHJcbi8vIGV4cG9ydCB2YXIgc2VxRGF0YSA9IHtcclxuLy8gICBuYW1lOiAnVGVzdCcsXHJcbi8vICAgdHJhY2tzOiBbXHJcbi8vICAgICB7XHJcbi8vICAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbi8vICAgICAgIGNoYW5uZWw6IDAsXHJcbi8vICAgICAgIGRhdGE6XHJcbi8vICAgICAgIFtcclxuLy8gICAgICAgICBFTlYoMC4wMSwgMC4wMiwgMC41LCAwLjA3KSxcclxuLy8gICAgICAgICBURU1QTygxODApLCBUT05FKDApLCBWT0xVTUUoMC41KSwgTCg4KSwgR1QoLTAuNSksTyg0KSxcclxuLy8gICAgICAgICBMT09QKCdpJyw0KSxcclxuLy8gICAgICAgICBDLCBDLCBDLCBDLCBDLCBDLCBDLCBDLFxyXG4vLyAgICAgICAgIExPT1BfRU5ELFxyXG4vLyAgICAgICAgIEpVTVAoNSlcclxuLy8gICAgICAgXVxyXG4vLyAgICAgfSxcclxuLy8gICAgIHtcclxuLy8gICAgICAgbmFtZTogJ3BhcnQyJyxcclxuLy8gICAgICAgY2hhbm5lbDogMSxcclxuLy8gICAgICAgZGF0YTpcclxuLy8gICAgICAgICBbXHJcbi8vICAgICAgICAgRU5WKDAuMDEsIDAuMDUsIDAuNiwgMC4wNyksXHJcbi8vICAgICAgICAgVEVNUE8oMTgwKSxUT05FKDYpLCBWT0xVTUUoMC4yKSwgTCg4KSwgR1QoLTAuOCksXHJcbi8vICAgICAgICAgUigxKSwgUigxKSxcclxuLy8gICAgICAgICBPKDYpLEwoMSksIEYsXHJcbi8vICAgICAgICAgRSxcclxuLy8gICAgICAgICBPRCwgTCg4LCB0cnVlKSwgQmIsIEcsIEwoNCksIEJiLCBPVSwgTCg0KSwgRiwgTCg4KSwgRCxcclxuLy8gICAgICAgICBMKDQsIHRydWUpLCBFLCBMKDIpLCBDLFIoOCksXHJcbi8vICAgICAgICAgSlVNUCg4KVxyXG4vLyAgICAgICAgIF1cclxuLy8gICAgIH0sXHJcbi8vICAgICB7XHJcbi8vICAgICAgIG5hbWU6ICdwYXJ0MycsXHJcbi8vICAgICAgIGNoYW5uZWw6IDIsXHJcbi8vICAgICAgIGRhdGE6XHJcbi8vICAgICAgICAgW1xyXG4vLyAgICAgICAgIEVOVigwLjAxLCAwLjA1LCAwLjYsIDAuMDcpLFxyXG4vLyAgICAgICAgIFRFTVBPKDE4MCksVE9ORSg2KSwgVk9MVU1FKDAuMSksIEwoOCksIEdUKC0wLjUpLCBcclxuLy8gICAgICAgICBSKDEpLCBSKDEpLFxyXG4vLyAgICAgICAgIE8oNiksTCgxKSwgQyxDLFxyXG4vLyAgICAgICAgIE9ELCBMKDgsIHRydWUpLCBHLCBELCBMKDQpLCBHLCBPVSwgTCg0KSwgRCwgTCg4KSxPRCwgRyxcclxuLy8gICAgICAgICBMKDQsIHRydWUpLCBPVSxDLCBMKDIpLE9ELCBHLCBSKDgpLFxyXG4vLyAgICAgICAgIEpVTVAoNylcclxuLy8gICAgICAgICBdXHJcbi8vICAgICB9XHJcbi8vICAgXVxyXG4vLyB9XHJcblxyXG5leHBvcnQgY2xhc3MgU291bmRFZmZlY3RzIHtcclxuICBjb25zdHJ1Y3RvcihzZXF1ZW5jZXIsZGF0YSl7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IFtdO1xyXG4gICAgZGF0YS5mb3JFYWNoKChkKT0+e1xyXG4gICAgICB2YXIgdHJhY2tzID0gW107XHJcbiAgICAgIHBhcnNlTU1MKGQpO1xyXG4gICAgICB0aGlzLnNvdW5kRWZmZWN0cy5wdXNoKGxvYWRUcmFja3Moc2VxdWVuY2VyLCB0cmFja3MsIGQudHJhY2tzKSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBTb3VuZEVmZmVjdHMoc2VxdWVuY2VyKSB7XHJcbi8vICAgIHRoaXMuc291bmRFZmZlY3RzID1cclxuLy8gICAgIFtcclxuLy8gICAgIC8vIEVmZmVjdCAwIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLyAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFtcclxuLy8gICAgIHtcclxuLy8gICAgICAgY2hhbm5lbDogOCxcclxuLy8gICAgICAgb25lc2hvdDp0cnVlLFxyXG4vLyAgICAgICBkYXRhOiBbVk9MVU1FKDAuNSksXHJcbi8vICAgICAgICAgRU5WKDAuMDAwMSwgMC4wMSwgMS4wLCAwLjAwMDEpLEdUKC0wLjk5OSksVE9ORSgwKSwgVEVNUE8oMjAwKSwgTyg4KSxTVCgzKSwgQywgRCwgRSwgRiwgRywgQSwgQiwgT1UsIEMsIEQsIEUsIEcsIEEsIEIsQixCLEJcclxuLy8gICAgICAgXVxyXG4vLyAgICAgfSxcclxuLy8gICAgIHtcclxuLy8gICAgICAgY2hhbm5lbDogOSxcclxuLy8gICAgICAgb25lc2hvdDogdHJ1ZSxcclxuLy8gICAgICAgZGF0YTogW1ZPTFVNRSgwLjUpLFxyXG4vLyAgICAgICAgIEVOVigwLjAwMDEsIDAuMDEsIDEuMCwgMC4wMDAxKSwgREVUVU5FKDAuOSksIEdUKC0wLjk5OSksIFRPTkUoMCksIFRFTVBPKDIwMCksIE8oNSksIFNUKDMpLCBDLCBELCBFLCBGLCBHLCBBLCBCLCBPVSwgQywgRCwgRSwgRywgQSwgQixCLEIsQlxyXG4vLyAgICAgICBdXHJcbi8vICAgICB9XHJcbi8vICAgICBdKSxcclxuLy8gICAgIC8vIEVmZmVjdCAxIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8gICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuLy8gICAgICAgW1xyXG4vLyAgICAgICAgIHtcclxuLy8gICAgICAgICAgIGNoYW5uZWw6IDEwLFxyXG4vLyAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuLy8gICAgICAgICAgIGRhdGE6IFtcclxuLy8gICAgICAgICAgICBUT05FKDQpLCBURU1QTygxNTApLCBTVCg0KSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjAwMDEpLFxyXG4vLyAgICAgICAgICAgIE8oNiksIEcsIEEsIEIsIE8oNyksIEIsIEEsIEcsIEYsIEUsIEQsIEMsIEUsIEcsIEEsIEIsIE9ELCBCLCBBLCBHLCBGLCBFLCBELCBDLCBPRCwgQiwgQSwgRywgRiwgRSwgRCwgQ1xyXG4vLyAgICAgICAgICAgXVxyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgXSksXHJcbi8vICAgICAvLyBFZmZlY3QgMi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbi8vICAgICAgIFtcclxuLy8gICAgICAgICB7XHJcbi8vICAgICAgICAgICBjaGFubmVsOiAxMCxcclxuLy8gICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbi8vICAgICAgICAgICBkYXRhOiBbXHJcbi8vICAgICAgICAgICAgVE9ORSgwKSwgVEVNUE8oMTUwKSwgU1QoMiksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuLy8gICAgICAgICAgICBPKDgpLCBDLEQsRSxGLEcsQSxCLE9VLEMsRCxFLEYsT0QsRyxPVSxBLE9ELEIsT1UsQSxPRCxHLE9VLEYsT0QsRSxPVSxFXHJcbi8vICAgICAgICAgICBdXHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgICBdKSxcclxuLy8gICAgICAgLy8gRWZmZWN0IDMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vICAgICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuLy8gICAgICAgICBbXHJcbi8vICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgIGNoYW5uZWw6IDEwLFxyXG4vLyAgICAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4vLyAgICAgICAgICAgICBkYXRhOiBbXHJcbi8vICAgICAgICAgICAgICBUT05FKDUpLCBURU1QTygxNTApLCBMKDY0KSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjAwMDEpLFxyXG4vLyAgICAgICAgICAgICAgTyg2KSxDLE9ELEMsT1UsQyxPRCxDLE9VLEMsT0QsQyxPVSxDLE9EXHJcbi8vICAgICAgICAgICAgIF1cclxuLy8gICAgICAgICAgIH1cclxuLy8gICAgICAgICBdKSxcclxuLy8gICAgICAgLy8gRWZmZWN0IDQgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLyAgICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbi8vICAgICAgICAgW1xyXG4vLyAgICAgICAgICAge1xyXG4vLyAgICAgICAgICAgICBjaGFubmVsOiAxMSxcclxuLy8gICAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuLy8gICAgICAgICAgICAgZGF0YTogW1xyXG4vLyAgICAgICAgICAgICAgVE9ORSg4KSwgVk9MVU1FKDIuMCksVEVNUE8oMTIwKSwgTCgyKSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjI1KSxcclxuLy8gICAgICAgICAgICAgIE8oMSksIENcclxuLy8gICAgICAgICAgICAgXVxyXG4vLyAgICAgICAgICAgfVxyXG4vLyAgICAgICAgIF0pXHJcbi8vICAgIF07XHJcbi8vICB9XHJcblxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcblxyXG4vLy8g44OG44Kv44K544OB44Oj44O844Go44GX44GmY2FudmFz44KS5L2/44GG5aC05ZCI44Gu44OY44Or44OR44O8XHJcbmV4cG9ydCBmdW5jdGlvbiBDYW52YXNUZXh0dXJlKHdpZHRoLCBoZWlnaHQpIHtcclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGggfHwgc2ZnLlZJUlRVQUxfV0lEVEg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5jYW52YXMpO1xyXG4gIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLCB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjAwMTtcclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbn1cclxuXHJcbi8vLyDjg5fjg63jgrDjg6zjgrnjg5Djg7zooajnpLrjgq/jg6njgrlcclxuZXhwb3J0IGZ1bmN0aW9uIFByb2dyZXNzKCkge1xyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7O1xyXG4gIHZhciB3aWR0aCA9IDE7XHJcbiAgd2hpbGUgKHdpZHRoIDw9IHNmZy5WSVJUVUFMX1dJRFRIKXtcclxuICAgIHdpZHRoICo9IDI7XHJcbiAgfVxyXG4gIHZhciBoZWlnaHQgPSAxO1xyXG4gIHdoaWxlIChoZWlnaHQgPD0gc2ZnLlZJUlRVQUxfSEVJR0hUKXtcclxuICAgIGhlaWdodCAqPSAyO1xyXG4gIH1cclxuICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5jYW52YXMpO1xyXG4gIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgLy8g44K544Og44O844K444Oz44Kw44KS5YiH44KLXHJcbiAgdGhpcy5jdHgubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAvL3RoaXMuY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4vLyAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4vLyAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy5BQ1RVQUxfV0lEVEggKiB3aWR0aCAvIHNmZy5WSVJUVUFMX1dJRFRIICwgc2ZnLkFDVFVBTF9IRUlHSFQgKiAgaGVpZ2h0IC8gc2ZnLlZJUlRVQUxfSEVJR0hUICk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgLy8gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAod2lkdGggLSBzZmcuVklSVFVBTF9XSURUSCkgLyAyO1xyXG4gIC8vIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gIC0gKGhlaWdodCAtIHNmZy5WSVJUVUFMX0hFSUdIVCkgLyAyO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gKHNmZy5BQ1RVQUxfV0lEVEggKiB3aWR0aCAvIHNmZy5WSVJUVUFMX1dJRFRIIC0gc2ZnLkFDVFVBTF9XSURUSCkgLyAyO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gLSAoc2ZnLkFDVFVBTF9IRUlHSFQgKiBoZWlnaHQgLyBzZmcuVklSVFVBTF9IRUlHSFQgLSBzZmcuQUNUVUFMX0hFSUdIVCkgLyAyO1xyXG4gIHRoaXMucGVyY2VudCA9IDA7XHJcblxyXG4gIC8vdGhpcy50ZXh0dXJlLnByZW11bHRpcGx5QWxwaGEgPSB0cnVlO1xyXG59XHJcblxyXG4vLy8g44OX44Ot44Kw44Os44K544OQ44O844KS6KGo56S644GZ44KL44CCXHJcblByb2dyZXNzLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAobWVzc2FnZSwgcGVyY2VudCkge1xyXG4gIHBlcmNlbnQgPSBwZXJjZW50ID4gMTAwID8gMTAwOnBlcmNlbnQ7XHJcbiAgdGhpcy5wZXJjZW50ID0gcGVyY2VudDtcclxuICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgdmFyIHdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgsIGhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodDtcclxuICAvLyAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLDAsMCwwKSc7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB2YXIgdGV4dFdpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KG1lc3NhZ2UpLndpZHRoO1xyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwxLjApJztcclxuXHJcbiAgY3R4LmZpbGxUZXh0KG1lc3NhZ2UsICh3aWR0aCAtIHRleHRXaWR0aCkgLyAyLCAxMDApO1xyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgucmVjdCgyMCwgNzUsIHdpZHRoIC0gMjAgKiAyLCAxMCk7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG4gIGN0eC5maWxsUmVjdCgyMCwgNzUsICh3aWR0aCAtIDIwICogMikgKiBwZXJjZW50IC8gMTAwLCAxMCk7XHJcbiAgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxufVxyXG5cclxuLy8vIGltZ+OBi+OCieOCuOOCquODoeODiOODquOCkuS9nOaIkOOBmeOCi1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR2VvbWV0cnlGcm9tSW1hZ2UoaW1hZ2UpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHcgPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG4gIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3LCBoKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuICB7XHJcbiAgICB2YXIgaSA9IDA7XHJcblxyXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoOyArK3kpIHtcclxuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3OyArK3gpIHtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcclxuXHJcbiAgICAgICAgdmFyIHIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgc2ZnID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYSA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIGlmIChhICE9IDApIHtcclxuICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIHNmZyAvIDI1NS4wLCBiIC8gMjU1LjApO1xyXG4gICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSkgKiAyLjAsICgoeSAtIGggLyAyKSkgKiAtMi4wLCAwLjApO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCh2ZXJ0KTtcclxuICAgICAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVHZW9tZXRyeShzaXplKVxyXG57XHJcbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcbiAgdmFyIHNpemVIYWxmID0gc2l6ZSAvIDI7XHJcbiAgLy8gZ2VvbWV0cnkuXHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygtc2l6ZUhhbGYsIHNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyhzaXplSGFsZiwgc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHNpemVIYWxmLCAtc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKC1zaXplSGFsZiwgLXNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkuZmFjZXMucHVzaChuZXcgVEhSRUUuRmFjZTMoMCwgMiwgMSkpO1xyXG4gIGdlb21ldHJ5LmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsIDMsIDIpKTtcclxuICByZXR1cm4gZ2VvbWV0cnk7XHJcbn1cclxuXHJcbi8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zkuIrjga7mjIflrprjgrnjg5fjg6njgqTjg4jjga5VVuW6p+aomeOCkuaxguOCgeOCi1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleHR1cmUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbE5vKVxyXG57XHJcbiAgdmFyIHdpZHRoID0gdGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gdGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIHZhciB1Q2VsbENvdW50ID0gKHdpZHRoIC8gY2VsbFdpZHRoKSB8IDA7XHJcbiAgdmFyIHZDZWxsQ291bnQgPSAoaGVpZ2h0IC8gY2VsbEhlaWdodCkgfCAwO1xyXG4gIHZhciB2UG9zID0gdkNlbGxDb3VudCAtICgoY2VsbE5vIC8gdUNlbGxDb3VudCkgfCAwKTtcclxuICB2YXIgdVBvcyA9IGNlbGxObyAlIHVDZWxsQ291bnQ7XHJcbiAgdmFyIHVVbml0ID0gY2VsbFdpZHRoIC8gd2lkdGg7IFxyXG4gIHZhciB2VW5pdCA9IGNlbGxIZWlnaHQgLyBoZWlnaHQ7XHJcblxyXG4gIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF0ucHVzaChbXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcykgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodClcclxuICBdKTtcclxuICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdLnB1c2goW1xyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MgLSAxKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpXHJcbiAgXSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4dHVyZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCBjZWxsTm8pXHJcbntcclxuICB2YXIgd2lkdGggPSB0ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSB0ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuXHJcbiAgdmFyIHVDZWxsQ291bnQgPSAod2lkdGggLyBjZWxsV2lkdGgpIHwgMDtcclxuICB2YXIgdkNlbGxDb3VudCA9IChoZWlnaHQgLyBjZWxsSGVpZ2h0KSB8IDA7XHJcbiAgdmFyIHZQb3MgPSB2Q2VsbENvdW50IC0gKChjZWxsTm8gLyB1Q2VsbENvdW50KSB8IDApO1xyXG4gIHZhciB1UG9zID0gY2VsbE5vICUgdUNlbGxDb3VudDtcclxuICB2YXIgdVVuaXQgPSBjZWxsV2lkdGggLyB3aWR0aDtcclxuICB2YXIgdlVuaXQgPSBjZWxsSGVpZ2h0IC8gaGVpZ2h0O1xyXG4gIHZhciB1dnMgPSBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzBdO1xyXG5cclxuICB1dnNbMF0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1swXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcbiAgdXZzWzFdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzFdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcbiAgdXZzWzJdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzJdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuXHJcbiAgdXZzID0gZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVsxXTtcclxuXHJcbiAgdXZzWzBdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMF0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG4gIHV2c1sxXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzFdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcbiAgdXZzWzJdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzJdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcblxyXG4gXHJcbiAgZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWU7XHJcblxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlTWF0ZXJpYWwodGV4dHVyZSlcclxue1xyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRleHR1cmUgLyosZGVwdGhUZXN0OnRydWUqLywgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gIG1hdGVyaWFsLnNpZGUgPSBUSFJFRS5Gcm9udFNpZGU7XHJcbiAgbWF0ZXJpYWwuYWxwaGFUZXN0ID0gMC41O1xyXG4gIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuLy8gIG1hdGVyaWFsLlxyXG4gIHJldHVybiBtYXRlcmlhbDtcclxufVxyXG5cclxuXHJcblxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcblxyXG4vLyDjgq3jg7zlhaXliptcclxuZXhwb3J0IGNsYXNzIEJhc2ljSW5wdXR7XHJcbmNvbnN0cnVjdG9yICgpIHtcclxuICB0aGlzLmtleUNoZWNrID0geyB1cDogZmFsc2UsIGRvd246IGZhbHNlLCBsZWZ0OiBmYWxzZSwgcmlnaHQ6IGZhbHNlLCB6OiBmYWxzZSAseDpmYWxzZX07XHJcbiAgdGhpcy5rZXlCdWZmZXIgPSBbXTtcclxuICB0aGlzLmtleXVwXyA9IG51bGw7XHJcbiAgdGhpcy5rZXlkb3duXyA9IG51bGw7XHJcbiAgLy90aGlzLmdhbWVwYWRDaGVjayA9IHsgdXA6IGZhbHNlLCBkb3duOiBmYWxzZSwgbGVmdDogZmFsc2UsIHJpZ2h0OiBmYWxzZSwgejogZmFsc2UgLHg6ZmFsc2V9O1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkY29ubmVjdGVkJywoZSk9PntcclxuICAgIHRoaXMuZ2FtZXBhZCA9IGUuZ2FtZXBhZDtcclxuICB9KTtcclxuIFxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkZGlzY29ubmVjdGVkJywoZSk9PntcclxuICAgIGRlbGV0ZSB0aGlzLmdhbWVwYWQ7XHJcbiAgfSk7IFxyXG4gXHJcbiBpZih3aW5kb3cubmF2aWdhdG9yLmdldEdhbWVwYWRzKXtcclxuICAgdGhpcy5nYW1lcGFkID0gd2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcygpWzBdO1xyXG4gfSBcclxufVxyXG5cclxuICBjbGVhcigpXHJcbiAge1xyXG4gICAgZm9yKHZhciBkIGluIHRoaXMua2V5Q2hlY2spe1xyXG4gICAgICB0aGlzLmtleUNoZWNrW2RdID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIH1cclxuICBcclxuICBrZXlkb3duKGUpIHtcclxuICAgIHZhciBlID0gZDMuZXZlbnQ7XHJcbiAgICB2YXIga2V5QnVmZmVyID0gdGhpcy5rZXlCdWZmZXI7XHJcbiAgICB2YXIga2V5Q2hlY2sgPSB0aGlzLmtleUNoZWNrO1xyXG4gICAgdmFyIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgXHJcbiAgICBpZiAoa2V5QnVmZmVyLmxlbmd0aCA+IDE2KSB7XHJcbiAgICAgIGtleUJ1ZmZlci5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoZS5rZXlDb2RlID09IDgwIC8qIFAgKi8pIHtcclxuICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICBzZmcuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNmZy5nYW1lLnJlc3VtZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAgICAgICBcclxuICAgIGtleUJ1ZmZlci5wdXNoKGUua2V5Q29kZSk7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDczOlxyXG4gICAgICBjYXNlIDM4OlxyXG4gICAgICBjYXNlIDEwNDpcclxuICAgICAgICBrZXlDaGVjay51cCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NjpcclxuICAgICAgY2FzZSAzOTpcclxuICAgICAgY2FzZSAxMDI6XHJcbiAgICAgICAga2V5Q2hlY2sucmlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA5MDpcclxuICAgICAgICBrZXlDaGVjay56ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDg4OlxyXG4gICAgICAgIGtleUNoZWNrLnggPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGtleXVwKCkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gZmFsc2U7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3MzpcclxuICAgICAgY2FzZSAzODpcclxuICAgICAgY2FzZSAxMDQ6XHJcbiAgICAgICAga2V5Q2hlY2sudXAgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc2OlxyXG4gICAgICBjYXNlIDM5OlxyXG4gICAgICBjYXNlIDEwMjpcclxuICAgICAgICBrZXlDaGVjay5yaWdodCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgOTA6XHJcbiAgICAgICAga2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgODg6XHJcbiAgICAgICAga2V5Q2hlY2sueCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8v44Kk44OZ44Oz44OI44Gr44OQ44Kk44Oz44OJ44GZ44KLXHJcbiAgYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsdGhpcy5rZXlkb3duLmJpbmQodGhpcykpO1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleXVwLmJhc2ljSW5wdXQnLHRoaXMua2V5dXAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIC8vIOOCouODs+ODkOOCpOODs+ODieOBmeOCi1xyXG4gIHVuYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCB1cCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLnVwIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEyXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdIDwgLTAuMSkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRvd24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5kb3duIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEzXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdID4gMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgbGVmdCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLmxlZnQgfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTRdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMF0gPCAtMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgcmlnaHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5yaWdodCB8fCAodGhpcy5nYW1lcGFkICYmICh0aGlzLmdhbWVwYWQuYnV0dG9uc1sxNV0ucHJlc3NlZCB8fCB0aGlzLmdhbWVwYWQuYXhlc1swXSA+IDAuMSkpO1xyXG4gIH1cclxuICBcclxuICBnZXQgeigpIHtcclxuICAgICBsZXQgcmV0ID0gdGhpcy5rZXlDaGVjay56IFxyXG4gICAgfHwgKCgoIXRoaXMuekJ1dHRvbiB8fCAodGhpcy56QnV0dG9uICYmICF0aGlzLnpCdXR0b24pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLnpCdXR0b24gPSB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCBzdGFydCgpIHtcclxuICAgIGxldCByZXQgPSAoKCF0aGlzLnN0YXJ0QnV0dG9uXyB8fCAodGhpcy5zdGFydEJ1dHRvbl8gJiYgIXRoaXMuc3RhcnRCdXR0b25fKSApICYmIHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkKSA7XHJcbiAgICB0aGlzLnN0YXJ0QnV0dG9uXyA9IHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IGFCdXR0b24oKXtcclxuICAgICBsZXQgcmV0ID0gKCgoIXRoaXMuYUJ1dHRvbl8gfHwgKHRoaXMuYUJ1dHRvbl8gJiYgIXRoaXMuYUJ1dHRvbl8pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLmFCdXR0b25fID0gdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQ7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuICAqdXBkYXRlKHRhc2tJbmRleClcclxuICB7XHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIGlmKHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMpe1xyXG4gICAgICAgIHRoaXMuZ2FtZXBhZCA9IHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVswXTtcclxuICAgICAgfSBcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7ICAgICBcclxuICAgIH1cclxuICB9XHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdmFyIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvXFwuc2ZwZ21yXFwubmV0L2lnKT8nd3d3LnNmcGdtci5uZXQnOidsb2NhbGhvc3QnO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovLycgKyBob3N0ICsgJzo4MDgxL3Rlc3QnKTtcclxuICAgICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kSGlnaFNjb3JlcycsIChkYXRhKT0+e1xyXG4gICAgICAgIGlmKHRoaXMudXBkYXRlSGlnaFNjb3Jlcyl7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRIaWdoU2NvcmUnLCAoZGF0YSk9PntcclxuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZShkYXRhKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZFJhbmsnLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgIHRoaXMudXBkYXRlSGlnaFNjb3JlcyhkYXRhLmhpZ2hTY29yZXMpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvckNvbm5lY3Rpb25NYXgnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgYWxlcnQoJ+WQjOaZguaOpee2muOBruS4iumZkOOBq+mBlOOBl+OBvuOBl+OBn+OAgicpO1xyXG4gICAgICAgIHNlbGYuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHNlbGYuZW5hYmxlKSB7XHJcbiAgICAgICAgICBzZWxmLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgYWxlcnQoJ+OCteODvOODkOODvOaOpee2muOBjOWIh+aWreOBleOCjOOBvuOBl+OBn+OAgicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAvL2FsZXJ0KCdTb2NrZXQuSU/jgYzliKnnlKjjgafjgY3jgarjgYTjgZ/jgoHjgIHjg4/jgqTjgrnjgrPjgqLmg4XloLHjgYzlj5blvpfjgafjgY3jgb7jgZvjgpPjgIInICsgZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHNlbmRTY29yZShzY29yZSlcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnc2VuZFNjb3JlJywgc2NvcmUpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBkaXNjb25uZWN0KClcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IHNmZyBmcm9tICcuL2dsb2JhbC5qcyc7IFxyXG4vL2ltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbi8vaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcblxyXG4vLy8g44OG44Kt44K544OI5bGe5oCnXHJcbmV4cG9ydCBjbGFzcyBUZXh0QXR0cmlidXRlIHtcclxuICBjb25zdHJ1Y3RvcihibGluaywgZm9udCkge1xyXG4gICAgaWYgKGJsaW5rKSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBibGluaztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChmb250KSB7XHJcbiAgICAgIHRoaXMuZm9udCA9IGZvbnQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmZvbnQgPSBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44OG44Kt44K544OI44OX44Os44O844OzXHJcbmV4cG9ydCBjbGFzcyBUZXh0UGxhbmV7IFxyXG4gIGNvbnN0cnVjdG9yIChzY2VuZSkge1xyXG4gIHRoaXMudGV4dEJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMuYXR0ckJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMudGV4dEJhY2tCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLmF0dHJCYWNrQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdmFyIGVuZGkgPSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW5kaTsgKytpKSB7XHJcbiAgICB0aGlzLnRleHRCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMudGV4dEJhY2tCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQmFja0J1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8g5o+P55S755So44Kt44Oj44Oz44OQ44K544Gu44K744OD44OI44Ki44OD44OXXHJcblxyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gc2ZnLlZJUlRVQUxfV0lEVEgpe1xyXG4gICAgd2lkdGggKj0gMjtcclxuICB9XHJcbiAgdmFyIGhlaWdodCA9IDE7XHJcbiAgd2hpbGUgKGhlaWdodCA8PSBzZmcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIFxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsYWxwaGFUZXN0OjAuNSwgdHJhbnNwYXJlbnQ6IHRydWUsZGVwdGhUZXN0OnRydWUsc2hhZGluZzpUSFJFRS5GbGF0U2hhZGluZ30pO1xyXG4vLyAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcuQUNUVUFMX1dJRFRIICogd2lkdGggLyBzZmcuVklSVFVBTF9XSURUSCAsIHNmZy5BQ1RVQUxfSEVJR0hUICogIGhlaWdodCAvIHNmZy5WSVJUVUFMX0hFSUdIVCApO1xyXG4vLyAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy5BQ1RVQUxfV0lEVEggLCBzZmcuQUNUVUFMX0hFSUdIVCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAoc2ZnLkFDVFVBTF9XSURUSCAqIHdpZHRoIC8gc2ZnLlZJUlRVQUxfV0lEVEggLSBzZmcuQUNUVUFMX1dJRFRIKSAvIDI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSAtIChzZmcuQUNUVUFMX0hFSUdIVCAqIGhlaWdodCAvIHNmZy5WSVJUVUFMX0hFSUdIVCAtIHNmZy5BQ1RVQUxfSEVJR0hUKSAvIDI7XHJcbiAgdGhpcy5mb250cyA9IHsgZm9udDogc2ZnLnRleHR1cmVGaWxlcy5mb250LCBmb250MTogc2ZnLnRleHR1cmVGaWxlcy5mb250MSB9O1xyXG4gIHRoaXMuYmxpbmtDb3VudCA9IDA7XHJcbiAgdGhpcy5ibGluayA9IGZhbHNlO1xyXG5cclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuY2xzKCk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbn1cclxuXHJcbiAgLy8vIOeUu+mdoua2iOWOu1xyXG4gIGNscygpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmRpID0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aDsgaSA8IGVuZGk7ICsraSkge1xyXG4gICAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGF0dHJfbGluZSA9IHRoaXMuYXR0ckJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGxpbmVfYmFjayA9IHRoaXMudGV4dEJhY2tCdWZmZXJbaV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmVfYmFjayA9IHRoaXMuYXR0ckJhY2tCdWZmZXJbaV07XHJcblxyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMudGV4dEJ1ZmZlcltpXS5sZW5ndGg7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICBsaW5lW2pdID0gMHgyMDtcclxuICAgICAgICBhdHRyX2xpbmVbal0gPSAweDAwO1xyXG4gICAgICAgIC8vbGluZV9iYWNrW2pdID0gMHgyMDtcclxuICAgICAgICAvL2F0dHJfbGluZV9iYWNrW2pdID0gMHgwMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIH1cclxuXHJcbiAgLy8vIOaWh+Wtl+ihqOekuuOBmeOCi1xyXG4gIHByaW50KHgsIHksIHN0ciwgYXR0cmlidXRlKSB7XHJcbiAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgIHZhciBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgaWYgKCFhdHRyaWJ1dGUpIHtcclxuICAgICAgYXR0cmlidXRlID0gMDtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgIGlmIChjID09IDB4YSkge1xyXG4gICAgICAgICsreTtcclxuICAgICAgICBpZiAoeSA+PSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6tcclxuICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IHRoaXMudGV4dEJ1ZmZlci5zbGljZSgxLCB0aGlzLnRleHRCdWZmZXIubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICB0aGlzLnRleHRCdWZmZXIucHVzaChuZXcgQXJyYXkoc2ZnLlZJUlRVQUxfV0lEVEggLyA4KSk7XHJcbiAgICAgICAgICB0aGlzLmF0dHJCdWZmZXIgPSB0aGlzLmF0dHJCdWZmZXIuc2xpY2UoMSwgdGhpcy5hdHRyQnVmZmVyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgdGhpcy5hdHRyQnVmZmVyLnB1c2gobmV3IEFycmF5KHNmZy5WSVJUVUFMX1dJRFRIIC8gOCkpO1xyXG4gICAgICAgICAgLS15O1xyXG4gICAgICAgICAgdmFyIGVuZGogPSB0aGlzLnRleHRCdWZmZXJbeV0ubGVuZ3RoO1xyXG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyW3ldW2pdID0gMHgyMDtcclxuICAgICAgICAgICAgdGhpcy5hdHRyQnVmZmVyW3ldW2pdID0gMHgwMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgICAgICBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgICAgIHggPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxpbmVbeF0gPSBjO1xyXG4gICAgICAgIGF0dHJbeF0gPSBhdHRyaWJ1dGU7XHJcbiAgICAgICAgKyt4O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDjg4bjgq3jgrnjg4jjg4fjg7zjgr/jgpLjgoLjgajjgavjg4bjgq/jgrnjg4Hjg6Pjg7zjgavmj4/nlLvjgZnjgotcclxuICByZW5kZXIoKSB7XHJcbiAgICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICB0aGlzLmJsaW5rQ291bnQgPSAodGhpcy5ibGlua0NvdW50ICsgMSkgJiAweGY7XHJcblxyXG4gICAgdmFyIGRyYXdfYmxpbmsgPSBmYWxzZTtcclxuICAgIGlmICghdGhpcy5ibGlua0NvdW50KSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSAhdGhpcy5ibGluaztcclxuICAgICAgZHJhd19ibGluayA9IHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgdXBkYXRlID0gZmFsc2U7XHJcbi8vICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4vLyAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwLCBneSA9IDA7IHkgPCBzZmcuVEVYVF9IRUlHSFQ7ICsreSwgZ3kgKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmUgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICAgIHZhciBsaW5lX2JhY2sgPSB0aGlzLnRleHRCYWNrQnVmZmVyW3ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lX2JhY2sgPSB0aGlzLmF0dHJCYWNrQnVmZmVyW3ldO1xyXG4gICAgICBmb3IgKHZhciB4ID0gMCwgZ3ggPSAwOyB4IDwgc2ZnLlRFWFRfV0lEVEg7ICsreCwgZ3ggKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgICB2YXIgcHJvY2Vzc19ibGluayA9IChhdHRyX2xpbmVbeF0gJiYgYXR0cl9saW5lW3hdLmJsaW5rKTtcclxuICAgICAgICBpZiAobGluZVt4XSAhPSBsaW5lX2JhY2tbeF0gfHwgYXR0cl9saW5lW3hdICE9IGF0dHJfbGluZV9iYWNrW3hdIHx8IChwcm9jZXNzX2JsaW5rICYmIGRyYXdfYmxpbmspKSB7XHJcbiAgICAgICAgICB1cGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIGxpbmVfYmFja1t4XSA9IGxpbmVbeF07XHJcbiAgICAgICAgICBhdHRyX2xpbmVfYmFja1t4XSA9IGF0dHJfbGluZVt4XTtcclxuICAgICAgICAgIHZhciBjID0gMDtcclxuICAgICAgICAgIGlmICghcHJvY2Vzc19ibGluayB8fCB0aGlzLmJsaW5rKSB7XHJcbiAgICAgICAgICAgIGMgPSBsaW5lW3hdIC0gMHgyMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHZhciB5cG9zID0gKGMgPj4gNCkgPDwgMztcclxuICAgICAgICAgIHZhciB4cG9zID0gKGMgJiAweGYpIDw8IDM7XHJcbiAgICAgICAgICBjdHguY2xlYXJSZWN0KGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIHZhciBmb250ID0gYXR0cl9saW5lW3hdID8gYXR0cl9saW5lW3hdLmZvbnQgOiBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICAgICAgICBpZiAoYykge1xyXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGZvbnQuaW1hZ2UsIHhwb3MsIHlwb3MsIHNmZy5DSEFSX1NJWkUsIHNmZy5DSEFSX1NJWkUsIGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHVwZGF0ZTtcclxuICB9XHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29sbGlzaW9uQXJlYSB7XHJcbiAgY29uc3RydWN0b3Iob2Zmc2V0WCwgb2Zmc2V0WSwgd2lkdGgsIGhlaWdodClcclxuICB7XHJcbiAgICB0aGlzLm9mZnNldFggPSBvZmZzZXRYIHx8IDA7XHJcbiAgICB0aGlzLm9mZnNldFkgPSBvZmZzZXRZIHx8IDA7XHJcbiAgICB0aGlzLnRvcCA9IDA7XHJcbiAgICB0aGlzLmJvdHRvbSA9IDA7XHJcbiAgICB0aGlzLmxlZnQgPSAwO1xyXG4gICAgdGhpcy5yaWdodCA9IDA7XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGggfHwgMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDA7XHJcbiAgICB0aGlzLndpZHRoXyA9IDA7XHJcbiAgICB0aGlzLmhlaWdodF8gPSAwO1xyXG4gIH1cclxuICBnZXQgd2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoXzsgfVxyXG4gIHNldCB3aWR0aCh2KSB7XHJcbiAgICB0aGlzLndpZHRoXyA9IHY7XHJcbiAgICB0aGlzLmxlZnQgPSB0aGlzLm9mZnNldFggLSB2IC8gMjtcclxuICAgIHRoaXMucmlnaHQgPSB0aGlzLm9mZnNldFggKyB2IC8gMjtcclxuICB9XHJcbiAgZ2V0IGhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0XzsgfVxyXG4gIHNldCBoZWlnaHQodikge1xyXG4gICAgdGhpcy5oZWlnaHRfID0gdjtcclxuICAgIHRoaXMudG9wID0gdGhpcy5vZmZzZXRZICsgdiAvIDI7XHJcbiAgICB0aGlzLmJvdHRvbSA9IHRoaXMub2Zmc2V0WSAtIHYgLyAyO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHgsIHksIHopIHtcclxuICAgIHRoaXMueF8gPSB4IHx8IDA7XHJcbiAgICB0aGlzLnlfID0geSB8fCAwO1xyXG4gICAgdGhpcy56XyA9IHogfHwgMC4wO1xyXG4gICAgdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgICB0aGlzLndpZHRoID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gMDtcclxuICAgIHRoaXMuY29sbGlzaW9uQXJlYSA9IG5ldyBDb2xsaXNpb25BcmVhKCk7XHJcbiAgfVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdjsgfVxyXG59XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBzZmcgZnJvbSAnLi9nbG9iYWwuanMnOyBcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmouanMnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzLmpzJztcclxuXHJcbnZhciBteUJ1bGxldHMgPSBbXTtcclxuXHJcbi8vLyDoh6rmqZ/lvL4gXHJcbmV4cG9ydCBjbGFzcyBNeUJ1bGxldCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICBzdXBlcigwLCAwLCAwKTtcclxuXHJcbiAgdGhpcy5zcGVlZCA9IDAuNTtcclxuICB0aGlzLnBvd2VyID0gMTtcclxuXHJcblxyXG4gIHRoaXMubWVzaCA9IHNmZy5nYW1lLm1lc2hlcy5idWxsZXQuY2xvbmUoKTtcclxuICBsZXQgYmJveCA9IG5ldyBUSFJFRS5Cb3gzKCkuc2V0RnJvbU9iamVjdCh0aGlzLm1lc2gpO1xyXG4gIGxldCBkID0gYmJveC5nZXRTaXplKCk7XHJcblxyXG4gIC8vIHRoaXMuYmIgPSBuZXcgVEhSRUUuQm91bmRpbmdCb3hIZWxwZXIoIHRoaXMubWVzaCwgMHhmZmZmMDAgKTtcclxuXHQvLyBzZmcuZ2FtZS5zY2VuZS5hZGQoIHRoaXMuYmIgKTtcclxuXHJcbiAgXHJcbiAgdGhpcy53aWR0aCA9IGQueDtcclxuICB0aGlzLmhlaWdodCA9IGQueTtcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gZC54O1xyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSBkLnk7XHJcblxyXG5cclxuICAvLyDnp7vli5Xnr4Tlm7LjgpLmsYLjgoHjgotcclxuICB0aGlzLnRvcCA9IChzZmcuVl9UT1AgLSB0aGlzLmhlaWdodCApIDtcclxuICB0aGlzLmJvdHRvbSA9IChzZmcuVl9CT1RUT00gKyB0aGlzLmhlaWdodCApO1xyXG4gIHRoaXMubGVmdCA9IChzZmcuVl9MRUZUICsgdGhpcy53aWR0aCApIDtcclxuICB0aGlzLnJpZ2h0ID0gKHNmZy5WX1JJR0hUIC0gdGhpcy53aWR0aCApO1xyXG5cclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcblxyXG4gIC8vIHRoaXMudGV4dHVyZVdpZHRoID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2Uud2lkdGg7XHJcbiAgLy8gdGhpcy50ZXh0dXJlSGVpZ2h0ID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICAvLyAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcblxyXG4gIC8vIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwKTtcclxuICAvLyB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgLy8gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLCAxNiwgMTYsIDEpO1xyXG4gIC8vIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gIC8vIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdGhpcy54XztcclxuICAvLyB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMueV87XHJcbiAgLy8gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB0aGlzLnpfO1xyXG4gIHRoaXMuc2UgPSBzZTtcclxuICAvL3NlKDApO1xyXG4gIC8vc2VxdWVuY2VyLnBsYXlUcmFja3Moc291bmRFZmZlY3RzLnNvdW5kRWZmZWN0c1swXSk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgdGhpcy5tZXNoLnZpc2libGUgPSB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAvLyAgc2ZnLnRhc2tzLnB1c2hUYXNrKGZ1bmN0aW9uICh0YXNrSW5kZXgpIHsgc2VsZi5tb3ZlKHRhc2tJbmRleCk7IH0pO1xyXG4gfVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIFxyXG4gICAgd2hpbGUgKHRhc2tJbmRleCA+PSAwIFxyXG4gICAgICAmJiB0aGlzLmVuYWJsZV9cclxuICAgICAgJiYgdGhpcy55IDw9IHRoaXMudG9wIFxyXG4gICAgICAmJiB0aGlzLnkgPj0gdGhpcy5ib3R0b20gXHJcbiAgICAgICYmIHRoaXMueCA8PSB0aGlzLnJpZ2h0IFxyXG4gICAgICAmJiB0aGlzLnggPj0gdGhpcy5sZWZ0KVxyXG4gICAge1xyXG4gICAgICBcclxuICAgICAgdGhpcy55ICs9IHRoaXMuZHk7XHJcbiAgICAgIHRoaXMueCArPSB0aGlzLmR4O1xyXG4gICAgICBcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB9XHJcblxyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gICAgdGhpcy5lbmFibGVfID0gdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxufVxyXG5cclxuICBzdGFydCh4LCB5LCB6LCBhaW1SYWRpYW4scG93ZXIpIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZV8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLnogPSB6IC0gMC4xO1xyXG4gICAgdGhpcy5wb3dlciA9IHBvd2VyIHwgMTtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhhaW1SYWRpYW4pICogdGhpcy5zcGVlZDtcclxuICAgIHRoaXMuZHkgPSBNYXRoLnNpbihhaW1SYWRpYW4pICogdGhpcy5zcGVlZDtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIHRoaXMuc2UoMCk7XHJcbiAgICAvL3NlcXVlbmNlci5wbGF5VHJhY2tzKHNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbMF0pO1xyXG4gICAgdGhpcy50YXNrID0gc2ZnLnRhc2tzLnB1c2hUYXNrKHRoaXMubW92ZS5iaW5kKHRoaXMpKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOiHquapn+OCquODluOCuOOCp+OCr+ODiFxyXG5leHBvcnQgY2xhc3MgTXlTaGlwIGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIHsgXHJcbiAgY29uc3RydWN0b3IoeCwgeSwgeixzY2VuZSxzZSkge1xyXG4gIHN1cGVyKHgsIHksIHopOy8vIGV4dGVuZFxyXG5cclxuICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSA2O1xyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSA4O1xyXG4gIHRoaXMuc2UgPSBzZTtcclxuICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgLy90aGlzLnRleHR1cmVXaWR0aCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLndpZHRoO1xyXG4gIC8vdGhpcy50ZXh0dXJlSGVpZ2h0ID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLpcclxuICAvLyDjg57jg4bjg6rjgqLjg6vjga7kvZzmiJBcclxuICAvL3ZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwKTtcclxuICAvLyDjgrjjgqrjg6Hjg4jjg6rjga7kvZzmiJBcclxuICAvL3ZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KHRoaXMud2lkdGgpO1xyXG4gIC8vZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCk7XHJcblxyXG4gIC8vdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2ggPSBzZmcuZ2FtZS5tZXNoZXMubXlzaGlwO1xyXG4gIGxldCBiYm94ID0gbmV3IFRIUkVFLkJveDMoKS5zZXRGcm9tT2JqZWN0KHRoaXMubWVzaCk7XHJcbiAgbGV0IGQgPSBiYm94LmdldFNpemUoKTtcclxuXHJcbiAgLy90aGlzLmJiID0gbmV3IFRIUkVFLkJveEhlbHBlciggdGhpcy5tZXNoLCAweGZmZmZmZiApO1xyXG5cdC8vc2ZnLmdhbWUuc2NlbmUuYWRkKCB0aGlzLmJiICk7XHJcblxyXG4gIFxyXG4gIHRoaXMud2lkdGggPSBkLng7XHJcbiAgdGhpcy5oZWlnaHQgPSBkLnk7XHJcblxyXG4gIC8vIOenu+WLleevhOWbsuOCkuaxguOCgeOCi1xyXG4gIHRoaXMudG9wID0gKHNmZy5WX1RPUCAtIHRoaXMuaGVpZ2h0IC8gMikgO1xyXG4gIHRoaXMuYm90dG9tID0gKHNmZy5WX0JPVFRPTSArIHRoaXMuaGVpZ2h0IC8gMik7XHJcbiAgdGhpcy5sZWZ0ID0gKHNmZy5WX0xFRlQgKyB0aGlzLndpZHRoIC8gMikgO1xyXG4gIHRoaXMucmlnaHQgPSAoc2ZnLlZfUklHSFQgLSB0aGlzLndpZHRoIC8gMik7XHJcblxyXG5cclxuICB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHRoaXMueF87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB0aGlzLnlfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdGhpcy56XztcclxuICB0aGlzLnJlc3QgPSAzO1xyXG4gIHRoaXMubXlCdWxsZXRzID0gKCAoKT0+IHtcclxuICAgIHZhciBhcnIgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjsgKytpKSB7XHJcbiAgICAgIGFyci5wdXNoKG5ldyBNeUJ1bGxldCh0aGlzLnNjZW5lLHRoaXMuc2UpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnI7XHJcbiAgfSkoKTtcclxuXHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgXHJcbiAgdGhpcy5idWxsZXRQb3dlciA9IDE7XHJcblxyXG59XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgXHJcbiAgc2hvb3QoYWltUmFkaWFuKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5teUJ1bGxldHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgaWYgKHRoaXMubXlCdWxsZXRzW2ldLnN0YXJ0KHRoaXMueCwgdGhpcy55ICwgdGhpcy56LGFpbVJhZGlhbix0aGlzLmJ1bGxldFBvd2VyKSkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGFjdGlvbihiYXNpY0lucHV0KSB7XHJcbiAgICBpZiAoYmFzaWNJbnB1dC5sZWZ0KSB7XHJcbiAgICAgIGlmICh0aGlzLnggPiB0aGlzLmxlZnQpIHtcclxuICAgICAgICB0aGlzLnggLT0gMC4xNTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LnJpZ2h0KSB7XHJcbiAgICAgIGlmICh0aGlzLnggPCB0aGlzLnJpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy54ICs9IDAuMTU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC51cCkge1xyXG4gICAgICBpZiAodGhpcy55IDwgdGhpcy50b3ApIHtcclxuICAgICAgICB0aGlzLnkgKz0gMC4xNTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LmRvd24pIHtcclxuICAgICAgaWYgKHRoaXMueSA+IHRoaXMuYm90dG9tKSB7XHJcbiAgICAgICAgdGhpcy55IC09IDAuMTU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZihiYXNpY0lucHV0LmxlZnQgJiYgdGhpcy5tZXNoLnJvdGF0aW9uLnkgPiAtMC40KXtcclxuICAgICAgdGhpcy5tZXNoLnJvdGF0aW9uLnkgLT0gMC4wMjsgXHJcbiAgICB9IGVsc2UgaWYoYmFzaWNJbnB1dC5yaWdodCAmJiB0aGlzLm1lc2gucm90YXRpb24ueSA8IDAuNCl7XHJcbiAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi55ICs9IDAuMDI7XHJcbiAgICB9IGVsc2UgaWYodGhpcy5tZXNoLnJvdGF0aW9uLnkgIT0gMCAmJiAhKGJhc2ljSW5wdXQubGVmdCB8fCBiYXNpY0lucHV0LnJpZ2h0KSApe1xyXG4gICAgICBpZih0aGlzLm1lc2gucm90YXRpb24ueSA8IDApe1xyXG4gICAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi55ICs9IDAuMDU7XHJcbiAgICAgICAgaWYodGhpcy5tZXNoLnJvdGF0aW9uLnkgPiAwKXtcclxuICAgICAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi55ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYodGhpcy5tZXNoLnJvdGF0aW9uLnkgPiAwKXtcclxuICAgICAgICB0aGlzLm1lc2gucm90YXRpb24ueSAtPSAwLjA1O1xyXG4gICAgICAgIGlmKHRoaXMubWVzaC5yb3RhdGlvbi55IDwgMCl7XHJcbiAgICAgICAgICB0aGlzLm1lc2gucm90YXRpb24ueSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC56KSB7XHJcbiAgICAgIGJhc2ljSW5wdXQua2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNob290KDAuNSAqIE1hdGguUEkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LngpIHtcclxuICAgICAgYmFzaWNJbnB1dC5rZXlDaGVjay54ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc2hvb3QoMS41ICogTWF0aC5QSSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhpcy5iYi5wb3NpdGlvbi54ID0gdGhpcy5tZXNoLnBvc2l0aW9uLng7XHJcbiAgICAvLyB0aGlzLmJiLnBvc2l0aW9uLnkgPSB0aGlzLm1lc2gucG9zaXRpb24ueTtcclxuICAgIC8vIHRoaXMuYmIucG9zaXRpb24ueiA9IHRoaXMubWVzaC5wb3NpdGlvbi56O1xyXG4gICAgLy8gdGhpcy5iYi5yb3RhdGlvbi55ID0gdGhpcy5tZXNoLnJvdGF0aW9uLnk7XHJcbn1cclxuXHJcbiAgXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHNmZy5ib21icy5zdGFydCh0aGlzLngsIHRoaXMueSwgMC4yKTtcclxuICAgIHRoaXMuc2UoNCk7XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLm15QnVsbGV0cy5mb3JFYWNoKChkKT0+e1xyXG4gICAgICBpZihkLmVuYWJsZV8pe1xyXG4gICAgICAgIHdoaWxlKCFzZmcudGFza3MuYXJyYXlbZC50YXNrLmluZGV4XS5nZW5JbnN0Lm5leHQoLSgxICsgZC50YXNrLmluZGV4KSkuZG9uZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBpbml0KCl7XHJcbiAgICAgIHRoaXMueCA9IDA7XHJcbi8vICAgICAgdGhpcy55ID0gLTEwMDtcclxuICAgICAgdGhpcy55ID0gMDtcclxuICAgICAgdGhpcy56ID0gMDtcclxuICAgICAgdGhpcy5yZXN0ID0gMztcclxuICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbiIsIlxyXG5leHBvcnQgdmFyIHNlcURhdGEgPSB7XHJcbiAgbmFtZTogJ1Rlc3QnLFxyXG4gIHRyYWNrczogW1xyXG4vKiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDAsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYFxyXG4gICAgICAgczAuMDEsMC4yLDAuMiwwLjAzIEAyIFxyXG4gICAgICAgdDE0MCAgcTM1IHYzMCBsMXIxcjFyMXIxICRsMTZvMyBjY2NjY2NjYzxnZ2dnYWFiYj4gY2NjY2NjY2M8Z2dnZz5jYzxiYiBiLWItYi1iLWItYi1iLWItZmZmZmdnZytnKyBnK2crZytnK2crZytnK2crZ2dnZ2FhYmIgPlxyXG4gICAgICAgICAgICAgYFxyXG4gICAgICB9LCovXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDEsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYFxyXG4gICAgICAgczAuMDEsMC4yLDAuMiwwLjAzIEAyIFxyXG4gICAgICAgdDE2MCAgcTU1IHYyMCBvMiBsOCAkYmJiYiBiYmJiXHJcbiAgICAgICAgICAgICBgXHJcbiAgICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDIsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYFxyXG4gICAgICAgczAuMDEsMC4yLDAuMiwwLjA1IEA0IFxyXG4gICAgICAgdDE2MCAgcTc1IHYyMCBvNCBsOCAkW2JkK10xIFtiZCtdW2JkK10gcjhbZis+Yys8XSByOFtkK2ItXSByOFtiZCtdMi5yOHI0XHJcbiAgICAgICAgICAgICBgXHJcbiAgICAgIH0sXHJcblxyXG4gICAge1xyXG4gICAgICBuYW1lOiAnYmFzZScsXHJcbiAgICAgIGNoYW5uZWw6IDMsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYHMwLjAxLDAuMDEsMS4wLDAuMDUgbzUgdDE2MCBAMTAgdjYwIHEyMCAkbDRncmc4ZzhyYFxyXG4gICAgfVxyXG4gICAgLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAncGFydDQnLFxyXG4gICAgICBjaGFubmVsOiA0LFxyXG4gICAgICBtbWw6XHJcbiAgICAgIGBzMC4wMSwwLjAxLDEuMCwwLjA1IG81IHQxNjAgQDIxIHY2MCBxODAgJC86bDRydjYwYjgudjMwYjE2cmwxNnY2MGI4cjg6LzNsNHJiOC5iMTZybDE2YnIxNmJiYFxyXG4gICAgfVxyXG4gICAgLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAncGFydDUnLFxyXG4gICAgICBjaGFubmVsOiA1LFxyXG4gICAgICBtbWw6XHJcbiAgICAgIGBzMC4wMSwwLjAxLDEuMCwwLjA1IG81IHQxNjAgQDExIGw4ICQgcTIwIHY2MCByOGE4IHI4YThgXHJcbiAgICB9XHJcbiAgICAsXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0NScsXHJcbiAgICAgIGNoYW5uZWw6IDQsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYHMwLjAxLDAuMDEsMS4wLDAuMDUgbzUgdDE2MCBAMjAgcTk1ICR2MjAgbDQgcmdyZyBgXHJcbiAgICB9XHJcbiAgXVxyXG59O1xyXG5cclxuZXhwb3J0IHZhciBzb3VuZEVmZmVjdERhdGEgPSBbXHJcbiAgLy8gMFxyXG4gIHtcclxuICAgIG5hbWU6ICcnLFxyXG4gICAgdHJhY2tzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBjaGFubmVsOiAxMixcclxuICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgIG1tbDogJ3MwLjAwMDEsMC4wMDAxLDEuMCwwLjAwMSBANCB0MjQwIHExMjcgdjUwIGwxMjggbzggY2RlZmdhYiA8IGNkZWdhYmJiYidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNoYW5uZWw6IDEzLFxyXG4gICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgbW1sOiAnczAuMDAwMSwwLjAwMDEsMS4wLDAuMDAxIEA0IHQyNDAgcTEyNyB2NTAgbDEyOCBvNyBjZGVmZ2FiIDwgY2RlZ2FiYmJiJ1xyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuICAvLyAxXHJcbiAge1xyXG4gICAgbmFtZTogJycsXHJcbiAgICB0cmFja3M6IFtcclxuICAgICAge1xyXG4gICAgICAgIGNoYW5uZWw6IDE0LFxyXG4gICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgbW1sOiAnczAuMDAwMSwwLjAwMDEsMS4wLDAuMDAwMSBANCB0MjAwIHExMjcgdjUwIGw2NCBvNiBnIGFiPGJhZ2ZlZGNlZ2FiPmJhZ2ZlZGM+ZGJhZ2ZlZGMnXHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9LFxyXG4gIC8vIDIgXHJcbiAge1xyXG4gICAgbmFtZTogJycsXHJcbiAgICB0cmFja3M6IFtcclxuICAgICAge1xyXG4gICAgICAgIGNoYW5uZWw6IDE0LFxyXG4gICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgbW1sOiAnczAuMDAwMSwwLjAwMDEsMS4wLDAuMDAwMSBANCB0MTUwIHExMjcgdjUwIGwxMjggbzYgY2RlZmdhYj5jZGVmPGc+YT5iPGE+ZzxmPmU8ZSdcclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgLy8gMyBcclxuICB7XHJcbiAgICBuYW1lOiAnJyxcclxuICAgIHRyYWNrczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgY2hhbm5lbDogMTQsXHJcbiAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICBtbWw6ICdzMC4wMDAxLDAuMDAwMSwxLjAsMC4wMDAxIEA1IHQyMDAgcTEyNyB2NTAgbDY0IG82IGM8Yz5jPGM+YzxjPmM8J1xyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuICAvLyA0IFxyXG4gIHtcclxuICAgIG5hbWU6ICcnLFxyXG4gICAgdHJhY2tzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBjaGFubmVsOiAxNSxcclxuICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgIG1tbDogJ3MwLjAwMDEsMC4wMDAxLDEuMCwwLjI1IEA4IHQxMjAgcTEyNyB2NTAgbDIgbzAgYydcclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH1cclxuXTtcclxuXHJcbiIsIi8qKlxyXG4gKiBAYXV0aG9yIFNGUEdNUlxyXG4gKi9cclxuLy8gU2hhZGVyIFRveeOCiOOCiuaLneWAn+OBl+OBpuWwkeOBl+aUuemAoFxyXG4vLyBodHRwczovL3d3dy5zaGFkZXJ0b3kuY29tL3ZpZXcvNHNjU1I4XHJcbi8vIGJ5IFRpbW90aHkgTG90dGVzXHJcbi8vXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuICBsZXQgdmVydGV4U2hhZGVyID0gXHJcbmBcclxudmFyeWluZyB2ZWMyIHZVdjtcclxudm9pZCBtYWluKClcdHtcclxuXHRcdHZVdiA9IHV2O1xyXG4gICAgZ2xfUG9zaXRpb24gPSB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7XHJcbiAgfVxyXG5gO1xyXG4gIGxldCBmcmFnbWVudFNoYWRlciA9IFxyXG5gXHJcbnVuaWZvcm0gc2FtcGxlcjJEIHREaWZmdXNlO1xyXG51bmlmb3JtIHZlYzIgcmVzb2x1dGlvbjtcclxudW5pZm9ybSBmbG9hdCB0aW1lO1xyXG52YXJ5aW5nIHZlYzIgdlV2O1xyXG5cclxuI2RlZmluZSBSR0JBKHIsIGcsIGIsIGEpXHR2ZWM0KGZsb2F0KHIpLzI1NS4wLCBmbG9hdChnKS8yNTUuMCwgZmxvYXQoYikvMjU1LjAsIGZsb2F0KGEpLzI1NS4wKVxyXG5cclxuLy9jb25zdCB2ZWMzIGtCYWNrZ3JvdW5kQ29sb3IgPSBSR0JBKDB4MDAsIDB4MDAsIDB4MDAsIDB4MDApLnJnYjsgLy8gbWVkaXVtLWJsdWUgc2t5XHJcbmNvbnN0IHZlYzMga0JhY2tncm91bmRDb2xvciA9IFJHQkEoMHhmZiwgMHgwMCwgMHhmZiwgMHhmZikucmdiOyAvLyB0ZXN0IG1hZ2VudGFcclxuXHJcbi8vIEVtdWxhdGVkIGlucHV0IHJlc29sdXRpb24uXHJcbi8vIEZpeCByZXNvbHV0aW9uIHRvIHNldCBhbW91bnQuXHJcbi8vIE5vdGU6IDI1NngyMjQgaXMgdGhlIG1vc3QgY29tbW9uIHJlc29sdXRpb24gb2YgdGhlIFNORVMsIGFuZCB0aGF0IG9mIFN1cGVyIE1hcmlvIFdvcmxkLlxyXG52ZWMyIHJlcyA9IHZlYzIoXHJcbiAgNjQwLjAgLyAxLjAsXHJcbiAgNDgwLjAgLyAxLjBcclxuKTtcclxuXHJcbi8vIEhhcmRuZXNzIG9mIHNjYW5saW5lLlxyXG4vL1x0LTguMCA9IHNvZnRcclxuLy8gLTE2LjAgPSBtZWRpdW1cclxuZmxvYXQgc0hhcmRTY2FuID0gLTguMDtcclxuXHJcbi8vIEhhcmRuZXNzIG9mIHBpeGVscyBpbiBzY2FubGluZS5cclxuLy8gLTIuMCA9IHNvZnRcclxuLy8gLTQuMCA9IGhhcmRcclxuY29uc3QgZmxvYXQga0hhcmRQaXggPSAtMy4wO1xyXG5cclxuLy8gRGlzcGxheSB3YXJwLlxyXG4vLyAwLjAgPSBub25lXHJcbi8vIDEuMCAvIDguMCA9IGV4dHJlbWVcclxuY29uc3QgdmVjMiBrV2FycCA9IHZlYzIoMS4wIC8gMzIuMCwgMS4wIC8gMjQuMCk7XHJcbi8vY29uc3QgdmVjMiBrV2FycCA9IHZlYzIoMCk7XHJcblxyXG4vLyBBbW91bnQgb2Ygc2hhZG93IG1hc2suXHJcbmZsb2F0IGtNYXNrRGFyayA9IDAuNTtcclxuZmxvYXQga01hc2tMaWdodCA9IDEuNTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vLyBzUkdCIHRvIExpbmVhci5cclxuLy8gQXNzdWluZyB1c2luZyBzUkdCIHR5cGVkIHRleHR1cmVzIHRoaXMgc2hvdWxkIG5vdCBiZSBuZWVkZWQuXHJcbmZsb2F0IHRvTGluZWFyMShmbG9hdCBjKSB7XHJcblx0cmV0dXJuIChjIDw9IDAuMDQwNDUpID9cclxuXHRcdChjIC8gMTIuOTIpIDpcclxuXHRcdHBvdygoYyArIDAuMDU1KSAvIDEuMDU1LCAyLjQpO1xyXG59XHJcbnZlYzMgdG9MaW5lYXIodmVjMyBjKSB7XHJcblx0cmV0dXJuIHZlYzModG9MaW5lYXIxKGMuciksIHRvTGluZWFyMShjLmcpLCB0b0xpbmVhcjEoYy5iKSk7XHJcbn1cclxuXHJcbi8vIExpbmVhciB0byBzUkdCLlxyXG4vLyBBc3N1aW5nIHVzaW5nIHNSR0IgdHlwZWQgdGV4dHVyZXMgdGhpcyBzaG91bGQgbm90IGJlIG5lZWRlZC5cclxuZmxvYXQgdG9TcmdiMShmbG9hdCBjKSB7XHJcblx0cmV0dXJuKGMgPCAwLjAwMzEzMDggP1xyXG5cdFx0KGMgKiAxMi45MikgOlxyXG5cdFx0KDEuMDU1ICogcG93KGMsIDAuNDE2NjYpIC0gMC4wNTUpKTtcclxufVxyXG52ZWMzIHRvU3JnYih2ZWMzIGMpIHtcclxuXHRyZXR1cm4gdmVjMyh0b1NyZ2IxKGMuciksIHRvU3JnYjEoYy5nKSwgdG9TcmdiMShjLmIpKTtcclxufVxyXG5cclxuLy8gTmVhcmVzdCBlbXVsYXRlZCBzYW1wbGUgZ2l2ZW4gZmxvYXRpbmcgcG9pbnQgcG9zaXRpb24gYW5kIHRleGVsIG9mZnNldC5cclxuLy8gQWxzbyB6ZXJvJ3Mgb2ZmIHNjcmVlbi5cclxudmVjNCBmZXRjaCh2ZWMyIHBvcywgdmVjMiBvZmYpXHJcbntcclxuXHRwb3MgPSBmbG9vcihwb3MgKiByZXMgKyBvZmYpIC8gcmVzO1xyXG5cdGlmIChtYXgoYWJzKHBvcy54IC0gMC41KSwgYWJzKHBvcy55IC0gMC41KSkgPiAwLjUpXHJcblx0XHRyZXR1cm4gdmVjNCh2ZWMzKDAuMCksIDAuMCk7XHJcbiAgIFx0XHJcbi8vICAgIHZlYzQgc2FtcGxlZENvbG9yID0gdGV4dHVyZShpQ2hhbm5lbDAsIHBvcy54eSwgLTE2LjApO1xyXG4gICAgdmVjNCBzYW1wbGVkQ29sb3IgPSB0ZXh0dXJlMkQodERpZmZ1c2UsIHBvcy54eSwgLTE2LjApO1xyXG4gICAgXHJcbiAgICBzYW1wbGVkQ29sb3IgPSB2ZWM0KFxyXG4gICAgICAgIChzYW1wbGVkQ29sb3IucmdiICogc2FtcGxlZENvbG9yLmEpICtcclxuICAgICAgICBcdChrQmFja2dyb3VuZENvbG9yICogKDEuMCAtIHNhbXBsZWRDb2xvci5hKSksXHJcbiAgICAgICAgMS4wXHJcbiAgICApO1xyXG4gICAgXHJcblx0cmV0dXJuIHZlYzQoXHJcbiAgICAgICAgdG9MaW5lYXIoc2FtcGxlZENvbG9yLnJnYiksXHJcbiAgICAgICAgc2FtcGxlZENvbG9yLmFcclxuICAgICk7XHJcbn1cclxuXHJcbi8vIERpc3RhbmNlIGluIGVtdWxhdGVkIHBpeGVscyB0byBuZWFyZXN0IHRleGVsLlxyXG52ZWMyIGRpc3QodmVjMiBwb3MpIHtcclxuXHRwb3MgPSBwb3MgKiByZXM7XHJcblx0cmV0dXJuIC0oKHBvcyAtIGZsb29yKHBvcykpIC0gdmVjMigwLjUpKTtcclxufVxyXG5cclxuLy8gMUQgR2F1c3NpYW4uXHJcbmZsb2F0IGdhdXMoZmxvYXQgcG9zLCBmbG9hdCBzY2FsZSkge1xyXG5cdHJldHVybiBleHAyKHNjYWxlICogcG9zICogcG9zKTtcclxufVxyXG5cclxuLy8gMy10YXAgR2F1c3NpYW4gZmlsdGVyIGFsb25nIGhvcnogbGluZS5cclxudmVjMyBob3J6Myh2ZWMyIHBvcywgZmxvYXQgb2ZmKVxyXG57XHJcblx0dmVjMyBiID0gZmV0Y2gocG9zLCB2ZWMyKC0xLjAsIG9mZikpLnJnYjtcclxuXHR2ZWMzIGMgPSBmZXRjaChwb3MsIHZlYzIoIDAuMCwgb2ZmKSkucmdiO1xyXG5cdHZlYzMgZCA9IGZldGNoKHBvcywgdmVjMigrMS4wLCBvZmYpKS5yZ2I7XHJcblx0ZmxvYXQgZHN0ID0gZGlzdChwb3MpLng7XHJcblx0Ly8gQ29udmVydCBkaXN0YW5jZSB0byB3ZWlnaHQuXHJcblx0ZmxvYXQgc2NhbGUgPSBrSGFyZFBpeDtcclxuXHRmbG9hdCB3YiA9IGdhdXMoZHN0IC0gMS4wLCBzY2FsZSk7XHJcblx0ZmxvYXQgd2MgPSBnYXVzKGRzdCArIDAuMCwgc2NhbGUpO1xyXG5cdGZsb2F0IHdkID0gZ2F1cyhkc3QgKyAxLjAsIHNjYWxlKTtcclxuXHQvLyBSZXR1cm4gZmlsdGVyZWQgc2FtcGxlLlxyXG5cdHJldHVybiAoYiAqIHdiICsgYyAqIHdjICsgZCAqIHdkKSAvICh3YiArIHdjICsgd2QpO1xyXG59XHJcblxyXG4vLyA1LXRhcCBHYXVzc2lhbiBmaWx0ZXIgYWxvbmcgaG9yeiBsaW5lLlxyXG52ZWMzIGhvcno1KHZlYzIgcG9zLCBmbG9hdCBvZmYpXHJcbntcclxuXHR2ZWMzIGEgPSBmZXRjaChwb3MsIHZlYzIoLTIuMCwgb2ZmKSkucmdiO1xyXG5cdHZlYzMgYiA9IGZldGNoKHBvcywgdmVjMigtMS4wLCBvZmYpKS5yZ2I7XHJcblx0dmVjMyBjID0gZmV0Y2gocG9zLCB2ZWMyKCAwLjAsIG9mZikpLnJnYjtcclxuXHR2ZWMzIGQgPSBmZXRjaChwb3MsIHZlYzIoKzEuMCwgb2ZmKSkucmdiO1xyXG5cdHZlYzMgZSA9IGZldGNoKHBvcywgdmVjMigrMi4wLCBvZmYpKS5yZ2I7XHJcblx0ZmxvYXQgZHN0ID0gZGlzdChwb3MpLng7XHJcblx0Ly8gQ29udmVydCBkaXN0YW5jZSB0byB3ZWlnaHQuXHJcblx0ZmxvYXQgc2NhbGUgPSBrSGFyZFBpeDtcclxuXHRmbG9hdCB3YSA9IGdhdXMoZHN0IC0gMi4wLCBzY2FsZSk7XHJcblx0ZmxvYXQgd2IgPSBnYXVzKGRzdCAtIDEuMCwgc2NhbGUpO1xyXG5cdGZsb2F0IHdjID0gZ2F1cyhkc3QgKyAwLjAsIHNjYWxlKTtcclxuXHRmbG9hdCB3ZCA9IGdhdXMoZHN0ICsgMS4wLCBzY2FsZSk7XHJcblx0ZmxvYXQgd2UgPSBnYXVzKGRzdCArIDIuMCwgc2NhbGUpO1xyXG5cdC8vIFJldHVybiBmaWx0ZXJlZCBzYW1wbGUuXHJcblx0cmV0dXJuIChhICogd2EgKyBiICogd2IgKyBjICogd2MgKyBkICogd2QgKyBlICogd2UpIC8gKHdhICsgd2IgKyB3YyArIHdkICsgd2UpO1xyXG59XHJcblxyXG4vLyBSZXR1cm4gc2NhbmxpbmUgd2VpZ2h0LlxyXG5mbG9hdCBzY2FuKHZlYzIgcG9zLCBmbG9hdCBvZmYpIHtcclxuXHRmbG9hdCBkc3QgPSBkaXN0KHBvcykueTtcclxuXHRyZXR1cm4gZ2F1cyhkc3QgKyBvZmYsIHNIYXJkU2Nhbik7XHJcbn1cclxuXHJcbi8vIEFsbG93IG5lYXJlc3QgdGhyZWUgbGluZXMgdG8gZWZmZWN0IHBpeGVsLlxyXG52ZWMzIHRyaSh2ZWMyIHBvcylcclxue1xyXG5cdHZlYzMgYSA9IGhvcnozKHBvcywgLTEuMCk7XHJcblx0dmVjMyBiID0gaG9yejUocG9zLCAgMC4wKTtcclxuXHR2ZWMzIGMgPSBob3J6Myhwb3MsICsxLjApO1xyXG5cdGZsb2F0IHdhID0gc2Nhbihwb3MsIC0xLjApO1xyXG5cdGZsb2F0IHdiID0gc2Nhbihwb3MsICAwLjApO1xyXG5cdGZsb2F0IHdjID0gc2Nhbihwb3MsICsxLjApO1xyXG5cdHJldHVybiBhICogd2EgKyBiICogd2IgKyBjICogd2M7XHJcbn1cclxuXHJcbi8vIERpc3RvcnRpb24gb2Ygc2NhbmxpbmVzLCBhbmQgZW5kIG9mIHNjcmVlbiBhbHBoYS5cclxudmVjMiB3YXJwKHZlYzIgcG9zKVxyXG57XHJcblx0cG9zID0gcG9zICogMi4wIC0gMS4wO1xyXG5cdHBvcyAqPSB2ZWMyKFxyXG5cdFx0MS4wICsgKHBvcy55ICogcG9zLnkpICoga1dhcnAueCxcclxuXHRcdDEuMCArIChwb3MueCAqIHBvcy54KSAqIGtXYXJwLnlcclxuXHQpO1xyXG5cdHJldHVybiBwb3MgKiAwLjUgKyAwLjU7XHJcbn1cclxuXHJcbi8vIFNoYWRvdyBtYXNrLlxyXG52ZWMzIG1hc2sodmVjMiBwb3MpXHJcbntcclxuXHRwb3MueCArPSBwb3MueSAqIDMuMDtcclxuXHR2ZWMzIG1hc2sgPSB2ZWMzKGtNYXNrRGFyaywga01hc2tEYXJrLCBrTWFza0RhcmspO1xyXG5cdHBvcy54ID0gZnJhY3QocG9zLnggLyA2LjApO1xyXG5cdGlmIChwb3MueCA8IDAuMzMzKVxyXG5cdFx0bWFzay5yID0ga01hc2tMaWdodDtcclxuXHRlbHNlIGlmIChwb3MueCA8IDAuNjY2KVxyXG5cdFx0bWFzay5nID0ga01hc2tMaWdodDtcclxuXHRlbHNlXHJcblx0XHRtYXNrLmIgPSBrTWFza0xpZ2h0O1xyXG5cdHJldHVybiBtYXNrO1xyXG59XHJcblxyXG4vLyBEcmF3IGRpdmlkaW5nIGJhcnMuXHJcbmZsb2F0IGJhcihmbG9hdCBwb3MsIGZsb2F0IGJhcikge1xyXG5cdHBvcyAtPSBiYXI7XHJcblx0cmV0dXJuIChwb3MgKiBwb3MgPCA0LjApID8gMC4wIDogMS4wO1xyXG59XHJcblxyXG5mbG9hdCByYW5kKHZlYzIgY28pIHtcclxuXHRyZXR1cm4gZnJhY3Qoc2luKGRvdChjby54eSAsIHZlYzIoMTIuOTg5OCwgNzguMjMzKSkpICogNDM3NTguNTQ1Myk7XHJcbn1cclxuXHJcbi8vIEVudHJ5LlxyXG52b2lkIG1haW4oKVxyXG57XHJcbi8vICAgIHZlYzIgcG9zID0gd2FycChnbF9GcmFnQ29vcmQueHkgLyByZXNvbHV0aW9uLnh5KTtcclxuICAgIHZlYzIgcG9zID0gZ2xfRnJhZ0Nvb3JkLnh5IC8gcmVzb2x1dGlvbi54eTtcclxuICAgIFxyXG5cdCAgLy8gVW5tb2RpZmllZC5cclxuICAgIGlmKGdsX0ZyYWdDb29yZC54ID4gcmVzb2x1dGlvbi54ICogMC41KXtcclxuXHRcdHZlYzMgYyA9IHRyaShwb3MpICogbWFzayhnbF9GcmFnQ29vcmQueHkpO1xyXG4gICAgZ2xfRnJhZ0NvbG9yID0gdmVjNChcclxuICAgICAgICB0b1NyZ2IoYyksXHJcbiAgICAgICAgMS4wXHJcbiAgICApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHREaWZmdXNlLHZVdik7XHJcbiAgICB9XHJcbn1cclxuYDtcclxuXHJcbi8vICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSggMTkyMCwgMTA4MCApO1xyXG5sZXQgdW5pZm9ybXMgPSB7XHJcbiAgICAgIHREaWZmdXNlOiB7IHZhbHVlOiBudWxsIH0sXHJcbiAgICAgIHJlc29sdXRpb246IHsgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKCkgfSxcclxuXHRcdFx0dGltZTogICAgICAgeyB2YWx1ZTogMC4wIH1cclxuICAgIH07XHJcbi8vICAgICB1bmlmb3Jtcy5yZXNvbHV0aW9uLnZhbHVlLnggPSBXSURUSDtcclxuLy8gICAgIHVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUueSA9IEhFSUdIVDtcclxuLy8gICAgIGxldCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCgge1xyXG4vLyAgICAgICB1bmlmb3JtczogdW5pZm9ybXMsXHJcbi8vICAgICAgIHZlcnRleFNoYWRlcjogdmVydFNoYWRlcixcclxuLy8gICAgICAgZnJhZ21lbnRTaGFkZXI6IGZyYWdTaGFkZXJcclxuLy8gICAgIH0gKTtcclxuLy8gICAgIGxldCBtZXNoID0gbmV3IFRIUkVFLk1lc2goIGdlb21ldHJ5LCBtYXRlcmlhbCApO1xyXG4vLyAgICAgbWVzaC5wb3NpdGlvbi56ID0gLTUwMDA7XHJcbi8vICAgICBzY2VuZS5hZGQoIG1lc2ggKTtcclxuLy8gICB9XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTRkNydFNoYWRlclBhc3MgZXh0ZW5kcyBUSFJFRS5QYXNzIHtcclxuXHRjb25zdHJ1Y3Rvcih3aWR0aCxoZWlnaHQpe1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLnVuaWZvcm1zID0gVEhSRUUuVW5pZm9ybXNVdGlscy5jbG9uZSggdW5pZm9ybXMgKTtcclxuXHRcdHRoaXMudW5pZm9ybXMucmVzb2x1dGlvbi52YWx1ZS54ID0gd2lkdGg7XHJcblx0XHR0aGlzLnVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUueSA9IGhlaWdodDtcclxuXHRcdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcclxuXHRcdFx0dW5pZm9ybXM6IHRoaXMudW5pZm9ybXMsXHJcblx0XHRcdHZlcnRleFNoYWRlcjogdmVydGV4U2hhZGVyLFxyXG5cdFx0XHRmcmFnbWVudFNoYWRlcjogZnJhZ21lbnRTaGFkZXJcclxuXHRcdH0gKTtcclxuXHJcblx0XHR0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5PcnRob2dyYXBoaWNDYW1lcmEoLSAxLCAxLCAxLCAtIDEsIDAsIDEgKTtcclxuXHRcdHRoaXMuc2NlbmUgID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcblxyXG5cdFx0dGhpcy5xdWFkID0gbmV3IFRIUkVFLk1lc2goIG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KCAyLCAyICksIG51bGwgKTtcclxuXHRcdHRoaXMuc2NlbmUuYWRkKCB0aGlzLnF1YWQgKTtcclxuXHJcblx0fVxyXG5cclxuICBzZXRTaXplKHdpZHRoLGhlaWdodCl7XHJcblx0XHR0aGlzLnVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUueCA9IHdpZHRoO1xyXG5cdFx0dGhpcy51bmlmb3Jtcy5yZXNvbHV0aW9uLnZhbHVlLnkgPSBoZWlnaHQ7XHJcbiAgfVxyXG5cclxuXHRyZW5kZXIocmVuZGVyZXIsIHdyaXRlQnVmZmVyLCByZWFkQnVmZmVyLCBkZWx0YSwgbWFza0FjdGl2ZSl7XHJcblx0XHR0aGlzLnVuaWZvcm1zWyBcInREaWZmdXNlXCIgXS52YWx1ZSA9IHJlYWRCdWZmZXIudGV4dHVyZTtcclxuXHRcdHRoaXMucXVhZC5tYXRlcmlhbCA9IHRoaXMubWF0ZXJpYWw7XHJcblxyXG5cdFx0aWYgKCB0aGlzLnJlbmRlclRvU2NyZWVuICkge1xyXG5cclxuXHRcdFx0cmVuZGVyZXIucmVuZGVyKCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSApO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRyZW5kZXJlci5yZW5kZXIoIHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhLCB3cml0ZUJ1ZmZlciwgdGhpcy5jbGVhciApO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG59XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLy92YXIgU1RBR0VfTUFYID0gMTtcclxuaW1wb3J0IHNmZyBmcm9tICcuL2dsb2JhbC5qcyc7IFxyXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8uanMnO1xyXG4vL2ltcG9ydCAqIGFzIHNvbmcgZnJvbSAnLi9zb25nJztcclxuaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcy5qcyc7XHJcbmltcG9ydCAqIGFzIGlvIGZyb20gJy4vaW8uanMnO1xyXG5pbXBvcnQgKiBhcyBjb21tIGZyb20gJy4vY29tbS5qcyc7XHJcbmltcG9ydCAqIGFzIHRleHQgZnJvbSAnLi90ZXh0LmpzJztcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmouanMnO1xyXG5pbXBvcnQgKiBhcyBteXNoaXAgZnJvbSAnLi9teXNoaXAuanMnO1xyXG4vL2ltcG9ydCAqIGFzIGVuZW1pZXMgZnJvbSAnLi9lbmVtaWVzLmpzJztcclxuLy9pbXBvcnQgKiBhcyBlZmZlY3RvYmogZnJvbSAnLi9lZmZlY3RvYmouanMnO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vZXZlbnRFbWl0dGVyMy5qcyc7XHJcbmltcG9ydCB7c2VxRGF0YSxzb3VuZEVmZmVjdERhdGF9IGZyb20gJy4vc2VxRGF0YS5qcyc7XHJcbmltcG9ydCBTRkNydFNoYWRlclBhc3MgZnJvbSAnLi9zZkNydFNoYWRlclBhc3MuanMnO1xyXG5cclxuXHJcbmNsYXNzIFNjb3JlRW50cnkge1xyXG4gIGNvbnN0cnVjdG9yKG5hbWUsIHNjb3JlKSB7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5zY29yZSA9IHNjb3JlO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmNsYXNzIFN0YWdlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLk1BWCA9IDE7XHJcbiAgICB0aGlzLkRJRkZJQ1VMVFlfTUFYID0gMi4wO1xyXG4gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgICB0aGlzLmRpZmZpY3VsdHkgPSAxO1xyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLm5vID0gMTtcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAgIHRoaXMuZGlmZmljdWx0eSA9IDE7XHJcbiAgfVxyXG5cclxuICBhZHZhbmNlKCkge1xyXG4gICAgdGhpcy5ubysrO1xyXG4gICAgdGhpcy5wcml2YXRlTm8rKztcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICBqdW1wKHN0YWdlTm8pIHtcclxuICAgIHRoaXMubm8gPSBzdGFnZU5vO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSB0aGlzLm5vIC0gMTtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICBpZiAodGhpcy5kaWZmaWN1bHR5IDwgdGhpcy5ESUZGSUNVTFRZX01BWCkge1xyXG4gICAgICB0aGlzLmRpZmZpY3VsdHkgPSAxICsgMC4wNSAqICh0aGlzLm5vIC0gMSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucHJpdmF0ZU5vID49IHRoaXMuTUFYKSB7XHJcbiAgICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAvLyAgICB0aGlzLm5vID0gMTtcclxuICAgIH1cclxuICAgIHRoaXMuZW1pdCgndXBkYXRlJyx0aGlzKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHYW1lIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuQ09OU09MRV9XSURUSCA9IDA7XHJcbiAgICB0aGlzLkNPTlNPTEVfSEVJR0hUID0gMDtcclxuICAgIHRoaXMuUkVOREVSRVJfUFJJT1JJVFkgPSAxMDAwMDAgfCAwO1xyXG4gICAgdGhpcy5yZW5kZXJlciA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXRzID0gbnVsbDtcclxuICAgIHRoaXMuc2NlbmUgPSBudWxsO1xyXG4gICAgdGhpcy5jYW1lcmEgPSBudWxsO1xyXG4gICAgdGhpcy5hdXRob3IgPSBudWxsO1xyXG4gICAgdGhpcy5wcm9ncmVzcyA9IG51bGw7XHJcbiAgICB0aGlzLnRleHRQbGFuZSA9IG51bGw7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQgPSBuZXcgaW8uQmFzaWNJbnB1dCgpO1xyXG4gICAgdGhpcy50YXNrcyA9IG5ldyB1dGlsLlRhc2tzKCk7XHJcbiAgICBzZmcudGFza3MgPSB0aGlzLnRhc2tzO1xyXG4gICAgdGhpcy53YXZlR3JhcGggPSBudWxsO1xyXG4gICAgdGhpcy5zdGFydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5iYXNlVGltZSA9IG5ldyBEYXRlO1xyXG4gICAgdGhpcy5kID0gLTAuMjtcclxuICAgIHRoaXMuYXVkaW9fID0gbnVsbDtcclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbnVsbDtcclxuICAgIHRoaXMucGlhbm8gPSBudWxsO1xyXG4gICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICB0aGlzLmhpZ2hTY29yZSA9IDA7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBbXTtcclxuICAgIHRoaXMuaXNIaWRkZW4gPSBmYWxzZTtcclxuICAgIHRoaXMubXlzaGlwXyA9IG51bGw7XHJcbiAgICB0aGlzLmVuZW1pZXMgPSBudWxsO1xyXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSBudWxsO1xyXG4gICAgdGhpcy5QSSA9IE1hdGguUEk7XHJcbiAgICB0aGlzLmNvbW1fID0gbnVsbDtcclxuICAgIHRoaXMuaGFuZGxlTmFtZSA9ICcnO1xyXG4gICAgdGhpcy5zdG9yYWdlID0gbnVsbDtcclxuICAgIHRoaXMucmFuayA9IC0xO1xyXG4gICAgdGhpcy5zb3VuZEVmZmVjdHMgPSBudWxsO1xyXG4gICAgdGhpcy5lbnMgPSBudWxsO1xyXG4gICAgdGhpcy5lbmJzID0gbnVsbDtcclxuICAgIHRoaXMuc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcclxuICAgIHNmZy5zdGFnZSA9IHRoaXMuc3RhZ2U7XHJcbiAgICB0aGlzLnRpdGxlID0gbnVsbDsvLyDjgr/jgqTjg4jjg6vjg6Hjg4Pjgrfjg6VcclxuICAgIHRoaXMuc3BhY2VGaWVsZCA9IG51bGw7Ly8g5a6H5a6Z56m66ZaT44OR44O844OG44Kj44Kv44OrXHJcbiAgICB0aGlzLmVkaXRIYW5kbGVOYW1lID0gbnVsbDtcclxuICAgIHNmZy5hZGRTY29yZSA9IHRoaXMuYWRkU2NvcmUuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuY2hlY2tWaXNpYmlsaXR5QVBJKCk7XHJcbiAgICB0aGlzLmF1ZGlvXyA9IG5ldyBhdWRpby5BdWRpbygpO1xyXG4gIH1cclxuXHJcbiAgZXhlYygpIHtcclxuICAgIFxyXG4gICAgaWYgKCF0aGlzLmNoZWNrQnJvd3NlclN1cHBvcnQoJyNjb250ZW50Jykpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZXF1ZW5jZXIgPSBuZXcgYXVkaW8uU2VxdWVuY2VyKHRoaXMuYXVkaW9fKTtcclxuICAgIHRoaXMuc291bmRFZmZlY3RzID0gbmV3IGF1ZGlvLlNvdW5kRWZmZWN0cyh0aGlzLnNlcXVlbmNlcixzb3VuZEVmZmVjdERhdGEpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIod2luZG93LnZpc2liaWxpdHlDaGFuZ2UsIHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIHNmZy5nYW1lVGltZXIgPSBuZXcgdXRpbC5HYW1lVGltZXIodGhpcy5nZXRDdXJyZW50VGltZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLy8g44Ky44O844Og44Kz44Oz44K944O844Or44Gu5Yid5pyf5YyWXHJcbiAgICB0aGlzLmluaXRDb25zb2xlKCk7XHJcbiAgICB0aGlzLmxvYWRSZXNvdXJjZXMoKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy5wcm9ncmVzcy5tZXNoKTtcclxuICAgICAgICAvL3RoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgICAgICB0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xyXG4gICAgICAgIHRoaXMudGFza3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMuYmFzaWNJbnB1dC51cGRhdGUuYmluZCh0aGlzLmJhc2ljSW5wdXQpKTtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMuaW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1haW4oKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBjaGVja1Zpc2liaWxpdHlBUEkoKSB7XHJcbiAgICAvLyBoaWRkZW4g44OX44Ot44OR44OG44Kj44GK44KI44Gz5Y+v6KaW5oCn44Gu5aSJ5pu044Kk44OZ44Oz44OI44Gu5ZCN5YmN44KS6Kit5a6aXHJcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50LmhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikgeyAvLyBPcGVyYSAxMi4xMCDjgoQgRmlyZWZveCAxOCDku6XpmY3jgafjgrXjg53jg7zjg4ggXHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJoaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcInZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibW96SGlkZGVuXCI7XHJcbiAgICAgIHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlID0gXCJtb3p2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tc0hpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibXNIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIm1zdmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQud2Via2l0SGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJ3ZWJraXRIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIndlYmtpdHZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2FsY1NjcmVlblNpemUoKSB7XHJcbiAgICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHZhciBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICBpZiAod2lkdGggPj0gaGVpZ2h0KSB7XHJcbiAgICAgIHdpZHRoID0gaGVpZ2h0ICogc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQ7XHJcbiAgICAgIHdoaWxlICh3aWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XHJcbiAgICAgICAgLS1oZWlnaHQ7XHJcbiAgICAgICAgd2lkdGggPSBoZWlnaHQgKiBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgd2hpbGUgKGhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xyXG4gICAgICAgIC0td2lkdGg7XHJcbiAgICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5DT05TT0xFX1dJRFRIID0gd2lkdGg7XHJcbiAgICB0aGlzLkNPTlNPTEVfSEVJR0hUID0gaGVpZ2h0O1xyXG4gIH1cclxuICBcclxuICAvLy8g44Kz44Oz44K944O844Or55S76Z2i44Gu5Yid5pyf5YyWXHJcbiAgaW5pdENvbnNvbGUoY29uc29sZUNsYXNzKSB7XHJcbiAgICAvLyDjg6zjg7Pjg4Djg6njg7zjga7kvZzmiJBcclxuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7IGFudGlhbGlhczogZmFsc2UsIHNvcnRPYmplY3RzOiB0cnVlIH0pO1xyXG4gICAgdmFyIHJlbmRlcmVyID0gdGhpcy5yZW5kZXJlcjtcclxuICAgIHRoaXMuY2FsY1NjcmVlblNpemUoKTtcclxuICAgIHJlbmRlcmVyLnNldFNpemUodGhpcy5DT05TT0xFX1dJRFRILCB0aGlzLkNPTlNPTEVfSEVJR0hUKTtcclxuICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMCwgMSk7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ2NvbnNvbGUnO1xyXG4gICAgcmVuZGVyZXIuZG9tRWxlbWVudC5jbGFzc05hbWUgPSBjb25zb2xlQ2xhc3MgfHwgJ2NvbnNvbGUnO1xyXG4gICAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS56SW5kZXggPSAwO1xyXG5cclxuXHJcbiAgICBkMy5zZWxlY3QoJyNjb250ZW50Jykubm9kZSgpLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2FsY1NjcmVlblNpemUoKTtcclxuICAgICAgcmVuZGVyZXIuc2V0U2l6ZSh0aGlzLkNPTlNPTEVfV0lEVEgsIHRoaXMuQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgICB0aGlzLmNvbXBvc2VyLnNldFNpemUodGhpcy5DT05TT0xFX1dJRFRILCB0aGlzLkNPTlNPTEVfSEVJR0hUKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIOOCt+ODvOODs+OBruS9nOaIkFxyXG4gICAgdGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG5cclxuICAgIC8vIOOCq+ODoeODqeOBruS9nOaIkFxyXG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoc2ZnLkFOR0xFX09GX1ZJRVcsIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSBzZmcuQ0FNRVJBX1o7Ly9zZmcuVklSVFVBTF9IRUlHSFQgLyAoTWF0aC50YW4oMiAqIE1hdGguUEkgKiA1IC8gMzYwKSAqIDIpOy8vc2ZnLlZJUlRVQUxfSEVJR0hUIC8gMjtcclxuICAgIHRoaXMuY2FtZXJhLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XHJcblxyXG4gICAgLy8g44Op44Kk44OI44Gu5L2c5oiQXHJcbiAgICB2YXIgbGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZik7XHJcbiAgICBsaWdodC5wb3NpdGlvbi5zZXQoMC41NzcsIDAuNTc3LCAwLjU3Nyk7XHJcbiAgICB0aGlzLnNjZW5lLmFkZChsaWdodCk7XHJcblxyXG4gICAgdmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ODA4MDgwKTtcclxuICAgIHRoaXMuc2NlbmUuYWRkKGFtYmllbnQpO1xyXG4gICAgcmVuZGVyZXIuY2xlYXIoKTtcclxuXHJcbi8vICAgIHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWNcclxuICAgIHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIodGhpcy5yZW5kZXJlcik7XHJcbiAgICB0aGlzLmNvbXBvc2VyLnNldFNpemUodGhpcy5DT05TT0xFX1dJRFRILCB0aGlzLkNPTlNPTEVfSEVJR0hUKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlclBhc3MgPSBuZXcgVEhSRUUuUmVuZGVyUGFzcyh0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICB0aGlzLnJlbmRlclBhc3MuZW5hYmxlZCA9IHRydWU7XHJcbiAgICB0aGlzLnJlbmRlclBhc3MucmVuZGVyVG9TY3JlZW4gPSBmYWxzZTtcclxuICAgIHRoaXMuY29tcG9zZXIuYWRkUGFzcyh0aGlzLnJlbmRlclBhc3MpO1xyXG5cclxuXHJcbiAgICB0aGlzLmNydFNoYWRlclBhc3MgPSBuZXcgU0ZDcnRTaGFkZXJQYXNzKHRoaXMuQ09OU09MRV9XSURUSCx0aGlzLkNPTlNPTEVfSEVJR0hUKTtcclxuICAgIHRoaXMuY3J0U2hhZGVyUGFzcy5lbmJsZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5jcnRTaGFkZXJQYXNzLnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcclxuICAgIHRoaXMuY29tcG9zZXIuYWRkUGFzcyh0aGlzLmNydFNoYWRlclBhc3MpO1xyXG5cclxuXHJcbiAgfVxyXG5cclxuICAvLy8g44Ko44Op44O844Gn57WC5LqG44GZ44KL44CCXHJcbiAgRXhpdEVycm9yKGUpIHtcclxuICAgIC8vY3R4LmZpbGxTdHlsZSA9IFwicmVkXCI7XHJcbiAgICAvL2N0eC5maWxsUmVjdCgwLCAwLCBDT05TT0xFX1dJRFRILCBDT05TT0xFX0hFSUdIVCk7XHJcbiAgICAvL2N0eC5maWxsU3R5bGUgPSBcIndoaXRlXCI7XHJcbiAgICAvL2N0eC5maWxsVGV4dChcIkVycm9yIDogXCIgKyBlLCAwLCAyMCk7XHJcbiAgICAvLy8vYWxlcnQoZSk7XHJcbiAgICB0aGlzLnN0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aHJvdyBlO1xyXG4gIH1cclxuXHJcbiAgb25WaXNpYmlsaXR5Q2hhbmdlKCkge1xyXG4gICAgdmFyIGggPSBkb2N1bWVudFt0aGlzLmhpZGRlbl07XHJcbiAgICB0aGlzLmlzSGlkZGVuID0gaDtcclxuICAgIGlmIChoKSB7XHJcbiAgICAgIHRoaXMucGF1c2UoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVzdW1lKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwYXVzZSgpIHtcclxuICAgIGlmIChzZmcuZ2FtZVRpbWVyLnN0YXR1cyA9PSBzZmcuZ2FtZVRpbWVyLlNUQVJUKSB7XHJcbiAgICAgIHNmZy5nYW1lVGltZXIucGF1c2UoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNlcXVlbmNlci5zdGF0dXMgPT0gdGhpcy5zZXF1ZW5jZXIuUExBWSkge1xyXG4gICAgICB0aGlzLnNlcXVlbmNlci5wYXVzZSgpO1xyXG4gICAgfVxyXG4gICAgc2ZnLnBhdXNlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHJlc3VtZSgpIHtcclxuICAgIGlmIChzZmcuZ2FtZVRpbWVyLnN0YXR1cyA9PSBzZmcuZ2FtZVRpbWVyLlBBVVNFKSB7XHJcbiAgICAgIHNmZy5nYW1lVGltZXIucmVzdW1lKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zZXF1ZW5jZXIuc3RhdHVzID09IHRoaXMuc2VxdWVuY2VyLlBBVVNFKSB7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLnJlc3VtZSgpO1xyXG4gICAgfVxyXG4gICAgc2ZnLnBhdXNlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLy8g54++5Zyo5pmC6ZaT44Gu5Y+W5b6XXHJcbiAgZ2V0Q3VycmVudFRpbWUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdWRpb18uYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgfVxyXG5cclxuICAvLy8g44OW44Op44Km44K244Gu5qmf6IO944OB44Kn44OD44KvXHJcbiAgY2hlY2tCcm93c2VyU3VwcG9ydCgpIHtcclxuICAgIHZhciBjb250ZW50ID0gJzxpbWcgY2xhc3M9XCJlcnJvcmltZ1wiIHNyYz1cImh0dHA6Ly9wdWJsaWMuYmx1LmxpdmVmaWxlc3RvcmUuY29tL3kycGJZM2FxQno2d3o0YWg4N1JYRVZrNUNsaEQyTHVqQzVOczY2SEt2Ujg5YWpyRmRMTTBUeEZlcllZVVJ0ODNjX2JnMzVIU2txYzNFOEd4YUZEOC1YOTRNTHNGVjVHVTZCWXAxOTVJdmVnZXZRLzIwMTMxMDAxLnBuZz9wc2lkPTFcIiB3aWR0aD1cIjQ3OVwiIGhlaWdodD1cIjY0MFwiIGNsYXNzPVwiYWxpZ25ub25lXCIgLz4nO1xyXG4gICAgLy8gV2ViR0zjga7jgrXjg53jg7zjg4jjg4Hjgqfjg4Pjgq9cclxuICAgIGlmICghRGV0ZWN0b3Iud2ViZ2wpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYkdM44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXZWIgQXVkaW8gQVBJ44Op44OD44OR44O8XHJcbiAgICBpZiAoIXRoaXMuYXVkaW9fLmVuYWJsZSkge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViIEF1ZGlvIEFQSeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44OW44Op44Km44K244GMUGFnZSBWaXNpYmlsaXR5IEFQSSDjgpLjgrXjg53jg7zjg4jjgZfjgarjgYTloLTlkIjjgavorablkYogXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuaGlkZGVuID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+UGFnZSBWaXNpYmlsaXR5IEFQSeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWIgTG9jYWwgU3RvcmFnZeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiBcclxuICAvLy8g44Ky44O844Og44Oh44Kk44OzXHJcbiAgbWFpbigpIHtcclxuICAgIC8vIOOCv+OCueOCr+OBruWRvOOBs+WHuuOBl1xyXG4gICAgLy8g44Oh44Kk44Oz44Gr5o+P55S7XHJcbiAgICBpZiAodGhpcy5zdGFydCkge1xyXG4gICAgICB0aGlzLnRhc2tzLnByb2Nlc3ModGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBsb2FkUmVzb3VyY2VzKCkge1xyXG4gICAgLy8vIOOCsuODvOODoOS4reOBruODhuOCr+OCueODgeODo+ODvOWumue+qVxyXG4gICAgdmFyIHRleHR1cmVzID0ge1xyXG4gICAgICBmb250OiAnYmFzZS9ncmFwaGljL0ZvbnQucG5nJyxcclxuICAgICAgZm9udDE6ICdiYXNlL2dyYXBoaWMvRm9udDIucG5nJyxcclxuICAgICAgYXV0aG9yOiAnYmFzZS9ncmFwaGljL2F1dGhvci5wbmcnLFxyXG4gICAgICB0aXRsZTogJ2Jhc2UvZ3JhcGhpYy9USVRMRS5wbmcnXHJcbiAgICB9O1xyXG5cclxuICAgIC8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zjga7jg63jg7zjg4lcclxuICAgIHZhciBsb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG4gICAgZnVuY3Rpb24gbG9hZFRleHR1cmUoc3JjKSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgbG9hZGVyLmxvYWQoc3JjLCAodGV4dHVyZSkgPT4ge1xyXG4gICAgICAgICAgdGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgICAgICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgICAgICAgICByZXNvbHZlKHRleHR1cmUpO1xyXG4gICAgICAgIH0sIG51bGwsICh4aHIpID0+IHsgcmVqZWN0KHhocikgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0ZXhMZW5ndGggPSBPYmplY3Qua2V5cyh0ZXh0dXJlcykubGVuZ3RoO1xyXG4gICAgdmFyIHBlcmNlbnQgPSAxMDtcclxuXHJcbiAgICB0aGlzLnByb2dyZXNzID0gbmV3IGdyYXBoaWNzLlByb2dyZXNzKCk7XHJcbiAgICB0aGlzLnByb2dyZXNzLm1lc2gucG9zaXRpb24ueiA9IDAuMDAxO1xyXG4gICAgdGhpcy5wcm9ncmVzcy5yZW5kZXIoJ0xvYWRpbmcgUmVzb3VyY2VzIC4uLicsIHBlcmNlbnQpO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5wcm9ncmVzcy5tZXNoKTtcclxuICAgIC8vdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgdGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcclxuXHJcbiAgICB2YXIgbG9hZFByb21pc2UgPSB0aGlzLmF1ZGlvXy5yZWFkRHJ1bVNhbXBsZTtcclxuICAgIGZvciAodmFyIG4gaW4gdGV4dHVyZXMpIHtcclxuICAgICAgKChuYW1lLCB0ZXhQYXRoKSA9PiB7XHJcbiAgICAgICAgbG9hZFByb21pc2UgPSBsb2FkUHJvbWlzZVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbG9hZFRleHR1cmUoc2ZnLnJlc291cmNlQmFzZSArIHRleFBhdGgpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKCh0ZXgpID0+IHtcclxuICAgICAgICAgICAgcGVyY2VudCArPSAxMDsgXHJcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MucmVuZGVyKCdMb2FkaW5nIFJlc291cmNlcyAuLi4nLCBwZXJjZW50KTtcclxuICAgICAgICAgICAgc2ZnLnRleHR1cmVGaWxlc1tuYW1lXSA9IHRleDtcclxuICAgICAgICAgICAgLy90aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KShuLCB0ZXh0dXJlc1tuXSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZFByb21pc2UgPSBsb2FkUHJvbWlzZS50aGVuKHRoaXMubG9hZE1vZGVscy5iaW5kKHRoaXMpKTtcclxuICAgIFxyXG4gICAgcmV0dXJuIGxvYWRQcm9taXNlO1xyXG4gIH1cclxuXHJcbmxvYWRNb2RlbHMoKXtcclxuICBsZXQgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcclxuICB0aGlzLm1lc2hlcyA9IHt9O1xyXG4gIGxldCBtZXNoZXMgPSB7XHJcbiAgICAnbXlzaGlwJzonLi9kYXRhL215c2hpcC5qc29uJyxcclxuICAgICdidWxsZXQnOicuL2RhdGEvYnVsbGV0Lmpzb24nLFxyXG4gICAgJ2J1aWxkaW5nJzonLi9kYXRhL2J1aWxkaW5nLmpzb24nXHJcbiAgfTtcclxuICBsZXQgcHJvbWlzZXMgPSBQcm9taXNlLnJlc29sdmUoMCk7XHJcbiAgbGV0IG1lc2hlc18gPSB0aGlzLm1lc2hlcztcclxuICBsZXQgdGhpc18gPSB0aGlzO1xyXG4gIGZvcihsZXQgaSBpbiBtZXNoZXMpe1xyXG4gICAgcHJvbWlzZXMgPSBwcm9taXNlcy50aGVuKCgpPT57XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgICAgICBsb2FkZXIubG9hZChtZXNoZXNbaV0sIChnZW9tZXRyeSwgbWF0ZXJpYWxzKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBmYWNlTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTXVsdGlNYXRlcmlhbChtYXRlcmlhbHMpO1xyXG4gICAgICAgICAgICBtZXNoZXNfW2ldID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIGZhY2VNYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIG1lc2hlc19baV0ucm90YXRpb24uc2V0KDAsIDAsIDApO1xyXG4gICAgICAgICAgICBtZXNoZXNfW2ldLnBvc2l0aW9uLnNldCgwLCAwLCAwLjApO1xyXG4gICAgICAgICAgICBtZXNoZXNfW2ldLnNjYWxlLnNldCgxLDEsMSk7XHJcbiAgICAgICAgICAgIGxldCBwZXJjZW50ID0gdGhpc18ucHJvZ3Jlc3MucGVyY2VudCArIDEwO1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdXJjZXMgLi4uJywgcGVyY2VudCk7XHJcbiAgICAgICAgICAgIC8vdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xyXG5cclxuICAgICAgICAgICAgLy90aGlzXy5zY2VuZS5hZGQobWVzaGVzX1tpXSk7IC8vIOOCt+ODvOODs+OBuOODoeODg+OCt+ODpeOBrui/veWKoFxyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgcmV0dXJuIHByb21pc2VzO1xyXG59XHJcblxyXG4qcmVuZGVyKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRhc2tJbmRleCA+PSAwKXtcclxuICAgLy8gdGhpcy5jcnRTaGFkZXJQYXNzLnVuaWZvcm1zLnRpbWUudmFsdWUgKz0gMC4wMTtcclxuICAgIHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XHJcbi8vICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnJlbmRlcigpO1xyXG4gICAgdGhpcy5zdGF0cyAmJiB0aGlzLnN0YXRzLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfVxyXG59XHJcblxyXG5pbml0QWN0b3JzKClcclxue1xyXG4gIGxldCBwcm9taXNlcyA9IFtdO1xyXG4gIHRoaXMuc2NlbmUgPSB0aGlzLnNjZW5lIHx8IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIC8vdGhpcy5lbmVteUJ1bGxldHMgPSB0aGlzLmVuZW15QnVsbGV0cyB8fCBuZXcgZW5lbWllcy5FbmVteUJ1bGxldHModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICAvL3RoaXMuZW5lbWllcyA9IHRoaXMuZW5lbWllcyB8fCBuZXcgZW5lbWllcy5FbmVtaWVzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSwgdGhpcy5lbmVteUJ1bGxldHMpO1xyXG4gIC8vcHJvbWlzZXMucHVzaCh0aGlzLmVuZW1pZXMubG9hZFBhdHRlcm5zKCkpO1xyXG4gIC8vcHJvbWlzZXMucHVzaCh0aGlzLmVuZW1pZXMubG9hZEZvcm1hdGlvbnMoKSk7XHJcbiAgLy90aGlzLmJvbWJzID0gdGhpcy5ib21icyB8fCBuZXcgZWZmZWN0b2JqLkJvbWJzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgLy9zZmcuYm9tYiA9IHRoaXMuYm9tYnM7XHJcbiAgdGhpcy5teXNoaXBfID0gdGhpcy5teXNoaXBfIHx8IG5ldyBteXNoaXAuTXlTaGlwKDAsIC0xMDAsIDAuMSwgdGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICBzZmcubXlzaGlwXyA9IHRoaXMubXlzaGlwXztcclxuICB0aGlzLm15c2hpcF8ubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gIC8vIOiDjOaZr+aPj+eUu+OBruODhuOCueODiFxyXG4gIHRoaXMubWVzaGVzLmJ1aWxkaW5nLnBvc2l0aW9uLnogPSAtMzUwLjA7XHJcbiAgdGhpcy5tZXNoZXMuYnVpbGRpbmcucG9zaXRpb24ueSA9IDYwLjA7XHJcblxyXG4gIHRoaXMuYmFja2dyb3VuZHMgPSBbe21lc2g6dGhpcy5tZXNoZXMuYnVpbGRpbmcuY2xvbmUoKX0se21lc2g6dGhpcy5tZXNoZXMuYnVpbGRpbmcuY2xvbmUoKX1dO1xyXG4gIGxldCBia3MgPSB0aGlzLmJhY2tncm91bmRzO1xyXG4gIGJrcy5mb3JFYWNoKChiKT0+e1xyXG4gICBiLmJib3ggPSBuZXcgVEhSRUUuQm94MygpLnNldEZyb21PYmplY3QoYi5tZXNoKTtcclxuICAgYi5zaXplID0gYi5iYm94LmdldFNpemUoKTtcclxuICB9KTtcclxuICBcclxuICBia3NbMF0ubWVzaC5wb3NpdGlvbi55ID0gMDtcclxuICBia3NbMV0ubWVzaC5wb3NpdGlvbi55ID0gYmtzWzBdLnNpemUueTtcclxuXHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5iYWNrZ3JvdW5kc1swXS5tZXNoKTtcclxuICB0aGlzLnNjZW5lLmFkZCh0aGlzLmJhY2tncm91bmRzWzFdLm1lc2gpO1xyXG5cclxuXHJcblxyXG4gIC8vdGhpcy5zcGFjZUZpZWxkID0gbnVsbDtcclxuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG59XHJcblxyXG5pbml0Q29tbUFuZEhpZ2hTY29yZSgpXHJcbntcclxuICAvLyDjg4/jg7Pjg4njg6vjg43jg7zjg6Djga7lj5blvpdcclxuICB0aGlzLmhhbmRsZU5hbWUgPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSgnaGFuZGxlTmFtZScpO1xyXG5cclxuICB0aGlzLnRleHRQbGFuZSA9IG5ldyB0ZXh0LlRleHRQbGFuZSh0aGlzLnNjZW5lKTtcclxuICAvLyB0ZXh0UGxhbmUucHJpbnQoMCwgMCwgXCJXZWIgQXVkaW8gQVBJIFRlc3RcIiwgbmV3IFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIC8vIOOCueOCs+OCouaDheWgsSDpgJrkv6HnlKhcclxuICB0aGlzLmNvbW1fID0gbmV3IGNvbW0uQ29tbSgpO1xyXG4gIHRoaXMuY29tbV8udXBkYXRlSGlnaFNjb3JlcyA9IChkYXRhKSA9PiB7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBkYXRhO1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLmhpZ2hTY29yZXNbMF0uc2NvcmU7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21tXy51cGRhdGVIaWdoU2NvcmUgPSAoZGF0YSkgPT4ge1xyXG4gICAgaWYgKHRoaXMuaGlnaFNjb3JlIDwgZGF0YS5zY29yZSkge1xyXG4gICAgICB0aGlzLmhpZ2hTY29yZSA9IGRhdGEuc2NvcmU7XHJcbiAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbn1cclxuXHJcbippbml0KHRhc2tJbmRleCkge1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB0aGlzLmluaXRDb21tQW5kSGlnaFNjb3JlKCk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgdGhpcy5pbml0QWN0b3JzKClcclxuICAgIC50aGVuKCgpPT57XHJcbiAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5yZW5kZXIuYmluZCh0aGlzKSwgdGhpcy5SRU5ERVJFUl9QUklPUklUWSk7XHJcbiAgICAgIC8vdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMucHJpbnRBdXRob3IuYmluZCh0aGlzKSk7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vLyDkvZzogIXooajnpLpcclxuKnByaW50QXV0aG9yKHRhc2tJbmRleCkge1xyXG4gIGNvbnN0IHdhaXQgPSA2MDtcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgXHJcbiAgbGV0IG5leHRUYXNrID0gKCk9PntcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMuYXV0aG9yKTtcclxuICAgIC8vc2NlbmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICBcclxuICBsZXQgY2hlY2tLZXlJbnB1dCA9ICgpPT4ge1xyXG4gICAgaWYgKHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID4gMCB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQpIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gICAgICBuZXh0VGFzaygpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9ICBcclxuXHJcbiAgLy8g5Yid5pyf5YyWXHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3ID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSBzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZS5oZWlnaHQ7XHJcbiAgY2FudmFzLndpZHRoID0gdztcclxuICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgY3R4LmRyYXdJbWFnZShzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZSwgMCwgMCk7XHJcbiAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG5cclxuICBnZW9tZXRyeS52ZXJ0X3N0YXJ0ID0gW107XHJcbiAgZ2VvbWV0cnkudmVydF9lbmQgPSBbXTtcclxuXHJcbiAge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdzsgKyt4KSB7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcblxyXG4gICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGcgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYiA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBhID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgaWYgKGEgIT0gMCkge1xyXG4gICAgICAgICAgY29sb3Iuc2V0UkdCKHIgLyAyNTUuMCwgZyAvIDI1NS4wLCBiIC8gMjU1LjApO1xyXG4gICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSksICgoeSAtIGggLyAyKSkgKiAtMSwgMC4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0MiA9IG5ldyBUSFJFRS5WZWN0b3IzKDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwLCAxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCwgMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDApO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9zdGFydC5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHZlcnQyLnggLSB2ZXJ0LngsIHZlcnQyLnkgLSB2ZXJ0LnksIHZlcnQyLnogLSB2ZXJ0LnopKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9lbmQucHVzaCh2ZXJ0KTtcclxuICAgICAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIOODnuODhuODquOCouODq+OCkuS9nOaIkFxyXG4gIC8vdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCdpbWFnZXMvcGFydGljbGUxLnBuZycpO1xyXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7c2l6ZTogMjAsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiBmYWxzZS8vLCBtYXA6IHRleHR1cmVcclxuICB9KTtcclxuXHJcbiAgdGhpcy5hdXRob3IgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgLy8gICAgYXV0aG9yLnBvc2l0aW9uLnggYXV0aG9yLnBvc2l0aW9uLnk9ICA9MC4wLCAwLjAsIDAuMCk7XHJcblxyXG4gIC8vbWVzaC5zb3J0UGFydGljbGVzID0gZmFsc2U7XHJcbiAgLy92YXIgbWVzaDEgPSBuZXcgVEhSRUUuUGFydGljbGVTeXN0ZW0oKTtcclxuICAvL21lc2guc2NhbGUueCA9IG1lc2guc2NhbGUueSA9IDguMDtcclxuXHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5hdXRob3IpOyAgXHJcblxyXG4gXHJcbiAgLy8g5L2c6ICF6KGo56S644K544OG44OD44OX77yRXHJcbiAgZm9yKGxldCBjb3VudCA9IDEuMDtjb3VudCA+IDA7KGNvdW50IDw9IDAuMDEpP2NvdW50IC09IDAuMDAwNTpjb3VudCAtPSAwLjAwMjUpXHJcbiAge1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBlbmQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7XHJcbiAgICBsZXQgdiA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gICAgbGV0IGQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X3N0YXJ0O1xyXG4gICAgbGV0IHYyID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZbaV0ueCA9IHYyW2ldLnggKyBkW2ldLnggKiBjb3VudDtcclxuICAgICAgdltpXS55ID0gdjJbaV0ueSArIGRbaV0ueSAqIGNvdW50O1xyXG4gICAgICB2W2ldLnogPSB2MltpXS56ICsgZFtpXS56ICogY291bnQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5hdXRob3Iucm90YXRpb24ueCA9IHRoaXMuYXV0aG9yLnJvdGF0aW9uLnkgPSB0aGlzLmF1dGhvci5yb3RhdGlvbi56ID0gY291bnQgKiA0LjA7XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIHRoaXMuYXV0aG9yLnJvdGF0aW9uLnggPSB0aGlzLmF1dGhvci5yb3RhdGlvbi55ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueiA9IDAuMDtcclxuXHJcbiAgZm9yIChsZXQgaSA9IDAsZSA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNbaV0ueCA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLng7XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS55ID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmRbaV0ueTtcclxuICAgIHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnogPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X2VuZFtpXS56O1xyXG4gIH1cclxuICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAvLyDlvoXjgaFcclxuICBmb3IobGV0IGkgPSAwO2kgPCB3YWl0OysraSl7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplID4gMikge1xyXG4gICAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplIC09IDAuNTtcclxuICAgICAgdGhpcy5hdXRob3IubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfSAgICBcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuXHJcbiAgLy8g44OV44Kn44O844OJ44Ki44Km44OIXHJcbiAgZm9yKGxldCBjb3VudCA9IDAuMDtjb3VudCA8PSAxLjA7Y291bnQgKz0gMC4wNSlcclxuICB7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjAgLSBjb3VudDtcclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG5cclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMC4wOyBcclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gIC8vIOW+heOBoVxyXG4gIGZvcihsZXQgaSA9IDA7aSA8IHdhaXQ7KytpKXtcclxuICAgIC8vIOS9leOBi+OCreODvOWFpeWKm+OBjOOBguOBo+OBn+WgtOWQiOOBr+asoeOBruOCv+OCueOCr+OBuFxyXG4gICAgaWYoY2hlY2tLZXlJbnB1dCgpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIG5leHRUYXNrKCk7XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vnlLvpnaLliJ3mnJ/ljJYgLy8vXHJcbippbml0VGl0bGUodGFza0luZGV4KSB7XHJcbiAgXHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgXHJcbiAgdGhpcy5iYXNpY0lucHV0LmNsZWFyKCk7XHJcblxyXG4gIC8vIOOCv+OCpOODiOODq+ODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHNmZy50ZXh0dXJlRmlsZXMudGl0bGUgfSk7XHJcbiAgbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gIC8vbWF0ZXJpYWwuYW50aWFsaWFzID0gZmFsc2U7XHJcbiAgbWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xyXG4gIG1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuICBtYXRlcmlhbC5kZXB0aFRlc3QgPSB0cnVlO1xyXG4gIHRoaXMudGl0bGUgPSBuZXcgVEhSRUUuTWVzaChcclxuICAgIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2Uud2lkdGgsIHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2UuaGVpZ2h0KSxcclxuICAgIG1hdGVyaWFsXHJcbiAgICApO1xyXG4gIHRoaXMudGl0bGUuc2NhbGUueCA9IHRoaXMudGl0bGUuc2NhbGUueSA9IDAuODtcclxuICB0aGlzLnRpdGxlLnBvc2l0aW9uLnkgPSA4MDtcclxuICB0aGlzLnNjZW5lLmFkZCh0aGlzLnRpdGxlKTtcclxuICB0aGlzLnNob3dTcGFjZUZpZWxkKCk7XHJcbiAgLy8vIOODhuOCreOCueODiOihqOekulxyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIDI1LCBcIlB1c2ggeiBvciBTVEFSVCBidXR0b25cIiwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuc2hvd1RpdGxlLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMTAvKuenkiovO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUaXRsZS5iaW5kKHRoaXMpKTtcclxuICByZXR1cm47XHJcbn1cclxuXHJcbi8vLyDog4zmma/jg5Hjg7zjg4bjgqPjgq/jg6vooajnpLpcclxuc2hvd1NwYWNlRmllbGQoKSB7XHJcbiAgLy8vIOiDjOaZr+ODkeODvOODhuOCo+OCr+ODq+ihqOekulxyXG4gIGlmICghdGhpcy5zcGFjZUZpZWxkKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgICBnZW9tZXRyeS5lbmR5ID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1MDsgKytpKSB7XHJcbiAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG4gICAgICB2YXIgeiA9IC0xODAwLjAgKiBNYXRoLnJhbmRvbSgpIC0gMzAwLjA7XHJcbiAgICAgIGNvbG9yLnNldEhTTCgwLjA1ICsgTWF0aC5yYW5kb20oKSAqIDAuMDUsIDEuMCwgKC0yMTAwIC0geikgLyAtMjEwMCk7XHJcbiAgICAgIHZhciBlbmR5ID0gc2ZnLlZJUlRVQUxfSEVJR0hUIC8gMiAtIHogKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgdmFyIHZlcnQyID0gbmV3IFRIUkVFLlZlY3RvcjMoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpICogTWF0aC5yYW5kb20oKSAtICgoc2ZnLlZJUlRVQUxfV0lEVEggLSB6ICogMikgLyAyKVxyXG4gICAgICAgICwgZW5keSAqIDIgKiBNYXRoLnJhbmRvbSgpIC0gZW5keSwgeik7XHJcbiAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICBnZW9tZXRyeS5lbmR5LnB1c2goZW5keSk7XHJcblxyXG4gICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Oe44OG44Oq44Ki44Or44KS5L2c5oiQXHJcbiAgICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7XHJcbiAgICAgIHNpemU6IDQsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSwgdmVydGV4Q29sb3JzOiB0cnVlLCBkZXB0aFRlc3Q6IHRydWUvLywgbWFwOiB0ZXh0dXJlXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNwYWNlRmllbGQgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLnNwYWNlRmllbGQucG9zaXRpb24ueCA9IHRoaXMuc3BhY2VGaWVsZC5wb3NpdGlvbi55ID0gdGhpcy5zcGFjZUZpZWxkLnBvc2l0aW9uLnogPSAwLjA7XHJcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnNwYWNlRmllbGQpO1xyXG4gICAgdGhpcy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmVTcGFjZUZpZWxkLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOWuh+WumeepuumWk+OBruihqOekulxyXG4qbW92ZVNwYWNlRmllbGQodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodHJ1ZSl7XHJcbiAgICB2YXIgdmVydHMgPSB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkudmVydGljZXM7XHJcbiAgICB2YXIgZW5keXMgPSB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkuZW5keTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2ZXJ0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2ZXJ0c1tpXS55IC09IDQ7XHJcbiAgICAgIGlmICh2ZXJ0c1tpXS55IDwgLWVuZHlzW2ldKSB7XHJcbiAgICAgICAgdmVydHNbaV0ueSA9IGVuZHlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCv+OCpOODiOODq+ihqOekulxyXG4qc2hvd1RpdGxlKHRhc2tJbmRleCkge1xyXG4gd2hpbGUodHJ1ZSl7XHJcbiAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuXHJcbiAgaWYgKHRoaXMuYmFzaWNJbnB1dC56IHx8IHRoaXMuYmFzaWNJbnB1dC5zdGFydCApIHtcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMudGl0bGUpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdEhhbmRsZU5hbWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIGlmICh0aGlzLnNob3dUaXRsZS5lbmRUaW1lIDwgc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSkge1xyXG4gICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy50aXRsZSk7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VG9wMTAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIHlpZWxkO1xyXG4gfVxyXG59XHJcblxyXG4vLy8g44OP44Oz44OJ44Or44ON44O844Og44Gu44Ko44Oz44OI44Oq5YmN5Yid5pyf5YyWXHJcbippbml0SGFuZGxlTmFtZSh0YXNrSW5kZXgpIHtcclxuICBsZXQgZW5kID0gZmFsc2U7XHJcbiAgaWYgKHRoaXMuZWRpdEhhbmRsZU5hbWUpe1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuZ2FtZUluaXQuYmluZCh0aGlzKSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSB0aGlzLmhhbmRsZU5hbWUgfHwgJyc7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDQsIDE4LCAnSW5wdXQgeW91ciBoYW5kbGUgbmFtZS4nKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE5LCAnKE1heCA4IENoYXIpJyk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXMuZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgLy8gICAgdGV4dFBsYW5lLnByaW50KDEwLCAyMSwgaGFuZGxlTmFtZVswXSwgVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQudW5iaW5kKCk7XHJcbiAgICB2YXIgZWxtID0gZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnaW5wdXQnKTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICBlbG1cclxuICAgICAgLmF0dHIoJ3R5cGUnLCAndGV4dCcpXHJcbiAgICAgIC5hdHRyKCdwYXR0ZXJuJywgJ1thLXpBLVowLTlfXFxAXFwjXFwkXFwtXXswLDh9JylcclxuICAgICAgLmF0dHIoJ21heGxlbmd0aCcsIDgpXHJcbiAgICAgIC5hdHRyKCdpZCcsICdpbnB1dC1hcmVhJylcclxuICAgICAgLmF0dHIoJ3ZhbHVlJywgdGhpc18uZWRpdEhhbmRsZU5hbWUpXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgZC5ub2RlKCkuc2VsZWN0aW9uU3RhcnQgPSB0aGlzXy5lZGl0SGFuZGxlTmFtZS5sZW5ndGg7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGQzLmV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIC8vbGV0IHRoaXNfID0gdGhpcztcclxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7IHRoaXMuZm9jdXMoKTsgfSwgMTApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChkMy5ldmVudC5rZXlDb2RlID09IDEzKSB7XHJcbiAgICAgICAgICB0aGlzXy5lZGl0SGFuZGxlTmFtZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICBsZXQgcyA9IHRoaXMuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgICBsZXQgZSA9IHRoaXMuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwLCAyMSwgdGhpc18uZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgICBkMy5zZWxlY3QodGhpcykub24oJ2tleXVwJywgbnVsbCk7XHJcbiAgICAgICAgICB0aGlzXy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgICAgICAgIC8vIOOBk+OBruOCv+OCueOCr+OCkue1guOCj+OCieOBm+OCi1xyXG4gICAgICAgICAgdGhpc18udGFza3MuYXJyYXlbdGFza0luZGV4XS5nZW5JbnN0Lm5leHQoLSh0YXNrSW5kZXggKyAxKSk7XHJcbiAgICAgICAgICAvLyDmrKHjga7jgr/jgrnjgq/jgpLoqK3lrprjgZnjgotcclxuICAgICAgICAgIHRoaXNfLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpc18uZ2FtZUluaXQuYmluZCh0aGlzXykpO1xyXG4gICAgICAgICAgdGhpc18uc3RvcmFnZS5zZXRJdGVtKCdoYW5kbGVOYW1lJywgdGhpc18uZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KCcjaW5wdXQtYXJlYScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzXy5lZGl0SGFuZGxlTmFtZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsICcgICAgICAgICAgICcpO1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwgJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcclxuICAgICAgICBsZXQgcyA9IHRoaXMubm9kZSgpLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsICcgICAgICAgICAgICcpO1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwgJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgICB0aGlzLm5vZGUoKS5mb2N1cygpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMClcclxuICAgIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmNsZWFyKCk7XHJcbiAgICAgIGlmKHRoaXMuYmFzaWNJbnB1dC5hQnV0dG9uIHx8IHRoaXMuYmFzaWNJbnB1dC5zdGFydClcclxuICAgICAge1xyXG4gICAgICAgICAgdmFyIGlucHV0QXJlYSA9IGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKTtcclxuICAgICAgICAgIHZhciBpbnB1dE5vZGUgPSBpbnB1dEFyZWEubm9kZSgpO1xyXG4gICAgICAgICAgdGhpcy5lZGl0SGFuZGxlTmFtZSA9IGlucHV0Tm9kZS52YWx1ZTtcclxuICAgICAgICAgIGxldCBzID0gaW5wdXROb2RlLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgbGV0IGUgPSBpbnB1dE5vZGUuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgICBpbnB1dEFyZWEub24oJ2tleXVwJywgbnVsbCk7XHJcbiAgICAgICAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgICAgICAgLy8g44GT44Gu44K/44K544Kv44KS57WC44KP44KJ44Gb44KLXHJcbiAgICAgICAgICAvL3RoaXMudGFza3MuYXJyYXlbdGFza0luZGV4XS5nZW5JbnN0Lm5leHQoLSh0YXNrSW5kZXggKyAxKSk7XHJcbiAgICAgICAgICAvLyDmrKHjga7jgr/jgrnjgq/jgpLoqK3lrprjgZnjgotcclxuICAgICAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgdGhpcy5zdG9yYWdlLnNldEl0ZW0oJ2hhbmRsZU5hbWUnLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGlucHV0QXJlYS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybjsgICAgICAgIFxyXG4gICAgICB9XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgdGFza0luZGV4ID0gLSgrK3Rhc2tJbmRleCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44K544Kz44Ki5Yqg566XXHJcbmFkZFNjb3JlKHMpIHtcclxuICB0aGlzLnNjb3JlICs9IHM7XHJcbiAgaWYgKHRoaXMuc2NvcmUgPiB0aGlzLmhpZ2hTY29yZSkge1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLnNjb3JlO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCueOCs+OCouihqOekulxyXG5wcmludFNjb3JlKCkge1xyXG4gIHZhciBzID0gKCcwMDAwMDAwMCcgKyB0aGlzLnNjb3JlLnRvU3RyaW5nKCkpLnNsaWNlKC04KTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgxLCAxLCBzKTtcclxuXHJcbiAgdmFyIGggPSAoJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3JlLnRvU3RyaW5nKCkpLnNsaWNlKC04KTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgxMiwgMSwgaCk7XHJcblxyXG59XHJcblxyXG4vLy8g44K144Km44Oz44OJ44Ko44OV44Kn44Kv44OIXHJcbnNlKGluZGV4KSB7XHJcbiAgdGhpcy5zZXF1ZW5jZXIucGxheVRyYWNrcyh0aGlzLnNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbaW5kZXhdKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODoOOBruWIneacn+WMllxyXG4qZ2FtZUluaXQodGFza0luZGV4KSB7XHJcblxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG5cclxuICAvLyDjgqrjg7zjg4fjgqPjgqrjga7plovlp4tcclxuICB0aGlzLmF1ZGlvXy5zdGFydCgpO1xyXG4gIHRoaXMuc2VxdWVuY2VyLmxvYWQoc2VxRGF0YSk7XHJcbiAgdGhpcy5zZXF1ZW5jZXIuc3RhcnQoKTtcclxuICBzZmcuc3RhZ2UucmVzZXQoKTtcclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICAvL3RoaXMuZW5lbWllcy5yZXNldCgpO1xyXG5cclxuICAvLyDoh6rmqZ/jga7liJ3mnJ/ljJZcclxuICB0aGlzLm15c2hpcF8uaW5pdCgpO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLnNjb3JlID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgyLCAwLCAnU2NvcmUgICAgSGlnaCBTY29yZScpO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDIwLCAzOSwgJ1Jlc3Q6ICAgJyArIHNmZy5teXNoaXBfLnJlc3QpO1xyXG4gIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlSW5pdC5iaW5kKHRoaXMpLypnYW1lQWN0aW9uKi8pO1xyXG59XHJcblxyXG4vLy8g44K544OG44O844K444Gu5Yid5pyf5YyWXHJcbipzdGFnZUluaXQodGFza0luZGV4KSB7XHJcbiAgXHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgXHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMCwgMzksICdTdGFnZTonICsgc2ZnLnN0YWdlLm5vKTtcclxuICBzZmcuZ2FtZVRpbWVyLnN0YXJ0KCk7XHJcbiAgLy90aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuICAvL3RoaXMuZW5lbWllcy5zdGFydCgpO1xyXG4gIC8vdGhpcy5lbmVtaWVzLmNhbGNFbmVtaWVzQ291bnQoc2ZnLnN0YWdlLnByaXZhdGVObyk7XHJcbiAgLy90aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vLy8g44K544OG44O844K46ZaL5aeLXHJcbipzdGFnZVN0YXJ0KHRhc2tJbmRleCkge1xyXG4gIGxldCBlbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgd2hpbGUodGFza0luZGV4ID49IDAgJiYgZW5kVGltZSA+PSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKXtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICBzZmcubXlzaGlwXy5hY3Rpb24odGhpcy5iYXNpY0lucHV0KTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkOyAgICBcclxuICB9XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgMTUsICcgICAgICAgICAgICAgICAgICAnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lQWN0aW9uLmJpbmQodGhpcyksIDUwMDApO1xyXG59XHJcblxyXG4vLy8g44Ky44O844Og5LitXHJcbipnYW1lQWN0aW9uKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlICh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIHNmZy5teXNoaXBfLmFjdGlvbih0aGlzLmJhc2ljSW5wdXQpO1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIC8vIOiDjOaZr+OCueOCr+ODreODvOODq+ODhuOCueODiFxyXG4gICAgdGhpcy5iYWNrZ3JvdW5kcy5mb3JFYWNoKChiLGkpPT57XHJcbiAgICAgICAgYi5tZXNoLnBvc2l0aW9uLnkgLT0gMC4yNTtcclxuICAgICAgICBpZihiLm1lc2gucG9zaXRpb24ueSA8IC0yMDAuMCl7XHJcbiAgICAgICAgICAtLWk7XHJcbiAgICAgICAgICBpZihpIDwgMCkgaSA9IDE7XHJcbiAgICAgICAgICBsZXQgYmVmb3JlID0gdGhpcy5iYWNrZ3JvdW5kc1tpXTtcclxuICAgICAgICAgIGIubWVzaC5wb3NpdGlvbi55ID0gYmVmb3JlLm1lc2gucG9zaXRpb24ueSArIGJlZm9yZS5zaXplLnk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy9jb25zb2xlLmxvZyhzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKTtcclxuICAgIC8vdGhpcy5lbmVtaWVzLm1vdmUoKTtcclxuXHJcbiAgICAvLyBpZiAoIXRoaXMucHJvY2Vzc0NvbGxpc2lvbigpKSB7XHJcbiAgICAvLyAgIC8vIOmdouOCr+ODquOCouODgeOCp+ODg+OCr1xyXG4gICAgLy8gICBpZiAodGhpcy5lbmVtaWVzLmhpdEVuZW1pZXNDb3VudCA9PSB0aGlzLmVuZW1pZXMudG90YWxFbmVtaWVzQ291bnQpIHtcclxuICAgIC8vICAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIC8vICAgICB0aGlzLnN0YWdlLmFkdmFuY2UoKTtcclxuICAgIC8vICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZUluaXQuYmluZCh0aGlzKSk7XHJcbiAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9IGVsc2Uge1xyXG4gICAgLy8gICB0aGlzLm15U2hpcEJvbWIuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAzO1xyXG4gICAgLy8gICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5teVNoaXBCb21iLmJpbmQodGhpcykpO1xyXG4gICAgLy8gICByZXR1cm47XHJcbiAgICAvLyB9O1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7IFxyXG4gIH1cclxufVxyXG5cclxuLy8vIOW9k+OBn+OCiuWIpOWumlxyXG5wcm9jZXNzQ29sbGlzaW9uKHRhc2tJbmRleCkge1xyXG4gIC8vIC8v44CA6Ieq5qmf5by+44Go5pW144Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgLy8gbGV0IG15QnVsbGV0cyA9IHNmZy5teXNoaXBfLm15QnVsbGV0cztcclxuICAvLyB0aGlzLmVucyA9IHRoaXMuZW5lbWllcy5lbmVtaWVzO1xyXG4gIC8vIGZvciAodmFyIGkgPSAwLCBlbmQgPSBteUJ1bGxldHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAvLyAgIGxldCBteWIgPSBteUJ1bGxldHNbaV07XHJcbiAgLy8gICBpZiAobXliLmVuYWJsZV8pIHtcclxuICAvLyAgICAgdmFyIG15YmNvID0gbXlCdWxsZXRzW2ldLmNvbGxpc2lvbkFyZWE7XHJcbiAgLy8gICAgIHZhciBsZWZ0ID0gbXliY28ubGVmdCArIG15Yi54O1xyXG4gIC8vICAgICB2YXIgcmlnaHQgPSBteWJjby5yaWdodCArIG15Yi54O1xyXG4gIC8vICAgICB2YXIgdG9wID0gbXliY28udG9wICsgbXliLnk7XHJcbiAgLy8gICAgIHZhciBib3R0b20gPSBteWJjby5ib3R0b20gLSBteWIuc3BlZWQgKyBteWIueTtcclxuICAvLyAgICAgZm9yICh2YXIgaiA9IDAsIGVuZGogPSB0aGlzLmVucy5sZW5ndGg7IGogPCBlbmRqOyArK2opIHtcclxuICAvLyAgICAgICB2YXIgZW4gPSB0aGlzLmVuc1tqXTtcclxuICAvLyAgICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gIC8vICAgICAgICAgdmFyIGVuY28gPSBlbi5jb2xsaXNpb25BcmVhO1xyXG4gIC8vICAgICAgICAgaWYgKHRvcCA+IChlbi55ICsgZW5jby5ib3R0b20pICYmXHJcbiAgLy8gICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgLy8gICAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgLy8gICAgICAgICAgIChlbi54ICsgZW5jby5sZWZ0KSA8IHJpZ2h0XHJcbiAgLy8gICAgICAgICAgICkge1xyXG4gIC8vICAgICAgICAgICBlbi5oaXQobXliKTtcclxuICAvLyAgICAgICAgICAgaWYgKG15Yi5wb3dlciA8PSAwKSB7XHJcbiAgLy8gICAgICAgICAgICAgbXliLmVuYWJsZV8gPSBmYWxzZTtcclxuICAvLyAgICAgICAgICAgfVxyXG4gIC8vICAgICAgICAgICBicmVhaztcclxuICAvLyAgICAgICAgIH1cclxuICAvLyAgICAgICB9XHJcbiAgLy8gICAgIH1cclxuICAvLyAgIH1cclxuICAvLyB9XHJcblxyXG4gIC8vIC8vIOaVteOBqOiHquapn+OBqOOBruOBguOBn+OCiuWIpOWumlxyXG4gIC8vIGlmIChzZmcuQ0hFQ0tfQ09MTElTSU9OKSB7XHJcbiAgLy8gICBsZXQgbXljbyA9IHNmZy5teXNoaXBfLmNvbGxpc2lvbkFyZWE7XHJcbiAgLy8gICBsZXQgbGVmdCA9IHNmZy5teXNoaXBfLnggKyBteWNvLmxlZnQ7XHJcbiAgLy8gICBsZXQgcmlnaHQgPSBteWNvLnJpZ2h0ICsgc2ZnLm15c2hpcF8ueDtcclxuICAvLyAgIGxldCB0b3AgPSBteWNvLnRvcCArIHNmZy5teXNoaXBfLnk7XHJcbiAgLy8gICBsZXQgYm90dG9tID0gbXljby5ib3R0b20gKyBzZmcubXlzaGlwXy55O1xyXG5cclxuICAvLyAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLmVucy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gIC8vICAgICBsZXQgZW4gPSB0aGlzLmVuc1tpXTtcclxuICAvLyAgICAgaWYgKGVuLmVuYWJsZV8pIHtcclxuICAvLyAgICAgICBsZXQgZW5jbyA9IGVuLmNvbGxpc2lvbkFyZWE7XHJcbiAgLy8gICAgICAgaWYgKHRvcCA+IChlbi55ICsgZW5jby5ib3R0b20pICYmXHJcbiAgLy8gICAgICAgICAoZW4ueSArIGVuY28udG9wKSA+IGJvdHRvbSAmJlxyXG4gIC8vICAgICAgICAgbGVmdCA8IChlbi54ICsgZW5jby5yaWdodCkgJiZcclxuICAvLyAgICAgICAgIChlbi54ICsgZW5jby5sZWZ0KSA8IHJpZ2h0XHJcbiAgLy8gICAgICAgICApIHtcclxuICAvLyAgICAgICAgIGVuLmhpdChteXNoaXApO1xyXG4gIC8vICAgICAgICAgc2ZnLm15c2hpcF8uaGl0KCk7XHJcbiAgLy8gICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAvLyAgICAgICB9XHJcbiAgLy8gICAgIH1cclxuICAvLyAgIH1cclxuICAvLyAgIC8vIOaVteW8vuOBqOiHquapn+OBqOOBruOBguOBn+OCiuWIpOWumlxyXG4gIC8vICAgdGhpcy5lbmJzID0gdGhpcy5lbmVteUJ1bGxldHMuZW5lbXlCdWxsZXRzO1xyXG4gIC8vICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5icy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gIC8vICAgICBsZXQgZW4gPSB0aGlzLmVuYnNbaV07XHJcbiAgLy8gICAgIGlmIChlbi5lbmFibGUpIHtcclxuICAvLyAgICAgICBsZXQgZW5jbyA9IGVuLmNvbGxpc2lvbkFyZWE7XHJcbiAgLy8gICAgICAgaWYgKHRvcCA+IChlbi55ICsgZW5jby5ib3R0b20pICYmXHJcbiAgLy8gICAgICAgICAoZW4ueSArIGVuY28udG9wKSA+IGJvdHRvbSAmJlxyXG4gIC8vICAgICAgICAgbGVmdCA8IChlbi54ICsgZW5jby5yaWdodCkgJiZcclxuICAvLyAgICAgICAgIChlbi54ICsgZW5jby5sZWZ0KSA8IHJpZ2h0XHJcbiAgLy8gICAgICAgICApIHtcclxuICAvLyAgICAgICAgIGVuLmhpdCgpO1xyXG4gIC8vICAgICAgICAgc2ZnLm15c2hpcF8uaGl0KCk7XHJcbiAgLy8gICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAvLyAgICAgICB9XHJcbiAgLy8gICAgIH1cclxuICAvLyAgIH1cclxuXHJcbiAgLy8gfVxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8vIOiHquapn+eIhueZuiBcclxuLy8gKm15U2hpcEJvbWIodGFza0luZGV4KSB7XHJcbi8vICAgd2hpbGUoc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSA8PSB0aGlzLm15U2hpcEJvbWIuZW5kVGltZSAmJiB0YXNrSW5kZXggPj0gMCl7XHJcbi8vICAgICB0aGlzLmVuZW1pZXMubW92ZSgpO1xyXG4vLyAgICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuLy8gICAgIHRhc2tJbmRleCA9IHlpZWxkOyAgXHJcbi8vICAgfVxyXG4vLyAgIHNmZy5teXNoaXBfLnJlc3QtLTtcclxuLy8gICBpZiAoc2ZnLm15c2hpcF8ucmVzdCA8PSAwKSB7XHJcbi8vICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCwgMTgsICdHQU1FIE9WRVInLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuLy8gICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4vLyAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbi8vICAgICBpZih0aGlzLmNvbW1fLmVuYWJsZSl7XHJcbi8vICAgICAgIHRoaXMuY29tbV8uc29ja2V0Lm9uKCdzZW5kUmFuaycsIHRoaXMuY2hlY2tSYW5rSW4pO1xyXG4vLyAgICAgICB0aGlzLmNvbW1fLnNlbmRTY29yZShuZXcgU2NvcmVFbnRyeSh0aGlzLmVkaXRIYW5kbGVOYW1lLCB0aGlzLnNjb3JlKSk7XHJcbi8vICAgICB9XHJcbi8vICAgICB0aGlzLmdhbWVPdmVyLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgNTtcclxuLy8gICAgIHRoaXMucmFuayA9IC0xO1xyXG4vLyAgICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuZ2FtZU92ZXIuYmluZCh0aGlzKSk7XHJcbi8vICAgICB0aGlzLnNlcXVlbmNlci5zdG9wKCk7XHJcbi8vICAgfSBlbHNlIHtcclxuLy8gICAgIHNmZy5teXNoaXBfLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbi8vICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuLy8gICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE1LCAnU3RhZ2UgJyArIChzZmcuc3RhZ2Uubm8pICsgJyBTdGFydCAhIScsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4vLyAgICAgdGhpcy5zdGFnZVN0YXJ0LmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMjtcclxuLy8gICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlU3RhcnQuYmluZCh0aGlzKSk7XHJcbi8vICAgfVxyXG4vLyB9XHJcblxyXG4vLy8g44Ky44O844Og44Kq44O844OQ44O8XHJcbipnYW1lT3Zlcih0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0aGlzLmdhbWVPdmVyLmVuZFRpbWUgPj0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSAmJiB0YXNrSW5kZXggPj0gMClcclxuICB7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfVxyXG4gIFxyXG5cclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICAvL3RoaXMuZW5lbWllcy5yZXNldCgpO1xyXG4gIC8vdGhpcy5lbmVteUJ1bGxldHMucmVzZXQoKTtcclxuICBpZiAodGhpcy5yYW5rID49IDApIHtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUb3AxMC5iaW5kKHRoaXMpKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODqeODs+OCreODs+OCsOOBl+OBn+OBi+OBqeOBhuOBi+OBruODgeOCp+ODg+OCr1xyXG5jaGVja1JhbmtJbihkYXRhKSB7XHJcbiAgdGhpcy5yYW5rID0gZGF0YS5yYW5rO1xyXG59XHJcblxyXG5cclxuLy8vIOODj+OCpOOCueOCs+OCouOCqOODs+ODiOODquOBruihqOekulxyXG5wcmludFRvcDEwKCkge1xyXG4gIHZhciByYW5rbmFtZSA9IFsnIDFzdCcsICcgMm5kJywgJyAzcmQnLCAnIDR0aCcsICcgNXRoJywgJyA2dGgnLCAnIDd0aCcsICcgOHRoJywgJyA5dGgnLCAnMTB0aCddO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDQsICdUb3AgMTAgU2NvcmUnKTtcclxuICB2YXIgeSA9IDg7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuaGlnaFNjb3Jlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIHNjb3JlU3RyID0gJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3Jlc1tpXS5zY29yZTtcclxuICAgIHNjb3JlU3RyID0gc2NvcmVTdHIuc3Vic3RyKHNjb3JlU3RyLmxlbmd0aCAtIDgsIDgpO1xyXG4gICAgaWYgKHRoaXMucmFuayA9PSBpKSB7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyB0aGlzLmhpZ2hTY29yZXNbaV0ubmFtZSwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCB5LCByYW5rbmFtZVtpXSArICcgJyArIHNjb3JlU3RyICsgJyAnICsgdGhpcy5oaWdoU2NvcmVzW2ldLm5hbWUpO1xyXG4gICAgfVxyXG4gICAgeSArPSAyO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbippbml0VG9wMTAodGFza0luZGV4KSB7XHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5wcmludFRvcDEwKCk7XHJcbiAgdGhpcy5zaG93VG9wMTAuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyA1O1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUb3AxMC5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuKnNob3dUb3AxMCh0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0aGlzLnNob3dUb3AxMC5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPT0gMCAmJiB0YXNrSW5kZXggPj0gMClcclxuICB7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfSBcclxuICBcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG59XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLy92YXIgU1RBR0VfTUFYID0gMTtcclxuaW1wb3J0IHNmZyBmcm9tICcuL2dsb2JhbC5qcyc7IFxyXG4vLyBpbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8uanMnO1xyXG4vLyAvL2ltcG9ydCAqIGFzIHNvbmcgZnJvbSAnLi9zb25nJztcclxuLy8gaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcy5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIGlvIGZyb20gJy4vaW8uanMnO1xyXG4vLyBpbXBvcnQgKiBhcyBjb21tIGZyb20gJy4vY29tbS5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIHRleHQgZnJvbSAnLi90ZXh0LmpzJztcclxuLy8gaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmouanMnO1xyXG4vLyBpbXBvcnQgKiBhcyBteXNoaXAgZnJvbSAnLi9teXNoaXAuanMnO1xyXG4vLyBpbXBvcnQgKiBhcyBlbmVtaWVzIGZyb20gJy4vZW5lbWllcy5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIGVmZmVjdG9iaiBmcm9tICcuL2VmZmVjdG9iai5qcyc7XHJcbmltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUuanMnO1xyXG5cclxuLy8vIOODoeOCpOODs1xyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gIGxldCByZWcgPSBuZXcgUmVnRXhwKCcoLipcXC8pJyk7XHJcbiAgbGV0IHIgPSByZWcuZXhlYyh3aW5kb3cubG9jYXRpb24uaHJlZik7XHJcbiAgbGV0IHJvb3QgPSByWzFdO1xyXG4gIGlmKHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9kZXZ2ZXIvKSl7XHJcbiAgICBzZmcucmVzb3VyY2VCYXNlID0gJy4uLy4uL2Rpc3QvcmVzLyc7XHJcbiAgfSBlbHNlIHtcclxuICAgIHNmZy5yZXNvdXJjZUJhc2UgPSAnLi9yZXMvJztcclxuICB9XHJcbiAgc2ZnLmdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gIHNmZy5nYW1lLmV4ZWMoKTtcclxufTtcclxuIl0sIm5hbWVzIjpbInRoaXMiLCJsemJhc2U2MiIsImdhbWVvYmouR2FtZU9iaiIsImlvLkJhc2ljSW5wdXQiLCJ1dGlsLlRhc2tzIiwiYXVkaW8uQXVkaW8iLCJhdWRpby5TZXF1ZW5jZXIiLCJhdWRpby5Tb3VuZEVmZmVjdHMiLCJ1dGlsLkdhbWVUaW1lciIsImdyYXBoaWNzLlByb2dyZXNzIiwibXlzaGlwLk15U2hpcCIsInRleHQuVGV4dFBsYW5lIiwiY29tbS5Db21tIiwidGV4dC5UZXh0QXR0cmlidXRlIl0sIm1hcHBpbmdzIjoiOzs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUNBLE1BQU0sUUFBUSxDQUFDO0VBQ2IsV0FBVyxHQUFHO0lBQ1osSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDdEIsSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUM7SUFDM0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7SUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7SUFDNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0RixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFB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QUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO01BQzFELEtBQUssQ0FBQyxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDOUQsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDbEUsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO01BQ3RFLEtBQUssQ0FBQyxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDMUUsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7S0FDL0U7O0lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUNsRCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7SUFFRCxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDLE1BQU07SUFDTCxJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTTtRQUN6QixDQUFDLENBQUM7O0lBRU4sS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7TUFDM0IsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztNQUVwRixRQUFRLEdBQUc7UUFDVCxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQzFELEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQzlELEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUNsRTtVQUNFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3RCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUM1Qjs7VUFFRCxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO09BQ3JEO0tBQ0Y7R0FDRjs7RUFFRCxPQUFPLElBQUksQ0FBQztDQUNiLENBQUM7Ozs7Ozs7Ozs7QUFVRixZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRTtFQUMxRCxJQUFJLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQztNQUN0QyxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDOztFQUUxQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNwRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztPQUNoRDtJQUNILElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHO01BQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUTtLQUM1QixDQUFDO0dBQ0g7O0VBRUQsT0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOzs7Ozs7Ozs7O0FBVUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUU7RUFDOUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxJQUFJLEVBQUUsSUFBSSxDQUFDO01BQzVDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0VBRTFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3BFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO09BQ2hEO0lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUc7TUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRO0tBQzVCLENBQUM7R0FDSDs7RUFFRCxPQUFPLElBQUksQ0FBQztDQUNiLENBQUM7Ozs7Ozs7Ozs7OztBQVlGLFlBQVksQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFNBQVMsY0FBYyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtFQUN4RixJQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0VBRTFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQzs7RUFFckQsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7TUFDN0IsTUFBTSxHQUFHLEVBQUUsQ0FBQzs7RUFFaEIsSUFBSSxFQUFFLEVBQUU7SUFDTixJQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUU7TUFDaEI7V0FDSyxTQUFTLENBQUMsRUFBRSxLQUFLLEVBQUU7WUFDbEIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztZQUN4QixPQUFPLElBQUksU0FBUyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUM7UUFDN0M7UUFDQSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ3hCO0tBQ0YsTUFBTTtNQUNMLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDMUQ7YUFDSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUU7Y0FDckIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztjQUMzQixPQUFPLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUM7VUFDaEQ7VUFDQSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNCO09BQ0Y7S0FDRjtHQUNGOzs7OztFQUtELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtJQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7R0FDOUQsTUFBTTtJQUNMLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUMxQjs7RUFFRCxPQUFPLElBQUksQ0FBQztDQUNiLENBQUM7Ozs7Ozs7O0FBUUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLGtCQUFrQixDQUFDLEtBQUssRUFBRTtFQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLElBQUksQ0FBQzs7RUFFL0IsSUFBSSxLQUFLLEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDO09BQzNELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztFQUV0RCxPQUFPLElBQUksQ0FBQztDQUNiLENBQUM7Ozs7O0FBS0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7QUFDbkUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Ozs7O0FBSy9ELFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFNBQVMsZUFBZSxHQUFHO0VBQ2xFLE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7QUFLRixZQUFZLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQzs7Ozs7QUFLL0IsSUFBSSxXQUFXLEtBQUssT0FBTyxNQUFNLEVBQUU7RUFDakMsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7Q0FDL0I7O0FDalFNLE1BQU0sSUFBSSxDQUFDO0VBQ2hCLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO0lBQzVCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxJQUFJLEtBQUssQ0FBQztJQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQzs7SUFFdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7R0FDaEI7O0NBRUY7O0FBRUQsQUFBTyxJQUFJLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQzs7O0FBR2xELEFBQU8sTUFBTSxLQUFLLFNBQVMsWUFBWSxDQUFDO0VBQ3RDLFdBQVcsRUFBRTtJQUNYLEtBQUssRUFBRSxDQUFDO0lBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUN0QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztJQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztHQUN0Qjs7RUFFRCxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRO0VBQ3BDO0lBQ0UsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ1gsS0FBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNwQjtJQUNELEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDO01BQ3RDLFNBQVM7S0FDVjtJQUNELElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztHQUN0Qjs7RUFFRCxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRTtJQUMxQixJQUFJLENBQUMsQ0FBQztJQUNOLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtNQUMxQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFO1FBQzdCLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDWixPQUFPLENBQUMsQ0FBQztPQUNWO0tBQ0Y7SUFDRCxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEQsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxDQUFDO0dBQ1Y7OztFQUdELFFBQVEsR0FBRztJQUNULE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztHQUNuQjs7RUFFRCxLQUFLLEdBQUc7SUFDTixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7R0FDdkI7O0VBRUQsU0FBUyxHQUFHO0lBQ1YsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO01BQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUM5QixHQUFHLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxDQUFDO09BQ1YsQ0FBQyxDQUFDOztNQUVILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQ2pELElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztPQUN6QjtLQUNGLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0tBQ3RCO0dBQ0Y7O0VBRUQsVUFBVSxDQUFDLEtBQUssRUFBRTtJQUNoQixHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7TUFDWCxLQUFLLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3BCO0lBQ0QsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUM7TUFDdEMsU0FBUztLQUNWO0lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUM7SUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7R0FDMUI7O0VBRUQsUUFBUSxHQUFHO0lBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7TUFDdEIsT0FBTztLQUNSO0lBQ0QsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNyQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO01BQ3ZCLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUM7TUFDeEIsR0FBRyxHQUFHLENBQUM7UUFDTCxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsRUFBRSxDQUFDO09BQ3ZCO01BQ0QsT0FBTyxHQUFHLENBQUM7S0FDWixDQUFDLENBQUM7SUFDSCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNsQixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztHQUMzQjs7RUFFRCxPQUFPLENBQUMsSUFBSTtFQUNaO0lBQ0UsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO01BQ2IscUJBQXFCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7TUFDcEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7TUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUU7UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtVQUNsQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7VUFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJO1lBQzdCLElBQUksSUFBSSxJQUFJLFFBQVEsRUFBRTtjQUNwQixHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFFO2dCQUNsQixTQUFTO2VBQ1Y7Y0FDRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDL0I7V0FDRixDQUFDLENBQUM7VUFDSCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDakI7T0FDRjtLQUNGLE1BQU07TUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO01BQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0tBQ3JCO0dBQ0Y7O0VBRUQsV0FBVyxFQUFFO0lBQ1gsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUc7TUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7TUFDcEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSTtRQUNwQixPQUFPLEVBQUUsQ0FBQztPQUNYLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKO0NBQ0Y7OztBQUdELEFBQU8sTUFBTSxTQUFTLENBQUM7RUFDckIsV0FBVyxDQUFDLGNBQWMsRUFBRTtJQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztJQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztJQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7SUFDckMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7SUFDZCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDOztHQUVoQjs7RUFFRCxLQUFLLEdBQUc7SUFDTixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztJQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7R0FDMUI7O0VBRUQsTUFBTSxHQUFHO0lBQ1AsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3BDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMvRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7R0FDMUI7O0VBRUQsS0FBSyxHQUFHO0lBQ04sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0dBQzFCOztFQUVELElBQUksR0FBRztJQUNMLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztHQUN6Qjs7RUFFRCxNQUFNLEdBQUc7SUFDUCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPO0lBQ3RDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzVDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3JELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO0dBQzVCO0NBQ0Y7O0FDOUxELGFBQWU7RUFDYixJQUFJLEVBQUUsTUFBTTtFQUNaLElBQUksRUFBRSxNQUFNO0VBQ1osTUFBTSxFQUFFLFFBQVE7RUFDaEIsV0FBVyxFQUFFLGFBQWE7RUFDMUIsVUFBVSxFQUFFLFlBQVk7RUFDeEIsWUFBWSxFQUFFLGNBQWM7RUFDNUIsWUFBWSxFQUFFLGNBQWM7RUFDNUIsS0FBSyxFQUFFLE9BQU87RUFDZCxZQUFZLEVBQUUsY0FBYztFQUM1QixTQUFTLEVBQUUsV0FBVztFQUN0QixRQUFRLEVBQUUsVUFBVTtFQUNwQixPQUFPLEVBQUUsU0FBUztFQUNsQixJQUFJLENBQUMsTUFBTTtFQUNYLFFBQVEsQ0FBQyxVQUFVO0VBQ25CLFFBQVEsQ0FBQyxVQUFVO0NBQ3BCLENBQUM7O0FDaEJhLE1BQU0sT0FBTyxDQUFDO0VBQzNCLFdBQVcsQ0FBQyxNQUFNLEVBQUU7SUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7R0FDaEI7O0VBRUQsT0FBTyxHQUFHO0lBQ1IsT0FBTyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0dBQ3hDOztFQUVELElBQUksR0FBRztJQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUM3Qzs7RUFFRCxJQUFJLEdBQUc7SUFDTCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUMvQzs7RUFFRCxPQUFPLEdBQUc7SUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO01BQ3pDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0tBQ2pCO0dBQ0Y7O0VBRUQsS0FBSyxDQUFDLE9BQU8sRUFBRTtJQUNiLElBQUksT0FBTyxZQUFZLE1BQU0sRUFBRTtNQUM3QixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDbEM7SUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxPQUFPLENBQUM7R0FDaEM7O0VBRUQsTUFBTSxDQUFDLE9BQU8sRUFBRTtJQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFO01BQ3hCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0tBQzdCO0lBQ0QsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7R0FDakI7O0VBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRTtJQUNaLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0lBRWxCLElBQUksT0FBTyxZQUFZLE1BQU0sRUFBRTtNQUM3QixJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztNQUVuQyxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtRQUNsQyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3JCO0tBQ0YsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxPQUFPLEVBQUU7TUFDdkQsTUFBTSxHQUFHLE9BQU8sQ0FBQztLQUNsQjs7SUFFRCxJQUFJLE1BQU0sRUFBRTtNQUNWLElBQUksQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQztLQUM3Qjs7SUFFRCxPQUFPLE1BQU0sQ0FBQztHQUNmOztFQUVELG9CQUFvQixHQUFHO0lBQ3JCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxTQUFTLENBQUM7O0lBRTFDLE1BQU0sSUFBSSxXQUFXLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDMUQ7Q0FDRjs7QUM3REQsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7O0FBRW5FLEFBQWUsTUFBTSxTQUFTLENBQUM7RUFDN0IsV0FBVyxDQUFDLE1BQU0sRUFBRTtJQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3BDOztFQUVELEtBQUssR0FBRztJQUNOLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQzs7SUFFaEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsTUFBTTtNQUN6QixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztLQUN4QyxDQUFDLENBQUM7O0lBRUgsT0FBTyxNQUFNLENBQUM7R0FDZjs7RUFFRCxPQUFPLEdBQUc7SUFDUixRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO0lBQzNCLEtBQUssR0FBRyxDQUFDO0lBQ1QsS0FBSyxHQUFHLENBQUM7SUFDVCxLQUFLLEdBQUcsQ0FBQztJQUNULEtBQUssR0FBRyxDQUFDO0lBQ1QsS0FBSyxHQUFHLENBQUM7SUFDVCxLQUFLLEdBQUcsQ0FBQztJQUNULEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzFCLEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzNCLEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQy9CLEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDakMsS0FBSyxHQUFHO01BQ04sT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNqQyxLQUFLLEdBQUc7TUFDTixPQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMxQixLQUFLLEdBQUc7TUFDTixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ2pDLEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQzdCLEtBQUssR0FBRztNQUNOLE9BQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQzdCLFFBQVE7O0tBRVA7SUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixFQUFFLENBQUM7R0FDckM7O0VBRUQsUUFBUSxHQUFHO0lBQ1QsT0FBTztNQUNMLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtNQUNqQixXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFO01BQ3hDLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO0tBQy9CLENBQUM7R0FDSDs7RUFFRCxTQUFTLEdBQUc7SUFDVixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFekIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQzs7SUFFZixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxNQUFNO01BQ3pCLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7TUFDM0IsS0FBSyxHQUFHLENBQUM7TUFDVCxLQUFLLEdBQUcsQ0FBQztNQUNULEtBQUssR0FBRyxDQUFDO01BQ1QsS0FBSyxHQUFHLENBQUM7TUFDVCxLQUFLLEdBQUcsQ0FBQztNQUNULEtBQUssR0FBRyxDQUFDO01BQ1QsS0FBSyxHQUFHO1FBQ04sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDNUMsTUFBTTtNQUNSLEtBQUssR0FBRztRQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEIsTUFBTSxJQUFJLEVBQUUsQ0FBQztRQUNiLE1BQU07TUFDUixLQUFLLEdBQUc7UUFDTixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BCLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDYixNQUFNO01BQ1I7UUFDRSxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixFQUFFLENBQUM7T0FDckM7S0FDRixDQUFDLENBQUM7O0lBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7O0lBRXpCLE9BQU87TUFDTCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7TUFDakIsV0FBVyxFQUFFLFFBQVE7TUFDckIsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7S0FDL0IsQ0FBQztHQUNIOztFQUVELFFBQVEsR0FBRztJQUNULElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztJQUV6QixPQUFPO01BQ0wsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO01BQ2pCLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO0tBQy9CLENBQUM7R0FDSDs7RUFFRCxVQUFVLEdBQUc7SUFDWCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFekIsT0FBTztNQUNMLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTTtNQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7S0FDakMsQ0FBQztHQUNIOztFQUVELGVBQWUsQ0FBQyxTQUFTLEVBQUU7SUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7O0lBRTNCLE9BQU87TUFDTCxJQUFJLEVBQUUsTUFBTSxDQUFDLFdBQVc7TUFDeEIsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO01BQ3RCLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztLQUNqQyxDQUFDO0dBQ0g7O0VBRUQsY0FBYyxHQUFHO0lBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7O0lBRXpCLE9BQU87TUFDTCxJQUFJLEVBQUUsTUFBTSxDQUFDLFVBQVU7TUFDdkIsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7S0FDL0IsQ0FBQztHQUNIOztFQUVELGdCQUFnQixHQUFHO0lBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztJQUV6QixPQUFPO01BQ0wsSUFBSSxFQUFFLE1BQU0sQ0FBQyxZQUFZO01BQ3pCLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztLQUNqQyxDQUFDO0dBQ0g7O0VBRUQsZ0JBQWdCLEdBQUc7SUFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7O0lBRXpCLE9BQU87TUFDTCxJQUFJLEVBQUUsTUFBTSxDQUFDLFlBQVk7TUFDekIsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO0tBQ2pDLENBQUM7R0FDSDs7RUFFRCxTQUFTLEdBQUc7SUFDVixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFekIsT0FBTztNQUNMLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSztNQUNsQixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUM7S0FDekMsQ0FBQztHQUNIOztFQUVELGdCQUFnQixHQUFHO0lBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztJQUV6QixPQUFPO01BQ0wsSUFBSSxFQUFFLE1BQU0sQ0FBQyxZQUFZO0tBQzFCLENBQUM7R0FDSDs7RUFFRCxRQUFRLEdBQUc7SUFDVCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFekIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLElBQUksU0FBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMzQyxJQUFJLE9BQU8sR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7O0lBRXZDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLE1BQU07TUFDNUIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7S0FDeEMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7O0lBRTdDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztJQUV6QixTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDOztJQUVwRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7SUFFaEMsT0FBTyxNQUFNLENBQUM7R0FDZjs7RUFFRCxRQUFRLEVBQUU7SUFDUixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixPQUFPO01BQ0wsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO01BQ2pCLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztLQUNqQyxDQUFDO0dBQ0g7O0VBRUQsWUFBWSxFQUFFO0lBQ1osSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsT0FBTztNQUNMLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUTtNQUNyQixLQUFLLEVBQUUsUUFBUTtLQUNoQixDQUFDO0dBQ0g7O0VBRUQsWUFBWSxFQUFFO0lBQ1osSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMxQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMxQyxPQUFPO01BQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRO01BQ3BCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hCO0dBQ0Y7O0VBRUQsVUFBVSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7SUFDNUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFO01BQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7TUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDMUQsTUFBTTtPQUNQO01BQ0QsUUFBUSxFQUFFLENBQUM7S0FDWjtHQUNGOztFQUVELGFBQWEsQ0FBQyxPQUFPLEVBQUU7SUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7O0lBRXJDLE9BQU8sR0FBRyxLQUFLLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7R0FDbkM7O0VBRUQsZUFBZSxDQUFDLE1BQU0sRUFBRTtJQUN0QixJQUFJLFNBQVMsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDOztJQUVsRCxPQUFPLFNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsTUFBTSxDQUFDO0dBQ3BEOztFQUVELGVBQWUsR0FBRztJQUNoQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO01BQzNCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO0tBQzdDO0lBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtNQUMzQixPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQztLQUM3QztJQUNELE9BQU8sQ0FBQyxDQUFDO0dBQ1Y7O0VBRUQsUUFBUSxHQUFHO0lBQ1QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxDQUFDO0lBQ2xELElBQUksTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztJQUU1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO01BQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDZjs7SUFFRCxPQUFPLE1BQU0sQ0FBQztHQUNmOztFQUVELFdBQVcsR0FBRztJQUNaLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQzs7SUFFaEIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2xELE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDOztJQUV4QyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7O0lBRTFCLElBQUksR0FBRyxFQUFFO01BQ1AsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDN0I7O0lBRUQsT0FBTyxNQUFNLENBQUM7R0FDZjs7RUFFRCxRQUFRLEdBQUc7SUFDVCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDOztJQUV2QixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO01BQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7TUFDcEIsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDM0I7O0lBRUQsT0FBTyxJQUFJLENBQUM7R0FDYjs7RUFFRCxhQUFhLEdBQUc7SUFDZCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7O0lBRWhCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7TUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7TUFFcEIsSUFBSSxRQUFRLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDOztNQUV6QyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7TUFFakMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsTUFBTTtRQUN6QixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztPQUN4QyxDQUFDLENBQUM7S0FDSjs7SUFFRCxPQUFPLE1BQU0sQ0FBQztHQUNmO0NBQ0Y7O0FDdlVELG9CQUFlO0VBQ2IsS0FBSyxFQUFFLEdBQUc7RUFDVixNQUFNLEVBQUUsQ0FBQztFQUNULE1BQU0sRUFBRSxDQUFDO0VBQ1QsUUFBUSxFQUFFLEdBQUc7RUFDYixRQUFRLEVBQUUsRUFBRTtFQUNaLFNBQVMsRUFBRSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRkYsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBNEIsV0FBVyxFQUFFLFFBQWEsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEFBQXlELENBQUEsQ0FBQyxDQUFDLFVBQVUsQ0FBQ0EsY0FBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxPQUFPLFVBQVUsRUFBRSxXQUFXLEVBQUUsT0FBTyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsZ0VBQWdFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFBLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7O0FDSjk0Sjs7Ozs7QUFLQSxBQUNBLEFBQ0EsQUFDQSxBQUNBLEFBQ0EsQUFFQTtBQUNBLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQztBQUN6QixNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7OztBQUdyQixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0VBQzdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDcEM7OztBQUdELElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0VBQzVCLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDM0I7QUFDRCxTQUFTLE9BQU8sQ0FBQyxVQUFVLEVBQUU7RUFDM0IsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztDQUN0RDs7QUFF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QUNELEtBQUssR0FBRztJQUNOLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztHQUNsRDtFQUNELE1BQU0sR0FBRztJQUNQLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO01BQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztNQUN4QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO01BQ3pCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO01BQzlELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDakQsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUM7T0FDakM7TUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDaEI7R0FDRjtFQUNELElBQUksR0FBRztJQUNMLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO01BQzVCLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7O01BRTFCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztNQUN4QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDZDtHQUNGO0VBQ0QsS0FBSyxHQUFHO0lBQ04sS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7TUFDdEQsSUFBSSxDQUFDLE1B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LENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7RUFHbEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7RUFDMUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDL0MsSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7RUFDM0MsSUFBSSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7OztFQUc1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztFQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztFQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztFQUMvQixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztFQUNkLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxLQUFLO0lBQ3RCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7TUFDMUIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVDO0lBQ0QsT0FBTyxHQUFHLENBQUM7R0FD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QUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7TUFDN0UsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDN0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1VBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDMUI7T0FDRjtNQUNELEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO1FBQzdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztVQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO09BQ0Y7S0FDRjs7OztJQUlELElBQUksVUFBVSxDQUFDLENBQUMsRUFBRTtNQUNoQixVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7TUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzNCOztJQUVELElBQUksVUFBVSxDQUFDLENBQUMsRUFBRTtNQUNoQixVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7TUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzNCOzs7Ozs7Q0FNSjs7O0VBR0MsR0FBRyxHQUFHO0lBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxP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QyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtVQUNWLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztVQUM5QyxJQUFJLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztVQUN2RSxJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztVQUNsSCxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ2xHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1VBQzlCLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1VBQzdCLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzdCO09BQ0Y7S0FDRjtHQUNGOzs7O0VBSUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtJQUNqRixXQUFXLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUs7R0FDeEQsQ0FBQyxDQUFDOztFQUVILElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQzs7Ozs7OztFQU9uRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Ozs7RUFJNUIsSUFBSSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQUUsS0FBSyxJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTTtFQUM3RTs7SUFFRSxHQUFHLGFBQWEsRUFBRSxDQUFDO01BQ2pCLE9BQU87S0FDUjs7SUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQy9DLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7SUFDeEMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7TUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO01BQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztNQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7S0FDbkM7SUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7SUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztJQUN2RixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0lBQ25DLEtBQUssQ0FBQztHQUNQO0VBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDOztFQUUvRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUs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QUk7S0FDdkQsQ0FBQyxDQUFDOztJQUVILElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDM0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDckQ7Q0FDRjs7O0FBR0QsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO0VBQ3pCLE1BQU0sSUFBSSxDQUFDO0lBQ1QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBQzlDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztJQUMxQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO01BQ2hELEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO01BQ2hCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUMxQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUN2QjtLQUNGO0lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENB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QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0VBQ3BCLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7RUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7RUFDZixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUM7RUFDbEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUM1RCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7RUFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7Q0FDNUU7OztBQUdELENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTs7RUFFcEIsU0FBUyxHQUFHLEtBQUssQ0FBQzs7RUFFbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNyRCxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDOzs7OztFQUt0QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLFFBQVEsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsRUFBRSxJQUFJQSxhQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDbkcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDL0Q7OztBQUdELENBQUMsVUFBVSxDQUFDLFNB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UyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzFGO0lBQ0QsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNSO0NBQ0Y7OztBQUdELENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTtFQUNwQixTQUFTLEdBQUcsS0FBSyxDQUFDO0VBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7RUFDckIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0VBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztFQUN2RCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUM5RDs7QUFFRCxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUU7RUFDcEIsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLFNBQVMsSUFBSSxDQUFDO0VBQ3BIO0lBQ0UsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN2QixTQUFTLEdBQUcsS0FBSyxDQUFDO0dBQ25COztFQUVELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7RUFDckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUM5RDtDQUNBOztBQ2xsQ0Q7QUFDQSxBQUNBOzs7Ozs7Ozs7OztBQVdBLEFBRUE7QUFDQSxNQUFNLENBQUMsTUFBTSxHQUFHLFlBQVk7RUFDMUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDL0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3ZDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNoQixHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0QyxHQUFHLENBQUMsWUFBWSxHQUFHLGlCQUFpQixDQUFDO0dBQ3RDLE1BQU07SUFDTCxHQUFHLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztHQUM3QjtFQUNELEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztFQUN0QixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ2pCLENBQUM7OyJ9
