#!/usr/bin/env node

if(!process.env.MODEJS_USERNAME) return console.log('Environment var MODEJS_USERNAME must be set');
if(!process.env.MODEJS_TOKEN) return console.log('Environment var MODEJS_TOKEN must be set');

var mode = require('../')();

var command = process.argv[2];

if(!command) {
    return console.log('you must supply a command. valid commands: data, runs')
}

if(command === 'data') {
    var report =  process.argv[3];
    if(!report) return console.log('you must supply a report id')

    var params = {reportId: report};

    if(report.split('/').length === 2){
        params = {
            reportId: report.split('/')[1],
            org: report.split('/')[0]
        };
    }

    mode.reportData(params, function(err, data) {
        console.log(JSON.stringify(data));
    });
}

if(command === 'runs') {
    var report =  process.argv[3];
    if(!report) return console.log('you must supply a report id');

    var params = {reportId: report};
    if(report.split('/').length === 2){
        params = {
            reportId: report.split('/')[1],
            org: report.split('/')[0]
        };
    }

    mode.reportRuns(params, function(err, data) {
        data._embedded.report_runs.forEach(function(r) {
            console.log(r.token + ' ' + r.state, r.completed_at)
        });
    });
}
