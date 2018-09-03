// 单独车辆的地图元素控制内容
var _truck_map;
var _truck_map_track = null;
var _truck_map_markers = [];
var _is_truck_map_markers_shown = false;

var _truck_map_tracking_marker = null;
var _truck_map_tracking_marker_path = [];
var _truck_map_tracking_playing = false, _truck_map_tracking_pause = false;

$(document).ready(function () {
    _truck_map = new AMap.Map('containerTruckMap', {
        zoom: 13
        //center: [116.39, 39.9]
    });
    AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView', 'AMap.MapType', 'AMap.Geolocation', 'AMap.GraspRoad'], function () {

        _truck_map.addControl(new AMap.ToolBar());

        _truck_map.addControl(new AMap.Scale());

        //_truck_map.addControl(new AMap.OverView({ isOpen: true }));

        //_truck_map.addControl(new BasicControl.LayerSwitcher({ position: 'rt' }));
        //地图类型切换
        _truck_map.addControl(new AMap.MapType({
            defaultType: 0,
            showTraffic: false,
            showRoad: true
        }));

        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, //是否使用高精度定位，默认:true
            timeout: 10000, //超过10秒后停止定位，默认：无穷大
            showButton: false,
            showMarker: false
        });
        _truck_map.addControl(geolocation);
        //geolocation.getCurrentPosition();
    });
});

function fitTruckMapView() {
    _truck_map.setFitView();
}

function clearTruckMapPolyline() {
    if (null != _truck_map_track) {
        _truck_map.remove(_truck_map_track);
    }
    if (null != _truck_map_tracking_marker) {
        _truck_map.remove(_truck_map_tracking_marker);
    }
}

function showTruckTrack(points) {
    clearTruckMapPolyline();

    _truck_map_track = new AMap.Polyline({
        path: points,
        strokeColor: "blue",
        lineJoin: "round"
    });
    _truck_map.add(_truck_map_track);
    _truck_map.setFitView();

    _truck_map_tracking_marker = new AMap.Marker({
        position: [points[0].lng, points[0].lat],
        icon: "../images/truck_marker_tracker.png",
        offset: new AMap.Pixel(-25, -25),
        autoRotation: true
    });
    _truck_map_tracking_marker.setMap(_truck_map);
    _truck_map_tracking_marker_path = points;
}

function addTruckMapMarker(lat, lng, time) {
    var latlng = GPS.gcj_encrypt(lat, lng);
    var marker = new AMap.Marker({
        position: [latlng.lng, latlng.lat],
        icon: "../images/parking.png",
        offset: new AMap.Pixel(-10, -20)
    });
    //marker.setMap(_truck_map);
    _truck_map_markers.push(marker);

    var label = new AMap.Marker({
        position: [latlng.lng, latlng.lat],
        content: "<div class ='license'>" + time + "</div>",
        offset: new AMap.Pixel(10, -20)
    });
    //label.setMap(_truck_map);
    _truck_map_markers.push(label);
}

function showTruckMapMarkers() {
    if (!_is_truck_map_markers_shown) {
        _is_truck_map_markers_shown = true;
        for (var i in _truck_map_markers) {
            var marker = _truck_map_markers[i];
            marker.setMap(_truck_map);
        }
        //_truck_map.setFitView();
    }
}

function hideTruckMapMarkers() {
    if (_is_truck_map_markers_shown) {
        _truck_map.remove(_truck_map_markers);
        _is_truck_map_markers_shown = false;
    }
}

function clearTruckMapMarkers() {
    hideTruckMapMarkers();
    _truck_map_markers = [];
}
