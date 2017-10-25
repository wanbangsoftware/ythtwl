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

var directs = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5, 360];
var direct = ["", "22", "45", "67", "90", "112", "135", "157", "180", "202", "225", "247", "270", "292", "315", "337"];
function getDirect(value) {
    var v = parseFloat(value);
    var css = "";
    for (var i = 0; i < directs.length; i++) {
        if (directs[i] >= v) {
            css = direct[i];
            break;
        }
    }
    return isStringNull(css) ? "" : ("rotated-" + css);
}

var htmlTruck = '<tr>' +
    '                <td data-value="%id%" class="center" >%index%</td >' +
    '                <td>%id%</td>' +
    '                <td>%license%</td>' +
    '                <td>%online%</td>' +
    '                <td>%speed% km/h</td>' +
    '                <td><img src="../images/arrow_up_24px.png" class="%direct%" /> %degree%��</td>' +
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
                var html = htmlTruck.replace(/%id%/g, truck.id.replace("l","")).replace("%index%", index)
                    .replace("%license%", info.PlateNumber).replace("%online%", truck.online ? "����" : "����")
                    .replace("%speed%", info.Speed / 10).replace("%direct%", getDirect(info.Direction)).replace("%degree%", formatDirection(info.Direction))
                    .replace("%alarm%", "-").replace("%lon%", info.Lo / 1000000).replace("%lat%", info.La / 1000000).replace("%address%", "-");
                $("table tbody:eq(0)").append(html);
            }
        });
    } else {
        $("table tbody:eq(0)").html("<tr><td colspan=\"11\">û���κ����ݣ���ɵ�ԭ�������������ȡʧ�ܡ�û����ע��ĳ�����</td></tr>");
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
        data.VehicleId = truck.id.replace("l", "");
        data.STime = date + " 00:00:00";
        data.ETime = date + " 23:59:59";
        data.PlateNumber = truck.attributes.PlateNumber;
        syncLoading("post", "http://www.zfbeidou.com/bds/historytrace/getTraceData/", data, function (data) {
            if (null == data || data.length < 1) {
                var html = htmlStatistical.replace("%index%", seekIndex + 1)
                    .replace("%license%", truck.attributes.PlateNumber).replace("%date%", date)
                    .replace("%startTime%", "-").replace("%endTime%", "-").replace("%distence%", "0");
                $("table tbody:eq(2)").append(html);
            } else {
                var html = htmlStatistical.replace("%index%", seekIndex + 1)
                    .replace("%license%", truck.attributes.PlateNumber).replace("%date%", date);
                //.replace("%startTime%", "-").replace("%endTime%", "-").replace("%distence%", "0");
                var latlng = null;
                var distance = 0;
                for (var i = 0; i < data.length; i++) {
                    var r = data[i];
                    var lat = r.lat / 1000000, lng = r.lng / 1000000;
                    if (null == latlng) {
                        latlng = new AMap.LngLat(lng, lat);
                        html = html.replace("%startTime%", r.Time.substr(11));
                    } else {
                        var dis = latlng.distance([lng, lat]);
                        if (dis < 50) {
                            // �ƶ�����û�б仯���г̲��ۼ�
                        } else {
                            distance += dis;
                            // �����µ�λ�õ�
                            latlng = new AMap.LngLat(lng, lat);
                        }
                    }
                    if (i + 1 >= data.length) {
                        html = html.replace("%endTime%", r.Time.substr(11));
                    }
                }
                html = html.replace("%distence%", (distance / 1000).toFixed(2));
                $("table tbody:eq(2)").append(html);
            }
            // ����������һ��
            seekIndex++;
            getTruckTrace();
        }, function (data) {
            showDialog("������", "��ѯʧ��");
        });
    } else {
        $("#statisticalButton").attr("disabled", false);
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
            $("table tbody:eq(2)").html("");
            // ������ѯ������ʾͳ�ƽ��
            seekIndex = 0;
            getTruckTrace();
        } else {
            showDialog("��ʾ", "û���ҵ����ơ�" + license + "���ĳ�����");
            $("table tbody:eq(2)").html("<tr><td colspan=\"7\">û���ҵ����ơ�" + license + "���ĳ�����</td></tr>");
            $(this).attr("disabled", false);
        }
    });
});