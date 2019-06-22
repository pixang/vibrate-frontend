'use strict';

angular.module('supportAdminApp')
    .factory('WarningSearchService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {
            // local dev
            var API_URL = $const.API_URL;
            var WarningSearchService = {};

            WarningSearchService.retrieveRecord = function (searchCondition) {

                var payload = JSON.stringify(searchCondition);

                var request = $http({
                    method: 'POST',
                    url: API_URL + '/history/fault',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: payload
                });
                return request.then(
                    function (response) {
                        if (response.data.code === 0) {
                            return WarningSearchService.createRecord(response.data.data);
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

            WarningSearchService.createRecord = function (data) {
                var result = [];
                var content = {};
                angular.forEach(data.list, function (elem) {
                    result = result.concat(WarningSearchService.transferResult(elem));
                });
                content.result = result;
                content.pages = data.pages;
                content.pageNum = data.pageNum;
                return content;
            };

            WarningSearchService.transferResult = function (elem) {
                var Record = function () {
                };
                var records = [];
                var record = {};

                record.carriageNum = elem.carriageNum;
                record.trainId = elem.trainId;

                record.wheelNum = elem.wheelNum;
                record.jfgValue = elem.jfgValue;
                record.fzValue = elem.fzValue;
                record.fzyzValue = elem.fzyzValue;
                record.qdValue = elem.qdValue;

                record.qdyzValue = elem.qdyzValue;
                record.zxTemp = elem.zxTemp;

                record.jfgState = elem.jfgState;
                record.fzState = elem.fzState;
                record.fzyzState = elem.fzyzState;
                record.qdState = elem.qdState;

                record.qdyzState = elem.qdyzState;
                record.zxState = elem.zxState;
                record.motorTempState = elem.motorTempState;

                record.trainDate = elem.trainDate.slice(0, 4) + '-' + elem.trainDate.slice(4, 6) + '-' + elem.trainDate.slice(6, 8) + ' ' +
                    elem.trainDate.slice(8, 10) + ':' + elem.trainDate.slice(10, 12) + ':' + elem.trainDate.slice(12, 14);

                record.motorNum = elem.motorNum;
                record.motorTemp = elem.motorTemp;
                record.zxTempinc = elem.zxTempinc;
                record.zxTempIncState = elem.zxTempIncState;

                record.motorTempinc = elem.motorTempinc;
                record.motorTempIncState = elem.motorTempIncState;

                records.push(angular.extend(new Record(), record));
                return records;
            };

            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }

            return WarningSearchService;
        }]);
