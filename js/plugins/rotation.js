new ZinPluginPrototype("rotate",ZinPluginType.Action,function(points, duration, animate){
    
    
    /*
     *
     * to { 
    -webkit-transform: rotate(360deg);
  }
}
#loading img
{
    -webkit-animation-name:             rotate; 
    -webkit-animation-duration:         0.5s; 
    -webkit-animation-iteration-count:  infinite;
    -webkit-transition-timing-function: linear;
     *
     **/
    
    
    this.addCss({
        position: "absolute",
        transform: {
            scale: 2,
            rotate: "60deg",
            translate: "20px, 50px"
        }
    });
                
                
    if (arguments.length == 0) {
                
                
    }

    
})

