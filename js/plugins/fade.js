[
new zinjs.core.PluginPrototype(
    "fadeIn",
    zinjs.core.pluginType.ACTION,
    function(duration, easing)
    {
        switch(arguments.length) {
            case 0:
                this.addCss({
                    opacity: 1,
                    transitionDuration: duration,
                    transitionTimingFunction: 'linear'
                });
                break;
            case 1:
                this.addCss({
                    opacity: 1,
                    transitionDuration: duration,
                    transitionTimingFunction: easing
                });
                break;
            default:
                console.log("Bad parameters for set rotate!");
        }
    }
    ),
new zinjs.core.PluginPrototype(
    "fadeOut",
    zinjs.core.pluginType.ACTION,
    function(duration, easing)
    {
        switch(arguments.length) {
            case 0:
                this.addCss({
                    opacity: 0,
                    transitionDuration: duration,
                    transitionTimingFunction: 'linear'
                });
                break;
            case 1:
                this.addCss({
                    opacity: 0,
                    transitionDuration: duration,
                    transitionTimingFunction: easing
                });
                break;
            default:
                console.log("Bad parameters for set rotate!");
        }
    }
    )
]

