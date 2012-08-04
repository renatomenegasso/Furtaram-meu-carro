window.message = function(text, type, timeInSecconds){
	var instance = this;
	instance.box = null;
	
	instance.remove = function(){
		instance.box.remove();
	}
	
	function createBox(){
		return $('<div class="message_box"><div class="message_inner"><span class="ico">&nbsp;</span><div class="text"></div></div><span class="close">X</span></div>');
	}
	
	function showBox(message, type, timeInSecconds){
		instance.box = createBox();
		$('body').append(instance.box);
		
		instance.box.addClass(type)
			.css('z-index', 999)
			.hide()
			.fadeIn(400)
			.find('.text')
			.html(message);
		
		centerBox(instance.box);
		handleClose(instance.box);
		
		this.tiemout = setTimeout(function(){
			instance.box.fadeOut();
		}, (timeInSecconds || 9) * 1000);
	}
	
	function handleClose(box) {
		box.find('.close').click(function() {
			instance.box.fadeOut(100, function(){
				instance.box.remove();
			});
		});
	}
	
	function centerBox(box){
		var l = ($(window).width() - box.width()) / 2;
		box.css('left', l + 'px');
	}
	
	showBox(text, type, timeInSecconds);
};

window.message.ERROR = 'error';
window.message.SUCCESS = 'success';
window.message.WARNING = 'warning';