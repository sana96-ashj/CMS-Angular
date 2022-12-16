'use strict';

define(['app', '../BModels/Country/Country.js', '../BModels/CMS/CMS.js'], function (app) {
    var oCountryManager = new CountryManager();
    var CMSController = function ($scope, $routeParams, $location, noticeService) {
        $scope.good = '';
        var oCMSManager = new CMSManager();
        initializeController($scope, $routeParams, $location, noticeService, oCMSManager);
    }
    function initializeController($scope, $routeParams, $location, noticeService, CMSManager) {
        var oUserManager = new UserManager();
        oUserManager.isUserLogin(function (isUserLogin) {
            if (isUserLogin == false) {
                $location.path("/views/Login");
                showAlert(localizationStrings['BOFNotAccess']);
                if (!$scope.$$phase) { $scope.$apply(); }
            }
            else {
                oUserManager.checkBackofficeAccess(function (result) {
                    console.log("checkBackOfficeAccess", result);
                    if (result == true) {
                        $scope.designTypeItem = {};
                        $scope.itemTypeItem = "";
                        $scope.rowSelected = 0;
                        $scope.pageTypeClick = false;
                        if (!$scope.$$phase) { $scope.$apply(); }
                        $scope.getParentAndSet = function (parentId) { getParentAndSet(parentId, $scope); }
                        $scope.designType_Click = function (param) { designType_Click(param, $scope, CMSManager, function () { }); }
                        $scope.itemType_Click = function (param) { itemType_Click(param, $scope, CMSManager, function () { }); }
                        $scope.savecmsMaster = function (list, master, CountryList) {
                            noticeService.showLoading("PleaseWaitForTranslateAndInsert");
                            console.log("$scope.ParentID", $scope.ParentID);
                            master.PageTypeID = $scope.pageType.ID;
                            master.ParentID = $scope.ParentID;
                            var countryidList = [];
                            if (!master.IsGlobal) {
                                var countrylist = CountryList.filter(function (ele) { return ele.Selected == true });
                                for (var i = 0; i < countrylist.length; i++) {
                                    countryidList.push(countrylist[i].ID);
                                }

                            }
                            console.log('list', list);
                            for (var i = 0; i < list.length; i++) {
                                if (list[i].hasOwnProperty('CatList')) {
                                    for (var j = 0; j < list[i].CatList.length; j++) {
                                        if (Object.keys(list[i].CatList[j]).length > 2) {
                                            list.push(list[i].CatList[j]);
                                        }
                                    }
                                }
                            }
                            console.log("master", master);
                            CMSManager.insertCMSMasterDetails(master, list, countryidList, function (result) {
                                if (result == "Success") {
                                    $scope.ParentID = null;
                                    if (!$scope.$$phase) { $scope.$apply(); }
                                    noticeService.hideLoading();
                                    setTimeout(function () {
                                        noticeService.alert("SuccessMsg");
                                    }, 1000);
                                    $scope.pageType_change();
                                }
                                else
                                    noticeService.alert("InsertError");
                            });
                        }
                        $scope.setParentID = function (parentId) {
                            //console.log("parentId", parentId);
                            CMSManager.getCMSMasterDetail(parentId, function (result) {
                                $scope.cmsMasterSelected = $scope.cmsMasterList.filter(function (element) {
                                    return element.ID == parentId;
                                });
                                $scope.showMasterInfo = false;
                                $scope.showNewRow = true;
                                $scope.rowSelected = parentId;
                                $scope.ParentID = parentId;
                                $scope.designType = $scope.designTypeList.filter(function (ele) { return ele.ID == result.Table[0].DesignTypeID })[0];
                                if (!$scope.$$phase) { $scope.$apply(); }
                                designType_Click(result.Table[0].DesignTypeID, $scope, CMSManager, function () {
                                    $scope.itemType = $scope.itemTypeList.filter(function (ele) { return ele.ItemTypeID == result.Table[0].ItemTypeID })[0];
                                    if (!$scope.$$phase) { $scope.$apply(); }
                                    itemType_Click($scope.itemType, $scope, CMSManager, function () {
                                        angular.element('#cms').scope().master = result.Table[0];
                                        if (!$scope.$$phase) { $scope.$apply(); }
                                        console.log(angular.element('#cms').scope());

                                        console.log("result1", result);
                                        console.log("angular.element('#cms').scope().list", angular.element('#cms').scope().list);
                                        if ($scope.designType.Code != "09" && $scope.designType.Code != "10" && $scope.designType.Code != "11") {

                                            for (var i = 0; i < angular.element('#cms').scope().list.length; i++) {
                                                if (result.Table1[i]) {
                                                    result.Table1[i].Image = result.Table1[i].AttachmentGuid;
                                                    angular.element('#cms').scope().list[i] = result.Table1[i];
                                                    if (!$scope.$$phase) { $scope.$apply(); }
                                                }
                                            }
                                        }
                                        if ($scope.designType.Code == "09" || $scope.designType.Code == "10" || $scope.designType.Code == "11") {
                                            for (var i = 0; i < angular.element('#cms').scope().list[0].CatList.length; i++) {
                                                if (result.Table1[i]) {
                                                    result.Table1[i].Image = result.Table1[i].AttachmentGuid;
                                                    angular.element('#cms').scope().list[0].CatList[i] = result.Table1[i];
                                                    if (!$scope.$$phase) { $scope.$apply(); }
                                                }
                                            }
                                        }
                                    });
                                });
                            });
                        }
                        $scope.deSelectRow = function () {
                            $scope.cmsMasterSelected = {};
                            $scope.rowSelected = 0;
                            $scope.ParentID = null;
                            if (!$scope.$$phase) { $scope.$apply(); }
                        }
                        $scope.loadAllCountries = function () {
                            if (!$scope.countryList) {
                                oCountryManager.getCountriesFlat(function (result) {
                                    $scope.countryList = result;
                                    if (!$scope.$$phase) { $scope.$apply(); }
                                    console.log(result);
                                })
                            }

                        }
                        $scope.pageType_change = function () {
                            $scope.cmsMasterSelected = {};
                            CMSManager.getCMSMasterBySlideShowTypeID($scope.pageType.ID, function (result) {
                                $scope.showNewRow = false;
                                console.log("result['Table']", result['Table']);
                                $scope.cmsMasterList = result['Table'];
                                if (!$scope.$$phase) { $scope.$apply(); }
                                console.log("cmsMasterList", result['Table']);
                            });
                        }
                        $scope.removeCMSMaster_Click = function (id) {
                            noticeService.confirmation('WantDeleteRecord', function (c) {
                                CMSManager.removeCMSMasterByID(id, function (result) {
                                    if (result) {
                                        $scope.pageType_change();
                                        noticeService.alert("DeleteMsg");
                                    }
                                    else
                                        noticeService.alert("ErrorDelete");
                                });

                            }, function (c) {
                                c();
                            });

                        }
                        CMSManager.getDesignTypes(function (result) {
                            console.log("allDesign", result["Table"]);
                            $scope.designTypeList = result["Table"];
                            if (!$scope.$$phase) { $scope.$apply(); }
                        });
                        CMSManager.getPageTypes(function (result) {
                            $scope.pageTypeList = result["Table"];
                            if (!$scope.$$phase) { $scope.$apply(); }
                        });
                        if (!$scope.$$phase) { $scope.$apply(); }
                    }
                    else {
                        $location.path("/views/Login");
                        showAlert(localizationStrings['BOFNotAccess']);
                        if (!$scope.$$phase) { $scope.$apply(); }
                    }
                });
            }
        });
    }
    function getParentAndSet(parentId, $scope) {
        $scope.ParentID = parentId;
        if (!$scope.$$phase) { $scope.$apply(); }
    }
    function designType_Click(param, $scope, CMSManager, success) {
        $scope.itemTypeItem = "";
        CMSManager.getItemTypesByDesignTypeID(param, function (result) {
            $scope.designTypeItem = $scope.designTypeList.filter(function (element) {
                return element.ID == param;
            })[0];
            $scope.itemTypeList = result["Table"];
            delete $scope.itemType;
            if (!$scope.$$phase) { $scope.$apply(); }
            success();
        });
    }
    function itemType_Click(param, $scope, CMSManager, success) {
        console.log("$scope.itemTypeList", $scope.itemTypeList);
        $scope.itemTypeItem = param.Description;
        $scope.itemTypeTemplate = param.AttachmentGuid;
        if (!$scope.$$phase) { $scope.$apply(); }
        success();
    }
    CMSController.$inject = ['$scope', '$routeParams', '$location', 'noticeService'];
    app.register.controller('CMSController', CMSController);
});