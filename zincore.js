function isFunction(o)
{
    return typeof(o)=="function";
}
var zinCore={
    loadPlugin: function(pluginName){
        var xmlhttp=false;
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
            }
        }
        if (!xmlhttp && window.createRequest) {
            try {
                xmlhttp = window.createRequest();
            } catch (e) {
                xmlhttp=false;
            }
        }
        function addZinPlugin(zinPlugin)
        {
            var tmpZinPluginInfo=new ZinPluginInfo(zinPlugin.name, "", zinPlugin.type);
            if(!zinInfo.isExistsPlugin(tmpZinPluginInfo))
            {
                switch(zinPlugin.type)
                {
                    case ZinPluginType.Action:
                        eval("Component.prototype."+zinPlugin.name+"=zinPlugin.content");
                        break;
                    case ZinPluginType.Component:
                        eval(zinPlugin.content.name+"=zinPlugin.content");
                        zinPlugin.content.prototype=new Component();
                        break;
                    case ZinPluginType.Event:
                        alert("unimplemented");
                        break;
                }
                zinInfo.addPlugin(tmpZinPluginInfo);
            }
        }
        function onLoaded(data)
        {
            var object=eval(data);
            if(object==undefined)return;
            if(!(object instanceof Object))return;
            if(object instanceof Array)
            {
                for (var key in object) {  
                    addZinPlugin(object[key]);
                }
            }
            else if(object instanceof ZinPluginPrototype)
            {
                addZinPlugin(object);     
            }
        }
        xmlhttp.onreadystatechange=function()
        {
            if (xmlhttp.readyState==4) {
                onLoaded(xmlhttp.responseText);
            }
        }
        xmlhttp.open("GET",pluginName+".js",false);
        xmlhttp.send();
    }
}

var zinInfo={
    width: $(window).width(),
    height: $(window).height(),
    plugins: new Array(),
    getSize: function(){
        return [$(window).width(),$(window).height()]; 
    },
    isMobile: function(){
        if( navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/BlackBerry/i)
            ){
            return true;
        }
        return false;
    },
    addPlugin: function(data){
        if(data instanceof(ZinPluginInfo))
        {
            this.plugins.push(data);
            return true;
        }
        return false;
    },
    isExistsPlugin: function(data){
        if(data instanceof(ZinPluginInfo))
        {
            for (var plugin in this.plugins)
            {
                if(this.plugins[plugin].equals(data)){
                    return true;
                }
            }
            
            return false;
        }
    
    }
}

function ZinPluginInfo(name, path, type){
    this.name =  name;
    this.path = path;
    this.type = type;
    this.equals = function(data){ 
        if(data instanceof(ZinPluginInfo))
        {
            if(data.name!=this.name){
                return false;
            }
            if(data.path!=this.path){
                return false;
            }
            if(data.type!=this.type){
                return false;
            }
            return true;
        }
        return false;
    };
}
var ZinPluginType={
    Event:"event",
    Action:"action",
    Component:"component"
}
function ZinPluginPrototype(name,type,content)
{
    this.type=type;
    this.name=name;
    this.content=content;
}
function Component()
{
    this.hello=function(){
        alert("Hello i'am a component");
    };
}
