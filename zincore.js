function isFunction(o)
{
    return typeof(o)=="function";
}
var zinCore={
    loadPlugin: function(pluginName){
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", pluginName+".js");
        function onLoaded()
        {
            var object=eval(pluginName);
            if(isFunction(zinCore.pluginLoaded))
            {
                //dodelat pridani do zininfo
                //rozmyslet se jestli neudelat pluginloaded jako pole
                //zjistit typ ojektu a udelat s nim prislusne akce
                zinCore.pluginLoaded(object);
            }
        }
        fileref.onload=onLoaded;
        document.getElementsByTagName('head')[0].appendChild(fileref);
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
        if(data instanceof(ZinPlugin))
        {
            this.plugins.push(data);
            return true;
        }
        return false;
    },
    isExistsPlugin: function(data){
        if(data instanceof(ZinPlugin))
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

function ZinPlugin(name, path, type){
    this.name =  name;
    this.path = path;
    this.type = type;
    this.equals = function(data){ 
        if(data instanceof(ZinPlugin))
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

