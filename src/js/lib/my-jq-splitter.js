/* globals jQuery, window, define, document */
(function() {
    function myJqSplitter($) {
        /**
         * @constructor
         */    	
    	function blockSplit(node, options) {
    		blockSplit.prototype.generator++;
            this.id = this.generator.toString();
    		
            this.node = node;
            
            this.options = this.sanitizeOptions( node, $.extend( true , {} , this.defaultOptions , options ) );
            
            ////console.debug(this.options);
                        
            this.togglerEnabled = this.options.toggler;
            
            this.resizeable = this.options.resizeable;
            
            this.onResize = ('function' == typeof this.options.onResize)?this.options.onResize:null;
            
            this.resizerZIndex = (options.resizerZIndex === null)?null:parseInt(options.resizerZIndex, 10);
                       
            this.init();
    		
    	}
    	
    	blockSplit.prototype = {
                generator: 0, // n° d'ordre de l'instance (attribut commun à toutes les instances)
                               
                sidePaneVisible: true, // Le volet latéral est visible
                
                resizerSize: 0, // taille de la barre de redimensionnement en pixels
                
                resizer: null, // objet barre de redimensionnement
                
                onResize: null, // fonction trigger si redimensionnement
                                
                sidePanePosition: 'left', // position du paneau amovible par défaut
                
                storage: null, // stockage de l'état du DOM avant activation du plugin
                
                isBody: null, // le bloc est le noeud <body>
                
                options: null, // options passées au constructeur
                                
                mainPane: null, // volet fixe (objet jQuery associé à un noeud du DOM)
                
                sidePane: null, // volet mobile (objet jQuery associé à un noeud du DOM)
                
                sidePaneSize: null, // taille du volet mobile en pixels
                                               
                //reduceMode: 'ratio',
                
                //enlargeMode: 'keep',
                
                defaultOptions: { // options par défaut
                    onResize: null,
                    toggler: false,
                    size : 200,
                    resizeable: false,
                    resizerZIndex: null
                },
                
                sanitizeOptions: function(node, options) {
                	if ('boolean' !== typeof options.toggler) {
                		options.toggler = false;
                	}
                	
                	if ('boolean' !== typeof options.resizeable) {
                		options.resizeable = false;
                	}
                	
                	if (!options.resizeable) {
                		options.resizerZIndex = null;
                	}
                	
                	if (!(/^(left|right|top|bottom)$/).test(options.position)) {
                		options.position = 'left';
                	}
                	
                	if (typeof options.mainPane === 'string') {
                		options.mainPane = $(options.mainPane);
                	}
                	
                	if (!( (typeof options.mainPane === 'object') && (options.mainPane !== null) &&  options.mainPane.jquery && (options.mainPane.length === 1) && (options.mainPane.parent().is(node)) )) {
                		options.mainPane = null;
                	}
                	
                	if (typeof options.sidePane === 'string') {
                		options.mainPane = $(options.sidePane);
                	}
                	
                	if (!( (typeof options.sidePane === 'object') && (options.sidePane !== null) &&  options.sidePane.jquery && (options.sidePane.length === 1) && (options.sidePane.parent().is(node)) )) {
                		options.sidePane = null;
                	}
                	
                	// @todo size (nombre en pixel attendu)
                	                	
                	return options;
                },
                
                init: function() { // initialisation des attributs
                	var i, n,
                	    paneCssAttributes = ['margin', 'border', 'display', 'position', 'height', 'width', 'left', 'right', 'top', 'bottom'];
                	
                	this.isBody = ('BODY' === this.node.get(0).nodeName.toUpperCase());
                	                    
                    /*
                    $(document).on('mousewheel.myJqSplitter', function(e) { // corrige un pb dans chrome (scroll non désiré)
                        if (e.originalEvent) {
                            if ((e.originalEvent.target)&& (e.originalEvent.target.parentNode)&&(e.originalEvent.target.parentNode.parentNode == document.body)) {
                                    e.preventDefault();
                            }
                        }
                        
                        return true;
                    });
                    */
                    
                    if (this.options.mainPane === null) {
                    	this.mainPane = $('<div></div>');
                    }
                    
                    if (this.options.sidePane === null) {
                    	this.sidePane = $('<div></div>');
                    }
                    
                    this.sidePanePosition = this.options.position;
                    
                    this.sidePaneVisible = true;
                    
                    this.sidePaneSize = this.options.size;
                    
                    this.storage = {
                    		childNodes: [],
                    		css: {
		                        margin: this.node.css('margin'),
		                        padding: this.node.css('padding'),
		                        border: this.node.css('border'),
		                        display: this.node.css('display'),
		                        height: this.node.css('height'),
		                        width: this.node.css('width')
                    		},
                    		mainPaneCss: {},
                    		sidePaneCss: {}
                    };
                    
                    for (i = this.node.children().length; i > 0; i--) {
                    	n = this.node.children().get(i-1);
                    	                    	
                    	if ((this.options.mainPane !== null) && this.options.mainPane.is(n)) {
                    		this.storage.childNodes.unshift('mainPane');
                    		this.mainPane = this.options.mainPane.detach();
                    	} else {
                        	if ((this.options.sidePane !== null) && this.options.sidePane.is(n)) {
                        		this.storage.childNodes.unshift('sidePane');
                        		this.sidePane = this.options.sidePane.detach();
                        	} else {
                        		this.storage.childNodes.unshift($(n).detach());
                        	}
                    	}
                    }
                    
                    for (i = 0; i < paneCssAttributes.length; i++) {
                    	this.storage.mainPaneCss[paneCssAttributes[i]] = this.mainPane.css(paneCssAttributes[i]);
                    }
                    
                    for (i = 0; i < paneCssAttributes.length; i++) {
                    	this.storage.sidePaneCss[paneCssAttributes[i]] = this.sidePane.css(paneCssAttributes[i]);
                    }
                    
                    this.node.data('my-jq-splitter', this);
                    
                    this.node.css('margin', '0')
                             .css('padding', '0')
                             .css('border', 'none')
                             .css('display', 'block')
                             .attr('my-jq-splitter-id', this.id)
                             .addClass('my-jq-splitter')
                             .data('my-jq-splitter', this);
                    
                    if ((this.sidePanePosition == 'top') || (this.sidePanePosition == 'left')) {
                    	this.node.append(this.sidePane).append(this.mainPane);
                    } else {
                    	this.node.append(this.mainPane).append(this.sidePane);
                    }
                    
                    if (this.isBody) { // hauteur fixée pour l'élément <body>
                    	this.node.height($(document).height());
	                }
                    
                    switch(this.sidePanePosition) {
	                    case 'top':
	                    	this.sidePane.css('display', 'block').css('margin', '0').css('position', 'absolute')
	                    	             .css('top', '0').css('width', '100%').css('height', this.sidePaneSize.toString() + 'px');
	                        this.mainPane.css('display', 'block').css('margin', '0').css('position', 'absolute')
	                                     .css('bottom', '0').css('width', '100%');
	                    	break;
                    	
	                    case 'bottom':
	                    	this.sidePane.css('display', 'block').css('margin', '0').css('position', 'absolute')
	                    	             .css('bottom', '0').css('width', '100%').css('height', this.sidePaneSize.toString() + 'px');
	                        this.mainPane.css('display', 'block').css('margin', '0').css('position', 'absolute')
	                                     .css('top', '0').css('width', '100%');
	                    	break;
                    
	                    case 'right':
	                    	this.sidePane.css('display', 'block').css('margin', '0').css('position', 'absolute')
	                    	             .css('right', '0').css('height', '100%').css('width', this.sidePaneSize.toString() + 'px');
	                        this.mainPane.css('display', 'block').css('margin', '0').css('position', 'absolute')
	                                     .css('left', '0').css('height', '100%');
	                    	break;
	                    	
	                    case 'left':
	                    default:
	                    	this.sidePane.css('display', 'block').css('margin', '0').css('position', 'absolute')
	                    	             .css('left', '0').css('height', '100%').css('width', this.sidePaneSize.toString() + 'px');
	                        this.mainPane.css('display', 'block').css('margin', '0').css('position', 'absolute')
	                                     .css('right', '0').css('height', '100%');
	                    	break;
                    }
                    
                    if (this.resizeable || this.togglerEnabled) {
                        this.resizer = new splitterResizer(this, this.resizeable, this.resizerZIndex);
                        
                        this.resizerSize = this.resizer.size;
                        
                        this.resizer.show();
                    }
                                        
                    this.resizePanes();
                },
                
                resizePanes: function() { // redimensionnement des volets
                	////console.debug('blockSplit.resizePanes');
                	var s;
                	
                	switch(this.sidePanePosition) {
	            		case 'top':
	            		case 'bottom':
                        	s = this.getSidePaneHeight();
                            if (this.resizer) { 
                                s += this.resizerSize;
                            }
                            s = Math.round(s);
                            break;
                		case 'right':
                		case 'left':
                		default:
                        	s = this.getSidePaneWidth();
                            if (this.resizer) { 
                                s += this.resizerSize;
                            }
                            s = Math.round(s);
                            break;
                	}
                	                    
                    switch(this.sidePanePosition) {
	            		case 'top':
	                        this.mainPane.css('top', s.toString() + 'px');
	                    	this.sidePane.css('height', this.sidePaneSize.toString() + 'px');
	                    	break;
	            		case 'bottom':
	                        this.mainPane.css('bottom', s.toString() + 'px');
	                        this.sidePane.css('height', this.sidePaneSize.toString() + 'px');
	                    	break;
	                    case 'right':
	                        this.mainPane.css('right', s.toString() + 'px');
	                        this.sidePane.css('width', this.sidePaneSize.toString() + 'px');
	                    	break;
	                    case 'left':
	                    default:
	                        this.mainPane.css('left', s.toString() + 'px');
	                        this.sidePane.css('width', this.sidePaneSize.toString() + 'px');
	                    	break;
	                }
                                    	
                    if (this.resizer) {
                        this.resizer.updatePosition();
                    }
                    
                    $('.my-jq-splitter', this.node).each(function(index) {
                    	var splitter = $(this).data('my-jq-splitter');
                    	
                    	if (splitter && (typeof splitter.resizePanes === 'function')) {
                    		splitter.resizePanes();
                    	}
                    });
                    
                    if (this.onResize) { this.onResize(); }
                },
                
                getSidePaneWidth: function() { // calcul de la largeur du volet latéral
                    if (!this.sidePaneVisible) return 0;
                    
                    return this.sidePaneSize;
                },
                
                getSidePaneHeight: function() { // calcul de la hauteur du volet latéral
                    if (!this.sidePaneVisible) return 0;
                    
                    return this.sidePaneSize;
                },
                
                getHeight: function() { // caclul de la hauteur du bloc à diviser
                	if (this.isBody) {
                		return $(document).height();
                	} else {
                		return this.node.height();
                	}
                	
                },
                
                getWidth: function() { // caclul de la largeur du bloc à diviser
                	if (this.isBody) {
                		return $(document).width();
                	} else {
                		return this.node.width();
                	}
                	
                },
                
                setSidePaneSize: function(size) { // taille de volet latéral en pixels
                	this.sidePaneSize = size;
                },
                
                isSidePaneVisible: function() { // le volet latéral est visible?
                	return this.sidePaneVisible;
                },
                
                getSidePanePosition: function() { // position du volet latéral
                	return this.sidePanePosition;
                },
                
                showSidePane: function() { // affiche le volet latéral
                	////console.log('blockSplit.showSidePane');
                	this.sidePane.css('display', 'block');
                	this.sidePaneVisible = true;
                	
                	if (this.resizer) {
                        this.resizer.updatePosition();
                	}
                	
                	this.resizePanes();
                },
                
                hideSidePane: function() { // cache le volet latéral
                	////console.log('blockSplit.hideSidePane');
                	this.sidePaneVisible = false;
                	this.sidePane.css('display', 'none');
                	
                	if (this.resizer) {
                        this.resizer.updatePosition();
                	}
                	
                	this.resizePanes();
                }
    	};
    	
        
        /**
         * @constructor
         */
        var splitterResizer = function(blockSplit, resizeable, zIndex) { // Constructeur
            this.blockSplit = blockSplit;
            
            this.resizeable = resizeable;
            
            this.zIndex = zIndex;
            
            this.init();
            
            if (this.resizeable) {
            	this.initResizeable();
            }
        };
            
        splitterResizer.prototype = {
            size: 10, // taille de la barre de redimensionnement en pixels
            
            node: null,
            
            toggler: null,
            
            draggableResizer: null, 
            
            draggableToggler: null,
            
            togglerEnabled: false,
            
            init: function() {
                this.resizerMoveAxis = ((this.blockSplit.sidePanePosition == 'left')||(this.blockSplit.sidePanePosition == 'right'))?'horizontal':'vertical';
                
                this.node = $('<div class="my-jq-splitter-resizer" style="display: none;' + ((null === this.zIndex)?'':' z-index:' + this.zIndex+';') + '" ></div>')
                            .addClass(this.resizerMoveAxis)
                            .appendTo(this.blockSplit.node);
                
                if (this.resizerMoveAxis == 'horizontal') {
                	this.node.css('height','100%').width(this.size);
                } else {
                	this.node.css('width','100%').height(this.size);
                }
                
                this.toggler = new splitterToggler(this);
                
                if (this.blockSplit.togglerEnabled) {
                    this.enableToggler();
                } else {
                    this.disableToggler();
                }
            },
            
            initResizeable: function() {
                this.draggableResizer = $('<div class="my-jq-splitter-resizer" style="position: absolute; ' + ((null === this.zIndex)?'':' z-index:'+this.zIndex+';') + '" ></div>')
                                        .addClass(this.resizerMoveAxis)
                                        .appendTo(this.blockSplit.node);
                
                if (this.resizerMoveAxis == 'horizontal') {
                	this.draggableResizer.css('height','100%').width(this.size);
                } else {
                	this.draggableResizer.css('width','100%').height(this.size);
                }
                
                this.draggableToggler = this.toggler.node.clone(false);
                
                this.draggableToggler.css('position', 'absolute')
                                     .css('display', this.togglerEnabled?'block':'none')
                                     .css('cursor', 'pointer');
                
                this.draggableResizer.append(this.draggableToggler);
                
                this.refreshResizeableControls();
                
                this.bindResizeableEventHandlers();
            },
            
            refreshResizeableControls: function() {
            	////console.log('splitterResizer.refreshResizeableControls');
                var resizerContainerSize = this.size, resizerPos = 0, sz = 0, i;
                
                switch (this.blockSplit.sidePanePosition) {
                    case 'right': 
                        this.draggableResizer.css('top', '0').css('bottom', '0')
                                             .css('left', (this.blockSplit.node.width() - this.size - this.blockSplit.getSidePaneWidth()).toString() + 'px');
                        
                        break;
                    case 'left': 
                        this.draggableResizer.css('top', '0').css('bottom', '0')
                                             .css('left', this.blockSplit.getSidePaneWidth().toString() + 'px');
                        break;
                    case 'bottom':                     	
                        this.draggableResizer.css('left', '0').css('right', '0')
                                             .css('top', (this.blockSplit.node.height() - this.size - this.blockSplit.getSidePaneWidth()).toString() + 'px');                       
                        break;
                    case 'top':                   	
                        this.draggableResizer.css('left', '0').css('right', '0')
                                             .css('top', this.blockSplit.getSidePaneWidth().toString() + 'px');
                        
                        break; 
                }
                
                switch (this.resizerMoveAxis) {
                    case 'horizontal' : 
                        this.draggableToggler.css(
                            'top', 
                            (Math.floor(0.5*(this.blockSplit.getHeight() - this.toggler.height))).toString() + 'px'
                        );
                    break;
                    case 'vertical' : 
                        this.draggableToggler.css(
                            'left',
                            Math.floor(0.5 * (this.blockSplit.getWidth() - this.toggler.size)).toString() + 'px'
                        );
                    break;
                } 
                
                this.draggableToggler.attr('class', this.toggler.node.attr('class'));                
            },
            
            
            bindResizeableEventHandlers: function() {
            	////console.log('splitterResizer.bindResizeableEventHandlers');
                var z = this, x0 = 0, y0 = 0, x1 = 0, y1 = 0;
                        
                this.draggableResizer.draggable({ 
                    containment: "parent",
                    start: function(e, ui) { 
                        y0 = z.draggableResizer.position().top; x0 = z.draggableResizer.position().left;
                                               
                        return true;
                    },
                    stop: function(e, ui) {
                        var newWidth, newHeight, newSidePaneWidth, max, i;
                        
                        y1 = z.draggableResizer.position().top; x1 = z.draggableResizer.position().left;
                                                
                        switch(z.blockSplit.sidePanePosition) {
                            case 'right': 
                                newSidePaneWidth = ((z.blockSplit.sidePaneVisible)?z.blockSplit.sidePaneSize:0) + x0 - x1;
                                
                                if (0 > newSidePaneWidth) { newSidePaneWidth = 0; }
                                
                                max = z.blockSplit.node.width();
                                
                                if (max < newSidePaneWidth) { newSidePaneWidth = max; }
                                
                                newSidePaneWidth = Math.floor(newSidePaneWidth);
                                
                                if (z.blockSplit.togglerEnabled) {
                                	if (newSidePaneWidth === 0) { // largeur 0, on replie  
                                		z.blockSplit.setSidePaneSize((max < 200)?max:200);
                                        z.toggler.node.trigger('click.myJqSplitter');
                                	} else {
                                		if (!z.blockSplit.isSidePaneVisible()) { // replié, on déplie
                                			z.toggler.node.trigger('click.myJqSplitter');
                                		}
                                		
                                		z.blockSplit.setSidePaneSize(newSidePaneWidth);
                                	}
                                } else {
                                	z.blockSplit.setSidePaneSize(newSidePaneWidth);
                                }
                                                                  
                                break;
                            case 'left':
                                newSidePaneWidth = ((z.blockSplit.sidePaneVisible)?z.blockSplit.sidePaneSize:0) + x1 - x0;
                                
                                if (0 > newSidePaneWidth) { newSidePaneWidth = 0; }
                                
                                max = z.blockSplit.node.width();
                                
                                if (max < newSidePaneWidth) { newSidePaneWidth = max; }
                                
                                newSidePaneWidth = Math.floor(newSidePaneWidth);
                                                                
                                if (z.blockSplit.togglerEnabled) {
                                	if (newSidePaneWidth === 0) { // largeur 0, on replie  
                                		z.blockSplit.setSidePaneSize((max < 200)?max:200);
                                        z.toggler.node.trigger('click.myJqSplitter');
                                	} else {
                                		if (!z.blockSplit.isSidePaneVisible()) { // replié, on déplie
                                			z.toggler.node.trigger('click.myJqSplitter');
                                		}
                                		
                                		z.blockSplit.setSidePaneSize(newSidePaneWidth);
                                	}
                                } else {
                                	z.blockSplit.setSidePaneSize(newSidePaneWidth);
                                }
                                                                  
                                break;
                            case 'top':
                                newSidePaneHeight = ((z.blockSplit.sidePaneVisible)?z.blockSplit.sidePaneSize:0) + y1 - y0;
                                
                                if (0 > newSidePaneHeight) { newSidePaneHeight = 0; }
                                
                                max = z.blockSplit.getHeight();
                                
                                if (max < newSidePaneHeight) { newSidePaneHeight = max; }
                                
                                newSidePaneHeight = Math.floor(newSidePaneHeight);
                                                                
                                if (z.blockSplit.togglerEnabled) {
                                	if (newSidePaneHeight === 0) { // largeur 0, on replie  
                                		z.blockSplit.setSidePaneSize((max < 200)?max:200);
                                        z.toggler.node.trigger('click.myJqSplitter');
                                	} else {
                                		if (!z.blockSplit.isSidePaneVisible()) { // replié, on déplie
                                			z.toggler.node.trigger('click.myJqSplitter');
                                		}
                                		
                                		z.blockSplit.setSidePaneSize(newSidePaneHeight);
                                	}
                                } else {
                                	z.blockSplit.setSidePaneSize(newSidePaneHeight);
                                }
                                                                  
                                break;
                            case 'bottom':
                                newSidePaneHeight = ((z.blockSplit.sidePaneVisible)?z.blockSplit.sidePaneSize:0) + y0 - y1;
                                
                                if (0 > newSidePaneHeight) { newSidePaneHeight = 0; }
                                
                                max = z.blockSplit.getHeight();
                                
                                if (max < newSidePaneHeight) { newSidePaneHeight = max; }
                                
                                newSidePaneHeight = Math.floor(newSidePaneHeight);
                                
                                if (z.blockSplit.togglerEnabled) {
                                	if (newSidePaneHeight === 0) { // largeur 0, on replie  
                                		z.blockSplit.setSidePaneSize((max < 200)?max:200);
                                        z.toggler.node.trigger('click.myJqSplitter');
                                	} else {
                                		if (!z.blockSplit.isSidePaneVisible()) { // replié, on déplie
                                			z.toggler.node.trigger('click.myJqSplitter');
                                		}
                                		
                                		z.blockSplit.setSidePaneSize(newSidePaneHeight);
                                	}
                                } else {
                                	z.blockSplit.setSidePaneSize(newSidePaneHeight);
                                }
                                                                  
                                break;
                        }
                        
                        z.blockSplit.resizePanes();
                        
                        return true;
                    }
                });
                                
                this.draggableToggler.on('click.myJqSplitter', function(e) {
                    z.toggler.node.trigger('click.myJqSplitter');
                    
                    return true;
                });
            },
            
            enableToggler: function() {
                this.togglerEnabled = true;
                
                if (this.node.css('display') !== 'none') {
                    this.toggler.show();
                }
            },
            
            disableToggler: function() {
                this.togglerEnabled = false;
                
                this.toggler.hide();
            },
                        
            hide: function() {
                this.node.css('display', 'none');
                
                if (this.togglerEnabled) {
                    this.toggler.hide();
                }
            },
            
            show: function() {
                this.node.css('display', 'block'); 
                
                if (this.togglerEnabled) {
                    this.toggler.show();
                }
            },
            
            updatePosition: function() {
            	////console.log('splitterResizer.updatePosition');
            	if (!this.blockSplit) return;
            	
            	if (this.blockSplit.isSidePaneVisible()) {
            		switch(this.blockSplit.getSidePanePosition()) {
	            		case 'top':
	            			this.node.css('top', this.blockSplit.getSidePaneHeight().toString() + 'px');
	            			break;
	            		case 'bottom':
	            			this.node.css('bottom', this.blockSplit.getSidePaneHeight().toString() + 'px');
	            			break;
	            		case 'right':
	            			this.node.css('right', this.blockSplit.getSidePaneWidth().toString() + 'px');
	            			break;
	            		case 'left':
	            		default:
	            			this.node.css('left', this.blockSplit.getSidePaneWidth().toString() + 'px');
	            			break;
            		}
            	} else {
            		this.node.css(this.blockSplit.getSidePanePosition(), '0');
            	}
            	
                if (this.resizeable) {
                    this.refreshResizeableControls();
                }
            	
            	this.setTogglerPos();
            },
                       
            setTogglerPos: function() {
            	////console.log('splitterResizer.setTogglerPos');
            	
                if (this.resizerMoveAxis == 'horizontal') {
                    this.toggler.node.css('top', (Math.floor(0.5*(this.node.height() - this.toggler.height))).toString() + 'px' );
                } else {
                    this.toggler.node.css('left', (Math.floor(0.5*(this.node.width() - this.toggler.width))).toString() + 'px' );   
                }
            },
                       
            /*getHeight: function() {
            	console.log('splitterResizer.getHeight');
                if (this.node.css('display') == 'none') {
                	return 0;
                }
                
                if (this.resizerMoveAxis == 'vertical') {
                	return this.size;
                }
                
                return this.blockSplit.getSidePaneHeight();
            },*/
            
            /*getWidth: function() {
            	console.log('splitterResizer.getWidth');    
                if (this.node.css('display') == 'none') {
                	return 0;
                }
                
                if (this.resizerMoveAxis == 'horizontal') {
                	return this.size;
                }
                
                return this.blockSplit.getSidePaneWidth();
            },*/
            
            destroy: function() {
                delete this.blockSplit;
                
                if (this.toggler) {
                    this.toggler.destroy();
                    delete this.toggler;
                }
                
                if (this.draggableResizer) {
                    this.draggableResizer.remove();
                    delete this.draggableResizer;
                }
                
                this.node.remove();
                
                return;
            }
        };
        
        /**
         * @constructor
         */
        var splitterToggler = function(resizer) { // Constructeur
            this.resizer = resizer;
            
            this.blockSplit = resizer.blockSplit;
            
            this.init();
        };
        
        splitterToggler.prototype = {
            size: 40, // taille du bouton de fermeture en pixels
            
            width: 0,
            
            height: 0,
            
            init: function() {
                switch (this.blockSplit.sidePanePosition) {
                    case 'left'   : this.width = this.resizer.size - 2; this.height = this.size; break;
                    case 'right'  : this.width = this.resizer.size - 2; this.height = this.size; break;
                    case 'top'    : this.height = this.resizer.size - 2; this.width = this.size; break;
                    case 'bottom' : this.height = this.resizer.size - 2; this.width = this.size; break;
                }
                
                this.node = $('<div class="my-jq-splitter-toggler" style="display: none;" ></div>')
                              .addClass(this.blockSplit.sidePanePosition)
                              .height(this.height)
                              .width(this.width)
                              .appendTo(this.resizer.node);
                
                this.node.data('toggler', this);
                
                this.node.on('click.myJqSplitter', function(e) {
                    if ($(this).hasClass('closed')) {
                        $(this).removeClass('closed');
                        $(this).data('toggler').blockSplit.showSidePane();
                    } else {
                        $(this).addClass('closed');
                        $(this).data('toggler').blockSplit.hideSidePane();
                    }
                    
                });
            },
            
            hide: function() {
                this.node.css('display', 'none');
            },
            
            show: function() {
                this.node.css('display', 'block');
            },
            
            destroy: function() {
                delete this.resizer;
                
                delete this.blockSplit;
                
                this.node.remove();
                
                return;
            }
        };
    	   	
        var methods = {
            init : function( options ) { // fabrique l'objet blockSplit et attache celui-ci au noeud DOM
                if (0 < this.length) {
                    if (1 == this.length) {
                        new blockSplit( this , options );
                    } else {
                        this.each(function () {
                            this.blockSplit(options);
                        });
                    }
                } 
                
                return this;
            },
                        
            setOnResize : function( t ) { // change le déclencheur sur redimensionnement
                var o = ('function' === typeof t)?t:null;
                
                if (0 < this.length) {
                    if (1 == this.length) {
                        var bs = $(this).data('my-jq-splitter');
                        
                        if (bs instanceof blockSplit) {
                            bs.onResize = o;
                        }
                    } else {
                        this.each(function () {
                            this.myJqSplitter('setOnResize', t );
                        });
                    }
                }
                
                return this;
            },
            
            destroy : function() { // nettoyage 
                var blockSplit = $(this).data('my-jq-splitter');
                
                blockSplit.destroy();
                
                return this;
            }
        };
    	
        $.fn.myJqSplitter = function( method ) { // passage des paramètres façon jquery
            if ( methods[method] ) {
                 return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
            } else if ( typeof method === 'object' || ! method ) {
                 return methods.init.apply( this, arguments );
            } else {
                 $.error( 'Method ' +  method + ' does not exist on jQuery.myJqSplitter' );
            }
        };
    }
    
    if (typeof define === "function" && define.amd) {
        define('my-jq-splitter', ['jquery', 'jquery-ui'], myJqSplitter);
    } else {
        if (jQuery) {
        	myJqSplitter(jQuery);
        }
    }
})();