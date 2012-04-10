(function ( document, window ) {
	/* ******************** */
	/* ******************** */
	/* ******* CORE ******* */
	/* ******************** */
	/* ******************** */
	
	// JADRO
	var core = {
		browser: "",
		width: $(window).width(),
		height: $(window).height()
	};
	
	// ZISKANI ELEMENTU DLE ID
	var $id = window.$id = function ( id ) {
		return document.getElementById(id);
	}; 
	
	// ZISKANI ELEMENTU DLE SELECTORU
	var $one = window.$one = function ( selector, context ) {
        context = context || document;
        return context.querySelector(selector);
    };
	
	// ZISKANI VSECH ELEMENTU DLE SELECTORU
	var $all = window.$all = function ( selector, context ) {
        context = context || document;
        return context.querySelectorAll(selector);
    };
	
	// KOPIRUJICI KONSTRUKTOR PRO STYLY
	function clone (obj) {
		if (obj == null || typeof(obj) != 'object') {
			return obj;    
		}
		var temp = new obj.constructor(); 
		for (var key in obj) {
			temp[key] = clone(obj[key]);    
		}
		return temp;
	}
    	
	/* ******************** */
	/* ******************** */
	/* **** CSS - CORE **** */
	/* ******************** */
	/* ******************** */
		
	// PODPORA PROHLIZECE
	function getKey ( type ) {
        var typeSmall = type.charAt(0).toLowerCase() + type.substr(1).toLowerCase();
		if ( $one("body").style[core.browser+typeSmall] !== undefined ) {
			return(core.browser+typeSmall);
		}
		else if ( $one("body").style[typeSmall] !== undefined ) {
			return(typeSmall);
		}
        return null;
	};
	
	// ZAPIS CSS STYLE
	function writeCss ( id, properties ) {
        var key, data = "", count = 0;
        for (var type in properties) {
			count++;
            key = getKey (type);
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
			id.removeAttribute("style");
		}
		else {
			id.setAttribute("style", data);
		}
	};

	// ID / NodeList
	function css ( id, properties ) {
		if (id instanceof NodeList) {
			for (var i = 0; i < id.length; i++) {
				writeCss(id[i], properties);
			}
		}
		else {
            writeCss(id, properties);
        }
	};
	
    /* ******************** */
	/* ******************** */
	/* ******** CSS ******* */
	/* ******************** */
	/* ******************** */
    
    // KONSTRUKTOR
    var Styles = window.Styles = function () {
        this.css = {};
		return this;
	}
    	
    // ZAPISOVANI / PREPISOVANI (overwrite=true)
	Styles.prototype.add = function ( x, overwrite ) {
        if (arguments.length == 1) {
            overwrite = true;
        }
        for (var type in x ) {
            if (getKey (type)) {
                if (!this.css[type]) {
                    this.css[type] = x[type];
                }
                else {
                    if (overwrite) {
                        this.css[type] = x[type];
                    }
                    else {
                        alert ("Hodnota jiz existuje a nemate zapnute prepisovani.");
                    }
                }
            }
            else {
                alert("Pozor, priradili jste do stylu nesmysl: "+type);
            }
        }
	};
    
    // MAZANI
    Styles.prototype.clear = function ( x ) {
        var type;
        if (arguments.length == 0) {
            for (type in this.css ) {
                delete this.css[type];
            }
        }
        else if (arguments.length == 1) {
            for (type in x ) {
                var inside = x[type].split("-");
                if (this.css[inside[0]]) {
                    if (inside.length == 1) {
                        delete this.css[inside[0]];
                    }
                    else if (inside.length == 2) {
                        if (this.css[inside[0]][inside[1]]) {
                            delete this.css[inside[0]][inside[1]];
                        }
                        var i = 0;
                        for (var empty in this.css[inside[0]]) {
                            i++;
                        }
                        if (i == 0) {
                            delete this.css[inside[0]];
                        }
                    }
                }
            }
        }
	};
    
    // TESTING - SHOW STYLE
    Styles.prototype.show = function () {
        alert("Style:");
        for (var type in this.css ) {
            alert(type + ": " + this.css[type]);
            if (this.css[type] instanceof Object) {
                for (var type2 in this.css[type]) {
					alert(type2 + ": " + this.css[type][type2]);
                }
            }
        }		
	};
    
	/* ******************** */
	/* ******************** */
	/* ****** ELEMENT ***** */
	/* ******************** */
	/* ******************** */
	
	// KONSTRUKTOR
	var Element = window.Element = function ( id ) {
		if (id.charAt(0) == '#') {
			id = id.substring(1);
			this.id = $id(id);
		}
		else {
			this.id = $all(id);
		}
        this.styles = new Styles();
		return this;
	}
    
    Element.prototype.addCss = function ( x, overwrite ) {
        if (arguments.length == 1) {
            overwrite = true;
        }
        this.styles.add(x, overwrite);
        css (this.id, this.styles.css);
	};
    
    Element.prototype.clearCss = function ( x ) {
        if (arguments.length == 0) {
            this.styles.clear();
        }
        else {
			this.styles.clear(x);
		}
        css (this.id, this.styles.css);
	};
    
    Element.prototype.newCss = function ( x ) {
        if (x instanceof Styles) {
			delete this.styles;
			this.styles = clone (x);
			css (this.id, this.styles.css);
        }
	};
	 
	// staticke vytvoreni
	var createElement = window.createElement = function ( id ) {
		return new Element(id);
	};
   
	/* ******************** */
	/* ******************** */
	/* **** INITIALIZE **** */
	/* ******************** */
	/* ******************** */
	
	// ZJISTENI PREFIXU PROHLIZECE
	function checkBrowser () {
		var style = $one("body").style,
		prefixes = 'Webkit Moz O Ms Khtml'.split(' '),
		css = "Transform",
		result = null,
		vendors = (prefixes.join(css + ' ')+css).split(' ');
		for ( var i in vendors ) {
			if ( style[ vendors[i] ] !== undefined ) {
				result = vendors[i];
				break;
			}
		}
		if (result) {
			return ("-" + result.substr(0,result.search("Transform")).toLowerCase() + "-");
		}
		else {
			return ("");
		}
	};
	
	var zinjs = window.zinjs = function () {	
		var init = function () {
			core.browser = checkBrowser();
		};
		
		return ({
            init: init,
            core: core
        });
	};
	
})(document, window);