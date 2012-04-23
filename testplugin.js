[new ZinPluginPrototype("testplugin",ZinPluginType.Action,function(){
    
}),
new ZinPluginPrototype("testplugin2",ZinPluginType.Component,function Scroll(){
    this.hello=function(){alert("Hello World!")};
}),
new ZinPluginPrototype("testplugin3",ZinPluginType.Event,function installEvent(prototype){
    prototype.onmousemove=function(a){
         prototype.testplugin3(a);
    }
})]