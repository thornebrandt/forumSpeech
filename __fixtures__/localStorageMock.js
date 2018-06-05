export default (function() {
  let store = {};
  return {
    getItem: key => {
      return store[key] || null;
    },
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    getStore: () => {
      return store;
    }
  }
})();