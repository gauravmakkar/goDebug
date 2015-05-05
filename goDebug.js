(function (global) {
  'use strict';

  var goDebug,
      sequences = {},
      keys = {
        backspace: 8,
        tab: 9,
        enter: 13,
        'return': 13,
        shift: 16,
        '⇧': 16,
        control: 17,
        ctrl: 17,
        '⌃': 17,
        alt: 18,
        option: 18,
        '⌥': 18,
        pause: 19,
        capslock: 20,
        esc: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        left: 37,
        L: 37,
        '←': 37,
        up: 38,
        U: 38,
        '↑': 38,
        right: 39,
        R: 39,
        '→': 39,
        down: 40,
        D: 40,
        '↓': 40,
        insert: 45,
        'delete': 46,
        '0': 48,
        '1': 49,
        '2': 50,
        '3': 51,
        '4': 52,
        '5': 53,
        '6': 54,
        '7': 55,
        '8': 56,
        '9': 57,
        a: 65,
        b: 66,
        c: 67,
        d: 68,
        e: 69,
        f: 70,
        g: 71,
        h: 72,
        i: 73,
        j: 74,
        k: 75,
        l: 76,
        m: 77,
        n: 78,
        o: 79,
        p: 80,
        q: 81,
        r: 82,
        s: 83,
        t: 84,
        u: 85,
        v: 86,
        w: 87,
        x: 88,
        y: 89,
        z: 90,
        '⌘': 91,
        command: 91,
        kp_0: 96,
        kp_1: 97,
        kp_2: 98,
        kp_3: 99,
        kp_4: 100,
        kp_5: 101,
        kp_6: 102,
        kp_7: 103,
        kp_8: 104,
        kp_9: 105,
        kp_multiply: 106,
        kp_plus: 107,
        kp_minus: 109,
        kp_decimal: 110,
        kp_divide: 111,
        f1: 112,
        f2: 113,
        f3: 114,
        f4: 115,
        f5: 116,
        f6: 117,
        f7: 118,
        f8: 119,
        f9: 120,
        f10: 121,
        f11: 122,
        f12: 123,
        equal: 187,
        '=': 187,
        comma: 188,
        ',': 188,
        minus: 189,
        '-': 189,
        period: 190,
        '.': 190
      },
      Sequence,
      NOOP = function NOOP() {
      },
      held = {};

  Sequence = function Sequence(str, next, fail, done) {
    var i;

    this.str = str;
    this.next = next ? next : NOOP;
    this.fail = fail ? fail : NOOP;
    this.done = done ? done : NOOP;

    this.seq = str.split(' ');
    this.keys = [];

    for (i = 0; i < this.seq.length; ++i) {
      this.keys.push(keys[this.seq[i]]);
    }

    this.idx = 0;
  };

  Sequence.prototype.keydown = function keydown(keyCode) {
    var i = this.idx;
    if (keyCode !== this.keys[i]) {
      if (i > 0) {
        this.reset();
        this.fail(this.str);
        goDebug.__fail(this.str);
      }
      return;
    }

    this.next(this.str, this.seq[i], i, this.seq);
    goDebug.__next(this.str, this.seq[i], i, this.seq);

    if (++this.idx === this.keys.length) {
      this.done(this.str);
      goDebug.__done(this.str);
      this.reset();
    }
  };

  Sequence.prototype.reset = function () {
    this.idx = 0;
  };

  goDebug = function goDebug(str, handlers) {
    var next, fail, done;

    if (!handlers) {
      handlers = {}
      done = handlers.done = function () {
        $("[cheetInfo]").each(function (index, element) {

          jQuery(element).tooltip({
            trigger: 'show',
            title: jQuery(element).attr('cheetInfo')
          }).tooltip('show')
        })
      }
    } else if (typeof handlers === 'function') {
      done = handlers;
    } else if (handlers !== null && handlers !== undefined) {
      next = handlers.next;
      fail = handlers.fail;
      done = handlers.done;
    }

    sequences[str] = new Sequence(str, next, fail, done);
  };

  goDebug.disable = function disable(str) {
    delete sequences[str];
  };

  function keydown(e) {
    var id,
        k = e ? e.keyCode : event.keyCode;

    if (held[k]) return;
    held[k] = true;

    for (id in sequences) {
      sequences[id].keydown(k);
    }
  }

  function keyup(e) {
    var k = e ? e.keyCode : event.keyCode;
    held[k] = false;
  }

  function resetHeldKeys(e) {
    var k;
    for (k in held) {
      held[k] = false;
    }
  }

  function on(obj, type, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(type, fn, false);
    } else if (obj.attachEvent) {
      obj['e' + type + fn] = fn;
      obj[type + fn] = function () {
        obj['e' + type + fn](window.event);
      };
      obj.attachEvent('on' + type, obj[type + fn]);
    }
  }

  on(window, 'keydown', keydown);
  on(window, 'keyup', keyup);
  on(window, 'blur', resetHeldKeys);
  on(window, 'focus', resetHeldKeys);

  goDebug.__next = NOOP;
  goDebug.next = function next(fn) {
    goDebug.__next = fn === null ? NOOP : fn;
  };

  goDebug.__fail = NOOP;
  goDebug.fail = function fail(fn) {
    goDebug.__fail = fn === null ? NOOP : fn;
  };

  goDebug.__done = NOOP;
  goDebug.done = function done(fn) {
    goDebug.__done = fn === null ? NOOP : fn;
  };

  goDebug.reset = function reset(id) {
    var seq = sequences[id];
    if (!(seq instanceof Sequence)) {
      console.warn('goDebug: Unknown sequence: ' + id);
      return;
    }

    seq.reset();
  };

  global.goDebug = goDebug
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return goDebug;
    });
  } else if (typeof module !== 'undefined' && module !== null) {
    module.exports = goDebug;
  }

})(this);
