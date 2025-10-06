// 1. 全局解密配置（固定不变）
const DES_CONFIG = {
  key: CryptoJS.enc.Utf8.parse("com.anhuimobile.hfzq.uti"),
  mode: CryptoJS.mode.ECB,
  padding: CryptoJS.pad.Pkcs7
};

// 2. 通用解密函数（固定不变）
function decryptGatewayPwd(ciphertext) {
  try {
    if (!ciphertext) return "密文为空";
    const decrypted = CryptoJS.TripleDES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(ciphertext) },
      DES_CONFIG.key,
      DES_CONFIG
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return ciphertext + "（解密失败）";
  }
}

// 3. 复制到剪贴板函数（兼容手机端）
function copyToClipboard(text) {
  // 过滤无效文本
  if (!text || text.includes("解密失败") || text === "密文为空") {
    layer.open({ content: "无法复制无效内容", skin: "msg", time: 2 });
    return;
  }

  // 方法1：现代浏览器剪贴板API（优先）
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    navigator.clipboard.writeText(text).then(() => {
      //layer.open({ content: "超级密码已复制", skin: "msg", time: 2 });
    }).catch(() => {
      fallbackCopy(text); // 失败时用备用方法
    });
  } else {
    // 方法2：兼容旧浏览器（创建临时文本框）
    fallbackCopy(text);
  }
}

// 备用复制方法（兼容手机低版本浏览器）
function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  
  textarea.select();
  const success = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (success) {
    //layer.open({ content: "超级密码已复制", skin: "msg", time: 2 });
  } else {
    layer.open({ content: "复制失败，请手动复制", skin: "msg", time: 2 });
  }
}

// 4. 完整业务逻辑
var link = '';
var servTypeSel = document.getElementById("servType");
var serviceType;

List = function() {
  return {
    // 查询设备信息
    query: function(type) {
      List.loading();
      var keyword = $("#keyword").val();
      serviceType = servTypeSel.options[servTypeSel.selectedIndex].value;

      if (serviceType == "1") {
        // 终端设备信息查询（含超级密码）
        var deviceSN = $("#keywordAdd").val();
        $.ajax({
          headers: { "Status": window.localStorage.getItem("status") },
          url: basePath + 'HJ/queryHguInfo',
          data: { "sn": deviceSN, "account": keyword },
          type: 'POST',
          timeout: 30000,
          success: function(data) {
            List.cancelLoading();
            var Result = data.Result;
            
            if (type == 'refresh') {
              link = '';
              $('#thelist').empty();
            }

            // 分支1：查询成功（Result=0）
            if (Result == "0" || Result == 0) {
              var CPEID = data.CPEID || "";
              var DeviceType = data.DeviceType || "";
              var ProductClass = data.ProductClass || "";
              var DeviceID = data.DeviceID || "";
              var sn = data.SN || "";
              var MAC = data.MAC || "";
              var PublicIP = data.PublicIP || "";
              var OUI = data.OUI || "";
              var SoftVersion = data.SoftVersion || "";
              var HardVersion = data.HardVersion || "";
              var RegistStatus = data.RegistStatus || "";
              var onLineStatus = data.onLineStatus || "";
              var ciphertext = data.gateway_family_password || "";
              var hguWord = decryptGatewayPwd(ciphertext); // 解密超级密码

              // 拼接HTML（超级密码可点击复制）
              link += '<tr><td colspan="2" class="mb_td_tit">基本信息</td></tr>';
              link += '<tr><th>终端标识</th><td class="addbalnk">' + CPEID + '</td></tr>';
              link += '<tr><th>设备类型</th><td>' + DeviceType + '</td></tr>';
              link += '<tr><th>设备型号</th><td>' + ProductClass + '</td></tr>';
              link += '<tr><th>物理标识</th><td>' + DeviceID + '</td></tr>';
              link += '<tr><th>设备SN</th><td>' + sn + '</td></tr>';
              link += '<tr><th>MAC地址</th><td>' + MAC + '</td></tr>';
              link += '<tr><th>公有IP</th><td>' + PublicIP + '</td></tr>';
              // 超级密码行（可点击复制）
              link += '<tr><th>超级密码</th><td ' +
                'style="color: #007AFF; text-decoration: underline; cursor: pointer;" ' +
                'onclick="copyToClipboard(\'' + hguWord + '\')">' +
                hguWord + 
                '</td></tr>';
              link += '<tr><th>厂商标识</th><td>' + OUI + '</td></tr>';
              link += '<tr><th>软件版本</th><td>' + SoftVersion + '</td></tr>';
              link += '<tr><th>硬件版本</th><td>' + HardVersion + '</td></tr>';
              link += '<tr><th>注册状态</th><td>' + (RegistStatus == "0" ? "已注册未绑定" : "已注册已绑定") + '</td></tr>';
              link += '<tr><th>在线状态</th><td>' + (onLineStatus == "0" ? "在线" : onLineStatus == "1" ? "离线" : "正在升级") + '</td></tr>';
              $("#theList").html(link);

            // 分支2：Result非0但有超级密码
            } else if (data.gateway_family_password && data.gateway_family_password != "null" && data.gateway_family_password != "undefined") {
              var CPEID = data.CPEID || "";
              var DeviceType = data.DeviceType || "";
              var ProductClass = data.ProductClass || "";
              var DeviceID = data.DeviceID || "";
              var sn = data.SN || "";
              var MAC = data.MAC || "";
              var PublicIP = data.PublicIP || "";
              var OUI = data.OUI || "";
              var SoftVersion = data.SoftVersion || "";
              var HardVersion = data.HardVersion || "";
              var RegistStatus = data.RegistStatus || "";
              var onLineStatus = data.onLineStatus || "";
              var ciphertext = data.gateway_family_password;
              var hguWord = decryptGatewayPwd(ciphertext); // 解密超级密码

              // 拼接HTML（超级密码可点击复制）
              link += '<tr><td colspan="2" class="mb_td_tit">基本信息</td></tr>';
              link += '<tr><th>终端标识</th><td class="addbalnk">' + CPEID + '</td></tr>';
              link += '<tr><th>设备类型</th><td>' + DeviceType + '</td></tr>';
              link += '<tr><th>设备型号</th><td>' + ProductClass + '</td></tr>';
              link += '<tr><th>物理标识</th><td>' + DeviceID + '</td></tr>';
              link += '<tr><th>设备SN</th><td>' + sn + '</td></tr>';
              link += '<tr><th>MAC地址</th><td>' + MAC + '</td></tr>';
              link += '<tr><th>公有IP</th><td>' + PublicIP + '</td></tr>';
              // 超级密码行（可点击复制）
              link += '<tr><th>超级密码</th><td ' +
                'style="color: #007AFF; text-decoration: underline; cursor: pointer;" ' +
                'onclick="copyToClipboard(\'' + hguWord + '\')">' +
                hguWord + 
                '</td></tr>';
              link += '<tr><th>厂商标识</th><td>' + OUI + '</td></tr>';
              link += '<tr><th>软件版本</th><td>' + SoftVersion + '</td></tr>';
              link += '<tr><th>硬件版本</th><td>' + HardVersion + '</td></tr>';
              link += '<tr><th>注册状态</th><td>' + (RegistStatus == "0" ? "已注册未绑定" : "已注册已绑定") + '</td></tr>';
              link += '<tr><th>在线状态</th><td>' + (onLineStatus == "0" ? "在线" : onLineStatus == "1" ? "离线" : "正在升级") + '</td></tr>';
              $("#theList").html(link);

            // 分支3：无设备信息
            } else {
              $("#theList").html("");
              layer.open({ content: "未查询到终端设备信息", skin: "msg", time: 2 });
            }
          },
          error: function() {
            List.cancelLoading();
            layer.open({ content: "查询失败，请重试", skin: "msg", time: 2 });
          }
        });
      } else if (serviceType == "2") {
        // 其他查询类型（语音信息）
        $.ajax({
          headers: { "Status": window.localStorage.getItem("status") },
          url: basePath + 'BQC/getJiaKeQueryBaseUrl',
          data: {
            "methodName": "servInfoQuery",
            "deviceType": "hgu",
            "lanID": "",
            "userName": keyword
          },
          type: 'POST',
          timeout: 30000,
          success: function(data) {
            List.cancelLoading();
            if (type == 'refresh') {
              link = '';
              $('#thelist').empty();
            }
            var Result = data.Result;
            if (Result == "0") {
              var CPEID = data.CPEID || "";
              var VoipAuthName = data.VoipAuthName || "";
              var VoipAuthName2 = data.VoipAuthName2 || "";
              var ConnectionType = data.ConnectionType || "";
              var InternetAddr = data.InternetAddr || "";
              var LANStatus = data.LANStatus || "";
              var WifiSwitch = data.WifiSwitch || "";
              var SsidName = data.SsidName || "";
              var SsidStatus = data.SsidStatus || "";

              link += '<tr><td colspan="2" class="mb_td_tit">基本信息</td></tr>';
              link += '<tr><th>终端标识</th><td class="addbalnk">' + CPEID + '</td></tr>';
              link += '<tr><th>语音1注册</th><td>' + VoipAuthName + '</td></tr>';
              link += '<tr><th>语音2注册</th><td>' + VoipAuthName2 + '</td></tr>';
              link += '<tr><th>连接方式</th><td>' + ConnectionType + '</td></tr>';
              link += '<tr><th>IP地址</th><td>' + InternetAddr + '</td></tr>';
              link += '<tr><th>LAN口状态</th><td>' + LANStatus + '</td></tr>';
              link += '<tr><th>无线总开关</th><td>' + (WifiSwitch == "0" ? "关闭" : "开启") + '</td></tr>';
              link += '<tr><th>SSID名称</th><td>' + SsidName + '</td></tr>';
              link += '<tr><th>SSID状态</th><td>' + SsidStatus + '</td></tr>';
              $("#theList").html(link);
            } else if (Result == "1") {
              $("#theList").html("");
              layer.open({ content: '设备不存在！', skin: 'msg', time: 2 });
            } else {
              $("#theList").html("");
              layer.open({ content: Result, skin: 'msg', time: 2 });
            }
          },
          error: function() {
            List.cancelLoading();
            layer.open({ content: "查询失败，请重试", skin: "msg", time: 2 });
          }
        });
      } else {
        // DNS/DHCP查询
        $.ajax({
          headers: { "Status": window.localStorage.getItem("status") },
          url: basePath + 'BQC/getJiaKeQueryBaseUrl',
          data: {
            "methodName": "dnsdhcpInfoQuery",
            "deviceType": "hgu",
            "vlanID": "41",
            "lanID": "",
            "serviceList": "INTERNET",
            "userName": keyword
          },
          type: 'POST',
          timeout: 30000,
          success: function(data) {
            List.cancelLoading();
            if (type == 'refresh') {
              link = '';
              $('#thelist').empty();
            }
            var Result = data.Result;
            if (Result == "0") {
              var CPEID = data.CPEID || "";
              var DNSServers = data.DNSServers || "";
              var LastConnectionError = data.LastConnectionError || "";
              var DHCPServerEnable = data.DHCPServerEnable || "";
              var MinAddress = data.MinAddress || "";
              var MaxAddress = data.MaxAddress || "";
              var ReservedAddresses = data.ReservedAddresses || "";

              link += '<tr><td colspan="2" class="mb_td_tit">基本信息</td></tr>';
              link += '<tr><th>终端标识</th><td class="addbalnk">' + CPEID + '</td></tr>';
              link += '<tr><th>DNS服务器IP</th><td>' + DNSServers + '</td></tr>';
              link += '<tr><th>失败原因</th><td>' + LastConnectionError + '</td></tr>';
              link += '<tr><th>DHCP启用状态</th><td>' + (DHCPServerEnable == "0" ? "禁用" : "启用") + '</td></tr>';
              link += '<tr><th>DHCP的首个IP</th><td>' + MinAddress + '</td></tr>';
              link += '<tr><th>DHCP的末个IP</th><td>' + MaxAddress + '</td></tr>';
              link += '<tr><th>DHCP的IP簇</th><td>' + ReservedAddresses + '</td></tr>';
              $("#theList").html(link);
            } else if (Result == "1") {
              $("#theList").html("");
              layer.open({ content: '设备不存在！', skin: 'msg', time: 2 });
            } else {
              $("#theList").html("");
              layer.open({ content: Result, skin: 'msg', time: 2 });
            }
          },
          error: function() {
            List.cancelLoading();
            layer.open({ content: "查询失败，请重试", skin: "msg", time: 2 });
          }
        });
      }
    },

    // 扫码查询
    queryByScan: function(index) {
      window.android.scanCode();
    },

    // 切换查询类型
    selectChecked: function() {
      serviceType = servTypeSel.options[servTypeSel.selectedIndex].value;
      if (serviceType == "1") {
        $("#deviceIdTr").show();
      } else {
        $("#deviceIdTr").hide();
      }
    },

    // 搜索按钮
    search: function() {
      var keyword = $("#keyword").val();
      var keywordAdd = $("#keywordAdd").val();
      serviceType = servTypeSel.options[servTypeSel.selectedIndex].value;

      if (serviceType == "1") {
        if (keyword == "" && keywordAdd == "") {
          layer.open({
            content: '请输入上网账号或者设备SN！',
            skin: 'msg',
            time: 2
          });
        } else {
          List.query('refresh');
        }
      } else {
        if (keyword != "") {
          List.query('refresh');
        } else {
          layer.open({
            content: '请输入上网账号查询！',
            skin: 'msg',
            time: 2
          });
        }
      }
    },

    // 显示加载框
    loading: function() {
      window.android.showLoading("加载中....");
    },

    // 隐藏加载框
    cancelLoading: function() {
      window.android.hiddenLoading();
    },

    // 返回
    back: function() {}
  };
}();

// 页面加载提示
$(function() {
  alert("请输入上网账号或者扫码输入设备SN");
});

// 扫码回调
function scanCodeCallBack(data) {
  $("#keywordAdd").val(data);
  List.query('refresh');
}
