export function discard(callback) {
  try {
    this.trans.abortAll();

    (callback || function(){})('OK');
  } catch(err) {
    this.handleError(err);
  }
};
