gazel.multi = function () {
    // Let gazel know that we are in a multi.
    gazel._multi = true;
    return gazel;
};

gazel.exec = function (complete) {
    // Finalize the execution stack.
    gazel._queue.complete = complete;
    gazel._queue.flush();
};
