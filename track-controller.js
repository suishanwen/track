var trackApp = angular.module('trackApp', []);
trackApp.controller("trackController", ["$scope", "$http", "$filter", function ($scope, $http, $filter) {
    $scope.count = 0;
    $scope.retry = -1;
    var openAlert = !!getQueryString(window.location.search, "alert");
    var trustList = ["60.173.26.42:9090/view", "www.mmwzpt.cn/mmrj", "www.fastvote.cn/member", "120.25.13.127"];
    var blackList = ["10branew"];
    var ids = ['BT-33073', 'BT-33079', 'RF-93986', 'RF-14-', 'AB-19094', 'AB-19918', 'BT-37628', 'RF-176919', 'BT-69336', 'CJR-7-', 'CJR-9-', 'CJR-9a-'];
    var now;
    $scope.display = [];
    var trackBt = function () {
        $scope.count++;
        getNow();
        console.log("开始第" + $scope.count + "次抓取 -->" + now);
        $("#records").append("<span>" + "开始第" + $scope.count + "次抓取 -->" + now + "</span>");
        $http.get("http://butingzhuan.com/tasks.php").success(function (data) {
            data = data.substr(0, data.indexOf("点击查看另外"));
            var $a = $(data).find('a');
            var count = $a.size();
            var urlList = [];
            for (var index = 0; index < count; index++) {
                var url = $($a.get(index)).attr('href');
                urlList.push(url);
            }
            urlList = urlList.filter(function (e) {
                var isExist = false;
                trustList.forEach(function (t) {
                    if (e.indexOf(t) >= 0) {
                        isExist = true;
                    }
                });
                return isExist;
            });
            urlList = urlList.filter(function (e) {
                var isExist = true;
                blackList.forEach(function (b) {
                    if (e.indexOf(b) >= 0) {
                        isExist = false;
                    }
                });
                return isExist;
            });
            console.log("本次共抓取到" + urlList.length + "个有效页面");
            $("#records").append("  (" + urlList.length + "个有效页面)<br/>");
            if (urlList.length > 0) {
                trackIds(urlList, ids, 0);
            } else {
                setTimeout(function () {
                    trackBt();
                }, 15000)
            }
        }).error(function () {
            setTimeout(function () {
                trackBt();
            }, 15000)
        })
    };

    var trackIds = function (urlList, ids, index) {
        getNow();
        $("#state").html("<span>正在分析： <a href='" + urlList[index] + "' target='_blank'>" + urlList[index] + "</a> <img src='assets/img/loading.gif' class='img' /> " + now + "</span>");
        console.log("开始分析：" + urlList[index] + " --> " + now);
        $http.get(urlList[index]).success(function (data) {
            $scope.retry = -1;
            ids.forEach(function (id) {
                if (data.indexOf(id) >= 0 || data.indexOf(id.toLowerCase()) >= 0) {
                    getNow();
                    console.log("发现目标：'" + id + "'-->" + urlList[index] + " -->" + now);
                    var span = "<span><span class='id ";
                    var count = data.split(id).length - 1;
                    if (id === "BT-33073" || id === "33079" || id === "RF-93986" || id === "AB-19094" || id === "AB-19918") {
                        span += " bg-red'>"
                    } else if (id === "RF-14-" || id === "CJR-9-" || id === "CJR-9a-") {
                        span += " bg-yg'>"
                    } else if (id === "BT-37628") {
                        span += " bg-blue'>"
                    } else if (id === "BT-69336" || id === "RF-176919" || id === "CJR-7-") {
                        span += " bg-gray'>"
                    }
                    span += id + "*" + count + "</span> --><a href='" + urlList[index] + "' target='_blank'>" + urlList[index] + "</a> -->" + now + "</span><br/>";
                    $("#records").append(span);
                    var exist = $scope.display.some(function (e) {
                        return e === urlList[index];
                    });
                    if (!exist) {
                        $scope.display.push(urlList[index]);
                    }
                    setTimeout(function () {
                        var recDom = $("#records")[0];
                        recDom.scrollTop = recDom.scrollHeight;
                    }, 1000);
                    if (openAlert) {
                        alert(urlList[index])
                    }
                }
            });
            $("#state").html("<span>分析完成： <a href='" + urlList[index] + "' target='_blank'>" + urlList[index] + "</a> <img src='assets/img/ok.gif' class='img' /> " + now + "</span>");
            if (index < urlList.length - 1) {
                index++;
                if (urlList[index].substr(0, 20) === urlList[index - 1].substr(0, 20)) {
                    setTimeout(function () {
                        trackIds(urlList, ids, index)
                    }, 6000);
                } else {
                    setTimeout(function () {
                        trackIds(urlList, ids, index)
                    }, 2000);
                }
            } else {
                trackBt()
            }
        }).error(function () {
            getNow();
            $("#state").innerHTML = "<span>分析失败：<a href='" + urlList[index] + "' target='_blank'>" + urlList[index] + "</a> <img src='assets/img/fail.jpg' class='img' /> " + now + "</span>";
            console.log("分析失败：" + urlList[index] + " -->" + now);
            if ($scope.retry !== index) {
                $scope.retry = index;
                trackIds(urlList, ids, index);
                return
            }
            if (index < urlList.length - 1) {
                index++;
                if (urlList[index].substr(0, 20) === urlList[index - 1].substr(0, 20)) {
                    setTimeout(function () {
                        trackIds(urlList, ids, index)
                    }, 12000);
                } else {
                    setTimeout(function () {
                        trackIds(urlList, ids, index)
                    }, 3000);
                }
            } else {
                trackBt()
            }
        })
    };

    trackBt();


    function getQueryString(queryString, name) {
        var reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "i");
        var r = queryString.substr(1).match(reg);
        if (r != null) {
            return decodeURI(r[2])
        }
        return null;
    }

    function getNow() {
        now = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
    }
}]);
