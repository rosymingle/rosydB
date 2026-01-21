$(document).on("click", ".accordion-headline, .accordion-arrow, .accordion-arrow-white, .cl-accordion-headline, .cl-accordion-arrow", function (e) {
	e.stopPropagation(); // Prevent clicks from bubbling up and affecting nested accordions
	$(this).closest(".accordion-section, .cl-accordion-section").toggleClass("active");
});

$("[id$='accordion-toggle-all']").click(function () {
	var $sections = $(".accordion-section, .cl-accordion-section");
	var allExpanded = $sections.length === $sections.filter(".active").length;
	$sections.toggleClass("active", !allExpanded);
});