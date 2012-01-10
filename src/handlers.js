function complete(func, params) {
    if (exists(func) && typeof func === "function") {
        func.apply(null, params);
    }
};

function error(e) {
    gazel._events.forEach(function (action) {
        action(e);
    });
};
