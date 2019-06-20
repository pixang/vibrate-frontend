'use strict';

angular.module('supportAdminApp')
    .factory('CompareService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {
            // local dev
            var API_URL = $const.API_URL;

            var CompareService = {};

            CompareService.retrieveRecord = function (searchCondition) {
                var payload = JSON.stringify(searchCondition);
                var request = $http({
                    method: 'POST',
                    url: API_URL + '/tendency/fivecompare',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: payload
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
            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }
            return CompareService;
        }]);
