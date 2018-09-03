// 云信发送消息的方法
function sendNimMessage(truck) {
    var currTime = parseInt(new Date().getTime() / 1000).toString();
    var nonce = md5(currTime);
    var security = "a25139de838c";
    var sum = sha1(security + nonce + currTime);

    var points = new Array();
    // 同时最大只能发送最新的45个停车点
    var start = 0, max = truck.points.length;
    if (max >= 45) {
        start = truck.points.length - 45;
    }
    for (var i = start; i < max; i++) {
        var point = truck.points[i];
        var stop = {};
        stop.lng = point.pos.lng;
        stop.lat = point.pos.lat;
        stop.stop = getTimestamp(point.StopTime);
        stop.restart = getTimestamp(point.RestartTime);
        stop.len = point.stoppingTime;
        points.push(stop);
    }
    var stopp = JSON.stringify(points);
    var fdata = {
        // 'from': 'service', "msgtype": "0", "to": "development",
        'fromAccid': 'service',
        "toAccids": '["development", "boss_user", "admin1", "admin2"]',
        'attach': '{"id":' + currTime + ',"license":"' + truck.license + '","latitude":' + truck.lat + ',"longitude":' + truck.lng + ',"begin":"' + truck.stay +
            '","times":' + truck.stayLength + ',"status":1,"name1":"' + truck.name1 +
            '","phone1":"' + truck.phone1 + '","name2":"' + truck.name2 +
            '","phone2":"' + truck.phone2 + '","points":' + stopp + '}'
    };

    $.ajax({
        type: "POST",
        url: "https://api.netease.im/nimserver/msg/sendBatchAttachMsg.action", //"https://api.netease.im/nimserver/msg/sendAttachMsg.action",
        data: fdata,
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=utf-8;",
        headers: {
            'AppKey': '7bbb13532d45034018cc107aa20679f1',
            'Nonce': nonce,
            'CurTime': currTime,
            'CheckSum': sum
        },
        success: function (data) {
            console.log("NIM success:" + JSON.stringify(data));
        },
        error: function (data) {
            console.log("NIM failed:" + JSON.stringify(data));
        }
    });
}
