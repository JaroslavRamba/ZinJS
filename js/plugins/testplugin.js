[
    new zinjs.core.PluginPrototype(
        "testplugin",
        zinjs.core.pluginType.ACTION,
        function()
        {
        }
    ),
    new zinjs.core.PluginPrototype(
        "testplugin2",
        zinjs.core.pluginType.COMPONENT,
        function Scroll()
        {
            this.hello=function(){console.log("Hello World!")};
        }
    ),
    new zinjs.core.PluginPrototype(
        "testplugin3",
        zinjs.core.pluginType.EVENT,
        function installEvent(prototype)
        {
            prototype.onmousemove = function(a)
            {
                 prototype.testplugin3(a);
            }
        }
    )
]
