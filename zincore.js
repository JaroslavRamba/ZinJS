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
    }

}

/*
    var myArray = new Array();
    myArray.push("string 1");
    myArray.push("string 2");
    myArray.pop();
 **/