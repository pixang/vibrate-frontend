'use strict';

angular.module('supportAdminApp')
    .factory('DetailMotorDataService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {
            // local dev
            var API_URL = $const.API_URL;
            var trainState = $const.TRAIN_STATE;

            var DetailMotorDataService = {};

            DetailMotorDataService.retrieveMotorRecord = function (searchCondition) {
                var request = $http({
                    method: 'GET',
                    //url: MY_API_URL + "/query/train",
                    url: API_URL + '/' + searchCondition.trainOnlyid + '/' + 'motordetail',
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                return request.then(
                    function (response) {
                        var data = JSON.stringify(response);
                        if (response.data.code == 0) {
                            return DetailMotorDataService.createRecord(response.data.data);
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
            DetailMotorDataService.retrieveVibrateRecord = function (searchCondition) {
                var request = $http({
                    method: 'GET',
                    //url: MY_API_URL + "/query/train",
                    url: API_URL + '/' + searchCondition.trainOnlyid + '/' + 'vibratedetail',
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                return request.then(
                    function (response) {
                        if (response.data.code == 0) {
                            return DetailMotorDataService.createRecordForVibrate(response.data.data);
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

            DetailMotorDataService.createRecord = function (data) {
                var result = [];
                var content = {};
                angular.forEach(data, function (elem) {
                    result = result.concat(DetailMotorDataService.transferResult(elem));
                });
                content.result = result;
                return content;
            };
            DetailMotorDataService.createRecordForVibrate = function (data) {
                var result = [];
                var content = {};
                angular.forEach(data, function (elem) {
                    result = result.concat(DetailMotorDataService.transferResultForVibrate(elem));
                });
                content.result = result;
                return content;
            };

            DetailMotorDataService.transferResult = function (elem) {
                var Record = function () { };
                var records = [];
                var record = {};

                record.carriageMotor = elem.carriageMotor;
                record.motorTemp = elem.motorTemp;
                record.motorTempinc = elem.motorTempinc;

                record.motorTempState = elem.motorTempState;
                record.motorTempIncState = elem.motorTempIncState;

                records.push(angular.extend(new Record(), record));
                return records;
            };

            DetailMotorDataService.transferResultForVibrate = function (elem) {
                var Record = function () { };
                var records = [];
                var record = {};

                record.carriageWheel = elem.carriageWheel;
                record.jfgValue = elem.jfgValue;
                record.fzValue = elem.fzValue;
                record.fzyzValue = elem.fzyzValue;
                record.qdValue = elem.qdValue;

                record.qdyzValue = elem.qdyzValue;

                record.zxTemp = elem.zxTemp;
                record.zxTempinc = elem.zxTempinc;
                record.zxTempIncState = elem.zxTempIncState;

                record.jfgState = elem.jfgState ? elem.jfgState : null;
                record.fzState = elem.fzState ? elem.fzState : null;
                record.fzyzState = elem.fzyzState ? elem.fzyzState : null;
                record.qdState = elem.qdState ? elem.qdState : null;

                record.qdyzState = elem.qdyzState ? elem.qdyzState : null;
                record.zxState = elem.zxState ? elem.zxState : null;

                records.push(angular.extend(new Record(), record));
                return records;
            };

            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }
            
            return DetailMotorDataService;
        }]);
