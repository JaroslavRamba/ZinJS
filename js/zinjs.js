zinjs = {
    core: {},
    info: {},
    util: {}
};

/////////////////////////////////////////////////////////////////////////////////////////
// helpers///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

Function.prototype.extend = function(ancestor)
{
    var F = function() {};
    F.prototype = ancestor.prototype;
    this.prototype = new F();
    this.prototype.constructor = this;
    this._superproto = ancestor.prototype;
};

/////////////////////////////////////////////////////////////////////////////////////////
// core /////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

zinjs.core.plugins = [];

zinjs.core.pluginType = {
    EVENT: "event",
    ACTION: "action",
    COMPONENT: "component"
};

zinjs.core.PluginPrototype = function(name, type, content)
{
    this.name = name;
    this.type = type;
    this.content = content;
};

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

/////////////////////////////////////////////////////////////////////////////////////////
// info /////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

zinjs.info.width = $(window).width();

zinjs.info.height = $(window).height();

zinjs.info.isMobile = (function()
{
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/BlackBerry/i)) {
        return true;
    }
    return false;
})();

zinjs.info.zoomLevel = 1;

/////////////////////////////////////////////////////////////////////////////////////////
// AbstractComponent ////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

zinjs.AbstractComponent = function(selector, style)
{
    this._node = $(selector);
    this._ancestor = null;
    this._children = [];
    if (style instanceof zinjs.Styles) {
        this._styles = zinjs.util.clone(style);
        this._writeCss();
    } else {
        this._styles = new zinjs.Styles();
    }
};

zinjs.AbstractComponent.prototype.find = function(selector)
{
    return this._node.find(selector);
};

zinjs.AbstractComponent.prototype.render = function()
{
    return this._node;
};

zinjs.AbstractComponent.prototype.setAncestor = function(component)
{
    this._ancestor = component;
    component.getChildren().push(this);
    return this;
};

zinjs.AbstractComponent.prototype.getAncestor = function()
{
    return this._ancestor;
};

zinjs.AbstractComponent.prototype.addChild = function()
{
    for (var i in arguments) {
        arguments[i].setAncestor(this);
    }
    return this;
};

zinjs.AbstractComponent.prototype.getChildren = function()
{
    return this._children;
};

zinjs.AbstractComponent.prototype.addCss = function(properties, overwrite)
{
    if (arguments.length == 1) {
        overwrite = true;
    }
    this._styles.addCss(properties, overwrite);
    this._writeCss();
    return this;
};

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

zinjs.AbstractComponent.prototype.newCss = function(x)
{
    if (x instanceof zinjs.Styles) {
        delete this._styles;
        this._styles = zinjs.util.clone (x);
        this._writeCss();
    }
    return this;
};

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

zinjs.AbstractComponent.prototype.hover = function()
{
    this._node.off('mouseenter mouseleave');
    if (arguments.length === 1) {
        this._node.on('mouseenter mouseleave', {cmp: this}, arguments[0]);
    }
    else if (arguments.length === 2) {
        this._node.on('mouseenter', {cmp: this}, arguments[0]);
        this._node.on('mouseleave', {cmp: this}, arguments[1]);
    }
    return this;
};

zinjs.AbstractComponent.prototype.click = function(handler)
{
    this._node.off('click');
    if (arguments.length === 1) {
        this._node.on('click', {cmp: this}, handler);
    }
    return this;
};

/////////////////////////////////////////////////////////////////////////////////////////
// Container ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

zinjs.Container = function(selector, style)
{
    zinjs.AbstractComponent.call(this, selector, style);
};

zinjs.Container.extend(zinjs.AbstractComponent);

zinjs.createContainer = function(selector, style)
{
    return new zinjs.Container(selector, style);
};

/////////////////////////////////////////////////////////////////////////////////////////
// ZoomArea /////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

// TODO

zinjs.ZoomArea = function(selector, style)
{
    zinjs.AbstractComponent.call(this, selector, style);
};

zinjs.ZoomArea.extend(zinjs.AbstractComponent);

zinjs.createZoomArea = function(selector, style)
{
    return new zinjs.ZoomArea(selector, style);
};

/////////////////////////////////////////////////////////////////////////////////////////
// ExtremeZoomImage /////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

// TODO

zinjs.ExtremeZoomImage = function(selector, style)
{
    zinjs.AbstractComponent.call(this, selector, style);
};

zinjs.ExtremeZoomImage.extend(zinjs.AbstractComponent);

zinjs.createExtremeZoomImage = function(selector, style)
{
    return new zinjs.ExtremeZoomImage(selector, style);
};

/////////////////////////////////////////////////////////////////////////////////////////
// ExtremeZoomImage /////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

// TODO

zinjs.MultiScaleImage = function(selector, style)
{
    zinjs.AbstractComponent.call(this, selector, style);
};

zinjs.MultiScaleImage.extend(zinjs.AbstractComponent);

zinjs.createMultiScaleImage = function(selector, style)
{
    return new zinjs.MultiScaleImage(selector, style);
};

/////////////////////////////////////////////////////////////////////////////////////////
// ControlPanel /////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

// TODO

zinjs.ControlPanel = function(selector, style)
{
    zinjs.AbstractComponent.call(this, selector, style);
};

zinjs.ControlPanel.extend(zinjs.AbstractComponent);

zinjs.createControlPanel = function(selector, style)
{
    return new zinjs.ControlPanel(selector, style);
};

/////////////////////////////////////////////////////////////////////////////////////////
// Styles ///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

zinjs.Styles = function()
{
    this._css = {};
};

zinjs.Styles.prototype.getCss = function()
{
    return this._css;
};

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
            if (!this._css[type]) {
                this._css[type] = properties[type];
            }
            else {
                if (overwrite) {
                    this._css[type] = properties[type];
                }
                else {
                    console.log(type.toString() + " not rewritable");
                }
            }
        }
    }
    return this;
};

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
// utilities ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

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

zinjs.util.magnify = function(pageOffsetX, pageOffsetY, elementOffsetX, elementOffsetY, scale)
{
    // if( supportsTransforms ) {
        var origin = pageOffsetX +'px '+ pageOffsetY +'px',
            transform = 'translate('+ -elementOffsetX +'px,'+ -elementOffsetY +'px) scale('+ scale +')';

            $('body').css('transformOrigin', origin);
            $('body').css('transform', transform);
    // }
    // else {
    //     // Reset all values
    //     if( scale === 1 ) {
    //         document.body.style.position = '';
    //         document.body.style.left = '';
    //         document.body.style.top = '';
    //         document.body.style.width = '';
    //         document.body.style.height = '';
    //         document.body.style.zoom = '';
    //     }
    //     // Apply scale
    //     else {
    //         document.body.style.position = 'relative';
    //         document.body.style.left = ( - ( pageOffsetX + elementOffsetX ) / scale ) + 'px';
    //         document.body.style.top = ( - ( pageOffsetY + elementOffsetY ) / scale ) + 'px';
    //         document.body.style.width = ( scale * 100 ) + '%';
    //         document.body.style.height = ( scale * 100 ) + '%';
    //         document.body.style.zoom = scale;
    //     }
    // }

    zinjs.info.zoomLevel = scale;
};

zinjs.util.getScrollOffset = function ()
{
    return {
        x: window.scrollX !== undefined ? window.scrollX : window.pageXOffset,
        y: window.scrollY !== undefined ? window.scrollY : window.pageXYffset
    };
};

zinjs.util.zoomIn = function(options)
{
    if(zinjs.info.zoomLevel !== 1) {
        zinjs.util.zoomOut();
    }
    else {
        options.x = options.x || 0;
        options.y = options.y || 0;

        if( !!options.element ) {
            options.padding = options.padding || 20;
            options.width = options.element.getBoundingClientRect().width + ( options.padding * 2 );
            options.height = options.element.getBoundingClientRect().height + ( options.padding * 2 );
            options.x = options.element.getBoundingClientRect().left - options.padding;
            options.y = options.element.getBoundingClientRect().top - options.padding;
        }

        if( options.width !== undefined && options.height !== undefined ) {
            options.scale = Math.max( Math.min( window.innerWidth / options.width, window.innerHeight / options.height ), 1 );
        }

        if( options.scale > 1 ) {
            options.x *= options.scale;
            options.y *= options.scale;

            var scrollOffset = zinjs.util.getScrollOffset();
            zinjs.util.magnify(scrollOffset.x, scrollOffset.y, options.x, options.y, options.scale);
        }
    }
};

zinjs.util.zoomOut = function()
{
    var scrollOffset = zinjs.util.getScrollOffset();
    zinjs.util.magnify(scrollOffset.x, scrollOffset.y, 0, 0, 1);
    zinjs.info.zoomLevel = 1;
};

/////////////////////////////////////////////////////////////////////////////////////////
// listeners ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

function windowResized()
{
    zinjs.info.height = $(window).height();
    zinjs.info.width = $(window).width();
}

$(window).bind("resize", windowResized);
