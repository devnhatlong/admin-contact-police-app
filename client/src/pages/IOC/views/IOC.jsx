import React, { useState, useRef } from "react";
import geoData from "../../../map.json";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/IOC.css";
import Dashboard from "../components/Dashboard";
import CommuneLabels from "../components/CommuneLabels";
import { FaSearch } from "react-icons/fa";

export const IOC = () => {
    const [hoveredCommune, setHoveredCommune] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [selectedCommune, setSelectedCommune] = useState(null);
    const [targetCommune, setTargetCommune] = useState(null);
    const [alertCommunes, setAlertCommunes] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [currentZoom, setCurrentZoom] = useState(8);
    const geoJsonRef = useRef();
    const mapRef = useRef();

    // Component để zoom vào xã - chỉ zoom 1 lần rồi tự động clear
    const ZoomToCommune = ({ commune, onComplete }) => {
        const map = useMap();
        
        React.useEffect(() => {
            if (commune && commune.geometry) {
                // Lấy bounds của commune
                const layer = window.L.geoJSON(commune);
                map.fitBounds(layer.getBounds(), { 
                    padding: [50, 50],
                    maxZoom: 12
                });
                
                // Sau khi zoom xong, gọi callback để clear targetCommune
                const timer = setTimeout(() => {
                    if (onComplete) {
                        onComplete();
                    }
                }, 100);
                
                return () => clearTimeout(timer);
            }
        }, [commune, map, onComplete]);

        return null;
    };

    // Component để theo dõi zoom level
    const ZoomTracker = () => {
        const map = useMap();
        
        React.useEffect(() => {
            const handleZoom = () => {
                setCurrentZoom(map.getZoom());
            };
            
            map.on('zoomend', handleZoom);
            
            return () => {
                map.off('zoomend', handleZoom);
            };
        }, [map]);

        return null;
    };

    // Xử lý tìm kiếm xã
    const handleSearch = (query) => {
        setSearchQuery(query);
        
        if (query.trim() === "") {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        // Tìm kiếm trong geoData
        const results = geoData.features.filter(feature => {
            const communeName = feature.properties?.ten_xa || "";
            const communeCode = feature.properties?.ma_xa || "";
            return communeName.toLowerCase().includes(query.toLowerCase()) ||
                   communeCode.toLowerCase().includes(query.toLowerCase());
        });

        setSearchResults(results.slice(0, 10)); // Giới hạn 10 kết quả
        setShowSearchResults(true);
    };

    // Chọn xã từ kết quả tìm kiếm
    const handleSelectCommune = (feature) => {
        setSelectedCommune(feature);
        setTargetCommune(feature);
        setSearchQuery(feature.properties?.ten_xa || "");
        setShowSearchResults(false);
        
        // Reset style của tất cả layers
        if (geoJsonRef.current) {
            geoJsonRef.current.resetStyle();
        }
    };

    // Xử lý di chuột
    const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Style cho từng layer
    const getLayerStyle = (feature) => {
        const isSelected = selectedCommune?.properties?.ten_xa === feature.properties?.ten_xa;
        const isAlert = alertCommunes.some(commune => commune.name === feature.properties?.ten_xa);

        return {
            fillColor: isAlert ? "#ff4444" : isSelected ? "#00d4ff" : "#0a325e",
            weight: isSelected ? 3 : 1,
            opacity: 1,
            color: "#fff",
            fillOpacity: isSelected ? 0.8 : 0.3
        };
    };

    // Xử lý sự kiện cho từng feature
    const onEachFeature = (feature, layer) => {
        layer.on({
            mouseover: (e) => {
                const communeName = feature.properties?.ten_xa || "Unknown";
                setHoveredCommune(communeName);

                // Highlight khi hover
                e.target.setStyle({
                    fillOpacity: 0.8,
                    fillColor: "#00d4ff",
                    color: "#fff",
                    weight: 3
                });
            },
            mouseout: (e) => {
                setHoveredCommune(null);
                // Reset style về mặc định
                geoJsonRef.current?.resetStyle(e.target);
            },
            click: (e) => {
                const communeName = feature.properties?.ten_xa || "Unknown";
                setSelectedCommune(feature);
                console.log("Clicked commune:", communeName);
            }
        });
    };

    // Xử lý zoom complete (nếu sử dụng MapController)
    const handleZoomComplete = () => {
        setHoveredCommune(null);
    };

    return (
        <div
            className="tech-bg"
            style={{ display: "flex", height: "100vh", overflow: "hidden" }}
            onMouseMove={handleMouseMove}
        >
            {/* Tooltip hiển thị tên xã tại vị trí chuột */}
            {hoveredCommune && !hoveredCommune.includes("Đang zoom") && !hoveredCommune.includes("Báo động") && !hoveredCommune.includes("Tắt báo") && (
                <div style={{
                    position: "fixed",
                    top: mousePosition.y - 40,
                    left: mousePosition.x + 15,
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    color: "#00ffffcc",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    zIndex: 1001,
                    fontSize: "14px",
                    fontWeight: "bold",
                    border: "1px solid #00d4ff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    pointerEvents: "none",
                    whiteSpace: "nowrap"
                }}>
                    {hoveredCommune}
                </div>
            )}

            {/* Thông báo hệ thống ở góc trái */}
            {hoveredCommune && (hoveredCommune.includes("Đang zoom") || hoveredCommune.includes("Báo động") || hoveredCommune.includes("Tắt báo")) && (
                <div style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    backgroundColor: hoveredCommune.includes("Báo động") ? "rgba(255, 0, 0, 0.9)" :
                        hoveredCommune.includes("Tắt báo") ? "rgba(255, 165, 0, 0.9)" :
                            "rgba(0,0,0,0.8)",
                    color: "#ffffff",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    zIndex: 1000,
                    fontSize: "16px",
                    fontWeight: "bold",
                    border: "2px solid " + (hoveredCommune.includes("Báo động") ? "#ff4444" :
                        hoveredCommune.includes("Tắt báo") ? "#ffaa00" : "#0a325e"),
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    animation: hoveredCommune.includes("Báo động") || hoveredCommune.includes("Tắt báo") ?
                        "alertPulse 0.5s ease-in-out" : "none"
                }}>
                    {hoveredCommune}
                </div>
            )}

            {/* Khu vực bản đồ - bên trái */}
            <div style={{
                width: "40%",
                height: "100%",
                position: "relative",
                borderRight: "2px solid #00d4ff33"
            }}>
                {/* Thanh tìm kiếm xã */}
                <div className="search-container">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm xã/phường..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                        />
                        {searchQuery && (
                            <button 
                                className="clear-search"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSearchResults([]);
                                    setShowSearchResults(false);
                                    setSelectedCommune(null);
                                    setTargetCommune(null);
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                    
                    {/* Kết quả tìm kiếm */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map((feature, index) => (
                                <div
                                    key={index}
                                    className="search-result-item"
                                    onClick={() => handleSelectCommune(feature)}
                                >
                                    <span className="commune-name">
                                        {feature.properties?.ten_xa}
                                    </span>
                                    <span className="commune-code">
                                        {feature.properties?.ma_xa}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <MapContainer
                    center={[11.9, 108]}
                    zoom={8}
                    minZoom={8}
                    maxZoom={15}
                    // maxBounds giới hạn vùng bản đồ: [[minLat, minLng], [maxLat, maxLng]]
                    // [9.8, 105.8] = góc Tây Nam (vĩ độ min, kinh độ min)
                    // [14.2, 110.2] = góc Đông Bắc (vĩ độ max, kinh độ max)
                    maxBounds={[[9.8, 105.8], [14.2, 110.2]]}
                    maxBoundsViscosity={0.5}
                    style={{ height: "100%", width: "100%", position: "relative", zIndex: 5 }}
                    attributionControl={false}
                    zoomControl={true}
                    ref={mapRef}
                    dragging={true}
                    scrollWheelZoom={true}
                >
                    {targetCommune && <ZoomToCommune commune={targetCommune} onComplete={() => setTargetCommune(null)} />}
                    <ZoomTracker />
                    <CommuneLabels currentZoom={currentZoom} geoData={geoData} />
                    
                    <GeoJSON
                        ref={geoJsonRef}
                        data={geoData}
                        style={getLayerStyle}
                        onEachFeature={onEachFeature}
                    />
                </MapContainer>
            </div>

            {/* Khu vực dashboard - bên phải */}
            <div style={{
                width: "60%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "rgba(0, 20, 40, 0.95)",
                borderLeft: "1px solid #00d4ff33"
            }}>
                <Dashboard 
                    selectedCommune={selectedCommune}
                    alertCommunes={alertCommunes}
                />
            </div>
        </div>
    );
}; 