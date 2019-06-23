'use strict';

var module = angular.module('supportAdminApp');

module.controller("DrivingTableController", ['$scope', '$state', '$rootScope', '$timeout', '$mdpDatePicker', '$mdpTimePicker', 'Alert', 'DrivingTableService', 'DetailMotorDataService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $mdpDatePicker, $mdpTimePicker, $alert, drivingTableService, detailMotorDataService, $const) {
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;

        $scope.$on('ReportDataUpdated', function (event) {
            $timeout(function () {
                $('.footable-driving-table').footable({ paginate: false });
                $('.footable-driving-table').trigger('footable_redraw');
            }, 100);
        });

        $scope.pageSizes = [
            { name: '10', value: '10' },
            { name: '20', value: '20' },
            { name: '30', value: '30' },
            { name: '40', value: '40' },
            { name: '60', value: '60' },
            { name: '80', value: '80' },
            { name: '200', value: '200' }
        ];

        $scope.formSearch = {
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
                D = date.getDate() < 10 ? '0' + (date.getDate()) : '' + (date.getDate());
            return Y + M + D + '000000';
        };

        $scope.search = function () {
            $alert.clear();
            var searchCondition = {};
            // 取消注释
            var currentTime = new Date("2018,03,15");
            searchCondition.pre = $scope.dateTransfer(currentTime);

            searchCondition.page = parseInt($scope.pagination.current);
            searchCondition.pageSize = parseInt($scope.pagination.pageSize);

            $scope.formSearch.setLoaded(false);
            $scope.formSearch.setLoading(true);
            drivingTableService.retrieveRecord(searchCondition).then(
                function (data) {
                    if (typeof (data) == "string") {
                        $alert.error(data);

                        $scope.formSearch.setLoading(false);
                        return
                    }
                    $scope.reportRecords = data.result;

                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);

                    $scope.pagination.current = data.pageNum;
                    $scope.pagination.totalPages = data.pages;
                    $scope.pages = generatePagesArray($scope.pagination.current, $scope.pagination.totalPages, 9)
                    $scope.$broadcast('ReportDataUpdated');
                },
                function (err) {
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.reportRecords = [];

        $scope.confirm = function (trainOnlyId, trainId, trainDate, trainState_str) {
            var tmp = 2;
            $state.go('index.detailmotordata', {
                trainOnlyId: trainOnlyId,
                trainId: trainId,
                trainDate: trainDate,
                trainState: trainState_str,
                comeFrom: tmp
            });
        };

        $scope.pagination = {
            current: 1,
            totalPages: 1,
            pageSize: $scope.pageSizes[1].value,
        };
        $scope.setCurrent = function (num) {
            if (num === '...' || num == $scope.pagination.current || num == 0 || num == ($scope.pagination.totalPages + 1)) {
                return
            }
            $scope.pagination.current = num;
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

        angular.element(document).ready(function () {
            $rootScope.$broadcast("HideDashboard", "");
            $('.footable').footable({ paginate: false });
            $scope.search();
        });
    }]);



module.controller("MaxMinAverageController", ['$scope', '$state', '$rootScope', '$timeout', '$mdpDatePicker', '$mdpTimePicker', 'Alert', 'DrivingTableService', 'DetailMotorDataService', 'constants',
    function ($scope, $state, $rootScope, $timeout, $mdpDatePicker, $mdpTimePicker, $alert, drivingTableService, detailMotorDataService, $const) {
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;

        $scope.$on('ReportDataUpdated', function (event) {
            $timeout(function () {
                $('.footable-driving-table').footable({ paginate: false });
                $('.footable-driving-table').trigger('footable_redraw');
            }, 100);
        });

        $scope.formSearch = {

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
                D = date.getDate() < 10 ? '0' + (date.getDate()) : '' + (date.getDate());
            return Y + M + D + '000000';
        };

        $scope.search = function () {
            $alert.clear();

            $scope.formSearch.setLoaded(false);
            $scope.formSearch.setLoading(true);
            drivingTableService.retrieveMaxMinAverageRecord().then(
                function (data) {
                    if (typeof (data) == "string") {
                        $alert.error(data);
                        $scope.formSearch.setLoading(false);
                        return
                    }
                    $scope.reportRecords = data;


                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);

                    $scope.$broadcast('ReportDataUpdated');
                },
                function (err) {
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.reportRecords = [];

        angular.element(document).ready(function () {
            $rootScope.$broadcast("HideDashboard");
            $('.footable').footable({ paginate: false });
            $scope.search();
        });
    }]);

