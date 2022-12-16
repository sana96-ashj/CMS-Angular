define([], function () {
    app.directive('colorpicker', function () {
        return {
            restrict: 'E',
            templateUrl: 'Templates/ColorPicker.html',
            scope: {
                ngModel: '='
            },
            link: function (scope, element) {
                var target = angular.element(element).find('.color-picker-ctx');
                document.addEventListener('click', function (event) {
                    var p = event.path;
                    if (p[1].classList.value.indexOf('color-picker-ctx') == -1 && p[2].classList.value.indexOf('color-picker-ctx') == -1 && p[4].classList.value.indexOf('color-picker-ctx') == -1)
                        scope.colorFlag = false;
                    scope.$apply();
                })
                scope.hue = 255;
                scope.alpha = 100;
                scope.rgbToHex = function (r, g, b) {
                    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
                }
                scope.PickColor = function (event) {
                    var canvasOffset = angular.element(canvas).offset();
                    scope._X = Math.floor(event.clientX - canvasOffset.left);
                    scope._Y = Math.floor(angular.element('body').scrollTop() + event.clientY - canvasOffset.top);
                    if (scope.readColor) {
                        scope.lX = scope._X;
                        scope.lY = scope._Y;
                        pixel = context.getImageData(scope._X, scope._Y, 1, 1).data;
                        initial();
                    }
                }
                scope.$watchGroup(['alpha', 'hue'], function () {
                    initial();
                });

                var pixel = [0, 0, 0],
                    canvas = angular.element(element[0]).find('#picker')[0],
                    context = canvas.getContext('2d'),
                    img = new Image(),
                    initFlag = false,
                    checkFlag = 0;
                function initial() {
                    if (initFlag) {
                        scope._red = SS(pixel[0]);
                        scope._green = SS(pixel[1]);
                        scope._blue = SS(pixel[2]);
                        scope.rgba = 'rgba(' + scope._red + ',' + scope._green + ',' + scope._blue + ',' + (scope.alpha / 100) + ')';
                        scope.ngModel = scope.alpha == 100 ? scope.rgbToHex(scope._red, scope._green, scope._blue) : scope.rgba;
                    } else
                        if (checkFlag == 1)
                            initFlag = true;
                        else
                            checkFlag++;
                }
                function componentToHex(c) {
                    var hex = c ? c.toString(16) : '';
                    return c ? (hex.length == 1 ? "0" + hex : hex) : "0";
                }
                function SS(_string) {
                    return ~~(_string * scope.hue / 255);
                }
                img.onload = function () {
                    context.drawImage(img, 0, 0, img.width, img.height);
                }
                img.src = "BContent/Images/Icons/color_wheel.png";
            }
        }
    })
    app.directive("cms", function (noticeService) {
        return {
            restrict: "E",
            templateUrl: "Templates/CMSTemplates.html",
            scope: {
                designtype: "=",
                designitemtype: "=",
                save: "&",
                getcountry: "&",
                countrylist: "="
                //ngModel: "="
                // list: "=",
                //    activePage: "@",
                //    onClickNotify: "&pageChanged",
            },
            link: function (scope, elem, attrs) {
                //var obj = {
                //Title: "test-title",
                //Description: "test-description",
                // Image: "test-guid"
                // }
                scope.list = [];
                if (scope.designitemtype) {
                    for (var i = 0; i < scope.designitemtype.ItemCount; i++) {
                        var obj = {};
                        obj.Row = i;
                        if (scope.designtype.Code == 09 || scope.designtype.Code == 10 || scope.designtype.Code == 11) {
                            obj.CatList = [];
                            for (var j = 0; j < 10; j++) {
                                obj.CatList[j] = { ID: j };
                            }
                        }
                        scope.list.push(angular.copy(obj));
                    }
                }
                scope.fileupload = function (el) {
                    ajaxFileUpload(el, 0, "Ticket", function (data) {
                        scope.list[parseInt(angular.element(el).attr('index'))].Image = (data).Guid;
                        scope.$apply();
                    }, noticeService);
                }

            }
        };
    });
})