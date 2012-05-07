new ZinPluginPrototype("rotate",ZinPluginType.Action,function(style){
    
    if (arguments.length == 0) {
        this.addCss({
            transform: {
                rotate: "360deg"
            },
            display: "block",
            height: "100px",
            width: "100px",
            transition: "all 1s ease-out",
        });
                
                
    }
    else{
        if(style instanceof Styles) {
            this.addCss(style.css);
        }else{
            console.log("Object is not instance of Styles");
        }
    }
})

