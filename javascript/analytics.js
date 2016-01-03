function Analytics() {
    this.googleAnalyticsProperties = [];
	this.anonymizeIp = false;
	this.debug = true;
    
    // Google Analytics toevoegen
    this.addGoogleAnalytics();
    
    /**
        Als de gebruiker 15 seconden op de pagina blijft moet er een event weggeschreven
        worden, zodat dit bezoek niet als bounce wordt weggeschreven.
    */
    var analytics = this;
    if(document.referrer.indexOf(document.domain) == -1)  {
        setTimeout(function() {
            analytics.trackGoogleAnalyticsEvent('Tijd','15 seconden');
        }, 15000);
    }
    
    /**
        Bij het klikken op een link moet gecontroleerd worden of het een externe link is.
        Deze moeten getraceerd worden in Google Analytics.
    */
    $('a').on('click',function(e){
        var link = $(this),
            url = link.attr('href');
        
        // Alleen uitvoeren als de link naar een externe host gaat
        if (!link.hasClass('no-analytics') && e.currentTarget.host != window.location.host && e.currentTarget.host != window.location.host+':80') {
            e.preventDefault();
            analytics.trackGoogleAnalyticsEvent('Outbound',e.currentTarget.host,url);
            
            // Open de link in een nieuwe tab
            window.open(url, '');
        }
    });
}

Analytics.prototype = {
    /**
        Deze functie wordt gebruikt om de Google Analytics service toe te voegen aan de
        pagina.
    */
    addGoogleAnalytics: function() {
        var analytics = this;
		
		// Controleren of er trackers zijn
		if(analytics.googleAnalyticsProperties.length < 1) {
			if(analytics.debug === true) console.log('Geen properties in Analytics.googleAnalyticsProperties.');
			return false;
		}
		
        // Universal Analytics
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        
        // Alle trackers maken
        for(var i = 0; i < analytics.googleAnalyticsProperties.length; i++) {
            ga('create', analytics.googleAnalyticsProperties[i], 'auto', {'name': 'tracker'+i});
            if(analytics.anonymizeIp === true) ga('tracker'+i+'.set', 'anonymizeIp', true);
            ga('tracker'+i+'.send', 'pageview');
        }
        
        /**
            Controleer of er een variabele 'page404' is.
        */
        if(typeof page404 != 'undefined') {
            analytics.trackGoogleAnalyticsPageview(page404);
        }
    },
    
    /**
        Deze functie wordt gebruikt om een event te tracken in Google Analytics.
    */
    trackGoogleAnalyticsEvent: function(category, action, label, value) {
        var analytics = this;
        
		// Controleren of er trackers zijn
		if(analytics.googleAnalyticsProperties.length < 1) {
			if(analytics.debug === true) console.log('Geen properties in Analytics.googleAnalyticsProperties.');
			return false;
		}
        
        // Actie wegschrijven in alle trackers
        for(var i = 0; i < analytics.googleAnalyticsProperties.length; i++) {
            ga('tracker'+i+'.send', 'event', category, action, label, value);
        }
    },
    
    /**
        Deze functie wordt gebruikt om een paginarequest te traceren in Google Analytics.
    */
    trackGoogleAnalyticsPageview: function(path) {
        var analytics = this;
		
		// Controleren of er trackers zijn
		if(analytics.googleAnalyticsProperties.length < 1) {
			if(analytics.debug === true) console.log('Geen properties in Analytics.googleAnalyticsProperties.');
			return false;
		}
        
        // Actie wegschrijven in alle trackers
        for(var i = 0; i < analytics.googleAnalyticsProperties.length; i++) {
            ga('tracker'+i+'.send', 'pageview', path);
        }
    },
    
    /**
        Deze functie traceert een download in Google Analytics door middel van
        Analytics.trackGoogleAnalyticsEvent().
    */
    trackGoogleAnalyticsDownload: function(type, name) {
        var analytics = this;
        analytics.trackGoogleAnalyticsEvent("Downloads", type, name, null);
    },
    
    /**
        Deze functie traceert een foutmelding of pagina met foutcode in Google Analytics
        door middel van Analytics.trackGoogleAnalyticsPageview().
    */
    trackGoogleAnalyticsErrorPage: function(errorCode) {
        var analytics = this,
            path = "/general/error-" + errorCode + "/?page=" + document.location.pathname + document.location.search + "&from=" + document.referrer;
        analytics.trackGoogleAnalyticsPageview(path);
    }
};