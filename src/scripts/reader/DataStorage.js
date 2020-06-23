/**
 * @fileoverview Simple implementation of data storage.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 *
 * @requires dom.DataStorage
 */



/**
 * @param {string} key The storage key.
 * @constructor
 */
reader.DataStorage = function(key) {

  /**
   * @return {!Object<string, number>} Return list of saved data items.
   */
  this.get = () => {
    let data = storage_.get(key) || {};

    if (Array.isArray(data)) {
      // For backward compatibility.
      data = update_(data, {}, 1);
    }

    return /** @type {!Object<string, number>} */ (data);
  };

  this.set = (data) => {
    storage_.set(key, data);
  };

  /**
   * @param {!Array<string>} data The data items to update.
   * @param {boolean} enabled True for enabled data items, false otherwise.
   */
  this.update = (data, enabled) => {
    update_(data, self_.get(), +enabled);
  };

  /**
   * @param {!Array<string>} data List of data items to remove.
   */
  this.remove = (data) => {
    const /** !Object<string, number> */ unique = self_.get();
    let /** number */ length = data.length;

    for (; length--;) {
      delete unique[data[length]];
    }

    self_.set(unique);
  };

  const update_ = (data, unique, enabled) => {
    let /** number */ length = data.length;

    for (; length--;) {
      unique[data[length]] = enabled;
    }

    self_.set(unique);
    return unique;
  };

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @private {!reader.DataStorage}
   */
  const self_ = this;

  /**
   * @private {!dom.DataStorage}
   */
  const storage_ = new dom.DataStorage;
};
