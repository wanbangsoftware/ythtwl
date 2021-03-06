// JavaScript source code
// 判断字符串是否为空
function isStringNull(string) {
    return typeof (string) === "undefined" || string == null || string == "";
}
/*
    显示提示信息
*/
function showDialog(title, text, clicked) {
    BootstrapDialog.show({
        title: title,
        message: text,
        buttons: [{
            label: "OK",
            cssClass: "btn-primary",
            action: function (dialogItself) {
                dialogItself.close();
            }
        }],
        onhidden: function (dialogItself) {
            if ("function" === typeof (clicked)) {
                clicked();
            }
        }
    });
}
/*
    显示提示信息并显示确认按钮
*/
function confirmDialog(title, text, confirmText, cancelText, confirmed, canceled) {
    BootstrapDialog.show({
        title: title,
        message: text,
        buttons: [{
            //icon: "glyphicon glyphicon-ok",
            label: confirmText,
            cssClass: "btn-primary",
            action: function (dialogItself) {
                // 点击了确定按钮之后发起远程处理方法并关闭本窗口
                dialogItself.close();
                if ("function" === typeof (confirmed)) {
                    confirmed();
                }
            }
        }, {
            label: cancelText,
            //icon: "glyphicon glyphicon-remove",
            action: function (dialogItself) {
                dialogItself.close();
                if ("function" === typeof (canceled)) {
                    canceled();
                }
            }
        }]
    });
}