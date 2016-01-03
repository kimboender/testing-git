/**
	Browser
	
	Dit object i voor het weergeven van een foutmelding in de browser.
	
	@param		options				JS object literal met de opties van de Browser
*/
function Browser(options) {
	// Standaard opties
	this.options = {
		title: 'Hoi! Sorry dat we je lastig vallen, maar...',
		text: 'Op deze website maken we gebruik van nieuwe technieken. Helaas is je browser niet geschikt voor al deze technieken. Het kan dus zijn dat bepaalde onderdelen niet optimaal werken. Update je browser voor de beste ervaring op deze website. <a href="#meer-informatie" class="meer-informatie">Meer informatie?</a>',
		infoText: '<h2>Informatie over je browser</h2><p>Je kreeg net een melding dat je browser verouderd is. Geen probleem! We proberen de site altijd te laten werken in de laatste versie(s) van de grote browsers; Internet Explorer, Mozilla Firefox, Google Chrome en Apple Safari.</p><p>Maar, omdat je browser niet alle nieuwe functies ondersteund is het beter om te kijken voor een update van je browser.</p>',
		delay: 1500,
		visible: 15000,
		showTest: false,
		redirect: ['mq'], // False of arrayn met testen die ervoor zorgen dat de redirectpagina wordt geopend
		redirectPage: linkprefix + 'browser/'
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
	
	this.testData = {};
	
	// Uitvoeren
	if(this.getCookie('browser') == '') {
	    this.browserSupport();
	}
}

/**
	Browser.browserSupport()
	
	Deze functie test de mogelijkheden van de browser en laat, indien niet alle tests zijn
	geslaagd, een waarchuwing zien.
*/
Browser.prototype.browserSupport = function() {
	var browser = this,
		browserOk = true;
	
	// Doe de tests
	browser.testData['fontface'] = {'label': 'Externe lettertypen', 'status': Modernizr.fontface};
	browser.testData['borderradius'] = {'label': 'Afgeronde hoeken', 'status': Modernizr.borderradius};
	browser.testData['boxshadow'] = {'label': 'Schaduw', 'status': Modernizr.boxshadow};
	browser.testData['multiplebgs'] = {'label': 'Meerdere achtergronden', 'status': Modernizr.multiplebgs};
	browser.testData['opacity'] = {'label': 'Semi-transparantie', 'status': Modernizr.opacity};
	browser.testData['rgba'] = {'label': 'RGBA-kleuren', 'status': Modernizr.rgba};
	browser.testData['textshadow'] = {'label': 'Tekstschaduw', 'status': Modernizr.textshadow};
	browser.testData['generatedcontent'] = {'label': 'CSS gegenereerde inhoud', 'status': Modernizr.cssgradients};
	browser.testData['cssgradients'] = {'label': 'CSS gradients', 'status': Modernizr.cssgradients};
	browser.testData['svg'] = {'label': 'SVG', 'status': Modernizr.svg};
	browser.testData['inlinesvg'] = {'label': 'Inline SVG', 'status': Modernizr.inlinesvg};
	browser.testData['cssanimations'] = {'label': 'CSS Animaties', 'status': Modernizr.cssanimations};
	
	var mq = true;
	if(Modernizr.mq('only all') === false) mq = false;
	browser.testData['mq'] = {'label': 'Media queries', 'status': mq};
	
	for (prop in browser.testData) {
		if(browser.testData[prop].status == false) {
			browserOk = false;
			break;
		}
	}
	
	// Als browserOk nu geen true is, is de browser niet up-to-date
	if(!browserOk) {
		/**
            Als de browser niet up-to-date is, is het mogelijk dat we te maken hebben met
            'kleine' problemen, zoals schaduwen. Het is ook mogelijk dat de hele site niet
            goed geladen wordt, zoals media-queries.
            Controleer of in dat geval de gebruiker doorgestuurd moet worden naar een
            pagina met een foutmelding.
            Als de gebruiker niet doorgestuurd moet worden wordt er een balk boven aan de
            pagina getoond.
        */
        if(browser.options.redirect != false) {
            // Standaard geen redirect
            var redirect = false;
            
            // Loop door alle checks heen die een redirect kunnen geven
            for(var i = 0; i < browser.options.redirect.length; i++) {
                // Als de check niet gelukt is moet de redirect geactiveerd worden
                if(browser.testData[browser.options.redirect[i]].status === false) {
                    redirect = true;
                    break;
                }
            }
            
            /**
                Als redirect nu true is moet de browser doorgestuurd worden naar de
                redirect-pagina.
            */
            if(redirect === true) {
                location.href = browser.options.redirectPage;
            }
        }
        else {
            // Toon de balk met de melding van de verouderde browser
            browser.foutmelding();
        }
	}
}

/**
	Deze functie laat de waarschuwing zien.
*/
Browser.prototype.foutmelding = function() {
	browser = this;
	
	// Maak een element aan in de HTML voor de waarchuwing
	if($('#browser').length == 0) {
		var html = '<div id="browser"><div class="holder"><div class="title">'+browser.options.title+'</div><div class="text">'+browser.options.text+'</div></div></div>';
		$('body').prepend(html);
		
		// Opmaak van de foutmelding
		$('#browser').css({
			display: 'none'
		});
		
		$('#browser a.meer-informatie').on('click',function(e) {
			e.preventDefault();
			
			var html = browser.options.infoText;
			
			if(browser.options.showTest) {
				html += '<div class="hr"><hr /></div><h3>Testresultaten</h3><ul>';
				for (prop in browser.testData) {
					var status = 'Niet geslaagd';
					if(browser.testData[prop].status) status = 'Geslaagd';
					
					html += '<li>'+browser.testData[prop].label+': '+status+'</li>';
				}
				html += '</ul>';
			}
			
			var popup = new Popup();
			popup.setContent(html);
			popup.open();
		});
	}
	
	// Laat de browser een paar seconden na volledig laden zien
	if($('#browser').not(':visible')) {
		setTimeout(function() {
			$('#browser').slideDown(function() {
			    browser.setCookie('browser', '.', 1);
			    
				setTimeout(function() {
					$('#browser').slideUp();
				}, browser.options.visible);
			});
		}, browser.options.delay);
	}
}

/**
    Deze functie schrijft een cookie weg als de popup geopend wordt.
*/
Browser.prototype.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

/**
    Deze functie haalt een cookie op of geeft niets terug als de cookie niet bestaat.
*/
Browser.prototype.getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}

var browser = new Browser();