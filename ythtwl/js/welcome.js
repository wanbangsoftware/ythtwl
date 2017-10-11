
function isCookied() {
    var cache = new CookieCache();
    var cookie = cache.getDomains("www.zfbeidou.com");
    if (cookie)
        return true;
    return false;
}

$(document).ready(function () {

    $(".btn").text(isCookied() ? "点击开始" : "未登录").click(function () {
        if (isCookied()) {
            document.location = "../html/main.html";
        } else {
            alert("您还未登录北斗系统，请先登录之后再来。");
        }
    });
});