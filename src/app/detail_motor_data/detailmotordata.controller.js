'use strict';

var module = angular.module('supportAdminApp');

module.controller('DetailMotorDataController', [
    '$log', '$scope', '$rootScope', '$stateParams', '$timeout', '$state', '$uibModal', 'Alert', 'DetailMotorDataService', 'constants',
    function ($log, $scope, $rootScope, $stateParams, $timeout, $state, $modal, $alert, detailMotorDataService, $const) {
        $scope.hideDetailMotorData = false;
        $scope.showMotorWave = false;
        $scope.showMotorTable = false;
        // 2次更新
        $scope.count = 0;
        $scope.trainDirectionShow = true;

        $scope.line = $const.LINE;
        $scope.station = $const.STATION;

        $scope.$on('DetailDataUpdated', function (event) {
            $scope.count += 1;
            if ($scope.count === 2) {
                $scope.formSearch.setLoaded(true);
                $scope.formSearch.setLoading(false);

                $('.footable-for-motor').footable({ paginate: false });
                $('.footable-for-motor').trigger('footable_redraw');

                $timeout(function () {
                    $('.footable-for-vibrate').footable({ paginate: false });
                    $('.footable-for-vibrate').trigger('footable_redraw');
                }, 100);
                $rootScope.$broadcast('ResizePage');
            }

        });

        $scope.backFromDetailMotorPage = function () {
            localStorage.removeItem("trainDate");
            localStorage.removeItem("trainId");
            localStorage.removeItem("trainState");
            localStorage.removeItem("trainDirection");
            localStorage.removeItem("trainOnlyId");
            if ($stateParams.comeFrom == 2) {
                $state.go("index.drivingtable");
            } else {
                $state.go("index.main");
            }
        };

        $scope.formSearch = {
            motorNum: '',
            isLoaded: false,
            isLoading: false,
            setLoaded: function (loaded) {
                this.isLoaded = loaded;
            },
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        };

        if ($stateParams.trainDate) {
            $scope.trainDate = $stateParams.trainDate;
            localStorage.setItem("trainDate", $stateParams.trainDate);
        } else {
            $scope.trainDate = localStorage.getItem("trainDate");
        }
        if ($stateParams.trainId) {
            $scope.trainId = $stateParams.trainId;
            localStorage.setItem("trainId", $stateParams.trainId);
        } else {
            $scope.trainId = localStorage.getItem("trainId");
        }
        if ($stateParams.trainState) {
            $scope.trainState = $stateParams.trainState;
            localStorage.setItem("trainState", $stateParams.trainState);
        } else {
            $scope.trainState = localStorage.getItem("trainState");
        }
        if ($stateParams.trainDirection != null) {
            $scope.trainDirection = $stateParams.trainDirection == 0 ? '上行' : '下行';
            localStorage.setItem("trainDirection", $scope.trainDirection);
        } else if (localStorage.getItem("trainDirection") != null) {

            $scope.trainDirection = localStorage.getItem("trainDirection");
        } else {
            $scope.trainDirectionShow = false;
        }

        $scope.search = function (trainOnlyId) {
            $alert.clear();

            if (trainOnlyId == null) {
                $alert.error("请从主页面重新选择！");
                return
            }

            var searchCondition = {};
            searchCondition.trainOnlyid = trainOnlyId;
            localStorage.setItem("trainOnlyId", trainOnlyId);

            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);

            //获取电机温度详细数据    获取振动轴温详细数据
            detailMotorDataService.retrieveVibrateRecord(searchCondition).then(
                function (data) {
                    $scope.detailVibrateRecords = data;
                    $scope.$broadcast('DetailDataUpdated');
                }
            );
            $scope.detailVibrateRecords = [];

            detailMotorDataService.retrieveMotorRecord(searchCondition).then(
                function (data) {
                    $scope.detailMotorRecords = data;
                    $scope.$broadcast('DetailDataUpdated');
                }
            );
            $scope.detailMotorRecords = [];
        };
        $scope.exportData = function () {
            $timeout(function () {
                $scope.exportMotorData()
            }, 100
            );
            $scope.exportVibrateData();
        };
        $scope.exportMotorData = function () {
            var csvString = "线路,车号,电机序号,电机温度,电机温升,状态,行车时间" + "\n";
            var raw_table = $scope.detailMotorRecords.result;
            for (var idx = 0, len = raw_table.length; idx < len; idx++) {
                csvString = csvString + $scope.line + "," + "\'" + $scope.trainId + "\'" + "," + raw_table[idx].carriageMotor + ","
                    + raw_table[idx].motorTemp + "," + raw_table[idx].motorTempinc + "," + $scope.trainState + "," + $scope.trainDate + ",";

                csvString = csvString.substring(0, csvString.length - 1);
                csvString = csvString + "\n";
            }
            csvString = "\uFEFF" + csvString.substring(0, csvString.length - 1);
            var b = $('<a/>', {
                style: 'display:none',
                href: 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(csvString))),
                download: $scope.trainId + '_电机轴温报表.csv'
            }).appendTo('body');
            b[0].click();
            b.remove();
        };
        $scope.exportVibrateData = function () {
            var csvString = "线路,车号,振动序号,均方根,峰值,峰值因子,峭度,峭度因子,振动轴温,轴温升,状态,行车时间" + "\n";

            var raw_table = $scope.detailVibrateRecords.result;
            for (var idx = 0, len = raw_table.length; idx < len; idx++) {
                csvString = csvString + $scope.line + "," + "\'" + $scope.trainId + "\'" + "," + raw_table[idx].carriageWheel + "," + raw_table[idx].jfgValue + ","
                    + raw_table[idx].fzValue + "," + raw_table[idx].fzyzValue + ","
                    + raw_table[idx].qdValue + "," + raw_table[idx].qdyzValue + ","
                    + raw_table[idx].zxTemp + "," + raw_table[idx].zxTempinc + "," + $scope.trainState + "," + $scope.trainDate + ",";

                csvString = csvString.substring(0, csvString.length - 1);
                csvString = csvString + "\n";
            }
            csvString = "\uFEFF" + csvString.substring(0, csvString.length - 1);
            var a = $('<a/>', {
                style: 'display:none',
                href: 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(csvString))),
                download: $scope.trainId + '_振动轴温报表.csv'
            }).appendTo('body');
            a[0].click();
            a.remove();
        };
        //删除部分代码,其它要修改
        angular.element(document).ready(function () {
            $rootScope.$broadcast("HideDashboard");
            var trainOnlyId = $stateParams.trainOnlyId == null ? localStorage.getItem("trainOnlyId") : $stateParams.trainOnlyId;
            $scope.search(trainOnlyId);
        });
    }
]);
