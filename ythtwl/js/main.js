// JavaScript source code

var trucks = new Array();

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

function loadingTrucks() {
    $.ajax({
        type: "post",
        url: "http://www.zfbeidou.com/bds/monitor/getVehicleTree/",
        async: false,
        //data: "",
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.withCredentials = true;
        },
        crossDomain: true,
        success: function (data) {
            displayTrucksList(data[0]);
        },
        error: function (data) {
            showDialog("Ã· æ", data.responseText);
        }
    });
}

var truckHtml = "<tr><td data-value=\"%id%\" class=\"center\">%index%</td><td>%license%</td><td>%online%</td><td>%speed% km/h</td><td>%direct%°„</td>" +
    "<td>%alarm%</td><td>%lon%</td><td>%lat%</td><td class=\"overflow\">%address%</td><td></td></tr>";
function displayTrucksList(data) {
    if (data.hasOwnProperty("children") && data.children.length > 0) {
        $.each(data.children, function (index, truck) {
            if (truck.hasOwnProperty("attributes")) {
                var info = truck.attributes;
                var html = truckHtml.replace("%id%", truck.id).replace("%index%", index)
                    .replace("%license%", info.PlateNumber).replace("%online%", truck.online)
                    .replace("%speed%", info.Speed / 10).replace("%direct%", formatDirection(info.Direction))
                    .replace("%alarm%", "-").replace("%lon%", info.Lo / 1000000).replace("%lat%", info.La / 1000000).replace("%address%", "-");
                $("table tbody:eq(0)").append(html);
            }
        });
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
});