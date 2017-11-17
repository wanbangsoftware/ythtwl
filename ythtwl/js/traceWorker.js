// JavaScript source code
//importScripts("jquery-3.2.1.js");

var getTimestamp = function (time) {
    if (typeof time === "string") {
        return new Date(Date.parse(time.replace(/-/g, "/"))).getTime() / 1000;
    } else {
        return (new Date(time).toLocaleString('chinese', { hour12: false }).replace(/年|月/g, "-").replace(/日/g, " ").replace(/[\/]/g, "-"));
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

var begin, end, trace;
onmessage = function (evt) {
    var data = evt.data;
    if (typeof data === "object") {
        begin = data.begin;
        end = data.end;
        trace = data.trace;
    } else if (typeof data === "number"){
        var arr = [];
        var timestamp, timestampNext;
        for (var i = begin; i <= end; i++) {
            arr.push({ x: i, y: 0.0 });
        }
        for (var i = 0; i < trace.length; i++) {
            timestamp = getTimestamp(trace[i].RecvTime);
            if (i + 1 < trace.length) {
                timestampNext = getTimestamp(trace[i + 1].RecvTime);
            } else {
                timestampNext = timestamp;
            }
            // 填充车速
            for (var j = timestamp; j < timestampNext; j++) {
                arr[j - begin].y = trace[i].Speed / 10;
            }
            postMessage([i + 1, arr.length]);
        }
        postMessage(arr);
    }
};