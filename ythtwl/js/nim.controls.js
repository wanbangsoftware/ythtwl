// 云信发送消息的方法
function sendNimMessage(license, latitude, longitude, begin, times, driver) {
    var currTime = parseInt(new Date().getTime() / 1000).toString();
    var nonce = md5(currTime);
    var security = "a25139de838c";
    var sum = sha1(security + nonce + currTime);

    var fdata = {
        'fromAccid': 'service', "toAccids": '["development", "boss_user"]',// "to": "development",
        'attach': '{"id":' + currTime + ',"license":"' + license + '","latitude":' + latitude + ',"longitude":' + longitude + ',"begin":"' + begin +
        '","times":' + times + ',"status":1,"name1":"' + (null == driver ? "王撕葱" : driver.name1) +
        '","phone1":"' + (null == driver ? "13999999999" : driver.phone1) + '","name2":"' + (null == driver ? "王健林" : driver.name2) +
        '","phone2":"' + (null == driver ? "13999999998" : driver.phone2) + '"}'
    };

    $.ajax({
        type: "POST",
        url: "https://api.netease.im/nimserver/msg/sendBatchAttachMsg.action",//"https://api.netease.im/nimserver/msg/sendAttachMsg.action",
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