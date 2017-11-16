// JavaScript source code
var _amap_;
var _amap_markers_ = [];
var markerSize = 50;
$(document).ready(function () {
    var width = $(window).width() - 20;
    $("#container").width(width);
    var height = window.innerHeight;
    var top = $("#container").offset().top;
    $("#container").height(height - top - 10);
    _amap_ = new AMap.Map('container', {
        zoom: 14
        //center: [116.39, 39.9]
    });

    AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView', 'AMap.MapType'], function () {

        _amap_.addControl(new AMap.ToolBar());

        _amap_.addControl(new AMap.Scale());

        //_amap_.addControl(new AMap.OverView({ isOpen: true }));

        //_amap_.addControl(new BasicControl.LayerSwitcher({ position: 'rt' }));
        //地图类型切换  
        _amap_.addControl(new AMap.MapType({ defaultType: 0, showTraffic: false, showRoad: true }));
    });
});

// 清理所有标记
function clearMarkers() {
    _amap_.remove(_amap_markers_);
    _amap_markers_ = [];
}

// 添加标记
function addMarker(lat, lng, license, direct, icon) {
    var latlng = GPS.gcj_encrypt(lat, lng);
    var marker = new AMap.Marker({
        position: [latlng.lng, latlng.lat],
        icon: icon,//"../images/truck_marker.png",
        angle: direct,
        offset: new AMap.Pixel(-25, -25),
        title: license
    });
    marker.setMap(_amap_);
    _amap_markers_.push(marker);

    // 车牌号
    var label = new AMap.Marker({
        position: [latlng.lng, latlng.lat],
        content: "<div class ='license'>" + license + "</div>",
        offset: new AMap.Pixel(10, -11)
    });
    label.setMap(_amap_);
    _amap_markers_.push(label);
}

function fitMapView() {
    _amap_.setFitView();
}