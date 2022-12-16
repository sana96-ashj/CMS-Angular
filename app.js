define([], function () {
    var app = angular.module('HybridMail', ['ngRoute', 'routeResolverServices', 'ngDialog', 'ngMessages', 'AHDatePicker', 'ngTouch']);
    app.directive('cms', function () {
        var call = 0,
            list = {},
            handler = {
                restrict: 'E',
                templateUrl: 'Templates/cms.min.html',
                scope: {
                    code: "@",
                    quantity: "@",
                    index: "@"
                },
                render: function (scope, data) {
                    var detailList = groupby(data.Table, 'parentID', 'Priority');
                    var luck = {};
                    detailList = Object.keys(detailList).map(function (value) { return detailList[value]; });
                    angular.forEach(list, function (val, i) {
                        var s = val.quantity ? detailList.splice(0, val.quantity) : detailList.splice(0, detailList.length);
                        angular.forEach(s, function (child, j) {
                            var groups = groupby(child, 'CMSMasterID');
                            var designType = {
                                sample: child[0],
                                groups: groups,
                                selectedIndex: 0,
                                groupKeys: Object.keys(groups),
                            }
                            val.list.push(designType);
                            handler.setInterval(val.list[j], scope);
                        });
                    });
                },
                setInterval: function (type, scope) {
                    clearInterval(type.interval);
                    type.interval = setInterval(function () {
                        type.selectedIndex = scope.getIndex(type, 1);
                        !scope.$$phase && scope.$apply();
                    }, 10000);
                },

                link: function (scope, element) {
                    scope.CurrentLanguage = scope.$parent.CurrentLanguage;
                    scope.animationDelay = function (i) {
                        i = (((i % 10) / 10) - 0.09) + 's';
                        return {
                            'animation-duration': i,
                            'transition-duration': i
                        }
                    }
                    var s = 'selected-right';
                    var b = 'not-selected-right';
                    var mem = 0;
                    scope.calcHeight = function () {
                        if (angular.element('.group-ontop').height() > mem)
                            mem = angular.element('.group-ontop').height()
                        return { height: mem }
                    }
                    scope.isMobile = function () {
                        if (screen.width <= 480)
                            return true;
                        else
                            return false;
                    }
                    scope.getPTRClass = function (isRtl, i) {
                        var myClass = " ";
                        if (screen.width <= 480)
                            if (i % 2)
                                if (isRtl)
                                    myClass += 'Yp-float-reverse Yp-border-left'
                                else
                                    myClass += 'Yp-float-reverse Yp-border-right';
                            else
                                if (isRtl)
                                    myClass += 'Yp-float Yp-border-right';
                                else
                                    myClass += 'Yp-float Yp-border-left'
                        else {
                            if (i % 2)
                                myClass += 'handler-img-1 '
                            else
                                myClass += 'handler-img-0 '
                            if (isRtl)
                                myClass += 'Yp-border-left'
                            else
                                myClass += 'Yp-border-right';
                        }
                        return myClass;
                    }
                    scope.getClass = function (id, dt, i) {
                        return (id == dt.groupKeys[dt.selectedIndex] ? s : b) + ((i && i > 5) ? ' Yp-desktop' : ' Yp-show-inline-block');
                    };
                    scope.getIndex = function (type, isForward) {
                        handler.setInterval(type, scope);
                        s = isForward ? 'selected-right' : 'selected-left'
                        b = isForward ? 'not-selected-right' : 'not-selected-left'
                        if (isForward)
                            return ++type.selectedIndex == type.groupKeys.length ? 0 : type.selectedIndex;
                        else
                            return --type.selectedIndex == -1 ? type.groupKeys.length - 1 : type.selectedIndex;
                    };
                    scope.list = list;
                    call++;
                    list[scope.index] = { quantity: scope.quantity, list: [] };
                    if (call == 1) {
                        var createContent = function () {
                            var tempContent = JSON.parse(localStorage.getItem('cms' + scope.code + scope.CurrentLanguage.Culture));
                            if (tempContent)
                                handler.render(scope, tempContent);
                            $.ajax({
                                type: "GET",
                                url: baseUrl + "api/cms/GetCMSBySlideShowTypeCode/" + scope.code,
                                success: function (data) {
                                    if (!tempContent || data.Table1[0].GUID != tempContent.Table1[0].GUID) {
                                        localStorage.setItem('cms' + data.Table1[0].Code + scope.CurrentLanguage.Culture, JSON.stringify(data));
                                        Object.keys(list).forEach(function (key) {
                                            scope.list[key].list = list[key].list = []
                                        });
                                        handler.render(scope, data);
                                    }
                                }
                            })
                        }
                        setTimeout(function () { createContent(); }, 10);
                        scope.$on("$routeChangeStart", function (scope, next, current) {
                            call = 0;
                            scope.list = list = {};
                        });
                    }
                }
            };
        return handler;
    });
    app.directive('cmsMaster', ['$http', function (http) {
        var call = 0,
            list = {},
            handler = {
                restrict: 'E',
                templateUrl: 'Templates/CMSMaster.html',
                scope: {
                    code: "@",
                    //quantity: "@",
                    //index: "@"
                },
                link: function (scope, element) {
                    http({
                        method: 'GET',
                        url: baseUrl + "api/cms/GetById/" + scope.code,
                    }).success(function (data, status) {
                        scope.cms = data[0];
                    }).error(function (data, status) {
                        successfullFunc(status);
                    });
                }
            };
        return handler;
    }]);

})