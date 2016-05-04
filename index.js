var request = require('request');
var zlib = require('zlib');

module.exports = function(opts) {
    opts = opts || {};
    var mode = {};
    var baseUrl = 'https://modeanalytics.com/api/'
    var _auth = {};
    _auth.user = process.env.MODEJS_USERNAME || opts.username;
    _auth.pass = process.env.MODEJS_TOKEN || opts.token;
    var org =  process.env.MODEJS_ORG || opts.org || _auth.user;
    if(!_auth.user || !_auth.pass) throw new Error('Username or token not set');

    mode.reports = function(params, cb) {
        if (typeof params === 'function') cb = params;
        var reportOrg = params.org || org;

        request({
            url: baseUrl + reportOrg + '/reports',
            auth: _auth,
            json: true
        }, function(err, resp, body){
            if(err) return cb(err);
            return cb(null, body);
        });
    };

    mode.report = function(params, cb) {
        if (typeof params.reportId !== 'string' ) throw new Error('reportId must be a string');
        var reportOrg = params.org || org;

        request({
            url: baseUrl + reportOrg + '/reports/' + params.reportId,
            auth: _auth,
            json: true
        }, function(err, resp, body){
            if(err) return cb(err);
            return cb(null, body);
        });
    };

    // get the data from the most recent run of a report.
    mode.reportData = function(params, cb) {
        if (typeof params.reportId !== 'string' ) throw new Error('reportId must be a string');

        mode.reportRuns(params, function(err, runs) {
            if(err) return cb(err);
            params.runId = runs._embedded.report_runs[0].token;
            mode.reportRunData(params, function(err, data) {
                if(err) return cb(err);
                return cb(null, data);
            });
        });
    };

    // list of runs of a report
    mode.reportRuns = function(params, cb) {
        if (typeof params.reportId !== 'string' ) throw new Error('reportId must be a string');
        var reportOrg = params.org || org;

        request({
            url: baseUrl + reportOrg + '/reports/' + params.reportId + '/runs',
            auth: _auth,
            json: true
        }, function(err, resp, body){
            if(err) return cb(err);
            return cb(null, body);
        });
    };

    mode.reportRun = function(params, cb) {
        if (typeof params.reportId !== 'string' ) throw new Error('reportId must be a string');
        if (typeof params.runId !== 'string' ) throw new Error('runId must be a string');
        var reportOrg = params.org || org;

        request({
            url: baseUrl + reportOrg + '/reports/' + params.reportId + '/' + params.runId,
            auth: _auth,
            json: true
        }, function(err, resp, body){
            if(err) return cb(err);
            return cb(null, body);
        });

    };


    mode.reportRunData = function(params, cb) {
        if (typeof params.reportId !== 'string' ) throw new Error('reportId must be a string');
        if (typeof params.runId !== 'string' ) throw new Error('runId must be a string');
        var reportOrg = params.org || org;

        request({
            url: baseUrl + reportOrg + '/reports/' + params.reportId + '/runs/' + params.runId + '/query_runs',
            auth: _auth,
            json: true,

        }, function(err, resp, body) {

            request({
                url: baseUrl + reportOrg + '/reports/' + params.reportId + '/runs/' + params.runId + '/query_runs/'+body._embedded.query_runs[0].token + '/results',
                auth: _auth,
                json: true,

            }, function(err, resp, body) {
                if(err) return cb(err);
                request({
                    uri: body._links.json.href,
                    gzip:true
                }, function(err, resp2, body2){
                    if(err) return cb(err);
                    return cb(null, JSON.parse(body2));
                });
            });
        });
    }
    return mode;

};
