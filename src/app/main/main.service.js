'use strict';

angular.module('supportAdminApp')
    .factory('MainService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {

            var API_URL = $const.API_URL;
            var MainService = {};
            MainService.retrieveTrainDetail = function (trainOnlyId) {
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/' + trainOnlyId + '/' + 'traindetail',
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                return request.then(
                    function (response) {
                        if (response.data.code == 0) {
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

            MainService.triggerLight = function (status) {
                $http({
                    method: 'GET',
                    url: API_URL + '/deviceState' + '/' + status,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            };
            MainService.retrieveTrainInfo = function () {
                var request = $http({
                    method: 'GET',
                    url: API_URL + "/index/last",
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

            MainService.retrieveAllTrainInfo = function () {
                var request = $http({
                    method: 'GET',
                    url: API_URL + "/index/all",
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

            MainService.changePassword = function (user) {
                var payload = JSON.stringify(user);

                var request = $http({
                    method: 'POST',
                    url: API_URL + '/' + 'user' + '/' + 'password',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: payload
                });
                return request.then(
                    function (response) {
                        return response.data.code;
                    },
                    function (error) {
                        return $q.reject({ error: error });
                    }
                );
            };


            MainService.retrieveAbnormalState = function (trainOnlyId) {
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/warn' + '/' + trainOnlyId,
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

            MainService.retrieveCurrentDayData = function (date) {
                var request = $http({
                    method: 'GET',
                    url: API_URL + "/today/" + date,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                return request.then(
                    function (response) {
                        if (response.data.code === 0) {
                            return MainService.createRecord(response.data.data);
                        }
                        else {
                            return response.data.msg;
                        }
                        return response.data;
                    },
                    function (error) {

                        return $q.reject({ error: error });
                    }
                );
            };

            MainService.createRecord = function (data) {
                var result = [];
                var content = {};
                angular.forEach(data, function (elem) {
                    result = result.concat(MainService.transferResult(elem));
                });
                content.result = result;
                return content;
            };

            MainService.transferResult = function (elem) {
                var Record = function () {
                };
                var records = [];
                var record = {};
                record.trainId = elem.trainId;
                record.QD = elem.detailVOMap.QD;

                record.QDYZ = elem.detailVOMap.QDYZ;
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

            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }
            return MainService;
        }
    ]);
