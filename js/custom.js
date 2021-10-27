
$(document).ready(function() {
		// <!-- Slider -->
			$(window).load(function() {
				$('.flexslider').flexslider({
				  animation: "slide",
				  controlsContainer: ".flex-container"
			  });
			});
// <!-- /slider --> 
 (function(window, $, PhotoSwipe)
 {
  $(document).ready(function()
  {
   $("#gallery a").photoSwipe(
   {
    enableMouseWheel: false,
    enableKeyboard: false
   });
  });
 }(window, window.jQuery, window.Code.PhotoSwipe));
	});		