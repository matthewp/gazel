/// <reference path="gazel.js"/>

var _exists = function(obj) {
    return typeof obj !== "undefined" && obj !== null;
};

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

    gazel.set("foo", "bar", function () {
        ok(true, "Passed.");
        start();
    }, function () {
        ok(false, "Failed.");
        start();
    });

});

asyncTest("Testing normal get.", function () {
    expect(1);

    gazel.get("foo", function (val) {
        strictEquals(val, "bar", "Bar is bar.");
        start();
    }, function () {
        ok(false, "Error callback.");
        start();
    });

});