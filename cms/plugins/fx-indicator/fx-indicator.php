<?php
/**
 * Plugin Name: FX Indicator Block
 * Description: Custom Gutenberg block for displaying FX indicators from external APIs
 * Version: 1.0.0
 * Author: Your Name
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class FXIndicatorPlugin
{
    public function __construct()
    {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_editor_assets'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
    }

    public function init()
    {
        // Register the block
        register_block_type('fx-indicator/indicator-card', array(
            'editor_script' => 'fx-indicator-editor',
            'editor_style' => 'fx-indicator-editor-style',
            'style' => 'fx-indicator-style',
            'attributes' => array(
                'country' => array(
                    'type' => 'string',
                    'default' => 'USA'
                ),
                'indicator' => array(
                    'type' => 'string',
                    'default' => 'NY.GDP.MKTP.CD'
                )
            )
        ));
    }

    public function enqueue_block_editor_assets()
    {
        wp_enqueue_script(
            'fx-indicator-editor',
            plugin_dir_url(__FILE__) . 'build/index.js',
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
            filemtime(plugin_dir_path(__FILE__) . 'build/index.js')
        );

        wp_enqueue_style(
            'fx-indicator-editor-style',
            plugin_dir_url(__FILE__) . 'build/index.css',
            array('wp-edit-blocks'),
            filemtime(plugin_dir_path(__FILE__) . 'build/index.css')
        );
    }

    public function enqueue_frontend_assets()
    {
        wp_enqueue_style(
            'fx-indicator-style',
            plugin_dir_url(__FILE__) . 'assets/style.css',
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'assets/style.css')
        );

        wp_enqueue_script(
            'fx-indicator-frontend',
            plugin_dir_url(__FILE__) . 'assets/frontend.js',
            array('jquery'),
            filemtime(plugin_dir_path(__FILE__) . 'assets/frontend.js'),
            true
        );

        // Localize script with REST API URL
        wp_localize_script('fx-indicator-frontend', 'fxIndicator', array(
            'restUrl' => rest_url('fx/v1/'),
            'nonce' => wp_create_nonce('wp_rest')
        ));
    }


    public function register_rest_routes()
    {
        register_rest_route('fx/v1', '/indicators', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_indicator_data'),
            'permission_callback' => '__return_true',
            'args' => array(
                'country' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'code' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));
    }

    public function get_indicator_data($request)
    {
        $country = $request->get_param('country');
        $code = $request->get_param('code');

        // Mock data for demonstration - replace with actual API call
        $mock_data = array(
            array(
                'countryiso3code' => $country,
                'date' => '2023',
                'value' => $this->generate_mock_value($code),
                'unit' => $this->get_indicator_unit($code),
                'decimal' => 2
            )
        );

        // In production, you would make an actual API call here:
        // $response = wp_remote_get("https://api.worldbank.org/v2/country/{$country}/indicator/{$code}?format=json&date=2020:2023&per_page=1");

        return rest_ensure_response($mock_data);
    }

    private function generate_mock_value($code)
    {
        // Generate realistic mock values based on indicator type
        switch ($code) {
            case 'NY.GDP.MKTP.CD':
                return rand(500000000000, 25000000000000); // GDP in USD
            case 'SP.POP.TOTL':
                return rand(1000000, 1400000000); // Population
            case 'FP.CPI.TOTL.ZG':
                return rand(-2, 8) + (rand(0, 99) / 100); // Inflation rate
            default:
                return rand(1000, 999999) + (rand(0, 99) / 100);
        }
    }

    private function get_indicator_unit($code)
    {
        switch ($code) {
            case 'NY.GDP.MKTP.CD':
                return 'USD';
            case 'SP.POP.TOTL':
                return 'people';
            case 'FP.CPI.TOTL.ZG':
                return '%';
            default:
                return 'units';
        }
    }
}

// Initialize the plugin
new FXIndicatorPlugin();
