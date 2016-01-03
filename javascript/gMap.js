/**
	GMap
	
	Dit object zorgt voor het tonen en de werking van de GMap
	
	@param		options				JS object literal met de opties van de GMap
*/

if(typeof google != 'undefined') GMapOverlay.prototype = new google.maps.OverlayView();
function GMap(options) {
	// Standaard opties
	this.options = {
		coord: new Array(52.0,5.0),
		zoom: 10,
		id: 'map',
		styles: []
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
	
	// Overige variabelen
	this.map = null;
	this.markerArray = [];
    this.directionDisplay = null;
    this.directionsService = null;
	this.infoWindow = null;
}

GMap.prototype = {
	/**
		GMap.show()
		
		Deze functie zorgt ervoor dat de map geactiveerd wordt
	*/
	show: function() {
        var gmap = this;
            
        var myOptions = {
            zoom: gmap.options.zoom,
            center: new google.maps.LatLng(gmap.options.coord[0],gmap.options.coord[1]),
            mapTypeControl: false,
            zoomControl: true,
            panControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            },
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP,
                style: google.maps.ZoomControlStyle.SMALL
            },
            streetViewControl: false,
            disableDoubleClickZoom: true,
            scrollwheel: false,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            styles: gmap.options.styles
        };
        
        gmap.directionsService = new google.maps.DirectionsService();
        gmap.directionsDisplay = new google.maps.DirectionsRenderer();
        
        gmap.map = new google.maps.Map(document.getElementById(gmap.options.id), myOptions);
        gmap.directionsDisplay.setMap(gmap.map);
    },
    
    /**
        GMap.panBy()
        
        Deze functie verplaatst het center van de map met zoveel px als aangegeven
        
        @param horizontal   int         Interger to adjust horizontal, positive is to the
                                        left, negative to the right
        @param vertical     int         Interger to adjust vertical, positive is to the
                                        top, negative to the bottom
    */
    panBy: function(horizontal,vertical) {
        var gmap = this,
            horizontal = horizontal || 10,
            vertical = vertical || 10;
        
        gmap.map.panBy(horizontal,vertical);
    },
    
    /**
    	GMap.addMarker()
    	
    	Deze functie voegt een functie toe aan de map.
    	
    	@param	options		object		JS object literal met de opties van de marker
    */
    addMarker: function(options) {
        var gmap = this;
        
        // Standaard opties
        this.options = {
            coord: new Array(52.0,5.0),
            click: false,
            title: null,
            icon: false,
            shadow: false,
            shape: false,
			infoWindow: false
        };
        
        // Opties via het aanroepen van de functie
        if(typeof options != "undefined") {
            var prop;
            
            for (prop in options) {
                if(this.options.hasOwnProperty(prop)) {
                    this.options[prop] = options[prop];
                }
            }
        }
        
        // Afbeelding van de marker
        var icon = null;
        if(this.options.icon != false) {
            icon = {
                url: this.options.icon.url,
                size: new google.maps.Size(this.options.icon.size[0],this.options.icon.size[1]),
                origin: new google.maps.Point(this.options.icon.origin[0],this.options.icon.origin[1]),
                anchor: new google.maps.Point(this.options.icon.anchor[0],this.options.icon.anchor[1])
            };
        }
        
        // Polyfill van de marker
        var shape = null;
        if(this.options.shape != false) {
            shape = {
                coord: this.options.shape,
                type: 'poly'
            }
        }
  
        // Voeg de marker toe
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(this.options.coord[0],this.options.coord[1]),
            map: gmap.map,
            title: this.options.title,
            shape: shape,
            icon: icon
        });
        
        // Onclick actie & infoWindow
		if (typeof(this.options.click) == "function" && this.options.infoWindow == false) {
		    var options = this.options;
            google.maps.event.addListener(marker, 'click', function() {
                options.click();
            });
		}
		else if (this.options.infoWindow != false) {
			var options = this.options;
			
			if(gmap.infoWindow == null) {
				gmap.infoWindow = new google.maps.InfoWindow();
			}
			
            google.maps.event.addListener(marker, 'click', function() {
				gmap.infoWindow.setOptions({
					content: options.infoWindow.content
				});
                gmap.infoWindow.open(gmap.map,marker);
            });
		}
		
        // Marker aan de array toevoegen
        gmap.markerArray.push(marker);
    },
    
    removeMarkers: function() {
        var gmap = this;
        
        // First, remove any existing markers from the map.
        for (var i = 0; i < gmap.markerArray.length; i++) {
            gmap.markerArray[i].setMap(null);
        }
        
        // Now, clear the array itself.
        gmap.markerArray = [];
    },
	
	/**
		GMap.createOverlay()
		
		Deze functie maakt een overlay over de map op basis van een afbeelding.
    	
    	@param	options		object		JS object literal met de opties van de overlay
	*/
	createOverlay: function(options) {
        var gmap = this;
        
        // Standaard opties
        this.options = {
            swBounds: new Array(48,0),
			neBounds: new Array(56,11),
			image: null
        };
        
        // Opties via het aanroepen van de functie
        if(typeof options != "undefined") {
            var prop;
            
            for (prop in options) {
                if(this.options.hasOwnProperty(prop)) {
                    this.options[prop] = options[prop];
                }
            }
        }

		var swBound = new google.maps.LatLng(this.options.swBounds[0],this.options.swBounds[1]);
		var neBound = new google.maps.LatLng(this.options.neBounds[0],this.options.neBounds[1]);
		var bounds = new google.maps.LatLngBounds(swBound, neBound);
		overlay = new GMapOverlay(bounds, this.options.image, gmap.map);
	},
    
    /**
        GMap.directions()
        
        Deze functie berekend een route tussen twee punten en laat deze zien op de map.
        
        @param	options		object		JS object literal met de opties van de route
    */
    directions: function(options) {
        var gmap = this;
        
        // Standaard opties
        this.options = {
            origin: '',
            destination: '',
            onComplete: ''
        };
        
        // Opties via het aanroepen van de functie
        if(typeof options != "undefined") {
            var prop;
            
            for (prop in options) {
                if(this.options.hasOwnProperty(prop)) {
                    this.options[prop] = options[prop];
                }
            }
        }
        
        //declare request
        var request = {
            origin:this.options.origin,
            destination:this.options.destination,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
        
        //generate route by request
        var directions = this;
        gmap.directionsService.route(request, function(response, status) {            
            // Als er een route is gevonden moet deze op de map getoond worden
            if (status == google.maps.DirectionsStatus.OK) {                
                // Toon de route op de map
                gmap.directionsDisplay.setDirections(response);
            }
            
            // Geef de status en de response terug
            if (typeof(directions.options.onComplete) == 'function') {
                directions.options.onComplete({
                    response: response,
                    status: status
                });
            }
        });
    }
}

/**
	GMapOverlay
	
	Dit object zorgt voor het tonen van een overlay over de map
	
	@param		bounds				bounds van de overlay
	@param		bounds				bounds van de overlay
*/
/** @constructor */
function GMapOverlay(bounds, image, map) {
	// Now initialize all properties.
	this.bounds_ = bounds;
	this.image_ = image;
	this.map_ = map;
	
	// We define a property to hold the image's div. We'll
	// actually create this div upon receipt of the onAdd()
	// method so we'll leave it null for now.
	this.div_ = null;
	
	// Explicitly call setMap on this overlay
	this.setMap(map);
};

GMapOverlay.prototype.onAdd = function() {
	// Note: an overlay's receipt of onAdd() indicates that
	// the map's panes are now available for attaching
	// the overlay to the map via the DOM.
	
	// Create the DIV and set some basic attributes.
	var div = document.createElement('div');
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.position = 'absolute';
	
	// Create an IMG element and attach it to the DIV.
	var img = document.createElement('img');
	img.src = this.image_;
	img.style.width = '100%';
	img.style.height = '100%';
	img.style.position = 'absolute';
	div.appendChild(img);
	
	// Set the overlay's div_ property to this DIV
	this.div_ = div;
	
	// We add an overlay to a map via one of the map's panes.
	// We'll add this overlay to the overlayLayer pane.
	var panes = this.getPanes();
	panes.overlayLayer.appendChild(div);
};

GMapOverlay.prototype.draw = function() {
	// Size and position the overlay. We use a southwest and northeast
	// position of the overlay to peg it to the correct position and size.
	// We need to retrieve the projection from this overlay to do this.
	var overlayProjection = this.getProjection();
	
	// Retrieve the southwest and northeast coordinates of this overlay
	// in latlngs and convert them to pixels coordinates.
	// We'll use these coordinates to resize the DIV.
	var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
	
	// Resize the image's DIV to fit the indicated dimensions.
	var div = this.div_;
	div.style.left = sw.x + 'px';
	div.style.top = ne.y + 'px';
	div.style.width = (ne.x - sw.x) + 'px';
	div.style.height = (sw.y - ne.y) + 'px';
};

GMapOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};