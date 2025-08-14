import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { country, indicator } = attributes;

    return (
        <div
            {...useBlockProps.save({
                className: 'fx-indicator fx-indicator-card'
            })}
            data-country={country}
            data-indicator={indicator}
        >
            <div className="fx-indicator-header">
                <h4>Economic Indicator</h4>
                <span className="fx-indicator-country">{country}</span>
            </div>
            <div className="fx-indicator-content">
                <div className="fx-indicator-loading">Loading…</div>
                <div className="fx-indicator-value" style={{ display: 'none' }}>
                    <span className="value"></span>
                </div>
                <div className="fx-indicator-error" style={{ display: 'none' }}>
                    Failed to load data
                </div>
            </div>
            <div className="fx-indicator-meta">
                <small>Indicator: {indicator}</small>
            </div>
        </div>
    );
}