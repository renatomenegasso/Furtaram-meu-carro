(function($){
	
	function domLoaded(){
		$(document).delegate("fieldset.toggle-set legend", "click", function(){
			var $legend = $(this),
				text = $legend.text(),
				$fieldset = $legend.closest('fieldset');

			$fieldset.toggleClass('closed');

			var signal = $fieldset.hasClass('closed') ? '+' : '-';

			$legend.text(text.replace(/^\[(\+|\-)\] (.*)/gi, "["+ signal +"] $2"));
		});
	}

	$(domLoaded)
}(jQuery));