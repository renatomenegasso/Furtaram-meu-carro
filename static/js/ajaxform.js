window.formAjax = function(){
	var prototype = formAjax.prototype;
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
		
		messageInstance = new message(messages.join('<br>'), message.ERROR);
	}
};

$(function(){
	new formAjax().globalInit();
});