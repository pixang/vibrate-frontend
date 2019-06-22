'use strict';

angular.module('supportAdminApp')
    .factory('DrivingTableService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {

            var API_URL = $const.API_URL;
            var trainState = $const.TRAIN_STATE;

            var DrivingTableService = {};

            DrivingTableService.retrieveRecord = function (searchCondition) {
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/table/report/' + searchCondition.pre + '/' + searchCondition.page + '/' + searchCondition.pageSize,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                return request.then(
                    function (response) {
                        if (response.data.code === 0) {
                            return DrivingTableService.createRecord(response.data.data);
                        }
                        else {
                            return response.data.msg;
                        }
                    },
                    function (error) {
                        return $q.reject({ error: error });
                    }
                );
            };

            DrivingTableService.retrieveMaxMinAverageRecord = function () {
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/history/optiAndAvg',
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                return request.then(
                    function (response) {
                        if (response.data.code === 0) {
                            return response.data.data;
                        }
                        else {
                            return response.data.msg;
                        }
                    },
                    function (error) {
                        return $q.reject({ error: error });
                    }
                );
            };

            DrivingTableService.createRecord = function (data) {
                var result = [];
                var content = {};
                angular.forEach(data.list, function (elem) {
                    result = result.concat(DrivingTableService.transferResult(elem));
                });
                content.result = result;
                content.pages = data.pages;
                content.pageNum = data.pageNum;
                return content;
            };
            // DrivingTableService.createMaxMinAverageRecord = function(data){
            //     var result = [];
            //     var content = {};
            //     angular.forEach(data.list, function(elem){
            //         result = result.concat(DrivingTableService.transferMaxMinAverageResult(elem));
            //     });
            //     content.result = result;
            //     content.pages =  data.pages;
            //     content.pageNum = data.pageNum;
            //     return content;
            // };

            DrivingTableService.transferResult = function (elem) {
                var Record = function () { };
                var records = [];
                var record = {};

                record.trainId = elem.trainId;
                record.trainOnlyId = elem.trainOnlyid;

                record.QDYZ = elem.detailVOMap.QDYZ;
                record.QD = elem.detailVOMap.QD;
                record.FZ = elem.detailVOMap.FZ;
                record.FZYZ = elem.detailVOMap.FZYZ;
                record.MOTOR = elem.detailVOMap.MOTOR;
                record.JFG = elem.detailVOMap.JFG;
                record.ZW = elem.detailVOMap.ZW;
                record.MOTOTTEMPINC = elem.detailVOMap.MOTOTTEMPINC;
                record.ZWINC = elem.detailVOMap.ZWINC;


                record.trainState = $const.TRAIN_STATE_V[elem.trainState - 1];

                record.trainDate = elem.trainDate.slice(0, 4) + '-' + elem.trainDate.slice(4, 6) + '-' + elem.trainDate.slice(6, 8) + ' ' +
                    elem.trainDate.slice(8, 10) + ':' + elem.trainDate.slice(10, 12) + ':' + elem.trainDate.slice(12, 14);

                records.push(angular.extend(new Record(), record));
                return records;
            };
            //
            // DrivingTableService.transferMaxMinAverageResult = function(elem){
            //     var Record = function() {};
            //     var records = [];
            //     var record = {};
            //
            //     record.trainId = elem.trainId;
            //     record.trainOnlyId = elem.trainOnlyid;
            //
            //     record.fzax = elem.fzMax;
            //     record.fzMin = elem.fzMin;
            //     record.fzAvg = elem.fzAvg;
            //     record.qdMax = elem.qdMax;
            //     record.qdMin = elem.qdMin;
            //     record.qdAvg = elem.qdAvg;
            //     record.jfgMax = elem.jfgMax;
            //     record.jfgMin = elem.jfgMin;
            //     record.jfgAvg = elem.jfgAvg;
            //
            //    // record.trainState = $const.TRAIN_STATE_V[ elem.trainState -1];
            //
            //    // record.trainDate = elem.trainDate.slice(0,4)+'-'+elem.trainDate.slice(4,6)+'-'+elem.trainDate.slice(6,8)+ ' '+
            //    //     elem.trainDate.slice(8,10)+ ':' + elem.trainDate.slice(10,12)+':'+elem.trainDate.slice(12,14);
            //
            //     records.push(angular.extend(new Record(), record));
            //     return records;
            // };

            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }
            return DrivingTableService;
        }]);
