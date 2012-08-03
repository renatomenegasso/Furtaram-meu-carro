window.lightbox = function(param){
	var instance = this;
	instance.defaults = {
		minWidth: 400,
		minHeight: 150,
		overlay: null
	};
	
	instance.container = null;
	instance.box = null;
	instance.content = null;
	
	
	var url, width, height, text;
	
	var cssOverlay = {
		width: '100%',
		height: '100%',
		position:'fixed',
		top: '0px',
		left: '0px',
		background: '#000',
		opacity: '0.5',
		display: 'none',
		zIndex: 1
	};
	
	var cssContainer = {
		position: 'fixed',
		width: '100%',
		height: '100%',
		textAlign: 'center',
		top: '0px',
		left: '0px',
		zIndex: 2
	}
	
	var cssWrapper = {
		margin: 'auto',
		width: '10px',
		height: '10px',
		position: 'relative',
		textAlign:'left'
	}
	
	var csssContent = {
		background: '#fff',
		width: '100%',
		height: '100%'
	}
	
	
	function init(param){
		if(typeof param == 'string'){
			if(isText(param)){
				text = param;
			} else {
				url = param;
			}
		} else if(typeof param == 'object'){
			url = param.url || url;
			text = param.content || text;
			width = param.width;
			height = param.height;
		}
		
		open();
	}
	
	function isText(str){
		return typeof str == 'string' && str.match(/^([^<>'"])*(\.|#|\/)/gi) == null;
	}
	
	function open(){
		instance.container = render().appendTo('body');
		instance.box = instance.container.find('.lightbox-wrapper');
		instance.content = instance.box.find('.lightbox-content');
		instance.loading = instance.box.find('.lightbox-loading');
		loadContent(show);
	}
	
	function render(){
		if(instance.defaults.overlay === null){
			instance.defaults.overlay = $('<div id="lightbox-overlay"></div>').css(cssOverlay).appendTo('body');
		}
		
		var content = $(['<div class="lightbox-container">',
		                 	'<div class="lightbox-wrapper">',
			               		'<div class="lightbox-content"></div>',
			               		'<div class="lightbox-loading"></div>',
			               		'<div class="t"></div>',
			                    '<div class="l"></div>',
			                    '<div class="b"></div>',
			                    '<div class="r"></div>',
			                   	'<div class="tl"></div>',
			                   	'<div class="tr"><a href="#close" class="lightbox-close lightbox-close-tr">x</a></div>',
			                   	'<div class="bl"></div>',
			                   	'<div class="br"></div>',
			               '</div>',
			             '</div>'].join('')).css(cssContainer);
		
		
		content.find('.lightbox-wrapper').css(cssWrapper).find('.lightbox-content').css(csssContent).hide();
		content.delegate('.lightbox-close', 'click', function(e){
			e.preventDefault();
			instance.close();
		});
		
		return content;
	}
	
	function loadContent(callback){
		if(url == null){
			callback.call(null, null);
			return;
		}
		
		instance.loading.show();
		$.get(url, null, function(response){
			instance.loading.hide();
			callback.apply(null, arguments);
		});
	}
	
	function show(response){
		instance.defaults.overlay.show();
		
		var _width = Math.max(width || 0, instance.defaults.minWidth);
		var _height = Math.max(height || 0, instance.defaults.minHeight);
		instance.box.centralize(height);
		
		instance.box.width(_width).height(_height);

		var _content = response || text;
		if(_content) 
			instance.content.hide().html(_content).fadeIn();
		
	}
	
	instance.close = function(){
		instance.content.fadeOut(200, function(){
			instance.container.remove();
			instance.defaults.overlay.hide();
		});
	};
	
	init(param);
};

lightbox.globalSetup = function(settings){
	$.extend(this.defaults, settings);
};

(function($){
	$.fn.centralize = function(expectedHeight){
		var t = $(this),
			height = (expectedHeight || t.height()),
			totalHeight = t.parent().height();
		
		t.css('margin-top', ((totalHeight - height) / 2) + 'px');
	}
}(jQuery));
