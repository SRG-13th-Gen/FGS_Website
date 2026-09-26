<?php
/**
 * Plugin Name: FGS Site Content
 * Description: Registers the structured JSON content field the Next.js admin
 * (SPEC-007) uses to manage public site sections through WordPress pages.
 * Must-use plugin: always active, not toggled from the Plugins screen. See
 * docs/specs/007-site-content-management.md.
 * Version: 1.1.0
 *
 * References consulted 2026-09-20:
 * https://developer.wordpress.org/reference/functions/register_post_meta/
 * https://developer.wordpress.org/plugins/plugin-basics/must-use-plugins/
 */

if (!defined('ABSPATH')) {
    exit;
}

const FGS_SECTION_META_KEY = 'fgs_section_data';

add_action('init', function () {
    register_post_meta('page', FGS_SECTION_META_KEY, [
        'type' => 'string',
        'single' => true,
        'default' => '',
        'show_in_rest' => true,
        // The value is an opaque JSON string validated by the Next.js zod
        // schema (the single source of truth) — never run it through
        // sanitize_text_field, which would strip/mangle JSON content.
        'sanitize_callback' => function ($value) {
            return is_string($value) ? $value : '';
        },
        // Anyone can read this meta on a published page (default REST
        // behavior for a non-"_"-prefixed key); only users who can edit
        // pages may write it via the REST API.
        'auth_callback' => function () {
            return current_user_can('edit_pages');
        },
    ]);
});

/**
 * Scopes the `/wp/v2/posts?search=` REST parameter to the post title only.
 * By default WP_Query's `s` param (which the REST API's `search` param maps
 * to) matches title, content, and excerpt together; the SPEC-003 admin
 * article list needs title-only search. `search_columns` is a core WP_Query
 * arg (stable since WP 6.2) applied through the standard `rest_post_query`
 * filter — no new REST route or behavior for any other consumer.
 *
 * Reference consulted 2026-09-21:
 * https://developer.wordpress.org/reference/classes/wp_query/#search-parameters
 * https://developer.wordpress.org/reference/hooks/rest_this-post_type_query/
 */
add_filter('rest_post_query', function ($args, $request) {
    if ($request->get_param('search')) {
        $args['search_columns'] = ['post_title'];
    }
    return $args;
}, 10, 2);

/**
 * Notify the Next.js cache after native WordPress edits. Both values must be
 * defined in a private server-side PHP config on the CMS copy. A failed delivery leaves the
 * 60-second read-cache fallback in place; it must never fail the CMS save.
 *
 * Hooks checked against WordPress core documentation 2026-09-26:
 * https://developer.wordpress.org/reference/hooks/wp_after_insert_post/
 * https://developer.wordpress.org/reference/hooks/before_delete_post/
 * https://developer.wordpress.org/reference/hooks/edited_terms/
 */
function fgs_send_revalidation_event($event) {
    if (!defined('FGS_REVALIDATION_URL') || !defined('FGS_REVALIDATION_SECRET')) {
        return;
    }
    $url = FGS_REVALIDATION_URL;
    $secret = FGS_REVALIDATION_SECRET;
    if (!is_string($url) || !str_starts_with($url, 'https://') || !is_string($secret) || $secret === '') {
        return;
    }
    wp_remote_post($url, [
        'timeout' => 4,
        'redirection' => 0,
        'headers' => [
            'Content-Type' => 'application/json',
            'X-FGS-Revalidation-Secret' => $secret,
        ],
        'body' => wp_json_encode($event),
    ]);
}

function fgs_section_slug($post) {
    $slugs = ['site-hero', 'site-school-info', 'site-about', 'site-admission', 'site-contact', 'site-clubs', 'site-gallery'];
    return $post && in_array($post->post_name, $slugs, true) ? $post->post_name : null;
}

add_action('wp_after_insert_post', function ($post_id, $post, $update, $post_before) {
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }
    if ($post->post_type === 'post') {
        $event = ['kind' => 'post', 'id' => $post_id];
        if ($post_before && $post_before->post_name) $event['oldSlug'] = $post_before->post_name;
        if ($post->post_name) $event['newSlug'] = $post->post_name;
        fgs_send_revalidation_event($event);
    } elseif ($post->post_type === 'page') {
        $old = fgs_section_slug($post_before);
        $new = fgs_section_slug($post);
        if (!$old && !$new) return;
        $event = ['kind' => 'page', 'id' => $post_id];
        if ($old) $event['oldSlug'] = $old;
        if ($new) $event['newSlug'] = $new;
        fgs_send_revalidation_event($event);
    } elseif ($post->post_type === 'attachment') {
        fgs_send_revalidation_event(['kind' => 'media', 'id' => $post_id]);
    }
}, 10, 4);

add_action('before_delete_post', function ($post_id, $post) {
    if ($post->post_type === 'post') {
        fgs_send_revalidation_event(['kind' => 'post', 'id' => $post_id, 'oldSlug' => $post->post_name]);
    } elseif ($post->post_type === 'page') {
        $slug = fgs_section_slug($post);
        if ($slug) fgs_send_revalidation_event(['kind' => 'page', 'id' => $post_id, 'oldSlug' => $slug]);
    }
}, 10, 2);

add_action('delete_attachment', function ($post_id) {
    fgs_send_revalidation_event(['kind' => 'media', 'id' => $post_id]);
});

// Attachment alt text and file metadata may be changed outside a post update.
function fgs_revalidate_attachment_meta($meta_id, $object_id, $meta_key) {
    if (in_array($meta_key, ['_wp_attachment_image_alt', '_wp_attachment_metadata'], true)
        && get_post_type($object_id) === 'attachment') {
        fgs_send_revalidation_event(['kind' => 'media', 'id' => $object_id]);
    }
}
add_action('added_post_meta', 'fgs_revalidate_attachment_meta', 10, 3);
add_action('updated_post_meta', 'fgs_revalidate_attachment_meta', 10, 3);
add_action('deleted_post_meta', 'fgs_revalidate_attachment_meta', 10, 3);

add_action('created_category', function ($term_id) {
    fgs_send_revalidation_event(['kind' => 'category', 'id' => $term_id]);
});
add_action('edited_category', function ($term_id) {
    fgs_send_revalidation_event(['kind' => 'category', 'id' => $term_id]);
});
add_action('delete_category', function ($term_id) {
    fgs_send_revalidation_event(['kind' => 'category', 'id' => $term_id]);
});
