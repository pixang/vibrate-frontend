'use strict';

angular.module('supportAdminApp')
    .factory('SystemConfigurationService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {
            // local dev
            var API_URL = $const.API_URL;
            var trainState = $const.TRAIN_STATE;

            var systemConfigurationService = {};

            systemConfigurationService.retrieveThresholdData = function () {
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/settings/trainparam',
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

            systemConfigurationService.saveThresholdData = function(searchCondition) {
                var payload = JSON.stringify(searchCondition);
                console.log("payload :   "  + payload);

                var request = $http({
                    method: 'POST',
                    url: API_URL + '/settings/trainparam/save',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: payload
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
            return systemConfigurationService;

        }]);
