// JavaScript source code
//importScripts("jquery-3.2.1.js");

var getTimestamp = function (time) {
    if (typeof time === "string") {
        return new Date(Date.parse(time.replace(/-/g, "/"))).getTime() / 1000;
    } else {
        return (new Date(time).toLocaleString('chinese', { hour12: false }).replace(/Äê|ÔÂ/g, "-").replace(/ÈÕ/g, " ").replace(/[\/]/g, "-"));
    }
};

var getTrace = function (time, traces) {
    var trace = null;
    for (var i in traces) {
        if (traces[i].RecvTime == time) {
            trace = traces[i];
            break;
        }
    }
    return trace;
}

onmessage = function (evt) {
    var data = evt.data;
    var begin = data.begin, end = data.end;
    var trace = data.trace;
    var arr = [];
    var timestamp, lastSpeed = 0.0, cnt = 0;
    for (var i = begin; i <= end; i++) {
        timestamp = getTimestamp(i * 1000);
        var seek = getTrace(timestamp, trace);
        if (null != seek) {
            lastSpeed = seek.Speed / 10;
        }
        arr.push([i, lastSpeed]);
        postMessage(++cnt);
    }
    postMessage(arr);
};