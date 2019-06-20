'use strict';

var module = angular.module('supportAdminApp');

module.controller('MainController', [
    '$log', '$scope', '$rootScope', '$timeout', '$interval', '$location', 'MainService', 'AuthService', '$state', '$uibModal', '$cookies', '$sce', 'Alert', 'constants',
    function ($log, $scope, $rootScope, $timeout, $interval, $location, mainService, $authService, $state, $modal, $cookies, $sce, $alert, $const) {
        // dashboard show control
        $scope.showDashboard = true;
        $scope.trainsInfo = [];
        $scope.currentUser = {};
        $scope.line = $const.LINE;
        $scope.currentUser.username = $cookies.get('currentUser');
        $scope.currentUser.userrole = $cookies.get('currentUserRole');

        $scope.lightStatus = [];

        var trainInfo = {};

        function initTrainsInfo() {
            $scope.trainsInfo = [];

            for (var idx = 0, len = $const.TRAIN_ID.length; idx < len; idx++) {
                trainInfo.trainId = $const.TRAIN_ID[idx];
                trainInfo.trainDetail = [];
                for (var i = 0; i < 23; i++) {
                    trainInfo.trainDetail.push({})
                }
                $scope.trainsInfo.push(trainInfo);
                trainInfo = {};
            }
        }

        initTrainsInfo();

        $scope.getTrainInfo = function () {
            var trainsInfoObject = {};
            trainsInfoObject.trainsInfo = $scope.trainsInfo;

            $alert.clear();
            if (sessionStorage.getItem("isRunning")) {

                mainService.retrieveTrainInfo().then(
                    function (record) {
                        if (typeof (record) == "string") {
                            return
                        }
                        var index;
                        var objectForTrainsInfo = {};
                        var Record = function () {
                        };

                        //防止全局请求数据为空，localStorage 无值的请况
                        if (!localStorage.getItem('trainsInfoVibrate')) {
                            index = $const.trainId.indexOf(record.trainId);

                            for (var idx = 0, len = record.trainInfoList.length; idx < len; idx++) {
                                $scope.trainsInfo[index].trainDetail[idx] = angular.extend(new Record(), trainInfo[len - idx - 1])
                            }
                        } else {
                            var localTrainsInfo = JSON.parse(localStorage.getItem('trainsInfoVibrate')).trainsInfo;

                            for (var ix = 0; ix < localTrainsInfo.length; ix++) {
                                if (record.trainId === localTrainsInfo[ix].trainId) {
                                    index = ix;
                                    break;
                                }
                            }

                            if (localTrainsInfo[index].trainDetail[record.trainInfoList.length - 1].trainOnlyid) {
                                $scope.trainsInfo = localTrainsInfo;
                                return
                            }
                            for (var idx = 0, len = record.trainInfoList.length; idx < len; idx++) {
                                localTrainsInfo[index].trainDetail[idx] = angular.extend(new Record(), record.trainInfoList[len - idx - 1])
                            }
                            $scope.trainsInfo = localTrainsInfo;
                        }

                        $scope.trainsInfo.sort(compare);
                        objectForTrainsInfo.trainsInfo = $scope.trainsInfo;
                        localStorage.setItem("trainsInfoVibrate", JSON.stringify(objectForTrainsInfo));

                        var currentState = record.trainInfoList[0].trainState;
                        var trainOnlyId = record.trainInfoList[0].trainOnlyid;
                        var trainId = record.trainId;

                        if ($cookies.get('currentUser')) {
                            $scope.warningLight(currentState, trainId, trainOnlyId);
                        }
                    },
                    function (err) {
                        $alert.error(err.error, $scope);
                    }
                )
            } else {
                mainService.retrieveAllTrainInfo().then(
                    function (record) {
                        if (typeof (record) == "string") {
                            return
                        }
                        var index;
                        var trainInfo;
                        var objectForTrainsInfo = {};
                        var Record = function () { };

                        for (var prop in record) {
                            trainInfo = record[prop];
                            index = $const.TRAIN_ID.indexOf(prop);

                            for (var idx = 0, len = trainInfo.length; idx < len; idx++) {
                                $scope.trainsInfo[index].trainDetail[idx] = angular.extend(new Record(), trainInfo[len - idx - 1])
                            }

                            if ($cookies.get('currentUser')) {

                                var currentState = trainInfo[0].trainState;
                                var trainOnlyId = trainInfo[0].trainOnlyid;
                                var trainId = prop;

                                $scope.warningLight(currentState, trainId, trainOnlyId);
                            }
                        }

                        $scope.trainsInfo.sort(compare);
                        objectForTrainsInfo.trainsInfo = $scope.trainsInfo;
                        localStorage.setItem("trainsInfoVibrate", JSON.stringify(objectForTrainsInfo));
                        sessionStorage.setItem('isRunning', "Y");
                    },
                    function (err) {
                        $alert.error(err.error, $scope);
                    }
                )
            }
        };

        var compare = function (trainInfo_1, trainInfo_2) {
            if (trainInfo_1.trainDetail[0].trainOnlyid && trainInfo_2.trainDetail[0].trainOnlyid) {
                if (trainInfo_1.trainId < trainInfo_2.trainId) {
                    return -1;
                } else if (trainInfo_1.trainId > trainInfo_2.trainId) {
                    return 1
                } else {
                    return 0
                }
            } else if (trainInfo_1.trainDetail[0].trainOnlyid) {
                return -1;
            } else if (trainInfo_2.trainDetail[0].trainOnlyid) {
                return 1;
            } else {
                if (trainInfo_1.trainId < trainInfo_2.trainId) {
                    return -1;
                } else if (trainInfo_1.trainId > trainInfo_2.trainId) {
                    return 1
                } else {
                    return 0
                }
            }
        };
        $scope.warningLight = function (currentState, trainId, trainOnlyId) {
            if (currentState !== 4) {
                if (currentState === 1 || currentState === 2) {
                    $scope.playAlarmAudio();
                } else {
                    $scope.playDeviceAudio();
                }
                if (currentState === 1) {
                    if ($scope.lightStatus.indexOf(1) === -1) {
                        //报警，红灯信号
                        mainService.triggerLight(1);
                    }
                    $scope.lightStatus.push(1);
                } else if (currentState === 2) {
                    if ($scope.lightStatus.indexOf(1) === -1 && $scope.lightStatus.indexOf(2) === -1) {
                        //报警，cheng灯信号
                        mainService.triggerLight(2);
                    }
                    $scope.lightStatus.push(2);
                }

                var warningInfo = {};
                warningInfo.trainId = trainId;
                warningInfo.trainOnlyId = trainOnlyId;
                $scope.openWarningDialog(warningInfo);
            }
            // }else{
            //     $scope.lightStatus.push(0);
            // }
        };

        $scope.$on("UserChange",
            function (event, user) {
                if (user === "logout") {
                    $scope.currentUser.username = null;
                    $scope.currentUser.userrole = null;
                    return
                }
                $timeout(function () {
                    $scope.currentUser.username = $cookies.get('currentUser');
                    $scope.currentUser.userrole = $cookies.get('currentUserRole');
                }, 300);

            });

        $scope.$on("HideDashboard",
            function (event, msg) {
                $scope.showDashboard = false;
            });

        $scope.$on("ShowDashboard",
            function (event, msg) {
                $scope.showDashboard = true;
                if (msg == "loginsuccess") {
                    $scope.getTrainInfo();

                    $scope.currentUser.username = $cookies.get('currentUser');
                    $scope.currentUser.userrole = parseInt($cookies.get('currentUserRole'));
                }

                $timeout(function () {
                    fix_mainpage_height();
                }, 300);
            });

        $scope.$on("ResizePage", function (event) {

            if ($location.url() == '/index/main') {
                $timeout(function () {
                    fix_mainpage_height();
                }, 500);
                return
            }
            if ($location.url() == '/auth') {
                $timeout(function () {
                    fix_auth_height();
                }, 0);
                return
            }
            $timeout(function () {
                fix_height()
            }, 500);
        });

        $scope.$on("ResizeAuthPage", function (event, msg) {
            if (msg == "fromlocation") {
                $alert.clear();
                $alert.error('请先登录', $rootScope);
            }
            else if (msg == "logout success") {
                $alert.clear();
                $alert.info('登出成功', $rootScope);
            }
            else if (msg == "lose connect") {
                $alert.clear();
                $alert.info('与服务器失去连接', $rootScope);
            }
            else if (msg == "token timeout") {
                $alert.clear();
                $alert.info('登陆状态失效，请重新登陆', $rootScope);
            }

            $timeout(function () {
                fix_auth_height()
            }, 100);
        });


        // call from side-nav
        $scope.toMainPage = function () {
            $timeout(function () {
                $state.go("index.main");
            }, 200);
        };

        $scope.openMainDialog = function (index, trainDirection) {
            if (!index) {
                return
            }
            var modalInstance = $modal.open({
                size: 'md',
                templateUrl: 'app/main/main-dialog.html',
                controller: 'MainDialogController',
                resolve: {
                    trainOnlyId: function () {
                        return index;
                    },
                    trainDirection: function () {
                        return trainDirection
                    }
                }
            });
        };
        $scope.openCurrentdayDialog = function () {
            var modalInstance = $modal.open({
                templateUrl: 'app/main/currentday-dialog.html',
                controller: 'CurrentdayDialog',
                windowClass: 'app-modal-window'
            });
        };
        $scope.openWarningDialog = function (warningInfo) {
            var modalInstance = $modal.open({
                templateUrl: 'app/main/warning-dialog.html',
                controller: 'WarningDialogController',
                size: 'md',
                resolve: {
                    warningInfo: function () {
                        return warningInfo;
                    },
                    lightStatus: function () {
                        return $scope.lightStatus;
                    }
                }
            });
        };
        $scope.timeShow = function (trainDate) {
            if (!trainDate) {
                $(".dashboard-icon").attr("title", "No data zzz!");
                return
            }
            var date = trainDate.slice(0, 4) + '-' + trainDate.slice(4, 6) + '-' + trainDate.slice(6, 8) + ' ' +
                trainDate.slice(8, 10) + ':' + trainDate.slice(10, 12) + ':' + trainDate.slice(12, 14);
            $(".dashboard-icon").attr("title", date);
        };
        $scope.playDeviceAudio = function () {

            var a = $('<audio/>', {
                style: 'display:none',
                autoplay: 'autoplay',
                src: '../assets/images/device.wav',
            }).appendTo('body')
        };
        $scope.playAlarmAudio = function () {
            var a = $('<audio/>', {
                style: 'display:none',
                autoplay: 'autoplay',
                src: '../assets/images/alarm.wav'
            }).appendTo('body')
        };

        $scope.logout = function () {
            if (window.confirm('确定要退出登录?')) {
                $authService.logout();
                $timeout(function () {
                    $rootScope.$broadcast("ResizeAuthPage", "logout success");
                }, 100);
                $state.go('auth')
            }
        };

        $scope.resizeForToggle = function () {
            $rootScope.$broadcast('ResizePage');
        };
        $scope.changePassword = function () {
            var modalInstance = $modal.open({
                size: 'md',
                templateUrl: 'app/main/change-password.html',
                controller: 'PasswordChangeController',
                resolve: {
                    username: function () {
                        return $cookies.get('currentUser');
                    }
                }
            });
        };

        angular.element(document).ready(function () {
            $('[data-toggle="tooltip"]').tooltip();

            $(window).bind("resize scroll", function () {
                $rootScope.$broadcast('ResizePage');
            });

            if ($cookies.get('currentUser')) {
                $scope.getTrainInfo();

                $scope.currentUser.username = $cookies.get('currentUser');
                $scope.currentUser.userrole = parseInt($cookies.get('currentUserRole'));
            }

            $interval(function () {
                if (!$cookies.get('currentUser')) {
                    return
                }
                var date = new Date();
                var h = date.getHours() < 10 ? '0' + (date.getHours()) : '' + (date.getHours());
                var m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : '' + (date.getMinutes());
                if (h + m == "2300") {
                    $scope.openCurrentdayDialog();
                }
                if (h + m == "0010") {
                    initTrainsInfo();
                    sessionStorage.removeItem('isRunning');
                    localStorage.removeItem("trainsInfoVibrate");
                }
                $scope.getTrainInfo();
            }, 60 * 1000);

            if ($location.url() == '/index/main') {
                $rootScope.$broadcast("ShowDashboard", "");
            }
            $rootScope.$broadcast('ResizePage');
        });

        //fix height
        function fix_height() {
            var windowHeigh = $(window).height();
            var extraHeight = 162;
            var realcontentHeigh = $(".real-content").height() + $(".second-header").height() + extraHeight;

            if (realcontentHeigh > windowHeigh) {
                $('body').css("height", realcontentHeigh + "px");
                $('#page-wrapper').css("height", realcontentHeigh + "px");
                $('#sidebar-wrapper').css("height", realcontentHeigh + "px");
            } else {
                $('#page-wrapper').css("height", windowHeigh + "px");
                $('body').css("height", windowHeigh + "px");
                $('#sidebar-wrapper').css("height", windowHeigh + "px");
            }
            if ($('body').hasClass('fixed-nav')) {
                $('#page-wrapper').css("height", $(window).height() - 60 + "px");
            }
        }

        function fix_mainpage_height() {
            var windowHeigh = $(window).height();
            var realcontentHeigh = $const.TRAIN_ID.length * 47 + $(".main-page-tips").height() + 270;

            if (realcontentHeigh > windowHeigh) {
                $('body').css("height", realcontentHeigh + "px");
                $('#page-wrapper').css("height", realcontentHeigh + "px");
                $('#sidebar-wrapper').css("height", realcontentHeigh + "px");
            } else {
                $('#page-wrapper').css("height", windowHeigh + "px");
                $('body').css("height", windowHeigh + "px");
                $('#sidebar-wrapper').css("height", windowHeigh + "px");
            }
            if ($('body').hasClass('fixed-nav')) {
                $('#page-wrapper').css("height", $(window).height() - 60 + "px");
            }
        }

        function fix_auth_height() {
            $('body').css("height", ($(window).height() + 100) + "px");
            $('.auth-content').css("height", $('body').height() + "px");
        }
    }
]);


//11点弹窗
module.controller('CurrentdayDialog', [
    '$scope', '$state', '$rootScope', '$timeout', '$uibModalInstance', 'Alert', 'MainService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $modalInstance, $alert, mainService, $const) {
        // footable
        angular.element(document).ready(function () {
            $('.footable-for-dialog').footable({ paginate: false });
        });
        $scope.line = $const.LINE;

        $scope.form = {
            isLoaded: false,
            isLoading: false,
            setLoaded: function (loaded) {
                this.isLoaded = loaded;
            },
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        };

        $scope.$on('CurrentDayRecordUpdate', function (event) {
            $timeout(function () {
                $('.footable-for-dialog').footable({ paginate: false });
                $('.footable-for-dialog').trigger('footable_redraw');

            }, 100);
        });

        function dateTransfer(date) {
            var Y = date.getFullYear(),
                M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : '' + (date.getMonth() + 1),
                D = date.getDate() < 10 ? '0' + (date.getDate()) : '' + (date.getDate());
            return Y + M + D + '000000';
        }
        $scope.date = dateTransfer(new Date());

        $scope.getCurrentDayData = function () {
            $alert.clear();

            $scope.form.setLoading(true);
            $scope.form.setLoaded(false);
            mainService.retrieveCurrentDayData($scope.date).then(
                function (data) {
                    if (typeof (data) == "string") {
                        $alert.error(data, $scope);
                        $scope.form.setLoading(false);
                        $scope.form.setLoaded(false);

                        return
                    }
                    $scope.currentDayRecords = data.result;


                    $scope.form.setLoading(false);
                    $scope.form.setLoaded(true);

                    $scope.$broadcast('CurrentDayRecordUpdate');
                },
                function (err) {
                    $timeout(function () {
                        $alert.error(err.error, $scope);
                        $scope.exception = true;

                        $scope.form.setLoading(false);
                    }, 1000);
                }
            )
        };
        $scope.currentDayRecords = [];

        $scope.getCurrentDayData();

        $scope.cancel = function () {
            $modalInstance.close();
        };

        $scope.exportToCsv = function () {
            var csvString = "线路,车号,峰值,峰值因子,峭度,峭度因子,均方根,轴温,电机温度,轴温升,电机温升,时间,状态" + "\n";

            var raw_table = $scope.currentDayRecords;
            for (var idx = 0, len = raw_table.length; idx < len; idx++) {

                csvString = csvString + $scope.line + ',' + "\'" + raw_table[idx].trainId + "\'" + "," + '\"' + raw_table[idx].FZ.content + '\"' + ","
                    + '\"' + raw_table[idx].FZYZ.content + '\"' +
                    "," + '\"' + raw_table[idx].QD.content + '\"' + "," + '\"' + raw_table[idx].QDYZ.content + '\"' + ","
                    + '\"' + raw_table[idx].JFG.content + '\"' + "," +
                    raw_table[idx].ZW.content + "," + raw_table[idx].MOTOR.content + "," +
                    raw_table[idx].ZWINC.content + "," + raw_table[idx].MOTOTTEMPINC.content + "," +
                    raw_table[idx].trainDate + "," + raw_table[idx].trainState + ",";

                csvString = csvString.substring(0, csvString.length - 1);
                csvString = csvString + "\n";
            }
            csvString = "\uFEFF" + csvString.substring(0, csvString.length - 1);
            var date = raw_table[0].trainDate.substring(0, 10);

            var a = $('<a/>', {
                style: 'display:none',
                href: 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(csvString))),
                download: date + '_过车记录表.csv'
            }).appendTo('body');
            a[0].click();
            a.remove();
        };

    }
]);


//点击图标弹窗
module.controller('MainDialogController', [
    '$scope', '$state', '$rootScope', '$timeout', '$uibModalInstance', 'Alert', 'MainService', 'trainOnlyId', 'trainDirection', 'constants',
    function ($scope, $state, $rootScope, $timeout, $modalInstance, $alert, mainService, trainOnlyId, trainDirection, $const) {
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;

        $scope.exception = false;
        $scope.formSearch = {
            isLoading: false,
            isLoaded: false,
            setLoading: function (loading) {
                this.isLoading = loading;
            },
            setLoaded: function (loaded) {
                this.isLoaded = loaded;
            }
        };

        $scope.form = {};

        $scope.getTrainDetail = function (trainOnlyId) {
            $alert.clear();

            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);

            mainService.retrieveTrainDetail(trainOnlyId).then(
                function (trainDetail) {
                    if (typeof (trainDetail) == "string") {
                        $alert.error(trainDetail, $scope);
                        $scope.formSearch.setLoading(false);
                        $scope.formSearch.setLoaded(false);
                        $timeout(function () {
                            $modalInstance.close();
                        }, 1600);
                        return
                    }

                    $scope.form = trainDetail;

                    $scope.form.trainDirection_num = trainDirection;
                    $scope.form.trainDirection = trainDirection == 0 ? '上行' : '下行';
                    $scope.form.trainState_str = $const.TRAIN_STATE_V[$scope.form.trainState - 1];

                    var str = $scope.form.trainDate;
                    $scope.form.trainDate = str.slice(0, 4) + '-' + str.slice(4, 6) + '-' + str.slice(6, 8) + ' ' +
                        str.slice(8, 10) + ':' + str.slice(10, 12) + ':' + str.slice(12, 14);

                    $scope.formSearch.isLoading = false;
                    $scope.formSearch.setLoaded(true);

                },
                function (err) {
                    $timeout(function () {
                        $scope.formSearch.setLoading(false);
                    }, 1000);
                }
            )
        };

        $scope.getTrainDetail(trainOnlyId);

        $scope.cancel = function () {
            $modalInstance.close();
        };

        //删除部分代码,其它要修改
        $scope.confirm = function () {
            $state.go('index.detailmotordata', {
                trainOnlyId: trainOnlyId,
                trainId: $scope.form.trainId,

                trainDirection: $scope.form.trainDirection_num,
                trainDate: $scope.form.trainDate,
                trainState: $scope.form.trainState_str
            });
            $rootScope.$broadcast("HideDashboard", "wusuowei");
            $modalInstance.close();
        };
    }
]);

//报警弹窗
module.controller('WarningDialogController', [
    '$scope', '$state', '$rootScope', '$timeout', '$uibModalInstance', 'Alert', 'MainService', 'constants', 'warningInfo', 'lightStatus',
    function ($scope, $state, $rootScope, $timeout, $modalInstance, $alert, mainService, $const, warningInfo, lightStatus) {

        angular.element(document).ready(function () {
            $('.footable-for-warning').footable({ paginate: false });
        });

        $scope.$on('WarningRecordUpdate', function (event) {
            $timeout(function () {
                $('.footable-for-warning').trigger('footable_redraw');

            }, 100);
        });

        $scope.exception = false;
        $scope.form = {
            isLoading: false,
            setLoading: function (loading) {
                this.isLoading = loading;
            }

        };

        $scope.getAbnormalState = function (trainOnlyId) {
            $alert.clear();

            $scope.form.setLoading(true);
            mainService.retrieveAbnormalState(trainOnlyId).then(
                function (abnormalInfo) {
                    if (typeof (abnormalInfo) == "string") {
                        $alert.error(abnormalInfo, $scope);
                        $scope.form.setLoading(false);

                        return
                    }
                    var record = {};

                    $scope.warningRecords.trainId = warningInfo.trainId;
                    $scope.warningRecords.faultType = abnormalInfo.faultInfo.join('，');
                    var str = abnormalInfo.trainDate;
                    $scope.warningRecords.trainDate = str.slice(0, 4) + '-' + str.slice(4, 6) + '-' + str.slice(6, 8) + ' ' +
                        str.slice(8, 10) + ':' + str.slice(10, 12) + ':' + str.slice(12, 14);

                    $scope.$broadcast('WarningRecordUpdate');

                    $scope.form.setLoading(false);
                },
                function (err) {

                    $timeout(function () {
                        $scope.form.setLoading(false);
                    }, 1000);
                }
            )
        };
        $scope.warningRecords = {};

        $scope.getAbnormalState(warningInfo.trainOnlyId);

        $scope.cancel = function () {
            $modalInstance.close();
        };
        $scope.$on('modal.closing', function () {
            var status = lightStatus.pop();

            if (lightStatus.length === 0) {
                mainService.triggerLight(0);
            }
        })
    }
]);

module.controller('PasswordChangeController', [
    '$scope', '$state', '$rootScope', '$timeout', '$uibModalInstance', 'Alert', 'MainService', 'username',
    function ($scope, $state, $rootScope, $timeout, $modalInstance, $alert, mainService, username) {

        $scope.exception = false;
        $scope.form = {
            username: username,
            oldPassword: '',
            newPassword1: '',
            newPassword2: '',
            isLoading: false,
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        };

        $scope.changePassword = function () {
            $alert.clear();
            if ($scope.form.username && $scope.form.newPassword1 && $scope.form.newPassword2 && $scope.form.oldPassword) {
                if ($scope.form.newPassword1 != $scope.form.newPassword2) {
                    $alert.error("输入的密码不一致");
                    return
                }
            } else {
                $alert.error("输入项不能为空");
                return
            }

            var user = {};
            user.username = $scope.form.username;
            user.oldPassword = $scope.form.oldPassword;
            user.newPassword = $scope.form.newPassword1;

            $scope.form.setLoading(true);
            mainService.changePassword(user).then(
                function (code) {
                    if (code == -1) {
                        $alert.error("密码更改失败", $scope);
                        $scope.form.setLoading(false);
                        return
                    } else {
                        $alert.error("密码更改成功，即将关闭弹窗", $scope);
                        $scope.form.setLoading(false);
                        $timeout(function () {
                            $modalInstance.close();
                            $scope.form.setLoading(false);
                        }, 1000);
                    }
                },
                function (err) {

                    $timeout(function () {
                        $alert.error(err.error, $scope);
                        $scope.exception = true;

                        $scope.form.setLoading(false);
                    }, 1000);
                }
            )
        };

        $scope.cancel = function () {
            $modalInstance.close();
        };
    }
]);






