(function($){
	var initPoint = {lat: -23.561383, lng: -46.656436},
		stolenImg = "https://furtaram.s3-sa-east-1.amazonaws.com/img/stolen.png";

	var mainMap = null,
		currentLightbox = null;

	function init(){
		setupAjax();
		renderMainMap();
		setupLightboxOccurrence();
		loadPoints();
	}
	
	function renderMainMap(){
		var opts = {
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			zoom:11,
			mapTypeControl:false
	    };
		

	    mainMap = new google.maps.Map($("#main-map")[0], opts);
		centerMapInUserPosition(mainMap);

		handleAddrField($("#search-field"), mainMap);
	}

	function setupLightboxOccurrence(){
		$("#add-occurrence").click(function(e){
			e.preventDefault();
			currentLightbox = new lightbox({
				url:"/add-occurrence",
				width: 800,
				height:450
			});

			$(document).bind("lightboxopened", function(e, lightbox){
				var map = renderLightboxMap();
				handleAddrField($("#address-field"), map, true);
			});
		});

		$(document).delegate("#add-occurrence-form", "ajaxcomplete", function(e, response){
			if(response.success){
				currentLightbox.close();
				new message("Sua ocorrẽncia foi adicionada.");
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
			mapTypeControl:false
	    };
		
	    var map = new google.maps.Map($("#lightbox-map")[0], opts);
		centerMapInUserPosition(map);
	    return map;
	}

	function handleAddrField($field, map, addMarker) {
		function updateLatLng(lat, lng){
			$("#lat").val(lat);
			$("#lng").val(lng);
		}

		var geocoder = new google.maps.Geocoder();

		var opts = {
	    	types:['geocode'],
	    	componentRestrictions: {country:'br'}
	    };

	    var autocomplete = new google.maps.places.Autocomplete($field[0], opts);

	    autocomplete.bindTo('bounds', map); 

	    var currentMarker = null;

        google.maps.event.addListener(autocomplete, 'place_changed', function() {
        	var place = autocomplete.getPlace();
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
              new google.maps.Size(30, 30),
              new google.maps.Point(0, 0),
              new google.maps.Point(15, 15),
              new google.maps.Size(30, 30));

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