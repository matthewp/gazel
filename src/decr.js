export function decrby(key, increment, callback) {
  return this.incrby(key, -increment, callback);
};

export function decr(key, callback) {
  return this.incrby(key, -1, callback);
};
