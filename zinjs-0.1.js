(function ( document, window ) {
	/* ******************** */
	/* ******************** */
	/* ****** ZAKLAD ****** */
	/* ******************** */
	/* ******************** */
	
	// JADRO
	var core = window.core = {
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
	
	// PODPORA PROHLIZECE
	var getKey = function ( type ) {
		var key, typeBig = type.charAt(0).toUpperCase() + type.substr(1);
		if ( $one("body").style[core.browser+typeBig] !== undefined ) {
			key = core.browser+typeBig;
		}
		else if ( $one("body").style[type] !== undefined ) {
			key = type;
		}
		return key;
	};
		
	// ZAPSANI DO STYLU	
	function writeCss ( id, prop, type ) { // TODO --> editace jiz stavajiciho stylu
		var key = getKey (type);
		if (id.style[key]) {
			id.style[key] += prop;
		}
		else {
			id.style[key] = prop;
		}
	};

	// ZAPSANI DO STYLU	
	function clearCss ( id, type ) {
		if (type !== undefined) {
			var key = getKey (type);
			if (id.style[key])
				id.style[key] = "";
		}
		else {
			//id.removeAttribute('style'); // TODO --> nevim proc nefunguje :( 
			id.setAttribute('style', null);
		}
	};
		
	// CSS VSTUP Z NASICH METOD ELEMENTU
	function css ( id, properties, type ) {
		if (id instanceof NodeList) {
			for (var i = 0; i < id.length; i++) {
				writeCss (id[i], properties, type);
			}
		}
		else
			writeCss (id, properties, type);
	};
	
	// CSS VSTUP POMOCI ASSOCIATIVNIHO POLE
	function arrayCss ( id, properties ) {
		var prop;
		if (id instanceof NodeList) {				
			for (var i = 0; i < id.length; i++) {
				for (prop in properties ) {
					writeCss (id[i], properties[prop], prop);
				}
			}
		}
		else {
			for (prop in properties ) {
				writeCss (id, properties[prop], prop);
			}
		}
	};
	
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
		if (result)
			return (result.substr(0,result.search("Transform")));
		else
			return ("");
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
		return this;
	}
	
	Element.prototype.rotate = function ( x, y, z ) {
		if (arguments.length == 1) {
			z = x;
			x = y = 0;
		}
		var data = "";
		if (x!=0) data += " rotateX(" + x + "deg)";
		if (y!=0) data += " rotateY(" + y + "deg)";
		if (z!=0) data += " rotateZ(" + z + "deg)";
		css ( this.id, data, "Transform");
	};
	
	Element.prototype.scale = function ( x ) {
		css ( this.id, " scale(" + x + ")", "Transform");
	};
	
	Element.prototype.perspective = function ( x ) {
		css ( this.id, " perspective(" + x + "px)", "Transform");
	};
	
	Element.prototype.translate = function ( x, y ) {
		css ( this.id, " translate(" + x + ", " + y + ")", "Transform");
	};
	
	Element.prototype.translate3d = function ( x, y, z ) {
		css ( this.id, " translate3d(" + x + ", " + y + ", " + z + ")", "Transform");
	};
		
	Element.prototype.transformOrigin = function ( x, y ) {
		css ( this.id, " " + x + " " + y, "TransformOrigin");
	};

	Element.prototype.preserve3d = function () {
		css ( this.id, " preserve-3d", "TransformStyle");
	};
	
	Element.prototype.arrayCss = function ( properties ) {
		arrayCss ( this.id, properties);
	};

	Element.prototype.clearCss = function ( type ) {
		clearCss ( this.id, type);
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
	
	var zinjs = window.zinjs = function () {	
		var init = function () {
			core.browser = checkBrowser();
		};
		
		return ({
            init: init
        });
	};
	
})(document, window);