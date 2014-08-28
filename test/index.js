var test = require('tape');
var sync = require('../ampersand-sync-jsonp');
var Model = require('ampersand-model');

function getStub(data) {
    return {
        url: '/',
        trigger: function () {
            // capture args for comparison
            this.args = arguments;
        },
        toJSON: function () {
            return data || {};
        }
    };
}

test('creates `window.__jsonp`', function (t) {
    t.plan(1);
    sync('read', getStub());
    t.ok(window.__jsonp, '`window.__jsonp` exists');
});

test('returns object describing request', function (t) {
    t.plan(4);
    var request = sync('read', getStub());
    t.equal(typeof request, 'object');
    t.equal(typeof request.cleanup, 'function')
    t.equal(request.script.nodeName, 'SCRIPT');
    t.equal(request.id.lastIndexOf('jsonp_'), 0)
});

test('injects script tag into head tag', function (t) {
    t.plan(2);
    var request = sync('read', getStub());
    var script = document.getElementById(request.id);
    t.ok(script, 'script in document');
    t.equal(script, request.script);
});

test('triggers `request` event on Model', function (t) {
    t.plan(4);
    var Me = Model.extend({ url: '/', sync: sync });
    var m = new Me();
    m.on('request', function (model, script, options) {
      t.equal(model, m)
      t.equal(script.nodeName, 'SCRIPT')
      t.equal(options.url, '/')
      t.equal(options.id.lastIndexOf('jsonp_'), 0)
      t.end();
    });
    sync('read', m);
});

test('throws urlError', function (t) {
    t.throws(function () {
        sync('read', {});
    }, Error);
    t.end();
});
