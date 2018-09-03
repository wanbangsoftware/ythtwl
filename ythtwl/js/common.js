// JavaScript source code
// �ж��ַ����Ƿ�Ϊ��
function isStringNull(string) {
    return typeof (string) === "undefined" || string == null || string == "";
}
/*
    ��ʾ��ʾ��Ϣ
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
    ��ʾ��ʾ��Ϣ����ʾȷ�ϰ�ť
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
                // �����ȷ����ť֮����Զ�̴��������رձ�����
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