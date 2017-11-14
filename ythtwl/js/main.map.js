// JavaScript source code
var _amap_;
var _amap_markers_ = [];
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

    AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView'], function () {

        _amap_.addControl(new AMap.ToolBar());

        _amap_.addControl(new AMap.Scale());

        //_amap_.addControl(new AMap.OverView({ isOpen: true }));

        //_amap_.addControl(new BasicControl.LayerSwitcher({ position: 'rt' }));
    });
});

// 清理所有标记
function clearMarkers() {
    _amap_.remove(_amap_markers_);
    _amap_markers_ = [];
}

// 添加标记
function addMarker(lat, lng, license, direct) {
    var latlng = GPS.gcj_encrypt(lat, lng);
    var marker = new AMap.Marker({
        position: [latlng.lng, latlng.lat],
        icon: "../images/truck_marker.png",
        angle: direct,
        label: {
            content: license, offset: new AMap.Pixel(20, 20)
        }
    });
    marker.setMap(_amap_);
    _amap_markers_.push(marker);
}

function fitMapView() {
    _amap_.setFitView();
}