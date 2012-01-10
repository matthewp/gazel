/// <reference path="gazel.js"/>

(function () {
    'use strict';

    var exists = function (obj) {
        return typeof obj !== "undefined" && obj != null;
    };

    var client = gazel;
    client.on("error", function (e) {
        ok(false, "Failed.");
        start();
    });

    asyncTest("Testing chaining.", function () {
        expect(3);
        var t = "inctest";

        client.multi()
            .set(t, 5)
            .incr(t, 1)
            .incr(t, 100)
            .get(t)
            .exec(function (results) {
                var result1 = results[1][0];
                var result2 = results[2][0];
                var result3 = results[3][0];
                ok(result1 === 6, "First increment should be to 6.");
                ok(result2 === 106, "Second increment should be to 106.");
                ok(result3 === 106, "Getting the value should be at 106.");
            });
    });
})();