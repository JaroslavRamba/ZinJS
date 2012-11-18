new zinjs.core.PluginPrototype(
        "controlPanel",
        zinjs.core.pluginType.COMPONENT,
        /*
         * Control panel component
         * 
         * @properties
         * 
         * @controlPanelId Sets id to root div of control panel
         * default value = 'controlPanel'
         **/
        function ControlPanel( properties , controlPanelId  ) {
            /*
             * init control panel params - and set default values
             **/
            if (arguments.length == 1) {
                controlPanelId = 'controlPanel';
            }
            if( properties['position'] == null ){
                properties.position = { top: "10px", left: "10px" };
            }
            if( properties['homeButton'] == null ){
                properties.homeButton = 'enambled';
            }
            if( properties['verticalArrow'] == null ){
                properties.verticalArrow = 'enambled';
            }
            if( properties['horizontalArrow'] == null ){
                properties.horizontalArrow = 'enambled';
            }
            if( properties['presentationArrow'] == null ){
                properties.presentationArrow = 'enambled';
            }
            if( properties['rotate'] == null ){
                properties.rotate = 'enambled';
            }
            if( properties['arrowButtonMode'] == null) {
                properties.arrowButtonMode = 'position';
            }
            if( properties['zoom'] == null) {
                properties.zoom = 'enambled';
            }
            properties.canvasMove = "50";

            /*vypis vstupnich parametru pro control panel*/
            /*for (var type in properties) {
                 console.log( "control panel: " + type +  ":" + properties[type] );
            }*/

            
            /*
             * Render control panel to html dom.
             **/
            var body = document.getElementsByTagName("body")[0];
            var _divPanel = body.appendChild(document.createElement("div"));
            _divPanel.setAttribute('id',controlPanelId);
            _divPanel.className = 'controlPanel';
            var _controlPanel = new zinjs.Container('#'+ controlPanelId);

            /*
             * set position to styles of control panel
             **/
            var _controlPanelCss = {};
            for(var type in properties.position){
                if( type == 'left') {
                    _controlPanelCss.left = properties.position[type];
                }
                if( type == 'right') {
                    _controlPanelCss.right = properties.position[type];
                }
                if( type == 'top') {
                    _controlPanelCss.top = properties.position[type];
                }
                if( type == 'bottom') {
                    _controlPanelCss.bottom = properties.position[type];
                }
            }
            _controlPanelCss.position = 'fixed';
            _controlPanel.addCss( _controlPanelCss )

            /*
             * Render control panel
             **/
            if( properties.rotate == 'enambled'){
                var _rotatePanel = document.createElement('div');
                _rotatePanel.className = 'rotate';
                 $(_rotatePanel).mousedown( function(e) {
                    e.preventDefault(); // prevents the dragging of the image.
                        $('*').bind('mousemove.rotateImg', function(e2) {
                        rotateOnMouse(e2, _rotatePanel);
                    });
                });

                $('*').mouseup(function(e) {
                    $('*').unbind('mousemove.rotateImg');
                });
                _divPanel.appendChild(_rotatePanel);
            }
            
            
            if( properties.horizontalArrow == 'enambled' || properties.verticalArrow == 'enambled') {
                var _arrowContainer = document.createElement('div');
                _arrowContainer.className = 'arrows';

                if( properties.verticalArrow == 'enambled') {
                    var _arrowUp = document.createElement('a');
                    _arrowUp.className = 'up';
                    _arrowUp.setAttribute('href', '#');
                    _arrowUp.onclick = arrowUpClick;
                    _arrowContainer.appendChild(_arrowUp);

                    var _arrowDown = document.createElement('a');
                    _arrowDown.className = 'down';
                    _arrowDown.setAttribute('href', '#');
                    _arrowDown.onclick = arrowDownClick;
                    _arrowContainer.appendChild(_arrowDown);
                }

                if( properties.horizontalArrow == 'enambled') {
                    var _arrowLeft = document.createElement('a');
                    _arrowLeft.className = 'left';
                    _arrowLeft.setAttribute('href', '#');
                    _arrowLeft.onclick = arrowLeftClick;
                    _arrowContainer.appendChild(_arrowLeft);

                    var _arrowRight = document.createElement('a');
                    _arrowRight.className = 'right';
                    _arrowRight.setAttribute('href', '#');
                    _arrowRight.onclick = arrowRightClick;
                    _arrowContainer.appendChild(_arrowRight);
                }
                _divPanel.appendChild(_arrowContainer);
            }    
            
            
            
            if( properties.presentationArrow == 'enambled' ) {
                var _presentationArrowContainer = document.createElement('div');
                _presentationArrowContainer.className = 'presentationArrows';
                
                var _presentationArrowLeft = document.createElement('a');
                _presentationArrowLeft.className = 'left';
                _presentationArrowLeft.setAttribute('href', '#');
                _presentationArrowLeft.onclick = presentationLeftClick;
                _presentationArrowContainer.appendChild(_presentationArrowLeft);
                
                var _presentationArrowRight = document.createElement('a');
                _presentationArrowRight.className = 'right';
                _presentationArrowRight.setAttribute('href', '#');
                _presentationArrowRight.onclick = presentationRightClick;
                _presentationArrowContainer.appendChild(_presentationArrowRight);
                
                _divPanel.appendChild(_presentationArrowContainer);
            }
            
            if( properties.homeButton == 'enambled' ) {
                var _homeButton = document.createElement('a');
                _homeButton.className = 'homeButton';
                _homeButton.setAttribute('href', '#');
                _homeButton.onclick = homeButtonClick;
                _divPanel.appendChild(_homeButton);
            }
            
            if( properties.zoom == 'enambled') {
                var _sliderContainer = document.createElement('div');
                var _slider = document.createElement('div');
                _sliderContainer.className = 'zoomSlider';
                //TODO render jQuery UI component
                $(_slider).slider({ orientation: "vertical" });
                _sliderContainer.appendChild(_slider);
                _divPanel.appendChild(_sliderContainer);
            }
            


            /*
             * Conrol panel events
             **/
            function arrowUpClick(e){
                var trans = zinjs.info.canvasTranslate._styles._css['transform']['translate'];
                var transArr = trans.split(',');
                var xx = parseInt(transArr[0], 10);
                var yy = parseInt(transArr[1], 10);
            
                zinjs.info.canvasTranslate.addCss({
                    transform: {
                        translate: (xx) + 'px,' + (yy + parseInt(properties.canvasMove)) +'px'
                    }
                });
                 e.preventDefault();
            }
            function arrowDownClick(e){
                var trans = zinjs.info.canvasTranslate._styles._css['transform']['translate'];
                var transArr = trans.split(',');
                var xx = parseInt(transArr[0], 10);
                var yy = parseInt(transArr[1], 10);
            
                zinjs.info.canvasTranslate.addCss({
                    transform: {
                        translate: (xx) + 'px,' + (yy - properties.canvasMove) +'px'
                    }
                });
                 e.preventDefault();
            }
            function arrowLeftClick(e){
                var trans = zinjs.info.canvasTranslate._styles._css['transform']['translate'];
                var transArr = trans.split(',');
                var xx = parseInt(transArr[0], 10);
                var yy = parseInt(transArr[1], 10);
            
                zinjs.info.canvasTranslate.addCss({
                    transform: {
                        translate: (xx +  parseInt(properties.canvasMove)) + 'px,' + yy +'px'
                    }
                });
                 e.preventDefault();
            }
            function arrowRightClick(e){
                var trans = zinjs.info.canvasTranslate._styles._css['transform']['translate'];
                var transArr = trans.split(',');
                var xx = parseInt(transArr[0], 10);
                var yy = parseInt(transArr[1], 10);
            
                zinjs.info.canvasTranslate.addCss({
                    transform: {
                        translate: (xx - parseInt(properties.canvasMove)) + 'px,' + (yy ) +'px'
                    }
                });
                 e.preventDefault();
            }
           
            function homeButtonClick(e){
                //TODO reset zoom
                zinjs.info.canvasTranslate.addCss({
                    transform: {
                        translate: 0 + 'px,' + 0 + 'px'
                    }
                });
                 zinjs.info.canvasTranslate.rotate( 0, 0, 0, 1);
                 e.preventDefault();
            }
            function presentationLeftClick(e){
                console.log( "TODO presentation Left Click");
                 e.preventDefault();
            }
            function presentationRightClick(e){
                console.log( "TODO presentation Right Click");
                 e.preventDefault();
            }
            
            
            /*
             * calculate degree of rotation based on mouse position
             * 
             * @e event mouse position
             * 
             * @control div element of rotate control
             **/
            var rotateCenter = {};
            function rotateOnMouse(e, control) {
                //TODO smooth rotate and correct rotate
                var offset = $(control).offset();
                //window.console.log("left="+offset.left+"right="+offset.top);
                //pocitani stredu
                if( rotateCenter.x == undefined || rotateCenter.y == undefined ) {
                    rotateCenter.x = (offset.left) + ($(control).width() / 2);
                    rotateCenter.y = (offset.top) + ($(control).height() / 2);
                }
                
                //window.console.log(rotateCenter.x + "  " + rotateCenter.y);
                var mouse_x = e.pageX;
                var mouse_y = e.pageY;
                var radians = Math.atan2(mouse_x - rotateCenter.x, mouse_y - rotateCenter.y);
                var degree = (radians * (180 / Math.PI) * -1) + 100 ;
                //window.console.log("de="+degree+","+radians);
                
                var rotatePanel = new zinjs.Container(control);
                rotatePanel.rotate( degree, 0, 0, 1);
                
                zinjs.info.canvasTranslate.rotate( degree, 0, 0, 1);
            }
        }
    );