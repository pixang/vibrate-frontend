'use strict';

var module = angular.module('supportAdminApp');

module.controller("HistoryTrendController", ['$scope', '$state', '$rootScope', '$timeout', '$mdpDatePicker', '$mdpTimePicker', 'Alert', 'HistoryTrendService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $mdpDatePicker, $mdpTimePicker, $alert, historyTrendService, $const) {

        $scope.selectedItem = null;
        $scope.inputTrainId = null;
        $scope.querySearch = function (query) {
            return query ? $scope.trainIds.filter(createFilterFor(query)) : $scope.trainIds;
        };
        $scope.selectedTrainIdChange = function (trainId) {
            $scope.formSearch.trainId = trainId;
        };
        $scope.searchInputChange = function (trainId) {
            $scope.formSearch.trainId = trainId;
        };

        function createFilterFor(query) {
            return function filterFn(trainIds) {
                return (trainIds.indexOf(query) === 0);
            };
        }

        // fixed data 
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;
        $scope.trainIds = $const.TRAIN_ID;
        $scope.motorNums = [
            { name: '1', value: 1 },
            { name: '2', value: 2 },
            { name: '3', value: 3 },
            { name: '4', value: 4 },

        ];
        $scope.wheelNums = [
            { name: '1', value: 1 },
            { name: '2', value: 2 },
            { name: '3', value: 3 },
            { name: '4', value: 4 },
            { name: '5', value: 5 },
            { name: '6', value: 6 },
            { name: '7', value: 7 },
            { name: '8', value: 8 },
        ];
        $scope.carriageNums = [
            { name: '奇A', value: '奇A' },
            { name: '奇B', value: '奇B' },
            { name: '奇C', value: '奇C' },
            { name: '奇D', value: '奇D' },
            { name: '偶D', value: '偶D' },
            { name: '偶C', value: '偶C' },
            { name: '偶B', value: '偶B' },
            { name: '偶A', value: '偶A' },
        ];
        $scope.selectType = [
            { name: '振动', value: 1 },
            { name: '轴温', value: 2 },
            { name: '电机', value: 3 }
        ];

        $scope.selectRadioButton = function (value) {
            if ($scope.formSearch.selectType !== value) {
                $scope.formSearch.selectType = value;
                $scope.formSearch.isLoaded = false;
            }
            if (value == 1 || value == 2) {
                $scope.formSearch.wheelDisabled = false;
                $scope.formSearch.motorDisabled = true;
                $scope.formSearch.carriageNumDisabled = false;

            } else {
                $scope.formSearch.wheelDisabled = true;
                $scope.formSearch.motorDisabled = false;
                $scope.formSearch.carriageNumDisabled = true;

            }
        };

        $scope.formSearch = {
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            trainId: null,

            carriageNum: 'IB',
            carriageNumDisabled: false,

            wheelNum: '1',
            wheelDisabled: false,
            motorNum: '1',
            motorDisabled: false,

            selectType: null,

            isLoaded: false,
            isLoading: false,
            setLoaded: function (loaded) {
                this.isLoaded = loaded;
            },
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        };
        $scope.dateTransfer = function (date) {
            var Y = date.getFullYear(),
                M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : '' + (date.getMonth() + 1),
                D = date.getDate() < 10 ? '0' + (date.getDate()) : '' + (date.getDate()),
                h = date.getHours() < 10 ? '0' + (date.getHours()) : '' + (date.getHours()),
                m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : '' + (date.getMinutes()),
                s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : '' + (date.getSeconds());
            return Y + M + D + h + m + s;
        };

        $scope.search = function () {
            $alert.clear();
            var err = [];
            var searchCondition = {};
            if ($scope.formSearch.startTime) {
                searchCondition.startTime = $scope.dateTransfer($scope.formSearch.startTime);
            } else {
                err.push("起始时间不能为空");
            }
            if ($scope.formSearch.endTime) {
                searchCondition.endTime = $scope.dateTransfer($scope.formSearch.endTime);
            } else {
                err.push("结束时间不能为空");
            }

            if (!$scope.formSearch.trainId || !$scope.formSearch.carriageNum || !$scope.formSearch.selectType) {
                err.push("查询条件有误，请检查");
            }
            if (err.length > 0) {
                $alert.error(err.join('! '));
                return
            }
            if ($scope.trainIds.indexOf($scope.formSearch.trainId) == -1) {
                $alert.error("不存在该车号，请检查");
                return
            }
            if (($scope.formSearch.selectType == 1 || $scope.formSearch.selectType == 2) && (!$scope.formSearch.wheelNum && $scope.formSearch.wheelNum != 0)) {
                $alert.error("查询条件有误，请选择车轮号");
                return
            }
            if ($scope.formSearch.selectType == 3 && (!$scope.formSearch.motorNum && $scope.formSearch.motorNum != 0)) {
                $alert.error("查询条件有误，请选择电机号");
                return
            }
            if ($scope.formSearch.selectType == 3 && ($scope.formSearch.carriageNum === "IA" || $scope.formSearch.carriageNum === "IIA")) {
                $alert.error("查询条件有误，" + $scope.formSearch.carriageNum + "节车厢没有电机");
                return
            }
            if (searchCondition.startTime > searchCondition.endTime) {
                $alert.error("起始时间不能大于结束时间");
                return
            }

            searchCondition.trainId = $scope.formSearch.trainId;
            searchCondition.carriageNum = $scope.formSearch.carriageNum;
            searchCondition.selectType = $scope.formSearch.selectType;
            searchCondition.wheelNum = $scope.formSearch.wheelNum;
            searchCondition.motorNum = $scope.formSearch.motorNum;


            $scope.formSearch.setLoaded(false);
            $scope.formSearch.setLoading(true);
            historyTrendService.retrieveRecord(searchCondition).then(
                function (data) {
                    if (typeof (data) == "string") {
                        $alert.error(data);
                        $scope.formSearch.setLoading(false);
                        return
                    }
                    var record = {
                        trainDate: [],
                        value: []
                    };

                    if ($scope.formSearch.selectType == 1) {
                        var fake = $scope.feature;;
                        for (var prop in data) {
                            var cell = data[prop];
                            for (var idx = 0, len = cell.length; idx < len; idx++) {
                                var str = cell[idx].trainDate;
                                record.trainDate.push(str.slice(0, 4) + '-' + str.slice(4, 6) + '-' + str.slice(6, 8) + ' ' +
                                    str.slice(8, 10) + ':' + str.slice(10, 12) + ':' + str.slice(12, 14));
                                record.value.push(cell[idx].value);
                            }

                            fake[prop] = record;
                            record = {
                                trainDate: [],
                                value: []
                            };
                        }
                        $scope.$broadcast('FeatureChartDataUpdated');

                    } else {
                        for (var idx = 0, len = data.length; idx < len; idx++) {
                            var str = data[idx].trainDate;
                            record.trainDate.push(str.slice(0, 4) + '-' + str.slice(4, 6) + '-' + str.slice(6, 8) + ' ' +
                                str.slice(8, 10) + ':' + str.slice(10, 12) + ':' + str.slice(12, 14));
                            record.value.push(data[idx].value);
                        }
                        $scope.zwmotor = record;

                        if ($scope.formSearch.selectType == 2) {
                            $scope.otherChartTitle = "轴温趋势图";
                            $scope.otherChartYaxisTitle = "轴温";
                        } else {
                            $scope.otherChartTitle = "电机趋势图";
                            $scope.otherChartYaxisTitle = "电机";
                        }
                        $scope.$broadcast('OtherChartDataUpdated');
                    }


                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);
                },
                function (err) {
                    $alert.error("服务器出错", $scope);
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.feature = {
            QDYZ: '',
            QD: '',
            FZYZ: '',
            FZ: '',
            JFG: ''
        };
        $scope.zwmotor = {};
        $scope.$on('FeatureChartDataUpdated', function (event) {
            $timeout(function () {
                $rootScope.$broadcast('ResizePage');
            }, 100);
        });
        $scope.$on('OtherChartDataUpdated', function (event) {
            $timeout(function () {
                $rootScope.$broadcast('ResizePage');
            }, 100);
        });

        $scope.$on('FeatureChartDataUpdated', function (event) {
            var dafaultMenuItem = Highcharts.getOptions().exporting.buttons.contextButton.menuItems;

            var qdyz = new Highcharts.Chart({
                chart: {
                    renderTo: 'qdyz',
                    type: 'spline',
                    backgroundColor: '#fafafa',
                    zoomType: 'x',
                    marginRight: 100
                },
                title: {
                    text: '峭度因子趋势分析图'
                },
                xAxis: {
                    categories: $scope.feature.QDYZ.trainDate,
                    tickInterval: $scope.tickInterval
                },
                yAxis: {
                    title: {
                        text: '峭度因子'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                series: [
                    {
                        name: '峭度因子',
                        data: $scope.feature.QDYZ.value
                    }
                ]
            });
            var fz = new Highcharts.Chart({
                chart: {
                    renderTo: 'fz',
                    type: 'spline',
                    backgroundColor: '#fafafa',
                    zoomType: 'x',
                    marginRight: 100
                },
                title: {
                    text: '峰值趋势分析图'
                },
                xAxis: {
                    categories: $scope.feature.FZ.trainDate,
                    tickInterval: $scope.tickInterval
                },
                yAxis: {
                    title: {
                        text: '峰值'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                series: [
                    {
                        name: '峰值',
                        data: $scope.feature.FZ.value
                    }
                ]
            });
            var fzyz = new Highcharts.Chart({
                chart: {
                    renderTo: 'fzyz',
                    type: 'spline',
                    backgroundColor: '#fafafa',
                    zoomType: 'x',
                    marginRight: 100
                },
                title: {
                    text: '峰值因子趋势分析图'
                },
                xAxis: {
                    categories: $scope.feature.FZYZ.trainDate,
                    tickInterval: $scope.tickInterval
                },
                yAxis: {
                    title: {
                        text: '峰值因子'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                series: [
                    {
                        name: '峰值因子',
                        data: $scope.feature.FZYZ.value
                    }
                ]
            });
            var jfg = new Highcharts.Chart({
                chart: {
                    renderTo: 'jfg',
                    type: 'spline',
                    backgroundColor: '#fafafa',
                    zoomType: 'x',
                    marginRight: 100
                },
                title: {
                    text: '均方根趋势分析图'
                },
                xAxis: {
                    categories: $scope.feature.JFG.trainDate,
                    tickInterval: $scope.tickInterval
                },
                yAxis: {
                    title: {
                        text: '均方根'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                series: [
                    {
                        name: '均方根',
                        data: $scope.feature.JFG.value
                    }
                ]
            });
        });

        $scope.$on('OtherChartDataUpdated', function (event) {
            var dafaultMenuItem = Highcharts.getOptions().exporting.buttons.contextButton.menuItems;
            var otherchart = new Highcharts.Chart({
                chart: {
                    renderTo: 'otherchart',
                    type: 'spline',
                    zoomType: 'x',
                    marginRight: 100
                },
                title: {
                    text: $scope.otherChartTitle
                },
                xAxis: {
                    categories: $scope.zwmotor.trainDate,
                    tickInterval: $scope.tickInterval
                },
                yAxis: {
                    title: {
                        text: $scope.otherChartYaxisTitle
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                series: [
                    {
                        name: $scope.otherChartYaxisTitle,
                        data: $scope.zwmotor.value
                    }
                ]
            });
        });

        angular.element(document).ready(function () {
            $rootScope.$broadcast("HideDashboard");
            $('.footable').footable({ paginate: false });
  
            $rootScope.$broadcast('ResizePage');

        });
    }]);
