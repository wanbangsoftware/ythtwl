// JavaScript source code

var trucks = new Array();
var truckIds = "";
var seekTrucks = new Array();
var seekIndex = 0;
var setting = {
    distance: 50,
    filter: "ignore",
    stopping: 30
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
        showDialog("提示", data.responseText);
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

var htmlTruck = '<tr id="_%id%">' +
    '                <td data-value="%id%" class="center" >%index%</td >' +
    '                <td>%id%</td>' +
    '                <td>%license%</td>' +
    '                <td>%online%</td>' +
    '                <td>%speed% km/h</td>' +
    '                <td><img src="../images/arrow_up_24px.png" class="%direct%" /> %degree%°</td>' +
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
                if (isStringNull(truckIds)) {
                    truckIds = truck.id.replace("l", "");
                } else {
                    truckIds += "," + truck.id.replace("l", "");
                }
                var info = truck.attributes;
                // 保持初始经纬度位置
                truck.pos = new AMap.LngLat(info.Lo / 1000000, info.La / 1000000);
                var html = htmlTruck.replace(/%id%/g, truck.id.replace("l", "")).replace("%index%", index)
                    .replace("%license%", info.PlateNumber).replace("%online%", truck.online ? "在线" : "离线")
                    .replace("%speed%", info.Speed / 10).replace("%direct%", getDirect(info.Direction)).replace("%degree%", formatDirection(info.Direction))
                    .replace("%alarm%", "-").replace("%lon%", truck.pos.getLng()).replace("%lat%", truck.pos.getLat()).replace("%address%", "-");
                $("table tbody:eq(0)").append(html);

                addMarker(truck.pos.getLat(), truck.pos.getLng(), info.PlateNumber, info.Direction);
            }
        });
        fitMapView();
        setTimeout(loadingRealTime, realTimeInterval);
    } else {
        $("table tbody:eq(0)").html("<tr><td colspan=\"11\">没有任何数据，造成的原因可能是数据拉取失败、没有已注册的车辆。</td></tr>");
    }
}

var htmlStatistical = '<tr>' +
    '                      <td data-value="%id%" class="center">%index%</td>' +
    '                      <td>%license%</td>' +
    '                      <td>%date%</td>' +
    '                      <td>%startTime%</td>' +
    '                      <td>%endTime%</td>' +
    '                      <td>%distence% km</td>' +
    '                      <td>%dashboard% km</td>' +
    '                      <td></td>' +
    '                  </tr>';
function getTruckTrace() {
    // 获取指定日期的历史数据
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
                    .replace("%startTime%", "-").replace("%endTime%", "-").replace("%distence%", "0")
                    .replace("%dashboard%", "0");
                $("table tbody:eq(2)").append(html);
            } else {
                var html = htmlStatistical.replace("%index%", seekIndex + 1)
                    .replace("%license%", truck.attributes.PlateNumber).replace("%date%", date);
                //.replace("%startTime%", "-").replace("%endTime%", "-").replace("%distence%", "0");
                var latlng = null;
                var distance = 0, dashboard = 0, lstKm = 0;
                var started = false;
                var endTime = "-";
                for (var i = 0; i < data.length; i++) {
                    var r = data[i];
                    var lat = r.lat / 1000000, lng = r.lng / 1000000;
                    if (null == latlng) {
                        if (r.Speed > 0) {
                            started = true;
                            lstKm = r.Mileage;
                            // 速度变化时才是开始
                            latlng = new AMap.LngLat(lng, lat);
                            html = html.replace("%startTime%", r.RecvTime.substr(11));
                        }
                    } else {
                        var dis = latlng.distance([lng, lat]);
                        //distance += dis;
                        if (r.Speed > 0) {
                            // 车辆启动
                            if (!started) {
                                started = true;
                                lstKm = r.Mileage;
                            }
                        } else {
                            // 没有速度时
                            if (started) {
                                started = false;
                                dashboard += (r.Mileage - lstKm);
                                // 启动状态且此时速度为0则说明这时停车了
                                endTime = r.RecvTime.substr(11);
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
                    if (i + 1 >= data.length) {
                        html = html.replace("%endTime%", endTime);
                    }
                }
                if (html.indexOf("%startTime%") >= 0) {
                    html = html.replace("%startTime%", "-");
                }
                html = html.replace("%distence%", (distance / 1000).toFixed(2));
                html = html.replace("%dashboard%", (dashboard / 10).toFixed(2));
                $("table tbody:eq(2)").append(html);
            }
            // 继续查找下一个
            seekIndex++;
            getTruckTrace();
        }, function (data) {
            showDialog("出错了", "查询失败，请稍候重试");
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
        var obj = getSetting("setting");
        if (!obj || isStringNull(obj)) {
            saveSetting("setting", JSON.stringify(setting));
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
    } else {
        showDialog("提示", "浏览器不支持本地数据缓存。");
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
        // 实时车辆状态，更新车辆列表里的数值
        if (data.hasOwnProperty("Vs") && data.Vs.length > 0) {
            clearMarkers();
            $.each(data.Vs, function (index, item) {
                var pos = new AMap.LngLat(item.lng / 1000000, item.lat / 1000000);
                var tr = $("#_" + item.Id);
                if (null != tr) {
                    // 速度
                    $(tr).children("td:eq(4)").text((item.Speed / 10) + " km/h");
                    //<img src=\"../images/arrow_up_24px.png\" class=\"%direct%\" /> %degree%°
                    $(tr).children("td:eq(5)").html("<img src=\"../images/arrow_up_24px.png\" class=\"%direct%\" /> %degree%°".replace("%direct%", getDirect(item.Direction)).replace("%degree%", formatDirection(item.Direction)));
                    $(tr).children("td:eq(7)").text(pos.getLng());
                    $(tr).children("td:eq(8)").text(pos.getLat());
                }
                addMarker(pos.getLat(), pos.getLng(), $(tr).children("td:eq(2)").text(), item.Direction);
                // 更新车辆的状态
                var seek = $.grep(trucks, function (truck) {
                    return truck.id == "l" + item.Id;
                });
                if (seek.length > 0) {
                    var truck = seek[0];
                    var distance = truck.pos.distance([pos.getLng(), pos.getLat()]);
                    if (distance < setting.distance) {
                        // 位置没有变化，且还未记录停留的标记时
                        if (!truck.hasOwnProperty("stay") || isStringNull(truck.stay)) {
                            // 记录位置没有变化的初始时间
                            truck.stay = item.RecvTime;
                        } else if (!truck.hasOwnProperty("stayReported") || !truck.stayReported) {
                            // 已经开始停留时，查看是否已经汇报过停留警报，如果没有汇报，则记录时间差
                            // 查看位置没有变化的时间间隔
                            var time1 = new Date(Date.parse(truck.stay.replace(/-/g, "/"))).getTime() / 1000;
                            var time2 = new Date(Date.parse(item.RecvTime.replace(/-/g, "/"))).getTime() / 1000;
                            var seconds = time2 - time1;
                            if (seconds / 60 >= setting.stopping) {
                                // 如果停留时间超过预设的间隔时，发送一个警报
                                truck.stayReported = true;
                                sendNimMessage(truck.attributes.PlateNumber, pos.getLat(), pos.getLng(), truck.stay, seconds);
                            }
                        }
                    } else {
                        // 更新位置
                        truck.pos = pos;
                        // 清空位置没有变化的时间记录
                        truck.stay = "";
                        truck.stayReported = false;
                    }
                }
            });
        }
        //fitMapView();
        setTimeout(loadingRealTime, realTimeInterval);
    }, function (data) {
        showDialog("出错了", "查询实时数据失败，请刷新页面重试");
    });
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
        showDialog("提示", "数据已保存，这些设置将会在下一分钟之后开始生效。");
    });

    $("#exportExcel").click(function () {
        var date = $("#statisticalDate").val();
        // 导出统计结果到excel
        tableToExcel("tableStatistical", "运作统计", "统计" + date + $("#statisticalLicense").val() + ".xls");
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
        // 统计指定车辆的工作情况
        var license = $("#statisticalLicense").val();
        seekTrucks = $.grep(trucks, function (truck) {
            return truck.attributes.PlateNumber.indexOf(license) >= 0;
        });
        if (seekTrucks.length > 0) {
            $("table tbody:eq(2)").html("");
            // 有查询结果时可以导出
            $("#exportExcel").attr("disabled", false);
            // 挨个查询并且显示统计结果
            seekIndex = 0;
            getTruckTrace();
        } else {
            showDialog("提示", "没有找到类似『" + license + "』的车辆。");
            $("table tbody:eq(2)").html("<tr><td colspan=\"8\">没有找到类似『" + license + "』的车辆。</td></tr>");
            $(this).attr("disabled", false);
            $("#exportExcel").attr("disabled", true);
        }
    });
});