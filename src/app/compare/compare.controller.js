'use strict';

var module = angular.module('supportAdminApp');

module.controller("CompareController", ['$scope', '$state', '$rootScope', '$timeout', '$mdpDatePicker', '$mdpTimePicker', 'Alert', 'CompareService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $mdpDatePicker, $mdpTimePicker, $alert, compareService, $const) {

        $scope.selectedItem = null;
        $scope.inputTrainId = '001002';
        $scope.querySearch = function (query) {
            return query ? $scope.trainIds.filter(createFilterFor(query)) : $scope.trainIds;
        };
        $scope.selectedTrainIdChange = function (trainId) {
            $scope.formSearch.trainId = trainId;
            $scope.formSearch.zdLoaded = [];

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

        $scope.selectType = [
            { name: '振动', value: 1 },
            { name: '轴温', value: 2 },
            { name: '电机', value: 3 }
        ];

        $scope.selectRadioButton = function (value, name) {
            $scope.formSearch.selectType = value;
            $scope.formSearch.selectName = name;
            $scope.formSearch.isLoaded = false;
        };

        $scope.formSearch = {
            oldStartTime: new Date(),
            oldEndTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            trainId: '001002',

            zdType: null,
            zdLoaded: [],
            selectType: null,
            selectName: null,

            isLoaded: false,
            isLoading: false,
            isLoadFeature: false,
            featureIsLoaded: false,
            setLoaded: function (loaded) {
                this.isLoaded = loaded;
            },
            setLoading: function (loading) {
                this.isLoading = loading;
            },
            setLoadFeature: function (loadFeature) {
                this.isLoadFeature = loadFeature;
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
            if (!$scope.formSearch.selectType || ($scope.trainIds.indexOf($scope.formSearch.trainId) == -1)) {
                err.push("查询条件有误，请检查");
            }
            if (err.length > 0) {
                $alert.error(err.join('! '));
                return
            }
            if (searchCondition.startTime > searchCondition.endTime) {
                $alert.error("起始时间不能大于结束时间");
                return
            }
            if ($scope.formSearch.oldStartTime != $scope.formSearch.startTime
                || $scope.formSearch.oldEndTime != $scope.formSearch.endTime) {
                $scope.formSearch.zdLoaded = [];
                $scope.formSearch.oldStartTime = $scope.formSearch.startTime;
                $scope.formSearch.oldEndTime = $scope.formSearch.endTime;
            }

            searchCondition.trainId = $scope.formSearch.trainId;
            searchCondition.selectType = $scope.formSearch.selectType;

            if (searchCondition.selectType === 1) {
                $scope.formSearch.setLoadFeature(true);

                $scope.formSearch.zdType = $scope.formSearch.zdType ? $scope.formSearch.zdType : 5;
                searchCondition.zdType = $scope.formSearch.zdType;
            } else {
                $scope.formSearch.setLoadFeature(false);
            }
            $scope.formSearch.setLoaded(false);
            $scope.formSearch.setLoading(true);
            compareService.retrieveRecord(searchCondition).then(
                function (data) {
                    if (typeof (data) === "string") {
                        $alert.error(data);
                        $scope.formSearch.setLoading(false);
                        return
                    }
                    var records = {
                        xAxis: [],
                        data: []
                    };
                    var record = {
                        name: '',
                        data: []
                    };
                    for (var idx = 0, len = data.length; idx < len; idx++) {
                        var str = data[idx].trainDate;
                        record.name = str.slice(0, 4) + '-' + str.slice(4, 6) + '-' + str.slice(6, 8) + ' ' +
                            str.slice(8, 10) + ':' + str.slice(10, 12) + ':' + str.slice(12, 14);

                        for (var prop in data[idx].value) {
                            if (idx === 0) {
                                records.xAxis.push(prop);
                            }
                            record.data.push(data[idx].value[prop]);
                        }
                        records.data.push(record);
                        record = {
                            name: '',
                            data: []
                        };
                    }

                    $scope.compareRecords = records;
                    if ($scope.formSearch.selectType === 1) {
                        $scope.formSearch.featureIsLoaded = true;

                        $scope.formSearch.zdLoaded.push($scope.formSearch.zdType);
                        switch ($scope.formSearch.zdType) {
                            case 1:
                                $scope.$broadcast('JFGChartDataUpdated');
                                break;
                            case 2:
                                $scope.$broadcast('FZChartDataUpdated');
                                break;
                            case 3:
                                $scope.$broadcast('FZYZChartDataUpdated');
                                break;
                            case 5:
                                $scope.$broadcast('QDYZChartDataUpdated');
                                break;
                            default:
                        }
                    } else {
                        $scope.$broadcast('OtherChartDataUpdated');
                    }
                    $scope.$broadcast('ChartDataUpdated');

                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);
                },
                function (err) {
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.compareRecords = {};
        $scope.featureSearch = function (feature) {
            if ($scope.formSearch.zdLoaded.indexOf(feature) !== -1) {
                return
            }
            $scope.formSearch.zdType = feature;
            $scope.search();
        };
        $scope.$on('QDYZChartDataUpdated', function (event) {
            var qdyz = new Highcharts.Chart({
                chart: {
                    renderTo: 'qdyz',
                    type: 'spline',
                    backgroundColor: '#fafafa',
                    zoomType: 'x',
                    marginRight: 100
                },
                title: {
                    text: $scope.formSearch.trainId + '号车峭度因子对比分析图'
                },
                xAxis: {
                    categories: $scope.compareRecords.xAxis,
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
                series: $scope.compareRecords.data
            });
        });
        $scope.$on('FZChartDataUpdated', function (event) {
            var fz = new Highcharts.Chart({
                chart: {
                    renderTo: 'fz',
                    type: 'spline',
                    backgroundColor: '#fafafa',
                    zoomType: 'x',
                    marginRight: 100
                },
                title: {
                    text: $scope.formSearch.trainId + '号车峰值对比分析图'
                },
                xAxis: {
                    categories: $scope.compareRecords.xAxis,
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
                series: $scope.compareRecords.data
            });
        });
        $scope.$on('FZYZChartDataUpdated', function (event) {
            var fzyz = new Highcharts.Chart({
                chart: {
                    renderTo: 'fzyz',
                    type: 'spline',
                    backgroundColor: '#fafafa',
                    zoomType: 'x',
                    marginRight: 100
                },
                title: {
                    text: $scope.formSearch.trainId + '号车峰值因子对比分析图'
                },
                xAxis: {
                    categories: $scope.compareRecords.xAxis,
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
                series: $scope.compareRecords.data
            });
        });
        $scope.$on('JFGChartDataUpdated', function (event) {
            var jfg = new Highcharts.Chart({
                chart: {
                    renderTo: 'jfg',
                    type: 'spline',
                    backgroundColor: '#fafafa',
                    zoomType: 'x',
                    marginRight: 100
                },
                title: {
                    text: $scope.formSearch.trainId + '号车均方根对比分析图'
                },
                xAxis: {
                    categories: $scope.compareRecords.xAxis,
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
                series: $scope.compareRecords.data
            });
        });
        $scope.$on('OtherChartDataUpdated', function (event) {
            var otherchart = new Highcharts.Chart({
                chart: {
                    renderTo: 'otherchart',
                    type: 'spline',
                    zoomType: 'x',
                    marginRight: 100
                },
                title: {
                    text: $scope.formSearch.trainId + '号车' + $scope.formSearch.selectName + '温度分析图'
                },
                xAxis: {
                    categories: $scope.compareRecords.xAxis,
                    tickInterval: $scope.tickInterval
                },
                yAxis: {
                    title: {
                        text: $scope.formSearch.selectName
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                series: $scope.compareRecords.data
            });
        });
        angular.element(document).ready(function () {
            $rootScope.$broadcast("HideDashboard");
            $('.footable').footable({ paginate: false });
        });
    }]);
