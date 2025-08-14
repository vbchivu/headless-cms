import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';

export default function Edit({ attributes, setAttributes }) {
    const { country, indicator } = attributes;
    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Common country options for easier selection
    const countryOptions = [
        { label: __('Select Country...', 'fx'), value: '' },
        { label: __('United States (USA)', 'fx'), value: 'USA' },
        { label: __('Spain (ESP)', 'fx'), value: 'ESP' },
        { label: __('Germany (DEU)', 'fx'), value: 'DEU' },
        { label: __('United Kingdom (GBR)', 'fx'), value: 'GBR' },
        { label: __('France (FRA)', 'fx'), value: 'FRA' },
        { label: __('Japan (JPN)', 'fx'), value: 'JPN' },
        { label: __('China (CHN)', 'fx'), value: 'CHN' },
        { label: __('Custom...', 'fx'), value: 'custom' }
    ];

    // Common indicator options
    const indicatorOptions = [
        { label: __('Select Indicator...', 'fx'), value: '' },
        { label: __('GDP (current US$)', 'fx'), value: 'NY.GDP.MKTP.CD' },
        { label: __('Population, total', 'fx'), value: 'SP.POP.TOTL' },
        { label: __('Inflation, consumer prices', 'fx'), value: 'FP.CPI.TOTL.ZG' },
        { label: __('GDP per capita', 'fx'), value: 'NY.GDP.PCAP.CD' },
        { label: __('Unemployment rate', 'fx'), value: 'SL.UEM.TOTL.ZS' },
        { label: __('Custom...', 'fx'), value: 'custom' }
    ];

    // Load preview data when attributes change
    useEffect(() => {
        if (country && indicator && country !== 'custom' && indicator !== 'custom') {
            setLoading(true);
            fetch(`/wp-json/fx/v1/indicators?country=${country}&code=${indicator}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        setPreviewData(data[0]);
                    }
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Preview error:', error);
                    setLoading(false);
                });
        }
    }, [country, indicator]);

    const formatPreviewValue = (value, unit) => {
        if (!value) return __('N/A', 'fx');

        const numValue = parseFloat(value);

        if (unit === 'USD' && numValue > 1000000000) {
            return `$${(numValue / 1000000000).toFixed(2)}B`;
        } else if (unit === 'people' && numValue > 1000000) {
            return `${(numValue / 1000000).toFixed(2)}M people`;
        } else if (unit === '%') {
            return `${numValue.toFixed(2)}%`;
        }

        return `${numValue.toLocaleString()} ${unit}`;
    };

    const showCustomCountry = country === 'custom' || (country && !countryOptions.find(opt => opt.value === country));
    const showCustomIndicator = indicator === 'custom' || (indicator && !indicatorOptions.find(opt => opt.value === indicator));

    return (
        <div {...useBlockProps()}>
            <InspectorControls>
                <PanelBody title={__('Indicator Settings', 'fx')}>
                    <SelectControl
                        label={__('Country', 'fx')}
                        value={showCustomCountry ? 'custom' : country}
                        options={countryOptions}
                        onChange={(value) => {
                            if (value !== 'custom') {
                                setAttributes({ country: value });
                            }
                        }}
                    />

                    {showCustomCountry && (
                        <TextControl
                            label={__('Custom Country (ISO)', 'fx')}
                            value={country === 'custom' ? '' : country}
                            onChange={(v) => setAttributes({ country: v.toUpperCase() })}
                            help={__('Enter 3-letter ISO country code (e.g., USA, ESP, DEU)', 'fx')}
                        />
                    )}

                    <SelectControl
                        label={__('Indicator', 'fx')}
                        value={showCustomIndicator ? 'custom' : indicator}
                        options={indicatorOptions}
                        onChange={(value) => {
                            if (value !== 'custom') {
                                setAttributes({ indicator: value });
                            }
                        }}
                    />

                    {showCustomIndicator && (
                        <TextControl
                            label={__('Custom Indicator Code', 'fx')}
                            value={indicator === 'custom' ? '' : indicator}
                            onChange={(v) => setAttributes({ indicator: v })}
                            help={__('Enter World Bank indicator code (e.g., NY.GDP.MKTP.CD)', 'fx')}
                        />
                    )}
                </PanelBody>
            </InspectorControls>

            <div className="fx-indicator-card fx-indicator-editor">
                <div className="fx-indicator-header">
                    <h4>{__('FX Indicator Preview', 'fx')}</h4>
                    <span className="fx-indicator-country">{country || 'N/A'}</span>
                </div>

                <div className="fx-indicator-content">
                    {loading ? (
                        <div className="fx-indicator-loading">
                            {__('Loading preview...', 'fx')}
                        </div>
                    ) : previewData ? (
                        <div className="fx-indicator-value">
                            <span className="value">
                                {formatPreviewValue(previewData.value, previewData.unit)}
                            </span>
                        </div>
                    ) : (
                        <div className="fx-indicator-placeholder">
                            {country && indicator ?
                                __('Preview will load when published', 'fx') :
                                __('Select country and indicator to see preview', 'fx')
                            }
                        </div>
                    )}
                </div>

                <div className="fx-indicator-meta">
                    <small>
                        {__('Country:', 'fx')} {country || __('Not set', 'fx')} |
                        {__('Indicator:', 'fx')} {indicator || __('Not set', 'fx')}
                    </small>
                </div>
            </div>
        </div>
    );
}