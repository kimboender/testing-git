/**
	Popup
	
	Dit object zorgt voor het openen en sluiten van de data van een popup.
	
	@param		options				JS object literal met de opties van de Popup
*/
function Popup(options) {
	// Standaard opties
	this.options = {
		callbackOpen: null,
		callbackClose: null,
		loading: 'Laden...',
		useCloseEsc: true,
		useCloseButton: true,
		useCloseOverlay: true
	};
	
	// Opties via het aanmaken van het object
	if(typeof options != "undefined") {
		var prop;
		
		for (prop in options) {
		    if(this.options.hasOwnProperty(prop)) {
		        this.options[prop] = options[prop];
		    }
		}
	}
	
	// Overige vars
	this.listenToEsc = false;
	this.isOpen = false;
	this.checked = false;
	this.type = 'popup';
	this.isLoading = false;
	
	// Uitvoeren activate functie
	this.activate();
}

Popup.prototype = {
    /**
    	Popup.activate()
    	
    	Deze functie zorgt ervoor dat elementen voor de popup klaar worden gezet.
    */
    activate: function() {
    	var popup = this;
    	
    	// Overlay
    	popup.overlay();
    },
    
    /**
    	Popup.overlay()
    	
    	Deze functie bereid de overlay van de popup voor
    */
    overlay: function() {
    	var popup = this;
    	
    	if($('#overlay').length == 0) {
    		var html = '<div id="overlay"></div>';
    		$('body').append(html);
    		
    		$('#overlay').css({
    			position: 'absolute',
    			left: 0,
    			top: 0,
    			height: '800px',
    			width: '100%',
    			background: '#000',
    			opacity: '0.6',
    			display: 'none',
    			'z-index': '999'	
    		});
    		
    		if(popup.options.useCloseOverlay === true) {
        		$('#overlay').click(function() {
        			popup.close();
        		});
    		}
    	}
    	else if (popup.checked == false) {
    		$('#overlay').css({
    			opacity: '0.6'	
    		});
    		
    		popup.checked = true;
    	}
    	
    	// Laat de browser luisteren naar de ESC-knop
    	if(popup.options.useCloseEsc === true) {
        	$(document).keyup(function(e) {
        		if(e.keyCode == 27 && popup.listenToEsc) {
        			popup.close();
        		}
        	});
    	}
    },
    
    /**
    	Popup.setContent()
    	
    	Deze functie plaatst de content in de popup
    	
    	@param	c			string		Inhoud van de popup (HTML)
    */
    setContent: function(c) {
    	var popup = this;
    	
    	// Als de popup niet bestaat, aanmaken
    	if($('#popup').length == 0) {
    		// HTML samenstellen
    		var html = '<div id="popup"';
    		if(popup.type == 'dialog') html += ' class="dialog"' // Dialoog moet extra class hebben
    		html += '>';
    		if(popup.options.useCloseButton === true) html += '<div id="popup-sluiten">Sluiten</div>'; // Sluiten alleen laten zien indien nodig
    		html += '<div id="popup-content"></div></div>';
    		
    		// HTML in de body plaatsen
    		$('body').append(html);
    		
    		// Als het een normale popup is moet er nog wat CSS toegepast worden
    		if(popup.type == 'popup') {
        		$('#popup-content').css({
        			margin: '15px 0 15px 15px',
        			padding: '0 15px 0 0',
        			overflow: 'auto'
        		});
    		}
        }
        
		// Content van de popup plaatsen
		$('#popup-content').html(c);
        
        // CSS
    	$('#popup').css({
    		position: 'absolute',
    		left: 0,
    		top: 0,
    		width: '750px',
    		maxWidth: '90%',
    		maxHeight: '90%',
    		/* overflow: 'none', */
    		background: '#fff',
    		display: 'none',
    		'z-index': '999999999'
    	});
    	
    	$('#popup-sluiten').css({
    		position: 'absolute',
    		top: '-12px',
    		right: '-12px',
    		width: '32px',
    		height: '32px',
    		textIndent: '-1000px',
    		overflow: 'hidden',
    		cursor: 'pointer',
    		'z-index': '200'
    	}).click(function() {
    		popup.close();
    	});
    		
        /**
            Als de popup zichtbaar is moet deze gecentreerd worden na scrollen.
            De properties van het scherm moeten gebruikt worden uit $window, als deze
            bestaat. Anders moeten de properties van $(window) gebruikt worden.
        */
    	if(typeof $window != 'undefined') {
    		$window.scroll(function () { 
    			popup.center();
    		}).resize(function() {
    			popup.center(true);
    		});
    	}
    	else {        		
    		$(window).scroll(function () { 
    			popup.center();
    		}).resize(function() {
    			popup.center(true);
    		});
    	}
    },
    
    /**
    	Popup.resetContent()
    	
    	Deze functie zet nieuwe inhoud in de popup
    	
    	@param	c			string		Inhoud van de popup (HTML)
    */
    resetContent: function(c) {
        var popup = this;
        if(typeof c == 'undefined' || c == '') c = $('#popup-content').html();
        
        $('#popup').remove();
        popup.setContent(c);
        popup.open();
    },
    
    /**
    	Popup.open()
    	
    	Deze functie laat de popup zien
    */
    open: function() {
    	var popup = this;
    		
    	// Overlay uitrekken
    	$('#overlay').css({
    		'height':$(document).height()+'px'
    	});
    	
    	// Popup uitlijnen
    	$('#popup').center();
    	
    	// Inhoud van de popup de goede hoogte
    	if(popup.type == 'popup') {
        	$('#popup-content').css({
        		height: ($('#popup').height()-30)+'px'
        	});
    	}
    	
    	// Luisteren naar de ESC toets
    	if(popup.options.useCloseEsc === true) popup.listenToEsc = true;
    	
    	// Zet de var open op true
    	popup.isOpen = true;
    	
    	// Overlay en dan popup tonen
    	$('#overlay').fadeIn(500,function() {
    		$('#popup').fadeIn(function() {
    			if(typeof popup.options.callbackOpen == 'function') {
    				popup.options.callbackOpen();
    			}
    		});
    	});
    },
    
    /**
    	Popup.close()
    	
    	Deze functie haalt de popup weg
    */
    close: function() {
    	var popup = this;
    	
    	// Niet meer luisteren naar de ESC toets
    	if(popup.options.useCloseEsc === true) popup.listenToEsc = false;
    	
    	// Zet de var open op false
    	popup.isOpen = false;
    	
    	$('#popup').fadeOut(function() {
    		if(typeof popup.options.callbackClose == 'function') {
    			popup.options.callbackClose();
    		}
    		$('#popup').remove();
    	});
    	$('#overlay').fadeOut(function() {
    		//$('#overlay').remove();
    	});
    },
    
    setWidth: function(w) {
        var popup = this;
        $('#popup').css({
            width: w
        });
        popup.center();
    },
    
    setType: function(t) {
        var popup = this;
        if(t != '' && in_array(t,['popup','dialog'])) popup.type = t;
    },
    
    /**
    	Popup.center()
    	
    	Deze functie centreert een zichtbare popup zowel verticaal als horizontaal
    	
    	@param	delay		boolean		Geeft aan of er een timeout gebruikt moet worden om het centreren te vertragen
    */
    center: function(delay) {
    	var popup = this;
    	
    	if($('#popup').is(':visible')) {
    		if(delay != false) $('#popup').center();
    		else {
    			setTimeout(function() {
    				$('#popup').center();
    			}, 500);
    		}
    	}
    	
    	// Overlay uitrekken
    	$('#overlay').css({
    		'height':$(document).height()+'px'
    	});
    },
    
    /**
        Popup.prototype.loading()
        
        Deze functie maakt een divje waarin staat dat er geladen wordt
    */
    loading: function() {
        var popup = this;
        
        if($('#loading').length == 0) {
            var html = '<div id="loading"><div id="loading-content">'+popup.options.loading+'</div></div>';
            
    		$('body').append(html);
    		
    		$('#loading').css({
    			position: 'absolute',
    			left: (($(window).width() - 200) / 2) + 'px',
    			top: $(window).scrollTop() + 'px',
    			width: '200px',
    			height: '35px',
    			background: '#FFF484',
    			borderWidth: '0px 2px 2px 2px',
    			borderStyle: 'solid',
    			borderColor: '#FFE377',
    			display: 'none',
    			color: '#000',
    			'z-index': '999999999'
    		});
    		
    		$('#loading-content').css({
    			padding: '5px',
    			overflow: 'auto',
    			textAlign: 'center'
    		});
        }
        
    	// Overlay uitrekken
    	$('#overlay').css({
    		'height':$(document).height()+'px'
    	});
        
    	// Overlay en dan popup tonen
    	$('#overlay').fadeIn(500,function() {});
    	$('#loading').slideDown();
    	
    	popup.isLoading = true;
    	
        /**
            Als de loading zichtbaar is moet deze gepositioneerd worden na scrollen.
            De properties van het scherm moeten gebruikt worden uit $window, als deze
            bestaat. Anders moeten de properties van $(window) gebruikt worden.
        */
		if(typeof $window != 'undefined') {
    		$window.scroll(function () { 
    			$('#loading').css({
    			    top: $(window).scrollTop() + 'px',
    			});
    		}).resize(function() {
    			$('#loading').css({
    			    top: $(window).scrollTop() + 'px',
    			});
    		});
		}
		else {        		
    		$(window).scroll(function () { 
    			$('#loading').css({
    			    top: $(window).scrollTop() + 'px',
    			});
    		}).resize(function() {
    			$('#loading').css({
    			    top: $(window).scrollTop() + 'px',
    			});
    		});
		}
    },
	
	unload: function() {
    	var popup = this;
		if(popup.isLoading) {
        	popup.isLoading = false;
        	$('#loading').slideUp();
    	}
	}
}