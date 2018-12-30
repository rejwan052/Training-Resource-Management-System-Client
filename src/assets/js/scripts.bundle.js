/**
 * @class mUtil  Metronic base utilize class that privides helper functions
 */
//== Polyfill
// matches polyfill
this.Element && function(ElementPrototype) {
    ElementPrototype.matches = ElementPrototype.matches ||
        ElementPrototype.matchesSelector ||
        ElementPrototype.webkitMatchesSelector ||
        ElementPrototype.msMatchesSelector ||
        function(selector) {
            var node = this,
                nodes = (node.parentNode || node.document).querySelectorAll(selector),
                i = -1;
            while (nodes[++i] && nodes[i] != node);
            return !!nodes[i];
        }
}(Element.prototype);

// closest polyfill
this.Element && function(ElementPrototype) {
    ElementPrototype.closest = ElementPrototype.closest ||
        function(selector) {
            var el = this;
            while (el.matches && !el.matches(selector)) el = el.parentNode;
            return el.matches ? el : null;
        }
}(Element.prototype);


// matches polyfill
this.Element && function(ElementPrototype) {
    ElementPrototype.matches = ElementPrototype.matches ||
        ElementPrototype.matchesSelector ||
        ElementPrototype.webkitMatchesSelector ||
        ElementPrototype.msMatchesSelector ||
        function(selector) {
            var node = this,
                nodes = (node.parentNode || node.document).querySelectorAll(selector),
                i = -1;
            while (nodes[++i] && nodes[i] != node);
            return !!nodes[i];
        }
}(Element.prototype);

//
// requestAnimationFrame polyfill by Erik Möller.
//  With fixes from Paul Irish and Tino Zijdel
//
//  http://paulirish.com/2011/requestanimationframe-for-smart-animating/
//  http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
//
//  MIT license
//
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// Source: https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/prepend()/prepend().md
(function(arr) {
    arr.forEach(function(item) {
        if (item.hasOwnProperty('prepend')) {
            return;
        }
        Object.defineProperty(item, 'prepend', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function prepend() {
                var argArr = Array.prototype.slice.call(arguments),
                    docFrag = document.createDocumentFragment();

                argArr.forEach(function(argItem) {
                    var isNode = argItem instanceof Node;
                    docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
                });

                this.insertBefore(docFrag, this.firstChild);
            }
        });
    });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

//== Global variables 
window.mUtilElementDataStore = {};
window.mUtilElementDataStoreID = 0;
window.mUtilDelegatedEventHandlers = {};

var mUtil = function() {

    var resizeHandlers = [];

    /** @type {object} breakpoints The device width breakpoints **/
    var breakpoints = {
        sm: 544, // Small screen / phone           
        md: 768, // Medium screen / tablet            
        lg: 1024, // Large screen / desktop        
        xl: 1200 // Extra large screen / wide desktop
    };

    /**
     * Handle window resize event with some 
     * delay to attach event handlers upon resize complete 
     */
    var _windowResizeHandler = function() {
        var _runResizeHandlers = function() {
            // reinitialize other subscribed elements
            for (var i = 0; i < resizeHandlers.length; i++) {
                var each = resizeHandlers[i];
                each.call();
            }
        };

        var timeout = false; // holder for timeout id
        var delay = 250; // delay after event is "complete" to run callback

        window.addEventListener('resize', function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                _runResizeHandlers();
            }, delay); // wait 50ms until window resize finishes.
        });
    };

    return {
        /**
         * Class main initializer.
         * @param {object} options.
         * @returns null
         */
        //main function to initiate the theme
        init: function(options) {
            if (options && options.breakpoints) {
                breakpoints = options.breakpoints;
            }

            _windowResizeHandler();
        },

        /**
         * Adds window resize event handler.
         * @param {function} callback function.
         */
        addResizeHandler: function(callback) {
            resizeHandlers.push(callback);
        },

        /**
         * Removes window resize event handler.
         * @param {function} callback function.
         */
        removeResizeHandler: function(callback) {
            for (var i = 0; i < resizeHandlers.length; i++) {
                if (callback === resizeHandlers[i]) {
                    delete resizeHandlers[i];
                }
            }
        },

        /**
         * Trigger window resize handlers.
         */
        runResizeHandlers: function() {
            _runResizeHandlers();
        },

        resize: function() {
            if (typeof(Event) === 'function') {
                // modern browsers
                window.dispatchEvent(new Event('resize'));
            } else {
                // for IE and other old browsers
                // causes deprecation warning on modern browsers
                var evt = window.document.createEvent('UIEvents'); 
                evt.initUIEvent('resize', true, false, window, 0); 
                window.dispatchEvent(evt);
            }
        },

        /**
         * Get GET parameter value from URL.
         * @param {string} paramName Parameter name.
         * @returns {string}  
         */
        getURLParam: function(paramName) {
            var searchString = window.location.search.substring(1),
                i, val, params = searchString.split("&");

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return unescape(val[1]);
                }
            }

            return null;
        },

        /**
         * Checks whether current device is mobile touch.
         * @returns {boolean}  
         */
        isMobileDevice: function() {
            return (this.getViewPort().width < this.getBreakpoint('lg') ? true : false);
        },

        /**
         * Checks whether current device is desktop.
         * @returns {boolean}  
         */
        isDesktopDevice: function() {
            return mUtil.isMobileDevice() ? false : true;
        },

        /**
         * Gets browser window viewport size. Ref:
         * http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
         * @returns {object}  
         */
        getViewPort: function() {
            var e = window,
                a = 'inner';
            if (!('innerWidth' in window)) {
                a = 'client';
                e = document.documentElement || document.body;
            }

            return {
                width: e[a + 'Width'],
                height: e[a + 'Height']
            };
        },

        /**
         * Checks whether given device mode is currently activated.
         * @param {string} mode Responsive mode name(e.g: desktop,
         *     desktop-and-tablet, tablet, tablet-and-mobile, mobile)
         * @returns {boolean}  
         */
        isInResponsiveRange: function(mode) {
            var breakpoint = this.getViewPort().width;

            if (mode == 'general') {
                return true;
            } else if (mode == 'desktop' && breakpoint >= (this.getBreakpoint('lg') + 1)) {
                return true;
            } else if (mode == 'tablet' && (breakpoint >= (this.getBreakpoint('md') + 1) && breakpoint < this.getBreakpoint('lg'))) {
                return true;
            } else if (mode == 'mobile' && breakpoint <= this.getBreakpoint('md')) {
                return true;
            } else if (mode == 'desktop-and-tablet' && breakpoint >= (this.getBreakpoint('md') + 1)) {
                return true;
            } else if (mode == 'tablet-and-mobile' && breakpoint <= this.getBreakpoint('lg')) {
                return true;
            } else if (mode == 'minimal-desktop-and-below' && breakpoint <= this.getBreakpoint('xl')) {
                return true;
            }

            return false;
        },

        /**
         * Generates unique ID for give prefix.
         * @param {string} prefix Prefix for generated ID
         * @returns {boolean}  
         */
        getUniqueID: function(prefix) {
            return prefix + Math.floor(Math.random() * (new Date()).getTime());
        },

        /**
         * Gets window width for give breakpoint mode.
         * @param {string} mode Responsive mode name(e.g: xl, lg, md, sm)
         * @returns {number}  
         */
        getBreakpoint: function(mode) {
            return breakpoints[mode];
        },

        /**
         * Checks whether object has property matchs given key path.
         * @param {object} obj Object contains values paired with given key path
         * @param {string} keys Keys path seperated with dots
         * @returns {object}  
         */
        isset: function(obj, keys) {
            var stone;

            keys = keys || '';

            if (keys.indexOf('[') !== -1) {
                throw new Error('Unsupported object path notation.');
            }

            keys = keys.split('.');

            do {
                if (obj === undefined) {
                    return false;
                }

                stone = keys.shift();

                if (!obj.hasOwnProperty(stone)) {
                    return false;
                }

                obj = obj[stone];

            } while (keys.length);

            return true;
        },

        /**
         * Gets highest z-index of the given element parents
         * @param {object} el jQuery element object
         * @returns {number}  
         */
        getHighestZindex: function(el) {
            var elem = mUtil.get(el),
                position, value;

            while (elem && elem !== document) {
                // Ignore z-index if position is set to a value where z-index is ignored by the browser
                // This makes behavior of this function consistent across browsers
                // WebKit always returns auto if the element is positioned
                position = mUtil.css(elem, 'position');

                if (position === "absolute" || position === "relative" || position === "fixed") {
                    // IE returns 0 when zIndex is not specified
                    // other browsers return a string
                    // we ignore the case of nested elements with an explicit value of 0
                    // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                    value = parseInt(mUtil.css(elem, 'z-index'));

                    if (!isNaN(value) && value !== 0) {
                        return value;
                    }
                }

                elem = elem.parentNode;
            }

            return null;
        },

        /**
         * Checks whether the element has any parent with fixed positionfreg
         * @param {object} el jQuery element object
         * @returns {boolean}  
         */
        hasFixedPositionedParent: function(el) {
            while (el && el !== document) {
                position = mUtil.css(el, 'position');

                if (position === "fixed") {
                    return true;
                }

                el = el.parentNode;
            }

            return false;
        },

        /**
         * Simulates delay
         */
        sleep: function(milliseconds) {
            var start = new Date().getTime();
            for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds) {
                    break;
                }
            }
        },

        /**
         * Gets randomly generated integer value within given min and max range
         * @param {number} min Range start value
         * @param {number} min Range end value
         * @returns {number}  
         */
        getRandomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        /**
         * Checks whether Angular library is included
         * @returns {boolean}  
         */
        isAngularVersion: function() {
            return window.Zone !== undefined ? true : false;
        },

        //== jQuery Workarounds

        //== Deep extend:  $.extend(true, {}, objA, objB);
        deepExtend: function(out) {
            out = out || {};

            for (var i = 1; i < arguments.length; i++) {
                var obj = arguments[i];

                if (!obj)
                    continue;

                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (typeof obj[key] === 'object')
                            out[key] = mUtil.deepExtend(out[key], obj[key]);
                        else
                            out[key] = obj[key];
                    }
                }
            }

            return out;
        },

        //== extend:  $.extend({}, objA, objB); 
        extend: function(out) {
            out = out || {};

            for (var i = 1; i < arguments.length; i++) {
                if (!arguments[i])
                    continue;

                for (var key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key))
                        out[key] = arguments[i][key];
                }
            }

            return out;
        },

        get: function(query) {
            var el;

            if (query === document) {
                return document;
            }

            if (!!(query && query.nodeType === 1)) {
                return query;
            }

            if (el = document.getElementById(query)) {
                return el;
            } else if (el = document.getElementsByTagName(query)) {
                return el[0];
            } else if (el = document.getElementsByClassName(query)) {
                return el[0];
            } else {
                return null;
            }
        },

        getByClass: function(query) {
            var el;
            
            if (el = document.getElementsByClassName(query)) {
                return el[0];
            } else {
                return null;
            }
        },

        /**
         * Checks whether the element has given classes
         * @param {object} el jQuery element object
         * @param {string} Classes string
         * @returns {boolean}  
         */
        hasClasses: function(el, classes) {
            if (!el) {
                return;
            }

            var classesArr = classes.split(" ");

            for (var i = 0; i < classesArr.length; i++) {
                if (mUtil.hasClass(el, mUtil.trim(classesArr[i])) == false) {
                    return false;
                }
            }

            return true;
        },

        hasClass: function(el, className) {
            if (!el) {
                return;
            }

            return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className);
        },

        addClass: function(el, className) {
            if (!el || typeof className === 'undefined') {
                return;
            }

            var classNames = className.split(' ');

            if (el.classList) {
                for (var i = 0; i < classNames.length; i++) {
                    if (classNames[i] && classNames[i].length > 0) {
                        el.classList.add(mUtil.trim(classNames[i]));
                    }
                }
            } else if (!mUtil.hasClass(el, className)) {
                for (var i = 0; i < classNames.length; i++) {
                    el.className += ' ' + mUtil.trim(classNames[i]);
                }
            }
        },

        removeClass: function(el, className) {
            if (!el || typeof className === 'undefined') {
                return;
            }

            var classNames = className.split(' ');

            if (el.classList) {
                for (var i = 0; i < classNames.length; i++) {
                    el.classList.remove(mUtil.trim(classNames[i]));
                }
            } else if (mUtil.hasClass(el, className)) {
                for (var i = 0; i < classNames.length; i++) {
                    el.className = el.className.replace(new RegExp('\\b' + mUtil.trim(classNames[i]) + '\\b', 'g'), '');
                }
            }
        },

        triggerCustomEvent: function(el, eventName, data) {
            if (window.CustomEvent) {
                var event = new CustomEvent(eventName, {
                    detail: data
                });
            } else {
                var event = document.createEvent('CustomEvent');
                event.initCustomEvent(eventName, true, true, data);
            }

            el.dispatchEvent(event);
        },

        trim: function(string) {
            return string.trim();
        },

        eventTriggered: function(e) {
            if (e.currentTarget.dataset.triggered) {
                return true;
            } else {
                e.currentTarget.dataset.triggered = true;

                return false;
            }
        },

        remove: function(el) {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        },

        find: function(parent, query) {
            parent = mUtil.get(parent);
            if (parent) {
                return parent.querySelector(query);
            }            
        },

        findAll: function(parent, query) {
            parent = mUtil.get(parent);
            if (parent) {
                return parent.querySelectorAll(query);
            } 
        },

        insertAfter: function(el, referenceNode) {
            return referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
        },

        parents: function(el, query) {
            function collectionHas(a, b) { //helper function (see below)
                for (var i = 0, len = a.length; i < len; i++) {
                    if (a[i] == b) return true;
                }

                return false;
            }

            function findParentBySelector(el, selector) {
                var all = document.querySelectorAll(selector);
                var cur = el.parentNode;

                while (cur && !collectionHas(all, cur)) { //keep going up until you find a match
                    cur = cur.parentNode; //go up
                }

                return cur; //will return null if not found
            }

            return findParentBySelector(el, query);
        },

        children: function(el, selector, log) {
            if (!el || !el.childNodes) {
                return;
            }

            var result = [],
                i = 0,
                l = el.childNodes.length;

            for (var i; i < l; ++i) {
                if (el.childNodes[i].nodeType == 1 && mUtil.matches(el.childNodes[i], selector, log)) {
                    result.push(el.childNodes[i]);
                }
            }

            return result;
        },

        child: function(el, selector, log) {
            var children = mUtil.children(el, selector, log);

            return children ? children[0] : null;
        },

        matches: function(el, selector, log) {
            var p = Element.prototype;
            var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
                return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
            };

            if (el && el.tagName) {
                return f.call(el, selector);
            } else {
                return false;
            }
        },

        data: function(element) {
            element = mUtil.get(element);

            return {
                set: function(name, data) {
                    if (element.customDataTag === undefined) {
                        mUtilElementDataStoreID++;
                        element.customDataTag = mUtilElementDataStoreID;
                    }

                    if (mUtilElementDataStore[element.customDataTag] === undefined) {
                        mUtilElementDataStore[element.customDataTag] = {};
                    }

                    mUtilElementDataStore[element.customDataTag][name] = data;
                },

                get: function(name) {
                    return this.has(name) ? mUtilElementDataStore[element.customDataTag][name] : null;
                },

                has: function(name) {
                    return (mUtilElementDataStore[element.customDataTag] && mUtilElementDataStore[element.customDataTag][name]) ? true : false;
                },

                remove: function(name) {
                    if (this.has(name)) {
                        delete mUtilElementDataStore[element.customDataTag][name];
                    }
                }
            };
        },

        outerWidth: function(el, margin) {
            var width;

            if (margin === true) {
                var width = parseFloat(el.offsetWidth);
                width += parseFloat(mUtil.css(el, 'margin-left')) + parseFloat(mUtil.css(el, 'margin-right'));

                return parseFloat(width);
            } else {
                var width = parseFloat(el.offsetWidth);

                return width;
            }
        },

        offset: function(elem) {
            var rect, win;
            elem = mUtil.get(elem);

            if ( !elem ) {
                return;
            }

            // Return zeros for disconnected and hidden (display: none) elements (gh-2310)
            // Support: IE <=11 only
            // Running getBoundingClientRect on a
            // disconnected node in IE throws an error

            if ( !elem.getClientRects().length ) {
                return { top: 0, left: 0 };
            }

            // Get document-relative position by adding viewport scroll to viewport-relative gBCR
            rect = elem.getBoundingClientRect();
            win = elem.ownerDocument.defaultView;

            return {
                top: rect.top + win.pageYOffset,
                left: rect.left + win.pageXOffset
            };
        },

        height: function(el) {
            return mUtil.css(el, 'height');
        },

        visible: function(el) {
            return !(el.offsetWidth === 0 && el.offsetHeight === 0);
        },

        attr: function(el, name, value) {
            el = mUtil.get(el);

            if (el == undefined) {
                return;
            }

            if (value !== undefined) {
                el.setAttribute(name, value);
            } else {
                return el.getAttribute(name);
            }
        },

        hasAttr: function(el, name) {
            el = mUtil.get(el);

            if (el == undefined) {
                return;
            }

            return el.getAttribute(name) ? true : false;
        },

        removeAttr: function(el, name) {
            el = mUtil.get(el);

            if (el == undefined) {
                return;
            }

            el.removeAttribute(name);
        },

        animate: function(from, to, duration, update, easing, done) {
            /**
             * TinyAnimate.easings
             *  Adapted from jQuery Easing
             */
            var easings = {};
            var easing;

            easings.linear = function(t, b, c, d) {
                return c * t / d + b;
            };

            easing = easings.linear;

            // Early bail out if called incorrectly
            if (typeof from !== 'number' ||
                typeof to !== 'number' ||
                typeof duration !== 'number' ||
                typeof update !== 'function') {
                return;
            }

            // Create mock done() function if necessary
            if (typeof done !== 'function') {
                done = function() {};
            }

            // Pick implementation (requestAnimationFrame | setTimeout)
            var rAF = window.requestAnimationFrame || function(callback) {
                window.setTimeout(callback, 1000 / 50);
            };

            // Animation loop
            var canceled = false;
            var change = to - from;

            function loop(timestamp) {
                var time = (timestamp || +new Date()) - start;

                if (time >= 0) {
                    update(easing(time, from, change, duration));
                }
                if (time >= 0 && time >= duration) {
                    update(to);
                    done();
                } else {
                    rAF(loop);
                }
            }

            update(from);

            // Start animation loop
            var start = window.performance && window.performance.now ? window.performance.now() : +new Date();

            rAF(loop);
        },

        actualCss: function(el, prop, cache) {
            if (el instanceof HTMLElement === false) {
                return;
            }

            if (!el.getAttribute('m-hidden-' + prop) || cache === false) {
                var value;

                // the element is hidden so:
                // making the el block so we can meassure its height but still be hidden
                el.style.cssText = 'position: absolute; visibility: hidden; display: block;';

                if (prop == 'width') {
                    value = el.offsetWidth;
                } else if (prop == 'height') {
                    value = el.offsetHeight;
                }

                el.style.cssText = '';

                // store it in cache
                el.setAttribute('m-hidden-' + prop, value);

                return parseFloat(value);
            } else {
                // store it in cache
                return parseFloat(el.getAttribute('m-hidden-' + prop));
            }
        },

        actualHeight: function(el, cache) {
            return mUtil.actualCss(el, 'height', cache);
        },

        actualWidth: function(el, cache) {
            return mUtil.actualCss(el, 'width', cache);
        },

        getScroll: function(element, method) {
            // The passed in `method` value should be 'Top' or 'Left'
            method = 'scroll' + method;
            return (element == window || element == document) ? (
                self[(method == 'scrollTop') ? 'pageYOffset' : 'pageXOffset'] ||
                (browserSupportsBoxModel && document.documentElement[method]) ||
                document.body[method]
            ) : element[method];
        },

        css: function(el, styleProp, value) {
            el = mUtil.get(el);

            if (!el) {
                return;
            }

            if (value !== undefined) {
                el.style[styleProp] = value;
            } else {
                var value, defaultView = (el.ownerDocument || document).defaultView;
                // W3C standard way:
                if (defaultView && defaultView.getComputedStyle) {
                    // sanitize property name to css notation
                    // (hyphen separated words eg. font-Size)
                    styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
                    return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
                } else if (el.currentStyle) { // IE
                    // sanitize property name to camelCase
                    styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
                        return letter.toUpperCase();
                    });
                    value = el.currentStyle[styleProp];
                    // convert other units to pixels on IE
                    if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
                        return (function(value) {
                            var oldLeft = el.style.left,
                                oldRsLeft = el.runtimeStyle.left;
                            el.runtimeStyle.left = el.currentStyle.left;
                            el.style.left = value || 0;
                            value = el.style.pixelLeft + "px";
                            el.style.left = oldLeft;
                            el.runtimeStyle.left = oldRsLeft;
                            return value;
                        })(value);
                    }
                    return value;
                }
            }
        },

        slide: function(el, dir, speed, callback, recalcMaxHeight) {
            if (!el || (dir == 'up' && mUtil.visible(el) === false) || (dir == 'down' && mUtil.visible(el) === true)) {
                return;
            }

            speed = (speed ? speed : 600);
            var calcHeight = mUtil.actualHeight(el);
            var calcPaddingTop = false;
            var calcPaddingBottom = false;

            if (mUtil.css(el, 'padding-top') && mUtil.data(el).has('slide-padding-top') !== true) {
                mUtil.data(el).set('slide-padding-top', mUtil.css(el, 'padding-top'));
            }

            if (mUtil.css(el, 'padding-bottom') && mUtil.data(el).has('slide-padding-bottom') !== true) {
                mUtil.data(el).set('slide-padding-bottom', mUtil.css(el, 'padding-bottom'));
            }

            if (mUtil.data(el).has('slide-padding-top')) {
                calcPaddingTop = parseInt(mUtil.data(el).get('slide-padding-top'));
            }

            if (mUtil.data(el).has('slide-padding-bottom')) {
                calcPaddingBottom = parseInt(mUtil.data(el).get('slide-padding-bottom'));
            }

            if (dir == 'up') { // up          
                el.style.cssText = 'display: block; overflow: hidden;';

                if (calcPaddingTop) {
                    mUtil.animate(0, calcPaddingTop, speed, function(value) {
                        el.style.paddingTop = (calcPaddingTop - value) + 'px';
                    }, 'linear');
                }

                if (calcPaddingBottom) {
                    mUtil.animate(0, calcPaddingBottom, speed, function(value) {
                        el.style.paddingBottom = (calcPaddingBottom - value) + 'px';
                    }, 'linear');
                }

                mUtil.animate(0, calcHeight, speed, function(value) {
                    el.style.height = (calcHeight - value) + 'px';
                }, 'linear', function() {
                    callback();
                    el.style.height = '';
                    el.style.display = 'none';
                });


            } else if (dir == 'down') { // down
                el.style.cssText = 'display: block; overflow: hidden;';

                if (calcPaddingTop) {
                    mUtil.animate(0, calcPaddingTop, speed, function(value) {
                        el.style.paddingTop = value + 'px';
                    }, 'linear', function() {
                        el.style.paddingTop = '';
                    });
                }

                if (calcPaddingBottom) {
                    mUtil.animate(0, calcPaddingBottom, speed, function(value) {
                        el.style.paddingBottom = value + 'px';
                    }, 'linear', function() {
                        el.style.paddingBottom = '';
                    });
                }

                mUtil.animate(0, calcHeight, speed, function(value) {
                    el.style.height = value + 'px';
                }, 'linear', function() {
                    callback();
                    el.style.height = '';
                    el.style.display = '';
                    el.style.overflow = '';
                });
            }
        },

        slideUp: function(el, speed, callback) {
            mUtil.slide(el, 'up', speed, callback);
        },

        slideDown: function(el, speed, callback) {
            mUtil.slide(el, 'down', speed, callback);
        },

        show: function(el, display) {
            el.style.display = (display ? display : 'block');
        },

        hide: function(el) {
            el.style.display = 'none';
        },

        addEvent: function(el, type, handler, one) {
            el = mUtil.get(el);
            if (typeof el !== 'undefined') {
                el.addEventListener(type, handler);
            }
        },

        removeEvent: function(el, type, handler) {
            el = mUtil.get(el);
            el.removeEventListener(type, handler);
        },

        on: function(element, selector, event, handler) {
            if (!selector) {
                return;
            }

            var eventId = mUtil.getUniqueID('event');

            mUtilDelegatedEventHandlers[eventId] = function(e) {
                var targets = element.querySelectorAll(selector);
                var target = e.target;

                while (target && target !== element) {
                    for (var i = 0, j = targets.length; i < j; i++) {
                        if (target === targets[i]) {
                            handler.call(target, e);
                        }
                    }

                    target = target.parentNode;
                }
            }

            mUtil.addEvent(element, event, mUtilDelegatedEventHandlers[eventId]);

            return eventId;
        },

        off: function(element, event, eventId) {
            if (!element || !mUtilDelegatedEventHandlers[eventId]) {
                return;
            }

            mUtil.removeEvent(element, event, mUtilDelegatedEventHandlers[eventId]);

            delete mUtilDelegatedEventHandlers[eventId];
        },

        one: function onetime(el, type, callback) {
            el = mUtil.get(el);

            el.addEventListener(type, function(e) {
                // remove event
                e.target.removeEventListener(e.type, arguments.callee);
                // call handler
                return callback(e);
            });
        },

        hash: function(str) {
            var hash = 0,
                i, chr;

            if (str.length === 0) return hash;
            for (i = 0; i < str.length; i++) {
                chr = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }

            return hash;
        },

        animateClass: function(el, animationName, callback) {
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

            mUtil.addClass(el, 'animated ' + animationName);

            mUtil.one(el, animationEnd, function() {
                mUtil.removeClass(el, 'animated ' + animationName);
            });

            if (callback) {
                mUtil.one(el.animationEnd, callback);
            }
        },

        animateDelay: function(el, value) {
            var vendors = ['webkit-', 'moz-', 'ms-', 'o-', ''];
            for (var i = 0; i < vendors.length; i++) {
                mUtil.css(el, vendors[i] + 'animation-delay', value);
            }
        },

        animateDuration: function(el, value) {
            var vendors = ['webkit-', 'moz-', 'ms-', 'o-', ''];
            for (var i = 0; i < vendors.length; i++) {
                mUtil.css(el, vendors[i] + 'animation-duration', value);
            }
        },

        scrollTo: function(target, offset, duration) {
            var duration = duration ? duration : 500;
            var target = mUtil.get(target);
            var targetPos = target ? mUtil.offset(target).top : 0;
            var scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            var from, to;

            if (targetPos > scrollPos) {
                from = targetPos;
                to = scrollPos;
            } else {
                from = scrollPos;
                to = targetPos;
            }

            if (offset) {
                to += offset;
            }

            mUtil.animate(from, to, duration, function(value) {
                document.documentElement.scrollTop = value;
                document.body.parentNode.scrollTop = value;
                document.body.scrollTop = value;
            }); //, easing, done
        },

        scrollTop: function(offset, duration) {
            mUtil.scrollTo(null, offset, duration);
        },

        isArray: function(obj) {
            return obj && Array.isArray(obj);
        },

        ready: function(callback) {
            if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
                callback();
            } else {
                document.addEventListener('DOMContentLoaded', callback);
            }
        },

        isEmpty: function(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }

            return true;
        },

        numberString: function(nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },

        detectIE: function() {
            var ua = window.navigator.userAgent;

            // Test values; Uncomment to check result …

            // IE 10
            // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

            // IE 11
            // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

            // Edge 12 (Spartan)
            // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

            // Edge 13
            // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }

            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // Edge (IE 12+) => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }

            // other browser
            return false;
        },

        isRTL: function() {
            return (mUtil.attr(mUtil.get('html'), 'direction') == 'rtl');
        },

        //== Scroller
        scrollerInit: function(element, options) {
            //== Define init function
            function init() {
                var ps;
                var height;

                if (options.height instanceof Function) {
                    height = parseInt(options.height.call());
                } else {
                    height = parseInt(options.height);
                }

                //== Destroy scroll on table and mobile modes
                if (options.disableForMobile && mUtil.isInResponsiveRange('tablet-and-mobile')) {
                    if (ps = mUtil.data(element).get('ps')) {
                        if (options.resetHeightOnDestroy) {
                            mUtil.css(element, 'height', 'auto');
                        } else {
                            mUtil.css(element, 'overflow', 'auto');
                            if (height > 0) {
                                mUtil.css(element, 'height', height + 'px');
                            }
                        }

                        ps.destroy();
                        ps = mUtil.data(element).remove('ps');
                    } else if (height > 0){
                        mUtil.css(element, 'overflow', 'auto');
                        mUtil.css(element, 'height', height + 'px');
                    }

                    return;
                }

                if (height > 0) {
                    mUtil.css(element, 'height', height + 'px');
                }

                mUtil.css(element, 'overflow', 'hidden');

                //== Init scroll
                if (ps = mUtil.data(element).get('ps')) {
                    ps.update();
                } else {
                    mUtil.addClass(element, 'm-scroller');
                    ps = new PerfectScrollbar(element, {
                        wheelSpeed: 0.5,
                        swipeEasing: true,
                        wheelPropagation: false,
                        minScrollbarLength: 40,
                        suppressScrollX: mUtil.isRTL() ? false : true
                    });

                    mUtil.data(element).set('ps', ps);
                }
            }

            //== Init
            init();

            //== Handle window resize
            if (options.handleWindowResize) {
                mUtil.addResizeHandler(function() {
                    init();
                });
            }
        },

        scrollerUpdate: function(element) {
            var ps;
            if (ps = mUtil.data(element).get('ps')) {
                ps.update();
            }
        },

        scrollersUpdate: function(parent) {
            var scrollers = mUtil.findAll(parent, '.ps');
            for (var i = 0, len = scrollers.length; i < len; i++) {
                mUtil.scrollerUpdate(scrollers[i]);
            }
        },

        scrollerTop: function(element) {
            var ps;
            if (ps = mUtil.data(element).get('ps')) {
                element.scrollTop = 0;
            }
        },

        scrollerDestroy: function(element) {
            var ps;
            if (ps = mUtil.data(element).get('ps')) {
                ps.destroy();
                ps = mUtil.data(element).remove('ps');
            }
        }
    }
}();

//== Initialize mUtil class on document ready
mUtil.ready(function() {
    mUtil.init();
});
/**
 * @class mApp  Metronic App class
 */

var mApp = function() {

    /** @type {object} colors State colors **/
    var colors = {
        brand:      '#716aca',
        metal:      '#c4c5d6',
        light:      '#ffffff',
        accent:     '#00c5dc',
        primary:    '#5867dd',
        success:    '#34bfa3',
        info:       '#36a3f7',
        warning:    '#ffb822',
        danger:     '#f4516c',
        focus:      '#9816f4'
    }

    /**
    * Initializes bootstrap tooltip
    */
    var initTooltip = function(el) {
        var skin = el.data('skin') ? 'm-tooltip--skin-' + el.data('skin') : '';
        var width = el.data('width') == 'auto' ? 'm-tooltop--auto-width' : '';
        var triggerValue = el.data('trigger') ? el.data('trigger') : 'hover';
        var placement = el.data('placement') ? el.data('placement') : 'left';
                    
        el.tooltip({
            trigger: triggerValue,
            template: '<div class="m-tooltip ' + skin + ' ' + width + ' tooltip" role="tooltip">\
                <div class="arrow"></div>\
                <div class="tooltip-inner"></div>\
            </div>'
        });
    }
    
    /**
    * Initializes bootstrap tooltips
    */
    var initTooltips = function() {
        // init bootstrap tooltips
        $('[data-toggle="m-tooltip"]').each(function() {
            initTooltip($(this));
        });
    }

    /**
    * Initializes bootstrap popover
    */
    var initPopover = function(el) {
        var skin = el.data('skin') ? 'm-popover--skin-' + el.data('skin') : '';
        var triggerValue = el.data('trigger') ? el.data('trigger') : 'hover';
            
        el.popover({
            trigger: triggerValue,
            template: '\
            <div class="m-popover ' + skin + ' popover" role="tooltip">\
                <div class="arrow"></div>\
                <h3 class="popover-header"></h3>\
                <div class="popover-body"></div>\
            </div>'
        });
    }

    /**
    * Initializes bootstrap popovers
    */
    var initPopovers = function() {
        // init bootstrap popover
        $('[data-toggle="m-popover"]').each(function() {
            initPopover($(this));
        });
    }

    /**
    * Initializes bootstrap file input
    */
    var initFileInput = function() {
        // init bootstrap popover
        $('.custom-file-input').on('change',function(){
            var fileName = $(this).val();
            $(this).next('.custom-file-label').addClass("selected").html(fileName);
        });
    }           

    /**
    * Initializes metronic portlet
    */
    var initPortlet = function(el, options) {
        // init portlet tools
        var el = $(el);
        var portlet = new mPortlet(el[0], options);
    }

    /**
    * Initializes metronic portlets
    */
    var initPortlets = function() {
        // init portlet tools
        $('[m-portlet="true"]').each(function() {
            var el = $(this);

            if ( el.data('portlet-initialized') !== true ) {
                initPortlet(el, {});
                el.data('portlet-initialized', true);
            }
        });
    }

    /**
    * Initializes scrollable contents
    */
    var initScrollers = function() {
        $('[data-scrollable="true"]').each(function(){
            var el = $(this);
            mUtil.scrollerInit(this, {disableForMobile: true, handleWindowResize: true, height: function() {
                if (mUtil.isInResponsiveRange('tablet-and-mobile') && el.data('mobile-height')) {
                    return el.data('mobile-height');
                } else {
                    return el.data('height');
                }
            }});
        });
    }

    /**
    * Initializes bootstrap alerts
    */
    var initAlerts = function() {
        // init bootstrap popover
        $('body').on('click', '[data-close=alert]', function() {
            $(this).closest('.alert').hide();
        });
    }

    /**
    * Initializes Metronic custom tabs
    */
    var initCustomTabs = function() {
        // init bootstrap popover
        $('[data-tab-target]').each(function() {
            if ($(this).data('tabs-initialized') == true ) {
                return;
            }

            $(this).click(function(e) {
                e.preventDefault();
                
                var tab = $(this);
                var tabs = tab.closest('[data-tabs="true"]');
                var contents = $( tabs.data('tabs-contents') );
                var content = $( tab.data('tab-target') );

                tabs.find('.m-tabs__item.m-tabs__item--active').removeClass('m-tabs__item--active');
                tab.addClass('m-tabs__item--active');

                contents.find('.m-tabs-content__item.m-tabs-content__item--active').removeClass('m-tabs-content__item--active');
                content.addClass('m-tabs-content__item--active');         
            });

            $(this).data('tabs-initialized', true);
        });
    }

	var hideTouchWarning = function() {
		jQuery.event.special.touchstart = {
			setup: function(_, ns, handle) {
				if (typeof this === 'function')
					if (ns.includes('noPreventDefault')) {
						this.addEventListener('touchstart', handle, {passive: false});
					} else {
						this.addEventListener('touchstart', handle, {passive: true});
					}
			},
		};
		jQuery.event.special.touchmove = {
			setup: function(_, ns, handle) {
				if (typeof this === 'function')
					if (ns.includes('noPreventDefault')) {
						this.addEventListener('touchmove', handle, {passive: false});
					} else {
						this.addEventListener('touchmove', handle, {passive: true});
					}
			},
		};
		jQuery.event.special.wheel = {
			setup: function(_, ns, handle) {
				if (typeof this === 'function')
					if (ns.includes('noPreventDefault')) {
						this.addEventListener('wheel', handle, {passive: false});
					} else {
						this.addEventListener('wheel', handle, {passive: true});
					}
			},
		};
	};

    return {
        /**
        * Main class initializer
        */
        init: function(options) {
            if (options && options.colors) {
                colors = options.colors;
            }
            mApp.initComponents();
        },

        /**
        * Initializes components
        */
        initComponents: function() {
            hideTouchWarning();
            initScrollers();
            initTooltips();
            initPopovers();
            initAlerts();
            initPortlets();
            initFileInput();
            initCustomTabs();
        },


        /**
        * Init custom tabs
        */
        initCustomTabs: function() {
            initCustomTabs();
        },

        /**
        * 
        * @param {object} el jQuery element object
        */
        // wrJangoer function to scroll(focus) to an element
        initTooltips: function() {
            initTooltips();
        },

        /**
        * 
        * @param {object} el jQuery element object
        */
        // wrJangoer function to scroll(focus) to an element
        initTooltip: function(el) {
            initTooltip(el);
        },

        /**
        * 
        * @param {object} el jQuery element object
        */
        // wrJangoer function to scroll(focus) to an element
        initPopovers: function() {
            initPopovers();
        },

        /**
        * 
        * @param {object} el jQuery element object
        */
        // wrJangoer function to scroll(focus) to an element
        initPopover: function(el) {
            initPopover(el);
        },

        /**
        * 
        * @param {object} el jQuery element object
        */
        // function to init portlet
        initPortlet: function(el, options) {
            initPortlet(el, options);
        },

        /**
        * 
        * @param {object} el jQuery element object
        */
        // function to init portlets
        initPortlets: function() {
            initPortlets();
        },

        /**
        * Blocks element with loading indiciator using http://malsup.com/jquery/block/
        * @param {object} target jQuery element object
        * @param {object} options 
        */
        block: function(target, options) {
            var el = $(target);

            options = $.extend(true, {
                opacity: 0.03,
                overlayColor: '#000000',
                state: 'brand',
                type: 'loader',
                size: 'lg',
                centerX: true,
                centerY: true,
                message: '',
                shadow: true,
                width: 'auto'
            }, options);

            var skin;
            var state;
            var loading;

            if (options.type == 'spinner') {
                skin = options.skin ? 'm-spinner--skin-' + options.skin : '';
                state = options.state ? 'm-spinner--' + options.state : '';
                loading = '<div class="m-spinner ' + skin + ' ' + state + '"></div';
            } else {
                skin = options.skin ? 'm-loader--skin-' + options.skin : '';
                state = options.state ? 'm-loader--' + options.state : '';
                size = options.size ? 'm-loader--' + options.size : '';
                loading = '<div class="m-loader ' + skin + ' ' + state + ' ' + size + '"></div';
            }

            if (options.message && options.message.length > 0) {
                var classes = 'm-blockui ' + (options.shadow === false ? 'm-blockui-no-shadow' : '');

                html = '<div class="' + classes + '"><span>' + options.message + '</span><span>' + loading + '</span></div>';

                var el = document.createElement('div');
                mUtil.get('body').prepend(el);
                mUtil.addClass(el, classes);
                el.innerHTML = '<span>' + options.message + '</span><span>' + loading + '</span>';
                options.width = mUtil.actualWidth(el) + 10;
                mUtil.remove(el);

                if (target == 'body') {
                    html = '<div class="' + classes + '" style="margin-left:-'+ (options.width / 2) +'px;"><span>' + options.message + '</span><span>' + loading + '</span></div>';
                }
            } else {
                html = loading;
            }

            var params = {
                message: html,
                centerY: options.centerY,
                centerX: options.centerX,
                css: {
                    top: '30%',
                    left: '50%',
                    border: '0',
                    padding: '0',
                    backgroundColor: 'none',
                    width: options.width
                },
                overlayCSS: {
                    backgroundColor: options.overlayColor,
                    opacity: options.opacity,
                    cursor: 'wait',
                    zIndex: '10'
                },
                onUnblock: function() {
                    if (el && el[0]) {
                        mUtil.css(el[0], 'position', '');
                        mUtil.css(el[0], 'zoom', '');
                    }                    
                }
            };

            if (target == 'body') {
                params.css.top = '50%';
                $.blockUI(params);
            } else {
                var el = $(target);
                el.block(params);
            }
        },

        /**
        * Un-blocks the blocked element 
        * @param {object} target jQuery element object
        */
        unblock: function(target) {
            if (target && target != 'body') {
                $(target).unblock();
            } else {
                $.unblockUI();
            }
        },

        /**
        * Blocks the page body element with loading indicator
        * @param {object} options 
        */
        blockPage: function(options) {
            return mApp.block('body', options);
        },

        /**
        * Un-blocks the blocked page body element
        */
        unblockPage: function() {
            return mApp.unblock('body');
        },

        /**
        * Enable loader progress for button and other elements
        * @param {object} target jQuery element object
        * @param {object} options
        */
        progress: function(target, options) {
            var skin = (options && options.skin) ? options.skin : 'light';
            var alignment = (options && options.alignment) ? options.alignment : 'right'; 
            var size = (options && options.size) ? 'm-spinner--' + options.size : ''; 
            var classes = 'm-loader ' + 'm-loader--' + skin + ' m-loader--' + alignment + ' m-loader--' + size;

            mApp.unprogress(target);
            
            $(target).addClass(classes);
            $(target).data('progress-classes', classes);
        },

        /**
        * Disable loader progress for button and other elements
        * @param {object} target jQuery element object
        */
        unprogress: function(target) {
            $(target).removeClass($(target).data('progress-classes'));
        },

        /**
        * Gets state color's hex code by color name
        * @param {string} name Color name
        * @returns {string}  
        */
        getColor: function(name) {
            return colors[name];
        }
    };
}();

//== Initialize mApp class on document ready
$(document).ready(function() {
    mApp.init({});
});

var mDropdown = function(elementId, options) {
    //== Main object
    var the = this;
    var init = false;

    //== Get element object
    var element = mUtil.get(elementId);
    var body = mUtil.get('body');

    if (!element) {
        return;
    }

    //== Default options
    var defaultOptions = {
        toggle: 'click',
        hoverTimeout: 300,
        skin: 'light',
        height: 'auto',
        maxHeight: false,
        minHeight: false,
        persistent: false,
        mobileOverlay: true
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Run plugin
         * @returns {mdropdown}
         */
        construct: function(options) {
            if (mUtil.data(element).has('dropdown')) {
                the = mUtil.data(element).get('dropdown');
            } else {
                // reset dropdown
                Plugin.init(options);

                Plugin.setup();

                mUtil.data(element).set('dropdown', the);
            }

            return the;
        },

        /**
         * Handles subdropdown click toggle
         * @returns {mdropdown}
         */
        init: function(options) {
            // merge default and user defined options
            the.options = mUtil.deepExtend({}, defaultOptions, options);
            the.events = [];
            the.eventHandlers = {};
            the.open = false;
            
            the.layout = {};
            the.layout.close = mUtil.find(element, '.m-dropdown__close');
            the.layout.toggle = mUtil.find(element, '.m-dropdown__toggle');
            the.layout.arrow = mUtil.find(element, '.m-dropdown__arrow');
            the.layout.wrapper = mUtil.find(element, '.m-dropdown__wrapper');
            the.layout.defaultDropPos = mUtil.hasClass(element, 'm-dropdown--up') ? 'up' : 'down';
            the.layout.currentDropPos = the.layout.defaultDropPos;

            if (mUtil.attr(element, 'm-dropdown-toggle') == "hover") {
                the.options.toggle = 'hover';
            }
        },

        /**
         * Setup dropdown
         */
        setup: function() {
            if (the.options.placement) {
                mUtil.addClass(element, 'm-dropdown--' + the.options.placement);
            }

            if (the.options.align) {
                mUtil.addClass(element, 'm-dropdown--align-' + the.options.align);
            }

            if (the.options.width) {
                mUtil.css(the.layout.wrapper, 'width', the.options.width + 'px');
            }

            if (mUtil.attr(element, 'm-dropdown-persistent') == '1') {
                the.options.persistent = true;
            }

            if (the.options.toggle == 'hover') {    
                mUtil.addEvent(element, 'mouseout', Plugin.hideMouseout);
            } 

            // set zindex
            Plugin.setZindex();
        },

        /**
         * Toggle dropdown
         */
        toggle: function() {
            if (the.open) {
                return Plugin.hide();
            } else {
                return Plugin.show();
            }
        },

        /**
         * Set content
         */
        setContent: function(content) {
            var content = mUtil.find(element, '.m-dropdown__content').innerHTML = content;

            return the;
        },

        /**
         * Show dropdown
         */
        show: function() {
            if (the.options.toggle == 'hover' && mUtil.hasAttr(element, 'hover')) {
                Plugin.clearHovered();
                return the;
            }

            if (the.open) {
                return the;
            }

            if (the.layout.arrow) {
                Plugin.adjustArrowPos();
            }

            Plugin.eventTrigger('beforeShow');

            Plugin.hideOpened();

            mUtil.addClass(element, 'm-dropdown--open');

            if (mUtil.isMobileDevice() && the.options.mobileOverlay) {
                var zIndex = mUtil.css(element, 'z-index') - 1;

                var dropdownoff = mUtil.insertAfter(document.createElement('DIV'), element );

                mUtil.addClass(dropdownoff, 'm-dropdown__dropoff');
                mUtil.css(dropdownoff, 'z-index', zIndex);
                mUtil.data(dropdownoff).set('dropdown', element);
                mUtil.data(element).set('dropoff', dropdownoff);

                mUtil.addEvent(dropdownoff, 'click', function(e) {
                    Plugin.hide();
                    mUtil.remove(this);
                    e.preventDefault();
                });
            }

            element.focus();
            element.setAttribute('aria-expanded', 'true');
            the.open = true;

            //== Update scrollers
            mUtil.scrollersUpdate(element);

            Plugin.eventTrigger('afterShow');

            return the;
        },

        /**
         * Clear dropdown hover
         */
        clearHovered: function() {
            var timeout = mUtil.attr(element, 'timeout');

            mUtil.removeAttr(element, 'hover');            
            mUtil.removeAttr(element, 'timeout');

            clearTimeout(timeout);
        },

        /**
         * Hide hovered dropdown
         */
        hideHovered: function(force) {
            if (force === true) {
                if (Plugin.eventTrigger('beforeHide') === false) {
                    return;
                }

                Plugin.clearHovered();
                mUtil.removeClass(element, 'm-dropdown--open');
                the.open = false;
                Plugin.eventTrigger('afterHide');
            } else {
                if (mUtil.hasAttr(element, 'hover') === true) {
                    return;
                }

                if (Plugin.eventTrigger('beforeHide') === false) {
                    return;
                }

                var timeout = setTimeout(function() {
                    if (mUtil.attr(element, 'hover')) {
                        Plugin.clearHovered();
                        mUtil.removeClass(element, 'm-dropdown--open');
                        the.open = false;
                        Plugin.eventTrigger('afterHide');
                    }
                }, the.options.hoverTimeout);

                mUtil.attr(element, 'hover', '1');            
                mUtil.attr(element, 'timeout', timeout);
            }
        },

        /**
         * Hide clicked dropdown
         */
        hideClicked: function() {
            if (Plugin.eventTrigger('beforeHide') === false) {
                return;
            }

            mUtil.removeClass(element, 'm-dropdown--open');
            mUtil.data(element).remove('dropoff');
            the.open = false;
            Plugin.eventTrigger('afterHide');
        },

        /**
         * Hide dropdown
         */
        hide: function(force) {
            if (the.open === false) {
                return the;
            }

            if (mUtil.isDesktopDevice() && the.options.toggle == 'hover') {
                Plugin.hideHovered(force);
            } else {
                Plugin.hideClicked();
            }

            if (the.layout.defaultDropPos == 'down' && the.layout.currentDropPos == 'up') {
                mUtil.removeClass(element, 'm-dropdown--up');
                the.layout.arrow.prependTo(the.layout.wrapper);
                the.layout.currentDropPos = 'down';
            }

            return the;
        },

        /**
         * Hide on mouseout
         */
        hideMouseout: function() {
            if (mUtil.isDesktopDevice()) {
                Plugin.hide();
            }
        },

        /**
         * Hide opened dropdowns
         */
        hideOpened: function() {
            var query = mUtil.findAll(body, '.m-dropdown.m-dropdown--open');
            
            for (var i = 0, j = query.length; i < j; i++) {
                var dropdown = query[i];
                mUtil.data(dropdown).get('dropdown').hide(true);
            }
        },

        /**
         * Adjust dropdown arrow positions
         */
        adjustArrowPos: function() {
            var width = mUtil.outerWidth(element); // ?

            var alignment = mUtil.hasClass(the.layout.arrow, 'm-dropdown__arrow--right') ? 'right' : 'left';
            var pos = 0;

            if (the.layout.arrow) {
                if ( mUtil.isInResponsiveRange('mobile') && mUtil.hasClass(element, 'm-dropdown--mobile-full-width') ) {
                    pos = mUtil.offset(element).left + (width / 2) - Math.abs( parseInt(mUtil.css(the.layout.arrow, 'width')) / 2) - parseInt(mUtil.css(the.layout.wrapper, 'left'));
                    
                    mUtil.css(the.layout.arrow, 'right', 'auto');
                    mUtil.css(the.layout.arrow, 'left', pos + 'px');
                    
                    mUtil.css(the.layout.arrow, 'margin-left', 'auto');
                    mUtil.css(the.layout.arrow, 'margin-right', 'auto');
                } else if (mUtil.hasClass(the.layout.arrow, 'm-dropdown__arrow--adjust')) {
                    pos = width / 2 - Math.abs( parseInt(mUtil.css(the.layout.arrow, 'width')) / 2);
                    if (mUtil.hasClass(element, 'm-dropdown--align-push')) {
                        pos = pos + 20;
                    }

                    if (alignment == 'right') {
                        if (mUtil.isRTL()) {
                            mUtil.css(the.layout.arrow, 'right', 'auto');
                            mUtil.css(the.layout.arrow, 'left', pos + 'px');
                        } else {
                            mUtil.css(the.layout.arrow, 'left', 'auto');
                            mUtil.css(the.layout.arrow, 'right', pos + 'px');
                        }
                    } else {
                        if (mUtil.isRTL()) {
                            mUtil.css(the.layout.arrow, 'left', 'auto');
                            mUtil.css(the.layout.arrow, 'right', pos + 'px');
                        } else {
                            mUtil.css(the.layout.arrow, 'right', 'auto');
                            mUtil.css(the.layout.arrow, 'left', pos + 'px');
                        }                       
                    }
                }
            }
        },

        /**
         * Get zindex
         */
        setZindex: function() {
            var zIndex = 101; //mUtil.css(the.layout.wrapper, 'z-index');
            var newZindex = mUtil.getHighestZindex(element);
            if (newZindex >= zIndex) {
                zIndex = newZindex + 1;
            }
            
            mUtil.css(the.layout.wrapper, 'z-index', zIndex);
        },

        /**
         * Check persistent
         */
        isPersistent: function() {
            return the.options.persistent;
        },

        /**
         * Check persistent
         */
        isShown: function() {
            return the.open;
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name, args) {
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            event.handler.call(this, the, args);
                        }
                    } else {
                        event.handler.call(this, the, args);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options 
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Show dropdown
     * @returns {mDropdown}
     */
    the.show = function() {
        return Plugin.show();
    };

    /**
     * Hide dropdown
     * @returns {mDropdown}
     */
    the.hide = function() {
        return Plugin.hide();
    };

    /**
     * Toggle dropdown
     * @returns {mDropdown}
     */
    the.toggle = function() {
        return Plugin.toggle();
    };

    /**
     * Toggle dropdown
     * @returns {mDropdown}
     */
    the.isPersistent = function() {
        return Plugin.isPersistent();
    };

    /**
     * Check shown state
     * @returns {mDropdown}
     */
    the.isShown = function() {
        return Plugin.isShown();
    };

    /**
     * Set dropdown content
     * @returns {mDropdown}
     */
    the.setContent = function(content) {
        return Plugin.setContent(content);
    };

    /**
     * Register event
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Register event
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    ///////////////////////////////
    // ** Plugin Construction ** //
    ///////////////////////////////

    //== Run plugin
    Plugin.construct.apply(the, [options]);

    //== Init done
    init = true;

    // Return plugin instance
    return the;
};

//== Plugin global lazy initialization
mUtil.on(document, '[m-dropdown-toggle="click"] .m-dropdown__toggle', 'click', function(e) {
    var element = this.closest('.m-dropdown');  
    var dropdown;

    if (element) {
        if (mUtil.data(element).has('dropdown')) {
            dropdown = mUtil.data(element).get('dropdown');
        } else {                 
            dropdown = new mDropdown(element);
        }             

        dropdown.toggle();

        e.preventDefault();
    } 
});

mUtil.on(document, '[m-dropdown-toggle="hover"] .m-dropdown__toggle', 'click', function(e) {
    if (mUtil.isDesktopDevice()) {
        if (mUtil.attr(this, 'href') == '#') {
            e.preventDefault();
        }
    } else if (mUtil.isMobileDevice()) {
        var element = this.closest('.m-dropdown');
        var dropdown;

        if (element) {
            if (mUtil.data(element).has('dropdown')) {
                dropdown = mUtil.data(element).get('dropdown');
            } else {                        
                dropdown = new mDropdown(element);
            }  

            dropdown.toggle();

            e.preventDefault();
        }
    }
});

mUtil.on(document, '[m-dropdown-toggle="hover"]', 'mouseover', function(e) {
    if (mUtil.isDesktopDevice()) {
        var element = this;
        var dropdown;

        if (element) {
            if (mUtil.data(element).has('dropdown')) {
                dropdown = mUtil.data(element).get('dropdown');
            } else {                        
                dropdown = new mDropdown(element);
            }              

            dropdown.show();

            e.preventDefault();
        }
    }
});

document.addEventListener("click", function(e) {
    var query;
    var body = mUtil.get('body');
    var target = e.target;

    //== Handle dropdown close
    if (query = body.querySelectorAll('.m-dropdown.m-dropdown--open')) {
        for (var i = 0, len = query.length; i < len; i++) {
            var element = query[i];
            if (mUtil.data(element).has('dropdown') === false) {
                return;
            }

            var the = mUtil.data(element).get('dropdown');
            var toggle = mUtil.find(element, '.m-dropdown__toggle');

            if (mUtil.hasClass(element, 'm-dropdown--disable-close')) {
                e.preventDefault();
                e.stopPropagation();
                //return;
            }

            if (toggle && target !== toggle && toggle.contains(target) === false && target.contains(toggle) === false) {
                if (the.isPersistent() === false) {
                    the.hide();
                } 
            } else if (element.contains(target) === false) {
                the.hide();
            }
        }
    }
});

var mHeader = function(elementId, options) {
    //== Main object
    var the = this;
    var init = false;

    //== Get element object
    var element = mUtil.get(elementId);
    var body = mUtil.get('body');

    if (element === undefined) {
        return;
    }

    //== Default options
    var defaultOptions = {
        classic: false,
        offset: {
            mobile: 150,
            desktop: 200
        },
        minimize: {
            mobile: false,
            desktop: false
        }
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Run plugin
         * @returns {mHeader}
         */
        construct: function(options) {
            if (mUtil.data(element).has('header')) {
                the = mUtil.data(element).get('header');
            } else {
                // reset header
                Plugin.init(options);

                // build header
                Plugin.build();

                mUtil.data(element).set('header', the);
            }

            return the;
        },

        /**
         * Handles subheader click toggle
         * @returns {mHeader}
         */
        init: function(options) {
            the.events = [];

            // merge default and user defined options
            the.options = mUtil.deepExtend({}, defaultOptions, options);
        },

        /**
         * Reset header
         * @returns {mHeader}
         */
        build: function() {
            var lastScrollTop = 0;

            if (the.options.minimize.mobile === false && the.options.minimize.desktop === false) {
                return;
            }

            window.addEventListener('scroll', function() {
                var offset = 0, on, off, st;

                if (mUtil.isInResponsiveRange('desktop')) {
                    offset = the.options.offset.desktop;
                    on = the.options.minimize.desktop.on;
                    off = the.options.minimize.desktop.off;
                } else if (mUtil.isInResponsiveRange('tablet-and-mobile')) {
                    offset = the.options.offset.mobile;
                    on = the.options.minimize.mobile.on;
                    off = the.options.minimize.mobile.off;
                }

                st = window.pageYOffset;

                if (
                    (mUtil.isInResponsiveRange('tablet-and-mobile') && the.options.classic && the.options.classic.mobile) ||
                    (mUtil.isInResponsiveRange('desktop') && the.options.classic && the.options.classic.desktop)

                ) {
                    if (st > offset) { // down scroll mode
                        mUtil.addClass(body, on);
                        mUtil.removeClass(body, off);
                    } else { // back scroll mode
                        mUtil.addClass(body, off);
                        mUtil.removeClass(body, on);
                    }
                } else {
                    if (st > offset && lastScrollTop < st) { // down scroll mode
                        mUtil.addClass(body, on);
                        mUtil.removeClass(body, off);
                    } else { // back scroll mode
                        mUtil.addClass(body, off);
                        mUtil.removeClass(body, on);
                    }

                    lastScrollTop = st;
                }
            });
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name, args) {
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            event.handler.call(this, the, args);
                        }
                    } else {
                        event.handler.call(this, the, args);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options 
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Register event
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    ///////////////////////////////
    // ** Plugin Construction ** //
    ///////////////////////////////

    //== Run plugin
    Plugin.construct.apply(the, [options]);

    //== Init done
    init = true;

    // Return plugin instance
    return the;
};
var mMenu = function(elementId, options) {
    //== Main object
    var the = this;
    var init = false;

    //== Get element object
    var element = mUtil.get(elementId);
    var body = mUtil.get('body');  

    if (!element) {
        return;
    }

    //== Default options
    var defaultOptions = {       
        // accordion submenu mode
        accordion: {
            slideSpeed: 200, // accordion toggle slide speed in milliseconds
            autoScroll: false, // enable auto scrolling(focus) to the clicked menu item
            autoScrollSpeed: 1200,
            expandAll: true // allow having multiple expanded accordions in the menu
        },

        // dropdown submenu mode
        dropdown: {
            timeout: 500 // timeout in milliseconds to show and hide the hoverable submenu dropdown
        }
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Run plugin
         * @returns {mMenu}
         */
        construct: function(options) {
            if (mUtil.data(element).has('menu')) {
                the = mUtil.data(element).get('menu');
            } else {
                // reset menu
                Plugin.init(options);

                // reset menu
                Plugin.reset();

                // build menu
                Plugin.build();

                mUtil.data(element).set('menu', the);
            }

            return the;
        },

        /**
         * Handles submenu click toggle
         * @returns {mMenu}
         */
        init: function(options) {
            the.events = [];

            the.eventHandlers = {};

            // merge default and user defined options
            the.options = mUtil.deepExtend({}, defaultOptions, options);

            // pause menu
            the.pauseDropdownHoverTime = 0;

            the.uid = mUtil.getUniqueID();
        },

        update: function(options) {
            // merge default and user defined options
            the.options = mUtil.deepExtend({}, defaultOptions, options);

            // pause menu
            the.pauseDropdownHoverTime = 0;

             // reset menu
            Plugin.reset();

            the.eventHandlers = {};

            // build menu
            Plugin.build();

            mUtil.data(element).set('menu', the);
        },

        reload: function() {
             // reset menu
            Plugin.reset();

            // build menu
            Plugin.build();
        },

        /**
         * Reset menu
         * @returns {mMenu}
         */
        build: function() {
            //== General accordion submenu toggle
            the.eventHandlers['event_1'] = mUtil.on( element, '.m-menu__toggle', 'click', Plugin.handleSubmenuAccordion);

            //== Dropdown mode(hoverable)
            if (Plugin.getSubmenuMode() === 'dropdown' || Plugin.isConditionalSubmenuDropdown()) {
                // dropdown submenu - hover toggle
                the.eventHandlers['event_2'] = mUtil.on( element, '[m-menu-submenu-toggle="hover"]', 'mouseover', Plugin.handleSubmenuDrodownHoverEnter);
                the.eventHandlers['event_3'] = mUtil.on( element, '[m-menu-submenu-toggle="hover"]', 'mouseout', Plugin.handleSubmenuDrodownHoverExit);

                // dropdown submenu - click toggle
                the.eventHandlers['event_4'] = mUtil.on( element, '[m-menu-submenu-toggle="click"] > .m-menu__toggle, [m-menu-submenu-toggle="click"] > .m-menu__link .m-menu__toggle', 'click', Plugin.handleSubmenuDropdownClick);
                the.eventHandlers['event_5'] = mUtil.on( element, '[m-menu-submenu-toggle="tab"] > .m-menu__toggle, [m-menu-submenu-toggle="tab"] > .m-menu__link .m-menu__toggle', 'click', Plugin.handleSubmenuDropdownTabClick);
            }

            //== General link click
            the.eventHandlers['event_6'] = mUtil.on(element, '.m-menu__item:not(.m-menu__item--submenu) > .m-menu__link:not(.m-menu__toggle):not(.m-menu__link--toggle-skip)', 'click', Plugin.handleLinkClick);

            //== Init scrollable menu
            if (the.options.scroll && the.options.scroll.height) {
                Plugin.scrollerInit();
            }
        },

        /**
         * Reset menu
         * @returns {mMenu}
         */
        reset: function() { 
            mUtil.off( element, 'click', the.eventHandlers['event_1']);

            // dropdown submenu - hover toggle
            mUtil.off( element, 'mouseover', the.eventHandlers['event_2']);
            mUtil.off( element, 'mouseout', the.eventHandlers['event_3']);

            // dropdown submenu - click toggle
            mUtil.off( element, 'click', the.eventHandlers['event_4']);
            mUtil.off( element, 'click', the.eventHandlers['event_5']);
            
            mUtil.off(element, 'click', the.eventHandlers['event_6']);
        },

        /**
         * Init scroll menu
         *
        */
        scrollerInit: function() {
            if ( the.options.scroll && the.options.scroll.height ) {
                mUtil.scrollerDestroy(element);
                mUtil.scrollerInit(element, {disableForMobile: true, resetHeightOnDestroy: true, handleWindowResize: true, height: the.options.scroll.height});
            }            
        },

        /**
         * Update scroll menu
        */
        scrollerUpdate: function() {
            if ( the.options.scroll && the.options.scroll.height ) {
                mUtil.scrollerUpdate(element);
            } else {
                mUtil.scrollerDestroy(element);
            }
        },

        /**
         * Scroll top
        */
        scrollerTop: function() {
            if ( the.options.scroll && the.options.scroll.height ) {
                mUtil.scrollerTop(element);
            }
        },

        /**
         * Get submenu mode for current breakpoint and menu state
         * @returns {mMenu}
         */
        getSubmenuMode: function(el) {
            if ( mUtil.isInResponsiveRange('desktop') ) {
                if (el && mUtil.hasAttr(el, 'm-menu-submenu-toggle')) {
                    return mUtil.attr(el, 'm-menu-submenu-toggle');
                }

                if ( mUtil.isset(the.options.submenu, 'desktop.state.body') ) {
                    if ( mUtil.hasClass(body, the.options.submenu.desktop.state.body) ) {
                        return the.options.submenu.desktop.state.mode;
                    } else {
                        return the.options.submenu.desktop.default;
                    }
                } else if ( mUtil.isset(the.options.submenu, 'desktop') ) {
                    return the.options.submenu.desktop;
                }
            } else if ( mUtil.isInResponsiveRange('tablet') && mUtil.isset(the.options.submenu, 'tablet') ) {
                return the.options.submenu.tablet;
            } else if ( mUtil.isInResponsiveRange('mobile') && mUtil.isset(the.options.submenu, 'mobile') ) {
                return the.options.submenu.mobile;
            } else {
                return false;
            }
        },

        /**
         * Get submenu mode for current breakpoint and menu state
         * @returns {mMenu}
         */
        isConditionalSubmenuDropdown: function() {
            if ( mUtil.isInResponsiveRange('desktop') && mUtil.isset(the.options.submenu, 'desktop.state.body') ) {
                return true;
            } else {
                return false;
            }
        },

        /**
         * Handles menu link click
         * @returns {mMenu}
         */
        handleLinkClick: function(e) {
            if ( Plugin.eventTrigger('linkClick', this) === false ) {
                e.preventDefault();
            };

            if ( Plugin.getSubmenuMode(this) === 'dropdown' || Plugin.isConditionalSubmenuDropdown() ) {
                Plugin.handleSubmenuDropdownClose(e, this);
            }
        },

        /**
         * Handles submenu hover toggle
         * @returns {mMenu}
         */
        handleSubmenuDrodownHoverEnter: function(e) {
            if ( Plugin.getSubmenuMode(this) === 'accordion' ) {
                return;
            }

            if ( the.resumeDropdownHover() === false ) {
                return;
            }

            var item = this;

            if ( item.getAttribute('data-hover') == '1' ) {
                item.removeAttribute('data-hover');
                clearTimeout( item.getAttribute('data-timeout') );
                item.removeAttribute('data-timeout');
                //Plugin.hideSubmenuDropdown(item, false);
            }

            Plugin.showSubmenuDropdown(item);
        },

        /**
         * Handles submenu hover toggle
         * @returns {mMenu}
         */
        handleSubmenuDrodownHoverExit: function(e) {
            if ( the.resumeDropdownHover() === false ) {
                return;
            }

            if ( Plugin.getSubmenuMode(this) === 'accordion' ) {
                return;
            }

            var item = this;
            var time = the.options.dropdown.timeout;

            var timeout = setTimeout(function() {
                if ( item.getAttribute('data-hover') == '1' ) {
                    Plugin.hideSubmenuDropdown(item, true);
                } 
            }, time);

            item.setAttribute('data-hover', '1');
            item.setAttribute('data-timeout', timeout);  
        },

        /**
         * Handles submenu click toggle
         * @returns {mMenu}
         */
        handleSubmenuDropdownClick: function(e) {
            if ( Plugin.getSubmenuMode(this) === 'accordion' ) {
                return;
            }
 
            var item = this.closest('.m-menu__item'); 

            if ( item.getAttribute('m-menu-submenu-mode') == 'accordion' ) {
                return;
            }

            if ( mUtil.hasClass(item, 'm-menu__item--hover') === false ) {
                mUtil.addClass(item, 'm-menu__item--open-dropdown');
                Plugin.showSubmenuDropdown(item);
            } else {
                mUtil.removeClass(item, 'm-menu__item--open-dropdown' );
                Plugin.hideSubmenuDropdown(item, true);
            }

            e.preventDefault();
        },

        /**
         * Handles tab click toggle
         * @returns {mMenu}
         */
        handleSubmenuDropdownTabClick: function(e) {
            if (Plugin.getSubmenuMode(this) === 'accordion') {
                return;
            }

            var item = this.closest('.m-menu__item');

            if (item.getAttribute('m-menu-submenu-mode') == 'accordion') {
                return;
            }

            if (mUtil.hasClass(item, 'm-menu__item--hover') == false) {
                mUtil.addClass(item, 'm-menu__item--open-dropdown');
                Plugin.showSubmenuDropdown(item);
            }

            e.preventDefault();
        },

        /**
         * Handles submenu dropdown close on link click
         * @returns {mMenu}
         */
        handleSubmenuDropdownClose: function(e, el) {
            // exit if its not submenu dropdown mode
            if (Plugin.getSubmenuMode(el) === 'accordion') {
                return;
            }

            var shown = element.querySelectorAll('.m-menu__item.m-menu__item--submenu.m-menu__item--hover:not(.m-menu__item--tabs)');

            // check if currently clicked link's parent item ha
            if (shown.length > 0 && mUtil.hasClass(el, 'm-menu__toggle') === false && el.querySelectorAll('.m-menu__toggle').length === 0) {
                // close opened dropdown menus
                for (var i = 0, len = shown.length; i < len; i++) {
                    Plugin.hideSubmenuDropdown(shown[0], true);
                }
            }
        },

        /**
         * helper functions
         * @returns {mMenu}
         */
        handleSubmenuAccordion: function(e, el) {
            var query;
            var item = el ? el : this;

            if ( Plugin.getSubmenuMode(el) === 'dropdown' && (query = item.closest('.m-menu__item') ) ) {
                if (query.getAttribute('m-menu-submenu-mode') != 'accordion' ) {
                    e.preventDefault();
                    return;
                }
            }

            var li = item.closest('.m-menu__item');
            var submenu = mUtil.child(li, '.m-menu__submenu, .m-menu__inner');

            if (mUtil.hasClass(item.closest('.m-menu__item'), 'm-menu__item--open-always')) {
                return;
            }

            if ( li && submenu ) {
                e.preventDefault();
                var speed = the.options.accordion.slideSpeed;
                var hasClosables = false;

                if ( mUtil.hasClass(li, 'm-menu__item--open') === false ) {
                    // hide other accordions                    
                    if ( the.options.accordion.expandAll === false ) {
                        var subnav = item.closest('.m-menu__nav, .m-menu__subnav');
                        var closables = mUtil.children(subnav, '.m-menu__item.m-menu__item--open.m-menu__item--submenu:not(.m-menu__item--expanded):not(.m-menu__item--open-always)');

                        if ( subnav && closables ) {
                            for (var i = 0, len = closables.length; i < len; i++) {
                                var el_ = closables[0];
                                var submenu_ = mUtil.child(el_, '.m-menu__submenu');
                                if ( submenu_ ) {
                                    mUtil.slideUp(submenu_, speed, function() {
                                        Plugin.scrollerUpdate();
                                        mUtil.removeClass(el_, 'm-menu__item--open');
                                    });                    
                                }
                            }
                        }
                    }

                    mUtil.slideDown(submenu, speed, function() {
                        Plugin.scrollToItem(item);
                        Plugin.scrollerUpdate();
                        
                        Plugin.eventTrigger('submenuToggle', submenu);
                    });
                
                    mUtil.addClass(li, 'm-menu__item--open');

                } else {
                    mUtil.slideUp(submenu, speed, function() {
                        Plugin.scrollToItem(item);
                        Plugin.eventTrigger('submenuToggle', submenu);
                    });

                    mUtil.removeClass(li, 'm-menu__item--open');       
                }
            }
        },

        /**
         * scroll to item function
         * @returns {mMenu}
         */
        scrollToItem: function(item) {
            // handle auto scroll for accordion submenus
            if ( mUtil.isInResponsiveRange('desktop') && the.options.accordion.autoScroll && element.getAttribute('m-menu-scrollable') !== '1' ) {
                mUtil.scrollTo(item, the.options.accordion.autoScrollSpeed);
            }
        },

        /**
         * helper functions
         * @returns {mMenu}
         */
        hideSubmenuDropdown: function(item, classAlso) {
            // remove submenu activation class
            if ( classAlso ) {
                mUtil.removeClass(item, 'm-menu__item--hover');
                mUtil.removeClass(item, 'm-menu__item--active-tab');
            }

            // clear timeout
            item.removeAttribute('data-hover');

            if ( item.getAttribute('m-menu-dropdown-toggle-class') ) {
                mUtil.removeClass(body, item.getAttribute('m-menu-dropdown-toggle-class'));
            }

            var timeout = item.getAttribute('data-timeout');
            item.removeAttribute('data-timeout');
            clearTimeout(timeout);
        },

        /**
         * helper functions
         * @returns {mMenu}
         */
        showSubmenuDropdown: function(item) {
            // close active submenus
            var list = element.querySelectorAll('.m-menu__item--submenu.m-menu__item--hover, .m-menu__item--submenu.m-menu__item--active-tab');

            if ( list ) {
                for (var i = 0, len = list.length; i < len; i++) {
                    var el = list[i];
                    if ( item !== el && el.contains(item) === false && item.contains(el) === false ) {
                        Plugin.hideSubmenuDropdown(el, true);
                    }
                }
            } 

            // adjust submenu position
            Plugin.adjustSubmenuDropdownArrowPos(item);

            // add submenu activation class
            mUtil.addClass(item, 'm-menu__item--hover');
            
            if ( item.getAttribute('m-menu-dropdown-toggle-class') ) {
                mUtil.addClass(body, item.getAttribute('m-menu-dropdown-toggle-class'));
            }
        },

        /**
         * Handles submenu slide toggle
         * @returns {mMenu}
         */
        createSubmenuDropdownClickDropoff: function(el) {
            var query;
            var zIndex = (query = mUtil.child(el, '.m-menu__submenu') ? mUtil.css(query, 'z-index') : 0) - 1;

            var dropoff = document.createElement('<div class="m-menu__dropoff" style="background: transparent; position: fixed; top: 0; bottom: 0; left: 0; right: 0; z-index: ' + zIndex + '"></div>');

            body.appendChild(dropoff);

            mUtil.addEvent(dropoff, 'click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                mUtil.remove(this);
                Plugin.hideSubmenuDropdown(el, true);
            });
        },

        /**
         * Handles submenu click toggle
         * @returns {mMenu}
         */
        adjustSubmenuDropdownArrowPos: function(item) {
            var submenu = mUtil.child(item, '.m-menu__submenu');
            var arrow = mUtil.child( submenu, '.m-menu__arrow.m-menu__arrow--adjust');
            var subnav = mUtil.child( submenu, '.m-menu__subnav');

            if ( arrow ) { 
                var pos = 0; 
                var link = mUtil.child(item, '.m-menu__link');

                if ( mUtil.hasClass(submenu, 'm-menu__submenu--classic') || mUtil.hasClass(submenu, 'm-menu__submenu--fixed') ) {
                    if ( mUtil.hasClass(submenu, 'm-menu__submenu--right')) {
                        pos = mUtil.outerWidth(item) / 2;
                        if (mUtil.hasClass(submenu, 'm-menu__submenu--pull')) {
                            if (mUtil.isRTL()) {
                                pos = pos + Math.abs( parseFloat(mUtil.css(submenu, 'margin-left')) );
                            } else {
                                pos = pos + Math.abs( parseFloat(mUtil.css(submenu, 'margin-right')) );
                            }
                        }
                        pos = parseInt(mUtil.css(submenu, 'width')) - pos;
                    } else if ( mUtil.hasClass(submenu, 'm-menu__submenu--left') ) {
                        pos = mUtil.outerWidth(item) / 2;
                        if ( mUtil.hasClass(submenu, 'm-menu__submenu--pull')) {
                            if (mUtil.isRTL()) {
                                pos = pos + Math.abs( parseFloat(mUtil.css(submenu, 'margin-right')) );
                            } else {
                                pos = pos + Math.abs( parseFloat(mUtil.css(submenu, 'margin-left')) );
                            }
                        }
                    }

                    if (mUtil.isRTL()) {
                        mUtil.css(arrow, 'right', pos + 'px');  
                    } else {
                        mUtil.css(arrow, 'left', pos + 'px');  
                    }
                } else {
                    if ( mUtil.hasClass(submenu, 'm-menu__submenu--center') || mUtil.hasClass(submenu, 'm-menu__submenu--full') ) {
                        pos = mUtil.offset(item).left - ((mUtil.getViewPort().width - parseInt(mUtil.css(submenu, 'width'))) / 2);
                        pos = pos + (mUtil.outerWidth(item) / 2);

                        mUtil.css(arrow, 'left', pos + 'px');
                        if (mUtil.isRTL()) {
                            mUtil.css(arrow, 'right', 'auto');
                        }                        
                    }
                }
            }
        },

        /**
         * Handles submenu hover toggle
         * @returns {mMenu}
         */
        pauseDropdownHover: function(time) {
            var date = new Date();

            the.pauseDropdownHoverTime = date.getTime() + time;
        },

        /**
         * Handles submenu hover toggle
         * @returns {mMenu}
         */
        resumeDropdownHover: function() {
            var date = new Date();

            return (date.getTime() > the.pauseDropdownHoverTime ? true : false);
        },

        /**
         * Reset menu's current active item
         * @returns {mMenu}
         */
        resetActiveItem: function(item) {
            var list;
            var parents;

            list = element.querySelectorAll('.m-menu__item--active');
            
            for (var i = 0, len = list.length; i < len; i++) {
                var el = list[0];
                mUtil.removeClass(el, 'm-menu__item--active');
                mUtil.hide( mUtil.child(el, '.m-menu__submenu') );
                parents = mUtil.parents(el, '.m-menu__item--submenu');

                for (var i_ = 0, len_ = parents.length; i_ < len_; i_++) {
                    var el_ = parents[i];
                    mUtil.removeClass(el_, 'm-menu__item--open');
                    mUtil.hide( mUtil.child(el_, '.m-menu__submenu') );
                }
            }

            // close open submenus
            if ( the.options.accordion.expandAll === false ) {
                if ( list = element.querySelectorAll('.m-menu__item--open') ) {
                    for (var i = 0, len = list.length; i < len; i++) {
                        mUtil.removeClass(parents[0], 'm-menu__item--open');
                    }
                }
            }
        },

        /**
         * Sets menu's active item
         * @returns {mMenu}
         */
        setActiveItem: function(item) {
            // reset current active item
            Plugin.resetActiveItem();

            mUtil.addClass(item, 'm-menu__item--active');
            
            var parents = mUtil.parents(item, '.m-menu__item--submenu');
            for (var i = 0, len = parents.length; i < len; i++) {
                mUtil.addClass(parents[i], 'm-menu__item--open');
            }
        },

        /**
         * Returns page breadcrumbs for the menu's active item
         * @returns {mMenu}
         */
        getBreadcrumbs: function(item) {
            var query;
            var breadcrumbs = [];
            var link = mUtil.child(item, '.m-menu__link');

            breadcrumbs.push({
                text: (query = mUtil.child(link, '.m-menu__link-text') ? query.innerHTML : ''),
                title: link.getAttribute('title'),
                href: link.getAttribute('href')
            });

            var parents = mUtil.parents(item, '.m-menu__item--submenu');
            for (var i = 0, len = parents.length; i < len; i++) {
                var submenuLink = mUtil.child(parents[i], '.m-menu__link');

                breadcrumbs.push({
                    text: (query = mUtil.child(submenuLink, '.m-menu__link-text') ? query.innerHTML : ''),
                    title: submenuLink.getAttribute('title'),
                    href: submenuLink.getAttribute('href')
                });
            }

            return  breadcrumbs.reverse();
        },

        /**
         * Returns page title for the menu's active item
         * @returns {mMenu}
         */
        getPageTitle: function(item) {
            var query;

            return (query = mUtil.child(item, '.m-menu__link-text') ? query.innerHTML : '');
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name, args) {
            for (var i = 0; i < the.events.length; i++ ) {
                var event = the.events[i];
                if ( event.name == name ) {
                    if ( event.one == true ) {
                        if ( event.fired == false ) {
                            the.events[i].fired = true;
                            event.handler.call(this, the, args);
                        }
                    } else {
                        event.handler.call(this, the, args);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });
        },

        removeEvent: function(name) {
            if (the.events[name]) {
                delete the.events[name];
            }
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options 
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Set active menu item
     */
    the.scrollerUpdate = function() {
        return Plugin.scrollerUpdate();
    };

    /**
     * Set active menu item
     */
    the.scrollerTop = function() {
        return Plugin.scrollerTop();
    };

    /**
     * Set active menu item
     */
    the.setActiveItem = function(item) {
        return Plugin.setActiveItem(item);
    };

    the.reload = function() {
        return Plugin.reload();
    };

    the.update = function(options) {
        return Plugin.update(options);
    };

    /**
     * Set breadcrumb for menu item
     */
    the.getBreadcrumbs = function(item) {
        return Plugin.getBreadcrumbs(item);
    };

    /**
     * Set page title for menu item
     */
    the.getPageTitle = function(item) {
        return Plugin.getPageTitle(item);
    };

    /**
     * Get submenu mode
     */
    the.getSubmenuMode = function(el) {
        return Plugin.getSubmenuMode(el);
    };

    /**
     * Hide dropdown submenu
     * @returns {jQuery}
     */
    the.hideDropdown = function(item) {
        Plugin.hideSubmenuDropdown(item, true);
    };

    /**
     * Disable menu for given time
     * @returns {jQuery}
     */
    the.pauseDropdownHover = function(time) {
        Plugin.pauseDropdownHover(time);
    };

    /**
     * Disable menu for given time
     * @returns {jQuery}
     */
    the.resumeDropdownHover = function() {
        return Plugin.resumeDropdownHover();
    };

    /**
     * Register event
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    the.off = function(name) {
        return Plugin.removeEvent(name);
    };

    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    ///////////////////////////////
    // ** Plugin Construction ** //
    ///////////////////////////////

    //== Run plugin
    Plugin.construct.apply(the, [options]);

    //== Handle plugin on window resize
    mUtil.addResizeHandler(function() {
        if (init) {
            the.reload();
        }  
    });

    //== Init done
    init = true;

    // Return plugin instance
    return the;
};

// Plugin global lazy initialization
document.addEventListener("click", function (e) {
    var body = mUtil.get('body');
    var query;
    if ( query = body.querySelectorAll('.m-menu__nav .m-menu__item.m-menu__item--submenu.m-menu__item--hover:not(.m-menu__item--tabs)[m-menu-submenu-toggle="click"]') ) {
        for (var i = 0, len = query.length; i < len; i++) {
            var element = query[i].closest('.m-menu__nav').parentNode;

            if ( element ) {
                var the = mUtil.data(element).get('menu');

                if ( !the ) {
                    break;
                }

                if ( !the || the.getSubmenuMode() !== 'dropdown' ) {
                    break;
                }

                if ( e.target !== element && element.contains(e.target) === false ) {
                    var items;
                    if ( items = element.querySelectorAll('.m-menu__item--submenu.m-menu__item--hover:not(.m-menu__item--tabs)[m-menu-submenu-toggle="click"]') ) {
                        for (var j = 0, cnt = items.length; j < cnt; j++) {
                            the.hideDropdown(items[j]);
                        }
                    }
                }
            }            
        }
    } 
});
var mOffcanvas = function(elementId, options) {
    //== Main object
    var the = this;
    var init = false;

    //== Get element object
    var element = mUtil.get(elementId);
    var body = mUtil.get('body');

    if (!element) {
        return;
    }

    //== Default options
    var defaultOptions = {};

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Run plugin
         * @returns {moffcanvas}
         */
        construct: function(options) {
            if (mUtil.data(element).has('offcanvas')) {
                the = mUtil.data(element).get('offcanvas');
            } else {
                // reset offcanvas
                Plugin.init(options);
                
                // build offcanvas
                Plugin.build();

                mUtil.data(element).set('offcanvas', the);
            }

            return the;
        },

        /**
         * Handles suboffcanvas click toggle
         * @returns {moffcanvas}
         */
        init: function(options) {
            the.events = [];

            // merge default and user defined options
            the.options = mUtil.deepExtend({}, defaultOptions, options);
            the.overlay;

            the.classBase = the.options.baseClass;
            the.classShown = the.classBase + '--on';
            the.classOverlay = the.classBase + '-overlay';

            the.state = mUtil.hasClass(element, the.classShown) ? 'shown' : 'hidden';
        },

        build: function() {
            //== offcanvas toggle
            if (the.options.toggleBy) {
                if (typeof the.options.toggleBy === 'string') { 
                    mUtil.addEvent( the.options.toggleBy, 'click', Plugin.toggle); 
                } else if (the.options.toggleBy && the.options.toggleBy[0] && the.options.toggleBy[0].target) {
                    for (var i in the.options.toggleBy) { 
                        mUtil.addEvent( the.options.toggleBy[i].target, 'click', Plugin.toggle); 
                    }
                } else if (the.options.toggleBy && the.options.toggleBy.target) {
                    mUtil.addEvent( the.options.toggleBy.target, 'click', Plugin.toggle); 
                } 
            }

            //== offcanvas close
            var closeBy = mUtil.get(the.options.closeBy);
            if (closeBy) {
                mUtil.addEvent(closeBy, 'click', Plugin.hide);
            }
        },


        /**
         * Handles offcanvas toggle
         */
        toggle: function() {;
            Plugin.eventTrigger('toggle'); 

            if (the.state == 'shown') {
                Plugin.hide(this);
            } else {
                Plugin.show(this);
            }
        },

        /**
         * Handles offcanvas show
         */
        show: function(target) {
            if (the.state == 'shown') {
                return;
            }

            Plugin.eventTrigger('beforeShow');

            Plugin.togglerClass(target, 'show');

            //== Offcanvas panel
            mUtil.addClass(body, the.classShown);
            mUtil.addClass(element, the.classShown);

            the.state = 'shown';

            if (the.options.overlay) {
                the.overlay = mUtil.insertAfter(document.createElement('DIV') , element );
                mUtil.addClass(the.overlay, the.classOverlay);
                mUtil.addEvent(the.overlay, 'click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    Plugin.hide(target);       
                });
            }

            Plugin.eventTrigger('afterShow');
        },

        /**
         * Handles offcanvas hide
         */
        hide: function(target) {
            if (the.state == 'hidden') {
                return;
            }

            Plugin.eventTrigger('beforeHide');

            Plugin.togglerClass(target, 'hide');

            mUtil.removeClass(body, the.classShown);
            mUtil.removeClass(element, the.classShown);

            the.state = 'hidden';

            if (the.options.overlay && the.overlay) {
                mUtil.remove(the.overlay);
            }

            Plugin.eventTrigger('afterHide');
        },

        /**
         * Handles toggler class
         */
        togglerClass: function(target, mode) {
            //== Toggler
            var id = mUtil.attr(target, 'id');
            var toggleBy;

            if (the.options.toggleBy && the.options.toggleBy[0] && the.options.toggleBy[0].target) {
                for (var i in the.options.toggleBy) {
                    if (the.options.toggleBy[i].target === id) {
                        toggleBy = the.options.toggleBy[i];
                    }        
                }
            } else if (the.options.toggleBy && the.options.toggleBy.target) {
                toggleBy = the.options.toggleBy;
            }

            if (toggleBy) {                
                var el = mUtil.get(toggleBy.target);
                
                if (mode === 'show') {
                    mUtil.addClass(el, toggleBy.state);
                }

                if (mode === 'hide') {
                    mUtil.removeClass(el, toggleBy.state);
                }
            }
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name, args) {
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            event.handler.call(this, the, args);
                        }
                    } else {
                        event.handler.call(this, the, args);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options 
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Hide 
     */
    the.hide = function() {
        return Plugin.hide();
    };

    /**
     * Show 
     */
    the.show = function() {
        return Plugin.show();
    };

    /**
     * Get suboffcanvas mode
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Set offcanvas content
     * @returns {mOffcanvas}
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    ///////////////////////////////
    // ** Plugin Construction ** //
    ///////////////////////////////

    //== Run plugin
    Plugin.construct.apply(the, [options]);

    //== Init done
    init = true;

    // Return plugin instance
    return the;
};
// plugin setup
var mPortlet = function(elementId, options) {
    //== Main object
    var the = this;
    var init = false;

    //== Get element object
    var element = mUtil.get(elementId);
    var body = mUtil.get('body');

    if (!element) {
        return;
    }

    //== Default options
    var defaultOptions = {
        bodyToggleSpeed: 400,
        tooltips: true,
        tools: {
            toggle: {
                collapse: 'Collapse',
                expand: 'Expand'
            },
            reload: 'Reload',
            remove: 'Remove',
            fullscreen: {
                on: 'Fullscreen',
                off: 'Exit Fullscreen'
            }
        },
        sticky: {
            offset: 300,
            zIndex: 98
        }
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Construct
         */

        construct: function(options) {
            if (mUtil.data(element).has('portlet')) {
                the = mUtil.data(element).get('portlet');
            } else {
                // reset menu
                Plugin.init(options);

                // build menu
                Plugin.build();

                mUtil.data(element).set('portlet', the);
            }

            return the;
        },

        /**
         * Init portlet
         */
        init: function(options) {
            the.element = element;
            the.events = [];

            // merge default and user defined options
            the.options = mUtil.deepExtend({}, defaultOptions, options);
            the.head = mUtil.child(element, '.m-portlet__head');
            the.foot = mUtil.child(element, '.m-portlet__foot');

            if (mUtil.child(element, '.m-portlet__body')) {
                the.body = mUtil.child(element, '.m-portlet__body');
            } else if (mUtil.child(element, '.m-form').length !== 0) {
                the.body = mUtil.child(element, '.m-form');
            }
        },

        /**
         * Build Form Wizard
         */
        build: function() {
            //== Remove
            var remove = mUtil.find(the.head, '[m-portlet-tool=remove]');
            if (remove) {
                mUtil.addEvent(remove, 'click', function(e) {
                    e.preventDefault();
                    Plugin.remove();
                });
            }

            //== Reload
            var reload = mUtil.find(the.head, '[m-portlet-tool=reload]');
            if (reload) {
                mUtil.addEvent(reload, 'click', function(e) {
                    e.preventDefault();
                    Plugin.reload();
                });
            }

            //== Toggle
            var toggle = mUtil.find(the.head, '[m-portlet-tool=toggle]');
            if (toggle) {
                mUtil.addEvent(toggle, 'click', function(e) {
                    e.preventDefault();
                    Plugin.toggle();
                });
            }

            //== Fullscreen
            var fullscreen = mUtil.find(the.head, '[m-portlet-tool=fullscreen]');
            if (fullscreen) {
                mUtil.addEvent(fullscreen, 'click', function(e) {
                    e.preventDefault();
                    Plugin.fullscreen();
                });
            }

            Plugin.setupTooltips();
        },

        /**
         * Window scroll handle event for sticky portlet
         */
        onScrollSticky: function() {
            var st = window.pageYOffset;
            var offset = the.options.sticky.offset;


            if (st > offset) {
                if (mUtil.hasClass(body, 'm-portlet--sticky') === false) {
                    Plugin.eventTrigger('stickyOn');

                    mUtil.addClass(body, 'm-portlet--sticky');
                    mUtil.addClass(element, 'm-portlet--sticky');

                    Plugin.updateSticky();
                }
            } else { // back scroll mode
                if (mUtil.hasClass(body, 'm-portlet--sticky')) {
                    Plugin.eventTrigger('stickyOff');

                    mUtil.removeClass(body, 'm-portlet--sticky');
                    mUtil.removeClass(element, 'm-portlet--sticky');

                    Plugin.resetSticky();
                }
            }
        },

        /**
         * Init sticky portlet
         */
        initSticky: function() {
            if (!the.head) {
                return;
            }

            window.addEventListener('scroll', Plugin.onScrollSticky);
        },

        /**
         * Update sticky portlet positions
         */
        updateSticky: function() {
            if (!the.head) {
                return;
            }

            var top;

            if (mUtil.hasClass(body, 'm-portlet--sticky')) {
                if (the.options.sticky.position.top instanceof Function) {
                    top = parseInt(the.options.sticky.position.top.call());
                } else {
                    top = parseInt(the.options.sticky.position.top);
                }

                var left;
                if (the.options.sticky.position.left instanceof Function) {
                    left = parseInt(the.options.sticky.position.left.call());
                } else {
                    left = parseInt(the.options.sticky.position.left);
                }

                var right;
                if (the.options.sticky.position.right instanceof Function) {
                    right = parseInt(the.options.sticky.position.right.call());
                } else {
                    right = parseInt(the.options.sticky.position.right);
                }

                mUtil.css(the.head, 'z-index', the.options.sticky.zIndex);
                mUtil.css(the.head, 'top', top + 'px');

                if (mUtil.isRTL()) {
                    mUtil.css(the.head, 'left', right + 'px');
                    mUtil.css(the.head, 'right',left  + 'px');
                } else {
                    mUtil.css(the.head, 'left', left + 'px');
                    mUtil.css(the.head, 'right', right + 'px');
                }
                
            }
        },

        /**
         * Reset sticky portlet positions
         */
        resetSticky: function() {
            if (!the.head) {
                return;
            }

            if (mUtil.hasClass(body, 'm-portlet--sticky') === false) {
                mUtil.css(the.head, 'z-index', '');
                mUtil.css(the.head, 'top', '');
                mUtil.css(the.head, 'left', '');
                mUtil.css(the.head, 'right', '');
            }
        },

        /**
         * Destroy sticky portlet
         */
        destroySticky: function() {
            if (!the.head) {
                return;
            }

            Plugin.resetSticky();

            window.removeEventListener('scroll', Plugin.onScrollSticky);
        },

        /**
         * Remove portlet
         */
        remove: function() {
            if (Plugin.eventTrigger('beforeRemove') === false) {
                return;
            }

            if (mUtil.hasClass(body, 'm-portlet--fullscreen') && mUtil.hasClass(element, 'm-portlet--fullscreen')) {
                Plugin.fullscreen('off');
            }

            Plugin.removeTooltips();

            mUtil.remove(element);

            Plugin.eventTrigger('afterRemove');
        },

        /**
         * Set content
         */
        setContent: function(html) {
            if (html) {
                the.body.innerHTML = html;
            }
        },

        /**
         * Get body
         */
        getBody: function() {
            return the.body;
        },

        /**
         * Get self
         */
        getSelf: function() {
            return element;
        },

        /**
         * Setup tooltips
         */
        setupTooltips: function() {
            if (the.options.tooltips) {
                var collapsed = mUtil.hasClass(element, 'm-portlet--collapse') || mUtil.hasClass(element, 'm-portlet--collapsed');
                var fullscreenOn = mUtil.hasClass(body, 'm-portlet--fullscreen') && mUtil.hasClass(element, 'm-portlet--fullscreen');

                //== Remove
                var remove = mUtil.find(the.head, '[m-portlet-tool=remove]');
                if (remove) {
                    var placement = (fullscreenOn ? 'bottom' : 'top');
                    var tip = new Tooltip(remove, {
                        title: the.options.tools.remove,
                        placement: placement,
                        offset: (fullscreenOn ? '0,10px,0,0' : '0,5px'),
                        trigger: 'hover',
                        template: '<div class="m-tooltip m-tooltip--portlet tooltip bs-tooltip-' + placement + '" role="tooltip">\
                            <div class="tooltip-arrow arrow"></div>\
                            <div class="tooltip-inner"></div>\
                        </div>'
                    });

                    mUtil.data(remove).set('tooltip', tip);
                }

                //== Reload
                var reload = mUtil.find(the.head, '[m-portlet-tool=reload]');
                if (reload) {
                    var placement = (fullscreenOn ? 'bottom' : 'top');
                    var tip = new Tooltip(reload, {
                        title: the.options.tools.reload,
                        placement: placement,
                        offset: (fullscreenOn ? '0,10px,0,0' : '0,5px'),
                        trigger: 'hover',
                        template: '<div class="m-tooltip m-tooltip--portlet tooltip bs-tooltip-' + placement + '" role="tooltip">\
                            <div class="tooltip-arrow arrow"></div>\
                            <div class="tooltip-inner"></div>\
                        </div>'
                    });

                    mUtil.data(reload).set('tooltip', tip);
                }

                //== Toggle
                var toggle = mUtil.find(the.head, '[m-portlet-tool=toggle]');
                if (toggle) {
                    var placement = (fullscreenOn ? 'bottom' : 'top');
                    var tip = new Tooltip(toggle, {
                        title: (collapsed ? the.options.tools.toggle.expand : the.options.tools.toggle.collapse),
                        placement: placement,
                        offset: (fullscreenOn ? '0,10px,0,0' : '0,5px'),
                        trigger: 'hover',
                        template: '<div class="m-tooltip m-tooltip--portlet tooltip bs-tooltip-' + placement + '" role="tooltip">\
                            <div class="tooltip-arrow arrow"></div>\
                            <div class="tooltip-inner"></div>\
                        </div>'
                    });

                    mUtil.data(toggle).set('tooltip', tip);
                }

                //== Fullscreen
                var fullscreen = mUtil.find(the.head, '[m-portlet-tool=fullscreen]');
                if (fullscreen) {
                    var placement = (fullscreenOn ? 'bottom' : 'top');
                    var tip = new Tooltip(fullscreen, {
                        title: (fullscreenOn ? the.options.tools.fullscreen.off : the.options.tools.fullscreen.on),
                        placement: placement,
                        offset: (fullscreenOn ? '0,10px,0,0' : '0,5px'),
                        trigger: 'hover',
                        template: '<div class="m-tooltip m-tooltip--portlet tooltip bs-tooltip-' + placement + '" role="tooltip">\
                            <div class="tooltip-arrow arrow"></div>\
                            <div class="tooltip-inner"></div>\
                        </div>'
                    });

                    mUtil.data(fullscreen).set('tooltip', tip);
                }
            }
        },

        /**
         * Setup tooltips
         */
        removeTooltips: function() {
            if (the.options.tooltips) {
                //== Remove
                var remove = mUtil.find(the.head, '[m-portlet-tool=remove]');
                if (remove && mUtil.data(remove).has('tooltip')) {
                    mUtil.data(remove).get('tooltip').dispose();
                }

                //== Reload
                var reload = mUtil.find(the.head, '[m-portlet-tool=reload]');
                if (reload && mUtil.data(reload).has('tooltip')) {
                    mUtil.data(reload).get('tooltip').dispose();
                }

                //== Toggle
                var toggle = mUtil.find(the.head, '[m-portlet-tool=toggle]');
                if (toggle && mUtil.data(toggle).has('tooltip')) {
                    mUtil.data(toggle).get('tooltip').dispose();
                }

                //== Fullscreen
                var fullscreen = mUtil.find(the.head, '[m-portlet-tool=fullscreen]');
                if (fullscreen && mUtil.data(fullscreen).has('tooltip')) {
                    mUtil.data(fullscreen).get('tooltip').dispose();
                }
            }
        },

        /**
         * Reload
         */
        reload: function() {
            Plugin.eventTrigger('reload');
        },

        /**
         * Toggle
         */
        toggle: function() {
            if (mUtil.hasClass(element, 'm-portlet--collapse') || mUtil.hasClass(element, 'm-portlet--collapsed')) {
                Plugin.expand();
            } else {
                Plugin.collapse();
            }
        },

        /**
         * Collapse
         */
        collapse: function() {
            if (Plugin.eventTrigger('beforeCollapse') === false) {
                return;
            }

            mUtil.slideUp(the.body, the.options.bodyToggleSpeed, function() {
                Plugin.eventTrigger('afterCollapse');
            });

            mUtil.addClass(element, 'm-portlet--collapse');

            var toggle = mUtil.find(the.head, '[m-portlet-tool=toggle]');
            if (toggle && mUtil.data(toggle).has('tooltip')) {
                mUtil.data(toggle).get('tooltip').updateTitleContent(the.options.tools.toggle.expand);
            }
        },

        /**
         * Expand
         */
        expand: function() {
            if (Plugin.eventTrigger('beforeExpand') === false) {
                return;
            }

            mUtil.slideDown(the.body, the.options.bodyToggleSpeed, function() {
                Plugin.eventTrigger('afterExpand');
            });

            mUtil.removeClass(element, 'm-portlet--collapse');
            mUtil.removeClass(element, 'm-portlet--collapsed');

            var toggle = mUtil.find(the.head, '[m-portlet-tool=toggle]');
            if (toggle && mUtil.data(toggle).has('tooltip')) {
                mUtil.data(toggle).get('tooltip').updateTitleContent(the.options.tools.toggle.collapse);
            }
        },

        /**
         * Toggle
         */
        fullscreen: function(mode) {
            var d = {};
            var speed = 300;

            if (mode === 'off' || (mUtil.hasClass(body, 'm-portlet--fullscreen') && mUtil.hasClass(element, 'm-portlet--fullscreen'))) {
                Plugin.eventTrigger('beforeFullscreenOff');

                mUtil.removeClass(body, 'm-portlet--fullscreen');
                mUtil.removeClass(element, 'm-portlet--fullscreen');

                Plugin.removeTooltips();
                Plugin.setupTooltips();

                if (the.foot) {
                    mUtil.css(the.body, 'margin-bottom', '');
                    mUtil.css(the.foot, 'margin-top', '');
                }

                Plugin.eventTrigger('afterFullscreenOff');
            } else {
                Plugin.eventTrigger('beforeFullscreenOn');

                mUtil.addClass(element, 'm-portlet--fullscreen');
                mUtil.addClass(body, 'm-portlet--fullscreen');

                Plugin.removeTooltips();
                Plugin.setupTooltips();


                if (the.foot) {
                    var height1 = parseInt(mUtil.css(the.foot, 'height'));
                    var height2 = parseInt(mUtil.css(the.foot, 'height')) + parseInt(mUtil.css(the.head, 'height'));
                    mUtil.css(the.body, 'margin-bottom', height1 + 'px');
                    mUtil.css(the.foot, 'margin-top', '-' + height2 + 'px');
                }

                Plugin.eventTrigger('afterFullscreenOn');
            }
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name) {
            //mUtil.triggerCustomEvent(name);
            for (i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            event.handler.call(this, the);
                        }
                    } else {
                        event.handler.call(this, the);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });

            return the;
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options 
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Remove portlet
     * @returns {mPortlet}
     */
    the.remove = function() {
        return Plugin.remove(html);
    };

    /**
     * Init sticky portlet
     * @returns {mPortlet}
     */
    the.initSticky = function() {
        return Plugin.initSticky();
    };

    /**
     * Update sticky portlet scroll event
     * @returns {mPortlet}
     */
    the.updateSticky = function() {
        return Plugin.updateSticky();
    };

    /**
     * Reset sticky portlet positions
     * @returns {mPortlet}
     */
    the.resetSticky = function() {
        return Plugin.resetSticky();
    };

    /**
     * Destroy sticky portlet scroll event
     * @returns {mPortlet}
     */
    the.destroySticky = function() {
        return Plugin.destroySticky();
    };

    /**
     * Reload portlet
     * @returns {mPortlet}
     */
    the.reload = function() {
        return Plugin.reload();
    };

    /**
     * Set portlet content
     * @returns {mPortlet}
     */
    the.setContent = function(html) {
        return Plugin.setContent(html);
    };

    /**
     * Toggle portlet
     * @returns {mPortlet}
     */
    the.toggle = function() {
        return Plugin.toggle();
    };

    /**
     * Collapse portlet
     * @returns {mPortlet}
     */
    the.collapse = function() {
        return Plugin.collapse();
    };

    /**
     * Expand portlet
     * @returns {mPortlet}
     */
    the.expand = function() {
        return Plugin.expand();
    };

    /**
     * Fullscreen portlet
     * @returns {mPortlet}
     */
    the.fullscreen = function() {
        return Plugin.fullscreen('on');
    };

    /**
     * Fullscreen portlet
     * @returns {mPortlet}
     */
    the.unFullscreen = function() {
        return Plugin.fullscreen('off');
    };

    /**
     * Get portletbody 
     * @returns {jQuery}
     */
    the.getBody = function() {
        return Plugin.getBody();
    };

    /**
     * Get portletbody 
     * @returns {jQuery}
     */
    the.getSelf = function() {
        return Plugin.getSelf();
    };

    /**
     * Attach event
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Attach event that will be fired once
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    //== Construct plugin
    Plugin.construct.apply(the, [options]);

    return the;
};
// plugin setup
var mQuicksearch = function(elementId, options) {
    //== Main object
    var the = this;
    var init = false;

    //== Get element object
    var element = mUtil.get(elementId);
    var body = mUtil.get('body');  

    if (!element) {
        return;
    }

    //== Default options
    var defaultOptions = {
        mode: 'default', //'default/dropdown'
        minLength: 1,
        maxHeight: 300,
        requestTimeout: 200, // ajax request fire timeout in milliseconds 
        inputTarget: 'm_quicksearch_input',
        iconCloseTarget: 'm_quicksearch_close',
        iconCancelTarget: 'm_quicksearch_cancel',
        iconSearchTarget: 'm_quicksearch_search',
        
        spinnerClass: 'm-loader m-loader--skin-light m-loader--right',
        hasResultClass: 'm-list-search--has-result',
        
        templates: {
            error: '<div class="m-search-results m-search-results--skin-light"><span class="m-search-result__message">{{message}}</div></div>'
        }
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Construct
         */

        construct: function(options) {
            if (mUtil.data(element).has('quicksearch')) {
                the = mUtil.data(element).get('quicksearch');
            } else {
                // reset menu
                Plugin.init(options);

                // build menu
                Plugin.build();

                mUtil.data(element).set('quicksearch', the);
            }

            return the;
        },

        init: function(options) {
            the.element = element;
            the.events = [];

            // merge default and user defined options
            the.options = mUtil.deepExtend({}, defaultOptions, options);

            // search query
            the.query = '';

            // form
            the.form = mUtil.find(element, 'form');

            // input element
            the.input = mUtil.get(the.options.inputTarget);

            // close icon
            the.iconClose = mUtil.get(the.options.iconCloseTarget);

            if (the.options.mode == 'default') {
                // search icon
                the.iconSearch = mUtil.get(the.options.iconSearchTarget);

                // cancel icon
                the.iconCancel = mUtil.get(the.options.iconCancelTarget);
            }

            // dropdown
            the.dropdown = new mDropdown(element, {
                mobileOverlay: false
            });

            // cancel search timeout
            the.cancelTimeout;

            // ajax processing state
            the.processing = false;

            // ajax request fire timeout
            the.requestTimeout = false;
        },

        /**
         * Build plugin
         */
        build: function() {
            // attach input keyup handler
            mUtil.addEvent(the.input, 'keyup', Plugin.search);

            // Prevent enter click
            mUtil.find(element, "form").onkeypress = function(e) {
                var key = e.charCode || e.keyCode || 0;     
                if (key == 13) {
                    e.preventDefault();
                }
            }

            if (the.options.mode == 'default') {
                mUtil.addEvent(the.input, 'focus', Plugin.showDropdown);
                mUtil.addEvent(the.iconCancel, 'click', Plugin.handleCancel);

                mUtil.addEvent(the.iconSearch, 'click', function() {
                    if (mUtil.isInResponsiveRange('tablet-and-mobile')) {
                        mUtil.addClass(body, 'm-header-search--mobile-expanded');
                        the.input.focus();
                    }
                });

                mUtil.addEvent(the.iconClose, 'click', function() {
                    if (mUtil.isInResponsiveRange('tablet-and-mobile')) {
                        mUtil.removeClass(body, 'm-header-search--mobile-expanded');
                        Plugin.closeDropdown();
                    }
                });
            } else if (the.options.mode == 'dropdown') {
                the.dropdown.on('afterShow', function() {
                    the.input.focus();
                });

                mUtil.addEvent(the.iconClose, 'click', Plugin.closeDropdown);
            }
        },

        showProgress: function() {
            the.processing = true;
            mUtil.addClass(the.form, the.options.spinnerClass);
            Plugin.handleCancelIconVisibility('off');

            return the;
        },

        hideProgress: function() {
            the.processing = false;
            mUtil.removeClass(the.form, the.options.spinnerClass);
            Plugin.handleCancelIconVisibility('on');
            mUtil.addClass(element, the.options.hasResultClass);

            return the;
        },

        /**
         * Search handler
         */
        search: function(e) {
            the.query = the.input.value;

            if (the.query.length === 0) {
                Plugin.handleCancelIconVisibility('on');
                mUtil.removeClass(element, the.options.hasResultClass);
                mUtil.removeClass(the.form, the.options.spinnerClass);
            }

            if (the.query.length < the.options.minLength || the.processing == true) {
                return;
            }

            if (the.requestTimeout) {
                clearTimeout(the.requestTimeout);
            }

            the.requestTimeout = false;

            the.requestTimeout = setTimeout(function() {
                Plugin.eventTrigger('search');
            }, the.options.requestTimeout);            

            return the;
        },

        /**
         * Handle cancel icon visibility
         */
        handleCancelIconVisibility: function(status) {
            if (status == 'on') {
                if (the.input.value.length === 0) {
                    if (the.iconCancel) mUtil.css(the.iconCancel, 'visibility', 'hidden');
                    if (the.iconClose) mUtil.css(the.iconClose, 'visibility', 'visible');
                } else {
                    clearTimeout(the.cancelTimeout);
                    the.cancelTimeout = setTimeout(function() {
                        if (the.iconCancel) mUtil.css(the.iconCancel, 'visibility', 'visible');
                        if (the.iconClose) mUtil.css(the.iconClose, 'visibility', 'visible');
                    }, 500);
                }
            } else {
                if (the.iconCancel) mUtil.css(the.iconCancel, 'visibility', 'hidden');
                if (the.iconClose) mUtil.css(the.iconClose, 'visibility', 'hidden');
            }
        },

        /**
         * Cancel handler
         */
        handleCancel: function(e) {
            the.input.value = '';
            mUtil.css(the.iconCancel, 'visibility', 'hidden');
            mUtil.removeClass(element, the.options.hasResultClass);

            Plugin.closeDropdown();
        },

        /**
         * Cancel handler
         */
        closeDropdown: function() {
            the.dropdown.hide();
        },

        /**
         * Show dropdown
         */
        showDropdown: function(e) {
            if (the.dropdown.isShown() == false && the.input.value.length > the.options.minLength && the.processing == false) {
                console.log('show!!!');
                the.dropdown.show();
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }                
            }
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name) {
            //mUtil.triggerCustomEvent(name);
            for (i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            event.handler.call(this, the);
                        }
                    } else {
                        event.handler.call(this, the);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });

            return the;
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options 
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * quicksearch off 
     */
    the.search = function() {
        return Plugin.handleSearch();
    };

    the.showResult = function(res) {
        the.dropdown.setContent(res);
        Plugin.showDropdown();

        return the;
    };

    the.showError = function(text) {
        var msg = the.options.templates.error.replace('{{message}}', text);
        the.dropdown.setContent(msg);
        Plugin.showDropdown();

        return the;
    };

    /**
     *  
     */
    the.showProgress = function() {
        return Plugin.showProgress();
    };

    the.hideProgress = function() {
        return Plugin.hideProgress();
    };

    /**
     * quicksearch off 
     */
    the.search = function() {
        return Plugin.search();
    };

    /**
     * Attach event
     * @returns {mQuicksearch}
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Attach event that will be fired once
     * @returns {mQuicksearch}
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    //== Construct plugin
    Plugin.construct.apply(the, [options]);

    return the;
};
var mScrollTop = function(elementId, options) {
    //== Main object
    var the = this;
    var init = false;

    //== Get element object
    var element = mUtil.get(elementId);
    var body = mUtil.get('body');

    if (!element) {
        return;
    }

    //== Default options
    var defaultOptions = {
        offset: 300,
        speed: 600
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Run plugin
         * @returns {mscrolltop}
         */
        construct: function(options) {
            if (mUtil.data(element).has('scrolltop')) {
                the = mUtil.data(element).get('scrolltop');
            } else {
                // reset scrolltop
                Plugin.init(options);

                // build scrolltop
                Plugin.build();

                mUtil.data(element).set('scrolltop', the);
            }

            return the;
        },

        /**
         * Handles subscrolltop click toggle
         * @returns {mscrolltop}
         */
        init: function(options) {
            the.events = [];

            // merge default and user defined options
            the.options = mUtil.deepExtend({}, defaultOptions, options);
        },

        build: function() {
            // handle window scroll
            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                window.addEventListener('touchend', function() {
                    Plugin.handle();
                });

                window.addEventListener('touchcancel', function() {
                    Plugin.handle();
                });

                window.addEventListener('touchleave', function() {
                    Plugin.handle();
                });
            } else {
                window.addEventListener('scroll', function() { 
                    Plugin.handle();
                });
            }

            // handle button click 
            mUtil.addEvent(element, 'click', Plugin.scroll);
        },

        /**
         * Handles scrolltop click scrollTop
         */
        handle: function() {
            var pos = window.pageYOffset; // current vertical position
            if (pos > the.options.offset) {
                mUtil.addClass(body, 'm-scroll-top--shown');
            } else {
                mUtil.removeClass(body, 'm-scroll-top--shown');
            }
        },

        /**
         * Handles scrolltop click scrollTop
         */
        scroll: function(e) {
            e.preventDefault();

            mUtil.scrollTop(0, the.options.speed);
        },


        /**
         * Trigger events
         */
        eventTrigger: function(name, args) {
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            event.handler.call(this, the, args);
                        }
                    } else {
                        event.handler.call(this, the, args);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options 
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Get subscrolltop mode
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Set scrolltop content
     * @returns {mscrolltop}
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    ///////////////////////////////
    // ** Plugin Construction ** //
    ///////////////////////////////

    //== Run plugin
    Plugin.construct.apply(the, [options]);

    //== Init done
    init = true;

    // Return plugin instance
    return the;
};
// plugin setup
var mToggle = function(elementId, options) {
    //== Main object
    var the = this;
    var init = false;

    //== Get element object
    var element = mUtil.get(elementId);
    var body = mUtil.get('body');  

    if (!element) {
        return;
    }

    //== Default options
    var defaultOptions = {
        togglerState: '',
        targetState: ''
    };    

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Construct
         */

        construct: function(options) {
            if (mUtil.data(element).has('toggle')) {
                the = mUtil.data(element).get('toggle');
            } else {
                // reset menu
                Plugin.init(options);

                // build menu
                Plugin.build();

                mUtil.data(element).set('toggle', the);
            }

            return the;
        },

        /**
         * Handles subtoggle click toggle
         */
        init: function(options) {
            the.element = element;
            the.events = [];

            // merge default and user defined options
            the.options = mUtil.deepExtend({}, defaultOptions, options);

            the.target = mUtil.get(the.options.target);
            the.targetState = the.options.targetState;
            the.togglerState = the.options.togglerState;

            the.state = mUtil.hasClasses(the.target, the.targetState) ? 'on' : 'off';
        },

        /**
         * Setup toggle
         */
        build: function() {
            mUtil.addEvent(element, 'mouseup', Plugin.toggle);
        },
        
        /**
         * Handles offcanvas click toggle
         */
        toggle: function() {
            Plugin.eventTrigger('beforeToggle');
            
            if (the.state == 'off') {
                Plugin.toggleOn();
            } else {
                Plugin.toggleOff();
            }

            return the;
        },

        /**
         * Handles toggle click toggle
         */
        toggleOn: function() {
            Plugin.eventTrigger('beforeOn');

            mUtil.addClass(the.target, the.targetState);

            if (the.togglerState) {
                mUtil.addClass(element, the.togglerState);
            }

            the.state = 'on';

            Plugin.eventTrigger('afterOn');

            Plugin.eventTrigger('toggle');

            return the;
        },

        /**
         * Handles toggle click toggle
         */
        toggleOff: function() {
            Plugin.eventTrigger('beforeOff');

            mUtil.removeClass(the.target, the.targetState);

            if (the.togglerState) {
                mUtil.removeClass(element, the.togglerState);
            }

            the.state = 'off';

            Plugin.eventTrigger('afterOff');

            Plugin.eventTrigger('toggle');

            return the;
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name) {
            for (i = 0; i < the.events.length; i++) {
                var event = the.events[i];

                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;                            
                            event.handler.call(this, the);
                        }
                    } else {
                        event.handler.call(this, the);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });

            return the;
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options 
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Get toggle state 
     */
    the.getState = function() {
        return the.state;
    };

    /**
     * Toggle 
     */
    the.toggle = function() {
        return Plugin.toggle();
    };

    /**
     * Toggle on 
     */
    the.toggleOn = function() {
        return Plugin.toggleOn();
    };

    /**
     * Toggle off 
     */
    the.toggle = function() {
        return Plugin.toggleOff();
    };

    /**
     * Attach event
     * @returns {mToggle}
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Attach event that will be fired once
     * @returns {mToggle}
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    //== Construct plugin
    Plugin.construct.apply(the, [options]);

    return the;
};
// plugin setup
var mWizard = function(elementId, options) {
    //== Main object
    var the = this;
    var init = false;

    //== Get element object
    var element = mUtil.get(elementId);
    var body = mUtil.get('body');

    if (!element) {
        return; 
    }

    //== Default options
    var defaultOptions = {
        startStep: 1,
        manualStepForward: false
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Construct
         */

        construct: function(options) {
            if (mUtil.data(element).has('wizard')) {
                the = mUtil.data(element).get('wizard');
            } else {
                // reset menu
                Plugin.init(options);

                // build menu
                Plugin.build();

                mUtil.data(element).set('wizard', the);
            }

            return the;
        },

        /**
         * Init wizard
         */
        init: function(options) {
            the.element = element;
            the.events = [];

            // merge default and user defined options
            the.options = mUtil.deepExtend({}, defaultOptions, options);

            //== Elements
            the.steps = mUtil.findAll(element, '.m-wizard__step');

            the.progress = mUtil.find(element, '.m-wizard__progress .progress-bar');
            the.btnSubmit = mUtil.find(element, '[data-wizard-action="submit"]');
            the.btnNext = mUtil.find(element, '[data-wizard-action="next"]');
            the.btnPrev = mUtil.find(element, '[data-wizard-action="prev"]');
            the.btnLast = mUtil.find(element, '[data-wizard-action="last"]');
            the.btnFirst = mUtil.find(element, '[data-wizard-action="first"]');

            //== Variables
            the.events = [];
            the.currentStep = 1;
            the.stopped = false;
            the.totalSteps = the.steps.length;

            //== Init current step
            if (the.options.startStep > 1) {
                Plugin.goTo(the.options.startStep);
            }

            //== Init UI
            Plugin.updateUI();
        },

        /**
         * Build Form Wizard
         */
        build: function() {
            //== Next button event handler
            mUtil.addEvent(the.btnNext, 'click', function(e) {
                e.preventDefault();
                Plugin.goNext();
            });

            //== Prev button event handler
            mUtil.addEvent(the.btnPrev, 'click', function(e) {
                e.preventDefault();
                Plugin.goPrev();
            });

            //== First button event handler
            mUtil.addEvent(the.btnFirst, 'click', function(e) {
                e.preventDefault();
                Plugin.goFirst();
            });

            //== Last button event handler
            mUtil.addEvent(the.btnLast, 'click', function(e) {
                e.preventDefault();
                Plugin.goLast();
            });

            mUtil.on(element, '.m-wizard__step a.m-wizard__step-number', 'click', function() {
                var step = this.closest('.m-wizard__step');
                var steps = mUtil.parents(this, '.m-wizard__steps')
                var find = mUtil.findAll(steps, '.m-wizard__step');
                var num;

                for (var i = 0, j = find.length; i < j; i++) {
                    if (step === find[i]) {
                        num = (i + 1);
                        break;
                    }
                }

                if (num) {
                    if (the.options.manualStepForward === false) {
                        if (num < the.currentStep) {
                            Plugin.goTo(num);
                        }
                    } else {
                        Plugin.goTo(num);
                    }                    
                }
            });
        },

        /**
         * Handles wizard click wizard
         */
        goTo: function(number) {
            //== Skip if this step is already shown
            if (number === the.currentStep || number > the.totalSteps || number < 0) {
                return;
            }

            //== Validate step number
            if (number) {
                number = parseInt(number);
            } else {
                number = Plugin.getNextStep();
            }

            //== Before next and prev events
            var callback;

            if (number > the.currentStep) {
                callback = Plugin.eventTrigger('beforeNext');
            } else {
                callback = Plugin.eventTrigger('beforePrev');
            }
            
            //== Skip if stopped
            if (the.stopped === true) {
                the.stopped = false;
                return;
            }

            //== Continue if no exit
            if (callback !== false) {
                //== Before change
                Plugin.eventTrigger('beforeChange');

                //== Set current step 
                the.currentStep = number;

                //== Update UI
                Plugin.updateUI();

                //== Trigger change event
                Plugin.eventTrigger('change');
            }

            //== After next and prev events
            if (number > the.startStep) {
                Plugin.eventTrigger('afterNext');
            } else {
                Plugin.eventTrigger('afterPrev');
            }

            return the;
        },

        /**
         * Set step class
         */
        setStepClass: function() {
            if (Plugin.isLastStep()) {
                mUtil.addClass(element, 'm-wizard--step-last');
            } else {
                mUtil.removeClass(element, 'm-wizard--step-last');
            }

            if (Plugin.isFirstStep()) {
                mUtil.addClass(element, 'm-wizard--step-first');
            } else {
                mUtil.removeClass(element, 'm-wizard--step-first');
            }

            if (Plugin.isBetweenStep()) {
                mUtil.addClass(element, 'm-wizard--step-between');
            } else {
                mUtil.removeClass(element, 'm-wizard--step-between');
            }
        },

        updateUI: function(argument) {
            //== Update progress bar
            Plugin.updateProgress();

            //== Show current target content
            Plugin.handleTarget();

            //== Set classes
            Plugin.setStepClass();

            //== Apply nav step classes
            for (var i = 0, j = the.steps.length; i < j; i++) {
                mUtil.removeClass(the.steps[i], 'm-wizard__step--current m-wizard__step--done');
            }

            for (var i = 1; i < the.currentStep; i++) {
                mUtil.addClass(the.steps[i - 1], 'm-wizard__step--done');
            }
            
            mUtil.addClass(the.steps[the.currentStep - 1], 'm-wizard__step--current');
        },

        /**
         * Cancel
         */
        stop: function() {
            the.stopped = true;
        },

        /**
         * Resume
         */
        start: function() {
            the.stopped = false;
        },

        /**
         * Check last step
         */
        isLastStep: function() {
            return the.currentStep === the.totalSteps;
        },

        /**
         * Check first step
         */
        isFirstStep: function() {
            return the.currentStep === 1;
        },

        /**
         * Check between step
         */
        isBetweenStep: function() {
            return Plugin.isLastStep() === false && Plugin.isFirstStep() === false;
        },

        /**
         * Go to the next step
         */
        goNext: function() {
            return Plugin.goTo(Plugin.getNextStep());
        },

        /**
         * Go to the prev step
         */
        goPrev: function() {
            return Plugin.goTo(Plugin.getPrevStep());
        },

        /**
         * Go to the last step
         */
        goLast: function() {
            return Plugin.goTo(the.totalSteps);
        },

        /**
         * Go to the first step
         */
        goFirst: function() {
            return Plugin.goTo(1);
        },

        /**
         * Set progress
         */
        updateProgress: function() {
            //== Calculate progress position
            if (!the.progress) {
                return;
            }

            //== Update progress
            if (mUtil.hasClass(element, 'm-wizard--1')) {
                var width = 100 * ((the.currentStep - 1) / (the.totalSteps));
                var number = mUtil.find(element, '.m-wizard__step-number');
                var offset = parseInt(mUtil.css(number, 'width'));
                mUtil.css(the.progress, 'width', 'calc(' + width + '% + ' + (offset / 2) + 'px)');
            } else if (mUtil.hasClass(element, 'm-wizard--2')) {
                if (the.currentStep === 1) {
                    //return;
                }

                var progress = (the.currentStep - 1) * (100 * (1 / (the.totalSteps - 1)));

                if (mUtil.isInResponsiveRange('minimal-desktop-and-below')) {
                    mUtil.css(the.progress, 'height', progress + '%');
                } else {
                    mUtil.css(the.progress, 'width', progress + '%');
                }
            } else {
                var width = 100 * ((the.currentStep) / (the.totalSteps));
                mUtil.css(the.progress, 'width', width + '%');
            }
        },

        /**
         * Show/hide target content
         */
        handleTarget: function() {
            var step = the.steps[the.currentStep - 1];
            var target = mUtil.get(mUtil.attr(step, 'm-wizard-target'));
            var current = mUtil.find(element, '.m-wizard__form-step--current');
            
            mUtil.removeClass(current, 'm-wizard__form-step--current');
            mUtil.addClass(target, 'm-wizard__form-step--current');
        },

        /**
         * Get next step
         */
        getNextStep: function() {
            if (the.totalSteps >= (the.currentStep + 1)) {
                return the.currentStep + 1;
            } else {
                return the.totalSteps;
            }
        },

        /**
         * Get prev step
         */
        getPrevStep: function() {
            if ((the.currentStep - 1) >= 1) {
                return the.currentStep - 1;
            } else {
                return 1;
            }
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name) {
            //mUtil.triggerCustomEvent(name);
            for (i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            event.handler.call(this, the);
                        }
                    } else {
                        event.handler.call(this, the);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });

            return the;
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options 
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Go to the next step 
     */
    the.goNext = function() {
        return Plugin.goNext();
    };

    /**
     * Go to the prev step 
     */
    the.goPrev = function() {
        return Plugin.goPrev();
    };

    /**
     * Go to the last step 
     */
    the.goLast = function() {
        return Plugin.goLast();
    };

    /**
     * Cancel step 
     */
    the.stop = function() {
        return Plugin.stop();
    };

    /**
     * Resume step 
     */
    the.start = function() {
        return Plugin.start();
    };

    /**
     * Go to the first step 
     */
    the.goFirst = function() {
        return Plugin.goFirst();
    };

    /**
     * Go to a step
     */
    the.goTo = function(number) {
        return Plugin.goTo(number);
    };

    /**
     * Get current step number 
     */
    the.getStep = function() {
        return the.currentStep;
    };

    /**
     * Check last step 
     */
    the.isLastStep = function() {
        return Plugin.isLastStep();
    };

    /**
     * Check first step 
     */
    the.isFirstStep = function() {
        return Plugin.isFirstStep();
    };
    
    /**
     * Attach event
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Attach event that will be fired once
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    //== Construct plugin
    Plugin.construct.apply(the, [options]);

    return the;
};

var mLayout = function() {
  var header;
  var horMenu;
  var asideMenu;
  var asideMenuOffcanvas;
  var horMenuOffcanvas;
  var asideLeftToggle;
  var asideLeftHide;
  var scrollTop;
  var quicksearch;
  var mainPortlet;

  //== Header
  var initStickyHeader = function() {
    var tmp;
    var headerEl = mUtil.get('m_header');
    var options = {
      offset: {},
      minimize: {}
    };

    if (mUtil.attr(headerEl, 'm-minimize-mobile') == 'hide') {
      options.minimize.mobile = {};
      options.minimize.mobile.on = 'm-header--hide';
      options.minimize.mobile.off = 'm-header--show';
    } else {
      options.minimize.mobile = false;
    }

    if (mUtil.attr(headerEl, 'm-minimize') == 'hide') {
      options.minimize.desktop = {};
      options.minimize.desktop.on = 'm-header--hide';
      options.minimize.desktop.off = 'm-header--show';
    } else {
      options.minimize.desktop = false;
    }

    if (tmp = mUtil.attr(headerEl, 'm-minimize-offset')) {
      options.offset.desktop = tmp;
    }

    if (tmp = mUtil.attr(headerEl, 'm-minimize-mobile-offset')) {
      options.offset.mobile = tmp;
    }

    header = new mHeader('m_header', options);
  }

  //== Hor menu
  var initHorMenu = function() {
    // init aside left offcanvas
    horMenuOffcanvas = new mOffcanvas('m_header_menu', {
      overlay: true,
      baseClass: 'm-aside-header-menu-mobile',
      closeBy: 'm_aside_header_menu_mobile_close_btn',
      toggleBy: {
        target: 'm_aside_header_menu_mobile_toggle',
        state: 'm-brand__toggler--active'
      }
    });

    horMenu = new mMenu('m_header_menu', {
      submenu: {
        desktop: 'dropdown',
        tablet: 'accordion',
        mobile: 'accordion'
      },
      accordion: {
        slideSpeed: 200, // accordion toggle slide speed in milliseconds
        expandAll: false // allow having multiple expanded accordions in the menu
      }
    });
  }

  //== Aside menu
  var initLeftAsideMenu = function() {
    //== Init aside menu
    var menu = mUtil.get('m_ver_menu');
    var menuDesktopMode = (mUtil.attr(menu, 'm-menu-dropdown') === '1' ? 'dropdown' : 'accordion');

    var scroll;
    if (mUtil.attr(menu, 'm-menu-scrollable') === '1') {
      scroll = {
        height: function() {
          if (mUtil.isInResponsiveRange('desktop')) {
            return mUtil.getViewPort().height - parseInt(mUtil.css('m_header', 'height'));
          }
        }
      };
    }

    asideMenu = new mMenu('m_ver_menu', {
      // vertical scroll
      scroll: scroll,

      // submenu setup
      submenu: {
        desktop: {
          // by default the menu mode set to accordion in desktop mode
          default: menuDesktopMode,
          // whenever body has this class switch the menu mode to dropdown
          state: {
            body: 'm-aside-left--minimize',
            mode: 'dropdown'
          }
        },
        tablet: 'accordion', // menu set to accordion in tablet mode
        mobile: 'accordion' // menu set to accordion in mobile mode
      },

      //accordion setup
      accordion: {
        autoScroll: false, // enable auto scrolling(focus) to the clicked menu item
        expandAll: false // allow having multiple expanded accordions in the menu
      }
    });
  }

  //== Aside
  var initLeftAside = function() {
    // init aside left offcanvas
    var body = mUtil.get('body');
    var asideLeft = mUtil.get('m_aside_left');
    var asideOffcanvasClass = mUtil.hasClass(asideLeft, 'm-aside-left--offcanvas-default') ? 'm-aside-left--offcanvas-default' : 'm-aside-left';

    asideMenuOffcanvas = new mOffcanvas('m_aside_left', {
      baseClass: asideOffcanvasClass,
      overlay: true,
      closeBy: 'm_aside_left_close_btn',
      toggleBy: {
        target: 'm_aside_left_offcanvas_toggle',
        state: 'm-brand__toggler--active'
      }
    });

    //== Handle minimzied aside hover
    if (mUtil.hasClass(body, 'm-aside-left--fixed')) {
      var insideTm;
      var outsideTm;

      mUtil.addEvent(asideLeft, 'mouseenter', function() {
        if (outsideTm) {
          clearTimeout(outsideTm);
          outsideTm = null;
        }

        insideTm = setTimeout(function() {
          if (mUtil.hasClass(body, 'm-aside-left--minimize') && mUtil.isInResponsiveRange('desktop')) {
            mUtil.removeClass(body, 'm-aside-left--minimize');
            mUtil.addClass(body, 'm-aside-left--minimize-hover');
            asideMenu.scrollerUpdate();
            asideMenu.scrollerTop();
          }
        }, 300);
      });

      mUtil.addEvent(asideLeft, 'mouseleave', function() {
        if (insideTm) {
          clearTimeout(insideTm);
          insideTm = null;
        }

        outsideTm = setTimeout(function() {
          if (mUtil.hasClass(body, 'm-aside-left--minimize-hover') && mUtil.isInResponsiveRange('desktop')) {
            mUtil.removeClass(body, 'm-aside-left--minimize-hover');
            mUtil.addClass(body, 'm-aside-left--minimize');
            asideMenu.scrollerUpdate();
            asideMenu.scrollerTop();
          }
        }, 500);
      });
    }
  }

  //== Sidebar toggle
  var initLeftAsideToggle = function() {
    if ($('#m_aside_left_minimize_toggle').length === 0) {
      return;
    }

    asideLeftToggle = new mToggle('m_aside_left_minimize_toggle', {
      target: 'body',
      targetState: 'm-brand--minimize m-aside-left--minimize',
      togglerState: 'm-brand__toggler--active'
    });

    asideLeftToggle.on('toggle', function(toggle) {

      // if (mUtil.get('main_portlet')) {
      //   mainPortlet.updateSticky();
      // }

      horMenu.pauseDropdownHover(800);
      asideMenu.pauseDropdownHover(800);

      //== Remember state in cookie
      Cookies.set('sidebar_toggle_state', toggle.getState());
      // to set default minimized left aside use this cookie value in your
      // server side code and add "m-brand--minimize m-aside-left--minimize" classes to
      // the body tag in order to initialize the minimized left aside mode during page loading.
    });

    asideLeftToggle.on('beforeToggle', function(toggle) {
      var body = mUtil.get('body');
      if (mUtil.hasClass(body, 'm-aside-left--minimize') === false && mUtil.hasClass(body, 'm-aside-left--minimize-hover')) {
        mUtil.removeClass(body, 'm-aside-left--minimize-hover');
      }
    });
  }

  //== Sidebar hide
  var initLeftAsideHide = function() {
    if ($('#m_aside_left_hide_toggle').length === 0 ) {
      return;
    }

    initLeftAsideHide = new mToggle('m_aside_left_hide_toggle', {
      target: 'body',
      targetState: 'm-aside-left--hide',
      togglerState: 'm-brand__toggler--active'
    });

    initLeftAsideHide.on('toggle', function(toggle) {
      horMenu.pauseDropdownHover(800);
      asideMenu.pauseDropdownHover(800);

      //== Remember state in cookie
      Cookies.set('sidebar_hide_state', toggle.getState());
      // to set default minimized left aside use this cookie value in your
      // server side code and add "m-brand--minimize m-aside-left--minimize" classes to
      // the body tag in order to initialize the minimized left aside mode during page loading.
    });
  }

  //== Topbar
  var initTopbar = function() {
    $('#m_aside_header_topbar_mobile_toggle').click(function() {
      $('body').toggleClass('m-topbar--on');
    });

    // Animated Notification Icon
    /*
    setInterval(function() {
        $('#m_topbar_notification_icon .m-nav__link-icon').addClass('m-animate-shake');
        $('#m_topbar_notification_icon .m-nav__link-badge').addClass('m-animate-blink');
    }, 3000);

    setInterval(function() {
        $('#m_topbar_notification_icon .m-nav__link-icon').removeClass('m-animate-shake');
        $('#m_topbar_notification_icon .m-nav__link-badge').removeClass('m-animate-blink');
    }, 6000);
    */
  }

  //== Quicksearch
  var initQuicksearch = function() {
    if ($('#m_quicksearch').length === 0) {
      return;
    }

    quicksearch = new mQuicksearch('m_quicksearch', {
      mode: mUtil.attr('m_quicksearch', 'm-quicksearch-mode'), // quick search type
      minLength: 1
    });

    //<div class="m-search-results m-search-results--skin-light"><span class="m-search-result__message">Something went wrong</div></div>

    quicksearch.on('search', function(the) {
      the.showProgress();

      $.ajax({
        url: 'https://keenthemes.com/metronic/themes/themes/metronic/dist/preview/inc/api/quick_search.php',
        data: {
          query: the.query
        },
        dataType: 'html',
        success: function(res) {
          the.hideProgress();
          the.showResult(res);
        },
        error: function(res) {
          the.hideProgress();
          the.showError('Connection error. Pleae try again later.');
        }
      });
    });
  }

  //== Scrolltop
  var initScrollTop = function() {
    var scrollTop = new mScrollTop('m_scroll_top', {
      offset: 300,
      speed: 600
    });
  }

  //== Main portlet(sticky portlet)
  var createMainPortlet = function() {
    return new mPortlet('main_portlet', {
      sticky: {
        offset: parseInt(mUtil.css( mUtil.get('m_header'), 'height')),
        zIndex: 90,
        position: {
          top: function() {
            return parseInt(mUtil.css( mUtil.get('m_header'), 'height') );
          },
          left: function() {
            var left = parseInt(mUtil.css( mUtil.getByClass('m-content'), 'paddingLeft'));

            if (mUtil.isInResponsiveRange('desktop')) {
              //left += parseInt(mUtil.css(mUtil.get('m_aside_left'), 'width') );
              if (mUtil.hasClass(mUtil.get('body'), 'm-aside-left--minimize')) {
                left += 78; // need to use hardcoded width of the minimize aside
              } else {
                left += 40; // need to use hardcoded width of the aside
              }
            }

            return left;
          },
          right: function() {
            // return parseInt(mUtil.css( mUtil.getByClass('m-content'), 'paddingRight') );
            return 40;
          }
        }
      }
    });
  }

  return {
    init: function() {
      this.initHeader();
      this.initAside();
      this.initMainPortlet();
    },

    initMainPortlet: function() {

      if (!mUtil.get('main_portlet')) {
        return;
      }

      mainPortlet = createMainPortlet();
      mainPortlet.initSticky();

      mUtil.addResizeHandler(function(){
        mainPortlet.updateSticky();
      });
    },

    resetMainPortlet: function() {
      mainPortlet.destroySticky();
      mainPortlet = createMainPortlet();
      mainPortlet.initSticky();
    },

    initHeader: function() {
      initStickyHeader();
      initHorMenu();
      initTopbar();
      initQuicksearch();
      initScrollTop();
    },

    initAside: function() {
      initLeftAside();
      initLeftAsideMenu();
      initLeftAsideToggle();
      initLeftAsideHide();

      this.onLeftSidebarToggle(function(e) {
        //== Update sticky portlet
        if (mainPortlet) {
          mainPortlet.updateSticky();
        }

        //== Reload datatable
        var datatables = $('.m-datatable');
        if (datatables) {
          datatables.each(function() {
            $(this).mDatatable('redraw');
          });
        }
      });
    },

    getAsideMenu: function() {
      return asideMenu;
    },

    onLeftSidebarToggle: function(handler) {
      if (asideLeftToggle) {
        asideLeftToggle.on('toggle', handler);
      }
    },

    closeMobileAsideMenuOffcanvas: function() {
      if (mUtil.isMobileDevice()) {
        asideMenuOffcanvas.hide();
      }
    },

    closeMobileHorMenuOffcanvas: function() {
      if (mUtil.isMobileDevice()) {
        horMenuOffcanvas.hide();
      }
    }
  };
}();

$(document).ready(function() {
    mLayout.init();
});

var mQuickSidebar = function() {
    var topbarAside = $('#m_quick_sidebar');
    var topbarAsideTabs = $('#m_quick_sidebar_tabs');    
    var topbarAsideContent = topbarAside.find('.m-quick-sidebar__content');

    var initMessages = function() {
        var messages = mUtil.find( mUtil.get('m_quick_sidebar_tabs_messenger'),  '.m-messenger__messages'); 
        var form = $('#m_quick_sidebar_tabs_messenger .m-messenger__form');

        mUtil.scrollerInit(messages, {
            disableForMobile: true, 
            resetHeightOnDestroy: false, 
            handleWindowResize: true, 
            height: function() {
                var height = topbarAside.outerHeight(true) - 
                    topbarAsideTabs.outerHeight(true) - 
                    form.outerHeight(true) - 120;

                return height;                    
            }
        });
    }

    var initSettings = function() { 
        var settings = mUtil.find( mUtil.get('m_quick_sidebar_tabs_settings'),  '.m-list-settings'); 

        if (!settings) {
            return;
        }

        mUtil.scrollerInit(settings, {
            disableForMobile: true, 
            resetHeightOnDestroy: false, 
            handleWindowResize: true, 
            height: function() {
                return mUtil.getViewPort().height - topbarAsideTabs.outerHeight(true) - 60;            
            }
        });
    }

    var initLogs = function() {
        var logs = mUtil.find( mUtil.get('m_quick_sidebar_tabs_logs'),  '.m-list-timeline'); 

        if (!logs) {
            return;
        }

        mUtil.scrollerInit(logs, {
            disableForMobile: true, 
            resetHeightOnDestroy: false, 
            handleWindowResize: true, 
            height: function() {
                return mUtil.getViewPort().height - topbarAsideTabs.outerHeight(true) - 60;            
            }
        });
    }

    var initOffcanvasTabs = function() {
        initMessages();
        initSettings();
        initLogs();
    }

    var initOffcanvas = function() {
        var topbarAsideObj = new mOffcanvas('m_quick_sidebar', {
            overlay: true,  
            baseClass: 'm-quick-sidebar',
            closeBy: 'm_quick_sidebar_close',
            toggleBy: 'm_quick_sidebar_toggle'
        });   

        // run once on first time dropdown shown
        topbarAsideObj.one('afterShow', function() {
            mApp.block(topbarAside);

            setTimeout(function() {
                mApp.unblock(topbarAside);
                
                topbarAsideContent.removeClass('m--hide');

                initOffcanvasTabs();
            }, 1000);                         
        });
    }

    return {     
        init: function() {  
            if (topbarAside.length === 0) {
                return;
            }

            initOffcanvas(); 
        }
    };
}();

$(document).ready(function() {
    mQuickSidebar.init();
});
