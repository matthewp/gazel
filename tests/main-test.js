/// <reference path="gazel.js"/>

(function () {
    'use strict';

    var ACCEPTABLE_SPEED = 20;

    var _exists = function (obj) {
        return typeof obj !== "undefined" && obj != null;
    };

    var client = Gazel.create();
    client.on("error", function (e) {
        ok(false, "Failed.");
        start();
    });

    test("First test", function () {

        expect(1);

        ok(1 === 1, "this test is fine.");

    });

    test("Testing reference correct.", function () {
        expect(1);

        ok(_exists(Gazel), "gazel object exists.");
    });

    asyncTest("Testing normal set.", function () {
        expect(1);

        client.set("foo", "bar", function () {
            ok(true, "Passed.");
            start();
        });
    });

    asyncTest("Testing normal get.", function () {
        expect(1);

        client.get("foo", function (val) {
            strictEqual(val, "bar", "Bar is bar.");
            start();
        });
    });

    asyncTest("Test get speed.", function () {
        var before, after;

        expect(2);

        before = new Date();
        client.get("foo", function (val) {
            after = new Date();
            var diff = after - before;
            notEqual(before, after, "If the dates are the same something went wrong.");
            ok(diff < ACCEPTABLE_SPEED,
                "The difference between the times should be less than 10 milliseconds. Diff is " + diff);
            start();
        });
    });

    //    asyncTest("Test set speed.", function () {
    //        var before, after;
    //        expect(1);

    //        before = new Date();
    //        client.set("foo2", "bar", function () {
    //            after = new Date();
    //            var diff = after - before;
    //            ok(diff < ACCEPTABLE_SPEED, "A set should take less than 10 milliseconds.");
    //        });
    //    });
})();
