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
            if ("undefined" != typeof (clicked)) {
                clicked();
            }
        }
    });
}
/*
    ��ʾ��ʾ��Ϣ����ʾȷ�ϰ�ť
*/
function confirmDialog(title, text, confirmed, canceled) {
    BootstrapDialog.show({
        title: title,
        message: text,
        buttons: [{
            icon: "glyphicon glyphicon-ok-circle",
            label: "OK",
            cssClass: "btn-warning",
            action: function (dialogItself) {
                // �����ȷ����ť֮����Զ�̴��������رձ�����
                dialogItself.close();
                if ("undefined" != typeof (confirmed)) {
                    confirmed();
                }
            }
        }, {
            label: "Cancel", icon: "glyphicon glyphicon-ban-circle",
            action: function (dialogItself) {
                dialogItself.close();
                if ("undefined" != typeof (canceled)) {
                    canceled();
                }
            }
        }]
    });
}