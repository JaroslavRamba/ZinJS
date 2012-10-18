[
    new zinjs.core.PluginPrototype(
        "testPlugin1",
        zinjs.core.pluginType.COMPONENT,
        function Scroll()
        {
            this.hello=function(){console.log("Hello World!")};
        }
    ),
    new zinjs.core.PluginPrototype(
        "testPlugin2",
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
