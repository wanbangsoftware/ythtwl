// JavaScript source code
$(document).ready(function () {
    var width = $(window).width() - 20;
    $("#container").width(width);
    var height = window.innerHeight;
    var top = $("#container").offset().top;
    $("#container").height(height - top - 10);
    var map = new AMap.Map('container', {
        zoom: 14
        //center: [116.39, 39.9]
    });

    AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView'], function () {

        map.addControl(new AMap.ToolBar());

        map.addControl(new AMap.Scale());

        //map.addControl(new AMap.OverView({ isOpen: true }));

        //map.addControl(new BasicControl.LayerSwitcher({ position: 'rt' }));
    });
});