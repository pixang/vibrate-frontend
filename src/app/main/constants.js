'use strict';

var module = angular.module('supportAdminApp');

module.constant('constants', {
    LINE: 13,
    STATION: "襄阳",
    TRAIN_STATE_V: ['报警','预警','设备异常','正常'],
    TRAIN_ID: ["001002","003004","005006","007008","009010","011012","013014","015016","017018","019020","021022","023024","025026","027028","029030","031032","033034","00-1000"],
    API_URL: "http://ruiyi.vipgz1.idcfengye.com"
});
