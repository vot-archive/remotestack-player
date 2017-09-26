/**
* Simple JSON storage model
*/
var _ = require('lodash');
var fse = require('fs-extra');
var path = require('path');
var EventEmitter = require('events');

function BaseModelJSON(location, opts) {
  // console.log('BaseModelJSON location:', location);
  this.location = path.resolve(location);
  opts = opts || {};
  opts.events = (opts.events !== false);

  this.eventEmitter = new EventEmitter();
  this.eventEmitter.setMaxListeners(2);

  var _self = this;

  this.helpers = {
    readSync: function () {
      var rtn;

      try {
        var file = fse.readJSONSync(_self.location);
        rtn = file;
      } catch (e) {
        // console.log(e);
        rtn = {};
      }

      return rtn;
    },
    writeSync: function (data) {
      data = data || {};

      data = JSON.stringify(data, null, 2);
      fse.ensureFileSync(_self.location); // ? really?
      fse.outputFileSync(_self.location, data);

      return true;
    }
  };

  /**
  * Returns location of the file used in the model.
  * You only set it when instantiating a model.
  */
  this.getLocation = function getLocation () {
    return _self.location;
  };

  /**
   * Gets data by key
   *
   * @param {String} key Specifies the key to fetch
   * @param {String} fallback (optional) Fallback value if key is not defined
   */
  this.get = function get(key, fallback) {
    var data = this.helpers.readSync();
    if (!key || !key.length) {
      return data;
    }

    return _.get(data, key, fallback);
  };

  /**
   * Sets data at key
   *
   * @param {String} key Key to store the data in
   * @param {String} value Value to store
   */
  this.set = function get(key, value) {
    var data = this.helpers.readSync();
    var updatedData = _.set(data, key, value);
    this.helpers.writeSync(updatedData);
    this.emit(key);
    return true;
  };

  /**
   * Finds data
   *
   * @param {Object} query Specifies the predicate
   */
  this.find = function find(query) {
    var data = this.get();

    return _.find(data, query);
  };


  /**
   * Event listener and emitter
   *
   * @param {String} e Event name
   * @param {String} handler Handler function to trigger on event
   */
  this.on = function eventOn(e, handler) {
    if (opts.events) {
      return this.eventEmitter.on(e, handler);
    } else {
      return;
    }
  };

  this.once = function eventOnce(e, handler) {
    if (opts.events) {
      return this.eventEmitter.once(e, handler);
    } else {
      return;
    }
  };

  this.removeAllListeners = function eventRemoveListeners(e) {
    if (opts.events) {
      return this.eventEmitter.removeAllListeners(e);
    } else {
      return;
    }
  };

  this.emit = function eventEmit(e) {
    if (opts.events) {
      return this.eventEmitter.emit(e);
    } else {
      return;
    }
  };
}


module.exports = BaseModelJSON;
