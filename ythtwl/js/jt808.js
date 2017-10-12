var AlarmDescs = ["紧急报警"
	, "超速报警"
	, "疲劳驾驶"
	, "危险预警"
	, "GNSS模块发生故障"
	, "GNSS天线未接或被剪断"
	, "GNSS天线短路"
	, "终端主电源欠压"
	, "终端主电源掉电"
	, "终端LCD或显示器故障"
	, "TTS模块故障"
	, "摄像头故障"
	, "道路运输证IC卡模块故障"
	, "超速预警"
	, "疲劳驾驶预警"
	, ""
	, ""
	, ""
	, "当天累计驾驶超时"
	, "超时停车"
	, "进出区域"
	, "进出路线"
	, "路段行驶时间不足/过长"
	, "路线偏离报警"
	, "车辆VSS故障"
	, "车辆油量异常"
	, "车辆被盗(通过车辆防盗器)"
	, "车辆非法点火"
	, "车辆非法位移"
	, "碰撞预警"
	, "侧翻预警"
	, "非法开门报警"
	, "凌晨2点至5点禁行平台报警"
	, "高速路限速报警"
	, "快速路限速报警"
	, "普通路限速报警"
]; 

var StatusDescs = [
	{bitIndex:0, bitCount:1, '0':'ACC关', '1':'ACC开'}
	, {bitIndex:1, bitCount:1, '0':'未定位', '1':'定位'}
	, {bitIndex:2, bitCount:1, '0':'北纬', '1':'南纬'}
	, {bitIndex:3, bitCount:1, '0':'东经', '1':'西经'}
	, {bitIndex:4, bitCount:1, '0':'运营状态', '1':'停运状态'}
	, {bitIndex:5, bitCount:1, '0':'未加密', '1':'已加密'}
	, {bitIndex:6, bitCount:2}
	, {bitIndex:8, bitCount:2, '0':'空车', '1':'半载', '3':'满载'}
	, {bitIndex:10, bitCount:1, '0':'油路正常', '1':'油路断开'}
	, {bitIndex:11, bitCount:1, '0':'电路正常', '1':'电路断开'}
	, {bitIndex:12, bitCount:1, '0':'车门解锁', '1':'车门加锁'}
	, {bitIndex:13, bitCount:1, '0':'门1关（前门）', '1':'门1开（前门）'}
	, {bitIndex:14, bitCount:1, '0':'门2关（中门）', '1':'门2开（中门）'}
	, {bitIndex:15, bitCount:1, '0':'门3关（后门）', '1':'门3开（后门）'}
	, {bitIndex:16, bitCount:1, '0':'门4关（驾驶席门）', '1':'门4开（驾驶席门）'}
	, {bitIndex:17, bitCount:1, '0':'门5关', '1':'门5开'}
	, {bitIndex:18, bitCount:1, '0':'未使用GPS 卫星进行定位', '1':'使用GPS 卫星进行定位'}
	, {bitIndex:19, bitCount:1, '0':'未使用北斗卫星进行定位', '1':'使用北斗卫星进行定位'}
	, {bitIndex:20, bitCount:1, '0':'未使用GLONASS卫星进行定位', '1':'使用GLONASS卫星进行定位'}
	, {bitIndex:21, bitCount:1, '0':'未使用Galileo卫星进行定位', '1':'使用Galileo卫星进行定位'}
];

var ExtStatusDescs = ['近光开', '远光开', '右转向灯开', '左转向灯开', '制动', '倒档', '雾灯开', '示廊灯开', '喇叭响', '空调开'
		, '空档位', '缓速器工作', 'ABS 工作', '加热器工作', '离合器状态'];

var Msg_IdNames = {
	'0001':'终端通用应答'
    , '8001':'平台通用应答'
    , '0002':'终端心跳'
    , '0100':'终端注册'
    , '8100':'终端注册应答'
    , '0003':'终端注销'
    , '0102':'终端鉴权'
    , '8103':'设置终端参数'
    , '8104':'查询终端参数'
    , '0104':'查询终端参数应答'
    , '8105':'终端控制'
    , '0200':'位置信息汇报'
    , '8201':'位置信息查询'
    , '0201':'位置信息查询应答'
    , '8202':'临时位置跟踪控制'
    , '8300':'文本信息下发'
	, '83001':'查询文本信息下发历史'
    , '8301':'事件设置'
	, '83011':'查询事件设置项'
	, '83012':'查询事件报告'
    , '0301':'事件报告'
    , '8302':'提问下发'
	, '83021':'查询提问设置项'
	, '83022':'查询答案'
    , '0302':'提问应答'
    , '8303':'信息点播菜单设置'
    , '0303':'信息点播/取消'
    , '8304':'信息服务'
	, '83041':'查询点播项'
    , '8400':'电话回拨'
    , '8401':'设置电话本'
    , '8500':'车辆控制'
    , '0500':'车辆控制应答'
    , '8600':'设置圆形区域'
    , '8601':'删除圆形区域'
    , '8602':'设置矩形区域'
    , '8603':'删除矩形区域'
    , '8604':'设置多边形区域'
    , '8605':'删除多边形区域'
    , '8606':'设置路线'
    , '8607':'删除路线'
    , '8700':'行驶记录仪数据采集命令'
	, '87001':'查询上传行车记录数据'
    , '0700':'行驶记录仪数据上传'
    , '8701':'行驶记录仪参数下传命令'
    , '0701':'电子运单上报'
    , '0702':'驾驶员身份信息采集上报'
    , '0800':'多媒体事件信息上传'
    , '0801':'多媒体数据上传'
    , '8800':'多媒体数据上传应答'
    , '8801':'摄像头立即拍摄命令'
    , '8802':'存储多媒体数据检索'
    , '0802':'存储多媒体数据检索应答'
    , '8803':'存储多媒体数据上传'
    , '8804':'录音开始命令'
    , '8900':'数据下行透传'
    , '0900':'数据上行透传'
    , '0901':'数据压缩上报'
    , '8A00':'平台RSA公钥'
    , '0A00':'终端RSA公钥'
    , '8805':'单条存储多媒体数据检索上传命令'
    , '8102':'设置终端注册信息'
    , '8106':'查询指定终端参数'
    , '8107':'查询终端属性'
    , '0107':'查询终端属性应答'
    , '8108':'下发终端升级包'
    , '0108':'终端升级结果通知'
    , '8702':'上报驾驶员身份信息请求'
    , '0704':'定位数据批量上传'
    , '0705':'CAN总线数据上传'
    , '0805':'摄像头立即拍摄命令应答'
    , '8003':'补传分包请求'
    , '8203':'人工确认报警消息'
}

var CommandStatus = {
    '0': '未发送',
    '1': '发送/待应答中',
    '2': '已应答\\成功',
    '3': '发送失败',
    '4': '失效',
    '5': '终端不存在',
    '6': '超次',
    '7': '重发中',
    '99': '执行失败或其它失败',
}

function formatStatus(value, row, index) {
	var s = '', bit, c, n, v = parseInt(value);
	for (var i=0; i<StatusDescs.length; i++){
		n = (v >> StatusDescs[i].bitIndex) & (0xFF>>(8-StatusDescs[i].bitCount));
		if (StatusDescs[i].hasOwnProperty(n))
			s += (s?', ': '') + StatusDescs[i][n];
	}
	if (row && index && ! row['From']) {
		if ((row && row.Alarm != 0 && row.Alarm != null ) || (row && row.Alarm2 != 0 && row.Alarm2 != null )){
			s = '<span title="'+s+'"><span style="cursor:hand; color:red; border:1px dotted blue">有报警</span>' + s + '</span>';
		} else {
			s = '<span title="'+s+'">' + s + '</span>';
		}
	} else {
		s = '<span title="'+s+'">' + s + '</span>';
	}
	
	return s;
}

function formatExtStatus(value, row, index) {
	var s = ''
		n = parseInt(value);
		
	for (var i=0; i<15; i++){
		if ((1<<i)&n)
			s += (s?', ': '') + ExtStatusDescs[i];
	}
	
	s = '<span title="'+s+'">' + s + '</span>';
	
	return s;
}

function formatAlarm(value, row, index){	
	var s = ''
		a = parseInt(value);
	
	for (var i=0; i<32; i++){
		if ( (1<<i)&a ){
			s += (s==''?'':',') + AlarmDescs[i];
		}
	}
	return s.fontcolor('red');
 }

function formatSpeed(value, row, index){
	value = (parseFloat(value)/10).toFixed(1);
	return isNaN(value) ? '' : value;
}

var jt808_ds = [0,15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240,255,270,285,300,315,330,345,360];
	var jt808_dds = ['北', '北偏东', '东北', '东北', '东偏北', '东', '东', '东偏南', '东南', '东南', '南偏东', '南', '南'
		, '南偏西', '西南', '西南', '西偏南', '西', '西', '西偏北', '西北', '西北', '北偏西', '北'];
function formatDirection(value, row, index){
	var sd = ""
		, v = parseFloat(value);
	for (var i = 0; i < jt808_ds.length; i++){
		if (jt808_ds[i] >= v){
			sd = jt808_dds[i>=1?i-1:0];
			break;
		}
	}
	return sd+'('+value+')';
}

function formatMileage(value, row, index){
	if(value<0){
		value=0;
	}
	value = (parseFloat(value)/10).toFixed(1);
	return isNaN(value) ? '' : value;
}

function formatOil(value, row, index){
	value = (parseFloat(value)/10).toFixed(1);
	return isNaN(value) ? '' : value;
}

function formatLng(value, row, index){
	value = (parseFloat(value)/1000000).toFixed(6);
	return isNaN(value) ? '' : value;
}

function formatLat(value, row, index){
	value = (parseFloat(value)/1000000).toFixed(6);
	return isNaN(value) ? '' : value;
}

function formatVehicleType(value, row, index) {
	return value && VehicleTypes.hasOwnProperty(value) ? VehicleTypes[value] : '';
}

function formatAlarm_Type(value, row, index) {
	return value ? AlarmDescs[value] : '';
}

var jt808_PlateColor = {'1':'蓝色', '2':'黄色', '3':'黑色', '4':'白色'}
function formatPlateColor(value, row, index) {
	return jt808_PlateColor.hasOwnProperty(value) ? jt808_PlateColor[value] : '其它';
}
