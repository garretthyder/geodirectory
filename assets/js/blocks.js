/* GD > Popular Post Category */
jQuery(document).on('click', '.geodir-showcat', function() {
	var objCat = $(this).closest('.geodir-category-list-in');
	jQuery(objCat).find('li.geodir-pcat-hide').removeClass('geodir-hide');
	jQuery(objCat).find('a.geodir-showcat').addClass('geodir-hide');
	jQuery(objCat).find('a.geodir-hidecat').removeClass('geodir-hide');
});
jQuery(document).on('click', '.geodir-hidecat', function() {
	var objCat = $(this).closest('.geodir-category-list-in');
	jQuery(objCat).find('li.geodir-pcat-hide').addClass('geodir-hide');
	jQuery(objCat).find('a.geodir-hidecat').addClass('geodir-hide');
	jQuery(objCat).find('a.geodir-showcat').removeClass('geodir-hide');
});