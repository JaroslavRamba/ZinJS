(function ( document, window ) {

    var Zinjs = window.Zinjs = function () {	
        var init = function () {
            Core.browser = checkBrowser();
        };
		
        return ({
            init: init,
            Core: Core
        });
    };
    
    var Core = {
        browser: "",
        width: $(window).width(),
        height: $(window).height()
    };
    
   
    var getNodeById = window.getNodeById = function ( id ) {
        return document.getElementById(id);
    }; 
	
    var getNodeBySelector = window.getNodeBySelector = function ( selector, context ) {
        context = context || document;
        return context.querySelector(selector);
    };
	
    var getNodesBySelector = window.getNodesBySelector = function ( selector, context ) {
        context = context || document;
        return context.querySelectorAll(selector);
    };
	
    //copy constructor for styles
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
		
    // for validate across browsers
    function getKey ( type ) {
        var typeSmall = type.toLowerCase();
        var typeSmallWithPrefix = Core.browser + typeSmall;
        if ( getNodeBySelector("body").style[typeSmallWithPrefix] !== undefined ) {
            return typeSmallWithPrefix;
        }
        else if ( getNodeBySelector("body").style[typeSmall] !== undefined ) { //useless? browser can be ""
            return typeSmall;
        }
        console.log(type.toString() + " is undefined in this browser");
        return null;
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
            if (getKey (type)) {
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
    
    var Element = window.Element = function ( node ) {
        if (node.charAt(0) == '#') {
            node = node.substring(1);
            this.node = getNodeById(node);
        }
        else {
            this.node = getNodesBySelector(node);
        }
        this.styles = new Styles();
        return this;
    }
    
    Element.prototype.addCss = function ( properties, overwrite ) {
        if (arguments.length == 1) {
            overwrite = true;
        }
        this.styles.addCss(properties, overwrite);
        setCss(this.node, this.styles.css);
    };
    
    Element.prototype.clearCss = function ( properties ) {
        if (arguments.length == 0) {
            this.styles.clearCss();
        }
        else {
            this.styles.clearCss(properties);
        }
        setCss(this.node, this.styles.css);
    };
    
    Element.prototype.newCss = function ( x ) {
        if (x instanceof Styles) {
            delete this.styles;
            this.styles = clone (x);
            setCss(this.node, this.styles.css);
        }
    }
    
    // static create
    var createElement = window.createElement = function ( node ) {
        return new Element(node);
    };
   
    // find prefix browser
    function checkBrowser () {
        var style = getNodeBySelector("body").style;
        var vendors = new Array("WebkitTransform", "MozTransform", "OTransform","MsTransform","KhtmlTransform");
        for ( var type in vendors ) {
            if ( style[vendors[type]] !== undefined ) {
                var result = vendors[type];
                return ("-" + result.substr(0,result.search("Transform")).toLowerCase() + "-");
            }
        }

        return "";
        
    };
	
})(document, window);