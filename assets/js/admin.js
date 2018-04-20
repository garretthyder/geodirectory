gd_infowindow = window.gdMaps == 'google' ? new google.maps.InfoWindow() : null;

jQuery(window).load(function() {
    // Chosen selects
    if (jQuery("select.chosen_select").length > 0) {
        jQuery("select.chosen_select").chosen();
        jQuery("select.chosen_select_nostd").chosen({
            allow_single_deselect: 'true'
        });
    }

    // tooltips
    gd_init_tooltips();
    
    // rating click
    jQuery( 'a.gd-rating-link' ).click( function() {
        jQuery.post( ajaxurl, { action: 'geodirectory_rated' } );
        jQuery( this ).parent().text( jQuery( this ).data( 'rated' ) );
    });

    // image uploads
    jQuery('.gd-upload-img').each(function() {
        var $wrap = jQuery(this);
        var field = $wrap.data('field');
        if (jQuery('[name="' + field + '[id]"]').length && !jQuery('[name="' + field + '[id]"]').val()) {
            jQuery('.gd_remove_image_button', $wrap).hide();
        }
    });

    var media_frame = [];
    jQuery(document).on('click', '.gd_upload_image_button', function(e) {
        e.preventDefault();

        var $this = jQuery(this);
        var $wrap = $this.closest('.gd-upload-img');
        var field = $wrap.data('field');

        if ( !field ) {
            return
        }

        if (media_frame && media_frame[field]) {
            media_frame[field].open();
            return;
        }

        media_frame[field] = wp.media.frames.downloadable_file = wp.media({
            title: geodir_params.txt_choose_image,
            button: {
                text: geodir_params.txt_use_image
            },
            multiple: false
        });

        // When an image is selected, run a callback.
        media_frame[field].on('select', function() {
            var attachment = media_frame[field].state().get('selection').first().toJSON();

            var thumbnail = attachment.sizes.medium || attachment.sizes.full;
            if (field) {
                if(jQuery('[name="' + field + '[id]"]').length){
                    jQuery('[name="' + field + '[id]"]').val(attachment.id);
                }
                if(jQuery('[name="' + field + '[src]"]').length){
                    jQuery('[name="' + field + '[src]"]').val(attachment.url);
                }
                if(jQuery('[name="' + field + '"]').length){
                    jQuery('[name="' + field + '"]').val(attachment.id);
                }


            }
            $wrap.closest('.form-field.form-invalid').removeClass('form-invalid');
            jQuery('.gd-upload-display', $wrap).find('img').attr('src', thumbnail.url);
            jQuery('.gd_remove_image_button').show();
        });
        // Finally, open the modal.
        media_frame[field].open();
    });

    jQuery(document).on('click', '.gd_remove_image_button', function() {
        var $this = jQuery(this);
        var $wrap = $this.closest('.gd-upload-img');
        var field = $wrap.data('field');
        jQuery('.gd-upload-display', $wrap).find('img').attr('src', geodir_params.img_spacer).removeAttr('width height sizes alt class');
		if (field) {
			if (jQuery('[name="' + field + '[id]"]').length > 0) {
				jQuery('[name="' + field + '[id]"]').val('');
				jQuery('[name="' + field + '[src]"]').val('');
			}
			if (jQuery('[name="' + field + '"]').length > 0) {
				jQuery('[name="' + field + '"]').val('');
			}
		}
        $this.hide();
        return false;
    });
	
	// Load color picker
	var gdColorPicker = jQuery('.gd-color-picker');
	console.log('gdColorPicker');
	if (gdColorPicker.length) {
		gdColorPicker.wpColorPicker();
	}

    // Save settings validation
    gd_settings_validation();

});

/**
 * Init the tooltips
 */
function gd_init_tooltips(){

    // we create, then destroy then create so we can ajax load and then call this function with impunity.
    jQuery('.gd-help-tip').tooltip().tooltip('destroy').tooltip({
             content: function () {
            return jQuery(this).prop('title');
        },
        tooltipClass: 'gd-ui-tooltip',
        position: {
            my: 'center top',
            at: 'center bottom+10',
            collision: 'flipfit',
        },
        show: null,
        close: function (event, ui) {
            ui.tooltip.hover(

                function () {
                    jQuery(this).stop(true).fadeTo(400, 1);
                },

                function () {
                    jQuery(this).fadeOut("400", function () {
                        jQuery(this).remove();
                    })
                });
        }
    });
}

/* Check Uncheck All Related Options Start*/
jQuery(document).ready(function() {
    jQuery('#geodir_add_location_url').click(function() {
        if (jQuery(this).is(':checked')) {
            jQuery(this).closest('td').find('input').attr('checked', true).not(this).prop('disabled', false);
        } else {
            jQuery(this).closest('td').find('input').attr('checked', false).not(this).prop('disabled', true);
        }
    });

    if (jQuery('#geodir_add_location_url').is(':checked')) {
        jQuery('#geodir_add_location_url').closest('td').find('input').not(jQuery('#geodir_add_location_url')).prop('disabled', false);
    } else {
        jQuery('#geodir_add_location_url').closest('td').find('input').not(jQuery('#geodir_add_location_url')).prop('disabled', true);
    }

    jQuery('#submit').click(function() {
        if (jQuery('input[name="ct_cat_icon[src]"]').hasClass('ct_cat_icon[src]')) {
            if (jQuery('input[name="ct_cat_icon[src]"]').val() == '') {
                jQuery('input[name="ct_cat_icon[src]"]').closest('tr').addClass('form-invalid');
                return false;
            } else {
                jQuery('input[name="ct_cat_icon[src]"]').closest('tr').removeClass('form-invalid');
                jQuery('input[name="ct_cat_icon[src]"]').closest('div').removeClass('form-invalid');
            }
        }
    });

    function location_validation(fields) {
        var error = false;

        if (fields.val() == '') {
            jQuery(fields).closest('.gtd-formfeild').find('.gd-location_message_error').show();
            error = true;
        } else {
            jQuery(fields).closest('.gtd-formfeild').find('.gd-location_message_error').hide();
        }

        if (error) {
            return false;
        } else {
            return true;
        }
    }

    jQuery('#location_save').click(function() {
        var is_validate = true;

        jQuery(this).closest('form').find('.required:visible').each(function() {
            var fields = jQuery(this).find('input, select');
            if (!location_validation(fields))
                is_validate = false;
        });

        if (!is_validate) {
            return false;
        }
    });

    jQuery('.default_location_form').find(".required:visible").find('input').blur(function() {
        location_validation(jQuery(this));
    });

    jQuery('.default_location_form').find(".required:visible").find('select').change(function() {
        location_validation(jQuery(this));
    });

    jQuery('.gd-cats-display-checkbox input[type="checkbox"]').click(function() {
        var isChecked = jQuery(this).is(':checked');

        if (!isChecked) {
            var chkVal = jQuery(this).val();
            jQuery(this).closest('.gd-parent-cats-list').find('.gd-cat-row-' + chkVal + ' input[type="checkbox"]').prop("checked", isChecked);
        }
    });

    jQuery('.gd-import-export [data-type="date"]').each(function() {
        jQuery(this).datepicker({changeMonth: true, changeYear: true, dateFormat:'yy-mm-dd'});
    });
    jQuery('#gd-wrapper-main .wp-editor-wrap').each(function() {
        var elH = parseFloat(jQuery(this).find('.wp-editor-container').height());
        if (elH > 30) {
            jQuery(this).find('.wp-editor-container').attr('data-height', elH);
        }
    });
    setTimeout(function() {
        jQuery('#gd-wrapper-main .wp-editor-wrap').each(function() {
            var elH = parseFloat(jQuery(this).find('.wp-editor-container').attr('data-height'));
            if (elH > 30) {
                jQuery(this).find('iframe').css({
                    'height': elH + 'px'
                });
            }
        });
    }, 1000);
});
/* Check Uncheck All Related Options End*/

// WMPL copy function
jQuery(document).ready(function() {
    if (jQuery("#icl_cfo").length == 0) {} else { // it exists let's do stuff.
        jQuery('#icl_cfo').click(function() {
            gd_copy_translation(window.location.protocol + '//' + document.location.hostname + ajaxurl);
        });
    }
});

function gd_copy_translation(url) {
    post_id = jQuery("#icl_translation_of_hidden").val();

    jQuery.ajax({
        url: url,
        type: 'POST',
        dataType: 'html',
        data: {
            action: 'gd_copy_original_translation',
            post_id: post_id
        },
        beforeSend: function() {},
        success: function(data, textStatus, xhr) {
            data = JSON.parse(data);

            for (var key in data) {
                jQuery('#' + key).val(data[key]);
            }

            if (data.post_images) {
                plu_show_thumbs('post_images');
            }

            if (data.categories) {
                var a = ["a", "b", "c"];
                data.categories.forEach(function(cat) {
                    show_subcatlist(cat);
                });
            }

            /////////////////
            if (data.post_latitude && data.post_longitude) {
                latlon = new google.maps.LatLng(data.post_latitude, data.post_longitude);
                jQuery.goMap.map.setCenter(latlon);
                updateMarkerPosition(latlon);
                centerMarker();

                if (!data.post_address) {
                    google.maps.event.trigger(baseMarker, 'dragend');
                } // geocode address only if no street name present
            }

            if (data.post_country && jQuery('#post_country').length) {
                jQuery('#post_country').val(data.post_country);
                jQuery("#post_country").trigger("chosen:updated");
            }

            if (data.post_region && jQuery('#post_region').length) {
                jQuery('#post_region').val(data.post_region);
                jQuery("#post_region").trigger("chosen:updated");
            }

            if (data.post_city && jQuery('#post_city').length) {
                jQuery('#post_city').val(data.post_city);
                jQuery("#post_city").trigger("chosen:updated");
            }

            if (data.post_zip && jQuery('#post_zip').length) {
                jQuery('#post_zip').val(data.post_zip);
            }

            if (data.post_country && data.post_region && data.post_city && data.post_zip) {
                gdfi_codeaddress = true;
                gdfi_city = data.post_city;
                gdfi_street = data.post_address;
                gdfi_zip = data.post_zip;
                geodir_codeAddress(true);

                setTimeout(function() {
                    google.maps.event.trigger(baseMarker, 'dragend');
                }, 600);

                //incase the drag marker changes the street and post code we should fix it.
                setTimeout(function() {
                    if (data.post_address && jQuery('#post_address').length) {
                        jQuery('#post_address').val(data.post_address);
                    }
                    if (data.post_zip && jQuery('#post_zip').length) {
                        jQuery('#post_zip').val(data.post_zip);
                    }
                }, 1000);
            }
            //////////////////////
        },
        error: function(xhr, textStatus, errorThrown) {
            alert(textStatus);
        }
    });
}

// Diagnosis related js starts here
/* Check Uncheck All Related Options Start*/
jQuery(document).ready(function() {
    jQuery('.geodir_diagnosis_button').click(function(e) {
        e.preventDefault();
        var diagnose = (jQuery(this).data('diagnose'));
        var step_process = (jQuery(this).data('step'));
        var ptype = (jQuery(this).data('ptype'));
        if (step_process == '1') {
            jQuery('#' + diagnose + '_sub_table').show();
        } else {
            jQuery('.tool-' + diagnose).remove();
            var result_container = jQuery('.geodir_diagnostic_result-' + diagnose);
            if (!result_container.length) {
                if( typeof ptype !== "undefined") {
                    jQuery('<tr class="gd-tool-results tool-' + diagnose + '" ><td colspan="3"><span class="gd-tool-results-remove" onclick="jQuery(this).closest(\'tr\').remove();"></span><div class="geodir_diagnostic_result-' + diagnose + '"></div></td></tr>').insertAfter(jQuery('#' + diagnose +'_'+ ptype));
                } else {
                    jQuery('<tr class="gd-tool-results tool-' + diagnose + '" ><td colspan="3"><span class="gd-tool-results-remove" onclick="jQuery(this).closest(\'tr\').remove();"><i class="fa fa-spinner fa-spin"></i></span><div class="geodir_diagnostic_result-' + diagnose + '"></div></td></tr>').insertAfter(jQuery(this).parents('tr'));
                }
                var result_container = jQuery('.geodir_diagnostic_result-' + diagnose);
            }

            if( typeof ptype !== "undefined") {
                jQuery('<tr>'+
                    '<td colspan="3">' +
                    '<div class="">' +
                    '<div id="gd_progressbar">' +
                    '<div class="gd-progress-label"></div>' +
                    '</div>' +
                    '</div>' +
                    '</td>' +
                    '</tr>').insertAfter(jQuery('#' + diagnose +'_'+ ptype));

                jQuery('#gd_progressbar').progressbar({value: 0});
                jQuery('#gd_progressbar .gd-progress-label').html('<i class="fa fa-refresh fa-spin"></i> Processing...');

            }

            // start the process
            gd_process_diagnose_step( 0, ptype, diagnose, result_container );
        }
        
    });

    geodir_enable_fix_buttons(); // enabel fix buttons
});

function gd_process_diagnose_step(step, ptype, diagnose, result_container) {
    jQuery.ajax({
        url: geodir_params.ajax_url,
        type: 'POST',
        dataType: 'html',
        data: {
            action: 'geodir_admin_ajax',
            geodir_admin_ajax_action: 'diagnosis',
            diagnose_this: diagnose,
            step: step,
            ptype: ptype
        },
        beforeSend: function() {},
        success: function(data, textStatus, xhr) {
            if( typeof ptype === "undefined" || 'done' == data ) {
                if( typeof ptype !== "undefined"){
                    jQuery('#' + diagnose +'_'+ ptype).html('<ul class="geodir_noproblem_info"><li>'+data+'</li></ul>');
                    jQuery('#gd_progressbar').remove();
                    jQuery('#' + diagnose + '_sub_table').find('.gd-tool-results').remove();

                } else {
                    jQuery('.tool-' + diagnose + ' .gd-tool-results-remove').html('<i class="fa fa-times"></i>');
                    result_container.html(data);
                }
                geodir_enable_fix_buttons(); //enable new fix buttons
            } else {
                resp = JSON.parse(data);
                jQuery('#gd_progressbar').progressbar({value: resp.percent});
                jQuery('#gd_progressbar .gd-progress-label').html('<i class="fa fa-refresh fa-spin"></i> Processing...');
                gd_process_diagnose_step(parseInt( resp.step ), ptype, diagnose, result_container)
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            alert(textStatus);
        }
    }); // end of ajax
}

function geodir_enable_fix_buttons() {
    jQuery('.geodir_fix_diagnostic_issue').click(function() {
        var diagnose = (jQuery(this).data('diagnostic-issue'))
        var result_container = jQuery(this).parents('td').find("div")

        jQuery.ajax({
            url: geodir_params.ajax_url,
            type: 'POST',
            dataType: 'html',
            data: {
                action: 'geodir_admin_ajax',
                geodir_admin_ajax_action: 'diagnosis-fix',
                diagnose_this: diagnose,
                fix: 1
            },
            beforeSend: function() {},
            success: function(data, textStatus, xhr) {
                result_container.html(data);
                geodir_enable_fix_buttons(); //enable new fix buttons
            },
            error: function(xhr, textStatus, errorThrown) {
                alert(textStatus);
            }
        }); // end of ajax
    });
}

function gd_progressbar(el, value, label) {
    var value = parseFloat(value);
    if ( value <= 100 ) {
        jQuery(el).find('#gd_progressbar').progressbar("value",value);
        if (typeof label != 'undefined') {
            jQuery(el).find('#gd_progressbar .gd-progress-label').html(label);
        }
    }
}

jQuery(document).ready(function($) {

    /**
     * Rating script for ratings inputs.
     * @info This is shared in both post.js and admin.js any changes shoudl be made to both.
     */
    jQuery(".gd-rating-input").each(function () {

        if (geodir_params.rating_type =='font-awesome') { // font awesome rating
            $type = 'i'
        }else{// image
            $type = 'img'
        }

        $total = jQuery(this).find('.gd-rating-foreground > ' + $type).length;
        $parent = this;

        // set the current star value and text
        $value = jQuery($parent).find('input').val();
        if($value > 0){
            jQuery($parent).find('.gd-rating-foreground').width( $value / $total * 100 + '%');
            jQuery($parent).find('.gd-rating-text').text( jQuery($parent).find($type+':eq('+ ($value - 1) +')').attr("title"));
        }

        // loop all rating stars
        jQuery(this).find($type).each(function (index) {
            $original_rating = jQuery($parent).find('input').val();

            $original_percent = $original_rating / $total * 100;
            $rating_set = false;

            jQuery(this).hover(
                function () {
                    $percent = 0;
                    $rating = index + 1;
                    $rating_text = jQuery(this).attr("title");
                    $original_rating_text = jQuery($parent).find('.gd-rating-text').text();
                    if ($rating > $total) {
                        $rating = $rating - $total;
                    }
                    $percent = $rating / $total * 100;
                    jQuery($parent).find('.gd-rating-foreground').width($percent + '%');
                    jQuery($parent).find('.gd-rating-text').text($rating_text);
                },
                function () {
                    if (!$rating_set) {
                        jQuery($parent).find('.gd-rating-foreground').width($original_percent + '%');
                        jQuery($parent).find('.gd-rating-text').text($original_rating_text);
                    } else {
                        $rating_set = false;
                    }
                }
            );

            jQuery(this).click(function () {
                $original_percent = $percent;
                $original_rating = $rating;
                jQuery($parent).find('input').val($rating);
                jQuery($parent).find('.gd-rating-text').text($rating_text);
                $rating_set = true;
            });

        });

    });

    jQuery('#geodir_location_prefix').attr('disabled', 'disabled');
    jQuery('.button-primary').click(function() {
        var error = false;
        var characterReg = /^\s*[a-zA-Z0-9,\s]+\s*$/;
        var listing_prefix = jQuery('#geodir_listing_prefix').val();
        var location_prefix = jQuery('#geodir_location_prefix').val();
        var listingurl_separator = jQuery('#geodir_listingurl_separator').val();
        var detailurl_separator = jQuery('#geodir_detailurl_separator').val();

        if (listing_prefix == '') {
            alert(geodir_params.listing_url_prefix_msg);
            jQuery('#geodir_listing_prefix').focus();
            error = true;
        }

        if (/^[a-z0-90\_9_-]*$/.test(listing_prefix) == false && listing_prefix != '') {
            jQuery('#geodir_listing_prefix').focus();
            alert(geodir_params.invalid_listing_prefix_msg);
            error = true;
        }

        if (error == true) {
            return false;
        } else {
            return true;
        }
    });

    jQuery('.map_post_type').click(function() {
        var divshow = jQuery(this).val();

        if (jQuery(this).is(':checked')) {
            jQuery('#' + divshow + ' input').each(function() {
                jQuery(this).attr('checked', 'checked');
            });
        } else {
            jQuery('#' + divshow + ' input').each(function() {
                jQuery(this).removeAttr('checked');
            });
        }
    });
});

// fix for related accents search.
function gd_replace_accents (s) {
    var chars = [{'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
        {'base':'AA','letters':/[\uA732]/g},
        {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
        {'base':'AO','letters':/[\uA734]/g},
        {'base':'AU','letters':/[\uA736]/g},
        {'base':'AV','letters':/[\uA738\uA73A]/g},
        {'base':'AY','letters':/[\uA73C]/g},
        {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
        {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
        {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
        {'base':'DZ','letters':/[\u01F1\u01C4]/g},
        {'base':'Dz','letters':/[\u01F2\u01C5]/g},
        {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
        {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
        {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
        {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
        {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
        {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
        {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
        {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
        {'base':'LJ','letters':/[\u01C7]/g},
        {'base':'Lj','letters':/[\u01C8]/g},
        {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
        {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
        {'base':'NJ','letters':/[\u01CA]/g},
        {'base':'Nj','letters':/[\u01CB]/g},
        {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
        {'base':'OI','letters':/[\u01A2]/g},
        {'base':'OO','letters':/[\uA74E]/g},
        {'base':'OU','letters':/[\u0222]/g},
        {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
        {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
        {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
        {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
        {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
        {'base':'TZ','letters':/[\uA728]/g},
        {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
        {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
        {'base':'VY','letters':/[\uA760]/g},
        {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
        {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
        {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
        {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
        {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
        {'base':'aa','letters':/[\uA733]/g},
        {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
        {'base':'ao','letters':/[\uA735]/g},
        {'base':'au','letters':/[\uA737]/g},
        {'base':'av','letters':/[\uA739\uA73B]/g},
        {'base':'ay','letters':/[\uA73D]/g},
        {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
        {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
        {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
        {'base':'dz','letters':/[\u01F3\u01C6]/g},
        {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
        {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
        {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
        {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
        {'base':'hv','letters':/[\u0195]/g},
        {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
        {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
        {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
        {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
        {'base':'lj','letters':/[\u01C9]/g},
        {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
        {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
        {'base':'nj','letters':/[\u01CC]/g},
        {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
        {'base':'oi','letters':/[\u01A3]/g},
        {'base':'ou','letters':/[\u0223]/g},
        {'base':'oo','letters':/[\uA74F]/g},
        {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
        {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
        {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
        {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
        {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
        {'base':'tz','letters':/[\uA729]/g},
        {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
        {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
        {'base':'vy','letters':/[\uA761]/g},
        {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
        {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
        {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
        {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}];
    for (var i=0; i < chars.length; i++) {
        s = s.replace(chars[i].letters, chars[i].base);
    }
    return s;
}

jQuery(function($) {
    try {
        if (window.gdMaps == 'osm') {
            $('input[name="post_address"]').autocomplete({
                source: function(request, response) {
                    $.ajax({
                        url: (location.protocol === 'https:' ? 'https:' : 'http:') + '//nominatim.openstreetmap.org/search',
                        dataType: "json",
                        data: {
                            q: request.term,
                            format: 'json',
                            addressdetails: 1,
                            limit: 5
                        },
                        success: function(data, textStatus, jqXHR) {
                            jQuery('input[name="post_address"]').removeClass('ui-autocomplete-loading');
                            response(data);
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(errorThrown);
                        },
                        complete: function(jqXHR, textStatus) {
                            jQuery('input[name="post_address"]').removeClass('ui-autocomplete-loading');
                        }
                    });
                },
                autoFocus: true,
                minLength: 1,
                appendTo: jQuery('input[name="post_address"]').closest('.geodir_form_row'),
                open: function(event, ui) {
                    jQuery('input[name="post_address"]').removeClass('ui-autocomplete-loading');
                },
                select: function(event, ui) {
                    item = gd_osm_parse_item(ui.item);
                    event.preventDefault();
                    $('input[name="post_address"]').val(item.display_address);
                    geocodeResponseOSM(item, true);
                },
                close: function(event, ui) {
                    jQuery('input[name="post_address"]').removeClass('ui-autocomplete-loading');
                }
            }).autocomplete("instance")._renderItem = function(ul, item) {
                if (!ul.hasClass('gd-osm-results')) {
                    ul.addClass('gd-osm-results');
                }

                var label = item.display_name;

                /*
                 item = gd_osm_parse_item(item);
                 if (item.display_address) {
                 label = gd_highlight(label, item.display_address, '<span class="gdOQ">', '</span>');
                 }
                 */

                if (label && this.term) {
                    label = gd_highlight(label, this.term);
                }

                return $("<li>").width($('input[name="post_address"]').outerWidth()).append('<i class="fa fa-map-marker"></i><span>' + label + '</span>').appendTo(ul);
            };
        }
    } catch (e) {
    }

    $('#gd_make_duplicates').click(function() {
        var $btn = $(this);
        var $el = $(this).closest('.gd-duplicate-table');
        var nonce = $(this).data('nonce');
        var post_id = $(this).data('post-id');
        var dups = [];
        $.each($('input[name="gd_icl_dup[]"]:checked', $el), function() {
            dups.push($(this).val());
        });
        if (!dups.length || !post_id) {
            $('input[name="gd_icl_dup[]"]', $el).focus();
            return false;
        }
        var data = {
            action: 'geodir_ajax_action',
            geodir_ajax: 'duplicate',
            post_id: post_id,
            dups: dups.join(','),
            _nonce: nonce
        };
        jQuery.ajax({
            url: geodir_params.ajax_url,
            data: data,
            type: 'POST',
            cache: false,
            dataType: 'json',
            beforeSend: function(xhr) {
                $('.fa-refresh', $el).show();
                $btn.attr('disabled', 'disabled');
            },
            success: function(res, status, xhr) {
                if (typeof res == 'object' && res) {
                    if (res.success) {
                        window.location.href = document.location.href;
                        return;
                    }
                    if (res.error) {
                        alert(res.error);
                    }
                }
            }
        }).complete(function(xhr, status) {
            $('.fa-refresh', $el).hide();
            $btn.removeAttr('disabled');
        })
    });

    try {
        $(document.body).on('geodir-select-init', function() {
            // Regular select boxes
            $(':input.geodir-select').filter(':not(.enhanced)').each(function() {
                var $this = $(this);
				var select2_args = $.extend({
                    minimumResultsForSearch: ($this.data('tags') ? 0 : (parseInt($this.data('min-results')) > 0 ? parseInt($this.data('min-results')) : 10)),
                    allowClear: $(this).data('allow_clear') ? true : false,
                    containerCssClass: 'gd-select2-selection',
                    dropdownCssClass: 'gd-select2-dropdown',
                    placeholder: $(this).data('placeholder'),
                    width: 'element',
                    dropdownAutoWidth : true,
                    templateSelection: function(data) {
						return geodirSelect2TemplateSelection($this, data, true);
					},
					templateResult: function(data) {
						return geodirSelect2TemplateSelection($this, data);
					}
                }, geodirSelect2FormatString());
                var $select2 = $(this).select2(select2_args);
                $select2.addClass('enhanced');
                $select2.data('select2').$container.addClass('gd-select2-container');
                $select2.data('select2').$dropdown.addClass('gd-select2-container');
				if ($(this).data('sortable')) {
					var $select = $(this);
					var $list = $(this).next('.select2-container').find('ul.select2-selection__rendered');
					$list.sortable({
						placeholder: 'ui-state-highlight select2-selection__choice',
						forcePlaceholderSize: true,
						items: 'li:not(.select2-search__field)',
						tolerance: 'pointer',
						stop: function() {
							$($list.find('.select2-selection__choice').get().reverse()).each(function() {
								var id = $(this).data('data').id;
								var option = $select.find('option[value="' + id + '"]')[0];
								$select.prepend(option);
							});
						}
					});
				}
				$this.on('change.select2', function(e) {
					geodirSelect2OnChange($this, $select2);
				});
				if ($this.data('cmultiselect') || $this.data('cselect')) {
					$this.trigger('change.select2');
				}
            });
            $(':input.geodir-select-nostd').filter(':not(.enhanced)').each(function() {
                var $this = $(this);
				var select2_args = $.extend({
                    minimumResultsForSearch: ($this.data('tags') ? 0 : (parseInt($this.data('min-results')) > 0 ? parseInt($this.data('min-results')) : 10)),
                    allowClear: true,
                    containerCssClass: 'gd-select2-selection',
                    dropdownCssClass: 'gd-select2-dropdown',
                    placeholder: $(this).data('placeholder'),
					templateSelection: function(data) {
						return geodirSelect2TemplateSelection($this, data, true);
					},
					templateResult: function(data) {
						return geodirSelect2TemplateSelection($this, data);
					}
                }, geodirSelect2FormatString());
                var $select2 = $(this).select2(select2_args);
                $select2.addClass('enhanced');
                $select2.data('select2').$container.addClass('gd-select2-container');
                $select2.data('select2').$dropdown.addClass('gd-select2-container');
				if ($(this).data('sortable')) {
					var $select = $(this);
					var $list = $(this).next('.select2-container').find('ul.select2-selection__rendered');
					$list.sortable({
						placeholder: 'ui-state-highlight select2-selection__choice',
						forcePlaceholderSize: true,
						items: 'li:not(.select2-search__field)',
						tolerance: 'pointer',
						stop: function() {
							$($list.find('.select2-selection__choice').get().reverse()).each(function() {
								var id = $(this).data('data').id;
								var option = $select.find('option[value="' + id + '"]')[0];
								$select.prepend(option);
							});
						}
					});
				}
				$this.on('change.select2', function(e) {
					geodirSelect2OnChange($this, $select2);
				});
				if ($this.data('cmultiselect') || $this.data('cselect')) {
					$this.trigger('change.select2');
				}
            });
			// Ajax user search
			$(':input.geodir-user-search').filter(':not(.enhanced)').each(function() {
				var select2_args = {
					allowClear: $(this).data('allow_clear') ? true : false,
					placeholder: $(this).data('placeholder'),
					minimumInputLength: $(this).data('min_input_length') ? $(this).data('min_input_length') : '1',
					escapeMarkup: function(m) {
						return m;
					},
					ajax: {
						url: geodir_params.ajax_url,
						dataType: 'json',
						delay: 1000,
						data: function(params) {
							return {
								term: params.term,
								action: 'geodir_json_search_users',
								security: geodir_params.search_users_nonce,
								exclude: $(this).data('exclude')
							};
						},
						processResults: function(data) {
							var terms = [];
							if (data) {
								$.each(data, function(id, text) {
									terms.push({
										id: id,
										text: text
									});
								});
							}
							return {
								results: terms
							};
						},
						cache: true
					}
				};
				select2_args = $.extend(select2_args, geodirSelect2FormatString());
				var $select2 = $(this).select2(select2_args);
				$select2.addClass('enhanced');
				$select2.data('select2').$container.addClass('gd-select2-container');
				$select2.data('select2').$dropdown.addClass('gd-select2-container');
				if ($(this).data('sortable')) {
					var $select = $(this);
					var $list = $(this).next('.select2-container').find('ul.select2-selection__rendered');
					$list.sortable({
						placeholder: 'ui-state-highlight select2-selection__choice',
						forcePlaceholderSize: true,
						items: 'li:not(.select2-search__field)',
						tolerance: 'pointer',
						stop: function() {
							$($list.find('.select2-selection__choice').get().reverse()).each(function() {
								var id = $(this).data('data').id;
								var option = $select.find('option[value="' + id + '"]')[0];
								$select.prepend(option);
							});
						}
					});
				}
			});
			// select2 autocomplete search
			$(':input.geodir-select-search').filter(':not(.enhanced)').each(function() {
				var search = $(this).data('select-search');
				if ( ! search ) {
					return true;
				}
				var select2_args = {
					allowClear: $(this).data('allow_clear') ? true : false,
					placeholder: $(this).data('placeholder'),
					minimumInputLength: $(this).data('min-input-length') ? $(this).data('min-input-length') : '2',
					escapeMarkup: function(m) {
						return m;
					},
					ajax: {
						url: geodir_params.ajax_url,
						type: 'POST',
						dataType: 'json',
						delay: 250,
						data: function(params) {
							var data = {
								term: params.term,
								action: 'geodir_json_search_' + search,
								security: $(this).data('nonce')
							};
							if ( $(this).data('exclude') ) {
								data.exclude = $(this).data('exclude');
							}
							if ( $(this).data('include') ) {
								data.include = $(this).data('include');
							}
							if ( $(this).data('limit') ) {
								data.limit = $(this).data('limit');
							}
							return data;
						},
						processResults: function(data) {
							var terms = [];
							if (data) {
								$.each(data, function(id, text) {
									terms.push({
										id: id,
										text: text
									});
								});
							}
							return {
								results: terms
							};
						},
						cache: true
					}
				};
				select2_args = $.extend(select2_args, geodirSelect2FormatString());
				var $select2 = $(this).select2(select2_args);
				$select2.addClass('enhanced');
				$select2.data('select2').$container.addClass('gd-select2-container');
				$select2.data('select2').$dropdown.addClass('gd-select2-container');

				if ($(this).data('sortable')) {
					var $select = $(this);
					var $list = $(this).next('.select2-container').find('ul.select2-selection__rendered');

					$list.sortable({
						placeholder: 'ui-state-highlight select2-selection__choice',
						forcePlaceholderSize: true,
						items: 'li:not(.select2-search__field)',
						tolerance: 'pointer',
						stop: function() {
							$($list.find('.select2-selection__choice').get().reverse()).each(function() {
								var id = $(this).data('data').id;
								var option = $select.find('option[value="' + id + '"]')[0];
								$select.prepend(option);
							});
						}
					});
					// Keep multiselects ordered alphabetically if they are not sortable.
				} else if ($(this).prop('multiple')) {
					$(this).on('change', function() {
						var $children = $(this).children();
						$children.sort(function(a, b) {
							var atext = a.text.toLowerCase();
							var btext = b.text.toLowerCase();

							if (atext > btext) {
								return 1;
							}
							if (atext < btext) {
								return -1;
							}
							return 0;
						});
						$(this).html($children);
					});
				}
			});
        }).trigger('geodir-select-init');
        $('html').on('click', function(event) {
            if (this === event.target) {
                $('.geodir-select, :input.geodir-user-search, :input.geodir-select-search').filter('.select2-hidden-accessible').select2('close');
            }
        });
    } catch (err) {
        window.console.log(err);
    }
});

function geodirSelect2FormatString() {
    return {
        'language': {
            errorLoading: function() {
                // Workaround for https://github.com/select2/select2/issues/4355 instead of i18n_ajax_error.
                return geodir_params.i18n_searching;
            },
            inputTooLong: function(args) {
                var overChars = args.input.length - args.maximum;
                if (1 === overChars) {
                    return geodir_params.i18n_input_too_long_1;
                }
                return geodir_params.i18n_input_too_long_n.replace('%item%', overChars);
            },
            inputTooShort: function(args) {
                var remainingChars = args.minimum - args.input.length;
                if (1 === remainingChars) {
                    return geodir_params.i18n_input_too_short_1;
                }
                return geodir_params.i18n_input_too_short_n.replace('%item%', remainingChars);
            },
            loadingMore: function() {
                return geodir_params.i18n_load_more;
            },
            maximumSelected: function(args) {
                if (args.maximum === 1) {
                    return geodir_params.i18n_selection_too_long_1;
                }
                return geodir_params.i18n_selection_too_long_n.replace('%item%', args.maximum);
            },
            noResults: function() {
                return geodir_params.i18n_no_matches;
            },
            searching: function() {
                return geodir_params.i18n_searching;
            }
        }
    };
}

function geodirSelect2TemplateSelection($el, data, main) {
    if (typeof main != 'undefined' && main && $el.data('cmultiselect')) {
        var rEl;
        rEl = '<span class="select2-selection_gd_custom">';
          rEl += '<span class="select2-selection_gd_text">' + data.text + '</span>';
          rEl += '<span class="select2-selection_gd_field">';
            rEl += '<input type="radio" title="'+geodir_params.i18n_set_as_default+'" class="select2-selection_gd_v_' + (data.id != 'undefined' ? data.id : '') + '" onchange="jQuery(this).closest(\'form\').find(\'input[name=' + $el.data('cmultiselect') + ']\').val(jQuery(this).val());" value="' + (data.id != 'undefined' ? data.id : '') + '" name="' + $el.data('cmultiselect') + '_radio">';
          rEl += '</span>';
        rEl += '</span>';
        return jQuery(rEl);
    }
	$option = jQuery(data.element);
	if ($el.data('fa-icons') && $option.data('fa-icon')) {
        var style = '';
		if (typeof main != 'undefined' && main) {
			if ($el.data('fa-color')) {
				style = ' style="color:' + $el.data('fa-color') + '"';
			} else if ($option.data('fa-color')) {
				style = ' style="color:' + $option.data('fa-color') + '"';
			}
		}
		rEl = '<span class="select2-selection_gd_custom">';
          rEl += '<i class="fa ' + $option.data('fa-icon') + '"' + style + '></i> ';
		  rEl += data.text;
        rEl += '</span>';
        return jQuery(rEl);
    }
    return data.text;
}

function geodirSelect2OnChange($this, $select2) {
    var $cont, $field, value, $input;
	$cont = $select2.data('select2').$container;
    if ($this.data('cmultiselect')) {
        $field = $this.closest('form').find('input[name=' + $this.data('cmultiselect') + ']');
        value = $field.val() != 'undefined' ? $field.val() : '';
        if (jQuery('.select2-selection_gd_field', $cont).length > 0) {
            if (jQuery('.select2-selection_gd_v_' + value).length > 0) {
                $input = jQuery('.select2-selection_gd_v_' + value);
            } else {
                $input = jQuery('.select2-selection_gd_field:first', $cont).find('[type="radio"]');
            }
            $input.prop('checked', true).trigger('change');
        } else {
            $field.val('');
        }
    }
	if ($this.data('cselect')) {
        $field = $this.closest('form').find('input[name=' + $this.data('cselect') + ']');
        $field.val($this.val());
    }
}

function gdSetClipboard( data, $el ) {
	if ( 'undefined' === typeof $el ) {
		$el = jQuery( document );
	}
	var $temp_input = jQuery( '<textarea style="opacity:0">' );
	jQuery( 'body' ).append( $temp_input );
	$temp_input.val( data ).select();

	$el.trigger( 'beforecopy' );
	try {
		document.execCommand( 'copy' );
		$el.trigger( 'aftercopy' );
	} catch ( err ) {
		$el.trigger( 'aftercopyfailure' );
	}

	$temp_input.remove();
}

function gdClearClipboard() {
	gdSetClipboard( '' );
}

jQuery(function(){
    if (window.gdMaps === 'google') {
        console.log('Google Maps API Loaded :)');
        jQuery('body').addClass('gd-google-maps');
    } else if (window.gdMaps === 'osm') {
        console.log('Leaflet | OpenStreetMap API Loaded :)');
        jQuery('body').addClass('gd-osm-gmaps');
    } else {
        console.log('Maps API Not Loaded :(');
        jQuery('body').addClass('gd-no-gmaps');
    }
});
var gdMaps = null
if ((window.gdSetMap=='google' || window.gdSetMap=='auto') && window.google && typeof google.maps!=='undefined') {
    gdMaps = 'google';
} else if ((window.gdSetMap=='osm' || window.gdSetMap=='auto') && typeof L!=='undefined' && typeof L.version!=='undefined') {
    gdMaps = 'osm';
}
window.gdMaps = window.gdMaps || gdMaps;


function init_advanced_settings(){
    jQuery( ".gd-advanced-toggle" ).off("click").click(function() {
        jQuery(".gd-advanced-toggle").toggleClass("gda-hide");
        console.log('toggle');
        jQuery(".gd-advanced-setting, #default_location_set_address_button").toggleClass("gda-show");
    });
}

function gd_recommended_install_plugin($this,$slug,$nonce){
    //alert($slug);

    var data = {
        'action':           'install-plugin',
        '_ajax_nonce':       $nonce,
        'slug':              $slug
    };

    jQuery.ajax({
        type: "POST",
        url: ajaxurl,
        data: data, // serializes the form's elements.
        beforeSend: function()
        {
            jQuery($this).html('<i class="fa fa-refresh fa-spin" ></i> ' + jQuery($this).data("text-installing")).attr("disabled", true);
        },
        success: function(data)
        {
            // if(data.data){
            //     jQuery( ".geodir-wizard-widgets-result" ).text(data.data);
            // }
            console.log(data);
            if(data.success){
                jQuery($this).html(jQuery($this).data("text-installed")).removeClass('button-primary').addClass('button-secondary');

                //gd_wizard_check_plugins();
                //gd_wizard_install_plugins($nonce);
                if(data.data.activateUrl){
                    gd_recommended_activate_plugin($this,data.data.activateUrl,$slug);
                }
            }else{
                jQuery($this).html(jQuery($this).data("text-error"));
                alert('something went wrong');
            }
        }
    });
}

function gd_recommended_buy_popup($this,$slug,$nonce,$item_id){

    $url = jQuery($this).attr("href");
    $title = jQuery($this).parent().parent().find(".gd-product-title h3").html();
    jQuery('#gd-recommended-buy .gd-recommended-buy-title').html($title);
    jQuery('#gd-recommended-buy .gd-recommended-buy-link').attr("href",$url);
    $lightbox = lity('#gd-recommended-buy');

    jQuery(".gd-recommended-buy-button").unbind('click').click(function(){
        $licence =  jQuery(".gd-recommended-buy-key").val();
        if($licence==''){
            alert("Please enter a key");
        }else{
            jQuery(".gd-recommended-buy-key").val('');
            $lightbox.close();
            gd_recommended_addon_install_plugin($this,$slug,$nonce,$item_id,$licence);
        }
    });
}

function gd_recommended_addon_install_plugin($this,$slug,$nonce,$item_id,$licence){

    // @todo remove once out of beta
    alert("This feature is not yet implemented in the beta");
    return false;

    var data = {
        'action':           'install-plugin',
        '_ajax_nonce':       $nonce,
        'slug':              $slug,
        'update_url':        "https://wpgeodirectory.com",
        'item_id':           $item_id,
        'license':           $licence
    };

    jQuery.ajax({
        type: "POST",
        url: ajaxurl,
        data: data, // serializes the form's elements.
        beforeSend: function()
        {
            jQuery($this).html('<i class="fa fa-refresh fa-spin" ></i> ' + jQuery($this).data("text-installing")).attr("disabled", true);
        },
        success: function(data)
        {
            // if(data.data){
            //     jQuery( ".geodir-wizard-widgets-result" ).text(data.data);
            // }
            console.log(data);
            if(data.success){
                jQuery($this).html(jQuery($this).data("text-installed")).removeClass('button-primary').addClass('button-secondary');

                //gd_wizard_check_plugins();
                //gd_wizard_install_plugins($nonce);
                if(data.data.activateUrl){
                    gd_recommended_activate_plugin($this,data.data.activateUrl,$slug);
                }
            }else{
                jQuery($this).html(jQuery($this).data("text-error"));
                alert('something went wrong');
            }
        }
    });
}

/**
 * Try to silently activate the plugin after install.
 *
 * @param $url
 */
function gd_recommended_activate_plugin($this,$url,$slug){

    jQuery.post($url, function(data, status){
        console.log($slug+'plugin activated')
    });
}

// Some settings validation




function gd_settings_validation(){
    jQuery("#mainform").submit(function(e){
        $error = '';

        if(jQuery('#page_location').length){
            var arr = [];
            jQuery("#mainform select").each(function(){
                var value = jQuery(this).val();
                if(value ){
                    if (arr.indexOf(value) == -1)
                        arr.push(value);
                    else
                        $error = geodir_params.txt_page_settings;
                }
               });
        }

        if($error != ''){
            console.log(arr);
            alert($error );
            return false;
        }

    });
}