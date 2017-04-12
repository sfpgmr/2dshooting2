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

  this.bb = new THREE.BoundingBoxHelper( this.mesh, 0xffffff );
	sfg.game.scene.add( this.bb );

  
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
      this.mesh.rotation.z += 0.02; 
    } else if(basicInput.right && this.mesh.rotation.z > -0.4){
      this.mesh.rotation.z -= 0.02;
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

    this.bb.position.x = this.mesh.position.x;
    this.bb.position.y = this.mesh.position.y;
    this.bb.position.z = this.mesh.position.z;
    this.bb.rotation.y = this.mesh.rotation.z;
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
    this.progress.render('Loading Resources ...', 0);
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
            this.progress.render('Loading Resources ...', (texCount / texLength * 100) | 0);
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

loadModels(){
  let loader = new THREE.JSONLoader();
  this.models = {};
  let models = {
    'myship':'./data/test.json',
    'ballet':'./data/ballet.json'
  };
  let promises = Promise.resolve(0);
  let this_ = this;
  for(let i in models){
    promises = promises.then(()=>{
      return new Promise((resolve,reject)=>{
          loader.load(models[i], (geometry, materials) => {
            var faceMaterial = new THREE.MultiMaterial(materials);
            this_[i] = new THREE.Mesh(geometry, faceMaterial);
            this_[i].rotation.set(90, 0, 0);
            this_[i].position.set(0, 0, 0.0);
            this_[i].scale.set(1,1,1);
            this_.scene.add(this_[i]); // シーンへメッシュの追加
            resolve();
          });
      });
    });
  }
  return promises;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvZ2xvYmFsLmpzIiwiLi4vLi4vc3JjL2pzL2V2ZW50RW1pdHRlcjMuanMiLCIuLi8uLi9zcmMvanMvdXRpbC5qcyIsIi4uLy4uL3NyYy9qcy9TeW50YXguanMiLCIuLi8uLi9zcmMvanMvU2Nhbm5lci5qcyIsIi4uLy4uL3NyYy9qcy9NTUxQYXJzZXIuanMiLCIuLi8uLi9zcmMvanMvRGVmYXVsdFBhcmFtcy5qcyIsIi4uLy4uL3NyYy9qcy9semJhc2U2Mi5taW4uanMiLCIuLi8uLi9zcmMvanMvYXVkaW8uanMiLCIuLi8uLi9zcmMvanMvZ3JhcGhpY3MuanMiLCIuLi8uLi9zcmMvanMvaW8uanMiLCIuLi8uLi9zcmMvanMvY29tbS5qcyIsIi4uLy4uL3NyYy9qcy90ZXh0LmpzIiwiLi4vLi4vc3JjL2pzL2dhbWVvYmouanMiLCIuLi8uLi9zcmMvanMvbXlzaGlwLmpzIiwiLi4vLi4vc3JjL2pzL3NlcURhdGEuanMiLCIuLi8uLi9zcmMvanMvZ2FtZS5qcyIsIi4uLy4uL3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGV4cG9ydCBjb25zdCBDQU1fWlxyXG4vLyBleHBvcnQgY29uc3QgVklSVFVBTF9XSURUSCA9IDI0MDtcclxuLy8gZXhwb3J0IGNvbnN0IFZJUlRVQUxfSEVJR0hUID0gMzIwO1xyXG5cclxuLy8gZXhwb3J0IGNvbnN0IFZfUklHSFQgPSBWSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG4vLyBleHBvcnQgY29uc3QgVl9UT1AgPSBWSVJUVUFMX0hFSUdIVCAvIDIuMDtcclxuLy8gZXhwb3J0IGNvbnN0IFZfTEVGVCA9IC0xICogVklSVFVBTF9XSURUSCAvIDIuMDtcclxuLy8gZXhwb3J0IGNvbnN0IFZfQk9UVE9NID0gLTEgKiBWSVJUVUFMX0hFSUdIVCAvIDIuMDtcclxuXHJcbi8vIGV4cG9ydCBjb25zdCBDSEFSX1NJWkUgPSA4O1xyXG4vLyBleHBvcnQgY29uc3QgVEVYVF9XSURUSCA9IFZJUlRVQUxfV0lEVEggLyBDSEFSX1NJWkU7XHJcbi8vIGV4cG9ydCBjb25zdCBURVhUX0hFSUdIVCA9IFZJUlRVQUxfSEVJR0hUIC8gQ0hBUl9TSVpFO1xyXG4vLyBleHBvcnQgY29uc3QgUElYRUxfU0laRSA9IDE7XHJcbi8vIGV4cG9ydCBjb25zdCBBQ1RVQUxfQ0hBUl9TSVpFID0gQ0hBUl9TSVpFICogUElYRUxfU0laRTtcclxuLy8gZXhwb3J0IGNvbnN0IFNQUklURV9TSVpFX1ggPSAxNi4wO1xyXG4vLyBleHBvcnQgY29uc3QgU1BSSVRFX1NJWkVfWSA9IDE2LjA7XHJcbi8vIGV4cG9ydCBjb25zdCBDSEVDS19DT0xMSVNJT04gPSB0cnVlO1xyXG4vLyBleHBvcnQgY29uc3QgREVCVUcgPSBmYWxzZTtcclxuLy8gZXhwb3J0IHZhciB0ZXh0dXJlRmlsZXMgPSB7fTtcclxuLy8gZXhwb3J0IHZhciBzdGFnZSA9IDA7XHJcbi8vIGV4cG9ydCB2YXIgdGFza3MgPSBudWxsO1xyXG4vLyBleHBvcnQgdmFyIGdhbWVUaW1lciA9IG51bGw7XHJcbi8vIGV4cG9ydCB2YXIgYm9tYnMgPSBudWxsO1xyXG4vLyBleHBvcnQgdmFyIGFkZFNjb3JlID0gbnVsbDtcclxuLy8gZXhwb3J0IHZhciBteXNoaXBfID0gbnVsbDtcclxuLy8gZXhwb3J0IHZhciBwYXVzZSA9IGZhbHNlO1xyXG4vLyBleHBvcnQgdmFyIGdhbWUgPSBudWxsO1xyXG4vLyBleHBvcnQgdmFyIHJlc291cmNlQmFzZSA9ICcnO1xyXG5cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNldEdhbWUodil7Z2FtZSA9IHY7fVxyXG4vLyBleHBvcnQgZnVuY3Rpb24gc2V0UGF1c2Uodil7cGF1c2UgPSB2O31cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNldE15U2hpcCh2KXtteXNoaXBfID0gdjt9XHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBzZXRBZGRTY29yZSh2KXthZGRTY29yZSA9IHY7fVxyXG4vLyBleHBvcnQgZnVuY3Rpb24gc2V0Qm9tYnModil7Ym9tYnMgPSB2O31cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNldEdhbWVUaW1lcih2KXtnYW1lVGltZXIgPSB2O31cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNldFRhc2tzKHYpe3Rhc2tzID0gdjt9XHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBzZXRTdGFnZSh2KXtzdGFnZSA9IHY7fVxyXG4vLyBleHBvcnQgZnVuY3Rpb24gc2V0UmVzb3VyY2VCYXNlKHYpe3Jlc291cmNlQmFzZSA9IHY7fVxyXG5cclxuY2xhc3Mgc2ZnbG9iYWwge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5DQU1FUkFfWiA9IDEwMC4wO1xyXG4gICAgdGhpcy5BTkdMRV9PRl9WSUVXICA9IDEwLjA7XHJcbiAgICB0aGlzLlZJUlRVQUxfV0lEVEggPSAyNDAuMDtcclxuICAgIHRoaXMuVklSVFVBTF9IRUlHSFQgPSAzMjAuMDtcclxuICAgIHRoaXMuQUNUVUFMX0hFSUdIVCA9IHRoaXMuQ0FNRVJBX1ogKiBNYXRoLnRhbih0aGlzLkFOR0xFX09GX1ZJRVcgKiBNYXRoLlBJIC8gMzYwKSAqIDI7XHJcbiAgICB0aGlzLkFDVFVBTF9XSURUSCA9IHRoaXMuQUNUVUFMX0hFSUdIVCAqIHRoaXMuVklSVFVBTF9XSURUSCAvIHRoaXMuVklSVFVBTF9IRUlHSFQ7XHJcblxyXG4gICAgLy8gdGhpcy5WX1JJR0hUID0gdGhpcy5WSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG4gICAgLy8gdGhpcy5WX1RPUCA9IHRoaXMuVklSVFVBTF9IRUlHSFQgLyAyLjA7XHJcbiAgICAvLyB0aGlzLlZfTEVGVCA9IC0xICogdGhpcy5WSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG4gICAgLy8gdGhpcy5WX0JPVFRPTSA9IC0xICogdGhpcy5WSVJUVUFMX0hFSUdIVCAvIDIuMDtcclxuICAgIHRoaXMuVl9SSUdIVCA9IHRoaXMuQUNUVUFMX1dJRFRIIC8gMi4wO1xyXG4gICAgdGhpcy5WX1RPUCA9IHRoaXMuQUNUVUFMX0hFSUdIVCAvIDIuMDtcclxuICAgIHRoaXMuVl9MRUZUID0gLTEgKiB0aGlzLkFDVFVBTF9XSURUSCAvIDIuMDtcclxuICAgIHRoaXMuVl9CT1RUT00gPSAtMSAqIHRoaXMuQUNUVUFMX0hFSUdIVCAvIDIuMDtcclxuXHJcbiAgICB0aGlzLkNIQVJfU0laRSA9IDg7XHJcbiAgICB0aGlzLlRFWFRfV0lEVEggPSB0aGlzLlZJUlRVQUxfV0lEVEggLyB0aGlzLkNIQVJfU0laRTtcclxuICAgIHRoaXMuVEVYVF9IRUlHSFQgPSB0aGlzLlZJUlRVQUxfSEVJR0hUIC8gdGhpcy5DSEFSX1NJWkU7XHJcbiAgICB0aGlzLlBJWEVMX1NJWkUgPSAxO1xyXG4gICAgdGhpcy5BQ1RVQUxfQ0hBUl9TSVpFID0gdGhpcy5DSEFSX1NJWkUgKiB0aGlzLlBJWEVMX1NJWkU7XHJcbiAgICB0aGlzLlNQUklURV9TSVpFX1ggPSAxNi4wO1xyXG4gICAgdGhpcy5TUFJJVEVfU0laRV9ZID0gMTYuMDtcclxuICAgIHRoaXMuQ0hFQ0tfQ09MTElTSU9OID0gdHJ1ZTtcclxuICAgIHRoaXMuREVCVUcgPSBmYWxzZTtcclxuICAgIHRoaXMudGV4dHVyZUZpbGVzID0ge307XHJcbiAgICB0aGlzLm1vZGVscyA9IHt9O1xyXG4gICAgdGhpcy5zdGFnZSA9IDA7XHJcbiAgICB0aGlzLnRhc2tzID0gbnVsbDtcclxuICAgIHRoaXMuZ2FtZVRpbWVyID0gbnVsbDtcclxuICAgIHRoaXMuYm9tYnMgPSBudWxsO1xyXG4gICAgdGhpcy5hZGRTY29yZSA9IG51bGw7XHJcbiAgICB0aGlzLm15c2hpcF8gPSBudWxsO1xyXG4gICAgdGhpcy5wYXVzZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5nYW1lID0gbnVsbDtcclxuICAgIHRoaXMucmVzb3VyY2VCYXNlID0gJyc7XHJcbiAgfVxyXG59XHJcbmNvbnN0IHNmZyA9IG5ldyBzZmdsb2JhbCgpO1xyXG5leHBvcnQgZGVmYXVsdCBzZmc7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vXHJcbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxyXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxyXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxyXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXHJcbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXHJcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXHJcbi8vXHJcbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cclxuICpcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xyXG4gIHRoaXMuZm4gPSBmbjtcclxuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xyXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxyXG4gKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxyXG5cclxuLyoqXHJcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXHJcbiAqXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XHJcblxyXG4vKipcclxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cclxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cclxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcclxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xyXG5cclxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XHJcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcclxuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcclxuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cclxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBhcmdzXHJcbiAgICAsIGk7XHJcblxyXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XHJcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHJcbiAgICBzd2l0Y2ggKGxlbikge1xyXG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XHJcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XHJcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xyXG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XHJcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XHJcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xyXG4gICAgfVxyXG5cclxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXHJcbiAgICAgICwgajtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XHJcblxyXG4gICAgICBzd2l0Y2ggKGxlbikge1xyXG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcclxuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XHJcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcclxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcclxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xyXG4gIGVsc2Uge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XHJcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xyXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xyXG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxyXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XHJcbiAgZWxzZSB7XHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcclxuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXHJcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xyXG5cclxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cclxuICAgICwgZXZlbnRzID0gW107XHJcblxyXG4gIGlmIChmbikge1xyXG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgICAgbGlzdGVuZXJzLmZuICE9PSBmblxyXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcclxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcclxuICAgICAgKSB7XHJcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cclxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcclxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vXHJcbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxyXG4gIC8vXHJcbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcclxuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcclxuICB9IGVsc2Uge1xyXG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcclxuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XHJcblxyXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcclxuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vL1xyXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xyXG5cclxuLy9cclxuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy9cclxuLy8gRXhwb3NlIHRoZSBwcmVmaXguXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcclxuXHJcbi8vXHJcbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxyXG4vL1xyXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcclxuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcclxufVxyXG5cclxuIiwiXHJcblwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9ldmVudEVtaXR0ZXIzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBUYXNrIHtcclxuICBjb25zdHJ1Y3RvcihnZW5JbnN0LHByaW9yaXR5KSB7XHJcbiAgICB0aGlzLnByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMTAwMDA7XHJcbiAgICB0aGlzLmdlbkluc3QgPSBnZW5JbnN0O1xyXG4gICAgLy8g5Yid5pyf5YyWXHJcbiAgICB0aGlzLmluZGV4ID0gMDtcclxuICB9XHJcbiAgXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgbnVsbFRhc2sgPSBuZXcgVGFzaygoZnVuY3Rpb24qKCl7fSkoKSk7XHJcblxyXG4vLy8g44K/44K544Kv566h55CGXHJcbmV4cG9ydCBjbGFzcyBUYXNrcyBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcbiAgY29uc3RydWN0b3IoKXtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLmFycmF5ID0gbmV3IEFycmF5KDApO1xyXG4gICAgdGhpcy5uZWVkU29ydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSBmYWxzZTtcclxuICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xyXG4gIH1cclxuICAvLyBpbmRleOOBruS9jee9ruOBruOCv+OCueOCr+OCkue9ruOBjeaPm+OBiOOCi1xyXG4gIHNldE5leHRUYXNrKGluZGV4LCBnZW5JbnN0LCBwcmlvcml0eSkgXHJcbiAge1xyXG4gICAgaWYoaW5kZXggPCAwKXtcclxuICAgICAgaW5kZXggPSAtKCsraW5kZXgpO1xyXG4gICAgfVxyXG4gICAgaWYodGhpcy5hcnJheVtpbmRleF0ucHJpb3JpdHkgPT0gMTAwMDAwKXtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB2YXIgdCA9IG5ldyBUYXNrKGdlbkluc3QoaW5kZXgpLCBwcmlvcml0eSk7XHJcbiAgICB0LmluZGV4ID0gaW5kZXg7XHJcbiAgICB0aGlzLmFycmF5W2luZGV4XSA9IHQ7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHB1c2hUYXNrKGdlbkluc3QsIHByaW9yaXR5KSB7XHJcbiAgICBsZXQgdDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hcnJheS5sZW5ndGg7ICsraSkge1xyXG4gICAgICBpZiAodGhpcy5hcnJheVtpXSA9PSBudWxsVGFzaykge1xyXG4gICAgICAgIHQgPSBuZXcgVGFzayhnZW5JbnN0KGkpLCBwcmlvcml0eSk7XHJcbiAgICAgICAgdGhpcy5hcnJheVtpXSA9IHQ7XHJcbiAgICAgICAgdC5pbmRleCA9IGk7XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHQgPSBuZXcgVGFzayhnZW5JbnN0KHRoaXMuYXJyYXkubGVuZ3RoKSxwcmlvcml0eSk7XHJcbiAgICB0LmluZGV4ID0gdGhpcy5hcnJheS5sZW5ndGg7XHJcbiAgICB0aGlzLmFycmF5W3RoaXMuYXJyYXkubGVuZ3RoXSA9IHQ7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gdHJ1ZTtcclxuICAgIHJldHVybiB0O1xyXG4gIH1cclxuXHJcbiAgLy8g6YWN5YiX44KS5Y+W5b6X44GZ44KLXHJcbiAgZ2V0QXJyYXkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hcnJheTtcclxuICB9XHJcbiAgLy8g44K/44K544Kv44KS44Kv44Oq44Ki44GZ44KLXHJcbiAgY2xlYXIoKSB7XHJcbiAgICB0aGlzLmFycmF5Lmxlbmd0aCA9IDA7XHJcbiAgfVxyXG4gIC8vIOOCveODvOODiOOBjOW/heimgeOBi+ODgeOCp+ODg+OCr+OBl+OAgeOCveODvOODiOOBmeOCi1xyXG4gIGNoZWNrU29ydCgpIHtcclxuICAgIGlmICh0aGlzLm5lZWRTb3J0KSB7XHJcbiAgICAgIHRoaXMuYXJyYXkuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIGlmKGEucHJpb3JpdHkgPiBiLnByaW9yaXR5KSByZXR1cm4gMTtcclxuICAgICAgICBpZiAoYS5wcmlvcml0eSA8IGIucHJpb3JpdHkpIHJldHVybiAtMTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIOOCpOODs+ODh+ODg+OCr+OCueOBruaMr+OCiuebtOOBl1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgZSA9IHRoaXMuYXJyYXkubGVuZ3RoOyBpIDwgZTsgKytpKSB7XHJcbiAgICAgICAgdGhpcy5hcnJheVtpXS5pbmRleCA9IGk7XHJcbiAgICAgIH1cclxuICAgICB0aGlzLm5lZWRTb3J0ID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZW1vdmVUYXNrKGluZGV4KSB7XHJcbiAgICBpZihpbmRleCA8IDApe1xyXG4gICAgICBpbmRleCA9IC0oKytpbmRleCk7XHJcbiAgICB9XHJcbiAgICBpZih0aGlzLmFycmF5W2luZGV4XS5wcmlvcml0eSA9PSAxMDAwMDApe1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIHRoaXMuYXJyYXlbaW5kZXhdID0gbnVsbFRhc2s7XHJcbiAgICB0aGlzLm5lZWRDb21wcmVzcyA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGNvbXByZXNzKCkge1xyXG4gICAgaWYgKCF0aGlzLm5lZWRDb21wcmVzcykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgZGVzdCA9IFtdO1xyXG4gICAgdmFyIHNyYyA9IHRoaXMuYXJyYXk7XHJcbiAgICB2YXIgZGVzdEluZGV4ID0gMDtcclxuICAgIGRlc3QgPSBzcmMuZmlsdGVyKCh2LGkpPT57XHJcbiAgICAgIGxldCByZXQgPSB2ICE9IG51bGxUYXNrO1xyXG4gICAgICBpZihyZXQpe1xyXG4gICAgICAgIHYuaW5kZXggPSBkZXN0SW5kZXgrKztcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmV0O1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLmFycmF5ID0gZGVzdDtcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIHByb2Nlc3MoZ2FtZSlcclxuICB7XHJcbiAgICBpZih0aGlzLmVuYWJsZSl7XHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnByb2Nlc3MuYmluZCh0aGlzLGdhbWUpKTtcclxuICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XHJcbiAgICAgIGlmICghc2ZnLnBhdXNlKSB7XHJcbiAgICAgICAgaWYgKCFnYW1lLmlzSGlkZGVuKSB7XHJcbiAgICAgICAgICB0aGlzLmNoZWNrU29ydCgpO1xyXG4gICAgICAgICAgdGhpcy5hcnJheS5mb3JFYWNoKCAodGFzayxpKSA9PntcclxuICAgICAgICAgICAgaWYgKHRhc2sgIT0gbnVsbFRhc2spIHtcclxuICAgICAgICAgICAgICBpZih0YXNrLmluZGV4ICE9IGkgKXtcclxuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB0YXNrLmdlbkluc3QubmV4dCh0YXNrLmluZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLmNvbXByZXNzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICAgIFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5lbWl0KCdzdG9wcGVkJyk7XHJcbiAgICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHN0b3BQcm9jZXNzKCl7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUscmVqZWN0KT0+e1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm9uKCdzdG9wcGVkJywoKT0+e1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6DnlKjjgr/jgqTjg57jg7xcclxuZXhwb3J0IGNsYXNzIEdhbWVUaW1lciB7XHJcbiAgY29uc3RydWN0b3IoZ2V0Q3VycmVudFRpbWUpIHtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IDA7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICAgIHRoaXMuZ2V0Q3VycmVudFRpbWUgPSBnZXRDdXJyZW50VGltZTtcclxuICAgIHRoaXMuU1RPUCA9IDE7XHJcbiAgICB0aGlzLlNUQVJUID0gMjtcclxuICAgIHRoaXMuUEFVU0UgPSAzO1xyXG5cclxuICB9XHJcbiAgXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gMDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgfVxyXG5cclxuICByZXN1bWUoKSB7XHJcbiAgICB2YXIgbm93VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lICsgbm93VGltZSAtIHRoaXMucGF1c2VUaW1lO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gIH1cclxuXHJcbiAgcGF1c2UoKSB7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyAhPSB0aGlzLlNUQVJUKSByZXR1cm47XHJcbiAgICB2YXIgbm93VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gbm93VGltZSAtIHRoaXMuY3VycmVudFRpbWU7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gdGhpcy5lbGFwc2VkVGltZSArIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IG5vd1RpbWU7XHJcbiAgfVxyXG59XHJcblxyXG4iLCJleHBvcnQgZGVmYXVsdCB7XHJcbiAgTm90ZTogXCJOb3RlXCIsXHJcbiAgUmVzdDogXCJSZXN0XCIsXHJcbiAgT2N0YXZlOiBcIk9jdGF2ZVwiLFxyXG4gIE9jdGF2ZVNoaWZ0OiBcIk9jdGF2ZVNoaWZ0XCIsXHJcbiAgTm90ZUxlbmd0aDogXCJOb3RlTGVuZ3RoXCIsXHJcbiAgTm90ZVZlbG9jaXR5OiBcIk5vdGVWZWxvY2l0eVwiLFxyXG4gIE5vdGVRdWFudGl6ZTogXCJOb3RlUXVhbnRpemVcIixcclxuICBUZW1wbzogXCJUZW1wb1wiLFxyXG4gIEluZmluaXRlTG9vcDogXCJJbmZpbml0ZUxvb3BcIixcclxuICBMb29wQmVnaW46IFwiTG9vcEJlZ2luXCIsXHJcbiAgTG9vcEV4aXQ6IFwiTG9vcEV4aXRcIixcclxuICBMb29wRW5kOiBcIkxvb3BFbmRcIixcclxuICBUb25lOlwiVG9uZVwiLFxyXG4gIFdhdmVGb3JtOlwiV2F2ZUZvcm1cIixcclxuICBFbnZlbG9wZTpcIkVudmVsb3BlXCJcclxufTtcclxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2Nhbm5lciB7XHJcbiAgY29uc3RydWN0b3Ioc291cmNlKSB7XHJcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gIH1cclxuXHJcbiAgaGFzTmV4dCgpIHtcclxuICAgIHJldHVybiB0aGlzLmluZGV4IDwgdGhpcy5zb3VyY2UubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgcGVlaygpIHtcclxuICAgIHJldHVybiB0aGlzLnNvdXJjZS5jaGFyQXQodGhpcy5pbmRleCkgfHwgXCJcIjtcclxuICB9XHJcblxyXG4gIG5leHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UuY2hhckF0KHRoaXMuaW5kZXgrKykgfHwgXCJcIjtcclxuICB9XHJcblxyXG4gIGZvcndhcmQoKSB7XHJcbiAgICB3aGlsZSAodGhpcy5oYXNOZXh0KCkgJiYgdGhpcy5tYXRjaCgvXFxzLykpIHtcclxuICAgICAgdGhpcy5pbmRleCArPSAxO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbWF0Y2gobWF0Y2hlcikge1xyXG4gICAgaWYgKG1hdGNoZXIgaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuICAgICAgcmV0dXJuIG1hdGNoZXIudGVzdCh0aGlzLnBlZWsoKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5wZWVrKCkgPT09IG1hdGNoZXI7XHJcbiAgfVxyXG5cclxuICBleHBlY3QobWF0Y2hlcikge1xyXG4gICAgaWYgKCF0aGlzLm1hdGNoKG1hdGNoZXIpKSB7XHJcbiAgICAgIHRoaXMudGhyb3dVbmV4cGVjdGVkVG9rZW4oKTtcclxuICAgIH1cclxuICAgIHRoaXMuaW5kZXggKz0gMTtcclxuICB9XHJcblxyXG4gIHNjYW4obWF0Y2hlcikge1xyXG4gICAgbGV0IHRhcmdldCA9IHRoaXMuc291cmNlLnN1YnN0cih0aGlzLmluZGV4KTtcclxuICAgIGxldCByZXN1bHQgPSBudWxsO1xyXG5cclxuICAgIGlmIChtYXRjaGVyIGluc3RhbmNlb2YgUmVnRXhwKSB7XHJcbiAgICAgIGxldCBtYXRjaGVkID0gbWF0Y2hlci5leGVjKHRhcmdldCk7XHJcblxyXG4gICAgICBpZiAobWF0Y2hlZCAmJiBtYXRjaGVkLmluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgcmVzdWx0ID0gbWF0Y2hlZFswXTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh0YXJnZXQuc3Vic3RyKDAsIG1hdGNoZXIubGVuZ3RoKSA9PT0gbWF0Y2hlcikge1xyXG4gICAgICByZXN1bHQgPSBtYXRjaGVyO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgdGhpcy5pbmRleCArPSByZXN1bHQubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICB0aHJvd1VuZXhwZWN0ZWRUb2tlbigpIHtcclxuICAgIGxldCBpZGVudGlmaWVyID0gdGhpcy5wZWVrKCkgfHwgXCJJTExFR0FMXCI7XHJcblxyXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIHRva2VuOiAke2lkZW50aWZpZXJ9YCk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBTeW50YXggZnJvbSBcIi4vU3ludGF4XCI7XHJcbmltcG9ydCBTY2FubmVyIGZyb20gXCIuL1NjYW5uZXJcIjtcclxuXHJcbmNvbnN0IE5PVEVfSU5ERVhFUyA9IHsgYzogMCwgZDogMiwgZTogNCwgZjogNSwgZzogNywgYTogOSwgYjogMTEgfTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1NTFBhcnNlciB7XHJcbiAgY29uc3RydWN0b3Ioc291cmNlKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIgPSBuZXcgU2Nhbm5lcihzb3VyY2UpO1xyXG4gIH1cclxuXHJcbiAgcGFyc2UoKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgdGhpcy5fcmVhZFVudGlsKFwiO1wiLCAoKSA9PiB7XHJcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5hZHZhbmNlKCkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIGFkdmFuY2UoKSB7XHJcbiAgICBzd2l0Y2ggKHRoaXMuc2Nhbm5lci5wZWVrKCkpIHtcclxuICAgIGNhc2UgXCJjXCI6XHJcbiAgICBjYXNlIFwiZFwiOlxyXG4gICAgY2FzZSBcImVcIjpcclxuICAgIGNhc2UgXCJmXCI6XHJcbiAgICBjYXNlIFwiZ1wiOlxyXG4gICAgY2FzZSBcImFcIjpcclxuICAgIGNhc2UgXCJiXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWROb3RlKCk7XHJcbiAgICBjYXNlIFwiW1wiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkQ2hvcmQoKTtcclxuICAgIGNhc2UgXCJyXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRSZXN0KCk7XHJcbiAgICBjYXNlIFwib1wiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkT2N0YXZlKCk7XHJcbiAgICBjYXNlIFwiPlwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkT2N0YXZlU2hpZnQoKzEpO1xyXG4gICAgY2FzZSBcIjxcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZE9jdGF2ZVNoaWZ0KC0xKTtcclxuICAgIGNhc2UgXCJsXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWROb3RlTGVuZ3RoKCk7XHJcbiAgICBjYXNlIFwicVwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkTm90ZVF1YW50aXplKCk7XHJcbiAgICBjYXNlIFwidlwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkTm90ZVZlbG9jaXR5KCk7XHJcbiAgICBjYXNlIFwidFwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkVGVtcG8oKTtcclxuICAgIGNhc2UgXCIkXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRJbmZpbml0ZUxvb3AoKTtcclxuICAgIGNhc2UgXCIvXCI6XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRMb29wKCk7XHJcbiAgICBjYXNlIFwiQFwiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkVG9uZSgpO1xyXG4gICAgY2FzZSBcIndcIjpcclxuICAgICAgcmV0dXJuIHRoaXMucmVhZFdhdmVGb3JtKCk7XHJcbiAgICBjYXNlIFwic1wiOlxyXG4gICAgICByZXR1cm4gdGhpcy5yZWFkRW52ZWxvcGUoKTtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIC8vIGRvIG5vdGhpbmdcclxuICAgIH1cclxuICAgIHRoaXMuc2Nhbm5lci50aHJvd1VuZXhwZWN0ZWRUb2tlbigpO1xyXG4gIH1cclxuXHJcbiAgcmVhZE5vdGUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguTm90ZSxcclxuICAgICAgbm90ZU51bWJlcnM6IFsgdGhpcy5fcmVhZE5vdGVOdW1iZXIoMCkgXSxcclxuICAgICAgbm90ZUxlbmd0aDogdGhpcy5fcmVhZExlbmd0aCgpLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWRDaG9yZCgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJbXCIpO1xyXG5cclxuICAgIGxldCBub3RlTGlzdCA9IFtdO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcblxyXG4gICAgdGhpcy5fcmVhZFVudGlsKFwiXVwiLCAoKSA9PiB7XHJcbiAgICAgIHN3aXRjaCAodGhpcy5zY2FubmVyLnBlZWsoKSkge1xyXG4gICAgICBjYXNlIFwiY1wiOlxyXG4gICAgICBjYXNlIFwiZFwiOlxyXG4gICAgICBjYXNlIFwiZVwiOlxyXG4gICAgICBjYXNlIFwiZlwiOlxyXG4gICAgICBjYXNlIFwiZ1wiOlxyXG4gICAgICBjYXNlIFwiYVwiOlxyXG4gICAgICBjYXNlIFwiYlwiOlxyXG4gICAgICAgIG5vdGVMaXN0LnB1c2godGhpcy5fcmVhZE5vdGVOdW1iZXIob2Zmc2V0KSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCI+XCI6XHJcbiAgICAgICAgdGhpcy5zY2FubmVyLm5leHQoKTtcclxuICAgICAgICBvZmZzZXQgKz0gMTI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCI8XCI6XHJcbiAgICAgICAgdGhpcy5zY2FubmVyLm5leHQoKTtcclxuICAgICAgICBvZmZzZXQgLT0gMTI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhpcy5zY2FubmVyLnRocm93VW5leHBlY3RlZFRva2VuKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJdXCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5Ob3RlLFxyXG4gICAgICBub3RlTnVtYmVyczogbm90ZUxpc3QsXHJcbiAgICAgIG5vdGVMZW5ndGg6IHRoaXMuX3JlYWRMZW5ndGgoKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkUmVzdCgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJyXCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5SZXN0LFxyXG4gICAgICBub3RlTGVuZ3RoOiB0aGlzLl9yZWFkTGVuZ3RoKCksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZE9jdGF2ZSgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJvXCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5PY3RhdmUsXHJcbiAgICAgIHZhbHVlOiB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkT2N0YXZlU2hpZnQoZGlyZWN0aW9uKSB7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KC88fD4vKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBTeW50YXguT2N0YXZlU2hpZnQsXHJcbiAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9ufDAsXHJcbiAgICAgIHZhbHVlOiB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkTm90ZUxlbmd0aCgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJsXCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5Ob3RlTGVuZ3RoLFxyXG4gICAgICBub3RlTGVuZ3RoOiB0aGlzLl9yZWFkTGVuZ3RoKCksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVhZE5vdGVRdWFudGl6ZSgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJxXCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5Ob3RlUXVhbnRpemUsXHJcbiAgICAgIHZhbHVlOiB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkTm90ZVZlbG9jaXR5KCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcInZcIik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4Lk5vdGVWZWxvY2l0eSxcclxuICAgICAgdmFsdWU6IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKy8pLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlYWRUZW1wbygpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJ0XCIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IFN5bnRheC5UZW1wbyxcclxuICAgICAgdmFsdWU6IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKyhcXC5cXGQrKT8vKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkSW5maW5pdGVMb29wKCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIiRcIik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4LkluZmluaXRlTG9vcCxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZWFkTG9vcCgpIHtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCIvXCIpO1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIjpcIik7XHJcblxyXG4gICAgbGV0IHJlc3VsdCA9IFtdO1xyXG4gICAgbGV0IGxvb3BCZWdpbiA9IHsgdHlwZTogU3ludGF4Lkxvb3BCZWdpbiB9O1xyXG4gICAgbGV0IGxvb3BFbmQgPSB7IHR5cGU6IFN5bnRheC5Mb29wRW5kIH07XHJcblxyXG4gICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChsb29wQmVnaW4pO1xyXG4gICAgdGhpcy5fcmVhZFVudGlsKC9bfDpdLywgKCkgPT4ge1xyXG4gICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRoaXMuYWR2YW5jZSgpKTtcclxuICAgIH0pO1xyXG4gICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLl9yZWFkTG9vcEV4aXQoKSk7XHJcblxyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIjpcIik7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiL1wiKTtcclxuXHJcbiAgICBsb29wQmVnaW4udmFsdWUgPSB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKSB8fCBudWxsO1xyXG5cclxuICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQobG9vcEVuZCk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcbiAgXHJcbiAgcmVhZFRvbmUoKXtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJAXCIpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4LlRvbmUsXHJcbiAgICAgIHZhbHVlOiB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsvKVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgcmVhZFdhdmVGb3JtKCl7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwid1wiKTtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJcXFwiXCIpO1xyXG4gICAgbGV0IHdhdmVEYXRhID0gdGhpcy5zY2FubmVyLnNjYW4oL1swLTlhLWZBLUZdKz8vKTtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCJcXFwiXCIpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogU3ludGF4LldhdmVGb3JtLFxyXG4gICAgICB2YWx1ZTogd2F2ZURhdGFcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHJlYWRFbnZlbG9wZSgpe1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcInNcIik7XHJcbiAgICBsZXQgYSA9IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKyhcXC5cXGQrKT8vKTtcclxuICAgIHRoaXMuc2Nhbm5lci5leHBlY3QoXCIsXCIpO1xyXG4gICAgbGV0IGQgPSB0aGlzLl9yZWFkQXJndW1lbnQoL1xcZCsoXFwuXFxkKyk/Lyk7XHJcbiAgICB0aGlzLnNjYW5uZXIuZXhwZWN0KFwiLFwiKTtcclxuICAgIGxldCBzID0gdGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrKFxcLlxcZCspPy8pO1xyXG4gICAgdGhpcy5zY2FubmVyLmV4cGVjdChcIixcIik7XHJcbiAgICBsZXQgciA9IHRoaXMuX3JlYWRBcmd1bWVudCgvXFxkKyhcXC5cXGQrKT8vKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6U3ludGF4LkVudmVsb3BlLFxyXG4gICAgICBhOmEsZDpkLHM6cyxyOnJcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9yZWFkVW50aWwobWF0Y2hlciwgY2FsbGJhY2spIHtcclxuICAgIHdoaWxlICh0aGlzLnNjYW5uZXIuaGFzTmV4dCgpKSB7XHJcbiAgICAgIHRoaXMuc2Nhbm5lci5mb3J3YXJkKCk7XHJcbiAgICAgIGlmICghdGhpcy5zY2FubmVyLmhhc05leHQoKSB8fCB0aGlzLnNjYW5uZXIubWF0Y2gobWF0Y2hlcikpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX3JlYWRBcmd1bWVudChtYXRjaGVyKSB7XHJcbiAgICBsZXQgbnVtID0gdGhpcy5zY2FubmVyLnNjYW4obWF0Y2hlcik7XHJcblxyXG4gICAgcmV0dXJuIG51bSAhPT0gbnVsbCA/ICtudW0gOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgX3JlYWROb3RlTnVtYmVyKG9mZnNldCkge1xyXG4gICAgbGV0IG5vdGVJbmRleCA9IE5PVEVfSU5ERVhFU1t0aGlzLnNjYW5uZXIubmV4dCgpXTtcclxuXHJcbiAgICByZXR1cm4gbm90ZUluZGV4ICsgdGhpcy5fcmVhZEFjY2lkZW50YWwoKSArIG9mZnNldDtcclxuICB9XHJcblxyXG4gIF9yZWFkQWNjaWRlbnRhbCgpIHtcclxuICAgIGlmICh0aGlzLnNjYW5uZXIubWF0Y2goXCIrXCIpKSB7XHJcbiAgICAgIHJldHVybiArMSAqIHRoaXMuc2Nhbm5lci5zY2FuKC9cXCsrLykubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2Nhbm5lci5tYXRjaChcIi1cIikpIHtcclxuICAgICAgcmV0dXJuIC0xICogdGhpcy5zY2FubmVyLnNjYW4oL1xcLSsvKS5sZW5ndGg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcblxyXG4gIF9yZWFkRG90KCkge1xyXG4gICAgbGV0IGxlbiA9ICh0aGlzLnNjYW5uZXIuc2NhbigvXFwuKy8pIHx8IFwiXCIpLmxlbmd0aDtcclxuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXkobGVuKTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIHJlc3VsdFtpXSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIF9yZWFkTGVuZ3RoKCkge1xyXG4gICAgbGV0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5fcmVhZEFyZ3VtZW50KC9cXGQrLykpO1xyXG4gICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLl9yZWFkRG90KCkpO1xyXG5cclxuICAgIGxldCB0aWUgPSB0aGlzLl9yZWFkVGllKCk7XHJcblxyXG4gICAgaWYgKHRpZSkge1xyXG4gICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHRpZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIF9yZWFkVGllKCkge1xyXG4gICAgdGhpcy5zY2FubmVyLmZvcndhcmQoKTtcclxuXHJcbiAgICBpZiAodGhpcy5zY2FubmVyLm1hdGNoKFwiXlwiKSkge1xyXG4gICAgICB0aGlzLnNjYW5uZXIubmV4dCgpO1xyXG4gICAgICByZXR1cm4gdGhpcy5fcmVhZExlbmd0aCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgX3JlYWRMb29wRXhpdCgpIHtcclxuICAgIGxldCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICBpZiAodGhpcy5zY2FubmVyLm1hdGNoKFwifFwiKSkge1xyXG4gICAgICB0aGlzLnNjYW5uZXIubmV4dCgpO1xyXG5cclxuICAgICAgbGV0IGxvb3BFeGl0ID0geyB0eXBlOiBTeW50YXguTG9vcEV4aXQgfTtcclxuXHJcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQobG9vcEV4aXQpO1xyXG5cclxuICAgICAgdGhpcy5fcmVhZFVudGlsKFwiOlwiLCAoKSA9PiB7XHJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLmFkdmFuY2UoKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG59XHJcbiIsImV4cG9ydCBkZWZhdWx0IHtcclxuICB0ZW1wbzogMTIwLFxyXG4gIG9jdGF2ZTogNCxcclxuICBsZW5ndGg6IDQsXHJcbiAgdmVsb2NpdHk6IDEwMCxcclxuICBxdWFudGl6ZTogNzUsXHJcbiAgbG9vcENvdW50OiAyLFxyXG59O1xyXG4iLCIvKiFcclxuICogbHpiYXNlNjIgdjEuNC42IC0gTFo3NyhMWlNTKSBiYXNlZCBjb21wcmVzc2lvbiBhbGdvcml0aG0gaW4gYmFzZTYyIGZvciBKYXZhU2NyaXB0LlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNSBwb2x5Z29uIHBsYW5ldCA8cG9seWdvbi5wbGFuZXQuYXF1YUBnbWFpbC5jb20+XHJcbiAqIEBsaWNlbnNlIE1JVFxyXG4gKi9cclxuIWZ1bmN0aW9uKGEsYixjKXtcInVuZGVmaW5lZFwiIT10eXBlb2YgZXhwb3J0cz9cInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1jKCk6ZXhwb3J0c1thXT1jKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShjKTpiW2FdPWMoKX0oXCJsemJhc2U2MlwiLHRoaXMsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBhKGEpe3RoaXMuX2luaXQoYSl9ZnVuY3Rpb24gYihhKXt0aGlzLl9pbml0KGEpfWZ1bmN0aW9uIGMoKXt2YXIgYSxiLGMsZCxlPVwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixmPVwiXCIsZz1lLmxlbmd0aDtmb3IoYT0wO2c+YTthKyspZm9yKGM9ZS5jaGFyQXQoYSksYj1nLTE7Yj4xNSYmZi5sZW5ndGg8djtiLS0pZD1lLmNoYXJBdChiKSxmKz1cIiBcIitjK1wiIFwiK2Q7Zm9yKDtmLmxlbmd0aDx2OylmPVwiIFwiK2Y7cmV0dXJuIGY9Zi5zbGljZSgwLHYpfWZ1bmN0aW9uIGQoYSxiKXtyZXR1cm4gYS5sZW5ndGg9PT1iP2E6YS5zdWJhcnJheT9hLnN1YmFycmF5KDAsYik6KGEubGVuZ3RoPWIsYSl9ZnVuY3Rpb24gZShhLGIpe2lmKG51bGw9PWI/Yj1hLmxlbmd0aDphPWQoYSxiKSxsJiZtJiZvPmIpe2lmKHApcmV0dXJuIGouYXBwbHkobnVsbCxhKTtpZihudWxsPT09cCl0cnl7dmFyIGM9ai5hcHBseShudWxsLGEpO3JldHVybiBiPm8mJihwPSEwKSxjfWNhdGNoKGUpe3A9ITF9fXJldHVybiBmKGEpfWZ1bmN0aW9uIGYoYSl7Zm9yKHZhciBiLGM9XCJcIixkPWEubGVuZ3RoLGU9MDtkPmU7KXtpZihiPWEuc3ViYXJyYXk/YS5zdWJhcnJheShlLGUrbyk6YS5zbGljZShlLGUrbyksZSs9bywhcCl7aWYobnVsbD09PXApdHJ5e2MrPWouYXBwbHkobnVsbCxiKSxiLmxlbmd0aD5vJiYocD0hMCk7Y29udGludWV9Y2F0Y2goZil7cD0hMX1yZXR1cm4gZyhhKX1jKz1qLmFwcGx5KG51bGwsYil9cmV0dXJuIGN9ZnVuY3Rpb24gZyhhKXtmb3IodmFyIGI9XCJcIixjPWEubGVuZ3RoLGQ9MDtjPmQ7ZCsrKWIrPWooYVtkXSk7cmV0dXJuIGJ9ZnVuY3Rpb24gaChhLGIpe2lmKCFrKXJldHVybiBuZXcgQXJyYXkoYik7c3dpdGNoKGEpe2Nhc2UgODpyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYik7Y2FzZSAxNjpyZXR1cm4gbmV3IFVpbnQxNkFycmF5KGIpfX1mdW5jdGlvbiBpKGEpe2Zvcih2YXIgYj1bXSxjPWEmJmEubGVuZ3RoLGQ9MDtjPmQ7ZCsrKWJbZF09YS5jaGFyQ29kZUF0KGQpO3JldHVybiBifXZhciBqPVN0cmluZy5mcm9tQ2hhckNvZGUsaz1cInVuZGVmaW5lZFwiIT10eXBlb2YgVWludDhBcnJheSYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFVpbnQxNkFycmF5LGw9ITEsbT0hMTt0cnl7XCJhXCI9PT1qLmFwcGx5KG51bGwsWzk3XSkmJihsPSEwKX1jYXRjaChuKXt9aWYoayl0cnl7XCJhXCI9PT1qLmFwcGx5KG51bGwsbmV3IFVpbnQ4QXJyYXkoWzk3XSkpJiYobT0hMCl9Y2F0Y2gobil7fXZhciBvPTY1NTMzLHA9bnVsbCxxPSExOy0xIT09XCJhYmNcXHUzMDdiXFx1MzA1MlwiLmxhc3RJbmRleE9mKFwiXFx1MzA3YlxcdTMwNTJcIiwxKSYmKHE9ITApO3ZhciByPVwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODlcIixzPXIubGVuZ3RoLHQ9TWF0aC5tYXgocyw2MiktTWF0aC5taW4ocyw2MiksdT1zLTEsdj0xMDI0LHc9MzA0LHg9byx5PXgtcyx6PW8sQT16KzIqdixCPTExLEM9QiooQisxKSxEPTQwLEU9RCooRCsxKSxGPXMrMSxHPXQrMjAsSD1zKzUsST1zLXQtMTksSj1EKzcsSz1KKzEsTD1LKzEsTT1MKzUsTj1NKzU7YS5wcm90b3R5cGU9e19pbml0OmZ1bmN0aW9uKGEpe2E9YXx8e30sdGhpcy5fZGF0YT1udWxsLHRoaXMuX3RhYmxlPW51bGwsdGhpcy5fcmVzdWx0PW51bGwsdGhpcy5fb25EYXRhQ2FsbGJhY2s9YS5vbkRhdGEsdGhpcy5fb25FbmRDYWxsYmFjaz1hLm9uRW5kfSxfY3JlYXRlVGFibGU6ZnVuY3Rpb24oKXtmb3IodmFyIGE9aCg4LHMpLGI9MDtzPmI7YisrKWFbYl09ci5jaGFyQ29kZUF0KGIpO3JldHVybiBhfSxfb25EYXRhOmZ1bmN0aW9uKGEsYil7dmFyIGM9ZShhLGIpO3RoaXMuX29uRGF0YUNhbGxiYWNrP3RoaXMuX29uRGF0YUNhbGxiYWNrKGMpOnRoaXMuX3Jlc3VsdCs9Y30sX29uRW5kOmZ1bmN0aW9uKCl7dGhpcy5fb25FbmRDYWxsYmFjayYmdGhpcy5fb25FbmRDYWxsYmFjaygpLHRoaXMuX2RhdGE9dGhpcy5fdGFibGU9bnVsbH0sX3NlYXJjaDpmdW5jdGlvbigpe3ZhciBhPTIsYj10aGlzLl9kYXRhLGM9dGhpcy5fb2Zmc2V0LGQ9dTtpZih0aGlzLl9kYXRhTGVuLWM8ZCYmKGQ9dGhpcy5fZGF0YUxlbi1jKSxhPmQpcmV0dXJuITE7dmFyIGUsZixnLGgsaSxqLGs9Yy13LGw9Yi5zdWJzdHJpbmcoayxjK2QpLG09YythLTMtaztkb3tpZigyPT09YSl7aWYoZj1iLmNoYXJBdChjKStiLmNoYXJBdChjKzEpLGc9bC5pbmRleE9mKGYpLCF+Z3x8Zz5tKWJyZWFrfWVsc2UgMz09PWE/Zis9Yi5jaGFyQXQoYysyKTpmPWIuc3Vic3RyKGMsYSk7aWYocT8oaj1iLnN1YnN0cmluZyhrLGMrYS0xKSxoPWoubGFzdEluZGV4T2YoZikpOmg9bC5sYXN0SW5kZXhPZihmLG0pLCF+aClicmVhaztpPWgsZT1rK2g7ZG8gaWYoYi5jaGFyQ29kZUF0KGMrYSkhPT1iLmNoYXJDb2RlQXQoZSthKSlicmVhazt3aGlsZSgrK2E8ZCk7aWYoZz09PWgpe2ErKzticmVha319d2hpbGUoKythPGQpO3JldHVybiAyPT09YT8hMToodGhpcy5faW5kZXg9dy1pLHRoaXMuX2xlbmd0aD1hLTEsITApfSxjb21wcmVzczpmdW5jdGlvbihhKXtpZihudWxsPT1hfHwwPT09YS5sZW5ndGgpcmV0dXJuXCJcIjt2YXIgYj1cIlwiLGQ9dGhpcy5fY3JlYXRlVGFibGUoKSxlPWMoKSxmPWgoOCx4KSxnPTA7dGhpcy5fcmVzdWx0PVwiXCIsdGhpcy5fb2Zmc2V0PWUubGVuZ3RoLHRoaXMuX2RhdGE9ZSthLHRoaXMuX2RhdGFMZW49dGhpcy5fZGF0YS5sZW5ndGgsZT1hPW51bGw7Zm9yKHZhciBpLGosayxsLG0sbj0tMSxvPS0xO3RoaXMuX29mZnNldDx0aGlzLl9kYXRhTGVuOyl0aGlzLl9zZWFyY2goKT8odGhpcy5faW5kZXg8dT8oaj10aGlzLl9pbmRleCxrPTApOihqPXRoaXMuX2luZGV4JXUsaz0odGhpcy5faW5kZXgtaikvdSksMj09PXRoaXMuX2xlbmd0aD8oZltnKytdPWRbaytNXSxmW2crK109ZFtqXSk6KGZbZysrXT1kW2srTF0sZltnKytdPWRbal0sZltnKytdPWRbdGhpcy5fbGVuZ3RoXSksdGhpcy5fb2Zmc2V0Kz10aGlzLl9sZW5ndGgsfm8mJihvPS0xKSk6KGk9dGhpcy5fZGF0YS5jaGFyQ29kZUF0KHRoaXMuX29mZnNldCsrKSxDPmk/KEQ+aT8oaj1pLGs9MCxuPUYpOihqPWklRCxrPShpLWopL0Qsbj1rK0YpLG89PT1uP2ZbZysrXT1kW2pdOihmW2crK109ZFtuLUddLGZbZysrXT1kW2pdLG89bikpOihFPmk/KGo9aSxrPTAsbj1IKTooaj1pJUUsaz0oaS1qKS9FLG49aytIKSxEPmo/KGw9aixtPTApOihsPWolRCxtPShqLWwpL0QpLG89PT1uPyhmW2crK109ZFtsXSxmW2crK109ZFttXSk6KGZbZysrXT1kW0tdLGZbZysrXT1kW24tc10sZltnKytdPWRbbF0sZltnKytdPWRbbV0sbz1uKSkpLGc+PXkmJih0aGlzLl9vbkRhdGEoZixnKSxnPTApO3JldHVybiBnPjAmJnRoaXMuX29uRGF0YShmLGcpLHRoaXMuX29uRW5kKCksYj10aGlzLl9yZXN1bHQsdGhpcy5fcmVzdWx0PW51bGwsbnVsbD09PWI/XCJcIjpifX0sYi5wcm90b3R5cGU9e19pbml0OmZ1bmN0aW9uKGEpe2E9YXx8e30sdGhpcy5fcmVzdWx0PW51bGwsdGhpcy5fb25EYXRhQ2FsbGJhY2s9YS5vbkRhdGEsdGhpcy5fb25FbmRDYWxsYmFjaz1hLm9uRW5kfSxfY3JlYXRlVGFibGU6ZnVuY3Rpb24oKXtmb3IodmFyIGE9e30sYj0wO3M+YjtiKyspYVtyLmNoYXJBdChiKV09YjtyZXR1cm4gYX0sX29uRGF0YTpmdW5jdGlvbihhKXt2YXIgYjtpZih0aGlzLl9vbkRhdGFDYWxsYmFjayl7aWYoYSliPXRoaXMuX3Jlc3VsdCx0aGlzLl9yZXN1bHQ9W107ZWxzZXt2YXIgYz16LXY7Yj10aGlzLl9yZXN1bHQuc2xpY2Uodix2K2MpLHRoaXMuX3Jlc3VsdD10aGlzLl9yZXN1bHQuc2xpY2UoMCx2KS5jb25jYXQodGhpcy5fcmVzdWx0LnNsaWNlKHYrYykpfWIubGVuZ3RoPjAmJnRoaXMuX29uRGF0YUNhbGxiYWNrKGUoYikpfX0sX29uRW5kOmZ1bmN0aW9uKCl7dGhpcy5fb25FbmRDYWxsYmFjayYmdGhpcy5fb25FbmRDYWxsYmFjaygpfSxkZWNvbXByZXNzOmZ1bmN0aW9uKGEpe2lmKG51bGw9PWF8fDA9PT1hLmxlbmd0aClyZXR1cm5cIlwiO3RoaXMuX3Jlc3VsdD1pKGMoKSk7Zm9yKHZhciBiLGQsZixnLGgsaixrLGwsbSxuLG89XCJcIixwPXRoaXMuX2NyZWF0ZVRhYmxlKCkscT0hMSxyPW51bGwscz1hLmxlbmd0aCx0PTA7cz50O3QrKylpZihkPXBbYS5jaGFyQXQodCldLHZvaWQgMCE9PWQpe2lmKEk+ZClxPyhnPXBbYS5jaGFyQXQoKyt0KV0saD1nKkQrZCtFKnIpOmg9cipEK2QsdGhpcy5fcmVzdWx0W3RoaXMuX3Jlc3VsdC5sZW5ndGhdPWg7ZWxzZSBpZihKPmQpcj1kLUkscT0hMTtlbHNlIGlmKGQ9PT1LKWY9cFthLmNoYXJBdCgrK3QpXSxyPWYtNSxxPSEwO2Vsc2UgaWYoTj5kKXtpZihmPXBbYS5jaGFyQXQoKyt0KV0sTT5kPyhqPShkLUwpKnUrZixrPXBbYS5jaGFyQXQoKyt0KV0pOihqPShkLU0pKnUrZixrPTIpLGw9dGhpcy5fcmVzdWx0LnNsaWNlKC1qKSxsLmxlbmd0aD5rJiYobC5sZW5ndGg9ayksbT1sLmxlbmd0aCxsLmxlbmd0aD4wKWZvcihuPTA7az5uOylmb3IoYj0wO20+YiYmKHRoaXMuX3Jlc3VsdFt0aGlzLl9yZXN1bHQubGVuZ3RoXT1sW2JdLCEoKytuPj1rKSk7YisrKTtyPW51bGx9dGhpcy5fcmVzdWx0Lmxlbmd0aD49QSYmdGhpcy5fb25EYXRhKCl9cmV0dXJuIHRoaXMuX3Jlc3VsdD10aGlzLl9yZXN1bHQuc2xpY2UodiksdGhpcy5fb25EYXRhKCEwKSx0aGlzLl9vbkVuZCgpLG89ZSh0aGlzLl9yZXN1bHQpLHRoaXMuX3Jlc3VsdD1udWxsLG99fTt2YXIgTz17Y29tcHJlc3M6ZnVuY3Rpb24oYixjKXtyZXR1cm4gbmV3IGEoYykuY29tcHJlc3MoYil9LGRlY29tcHJlc3M6ZnVuY3Rpb24oYSxjKXtyZXR1cm4gbmV3IGIoYykuZGVjb21wcmVzcyhhKX19O3JldHVybiBPfSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vLy8gV2ViIEF1ZGlvIEFQSSDjg6njg4Pjg5Hjg7zjgq/jg6njgrkgLy8vL1xyXG5cclxuLy8gTU1MUGFyc2Vy44GvbW9oYXlvbmFv44GV44KT44Gu44KC44GuXHJcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tb2hheW9uYW8vbW1sLWl0ZXJhdG9yXHJcblxyXG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL1N5bnRheC5qc1wiO1xyXG5pbXBvcnQgU2Nhbm5lciBmcm9tIFwiLi9TY2FubmVyLmpzXCI7XHJcbmltcG9ydCBNTUxQYXJzZXIgZnJvbSBcIi4vTU1MUGFyc2VyLmpzXCI7XHJcbmltcG9ydCBEZWZhdWx0UGFyYW1zIGZyb20gXCIuL0RlZmF1bHRQYXJhbXMuanNcIjtcclxuaW1wb3J0IGx6YmFzZTYyIGZyb20gXCIuL2x6YmFzZTYyLm1pbi5qc1wiO1xyXG5pbXBvcnQgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcblxyXG4vLyB2YXIgZmZ0ID0gbmV3IEZGVCg0MDk2LCA0NDEwMCk7XHJcbmNvbnN0IEJVRkZFUl9TSVpFID0gMTAyNDtcclxuY29uc3QgVElNRV9CQVNFID0gOTY7XHJcblxyXG4vLyBNSURJ44OO44O844OIID0+IOWGjeeUn+ODrOODvOODiOWkieaPm+ODhuODvOODluODq1xyXG52YXIgbm90ZUZyZXEgPSBbXTtcclxuZm9yICh2YXIgaSA9IC02OTsgaSA8IDU4OyArK2kpIHtcclxuICBub3RlRnJlcS5wdXNoKE1hdGgucG93KDIsIGkgLyAxMikpO1xyXG59XHJcblxyXG4vLyBNSURJ44OO44O844OI5ZGo5rOi5pWwIOWkieaPm+ODhuODvOODluODq1xyXG52YXIgbWlkaUZyZXEgPSBbXTtcclxuZm9yIChsZXQgaSA9IDA7IGkgPCAxMjc7ICsraSkge1xyXG4gIG1pZGlGcmVxLnB1c2gobWlkaWNwcyhpKSk7XHJcbn1cclxuZnVuY3Rpb24gbWlkaWNwcyhub3RlTnVtYmVyKSB7XHJcbiAgcmV0dXJuIDQ0MCAqIE1hdGgucG93KDIsIChub3RlTnVtYmVyIC0gNjkpICogMSAvIDEyKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZVN0cihiaXRzLCB3YXZlc3RyKSB7XHJcbiAgdmFyIGFyciA9IFtdO1xyXG4gIHZhciBuID0gYml0cyAvIDQgfCAwO1xyXG4gIHZhciBjID0gMDtcclxuICB2YXIgemVyb3BvcyA9IDEgPDwgKGJpdHMgLSAxKTtcclxuICB3aGlsZSAoYyA8IHdhdmVzdHIubGVuZ3RoKSB7XHJcbiAgICB2YXIgZCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkge1xyXG4gICAgICBkID0gKGQgPDwgNCkgKyBwYXJzZUludCh3YXZlc3RyLmNoYXJBdChjKyspLCAnMTYnKTtcclxuICAgIH1cclxuICAgIGFyci5wdXNoKChkIC0gemVyb3BvcykgLyB6ZXJvcG9zKTtcclxuICB9XHJcbiAgcmV0dXJuIGFycjtcclxufVxyXG5cclxudmFyIHdhdmVzID0gW1xyXG4gIGRlY29kZVN0cig0LCAnRUVFRUVFRUVFRUVFRUVFRTAwMDAwMDAwMDAwMDAwMDAnKSxcclxuICBkZWNvZGVTdHIoNCwgJzAwMTEyMjMzNDQ1NTY2Nzc4ODk5QUFCQkNDRERFRUZGJyksXHJcbiAgZGVjb2RlU3RyKDQsICcwMjM0NjY0NTlBQThBN0E5Nzc5NjU2NTZBQ0FBQ0RFRicpLFxyXG4gIGRlY29kZVN0cig0LCAnQkRDRENBOTk5QUNEQ0RCOTQyMTIzNjc3NzYzMjEyNDcnKSxcclxuICBkZWNvZGVTdHIoNCwgJzdBQ0RFRENBNzQyMTAxMjQ3QkRFREI3MzIwMTM3RTc4JyksXHJcbiAgZGVjb2RlU3RyKDQsICdBQ0NBNzc5QkRFREE2NjY3OTk5NDEwMTI2Nzc0MjI0NycpLFxyXG4gIGRlY29kZVN0cig0LCAnN0VDOUNFQTdDRkQ4QUI3MjhEOTQ1NzIwMzg1MTM1MzEnKSxcclxuICBkZWNvZGVTdHIoNCwgJ0VFNzdFRTc3RUU3N0VFNzcwMDc3MDA3NzAwNzcwMDc3JyksXHJcbiAgZGVjb2RlU3RyKDQsICdFRUVFODg4ODg4ODg4ODg4MDAwMDg4ODg4ODg4ODg4OCcpLy/jg47jgqTjgrrnlKjjga7jg4Djg5/jg7zms6LlvaJcclxuXTtcclxuXHJcblxyXG5cclxudmFyIHdhdmVTYW1wbGVzID0gW107XHJcbmV4cG9ydCBmdW5jdGlvbiBXYXZlU2FtcGxlKGF1ZGlvY3R4LCBjaCwgc2FtcGxlTGVuZ3RoLCBzYW1wbGVSYXRlKSB7XHJcblxyXG4gIHRoaXMuc2FtcGxlID0gYXVkaW9jdHguY3JlYXRlQnVmZmVyKGNoLCBzYW1wbGVMZW5ndGgsIHNhbXBsZVJhdGUgfHwgYXVkaW9jdHguc2FtcGxlUmF0ZSk7XHJcbiAgdGhpcy5sb29wID0gZmFsc2U7XHJcbiAgdGhpcy5zdGFydCA9IDA7XHJcbiAgdGhpcy5lbmQgPSAoc2FtcGxlTGVuZ3RoIC0gMSkgLyAoc2FtcGxlUmF0ZSB8fCBhdWRpb2N0eC5zYW1wbGVSYXRlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdhdmVTYW1wbGVGcm9tV2F2ZXMoYXVkaW9jdHgsIHNhbXBsZUxlbmd0aCkge1xyXG4gIGZvciAodmFyIGkgPSAwLCBlbmQgPSB3YXZlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIHNhbXBsZSA9IG5ldyBXYXZlU2FtcGxlKGF1ZGlvY3R4LCAxLCBzYW1wbGVMZW5ndGgpO1xyXG4gICAgd2F2ZVNhbXBsZXMucHVzaChzYW1wbGUpO1xyXG4gICAgaWYgKGkgIT0gOCkge1xyXG4gICAgICB2YXIgd2F2ZWRhdGEgPSB3YXZlc1tpXTtcclxuICAgICAgdmFyIGRlbHRhID0gNDQwLjAgKiB3YXZlZGF0YS5sZW5ndGggLyBhdWRpb2N0eC5zYW1wbGVSYXRlO1xyXG4gICAgICB2YXIgc3RpbWUgPSAwO1xyXG4gICAgICB2YXIgb3V0cHV0ID0gc2FtcGxlLnNhbXBsZS5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgdmFyIGxlbiA9IHdhdmVkYXRhLmxlbmd0aDtcclxuICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgdmFyIGVuZHNhbXBsZSA9IDA7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2FtcGxlTGVuZ3RoOyArK2opIHtcclxuICAgICAgICBpbmRleCA9IHN0aW1lIHwgMDtcclxuICAgICAgICBvdXRwdXRbal0gPSB3YXZlZGF0YVtpbmRleF07XHJcbiAgICAgICAgc3RpbWUgKz0gZGVsdGE7XHJcbiAgICAgICAgaWYgKHN0aW1lID49IGxlbikge1xyXG4gICAgICAgICAgc3RpbWUgPSBzdGltZSAtIGxlbjtcclxuICAgICAgICAgIGVuZHNhbXBsZSA9IGo7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHNhbXBsZS5lbmQgPSBlbmRzYW1wbGUgLyBhdWRpb2N0eC5zYW1wbGVSYXRlO1xyXG4gICAgICBzYW1wbGUubG9vcCA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyDjg5zjgqTjgrk444Gv44OO44Kk44K65rOi5b2i44Go44GZ44KLXHJcbiAgICAgIHZhciBvdXRwdXQgPSBzYW1wbGUuc2FtcGxlLmdldENoYW5uZWxEYXRhKDApO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNhbXBsZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgb3V0cHV0W2pdID0gTWF0aC5yYW5kb20oKSAqIDIuMCAtIDEuMDtcclxuICAgICAgfVxyXG4gICAgICBzYW1wbGUuZW5kID0gc2FtcGxlTGVuZ3RoIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgc2FtcGxlLmxvb3AgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8g5Y+C6ICD77yaaHR0cDovL3d3dy5nMjAwa2cuY29tL2FyY2hpdmVzLzIwMTQvMTIvd2ViYXVkaW9hcGlwZXJpLmh0bWxcclxuZnVuY3Rpb24gZm91cmllcih3YXZlZm9ybSwgbGVuKSB7XHJcbiAgdmFyIHJlYWwgPSBuZXcgRmxvYXQzMkFycmF5KGxlbiksIGltYWcgPSBuZXcgRmxvYXQzMkFycmF5KGxlbik7XHJcbiAgdmFyIHdhdmxlbiA9IHdhdmVmb3JtLmxlbmd0aDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxlbjsgKytqKSB7XHJcbiAgICAgIHZhciB3YXZqID0gaiAvIGxlbiAqIHdhdmxlbjtcclxuICAgICAgdmFyIGQgPSB3YXZlZm9ybVt3YXZqIHwgMF07XHJcbiAgICAgIHZhciB0aCA9IGkgKiBqIC8gbGVuICogMiAqIE1hdGguUEk7XHJcbiAgICAgIHJlYWxbaV0gKz0gTWF0aC5jb3ModGgpICogZDtcclxuICAgICAgaW1hZ1tpXSArPSBNYXRoLnNpbih0aCkgKiBkO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gW3JlYWwsIGltYWddO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQZXJpb2RpY1dhdmVGcm9tV2F2ZXMoYXVkaW9jdHgpIHtcclxuICByZXR1cm4gd2F2ZXMubWFwKChkLCBpKSA9PiB7XHJcbiAgICBpZiAoaSAhPSA4KSB7XHJcbiAgICAgIGxldCB3YXZlRGF0YSA9IHdhdmVzW2ldO1xyXG4gICAgICBsZXQgZnJlcURhdGEgPSBmb3VyaWVyKHdhdmVEYXRhLCB3YXZlRGF0YS5sZW5ndGgpO1xyXG4gICAgICByZXR1cm4gYXVkaW9jdHguY3JlYXRlUGVyaW9kaWNXYXZlKGZyZXFEYXRhWzBdLCBmcmVxRGF0YVsxXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgd2F2ZURhdGEgPSBbXTtcclxuICAgICAgZm9yIChsZXQgaiA9IDAsIGUgPSB3YXZlc1tpXS5sZW5ndGg7IGogPCBlOyArK2opIHtcclxuICAgICAgICB3YXZlRGF0YS5wdXNoKE1hdGgucmFuZG9tKCkgKiAyLjAgLSAxLjApO1xyXG4gICAgICB9XHJcbiAgICAgIGxldCBmcmVxRGF0YSA9IGZvdXJpZXIod2F2ZURhdGEsIHdhdmVEYXRhLmxlbmd0aCk7XHJcbiAgICAgIHJldHVybiBhdWRpb2N0eC5jcmVhdGVQZXJpb2RpY1dhdmUoZnJlcURhdGFbMF0sIGZyZXFEYXRhWzFdKTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuLy8g44OJ44Op44Og44K144Oz44OX44OrXHJcblxyXG5jb25zdCBkcnVtU2FtcGxlcyA9IFtcclxuICB7IG5hbWU6ICdiYXNzMScsIHBhdGg6ICdiYXNlL2F1ZGlvL2JkMV9sei5qc29uJyB9LCAvLyBAOVxyXG4gIHsgbmFtZTogJ2Jhc3MyJywgcGF0aDogJ2Jhc2UvYXVkaW8vYmQyX2x6Lmpzb24nIH0sIC8vIEAxMFxyXG4gIHsgbmFtZTogJ2Nsb3NlZCcsIHBhdGg6ICdiYXNlL2F1ZGlvL2Nsb3NlZF9sei5qc29uJyB9LCAvLyBAMTFcclxuICB7IG5hbWU6ICdjb3diZWxsJywgcGF0aDogJ2Jhc2UvYXVkaW8vY293YmVsbF9sei5qc29uJyB9LC8vIEAxMlxyXG4gIHsgbmFtZTogJ2NyYXNoJywgcGF0aDogJ2Jhc2UvYXVkaW8vY3Jhc2hfbHouanNvbicgfSwvLyBAMTNcclxuICB7IG5hbWU6ICdoYW5kY2xhcCcsIHBhdGg6ICdiYXNlL2F1ZGlvL2hhbmRjbGFwX2x6Lmpzb24nIH0sIC8vIEAxNFxyXG4gIHsgbmFtZTogJ2hpdG9tJywgcGF0aDogJ2Jhc2UvYXVkaW8vaGl0b21fbHouanNvbicgfSwvLyBAMTVcclxuICB7IG5hbWU6ICdsb3d0b20nLCBwYXRoOiAnYmFzZS9hdWRpby9sb3d0b21fbHouanNvbicgfSwvLyBAMTZcclxuICB7IG5hbWU6ICdtaWR0b20nLCBwYXRoOiAnYmFzZS9hdWRpby9taWR0b21fbHouanNvbicgfSwvLyBAMTdcclxuICB7IG5hbWU6ICdvcGVuJywgcGF0aDogJ2Jhc2UvYXVkaW8vb3Blbl9sei5qc29uJyB9LC8vIEAxOFxyXG4gIHsgbmFtZTogJ3JpZGUnLCBwYXRoOiAnYmFzZS9hdWRpby9yaWRlX2x6Lmpzb24nIH0sLy8gQDE5XHJcbiAgeyBuYW1lOiAncmltc2hvdCcsIHBhdGg6ICdiYXNlL2F1ZGlvL3JpbXNob3RfbHouanNvbicgfSwvLyBAMjBcclxuICB7IG5hbWU6ICdzZDEnLCBwYXRoOiAnYmFzZS9hdWRpby9zZDFfbHouanNvbicgfSwvLyBAMjFcclxuICB7IG5hbWU6ICdzZDInLCBwYXRoOiAnYmFzZS9hdWRpby9zZDJfbHouanNvbicgfSwvLyBAMjJcclxuICB7IG5hbWU6ICd0YW1iJywgcGF0aDogJ2Jhc2UvYXVkaW8vdGFtYl9sei5qc29uJyB9LC8vIEAyM1xyXG4gIHsgbmFtZTondm9pY2UnLHBhdGg6ICdiYXNlL2F1ZGlvL21vdmllX2x6Lmpzb24nfS8vIEAyNFxyXG5dO1xyXG5cclxubGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5mdW5jdGlvbiBqc29uKHVybCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICB4aHIub3BlbihcImdldFwiLCB1cmwsIHRydWUpO1xyXG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKHhoci5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHRoaXMucmVzcG9uc2VUZXh0KSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignWE1MSHR0cFJlcXVlc3QgRXJyb3I6JyArIHhoci5zdGF0dXMpKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHhoci5vbmVycm9yID0gZXJyID0+IHsgcmVqZWN0KGVycik7IH07XHJcbiAgICB4aHIuc2VuZChudWxsKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVhZERydW1TYW1wbGUoYXVkaW9jdHgpIHtcclxuICBsZXQgcHIgPSBQcm9taXNlLnJlc29sdmUoMCk7XHJcbiAgZHJ1bVNhbXBsZXMuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgcHIgPVxyXG4gICAgICBwci50aGVuKGpzb24uYmluZChudWxsLHNmZy5yZXNvdXJjZUJhc2UgKyBkLnBhdGgpKVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgbGV0IHNhbXBsZVN0ciA9IGx6YmFzZTYyLmRlY29tcHJlc3MoZGF0YS5zYW1wbGVzKTtcclxuICAgICAgICAgIGxldCBzYW1wbGVzID0gZGVjb2RlU3RyKDQsIHNhbXBsZVN0cik7XHJcbiAgICAgICAgICBsZXQgd3MgPSBuZXcgV2F2ZVNhbXBsZShhdWRpb2N0eCwgMSwgc2FtcGxlcy5sZW5ndGgsIGRhdGEuc2FtcGxlUmF0ZSk7XHJcbiAgICAgICAgICBsZXQgc2IgPSB3cy5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMCwgZSA9IHNiLmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgICAgICAgICBzYltpXSA9IHNhbXBsZXNbaV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB3YXZlU2FtcGxlcy5wdXNoKHdzKTtcclxuICAgICAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHByO1xyXG59XHJcblxyXG4vLyBleHBvcnQgY2xhc3MgV2F2ZVRleHR1cmUgeyBcclxuLy8gICBjb25zdHJ1Y3Rvcih3YXZlKSB7XHJcbi8vICAgICB0aGlzLndhdmUgPSB3YXZlIHx8IHdhdmVzWzBdO1xyXG4vLyAgICAgdGhpcy50ZXggPSBuZXcgQ2FudmFzVGV4dHVyZSgzMjAsIDEwICogMTYpO1xyXG4vLyAgICAgdGhpcy5yZW5kZXIoKTtcclxuLy8gICB9XHJcblxyXG4vLyAgIHJlbmRlcigpIHtcclxuLy8gICAgIHZhciBjdHggPSB0aGlzLnRleC5jdHg7XHJcbi8vICAgICB2YXIgd2F2ZSA9IHRoaXMud2F2ZTtcclxuLy8gICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4vLyAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4vLyAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcclxuLy8gICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzIwOyBpICs9IDEwKSB7XHJcbi8vICAgICAgIGN0eC5tb3ZlVG8oaSwgMCk7XHJcbi8vICAgICAgIGN0eC5saW5lVG8oaSwgMjU1KTtcclxuLy8gICAgIH1cclxuLy8gICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTYwOyBpICs9IDEwKSB7XHJcbi8vICAgICAgIGN0eC5tb3ZlVG8oMCwgaSk7XHJcbi8vICAgICAgIGN0eC5saW5lVG8oMzIwLCBpKTtcclxuLy8gICAgIH1cclxuLy8gICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjcpJztcclxuLy8gICAgIGN0eC5yZWN0KDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcclxuLy8gICAgIGN0eC5zdHJva2UoKTtcclxuLy8gICAgIGZvciAodmFyIGkgPSAwLCBjID0gMDsgaSA8IGN0eC5jYW52YXMud2lkdGg7IGkgKz0gMTAsICsrYykge1xyXG4vLyAgICAgICBjdHguZmlsbFJlY3QoaSwgKHdhdmVbY10gPiAwKSA/IDgwIC0gd2F2ZVtjXSAqIDgwIDogODAsIDEwLCBNYXRoLmFicyh3YXZlW2NdKSAqIDgwKTtcclxuLy8gICAgIH1cclxuLy8gICAgIHRoaXMudGV4LnRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4vLyAgIH1cclxuLy8gfTtcclxuXHJcbi8vLyDjgqjjg7Pjg5njg63jg7zjg5fjgrjjgqfjg43jg6zjg7zjgr/jg7xcclxuZXhwb3J0IGNsYXNzIEVudmVsb3BlR2VuZXJhdG9yIHtcclxuICBjb25zdHJ1Y3Rvcih2b2ljZSwgYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSkge1xyXG4gICAgdGhpcy52b2ljZSA9IHZvaWNlO1xyXG4gICAgLy90aGlzLmtleW9uID0gZmFsc2U7XHJcbiAgICB0aGlzLmF0dGFja1RpbWUgPSBhdHRhY2sgfHwgMC4wMDA1O1xyXG4gICAgdGhpcy5kZWNheVRpbWUgPSBkZWNheSB8fCAwLjA1O1xyXG4gICAgdGhpcy5zdXN0YWluTGV2ZWwgPSBzdXN0YWluIHx8IDAuNTtcclxuICAgIHRoaXMucmVsZWFzZVRpbWUgPSByZWxlYXNlIHx8IDAuNTtcclxuICAgIHRoaXMudiA9IDEuMDtcclxuICAgIHRoaXMua2V5T25UaW1lID0gMDtcclxuICAgIHRoaXMua2V5T2ZmVGltZSA9IDA7XHJcbiAgICB0aGlzLmtleU9uID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBrZXlvbih0LCB2ZWwpIHtcclxuICAgIHRoaXMudiA9IHZlbCB8fCAxLjA7XHJcbiAgICB2YXIgdiA9IHRoaXMudjtcclxuICAgIHZhciB0MCA9IHQgfHwgdGhpcy52b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICAgIHZhciB0MSA9IHQwICsgdGhpcy5hdHRhY2tUaW1lO1xyXG4gICAgdmFyIGdhaW4gPSB0aGlzLnZvaWNlLmdhaW4uZ2FpbjtcclxuICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuICAgIGdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDApO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2LCB0MSk7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpbkxldmVsICogdiwgdDEgKyB0aGlzLmRlY2F5VGltZSk7XHJcbiAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQxLCB0MSArIHRoaXMuZGVjYXkgLyB2KTtcclxuICAgIHRoaXMua2V5T25UaW1lID0gdDA7XHJcbiAgICB0aGlzLmtleU9mZlRpbWUgPSAwO1xyXG4gICAgdGhpcy5rZXlPbiA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBrZXlvZmYodCkge1xyXG4gICAgdmFyIHZvaWNlID0gdGhpcy52b2ljZTtcclxuICAgIHZhciBnYWluID0gdm9pY2UuZ2Fpbi5nYWluO1xyXG4gICAgdmFyIHQwID0gdCB8fCB2b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICAgIC8vICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHRoaXMua2V5T25UaW1lKTtcclxuICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuICAgIGxldCByZWxlYXNlX3RpbWUgPSB0MCArIHRoaXMucmVsZWFzZVRpbWU7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHJlbGVhc2VfdGltZSk7XHJcbiAgICB0aGlzLmtleU9mZlRpbWUgPSB0MDtcclxuICAgIHRoaXMua2V5T25UaW1lID0gMDtcclxuICAgIHRoaXMua2V5T24gPSBmYWxzZTtcclxuICAgIHJldHVybiByZWxlYXNlX3RpbWU7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIFZvaWNlIHtcclxuICBjb25zdHJ1Y3RvcihhdWRpb2N0eCkge1xyXG4gICAgdGhpcy5hdWRpb2N0eCA9IGF1ZGlvY3R4O1xyXG4gICAgdGhpcy5zYW1wbGUgPSB3YXZlU2FtcGxlc1s2XTtcclxuICAgIHRoaXMudm9sdW1lID0gYXVkaW9jdHguY3JlYXRlR2FpbigpO1xyXG4gICAgdGhpcy5lbnZlbG9wZSA9IG5ldyBFbnZlbG9wZUdlbmVyYXRvcih0aGlzLFxyXG4gICAgICAwLjUsXHJcbiAgICAgIDAuMjUsXHJcbiAgICAgIDAuOCxcclxuICAgICAgMi41XHJcbiAgICApO1xyXG4gICAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbiAgICB0aGlzLmRldHVuZSA9IDEuMDtcclxuICAgIHRoaXMudm9sdW1lLmdhaW4udmFsdWUgPSAxLjA7XHJcbiAgICB0aGlzLm91dHB1dCA9IHRoaXMudm9sdW1lO1xyXG4gIH1cclxuXHJcbiAgaW5pdFByb2Nlc3NvcigpIHtcclxuICAgIC8vIGlmKHRoaXMucHJvY2Vzc29yKXtcclxuICAgIC8vICAgdGhpcy5zdG9wKCk7XHJcbiAgICAvLyAgIHRoaXMucHJvY2Vzc29yLmRpc2Nvbm5lY3QoKTtcclxuICAgIC8vICAgdGhpcy5wcm9jZXNzb3IgPSBudWxsO1xyXG4gICAgLy8gfVxyXG4gICAgbGV0IHByb2Nlc3NvciA9IHRoaXMucHJvY2Vzc29yID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcclxuICAgIGxldCBnYWluID0gdGhpcy5nYWluID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgICBnYWluLmdhaW4udmFsdWUgPSAwLjA7XHJcblxyXG4gICAgdGhpcy5wcm9jZXNzb3IuYnVmZmVyID0gdGhpcy5zYW1wbGUuc2FtcGxlO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcCA9IHRoaXMuc2FtcGxlLmxvb3A7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5sb29wU3RhcnQgPSAwO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLnZhbHVlID0gMS4wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcEVuZCA9IHRoaXMuc2FtcGxlLmVuZDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmNvbm5lY3QodGhpcy5nYWluKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLm9uZW5kZWQgPSAoKSA9PiB7XHJcbiAgICAgIHByb2Nlc3Nvci5kaXNjb25uZWN0KCk7XHJcbiAgICAgIGdhaW4uZGlzY29ubmVjdCgpO1xyXG4gICAgfTtcclxuICAgIGdhaW4uY29ubmVjdCh0aGlzLnZvbHVtZSk7XHJcbiAgfVxyXG5cclxuICAvLyBzZXRTYW1wbGUgKHNhbXBsZSkge1xyXG4gIC8vICAgICB0aGlzLmVudmVsb3BlLmtleW9mZigwKTtcclxuICAvLyAgICAgdGhpcy5wcm9jZXNzb3IuZGlzY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gIC8vICAgICB0aGlzLnNhbXBsZSA9IHNhbXBsZTtcclxuICAvLyAgICAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbiAgLy8gICAgIHRoaXMucHJvY2Vzc29yLnN0YXJ0KCk7XHJcbiAgLy8gfVxyXG5cclxuICBzdGFydChzdGFydFRpbWUpIHtcclxuICAgIC8vICAgdGhpcy5wcm9jZXNzb3IuZGlzY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gICAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdGFydChzdGFydFRpbWUpO1xyXG4gIH1cclxuXHJcbiAgc3RvcCh0aW1lKSB7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdG9wKHRpbWUpO1xyXG4gICAgLy90aGlzLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICBrZXlvbih0LCBub3RlLCB2ZWwpIHtcclxuICAgIHRoaXMuc3RhcnQodCk7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuc2V0VmFsdWVBdFRpbWUobm90ZUZyZXFbbm90ZV0gKiB0aGlzLmRldHVuZSwgdCk7XHJcbiAgICB0aGlzLmtleU9uVGltZSA9IHQ7XHJcbiAgICB0aGlzLmVudmVsb3BlLmtleW9uKHQsIHZlbCk7XHJcbiAgfVxyXG5cclxuICBrZXlvZmYodCkge1xyXG4gICAgdGhpcy5nYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQvKnRoaXMua2V5T25UaW1lKi8pO1xyXG4gICAgdGhpcy5rZXlPZmZUaW1lID0gdGhpcy5lbnZlbG9wZS5rZXlvZmYodCk7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdG9wKHRoaXMua2V5T2ZmVGltZSk7XHJcbiAgfVxyXG5cclxuICBpc0tleU9uKHQpIHtcclxuICAgIHJldHVybiB0aGlzLmVudmVsb3BlLmtleU9uICYmICh0aGlzLmtleU9uVGltZSA8PSB0KTtcclxuICB9XHJcblxyXG4gIGlzS2V5T2ZmKHQpIHtcclxuICAgIHJldHVybiAhdGhpcy5lbnZlbG9wZS5rZXlPbiAmJiAodGhpcy5rZXlPZmZUaW1lIDw9IHQpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgdGhpcy5nYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODnOOCpOOCuVxyXG5leHBvcnQgY2xhc3MgT3NjVm9pY2Uge1xyXG4gIGNvbnN0cnVjdG9yKGF1ZGlvY3R4LCBwZXJpb2RpY1dhdmUpIHtcclxuICAgIHRoaXMuYXVkaW9jdHggPSBhdWRpb2N0eDtcclxuICAgIHRoaXMuc2FtcGxlID0gcGVyaW9kaWNXYXZlO1xyXG4gICAgdGhpcy52b2x1bWUgPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgICB0aGlzLmVudmVsb3BlID0gbmV3IEVudmVsb3BlR2VuZXJhdG9yKHRoaXMsXHJcbiAgICAgIDAuNSxcclxuICAgICAgMC4yNSxcclxuICAgICAgMC44LFxyXG4gICAgICAyLjVcclxuICAgICk7XHJcbiAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICAgIHRoaXMuZGV0dW5lID0gMS4wO1xyXG4gICAgdGhpcy52b2x1bWUuZ2Fpbi52YWx1ZSA9IDEuMDtcclxuICAgIHRoaXMub3V0cHV0ID0gdGhpcy52b2x1bWU7XHJcbiAgfVxyXG5cclxuICBpbml0UHJvY2Vzc29yKCkge1xyXG4gICAgbGV0IHByb2Nlc3NvciA9IHRoaXMucHJvY2Vzc29yID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVPc2NpbGxhdG9yKCk7XHJcbiAgICBsZXQgZ2FpbiA9IHRoaXMuZ2FpbiA9IHRoaXMuYXVkaW9jdHguY3JlYXRlR2FpbigpO1xyXG4gICAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwLjA7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zZXRQZXJpb2RpY1dhdmUodGhpcy5zYW1wbGUpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IuY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iub25lbmRlZCA9ICgpID0+IHtcclxuICAgICAgcHJvY2Vzc29yLmRpc2Nvbm5lY3QoKTtcclxuICAgICAgZ2Fpbi5kaXNjb25uZWN0KCk7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5nYWluLmNvbm5lY3QodGhpcy52b2x1bWUpO1xyXG4gIH1cclxuXHJcbiAgc3RhcnQoc3RhcnRUaW1lKSB7XHJcbiAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0YXJ0KHN0YXJ0VGltZSk7XHJcbiAgfVxyXG5cclxuICBzdG9wKHRpbWUpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0b3AodGltZSk7XHJcbiAgfVxyXG5cclxuICBrZXlvbih0LCBub3RlLCB2ZWwpIHtcclxuICAgIHRoaXMuc3RhcnQodCk7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5mcmVxdWVuY3kuc2V0VmFsdWVBdFRpbWUobWlkaUZyZXFbbm90ZV0gKiB0aGlzLmRldHVuZSwgdCk7XHJcbiAgICB0aGlzLmtleU9uVGltZSA9IHQ7XHJcbiAgICB0aGlzLmVudmVsb3BlLmtleW9uKHQsIHZlbCk7XHJcbiAgfVxyXG5cclxuICBrZXlvZmYodCkge1xyXG4gICAgdGhpcy5nYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQvKnRoaXMua2V5T25UaW1lKi8pO1xyXG4gICAgdGhpcy5rZXlPZmZUaW1lID0gdGhpcy5lbnZlbG9wZS5rZXlvZmYodCk7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdG9wKHRoaXMua2V5T2ZmVGltZSk7XHJcbiAgfVxyXG5cclxuICBpc0tleU9uKHQpIHtcclxuICAgIHJldHVybiB0aGlzLmVudmVsb3BlLmtleU9uICYmICh0aGlzLmtleU9uVGltZSA8PSB0KTtcclxuICB9XHJcblxyXG4gIGlzS2V5T2ZmKHQpIHtcclxuICAgIHJldHVybiAhdGhpcy5lbnZlbG9wZS5rZXlPbiAmJiAodGhpcy5rZXlPZmZUaW1lIDw9IHQpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgdGhpcy5nYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEF1ZGlvIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuVk9JQ0VTID0gMTY7XHJcbiAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgd2luZG93Lm1vekF1ZGlvQ29udGV4dDtcclxuXHJcbiAgICBpZiAodGhpcy5hdWRpb0NvbnRleHQpIHtcclxuICAgICAgdGhpcy5hdWRpb2N0eCA9IG5ldyB0aGlzLmF1ZGlvQ29udGV4dCgpO1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy52b2ljZXMgPSBbXTtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICBjcmVhdGVXYXZlU2FtcGxlRnJvbVdhdmVzKHRoaXMuYXVkaW9jdHgsIEJVRkZFUl9TSVpFKTtcclxuICAgICAgdGhpcy5wZXJpb2RpY1dhdmVzID0gY3JlYXRlUGVyaW9kaWNXYXZlRnJvbVdhdmVzKHRoaXMuYXVkaW9jdHgpO1xyXG4gICAgICB0aGlzLmZpbHRlciA9IHRoaXMuYXVkaW9jdHguY3JlYXRlQmlxdWFkRmlsdGVyKCk7XHJcbiAgICAgIHRoaXMuZmlsdGVyLnR5cGUgPSAnbG93cGFzcyc7XHJcbiAgICAgIHRoaXMuZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IDIwMDAwO1xyXG4gICAgICB0aGlzLmZpbHRlci5RLnZhbHVlID0gMC4wMDAxO1xyXG4gICAgICB0aGlzLm5vaXNlRmlsdGVyID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcclxuICAgICAgdGhpcy5ub2lzZUZpbHRlci50eXBlID0gJ2xvd3Bhc3MnO1xyXG4gICAgICB0aGlzLm5vaXNlRmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IDEwMDA7XHJcbiAgICAgIHRoaXMubm9pc2VGaWx0ZXIuUS52YWx1ZSA9IDEuODtcclxuICAgICAgdGhpcy5jb21wID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKTtcclxuICAgICAgdGhpcy5maWx0ZXIuY29ubmVjdCh0aGlzLmNvbXApO1xyXG4gICAgICB0aGlzLm5vaXNlRmlsdGVyLmNvbm5lY3QodGhpcy5jb21wKTtcclxuICAgICAgdGhpcy5jb21wLmNvbm5lY3QodGhpcy5hdWRpb2N0eC5kZXN0aW5hdGlvbik7XHJcbiAgICAgIC8vIHRoaXMuZmlsdGVyLmNvbm5lY3QodGhpcy5hdWRpb2N0eC5kZXN0aW5hdGlvbik7XHJcbiAgICAgIC8vIHRoaXMubm9pc2VGaWx0ZXIuY29ubmVjdCh0aGlzLmF1ZGlvY3R4LmRlc3RpbmF0aW9uKTtcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuVk9JQ0VTOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICAvL3ZhciB2ID0gbmV3IE9zY1ZvaWNlKHRoaXMuYXVkaW9jdHgsdGhpcy5wZXJpb2RpY1dhdmVzWzBdKTtcclxuICAgICAgICB2YXIgdiA9IG5ldyBWb2ljZSh0aGlzLmF1ZGlvY3R4KTtcclxuICAgICAgICB0aGlzLnZvaWNlcy5wdXNoKHYpO1xyXG4gICAgICAgIGlmIChpID09ICh0aGlzLlZPSUNFUyAtIDEpKSB7XHJcbiAgICAgICAgICB2Lm91dHB1dC5jb25uZWN0KHRoaXMubm9pc2VGaWx0ZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2Lm91dHB1dC5jb25uZWN0KHRoaXMuZmlsdGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5yZWFkRHJ1bVNhbXBsZSA9IHJlYWREcnVtU2FtcGxlKHRoaXMuYXVkaW9jdHgpO1xyXG4gICAgICAvLyAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcbiAgICAgIC8vdGhpcy52b2ljZXNbMF0ub3V0cHV0LmNvbm5lY3QoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN0YXJ0KCkge1xyXG4gICAgLy8gdmFyIHZvaWNlcyA9IHRoaXMudm9pY2VzO1xyXG4gICAgLy8gZm9yICh2YXIgaSA9IDAsIGVuZCA9IHZvaWNlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIC8vIHtcclxuICAgIC8vICAgdm9pY2VzW2ldLnN0YXJ0KDApO1xyXG4gICAgLy8gfVxyXG4gIH1cclxuXHJcbiAgc3RvcCgpIHtcclxuICAgIC8vaWYodGhpcy5zdGFydGVkKVxyXG4gICAgLy97XHJcbiAgICB2YXIgdm9pY2VzID0gdGhpcy52b2ljZXM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdm9pY2VzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZvaWNlc1tpXS5zdG9wKDApO1xyXG4gICAgfVxyXG4gICAgLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgLy99XHJcbiAgfVxyXG4gIFxyXG4gIGdldFdhdmVTYW1wbGUobm8pe1xyXG4gICAgcmV0dXJuIHdhdmVTYW1wbGVzW25vXTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbi8qIOOCt+ODvOOCseODs+OCteODvOOCs+ODnuODs+ODiSAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG5mdW5jdGlvbiBjYWxjU3RlcChub3RlTGVuZ3RoKSB7XHJcbiAgLy8g6ZW344GV44GL44KJ44K544OG44OD44OX44KS6KiI566X44GZ44KLXHJcbiAgbGV0IHByZXYgPSBudWxsO1xyXG4gIGxldCBkb3R0ZWQgPSAwO1xyXG5cclxuICBsZXQgbWFwID0gbm90ZUxlbmd0aC5tYXAoKGVsZW0pID0+IHtcclxuICAgIHN3aXRjaCAoZWxlbSkge1xyXG4gICAgICBjYXNlIG51bGw6XHJcbiAgICAgICAgZWxlbSA9IHByZXY7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMDpcclxuICAgICAgICBlbGVtID0gKGRvdHRlZCAqPSAyKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBwcmV2ID0gZG90dGVkID0gZWxlbTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbGVuZ3RoID0gZWxlbSAhPT0gbnVsbCA/IGVsZW0gOiBEZWZhdWx0UGFyYW1zLmxlbmd0aDtcclxuXHJcbiAgICByZXR1cm4gVElNRV9CQVNFICogKDQgLyBsZW5ndGgpO1xyXG4gIH0pO1xyXG4gIHJldHVybiBtYXAucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOb3RlIHtcclxuICBjb25zdHJ1Y3Rvcihub3RlcywgbGVuZ3RoKSB7XHJcblxyXG4gICAgdGhpcy5ub3RlcyA9IG5vdGVzO1xyXG4gICAgaWYgKGxlbmd0aFswXSkge1xyXG4gICAgICB0aGlzLnN0ZXAgPSBjYWxjU3RlcChsZW5ndGgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdGhpcy5ub3Rlcy5mb3JFYWNoKChuLCBpKSA9PiB7XHJcbiAgICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgICAgdmFyIG5vdGUgPSBuO1xyXG4gICAgICB2YXIgb2N0ID0gdGhpcy5vY3QgfHwgYmFjay5vY3Q7XHJcbiAgICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgICAgdmFyIGdhdGUgPSB0aGlzLmdhdGUgfHwgYmFjay5nYXRlO1xyXG4gICAgICB2YXIgdmVsID0gdGhpcy52ZWwgfHwgYmFjay52ZWw7XHJcbiAgICAgIHNldFF1ZXVlKHRyYWNrLCBub3RlLCBvY3QsIGkgPT0gMCA/IHN0ZXAgOiAwLCBnYXRlLCB2ZWwpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBTZXFEYXRhIHtcclxuICBjb25zdHJ1Y3Rvcihub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gICAgdGhpcy5ub3RlID0gbm90ZTtcclxuICAgIHRoaXMub2N0ID0gb2N0O1xyXG4gICAgLy90aGlzLm5vID0gbm90ZS5ubyArIG9jdCAqIDEyO1xyXG4gICAgdGhpcy5zdGVwID0gc3RlcDtcclxuICAgIHRoaXMuZ2F0ZSA9IGdhdGU7XHJcbiAgICB0aGlzLnZlbCA9IHZlbDtcclxuICAgIHRoaXMuc2FtcGxlID0gd2F2ZVxyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdmFyIGJhY2sgPSB0cmFjay5iYWNrO1xyXG4gICAgdmFyIG5vdGUgPSB0aGlzLm5vdGUgfHwgYmFjay5ub3RlO1xyXG4gICAgdmFyIG9jdCA9IHRoaXMub2N0IHx8IGJhY2sub2N0O1xyXG4gICAgdmFyIHN0ZXAgPSB0aGlzLnN0ZXAgfHwgYmFjay5zdGVwO1xyXG4gICAgdmFyIGdhdGUgPSB0aGlzLmdhdGUgfHwgYmFjay5nYXRlO1xyXG4gICAgdmFyIHZlbCA9IHRoaXMudmVsIHx8IGJhY2sudmVsO1xyXG4gICAgc2V0UXVldWUodHJhY2ssIG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFF1ZXVlKHRyYWNrLCBub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIGxldCBubyA9IG5vdGUgKyBvY3QgKiAxMjtcclxuICBsZXQgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgdmFyIHN0ZXBfdGltZSA9IChzdGVwID8gdHJhY2sucGxheWluZ1RpbWUgOiBiYWNrLnBsYXlpbmdUaW1lKTtcclxuICAvLyB2YXIgZ2F0ZV90aW1lID0gKChnYXRlID49IDApID8gZ2F0ZSAqIDYwIDogc3RlcCAqIGdhdGUgKiA2MCAqIC0xLjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgdHJhY2sucGxheWluZ1RpbWU7XHJcblxyXG4gIHZhciBnYXRlX3RpbWUgPSAoKHN0ZXAgPT0gMCA/IGJhY2suY29kZVN0ZXAgOiBzdGVwKSAqIGdhdGUgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbykgKyAoc3RlcCA/IHRyYWNrLnBsYXlpbmdUaW1lIDogYmFjay5wbGF5aW5nVGltZSk7XHJcbiAgLy9sZXQgdm9pY2UgPSB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF07XHJcbiAgbGV0IHZvaWNlID0gdHJhY2suYXNzaWduVm9pY2Uoc3RlcF90aW1lKTtcclxuICAvL3ZvaWNlLnJlc2V0KCk7XHJcbiAgdm9pY2Uuc2FtcGxlID0gYmFjay5zYW1wbGU7XHJcbiAgdm9pY2UuZW52ZWxvcGUuYXR0YWNrVGltZSA9IGJhY2suYXR0YWNrO1xyXG4gIHZvaWNlLmVudmVsb3BlLmRlY2F5VGltZSA9IGJhY2suZGVjYXk7XHJcbiAgdm9pY2UuZW52ZWxvcGUuc3VzdGFpbkxldmVsID0gYmFjay5zdXN0YWluO1xyXG4gIHZvaWNlLmVudmVsb3BlLnJlbGVhc2VUaW1lID0gYmFjay5yZWxlYXNlO1xyXG4gIHZvaWNlLmRldHVuZSA9IGJhY2suZGV0dW5lO1xyXG4gIHZvaWNlLnZvbHVtZS5nYWluLnNldFZhbHVlQXRUaW1lKGJhY2sudm9sdW1lLCBzdGVwX3RpbWUpO1xyXG5cclxuICAvL3ZvaWNlLmluaXRQcm9jZXNzb3IoKTtcclxuXHJcbiAgLy9jb25zb2xlLmxvZyh0cmFjay5zZXF1ZW5jZXIudGVtcG8pO1xyXG4gIHZvaWNlLmtleW9uKHN0ZXBfdGltZSwgbm8sIHZlbCk7XHJcbiAgdm9pY2Uua2V5b2ZmKGdhdGVfdGltZSk7XHJcbiAgaWYgKHN0ZXApIHtcclxuICAgIGJhY2suY29kZVN0ZXAgPSBzdGVwO1xyXG4gICAgYmFjay5wbGF5aW5nVGltZSA9IHRyYWNrLnBsYXlpbmdUaW1lO1xyXG4gIH1cclxuXHJcbiAgdHJhY2sucGxheWluZ1RpbWUgPSAoc3RlcCAqIDYwKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKSArIHRyYWNrLnBsYXlpbmdUaW1lO1xyXG4gIC8vIGJhY2sudm9pY2UgPSB2b2ljZTtcclxuICAvLyBiYWNrLm5vdGUgPSBub3RlO1xyXG4gIC8vIGJhY2sub2N0ID0gb2N0O1xyXG4gIC8vIGJhY2suZ2F0ZSA9IGdhdGU7XHJcbiAgLy8gYmFjay52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBTKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xyXG4gIGlmIChTLmxlbmd0aCAhPSBhcmdzLmxlbmd0aCkge1xyXG4gICAgaWYgKHR5cGVvZiAoYXJnc1thcmdzLmxlbmd0aCAtIDFdKSA9PSAnb2JqZWN0JyAmJiAhKGFyZ3NbYXJncy5sZW5ndGggLSAxXSBpbnN0YW5jZW9mIE5vdGUpKSB7XHJcbiAgICAgIHZhciBhcmdzMSA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcclxuICAgICAgdmFyIGwgPSBhcmdzLmxlbmd0aCAtIDE7XHJcbiAgICAgIHJldHVybiBuZXcgU2VxRGF0YShcclxuICAgICAgICAoKGwgIT0gMCkgPyBub3RlIDogZmFsc2UpIHx8IGFyZ3MxLm5vdGUgfHwgYXJnczEubiB8fCBudWxsLFxyXG4gICAgICAgICgobCAhPSAxKSA/IG9jdCA6IGZhbHNlKSB8fCBhcmdzMS5vY3QgfHwgYXJnczEubyB8fCBudWxsLFxyXG4gICAgICAgICgobCAhPSAyKSA/IHN0ZXAgOiBmYWxzZSkgfHwgYXJnczEuc3RlcCB8fCBhcmdzMS5zIHx8IG51bGwsXHJcbiAgICAgICAgKChsICE9IDMpID8gZ2F0ZSA6IGZhbHNlKSB8fCBhcmdzMS5nYXRlIHx8IGFyZ3MxLmcgfHwgbnVsbCxcclxuICAgICAgICAoKGwgIT0gNCkgPyB2ZWwgOiBmYWxzZSkgfHwgYXJnczEudmVsIHx8IGFyZ3MxLnYgfHwgbnVsbFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gbmV3IFNlcURhdGEobm90ZSB8fCBudWxsLCBvY3QgfHwgbnVsbCwgc3RlcCB8fCBudWxsLCBnYXRlIHx8IG51bGwsIHZlbCB8fCBudWxsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gUzEobm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpIHtcclxuICByZXR1cm4gUyhub3RlLCBvY3QsIGwoc3RlcCksIGdhdGUsIHZlbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMyKG5vdGUsIGxlbiwgZG90LCBvY3QsIGdhdGUsIHZlbCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgbChsZW4sIGRvdCksIGdhdGUsIHZlbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMzKG5vdGUsIHN0ZXAsIGdhdGUsIHZlbCwgb2N0KSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5cclxuLy8vIOmfs+espuOBrumVt+OBleaMh+WumlxyXG5cclxuY2xhc3MgTGVuZ3RoIHtcclxuICBjb25zdHJ1Y3RvcihsZW4pIHtcclxuICAgIHRoaXMuc3RlcCA9IGNhbGNTdGVwKGxlbik7XHJcbiAgfVxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRyYWNrLmJhY2suc3RlcCA9IHRoaXMuc3RlcDtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFN0ZXAge1xyXG4gIGNvbnN0cnVjdG9yKHN0ZXApIHtcclxuICAgIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgfVxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRyYWNrLmJhY2suc3RlcCA9IHRoaXMuc3RlcDtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg4jjgr/jgqTjg6DmjIflrppcclxuXHJcbmNsYXNzIEdhdGVUaW1lIHtcclxuICBjb25zdHJ1Y3RvcihnYXRlKSB7XHJcbiAgICB0aGlzLmdhdGUgPSBnYXRlIC8gMTAwO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdHJhY2suYmFjay5nYXRlID0gdGhpcy5nYXRlO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODmeODreOCt+ODhuOCo+aMh+WumlxyXG5cclxuY2xhc3MgVmVsb2NpdHkge1xyXG4gIGNvbnN0cnVjdG9yKHZlbCkge1xyXG4gICAgdGhpcy52ZWwgPSB2ZWwgLyAxMDA7XHJcbiAgfVxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRyYWNrLmJhY2sudmVsID0gdGhpcy52ZWw7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g6Z+z6Imy6Kit5a6aXHJcbmNsYXNzIFRvbmUge1xyXG4gIGNvbnN0cnVjdG9yKG5vKSB7XHJcbiAgICB0aGlzLm5vID0gbm87XHJcbiAgICAvL3RoaXMuc2FtcGxlID0gd2F2ZVNhbXBsZXNbdGhpcy5ub107XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICAvLyAgICB0cmFjay5iYWNrLnNhbXBsZSA9IHRyYWNrLmF1ZGlvLnBlcmlvZGljV2F2ZXNbdGhpcy5ub107XHJcbiAgICB0cmFjay5iYWNrLnNhbXBsZSA9IHdhdmVTYW1wbGVzW3RoaXMubm9dO1xyXG4gICAgLy8gICAgdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLnNldFNhbXBsZSh3YXZlU2FtcGxlc1t0aGlzLm5vXSk7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBSZXN0IHtcclxuICBjb25zdHJ1Y3RvcihsZW5ndGgpIHtcclxuICAgIHRoaXMuc3RlcCA9IGNhbGNTdGVwKGxlbmd0aCk7XHJcbiAgfVxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IHRyYWNrLmJhY2suc3RlcDtcclxuICAgIHRyYWNrLnBsYXlpbmdUaW1lID0gdHJhY2sucGxheWluZ1RpbWUgKyAodGhpcy5zdGVwICogNjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pO1xyXG4gICAgLy90cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBPY3RhdmUge1xyXG4gIGNvbnN0cnVjdG9yKG9jdCkge1xyXG4gICAgdGhpcy5vY3QgPSBvY3Q7XHJcbiAgfVxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRyYWNrLmJhY2sub2N0ID0gdGhpcy5vY3Q7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuY2xhc3MgT2N0YXZlVXAge1xyXG4gIGNvbnN0cnVjdG9yKHYpIHsgdGhpcy52ID0gdjsgfVxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRyYWNrLmJhY2sub2N0ICs9IHRoaXMudjtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIE9jdGF2ZURvd24ge1xyXG4gIGNvbnN0cnVjdG9yKHYpIHsgdGhpcy52ID0gdjsgfVxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRyYWNrLmJhY2sub2N0IC09IHRoaXMudjtcclxuICB9XHJcbn1cclxuY2xhc3MgVGVtcG8ge1xyXG4gIGNvbnN0cnVjdG9yKHRlbXBvKSB7XHJcbiAgICB0aGlzLnRlbXBvID0gdGVtcG87XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB0cmFjay5sb2NhbFRlbXBvID0gdGhpcy50ZW1wbztcclxuICAgIC8vdHJhY2suc2VxdWVuY2VyLnRlbXBvID0gdGhpcy50ZW1wbztcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEVudmVsb3BlIHtcclxuICBjb25zdHJ1Y3RvcihhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlKSB7XHJcbiAgICB0aGlzLmF0dGFjayA9IGF0dGFjaztcclxuICAgIHRoaXMuZGVjYXkgPSBkZWNheTtcclxuICAgIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW47XHJcbiAgICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgLy92YXIgZW52ZWxvcGUgPSB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0uZW52ZWxvcGU7XHJcbiAgICB0cmFjay5iYWNrLmF0dGFjayA9IHRoaXMuYXR0YWNrO1xyXG4gICAgdHJhY2suYmFjay5kZWNheSA9IHRoaXMuZGVjYXk7XHJcbiAgICB0cmFjay5iYWNrLnN1c3RhaW4gPSB0aGlzLnN1c3RhaW47XHJcbiAgICB0cmFjay5iYWNrLnJlbGVhc2UgPSB0aGlzLnJlbGVhc2U7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44OH44OB44Ol44O844OzXHJcbmNsYXNzIERldHVuZSB7XHJcbiAgY29uc3RydWN0b3IoZGV0dW5lKSB7XHJcbiAgICB0aGlzLmRldHVuZSA9IGRldHVuZTtcclxuICB9XHJcblxyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIC8vdmFyIHZvaWNlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdO1xyXG4gICAgdHJhY2suYmFjay5kZXR1bmUgPSB0aGlzLmRldHVuZTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFZvbHVtZSB7XHJcbiAgY29uc3RydWN0b3Iodm9sdW1lKSB7XHJcbiAgICB0aGlzLnZvbHVtZSA9IHZvbHVtZSAvIDEwMC4wO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgLy8gXHJcbiAgICB0cmFjay5iYWNrLnZvbHVtZSA9IHRoaXMudm9sdW1lO1xyXG4gICAgLy8gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLnZvbHVtZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMudm9sdW1lLCB0cmFjay5wbGF5aW5nVGltZSk7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBMb29wRGF0YSB7XHJcbiAgY29uc3RydWN0b3Iob2JqLCB2YXJuYW1lLCBjb3VudCwgc2VxUG9zKSB7XHJcbiAgICB0aGlzLnZhcm5hbWUgPSB2YXJuYW1lO1xyXG4gICAgdGhpcy5jb3VudCA9IGNvdW50IHx8IERlZmF1bHRQYXJhbXMubG9vcENvdW50O1xyXG4gICAgdGhpcy5vYmogPSBvYmo7XHJcbiAgICB0aGlzLnNlcVBvcyA9IHNlcVBvcztcclxuICAgIHRoaXMub3V0U2VxUG9zID0gLTE7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzKHRyYWNrKSB7XHJcbiAgICB2YXIgc3RhY2sgPSB0cmFjay5zdGFjaztcclxuICAgIGlmIChzdGFjay5sZW5ndGggPT0gMCB8fCBzdGFja1tzdGFjay5sZW5ndGggLSAxXS5vYmogIT09IHRoaXMpIHtcclxuICAgICAgdmFyIGxkID0gdGhpcztcclxuICAgICAgc3RhY2sucHVzaChuZXcgTG9vcERhdGEodGhpcywgbGQudmFybmFtZSwgbGQuY291bnQsIHRyYWNrLnNlcVBvcykpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgTG9vcEVuZCB7XHJcbiAgY29uc3RydWN0b3Ioc2VxUG9zKSB7XHJcbiAgICB0aGlzLnNlcVBvcyA9IHNlcVBvcztcclxuICB9XHJcbiAgcHJvY2Vzcyh0cmFjaykge1xyXG4gICAgdmFyIGxkID0gdHJhY2suc3RhY2tbdHJhY2suc3RhY2subGVuZ3RoIC0gMV07XHJcbiAgICBpZiAobGQub3V0U2VxUG9zID09IC0xKSBsZC5vdXRTZXFQb3MgPSB0aGlzLnNlcVBvcztcclxuICAgIGxkLmNvdW50LS07XHJcbiAgICBpZiAobGQuY291bnQgPiAwKSB7XHJcbiAgICAgIHRyYWNrLnNlcVBvcyA9IGxkLnNlcVBvcztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRyYWNrLnN0YWNrLnBvcCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgTG9vcEV4aXQge1xyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHZhciBsZCA9IHRyYWNrLnN0YWNrW3RyYWNrLnN0YWNrLmxlbmd0aCAtIDFdO1xyXG4gICAgaWYgKGxkLmNvdW50IDw9IDEgJiYgbGQub3V0U2VxUG9zICE9IC0xKSB7XHJcbiAgICAgIHRyYWNrLnNlcVBvcyA9IGxkLm91dFNlcVBvcztcclxuICAgICAgdHJhY2suc3RhY2sucG9wKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBJbmZpbml0ZUxvb3Age1xyXG4gIHByb2Nlc3ModHJhY2spIHtcclxuICAgIHRyYWNrLmluZmluaXRMb29wSW5kZXggPSB0cmFjay5zZXFQb3M7XHJcbiAgfVxyXG59XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8g44K344O844Kx44Oz44K144O844OI44Op44OD44KvXHJcbmNsYXNzIFRyYWNrIHtcclxuICBjb25zdHJ1Y3RvcihzZXF1ZW5jZXIsIHNlcWRhdGEsIGF1ZGlvKSB7XHJcbiAgICB0aGlzLm5hbWUgPSAnJztcclxuICAgIHRoaXMuZW5kID0gZmFsc2U7XHJcbiAgICB0aGlzLm9uZXNob3QgPSBmYWxzZTtcclxuICAgIHRoaXMuc2VxdWVuY2VyID0gc2VxdWVuY2VyO1xyXG4gICAgdGhpcy5zZXFEYXRhID0gc2VxZGF0YTtcclxuICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgIHRoaXMubXV0ZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5wbGF5aW5nVGltZSA9IC0xO1xyXG4gICAgdGhpcy5sb2NhbFRlbXBvID0gc2VxdWVuY2VyLnRlbXBvO1xyXG4gICAgdGhpcy50cmFja1ZvbHVtZSA9IDEuMDtcclxuICAgIHRoaXMudHJhbnNwb3NlID0gMDtcclxuICAgIHRoaXMuc29sbyA9IGZhbHNlO1xyXG4gICAgdGhpcy5jaGFubmVsID0gLTE7XHJcbiAgICB0aGlzLnRyYWNrID0gLTE7XHJcbiAgICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgICB0aGlzLmluZmluaXRMb29wSW5kZXggPSAtMTtcclxuICAgIHRoaXMuYmFjayA9IHtcclxuICAgICAgbm90ZTogNzIsXHJcbiAgICAgIG9jdDogNSxcclxuICAgICAgc3RlcDogOTYsXHJcbiAgICAgIGdhdGU6IDAuNSxcclxuICAgICAgdmVsOiAxLjAsXHJcbiAgICAgIGF0dGFjazogMC4wMSxcclxuICAgICAgZGVjYXk6IDAuMDUsXHJcbiAgICAgIHN1c3RhaW46IDAuNixcclxuICAgICAgcmVsZWFzZTogMC4wNyxcclxuICAgICAgZGV0dW5lOiAxLjAsXHJcbiAgICAgIHZvbHVtZTogMC41LFxyXG4gICAgICAvLyAgICAgIHNhbXBsZTphdWRpby5wZXJpb2RpY1dhdmVzWzBdXHJcbiAgICAgIHNhbXBsZTogd2F2ZVNhbXBsZXNbMF1cclxuICAgIH1cclxuICAgIHRoaXMuc3RhY2sgPSBbXTtcclxuICB9XHJcblxyXG4gIHByb2Nlc3MoY3VycmVudFRpbWUpIHtcclxuXHJcbiAgICBpZiAodGhpcy5lbmQpIHJldHVybjtcclxuXHJcbiAgICBpZiAodGhpcy5vbmVzaG90KSB7XHJcbiAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VxU2l6ZSA9IHRoaXMuc2VxRGF0YS5sZW5ndGg7XHJcbiAgICBpZiAodGhpcy5zZXFQb3MgPj0gc2VxU2l6ZSkge1xyXG4gICAgICBpZiAodGhpcy5zZXF1ZW5jZXIucmVwZWF0KSB7XHJcbiAgICAgICAgdGhpcy5zZXFQb3MgPSAwO1xyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5maW5pdExvb3BJbmRleCA+PSAwKSB7XHJcbiAgICAgICAgdGhpcy5zZXFQb3MgPSB0aGlzLmluZmluaXRMb29wSW5kZXg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbmQgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZXEgPSB0aGlzLnNlcURhdGE7XHJcbiAgICB0aGlzLnBsYXlpbmdUaW1lID0gKHRoaXMucGxheWluZ1RpbWUgPiAtMSkgPyB0aGlzLnBsYXlpbmdUaW1lIDogY3VycmVudFRpbWU7XHJcbiAgICB2YXIgZW5kVGltZSA9IGN1cnJlbnRUaW1lICsgMC4yLypzZWMqLztcclxuXHJcbiAgICB3aGlsZSAodGhpcy5zZXFQb3MgPCBzZXFTaXplKSB7XHJcbiAgICAgIGlmICh0aGlzLnBsYXlpbmdUaW1lID49IGVuZFRpbWUgJiYgIXRoaXMub25lc2hvdCkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBkID0gc2VxW3RoaXMuc2VxUG9zXTtcclxuICAgICAgICBkLnByb2Nlc3ModGhpcyk7XHJcbiAgICAgICAgdGhpcy5zZXFQb3MrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICAvLyB2YXIgY3VyVm9pY2UgPSB0aGlzLmF1ZGlvLnZvaWNlc1t0aGlzLmNoYW5uZWxdO1xyXG4gICAgLy8gY3VyVm9pY2UuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIC8vIGN1clZvaWNlLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgLy8gY3VyVm9pY2UuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAtMTtcclxuICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgIHRoaXMuaW5maW5pdExvb3BJbmRleCA9IC0xO1xyXG4gICAgdGhpcy5lbmQgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RhY2subGVuZ3RoID0gMDtcclxuICB9XHJcblxyXG4gIGFzc2lnblZvaWNlKHQpIHtcclxuICAgIGxldCByZXQgPSBudWxsO1xyXG4gICAgdGhpcy5hdWRpby52b2ljZXMuc29tZSgoZCwgaSkgPT4ge1xyXG4gICAgICBpZiAoZC5pc0tleU9mZih0KSkge1xyXG4gICAgICAgIHJldCA9IGQ7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICBpZiAoIXJldCkge1xyXG4gICAgICBsZXQgb2xkZXN0S2V5T25EYXRhID0gKHRoaXMuYXVkaW8udm9pY2VzLm1hcCgoZCwgaSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHRpbWU6IGQuZW52ZWxvcGUua2V5T25UaW1lLCBkLCBpIH07XHJcbiAgICAgIH0pLnNvcnQoKGEsIGIpID0+IGEudGltZSAtIGIudGltZSkpWzBdO1xyXG4gICAgICByZXQgPSBvbGRlc3RLZXlPbkRhdGEuZDtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gbG9hZFRyYWNrcyhzZWxmLCB0cmFja3MsIHRyYWNrZGF0YSkge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJhY2tkYXRhLmxlbmd0aDsgKytpKSB7XHJcbiAgICB2YXIgdHJhY2sgPSBuZXcgVHJhY2soc2VsZiwgdHJhY2tkYXRhW2ldLmRhdGEsIHNlbGYuYXVkaW8pO1xyXG4gICAgdHJhY2suY2hhbm5lbCA9IHRyYWNrZGF0YVtpXS5jaGFubmVsO1xyXG4gICAgdHJhY2sub25lc2hvdCA9ICghdHJhY2tkYXRhW2ldLm9uZXNob3QpID8gZmFsc2UgOiB0cnVlO1xyXG4gICAgdHJhY2sudHJhY2sgPSBpO1xyXG4gICAgdHJhY2tzLnB1c2godHJhY2spO1xyXG4gIH1cclxuICByZXR1cm4gdHJhY2tzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVUcmFja3ModHJhY2tkYXRhKSB7XHJcbiAgdmFyIHRyYWNrcyA9IFtdO1xyXG4gIGxvYWRUcmFja3ModGhpcywgdHJhY2tzLCB0cmFja2RhdGEudHJhY2tzKTtcclxuICByZXR1cm4gdHJhY2tzO1xyXG59XHJcblxyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vLyDjgrfjg7zjgrHjg7PjgrXjg7zmnKzkvZMgXHJcbmV4cG9ydCBjbGFzcyBTZXF1ZW5jZXIge1xyXG4gIGNvbnN0cnVjdG9yKGF1ZGlvKSB7XHJcbiAgICB0aGlzLlNUT1AgPSAwIHwgMDtcclxuICAgIHRoaXMuUExBWSA9IDEgfCAwO1xyXG4gICAgdGhpcy5QQVVTRSA9IDIgfCAwO1xyXG5cclxuICAgIHRoaXMuYXVkaW8gPSBhdWRpbztcclxuICAgIHRoaXMudGVtcG8gPSAxMDAuMDtcclxuICAgIHRoaXMucmVwZWF0ID0gZmFsc2U7XHJcbiAgICB0aGlzLnBsYXkgPSBmYWxzZTtcclxuICAgIHRoaXMudHJhY2tzID0gW107XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IDA7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICB9XHJcbiAgbG9hZChkYXRhKSB7XHJcbiAgICBwYXJzZU1NTChkYXRhKTtcclxuICAgIGlmICh0aGlzLnBsYXkpIHtcclxuICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnRyYWNrcy5sZW5ndGggPSAwO1xyXG4gICAgbG9hZFRyYWNrcyh0aGlzLCB0aGlzLnRyYWNrcywgZGF0YS50cmFja3MpO1xyXG4gIH1cclxuICBzdGFydCgpIHtcclxuICAgIC8vICAgIHRoaXMuaGFuZGxlID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzZWxmLnByb2Nlc3MoKSB9LCA1MCk7XHJcbiAgICB0aGlzLmF1ZGlvLnJlYWREcnVtU2FtcGxlXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUExBWTtcclxuICAgICAgICB0aGlzLnByb2Nlc3MoKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG4gIHByb2Nlc3MoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5QTEFZKSB7XHJcbiAgICAgIHRoaXMucGxheVRyYWNrcyh0aGlzLnRyYWNrcyk7XHJcbiAgICAgIHRoaXMuaGFuZGxlID0gd2luZG93LnNldFRpbWVvdXQodGhpcy5wcm9jZXNzLmJpbmQodGhpcyksIDEwMCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHBsYXlUcmFja3ModHJhY2tzKSB7XHJcbiAgICB2YXIgY3VycmVudFRpbWUgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgLy8gICBjb25zb2xlLmxvZyh0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdHJhY2tzW2ldLnByb2Nlc3MoY3VycmVudFRpbWUpO1xyXG4gICAgfVxyXG4gIH1cclxuICBwYXVzZSgpIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICB9XHJcbiAgcmVzdW1lKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuUEFVU0UpIHtcclxuICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBMQVk7XHJcbiAgICAgIHZhciB0cmFja3MgPSB0aGlzLnRyYWNrcztcclxuICAgICAgdmFyIGFkanVzdCA9IHRoaXMuYXVkaW8uYXVkaW9jdHguY3VycmVudFRpbWUgLSB0aGlzLnBhdXNlVGltZTtcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRyYWNrcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICAgIHRyYWNrc1tpXS5wbGF5aW5nVGltZSArPSBhZGp1c3Q7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5wcm9jZXNzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHN0b3AoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVE9QKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmhhbmRsZSk7XHJcbiAgICAgIC8vICAgIGNsZWFySW50ZXJ2YWwodGhpcy5oYW5kbGUpO1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXNldCgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLnRyYWNrcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB0aGlzLnRyYWNrc1tpXS5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VNTUwoZGF0YSkge1xyXG4gIGRhdGEudHJhY2tzLmZvckVhY2goKGQpID0+IHtcclxuICAgIGQuZGF0YSA9IHBhcnNlTU1MXyhkLm1tbCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlTU1MXyhtbWwpIHtcclxuICBsZXQgcGFyc2VyID0gbmV3IE1NTFBhcnNlcihtbWwpO1xyXG4gIGxldCBjb21tYW5kcyA9IHBhcnNlci5wYXJzZSgpO1xyXG4gIGxldCBzZXFBcnJheSA9IFtdO1xyXG4gIGNvbW1hbmRzLmZvckVhY2goKGNvbW1hbmQpID0+IHtcclxuICAgIHN3aXRjaCAoY29tbWFuZC50eXBlKSB7XHJcbiAgICAgIGNhc2UgU3ludGF4Lk5vdGU6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgTm90ZShjb21tYW5kLm5vdGVOdW1iZXJzLCBjb21tYW5kLm5vdGVMZW5ndGgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguUmVzdDpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBSZXN0KGNvbW1hbmQubm90ZUxlbmd0aCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5PY3RhdmU6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgT2N0YXZlKGNvbW1hbmQudmFsdWUpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguT2N0YXZlU2hpZnQ6XHJcbiAgICAgICAgaWYgKGNvbW1hbmQuZGlyZWN0aW9uID49IDApIHtcclxuICAgICAgICAgIHNlcUFycmF5LnB1c2gobmV3IE9jdGF2ZVVwKDEpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgT2N0YXZlRG93bigxKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5Ob3RlTGVuZ3RoOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IExlbmd0aChjb21tYW5kLm5vdGVMZW5ndGgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguTm90ZVZlbG9jaXR5OlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IFZlbG9jaXR5KGNvbW1hbmQudmFsdWUpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguVGVtcG86XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgVGVtcG8oY29tbWFuZC52YWx1ZSkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5Ob3RlUXVhbnRpemU6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgR2F0ZVRpbWUoY29tbWFuZC52YWx1ZSkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5JbmZpbml0ZUxvb3A6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgSW5maW5pdGVMb29wKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN5bnRheC5Mb29wQmVnaW46XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgTG9vcERhdGEobnVsbCwgJycsIGNvbW1hbmQudmFsdWUsIG51bGwpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguTG9vcEV4aXQ6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgTG9vcEV4aXQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4Lkxvb3BFbmQ6XHJcbiAgICAgICAgc2VxQXJyYXkucHVzaChuZXcgTG9vcEVuZCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTeW50YXguVG9uZTpcclxuICAgICAgICBzZXFBcnJheS5wdXNoKG5ldyBUb25lKGNvbW1hbmQudmFsdWUpKTtcclxuICAgICAgY2FzZSBTeW50YXguV2F2ZUZvcm06XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgU3ludGF4LkVudmVsb3BlOlxyXG4gICAgICAgIHNlcUFycmF5LnB1c2gobmV3IEVudmVsb3BlKGNvbW1hbmQuYSwgY29tbWFuZC5kLCBjb21tYW5kLnMsIGNvbW1hbmQucikpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIHJldHVybiBzZXFBcnJheTtcclxufVxyXG5cclxuLy8gZXhwb3J0IHZhciBzZXFEYXRhID0ge1xyXG4vLyAgIG5hbWU6ICdUZXN0JyxcclxuLy8gICB0cmFja3M6IFtcclxuLy8gICAgIHtcclxuLy8gICAgICAgbmFtZTogJ3BhcnQxJyxcclxuLy8gICAgICAgY2hhbm5lbDogMCxcclxuLy8gICAgICAgZGF0YTpcclxuLy8gICAgICAgW1xyXG4vLyAgICAgICAgIEVOVigwLjAxLCAwLjAyLCAwLjUsIDAuMDcpLFxyXG4vLyAgICAgICAgIFRFTVBPKDE4MCksIFRPTkUoMCksIFZPTFVNRSgwLjUpLCBMKDgpLCBHVCgtMC41KSxPKDQpLFxyXG4vLyAgICAgICAgIExPT1AoJ2knLDQpLFxyXG4vLyAgICAgICAgIEMsIEMsIEMsIEMsIEMsIEMsIEMsIEMsXHJcbi8vICAgICAgICAgTE9PUF9FTkQsXHJcbi8vICAgICAgICAgSlVNUCg1KVxyXG4vLyAgICAgICBdXHJcbi8vICAgICB9LFxyXG4vLyAgICAge1xyXG4vLyAgICAgICBuYW1lOiAncGFydDInLFxyXG4vLyAgICAgICBjaGFubmVsOiAxLFxyXG4vLyAgICAgICBkYXRhOlxyXG4vLyAgICAgICAgIFtcclxuLy8gICAgICAgICBFTlYoMC4wMSwgMC4wNSwgMC42LCAwLjA3KSxcclxuLy8gICAgICAgICBURU1QTygxODApLFRPTkUoNiksIFZPTFVNRSgwLjIpLCBMKDgpLCBHVCgtMC44KSxcclxuLy8gICAgICAgICBSKDEpLCBSKDEpLFxyXG4vLyAgICAgICAgIE8oNiksTCgxKSwgRixcclxuLy8gICAgICAgICBFLFxyXG4vLyAgICAgICAgIE9ELCBMKDgsIHRydWUpLCBCYiwgRywgTCg0KSwgQmIsIE9VLCBMKDQpLCBGLCBMKDgpLCBELFxyXG4vLyAgICAgICAgIEwoNCwgdHJ1ZSksIEUsIEwoMiksIEMsUig4KSxcclxuLy8gICAgICAgICBKVU1QKDgpXHJcbi8vICAgICAgICAgXVxyXG4vLyAgICAgfSxcclxuLy8gICAgIHtcclxuLy8gICAgICAgbmFtZTogJ3BhcnQzJyxcclxuLy8gICAgICAgY2hhbm5lbDogMixcclxuLy8gICAgICAgZGF0YTpcclxuLy8gICAgICAgICBbXHJcbi8vICAgICAgICAgRU5WKDAuMDEsIDAuMDUsIDAuNiwgMC4wNyksXHJcbi8vICAgICAgICAgVEVNUE8oMTgwKSxUT05FKDYpLCBWT0xVTUUoMC4xKSwgTCg4KSwgR1QoLTAuNSksIFxyXG4vLyAgICAgICAgIFIoMSksIFIoMSksXHJcbi8vICAgICAgICAgTyg2KSxMKDEpLCBDLEMsXHJcbi8vICAgICAgICAgT0QsIEwoOCwgdHJ1ZSksIEcsIEQsIEwoNCksIEcsIE9VLCBMKDQpLCBELCBMKDgpLE9ELCBHLFxyXG4vLyAgICAgICAgIEwoNCwgdHJ1ZSksIE9VLEMsIEwoMiksT0QsIEcsIFIoOCksXHJcbi8vICAgICAgICAgSlVNUCg3KVxyXG4vLyAgICAgICAgIF1cclxuLy8gICAgIH1cclxuLy8gICBdXHJcbi8vIH1cclxuXHJcbmV4cG9ydCBjbGFzcyBTb3VuZEVmZmVjdHMge1xyXG4gIGNvbnN0cnVjdG9yKHNlcXVlbmNlcixkYXRhKXtcclxuICAgIHRoaXMuc291bmRFZmZlY3RzID0gW107XHJcbiAgICBkYXRhLmZvckVhY2goKGQpPT57XHJcbiAgICAgIHZhciB0cmFja3MgPSBbXTtcclxuICAgICAgcGFyc2VNTUwoZCk7XHJcbiAgICAgIHRoaXMuc291bmRFZmZlY3RzLnB1c2gobG9hZFRyYWNrcyhzZXF1ZW5jZXIsIHRyYWNrcywgZC50cmFja3MpKTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIFNvdW5kRWZmZWN0cyhzZXF1ZW5jZXIpIHtcclxuLy8gICAgdGhpcy5zb3VuZEVmZmVjdHMgPVxyXG4vLyAgICAgW1xyXG4vLyAgICAgLy8gRWZmZWN0IDAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsW1xyXG4vLyAgICAge1xyXG4vLyAgICAgICBjaGFubmVsOiA4LFxyXG4vLyAgICAgICBvbmVzaG90OnRydWUsXHJcbi8vICAgICAgIGRhdGE6IFtWT0xVTUUoMC41KSxcclxuLy8gICAgICAgICBFTlYoMC4wMDAxLCAwLjAxLCAxLjAsIDAuMDAwMSksR1QoLTAuOTk5KSxUT05FKDApLCBURU1QTygyMDApLCBPKDgpLFNUKDMpLCBDLCBELCBFLCBGLCBHLCBBLCBCLCBPVSwgQywgRCwgRSwgRywgQSwgQixCLEIsQlxyXG4vLyAgICAgICBdXHJcbi8vICAgICB9LFxyXG4vLyAgICAge1xyXG4vLyAgICAgICBjaGFubmVsOiA5LFxyXG4vLyAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4vLyAgICAgICBkYXRhOiBbVk9MVU1FKDAuNSksXHJcbi8vICAgICAgICAgRU5WKDAuMDAwMSwgMC4wMSwgMS4wLCAwLjAwMDEpLCBERVRVTkUoMC45KSwgR1QoLTAuOTk5KSwgVE9ORSgwKSwgVEVNUE8oMjAwKSwgTyg1KSwgU1QoMyksIEMsIEQsIEUsIEYsIEcsIEEsIEIsIE9VLCBDLCBELCBFLCBHLCBBLCBCLEIsQixCXHJcbi8vICAgICAgIF1cclxuLy8gICAgIH1cclxuLy8gICAgIF0pLFxyXG4vLyAgICAgLy8gRWZmZWN0IDEgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLyAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4vLyAgICAgICBbXHJcbi8vICAgICAgICAge1xyXG4vLyAgICAgICAgICAgY2hhbm5lbDogMTAsXHJcbi8vICAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4vLyAgICAgICAgICAgZGF0YTogW1xyXG4vLyAgICAgICAgICAgIFRPTkUoNCksIFRFTVBPKDE1MCksIFNUKDQpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbi8vICAgICAgICAgICAgTyg2KSwgRywgQSwgQiwgTyg3KSwgQiwgQSwgRywgRiwgRSwgRCwgQywgRSwgRywgQSwgQiwgT0QsIEIsIEEsIEcsIEYsIEUsIEQsIEMsIE9ELCBCLCBBLCBHLCBGLCBFLCBELCBDXHJcbi8vICAgICAgICAgICBdXHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgICBdKSxcclxuLy8gICAgIC8vIEVmZmVjdCAyLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8gICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuLy8gICAgICAgW1xyXG4vLyAgICAgICAgIHtcclxuLy8gICAgICAgICAgIGNoYW5uZWw6IDEwLFxyXG4vLyAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuLy8gICAgICAgICAgIGRhdGE6IFtcclxuLy8gICAgICAgICAgICBUT05FKDApLCBURU1QTygxNTApLCBTVCgyKSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjAwMDEpLFxyXG4vLyAgICAgICAgICAgIE8oOCksIEMsRCxFLEYsRyxBLEIsT1UsQyxELEUsRixPRCxHLE9VLEEsT0QsQixPVSxBLE9ELEcsT1UsRixPRCxFLE9VLEVcclxuLy8gICAgICAgICAgIF1cclxuLy8gICAgICAgICB9XHJcbi8vICAgICAgIF0pLFxyXG4vLyAgICAgICAvLyBFZmZlY3QgMyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8gICAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4vLyAgICAgICAgIFtcclxuLy8gICAgICAgICAgIHtcclxuLy8gICAgICAgICAgICAgY2hhbm5lbDogMTAsXHJcbi8vICAgICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbi8vICAgICAgICAgICAgIGRhdGE6IFtcclxuLy8gICAgICAgICAgICAgIFRPTkUoNSksIFRFTVBPKDE1MCksIEwoNjQpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbi8vICAgICAgICAgICAgICBPKDYpLEMsT0QsQyxPVSxDLE9ELEMsT1UsQyxPRCxDLE9VLEMsT0RcclxuLy8gICAgICAgICAgICAgXVxyXG4vLyAgICAgICAgICAgfVxyXG4vLyAgICAgICAgIF0pLFxyXG4vLyAgICAgICAvLyBFZmZlY3QgNCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vICAgICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuLy8gICAgICAgICBbXHJcbi8vICAgICAgICAgICB7XHJcbi8vICAgICAgICAgICAgIGNoYW5uZWw6IDExLFxyXG4vLyAgICAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4vLyAgICAgICAgICAgICBkYXRhOiBbXHJcbi8vICAgICAgICAgICAgICBUT05FKDgpLCBWT0xVTUUoMi4wKSxURU1QTygxMjApLCBMKDIpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMjUpLFxyXG4vLyAgICAgICAgICAgICAgTygxKSwgQ1xyXG4vLyAgICAgICAgICAgICBdXHJcbi8vICAgICAgICAgICB9XHJcbi8vICAgICAgICAgXSlcclxuLy8gICAgXTtcclxuLy8gIH1cclxuXHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCBzZmcgZnJvbSAnLi9nbG9iYWwuanMnOyBcclxuXHJcbi8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zjgajjgZfjgaZjYW52YXPjgpLkvb/jgYbloLTlkIjjga7jg5jjg6vjg5Hjg7xcclxuZXhwb3J0IGZ1bmN0aW9uIENhbnZhc1RleHR1cmUod2lkdGgsIGhlaWdodCkge1xyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aCB8fCBzZmcuVklSVFVBTF9XSURUSDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgc2ZnLlZJUlRVQUxfSEVJR0hUO1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMDAxO1xyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxufVxyXG5cclxuLy8vIOODl+ODreOCsOODrOOCueODkOODvOihqOekuuOCr+ODqeOCuVxyXG5leHBvcnQgZnVuY3Rpb24gUHJvZ3Jlc3MoKSB7XHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTs7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gc2ZnLlZJUlRVQUxfV0lEVEgpe1xyXG4gICAgd2lkdGggKj0gMjtcclxuICB9XHJcbiAgdmFyIGhlaWdodCA9IDE7XHJcbiAgd2hpbGUgKGhlaWdodCA8PSBzZmcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbi8vICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbi8vICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoc2ZnLkFDVFVBTF9XSURUSCAqIHdpZHRoIC8gc2ZnLlZJUlRVQUxfV0lEVEggLCBzZmcuQUNUVUFMX0hFSUdIVCAqICBoZWlnaHQgLyBzZmcuVklSVFVBTF9IRUlHSFQgKTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICAvLyB0aGlzLm1lc2gucG9zaXRpb24ueCA9ICh3aWR0aCAtIHNmZy5WSVJUVUFMX1dJRFRIKSAvIDI7XHJcbiAgLy8gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSAgLSAoaGVpZ2h0IC0gc2ZnLlZJUlRVQUxfSEVJR0hUKSAvIDI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAoc2ZnLkFDVFVBTF9XSURUSCAqIHdpZHRoIC8gc2ZnLlZJUlRVQUxfV0lEVEggLSBzZmcuQUNUVUFMX1dJRFRIKSAvIDI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSAtIChzZmcuQUNUVUFMX0hFSUdIVCAqIGhlaWdodCAvIHNmZy5WSVJUVUFMX0hFSUdIVCAtIHNmZy5BQ1RVQUxfSEVJR0hUKSAvIDI7XHJcblxyXG5cclxuICAvL3RoaXMudGV4dHVyZS5wcmVtdWx0aXBseUFscGhhID0gdHJ1ZTtcclxufVxyXG5cclxuLy8vIOODl+ODreOCsOODrOOCueODkOODvOOCkuihqOekuuOBmeOCi+OAglxyXG5Qcm9ncmVzcy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKG1lc3NhZ2UsIHBlcmNlbnQpIHtcclxuICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgdmFyIHdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgsIGhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodDtcclxuICAvLyAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLDAsMCwwKSc7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB2YXIgdGV4dFdpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KG1lc3NhZ2UpLndpZHRoO1xyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwxLjApJztcclxuXHJcbiAgY3R4LmZpbGxUZXh0KG1lc3NhZ2UsICh3aWR0aCAtIHRleHRXaWR0aCkgLyAyLCAxMDApO1xyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgucmVjdCgyMCwgNzUsIHdpZHRoIC0gMjAgKiAyLCAxMCk7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG4gIGN0eC5maWxsUmVjdCgyMCwgNzUsICh3aWR0aCAtIDIwICogMikgKiBwZXJjZW50IC8gMTAwLCAxMCk7XHJcbiAgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxufVxyXG5cclxuLy8vIGltZ+OBi+OCieOCuOOCquODoeODiOODquOCkuS9nOaIkOOBmeOCi1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR2VvbWV0cnlGcm9tSW1hZ2UoaW1hZ2UpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHcgPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG4gIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3LCBoKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuICB7XHJcbiAgICB2YXIgaSA9IDA7XHJcblxyXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoOyArK3kpIHtcclxuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3OyArK3gpIHtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcclxuXHJcbiAgICAgICAgdmFyIHIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgc2ZnID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYSA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIGlmIChhICE9IDApIHtcclxuICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIHNmZyAvIDI1NS4wLCBiIC8gMjU1LjApO1xyXG4gICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSkgKiAyLjAsICgoeSAtIGggLyAyKSkgKiAtMi4wLCAwLjApO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCh2ZXJ0KTtcclxuICAgICAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVHZW9tZXRyeShzaXplKVxyXG57XHJcbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcbiAgdmFyIHNpemVIYWxmID0gc2l6ZSAvIDI7XHJcbiAgLy8gZ2VvbWV0cnkuXHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygtc2l6ZUhhbGYsIHNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyhzaXplSGFsZiwgc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHNpemVIYWxmLCAtc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKC1zaXplSGFsZiwgLXNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkuZmFjZXMucHVzaChuZXcgVEhSRUUuRmFjZTMoMCwgMiwgMSkpO1xyXG4gIGdlb21ldHJ5LmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsIDMsIDIpKTtcclxuICByZXR1cm4gZ2VvbWV0cnk7XHJcbn1cclxuXHJcbi8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zkuIrjga7mjIflrprjgrnjg5fjg6njgqTjg4jjga5VVuW6p+aomeOCkuaxguOCgeOCi1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleHR1cmUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbE5vKVxyXG57XHJcbiAgdmFyIHdpZHRoID0gdGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gdGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIHZhciB1Q2VsbENvdW50ID0gKHdpZHRoIC8gY2VsbFdpZHRoKSB8IDA7XHJcbiAgdmFyIHZDZWxsQ291bnQgPSAoaGVpZ2h0IC8gY2VsbEhlaWdodCkgfCAwO1xyXG4gIHZhciB2UG9zID0gdkNlbGxDb3VudCAtICgoY2VsbE5vIC8gdUNlbGxDb3VudCkgfCAwKTtcclxuICB2YXIgdVBvcyA9IGNlbGxObyAlIHVDZWxsQ291bnQ7XHJcbiAgdmFyIHVVbml0ID0gY2VsbFdpZHRoIC8gd2lkdGg7IFxyXG4gIHZhciB2VW5pdCA9IGNlbGxIZWlnaHQgLyBoZWlnaHQ7XHJcblxyXG4gIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF0ucHVzaChbXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcykgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodClcclxuICBdKTtcclxuICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdLnB1c2goW1xyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MgLSAxKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpXHJcbiAgXSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4dHVyZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCBjZWxsTm8pXHJcbntcclxuICB2YXIgd2lkdGggPSB0ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSB0ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuXHJcbiAgdmFyIHVDZWxsQ291bnQgPSAod2lkdGggLyBjZWxsV2lkdGgpIHwgMDtcclxuICB2YXIgdkNlbGxDb3VudCA9IChoZWlnaHQgLyBjZWxsSGVpZ2h0KSB8IDA7XHJcbiAgdmFyIHZQb3MgPSB2Q2VsbENvdW50IC0gKChjZWxsTm8gLyB1Q2VsbENvdW50KSB8IDApO1xyXG4gIHZhciB1UG9zID0gY2VsbE5vICUgdUNlbGxDb3VudDtcclxuICB2YXIgdVVuaXQgPSBjZWxsV2lkdGggLyB3aWR0aDtcclxuICB2YXIgdlVuaXQgPSBjZWxsSGVpZ2h0IC8gaGVpZ2h0O1xyXG4gIHZhciB1dnMgPSBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzBdO1xyXG5cclxuICB1dnNbMF0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1swXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcbiAgdXZzWzFdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzFdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcbiAgdXZzWzJdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzJdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuXHJcbiAgdXZzID0gZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVsxXTtcclxuXHJcbiAgdXZzWzBdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMF0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG4gIHV2c1sxXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzFdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcbiAgdXZzWzJdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzJdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcblxyXG4gXHJcbiAgZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWU7XHJcblxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlTWF0ZXJpYWwodGV4dHVyZSlcclxue1xyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRleHR1cmUgLyosZGVwdGhUZXN0OnRydWUqLywgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gIG1hdGVyaWFsLnNpZGUgPSBUSFJFRS5Gcm9udFNpZGU7XHJcbiAgbWF0ZXJpYWwuYWxwaGFUZXN0ID0gMC41O1xyXG4gIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuLy8gIG1hdGVyaWFsLlxyXG4gIHJldHVybiBtYXRlcmlhbDtcclxufVxyXG5cclxuXHJcblxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcblxyXG4vLyDjgq3jg7zlhaXliptcclxuZXhwb3J0IGNsYXNzIEJhc2ljSW5wdXR7XHJcbmNvbnN0cnVjdG9yICgpIHtcclxuICB0aGlzLmtleUNoZWNrID0geyB1cDogZmFsc2UsIGRvd246IGZhbHNlLCBsZWZ0OiBmYWxzZSwgcmlnaHQ6IGZhbHNlLCB6OiBmYWxzZSAseDpmYWxzZX07XHJcbiAgdGhpcy5rZXlCdWZmZXIgPSBbXTtcclxuICB0aGlzLmtleXVwXyA9IG51bGw7XHJcbiAgdGhpcy5rZXlkb3duXyA9IG51bGw7XHJcbiAgLy90aGlzLmdhbWVwYWRDaGVjayA9IHsgdXA6IGZhbHNlLCBkb3duOiBmYWxzZSwgbGVmdDogZmFsc2UsIHJpZ2h0OiBmYWxzZSwgejogZmFsc2UgLHg6ZmFsc2V9O1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkY29ubmVjdGVkJywoZSk9PntcclxuICAgIHRoaXMuZ2FtZXBhZCA9IGUuZ2FtZXBhZDtcclxuICB9KTtcclxuIFxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkZGlzY29ubmVjdGVkJywoZSk9PntcclxuICAgIGRlbGV0ZSB0aGlzLmdhbWVwYWQ7XHJcbiAgfSk7IFxyXG4gXHJcbiBpZih3aW5kb3cubmF2aWdhdG9yLmdldEdhbWVwYWRzKXtcclxuICAgdGhpcy5nYW1lcGFkID0gd2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcygpWzBdO1xyXG4gfSBcclxufVxyXG5cclxuICBjbGVhcigpXHJcbiAge1xyXG4gICAgZm9yKHZhciBkIGluIHRoaXMua2V5Q2hlY2spe1xyXG4gICAgICB0aGlzLmtleUNoZWNrW2RdID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIH1cclxuICBcclxuICBrZXlkb3duKGUpIHtcclxuICAgIHZhciBlID0gZDMuZXZlbnQ7XHJcbiAgICB2YXIga2V5QnVmZmVyID0gdGhpcy5rZXlCdWZmZXI7XHJcbiAgICB2YXIga2V5Q2hlY2sgPSB0aGlzLmtleUNoZWNrO1xyXG4gICAgdmFyIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgXHJcbiAgICBpZiAoa2V5QnVmZmVyLmxlbmd0aCA+IDE2KSB7XHJcbiAgICAgIGtleUJ1ZmZlci5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoZS5rZXlDb2RlID09IDgwIC8qIFAgKi8pIHtcclxuICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICBzZmcuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNmZy5nYW1lLnJlc3VtZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAgICAgICBcclxuICAgIGtleUJ1ZmZlci5wdXNoKGUua2V5Q29kZSk7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDczOlxyXG4gICAgICBjYXNlIDM4OlxyXG4gICAgICBjYXNlIDEwNDpcclxuICAgICAgICBrZXlDaGVjay51cCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NjpcclxuICAgICAgY2FzZSAzOTpcclxuICAgICAgY2FzZSAxMDI6XHJcbiAgICAgICAga2V5Q2hlY2sucmlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA5MDpcclxuICAgICAgICBrZXlDaGVjay56ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDg4OlxyXG4gICAgICAgIGtleUNoZWNrLnggPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGtleXVwKCkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gZmFsc2U7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3MzpcclxuICAgICAgY2FzZSAzODpcclxuICAgICAgY2FzZSAxMDQ6XHJcbiAgICAgICAga2V5Q2hlY2sudXAgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc2OlxyXG4gICAgICBjYXNlIDM5OlxyXG4gICAgICBjYXNlIDEwMjpcclxuICAgICAgICBrZXlDaGVjay5yaWdodCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgOTA6XHJcbiAgICAgICAga2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgODg6XHJcbiAgICAgICAga2V5Q2hlY2sueCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8v44Kk44OZ44Oz44OI44Gr44OQ44Kk44Oz44OJ44GZ44KLXHJcbiAgYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsdGhpcy5rZXlkb3duLmJpbmQodGhpcykpO1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleXVwLmJhc2ljSW5wdXQnLHRoaXMua2V5dXAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIC8vIOOCouODs+ODkOOCpOODs+ODieOBmeOCi1xyXG4gIHVuYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCB1cCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLnVwIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEyXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdIDwgLTAuMSkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRvd24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5kb3duIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEzXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdID4gMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgbGVmdCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLmxlZnQgfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTRdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMF0gPCAtMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgcmlnaHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5yaWdodCB8fCAodGhpcy5nYW1lcGFkICYmICh0aGlzLmdhbWVwYWQuYnV0dG9uc1sxNV0ucHJlc3NlZCB8fCB0aGlzLmdhbWVwYWQuYXhlc1swXSA+IDAuMSkpO1xyXG4gIH1cclxuICBcclxuICBnZXQgeigpIHtcclxuICAgICBsZXQgcmV0ID0gdGhpcy5rZXlDaGVjay56IFxyXG4gICAgfHwgKCgoIXRoaXMuekJ1dHRvbiB8fCAodGhpcy56QnV0dG9uICYmICF0aGlzLnpCdXR0b24pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLnpCdXR0b24gPSB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCBzdGFydCgpIHtcclxuICAgIGxldCByZXQgPSAoKCF0aGlzLnN0YXJ0QnV0dG9uXyB8fCAodGhpcy5zdGFydEJ1dHRvbl8gJiYgIXRoaXMuc3RhcnRCdXR0b25fKSApICYmIHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkKSA7XHJcbiAgICB0aGlzLnN0YXJ0QnV0dG9uXyA9IHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IGFCdXR0b24oKXtcclxuICAgICBsZXQgcmV0ID0gKCgoIXRoaXMuYUJ1dHRvbl8gfHwgKHRoaXMuYUJ1dHRvbl8gJiYgIXRoaXMuYUJ1dHRvbl8pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLmFCdXR0b25fID0gdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQ7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuICAqdXBkYXRlKHRhc2tJbmRleClcclxuICB7XHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIGlmKHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMpe1xyXG4gICAgICAgIHRoaXMuZ2FtZXBhZCA9IHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVswXTtcclxuICAgICAgfSBcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7ICAgICBcclxuICAgIH1cclxuICB9XHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdmFyIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvXFwuc2ZwZ21yXFwubmV0L2lnKT8nd3d3LnNmcGdtci5uZXQnOidsb2NhbGhvc3QnO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovLycgKyBob3N0ICsgJzo4MDgxL3Rlc3QnKTtcclxuICAgICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kSGlnaFNjb3JlcycsIChkYXRhKT0+e1xyXG4gICAgICAgIGlmKHRoaXMudXBkYXRlSGlnaFNjb3Jlcyl7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRIaWdoU2NvcmUnLCAoZGF0YSk9PntcclxuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZShkYXRhKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZFJhbmsnLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgIHRoaXMudXBkYXRlSGlnaFNjb3JlcyhkYXRhLmhpZ2hTY29yZXMpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvckNvbm5lY3Rpb25NYXgnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgYWxlcnQoJ+WQjOaZguaOpee2muOBruS4iumZkOOBq+mBlOOBl+OBvuOBl+OBn+OAgicpO1xyXG4gICAgICAgIHNlbGYuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHNlbGYuZW5hYmxlKSB7XHJcbiAgICAgICAgICBzZWxmLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgYWxlcnQoJ+OCteODvOODkOODvOaOpee2muOBjOWIh+aWreOBleOCjOOBvuOBl+OBn+OAgicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAvL2FsZXJ0KCdTb2NrZXQuSU/jgYzliKnnlKjjgafjgY3jgarjgYTjgZ/jgoHjgIHjg4/jgqTjgrnjgrPjgqLmg4XloLHjgYzlj5blvpfjgafjgY3jgb7jgZvjgpPjgIInICsgZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHNlbmRTY29yZShzY29yZSlcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnc2VuZFNjb3JlJywgc2NvcmUpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBkaXNjb25uZWN0KClcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IHNmZyBmcm9tICcuL2dsb2JhbC5qcyc7IFxyXG4vL2ltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbi8vaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcblxyXG4vLy8g44OG44Kt44K544OI5bGe5oCnXHJcbmV4cG9ydCBjbGFzcyBUZXh0QXR0cmlidXRlIHtcclxuICBjb25zdHJ1Y3RvcihibGluaywgZm9udCkge1xyXG4gICAgaWYgKGJsaW5rKSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBibGluaztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChmb250KSB7XHJcbiAgICAgIHRoaXMuZm9udCA9IGZvbnQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmZvbnQgPSBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44OG44Kt44K544OI44OX44Os44O844OzXHJcbmV4cG9ydCBjbGFzcyBUZXh0UGxhbmV7IFxyXG4gIGNvbnN0cnVjdG9yIChzY2VuZSkge1xyXG4gIHRoaXMudGV4dEJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMuYXR0ckJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMudGV4dEJhY2tCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLmF0dHJCYWNrQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdmFyIGVuZGkgPSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW5kaTsgKytpKSB7XHJcbiAgICB0aGlzLnRleHRCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMudGV4dEJhY2tCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQmFja0J1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8g5o+P55S755So44Kt44Oj44Oz44OQ44K544Gu44K744OD44OI44Ki44OD44OXXHJcblxyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gc2ZnLlZJUlRVQUxfV0lEVEgpe1xyXG4gICAgd2lkdGggKj0gMjtcclxuICB9XHJcbiAgdmFyIGhlaWdodCA9IDE7XHJcbiAgd2hpbGUgKGhlaWdodCA8PSBzZmcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIFxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsYWxwaGFUZXN0OjAuNSwgdHJhbnNwYXJlbnQ6IHRydWUsZGVwdGhUZXN0OnRydWUsc2hhZGluZzpUSFJFRS5GbGF0U2hhZGluZ30pO1xyXG4vLyAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcuQUNUVUFMX1dJRFRIICogd2lkdGggLyBzZmcuVklSVFVBTF9XSURUSCAsIHNmZy5BQ1RVQUxfSEVJR0hUICogIGhlaWdodCAvIHNmZy5WSVJUVUFMX0hFSUdIVCApO1xyXG4vLyAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy5BQ1RVQUxfV0lEVEggLCBzZmcuQUNUVUFMX0hFSUdIVCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAoc2ZnLkFDVFVBTF9XSURUSCAqIHdpZHRoIC8gc2ZnLlZJUlRVQUxfV0lEVEggLSBzZmcuQUNUVUFMX1dJRFRIKSAvIDI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSAtIChzZmcuQUNUVUFMX0hFSUdIVCAqIGhlaWdodCAvIHNmZy5WSVJUVUFMX0hFSUdIVCAtIHNmZy5BQ1RVQUxfSEVJR0hUKSAvIDI7XHJcbiAgdGhpcy5mb250cyA9IHsgZm9udDogc2ZnLnRleHR1cmVGaWxlcy5mb250LCBmb250MTogc2ZnLnRleHR1cmVGaWxlcy5mb250MSB9O1xyXG4gIHRoaXMuYmxpbmtDb3VudCA9IDA7XHJcbiAgdGhpcy5ibGluayA9IGZhbHNlO1xyXG5cclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuY2xzKCk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbn1cclxuXHJcbiAgLy8vIOeUu+mdoua2iOWOu1xyXG4gIGNscygpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmRpID0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aDsgaSA8IGVuZGk7ICsraSkge1xyXG4gICAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGF0dHJfbGluZSA9IHRoaXMuYXR0ckJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGxpbmVfYmFjayA9IHRoaXMudGV4dEJhY2tCdWZmZXJbaV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmVfYmFjayA9IHRoaXMuYXR0ckJhY2tCdWZmZXJbaV07XHJcblxyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMudGV4dEJ1ZmZlcltpXS5sZW5ndGg7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICBsaW5lW2pdID0gMHgyMDtcclxuICAgICAgICBhdHRyX2xpbmVbal0gPSAweDAwO1xyXG4gICAgICAgIC8vbGluZV9iYWNrW2pdID0gMHgyMDtcclxuICAgICAgICAvL2F0dHJfbGluZV9iYWNrW2pdID0gMHgwMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIH1cclxuXHJcbiAgLy8vIOaWh+Wtl+ihqOekuuOBmeOCi1xyXG4gIHByaW50KHgsIHksIHN0ciwgYXR0cmlidXRlKSB7XHJcbiAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgIHZhciBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgaWYgKCFhdHRyaWJ1dGUpIHtcclxuICAgICAgYXR0cmlidXRlID0gMDtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgIGlmIChjID09IDB4YSkge1xyXG4gICAgICAgICsreTtcclxuICAgICAgICBpZiAoeSA+PSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6tcclxuICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IHRoaXMudGV4dEJ1ZmZlci5zbGljZSgxLCB0aGlzLnRleHRCdWZmZXIubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICB0aGlzLnRleHRCdWZmZXIucHVzaChuZXcgQXJyYXkoc2ZnLlZJUlRVQUxfV0lEVEggLyA4KSk7XHJcbiAgICAgICAgICB0aGlzLmF0dHJCdWZmZXIgPSB0aGlzLmF0dHJCdWZmZXIuc2xpY2UoMSwgdGhpcy5hdHRyQnVmZmVyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgdGhpcy5hdHRyQnVmZmVyLnB1c2gobmV3IEFycmF5KHNmZy5WSVJUVUFMX1dJRFRIIC8gOCkpO1xyXG4gICAgICAgICAgLS15O1xyXG4gICAgICAgICAgdmFyIGVuZGogPSB0aGlzLnRleHRCdWZmZXJbeV0ubGVuZ3RoO1xyXG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyW3ldW2pdID0gMHgyMDtcclxuICAgICAgICAgICAgdGhpcy5hdHRyQnVmZmVyW3ldW2pdID0gMHgwMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgICAgICBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgICAgIHggPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxpbmVbeF0gPSBjO1xyXG4gICAgICAgIGF0dHJbeF0gPSBhdHRyaWJ1dGU7XHJcbiAgICAgICAgKyt4O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDjg4bjgq3jgrnjg4jjg4fjg7zjgr/jgpLjgoLjgajjgavjg4bjgq/jgrnjg4Hjg6Pjg7zjgavmj4/nlLvjgZnjgotcclxuICByZW5kZXIoKSB7XHJcbiAgICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICB0aGlzLmJsaW5rQ291bnQgPSAodGhpcy5ibGlua0NvdW50ICsgMSkgJiAweGY7XHJcblxyXG4gICAgdmFyIGRyYXdfYmxpbmsgPSBmYWxzZTtcclxuICAgIGlmICghdGhpcy5ibGlua0NvdW50KSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSAhdGhpcy5ibGluaztcclxuICAgICAgZHJhd19ibGluayA9IHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgdXBkYXRlID0gZmFsc2U7XHJcbi8vICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4vLyAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwLCBneSA9IDA7IHkgPCBzZmcuVEVYVF9IRUlHSFQ7ICsreSwgZ3kgKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmUgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICAgIHZhciBsaW5lX2JhY2sgPSB0aGlzLnRleHRCYWNrQnVmZmVyW3ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lX2JhY2sgPSB0aGlzLmF0dHJCYWNrQnVmZmVyW3ldO1xyXG4gICAgICBmb3IgKHZhciB4ID0gMCwgZ3ggPSAwOyB4IDwgc2ZnLlRFWFRfV0lEVEg7ICsreCwgZ3ggKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgICB2YXIgcHJvY2Vzc19ibGluayA9IChhdHRyX2xpbmVbeF0gJiYgYXR0cl9saW5lW3hdLmJsaW5rKTtcclxuICAgICAgICBpZiAobGluZVt4XSAhPSBsaW5lX2JhY2tbeF0gfHwgYXR0cl9saW5lW3hdICE9IGF0dHJfbGluZV9iYWNrW3hdIHx8IChwcm9jZXNzX2JsaW5rICYmIGRyYXdfYmxpbmspKSB7XHJcbiAgICAgICAgICB1cGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIGxpbmVfYmFja1t4XSA9IGxpbmVbeF07XHJcbiAgICAgICAgICBhdHRyX2xpbmVfYmFja1t4XSA9IGF0dHJfbGluZVt4XTtcclxuICAgICAgICAgIHZhciBjID0gMDtcclxuICAgICAgICAgIGlmICghcHJvY2Vzc19ibGluayB8fCB0aGlzLmJsaW5rKSB7XHJcbiAgICAgICAgICAgIGMgPSBsaW5lW3hdIC0gMHgyMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHZhciB5cG9zID0gKGMgPj4gNCkgPDwgMztcclxuICAgICAgICAgIHZhciB4cG9zID0gKGMgJiAweGYpIDw8IDM7XHJcbiAgICAgICAgICBjdHguY2xlYXJSZWN0KGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIHZhciBmb250ID0gYXR0cl9saW5lW3hdID8gYXR0cl9saW5lW3hdLmZvbnQgOiBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICAgICAgICBpZiAoYykge1xyXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGZvbnQuaW1hZ2UsIHhwb3MsIHlwb3MsIHNmZy5DSEFSX1NJWkUsIHNmZy5DSEFSX1NJWkUsIGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHVwZGF0ZTtcclxuICB9XHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29sbGlzaW9uQXJlYSB7XHJcbiAgY29uc3RydWN0b3Iob2Zmc2V0WCwgb2Zmc2V0WSwgd2lkdGgsIGhlaWdodClcclxuICB7XHJcbiAgICB0aGlzLm9mZnNldFggPSBvZmZzZXRYIHx8IDA7XHJcbiAgICB0aGlzLm9mZnNldFkgPSBvZmZzZXRZIHx8IDA7XHJcbiAgICB0aGlzLnRvcCA9IDA7XHJcbiAgICB0aGlzLmJvdHRvbSA9IDA7XHJcbiAgICB0aGlzLmxlZnQgPSAwO1xyXG4gICAgdGhpcy5yaWdodCA9IDA7XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGggfHwgMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDA7XHJcbiAgICB0aGlzLndpZHRoXyA9IDA7XHJcbiAgICB0aGlzLmhlaWdodF8gPSAwO1xyXG4gIH1cclxuICBnZXQgd2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoXzsgfVxyXG4gIHNldCB3aWR0aCh2KSB7XHJcbiAgICB0aGlzLndpZHRoXyA9IHY7XHJcbiAgICB0aGlzLmxlZnQgPSB0aGlzLm9mZnNldFggLSB2IC8gMjtcclxuICAgIHRoaXMucmlnaHQgPSB0aGlzLm9mZnNldFggKyB2IC8gMjtcclxuICB9XHJcbiAgZ2V0IGhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0XzsgfVxyXG4gIHNldCBoZWlnaHQodikge1xyXG4gICAgdGhpcy5oZWlnaHRfID0gdjtcclxuICAgIHRoaXMudG9wID0gdGhpcy5vZmZzZXRZICsgdiAvIDI7XHJcbiAgICB0aGlzLmJvdHRvbSA9IHRoaXMub2Zmc2V0WSAtIHYgLyAyO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHgsIHksIHopIHtcclxuICAgIHRoaXMueF8gPSB4IHx8IDA7XHJcbiAgICB0aGlzLnlfID0geSB8fCAwO1xyXG4gICAgdGhpcy56XyA9IHogfHwgMC4wO1xyXG4gICAgdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgICB0aGlzLndpZHRoID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gMDtcclxuICAgIHRoaXMuY29sbGlzaW9uQXJlYSA9IG5ldyBDb2xsaXNpb25BcmVhKCk7XHJcbiAgfVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdjsgfVxyXG59XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBzZmcgZnJvbSAnLi9nbG9iYWwuanMnOyBcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmouanMnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzLmpzJztcclxuXHJcbnZhciBteUJ1bGxldHMgPSBbXTtcclxuXHJcbi8vLyDoh6rmqZ/lvL4gXHJcbmV4cG9ydCBjbGFzcyBNeUJ1bGxldCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICBzdXBlcigwLCAwLCAwKTtcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNDtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gNjtcclxuICB0aGlzLnNwZWVkID0gODtcclxuICB0aGlzLnBvd2VyID0gMTtcclxuXHJcbiAgdGhpcy50ZXh0dXJlV2lkdGggPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS53aWR0aDtcclxuICB0aGlzLnRleHR1cmVIZWlnaHQgPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuXHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwoc2ZnLnRleHR1cmVGaWxlcy5teXNoaXApO1xyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAsIDE2LCAxNiwgMSk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIC8vc2UoMCk7XHJcbiAgLy9zZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzBdKTtcclxuICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB0aGlzLm1lc2gudmlzaWJsZSA9IHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gIC8vICBzZmcudGFza3MucHVzaFRhc2soZnVuY3Rpb24gKHRhc2tJbmRleCkgeyBzZWxmLm1vdmUodGFza0luZGV4KTsgfSk7XHJcbiB9XHJcblxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gICptb3ZlKHRhc2tJbmRleCkge1xyXG4gICAgXHJcbiAgICB3aGlsZSAodGFza0luZGV4ID49IDAgXHJcbiAgICAgICYmIHRoaXMuZW5hYmxlX1xyXG4gICAgICAmJiB0aGlzLnkgPD0gKHNmZy5WX1RPUCArIDE2KSBcclxuICAgICAgJiYgdGhpcy55ID49IChzZmcuVl9CT1RUT00gLSAxNikgXHJcbiAgICAgICYmIHRoaXMueCA8PSAoc2ZnLlZfUklHSFQgKyAxNikgXHJcbiAgICAgICYmIHRoaXMueCA+PSAoc2ZnLlZfTEVGVCAtIDE2KSlcclxuICAgIHtcclxuICAgICAgXHJcbiAgICAgIHRoaXMueSArPSB0aGlzLmR5O1xyXG4gICAgICB0aGlzLnggKz0gdGhpcy5keDtcclxuICAgICAgXHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2sodGFza0luZGV4KTtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbn1cclxuXHJcbiAgc3RhcnQoeCwgeSwgeiwgYWltUmFkaWFuLHBvd2VyKSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0geiAtIDAuMTtcclxuICAgIHRoaXMucG93ZXIgPSBwb3dlciB8IDE7XHJcbiAgICB0aGlzLmR4ID0gTWF0aC5jb3MoYWltUmFkaWFuKSAqIHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4oYWltUmFkaWFuKSAqIHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLnNlKDApO1xyXG4gICAgLy9zZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzBdKTtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/jgqrjg5bjgrjjgqfjgq/jg4hcclxuZXhwb3J0IGNsYXNzIE15U2hpcCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7IFxyXG4gIGNvbnN0cnVjdG9yKHgsIHksIHosc2NlbmUsc2UpIHtcclxuICBzdXBlcih4LCB5LCB6KTsvLyBleHRlbmRcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNjtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gODtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gIC8vdGhpcy50ZXh0dXJlV2lkdGggPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS53aWR0aDtcclxuICAvL3RoaXMudGV4dHVyZUhlaWdodCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLmhlaWdodDtcclxuXHJcbiAgLy8g44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6XHJcbiAgLy8g44Oe44OG44Oq44Ki44Or44Gu5L2c5oiQXHJcbiAgLy92YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbChzZmcudGV4dHVyZUZpbGVzLm15c2hpcCk7XHJcbiAgLy8g44K444Kq44Oh44OI44Oq44Gu5L2c5oiQXHJcbiAgLy92YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSh0aGlzLndpZHRoKTtcclxuICAvL2dyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLm15c2hpcCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDApO1xyXG5cclxuICAvL3RoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoID0gc2ZnLmdhbWUubWVzaE15U2hpcDtcclxuICBsZXQgYmJveCA9IG5ldyBUSFJFRS5Cb3gzKCkuc2V0RnJvbU9iamVjdCh0aGlzLm1lc2gpO1xyXG4gIGxldCBkID0gYmJveC5nZXRTaXplKCk7XHJcblxyXG4gIHRoaXMuYmIgPSBuZXcgVEhSRUUuQm91bmRpbmdCb3hIZWxwZXIoIHRoaXMubWVzaCwgMHhmZmZmZmYgKTtcclxuXHRzZmcuZ2FtZS5zY2VuZS5hZGQoIHRoaXMuYmIgKTtcclxuXHJcbiAgXHJcbiAgdGhpcy53aWR0aCA9IGQueDtcclxuICB0aGlzLmhlaWdodCA9IGQueTtcclxuXHJcbiAgLy8g56e75YuV56+E5Zuy44KS5rGC44KB44KLXHJcbiAgdGhpcy50b3AgPSAoc2ZnLlZfVE9QIC0gdGhpcy5oZWlnaHQgLyAyKSA7XHJcbiAgdGhpcy5ib3R0b20gPSAoc2ZnLlZfQk9UVE9NICsgdGhpcy5oZWlnaHQgLyAyKTtcclxuICB0aGlzLmxlZnQgPSAoc2ZnLlZfTEVGVCArIHRoaXMud2lkdGggLyAyKSA7XHJcbiAgdGhpcy5yaWdodCA9IChzZmcuVl9SSUdIVCAtIHRoaXMud2lkdGggLyAyKTtcclxuXHJcblxyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdGhpcy54XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMueV87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB0aGlzLnpfO1xyXG4gIHRoaXMucmVzdCA9IDM7XHJcbiAgLy8gdGhpcy5teUJ1bGxldHMgPSAoICgpPT4ge1xyXG4gIC8vICAgdmFyIGFyciA9IFtdO1xyXG4gIC8vICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyOyArK2kpIHtcclxuICAvLyAgICAgYXJyLnB1c2gobmV3IE15QnVsbGV0KHRoaXMuc2NlbmUsdGhpcy5zZSkpO1xyXG4gIC8vICAgfVxyXG4gIC8vICAgcmV0dXJuIGFycjtcclxuICAvLyB9KSgpO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIFxyXG4gIHRoaXMuYnVsbGV0UG93ZXIgPSAxO1xyXG5cclxufVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gIFxyXG4gIHNob290KGFpbVJhZGlhbikge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMubXlCdWxsZXRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLm15QnVsbGV0c1tpXS5zdGFydCh0aGlzLngsIHRoaXMueSAsIHRoaXMueixhaW1SYWRpYW4sdGhpcy5idWxsZXRQb3dlcikpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBhY3Rpb24oYmFzaWNJbnB1dCkge1xyXG4gICAgaWYgKGJhc2ljSW5wdXQubGVmdCkge1xyXG4gICAgICBpZiAodGhpcy54ID4gdGhpcy5sZWZ0KSB7XHJcbiAgICAgICAgdGhpcy54IC09IDAuMTU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5yaWdodCkge1xyXG4gICAgICBpZiAodGhpcy54IDwgdGhpcy5yaWdodCkge1xyXG4gICAgICAgIHRoaXMueCArPSAwLjE1O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQudXApIHtcclxuICAgICAgaWYgKHRoaXMueSA8IHRoaXMudG9wKSB7XHJcbiAgICAgICAgdGhpcy55ICs9IDAuMTU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5kb3duKSB7XHJcbiAgICAgIGlmICh0aGlzLnkgPiB0aGlzLmJvdHRvbSkge1xyXG4gICAgICAgIHRoaXMueSAtPSAwLjE1O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYoYmFzaWNJbnB1dC5sZWZ0ICYmIHRoaXMubWVzaC5yb3RhdGlvbi56IDwgMC40KXtcclxuICAgICAgdGhpcy5tZXNoLnJvdGF0aW9uLnogKz0gMC4wMjsgXHJcbiAgICB9IGVsc2UgaWYoYmFzaWNJbnB1dC5yaWdodCAmJiB0aGlzLm1lc2gucm90YXRpb24ueiA+IC0wLjQpe1xyXG4gICAgICB0aGlzLm1lc2gucm90YXRpb24ueiAtPSAwLjAyO1xyXG4gICAgfSBlbHNlIGlmKHRoaXMubWVzaC5yb3RhdGlvbi56ICE9IDApe1xyXG4gICAgICBpZih0aGlzLm1lc2gucm90YXRpb24ueiA8IDApe1xyXG4gICAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ICs9IDAuMDU7XHJcbiAgICAgICAgaWYodGhpcy5tZXNoLnJvdGF0aW9uLnogPiAwKXtcclxuICAgICAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYodGhpcy5tZXNoLnJvdGF0aW9uLnogPiAwKXtcclxuICAgICAgICB0aGlzLm1lc2gucm90YXRpb24ueiAtPSAwLjA1O1xyXG4gICAgICAgIGlmKHRoaXMubWVzaC5yb3RhdGlvbi56IDwgMCl7XHJcbiAgICAgICAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAvLyBpZiAoYmFzaWNJbnB1dC56KSB7XHJcbiAgICAvLyAgIGJhc2ljSW5wdXQua2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgLy8gICB0aGlzLnNob290KDAuNSAqIE1hdGguUEkpO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIGlmIChiYXNpY0lucHV0LngpIHtcclxuICAgIC8vICAgYmFzaWNJbnB1dC5rZXlDaGVjay54ID0gZmFsc2U7XHJcbiAgICAvLyAgIHRoaXMuc2hvb3QoMS41ICogTWF0aC5QSSk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgdGhpcy5iYi5wb3NpdGlvbi54ID0gdGhpcy5tZXNoLnBvc2l0aW9uLng7XHJcbiAgICB0aGlzLmJiLnBvc2l0aW9uLnkgPSB0aGlzLm1lc2gucG9zaXRpb24ueTtcclxuICAgIHRoaXMuYmIucG9zaXRpb24ueiA9IHRoaXMubWVzaC5wb3NpdGlvbi56O1xyXG4gICAgdGhpcy5iYi5yb3RhdGlvbi55ID0gdGhpcy5tZXNoLnJvdGF0aW9uLno7XHJcbn1cclxuXHJcbiAgXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHNmZy5ib21icy5zdGFydCh0aGlzLngsIHRoaXMueSwgMC4yKTtcclxuICAgIHRoaXMuc2UoNCk7XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLm15QnVsbGV0cy5mb3JFYWNoKChkKT0+e1xyXG4gICAgICBpZihkLmVuYWJsZV8pe1xyXG4gICAgICAgIHdoaWxlKCFzZmcudGFza3MuYXJyYXlbZC50YXNrLmluZGV4XS5nZW5JbnN0Lm5leHQoLSgxICsgZC50YXNrLmluZGV4KSkuZG9uZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBpbml0KCl7XHJcbiAgICAgIHRoaXMueCA9IDA7XHJcbi8vICAgICAgdGhpcy55ID0gLTEwMDtcclxuICAgICAgdGhpcy55ID0gMDtcclxuICAgICAgdGhpcy56ID0gMDtcclxuICAgICAgdGhpcy5yZXN0ID0gMztcclxuICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbiIsIlxyXG5leHBvcnQgdmFyIHNlcURhdGEgPSB7XHJcbiAgbmFtZTogJ1Rlc3QnLFxyXG4gIHRyYWNrczogW1xyXG4vKiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDAsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYFxyXG4gICAgICAgczAuMDEsMC4yLDAuMiwwLjAzIEAyIFxyXG4gICAgICAgdDE0MCAgcTM1IHYzMCBsMXIxcjFyMXIxICRsMTZvMyBjY2NjY2NjYzxnZ2dnYWFiYj4gY2NjY2NjY2M8Z2dnZz5jYzxiYiBiLWItYi1iLWItYi1iLWItZmZmZmdnZytnKyBnK2crZytnK2crZytnK2crZ2dnZ2FhYmIgPlxyXG4gICAgICAgICAgICAgYFxyXG4gICAgICB9LCovXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDEsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYFxyXG4gICAgICAgczAuMDEsMC4yLDAuMiwwLjAzIEAyIFxyXG4gICAgICAgdDE2MCAgcTU1IHYyMCBvMiBsOCAkYmJiYiBiYmJiXHJcbiAgICAgICAgICAgICBgXHJcbiAgICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDIsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYFxyXG4gICAgICAgczAuMDEsMC4yLDAuMiwwLjA1IEA0IFxyXG4gICAgICAgdDE2MCAgcTc1IHYyMCBvNCBsOCAkW2JkK10xIFtiZCtdW2JkK10gcjhbZis+Yys8XSByOFtkK2ItXSByOFtiZCtdMi5yOHI0XHJcbiAgICAgICAgICAgICBgXHJcbiAgICAgIH0sXHJcblxyXG4gICAge1xyXG4gICAgICBuYW1lOiAnYmFzZScsXHJcbiAgICAgIGNoYW5uZWw6IDMsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYHMwLjAxLDAuMDEsMS4wLDAuMDUgbzUgdDE2MCBAMTAgdjYwIHEyMCAkbDRncmc4ZzhyYFxyXG4gICAgfVxyXG4gICAgLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAncGFydDQnLFxyXG4gICAgICBjaGFubmVsOiA0LFxyXG4gICAgICBtbWw6XHJcbiAgICAgIGBzMC4wMSwwLjAxLDEuMCwwLjA1IG81IHQxNjAgQDIxIHY2MCBxODAgJC86bDRydjYwYjgudjMwYjE2cmwxNnY2MGI4cjg6LzNsNHJiOC5iMTZybDE2YnIxNmJiYFxyXG4gICAgfVxyXG4gICAgLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAncGFydDUnLFxyXG4gICAgICBjaGFubmVsOiA1LFxyXG4gICAgICBtbWw6XHJcbiAgICAgIGBzMC4wMSwwLjAxLDEuMCwwLjA1IG81IHQxNjAgQDExIGw4ICQgcTIwIHY2MCByOGE4IHI4YThgXHJcbiAgICB9XHJcbiAgICAsXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0NScsXHJcbiAgICAgIGNoYW5uZWw6IDQsXHJcbiAgICAgIG1tbDpcclxuICAgICAgYHMwLjAxLDAuMDEsMS4wLDAuMDUgbzUgdDE2MCBAMjAgcTk1ICR2MjAgbDQgcmdyZyBgXHJcbiAgICB9XHJcbiAgXVxyXG59O1xyXG5cclxuZXhwb3J0IHZhciBzb3VuZEVmZmVjdERhdGEgPSBbXHJcbiAgLy8gMFxyXG4gIHtcclxuICAgIG5hbWU6ICcnLFxyXG4gICAgdHJhY2tzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBjaGFubmVsOiAxMixcclxuICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgIG1tbDogJ3MwLjAwMDEsMC4wMDAxLDEuMCwwLjAwMSBANCB0MjQwIHExMjcgdjUwIGwxMjggbzggY2RlZmdhYiA8IGNkZWdhYmJiYidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNoYW5uZWw6IDEzLFxyXG4gICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgbW1sOiAnczAuMDAwMSwwLjAwMDEsMS4wLDAuMDAxIEA0IHQyNDAgcTEyNyB2NTAgbDEyOCBvNyBjZGVmZ2FiIDwgY2RlZ2FiYmJiJ1xyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuICAvLyAxXHJcbiAge1xyXG4gICAgbmFtZTogJycsXHJcbiAgICB0cmFja3M6IFtcclxuICAgICAge1xyXG4gICAgICAgIGNoYW5uZWw6IDE0LFxyXG4gICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgbW1sOiAnczAuMDAwMSwwLjAwMDEsMS4wLDAuMDAwMSBANCB0MjAwIHExMjcgdjUwIGw2NCBvNiBnIGFiPGJhZ2ZlZGNlZ2FiPmJhZ2ZlZGM+ZGJhZ2ZlZGMnXHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9LFxyXG4gIC8vIDIgXHJcbiAge1xyXG4gICAgbmFtZTogJycsXHJcbiAgICB0cmFja3M6IFtcclxuICAgICAge1xyXG4gICAgICAgIGNoYW5uZWw6IDE0LFxyXG4gICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgbW1sOiAnczAuMDAwMSwwLjAwMDEsMS4wLDAuMDAwMSBANCB0MTUwIHExMjcgdjUwIGwxMjggbzYgY2RlZmdhYj5jZGVmPGc+YT5iPGE+ZzxmPmU8ZSdcclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgLy8gMyBcclxuICB7XHJcbiAgICBuYW1lOiAnJyxcclxuICAgIHRyYWNrczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgY2hhbm5lbDogMTQsXHJcbiAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICBtbWw6ICdzMC4wMDAxLDAuMDAwMSwxLjAsMC4wMDAxIEA1IHQyMDAgcTEyNyB2NTAgbDY0IG82IGM8Yz5jPGM+YzxjPmM8J1xyXG4gICAgICB9XHJcbiAgICBdXHJcbiAgfSxcclxuICAvLyA0IFxyXG4gIHtcclxuICAgIG5hbWU6ICcnLFxyXG4gICAgdHJhY2tzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBjaGFubmVsOiAxNSxcclxuICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgIG1tbDogJ3MwLjAwMDEsMC4wMDAxLDEuMCwwLjI1IEA4IHQxMjAgcTEyNyB2NTAgbDIgbzAgYydcclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH1cclxuXTtcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG4vL3ZhciBTVEFHRV9NQVggPSAxO1xyXG5pbXBvcnQgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpby5qcyc7XHJcbi8vaW1wb3J0ICogYXMgc29uZyBmcm9tICcuL3NvbmcnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzLmpzJztcclxuaW1wb3J0ICogYXMgaW8gZnJvbSAnLi9pby5qcyc7XHJcbmltcG9ydCAqIGFzIGNvbW0gZnJvbSAnLi9jb21tLmpzJztcclxuaW1wb3J0ICogYXMgdGV4dCBmcm9tICcuL3RleHQuanMnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iai5qcyc7XHJcbmltcG9ydCAqIGFzIG15c2hpcCBmcm9tICcuL215c2hpcC5qcyc7XHJcbi8vaW1wb3J0ICogYXMgZW5lbWllcyBmcm9tICcuL2VuZW1pZXMuanMnO1xyXG4vL2ltcG9ydCAqIGFzIGVmZmVjdG9iaiBmcm9tICcuL2VmZmVjdG9iai5qcyc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9ldmVudEVtaXR0ZXIzLmpzJztcclxuaW1wb3J0IHtzZXFEYXRhLHNvdW5kRWZmZWN0RGF0YX0gZnJvbSAnLi9zZXFEYXRhLmpzJztcclxuXHJcblxyXG5jbGFzcyBTY29yZUVudHJ5IHtcclxuICBjb25zdHJ1Y3RvcihuYW1lLCBzY29yZSkge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuc2NvcmUgPSBzY29yZTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5jbGFzcyBTdGFnZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5NQVggPSAxO1xyXG4gICAgdGhpcy5ESUZGSUNVTFRZX01BWCA9IDIuMDtcclxuICAgIHRoaXMubm8gPSAxO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gICAgdGhpcy5kaWZmaWN1bHR5ID0gMTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgICB0aGlzLmRpZmZpY3VsdHkgPSAxO1xyXG4gIH1cclxuXHJcbiAgYWR2YW5jZSgpIHtcclxuICAgIHRoaXMubm8rKztcclxuICAgIHRoaXMucHJpdmF0ZU5vKys7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAganVtcChzdGFnZU5vKSB7XHJcbiAgICB0aGlzLm5vID0gc3RhZ2VObztcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gdGhpcy5ubyAtIDE7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgaWYgKHRoaXMuZGlmZmljdWx0eSA8IHRoaXMuRElGRklDVUxUWV9NQVgpIHtcclxuICAgICAgdGhpcy5kaWZmaWN1bHR5ID0gMSArIDAuMDUgKiAodGhpcy5ubyAtIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnByaXZhdGVObyA+PSB0aGlzLk1BWCkge1xyXG4gICAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgLy8gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsdGhpcyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLkNPTlNPTEVfV0lEVEggPSAwO1xyXG4gICAgdGhpcy5DT05TT0xFX0hFSUdIVCA9IDA7XHJcbiAgICB0aGlzLlJFTkRFUkVSX1BSSU9SSVRZID0gMTAwMDAwIHwgMDtcclxuICAgIHRoaXMucmVuZGVyZXIgPSBudWxsO1xyXG4gICAgdGhpcy5zdGF0cyA9IG51bGw7XHJcbiAgICB0aGlzLnNjZW5lID0gbnVsbDtcclxuICAgIHRoaXMuY2FtZXJhID0gbnVsbDtcclxuICAgIHRoaXMuYXV0aG9yID0gbnVsbDtcclxuICAgIHRoaXMucHJvZ3Jlc3MgPSBudWxsO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUgPSBudWxsO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0ID0gbmV3IGlvLkJhc2ljSW5wdXQoKTtcclxuICAgIHRoaXMudGFza3MgPSBuZXcgdXRpbC5UYXNrcygpO1xyXG4gICAgc2ZnLnRhc2tzID0gdGhpcy50YXNrcztcclxuICAgIHRoaXMud2F2ZUdyYXBoID0gbnVsbDtcclxuICAgIHRoaXMuc3RhcnQgPSBmYWxzZTtcclxuICAgIHRoaXMuYmFzZVRpbWUgPSBuZXcgRGF0ZTtcclxuICAgIHRoaXMuZCA9IC0wLjI7XHJcbiAgICB0aGlzLmF1ZGlvXyA9IG51bGw7XHJcbiAgICB0aGlzLnNlcXVlbmNlciA9IG51bGw7XHJcbiAgICB0aGlzLnBpYW5vID0gbnVsbDtcclxuICAgIHRoaXMuc2NvcmUgPSAwO1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSAwO1xyXG4gICAgdGhpcy5oaWdoU2NvcmVzID0gW107XHJcbiAgICB0aGlzLmlzSGlkZGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLm15c2hpcF8gPSBudWxsO1xyXG4gICAgdGhpcy5lbmVtaWVzID0gbnVsbDtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gbnVsbDtcclxuICAgIHRoaXMuUEkgPSBNYXRoLlBJO1xyXG4gICAgdGhpcy5jb21tXyA9IG51bGw7XHJcbiAgICB0aGlzLmhhbmRsZU5hbWUgPSAnJztcclxuICAgIHRoaXMuc3RvcmFnZSA9IG51bGw7XHJcbiAgICB0aGlzLnJhbmsgPSAtMTtcclxuICAgIHRoaXMuc291bmRFZmZlY3RzID0gbnVsbDtcclxuICAgIHRoaXMuZW5zID0gbnVsbDtcclxuICAgIHRoaXMuZW5icyA9IG51bGw7XHJcbiAgICB0aGlzLnN0YWdlID0gbmV3IFN0YWdlKCk7XHJcbiAgICBzZmcuc3RhZ2UgPSB0aGlzLnN0YWdlO1xyXG4gICAgdGhpcy50aXRsZSA9IG51bGw7Ly8g44K/44Kk44OI44Or44Oh44OD44K344OlXHJcbiAgICB0aGlzLnNwYWNlRmllbGQgPSBudWxsOy8vIOWuh+WumeepuumWk+ODkeODvOODhuOCo+OCr+ODq1xyXG4gICAgdGhpcy5lZGl0SGFuZGxlTmFtZSA9IG51bGw7XHJcbiAgICBzZmcuYWRkU2NvcmUgPSB0aGlzLmFkZFNjb3JlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLmNoZWNrVmlzaWJpbGl0eUFQSSgpO1xyXG4gICAgdGhpcy5hdWRpb18gPSBuZXcgYXVkaW8uQXVkaW8oKTtcclxuICB9XHJcblxyXG4gIGV4ZWMoKSB7XHJcbiAgICBcclxuICAgIGlmICghdGhpcy5jaGVja0Jyb3dzZXJTdXBwb3J0KCcjY29udGVudCcpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbmV3IGF1ZGlvLlNlcXVlbmNlcih0aGlzLmF1ZGlvXyk7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IG5ldyBhdWRpby5Tb3VuZEVmZmVjdHModGhpcy5zZXF1ZW5jZXIsc291bmRFZmZlY3REYXRhKTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlLCB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyID0gbmV3IHV0aWwuR2FtZVRpbWVyKHRoaXMuZ2V0Q3VycmVudFRpbWUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8vIOOCsuODvOODoOOCs+ODs+OCveODvOODq+OBruWIneacn+WMllxyXG4gICAgdGhpcy5pbml0Q29uc29sZSgpO1xyXG4gICAgdGhpcy5sb2FkUmVzb3VyY2VzKClcclxuICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMucHJvZ3Jlc3MubWVzaCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgICAgIHRoaXMudGFza3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMuYmFzaWNJbnB1dC51cGRhdGUuYmluZCh0aGlzLmJhc2ljSW5wdXQpKTtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMuaW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1haW4oKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBjaGVja1Zpc2liaWxpdHlBUEkoKSB7XHJcbiAgICAvLyBoaWRkZW4g44OX44Ot44OR44OG44Kj44GK44KI44Gz5Y+v6KaW5oCn44Gu5aSJ5pu044Kk44OZ44Oz44OI44Gu5ZCN5YmN44KS6Kit5a6aXHJcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50LmhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikgeyAvLyBPcGVyYSAxMi4xMCDjgoQgRmlyZWZveCAxOCDku6XpmY3jgafjgrXjg53jg7zjg4ggXHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJoaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcInZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibW96SGlkZGVuXCI7XHJcbiAgICAgIHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlID0gXCJtb3p2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tc0hpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibXNIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIm1zdmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQud2Via2l0SGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJ3ZWJraXRIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIndlYmtpdHZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2FsY1NjcmVlblNpemUoKSB7XHJcbiAgICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHZhciBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICBpZiAod2lkdGggPj0gaGVpZ2h0KSB7XHJcbiAgICAgIHdpZHRoID0gaGVpZ2h0ICogc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQ7XHJcbiAgICAgIHdoaWxlICh3aWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XHJcbiAgICAgICAgLS1oZWlnaHQ7XHJcbiAgICAgICAgd2lkdGggPSBoZWlnaHQgKiBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgd2hpbGUgKGhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xyXG4gICAgICAgIC0td2lkdGg7XHJcbiAgICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5DT05TT0xFX1dJRFRIID0gd2lkdGg7XHJcbiAgICB0aGlzLkNPTlNPTEVfSEVJR0hUID0gaGVpZ2h0O1xyXG4gIH1cclxuICBcclxuICAvLy8g44Kz44Oz44K944O844Or55S76Z2i44Gu5Yid5pyf5YyWXHJcbiAgaW5pdENvbnNvbGUoY29uc29sZUNsYXNzKSB7XHJcbiAgICAvLyDjg6zjg7Pjg4Djg6njg7zjga7kvZzmiJBcclxuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7IGFudGlhbGlhczogZmFsc2UsIHNvcnRPYmplY3RzOiB0cnVlIH0pO1xyXG4gICAgdmFyIHJlbmRlcmVyID0gdGhpcy5yZW5kZXJlcjtcclxuICAgIHRoaXMuY2FsY1NjcmVlblNpemUoKTtcclxuICAgIHJlbmRlcmVyLnNldFNpemUodGhpcy5DT05TT0xFX1dJRFRILCB0aGlzLkNPTlNPTEVfSEVJR0hUKTtcclxuICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMCwgMSk7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ2NvbnNvbGUnO1xyXG4gICAgcmVuZGVyZXIuZG9tRWxlbWVudC5jbGFzc05hbWUgPSBjb25zb2xlQ2xhc3MgfHwgJ2NvbnNvbGUnO1xyXG4gICAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS56SW5kZXggPSAwO1xyXG5cclxuXHJcbiAgICBkMy5zZWxlY3QoJyNjb250ZW50Jykubm9kZSgpLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2FsY1NjcmVlblNpemUoKTtcclxuICAgICAgcmVuZGVyZXIuc2V0U2l6ZSh0aGlzLkNPTlNPTEVfV0lEVEgsIHRoaXMuQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8g44K344O844Oz44Gu5L2c5oiQXHJcbiAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcblxyXG4gICAgLy8g44Kr44Oh44Op44Gu5L2c5oiQXHJcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYShzZmcuQU5HTEVfT0ZfVklFVywgc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueiA9IHNmZy5DQU1FUkFfWjsvL3NmZy5WSVJUVUFMX0hFSUdIVCAvIChNYXRoLnRhbigyICogTWF0aC5QSSAqIDUgLyAzNjApICogMik7Ly9zZmcuVklSVFVBTF9IRUlHSFQgLyAyO1xyXG4gICAgdGhpcy5jYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuXHJcbiAgICAvLyDjg6njgqTjg4jjga7kvZzmiJBcclxuICAgIHZhciBsaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmKTtcclxuICAgIGxpZ2h0LnBvc2l0aW9uLnNldCgwLjU3NywgMC41NzcsIDAuNTc3KTtcclxuICAgIHRoaXMuc2NlbmUuYWRkKGxpZ2h0KTtcclxuXHJcbiAgICB2YXIgYW1iaWVudCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhjMGMwYzApO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQoYW1iaWVudCk7XHJcbiAgICByZW5kZXJlci5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLy8vIOOCqOODqeODvOOBp+e1guS6huOBmeOCi+OAglxyXG4gIEV4aXRFcnJvcihlKSB7XHJcbiAgICAvL2N0eC5maWxsU3R5bGUgPSBcInJlZFwiO1xyXG4gICAgLy9jdHguZmlsbFJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgLy9jdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gICAgLy9jdHguZmlsbFRleHQoXCJFcnJvciA6IFwiICsgZSwgMCwgMjApO1xyXG4gICAgLy8vL2FsZXJ0KGUpO1xyXG4gICAgdGhpcy5zdGFydCA9IGZhbHNlO1xyXG4gICAgdGhyb3cgZTtcclxuICB9XHJcblxyXG4gIG9uVmlzaWJpbGl0eUNoYW5nZSgpIHtcclxuICAgIHZhciBoID0gZG9jdW1lbnRbdGhpcy5oaWRkZW5dO1xyXG4gICAgdGhpcy5pc0hpZGRlbiA9IGg7XHJcbiAgICBpZiAoaCkge1xyXG4gICAgICB0aGlzLnBhdXNlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlc3VtZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcGF1c2UoKSB7XHJcbiAgICBpZiAoc2ZnLmdhbWVUaW1lci5zdGF0dXMgPT0gc2ZnLmdhbWVUaW1lci5TVEFSVCkge1xyXG4gICAgICBzZmcuZ2FtZVRpbWVyLnBhdXNlKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zZXF1ZW5jZXIuc3RhdHVzID09IHRoaXMuc2VxdWVuY2VyLlBMQVkpIHtcclxuICAgICAgdGhpcy5zZXF1ZW5jZXIucGF1c2UoKTtcclxuICAgIH1cclxuICAgIHNmZy5wYXVzZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICByZXN1bWUoKSB7XHJcbiAgICBpZiAoc2ZnLmdhbWVUaW1lci5zdGF0dXMgPT0gc2ZnLmdhbWVUaW1lci5QQVVTRSkge1xyXG4gICAgICBzZmcuZ2FtZVRpbWVyLnJlc3VtZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2VxdWVuY2VyLnN0YXR1cyA9PSB0aGlzLnNlcXVlbmNlci5QQVVTRSkge1xyXG4gICAgICB0aGlzLnNlcXVlbmNlci5yZXN1bWUoKTtcclxuICAgIH1cclxuICAgIHNmZy5wYXVzZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8vIOePvuWcqOaZgumWk+OBruWPluW+l1xyXG4gIGdldEN1cnJlbnRUaW1lKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXVkaW9fLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gIH1cclxuXHJcbiAgLy8vIOODluODqeOCpuOCtuOBruapn+iDveODgeOCp+ODg+OCr1xyXG4gIGNoZWNrQnJvd3NlclN1cHBvcnQoKSB7XHJcbiAgICB2YXIgY29udGVudCA9ICc8aW1nIGNsYXNzPVwiZXJyb3JpbWdcIiBzcmM9XCJodHRwOi8vcHVibGljLmJsdS5saXZlZmlsZXN0b3JlLmNvbS95MnBiWTNhcUJ6Nnd6NGFoODdSWEVWazVDbGhEMkx1akM1TnM2NkhLdlI4OWFqckZkTE0wVHhGZXJZWVVSdDgzY19iZzM1SFNrcWMzRThHeGFGRDgtWDk0TUxzRlY1R1U2QllwMTk1SXZlZ2V2US8yMDEzMTAwMS5wbmc/cHNpZD0xXCIgd2lkdGg9XCI0NzlcIiBoZWlnaHQ9XCI2NDBcIiBjbGFzcz1cImFsaWdubm9uZVwiIC8+JztcclxuICAgIC8vIFdlYkdM44Gu44K144Od44O844OI44OB44Kn44OD44KvXHJcbiAgICBpZiAoIURldGVjdG9yLndlYmdsKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWJHTOOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2ViIEF1ZGlvIEFQSeODqeODg+ODkeODvFxyXG4gICAgaWYgKCF0aGlzLmF1ZGlvXy5lbmFibGUpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYiBBdWRpbyBBUEnjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOODluODqeOCpuOCtuOBjFBhZ2UgVmlzaWJpbGl0eSBBUEkg44KS44K144Od44O844OI44GX44Gq44GE5aC05ZCI44Gr6K2m5ZGKIFxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmhpZGRlbiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPlBhZ2UgVmlzaWJpbGl0eSBBUEnjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgbG9jYWxTdG9yYWdlID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViIExvY2FsIFN0b3JhZ2XjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gXHJcbiAgLy8vIOOCsuODvOODoOODoeOCpOODs1xyXG4gIG1haW4oKSB7XHJcbiAgICAvLyDjgr/jgrnjgq/jga7lkbzjgbPlh7rjgZdcclxuICAgIC8vIOODoeOCpOODs+OBq+aPj+eUu1xyXG4gICAgaWYgKHRoaXMuc3RhcnQpIHtcclxuICAgICAgdGhpcy50YXNrcy5wcm9jZXNzKHRoaXMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbG9hZFJlc291cmNlcygpIHtcclxuICAgIC8vLyDjgrLjg7zjg6DkuK3jga7jg4bjgq/jgrnjg4Hjg6Pjg7zlrprnvqlcclxuICAgIHZhciB0ZXh0dXJlcyA9IHtcclxuICAgICAgZm9udDogJ2Jhc2UvZ3JhcGhpYy9Gb250LnBuZycsXHJcbiAgICAgIGZvbnQxOiAnYmFzZS9ncmFwaGljL0ZvbnQyLnBuZycsXHJcbiAgICAgIGF1dGhvcjogJ2Jhc2UvZ3JhcGhpYy9hdXRob3IucG5nJyxcclxuICAgICAgdGl0bGU6ICdiYXNlL2dyYXBoaWMvVElUTEUucG5nJ1xyXG4gICAgfTtcclxuXHJcbiAgICAvLy8g44OG44Kv44K544OB44Oj44O844Gu44Ot44O844OJXHJcbiAgICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICAgIGZ1bmN0aW9uIGxvYWRUZXh0dXJlKHNyYykge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGxvYWRlci5sb2FkKHNyYywgKHRleHR1cmUpID0+IHtcclxuICAgICAgICAgIHRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgICAgICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gICAgICAgICAgcmVzb2x2ZSh0ZXh0dXJlKTtcclxuICAgICAgICB9LCBudWxsLCAoeGhyKSA9PiB7IHJlamVjdCh4aHIpIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4TGVuZ3RoID0gT2JqZWN0LmtleXModGV4dHVyZXMpLmxlbmd0aDtcclxuICAgIHZhciB0ZXhDb3VudCA9IDA7XHJcblxyXG4gICAgdGhpcy5wcm9ncmVzcyA9IG5ldyBncmFwaGljcy5Qcm9ncmVzcygpO1xyXG4gICAgdGhpcy5wcm9ncmVzcy5tZXNoLnBvc2l0aW9uLnogPSAwLjAwMTtcclxuICAgIHRoaXMucHJvZ3Jlc3MucmVuZGVyKCdMb2FkaW5nIFJlc291cmNlcyAuLi4nLCAwKTtcclxuICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMucHJvZ3Jlc3MubWVzaCk7XHJcbiAgICB2YXIgbG9hZFByb21pc2UgPSB0aGlzLmF1ZGlvXy5yZWFkRHJ1bVNhbXBsZTtcclxuICAgIGZvciAodmFyIG4gaW4gdGV4dHVyZXMpIHtcclxuICAgICAgKChuYW1lLCB0ZXhQYXRoKSA9PiB7XHJcbiAgICAgICAgbG9hZFByb21pc2UgPSBsb2FkUHJvbWlzZVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbG9hZFRleHR1cmUoc2ZnLnJlc291cmNlQmFzZSArIHRleFBhdGgpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKCh0ZXgpID0+IHtcclxuICAgICAgICAgICAgdGV4Q291bnQrKztcclxuICAgICAgICAgICAgdGhpcy5wcm9ncmVzcy5yZW5kZXIoJ0xvYWRpbmcgUmVzb3VyY2VzIC4uLicsICh0ZXhDb3VudCAvIHRleExlbmd0aCAqIDEwMCkgfCAwKTtcclxuICAgICAgICAgICAgc2ZnLnRleHR1cmVGaWxlc1tuYW1lXSA9IHRleDtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSkobiwgdGV4dHVyZXNbbl0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICBsb2FkUHJvbWlzZSA9IGxvYWRQcm9taXNlLnRoZW4oKCk9PntcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntcclxuICAgICAgICB2YXIganNvbiA9ICcuL2RhdGEvdGVzdC5qc29uJzsvLyBqc29u44OR44K544Gu5oyH5a6aXHJcbiAgICAgICAgICAvLyBqc29u44OV44Kh44Kk44Or44Gu6Kqt44G/6L6844G/XHJcbiAgICAgICAgICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcclxuICAgICAgICAgIGxvYWRlci5sb2FkKGpzb24sIChnZW9tZXRyeSwgbWF0ZXJpYWxzKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBmYWNlTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTXVsdGlNYXRlcmlhbChtYXRlcmlhbHMpO1xyXG4gICAgICAgICAgICBzZWxmLm1lc2hNeVNoaXAgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgZmFjZU1hdGVyaWFsKTtcclxuICAgICAgICAgICAgc2VsZi5tZXNoTXlTaGlwLnJvdGF0aW9uLnNldCg5MCwgMCwgMCk7XHJcbiAgICAgICAgICAgIHNlbGYubWVzaE15U2hpcC5wb3NpdGlvbi5zZXQoMCwgMCwgMC4wKTtcclxuICAgICAgICAgICAgc2VsZi5tZXNoTXlTaGlwLnNjYWxlLnNldCgxLDEsMSk7XHJcbiAgICAgICAgICAgIHNlbGYuc2NlbmUuYWRkKHNlbGYubWVzaE15U2hpcCk7IC8vIOOCt+ODvOODs+OBuOODoeODg+OCt+ODpeOBrui/veWKoFxyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIFxyXG4gICAgcmV0dXJuIGxvYWRQcm9taXNlO1xyXG4gIH1cclxuXHJcbmxvYWRNb2RlbHMoKXtcclxuICBsZXQgbG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKTtcclxuICB0aGlzLm1vZGVscyA9IHt9O1xyXG4gIGxldCBtb2RlbHMgPSB7XHJcbiAgICAnbXlzaGlwJzonLi9kYXRhL3Rlc3QuanNvbicsXHJcbiAgICAnYmFsbGV0JzonLi9kYXRhL2JhbGxldC5qc29uJ1xyXG4gIH07XHJcbiAgbGV0IHByb21pc2VzID0gUHJvbWlzZS5yZXNvbHZlKDApO1xyXG4gIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgZm9yKGxldCBpIGluIG1vZGVscyl7XHJcbiAgICBwcm9taXNlcyA9IHByb21pc2VzLnRoZW4oKCk9PntcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntcclxuICAgICAgICAgIGxvYWRlci5sb2FkKG1vZGVsc1tpXSwgKGdlb21ldHJ5LCBtYXRlcmlhbHMpID0+IHtcclxuICAgICAgICAgICAgdmFyIGZhY2VNYXRlcmlhbCA9IG5ldyBUSFJFRS5NdWx0aU1hdGVyaWFsKG1hdGVyaWFscyk7XHJcbiAgICAgICAgICAgIHRoaXNfW2ldID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIGZhY2VNYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIHRoaXNfW2ldLnJvdGF0aW9uLnNldCg5MCwgMCwgMCk7XHJcbiAgICAgICAgICAgIHRoaXNfW2ldLnBvc2l0aW9uLnNldCgwLCAwLCAwLjApO1xyXG4gICAgICAgICAgICB0aGlzX1tpXS5zY2FsZS5zZXQoMSwxLDEpO1xyXG4gICAgICAgICAgICB0aGlzXy5zY2VuZS5hZGQodGhpc19baV0pOyAvLyDjgrfjg7zjg7Pjgbjjg6Hjg4Pjgrfjg6Xjga7ov73liqBcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHJldHVybiBwcm9taXNlcztcclxufVxyXG5cclxuKnJlbmRlcih0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5yZW5kZXIoKTtcclxuICAgIHRoaXMuc3RhdHMgJiYgdGhpcy5zdGF0cy51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxufVxyXG5cclxuaW5pdEFjdG9ycygpXHJcbntcclxuICBsZXQgcHJvbWlzZXMgPSBbXTtcclxuICB0aGlzLnNjZW5lID0gdGhpcy5zY2VuZSB8fCBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAvL3RoaXMuZW5lbXlCdWxsZXRzID0gdGhpcy5lbmVteUJ1bGxldHMgfHwgbmV3IGVuZW1pZXMuRW5lbXlCdWxsZXRzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgLy90aGlzLmVuZW1pZXMgPSB0aGlzLmVuZW1pZXMgfHwgbmV3IGVuZW1pZXMuRW5lbWllcyh0aGlzLnNjZW5lLCB0aGlzLnNlLmJpbmQodGhpcyksIHRoaXMuZW5lbXlCdWxsZXRzKTtcclxuICAvL3Byb21pc2VzLnB1c2godGhpcy5lbmVtaWVzLmxvYWRQYXR0ZXJucygpKTtcclxuICAvL3Byb21pc2VzLnB1c2godGhpcy5lbmVtaWVzLmxvYWRGb3JtYXRpb25zKCkpO1xyXG4gIC8vdGhpcy5ib21icyA9IHRoaXMuYm9tYnMgfHwgbmV3IGVmZmVjdG9iai5Cb21icyh0aGlzLnNjZW5lLCB0aGlzLnNlLmJpbmQodGhpcykpO1xyXG4gIC8vc2ZnLmJvbWIgPSB0aGlzLmJvbWJzO1xyXG4gIHRoaXMubXlzaGlwXyA9IHRoaXMubXlzaGlwXyB8fCBuZXcgbXlzaGlwLk15U2hpcCgwLCAtMTAwLCAwLjEsIHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgc2ZnLm15c2hpcF8gPSB0aGlzLm15c2hpcF87XHJcbiAgdGhpcy5teXNoaXBfLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAvL3RoaXMuc3BhY2VGaWVsZCA9IG51bGw7XHJcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxufVxyXG5cclxuaW5pdENvbW1BbmRIaWdoU2NvcmUoKVxyXG57XHJcbiAgLy8g44OP44Oz44OJ44Or44ON44O844Og44Gu5Y+W5b6XXHJcbiAgdGhpcy5oYW5kbGVOYW1lID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0oJ2hhbmRsZU5hbWUnKTtcclxuXHJcbiAgdGhpcy50ZXh0UGxhbmUgPSBuZXcgdGV4dC5UZXh0UGxhbmUodGhpcy5zY2VuZSk7XHJcbiAgLy8gdGV4dFBsYW5lLnByaW50KDAsIDAsIFwiV2ViIEF1ZGlvIEFQSSBUZXN0XCIsIG5ldyBUZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAvLyDjgrnjgrPjgqLmg4XloLEg6YCa5L+h55SoXHJcbiAgdGhpcy5jb21tXyA9IG5ldyBjb21tLkNvbW0oKTtcclxuICB0aGlzLmNvbW1fLnVwZGF0ZUhpZ2hTY29yZXMgPSAoZGF0YSkgPT4ge1xyXG4gICAgdGhpcy5oaWdoU2NvcmVzID0gZGF0YTtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5oaWdoU2NvcmVzWzBdLnNjb3JlO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuY29tbV8udXBkYXRlSGlnaFNjb3JlID0gKGRhdGEpID0+IHtcclxuICAgIGlmICh0aGlzLmhpZ2hTY29yZSA8IGRhdGEuc2NvcmUpIHtcclxuICAgICAgdGhpcy5oaWdoU2NvcmUgPSBkYXRhLnNjb3JlO1xyXG4gICAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIH1cclxuICB9O1xyXG4gIFxyXG59XHJcblxyXG4qaW5pdCh0YXNrSW5kZXgpIHtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgdGhpcy5pbml0Q29tbUFuZEhpZ2hTY29yZSgpO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgIHRoaXMuaW5pdEFjdG9ycygpXHJcbiAgICAudGhlbigoKT0+e1xyXG4gICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMucmVuZGVyLmJpbmQodGhpcyksIHRoaXMuUkVOREVSRVJfUFJJT1JJVFkpO1xyXG4gICAgICAvL3RoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnByaW50QXV0aG9yLmJpbmQodGhpcykpO1xyXG4gICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vLy8g5L2c6ICF6KGo56S6XHJcbipwcmludEF1dGhvcih0YXNrSW5kZXgpIHtcclxuICBjb25zdCB3YWl0ID0gNjA7XHJcbiAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIFxyXG4gIGxldCBuZXh0VGFzayA9ICgpPT57XHJcbiAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLmF1dGhvcik7XHJcbiAgICAvL3NjZW5lLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUaXRsZS5iaW5kKHRoaXMpKTtcclxuICB9XHJcbiAgXHJcbiAgbGV0IGNoZWNrS2V5SW5wdXQgPSAoKT0+IHtcclxuICAgIGlmICh0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA+IDAgfHwgdGhpcy5iYXNpY0lucHV0LnN0YXJ0KSB7XHJcbiAgICAgIHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID0gMDtcclxuICAgICAgbmV4dFRhc2soKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSAgXHJcblxyXG4gIC8vIOWIneacn+WMllxyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB2YXIgdyA9IHNmZy50ZXh0dXJlRmlsZXMuYXV0aG9yLmltYWdlLndpZHRoO1xyXG4gIHZhciBoID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2UuaGVpZ2h0O1xyXG4gIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIGN0eC5kcmF3SW1hZ2Uoc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2UsIDAsIDApO1xyXG4gIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3LCBoKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgZ2VvbWV0cnkudmVydF9zdGFydCA9IFtdO1xyXG4gIGdlb21ldHJ5LnZlcnRfZW5kID0gW107XHJcblxyXG4gIHtcclxuICAgIHZhciBpID0gMDtcclxuXHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGg7ICsreSkge1xyXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHc7ICsreCkge1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG5cclxuICAgICAgICB2YXIgciA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBnID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYSA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIGlmIChhICE9IDApIHtcclxuICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIGcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKCh4IC0gdyAvIDIuMCkpLCAoKHkgLSBoIC8gMikpICogLTEsIDAuMCk7XHJcbiAgICAgICAgICB2YXIgdmVydDIgPSBuZXcgVEhSRUUuVmVjdG9yMygxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCwgMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDAsIDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRfc3RhcnQucHVzaChuZXcgVEhSRUUuVmVjdG9yMyh2ZXJ0Mi54IC0gdmVydC54LCB2ZXJ0Mi55IC0gdmVydC55LCB2ZXJ0Mi56IC0gdmVydC56KSk7XHJcbiAgICAgICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQyKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRfZW5kLnB1c2godmVydCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDjg57jg4bjg6rjgqLjg6vjgpLkvZzmiJBcclxuICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe3NpemU6IDIwLCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgIHRyYW5zcGFyZW50OiB0cnVlLCB2ZXJ0ZXhDb2xvcnM6IHRydWUsIGRlcHRoVGVzdDogZmFsc2UvLywgbWFwOiB0ZXh0dXJlXHJcbiAgfSk7XHJcblxyXG4gIHRoaXMuYXV0aG9yID0gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIC8vICAgIGF1dGhvci5wb3NpdGlvbi54IGF1dGhvci5wb3NpdGlvbi55PSAgPTAuMCwgMC4wLCAwLjApO1xyXG5cclxuICAvL21lc2guc29ydFBhcnRpY2xlcyA9IGZhbHNlO1xyXG4gIC8vdmFyIG1lc2gxID0gbmV3IFRIUkVFLlBhcnRpY2xlU3lzdGVtKCk7XHJcbiAgLy9tZXNoLnNjYWxlLnggPSBtZXNoLnNjYWxlLnkgPSA4LjA7XHJcblxyXG4gIHRoaXMuc2NlbmUuYWRkKHRoaXMuYXV0aG9yKTsgIFxyXG5cclxuIFxyXG4gIC8vIOS9nOiAheihqOekuuOCueODhuODg+ODl++8kVxyXG4gIGZvcihsZXQgY291bnQgPSAxLjA7Y291bnQgPiAwOyhjb3VudCA8PSAwLjAxKT9jb3VudCAtPSAwLjAwMDU6Y291bnQgLT0gMC4wMDI1KVxyXG4gIHtcclxuICAgIC8vIOS9leOBi+OCreODvOWFpeWKm+OBjOOBguOBo+OBn+WgtOWQiOOBr+asoeOBruOCv+OCueOCr+OBuFxyXG4gICAgaWYoY2hlY2tLZXlJbnB1dCgpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZW5kID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoO1xyXG4gICAgbGV0IHYgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcztcclxuICAgIGxldCBkID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9zdGFydDtcclxuICAgIGxldCB2MiA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2W2ldLnggPSB2MltpXS54ICsgZFtpXS54ICogY291bnQ7XHJcbiAgICAgIHZbaV0ueSA9IHYyW2ldLnkgKyBkW2ldLnkgKiBjb3VudDtcclxuICAgICAgdltpXS56ID0gdjJbaV0ueiArIGRbaV0ueiAqIGNvdW50O1xyXG4gICAgfVxyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMuYXV0aG9yLnJvdGF0aW9uLnggPSB0aGlzLmF1dGhvci5yb3RhdGlvbi55ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueiA9IGNvdW50ICogNC4wO1xyXG4gICAgdGhpcy5hdXRob3IubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuICB0aGlzLmF1dGhvci5yb3RhdGlvbi54ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueSA9IHRoaXMuYXV0aG9yLnJvdGF0aW9uLnogPSAwLjA7XHJcblxyXG4gIGZvciAobGV0IGkgPSAwLGUgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgIHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnggPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X2VuZFtpXS54O1xyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNbaV0ueSA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLnk7XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS56ID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmRbaV0uejtcclxuICB9XHJcbiAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgLy8g5b6F44GhXHJcbiAgZm9yKGxldCBpID0gMDtpIDwgd2FpdDsrK2kpe1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5hdXRob3IubWF0ZXJpYWwuc2l6ZSA+IDIpIHtcclxuICAgICAgdGhpcy5hdXRob3IubWF0ZXJpYWwuc2l6ZSAtPSAwLjU7XHJcbiAgICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIH0gICAgXHJcbiAgICB5aWVsZDtcclxuICB9XHJcblxyXG4gIC8vIOODleOCp+ODvOODieOCouOCpuODiFxyXG4gIGZvcihsZXQgY291bnQgPSAwLjA7Y291bnQgPD0gMS4wO2NvdW50ICs9IDAuMDUpXHJcbiAge1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wIC0gY291bnQ7XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICBcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5hdXRob3IubWF0ZXJpYWwub3BhY2l0eSA9IDAuMDsgXHJcbiAgdGhpcy5hdXRob3IubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAvLyDlvoXjgaFcclxuICBmb3IobGV0IGkgPSAwO2kgPCB3YWl0OysraSl7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHlpZWxkO1xyXG4gIH1cclxuICBuZXh0VGFzaygpO1xyXG59XHJcblxyXG4vLy8g44K/44Kk44OI44Or55S76Z2i5Yid5pyf5YyWIC8vL1xyXG4qaW5pdFRpdGxlKHRhc2tJbmRleCkge1xyXG4gIFxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG4gIHRoaXMuYmFzaWNJbnB1dC5jbGVhcigpO1xyXG5cclxuICAvLyDjgr/jgqTjg4jjg6vjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiBzZmcudGV4dHVyZUZpbGVzLnRpdGxlIH0pO1xyXG4gIG1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICAvL21hdGVyaWFsLmFudGlhbGlhcyA9IGZhbHNlO1xyXG4gIG1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcclxuICBtYXRlcmlhbC5hbHBoYVRlc3QgPSAwLjU7XHJcbiAgbWF0ZXJpYWwuZGVwdGhUZXN0ID0gdHJ1ZTtcclxuICB0aGlzLnRpdGxlID0gbmV3IFRIUkVFLk1lc2goXHJcbiAgICBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcudGV4dHVyZUZpbGVzLnRpdGxlLmltYWdlLndpZHRoLCBzZmcudGV4dHVyZUZpbGVzLnRpdGxlLmltYWdlLmhlaWdodCksXHJcbiAgICBtYXRlcmlhbFxyXG4gICAgKTtcclxuICB0aGlzLnRpdGxlLnNjYWxlLnggPSB0aGlzLnRpdGxlLnNjYWxlLnkgPSAwLjg7XHJcbiAgdGhpcy50aXRsZS5wb3NpdGlvbi55ID0gODA7XHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy50aXRsZSk7XHJcbiAgdGhpcy5zaG93U3BhY2VGaWVsZCgpO1xyXG4gIC8vLyDjg4bjgq3jgrnjg4jooajnpLpcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCAyNSwgXCJQdXNoIHogb3IgU1RBUlQgYnV0dG9uXCIsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLnNob3dUaXRsZS5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDEwLyrnp5IqLztcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zaG93VGl0bGUuYmluZCh0aGlzKSk7XHJcbiAgcmV0dXJuO1xyXG59XHJcblxyXG4vLy8g6IOM5pmv44OR44O844OG44Kj44Kv44Or6KGo56S6XHJcbnNob3dTcGFjZUZpZWxkKCkge1xyXG4gIC8vLyDog4zmma/jg5Hjg7zjg4bjgqPjgq/jg6vooajnpLpcclxuICBpZiAoIXRoaXMuc3BhY2VGaWVsZCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcblxyXG4gICAgZ2VvbWV0cnkuZW5keSA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTA7ICsraSkge1xyXG4gICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcclxuICAgICAgdmFyIHogPSAtMTgwMC4wICogTWF0aC5yYW5kb20oKSAtIDMwMC4wO1xyXG4gICAgICBjb2xvci5zZXRIU0woMC4wNSArIE1hdGgucmFuZG9tKCkgKiAwLjA1LCAxLjAsICgtMjEwMCAtIHopIC8gLTIxMDApO1xyXG4gICAgICB2YXIgZW5keSA9IHNmZy5WSVJUVUFMX0hFSUdIVCAvIDIgLSB6ICogc2ZnLlZJUlRVQUxfSEVJR0hUIC8gc2ZnLlZJUlRVQUxfV0lEVEg7XHJcbiAgICAgIHZhciB2ZXJ0MiA9IG5ldyBUSFJFRS5WZWN0b3IzKChzZmcuVklSVFVBTF9XSURUSCAtIHogKiAyKSAqIE1hdGgucmFuZG9tKCkgLSAoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpIC8gMilcclxuICAgICAgICAsIGVuZHkgKiAyICogTWF0aC5yYW5kb20oKSAtIGVuZHksIHopO1xyXG4gICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQyKTtcclxuICAgICAgZ2VvbWV0cnkuZW5keS5wdXNoKGVuZHkpO1xyXG5cclxuICAgICAgZ2VvbWV0cnkuY29sb3JzLnB1c2goY29sb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOODnuODhuODquOCouODq+OCkuS9nOaIkFxyXG4gICAgLy92YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJ2ltYWdlcy9wYXJ0aWNsZTEucG5nJyk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe1xyXG4gICAgICBzaXplOiA0LCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiB0cnVlLy8sIG1hcDogdGV4dHVyZVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zcGFjZUZpZWxkID0gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgdGhpcy5zcGFjZUZpZWxkLnBvc2l0aW9uLnggPSB0aGlzLnNwYWNlRmllbGQucG9zaXRpb24ueSA9IHRoaXMuc3BhY2VGaWVsZC5wb3NpdGlvbi56ID0gMC4wO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5zcGFjZUZpZWxkKTtcclxuICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlU3BhY2VGaWVsZC5iaW5kKHRoaXMpKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDlroflrpnnqbrplpPjga7ooajnpLpcclxuKm1vdmVTcGFjZUZpZWxkKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRydWUpe1xyXG4gICAgdmFyIHZlcnRzID0gdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gICAgdmFyIGVuZHlzID0gdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LmVuZHk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdmVydHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmVydHNbaV0ueSAtPSA0O1xyXG4gICAgICBpZiAodmVydHNbaV0ueSA8IC1lbmR5c1tpXSkge1xyXG4gICAgICAgIHZlcnRzW2ldLnkgPSBlbmR5c1tpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vooajnpLpcclxuKnNob3dUaXRsZSh0YXNrSW5kZXgpIHtcclxuIHdoaWxlKHRydWUpe1xyXG4gIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcblxyXG4gIGlmICh0aGlzLmJhc2ljSW5wdXQueiB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQgKSB7XHJcbiAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLnRpdGxlKTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRIYW5kbGVOYW1lLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICBpZiAodGhpcy5zaG93VGl0bGUuZW5kVGltZSA8IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpIHtcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMudGl0bGUpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRvcDEwLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICB5aWVsZDtcclxuIH1cclxufVxyXG5cclxuLy8vIOODj+ODs+ODieODq+ODjeODvOODoOOBruOCqOODs+ODiOODquWJjeWIneacn+WMllxyXG4qaW5pdEhhbmRsZU5hbWUodGFza0luZGV4KSB7XHJcbiAgbGV0IGVuZCA9IGZhbHNlO1xyXG4gIGlmICh0aGlzLmVkaXRIYW5kbGVOYW1lKXtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmVkaXRIYW5kbGVOYW1lID0gdGhpcy5oYW5kbGVOYW1lIHx8ICcnO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg0LCAxOCwgJ0lucHV0IHlvdXIgaGFuZGxlIG5hbWUuJyk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxOSwgJyhNYXggOCBDaGFyKScpO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgIC8vICAgIHRleHRQbGFuZS5wcmludCgxMCwgMjEsIGhhbmRsZU5hbWVbMF0sIFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0LnVuYmluZCgpO1xyXG4gICAgdmFyIGVsbSA9IGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2lucHV0Jyk7XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzO1xyXG4gICAgZWxtXHJcbiAgICAgIC5hdHRyKCd0eXBlJywgJ3RleHQnKVxyXG4gICAgICAuYXR0cigncGF0dGVybicsICdbYS16QS1aMC05X1xcQFxcI1xcJFxcLV17MCw4fScpXHJcbiAgICAgIC5hdHRyKCdtYXhsZW5ndGgnLCA4KVxyXG4gICAgICAuYXR0cignaWQnLCAnaW5wdXQtYXJlYScpXHJcbiAgICAgIC5hdHRyKCd2YWx1ZScsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKVxyXG4gICAgICAuY2FsbChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGQubm9kZSgpLnNlbGVjdGlvblN0YXJ0ID0gdGhpc18uZWRpdEhhbmRsZU5hbWUubGVuZ3RoO1xyXG4gICAgICB9KVxyXG4gICAgICAub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBkMy5ldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAvL2xldCB0aGlzXyA9IHRoaXM7XHJcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4geyB0aGlzLmZvY3VzKCk7IH0sIDEwKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbigna2V5dXAnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZDMuZXZlbnQua2V5Q29kZSA9PSAxMykge1xyXG4gICAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgbGV0IHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgbGV0IGUgPSB0aGlzLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLm9uKCdrZXl1cCcsIG51bGwpO1xyXG4gICAgICAgICAgdGhpc18uYmFzaWNJbnB1dC5iaW5kKCk7XHJcbiAgICAgICAgICAvLyDjgZPjga7jgr/jgrnjgq/jgpLntYLjgo/jgonjgZvjgotcclxuICAgICAgICAgIHRoaXNfLnRhc2tzLmFycmF5W3Rhc2tJbmRleF0uZ2VuSW5zdC5uZXh0KC0odGFza0luZGV4ICsgMSkpO1xyXG4gICAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44KS6Kit5a6a44GZ44KLXHJcbiAgICAgICAgICB0aGlzXy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXNfLmdhbWVJbml0LmJpbmQodGhpc18pKTtcclxuICAgICAgICAgIHRoaXNfLnN0b3JhZ2Uuc2V0SXRlbSgnaGFuZGxlTmFtZScsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIGxldCBzID0gdGhpcy5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzXy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLm5vZGUoKS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzXy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgdGhpcy5ub2RlKCkuZm9jdXMoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgd2hpbGUodGFza0luZGV4ID49IDApXHJcbiAgICB7XHJcbiAgICAgIHRoaXMuYmFzaWNJbnB1dC5jbGVhcigpO1xyXG4gICAgICBpZih0aGlzLmJhc2ljSW5wdXQuYUJ1dHRvbiB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQpXHJcbiAgICAgIHtcclxuICAgICAgICAgIHZhciBpbnB1dEFyZWEgPSBkMy5zZWxlY3QoJyNpbnB1dC1hcmVhJyk7XHJcbiAgICAgICAgICB2YXIgaW5wdXROb2RlID0gaW5wdXRBcmVhLm5vZGUoKTtcclxuICAgICAgICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSBpbnB1dE5vZGUudmFsdWU7XHJcbiAgICAgICAgICBsZXQgcyA9IGlucHV0Tm9kZS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICAgIGxldCBlID0gaW5wdXROb2RlLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwLCAyMSwgdGhpcy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgaW5wdXRBcmVhLm9uKCdrZXl1cCcsIG51bGwpO1xyXG4gICAgICAgICAgdGhpcy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgICAgICAgIC8vIOOBk+OBruOCv+OCueOCr+OCkue1guOCj+OCieOBm+OCi1xyXG4gICAgICAgICAgLy90aGlzLnRhc2tzLmFycmF5W3Rhc2tJbmRleF0uZ2VuSW5zdC5uZXh0KC0odGFza0luZGV4ICsgMSkpO1xyXG4gICAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44KS6Kit5a6a44GZ44KLXHJcbiAgICAgICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKCdoYW5kbGVOYW1lJywgdGhpcy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgICBpbnB1dEFyZWEucmVtb3ZlKCk7XHJcbiAgICAgICAgICByZXR1cm47ICAgICAgICBcclxuICAgICAgfVxyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuICAgIHRhc2tJbmRleCA9IC0oKyt0YXNrSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCueOCs+OCouWKoOeul1xyXG5hZGRTY29yZShzKSB7XHJcbiAgdGhpcy5zY29yZSArPSBzO1xyXG4gIGlmICh0aGlzLnNjb3JlID4gdGhpcy5oaWdoU2NvcmUpIHtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5zY29yZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgrnjgrPjgqLooajnpLpcclxucHJpbnRTY29yZSgpIHtcclxuICB2YXIgcyA9ICgnMDAwMDAwMDAnICsgdGhpcy5zY29yZS50b1N0cmluZygpKS5zbGljZSgtOCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMSwgMSwgcyk7XHJcblxyXG4gIHZhciBoID0gKCcwMDAwMDAwMCcgKyB0aGlzLmhpZ2hTY29yZS50b1N0cmluZygpKS5zbGljZSgtOCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTIsIDEsIGgpO1xyXG5cclxufVxyXG5cclxuLy8vIOOCteOCpuODs+ODieOCqOODleOCp+OCr+ODiFxyXG5zZShpbmRleCkge1xyXG4gIHRoaXMuc2VxdWVuY2VyLnBsYXlUcmFja3ModGhpcy5zb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzW2luZGV4XSk7XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6Djga7liJ3mnJ/ljJZcclxuKmdhbWVJbml0KHRhc2tJbmRleCkge1xyXG5cclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICBcclxuXHJcbiAgLy8g44Kq44O844OH44Kj44Kq44Gu6ZaL5aeLXHJcbiAgdGhpcy5hdWRpb18uc3RhcnQoKTtcclxuICB0aGlzLnNlcXVlbmNlci5sb2FkKHNlcURhdGEpO1xyXG4gIHRoaXMuc2VxdWVuY2VyLnN0YXJ0KCk7XHJcbiAgc2ZnLnN0YWdlLnJlc2V0KCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgLy90aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuXHJcbiAgLy8g6Ieq5qmf44Gu5Yid5pyf5YyWXHJcbiAgdGhpcy5teXNoaXBfLmluaXQoKTtcclxuICBzZmcuZ2FtZVRpbWVyLnN0YXJ0KCk7XHJcbiAgdGhpcy5zY29yZSA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMiwgMCwgJ1Njb3JlICAgIEhpZ2ggU2NvcmUnKTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICB0aGlzLnByaW50U2NvcmUoKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZUluaXQuYmluZCh0aGlzKS8qZ2FtZUFjdGlvbiovKTtcclxufVxyXG5cclxuLy8vIOOCueODhuODvOOCuOOBruWIneacn+WMllxyXG4qc3RhZ2VJbml0KHRhc2tJbmRleCkge1xyXG4gIFxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDAsIDM5LCAnU3RhZ2U6JyArIHNmZy5zdGFnZS5ubyk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIC8vdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAgLy90aGlzLmVuZW1pZXMuc3RhcnQoKTtcclxuICAvL3RoaXMuZW5lbWllcy5jYWxjRW5lbWllc0NvdW50KHNmZy5zdGFnZS5wcml2YXRlTm8pO1xyXG4gIC8vdGhpcy5lbmVtaWVzLmhpdEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgMTUsICdTdGFnZSAnICsgKHNmZy5zdGFnZS5ubykgKyAnIFN0YXJ0ICEhJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VTdGFydC5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuLy8vIOOCueODhuODvOOCuOmWi+Wni1xyXG4qc3RhZ2VTdGFydCh0YXNrSW5kZXgpIHtcclxuICBsZXQgZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAyO1xyXG4gIHdoaWxlKHRhc2tJbmRleCA+PSAwICYmIGVuZFRpbWUgPj0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSl7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgc2ZnLm15c2hpcF8uYWN0aW9uKHRoaXMuYmFzaWNJbnB1dCk7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDsgICAgXHJcbiAgfVxyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE1LCAnICAgICAgICAgICAgICAgICAgJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuZ2FtZUFjdGlvbi5iaW5kKHRoaXMpLCA1MDAwKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODoOS4rVxyXG4qZ2FtZUFjdGlvbih0YXNrSW5kZXgpIHtcclxuICB3aGlsZSAodGFza0luZGV4ID49IDApe1xyXG4gICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICBzZmcubXlzaGlwXy5hY3Rpb24odGhpcy5iYXNpY0lucHV0KTtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpO1xyXG4gICAgLy90aGlzLmVuZW1pZXMubW92ZSgpO1xyXG5cclxuICAgIC8vIGlmICghdGhpcy5wcm9jZXNzQ29sbGlzaW9uKCkpIHtcclxuICAgIC8vICAgLy8g6Z2i44Kv44Oq44Ki44OB44Kn44OD44KvXHJcbiAgICAvLyAgIGlmICh0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID09IHRoaXMuZW5lbWllcy50b3RhbEVuZW1pZXNDb3VudCkge1xyXG4gICAgLy8gICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgLy8gICAgIHRoaXMuc3RhZ2UuYWR2YW5jZSgpO1xyXG4gICAgLy8gICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgIC8vICAgICByZXR1cm47XHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH0gZWxzZSB7XHJcbiAgICAvLyAgIHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDM7XHJcbiAgICAvLyAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLm15U2hpcEJvbWIuYmluZCh0aGlzKSk7XHJcbiAgICAvLyAgIHJldHVybjtcclxuICAgIC8vIH07XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDsgXHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5b2T44Gf44KK5Yik5a6aXHJcbnByb2Nlc3NDb2xsaXNpb24odGFza0luZGV4KSB7XHJcbiAgLy8gLy/jgIDoh6rmqZ/lvL7jgajmlbXjgajjga7jgYLjgZ/jgorliKTlrppcclxuICAvLyBsZXQgbXlCdWxsZXRzID0gc2ZnLm15c2hpcF8ubXlCdWxsZXRzO1xyXG4gIC8vIHRoaXMuZW5zID0gdGhpcy5lbmVtaWVzLmVuZW1pZXM7XHJcbiAgLy8gZm9yICh2YXIgaSA9IDAsIGVuZCA9IG15QnVsbGV0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gIC8vICAgbGV0IG15YiA9IG15QnVsbGV0c1tpXTtcclxuICAvLyAgIGlmIChteWIuZW5hYmxlXykge1xyXG4gIC8vICAgICB2YXIgbXliY28gPSBteUJ1bGxldHNbaV0uY29sbGlzaW9uQXJlYTtcclxuICAvLyAgICAgdmFyIGxlZnQgPSBteWJjby5sZWZ0ICsgbXliLng7XHJcbiAgLy8gICAgIHZhciByaWdodCA9IG15YmNvLnJpZ2h0ICsgbXliLng7XHJcbiAgLy8gICAgIHZhciB0b3AgPSBteWJjby50b3AgKyBteWIueTtcclxuICAvLyAgICAgdmFyIGJvdHRvbSA9IG15YmNvLmJvdHRvbSAtIG15Yi5zcGVlZCArIG15Yi55O1xyXG4gIC8vICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMuZW5zLmxlbmd0aDsgaiA8IGVuZGo7ICsraikge1xyXG4gIC8vICAgICAgIHZhciBlbiA9IHRoaXMuZW5zW2pdO1xyXG4gIC8vICAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgLy8gICAgICAgICB2YXIgZW5jbyA9IGVuLmNvbGxpc2lvbkFyZWE7XHJcbiAgLy8gICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAvLyAgICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAvLyAgICAgICAgICAgbGVmdCA8IChlbi54ICsgZW5jby5yaWdodCkgJiZcclxuICAvLyAgICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAvLyAgICAgICAgICAgKSB7XHJcbiAgLy8gICAgICAgICAgIGVuLmhpdChteWIpO1xyXG4gIC8vICAgICAgICAgICBpZiAobXliLnBvd2VyIDw9IDApIHtcclxuICAvLyAgICAgICAgICAgICBteWIuZW5hYmxlXyA9IGZhbHNlO1xyXG4gIC8vICAgICAgICAgICB9XHJcbiAgLy8gICAgICAgICAgIGJyZWFrO1xyXG4gIC8vICAgICAgICAgfVxyXG4gIC8vICAgICAgIH1cclxuICAvLyAgICAgfVxyXG4gIC8vICAgfVxyXG4gIC8vIH1cclxuXHJcbiAgLy8gLy8g5pW144Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgLy8gaWYgKHNmZy5DSEVDS19DT0xMSVNJT04pIHtcclxuICAvLyAgIGxldCBteWNvID0gc2ZnLm15c2hpcF8uY29sbGlzaW9uQXJlYTtcclxuICAvLyAgIGxldCBsZWZ0ID0gc2ZnLm15c2hpcF8ueCArIG15Y28ubGVmdDtcclxuICAvLyAgIGxldCByaWdodCA9IG15Y28ucmlnaHQgKyBzZmcubXlzaGlwXy54O1xyXG4gIC8vICAgbGV0IHRvcCA9IG15Y28udG9wICsgc2ZnLm15c2hpcF8ueTtcclxuICAvLyAgIGxldCBib3R0b20gPSBteWNvLmJvdHRvbSArIHNmZy5teXNoaXBfLnk7XHJcblxyXG4gIC8vICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5zLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgLy8gICAgIGxldCBlbiA9IHRoaXMuZW5zW2ldO1xyXG4gIC8vICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gIC8vICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAvLyAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAvLyAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgLy8gICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gIC8vICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAvLyAgICAgICAgICkge1xyXG4gIC8vICAgICAgICAgZW4uaGl0KG15c2hpcCk7XHJcbiAgLy8gICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAvLyAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gIC8vICAgICAgIH1cclxuICAvLyAgICAgfVxyXG4gIC8vICAgfVxyXG4gIC8vICAgLy8g5pW15by+44Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgLy8gICB0aGlzLmVuYnMgPSB0aGlzLmVuZW15QnVsbGV0cy5lbmVteUJ1bGxldHM7XHJcbiAgLy8gICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5lbmJzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgLy8gICAgIGxldCBlbiA9IHRoaXMuZW5ic1tpXTtcclxuICAvLyAgICAgaWYgKGVuLmVuYWJsZSkge1xyXG4gIC8vICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAvLyAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAvLyAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgLy8gICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gIC8vICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAvLyAgICAgICAgICkge1xyXG4gIC8vICAgICAgICAgZW4uaGl0KCk7XHJcbiAgLy8gICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAvLyAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gIC8vICAgICAgIH1cclxuICAvLyAgICAgfVxyXG4gIC8vICAgfVxyXG5cclxuICAvLyB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG4vLy8g6Ieq5qmf54iG55m6IFxyXG4vLyAqbXlTaGlwQm9tYih0YXNrSW5kZXgpIHtcclxuLy8gICB3aGlsZShzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lIDw9IHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lICYmIHRhc2tJbmRleCA+PSAwKXtcclxuLy8gICAgIHRoaXMuZW5lbWllcy5tb3ZlKCk7XHJcbi8vICAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4vLyAgICAgdGFza0luZGV4ID0geWllbGQ7ICBcclxuLy8gICB9XHJcbi8vICAgc2ZnLm15c2hpcF8ucmVzdC0tO1xyXG4vLyAgIGlmIChzZmcubXlzaGlwXy5yZXN0IDw9IDApIHtcclxuLy8gICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwLCAxOCwgJ0dBTUUgT1ZFUicsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4vLyAgICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbi8vICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuLy8gICAgIGlmKHRoaXMuY29tbV8uZW5hYmxlKXtcclxuLy8gICAgICAgdGhpcy5jb21tXy5zb2NrZXQub24oJ3NlbmRSYW5rJywgdGhpcy5jaGVja1JhbmtJbik7XHJcbi8vICAgICAgIHRoaXMuY29tbV8uc2VuZFNjb3JlKG5ldyBTY29yZUVudHJ5KHRoaXMuZWRpdEhhbmRsZU5hbWUsIHRoaXMuc2NvcmUpKTtcclxuLy8gICAgIH1cclxuLy8gICAgIHRoaXMuZ2FtZU92ZXIuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyA1O1xyXG4vLyAgICAgdGhpcy5yYW5rID0gLTE7XHJcbi8vICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lT3Zlci5iaW5kKHRoaXMpKTtcclxuLy8gICAgIHRoaXMuc2VxdWVuY2VyLnN0b3AoKTtcclxuLy8gICB9IGVsc2Uge1xyXG4vLyAgICAgc2ZnLm15c2hpcF8ubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuLy8gICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDIwLCAzOSwgJ1Jlc3Q6ICAgJyArIHNmZy5teXNoaXBfLnJlc3QpO1xyXG4vLyAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgMTUsICdTdGFnZSAnICsgKHNmZy5zdGFnZS5ubykgKyAnIFN0YXJ0ICEhJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbi8vICAgICB0aGlzLnN0YWdlU3RhcnQuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAyO1xyXG4vLyAgICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VTdGFydC5iaW5kKHRoaXMpKTtcclxuLy8gICB9XHJcbi8vIH1cclxuXHJcbi8vLyDjgrLjg7zjg6Djgqrjg7zjg5Djg7xcclxuKmdhbWVPdmVyKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRoaXMuZ2FtZU92ZXIuZW5kVGltZSA+PSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICYmIHRhc2tJbmRleCA+PSAwKVxyXG4gIHtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB9XHJcbiAgXHJcblxyXG4gIHRoaXMudGV4dFBsYW5lLmNscygpO1xyXG4gIC8vdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAgLy90aGlzLmVuZW15QnVsbGV0cy5yZXNldCgpO1xyXG4gIGlmICh0aGlzLnJhbmsgPj0gMCkge1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRvcDEwLmJpbmQodGhpcykpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VGl0bGUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Op44Oz44Kt44Oz44Kw44GX44Gf44GL44Gp44GG44GL44Gu44OB44Kn44OD44KvXHJcbmNoZWNrUmFua0luKGRhdGEpIHtcclxuICB0aGlzLnJhbmsgPSBkYXRhLnJhbms7XHJcbn1cclxuXHJcblxyXG4vLy8g44OP44Kk44K544Kz44Ki44Ko44Oz44OI44Oq44Gu6KGo56S6XHJcbnByaW50VG9wMTAoKSB7XHJcbiAgdmFyIHJhbmtuYW1lID0gWycgMXN0JywgJyAybmQnLCAnIDNyZCcsICcgNHRoJywgJyA1dGgnLCAnIDZ0aCcsICcgN3RoJywgJyA4dGgnLCAnIDl0aCcsICcxMHRoJ107XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgNCwgJ1RvcCAxMCBTY29yZScpO1xyXG4gIHZhciB5ID0gODtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5oaWdoU2NvcmVzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICB2YXIgc2NvcmVTdHIgPSAnMDAwMDAwMDAnICsgdGhpcy5oaWdoU2NvcmVzW2ldLnNjb3JlO1xyXG4gICAgc2NvcmVTdHIgPSBzY29yZVN0ci5zdWJzdHIoc2NvcmVTdHIubGVuZ3RoIC0gOCwgOCk7XHJcbiAgICBpZiAodGhpcy5yYW5rID09IGkpIHtcclxuICAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMywgeSwgcmFua25hbWVbaV0gKyAnICcgKyBzY29yZVN0ciArICcgJyArIHRoaXMuaGlnaFNjb3Jlc1tpXS5uYW1lLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyB0aGlzLmhpZ2hTY29yZXNbaV0ubmFtZSk7XHJcbiAgICB9XHJcbiAgICB5ICs9IDI7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuKmluaXRUb3AxMCh0YXNrSW5kZXgpIHtcclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICB0aGlzLnByaW50VG9wMTAoKTtcclxuICB0aGlzLnNob3dUb3AxMC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc2hvd1RvcDEwLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4qc2hvd1RvcDEwKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRoaXMuc2hvd1RvcDEwLmVuZFRpbWUgPj0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSAmJiB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9PSAwICYmIHRhc2tJbmRleCA+PSAwKVxyXG4gIHtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB9IFxyXG4gIFxyXG4gIHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VGl0bGUuYmluZCh0aGlzKSk7XHJcbn1cclxufVxyXG5cclxuXHJcblxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG4vL3ZhciBTVEFHRV9NQVggPSAxO1xyXG5pbXBvcnQgc2ZnIGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcbi8vIGltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcclxuLy8gaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpby5qcyc7XHJcbi8vIC8vaW1wb3J0ICogYXMgc29uZyBmcm9tICcuL3NvbmcnO1xyXG4vLyBpbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzLmpzJztcclxuLy8gaW1wb3J0ICogYXMgaW8gZnJvbSAnLi9pby5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIGNvbW0gZnJvbSAnLi9jb21tLmpzJztcclxuLy8gaW1wb3J0ICogYXMgdGV4dCBmcm9tICcuL3RleHQuanMnO1xyXG4vLyBpbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iai5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIG15c2hpcCBmcm9tICcuL215c2hpcC5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIGVuZW1pZXMgZnJvbSAnLi9lbmVtaWVzLmpzJztcclxuLy8gaW1wb3J0ICogYXMgZWZmZWN0b2JqIGZyb20gJy4vZWZmZWN0b2JqLmpzJztcclxuaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZS5qcyc7XHJcblxyXG4vLy8g44Oh44Kk44OzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgbGV0IHJlZyA9IG5ldyBSZWdFeHAoJyguKlxcLyknKTtcclxuICBsZXQgciA9IHJlZy5leGVjKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcclxuICBsZXQgcm9vdCA9IHJbMV07XHJcbiAgaWYod2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL2RldnZlci8pKXtcclxuICAgIHNmZy5yZXNvdXJjZUJhc2UgPSAnLi4vLi4vZGlzdC9yZXMvJztcclxuICB9IGVsc2Uge1xyXG4gICAgc2ZnLnJlc291cmNlQmFzZSA9ICcuL3Jlcy8nO1xyXG4gIH1cclxuICBzZmcuZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbiAgc2ZnLmdhbWUuZXhlYygpO1xyXG59O1xyXG4iXSwibmFtZXMiOlsidGhpcyIsImx6YmFzZTYyIiwiZ2FtZW9iai5HYW1lT2JqIiwiaW8uQmFzaWNJbnB1dCIsInV0aWwuVGFza3MiLCJhdWRpby5BdWRpbyIsImF1ZGlvLlNlcXVlbmNlciIsImF1ZGlvLlNvdW5kRWZmZWN0cyIsInV0aWwuR2FtZVRpbWVyIiwiZ3JhcGhpY3MuUHJvZ3Jlc3MiLCJteXNoaXAuTXlTaGlwIiwidGV4dC5UZXh0UGxhbmUiLCJjb21tLkNvbW0iLCJ0ZXh0LlRleHRBdHRyaWJ1dGUiXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1Q0EsTUFBTSxRQUFRLENBQUM7RUFDYixXQUFXLEdBQUc7SUFDWixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUN0QixJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQztJQUMzQixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUMzQixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztJQUM1QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7Ozs7OztJQU1sRixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7SUFDdEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztJQUMzQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDOztJQUU5QyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN0RCxJQUFJLENBQUMsV0FB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QUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0VBQ3JFLElBQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQzs7RUFFMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sS0FBSyxDQUFDOztFQUV0RCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztNQUM3QixHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU07TUFDdEIsSUFBSTtNQUNKLENBQUMsQ0FBQzs7RUFFTixJQUFJLFVBQVUsS0FBSyxPQUFPLFNBQVMsQ0FBQyxFQUFFLEVBQUU7SUFDdEMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztJQUU5RSxRQUFRLEdBQUc7TUFDVCxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDMUQsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUM5RCxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUNsRSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDdEUsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUMxRSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztLQUMvRTs7SUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO01BQ2xELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztJQUVELFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtJQUNMLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7SUFFTixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUMzQixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O01BRXBGLFFBQVEsR0FBRztRQUNULEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDMUQsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDOUQsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQ2xFO1VBQ0UsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQzVCOztVQUVELFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDckQ7S0FDRjtHQUNGOztFQUVELE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7OztBQVVGLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0VBQzFELElBQUksUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDO01BQ3RDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0VBRTFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFF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RSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQUFBeUQsQ0FBQSxDQUFDLENBQUMsVUFBVSxDQUFDQSxjQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLE9BQU8sVUFBVSxFQUFFLFdBQVcsRUFBRSxPQUFPLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQSxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUEsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzs7QUNKOTRKOzs7OztBQUtBLEFBQ0EsQUFDQSxBQUNBLEFBQ0EsQUFDQSxBQUVBO0FBQ0EsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQzs7O0FBR3JCLElBQUksUUFB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LENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0dBQy9DOztFQUVELElBQUksRUFBRSxHQUFHO0lBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDaEg7O0VBRUQsSUFBSSxJQUFJLEdBQUc7SUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDakg7O0VBRUQsSUFBSSxJQUFJLEdBQUc7SUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNsSDs7RUFFRCxJQUFJLEtBQUssR0FBRztJQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNs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QUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQyxTQUFTLEVBQUU7TUFDZCxTQUFTLEdBQUcsQ0FBQyxDQUFDO0tBQ2Y7SUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtNQUNuQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQzFCLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRTtRQUNaLEVBQUUsQ0FBQyxDQUFDO1FBQ0osSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7O1VBRS9CLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1VBQ3ZFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUN2RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztVQUN2RSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDdkQsRUFBRSxDQUFDLENBQUM7VUFDSixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztVQUNyQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQzdCLElBQUksQ0FBQyxV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LElBQUksQ0FBQyxDQUFDO0VBQ3JELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7RUFFdkIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDO0NBQzlELEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7OztFQUc3QixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7RUFHbEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7RUFDMUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDL0MsSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7RUFDM0MsSUFBSSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7OztFQUc1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztFQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztFQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztFQUMvQixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQzs7Ozs7Ozs7RUFRZCxLQUFLLENBQUMs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LENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDN0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1VBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDMUI7T0FDRjtNQUNELEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO1FBQzdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztVQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO09BQ0Y7S0FDRjs7Ozs7Ozs7Ozs7Ozs7SUFjRCxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDMUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUMxQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0NBQzdDOzs7RUFHQyxHQUFHLEdBQUc7SUFDSixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENB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LENBQUM7O0VBRUgsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDOzs7Ozs7O0VBT25ELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7OztFQUk1QixJQUFJLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRSxLQUFLLElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxNQUFNO0VBQzdFOztJQUVFLEdBQUcsYUFBYSxFQUFFLENBQUM7TUFDakIsT0FBTztLQUNSOztJQUVELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7SUFDL0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBQ3RDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztJQUN4QyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7SUFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRTtNQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7TUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO01BQ2xDLENBQUMsQ0FBQyxD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QUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzVELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztFQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztDQUM1RTs7O0FBR0QsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFOztFQUVwQixTQUFTLEdBQUcsS0FBSyxDQUFDOztFQUVsQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ3JELEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7Ozs7O0VBS3RCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxFQUFFLElBQUlBLGFBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUNuRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUMvRDs7O0FBR0QsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFO0VBQ3JCLElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztFQUM1QyxNQUFNLFNBQVMsSUFBSSxDQUFDLElBQUksT0FBTyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO0lBQzNELEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDdkIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BDLFNBQVMs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
