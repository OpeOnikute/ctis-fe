'use strict';
app.directive('maxlength', function() {
    return {
        restrict : 'A',
        link : function($scope, $element, $attributes) {

            var limit = $attributes.maxlength;

            if (limit >= 10) {
                $element.bind('keyup', function(event) {
                    var element = $element.closest(".form-group");

                    element.toggleClass('has-warning', limit - $element.val().length <= 10);
                    element.toggleClass('has-error', $element.val().length >= limit);
                });

                $element.bind('keypress', function(event) {
                    // Once the limit has been met or exceeded, prevent all keypresses from working
                    if ($element.val().length >= limit) {
                        // Except backspace
                        if (event.keyCode != 8) {
                            event.preventDefault();
                        }
                    }
                });
            }
        }
    };
});

//Toggle directive.
app.factory('ToggleHelper', ['$rootScope',
    function ($rootScope) {
        return {

            events: {
                toggle: "clip-two.toggle",
                toggleByClass: "clip-two.toggleByClass",
                togglerLinked: "clip-two.linked",
                toggleableToggled: "clip-two.toggled"
            },

            commands: {
                alternate: "toggle",
                activate: "on",
                deactivate: "off"
            },

            toggle: function (target, command) {
                if (command == null) {
                    command = "toggle";
                }
                $rootScope.$emit(this.events.toggle, target, command);
            },

            toggleByClass: function (targetClass, command) {
                if (command == null) {
                    command = "toggle";
                }
                $rootScope.$emit(this.events.toggleByClass, targetClass, command);
            },

            notifyToggleState: function (elem, attrs, toggleState) {
                $rootScope.$emit(this.events.toggleableToggled, attrs.id, toggleState, attrs.exclusionGroup);
            },

            toggleStateChanged: function (elem, attrs, toggleState) {
                this.updateElemClasses(elem, attrs, toggleState);
                this.notifyToggleState(elem, attrs, toggleState);
            },

            applyCommand: function (command, oldState) {
                switch (command) {
                    case this.commands.activate:
                        return true;
                    case this.commands.deactivate:
                        return false;
                    case this.commands.alternate:
                        return !oldState;
                }
            },

            updateElemClasses: function (elem, attrs, active) {

                if (active) {
                    if (attrs.activeClass) {
                        elem.addClass(attrs.activeClass);
                    }
                    if (attrs.inactiveClass) {
                        elem.removeClass(attrs.inactiveClass);
                    }
                    var parent = elem.parent();
                    if (attrs.parentActiveClass) {
                        parent.addClass(attrs.parentActiveClass);
                    }
                    if (attrs.parentInactiveClass) {
                        parent.removeClass(attrs.parentInactiveClass);
                    }
                } else {
                    if (attrs.inactiveClass) {
                        elem.addClass(attrs.inactiveClass);
                    }
                    if (attrs.activeClass) {
                        elem.removeClass(attrs.activeClass);
                    }
                    var parent = elem.parent();
                    if (attrs.parentInactiveClass) {
                        parent.addClass(attrs.parentInactiveClass);
                    }
                    if (attrs.parentActiveClass) {
                        parent.removeClass(attrs.parentActiveClass);
                    }
                }
            }
        };
    }]);

app.run(["$rootScope", "ToggleHelper",
    function ($rootScope, ToggleHelper) {

        $rootScope.toggle = function (target, command) {

            if (command == null) {
                command = "toggle";
            }
            ToggleHelper.toggle(target, command);
        };

        $rootScope.toggleByClass = function (targetClass, command) {
            if (command == null) {
                command = "toggle";
            }
            ToggleHelper.toggleByClass(targetClass, command);
        };
    }]).directive('ctToggle', ["$rootScope", "ToggleHelper",
    function ($rootScope, ToggleHelper) {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var command = attrs.ctToggle || ToggleHelper.commands.alternate;
                var target = attrs.target;
                var targetClass = attrs.targetClass;
                var bubble = attrs.bubble === "true" || attrs.bubble === "1" || attrs.bubble === 1 || attrs.bubble === "" || attrs.bubble === "bubble";

                if ((!target) && attrs.href) {
                    target = attrs.href.slice(1);
                }

                if (!(target || targetClass)) {
                    throw "'target' or 'target-class' attribute required with 'ct-toggle'";
                }
                elem.on("click tap", function (e) {

                    var angularElem = angular.element(e.target);
                    if (!angularElem.hasClass("disabled")) {
                        if (target != null) {
                            ToggleHelper.toggle(target, command);
                        }
                        if (targetClass != null) {
                            ToggleHelper.toggleByClass(targetClass, command);
                        }
                        if (!bubble) {
                            e.preventDefault();
                            return false;
                        } else {
                            return true;
                        }
                    }

                });
                var unbindUpdateElemClasses = $rootScope.$on(ToggleHelper.events.toggleableToggled, function (e, id, newState) {
                    if (id === target) {
                        ToggleHelper.updateElemClasses(elem, attrs, newState);
                    }
                });

                if (target != null) {
                    $rootScope.$emit(ToggleHelper.events.togglerLinked, target);
                }

                scope.$on('$destroy', unbindUpdateElemClasses);
            }
        };
    }]).directive('toggleable', ["$rootScope", "ToggleHelper",
    function ($rootScope, ToggleHelper) {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var toggleState = false;

                if (attrs["default"]) {
                    switch (attrs["default"]) {
                        case "active":
                            toggleState = true;
                            break;
                        case "inactive":
                            toggleState = false;
                    }
                    ToggleHelper.toggleStateChanged(elem, attrs, toggleState);
                }

                var unbindToggle = $rootScope.$on(ToggleHelper.events.toggle, function (e, target, command) {
                    var oldState;
                    if (target === attrs.id) {
                        oldState = toggleState;
                        toggleState = ToggleHelper.applyCommand(command, oldState);
                        if (oldState !== toggleState) {
                            ToggleHelper.toggleStateChanged(elem, attrs, toggleState);
                        }
                    }
                });

                var unbindToggleByClass = $rootScope.$on(ToggleHelper.events.toggleByClass, function (e, targetClass, command) {
                    var oldState;
                    if (elem.hasClass(targetClass)) {
                        oldState = toggleState;
                        toggleState = ToggleHelper.applyCommand(command, oldState);
                        if (oldState !== toggleState) {
                            ToggleHelper.toggleStateChanged(elem, attrs, toggleState);
                        }
                    }
                });

                var unbindToggleableToggled = $rootScope.$on(ToggleHelper.events.toggleableToggled, function (e, target, newState, sameGroup) {
                    if (newState && (attrs.id !== target) && (attrs.exclusionGroup === sameGroup) && (attrs.exclusionGroup != null)) {
                        toggleState = false;
                        ToggleHelper.toggleStateChanged(elem, attrs, toggleState);
                    }
                });

                var unbindTogglerLinked = $rootScope.$on(ToggleHelper.events.togglerLinked, function (e, target) {
                    if (attrs.id === target) {
                        ToggleHelper.notifyToggleState(elem, attrs, toggleState);
                    }
                });

                scope.$on('$destroy', function () {
                    unbindToggle();
                    unbindToggleByClass();
                    unbindToggleableToggled();
                    unbindTogglerLinked();
                });
            }
        };
    }]);

app.directive('perfectScrollbar', ['$parse', '$window',
    function($parse, $window) {
        var psOptions = ['wheelSpeed', 'wheelPropagation', 'minScrollbarLength', 'useBothWheelAxes', 'useKeyboard', 'suppressScrollX', 'suppressScrollY', 'scrollXMarginOffset', 'scrollYMarginOffset', 'includePadding'//, 'onScroll', 'scrollDown'
        ];

        return {
            restrict: 'EA',
            transclude: true,
            template: '<div><div ng-transclude></div></div>',
            replace: true,
            link: function($scope, $elem, $attr) {
                var jqWindow = angular.element($window);
                var options = {};
                if(!$scope.app.isMobile) {
                    for(var i = 0, l = psOptions.length; i < l; i++) {
                        var opt = psOptions[i];
                        if($attr[opt] !== undefined) {
                            options[opt] = $parse($attr[opt])();
                        }
                    }

                    $scope.$evalAsync(function() {
                        $elem.perfectScrollbar(options);
                        var onScrollHandler = $parse($attr.onScroll);
                        $elem.scroll(function() {
                            var scrollTop = $elem.scrollTop();
                            var scrollHeight = $elem.prop('scrollHeight') - $elem.height();
                            $scope.$apply(function() {
                                onScrollHandler($scope, {
                                    scrollTop: scrollTop,
                                    scrollHeight: scrollHeight
                                });
                            });
                        });
                    });

                    function update(event) {
                        $scope.$evalAsync(function() {
                            if($attr.scrollDown == 'true' && event != 'mouseenter') {
                                setTimeout(function() {
                                    $($elem).scrollTop($($elem).prop("scrollHeight"));
                                }, 100);
                            }
                            $elem.perfectScrollbar('update');
                        });
                    }

                    // This is necessary when you don't watch anything with the scrollbar
                    $elem.bind('mousemove', update);

                    // Possible future improvement - check the type here and use the appropriate watch for non-arrays
                    if($attr.refreshOnChange) {
                        $scope.$watchCollection($attr.refreshOnChange, function() {
                            update();
                        });
                    }

                    // this is from a pull request - I am not totally sure what the original issue is but seems harmless
                    if($attr.refreshOnResize) {
                        jqWindow.on('resize', update);
                    }

                    $elem.bind('$destroy', function() {
                        jqWindow.off('resize', update);
                        $elem.perfectScrollbar('destroy');
                    });
                }
            }
        };
    }]);

app.directive('maxlength', function() {
    return {
        restrict : 'A',
        link : function($scope, $element, $attributes) {

            var limit = $attributes.maxlength;

            if (limit >= 10) {
                $element.bind('keyup', function(event) {
                    var element = $element.closest(".form-group");

                    element.toggleClass('has-warning', limit - $element.val().length <= 10);
                    element.toggleClass('has-error', $element.val().length >= limit);
                });

                $element.bind('keypress', function(event) {
                    // Once the limit has been met or exceeded, prevent all keypresses from working
                    if ($element.val().length >= limit) {
                        // Except backspace
                        if (event.keyCode != 8) {
                            event.preventDefault();
                        }
                    }
                });
            }
        }
    };
});

/**
 * A directive used for "close buttons" (eg: alert box).
 * It hides its parent node that has the class with the name of its value.
 */
app.directive('ctDismiss', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.on('click', function (e) {
                elem.parent('.' + attrs.ctDismiss).hide();
                e.preventDefault();
            });

        }
    };
});

app.directive('a', function () {
    return {
        restrict: 'E',
        link: function (scope, elem, attrs) {
            if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                elem.on('click', function (e) {
                    e.preventDefault();
                });
            }
        }
    };
});

/**
 * Make element 100% height of browser window.
 */
app.directive('ctFullheight', ['$window', '$rootScope', '$timeout', 'APP_MEDIAQUERY',
    function ($window, $rootScope, $timeout, mq) {
        return {
            restrict: "AE",
            scope: {
                ctFullheightIf: '&'
            },
            link: function (scope, elem, attrs) {
                var $win = $($window);
                var $document = $(document);
                var exclusionItems;
                var exclusionHeight;
                var setHeight = true;
                var page;

                scope.initializeWindowSize = function () {
                    $timeout(function () {
                        exclusionHeight = 0;
                        if (attrs.ctFullheightIf) {
                            scope.$watch(scope.ctFullheightIf, function (newVal, oldVal) {
                                if (newVal && !oldVal) {
                                    setHeight = true;
                                } else if (!newVal) {
                                    $(elem).css('height', 'auto');
                                    setHeight = false;
                                }
                            });
                        }

                        if (attrs.ctFullheightExclusion) {
                            var exclusionItems = attrs.ctFullheightExclusion.split(',');
                            angular.forEach(exclusionItems, function (_element) {
                                exclusionHeight = exclusionHeight + $(_element).outerHeight(true);
                            });
                        }
                        if (attrs.ctFullheight == 'window') {
                            page = $win;
                        } else {
                            page = $document;
                        }

                        scope.$watch(function () {
                            scope.__height = page.height();
                        });
                        if (setHeight) {
                            $(elem).css('height', 'auto');
                            if (page.innerHeight() < $win.innerHeight()) {
                                page = $win;
                            }
                            $(elem).css('height', page.innerHeight() - exclusionHeight);
                        }
                    }, 300);
                };

                scope.initializeWindowSize();
                scope.$watch('__height', function (newHeight, oldHeight) {
                    scope.initializeWindowSize();
                });
                $win.on('resize', function () {
                    scope.initializeWindowSize();
                });

            }
        };
    }]);

app.directive('messageItem', ['$location', function ($location) {
    return {
        restrict: 'EA',
        link: function (scope, elem, attrs) {
            elem.on("click tap", function (e) {
                var id = attrs.messageItem;
            });
        }
    };
}]);


/**
 * It's like click, but when you don't click on your element.
 */
app.directive('offClick', ['$document', '$timeout', function ($document, $timeout) {

    function targetInFilter(target, filter) {
        if (!target || !filter) return false;
        var elms = angular.element(document.querySelectorAll(filter));
        var elmsLen = elms.length;
        for (var i = 0; i < elmsLen; ++i)
            if (elms[i].contains(target)) return true;
        return false;
    }

    return {
        restrict: 'A',
        scope: {
            offClick: '&',
            offClickIf: '&'
        },
        link: function (scope, elm, attr) {

            if (attr.offClickIf) {
                scope.$watch(scope.offClickIf, function (newVal, oldVal) {
                        if (newVal && !oldVal) {
                            $timeout(function () {
                                $document.on('click', handler);
                            });
                        } else if (!newVal) {
                            $document.off('click', handler);
                        }
                    }
                );
            } else {
                $document.on('click', handler);
            }

            scope.$on('$destroy', function () {
                $document.off('click', handler);
            });

            function handler(event) {
                // This filters out artificial click events. Example: If you hit enter on a form to submit it, an
                // artificial click event gets triggered on the form's submit button.
                if (event.pageX == 0 && event.pageY == 0) return;

                var target = event.target || event.srcElement;
                if (!(elm[0].contains(target) || targetInFilter(target, attr.offClickFilter))) {
                    scope.$apply(scope.offClick());
                }
            }
        }
    };
}]);


/**
 * Add several features to panels.
 */
app.directive('ctPaneltool', function () {
    var templates = {
        /* jshint multistr: true */
        collapse: "<a href='#' class='btn btn-transparent btn-sm' panel-collapse='' tooltip-placement='top' uib-tooltip='Collapse' ng-click='{{panelId}} = !{{panelId}}' ng-init='{{panelId}}=false'>" + "<i ng-if='{{panelId}}' class='ti-plus'></i>" + "<i ng-if='!{{panelId}}' class='ti-minus'></i>" + "</a>",
        dismiss: "<a href='#' class='btn btn-transparent btn-sm' panel-dismiss='' tooltip-placement='top' uib-tooltip='Close'>" + "<i class='ti-close'></i>" + "</a>",
        refresh: "<a href='#' class='btn btn-transparent btn-sm' panel-refresh='' tooltip-placement='top' uib-tooltip='Refresh' data-spinner='{{spinner}}'>" + "<i class='ti-reload'></i>" + "</a>"
    };

    return {
        restrict: 'E',
        template: function (elem, attrs) {
            var temp = '';
            if (attrs.toolCollapse)
                temp += templates.collapse.replace(/{{panelId}}/g, (elem.parent().parent().attr('id')));
            if (attrs.toolDismiss)
                temp += templates.dismiss;
            if (attrs.toolRefresh)
                temp += templates.refresh.replace(/{{spinner}}/g, attrs.toolRefresh);
            return temp;
        }
    };
});
app.directive('panelDismiss', function () {
    'use strict';
    return {
        restrict: 'A',
        controller: ["$scope", "$element", function ($scope, $element) {
            var removeEvent = 'panel-remove', removedEvent = 'panel-removed';

            $element.on('click', function () {

                var parent = $(this).closest('.panel');

                destroyPanel();

                function destroyPanel() {
                    var col = parent.parent();
                    parent.fadeOut(300, function () {
                        $(this).remove();
                        if (col.is('[class*="col-"]') && col.children('*').length === 0) {
                            col.remove();
                        }
                    });
                }

            });
        }]
    };
})

    .directive('panelRefresh', function () {
        'use strict';

        return {
            restrict: 'A',
            controller: ["$scope", "$element", function ($scope, $element) {

                var refreshEvent = 'panel-refresh', csspinnerClass = 'csspinner', defaultSpinner = 'load1';

                // method to clear the spinner when done
                function removeSpinner() {
                    this.removeClass(csspinnerClass);
                }

                // catch clicks to toggle panel refresh
                $element.on('click', function () {
                    var $this = $(this), panel = $this.parents('.panel').eq(0), spinner = $this.data('spinner') || defaultSpinner;

                    // start showing the spinner
                    panel.addClass(csspinnerClass + ' ' + spinner);

                    // attach as public method
                    panel.removeSpinner = removeSpinner;

                    // Trigger the event and send the panel object
                    $this.trigger(refreshEvent, [panel]);

                });

            }]
        };
    });

(function ($, window, document) {
    'use strict';

    $(document).on('panel-refresh', '.panel', function (e, panel) {

        // perform any action when a .panel triggers a the refresh event
        setTimeout(function () {
            // when the action is done, just remove the spinner class
            panel.removeSpinner();
        }, 3000);

    });

}(jQuery, window, document));

/**
 * Create a custom CSS3 Select Elements.
 * You must use it as a class.
 * Combined with the class .cs-skin-slide it creates a slide <select>
 */
app.factory('SelectFx', ["$http",
    function ($http) {
        function hasParent(e, p) {
            if (!e)
                return false;
            var el = e.target || e.srcElement || e || false;
            while (el && el != p) {
                el = el.parentNode || false;
            }
            return (el !== false);
        };

        /**
         * extend obj function
         */
        function extend(a, b) {
            for (var key in b) {
                if (b.hasOwnProperty(key)) {
                    a[key] = b[key];
                }
            }
            return a;
        }

        /**
         * SelectFx function
         */
        function SelectFx(el, options) {
            this.el = el[0];
            this.options = extend({}, this.options);
            extend(this.options, options);
            this._init();
        }

        function classReg(className) {
            return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
        }

        // classList support for class management
        // altho to be fair, the api sucks because it won't accept multiple classes at once
        var hasClass, addClass, removeClass;

        if ('classList' in document.documentElement) {
            hasClass = function (elem, c) {
                return elem.classList.contains(c);
            };
            addClass = function (elem, c) {
                elem.classList.add(c);
            };
            removeClass = function (elem, c) {
                elem.classList.remove(c);
            };
        } else {
            hasClass = function (elem, c) {
                return classReg(c).test(elem.className);
            };
            addClass = function (elem, c) {
                if (!hasClass(elem, c)) {
                    elem.className = elem.className + ' ' + c;
                }
            };
            removeClass = function (elem, c) {
                elem.className = elem.className.replace(classReg(c), ' ');
            };
        }

        function toggleClass(elem, c) {
            var fn = hasClass(elem, c) ? removeClass : addClass;
            fn(elem, c);
        }

        var classie = {
            // full names
            hasClass: hasClass,
            addClass: addClass,
            removeClass: removeClass,
            toggleClass: toggleClass,
            // short names
            has: hasClass,
            add: addClass,
            remove: removeClass,
            toggle: toggleClass
        };

        // transport
        if (typeof define === 'function' && define.amd) {
            // AMD
            define(classie);
        } else {
            // browser global
            window.classie = classie;
        }

        /**
         * SelectFx options
         */
        SelectFx.prototype.options = {
            // if true all the links will open in a new tab.
            // if we want to be redirected when we click an option, we need to define a data-link attr on the option of the native select element
            newTab: true,
            // when opening the select element, the default placeholder (if any) is shown
            stickyPlaceholder: true,
            // callback when changing the value
            onChange: function (val) {
                return false;
            }
        };

        /**
         * init function
         * initialize and cache some vars
         */
        SelectFx.prototype._init = function () {

            var selectDisabled = false;
            var createSelect = true;
            if (this.el.hasAttribute("disabled")) {
                this.el.className = this.el.className + " disabled";
                selectDisabled = true;
            };

            if (this._styleExist(this.el.previousSibling)) {
                createSelect = false;
            }
            // check if we are using a placeholder for the native select box
            // we assume the placeholder is disabled and selected by default
            var selectedOpt = this.el.querySelectorAll('option[selected]')[this.el.querySelectorAll('option[selected]').length - 1];


            this.hasDefaultPlaceholder = selectedOpt && selectedOpt.disabled;

            // get selected option (either the first option with attr selected or just the first option)
            this.selectedOpt = selectedOpt || this.el.querySelector('option');

            // create structure
            this._createSelectEl();

            // all options
            this.selOpts = [].slice.call(this.selEl.querySelectorAll('li[data-option]'));

            // total options
            this.selOptsCount = this.selOpts.length;

            // current index
            this.current = this.selOpts.indexOf(this.selEl.querySelector('li.cs-selected')) || -1;

            // placeholder elem
            this.selPlaceholder = this.selEl.querySelector('span.cs-placeholder');

            if (!selectDisabled) {
                // init events
                this._initEvents(createSelect);
            }

        };
        /**
         * creates the structure for the select element
         */
        SelectFx.prototype._createSelectEl = function () {

            var self = this, options = '', createOptionHTML = function (el) {
                var optclass = '', classes = '', link = '';

                if (el.getAttribute('selected')) {

                    classes += 'cs-selected ';

                }
                // extra classes
                if (el.getAttribute('data-class')) {
                    classes += el.getAttribute('data-class');
                }
                // link options
                if (el.getAttribute('data-link')) {
                    link = 'data-link=' + el.getAttribute('data-link');
                }

                if (classes !== '') {
                    optclass = 'class="' + classes + '" ';
                }

                return '<li ' + optclass + link + ' data-option data-value="' + el.value + '"><span>' + el.textContent + '</span></li>';
            };

            [].slice.call(this.el.children).forEach(function (el) {
                if (el.disabled) {
                    return;
                }

                var tag = el.tagName.toLowerCase();

                if (tag === 'option') {
                    options += createOptionHTML(el);
                } else if (tag === 'optgroup') {
                    options += '<li class="cs-optgroup"><span>' + el.label + '</span><ul>';
                    [].slice.call(el.children).forEach(function (opt) {
                        options += createOptionHTML(opt);
                    });
                    options += '</ul></li>';
                }
            });

            if (this._styleExist(this.el.previousSibling)) {
                this.selEl = this.el.parentNode;
                this.selEl.tabIndex = this.el.tabIndex;

                this.el.previousSibling.innerHTML = '<ul>' + options + '</ul>';

                return;
            } else {

                var opts_el = '<div class="cs-options"><ul>' + options + '</ul></div>';
                this.selEl = document.createElement('div');
                this.selEl.className = this.el.className;
                this.selEl.tabIndex = this.el.tabIndex;
                this.selEl.innerHTML = '<span class="cs-placeholder">' + this.selectedOpt.textContent + '</span>' + opts_el;
                this.el.parentNode.appendChild(this.selEl);
                this.selEl.appendChild(this.el);
            }

        };
        /**
         * initialize the events
         */
        SelectFx.prototype._initEvents = function (a) {

            var self = this;
            if (a) {
                // open/close select
                this.selPlaceholder.addEventListener('click', function () {
                    self._toggleSelect();
                });
            }
            // clicking the options
            this.selOpts.forEach(function (opt, idx) {
                opt.addEventListener('click', function () {
                    self.current = idx;
                    self._changeOption();
                    // close select elem
                    self._toggleSelect();
                });
            });

            // close the select element if the target itÂ´s not the select element or one of its descendants..
            document.addEventListener('click', function (ev) {
                var target = ev.target;
                if (self._isOpen() && target !== self.selEl && !hasParent(target, self.selEl)) {
                    self._toggleSelect();
                }
            });

            // keyboard navigation events
            this.selEl.addEventListener('keydown', function (ev) {
                var keyCode = ev.keyCode || ev.which;

                switch (keyCode) {
                    // up key
                    case 38:
                        ev.preventDefault();
                        self._navigateOpts('prev');
                        break;
                    // down key
                    case 40:
                        ev.preventDefault();
                        self._navigateOpts('next');
                        break;
                    // space key
                    case 32:
                        ev.preventDefault();
                        if (self._isOpen() && typeof self.preSelCurrent != 'undefined' && self.preSelCurrent !== -1) {
                            self._changeOption();
                        }
                        self._toggleSelect();
                        break;
                    // enter key
                    case 13:
                        ev.preventDefault();
                        if (self._isOpen() && typeof self.preSelCurrent != 'undefined' && self.preSelCurrent !== -1) {
                            self._changeOption();
                            self._toggleSelect();
                        }
                        break;
                    // esc key
                    case 27:
                        ev.preventDefault();
                        if (self._isOpen()) {
                            self._toggleSelect();
                        }
                        break;
                }
            });
        };
        /**
         * navigate with up/dpwn keys
         */
        SelectFx.prototype._navigateOpts = function (dir) {
            if (!this._isOpen()) {
                this._toggleSelect();
            }

            var tmpcurrent = typeof this.preSelCurrent != 'undefined' && this.preSelCurrent !== -1 ? this.preSelCurrent : this.current;

            if (dir === 'prev' && tmpcurrent > 0 || dir === 'next' && tmpcurrent < this.selOptsCount - 1) {
                // save pre selected current - if we click on option, or press enter, or press space this is going to be the index of the current option
                this.preSelCurrent = dir === 'next' ? tmpcurrent + 1 : tmpcurrent - 1;
                // remove focus class if any..
                this._removeFocus();
                // add class focus - track which option we are navigating
                classie.add(this.selOpts[this.preSelCurrent], 'cs-focus');
            }
        };
        /**
         * open/close select
         * when opened show the default placeholder if any
         */
        SelectFx.prototype._toggleSelect = function () {
            // remove focus class if any..
            this._removeFocus();

            if (this._isOpen()) {
                if (this.current !== -1) {
                    // update placeholder text
                    this.selPlaceholder.textContent = this.selOpts[this.current].textContent;
                }
                classie.remove(this.selEl, 'cs-active');
            } else {
                if (this.hasDefaultPlaceholder && this.options.stickyPlaceholder) {
                    // everytime we open we wanna see the default placeholder text
                    this.selPlaceholder.textContent = this.selectedOpt.textContent;
                }
                classie.add(this.selEl, 'cs-active');
            }
        };
        /**
         * detect if .cs-options wrapper is active for each select
         */
        SelectFx.prototype._styleExist = function (e) {
            return (' ' + e.className + ' ').indexOf(' cs-options ') > -1;
        };
        /**
         * change option - the new value is set
         */
        SelectFx.prototype._changeOption = function () {

            // if pre selected current (if we navigate with the keyboard)...
            if (typeof this.preSelCurrent != 'undefined' && this.preSelCurrent !== -1) {
                this.current = this.preSelCurrent;
                this.preSelCurrent = -1;
            }

            // current option
            var opt = this.selOpts[this.current];

            // update current selected value
            this.selPlaceholder.textContent = opt.textContent;

            // change native select elementÂ´s value
            this.el.value = opt.getAttribute('data-value');
            var event = new Event('change');
            this.el.dispatchEvent(event);

            // remove class cs-selected from old selected option and add it to current selected option
            var oldOpt = this.selEl.querySelector('li.cs-selected');
            if (oldOpt) {
                classie.remove(oldOpt, 'cs-selected');
            }
            classie.add(opt, 'cs-selected');

            // if thereÂ´s a link defined
            if (opt.getAttribute('data-link')) {
                // open in new tab?
                if (this.options.newTab) {
                    window.open(opt.getAttribute('data-link'), '_blank');
                } else {
                    window.location = opt.getAttribute('data-link');
                }
            }

            // callback
            this.options.onChange(this.el.value);
        };
        /**
         * returns true if select element is opened
         */
        SelectFx.prototype._isOpen = function (opt) {
            return classie.has(this.selEl, 'cs-active');
        };
        /**
         * removes the focus class from the option
         */
        SelectFx.prototype._removeFocus = function (opt) {
            var focusEl = this.selEl.querySelector('li.cs-focus')
            if (focusEl) {
                classie.remove(focusEl, 'cs-focus');
            }
        };

        return SelectFx;
    }]);

app.directive('csSelect', ["SelectFx", "$timeout",
    function (SelectFx, $timeout) {
        return {
            restrict: 'AC',
            link: function ($scope, $element, $attributes) {

                $scope.$watch(function () {
                    return $element.find('option').length;
                }, function (newValue, oldValue) {
                    if (newValue !== oldValue) {

                        new SelectFx($element);
                    }
                });
                $timeout(function () { new SelectFx($element); });


            }
        };
    }]);


/**
 * A set of directives for left and right sidebar.
 */
app.directive('sidebar', ['$document', '$rootScope',
    function($document, $rootScope) {
        return {
            replace : false,
            restrict : "C",
            link : function(scope, elem, attrs) {
                var shouldCloseOnOuterClicks = true;

                if (attrs.closeOnOuterClicks == 'false' || attrs.closeOnOuterClicks == '0') {
                    shouldCloseOnOuterClicks = false;
                }

                var isAncestorOrSelf = function(element, target) {
                    var parent = element;

                    while (parent.length > 0) {
                        if (parent[0] === target[0]) {
                            parent = null;
                            return true;
                        }
                        parent = parent.parent();
                    }

                    parent = null;
                    return false;
                };

                var closeOnOuterClicks = function(e) {
                    if(!isAncestorOrSelf(angular.element(e.target), elem)) {
                        $("#app .app-content").one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {

                            if(!$('#app').hasClass('app-slide-off') && !$('#app').hasClass('app-offsidebar-open')) {
                                var $winScrollTop = Math.abs($('#app .main-content').position().top);

                                $('#app .main-content').css({
                                    position: 'relative',
                                    top: 'auto'
                                });

                                window.scrollTo(0, $winScrollTop);
                                $('footer').show();
                                $("#app .app-content").off("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");
                            }
                        });
                        $rootScope.toggle(attrs.id, 'off');
                        e.preventDefault();
                        return false;
                    }
                };

                var clearCb1 = angular.noop();

                if (shouldCloseOnOuterClicks) {
                    clearCb1 = $rootScope.$on('clip-two.toggled', function(e, id, active) {

                        if (id == attrs.id) {

                            if (active) {
                                setTimeout(function() {
                                    $document.on('click tap', closeOnOuterClicks);
                                }, 300);
                            } else {
                                $document.off('click tap', closeOnOuterClicks);
                            }
                        }
                    });
                }

                scope.$on('$destroy', function() {
                    clearCb1();
                    $document.off('click tap', closeOnOuterClicks);
                });

            }
        };
    }]).directive('searchForm', function() {
    return {
        restrict : 'AC',
        link : function(scope, elem, attrs) {
            var wrap = $('.app-aside');
            var searchForm = elem.children('form');
            var formWrap = elem.parent();

            $(".s-open").on('click', function(e) {
                searchForm.prependTo(wrap);
                e.preventDefault();
                $(document).on("mousedown touchstart", closeForm);
            });
            $(".s-remove").on('click', function(e) {
                searchForm.appendTo(elem);
                e.preventDefault();
            });
            var closeForm = function(e) {
                if (!searchForm.is(e.target) && searchForm.has(e.target).length === 0) {
                    $(".s-remove").trigger('click');
                    $(document).off("mousedown touchstart", closeForm);
                }
            };
        }
    };
    function isSidebarClosed() {
        return $('.app-sidebar-closed').length;
    }

    function isSidebarFixed() {
        return $('.app-sidebar-fixed').length;
    }

}).directive('appAside', ['$window', '$rootScope', '$timeout', 'APP_MEDIAQUERY',
    function($window, $rootScope, $timeout, mq) {
        var $html = $('html'), $win = $($window), _this, wrap = $('.app-aside');
        return {
            restrict : 'AC',

            link : function(scope, elem, attrs, controllers) {
                var eventObject = isTouch() ? 'click' : 'mouseenter';
                var ul = "";
                var menuTitle;
                var wrap = $('.app-aside');
                elem.on('click', 'a', function(e) {

                    _this = $(this);
                    if (isSidebarClosed() && !isMobile() && !_this.closest("ul").hasClass("sub-menu"))
                        return;

                    _this.closest("ul").find(".open").not(".active").children("ul").not(_this.next()).slideUp(200).parent('.open').removeClass("open");
                    if (_this.next().is('ul') && _this.parent().toggleClass('open')) {

                        _this.next().slideToggle(200, function() {
                            $win.trigger("resize");

                        });
                        e.stopPropagation();
                        e.preventDefault();
                    } else {
                        $rootScope.toggle('sidebar', 'off');

                    }
                });
                elem.on(eventObject, 'a', function(e) {

                    if (!isSidebarClosed() || isMobile())

                        return;
                    _this = $(this);

                    if (!_this.parent().hasClass('hover') && !_this.closest("ul").hasClass("sub-menu")) {

                        wrapLeave();
                        _this.parent().addClass('hover');
                        menuTitle = _this.find(".item-inner").clone();
                        if (_this.parent().hasClass('active')) {

                            menuTitle.addClass("active");
                        }
                        var offset = $("#sidebar").position().top;
                        var itemTop = isSidebarFixed() ? _this.parent().position().top + offset : (_this.parent().position().top);
                        menuTitle.css({
                            position : isSidebarFixed() ? 'fixed' : 'absolute',
                            height : _this.outerHeight(),
                            top : itemTop
                        }).appendTo(wrap);
                        if (_this.next().is('ul')) {
                            ul = _this.next().clone(true);

                            ul.appendTo(wrap).css({
                                top : itemTop + _this.outerHeight(),
                                position : isSidebarFixed() ? 'fixed' : 'absolute',
                            });
                            if (_this.parent().position().top + _this.outerHeight() + offset + ul.height() > $win.height() && isSidebarFixed()) {
                                ul.css('bottom', 0);
                            } else {
                                ul.css('bottom', 'auto');
                            }

                            wrap.children().first().scroll(function() {
                                if (isSidebarFixed())
                                    wrapLeave();
                            });

                            setTimeout(function() {

                                if (!wrap.is(':empty')) {
                                    $(document).on('click tap', wrapLeave);
                                }
                            }, 300);

                        } else {
                            ul = "";
                            return;
                        }

                    }
                });
                wrap.on('mouseleave', function(e) {

                    $(document).off('click tap', wrapLeave);
                    $('.hover', wrap).removeClass('hover');
                    $('> .item-inner', wrap).remove();
                    $('> ul', wrap).remove();

                });
                function wrapLeave() {
                    wrap.trigger('mouseleave');
                }


                $rootScope.$on('$locationChangeSuccess', function() {
                    var newPath;
                    newPath = window.location.hash;
                    angular.forEach(elem.find('.main-navigation-menu a'), function(domLink) {
                        var link = angular.element(domLink);
                        var menu;
                        if (domLink.hash === newPath && (!isSidebarClosed() || isMobile())) {

                            if (link.closest("ul").hasClass("sub-menu")) {
                                menu = link.closest("ul");
                                var activeMenu = menu;
                                menu.slideDown(200).parent().siblings().children('.sub-menu').slideUp(200, function() {
                                    $(this).parent().removeClass("open");
                                });
                            } else {
                                $('.sub-menu').slideUp(200, function() {
                                    $(this).parent().removeClass("open");
                                });
                            }

                        }
                        activeMenu = null;
                        menu = null;
                    });
                });

            }
        };

        function isTouch() {
            return $html.hasClass('touch');
        }

        function isMobile() {
            return $win.width() < mq.desktop;
        }

        function isSidebarClosed() {
            return $('.app-sidebar-closed').length;
        }

        function isSidebarFixed() {
            return $('.app-sidebar-fixed').length;
        }

    }])
    .directive('sidebarMobileToggler', ['$window', '$rootScope', '$timeout', 'APP_MEDIAQUERY',
        function($window, $rootScope, $timeout, mq) {
            var $html = $('html'), $win = $($window), _this, $winOffsetTop = 0, $winScrollTop = 0, $appWidth;
            return {
                restrict: 'C',

                link: function(scope, elem, attrs, controllers) {
                    elem.on('click', function() {

                        if(!$('#app').hasClass('app-slide-off') && !$('#app').hasClass('app-offsidebar-open')) {
                            $winOffsetTop = $win.scrollTop();
                            $winScrollTop = 0;
                            $('footer').hide();
                            $appWidth = $('#app .main-content').innerWidth();
                            $('#app .main-content').css({
                                position: 'absolute',
                                top: -$winOffsetTop,
                                width: $appWidth
                            });
                        } else {
                            $winScrollTop = $winOffsetTop;
                        }
                        $("#app .app-content").one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {

                            if(!$('#app').hasClass('app-slide-off') && !$('#app').hasClass('app-offsidebar-open')) {
                                $('#app .main-content').css({
                                    position: 'relative',
                                    top: 'auto',
                                    width: 'auto'
                                });

                                window.scrollTo(0, $winScrollTop);
                                $('footer').show();
                                $("#app .app-content").off("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");
                            }

                        });
                    });

                }
            };
        }]);


app.directive('jqSparkline', [
    function() {'use strict';
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attrs, ngModel) {
                var opts = {};
                //TODO: Use $eval to get the object
                opts.type = attrs.type || 'line';
                opts.barColor = attrs.barColor || '#000000';
                opts.height = attrs.height || '35px';
                opts.width = attrs.width || '35px';
                opts.barWidth = attrs.barWidth || '5px';
                opts.barSpacing = attrs.barSpacing || '2px';
                opts.zeroAxis = attrs.zeroAxis || 'true';
                opts.resize = attrs.resize || false;
                opts.fillColor = attrs.fillColor || '#cdf';
                opts.lineWidth = attrs.lineWidth || 1;
                opts.lineColor = attrs.lineColor || '#00f';
                opts.spotColor = attrs.spotColor || '#f80';
                opts.spotRadius = attrs.spotRadius || 1.5;
                opts.minSpotColor = attrs.minSpotColor || '#f80';
                opts.maxSpotColor = attrs.maxSpotColor || '#f80';
                opts.highlightSpotColor = attrs.highlightSpotColor || '#5f5';
                opts.highlightLineColor = attrs.highlightLineColor || '#f22';



                scope.$watch(attrs.ngModel, function() {
                    render();
                });
                scope.$watch(attrs.opts, function() {
                    render();
                });
                var render = function() {
                    var model;
                    if(attrs.opts)
                        angular.extend(opts, angular.fromJson(attrs.opts));
                    console.log(opts);
                    // Trim trailing comma if we are a string
                    angular.isString(ngModel.$viewValue) ? model = ngModel.$viewValue.replace(/(^,)|(,$)/g, "") : model = ngModel.$viewValue;
                    var data;
                    // Make sure we have an array of numbers
                    angular.isArray(model) ? data = model : data = model.split(',');
                    $(elem).sparkline(data, opts);
                };

                // function to initiate Sparkline
                var sparkResize;
                $(window).resize(function(e) {
                    if (opts.resize) {
                        clearTimeout(sparkResize);
                        sparkResize = setTimeout(render, 500);
                    }
                });
            }
        };
    }]);

app.directive('touchspin', function() {
    return {
        restrict: 'EA',
        link: function(scope, elem, attr) {
            var tsOptions = [
                'initval',
                'min',
                'max',
                'step',
                'forcestepdivisibility',
                'decimals',
                'stepinterval',
                'stepintervaldelay',
                'verticalbuttons',
                'verticalupclass',
                'verticaldownclass',
                'prefix',
                'postfix',
                'prefix_extraclass',
                'postfix_extraclass',
                'booster',
                'boostat',
                'maxboostedstep',
                'mousewheel',
                'buttondown_class',
                'buttonup_class'
            ];
            var options = {};
            for(var i = 0, l = tsOptions.length; i < l; i++) {
                var opt = tsOptions[i];
                if(attr[opt] !== undefined) {
                    options[opt] = attr[opt];
                }
            }
            elem.TouchSpin(options);
        }
    };
});
