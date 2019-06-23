'use strict';

var module = angular.module('supportAdminApp');

module.controller("WarningSearchController", ['$scope', '$state', '$rootScope', '$timeout', '$mdpDatePicker', '$mdpTimePicker', 'Alert', 'WarningSearchService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $mdpDatePicker, $mdpTimePicker, $alert, warningSearchService, $const) {

        $scope.$on('ReportDataUpdated', function (event) {
            $timeout(function () {
                $('.footable-report-search').footable({ paginate: false });
                $('.footable-report-search').trigger('footable_redraw');
            }, 100);
        });

        //radio box
        $scope.selectedItem = null;
        $scope.inputTrainId = "全部";
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

        // checkbox
        $scope.items = ['报警', '预警', '异常'];
        $scope.itemsTransfer = [1, 2, 3];
        $scope.selected = [1];
        $scope.toggle = function (item) {
            var idx = $scope.selected.indexOf($scope.itemsTransfer[$scope.items.indexOf(item)]);
            if (idx > -1) {
                $scope.selected.splice(idx, 1);
            }
            else {
                $scope.selected.push($scope.itemsTransfer[$scope.items.indexOf(item)]);
            }
        };
        $scope.exists = function (item) {
            return $scope.selected.indexOf($scope.itemsTransfer[$scope.items.indexOf(item)]) > -1;
        };

        // fixed data 
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;
        $scope.trainIds = [].concat($const.TRAIN_ID);
        $scope.trainIds.unshift("全部");
        $scope.motorNums = [
            { name: '1', value: 1 },
            { name: '2', value: 2 },
            { name: '3', value: 3 },
            { name: '4', value: 4 },
            { name: '全部', value: 0 }

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
            { name: '全部', value: 0 }
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
            { name: '全部', value: 'all' }
        ];
        $scope.selectType = [
            { name: '振动', value: 1 },
            { name: '轴温', value: 2 },
            { name: '电机', value: 3 }
        ];

        $scope.pageSizes = [
            { name: '10', value: '10' },
            { name: '20', value: '20' },
            { name: '30', value: '30' },
            { name: '40', value: '40' },
            { name: '60', value: '60' },
            { name: '80', value: '80' },
            { name: '200', value: '200' }
        ];

        $scope.selectRadioButton = function (value) {
            if ($scope.formSearch.selectType !== value) {
                $scope.formSearch.selectType = value;
                $scope.formSearch.isLoaded = false;
            }
            if (value === 1 || value === 2) {
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
            startTime: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
            endTime: new Date(),
            trainId: "全部",

            carriageNum: 'all',
            carriageNumDisabled: false,

            wheelNum: 0,
            wheelDisabled: false,
            motorNum: 0,
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
        // default as 1
        $scope.selectRadioButton(1);

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
            if ($scope.trainIds.indexOf($scope.formSearch.trainId) === -1) {
                $alert.error("不存在该车号，请检查");
                return
            }
            if (($scope.formSearch.selectType === 1 || $scope.formSearch.selectType === 2) && (!$scope.formSearch.wheelNum && $scope.formSearch.wheelNum !== 0)) {
                $alert.error("查询条件有误，请选择车轮号");
                return
            }
            if ($scope.formSearch.selectType === 3 && (!$scope.formSearch.motorNum && $scope.formSearch.motorNum !== 0)) {
                $alert.error("查询条件有误，请选择电机号");
                return
            }
            if ($scope.formSearch.selectType === 3 && ($scope.formSearch.carriageNum === "IA" || $scope.formSearch.carriageNum === "IIA")) {
                $alert.error("查询条件有误，" + $scope.formSearch.carriageNum + "节车厢没有电机");
                return
            }
            if (searchCondition.startTime > searchCondition.endTime) {
                $alert.error("起始时间不能大于结束时间");
                return
            }
            searchCondition.trainId = $scope.formSearch.trainId;
            if ($scope.formSearch.trainId === "全部") {
                searchCondition.trainId = 0;
            }
            searchCondition.carriageNum = $scope.formSearch.carriageNum;
            searchCondition.selectType = $scope.formSearch.selectType;
            searchCondition.wheelNum = $scope.formSearch.wheelNum;
            searchCondition.motorNum = $scope.formSearch.motorNum;
            searchCondition.faultType = $scope.selected.length === 0 ? [1, 2, 3] : $scope.selected;

            if ($scope.pagination.currentPageReset === false) {
                searchCondition.page = parseInt($scope.pagination.current);
                $scope.pagination.currentPageReset = true;
            } else {
                searchCondition.page = 1;
            }
            searchCondition.pageSize = parseInt($scope.pagination.pageSize);



            $scope.formSearch.setLoaded(false);
            $scope.formSearch.setLoading(true);
            warningSearchService.retrieveRecord(searchCondition).then(
                function (data) {
                    if (typeof (data) === "string") {
                        $alert.error(data);

                        $scope.formSearch.setLoading(false);
                        return
                    }
                    $scope.reportRecords = data.result;


                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);

                    $scope.pagination.current = data.pageNum;
                    $scope.pagination.totalPages = data.pages;
                    $scope.pages = generatePagesArray($scope.pagination.current, $scope.pagination.totalPages, 9);
                    $scope.$broadcast('ReportDataUpdated');
                },
                function (err) {
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.reportRecords = [];

        //报表下载   $scope.reportRecords
        $scope.exportData = function () {
            switch ($scope.formSearch.selectType) {
                case 1:
                    var csvString = "线路,车号,车厢号,车轮号,均方根,峰值,峰值因子,峭度,峭度因子,时间" + "\n";
                    var raw_table = $scope.reportRecords;
                    for (var idx = 0, len = raw_table.length; idx < len; idx++) {
                        csvString = csvString + $scope.line + "," + "\'" + raw_table[idx].trainId + "\'" + "," + raw_table[idx].carriageNum + ","
                            + raw_table[idx].wheelNum + "," + raw_table[idx].jfgValue + ","
                            + raw_table[idx].fzValue + "," + raw_table[idx].fzyzValue + "," + raw_table[idx].qdValue + ","
                            + raw_table[idx].qdyzValue + "," + raw_table[idx].trainDate + ",";

                        csvString = csvString.substring(0, csvString.length - 1);
                        csvString = csvString + "\n";
                    }
                    csvString = "\uFEFF" + csvString.substring(0, csvString.length - 1);
                    var a = $('<a/>', {
                        style: 'display:none',
                        href: 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(csvString))),
                        download: $scope.formSearch.trainId + '_报警振动报表.csv'
                    }).appendTo('body');
                    a[0].click();
                    a.remove();
                    break;
                case 2:
                    var csvString = "线路,车号,车厢号,车轮号,轴温,轴温温升,时间" + "\n";

                    var raw_table = $scope.reportRecords;
                    for (var idx = 0, len = raw_table.length; idx < len; idx++) {
                        csvString = csvString + $scope.line + "," + "\'" + raw_table[idx].trainId + "\'" + "," + raw_table[idx].carriageNum + ","
                            + raw_table[idx].wheelNum + "," + raw_table[idx].zxTemp + "," + raw_table[idx].zxTempinc + "," +
                            raw_table[idx].trainDate + ",";

                        csvString = csvString.substring(0, csvString.length - 1);
                        csvString = csvString + "\n";
                    }
                    csvString = "\uFEFF" + csvString.substring(0, csvString.length - 1);
                    var a = $('<a/>', {
                        style: 'display:none',
                        href: 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(csvString))),
                        download: $scope.formSearch.trainId + '_报警轴温报表.csv'
                    }).appendTo('body');
                    a[0].click();
                    a.remove();
                    break;
                case 3:
                    var csvString = "线路,车号,车厢号,车轮号,电机温度,电机温升,时间" + "\n";

                    var raw_table = $scope.reportRecords;
                    for (var idx = 0, len = raw_table.length; idx < len; idx++) {
                        csvString = csvString + $scope.line + "," + "\'" + raw_table[idx].trainId + "\'" + "," + raw_table[idx].carriageNum + ","
                            + raw_table[idx].motorNum + "," + raw_table[idx].motorTemp + "," + raw_table[idx].motorTempinc + "," +
                            raw_table[idx].trainDate + ",";

                        csvString = csvString.substring(0, csvString.length - 1);
                        csvString = csvString + "\n";
                    }
                    csvString = "\uFEFF" + csvString.substring(0, csvString.length - 1);
                    var a = $('<a/>', {
                        style: 'display:none',
                        href: 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(csvString))),
                        download: $scope.formSearch.trainId + '_报警电机报表.csv'
                    }).appendTo('body');
                    a[0].click();
                    a.remove();
                    break;
            }
        };

        $scope.pagination = {
            current: 1,
            currentPageReset: true,
            totalPages: 1,
            pageSize: $scope.pageSizes[1].value,
        };
        $scope.setCurrent = function (num) {
            if (num === '...' || num === $scope.pagination.current || num === 0 || num === ($scope.pagination.totalPages + 1)) {
                return
            }
            $scope.pagination.current = num;
            $scope.pagination.currentPageReset = false;
            $scope.search();
        };

        $scope.onChange = function () {
            $scope.search();
        };

        // calculate the array of the page
        function generatePagesArray(currentPage, totalPages, paginationRange) {
            var pages = [];
            var halfWay = Math.ceil(paginationRange / 2);
            var position;

            if (currentPage <= halfWay) {
                position = 'start';
            } else if (totalPages - halfWay < currentPage) {
                position = 'end';
            } else {
                position = 'middle';
            }

            var ellipsesNeeded = paginationRange < totalPages;
            var i = 1;
            while (i <= totalPages && i <= paginationRange) {
                var pageNumber = calculatePageNumber(i, currentPage, paginationRange, totalPages);

                var openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
                var closingEllipsesNeeded = (i === paginationRange - 1 && (position === 'middle' || position === 'start'));
                if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                    pages.push('...');
                } else {
                    pages.push(pageNumber);
                }
                i++;
            }
            return pages;
        }

        function calculatePageNumber(i, currentPage, paginationRange, totalPages) {
            var halfWay = Math.ceil(paginationRange / 2);
            if (i === paginationRange) {
                return totalPages;
            } else if (i === 1) {
                return i;
            } else if (paginationRange < totalPages) {
                if (totalPages - halfWay < currentPage) {
                    return totalPages - paginationRange + i;
                } else if (halfWay < currentPage) {
                    return currentPage - halfWay + i;
                } else {
                    return i;
                }
            } else {
                return i;
            }
        }

        $scope.dateTransfer = function (date) {
            var Y = date.getFullYear(),
                M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : '' + (date.getMonth() + 1),
                D = date.getDate() < 10 ? '0' + (date.getDate()) : '' + (date.getDate()),
                h = date.getHours() < 10 ? '0' + (date.getHours()) : '' + (date.getHours()),
                m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : '' + (date.getMinutes()),
                s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : '' + (date.getSeconds());
            return Y + M + D + h + m + s;
        };

        angular.element(document).ready(function () {
            $rootScope.$broadcast("HideDashboard");
            $('.footable').footable({ paginate: false });
            $scope.search();
        });
    }]);
