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

test('returns `script` tag when called', function (t) {
    t.plan(1);
    var script = sync('read', getStub());
    t.equal(script.nodeName, 'SCRIPT')
});

// test('injects script tag into head tag', function (t) {
//     t.plan(1);
//     var script = sync('read', getStub());
//     document.getElementsByTagName('head')[0]
// });

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
