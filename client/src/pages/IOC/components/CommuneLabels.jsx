import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const CommuneLabels = ({ currentZoom, geoData }) => {
    const map = useMap();

    useEffect(() => {
        if (currentZoom < 9) return;

        const labels = [];

        geoData.features.forEach(feature => {
            const communeName = feature.properties?.ten_xa || "";
            if (!communeName) return;

            try {
                // Tạo GeoJSON layer tạm để lấy bounds
                const tempLayer = L.geoJSON(feature);
                const bounds = tempLayer.getBounds();
                const center = bounds.getCenter();

                // Tạo label marker
                const label = L.marker(center, {
                    icon: L.divIcon({
                        className: 'commune-label',
                        html: `<div class="commune-label-text">${communeName}</div>`,
                        iconSize: null
                    }),
                    interactive: false
                });

                label.addTo(map);
                labels.push(label);
            } catch (error) {
                console.error('Error creating label:', error);
            }
        });

        // Cleanup function
        return () => {
            labels.forEach(label => {
                if (map.hasLayer(label)) {
                    map.removeLayer(label);
                }
            });
        };
    }, [currentZoom, map, geoData]);

    return null;
};

export default CommuneLabels;
