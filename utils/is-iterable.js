module.exports = (object) => {
  if (object == null) {
    return false;
  }
  return typeof object[Symbol.iterator] === 'function';
};
