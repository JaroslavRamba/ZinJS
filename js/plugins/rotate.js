new ZinPluginPrototype("rotate",ZinPluginType.Action,function(angle,x, y, z){   
   
    switch(arguments.length)
    {
        case 0:
            this.addCss({
                transform: {
                    rotate3d: "0,0,0,0"
                }
            });
        case 1:
            this.addCss({
                transform: {
                    rotate: angle+"deg"
                }
            });
            break;
        case 4:
            this.addCss({
                transform: {
                    rotate3d: x+","+y+","+z+","+angle+"deg"
                }
            });
            break;
        default:
            console.log("Bad parameters for set rotate!");
    }
})

