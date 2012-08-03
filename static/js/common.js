(function(){
	
	function init(){
		addOccurrence();
	}

	function addOccurrence(){
		$("#add-occurrence").click(function(e){
			e.preventDefault();
			new lightbox({
				url:"/add-occurrence",
				width: 500,
				height:450
			})
		});
	}


	init();

}());