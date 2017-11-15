// nimÏûÏ¢·¢ËÍ²âÊÔ
$(document).ready(function () {
    $("#nimTesting").click(function () {
        $(".modal").modal('show');
        //var nonce = parseInt(new Date().getTime() / 1000).toString();
        //var security = "a25139de838c";
        //var sum = sha1(security + nonce + nonce);
        //var header = { 'AppKey': security, 'Nonce': nonce, 'CurTime': nonce, 'CheckSum': sum };

        //var formData = new FormData();
        //formData.append("from", "service");
        //formData.append("msgtype", 0);
        //formData.append("to", "development");
        //formData.append('attach', '{"id":1510628703,"license":"Â³F085P6","latitude":0.0,"longitude":0.0,"status":2}');

        //var fdata = {
        //    'from': 'service', "msgtype": 0, "to": "development",
        //    'attach': '{"id":1510628703,"license":"Â³F085P6","latitude":0.0,"longitude":0.0,"status":2}'
        //};

        //$.ajax({
        //    type: "POST",
        //    url: "https://api.netease.im/nimserver/msg/sendAttachMsg.action",
        //    data: fdata,
        //    dataType: "json",
        //    contentType: "application/x-www-form-urlencoded;charset=utf-8;",
        //    headers: {
        //        'AppKey': '7bbb13532d45034018cc107aa20679f1',
        //        'Nonce': nonce,
        //        'CurTime': nonce,
        //        'CheckSum': sum
        //    },
        //    success: function (data) {
        //        if (data) {
        //        }
        //    },
        //    error: function (data) {
        //        if (data) { }
        //    }
        //});
    });
});