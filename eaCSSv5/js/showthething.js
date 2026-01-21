$(document).on("ready", function () {
	/* Rory's ghetto accordion (which is actually nicer than the plugin one) */
	$('.showthething').click(function() {
	  $(this).parent().find('.thething').slideToggle('fast');
	  $(this).find('.icon').toggleClass('flipthething');
	  return false
	});
});