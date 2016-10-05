// support driver for a jhd1313m1 in Javascript
// 
// This is intended to demonstrate programming the i2c buss from
// javascript
//
// It is not intended to be used in place of the upm driver

// configure jshint
/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

var Q = require('q');

/** 
 * various constants for the lcd interface
 * not all of these are used below but are 
 * made available for convenience in your
 * changes
 */
lcd = {
    lcdAddress:0x3E,
    rgbAddress:0x62,
    clearDisplay: 0x01,
    returnHome: 0x02,
    entryModeSet: 0x04,
    displayControl: 0x08,
    cursorShift: 0x10,
    functionSet: 0x20,
    data: 0x40,
    cmd: 0x80,

    backLight: 0x08,
    noBackLight: 0x00,

    // flags for display entry mode
    entryRight: 0x00,
    entryLeft: 0x02,
    entryShiftIncrement: 0x01,
    entryShiftDecrement: 0x00,

    // flags for display on/off control
    displayOn: 0x04,
    displayOff: 0x00,
    cursorOn: 0x02,
    cursorOff: 0x00,
    blinkOn: 0x01,
    blinkOff: 0x00,

    // flags for display/cursor shift
    displayMove: 0x08,
    moveRight: 0x04,
    moveLeft: 0x00,

    // flags for function set
    eightBitMode: 0x10,
    fourBitMode: 0x00,
    twoLine: 0x08,
    oneLine: 0x00,
    fiveByTenDots: 0x04,
    fiveByEightDots: 0x00,

    // flags for CGRAM
    setCgRamAddr: 0x40,

    enable: 0x04, // Enable bit
    readWrite: 0x02, // Read/Write bit
    registerSelect: 0x01, // Register select bit

    regRed: 4,
    regGreen: 3,
    regBlue: 2
};

exports.lcd = lcd;
var mraa = require('mraa');

exports.LCD = function(bus) {
    this._bus = bus;
    this._lcdBuss = new mraa.I2c(bus);
    this._lcdBuss.address(lcd.lcdAddress);
    this._rgbBuss = new mraa.I2c(bus);
    this._rgbBuss.address(lcd.rgbAddress);
    this._queue = []; // make this raffle its own class
    this._error = null;
    this._busy = false;
    this._defer = null;
    this.i2Cmd (lcd.functionSet | lcd.twoLine);
    this.wait(4500);
    this.i2Cmd (lcd.functionSet | lcd.twoLine);
    this.wait(4500);
    this.i2Cmd (lcd.functionSet | lcd.twoLine);
    this.wait(4500);
    this.i2Cmd (lcd.functionSet | lcd.twoLine);

    this.i2Cmd (lcd.displayControl | lcd.displayOn);
    this.i2Cmd (lcd.clearDisplay);
    this.wait(4500);

    this.i2Cmd (lcd.entryModeSet | lcd.entryLeft | lcd.entryShiftDecrement);

    this.i2cReg (0, 0, true);
    this.i2cReg (1, 0, true);
    this.i2cReg (0x08, 0xAA, true);
    this.setColor(255, 255, 255);
};

exports.LCD.prototype = {

    /** internal commands */
    /**
     * exec the items on the queue
     * terminates when queue is empty or an error occurs
     *
     */
    _exec: function() {
        var self = this;
        function setError(reason) {
            self._error = reason;
            if (self._defer) {
              self._defer.reject(self._error);
              self._defer = null;
            }
            self._busy = false;
        }

        function reexec() {
            self._busy = false;
            self._exec();
        }

        if (this._queue.length === 0) {
            this._busy = false; // needed if last thing we do is a wait
            return;
        }
        if (this._error || this._busy) {
            return;
        }
        this._busy = true;
        var status;
        
        while (this._queue.length > 0) {
            next = this._queue.shift();
            if (next.wait) {
              setTimeout(reexec, (next.wait / 1000));
              return;
            }
            if (next.func) {
              try {
                status = next.func.apply(next.thisptr, next.arguments);
                if (typeof next.success !== 'undefined' && status !== next.success) {
                  setError('error code ' + status + ' on ' + next.func.toString());
                  return;
                }
              }
              catch (e) {
                setError('error ' + ' on ' + next.func.toString());
                return;
              }
            }
        }
        // if we get here the queue is empty and we are not waiting
        this._busy = false;
        if (this._defer) {
            this._defer.resolve();
            this._defer = null;
        }
    },

    /**
     * queue an operation 
     *
     * @param {function} func - function to call
     * @param {object} thisptr  - this for function
     * @param {array} arguments
     * @param {number} [ok] - expected (no error) return status 
     *                          default - not checked
     */
    queue: function(func, thisptr, args, ok) {
        this._queue.push({func:thisptr[func], thisptr: thisptr, arguments:args, success:ok, title:func});
        this._exec();
    }, 

    /**
     * queue a wait for the given time
     * @param {number} - time to wait in microseconds
     */
    wait: function(time) {
        this._queue.push({wait: time});
        this._exec(); 
    },

    /**
     * wait for the device to be quiescent
     *
     * you can issue a whole series of commands but
     * they won't happen immediately - they are queued
     *
     * @return {promise} - a promise that is fulfilled on completion or 
     *  rejected on error
     */
    waitForQuiescent: function () {
        if (!this._busy) {
            if (this._error) {
              return Q.reject(this._error);
            }
            return new Q(true);  // we are done and no error
        }
        if (!this._defer) {
            this._defer = Q.defer();
        }
        return this._defer.promise;
    },

    /**
     * Clear any error condition
     *
     * @param {boolean} [resume] if true, continue with execution of remaining
     *       commands in queue 
     *       default = clear the queue
     */
    clearError : function(resume) {
        this._error = null;
        if (!resume) {
            this._queue = [];
        }
        else {
            this._exec();
        }
    },

    /**
     * write a string to the display
     *
     * @param {number} row - row to write to
     * @param {number} col - column to write to
     * @param {string} string - string to write
     *
     * @return {Nnumber} - status of write
     */
    write: function(str) {
        this.wait(1000);
        for (var i = 0; i < str.length; i ++) {
            this.i2cReg(lcd.data, str.charCodeAt(i));
        }
    },

    /**
     * set cursor position
     *
     * @param {number} row
     * @param {number} col
     */
    setCursor: function(row, col) {
        if (row < 0) row = 0;
        if (row > 1) row = 1;
        if (col < 0) col = 0;
        if (col > 15)col = 15;
        this.i2Cmd(col + 0x80 + (row << 6));
    },
    /**
     * Set backlight color
     *
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    setColor: function(red, green, blue) {
        this.queue('writeReg', this._rgbBuss, [lcd.regRed, red], mraa.MRAA_SUCCESS);
        this.queue('writeReg', this._rgbBuss, [lcd.regGreen, green], mraa.MRAA_SUCCESS);
        this.queue('writeReg', this._rgbBuss, [lcd.regBlue, blue], mraa.MRAA_SUCCESS);
    },
    /**
     * Write a register
     *
     * @param {number} - register to write
     * @param {number} - value to write
     * @param {boolean} [rgb] - true if use rgb buss
     */
    i2cReg: function(reg, val, rgb) {
        var buf = new Buffer(2);
        var buss = this._lcdBuss;
        if (rgb) {
            buss = this._rgbBuss;
        }

        buf[0] = reg;
        buf[1] = val;
        this.queue('write', buss, [buf], mraa.MRAA_SUCCESS);
    },
    /**
     * Write a command
     *
     * @param {number} - command to write
     * @param {boolean} [rgb] - true if use rgb buss
     */
    i2Cmd: function(cmd, rgb) {
        this.i2cReg(lcd.cmd, cmd, rgb);
    }

};
