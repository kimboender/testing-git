(function($){  
    $.fn.center = function(options) {   
        var obj = this,
            defaults = {  
                fixed: false /* Set to true if the element has to center on its parent */
            },
            options = $.extend(defaults, options);
            
        /**
            De properties van het scherm moeten gebruikt worden uit $window, als deze
            bestaat. Anders moeten de properties van $(window) gebruikt worden.
        */
		if(typeof $window != 'undefined') {
            var top = (($window.height() - this.outerHeight()) / 2) + $window.scrollTop(),
                left = (($window.width() - this.outerWidth()) / 2) + $window.scrollLeft();
		}
		else {        		
            var top = (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop(),
                left = (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft();
		}
        
        // Calculate new positions if the element has to center on its parent
        if(options.fixed) {
            var top = ((this.parent().height() - this.outerHeight()) / 2),
            left = ((this.parent().width() - this.outerWidth()) / 2);
        }
        
        obj.css({
            position : 'absolute',
            top: top + 'px',
            left: left + 'px'
        });
        
        return this;
    };  
})(jQuery);