// JavaScript source code
var _amap_;
var _amap_markers_ = [];
var markerSize = 50;
$(document).ready(function () {
    //var width = $(window).width() - 20;
    //$("#container").width(width);
    //var height = window.innerHeight;
    //var top = $("#container").offset().top;
    //$("#container").height(height - top - 10);
    _amap_ = new AMap.Map('container', {
        zoom: 13
        //center: [116.39, 39.9]
    });

    AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView', 'AMap.MapType', 'AMap.Geolocation'], function () {

        _amap_.addControl(new AMap.ToolBar());

        _amap_.addControl(new AMap.Scale());

        //_amap_.addControl(new AMap.OverView({ isOpen: true }));

        //_amap_.addControl(new BasicControl.LayerSwitcher({ position: 'rt' }));
        //地图类型切换  
        _amap_.addControl(new AMap.MapType({ defaultType: 0, showTraffic: false, showRoad: true }));

        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            showButton: false,
            showMarker: false
        });
        _amap_.addControl(geolocation);
        //geolocation.getCurrentPosition();
    });
});

// 清理所有标记
function clearMarkers() {
    _amap_.remove(_amap_markers_);
    _amap_markers_ = [];
}

// 添加标记
function addMarker(lat, lng, license, direct, icon) {
    //var latlng = GPS.gcj_encrypt(lat, lng);
    var marker = new AMap.Marker({
        position: [lng, lat],
        icon: icon,//"../images/truck_marker.png",
        angle: direct,
        offset: new AMap.Pixel(-25, -25),
        title: license
    });
    marker.on("dblclick", function (evt) {
        _amap_.setZoomAndCenter(17, [evt.lnglat.getLng(), evt.lnglat.getLat()]);
    });
    marker.setMap(_amap_);
    _amap_markers_.push(marker);

    // 车牌号
    var label = new AMap.Marker({
        position: [lng, lat],
        content: "<div class ='license'>" + license + "</div>",
        offset: new AMap.Pixel(10, -11)
    });
    label.setMap(_amap_);
    _amap_markers_.push(label);
}

function fitMapView() {
    _amap_.setFitView();
}

function getAddress(pos, successCallback, faliedCallback) {
    AMap.plugin('AMap.Geocoder', function () {
        var geocoder = new AMap.Geocoder({
            // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
            city: "0535"
        });

        geocoder.getAddress(pos, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                // result为对应的地理位置详细信息
                if ("function" === typeof (successCallback)) {
                    successCallback(result);
                }
            } else if ("function" === typeof (faliedCallback)) {
                faliedCallback(status);
            }
        });
    });
}