// JavaScript source code

// 实时查询所需的车辆id列表
var realTimeTruckIds = "";
/*工作统计时模糊查询的车辆列表*/
var dayWorkSeekingTrucks = new Array();
// 当前统计的索引
var dayWorkSeekingHandleIndex = 0;
// 是否手动查询工作统计，默认false
var isDayWorkManualSeeking = false;
// 是否当前正在进行工作统计
var isDayWorkSeekingHanding = false;
var settingName = "setting";
var timeoutHandler = null;
// 当前正在打开查看停车点和地图的车辆
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
        showDialog("提示", "无法加载车辆列表，请确认您是否已经登录了系统");
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
    '                <td><img src="../images/arrow_up_24px.png" class="%direct%" /> %degree%°</td>' +
    '                <td>%alarm%</td>' +
    '                <td>%lon%</td>' +
    '                <td>%lat%</td>' +
    '                <td class="overflow">%address%</td>' +
    '                <td></td>' +
    '            </tr >';
var htmlDirver = '<tr id="d%id%">' +
    '                <td class="center" style= "vertical-align: middle;" >%index%</td >' +
    '                <td style="vertical-align: middle;">%license%</td>' +
    '                <td><input type="text" class="name" maxlength="4" placeholder="姓名1" value="%name1%" /></td>' +
    '                <td><input type="text" class="phone" maxlength="11" placeholder="电话1" value="%phone1%" /></td>' +
    '                <td><input type="text" class="name" maxlength="4" placeholder="姓名2" value="%name2%" /></td>' +
    '                <td><input type="text" class="phone" maxlength="11" placeholder="电话2" value="%phone2%" /></td>' +
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
                // 更新车辆的信息
                vehicle.online = truck.online;
                vehicle.speed = truck.attributes.Speed;
                vehicle.alarm = truck.attributes.Alarm;
                vehicle.direction = truck.attributes.Direction;
                var latlng = GPS.gcj_encrypt(truck.attributes.La / 1000000, truck.attributes.Lo / 1000000);
                vehicle.lat = latlng.lat;
                vehicle.lng = latlng.lng;

                var html = htmlTruck.replace(/%id%/g, tid).replace("%index%", index).replace("%time%", "-")
                    .replace("%license%", vehicle.license).replace("%online%", vehicle.online ? "在线" : "离线")
                    .replace("%speed%", vehicle.speed / 10).replace("%direct%", getDirect(vehicle.direction)).replace("%degree%", formatDirection(vehicle.direction))
                    .replace("%alarm%", "-").replace("%lon%", vehicle.lng.toFixed(6)).replace("%lat%", vehicle.lat.toFixed(6)).replace("%address%", vehicle.address);
                $("table tbody:eq(0)").append(html);

                if (vehicle.lat > 0 && vehicle.lng > 0) {
                    // 经纬度为0的不显示到地图上
                    addMarker(vehicle.lat, vehicle.lng, vehicle.license, vehicle.direction, getMarkerIcon(vehicle.alarm, null, 0, vehicle.speed));
                }

                // 匹配司机信息
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
        // 保存设置记录
        saveSetting(settingName, JSON.stringify(setting));
        fitMapView();
        timeoutHandler = setTimeout(loadingRealTime, realTimeInterval);
    } else {
        $("table tbody:eq(0)").html("<tr><td colspan=\"11\">没有任何数据，造成的原因可能是数据拉取失败、没有已注册的车辆。</td></tr>");
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
    // 获取指定日期的历史数据
    if (dayWorkSeekingHandleIndex < dayWorkSeekingTrucks.length) {
        var data = {};
        var truck = dayWorkSeekingTrucks[dayWorkSeekingHandleIndex];
        // 停车点清空
        truck.points = new Array();
        var date = $("#statisticalDate").val();
        var clazz = $("#classTypeValue").val();
        if (!isDayWorkManualSeeking) {
            // 如果是自动查询的，则需要查询整天的工作
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
                // 先通过Time排序，然后查看Time跟ReceiveTime不匹配的记录
                data = jLinq.from(data).sort("Time").select();
                for (var i in data) {
                    var item = data[i];
                    if (item.Time.indexOf(date) >= 0) {
                        break;
                    } else {
                        // 接收时间跟发送时间不一样时，填充为接收时间
                        item.Time = item.RecvTime;
                    }
                }
                // 重新按照服务器接收时间排序
                data = jLinq.from(data).sort("Time").select();
                truck.trace = data;
                truck.polyline = [];
                // 当天第一次启动时的位置，以此来判断当天干活来回了几趟
                var bPos = null;
                // 当天第一次启动的时间戳
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
                            // 速度变化时才是开始
                            if (null == bPos) {
                                bPos = new AMap.LngLat(lng, lat);
                                cycled = false;
                                bTimestamp = timestamp;
                            }
                            // 最后启动时间
                            lastStartTimestamp = timestamp;
                            html = html.replace("%startTime%", r.Time.substr(11));
                        }
                    } else {
                        var dis = latlng.distance([lng, lat]);
                        //distance += dis;
                        if (r.Speed > 0) {
                            // 车辆启动
                            if (!started) {
                                started = true;
                                lstKm = r.Mileage;
                                if (null == bPos) {
                                    bPos = new AMap.LngLat(lng, lat);
                                    bTimestamp = timestamp;
                                    cycled = false;
                                }
                                // 最后启动时间
                                lastStartTimestamp = timestamp;
                                html = html.replace("%startTime%", r.Time.substr(11));

                                // 从停车状态到启动状态，判断停车点的停车时间
                                if (truck.points.length > 0) {
                                    // 如果有停车点
                                    var point = truck.points[truck.points.length - 1];
                                    point.stoppingTime = timestamp - getTimestamp(point.StopTime);
                                    point.RestartTime = r.Time;
                                }
                            } else {
                                // 如果处于启动状态，则累计开车时间
                                driveTime += timestamp - lastStartTimestamp;
                                // 最后启动时间
                                lastStartTimestamp = timestamp;
                            }
                        } else {
                            // 没有速度时
                            if (started) {
                                started = false;
                                dashboard += (r.Mileage - lstKm);
                                // 启动状态且此时速度为0则说明这时停车了
                                endTime = r.Time.substr(11);
                                // 启动之后的停止，需要累加开车时间
                                driveTime += timestamp - lastStartTimestamp;
                                lastStartTimestamp = timestamp;

                                var point = {};
                                // 停车地点
                                point.pos = new AMap.LngLat(lng, lat);
                                // 停车时间
                                point.StopTime = r.Time;
                                // 再次启动时间
                                point.RestartTime = "";
                                // 停车时长
                                point.stoppingTime = 0;
                                // 停车地点
                                point.address = "";
                                // 加入停车点列表
                                truck.points.push(point);
                            } else {
                                // 累计没有速度时，要统计停车点
                            }
                        }
                        if (dis < setting.distance) {
                            // 移动距离没有变化，行程不累加
                            if (setting.filter == "count") {
                                distance += dis;
                            }
                        } else {
                            distance += dis;
                            // 重置新的位置点
                            latlng = new AMap.LngLat(lng, lat);
                        }
                    }
                    if (null != bPos) {
                        // 当前第一次启动过了，则判断后续的定位信息是否在第一次启动的点附近
                        thisTimestamp = timestamp;
                        if (thisTimestamp - bTimestamp >= 20 * 60) {
                            // 启动时间超过20分钟之后开始统计来回趟数
                            var bDis = bPos.distance([lng, lat]);
                            if (bDis <= 1000) {
                                // 返回到当天第一次启动时位置的1km范围内说明出去干活完成了一趟回来了
                                if (!cycled) {
                                    cycled = true;
                                    // 干活往返趟数+1
                                    activity += 1;
                                    // 重置启动时间为当前时间
                                    bTimestamp = thisTimestamp;
                                }
                            } else {
                                // 又出去干活了
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
                html = html.replace("%driveTime%", ((driveHours > 0 ? (driveHours + "小时") : "") + (driveMinutes > 0 ? (driveMinutes + "分") : (driveHours > 0 ? "" : "-"))));
                if (isDayWorkManualSeeking) {
                    // 是手动统计查询的统计记录才显示到表格里
                    $("table tbody:eq(2)").append(html);
                } else {
                    // 不是手动查询的，此时需要发送消息到app端
                    sendNimMessage(truck);
                }
            }
            // 继续查找下一个
            dayWorkSeekingHandleIndex++;

            // 保存设置记录
            saveSetting(settingName, JSON.stringify(setting));

            var per = dayWorkSeekingHandleIndex / dayWorkSeekingTrucks.length * 100;
            $(".progress-bar:eq(0)").html(parseInt(per) + "%").css('width', parseInt(per) + '%').attr('aria-valuenow', per);

            getTruckTrace();
        }, function (data) {
            // 出错时，也置工作统计结束
            isDayWorkSeekingHanding = false;
            // 清空查询车辆列表
            dayWorkSeekingTrucks.length = 0;

            showDialog("出错了", "查询失败，请稍候重试", function () {
                $(".modal:eq(0)").modal("hide");
            });
            $("#statisticalButton").attr("disabled", false);
        });
    } else {
        // 工作统计结束
        isDayWorkSeekingHanding = false;
        // 清空查询的车辆列表
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
        // 移动距离限制
        $("#settingDistance").val(setting.distance);
        // 是否过滤移动距离小的记录
        $("input[type='radio'][name='options'][value='" + setting.filter + "']").attr("checked", true).parent().addClass("active");
        $("input[type='radio'][name='options'][value!='" + setting.filter + "']").attr("checked", false).parent().removeClass("active");
        // 停车时限
        $("#settingStopping").val(setting.stopping);
        // 停车点
        $("#settingPoint").val(setting.point);
    } else {
        showDialog("提示", "浏览器不支持本地数据缓存。");
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
        // 实时车辆状态，更新车辆列表里的数值
        if (data.hasOwnProperty("Vs") && data.Vs.length > 0) {
            clearMarkers();
            if (!isDayWorkSeekingHanding) {
                // 如果当前没有拉取数据，则清空待分析车辆列表
                dayWorkSeekingTrucks.length = 0;
            }
            $.each(data.Vs, function (index, item) {
                var gos = GPS.gcj_encrypt(item.lat / 1000000, item.lng / 1000000);;
                var pos = new AMap.LngLat(gos.lng, gos.lat);
                var tr = $("#_" + item.Id);
                if (null != tr) {
                    var time = item.RecvTime;
                    $(tr).children("td:eq(4)").text(isStringNull(time) ? "-" : time.substr(11));
                    // 速度
                    $(tr).children("td:eq(5)").text((item.Speed / 10) + " km/h");
                    //<img src=\"../images/arrow_up_24px.png\" class=\"%direct%\" /> %degree%°
                    $(tr).children("td:eq(6)").html("<img src=\"../images/arrow_up_24px.png\" class=\"%direct%\" /> %degree%°".replace("%direct%", getDirect(item.Direction)).replace("%degree%", formatDirection(item.Direction)));
                    $(tr).children("td:eq(8)").text(pos.getLng().toFixed(6));
                    $(tr).children("td:eq(9)").text(pos.getLat().toFixed(6));
                }
                addMarker(pos.getLat(), pos.getLng(), $(tr).children("td:eq(2)").text(), item.Direction, getMarkerIcon(item.Alarm, item.ALarm2, item.LossTime, item.Speed));
                // 更新车辆的状态
                var truck = getVehicle(item.Id);
                if (null != truck) {
                    var oPos = new AMap.LngLat(truck.lng, truck.lat);
                    var distance = oPos.distance([pos.getLng(), pos.getLat()]);
                    if (distance < setting.distance) {
                        // 位置没有变化，且还未记录停留的标记时
                        if (!truck.hasOwnProperty("stay") || isStringNull(truck.stay)) {
                            // 记录位置没有变化的初始时间
                            truck.stay = item.RecvTime;
                        } else if (!truck.hasOwnProperty("stayReported") || !truck.stayReported) {
                            // 更新位置
                            truck.lng = pos.getLng();
                            truck.lat = pos.getLat();
                            // 已经开始停留时，查看是否已经汇报过停留警报，如果没有汇报，则记录时间差
                            // 查看位置没有变化的时间间隔
                            var time1 = getTimestamp(truck.stay);
                            var time2 = getTimestamp(item.RecvTime);
                            var seconds = time2 - time1;
                            if (seconds / 60 >= setting.stopping) {
                                if (!isDayWorkSeekingHanding) {
                                    // 如果停留时间超过预设的间隔时，发送一个警报
                                    truck.stayReported = true;
                                    truck.stayLength = seconds;
                                    // 设置为非手动查询模式，此时查询完毕之后
                                    isDayWorkManualSeeking = false;
                                    // 如果当前没有进行历史记录查询，则将当前车辆加入队列等待查询分析停车记录后再发送到手机app端
                                    dayWorkSeekingTrucks.push(truck);
                                    //sendNimMessage(truck, seconds);
                                }
                            }
                        }
                    } else {
                        // 更新位置
                        truck.lng = pos.getLng();
                        truck.lat = pos.getLat();
                        // 清空位置没有变化的时间记录
                        truck.stay = "";
                        truck.stayReported = false;
                    }
                    truck.alarm = item.Alarm;
                    truck.speed = item.Speed;
                    truck.direct = item.Direction;
                    truck.mileage = item.Mileage;
                }
            });
            // 如果有需要统计停车点的，此时开始统计
            if (!isDayWorkSeekingHanding && dayWorkSeekingTrucks.length > 0) {
                prepareDayWorkSeeking();
            }
        }
        //fitMapView();
        timeoutHandler = setTimeout(loadingRealTime, realTimeInterval);
    }, function (data) {
        showDialog("出错了", "查询实时数据失败，请刷新页面重试");
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
var truck_address_fetching = '<img src="../images/loading.gif" style="display: none; width: 18px;" /><span style="cursor: pointer;">点击获取地址</span>';
function showTrucnStopPoints(truck) {
    clearTruckMapPolyline();
    clearTruckMapMarkers();
    var tbody = $("#truckStopPointList");
    tbody.html("");
    // 显示轨迹
    if (truck.trace.length > 0) {
        showTruckTrack(truck.polyline);
        fitTruckMapView();
    }
    if (truck.points.length <= 0) {
        tbody.append("<tr><td colspan=\"5\">没有统计到任何停车点。</td></tr>");
    } else {
        for (var i in truck.points) {
            var point = truck.points[i];
            addTruckMapMarker(point.pos.lat, point.pos.lng, point.StopTime.substr(11));
            var hours = parseInt(point.stoppingTime / 3600);
            var minutes = parseInt((point.stoppingTime % 3600) / 60);
            var seconds = point.stoppingTime % 60;
            var html = truck_stopping_point.replace("%index%", parseInt(i) + 1)
                .replace("%stopAt%", point.StopTime.substr(11)).replace("%startAt%", !isStringNull(point.RestartTime) ? point.RestartTime.substr(11) : "")
                .replace("%stopTimes%", ((hours > 0 ? (hours + "小时") : "") + (minutes > 0 ? (minutes + "分") : "") + (seconds > 0 ? (seconds + "秒") : "")))
                .replace("%address%", (isStringNull(point.address) ? truck_address_fetching : point.address)).replace("%longitude%", point.pos.lng).replace("%latitude%", point.pos.lat);
            tbody.append(html);
        }
    }
    fitTruckMapView();
}

function getWorkClassTypeName() {
    var v = $("#classTypeValue").val();
    var type = "早班";
    if (v.indexOf("evening") >= 0) {
        type = "晚班";
    } else if (v.indexOf("full") >= 0) {
        type = "全天";
    }
    return type;
}

function prepareDayWorkSeeking() {
    // 设置当前正在手动统计工作记录，实时汇报要等到这个列表处理完才能进行
    isDayWorkSeekingHanding = true;
    $("table tbody:eq(2)").html("");
    // 有查询结果时可以导出
    $("#exportExcel").attr("disabled", false);
    // 挨个查询并且显示统计结果
    $(".progress-bar:eq(0)").html("0%").css("width", "0%").attr("aria-valuenow", 0);
    if (isDayWorkManualSeeking) {
        // 手动查询时显示进度条
        $(".modal:eq(0)").modal("show");
    }
    dayWorkSeekingHandleIndex = 0;
    getTruckTrace();
}

$(document).ready(function () {

    // 适配所有div
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
        showDialog("提示", "数据已保存，这些设置将会在下一分钟之后开始生效。");
    });

    $("#settingExport").click(function () {
        confirmDialog("导出配置信息到文件", "将本页面中的配置信息导出到本地文件（包括您已输入的驾驶员数据），之后可以在另外的计算机中打开插件导入相同的配置。<br /><br /><span class=\"label label-warning\">PS: 不建议在多台计算机中同时运行本插件的副本</span>", "继续导出", "取消", function () {
            if (window.localStorage) {
                var result = JSON.stringify(setting, function (key, value) {
                    // 频闭掉数组
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
                showDialog("提示", "浏览器不支持本地数据缓存，无法导出配置内容。");
            }
        }, function () { });
    });

    $("#importFile").on("change", function (event) {
        if (window.localStorage) {
            // 导入配置文件
            var selectedFile = document.getElementById("importFile").files[0];

            //这里是核心！！！读取操作就是由它完成的。
            var reader = new FileReader();
            //读取文件的内容
            reader.readAsText(selectedFile);

            reader.onload = function () {
                //当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。直接操作即可。
                var result = this.result;
                setting = JSON.parse(result);
                saveSetting(settingName, JSON.stringify(setting));
                // 重新显示载入的配置信息
                loadingLocalSettings();
                // 重新拉取一次车辆列表，之后就会显示正确的内容
                if (null != timeoutHandler) {
                    clearTimeout(timeoutHandler);
                }
                loadingTrucks();
                // 清空文件选择器
                event.target.value = "";
            };
        } else {
            showDialog("提示", "浏览器不支持本地数据缓存，无法导入配置文件。");
        }
    });

    $("#settingImport").click(function () {
        confirmDialog("配置导入须知", "为了保证数据的唯一性和准确性，请确保本插件在同一时刻只有一台计算机中的副本处于活动状态(多个副本同时运行目前暂时只会影响到手机端的数据)。", "继续导入", "取消", function () {
            $("#importFile").click();
        }, function () { });
    });

    // 早班班选择
    $("a[id^='classType']").click(function () {
        var id = $(this).prop("id");
        if (id.indexOf("Moning") >= 0) {
            $("#classTypeName").text("早班");
            $("#classTypeValue").val("moning");
        } else if (id.indexOf("Evening") >= 0) {
            $("#classTypeName").text("晚班");
            $("#classTypeValue").val("evening");
        } else if (id.indexOf("Full")) {
            $("#classTypeName").text("全天");
            $("#classTypeValue").val("full");
        }
    });

    $("#exportExcel").click(function () {
        var date = $("#statisticalDate").val();
        // 导出统计结果到excel
        tableToExcel("tableStatistical", "运作统计", "统计" + date + $("#statisticalLicense").val() + ".xls");
    });

    function fetchingAddress() {
        var spans = $("#truckStopPointList tr td span");
        if (spans.length > 0) {
            var span = spans[0];
            $(span).prev().show();
            $(span).text("正在获取地址...");
            var obj = $(span).parent();
            var trs = $("#truckStopPointList tr").length;
            $("#truckStopPoints").scrollTop((trs - spans.length) * 35);
            var pnt = new AMap.LngLat($(obj).data("lng"), $(obj).data("lat"));
            getAddress(pnt, function (data) {
                var address = data.regeocode.formattedAddress.replace("山东省烟台市", "");
                obj.text(address);
                if (null != currentStopPointSeekTruck) {
                    // 设置当前查看车辆的停车地点
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
                $(span).text("点击获取地址");
                showDialog("出错喽", "获取地址失败，请稍后再试...");
            });
        } else {
            //tableToExcel("tableStoppingPoints", "停车记录", $("#statisticalDate").val() + $("#currentTruck").val() + "停车点.xls");
        }
    }

    $("#exportStoppingPointsToExcel").click(function () {
        fetchingAddress();
    });

    loadingTrucks();

    $("#statisticalButton").click(function () {
        $(this).attr("disabled", true);
        // 统计指定车辆的工作情况
        var license = $("#statisticalLicense").val().toUpperCase();
        dayWorkSeekingTrucks = $.grep(setting.vehicles, function (truck) {
            return truck.license.indexOf(license) >= 0;
        });
        if (dayWorkSeekingTrucks.length > 0) {
            // 手动查询的
            isDayWorkManualSeeking = true;
            prepareDayWorkSeeking();
        } else {
            showDialog("提示", "没有找到类似『" + license + "』的车辆。");
            $("table tbody:eq(2)").html("<tr><td colspan=\"9\">没有找到类似『" + license + "』的车辆。</td></tr>");
            $(this).attr("disabled", false);
            $("#exportExcel").attr("disabled", true);
        }
    });

    $("#truckMap button:eq(0)").click(function () {
        if (!_is_truck_map_markers_shown) {
            // 显示停车点
            showTruckMapMarkers();
            $(this).children(".far").removeClass("fa-square").addClass("fa-check-square");
        } else {
            // 隐藏停车点
            hideTruckMapMarkers();
            $(this).children(".far").removeClass("fa-check-square").addClass("fa-square");
        }
    });

    $("#truckMap button:eq(1)").click(function () {
        // fas fa-pause-circle 
        // fas fa-play-circle
        // 播放动画
        if (null != _truck_map_tracking_marker) {
            if (!_truck_map_tracking_playing) {
                _truck_map_tracking_marker.on("movealong", function () {
                    // 移动结束
                    $("#truckMap button:eq(2)").attr("disabled", "true");
                    // 设为待播放模式
                    _truck_map_tracking_playing = false;
                    _truck_map_tracking_pause = false;
                    $("#truckMap button:eq(1) .fas").removeClass("fa-pause-circle").addClass("fa-play-circle").text(" 播放");
                    console.log("on move along, stop tracking.");
                });
                _truck_map_tracking_marker.moveAlong(_truck_map_tracking_marker_path, 4000);
                _truck_map_tracking_playing = true;
                _truck_map_tracking_pause = false;
                // 设置为待暂停模式
                $("#truckMap button:eq(1) .fas").removeClass("fa-play-circle").addClass("fa-pause-circle").text(" 暂停");
                $("#truckMap button:eq(2)").removeAttr("disabled");
                console.log("start tracking.");
            } else {
                // 如果正在播放，且没有暂停时则暂停
                if (!_truck_map_tracking_pause) {
                    // 暂停
                    _truck_map_tracking_marker.pauseMove();
                    _truck_map_tracking_pause = true;
                    // 设为待播放模式
                    $("#truckMap button:eq(1) .fas").removeClass("fa-pause-circle").addClass("fa-play-circle").text(" 继续");
                    console.log("pause tracking.");
                } else {
                    // 继续
                    _truck_map_tracking_marker.resumeMove();
                    _truck_map_tracking_pause = false;
                    // 继续待暂停
                    $("#truckMap button:eq(1) .fas").removeClass("fa-play-circle").addClass("fa-pause-circle").text(" 暂停");
                    console.log("resume tracking.");
                }
            }
        }
    });

    $("#truckMap button:eq(2)").click(function () {
        // 停止动画
        if (null != _truck_map_tracking_marker) {
            _truck_map_tracking_marker.stopMove();
        }
        $(this).attr("disabled", "true");
        // 设为待播放模式
        _truck_map_tracking_playing = false;
        _truck_map_tracking_pause = false;
        $("#truckMap button:eq(1) .fas").removeClass("fa-pause-circle").addClass("fa-play-circle").text(" 播放");
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
                $(".modal-title:eq(2)").text("【" + $("#currentTruck").val() + "】" + d.pattern("yyyy年MM月dd日") + getWorkClassTypeName() + "情况一览");
                $(".modal:eq(2)").modal("show");
                $("#truckMap button:eq(1) .fas").removeClass("fa-pause-circle").addClass("fa-play-circle").text(" 播放");
                setTimeout(function () { showTrucnStopPoints(truck); }, 500);
                return;
            } else if (ido.indexOf("a_") >= 0) {
                return;
            }
            $(".progress:eq(1)").css("display", "block");
            $("#badge").removeClass("hide");
            $(".modal-title:eq(1)").text("【" + $(this).parent().children("td:eq(1)").text() + "】运作情况一览");
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
                                return getTimestamp(point.x * 1000).substr(11) + " " + (point.y <= 0 ? "停车" : ("<strong>" + point.y + "km/h</strong>"));
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
        // 文本框输入事件，保存司机的信息
        var id = $(tr).attr("id").replace("d", "");
        var vehicle = getVehicle(id);

        if (null != vehicle) {
            vehicle.name1 = $(tr).children("td:eq(2)").find("input").val();
            vehicle.phone1 = $(tr).children("td:eq(3)").find("input").val();
            vehicle.name2 = $(tr).children("td:eq(4)").find("input").val();
            vehicle.phone2 = $(tr).children("td:eq(5)").find("input").val();
            // 保存设置记录
            saveSetting(settingName, JSON.stringify(setting));
        }
    });

    $("#truckStopPointList").on("click", "span", function () {
        var span = $(this);
        $(this).prev().show();
        $(this).text("正在获取地址...");
        var obj = $(this).parent();
        getAddress(new AMap.LngLat($(obj).data("lng"), $(obj).data("lat")), function (data) {
            var address = data.regeocode.formattedAddress;
            obj.text(address.replace("山东省烟台市", ""));
        }, function () {
            $(span).prev().hide();
            $(span).text("点击获取地址");
        });
    });
});
