/// <reference path="gazel.js"/>

var _exists = function(obj) {
    return typeof obj !== "undefined" && obj !== null;
};

var client = gazel.create();

test("First test", function () {

    expect(1);

    ok(1 === 1, "this test is fine.");

});

test("Testing reference correct.", function () {
    expect(1);

    ok(_exists(gazel), "gazel object exists.");
});

asyncTest("Testing normal set.", function () {
    expect(1);

    client.on("error", function (e) {
        ok(false, "Failed.");
        start();
    });

    client.set("foo", "bar", function () {
        ok(true, "Passed.");
        start();
    });

});

//asyncTest("Testing normal get.", function () {
//    expect(1);

//    gazel.get("foo", function (val) {
//        strictEqual(val, "bar", "Bar is bar.");
//        start();
//    }, function () {
//        ok(false, "Error callback.");
//        start();
//    });
//});

//asyncTest("Test get speed.", function () {
//    var before, after;

//    expect(2);

//    var onsuccess = function (val) {
//        after = new Date();
//        var diff = after - before;
//        notEqual(before, after, "If the dates are the same something went wrong.");
//        ok(diff < 10, "The difference between the times should be less than 10 milliseconds");
//        start();
//    };
//    var onerror = function (e) {
//        ok(false, e);
//        start();
//    };

//    before = new Date();
//    gazel.get("foo", onsuccess, onerror);
//});

//asyncTest("Test set speed.", function () {
//    var before, after;
//    expect(1);

//    var onsuccess = function () {
//        after = new Date();
//        var diff = after - before;
//        ok(diff < 10, "A set should take less than 10 milliseconds.");
//    };
//    var onerror = function () {
//        ok(false, e);
//    };

//    before = new Date();
//    gazel.set("foo", "bar", onsuccess, onerror);
//});