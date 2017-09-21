<?php
/**
 * GeoDirectory GeoDirectory Popular Post View Widget
 *
 * @since 1.0.0
 *
 * @package GeoDirectory
 */

/**
 * GeoDirectory popular posts widget class.
 *
 * @since 1.0.0
 */
class GeoDir_Widget_Popular_Post_View extends WP_Widget {

    /**
     * Register the popular posts widget.
     *
     * @since 1.0.0
     * @since 1.5.1 Changed from PHP4 style constructors to PHP5 __construct.
     */
    public function __construct() {
        $widget_ops = array(
            'classname' => 'geodir_popular_post_view',
            'description' => __( 'GD > Popular Post View', 'geodirectory' ),
            'customize_selective_refresh' => true,
            'geodirectory' => true,
            'gd_show_pages' => array(),
        );
        parent::__construct( 'popular_post_view', __( 'GD > Popular Post View', 'geodirectory' ), $widget_ops );
    }

    /**
     * Front-end display content for popular posts widget.
     *
     * @since 1.0.0
     * @since 1.5.1 Declare function public.
     *
     * @param array $args     Widget arguments.
     * @param array $instance Saved values from database.
     */
    public function widget($args, $instance) {
        geodir_popular_postview_output($args, $instance);
    }

    /**
     * Sanitize popular posts widget form values as they are saved.
     *
     * @since 1.0.0
     * @since 1.5.1 Declare function public.
     *
     * @param array $new_instance Values just sent to be saved.
     * @param array $old_instance Previously saved values from database.
     *
     * @return array Updated safe values to be saved.
     */
    public function update($new_instance, $old_instance) {
        //save the widget
        $instance = $old_instance;

        if ($new_instance['title'] == '') {
            $title = geodir_ucwords(strip_tags($new_instance['category_title']));
            //$instance['title'] = $title;
        }
        $instance['title'] = strip_tags($new_instance['title']);

        $instance['post_type'] = strip_tags($new_instance['post_type']);
        //$instance['category'] = strip_tags($new_instance['category']);
        $instance['category'] = isset($new_instance['category']) ? $new_instance['category'] : '';
        $instance['category_title'] = strip_tags($new_instance['category_title']);
        $instance['post_number'] = strip_tags($new_instance['post_number']);
        $instance['layout'] = strip_tags($new_instance['layout']);
        $instance['listing_width'] = strip_tags($new_instance['listing_width']);
        $instance['list_sort'] = strip_tags($new_instance['list_sort']);
        $instance['character_count'] = $new_instance['character_count'];
        if (isset($new_instance['add_location_filter']) && $new_instance['add_location_filter'] != '')
            $instance['add_location_filter'] = strip_tags($new_instance['add_location_filter']);
        else
            $instance['add_location_filter'] = '0';

        $instance['show_featured_only'] = isset($new_instance['show_featured_only']) && $new_instance['show_featured_only'] ? 1 : 0;
        $instance['show_special_only'] = isset($new_instance['show_special_only']) && $new_instance['show_special_only'] ? 1 : 0;
        $instance['with_pics_only'] = isset($new_instance['with_pics_only']) && $new_instance['with_pics_only'] ? 1 : 0;
        $instance['with_videos_only'] = isset($new_instance['with_videos_only']) && $new_instance['with_videos_only'] ? 1 : 0;
        $instance['use_viewing_post_type'] = isset($new_instance['use_viewing_post_type']) && $new_instance['use_viewing_post_type'] ? 1 : 0;
        $instance['hide_if_empty'] = !empty($new_instance['hide_if_empty']) ? 1 : 0;

        return $instance;
    }

    /**
     * Back-end popular posts widget settings form.
     *
     * @since 1.0.0
     * @since 1.5.1 Declare function public.
     *
     * @param array $instance Previously saved values from database.
     */
    public function form($instance) {
        //widgetform in backend
        $instance = wp_parse_args((array)$instance,
            array('title' => '',
                'post_type' => '',
                'category' => array(),
                'category_title' => '',
                'list_sort' => '',
                'list_order' => '',
                'post_number' => '5',
                'layout' => 'gridview_onehalf',
                'listing_width' => '',
                'add_location_filter' => '1',
                'character_count' => '20',
                'show_featured_only' => '',
                'show_special_only' => '',
                'with_pics_only' => '',
                'with_videos_only' => '',
                'use_viewing_post_type' => '',
                'hide_if_empty' => ''
            )
        );

        $title = strip_tags($instance['title']);
        $post_type = strip_tags($instance['post_type']);
        $category = $instance['category'];
        $category_title = strip_tags($instance['category_title']);
        $list_sort = strip_tags($instance['list_sort']);
        $list_order = strip_tags($instance['list_order']);
        $post_number = strip_tags($instance['post_number']);
        $layout = strip_tags($instance['layout']);
        $listing_width = strip_tags($instance['listing_width']);
        $add_location_filter = strip_tags($instance['add_location_filter']);
        $character_count = $instance['character_count'];
        $show_featured_only = isset($instance['show_featured_only']) && $instance['show_featured_only'] ? true : false;
        $show_special_only = isset($instance['show_special_only']) && $instance['show_special_only'] ? true : false;
        $with_pics_only = isset($instance['with_pics_only']) && $instance['with_pics_only'] ? true : false;
        $with_videos_only = isset($instance['with_videos_only']) && $instance['with_videos_only'] ? true : false;
        $use_viewing_post_type = isset($instance['use_viewing_post_type']) && $instance['use_viewing_post_type'] ? true : false;
        $hide_if_empty = !empty($instance['hide_if_empty']) ? true : false;
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Title:', 'geodirectory');?>
                <small>(%posttype_singular_label% ,
                    %posttype_plural_label% <?php _e('can be used', 'geodirectory');?>)
                </small>

                <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>"
                       name="<?php echo $this->get_field_name('title'); ?>" type="text"
                       value="<?php echo esc_attr($title); ?>"/>
            </label>
        </p>
        <p>
            <label
                for="<?php echo $this->get_field_id('post_type'); ?>"><?php _e('Post Type:', 'geodirectory');?>

                <?php $postypes = geodir_get_posttypes();
                /**
                 * Filter the post types to display in widget.
                 *
                 * @since 1.0.0
                 *
                 * @param array $postypes Post types array.
                 */
                $postypes = apply_filters('geodir_post_type_list_in_p_widget', $postypes); ?>

                <select class="widefat" id="<?php echo $this->get_field_id('post_type'); ?>"
                        name="<?php echo $this->get_field_name('post_type'); ?>"
                        onchange="geodir_change_category_list(this)">

                    <?php foreach ($postypes as $postypes_obj) { ?>

                        <option <?php if ($post_type == $postypes_obj) {
                            echo 'selected="selected"';
                        } ?> value="<?php echo $postypes_obj; ?>"><?php $extvalue = explode('_', $postypes_obj);
                            echo geodir_utf8_ucfirst($extvalue[1]); ?></option>

                    <?php } ?>
                </select>
            </label>
        </p>
        <p id="post_type_cats">
            <label
                for="<?php echo $this->get_field_id('category'); ?>"><?php _e('Post Category:', 'geodirectory');?>

                <?php
                $post_type = ($post_type != '') ? $post_type : 'gd_place';
                $all_postypes = geodir_get_posttypes();

                if (!in_array($post_type, $all_postypes))
                    $post_type = 'gd_place';

                $category_taxonomy = geodir_get_taxonomies($post_type);
                $categories = get_terms($category_taxonomy, array('orderby' => 'count', 'order' => 'DESC'));

                ?>

                <select multiple="multiple" class="widefat" name="<?php echo $this->get_field_name('category'); ?>[]"
                        onchange="geodir_popular_widget_cat_title(this)">

                    <option <?php if (!is_array($category) || (is_array($category) && in_array('0', $category))) {
                        echo 'selected="selected"';
                    } ?> value="0"><?php _e('All', 'geodirectory'); ?></option>
                    <?php foreach ($categories as $category_obj) {
                        $selected = '';
                        if (is_array($category) && in_array($category_obj->term_id, $category))
                            echo $selected = 'selected="selected"';

                        ?>

                        <option <?php echo $selected; ?>
                            value="<?php echo $category_obj->term_id; ?>"><?php echo geodir_utf8_ucfirst($category_obj->name); ?></option>

                    <?php } ?>

                </select>


                <input type="hidden" name="<?php echo $this->get_field_name('category_title'); ?>"
                       id="<?php echo $this->get_field_id('category_title'); ?>"
                       value="<?php if ($category_title != '') echo $category_title; else echo __('All', 'geodirectory');?>"/>

            </label>
        </p>
        <p>
            <label
                for="<?php echo $this->get_field_id('list_sort'); ?>"><?php _e('Sort by:', 'geodirectory');?>

                <select class="widefat" id="<?php echo $this->get_field_id('list_sort'); ?>"
                        name="<?php echo $this->get_field_name('list_sort'); ?>">

                    <option <?php if ($list_sort == 'az') {
                        echo 'selected="selected"';
                    } ?> value="az"><?php _e('A-Z', 'geodirectory'); ?></option>

                    <option <?php if ($list_sort == 'latest') {
                        echo 'selected="selected"';
                    } ?> value="latest"><?php _e('Latest', 'geodirectory'); ?></option>

                    <option <?php if ($list_sort == 'featured') {
                        echo 'selected="selected"';
                    } ?> value="featured"><?php _e('Featured', 'geodirectory'); ?></option>

                    <option <?php if ($list_sort == 'high_review') {
                        echo 'selected="selected"';
                    } ?> value="high_review"><?php _e('Review', 'geodirectory'); ?></option>

                    <option <?php if ($list_sort == 'high_rating') {
                        echo 'selected="selected"';
                    } ?> value="high_rating"><?php _e('Rating', 'geodirectory'); ?></option>

                    <option <?php if ($list_sort == 'random') {
                        echo 'selected="selected"';
                    } ?> value="random"><?php _e('Random', 'geodirectory'); ?></option>

                </select>
            </label>
        </p>
        <p>

            <label
                for="<?php echo $this->get_field_id('post_number'); ?>"><?php _e('Number of posts:', 'geodirectory');?>

                <input class="widefat" id="<?php echo $this->get_field_id('post_number'); ?>"
                       name="<?php echo $this->get_field_name('post_number'); ?>" type="text"
                       value="<?php echo esc_attr($post_number); ?>"/>
            </label>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('layout'); ?>">
                <?php _e('Layout:', 'geodirectory');?>
                <select class="widefat" id="<?php echo $this->get_field_id('layout'); ?>"
                        name="<?php echo $this->get_field_name('layout'); ?>">
                    <option <?php if ($layout == 'gridview_onehalf') {
                        echo 'selected="selected"';
                    } ?>
                        value="gridview_onehalf"><?php _e('Grid View (Two Columns)', 'geodirectory'); ?></option>
                    <option <?php if ($layout == 'gridview_onethird') {
                        echo 'selected="selected"';
                    } ?>
                        value="gridview_onethird"><?php _e('Grid View (Three Columns)', 'geodirectory'); ?></option>
                    <option <?php if ($layout == 'gridview_onefourth') {
                        echo 'selected="selected"';
                    } ?>
                        value="gridview_onefourth"><?php _e('Grid View (Four Columns)', 'geodirectory'); ?></option>
                    <option <?php if ($layout == 'gridview_onefifth') {
                        echo 'selected="selected"';
                    } ?>
                        value="gridview_onefifth"><?php _e('Grid View (Five Columns)', 'geodirectory'); ?></option>
                    <option <?php if ($layout == 'list') {
                        echo 'selected="selected"';
                    } ?> value="list"><?php _e('List view', 'geodirectory'); ?></option>

                </select>
            </label>
        </p>
        <p>
            <label
                for="<?php echo $this->get_field_id('listing_width'); ?>"><?php _e('Listing width:', 'geodirectory');?>

                <input class="widefat" id="<?php echo $this->get_field_id('listing_width'); ?>"
                       name="<?php echo $this->get_field_name('listing_width'); ?>" type="text"
                       value="<?php echo esc_attr($listing_width); ?>"/>
            </label>
        </p>
        <p>
            <label
                for="<?php echo $this->get_field_id('character_count'); ?>"><?php _e('Post Content excerpt character count :', 'geodirectory');?>
                <input class="widefat" id="<?php echo $this->get_field_id('character_count'); ?>"
                       name="<?php echo $this->get_field_name('character_count'); ?>" type="text"
                       value="<?php echo esc_attr($character_count); ?>"/>
            </label>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('add_location_filter'); ?>">
                <?php _e('Enable Location Filter:', 'geodirectory');?>
                <input type="checkbox" id="<?php echo $this->get_field_id('add_location_filter'); ?>"
                       name="<?php echo $this->get_field_name('add_location_filter'); ?>" <?php if ($add_location_filter) echo 'checked="checked"';?>
                       value="1"/>
            </label>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('show_featured_only'); ?>">
                <?php _e('Show only featured listings:', 'geodirectory');?> <input type="checkbox"
                                                                                            id="<?php echo $this->get_field_id('show_featured_only'); ?>"
                                                                                            name="<?php echo $this->get_field_name('show_featured_only'); ?>" <?php if ($show_featured_only) echo 'checked="checked"';?>
                                                                                            value="1"/>
            </label>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('show_special_only'); ?>">
                <?php _e('Show only listings with special offers:', 'geodirectory');?> <input type="checkbox"
                                                                                                       id="<?php echo $this->get_field_id('show_special_only'); ?>"
                                                                                                       name="<?php echo $this->get_field_name('show_special_only'); ?>" <?php if ($show_special_only) echo 'checked="checked"';?>
                                                                                                       value="1"/>
            </label>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('with_pics_only'); ?>">
                <?php _e('Show only listings with pics:', 'geodirectory');?> <input type="checkbox"
                                                                                             id="<?php echo $this->get_field_id('with_pics_only'); ?>"
                                                                                             name="<?php echo $this->get_field_name('with_pics_only'); ?>" <?php if ($with_pics_only) echo 'checked="checked"';?>
                                                                                             value="1"/>
            </label>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('with_videos_only'); ?>">
                <?php _e('Show only listings with videos:', 'geodirectory');?> <input type="checkbox"
                                                                                               id="<?php echo $this->get_field_id('with_videos_only'); ?>"
                                                                                               name="<?php echo $this->get_field_name('with_videos_only'); ?>" <?php if ($with_videos_only) echo 'checked="checked"';?>
                                                                                               value="1"/>
            </label>
        </p>
        <p>
            <label
                for="<?php echo $this->get_field_id('use_viewing_post_type'); ?>"><?php _e('Use current viewing post type:', 'geodirectory'); ?>
                <input type="checkbox" id="<?php echo $this->get_field_id('use_viewing_post_type'); ?>"
                       name="<?php echo $this->get_field_name('use_viewing_post_type'); ?>" <?php if ($use_viewing_post_type) {
                    echo 'checked="checked"';
                } ?>  value="1"/>
            </label>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('hide_if_empty'); ?>"><?php _e('Hide if no posts:', 'geodirectory'); ?> <input id="<?php echo $this->get_field_id('hide_if_empty'); ?>" name="<?php echo $this->get_field_name('hide_if_empty'); ?>" type="checkbox" value="1" <?php checked($hide_if_empty, true); ?> />
            </label>
        </p>


        <script type="text/javascript">

            function geodir_popular_widget_cat_title(val) {

                jQuery(val).find("option:selected").each(function (i) {
                    if (i == 0)
                        jQuery(val).closest('form').find('#post_type_cats input').val(jQuery(this).html());

                });

            }

            function geodir_change_category_list(obj, selected) {
                var post_type = obj.value;

                var ajax_url = '<?php echo geodir_get_ajax_url(); ?>'

                var myurl = ajax_url + "&geodir_ajax=admin_ajax&ajax_action=get_cat_dl&post_type=" + post_type + "&selected=" + selected;

                jQuery.ajax({
                    type: "GET",
                    url: myurl,
                    success: function (data) {

                        jQuery(obj).closest('form').find('#post_type_cats select').html(data);

                    }
                });

            }

            <?php if(is_active_widget( false, false, $this->id_base, true )){ ?>
            var post_type = jQuery('#<?php echo $this->get_field_id('post_type'); ?>').val();

            <?php } ?>

        </script>

    <?php
    }
}
