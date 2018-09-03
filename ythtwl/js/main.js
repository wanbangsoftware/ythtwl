// JavaScript source code

// ʵʱ��ѯ����ĳ���id�б�
var realTimeTruckIds = "";
/*����ͳ��ʱģ����ѯ�ĳ����б�*/
var dayWorkSeekingTrucks = new Array();
// ��ǰͳ�Ƶ�����
var dayWorkSeekingHandleIndex = 0;
// �Ƿ��ֶ���ѯ����ͳ�ƣ�Ĭ��false
var isDayWorkManualSeeking = false;
// �Ƿ�ǰ���ڽ��й���ͳ��
var isDayWorkSeekingHanding = false;
var settingName = "setting";
var timeoutHandler = null;
// ��ǰ���ڴ򿪲鿴ͣ����͵�ͼ�ĳ���
var currentStopPointSeekTruck = null;

var setting = {
    distance: 50,
    filter: "ignore",
    stopping: 30,
    point: 2,
    drivers: new Array(),
    vehicles: new Array()
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
        showDialog("��ʾ", "�޷����س����б���ȷ�����Ƿ��Ѿ���¼��ϵͳ");
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

function getVehicle(vId) {
    var seek = setting.hasOwnProperty("vehicles") ? $.grep(setting.vehicles, function (vehicle) {
        return vehicle.id == vId;
    }) : null;
    return (null != seek && seek.length > 0) ? seek[0] : null;
}

var htmlTruck = '<tr id="_%id%">' +
    '                <td data-value="%id%" class="center" >%index%</td >' +
    '                <td>%id%</td>' +
    '                <td>%license%</td>' +
    '                <td>%online%</td>' +
    '                <td>%time%</td>' +
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
                var tid = truck.id.replace("l", "");
                if (isStringNull(realTimeTruckIds)) {
                    realTimeTruckIds = tid;
                } else if (realTimeTruckIds.indexOf(tid) < 0) {
                    realTimeTruckIds += "," + tid;
                }
                var vehicle = getVehicle(tid);
                if (null == vehicle) {
                    vehicle = {};
                    vehicle.id = tid;
                    vehicle.license = truck.attributes.PlateNumber;
                    vehicle.onlineTime = "";
                    vehicle.address = "";
                    vehicle.mileage = "";
                    vehicle.name1 = "";
                    vehicle.phone1 = "";
                    vehicle.name2 = "";
                    vehicle.phone2 = "";
                    vehicle.stayLength = 0;
                    if (!setting.hasOwnProperty("vehicles")) {
                        setting.vehicles = [];
                    }
                    setting.vehicles.push(vehicle);
                }
                // ���³�������Ϣ
                vehicle.online = truck.online;
                vehicle.speed = truck.attributes.Speed;
                vehicle.alarm = truck.attributes.Alarm;
                vehicle.direction = truck.attributes.Direction;
                var latlng = GPS.gcj_encrypt(truck.attributes.La / 1000000, truck.attributes.Lo / 1000000);
                vehicle.lat = latlng.lat;
                vehicle.lng = latlng.lng;

                var html = htmlTruck.replace(/%id%/g, tid).replace("%index%", index).replace("%time%", "-")
                    .replace("%license%", vehicle.license).replace("%online%", vehicle.online ? "����" : "����")
                    .replace("%speed%", vehicle.speed / 10).replace("%direct%", getDirect(vehicle.direction)).replace("%degree%", formatDirection(vehicle.direction))
                    .replace("%alarm%", "-").replace("%lon%", vehicle.lng.toFixed(6)).replace("%lat%", vehicle.lat.toFixed(6)).replace("%address%", vehicle.address);
                $("table tbody:eq(0)").append(html);

                if (vehicle.lat > 0 && vehicle.lng > 0) {
                    // ��γ��Ϊ0�Ĳ���ʾ����ͼ��
                    addMarker(vehicle.lat, vehicle.lng, vehicle.license, vehicle.direction, getMarkerIcon(vehicle.alarm, null, 0, vehicle.speed));
                }

                // ƥ��˾����Ϣ
                html = htmlDirver.replace(/%id%/g, tid).replace("%index%", index).replace("%license%", vehicle.license);
                if (isStringNull(vehicle.name1) || isStringNull(vehicle.phone1) ||
                    isStringNull(vehicle.name2) || isStringNull(vehicle.phone2)) {
                    var drivers = setting.hasOwnProperty("drivers") ? $.grep(setting.drivers, function (driver) {
                        return driver.truckId == tid;
                    }) : null;
                    if (null != drivers && drivers.length > 0) {
                        var driver = drivers[0];
                        vehicle.name1 = driver.name1;
                        vehicle.phone1 = driver.phone1;
                        vehicle.name2 = driver.name2;
                        vehicle.phone2 = driver.phone2;
                    }
                }

                html = html.replace("%name1%", vehicle.name1).replace("%phone1%", vehicle.phone1)
                    .replace("%name2%", vehicle.name2).replace("%phone2%", vehicle.phone2);

                $("table tbody:eq(3)").append(html);
            }
        });
        if (setting.hasOwnProperty("drivers")) {
            delete setting.drivers;
        }
        // �������ü�¼
        saveSetting(settingName, JSON.stringify(setting));
        fitMapView();
        timeoutHandler = setTimeout(loadingRealTime, realTimeInterval);
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
    '                      <td class="center" id="a_%id%">%activity%</td>' +
    '                      <td class="center" id="p_%id%">%points%</td>' +
    '                      <td>%driveTime%</td>' +
    '                      <td>%distence% km</td>' +
    '                      <td>%dashboard% km</td>' +
    '                      <td></td>' +
    '                  </tr>';
function getTruckTrace() {
    // ��ȡָ�����ڵ���ʷ����
    if (dayWorkSeekingHandleIndex < dayWorkSeekingTrucks.length) {
        var data = {};
        var truck = dayWorkSeekingTrucks[dayWorkSeekingHandleIndex];
        // ͣ�������
        truck.points = new Array();
        var date = $("#statisticalDate").val();
        var clazz = $("#classTypeValue").val();
        if (!isDayWorkManualSeeking) {
            // ������Զ���ѯ�ģ�����Ҫ��ѯ����Ĺ���
            clazz = "full";
        }
        if (clazz.indexOf("moning") >= 0) {
            data.STime = date + " 06:30:00";
            data.ETime = date + " 18:30:00";
        } else if (clazz.indexOf("evening") >= 0) {
            data.STime = date + " 18:30:00";
            var d = new Date(date.replace(/-/g, "/"));
            d = d.dateAfter(1, 1);
            data.ETime = d.pattern("yyyy-MM-dd") + " 06:30:00";
        } else if (clazz.indexOf("full") >= 0) {
            data.STime = date + " 00:00:00";
            data.ETime = date + " 23:59:59";
        }
        data.VehicleId = truck.id;
        data.PlateNumber = truck.license;
        syncLoading("post", "http://www.zfbeidou.com/bds/historytrace/getTraceData/", data, function (data) {
            if (null == data || data.length < 1) {
                var html = htmlStatistical.replace("%index%", dayWorkSeekingHandleIndex + 1).replace(/%id%/g, truck.id)
                    .replace("%license%", truck.license).replace("%date%", date)
                    .replace("%startTime%", "-").replace("%endTime%", "-").replace("%distence%", "0")
                    .replace("%dashboard%", "0").replace("%activity%", "0").replace("%points%", 0).replace("%driveTime%", "-");
                $("table tbody:eq(2)").append(html);
            } else {
                // ��ͨ��Time����Ȼ��鿴Time��ReceiveTime��ƥ��ļ�¼
                data = jLinq.from(data).sort("Time").select();
                for (var i in data) {
                    var item = data[i];
                    if (item.Time.indexOf(date) >= 0) {
                        break;
                    } else {
                        // ����ʱ�������ʱ�䲻һ��ʱ�����Ϊ����ʱ��
                        item.Time = item.RecvTime;
                    }
                }
                // ���°��շ���������ʱ������
                data = jLinq.from(data).sort("Time").select();
                truck.trace = data;
                truck.polyline = [];
                // �����һ������ʱ��λ�ã��Դ����жϵ���ɻ������˼���
                var bPos = null;
                // �����һ��������ʱ���
                var bTimestamp = 0;
                var cycled = false;
                var html = htmlStatistical.replace("%index%", dayWorkSeekingHandleIndex + 1).replace(/%id%/g, truck.id)
                    .replace("%license%", truck.license).replace("%date%", date);
                //.replace("%startTime%", "-").replace("%endTime%", "-").replace("%distence%", "0");
                var latlng = null;
                var distance = 0,
                    dashboard = 0,
                    lstKm = 0,
                    activity = 0,
                    driveTime = 0;
                var started = false;
                var lastStartTimestamp = 0;
                var endTime = "-";
                for (var i = 0; i < data.length; i++) {
                    var r = data[i];
                    var timestamp = getTimestamp(r.Time);
                    var lat = r.lat / 1000000,
                        lng = r.lng / 1000000;
                    var gcj = GPS.gcj_encrypt(lat, lng);
                    truck.polyline.push(new AMap.LngLat(gcj.lng, gcj.lat));
                    if (null == latlng) {
                        latlng = new AMap.LngLat(lng, lat);
                        if (r.Speed > 0) {
                            started = true;
                            lstKm = r.Mileage;
                            // �ٶȱ仯ʱ���ǿ�ʼ
                            if (null == bPos) {
                                bPos = new AMap.LngLat(lng, lat);
                                cycled = false;
                                bTimestamp = timestamp;
                            }
                            // �������ʱ��
                            lastStartTimestamp = timestamp;
                            html = html.replace("%startTime%", r.Time.substr(11));
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
                                    bTimestamp = timestamp;
                                    cycled = false;
                                }
                                // �������ʱ��
                                lastStartTimestamp = timestamp;
                                html = html.replace("%startTime%", r.Time.substr(11));

                                // ��ͣ��״̬������״̬���ж�ͣ�����ͣ��ʱ��
                                if (truck.points.length > 0) {
                                    // �����ͣ����
                                    var point = truck.points[truck.points.length - 1];
                                    point.stoppingTime = timestamp - getTimestamp(point.StopTime);
                                    point.RestartTime = r.Time;
                                }
                            } else {
                                // �����������״̬�����ۼƿ���ʱ��
                                driveTime += timestamp - lastStartTimestamp;
                                // �������ʱ��
                                lastStartTimestamp = timestamp;
                            }
                        } else {
                            // û���ٶ�ʱ
                            if (started) {
                                started = false;
                                dashboard += (r.Mileage - lstKm);
                                // ����״̬�Ҵ�ʱ�ٶ�Ϊ0��˵����ʱͣ����
                                endTime = r.Time.substr(11);
                                // ����֮���ֹͣ����Ҫ�ۼӿ���ʱ��
                                driveTime += timestamp - lastStartTimestamp;
                                lastStartTimestamp = timestamp;

                                var point = {};
                                // ͣ���ص�
                                point.pos = new AMap.LngLat(lng, lat);
                                // ͣ��ʱ��
                                point.StopTime = r.Time;
                                // �ٴ�����ʱ��
                                point.RestartTime = "";
                                // ͣ��ʱ��
                                point.stoppingTime = 0;
                                // ͣ���ص�
                                point.address = "";
                                // ����ͣ�����б�
                                truck.points.push(point);
                            } else {
                                // �ۼ�û���ٶ�ʱ��Ҫͳ��ͣ����
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
                        thisTimestamp = timestamp;
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
                html = html.replace("%activity%", (activity > 0 ? ("<u>" + activity + "</u>") : 0));
                html = html.replace("%distence%", (distance / 1000).toFixed(2));
                html = html.replace("%dashboard%", (dashboard / 10).toFixed(2));
                html = html.replace("%points%", (truck.points.length > 0 ? ("<u>" + truck.points.length + "</u>") : 0));
                var driveHours = parseInt(driveTime / 3600);
                var driveMinutes = parseInt((driveTime % 3600) / 60);
                html = html.replace("%driveTime%", ((driveHours > 0 ? (driveHours + "Сʱ") : "") + (driveMinutes > 0 ? (driveMinutes + "��") : (driveHours > 0 ? "" : "-"))));
                if (isDayWorkManualSeeking) {
                    // ���ֶ�ͳ�Ʋ�ѯ��ͳ�Ƽ�¼����ʾ�������
                    $("table tbody:eq(2)").append(html);
                } else {
                    // �����ֶ���ѯ�ģ���ʱ��Ҫ������Ϣ��app��
                    sendNimMessage(truck);
                }
            }
            // ����������һ��
            dayWorkSeekingHandleIndex++;

            // �������ü�¼
            saveSetting(settingName, JSON.stringify(setting));

            var per = dayWorkSeekingHandleIndex / dayWorkSeekingTrucks.length * 100;
            $(".progress-bar:eq(0)").html(parseInt(per) + "%").css('width', parseInt(per) + '%').attr('aria-valuenow', per);

            getTruckTrace();
        }, function (data) {
            // ����ʱ��Ҳ�ù���ͳ�ƽ���
            isDayWorkSeekingHanding = false;
            // ��ղ�ѯ�����б�
            dayWorkSeekingTrucks.length = 0;

            showDialog("������", "��ѯʧ�ܣ����Ժ�����", function () {
                $(".modal:eq(0)").modal("hide");
            });
            $("#statisticalButton").attr("disabled", false);
        });
    } else {
        // ����ͳ�ƽ���
        isDayWorkSeekingHanding = false;
        // ��ղ�ѯ�ĳ����б�
        dayWorkSeekingTrucks.length = 0;
        $(".modal:eq(0)").modal("hide");
        $("#statisticalButton").attr("disabled", false);
    }
}

var tableToExcel = (function () {
    var uri = 'data:application/vnd.ms-excel;base64,',
        template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table border="1">{table}</table></body></html>',
        base64 = function (s) {
            return window.btoa(unescape(encodeURIComponent(s)))
        },
        format = function (s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p];
            })
        };
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
        // ͣ����
        $("#settingPoint").val(setting.point);
    } else {
        showDialog("��ʾ", "�������֧�ֱ������ݻ��档");
    }
}

function loadingRealTime() {
    var time = (new Date()).pattern("yyyy-MM-dd hh:mm:ss");
    var data = {};
    data.VIds = realTimeTruckIds;
    data.LT_As = time;
    data.LT_ALEs = time;
    data.LT_DHs = "";
    data.LT_MMs = "";
    data.RIs = 3;
    syncLoading("post", "http://www.zfbeidou.com/bds/monitor/getRI", data, function (data) {
        // ʵʱ����״̬�����³����б������ֵ
        if (data.hasOwnProperty("Vs") && data.Vs.length > 0) {
            clearMarkers();
            if (!isDayWorkSeekingHanding) {
                // �����ǰû����ȡ���ݣ�����մ����������б�
                dayWorkSeekingTrucks.length = 0;
            }
            $.each(data.Vs, function (index, item) {
                var gos = GPS.gcj_encrypt(item.lat / 1000000, item.lng / 1000000);;
                var pos = new AMap.LngLat(gos.lng, gos.lat);
                var tr = $("#_" + item.Id);
                if (null != tr) {
                    var time = item.RecvTime;
                    $(tr).children("td:eq(4)").text(isStringNull(time) ? "-" : time.substr(11));
                    // �ٶ�
                    $(tr).children("td:eq(5)").text((item.Speed / 10) + " km/h");
                    //<img src=\"../images/arrow_up_24px.png\" class=\"%direct%\" /> %degree%��
                    $(tr).children("td:eq(6)").html("<img src=\"../images/arrow_up_24px.png\" class=\"%direct%\" /> %degree%��".replace("%direct%", getDirect(item.Direction)).replace("%degree%", formatDirection(item.Direction)));
                    $(tr).children("td:eq(8)").text(pos.getLng().toFixed(6));
                    $(tr).children("td:eq(9)").text(pos.getLat().toFixed(6));
                }
                addMarker(pos.getLat(), pos.getLng(), $(tr).children("td:eq(2)").text(), item.Direction, getMarkerIcon(item.Alarm, item.ALarm2, item.LossTime, item.Speed));
                // ���³�����״̬
                var truck = getVehicle(item.Id);
                if (null != truck) {
                    var oPos = new AMap.LngLat(truck.lng, truck.lat);
                    var distance = oPos.distance([pos.getLng(), pos.getLat()]);
                    if (distance < setting.distance) {
                        // λ��û�б仯���һ�δ��¼ͣ���ı��ʱ
                        if (!truck.hasOwnProperty("stay") || isStringNull(truck.stay)) {
                            // ��¼λ��û�б仯�ĳ�ʼʱ��
                            truck.stay = item.RecvTime;
                        } else if (!truck.hasOwnProperty("stayReported") || !truck.stayReported) {
                            // ����λ��
                            truck.lng = pos.getLng();
                            truck.lat = pos.getLat();
                            // �Ѿ���ʼͣ��ʱ���鿴�Ƿ��Ѿ��㱨��ͣ�����������û�л㱨�����¼ʱ���
                            // �鿴λ��û�б仯��ʱ����
                            var time1 = getTimestamp(truck.stay);
                            var time2 = getTimestamp(item.RecvTime);
                            var seconds = time2 - time1;
                            if (seconds / 60 >= setting.stopping) {
                                if (!isDayWorkSeekingHanding) {
                                    // ���ͣ��ʱ�䳬��Ԥ��ļ��ʱ������һ������
                                    truck.stayReported = true;
                                    truck.stayLength = seconds;
                                    // ����Ϊ���ֶ���ѯģʽ����ʱ��ѯ���֮��
                                    isDayWorkManualSeeking = false;
                                    // �����ǰû�н�����ʷ��¼��ѯ���򽫵�ǰ����������еȴ���ѯ����ͣ����¼���ٷ��͵��ֻ�app��
                                    dayWorkSeekingTrucks.push(truck);
                                    //sendNimMessage(truck, seconds);
                                }
                            }
                        }
                    } else {
                        // ����λ��
                        truck.lng = pos.getLng();
                        truck.lat = pos.getLat();
                        // ���λ��û�б仯��ʱ���¼
                        truck.stay = "";
                        truck.stayReported = false;
                    }
                    truck.alarm = item.Alarm;
                    truck.speed = item.Speed;
                    truck.direct = item.Direction;
                    truck.mileage = item.Mileage;
                }
            });
            // �������Ҫͳ��ͣ����ģ���ʱ��ʼͳ��
            if (!isDayWorkSeekingHanding && dayWorkSeekingTrucks.length > 0) {
                prepareDayWorkSeeking();
            }
        }
        //fitMapView();
        timeoutHandler = setTimeout(loadingRealTime, realTimeInterval);
    }, function (data) {
        showDialog("������", "��ѯʵʱ����ʧ�ܣ���ˢ��ҳ������");
    });
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
    var timestamp,
        lastSpeed = 0.0;
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

var truck_stopping_point =
    '<tr>' +
    '    <td class="center" >%index%</td >' +
    '    <td>%stopAt%</td>' +
    '    <td>%startAt%</td>' +
    '    <td>%stopTimes%</td>' +
    '    <td nowrap data-lng="%longitude%" data-lat="%latitude%">%address%</td>' +
    //'    <td style="width: 10px;"></td>' +
    '</tr>';
var truck_address_fetching = '<img src="../images/loading.gif" style="display: none; width: 18px;" /><span style="cursor: pointer;">�����ȡ��ַ</span>';
function showTrucnStopPoints(truck) {
    clearTruckMapPolyline();
    clearTruckMapMarkers();
    var tbody = $("#truckStopPointList");
    tbody.html("");
    // ��ʾ�켣
    if (truck.trace.length > 0) {
        showTruckTrack(truck.polyline);
        fitTruckMapView();
    }
    if (truck.points.length <= 0) {
        tbody.append("<tr><td colspan=\"5\">û��ͳ�Ƶ��κ�ͣ���㡣</td></tr>");
    } else {
        for (var i in truck.points) {
            var point = truck.points[i];
            addTruckMapMarker(point.pos.lat, point.pos.lng, point.StopTime.substr(11));
            var hours = parseInt(point.stoppingTime / 3600);
            var minutes = parseInt((point.stoppingTime % 3600) / 60);
            var seconds = point.stoppingTime % 60;
            var html = truck_stopping_point.replace("%index%", parseInt(i) + 1)
                .replace("%stopAt%", point.StopTime.substr(11)).replace("%startAt%", !isStringNull(point.RestartTime) ? point.RestartTime.substr(11) : "")
                .replace("%stopTimes%", ((hours > 0 ? (hours + "Сʱ") : "") + (minutes > 0 ? (minutes + "��") : "") + (seconds > 0 ? (seconds + "��") : "")))
                .replace("%address%", (isStringNull(point.address) ? truck_address_fetching : point.address)).replace("%longitude%", point.pos.lng).replace("%latitude%", point.pos.lat);
            tbody.append(html);
        }
    }
    fitTruckMapView();
}

function getWorkClassTypeName() {
    var v = $("#classTypeValue").val();
    var type = "���";
    if (v.indexOf("evening") >= 0) {
        type = "���";
    } else if (v.indexOf("full") >= 0) {
        type = "ȫ��";
    }
    return type;
}

function prepareDayWorkSeeking() {
    // ���õ�ǰ�����ֶ�ͳ�ƹ�����¼��ʵʱ�㱨Ҫ�ȵ�����б�������ܽ���
    isDayWorkSeekingHanding = true;
    $("table tbody:eq(2)").html("");
    // �в�ѯ���ʱ���Ե���
    $("#exportExcel").attr("disabled", false);
    // ������ѯ������ʾͳ�ƽ��
    $(".progress-bar:eq(0)").html("0%").css("width", "0%").attr("aria-valuenow", 0);
    if (isDayWorkManualSeeking) {
        // �ֶ���ѯʱ��ʾ������
        $(".modal:eq(0)").modal("show");
    }
    dayWorkSeekingHandleIndex = 0;
    getTruckTrace();
}

$(document).ready(function () {

    // ��������div
    var width = $(window).width() - 20;
    $("#container").width(width);
    $("#trucks").width(width);
    $("#statistical").width(width);
    $("#drivers").width(width);
    var height = window.innerHeight;
    var top = $("#container").offset().top;
    var h = height - top - 10;
    $("#container").height(h);
    $("#trucks").height(h);
    $("#statistical").height(h);
    $("#drivers").height(h);

    $('#home-tab').tab('show');
    //$('[data-toggle="tooltip"]').tooltip();
    initializeDatepicker();
    loadingLocalSettings();

    $("#settingSave").click(function () {
        setting.distance = $("#settingDistance").val();
        setting.filter = $("input[name='options']:checked").val();
        setting.stopping = $("#settingStopping").val();
        setting.point = $("#settingPoint").val();
        saveSetting(settingName, JSON.stringify(setting));
        //$("#settingSave").attr("disabled", true);
        showDialog("��ʾ", "�����ѱ��棬��Щ���ý�������һ����֮��ʼ��Ч��");
    });

    $("#settingExport").click(function () {
        confirmDialog("����������Ϣ���ļ�", "����ҳ���е�������Ϣ�����������ļ���������������ļ�ʻԱ���ݣ���֮�����������ļ�����д򿪲��������ͬ�����á�<br /><br /><span class=\"label label-warning\">PS: �������ڶ�̨�������ͬʱ���б�����ĸ���</span>", "��������", "ȡ��", function () {
            if (window.localStorage) {
                var result = JSON.stringify(setting, function (key, value) {
                    // Ƶ�յ�����
                    if (key == "points" || key == "polyline" || key == "trace") {
                        return undefined;
                    } else {
                        return value;
                    }
                }, "\t");
                // Save as file
                var url = "data:application/json;base64," + btoa(unescape(encodeURIComponent(result)));
                // var str2 = decodeURIComponent(escape(window.atob(b64_string)));
                chrome.downloads.download({
                    url: url,
                    conflictAction: 'uniquify',
                    //saveAs: false,
                    filename: "ythtwl_setting.json"
                });
            } else {
                showDialog("��ʾ", "�������֧�ֱ������ݻ��棬�޷������������ݡ�");
            }
        }, function () { });
    });

    $("#importFile").on("change", function (event) {
        if (window.localStorage) {
            // ���������ļ�
            var selectedFile = document.getElementById("importFile").files[0];

            //�����Ǻ��ģ�������ȡ��������������ɵġ�
            var reader = new FileReader();
            //��ȡ�ļ�������
            reader.readAsText(selectedFile);

            reader.onload = function () {
                //����ȡ���֮���ص����������Ȼ���ʱ�ļ������ݴ洢����result�С�ֱ�Ӳ������ɡ�
                var result = this.result;
                setting = JSON.parse(result);
                saveSetting(settingName, JSON.stringify(setting));
                // ������ʾ�����������Ϣ
                loadingLocalSettings();
                // ������ȡһ�γ����б�֮��ͻ���ʾ��ȷ������
                if (null != timeoutHandler) {
                    clearTimeout(timeoutHandler);
                }
                loadingTrucks();
                // ����ļ�ѡ����
                event.target.value = "";
            };
        } else {
            showDialog("��ʾ", "�������֧�ֱ������ݻ��棬�޷����������ļ���");
        }
    });

    $("#settingImport").click(function () {
        confirmDialog("���õ�����֪", "Ϊ�˱�֤���ݵ�Ψһ�Ժ�׼ȷ�ԣ���ȷ���������ͬһʱ��ֻ��һ̨������еĸ������ڻ״̬(�������ͬʱ����Ŀǰ��ʱֻ��Ӱ�쵽�ֻ��˵�����)��", "��������", "ȡ��", function () {
            $("#importFile").click();
        }, function () { });
    });

    // ����ѡ��
    $("a[id^='classType']").click(function () {
        var id = $(this).prop("id");
        if (id.indexOf("Moning") >= 0) {
            $("#classTypeName").text("���");
            $("#classTypeValue").val("moning");
        } else if (id.indexOf("Evening") >= 0) {
            $("#classTypeName").text("���");
            $("#classTypeValue").val("evening");
        } else if (id.indexOf("Full")) {
            $("#classTypeName").text("ȫ��");
            $("#classTypeValue").val("full");
        }
    });

    $("#exportExcel").click(function () {
        var date = $("#statisticalDate").val();
        // ����ͳ�ƽ����excel
        tableToExcel("tableStatistical", "����ͳ��", "ͳ��" + date + $("#statisticalLicense").val() + ".xls");
    });

    function fetchingAddress() {
        var spans = $("#truckStopPointList tr td span");
        if (spans.length > 0) {
            var span = spans[0];
            $(span).prev().show();
            $(span).text("���ڻ�ȡ��ַ...");
            var obj = $(span).parent();
            var trs = $("#truckStopPointList tr").length;
            $("#truckStopPoints").scrollTop((trs - spans.length) * 35);
            var pnt = new AMap.LngLat($(obj).data("lng"), $(obj).data("lat"));
            getAddress(pnt, function (data) {
                var address = data.regeocode.formattedAddress.replace("ɽ��ʡ��̨��", "");
                obj.text(address);
                if (null != currentStopPointSeekTruck) {
                    // ���õ�ǰ�鿴������ͣ���ص�
                    if (currentStopPointSeekTruck.points.length > 0) {
                        for (var p in currentStopPointSeekTruck.points) {
                            var point = currentStopPointSeekTruck.points[p];
                            // point.pos.lat, point.pos.lng
                            if (isStringNull(point.address) && pnt.lng == point.pos.lng && pnt.lat == point.pos.lat) {
                                point.address = address;
                            }
                        }
                    }
                }
                setTimeout(function () { fetchingAddress(); }, 200);
            }, function () {
                $(span).prev().hide();
                $(span).text("�����ȡ��ַ");
                showDialog("�����", "��ȡ��ַʧ�ܣ����Ժ�����...");
            });
        } else {
            //tableToExcel("tableStoppingPoints", "ͣ����¼", $("#statisticalDate").val() + $("#currentTruck").val() + "ͣ����.xls");
        }
    }

    $("#exportStoppingPointsToExcel").click(function () {
        fetchingAddress();
    });

    loadingTrucks();

    $("#statisticalButton").click(function () {
        $(this).attr("disabled", true);
        // ͳ��ָ�������Ĺ������
        var license = $("#statisticalLicense").val().toUpperCase();
        dayWorkSeekingTrucks = $.grep(setting.vehicles, function (truck) {
            return truck.license.indexOf(license) >= 0;
        });
        if (dayWorkSeekingTrucks.length > 0) {
            // �ֶ���ѯ��
            isDayWorkManualSeeking = true;
            prepareDayWorkSeeking();
        } else {
            showDialog("��ʾ", "û���ҵ����ơ�" + license + "���ĳ�����");
            $("table tbody:eq(2)").html("<tr><td colspan=\"9\">û���ҵ����ơ�" + license + "���ĳ�����</td></tr>");
            $(this).attr("disabled", false);
            $("#exportExcel").attr("disabled", true);
        }
    });

    $("#truckMap button:eq(0)").click(function () {
        if (!_is_truck_map_markers_shown) {
            // ��ʾͣ����
            showTruckMapMarkers();
            $(this).children(".far").removeClass("fa-square").addClass("fa-check-square");
        } else {
            // ����ͣ����
            hideTruckMapMarkers();
            $(this).children(".far").removeClass("fa-check-square").addClass("fa-square");
        }
    });

    $("#truckMap button:eq(1)").click(function () {
        // fas fa-pause-circle 
        // fas fa-play-circle
        // ���Ŷ���
        if (null != _truck_map_tracking_marker) {
            if (!_truck_map_tracking_playing) {
                _truck_map_tracking_marker.on("movealong", function () {
                    // �ƶ�����
                    $("#truckMap button:eq(2)").attr("disabled", "true");
                    // ��Ϊ������ģʽ
                    _truck_map_tracking_playing = false;
                    _truck_map_tracking_pause = false;
                    $("#truckMap button:eq(1) .fas").removeClass("fa-pause-circle").addClass("fa-play-circle").text(" ����");
                    console.log("on move along, stop tracking.");
                });
                _truck_map_tracking_marker.moveAlong(_truck_map_tracking_marker_path, 4000);
                _truck_map_tracking_playing = true;
                _truck_map_tracking_pause = false;
                // ����Ϊ����ͣģʽ
                $("#truckMap button:eq(1) .fas").removeClass("fa-play-circle").addClass("fa-pause-circle").text(" ��ͣ");
                $("#truckMap button:eq(2)").removeAttr("disabled");
                console.log("start tracking.");
            } else {
                // ������ڲ��ţ���û����ͣʱ����ͣ
                if (!_truck_map_tracking_pause) {
                    // ��ͣ
                    _truck_map_tracking_marker.pauseMove();
                    _truck_map_tracking_pause = true;
                    // ��Ϊ������ģʽ
                    $("#truckMap button:eq(1) .fas").removeClass("fa-pause-circle").addClass("fa-play-circle").text(" ����");
                    console.log("pause tracking.");
                } else {
                    // ����
                    _truck_map_tracking_marker.resumeMove();
                    _truck_map_tracking_pause = false;
                    // ��������ͣ
                    $("#truckMap button:eq(1) .fas").removeClass("fa-play-circle").addClass("fa-pause-circle").text(" ��ͣ");
                    console.log("resume tracking.");
                }
            }
        }
    });

    $("#truckMap button:eq(2)").click(function () {
        // ֹͣ����
        if (null != _truck_map_tracking_marker) {
            _truck_map_tracking_marker.stopMove();
        }
        $(this).attr("disabled", "true");
        // ��Ϊ������ģʽ
        _truck_map_tracking_playing = false;
        _truck_map_tracking_pause = false;
        $("#truckMap button:eq(1) .fas").removeClass("fa-pause-circle").addClass("fa-play-circle").text(" ����");
        console.log("manual stop tracking.");
    });

    $("table tbody:eq(2)").on("click", "td", function () {
        //if ($(this).children("td").length < 2) { return; }
        if ($(this).html().indexOf("<u>") < 0) {
            return;
        }
        var ido = $(this).attr("id");
        if (isStringNull(ido)) {
            return;
        }
        var id = ido.replace("a_", "").replace("p_", "");
        var truck = getVehicle(id);
        if (null != truck) {
            currentStopPointSeekTruck = truck;
            if (ido.indexOf("p_") >= 0) {
                $("#currentTruck").val($(this).parent().children("td:eq(1)").text());
                $("#currentTruckId").val(id);
                var date = $("#statisticalDate").val();
                var d = new Date(date.replace(/-/g, "/"));
                $(".modal-title:eq(2)").text("��" + $("#currentTruck").val() + "��" + d.pattern("yyyy��MM��dd��") + getWorkClassTypeName() + "���һ��");
                $(".modal:eq(2)").modal("show");
                $("#truckMap button:eq(1) .fas").removeClass("fa-pause-circle").addClass("fa-play-circle").text(" ����");
                setTimeout(function () { showTrucnStopPoints(truck); }, 500);
                return;
            } else if (ido.indexOf("a_") >= 0) {
                return;
            }
            $(".progress:eq(1)").css("display", "block");
            $("#badge").removeClass("hide");
            $(".modal-title:eq(1)").text("��" + $(this).parent().children("td:eq(1)").text() + "���������һ��");
            //getChartData(seeks[0]);
            var date = $("#statisticalDate").val();
            var begin = getTimestamp(truck.trace[0].RecvTime);
            var end = getTimestamp(truck.trace[truck.trace.length - 1].RecvTime);
            var worker = new Worker("../js/traceWorker.js");
            worker.postMessage({
                trace: truck.trace,
                begin: begin,
                end: end
            });
            worker.onmessage = function (evt) {
                if (evt.data.length < 3) {
                    var per = evt.data[0] / evt.data[1] * 100;
                    $(".progress-bar:eq(1)").html(parseInt(per) + "%").css('width', parseInt(per) + '%').attr('aria-valuenow', per);
                    $(".badge").text(parseInt(per) + "%");
                } else {
                    $(".progress:eq(1)").css("display", "none");
                    $("#badge").addClass("hide");
                    $("#placeholder").CanvasJSChart({
                        theme: "light2", // "light1", "light2", "dark1", "dark2"
                        animationEnabled: true,
                        zoomEnabled: true,
                        data: [{
                            type: "area",
                            dataPoints: evt.data
                        }
                        ],
                        width: 870,
                        toolTip: {
                            enabled: true, //disable here
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
            $(".modal:eq(1)").on('shown.bs.modal', function (e) {
                worker.postMessage(1);
            }).modal('show');
        } else { }
    });

    $("table tbody:eq(3)").on('change paste keyup', 'input', function () {
        var tr = $(this).parent().parent();
        // �ı��������¼�������˾������Ϣ
        var id = $(tr).attr("id").replace("d", "");
        var vehicle = getVehicle(id);

        if (null != vehicle) {
            vehicle.name1 = $(tr).children("td:eq(2)").find("input").val();
            vehicle.phone1 = $(tr).children("td:eq(3)").find("input").val();
            vehicle.name2 = $(tr).children("td:eq(4)").find("input").val();
            vehicle.phone2 = $(tr).children("td:eq(5)").find("input").val();
            // �������ü�¼
            saveSetting(settingName, JSON.stringify(setting));
        }
    });

    $("#truckStopPointList").on("click", "span", function () {
        var span = $(this);
        $(this).prev().show();
        $(this).text("���ڻ�ȡ��ַ...");
        var obj = $(this).parent();
        getAddress(new AMap.LngLat($(obj).data("lng"), $(obj).data("lat")), function (data) {
            var address = data.regeocode.formattedAddress;
            obj.text(address.replace("ɽ��ʡ��̨��", ""));
        }, function () {
            $(span).prev().hide();
            $(span).text("�����ȡ��ַ");
        });
    });
});
