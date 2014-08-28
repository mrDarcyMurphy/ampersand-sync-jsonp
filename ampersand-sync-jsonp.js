'use strict';

var _ = require('underscore');
var qs = require('qs');

// Throw an error when a URL is needed, and none is supplied.
var urlError = function () {
    throw new Error('A "url" property or function must be specified');
};

// arguments match ampersand-sync's so this can be used as a drop-in replacement
module.exports = function (method, model, options) {

    var config = {
        params: {}
    };

    var id = _.uniqueId('jsonp_');

    var script = document.createElement('script');

    var params = qs.stringify(_.extend({
        callback: '__jsonp.' + id
    }, config.params));

    function cleanup() {
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
    }

    if (window.app) {
        config = app.jsonpConfig
    }

    if (!options) {
        options = {};
    }

    // May be able to take advantage of the method
    // to map that to different url options on the model
    // since we can't do JSON-P with anything other than "GET"s
    if (!options.url) {
        options.url = _.result(model, 'url') || urlError();
    }

    if (!config.baseUrl) {
        config.baseUrl = '';
    }

    if (!window.__jsonp) {
        window.__jsonp = {};
    }

    options.id = id;
    
    script.src = config.baseUrl + options.url + '?' + params;

    window.__jsonp[id] = (function(success){
        return function(resp) {
            cleanup();
            if (success) {
                return success(resp);
            }
        };
    })(options.success);

    document.getElementsByTagName('head')[0].appendChild(script);

    model.trigger('request', model, script, options);

    return script

};
