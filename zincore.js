function isFunction(o)
{
    return typeof(o)=="function";
}
var ZinCore={
    LoadPlugin: function(pluginName){
	var fileref=document.createElement('script');
	fileref.setAttribute("type","text/javascript");
	fileref.setAttribute("src", pluginName+".js");
	function onloaded()
	{
	    var object=eval(pluginName);
	    if(isFunction(ZinCore.PluginLoaded))
	    {
		//dodelat pridani do zininfo
		//rozmyslet se jestli neudelat pluginloaded jako pole
		//zjistit typ ojektu a udelat s nim prislusne akce
		ZinCore.PluginLoaded(object);
	    }
	}
	fileref.onload=onloaded;
	document.getElementsByTagName('head')[0].appendChild(fileref);
	
    }
}