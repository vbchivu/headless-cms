import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import save from './save';

registerBlockType('fx-indicator/indicator-card', {
    title: __('FX Indicator Card', 'fx'),
    description: __('Display economic indicators from external APIs', 'fx'),
    category: 'widgets',
    icon: 'chart-line',
    supports: {
        html: false,
    },
    attributes: {
        country: {
            type: 'string',
            default: 'USA'
        },
        indicator: {
            type: 'string',
            default: 'NY.GDP.MKTP.CD'
        }
    },
    edit: Edit,
    save: save,
});