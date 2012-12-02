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
            properties.position = {
                top: "10px", 
                left: "10px"
            };
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
        properties.canvasMove = "10";

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
                _arrowUp.onmousedown = arrowUpClick;
                _arrowContainer.appendChild(_arrowUp);

                var _arrowDown = document.createElement('a');
                _arrowDown.className = 'down';
                _arrowDown.setAttribute('href', '#');
                _arrowDown.onmousedown = arrowDownClick;
                _arrowContainer.appendChild(_arrowDown);
            }

            if( properties.horizontalArrow == 'enambled') {
                var _arrowLeft = document.createElement('a');
                _arrowLeft.className = 'left';
                _arrowLeft.setAttribute('href', '#');
                _arrowLeft.onmousedown = arrowLeftClick;
                _arrowContainer.appendChild(_arrowLeft);

                var _arrowRight = document.createElement('a');
                _arrowRight.className = 'right';
                _arrowRight.setAttribute('href', '#');
                _arrowRight.onmousedown = arrowRightClick;
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
            
        //render zoom slider panel
        if( properties.zoom == 'enambled') {
            var _sliderContainer = document.createElement('div');
            var _slider = document.createElement('div');
            _sliderContainer.className = 'zoomSlider';
                
            $(_slider).slider({ 
                orientation: "vertical",
                min: 1,
                max: 60,
                value: 10,
                slide: function( event, ui ) {}
            });
            _sliderContainer.appendChild(_slider);
                
                
            
            var allowMove = false;

            var zoomValue = zinjs.info.canvas.scale()*10;
            function zoomuj( direction ){
                if(allowMove ) {
                    if(direction == 'IN') {
                        zoomValue += 1;
                    }
                    else {
                        zoomValue -= 1;
                    }
                    $( _slider ).slider( "option", "value", zoomValue );
                    console.log(_slider);
                    setTimeout(function() {
                        zinjs.info.canvasScale.addCss({
                            transitionDuration: '0.05s',
                            transitionDelay: '0s',
                            transform: {
                                perspective: zinjs.info.config.perspective/0.1,
                                scale: zoomValue/10
                            }
                        });
                        zoomuj(direction); //TODO: explain to jarda
                    },50);
                //console.log("zoom " + direction + " couter: " + zoomValue);
                }
            }
            function startZoom (e){
                allowMove = true;
                zoomValue = $(slider).slider( "option", "value");
                e.preventDefault();
                var direction = 'OUT';
                if(e.target.className == 'zoomIn')
                    direction = 'IN';
                zoomuj(direction);
            }

            var _buttonZoomIn = document.createElement('a');
            _buttonZoomIn.className = 'zoomIn';
            _buttonZoomIn.onmousedown = startZoom;
            _buttonZoomIn.setAttribute('href', '#');
            _sliderContainer.appendChild( _buttonZoomIn );
                
            var _buttonZoomOut = document.createElement('a');
            _buttonZoomOut.className = 'zoomOut';
            _buttonZoomOut.onmousedown = startZoom;
            _buttonZoomOut.setAttribute('href', '#');
            _sliderContainer.appendChild( _buttonZoomOut );
                
            _divPanel.appendChild(_sliderContainer);
            slider = _slider;
            
            //bind event "on slide"
            $(_slider).on( "slide", function( event, ui ) { 
                var value = $( _slider ).slider( "value" );
                zinjs.info.canvasScale.addCss({
                        transitionDuration: '0.05s',
                        transitionDelay: '0s',
                        transform: {
                            perspective: zinjs.info.config.perspective/0.1,
                            scale: value/10
                        }
                    });
            });
        }
            
        //stop mooving
        $('*').mouseup(function() {
            allowMove = false;
        });
                
        function moveCanvas(direction){
            var trans = zinjs.info.canvasTranslate._styles._css['transform']['translate'];
            var transArr = trans.split(',');
            var xx = parseInt(transArr[0], 10);
            var yy = parseInt(transArr[1], 10);
            var moveX = 0,moveY = 0;
                
            switch(direction) {
                case "UP":
                    moveY = parseInt(properties.canvasMove);
                    break;
                case "RIGHT":
                    moveX =  parseInt(properties.canvasMove) * (-1);
                    break;
                case "LEFT":
                    moveX = parseInt(properties.canvasMove);
                    break;
                case "DOWN":
                    moveY = parseInt(properties.canvasMove) * (-1);
                    break;    
            }
            if(allowMove) {
                zinjs.info.canvasTranslate.addCss({
                    transform: {
                        translate: (xx + moveX) + 'px,' + (yy + moveY) + 'px'
                    }
                });
                setTimeout(function() {
                    moveCanvas(direction);
                },25);
            }    
        }
        
        
        /*
             * Conrol panel events
             **/
        function arrowUpClick(e){
            allowMove = true;
            moveCanvas("UP");
            e.preventDefault();
        }
        function arrowDownClick(e){
            allowMove = true;
            moveCanvas("DOWN");
            e.preventDefault();
        }
        function arrowLeftClick(e){
            allowMove = true;
            moveCanvas("LEFT");
            e.preventDefault();
        }
        function arrowRightClick(e){
            allowMove = true;
            moveCanvas("RIGHT");
            e.preventDefault();
        }

        function homeButtonClick(e){
            ek = $.Event('keydown');
            ek.keyCode = 27;
            $(document).trigger(ek);
            e.preventDefault();
        }
        function presentationLeftClick(e){
            ek = $.Event('keydown');
            ek.keyCode = 37;
            $(document).trigger(ek);
            e.preventDefault();
        }
        function presentationRightClick(e){
            ek = $.Event('keydown');
            ek.keyCode = 39;
            $(document).trigger(ek);
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
            var offset = $(control).offset();
                
            if( rotateCenter.x == undefined || rotateCenter.y == undefined ) {
                rotateCenter.x = (offset.left) + ($(control).width() / 2);
                rotateCenter.y = (offset.top) + ($(control).height() / 2);
            }

            var mouse_x = e.pageX;
            var mouse_y = e.pageY;
            var radians = Math.atan2(mouse_x - rotateCenter.x, mouse_y - rotateCenter.y);
            var degree = (radians * (180 / Math.PI) * -1) + 180 ;
            var rotatePanel = new zinjs.Container(control);
            rotatePanel.addCss({
                transitionDuration: '0s',
                transitionDelay: '0s',
                transform: {
                    rotateZ: degree + 'deg'
                }
            });

            // zinjs.info.canvasTranslate.rotate( degree, 0, 0, 1);
            zinjs.info.canvasTranslate.addCss({
                transitionDuration: '0s',
                transitionDelay: '0s',
                transform: {
                    rotateZ: degree + 'deg'
                }
            });
        }
    }
    );
