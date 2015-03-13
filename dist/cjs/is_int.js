/*gazel@1.0.0#is_int*/
'use strict';
module.exports = function (n) {
    return !isNaN(n) && n % 1 === 0;
};
