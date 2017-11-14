// 云信发送消息的方法
function sendNimMessage(license, latitude, longitude, begin, times) {
    var currTime = parseInt(new Date().getTime() / 1000).toString();
    var nonce = md5(currTime);
    var security = "a25139de838c";
    var sum = sha1(security + nonce + currTime);

    var fdata = {
        'from': 'service', "msgtype": 0, "to": "development",
        'attach': '{"id":' + currTime + ',"license":"' + license + '","latitude":' + latitude + ',"longitude":' + longitude + ',"begin":"' + begin + '","times":' + times + ',"status":1}'
    };

    $.ajax({
        type: "POST",
        url: "https://api.netease.im/nimserver/msg/sendAttachMsg.action",
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
            console.debug("NIM success:" + JSON.stringify(data));
        },
        error: function (data) {
            console.debug("NIM failed:" + JSON.stringify(data));
        }
    });
}