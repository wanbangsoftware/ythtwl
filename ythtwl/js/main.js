// JavaScript source code

var trucks = new Array();
var truckIds = "";
var seekTrucks = new Array();
var seekIndex = 0;
var settingName = "setting";
var setting = {
    distance: 50,
    filter: "ignore",
    stopping: 30,
    drivers: new Array()
};
var realTimeInterval = 50000;

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
        async: true,
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

function getMarkerIcon(alarm, alarm2, lossed, speed) {
    var path = "../images/truck_marker_";
    if ((null != alarm && alarm != 0) || (null != alarm2 && alarm2 != 0)) {
        path += "r";
    } else if (lossed <= 180) {
        path += (speed > 0 ? "g" : "b");
    } else {
        path += "y";
    }
    path += ".png";
    return path;
}

var htmlTruck = '<tr id="_%id%">' +
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
var htmlDirver = '<tr id="d%id%">' +
    '                <td class="center" style= "vertical-align: middle;" >%index%</td >' +
    '                <td style="vertical-align: middle;">%license%</td>' +
    '                <td><input type="text" class="name" maxlength="4" placeholder="����1" value="%name1%" /></td>' +
    '                <td><input type="text" class="phone" maxlength="11" placeholder="�绰1" value="%phone1%" /></td>' +
    '                <td><input type="text" class="name" maxlength="4" placeholder="����2" value="%name2%" /></td>' +
    '                <td><input type="text" class="phone" maxlength="11" placeholder="�绰2" value="%phone2%" /></td>' +
    '                <td></td>' +
    '             </tr >';
function displayTrucksList(data) {
    if (data.hasOwnProperty("children") && data.children.length > 0) {
        $("table tbody:eq(0)").html("");
        $("table tbody:eq(3)").html("");
        $.each(data.children, function (index, truck) {
            if (truck.hasOwnProperty("attributes")) {
                trucks.push(truck);
                if (isStringNull(truckIds)) {
                    truckIds = truck.id.replace("l", "");
                } else {
                    truckIds += "," + truck.id.replace("l", "");
                }
                var info = truck.attributes;
                var tid = truck.id.replace("l", "");
                // ���ֳ�ʼ��γ��λ��
                truck.pos = new AMap.LngLat(info.Lo / 1000000, info.La / 1000000);
                var html = htmlTruck.replace(/%id%/g, tid).replace("%index%", index)
                    .replace("%license%", info.PlateNumber).replace("%online%", truck.online ? "����" : "����")
                    .replace("%speed%", info.Speed / 10).replace("%direct%", getDirect(info.Direction)).replace("%degree%", formatDirection(info.Direction))
                    .replace("%alarm%", "-").replace("%lon%", truck.pos.getLng()).replace("%lat%", truck.pos.getLat()).replace("%address%", "-");
                $("table tbody:eq(0)").append(html);
                
                addMarker(truck.pos.getLat(), truck.pos.getLng(), info.PlateNumber, info.Direction, getMarkerIcon(info.Alarm, null, 0, info.Speed));

                // ƥ��˾����Ϣ
                html = htmlDirver.replace(/%id%/g, tid).replace("%index%", index).replace("%license%", info.PlateNumber);
                var drivers = setting.hasOwnProperty("drivers") ? $.grep(setting.drivers, function (driver) {
                    return driver.truckId == tid;
                }) : null;
                if (null != drivers && drivers.length > 0) {
                    html = html.replace("%name1%", drivers[0].name1).replace("%phone1%", drivers[0].phone1)
                        .replace("%name2%", drivers[0].name2).replace("%phone2%", drivers[0].phone2);
                } else {
                    html = html.replace("%name1%", "").replace("%phone1%", "").replace("%name2%", "").replace("%phone2%", "");
                    // ���������һ���¼�¼
                    if (!setting.hasOwnProperty("drivers")) {
                        setting.drivers = [];
                    }
                    setting.drivers.push({ truckId: tid, license: info.PlateNumber, name1: "", phone1: "", name2: "", phone2: "" });
                }
                $("table tbody:eq(3)").append(html);
            }
        });
        // �������ü�¼
        saveSetting(settingName, JSON.stringify(setting));
        fitMapView();
        setTimeout(loadingRealTime, realTimeInterval);
    } else {
        $("table tbody:eq(0)").html("<tr><td colspan=\"11\">û���κ����ݣ���ɵ�ԭ�������������ȡʧ�ܡ�û����ע��ĳ�����</td></tr>");
    }
}

var htmlStatistical = '<tr style="cursor: pointer;" id="#%id%">' +
    '                      <td data-value="%id%" class="center">%index%</td>' +
    '                      <td>%license%</td>' +
    '                      <td>%date%</td>' +
    '                      <td>%startTime%</td>' +
    '                      <td>%endTime%</td>' +
    '                      <td class="center">%activity%</td>' +
    '                      <td>%distence% km</td>' +
    '                      <td>%dashboard% km</td>' +
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
                var html = htmlStatistical.replace("%index%", seekIndex + 1).replace(/%id%/g, truck.id.replace("l", ""))
                    .replace("%license%", truck.attributes.PlateNumber).replace("%date%", date)
                    .replace("%startTime%", "-").replace("%endTime%", "-").replace("%distence%", "0")
                    .replace("%dashboard%", "0").replace("%activity%", "0");
                $("table tbody:eq(2)").append(html);
            } else {
                truck.trace = data;
                // �����һ������ʱ��λ�ã��Դ����жϵ���ɻ������˼���
                var bPos = null;
                // �����һ��������ʱ���
                var bTimestamp = 0;
                var cycled = false;
                var html = htmlStatistical.replace("%index%", seekIndex + 1).replace(/%id%/g, truck.id.replace("l", ""))
                    .replace("%license%", truck.attributes.PlateNumber).replace("%date%", date);
                //.replace("%startTime%", "-").replace("%endTime%", "-").replace("%distence%", "0");
                var latlng = null;
                var distance = 0, dashboard = 0, lstKm = 0, activity = 0;
                var started = false;
                var endTime = "-";
                for (var i = 0; i < data.length; i++) {
                    var r = data[i];
                    var lat = r.lat / 1000000, lng = r.lng / 1000000;
                    if (null == latlng) {
                        if (r.Speed > 0) {
                            started = true;
                            lstKm = r.Mileage;
                            // �ٶȱ仯ʱ���ǿ�ʼ
                            latlng = new AMap.LngLat(lng, lat);
                            if (null == bPos) {
                                bPos = new AMap.LngLat(lng, lat);
                                cycled = false;
                                bTimestamp = getTimestamp(r.RecvTime);
                            }
                            html = html.replace("%startTime%", r.RecvTime.substr(11));
                        }
                    } else {
                        var dis = latlng.distance([lng, lat]);
                        //distance += dis;
                        if (r.Speed > 0) {
                            // ��������
                            if (!started) {
                                started = true;
                                lstKm = r.Mileage;
                                if (null == bPos) {
                                    bPos = new AMap.LngLat(lng, lat);
                                    bTimestamp = getTimestamp(r.RecvTime);
                                    cycled = false;
                                }
                            }
                        } else {
                            // û���ٶ�ʱ
                            if (started) {
                                started = false;
                                dashboard += (r.Mileage - lstKm);
                                // ����״̬�Ҵ�ʱ�ٶ�Ϊ0��˵����ʱͣ����
                                endTime = r.RecvTime.substr(11);
                            }
                        }
                        if (dis < setting.distance) {
                            // �ƶ�����û�б仯���г̲��ۼ�
                            if (setting.filter == "count") {
                                distance += dis;
                            }
                        } else {
                            distance += dis;
                            // �����µ�λ�õ�
                            latlng = new AMap.LngLat(lng, lat);
                        }
                    }
                    if (null != bPos) {
                        // ��ǰ��һ���������ˣ����жϺ����Ķ�λ��Ϣ�Ƿ��ڵ�һ�������ĵ㸽��
                        thisTimestamp = getTimestamp(r.RecvTime);
                        if (thisTimestamp - bTimestamp >= 20 * 60) {
                            // ����ʱ�䳬��20����֮��ʼͳ����������
                            var bDis = bPos.distance([lng, lat]);
                            if (bDis <= 1000) {
                                // ���ص������һ������ʱλ�õ�1km��Χ��˵����ȥ�ɻ������һ�˻�����
                                if (!cycled) {
                                    cycled = true;
                                    // �ɻ���������+1
                                    activity += 1;
                                    // ��������ʱ��Ϊ��ǰʱ��
                                    bTimestamp = thisTimestamp;
                                }
                            } else {
                                // �ֳ�ȥ�ɻ���
                                cycled = false;
                            }
                        }
                    }
                    if (i + 1 >= data.length) {
                        html = html.replace("%endTime%", endTime);
                    }
                }
                if (html.indexOf("%startTime%") >= 0) {
                    html = html.replace("%startTime%", "-");
                }
                html = html.replace("%activity%", activity);
                html = html.replace("%distence%", (distance / 1000).toFixed(2));
                html = html.replace("%dashboard%", (dashboard / 10).toFixed(2));
                $("table tbody:eq(2)").append(html);
            }
            // ����������һ��
            seekIndex++;
            getTruckTrace();
        }, function (data) {
            showDialog("������", "��ѯʧ�ܣ����Ժ�����");
            $("#statisticalButton").attr("disabled", false);
        });
    } else {
        $("#statisticalButton").attr("disabled", false);
    }
}

var tableToExcel = (function () {
    var uri = 'data:application/vnd.ms-excel;base64,'
        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table border="1">{table}</table></body></html>'
        , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
        , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };
    return function (tableElement, workSheetName, fileName) {
        if (!tableElement.nodeType) {
            tableElement = document.getElementById(tableElement);
        }
        var ctx = {
            worksheet: workSheetName || 'Worksheet',
            table: tableElement.innerHTML
        }

        document.getElementById("downloadLink").href = uri + base64(format(template, ctx));
        document.getElementById("downloadLink").download = fileName;
        document.getElementById("downloadLink").click();

    }
})();

function getSetting(name) {
    return window.localStorage.getItem(name);
}

function saveSetting(name, value) {
    window.localStorage.setItem(name, value);
}

function loadingLocalSettings() {
    if (window.localStorage) {
        var obj = getSetting(settingName);
        if (!obj || isStringNull(obj)) {
            saveSetting(settingName, JSON.stringify(setting));
        } else {
            setting = JSON.parse(obj);
        }
        // �ƶ���������
        $("#settingDistance").val(setting.distance);
        // �Ƿ�����ƶ�����С�ļ�¼
        $("input[type='radio'][name='options'][value='" + setting.filter + "']").attr("checked", true).parent().addClass("active");
        $("input[type='radio'][name='options'][value!='" + setting.filter + "']").attr("checked", false).parent().removeClass("active");
        // ͣ��ʱ��
        $("#settingStopping").val(setting.stopping);
    } else {
        showDialog("��ʾ", "�������֧�ֱ������ݻ��档");
    }
}

function loadingRealTime() {
    var time = (new Date()).pattern("yyyy-MM-dd hh:mm:ss");
    var data = {};
    data.VIds = truckIds;
    data.LT_As = time;
    data.LT_ALEs = time;
    data.LT_DHs = "";
    data.LT_MMs = "";
    data.RIs = 3;
    syncLoading("post", "http://www.zfbeidou.com/bds/monitor/getRI", data, function (data) {
        // ʵʱ����״̬�����³����б������ֵ
        if (data.hasOwnProperty("Vs") && data.Vs.length > 0) {
            clearMarkers();
            $.each(data.Vs, function (index, item) {
                var pos = new AMap.LngLat(item.lng / 1000000, item.lat / 1000000);
                var tr = $("#_" + item.Id);
                if (null != tr) {
                    // �ٶ�
                    $(tr).children("td:eq(4)").text((item.Speed / 10) + " km/h");
                    //<img src=\"../images/arrow_up_24px.png\" class=\"%direct%\" /> %degree%��
                    $(tr).children("td:eq(5)").html("<img src=\"../images/arrow_up_24px.png\" class=\"%direct%\" /> %degree%��".replace("%direct%", getDirect(item.Direction)).replace("%degree%", formatDirection(item.Direction)));
                    $(tr).children("td:eq(7)").text(pos.getLng());
                    $(tr).children("td:eq(8)").text(pos.getLat());
                }
                addMarker(pos.getLat(), pos.getLng(), $(tr).children("td:eq(2)").text(), item.Direction, getMarkerIcon(item.Alarm, item.ALarm2, item.LossTime, item.Speed));
                // ���³�����״̬
                var seek = $.grep(trucks, function (truck) {
                    return truck.id == "l" + item.Id;
                });
                if (seek.length > 0) {
                    var truck = seek[0];
                    var distance = truck.pos.distance([pos.getLng(), pos.getLat()]);
                    if (distance < setting.distance) {
                        // λ��û�б仯���һ�δ��¼ͣ���ı��ʱ
                        if (!truck.hasOwnProperty("stay") || isStringNull(truck.stay)) {
                            // ��¼λ��û�б仯�ĳ�ʼʱ��
                            truck.stay = item.RecvTime;
                        } else if (!truck.hasOwnProperty("stayReported") || !truck.stayReported) {
                            // �Ѿ���ʼͣ��ʱ���鿴�Ƿ��Ѿ��㱨��ͣ�����������û�л㱨�����¼ʱ���
                            // �鿴λ��û�б仯��ʱ����
                            var time1 = getTimestamp(truck.stay);
                            var time2 = getTimestamp(item.RecvTime);
                            var seconds = time2 - time1;
                            if (seconds / 60 >= setting.stopping) {
                                // ���ͣ��ʱ�䳬��Ԥ��ļ��ʱ������һ������
                                truck.stayReported = true;
                                var planteNum = truck.attributes.PlateNumber;
                                var sets = $.grep(setting.drivers, function (drver) {
                                    return drver.license == planteNum;
                                });
                                var drv = null != sets && sets.length > 0 ? sets[0] : null;
                                sendNimMessage(planteNum, pos.getLat(), pos.getLng(), truck.stay, seconds, drv);
                            }
                        }
                    } else {
                        // ����λ��
                        truck.pos = pos;
                        // ���λ��û�б仯��ʱ���¼
                        truck.stay = "";
                        truck.stayReported = false;
                    }
                }
            });
        }
        //fitMapView();
        setTimeout(loadingRealTime, realTimeInterval);
    }, function (data) {
        showDialog("������", "��ѯʵʱ����ʧ�ܣ���ˢ��ҳ������");
    });
}

function getTimestamp(time) {
    if (typeof time === "string") {
        return new Date(Date.parse(time.replace(/-/g, "/"))).getTime() / 1000;
    } else {
        return (new Date(time).toLocaleString('chinese', { hour12: false }).replace(/��|��/g, "-").replace(/��/g, " ").replace(/[\/]/g, "-"));//.pattern("yyyy-MM-dd hh:mm:ss");
    }
}

var chartArray = [];
function getChartData(truck) {
    var date = $("#statisticalDate").val();
    var begin = getTimestamp(date + " 00:00:00");
    var end = getTimestamp(date + " 23:59:59");
    var worker = new Worker("traceWorker.js");
    worker.onmessage = function (evt) {
        chartArray = evt.data;
    };
    chartArray = [];
    var timestamp, lastSpeed = 0.0;
    for (var i = begin; i <= end; i++) {
        timestamp = getTimestamp(i * 1000);
        var seek = $.grep(truck.trace, function (item) {
            return item.RecvTime == timestamp;
        });
        if (seek.length > 0) {
            lastSpeed = seek[0].Speed / 10;
        }
        chartArray.push([i, lastSpeed]);
    }
}

$(document).ready(function () {
    
    $('#home-tab').tab('show');
    //$('[data-toggle="tooltip"]').tooltip();
    initializeDatepicker();
    loadingLocalSettings();

    $("#settingSave").click(function () {
        setting.distance = $("#settingDistance").val();
        setting.filter = $("input[name='options']:checked").val();
        setting.stopping = $("#settingStopping").val();
        saveSetting("setting", JSON.stringify(setting));
        //$("#settingSave").attr("disabled", true);
        showDialog("��ʾ", "�����ѱ��棬��Щ���ý�������һ����֮��ʼ��Ч��");
    });

    $("#exportExcel").click(function () {
        var date = $("#statisticalDate").val();
        // ����ͳ�ƽ����excel
        tableToExcel("tableStatistical", "����ͳ��", "ͳ��" + date + $("#statisticalLicense").val() + ".xls");
    });

    //$("#setting input[type='text']").each(function () {
    //    var elem = $(this);
    //    // Save current value of element
    //    elem.data('oldVal', elem.val());
    //    elem.on("propertychange change click keyup input paste", function (event) {
    //        if (elem.data('oldVal') != elem.val()) {
    //            // Updated stored value
    //            elem.data("oldVal", elem.val());
    //            $("#settingSave").attr("disabled", false);
    //        }
    //    });
    //});

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
            // �в�ѯ���ʱ���Ե���
            $("#exportExcel").attr("disabled", false);
            // ������ѯ������ʾͳ�ƽ��
            seekIndex = 0;
            getTruckTrace();
        } else {
            showDialog("��ʾ", "û���ҵ����ơ�" + license + "���ĳ�����");
            $("table tbody:eq(2)").html("<tr><td colspan=\"8\">û���ҵ����ơ�" + license + "���ĳ�����</td></tr>");
            $(this).attr("disabled", false);
            $("#exportExcel").attr("disabled", true);
        }
    });

    $("table tbody:eq(2)").on('click', 'tr', function () {
        if ($(this).children("td").length < 2) { return; }
        var id = $(this).attr("id").replace("#", "");
        var seeks = $.grep(trucks, function (truck) { return truck.id.indexOf(id) >= 0; });
        if (seeks.length > 0) {
            $('.progress').css("display", "block");
            $("#badge").removeClass("hide");
            $(".modal-title").text("��" + $(this).children("td:eq(1)").text() + "���������һ��");
            $(".modal").modal('show');
            //getChartData(seeks[0]);
            var truck = seeks[0];
            var date = $("#statisticalDate").val();
            var begin = getTimestamp(truck.trace[0].RecvTime);
            var end = getTimestamp(truck.trace[truck.trace.length - 1].RecvTime);
            var worker = new Worker("../js/traceWorker.js");
            worker.postMessage({ trace: truck.trace, begin: begin, end: end });
            worker.onmessage = function (evt) {
                if (typeof evt.data === "number") {
                    var per = evt.data / 86400 * 100;
                    $('.progress-bar').html(parseInt(per) + "%").css('width', parseInt(per) + '%').attr('aria-valuenow', per);
                    $(".badge").text(parseInt(per) + "%");
                } else {
                    $('.progress').css("display", "none");
                    $("#badge").addClass("hide");
                    $("#placeholder").CanvasJSChart({
                        theme: "light2", // "light1", "light2", "dark1", "dark2"
                        animationEnabled: true,
                        zoomEnabled: true,
                        data: [{
                            type: "area",
                            dataPoints: evt.data
                        }],
                        toolTip: {
                            enabled: true,       //disable here
                            animationEnabled: true, //disable here
                            contentFormatter: function (e) {
                                var point = e.entries[0].dataPoint;
                                return getTimestamp(point.x * 1000).substr(11) + " " + (point.y <= 0 ? "ͣ��" : ("<strong>" + point.y + "km/h</strong>"));
                            }
                        },
                        axisX: {
                            labelFormatter: function (e) {
                                return getTimestamp(e.value * 1000).substr(11, 5);
                            }
                        },
                    });
                }
            };
        } else {

        }
    });

    $("table tbody:eq(3)").on('change paste keyup', 'input', function () {
        var tr = $(this).parent().parent();
        // �ı��������¼�������˾������Ϣ
        var id = $(tr).attr("id").replace("d", "");
        var drivers = $.grep(setting.drivers, function (driver) {
            return driver.truckId == id;
        });
        if (null != drivers && drivers.length > 0) {
            drivers[0].name1 = $(tr).children("td:eq(2)").find("input").val();
            drivers[0].phone1 = $(tr).children("td:eq(3)").find("input").val();
            drivers[0].name2 = $(tr).children("td:eq(4)").find("input").val();
            drivers[0].phone2 = $(tr).children("td:eq(5)").find("input").val();
            // �������ü�¼
            saveSetting(settingName, JSON.stringify(setting));
        }
    });
});