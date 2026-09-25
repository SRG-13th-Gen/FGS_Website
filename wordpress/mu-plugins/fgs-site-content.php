<?php
/**
 * Plugin Name: FGS Site Content
 * Description: Registers the structured JSON content field the Next.js admin
 * (SPEC-007) uses to manage public site sections through WordPress pages.
 * Must-use plugin: always active, not toggled from the Plugins screen. See
 * docs/specs/007-site-content-management.md.
 * Version: 1.0.0
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
