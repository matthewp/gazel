function complete(func, params, context) {
  if (exists(func) && typeof func === "function") {
    func.apply(context || null, params);
  }
};

function error() { }
