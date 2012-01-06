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
            expect(1);

            client.multi()
                .set("one", 1)
                .set("two", 2)
                .set("three", 3)
                .exec(function (result) {
                    ok(true, "Successfully chained.");
                    start();
                });
        });
})();