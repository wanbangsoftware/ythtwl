// JavaScript source code

var trucks = new Array();
var seekTrucks = new Array();
var seekIndex = 0;

function initializeDatepicker() {
    if (isStringNull($("#statisticalDate").val())) {
        var date = new Date();
        $("#statisticalDate").val(date.pattern("yyyy-MM-dd"));
    }
    $("#statisticalDate").datepicker({
        format: "yyyy-mm-dd",
        weekStart: 0,
        autoclose: true
    });
}

function syncLoading(method, httpUrl, data, successed, faled) {
    $.ajax({
        type: method,
        url: httpUrl,
        async: false,
        data: data,
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.withCredentials = true;
        },
        crossDomain: true,
        success: function (data) {
            successed(data);
        },
        error: function (data) {
            faled(data);
            showDialog("��ʾ", data.responseText);
        }
    });
}

function loadingTrucks() {
    syncLoading("post", "http://www.zfbeidou.com/bds/monitor/getVehicleTree/", {}, function (data) {
        displayTrucksList(data[0]);
    }, function (data) {
        showDialog("��ʾ", data.responseText);
    });
}

var htmlTruck = '<tr>' +
    '                <td data-value="%id%" class="center" >%index%</td >' +
    '                <td>%license%</td>' +
    '                <td>%online%</td>' +
    '                <td>%speed% km/h</td>' +
    '                <td>%direct%��</td>' +
    '                <td>%alarm%</td>' +
    '                <td>%lon%</td>' +
    '                <td>%lat%</td>' +
    '                <td class="overflow">%address%</td>' +
    '                <td></td>' +
    '            </tr >';
function displayTrucksList(data) {
    if (data.hasOwnProperty("children") && data.children.length > 0) {
        $("table tbody:eq(0)").html("");
        $.each(data.children, function (index, truck) {
            if (truck.hasOwnProperty("attributes")) {
                trucks.push(truck);
                var info = truck.attributes;
                var html = htmlTruck.replace("%id%", truck.id).replace("%index%", index)
                    .replace("%license%", info.PlateNumber).replace("%online%", truck.online ? "����" : "����")
                    .replace("%speed%", info.Speed / 10).replace("%direct%", formatDirection(info.Direction))
                    .replace("%alarm%", "-").replace("%lon%", info.Lo / 1000000).replace("%lat%", info.La / 1000000).replace("%address%", "-");
                $("table tbody:eq(0)").append(html);
            }
        });
    } else {
        $("table tbody:eq(0)").html("<tr><td colspan=\"10\">û���κ����ݣ���ɵ�ԭ�������������ȡʧ�ܡ�û����ע��ĳ�����</td></tr>");
    }
}

var htmlStatistical = '<tr>' +
    '                      <td data-value="%id%" class="center">%index%</td>' +
    '                      <td>%license%</td>' +
    '                      <td>%date%</td>' +
    '                      <td>%startTime%</td>' +
    '                      <td>%endTime%</td>' +
    '                      <td>%distence% km</td>' +
    '                      <td></td>' +
    '                  </tr>';
function getTruckTrace() {
    // ��ȡָ�����ڵ���ʷ����
    if (seekIndex < seekTrucks.length) {
        var data = {};
        var truck = seekTrucks[seekIndex];
        var date = $("#statisticalDate").val();
        data.VehicleId = truck.id.replace("I", "");
        data.STime = date + " 00:00:00";
        data.ETime = date + " 23:59:59";
        data.PlateNumber = truck.attributes.PlateNumber;
        syncLoading("post", "http://www.zfbeidou.com/bds/historytrace/getTraceData/", data, function (data) {
            if (null == data || data.length < 1) {
                var html = htmlStatistical.replace("%index%", seekIndex + 1)
                    .replace("%license%", truck.attributes.PlateNumber).replace("%date%", date)
                    .replace("%startTime%", "-").replace("%endTime%", "-").replace("%distence%", "0");
            } else {
                var latlng = null;
                for (var i in data) {
                }
            }
        }, function (data) {
            showDialog("������", "��ѯʧ��");
        });
    }
}

$(document).ready(function () {
    $('#home-tab').tab('show');
    //$('[data-toggle="tooltip"]').tooltip();
    initializeDatepicker();

    // loading trucks 71f55003c9a36b40c4a094908f11fb77
    if (trucks.length < 1) {
        loadingTrucks();
    }

    $("#statisticalButton").click(function () {
        $(this).attr("disabled", true);
        // ͳ��ָ�������Ĺ������
        var license = $("#statisticalLicense").val();
        seekTrucks = $.grep(trucks, function (truck) {
            return truck.attributes.PlateNumber.indexOf(license) >= 0;
        });
        if (seekTrucks.length > 0) {
            $("table tbody:eq(1)").html("");
            // ������ѯ������ʾͳ�ƽ��
            seekIndex = 0;
            getTruckTrace();
        } else {
            showDialog("��ʾ", "û���ҵ����ơ�" + license + "���ĳ�����");
            $("table tbody:eq(1)").html("<tr><td colspan=\"7\">û���ҵ����ơ�" + license + "���ĳ�����</td></tr>");
            $(this).attr("disabled", false);
        }
    });
});