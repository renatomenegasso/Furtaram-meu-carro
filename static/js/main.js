(function($){
	var initPoint = {lat: -23.561383, lng: -46.656436},
		stolenImg = "https://furtaram.s3-sa-east-1.amazonaws.com/img/stolen.png";

	var mainMap = null,
		currentLightbox = null,
		currentResults = null;

	function init(){
		setupAjax();
		renderMainMap();
		mainSearch();
		setupLightboxOccurrence();
		loadPoints();
		tracking();
		socialNetworks();
	}
	
	function renderMainMap(){
		var $mapContainer = $("#main-map");

		if(!$mapContainer.length){ return; }
		var opts = {
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			zoom:11,
			mapTypeControl:false,
			center: new google.maps.LatLng(initPoint.lat, initPoint.lng),
			scrollwheel:false
	    };

	    mainMap = new google.maps.Map($mapContainer[0], opts);
		centerMapInUserPosition(mainMap);
	}

	function mainSearch(){
		var $field = $("#search-field");

		if(!$field.length){return;}

		handleAddrField($field, mainMap, ['Autocomplete', 'BuscaPrincipal']);

		var geocoder = new google.maps.Geocoder();

		$("#search-btn").click(function(){
			searchAddress($field.val(), geocoder);
		});

		$(document).delegate('ul.search-results a', 'click', function(e){
			e.preventDefault();
			currentLightbox.close();

			var index = parseInt($(this).attr('data-index'));
			mainMap.setCenter(currentResults[index].geometry.location);
			mainMap.fitBounds(currentResults[index].geometry.viewport);
		});
	}

	function searchAddress(addr, geocoder){
		var instance = geocoder || new google.maps.Geocoder();

		instance.geocode({address: addr}, function(results, status){
			if(status === google.maps.GeocoderStatus.ZERO_RESULTS){
				new utls.message("Endereço não encontrado", utls.message.ERROR);
				return;
			}

			if(status != google.maps.GeocoderStatus.OK){
				new utls.message("Erro ao buscar endereço", utls.message.ERROR);
				return;
			}

			if(results.length > 1){
				handleManyResults(results);
				return;
			}

			mainMap.setCenter(results[0].geometry.location);
			mainMap.fitBounds(results[0].geometry.viewport);
		});
	}

	function handleManyResults(results){
		currentResults = results;

		var content = results.map(function(item, i){
			return ['<a href="#result" data-index="', i, '" data-tracking="Endereco,Busca,Multiplosresultados">',
						item.formatted_address, 
					'</a>'].join('');

		}).join('</li><li>');

		content = ['<div class="lightbox-inner">',
						'<h2>Foi encontrado mais de um endereço</h2>',
						'<ul class="search-results"><li>', content, '</li></ul>',
					'</div>'].join('');

		currentLightbox = new utls.lightbox(content);
	}
	
	function setupLightboxOccurrence(){
		var $button = $("#add-occurrence");

		if(!$button.length){return;}

		$button.click(function(e){
			e.preventDefault();
			currentLightbox = new utls.lightbox({
				url:"/add-occurrence",
				width: 800,
				height:450
			});

			$(document).bind("lightboxopened", function(e, lightbox){
				if(!lightbox.content.find("#address-field").length){
					return;
				}
				
				var map = renderLightboxMap();
				handleAddrField($("#address-field"), map, ['Autocomplete', 'BuscaLightbox'], true);
			});
		});

		$(document).delegate("#add-occurrence-form", "ajaxcomplete", function(e, response){
			if(response.success){
				currentLightbox.close();
				new utls.message("Sua ocorrẽncia foi adicionada.");
				var lat = parseFloat($("#lat").val()),
					lng = parseFloat($("#lng").val());

				mainMap.setCenter(new google.maps.LatLng(lat, lng));
				mainMap.setZoom(16);
				setTimeout(function(){
					addStolenMarker(mainMap, lat, lng);
				}, 1000);
			}
		});
	}

	function renderLightboxMap(){
		var opts = {
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			zoom:16,
			mapTypeControl:false,
			center: new google.maps.LatLng(initPoint.lat, initPoint.lng)
	    };
		
	    var map = new google.maps.Map($("#lightbox-map")[0], opts);
		centerMapInUserPosition(map);
	    return map;
	}

	function handleAddrField($field, map, gaEvent, addMarker) {
		function updateLatLng(lat, lng){
			$("#lat").val(lat);
			$("#lng").val(lng);
		}

		var opts = {
	    	types:['geocode'],
	    	componentRestrictions: {country:'br'}
	    };

	    var autocomplete = new google.maps.places.Autocomplete($field[0], opts);

	    autocomplete.bindTo('bounds', map); 

	    var currentMarker = null;

        google.maps.event.addListener(autocomplete, 'place_changed', function() {
        	var place = autocomplete.getPlace();

        	if(!place){ return; }

        	track(gaEvent)

	        if (place.geometry.viewport) {
	        	map.fitBounds(place.geometry.viewport);
	        } else {
	        	map.setCenter(place.geometry.location);
	        	map.setZoom(17);
	        } 

	        if(!addMarker){
	        	return;
	        }

			if(currentMarker){
				currentMarker.setMap(null);
			}

	        currentMarker = addStolenMarker(map, place.geometry.location.lat(), place.geometry.location.lng());
	        currentMarker.setDraggable(true);
	        currentMarker.setCursor('move');

	        google.maps.event.addListener(currentMarker, 'dragend', function(evt){
	        	track(['Marker', 'Arrastado']);
	        	updateLatLng(evt.latLng.lat(), evt.latLng.lng());
			});

			updateLatLng(place.geometry.location.lat(), place.geometry.location.lng());
        });

        $field.keydown(function(e){
        	if(e.keyCode === 13){
        		e.preventDefault();
        	}
        });
	}

	function centerMapInUserPosition(map){
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(pos) {
				var point = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
				map.setCenter(point);
			}, function() {
				map.setCenter(new google.maps.LatLng(initPoint.lat, initPoint.lng));
			});
		} else {
			map.setCenter(new google.maps.LatLng(initPoint.lat, initPoint.lng));
		}
	}

	function addStolenMarker(map, lat, lng){
		var marker = new google.maps.Marker({ map: map });

        var image = new google.maps.MarkerImage(
              stolenImg,
              new google.maps.Size(25, 25),
              new google.maps.Point(0, 0),
              new google.maps.Point(12.5, 12.5),
              new google.maps.Size(25, 25));

		marker.setIcon(image);
		marker.setPosition(new google.maps.LatLng(lat, lng));

        return marker;
	}

	function loadPoints(){
		$.get('/get-occurrences', function(response){
			var occurrences = response.occurrences;
			for(var i = 0; i <  occurrences.length; i ++){
				addStolenMarker(mainMap, occurrences[i].latitude, occurrences[i].longitude)
			}
		});
	}

	function socialNetworks(){
		$(window).load(function(){
			setTimeout(function(){
				facebook();
				twitter();
				setTimeout(function(){
					$('div.social-networks').fadeIn();
				}, 2500);
			}, 500);
		});
	}

	function facebook(){
		$('body').append('<div id="fb-root"></div>');

		(function(d, s, id) {
		  var js, fjs = d.getElementsByTagName(s)[0];
		  if (d.getElementById(id)) return;
		  js = d.createElement(s); js.id = id;
		  js.src = "//connect.facebook.net/pt_BR/all.js#xfbml=1&appId=481213371891727";
		  fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	}

	function twitter(){
		(function(d, s, id) {
		  var js, fjs = d.getElementsByTagName(s)[0];
		  if (d.getElementById(id)) return;
		  js = d.createElement(s); js.id = id;
		  js.src = "//platform.twitter.com/widgets.js";
		  fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'twitter-jssdk'));
	}

	function tracking(){
		$(document).delegate('[data-tracking]', 'click', function(e){
			var attrs = $(this).attr('data-tracking').split(',');
			attrs.unshift('_trackEvent');
			_gaq.push(attrs);
			console.log(attrs);
		});
	}

	function track(attrs){
		attrs.unshift('_trackEvent');
		_gaq.push(attrs);
	}

	function setupAjax(){
		jQuery(document).ajaxSend(function(event, xhr, settings) {
		    function getCookie(name) {
		        var cookieValue = null;
		        if (document.cookie && document.cookie != '') {
		            var cookies = document.cookie.split(';');
		            for (var i = 0; i < cookies.length; i++) {
		                var cookie = jQuery.trim(cookies[i]);
		                if (cookie.substring(0, name.length + 1) == (name + '=')) {
		                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
		                    break;
		                }
		            }
		        }
		        return cookieValue;
		    }
		    function sameOrigin(url) {
		        var host = document.location.host;
		        var protocol = document.location.protocol;
		        var sr_origin = '//' + host;
		        var origin = protocol + sr_origin;
		        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
		            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
		            !(/^(\/\/|http:|https:).*/.test(url));
		    }
		    function safeMethod(method) {
		        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
		    }
	
		    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
		        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
		    }
		});
	}

	init();

}(jQuery));