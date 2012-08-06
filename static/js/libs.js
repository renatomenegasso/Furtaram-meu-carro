utls = window.utls || {};

utls.message = function(text, type, timeInSecconds){
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

utls.message.ERROR = 'error';
utls.message.SUCCESS = 'success';
utls.message.WARNING = 'warning';





utls.lightbox = function(param){
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
		width: '150px',
		height: '35px',
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
		instance.box.centralize();
		loadContent(show);
	}
	
	function render(){
		if(instance.defaults.overlay === null){
			instance.defaults.overlay = $('<div id="lightbox-overlay"></div>').css(cssOverlay).appendTo('body');
		}
		
		var content = $(['<div class="lightbox-container">',
		                 	'<div class="lightbox-wrapper">',
			               		'<div class="lightbox-content"></div>',
			               		'<div class="lightbox-loading">Carregando...</div>',
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
		instance.content.hide().html(_content).fadeIn(500, function(){
			$(document).trigger('lightboxopened', instance);
		});
		
	}
	
	instance.close = function(){
		instance.content.fadeOut(200, function(){
			instance.container.remove();
			instance.defaults.overlay.hide();
		});
	};
	
	init(param);
};

utls.lightbox.globalSetup = function(settings){
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




utls.formAjax = function(){
	var prototype = utls.formAjax.prototype;
	var FORM_ERROR_CLASS = 'error';
	var messageInstance = null;
	
	prototype.globalInit = function(selector){
		$(document).delegate(selector || 'form.ajax', 'submit', onSubmit)
					.delegate(selector || 'form.ajax', 'ajaxcomplete', onAjaxcompĺete);
	};

	prototype.execute = function(form){
		if(!(form instanceof jQuery)) {form = $(form);}
		form.trigger('submit');
	};
	
	function onSubmit(e){
		e.preventDefault();
		
		if(messageInstance) messageInstance.remove();
		
		var $form = $(this);
		$form.find('.form_ajax_loader').show();
				
		var method = $form.attr('method').toLowerCase();
		$[method]($form.attr('action'), $form.serialize(), function(response, isSuccess, httpReqObj){
			$form.find('.form_ajax_loader').hide();
			$form.trigger('ajaxcomplete', response);
		});
	}
	
	function onAjaxcompĺete(e, response){
		var form = e.target;
		$(form).find('.' + FORM_ERROR_CLASS).removeClass(FORM_ERROR_CLASS);
		
		if(response.errors != null){
			handleErrors(form, response.errors);
		}
	}
	
	function handleErrors(form, errors){
		function label(k){
			return ($(form[k]).prev('label').html() || k + ':');
		}
		
		var k, messages = [];
		for(k in errors){
			$(form[k]).addClass(FORM_ERROR_CLASS);
			var msg = form[k] ? label(k) + errors[k].join('<br>') : errors[k].join('<br>'); 
			messages.push(msg);
		}
		
		messageInstance = new utls.message(messages.join('<br>'), utls.message.ERROR);
	}
};

$(function(){
	new utls.formAjax().globalInit();
});



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

	$(domLoaded);
}(jQuery));


/*
	Masked Input plugin for jQuery
	Copyright (c) 2007-2011 Josh Bush (digitalbush.com)
	Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license) 
	Version: 1.3
*/
(function(a){var b=(a.browser.msie?"paste":"input")+".mask",c=window.orientation!=undefined;a.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},dataName:"rawMaskFn"},a.fn.extend({caret:function(a,b){if(this.length!=0){if(typeof a=="number"){b=typeof b=="number"?b:a;return this.each(function(){if(this.setSelectionRange)this.setSelectionRange(a,b);else if(this.createTextRange){var c=this.createTextRange();c.collapse(!0),c.moveEnd("character",b),c.moveStart("character",a),c.select()}})}if(this[0].setSelectionRange)a=this[0].selectionStart,b=this[0].selectionEnd;else if(document.selection&&document.selection.createRange){var c=document.selection.createRange();a=0-c.duplicate().moveStart("character",-1e5),b=a+c.text.length}return{begin:a,end:b}}},unmask:function(){return this.trigger("unmask")},mask:function(d,e){if(!d&&this.length>0){var f=a(this[0]);return f.data(a.mask.dataName)()}e=a.extend({placeholder:"_",completed:null},e);var g=a.mask.definitions,h=[],i=d.length,j=null,k=d.length;a.each(d.split(""),function(a,b){b=="?"?(k--,i=a):g[b]?(h.push(new RegExp(g[b])),j==null&&(j=h.length-1)):h.push(null)});return this.trigger("unmask").each(function(){function v(a){var b=f.val(),c=-1;for(var d=0,g=0;d<k;d++)if(h[d]){l[d]=e.placeholder;while(g++<b.length){var m=b.charAt(g-1);if(h[d].test(m)){l[d]=m,c=d;break}}if(g>b.length)break}else l[d]==b.charAt(g)&&d!=i&&(g++,c=d);if(!a&&c+1<i)f.val(""),t(0,k);else if(a||c+1>=i)u(),a||f.val(f.val().substring(0,c+1));return i?d:j}function u(){return f.val(l.join("")).val()}function t(a,b){for(var c=a;c<b&&c<k;c++)h[c]&&(l[c]=e.placeholder)}function s(a){var b=a.which,c=f.caret();if(a.ctrlKey||a.altKey||a.metaKey||b<32)return!0;if(b){c.end-c.begin!=0&&(t(c.begin,c.end),p(c.begin,c.end-1));var d=n(c.begin-1);if(d<k){var g=String.fromCharCode(b);if(h[d].test(g)){q(d),l[d]=g,u();var i=n(d);f.caret(i),e.completed&&i>=k&&e.completed.call(f)}}return!1}}function r(a){var b=a.which;if(b==8||b==46||c&&b==127){var d=f.caret(),e=d.begin,g=d.end;g-e==0&&(e=b!=46?o(e):g=n(e-1),g=b==46?n(g):g),t(e,g),p(e,g-1);return!1}if(b==27){f.val(m),f.caret(0,v());return!1}}function q(a){for(var b=a,c=e.placeholder;b<k;b++)if(h[b]){var d=n(b),f=l[b];l[b]=c;if(d<k&&h[d].test(f))c=f;else break}}function p(a,b){if(!(a<0)){for(var c=a,d=n(b);c<k;c++)if(h[c]){if(d<k&&h[c].test(l[d]))l[c]=l[d],l[d]=e.placeholder;else break;d=n(d)}u(),f.caret(Math.max(j,a))}}function o(a){while(--a>=0&&!h[a]);return a}function n(a){while(++a<=k&&!h[a]);return a}var f=a(this),l=a.map(d.split(""),function(a,b){if(a!="?")return g[a]?e.placeholder:a}),m=f.val();f.data(a.mask.dataName,function(){return a.map(l,function(a,b){return h[b]&&a!=e.placeholder?a:null}).join("")}),f.attr("readonly")||f.one("unmask",function(){f.unbind(".mask").removeData(a.mask.dataName)}).bind("focus.mask",function(){m=f.val();var b=v();u();var c=function(){b==d.length?f.caret(0,b):f.caret(b)};(a.browser.msie?c:function(){setTimeout(c,0)})()}).bind("blur.mask",function(){v(),f.val()!=m&&f.change()}).bind("keydown.mask",r).bind("keypress.mask",s).bind(b,function(){setTimeout(function(){f.caret(v(!0))},0)}),v()})}})})(jQuery);

(function($){
	function domLoaded(){
		applyMasks();
		$(document).bind('lightboxopened', function(evt, lightbox){
			applyMasks(lightbox.content);
		});
	}

	function applyMasks(scope){
		if(scope == undefined) scope = document;
		$("input[data-mask]", scope).each(function(){
			var $ipt = $(this);
			$ipt.mask($ipt.attr('data-mask'));
		});
	}

	$(domLoaded);
}(jQuery));