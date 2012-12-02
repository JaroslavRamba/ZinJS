/**
 * @namespace Root namespace for ZinJS
 */
zinjs = {
    /**
     * @namespace [description]
     */
    core: {},
    /**
     * @namespace [description]
     */
    info: {},
    /**
     * @namespace [description]
     */
    util: {}
};

/////////////////////////////////////////////////////////////////////////////////////////
// Helpers///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * Extend function to simulate an inheritance of classes.
 *
 * @function
 *
 * @param {Function} ancestor Ancestor of a function to which we applied this method.
 *
 * @return {Function} Function with inherited methods of an ancestor.
 */
Function.prototype.extend = function(ancestor)
{
    var F = function() {};
    F.prototype = ancestor.prototype;
    this.prototype = new F();
    this.prototype.constructor = this;
    this._superproto = ancestor.prototype;
    return this;
};

/**
 * Simulate modulus behavior.
 *
 * @function
 *
 * @param {Number} n Represent a number, which we use as a modulo.
 *
 * @return {Number} Return remainder.
 */
Number.prototype.mod = function(n)
{
    return ((this%n)+n)%n;
};

/////////////////////////////////////////////////////////////////////////////////////////
// Utilities ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * Clone function, which make a deep copy of an object.
 *
 * @function
 * @memberOf zinjs.util
 * @public
 *
 * @param {Object} object
 *
 * @return {Object}
 */
zinjs.util.clone = function(object)
{
    if (object === null || typeof(object) != 'object') {
        return object;
    }

    var temp = new object.constructor();

    for (var key in object) {
        temp[key] = zinjs.util.clone(object[key]);
    }

    return temp;
};

/**
 * [computeWindowScale description]
 *
 * @function
 * @memberOf zinjs.util
 * @public
 *
 * @param {Object} config
 *
 * @return {Number}
 */
zinjs.util.computeWindowScale = function(config)
{
    var hScale = zinjs.info.height / config.height;
    var wScale = zinjs.info.width / config.width;
    var scale = hScale > wScale ? wScale : hScale;

    if (config.maxScale && scale > config.maxScale) {
        scale = config.maxScale;
    }

    if (config.minScale && scale < config.minScale) {
        scale = config.minScale;
    }

    return scale;
};

/////////////////////////////////////////////////////////////////////////////////////////
// Core /////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * [init description]
 *
 * @function
 * @memberOf zinjs.core
 * @public
 */
zinjs.core.init = function()
{
    if (zinjs.info.initialized === false) {
        $('body').css({
            height: "100%",
            overflow: "hidden"
        });

        var style = new zinjs.Styles();
        style.addCss({
            position: "absolute",
            transformOrigin: "top left",
            transition: "all 0s ease-in-out",
            transformStyle: "preserve-3d",
            transitionProperty: 'all',
            transitionTimingFunction: 'ease'
        });

        var canvasScale = $('<div id="zinjsScale"></div>').prependTo($('body'));
        $('#zinjs').attr('id', 'zinjsTranslate').prependTo(canvasScale);

        zinjs.info.canvasScale = new zinjs.Container('#zinjsScale', style);
        zinjs.info.canvasTranslate = new zinjs.Container('#zinjsTranslate', style);

        zinjs.info.canvasScale.addCss({
            top: "50%",
            left: "50%",
            transitionDuration: '0.8s',
            transitionDelay: '0.2s',
            transformOrigin: '50% 50%'
        });
        zinjs.info.canvasTranslate.addCss({
            top: "0%",
            left: "0%",
            transitionDuration: '1s',
            transitionDelay: '0s',
            transformOrigin: '50% 50%'
        });

        var windowScale = zinjs.util.computeWindowScale(zinjs.info.config);

        zinjs.info.canvasScale.addCss({
            transform: {
                scale: windowScale
            },
            perspective: zinjs.info.config.perspective/windowScale
        });
        zinjs.info.canvasTranslate.addCss({
            transform: {
                translate: 0 + 'px,' + 0 +'px'
            }
        });

        zinjs.core.movingWithCanvas(true);
        zinjs.core.keysHandler(true);

        zinjs.info.initialized = true;
    }
};

/**
 * [plugins description]
 *
 * @memberOf zinjs.core
 * @public
 *
 * @type {Array}
 */
zinjs.core.plugins = [];

/**
 * [pluginType description]
 *
 * @memberOf zinjs.core
 * @public
 *
 * @type {Object}
 */
zinjs.core.pluginType = {
    /**
     * [EVENT description]
     *
     * @constant
     * @memberOf zinjs.core.pluginType
     * @public
     *
     * @type {String}
     */
    EVENT: "event",
    /**
     * [ACTION description]
     *
     * @constant
     * @memberOf zinjs.core.pluginType
     * @public
     *
     * @type {String}
     */
    ACTION: "action",
    /**
     * [COMPONENT description]
     *
     * @constant
     * @memberOf zinjs.core.pluginType
     * @public
     *
     * @type {String}
     */
    COMPONENT: "component"
};

/**
 * [PluginPrototype description]
 *
 * @class
 * @constructor
 * @memberOf zinjs.core
 *
 * @param {String} name    [description]
 * @param {zinjs.core.pluginType} type    [description]
 * @param {Function} content [description]
 */
zinjs.core.PluginPrototype = function(name, type, content)
{
    /**
     * [name description]
     *
     * @memberOf zinjs.core.PluginPrototype
     * @public
     *
     * @type {String}
     */
    this.name = name;
    /**
     * [type description]
     *
     * @memberOf zinjs.core.PluginPrototype
     * @public
     *
     * @type {zinjs.core.pluginType}
     */
    this.type = type;
    /**
     * [content description]
     *
     * @memberOf zinjs.core.PluginPrototype
     * @public
     *
     * @type {Function}
     */
    this.content = content;
};

/**
 * [isPluginLoaded description]
 *
 * @function
 * @memberOf zinjs.core
 * @public
 *
 * @param {zinjs.core.PluginPrototype} plugin [description]
 *
 * @return {Boolean} [description]
 */
zinjs.core.isPluginLoaded = function(plugin)
{
    function compare(plugin1, plugin2)
    {
        if (plugin1 instanceof(zinjs.core.PluginPrototype) && plugin2 instanceof(zinjs.core.PluginPrototype)) {
            if (plugin1.name !== plugin2.name) {
                return false;
            }
            if (plugin1.type !== plugin2.type) {
                return false;
            }
            return true;
        }
        return false;
    }

    if (plugin instanceof(zinjs.core.PluginPrototype)) {
        for (var i in zinjs.core.plugins) {
            if (compare(zinjs.core.plugins[i], plugin)) {
                console.log("Plugin '" + plugin.name + "' already exists.");
                return true;
            }
        }
        return false;
    }
};

/**
 * [loadPlugin description]
 *
 * @function
 * @memberOf zinjs.core
 * @public
 *
 * @param {String} pluginPath [description]
 */
zinjs.core.loadPlugin =  function(pluginPath)
{
    var xmlhttp = false;

    /*@cc_on @*/
    /*@if (@_jscript_version >= 5)
    try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    @end @*/

    if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
        try {
            xmlhttp = new XMLHttpRequest();
        } catch (e) {
            xmlhttp=false;
            console.log(e);
        }
    }

    if (!xmlhttp && window.createRequest) {
        try {
            xmlhttp = window.createRequest();
        } catch (e) {
            xmlhttp = false;
            console.log(e);
        }
    }

    if (!xmlhttp)
        console.log("Sorry XMLHttpRequest is not implemented.");

    function addPlugin(plugin)
    {
        if (plugin instanceof zinjs.core.PluginPrototype && !zinjs.core.isPluginLoaded(plugin)) {
            switch(plugin.type) {
                case zinjs.core.pluginType.ACTION:
                    eval("zinjs.AbstractComponent.prototype." + plugin.name + " = plugin.content");
                    break;
                case zinjs.core.pluginType.COMPONENT:
                    eval(plugin.content.name + " = plugin.content");
                    plugin.content.prototype = new zinjs.AbstractComponent();
                    break;
                case zinjs.core.pluginType.EVENT:
                    eval("zinjs.AbstractComponent.prototype." + plugin.name + " = null");
                    eval(plugin.content + "(zinjs.AbstractComponent.prototype)");
                    break;
            }
            zinjs.core.plugins.push(plugin);
        }
    }

    function onReceive(pluginData)
    {
        var data = eval(pluginData);
        if (data === undefined || !(data instanceof Object)) {
            return;
        }
        else if (data instanceof Array) {
            for (var i in data) {
                addPlugin(data[i]);
            }
        }
        else {
            addPlugin(data);
        }
    }

    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4) {
            onReceive(xmlhttp.responseText);
        }
    };

    xmlhttp.open("GET", pluginPath+".js", false);
    xmlhttp.send();
};

/**
 * [movingWithCanvas description]
 *
 * @function
 * @memberOf zinjs.core
 * @public
 *
 * @param {Boolean} enable [description]
 */
zinjs.core.movingWithCanvas = function(enable)
{
    if(enable === true) {
        $(document).on('mousedown', function(e){
            if(e.which === 1) {
                e.preventDefault();
                zinjs.info.mouse.x = e.clientX;
                zinjs.info.mouse.y = e.clientY;
                zinjs.info.mouse.leftButtonDown = true;
            }
        });

        $(document).on('mouseup', function(e){
            if(e.which === 1 && zinjs.info.mouse.leftButtonDown) {
                zinjs.info.mouse.leftButtonDown = false;
                zinjs.info.mouse.canvasMoving = false;
            }
        });

        $(document).on('mousemove', function(e){
            if(zinjs.info.mouse.leftButtonDown) {
                zinjs.info.mouse.canvasMoving = true;

                var sc = zinjs.info.canvas.scale();
                var xx = zinjs.info.canvas.x();
                var yy = zinjs.info.canvas.y();
                var xCh = (zinjs.info.mouse.x - e.clientX) / sc;
                var yCh = (zinjs.info.mouse.y - e.clientY) / sc;

                if (xCh > 0) {
                    xCh = Math.ceil(xCh);
                }
                if (xCh < 0) {
                    xCh = Math.floor(xCh);
                }
                if (yCh > 0) {
                    yCh = Math.ceil(yCh);
                }
                if (yCh < 0) {
                    yCh = Math.floor(yCh);
                }

                zinjs.info.canvasTranslate.addCss({
                    transitionDuration: '0s',
                    transform: {
                        translate: (xx - xCh) + 'px,' + (yy - yCh) +'px'
                    }
                });

                zinjs.info.mouse.x = e.clientX;
                zinjs.info.mouse.y = e.clientY;
            }
        });
    } else if(enable === false) {
        $(document).off('mousedown mousemove mouseup');
    }
};

/**
 * [keysHandler description]
 *
 * @function
 * @memberOf zinjs.core
 * @public
 *
 * @param {Boolean} enable [description]
 */
zinjs.core.keysHandler = function(enable)
{
    if(enable === true) {
        $(document).on('keydown', function(e) {
            if(e.keyCode === 27 || e.keyCode === 37 || e.keyCode === 39) {
                if(zinjs.info.zoomArea === null && zinjs.info.zoomAreas.length > 0) {
                    zinjs.info.zoomAreas[0].zoomIn();
                }
                if(e.keyCode == 37) { // left
                    zinjs.info.zoomArea.prev();
                }
                if(e.keyCode == 39) { // right
                    zinjs.info.zoomArea.next();
                }
                if(e.keyCode == 27) { // esc
                    zinjs.info.zoomArea.zoomOut();
                }
            }
        });
    } else if(enable === false) {
        $(document).off('keydown');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Info /////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * [width description]
 *
 * @memberOf zinjs.info
 * @public
 *
 * @type {Number}
 */
zinjs.info.width = $(window).width();
/**
 * [height description]
 *
 * @memberOf zinjs.info
 * @public
 *
 * @type {Number}
 */
zinjs.info.height = $(window).height();

/**
 * [isMobile description]
 *
 * @constant
 * @memberOf zinjs.info
 * @public
 *
 * @type {Boolean}
 */
zinjs.info.isMobile = (function(){
    if (navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/BlackBerry/i)) {
        return true;
    }
    return false;
})();

/**
 * [config description]
 *
 * @memberOf zinjs.info
 * @public
 *
 * @type {Object}
 */
zinjs.info.config = {
    /**
     * [width description]
     *
     * @memberOf zinjs.info.config
     * @public
     *
     * @type {Number}
     */
    width: 1024,
    /**
     * [height description]
     *
     * @memberOf zinjs.info.config
     * @public
     *
     * @type {Number}
     */
    height: 768,
    /**
     * [maxScale description]
     *
     * @memberOf zinjs.info.config
     * @public
     *
     * @type {Number}
     */
    maxScale: 1,
    /**
     * [minScale description]
     *
     * @memberOf zinjs.info.config
     * @public
     *
     * @type {Number}
     */
    minScale: 0,
    /**
     * [perspective description]
     *
     * @memberOf zinjs.info.config
     * @public
     *
     * @type {Number}
     */
    perspective: 1000
};

/**
 * [mouse description]
 *
 * @memberOf zinjs.info
 * @public
 *
 * @type {Object}
 */
zinjs.info.mouse = {
    /**
     * [x description]
     *
     * @description updated by zinjs.core.movingWithCanvas
     * @memberOf zinjs.info.mouse
     * @public
     *
     * @type {Number}
     */
    x: 0,
    /**
     * [y description]
     *
     * @description updated by zinjs.core.movingWithCanvas
     * @memberOf zinjs.info.mouse
     * @public
     *
     * @type {Number}
     */
    y: 0,
    /**
     * [leftButtonDown description]
     *
     * @description updated by zinjs.core.movingWithCanvas
     * @memberOf zinjs.info.mouse
     * @public
     *
     * @type {Boolean}
     */
    leftButtonDown: false,
    /**
     * [canvasMoving description]
     *
     * @description updated by zinjs.core.movingWithCanvas
     * @memberOf zinjs.info.mouse
     * @public
     *
     * @type {Boolean}
     */
    canvasMoving: false
};

/**
 * [canvas description]
 *
 * @memberOf zinjs.info
 *
 * @type {Object}
 */
zinjs.info.canvas = {
    /**
     * [scale description]
     *
     * @function
     * @memberOf zinjs.info.canvas
     * @public
     *
     * @return {Number} [description]
     */
    scale: function() {
        return zinjs.info.canvasScale.getStyles().getCss()['transform']['scale'];
    },
    /**
     * [x description]
     *
     * @function
     * @memberOf zinjs.info.canvas
     * @public
     *
     * @return {Number} [description]
     */
    x: function() {
        var trans = zinjs.info.canvasTranslate.getStyles().getCss()['transform']['translate'];
        return parseInt(trans.split(',')[0], 10);
    },
    /**
     * [y description]
     *
     * @function
     * @memberOf zinjs.info.canvas
     * @public
     *
     * @return {Number} [description]
     */
    y: function() {
        var trans = zinjs.info.canvasTranslate.getStyles().getCss()['transform']['translate'];
        return parseInt(trans.split(',')[1], 10);
    },
    /**
     * [rotateX description]
     *
     * @function
     * @memberOf zinjs.info.canvas
     * @public
     *
     * @return {Number} [description]
     */
    rotateX: function() {
        return parseInt(zinjs.info.canvasTranslate.getStyles().getCss()['transform']['rotateX'], 10);
    },
    /**
     * [rotateY description]
     *
     * @function
     * @memberOf zinjs.info.canvas
     * @public
     *
     * @return {Number} [description]
     */
    rotateY: function() {
        return parseInt(zinjs.info.canvasTranslate.getStyles().getCss()['transform']['rotateY'], 10);
    },
    /**
     * [rotateZ description]
     *
     * @function
     * @memberOf zinjs.info.canvas
     * @public
     *
     * @return {Number} [description]
     */
    rotateZ: function() {
        return parseInt(zinjs.info.canvasTranslate.getStyles().getCss()['transform']['rotateZ'], 10);
    }
};

/**
 * [initialized description]
 *
 * @memberOf zinjs.info
 * @public
 *
 * @type {Boolean}
 */
zinjs.info.initialized = false;
/**
 * [canvasScale description]
 *
 * @memberOf zinjs.info
 * @public
 *
 * @type {zinjs.Container}
 */
zinjs.info.canvasScale = null;
/**
 * [canvasTranslate description]
 *
 * @memberOf zinjs.info
 * @public
 *
 * @type {zinjs.Container}
 */
zinjs.info.canvasTranslate = null;
/**
 * [zoomArea description]
 *
 * @memberOf zinjs.info
 * @public
 *
 * @type {zinjs.ZoomArea}
 */
zinjs.info.zoomArea = null;
/**
 * [zoomAreas description]
 *
 * @memberOf zinjs.info
 * @public
 *
 * @type {Array}
 */
zinjs.info.zoomAreas = [];

/////////////////////////////////////////////////////////////////////////////////////////
// AbstractComponent ////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * [AbstractComponent description]
 *
 * @class [description]
 * @constructor
 * @memberOf zinjs
 *
 * @param {String} selector [description]
 * @param {zinjs.Styles} style    [description]
 */
zinjs.AbstractComponent = function(selector, style)
{
    /**
     * [_node description]
     *
     * @memberOf zinjs.AbstractComponent
     * @private
     *
     * @type {JQuery element}
     */
    this._node = $(selector);
    /**
     * [_ancestor description]
     *
     * @memberOf zinjs.AbstractComponent
     * @private
     *
     * @type {zinjs.AbstractComponent}
     */
    this._ancestor = null;
    /**
     * [_children description]
     *
     * @memberOf zinjs.AbstractComponent
     * @private
     *
     * @type {Array}
     */
    this._children = [];
    /**
     * [_styles description]
     *
     * @memberOf zinjs.AbstractComponent
     * @private
     *
     * @type {zinjs.Styles}
     */
    this._styles = null;
    if (style instanceof zinjs.Styles) {
        this._styles = zinjs.util.clone(style);
        this._writeCss();
    } else {
        this._styles = new zinjs.Styles();
    }
};

/**
 * [find description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @param {String} selector [description]
 *
 * @return {JQuery element} [description]
 */
zinjs.AbstractComponent.prototype.find = function(selector)
{
    return this._node.find(selector);
};

/**
 * [render description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @return {JQuery element} [description]
 */
zinjs.AbstractComponent.prototype.render = function()
{
    return this._node;
};

/**
 * [getStyles description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @return {zinjs.Styles} [description]
 */
zinjs.AbstractComponent.prototype.getStyles = function()
{
    return this._styles;
};

/**
 * [setAncestor description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @param {zinjs.AbstractComponent} component [description]
 *
 * @return {zinjs.AbstractComponent} [description]
 */
zinjs.AbstractComponent.prototype.setAncestor = function(component)
{
    if (this._ancestor) {
        var kids = this._ancestor.getChildren();
        kids.splice(kids.indexOf(this), 1);
    }
    if (component instanceof zinjs.AbstractComponent) {
        this._ancestor = component;
        this._ancestor.getChildren().push(this);
    } else {
        console.log('fail');
        this._ancestor = null;
    }
    return this;
};

/**
 * [getAncestor description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @return {zinjs.AbstractComponent} [description]
 */
zinjs.AbstractComponent.prototype.getAncestor = function()
{
    return this._ancestor;
};

/**
 * [addChild description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @return {zinjs.AbstractComponent} [description]
 */
zinjs.AbstractComponent.prototype.addChild = function()
{
    for (var i in arguments) {
        arguments[i].setAncestor(this);
    }
    return this;
};

/**
 * [getChildren description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @return {Array} [description]
 */
zinjs.AbstractComponent.prototype.getChildren = function()
{
    return this._children;
};

/**
 * [addCss description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @param {Object} properties [description]
 * @param {Boolean} overwrite  [description]
 *
 * @return {zinjs.AbstractComponent} [description]
 */
zinjs.AbstractComponent.prototype.addCss = function(properties, overwrite)
{
    if (arguments.length == 1) {
        overwrite = true;
    }
    this._styles.addCss(properties, overwrite);
    this._writeCss();
    return this;
};

/**
 * [clearCss description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @param {Object} properties [description]
 *
 * @return {zinjs.AbstractComponent} [description]
 */
zinjs.AbstractComponent.prototype.clearCss = function(properties)
{
    if (arguments.length === 0) {
        this._styles.clearCss();
    }
    else {
        this._styles.clearCss(properties);
    }
    this._writeCss();
    return this;
};

/**
 * [newCss description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @param {zinjs.Styles} style [description]
 *
 * @return {zinjs.AbstractComponent} [description]
 */
zinjs.AbstractComponent.prototype.newCss = function(style)
{
    if (style instanceof zinjs.Styles) {
        delete this._styles;
        this._styles = zinjs.util.clone (style);
        this._writeCss();
    }
    return this;
};

/**
 * [_writeCss description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @private
 */
zinjs.AbstractComponent.prototype._writeCss = function()
{
    var properties = this._styles.getCss();
    var data;
    for (var type in properties) {
        if (properties[type] instanceof Object) {
            data = "";
            for (var item in properties[type]) {
                data += item + "(" +  properties[type][item] + ") ";
            }
            this._node.css(type, data);
        }
        else {
            this._node.css(type, properties[type]);
        }
    }
    if (properties.length === 0) {
        node.removeAttribute("style");
    }
};

/////////////////////////////////////////////////////////////////////////////////////////
// AbstractComponent Events /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * [hover description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @return {zinjs.AbstractComponent} [description]
 */
zinjs.AbstractComponent.prototype.hover = function()
{
    this._node.off('mouseenter mouseleave');
    if (arguments.length === 1) {
        this._node.on('mouseenter mouseleave', {
            cmp: this
        }, arguments[0]);
    }
    else if (arguments.length === 2) {
        this._node.on('mouseenter', {
            cmp: this
        }, arguments[0]);
        this._node.on('mouseleave', {
            cmp: this
        }, arguments[1]);
    }
    return this;
};

/**
 * [click description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @param {Function} handler [description]
 *
 * @return {zinjs.AbstractComponent} [description]
 */
zinjs.AbstractComponent.prototype.click = function(handler)
{
    this._node.off('click');
    if (arguments.length === 1) {
        this._node.on('click', {
            cmp: this
        }, handler);
    }
    return this;
};

/**
 * [move description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @param {Function} handler [description]
 *
 * @return {zinjs.AbstractComponent} [description]
 */
zinjs.AbstractComponent.prototype.move = function(handler)
{
    this._node.off('mousemove');
    if (arguments.length === 1) {
        this._node.on('mousemove', {
            cmp: this
        }, handler);
    }
    return this;
};

/**
 * [doubleClick description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @param {Function} handler [description]
 *
 * @return {zinjs.AbstractComponent} [description]
 */
zinjs.AbstractComponent.prototype.doubleClick = function(handler)
{
    this._node.off('dblclick');
    if (arguments.length === 1) {
        this._node.on('dblclick', {
            cmp: this
        }, handler);
    }
    return this;
};

/**
 * [wheel description]
 *
 * @method [name]
 * @methodOf zinjs.AbstractComponent
 * @public
 *
 * @return {zinjs.AbstractComponent} [description]
 */
zinjs.AbstractComponent.prototype.wheel = function()
{ //TODO
    var wheelTop = arguments[0];
    var wheelDown = arguments[1];

    var tmp = function() {
        if (!event){
            event = window.event;
        }

        if (event.wheelDelta) {
            delta = event.wheelDelta / 60;
        } else if (event.detail) {
            delta = -event.detail / 2;
        }

        if (delta >= 0) {
            wheelTop();
            console.log('Scroll up');
        }
        else {
            wheelDown();
            console.log('Scroll down');
        }
    };

    this._node.off('mousewheel DOMMouseScroll');
    this._node.on('mousewheel DOMMouseScroll', {
        cmp: this
    }, tmp);

    return this;
};

/////////////////////////////////////////////////////////////////////////////////////////
// Container ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * [Container description]
 *
 * @class [description]
 * @constructor
 * @extends {zinjs.AbstractComponent}
 *
 * @param {String} selector [description]
 * @param {zinjs.Styles} style    [description]
 */
zinjs.Container = function(selector, style)
{
    zinjs.AbstractComponent.call(this, selector, style);
};

zinjs.Container.extend(zinjs.AbstractComponent);

/**
 * [createContainer description]
 *
 * @function
 * @memberOf zinjs
 * @public
 *
 * @param {String} selector [description]
 * @param {zinjs.Styles} style    [description]
 *
 * @return {zinjs.Container} [description]
 */
zinjs.createContainer = function(selector, style)
{
    return new zinjs.Container(selector, style);
};

/////////////////////////////////////////////////////////////////////////////////////////
// ZoomArea /////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * [ZoomArea description]
 *
 * @class [description]
 * @constructor
 * @extends {zinjs.AbstractComponent}
 *
 * @param {String} id    [description]
 * @param {zinjs.Styles} style [description]
 * @param {Number} x     [description]
 * @param {Number} y     [description]
 */
zinjs.ZoomArea = function(id, style, x, y)
{
    zinjs.AbstractComponent.call(this, id, style);
    /**
     * [_elem description]
     *
     * @memberOf zinjs.ZoomArea
     * @private
     *
     * @type {DOM element}
     */
    this._elem = this._node.get(0);
    /**
     * [_active description]
     *
     * @memberOf zinjs.ZoomArea
     * @private
     *
     * @type {Boolean}
     */
    this._active = false;
    /**
     * [x description]
     *
     * @memberOf zinjs.ZoomArea
     * @private
     *
     * @type {Number}
     */
    this._x = x;
    /**
     * [y description]
     *
     * @memberOf zinjs.ZoomArea
     * @private
     *
     * @type {Number}
     */
    this._y = y;
    zinjs.info.zoomAreas.push(this);
    /**
     * [id description]
     *
     * @memberOf zinjs.ZoomArea
     * @private
     *
     * @type {Number}
     */
    this._id = zinjs.info.zoomAreas.length-1;
    this._init(this._x, this._y);
};

zinjs.ZoomArea.extend(zinjs.AbstractComponent);

/**
 * [createZoomArea description]
 *
 * @function
 * @memberOf zinjs
 * @public
 *
 * @param {String} id    [description]
 * @param {zinjs.Styles} style [description]
 * @param {Number} x     [description]
 * @param {Number} y     [description]
 *
 * @return {zinjs.ZoomArea} [description]
 */
zinjs.createZoomArea = function(id, style, x, y)
{
    return new zinjs.ZoomArea(id, style, x, y);
};

/**
 * [_init description]
 *
 * @method [name]
 * @methodOf zinjs.ZoomArea
 * @private
 *
 * @param   {Number} x             [description]
 * @param   {Number} y             [description]
 */
zinjs.ZoomArea.prototype._init = function(x, y)
{
    this.addCss({
        transform: {
            translate3d: x + 'px, ' + y + 'px, 0px'
        },
        cursor: 'pointer'
    });
    var area = this;
    this._node.on('mouseup', function(e) {
        area.zoomIn();
    });
};

/**
 * [getId description]
 *
 * @method [name]
 * @methodOf zinjs.ZoomArea
 * @public
 *
 * @return {Number} [description]
 */
zinjs.ZoomArea.prototype.getId = function()
{
    return this._id;
};

/**
 * [isActive description]
 *
 * @method [name]
 * @methodOf zinjs.ZoomArea
 * @public
 *
 * @return {Boolean} [description]
 */
zinjs.ZoomArea.prototype.isActive = function()
{
    return this._active;
};

/**
 * [_writeToCanvases description]
 *
 * @method [name]
 * @methodOf zinjs.ZoomArea
 * @private
 *
 * @param   {Object} properties    [description]
 */
zinjs.ZoomArea.prototype._writeToCanvases = function(properties)
{
    if (properties === null || properties === undefined) {
        properties = {};
    }
    if (properties.x === null || properties.x === undefined || isNaN(properties.x)) {
        properties.x = 0;
    }
    if (properties.y === null || properties.y === undefined || isNaN(properties.y)) {
        properties.y = 0;
    }
    if (properties.scale === null || properties.scale === undefined || isNaN(properties.scale)) {
        properties.scale = 1;
    }
    if (properties.rotateX === null || properties.rotateX === undefined || isNaN(properties.rotateX)) {
        properties.rotateX = 0;
    }
    if (properties.rotateY === null || properties.rotateY === undefined || isNaN(properties.rotateY)) {
        properties.rotateY = 0;
    }
    if (properties.rotateZ === null || properties.rotateZ === undefined || isNaN(properties.rotateZ)) {
        properties.rotateZ = 0;
    }

    zinjs.info.canvasTranslate.addCss({
        transitionDuration: '1s',
        transform: {
            translate: -properties.x + 'px,' + -properties.y +'px',
            rotateX: -properties.rotateX + 'deg',
            rotateY: -properties.rotateY + 'deg',
            rotateZ: -properties.rotateZ + 'deg'
        }
    });
    
    //rotate with rotate control of controlPanel
    var rotatePanel = new zinjs.Container($("#controlPanel .rotate"));
    rotatePanel.addCss({
        transitionDuration: '1s',
        transform: {
            rotateZ: -properties.rotateZ + 'deg'
        }
    });
    
    
    zinjs.info.canvasScale.addCss({
        transitionDuration: '0.8s',
        transitionDelay: '0.2s',
        transform: {
            scale: properties.scale
        },
        perspective: zinjs.info.config.perspective / properties.scale
    });
};

/**
 * [zoomIn description]
 *
 * @method [name]
 * @methodOf zinjs.ZoomArea
 * @public
 */
zinjs.ZoomArea.prototype.zoomIn = function()
{
    if (!zinjs.info.mouse.canvasMoving) {
        if (zinjs.info.zoomArea !== null) {
            zinjs.info.zoomArea._active = false;
        }

        var x = this._x;
        var y = this._y;
        var scale;
        var sc = this._styles._css['transform']['scale'];
        var rX = parseInt(this._styles._css['transform']['rotateX'], 10);
        var rY = parseInt(this._styles._css['transform']['rotateY'], 10);
        var rZ = parseInt(this._styles._css['transform']['rotateZ'], 10);

        if (sc !== null && sc !== undefined && !isNaN(sc)) {
            scale = (1/sc) * zinjs.util.computeWindowScale(zinjs.info.config);
        }
        else {
            scale = zinjs.util.computeWindowScale(zinjs.info.config);
        }

        this._writeToCanvases({
            x: x,
            y: y,
            scale: scale,
            rotateX: rX,
            rotateY: rY,
            rotateZ: rZ
        });
        //set controlPanel zoom control pan
        $("div.ui-slider").slider( "option","value",scale*10);
        this._active = true;
        zinjs.info.zoomArea = this;
    }
};

/**
 * [zoomOut description]
 *
 * @method [name]
 * @methodOf zinjs.ZoomArea
 * @public
 */
zinjs.ZoomArea.prototype.zoomOut = function()
{
    this._active = false;
    zinjs.info.zoomArea = null;
    this._writeToCanvases();
};

/**
 * [prev description]
 *
 * @method [name]
 * @methodOf zinjs.ZoomArea
 * @public
 */
zinjs.ZoomArea.prototype.prev = function()
{
    var i = (this._id - 1).mod(zinjs.info.zoomAreas.length);
    zinjs.info.zoomAreas[i].zoomIn();
};

/**
 * [next description]
 *
 * @method [name]
 * @methodOf zinjs.ZoomArea
 * @public
 */
zinjs.ZoomArea.prototype.next = function()
{
    var i = (this._id + 1).mod(zinjs.info.zoomAreas.length);
    zinjs.info.zoomAreas[i].zoomIn();
};

/////////////////////////////////////////////////////////////////////////////////////////
// MultiScaleImage //////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * [MultiScaleImage description]
 *
 * @class [description]
 * @constructor
 * @extends {zinjs.AbstractComponent}
 *
 * @param {String} selector [description]
 * @param {zinjs.Styles} style    [description]
 * @param {Array} images   [description]
 */
zinjs.MultiScaleImage = function(selector, style, images)
{
    // TODO -- Experimental -- images=new Array({url:'',scale:1},{url:'',scale:2})
    zinjs.AbstractComponent.call(this, selector, style);
    /**
     * [images description]
     *
     * @memberOf zinjs.MultiScaleImage
     * @private
     *
     * @type {Array}
     */
    this._images = images;
    this._init();
};

zinjs.MultiScaleImage.extend(zinjs.AbstractComponent);

/**
 * [_init description]
 *
 * @method [name]
 * @methodOf zinjs.MultiScaleImage
 * @private
 *
 * @return  {[type]} [description]
 */
zinjs.MultiScaleImage.prototype._init = function()
{
    var node = this;
    if(node._node[0].children.length>0) {
        this.image = new zinjs.Container(selector+' img', style);
    }
    else {
        var tmp = document.createElement('img');
        this._node[0].appendChild(tmp);
        this.image = new zinjs.Container(selector+' img', style);
        this.image._node[0].src = this._images[0].url;
    }

    node.scale = 1;
    var events = new Array("transitionEnd","webkitTransitionEnd","msTransitionEnd","transitionend","oTransitionEnd");
    for(var i = 0;i<events.length;i++) {
        node.image._node[0].addEventListener(events[i],function(e) {
            node.image.addCss({
                transitionDuration: '0s'
            });
            node.image.addCss({
                transform: {
                    scale: 1
                }
            });
            node.image._node[0].src = node.nextimg;
        }, false);
    }
};

/**
 * [createMultiScaleImage description]
 *
 * @function
 * @memberOf zinjs
 * @public
 *
 * @param {String} selector [description]
 * @param {zinjs.Styles} style    [description]
 *
 * @return {zinjs.MultiScaleImage} [description]
 */
zinjs.createMultiScaleImage = function(selector, style)
{
    return new zinjs.MultiScaleImage(selector, style);
};

/**
 * [zoomLevel description]
 *
 * @method [name]
 * @methodOf zinjs.MultiScaleImage
 * @public
 *
 * @param {Number} level [description]
 */
zinjs.MultiScaleImage.prototype.zoomLevel = function(level)
{
    var imgarg = this._images[level-1];
    this.nextimg = imgarg.url;
    var scale = this.scale;
    this.image.addCss({
        transitionDuration: '1.2s'
    });
    this.image.addCss({
        transform: {
            scale: imgarg.scale/scale
        }
    });
    this.scale = imgarg.scale;
};

/////////////////////////////////////////////////////////////////////////////////////////
// Styles ///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * [Styles description]
 *
 * @class [description]
 * @constructor
 */
zinjs.Styles = function()
{
    /**
     * [_css description]
     *
     * @memberOf zinjs.Styles
     * @private
     *
     * @type {Object}
     */
    this._css = {};
};

/**
 * [getCss description]
 *
 * @method [name]
 * @methodOf zinjs.Styles
 * @public
 *
 * @return {Object} [description]
 */
zinjs.Styles.prototype.getCss = function()
{
    return this._css;
};

/**
 * [addCss description]
 *
 * @method [name]
 * @methodOf zinjs.Styles
 * @public
 *
 * @param {Object} properties [description]
 * @param {Boolean} overwrite  [description]
 *
 * @return {zinjs.Styles} [description]
 */
zinjs.Styles.prototype.addCss = function(properties , overwrite)
{
    if (arguments.length == 1) {
        overwrite = true;
    }
    for (var type in properties) {
        if (properties[type] instanceof Object) {
            if (!this._css[type]) {
                this._css[type] = properties[type];
            }
            for (var item in properties[type]) {
                if (overwrite || !this._css[type][item]) {
                    this._css[type][item] = properties[type][item];
                }
                else {
                    console.log(type.toString() + " " + item.toString() + " not rewritable");
                }
            }
        }
        else {
            if (overwrite || !this._css[type]) {
                this._css[type] = properties[type];
            }
            else {
                console.log(type.toString() + " not rewritable");
            }
        }
    }
    return this;
};

/**
 * [clearCss description]
 *
 * @method [name]
 * @methodOf zinjs.Styles
 * @public
 *
 * @param {Object} properties [description]
 *
 * @return {zinjs.Styles} [description]
 */
zinjs.Styles.prototype.clearCss = function(properties)
{
    var type;
    if (arguments.length === 0) {
        for (type in this._css) {
            delete this._css[type];
        }
    }
    else if (arguments.length == 1) {
        if (typeof(properties) === 'string' || properties instanceof String) {
            properties = new Array(properties);
        }
        for (type in properties) {
            var inside = properties[type].split("-");
            if (this._css[inside[0]]) {
                if (inside.length == 1) {
                    delete this._css[inside[0]];
                }
                else if (inside.length == 2) {
                    if (this._css[inside[0]][inside[1]]) {
                        delete this._css[inside[0]][inside[1]];
                    }
                    if (this._css[inside[0]].length === 0) {
                        delete this._css[inside[0]];
                    }
                }
            }
        }
    }
    else {
        console.log("zinjs.Styles clearCss has bad parameters");
    }
    return this;
};

/**
 * [showCss description]
 *
 * @method [name]
 * @methodOf zinjs.Styles
 * @public
 *
 * @return {zinjs.Styles} [description]
 */
zinjs.Styles.prototype.showCss = function()
{
    console.log("Style:");
    for (var type in this._css) {
        console.log(type + ": " + this._css[type]);
        if (this._css[type] instanceof Object) {
            for (var type2 in this._css[type]) {
                console.log(type2 + ": " + this._css[type][type2]);
            }
        }
    }
    return this;
};

/////////////////////////////////////////////////////////////////////////////////////////
// Listeners ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * [windowResized description]
 */
function windowResized()
{
    zinjs.info.width = $(window).width();
    zinjs.info.height = $(window).height();
    if (zinjs.info.zoomArea) {
        zinjs.info.zoomArea.zoomIn();
    }
}

$(window).bind("resize", windowResized);
