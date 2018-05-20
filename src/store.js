/**
 * Module which contains current state. Now is used to store car positions
 * Should not be used directly, only via TaxiDispatcher instance
 * @type {{get, set}}
 */
module.exports = (function(){
  let store = {};

  return {
    get(key) {
      return store[key];
    },
    set(key, value) {
      store[key] = value;
    },
    push(key, value) {
      if (Array.isArray(store[key])) {
        store[key].push(value);
      }
    },
    update(key, id, obj) {
      if (Array.isArray(store[key])) {
        const index = store[key]
          .findIndex(el => el._id.toString() === id.toString());
        store[key][index] = {...store[key][index], ...obj};
      }
    }
  }
})();