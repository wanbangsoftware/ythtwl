
var cache = new CookieCache();
var timer = new Timer();

function listener(info) {
    cache.remove(info.cookie);
    if (!info.removed) {
        cache.add(info.cookie);
    }
    scheduleReloadCookieTable();
}

function startListening() {
    chrome.cookies.onChanged.addListener(listener);
}

function isCookied() {
    var cookie = cache.getCookies("www.zfbeidou.com");
    if (typeof (cookie) === "undefined") {
        return false;
    }
    if (cookie && cookie.length > 0) {
        var userId = "";
        for (var i in cookie) {
            var ck = cookie[i];
            if (ck.name == "UserId" && !isStringNull(ck.value)) {
                userId = ck.value;
                break;
            }
        }
        return !isStringNull(userId);
    }
    return false;
}

$(document).ready(function () {

    chrome.cookies.getAll({}, function (cookies) {
        startListening();
        start = new Date();
        for (var i in cookies) {
            cache.add(cookies[i]);
        }
        timer.reset();
    });

    $(".btn").click(function () {
        if (isCookied()) {
            document.location = "../html/main.html";
        } else {
            showDialog("提示", "您还未登录北斗系统，请先登录之后再来。");
        }
    });
});