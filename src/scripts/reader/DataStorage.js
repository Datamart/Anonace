/**
 * @fileoverview Simple implementation of data storage.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 *
 * @requires dom.DataStorage
 * @requires util.Array
 */



/**
 * @param {string} key The storage key.
 * @constructor
 */
reader.DataStorage = function(key) {

  /**
   * @return {!Object.<string, number>} Return list of saved data items.
   */
  this.get = function() {
    var data = storage_.get(key) || {};

    if (util.Array.isArray(data)) {
      data = update_(data, {}, 1);
    }

    return /** @type {!Object.<string, number>} */ (data);
  };

  this.set = function(data) {
    storage_.set(key, data);
  };

  /**
   * @param {!Array.<string>} data The data items to update.
   * @param {boolean} enabled True for enabled data items, false otherwise.
   */
  this.update = function(data, enabled) {
    update_(data, self_.get(), +enabled);
  };

  /**
   * @param {!Array.<string>} data List of data items to remove.
   */
  this.remove = function(data) {
    /** @type {!Object.<string, number>} */ var unique = self_.get();
    /** @type {number} */ var length = data.length;

    for (; length--;) {
      delete unique[data[length]];
    }

    self_.set(unique);
  };

  function update_(data, unique, enabled) {
    /** @type {number} */ var length = data.length;

    for (; length--;) {
      unique[data[length]] = enabled;
    }

    self_.set(unique);
    return unique;
  }

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @type {!reader.DataStorage}
   * @private
   */
  var self_ = this;

  /**
   * @type {!dom.DataStorage}
   * @private
   */
  var storage_ = new dom.DataStorage;
};
