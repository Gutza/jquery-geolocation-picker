/*
 *  License: MIT
 *  Original project: http://code.google.com/p/locationpicker/
 *  Current project: https://github.com/Gutza/jquery-geolocation-picker
 */

$.fn.locationPicker = function(options) {
	var opts = $.extend({}, $.fn.locationPicker.defaults, options);
	var geocoder = new google.maps.Geocoder();

	return this.each(function() {
		var that = this;

		var setPosition = function(latLng, viewport){
			marker.setPosition(latLng);
			if (viewport) {
				map.fitBounds(viewport);
				map.setZoom(map.getZoom() + 2);
			} else {
				map.panTo(latLng);
			}
			$(that).val(latLng.lat().toFixed(opts.decimals) + ',' + latLng.lng().toFixed(opts.decimals));
		}

		var id = $(this).attr('id');
		var searchButton = $("<input class='picker-search-button' type='button' value='Search'/>");
		$(this).after(searchButton);

		var picker = $("<div id='" + id + "-picker' class='pickermap'></div>").css({
			width: opts.width,
			backgroundColor: opts.backgroundColor,
			border: opts.border,
			padding: opts.padding,
			borderRadius: opts.borderRadius,
			position: "absolute",
			display: "none",
			zIndex: 9999
		});
		$(this).after(picker);
		var mapDiv = document.createElement("div");
		mapDiv.appendChild(document.createTextNode("Loading"));
		$(mapDiv).css("height", opts.height);
		picker.append(mapDiv);

		var myLatlng = new google.maps.LatLng(0, 0);
		var myOptions = {
			zoom: 15,
			center: myLatlng,
			mapTypeId: google.maps.MapTypeId.HYBRID,
			mapTypeControl: false,
			disableDoubleClickZoom: true,
			streetViewControl: false
		}
		var map = new google.maps.Map(mapDiv, myOptions);

		var marker = new google.maps.Marker({
			position: myLatlng,
			map: map,
			title: "Drag Me",
			draggable: true
		});

		google.maps.event.addListener(map, 'dblclick', function(event) {
			setPosition(event.latLng);
		});

		google.maps.event.addListener(marker, 'dragend', function(event) {
			setPosition(marker.position);
		});

		function geoFromPicker() {
			var posStr = $(that).val();
			if ("" == posStr)
				return;

			var posArr = posStr.split(",");
			if (2 != posArr.length) {
				$(that).val("Invalid Position");
				return;
			}

			var lat = $.trim(posArr[0]);
			var lng = $.trim(posArr[1]);
			var latlng = new google.maps.LatLng(lat, lng);
			setPosition(latlng);
		}

		function showPicker() {
			picker.fadeIn('fast');
			google.maps.event.trigger(map, 'resize');
			geoFromPicker();
			map.setCenter(marker.position);
		}

		$(this).focus(function() {
			var address = $(that).val();
			if(isLngLat(address)){
				showPicker();
			}
		});

		$(":input").focus(function() {
			if ($(this).attr('id') == $(that).attr('id'))
				return;

			if ($(picker).children(this).length > 0)
				return;

			picker.fadeOut('fast');
		});

		function isLngLat(val) {
			var lngLatArr = val.split(",");
			return 2 == lngLatArr.length && !isNaN(lngLatArr[0]) && !isNaN(lngLatArr[1]);
		}

		function addressFromTextInput() {
			var address = $(that).val();
			if ("" == address) {
				alert("Please enter an address or a geographical long,lat position.");
				return;
			}

			addressFromString(address);
			$(that).focus();
		}

		function addressFromString(address) {
			if (isLngLat(address)) {
				showPicker();
				return;
			}

			geocoder.geocode({'address': address}, function(results, status) {
				if (status != google.maps.GeocoderStatus.OK) {
					alert("Geocode was not successful for the following reason: " + status);
					return;
				}

				setPosition(
					results[0].geometry.location,
					results[0].geometry.viewport
				);
				showPicker();
			});
		}

		$(searchButton).click(function(event) {
			addressFromTextInput();
			event.stopPropagation();
		});

		$('html').click(function() {
			picker.fadeOut('fast');
		});

		$(picker).click(function(event) {
			event.stopPropagation();
		});

		$(this).click(function(event) {
			event.stopPropagation();
		});

		$(that).keypress(function(event) {
			if (13 != event.keyCode) // Not Enter
				return;

			event.preventDefault();
			addressFromTextInput();
		});
	});
};

$.fn.locationPicker.defaults = {
	width: "300px",
	height: "200px",
	backgroundColor: '#fff',
	border: '1px solid #ccc',
	borderRadius: 10,
	padding: 10,
	decimals: 5
};
