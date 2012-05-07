(function ( document, window ) {
    function isFunction(o)
    {
        return typeof(o)=="function"; //useless function
    }
    window.zinCore={
        loadPlugin: function(pluginName){
            var xmlhttp=false;
            /*@cc_on @*/
            /*@if (@_jscript_version >= 5)
            try {
                xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (E) {
                    xmlhttp = false;
                }
            }
            @end @*/
            if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
                try {
                    xmlhttp = new XMLHttpRequest();
                } catch (e) {
                    xmlhttp=false;
                    console.log(e)
                }
            }
            if (!xmlhttp && window.createRequest) {
                try {
                    xmlhttp = window.createRequest();
                } catch (e) {
                    xmlhttp=false;
                    console.log(e)
                }
            }
            if(!xmlhttp)
                console.log("Sorry XMLHttpRequest is not implemented.");
            function addZinPlugin(zinPlugin) {
                var tmpZinPluginInfo=new ZinPluginInfo(zinPlugin.name, "", zinPlugin.type);
                if(!zinInfo.isExistsPlugin(tmpZinPluginInfo)) {
                    switch(zinPlugin.type)
                    {
                        case ZinPluginType.Action:
                            eval("Component.prototype."+zinPlugin.name+"=zinPlugin.content");
                            break;
                        case ZinPluginType.Component:
                            eval(zinPlugin.content.name+"=zinPlugin.content");
                            zinPlugin.content.prototype=new Component();
                            break;
                        case ZinPluginType.Event:
                            eval("Component.prototype."+zinPlugin.name+"=null");
                            eval(zinPlugin.content+"(Component.prototype)");
                            break;
                    }
                    zinInfo.addPlugin(tmpZinPluginInfo);
                }
                //info about else??
            }
            function onLoaded(data) {
                var object=eval(data);
                if(object==undefined)return; //merge this and next condition
                if(!(object instanceof Object))return;
                if(object instanceof Array) {
                    for (var key in object) {  
                        addZinPlugin(object[key]); //where is condition with if(object instanceof ZinPluginPrototype) ??
                    }
                } else if(object instanceof ZinPluginPrototype) {
                    addZinPlugin(object);
                }
            }
            xmlhttp.onreadystatechange=function() {
                if (xmlhttp.readyState==4) {
                    onLoaded(xmlhttp.responseText);
                }
            }
            xmlhttp.open("GET",pluginName+".js",false);
            xmlhttp.send();
        }
    }

    window.zinInfo={
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
            if(data instanceof(ZinPluginInfo))
            {
                this.plugins.push(data);
                return true;
            }
            return false;
        },
        isExistsPlugin: function(data){
            if(data instanceof(ZinPluginInfo))
            {
                for (var plugin in this.plugins) 
                {
                    if(this.plugins[plugin].equals(data)) {
                        return true;
                    }
                }
            
                return false;
            }
    
        },
        browser: function () {
            var style = document.querySelector("body").style;
            var vendors = new Array("WebkitTransform", "MozTransform", "OTransform","MsTransform","KhtmlTransform");
            for ( var type in vendors ) {
                if ( style[vendors[type]] !== undefined ) {
                    var result = vendors[type];
                    return ("-" + result.substr(0,result.search("Transform")).toLowerCase() + "-");
                }
            }

            return "";
        
        }
    }

    function ZinPluginInfo(name, path, type){
        this.name =  name;
        this.path = path;
        this.type = type;
        this.equals = function(data){ 
            if(data instanceof(ZinPluginInfo))
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
    var ZinPluginType={
        Event:"event",
        Action:"action",
        Component:"component"
    }
    function ZinPluginPrototype(name,type,content)
    {
        this.type=type;
        this.name=name;
        this.content=content;
    }
    
    
})(document, window);

(function ( document, window ) {
    (function ( document, window ) {
        window.Component=function (selector)
        {
            this.hello=function(){
                alert("Hello i'am a component");
            };
            this.find=function(selector) {
                return this.node.querySelectorAll(selector);
            };
            this.render=function() {
                return this.node;
            };
            this.node=document.querySelector(selector);
            this.styles = new Styles();
        };
    
        // static create
        createComponent = window.createComponent = function () {
            return new Component();
        };
    
    
        Component.prototype.addCss = function ( properties, overwrite ) {
            if (arguments.length == 1) {
                overwrite = true;
            }
            this.styles.addCss(properties, overwrite);
            setCss(this.node, this.styles.css);
        };
    
        Component.prototype.clearCss = function ( properties ) {
            if (arguments.length == 0) {
                this.styles.clearCss();
            }
            else {
                this.styles.clearCss(properties);
            }
            setCss(this.node, this.styles.css);
        };
    
        Component.prototype.newCss = function ( x ) {
            if (x instanceof Styles) {
                delete this.styles;
                this.styles = clone (x);
                setCss(this.node, this.styles.css);
            }
        };
        function writeCss ( node, properties ) {
            var key, data = "", count = 0;
            for (var type in properties) {
                key = getKey(type);
                if(key==null) {
                    continue;
                }
                count++;
            
                if (properties[type] instanceof Object) {
                    data += key + ":";
                    for (var item in properties[type]) {
                        data += " " + item + "(" +  properties[type][item] + ")";
                    }
                    data += "; ";
                }
                else {
                    data += key + ": " + properties[type] + "; ";
                }
            }
            if (count == 0) {
                node.removeAttribute("style");
            }
            else {
                node.setAttribute("style", data);
            }
        };

        // ID / NodeList
        function setCss ( node, properties ) {
            if (node instanceof NodeList) {
                for (var i = 0; i < node.length; i++) {
                    writeCss(node[i], properties);
                }
            }
            else {
                writeCss(node, properties);
            }
        };
    
    
    
    })(document, window);
    
    (function ( document, window ) {
   
        var Styles = window.Styles = function () {
            this.css = {};
            return this;
        }
    	
		// write / overwrite (overwrite=true)
		Styles.prototype.addCss = function ( properties , overwrite ) {
			if (arguments.length == 1) {
				overwrite = true;
			}
			for (var type in properties ) {
				if (properties[type] instanceof Object) {
					if (!this.css[type]) {
						this.css[type] = properties[type];
					}
					for (var item in properties[type]) {
						if (overwrite || !this.css[type][item]) {
							this.css[type][item] = properties[type][item];
						}
						else {
							console.log(type.toString() + " " + item.toString() + " not rewritable");
						}
					}
				}
				else if (getKey (type)) {
					if (!this.css[type]) {
						this.css[type] = properties[type];
					}
					else {
						if (overwrite) {
							this.css[type] = properties[type];
						}
						else {
							console.log(type.toString() + " not rewritable");
						}
					}
				}
			}
		};
    
		Styles.prototype.clearCss = function ( properties ) {
			var type;
			if (arguments.length == 0) {
				for (type in this.css ) {
					delete this.css[type];
				}
			}
			else if (arguments.length == 1) {
				if (typeof(properties) === 'string' || s instanceof String) {
					properties = new Array(properties);
				}
				for (type in properties ) {
					var inside = properties[type].split("-");
					if (this.css[inside[0]]) {
						if (inside.length == 1) {
							delete this.css[inside[0]];
						}
						else if (inside.length == 2) {
							if (this.css[inside[0]][inside[1]]) {
								delete this.css[inside[0]][inside[1]];
							}
							if (this.css[inside[0]].length == 0) { //useless?
								delete this.css[inside[0]];
							}
						}
					}
				}
			}
			else{
				console.log("Styles clearCss has bad parameters");
			}
		};
    
        // Print all styles
        Styles.prototype.showCss = function () {
            console.log("Style:");
            for (var type in this.css ) {
                console.log(type + ": " + this.css[type]);
                if (this.css[type] instanceof Object) {
                    for (var type2 in this.css[type]) {
                        console.log(type2 + ": " + this.css[type][type2]);
                    }
                }
            }		
        };
    
   
    
    })(document, window);
    function getKey ( type ) {
        var typeSmall = type.toLowerCase();
        var typeSmallWithPrefix = zinInfo.browser() + typeSmall;
        if (  document.querySelector("body").style[typeSmallWithPrefix] !== undefined ) {
            return typeSmallWithPrefix;
        }
        else if (  document.querySelector("body").style[typeSmall] !== undefined ) { //useless? browser can be ""
            return typeSmall;
        }
        console.log(type.toString() + " is undefined in this browser");
        return null;
    };
    
    //copy constructor for style
    function clone (object) {
        if (object == null || typeof(object) != 'object') {
            return object;    
        }
        var temp = new object.constructor(); 
        for (var key in object) {
            temp[key] = clone(object[key]);    
        }
        return temp;
    }
})(document, window);
