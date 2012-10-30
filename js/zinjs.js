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

Number.prototype.mod = function(n)
{
    return ((this%n)+n)%n;
};

/////////////////////////////////////////////////////////////////////////////////////////
// core /////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

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

        zinjs.info.canvasScale = new zinjs.Container('#canvas1', style);
        zinjs.info.canvasTranslate = new zinjs.Container('#canvas2', style);

        zinjs.info.canvasScale.addCss({
            top: "50%",
            left: "50%",
            transitionDuration: '0.8s',
            transitionDelay: '0.2s'
        });
        zinjs.info.canvasTranslate.addCss({
            transitionDuration: '1s',
            transitionDelay: '0s'
        });

        var windowScale = zinjs.util.computeWindowScale(zinjs.info.config);

        zinjs.info.canvasScale.addCss({
            transform: {
                perspective: zinjs.info.config.perspective/windowScale,
                scale: windowScale
            }
        });
        zinjs.info.canvasTranslate.addCss({
            transform: {
                translate: 0 + 'px,' + 0 +'px'
            }
        });

        zinjs.info.initialized = true;
    }
};

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

zinjs.info.config = {
    width: 1024,
    height: 768,
    maxScale: 1,
    minScale: 0,
    perspective: 1000,
    transitionDuration: 1000
};

zinjs.info.initialized = false;
zinjs.info.canvasScale = null;
zinjs.info.canvasTranslate = null;
zinjs.info.zoomArea = null;
zinjs.info.zoomAreas = [];

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

// DOING - EXPERIMENTALNI

zinjs.ZoomArea = function(id, style, x, y)
{
    zinjs.AbstractComponent.call(this, id, style);
    this._elem = this._node.get(0);
    this._active = false;
    this.x = x;
    this.y = y;
    zinjs.info.zoomAreas.push(this);
    this.id = zinjs.info.zoomAreas.length-1;
    this._init(this.x, this.y);
};

zinjs.ZoomArea.extend(zinjs.AbstractComponent);

zinjs.createZoomArea = function(id, style, x, y)
{
    return new zinjs.ZoomArea(id, style, x, y);
};

zinjs.ZoomArea.prototype._init = function(x, y)
{
    this.addCss({
        transform: {
            translate3d: x + 'px, ' + y + 'px, 0px'
        },
        cursor: 'pointer'
    });
    this.click(function(event) {
        event.preventDefault();
        event.data.cmp.zoomIn();
    });
};

zinjs.ZoomArea.prototype._writeToCanvases = function(properties)
{
    if (properties === null || properties === undefined) {properties = {};}
    if (properties.x === null || properties.x === undefined || isNaN(properties.x)) {properties.x = 0;}
    if (properties.y === null || properties.y === undefined || isNaN(properties.y)) {properties.y = 0;}
    if (properties.scale === null || properties.scale === undefined || isNaN(properties.scale)) {properties.scale = 1;}
    if (properties.rotateX === null || properties.rotateX === undefined || isNaN(properties.rotateX)) {properties.rotateX = 0;}
    if (properties.rotateY === null || properties.rotateY === undefined || isNaN(properties.rotateY)) {properties.rotateY = 0;}
    if (properties.rotateZ === null || properties.rotateZ === undefined || isNaN(properties.rotateZ)) {properties.rotateZ = 0;}

    zinjs.info.canvasTranslate.addCss({
        transform: {
            translate: -properties.x + 'px,' + -properties.y +'px',
            rotateX: -properties.rotateX + 'deg',
            rotateY: -properties.rotateY + 'deg',
            rotateZ: -properties.rotateZ + 'deg'
        }
    });

    zinjs.info.canvasScale.addCss({
        transform: {
            perspective: zinjs.info.config.perspective / properties.scale,
            scale: properties.scale
        }
    });
};

zinjs.ZoomArea.prototype.zoomIn = function()
{
    if (zinjs.info.zoomArea !== null) {
        zinjs.info.zoomArea._active = false;
    }
    // var elemRect = this._elem.getBoundingClientRect();
    // var width = elemRect.width;
    // var height = elemRect.height ;
    var x = this.x;
    var y = this.y;
    var scale;
    var sc = this._styles._css['transform']['scale'];
    var rX = parseInt(this._styles._css['transform']['rotateX'], 10);
    var rY = parseInt(this._styles._css['transform']['rotateY'], 10);
    var rZ = parseInt(this._styles._css['transform']['rotateZ'], 10);
    // var optsc = Math.max( Math.min( zinjs.info.width / width, zinjs.info.height / height ), 1 );
    if (sc !== null && sc !== undefined && !isNaN(sc)) {
        scale = (1/sc) * zinjs.util.computeWindowScale(zinjs.info.config);
        // scale = (1/sc) * optsc;
    }
    else {
        scale = zinjs.util.computeWindowScale(zinjs.info.config);
        // scale = optsc;
    }

    this._writeToCanvases({
        x: x,
        y: y,
        scale: scale,
        rotateX: rX,
        rotateY: rY,
        rotateZ: rZ
    });
    this._active = true;
    zinjs.info.zoomArea = this;
};

zinjs.ZoomArea.prototype.zoomOut = function()
{
    this._active = false;
    zinjs.info.zoomArea = null;
    this._writeToCanvases();
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
// MultiScaleImage //////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

// TODO -- Experimental
//images=new Array({url:'',scale:1},{url:'',scale:2})
zinjs.MultiScaleImage = function(selector, style, images)
{
    this.images = images;
    zinjs.AbstractComponent.call(this, selector, style);
    var node = this;
    if(node._node[0].children.length>0) {
        this.image = new zinjs.Container(selector+' img', style);
    }
    else {
        var tmp = document.createElement('img');
        this._node[0].appendChild(tmp);
        this.image = new zinjs.Container(selector+' img', style);
        this.image._node[0].src = this.images[0].url;
    }

    node.scale = 1;
    var events = new Array("transitionEnd","webkitTransitionEnd","msTransitionEnd","transitionend","oTransitionEnd");
    for(var i = 0;i<events.length;i++) {
        node.image._node[0].addEventListener(events[i],function(e) {
            node.image.addCss({transitionDuration: '0s'});
            node.image.addCss({transform: {
                scale: 1
            }});
            node.image._node[0].src = node.nextimg;
        }, false);
    }
};

zinjs.MultiScaleImage.extend(zinjs.AbstractComponent);

//level 1,2,3,4
zinjs.MultiScaleImage.prototype.zoomLevel = function(level)
{
    var imgarg = this.images[level-1];
    this.nextimg = imgarg.url;
    var scale = this.scale;
    this.image.addCss({transitionDuration: '1.2s'});
    this.image.addCss({transform: {
        scale: imgarg.scale/scale
    }});
    this.scale = imgarg.scale;
};

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

zinjs.util.getScrollOffset = function ()
{
    return {
        x: window.scrollX !== undefined ? window.scrollX : window.pageXOffset,
        y: window.scrollY !== undefined ? window.scrollY : window.pageXYffset
    };
};

zinjs.util.computeWindowScale = function ( config ) {
    var hScale = zinjs.info.height / config.height,
    wScale = zinjs.info.width / config.width,
    scale = hScale > wScale ? wScale : hScale;

    if (config.maxScale && scale > config.maxScale) {
        scale = config.maxScale;
    }

    if (config.minScale && scale < config.minScale) {
        scale = config.minScale;
    }

    return scale;
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

$(document).ready(function() {
    zinjs.core.init();
});

// EXPERIMENTAL KEYDOWN FOR ZOOMAREAS
$(window).keydown(function(e) {
    if(e.keyCode === 27) {
        zinjs.info.zoomArea.zoomOut();
    }
    else if(e.keyCode === 37 || e.keyCode === 39) {
        if(zinjs.info.zoomArea === null) {
            if(zinjs.info.zoomAreas.length > 0) {
                zinjs.info.zoomAreas[0].zoomIn();
            }
        }
        else {
            var i = zinjs.info.zoomArea.id;
            var length = zinjs.info.zoomAreas.length;
            if(e.keyCode == 37) { // left
                i = (--i).mod(length);
                zinjs.info.zoomAreas[i].zoomIn();
            }
            else if(e.keyCode == 39) { // right
                i = (++i).mod(length);
                zinjs.info.zoomAreas[i].zoomIn();
            }
        }
    }
});

// EXPERIMENTAL MOUSE MOVE
$(document).ready(function() {
    var mouseX = 0,
    mouseY = 0,
    leftButtonDown = false;

    $(document).mousedown(function(e){
        if(e.which === 1) {
            e.preventDefault();
            leftButtonDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    $(document).mouseup(function(e){
        if(e.which === 1) leftButtonDown = false;
    });

    $(document).mousemove(function(e) {
        if (leftButtonDown) {
            var xCh = mouseX -  e.clientX;
            var yCh = mouseY - e.clientY ;
            var trans = zinjs.info.canvasTranslate._styles._css['transform']['translate'];
            var transArr = trans.split(',');
            var xx = parseInt(transArr[0], 10);
            var yy = parseInt(transArr[1], 10);
            mouseX = e.clientX;
            mouseY = e.clientY;

            // console.log("change ( " + xCh + ", " + yCh + " )");
            // console.log("prev ( " + xx + ", " + yy + " )");
            // console.log("next ( " + (xx + xCh) + ", " + (yy + yCh) + " )");

            zinjs.info.canvasTranslate.addCss({
                transform: {
                    translate: (xx + xCh) + 'px,' + (yy + yCh) +'px'
                }
            });
        }
    });
});
