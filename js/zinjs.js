zinjs = {
    core: {},
    info: {},
    util: {}
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
                    eval("zinjs.Component.prototype." + plugin.name + " = plugin.content");
                    break;
                case zinjs.core.pluginType.COMPONENT:
                    eval(plugin.content.name + " = plugin.content");
                    plugin.content.prototype = new zinjs.Component();
                    break;
                case zinjs.core.pluginType.EVENT:
                    eval("zinjs.Component.prototype." + plugin.name + " = null");
                    eval(plugin.content + "(zinjs.Component.prototype)");
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

/////////////////////////////////////////////////////////////////////////////////////////
// Component ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

zinjs.Component = function(selector, style)
{
    this.node = $(selector);
    if (style instanceof zinjs.Styles) {
        this.styles = zinjs.util.clone(style);
        zinjs.util.setCss(this.node, this.styles.css);
    } else {
        this.styles = new zinjs.Styles();
    }
};

zinjs.createComponent = function(selector, style)
{
    return new zinjs.Component(selector, style);
};

zinjs.Component.prototype.find = function(selector)
{
    return this.node.find(selector);
};

zinjs.Component.prototype.render = function()
{
    return this.node;
};

zinjs.Component.prototype.addCss = function(properties, overwrite)
{
    if (arguments.length == 1) {
        overwrite = true;
    }
    this.styles.addCss(properties, overwrite);
    this._writeCss();
    return this;
};

zinjs.Component.prototype.clearCss = function(properties)
{
    if (arguments.length === 0) {
        this.styles.clearCss();
    }
    else {
        this.styles.clearCss(properties);
    }
    this._writeCss();
    return this;
};

zinjs.Component.prototype.newCss = function(x)
{
    if (x instanceof zinjs.Styles) {
        delete this.styles;
        this.styles = zinjs.util.clone (x);
        this._writeCss();
    }
    return this;
};

zinjs.Component.prototype._writeCss = function()
{
    var properties = this.styles.css;
    var data;
    for (var type in properties) {
        if (properties[type] instanceof Object) {
            data = "";
            for (var item in properties[type]) {
                data += item + "(" +  properties[type][item] + ") ";
            }
            this.node.css(type, data);
        }
        else {
            this.node.css(type, properties[type]);
        }
    }
    if (properties.length === 0) {
        node.removeAttribute("style");
    }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Styles ///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

zinjs.Styles = function()
{
    this.css = {};
};

zinjs.Styles.prototype.addCss = function(properties , overwrite)
{
    if (arguments.length == 1) {
        overwrite = true;
    }
    for (var type in properties) {
        if (properties[type] instanceof Object) {
            if (!this.css[type]) {
                this.css[type] = properties[type];
            }
            for (var item in properties[type]) {
                if (overwrite || !this.css[type][item]) {
                    this.css[type][item] = properties[type][item];
                }
                else {
                    console.log(type.toString() + " " + item.toString() + " not rewritable");
                }
            }
        }
        else {
            if (!this.css[type]) {
                this.css[type] = properties[type];
            }
            else {
                if (overwrite) {
                    this.css[type] = properties[type];
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
        for (type in this.css) {
            delete this.css[type];
        }
    }
    else if (arguments.length == 1) {
        if (typeof(properties) === 'string' || properties instanceof String) {
            properties = new Array(properties);
        }
        for (type in properties) {
            var inside = properties[type].split("-");
            if (this.css[inside[0]]) {
                if (inside.length == 1) {
                    delete this.css[inside[0]];
                }
                else if (inside.length == 2) {
                    if (this.css[inside[0]][inside[1]]) {
                        delete this.css[inside[0]][inside[1]];
                    }
                    if (this.css[inside[0]].length === 0) {
                        delete this.css[inside[0]];
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
    for (var type in this.css) {
        console.log(type + ": " + this.css[type]);
        if (this.css[type] instanceof Object) {
            for (var type2 in this.css[type]) {
                console.log(type2 + ": " + this.css[type][type2]);
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

/////////////////////////////////////////////////////////////////////////////////////////
// listeners ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

$(window).bind("resize", windowResized);

function windowResized()
{
    zinjs.info.height = $(window).height();
    zinjs.info.width = $(window).width();
}
