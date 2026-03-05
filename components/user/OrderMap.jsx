import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// This component moves the map center when the driver moves
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15); // Smooth "fly" animation to new spot
  }, [center, map]);
  return null;
}

// Custom marker icon component that creates icons after mount
function CustomMarker({ position }) {
  const [Leaflet, setLeaflet] = useState(null);
  const [markerIcon, setMarkerIcon] = useState(null);

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    import("leaflet").then((L) => {
      // Fix for default marker icons not showing in React-Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setLeaflet(L);
      setMarkerIcon(new L.Icon.Default());
    });
  }, []);

  if (!markerIcon || !position || position[0] === 0) return null;

  return <Marker position={position} icon={markerIcon} />;
}

const OrderMap = ({ location }) => {
  const [isMounted, setIsMounted] = useState(false);
  const position = location ? [location.lat, location.lng] : [0, 0];

  // Only render on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-3xl">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  if (!location)
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-3xl">
        <p className="text-gray-500">Waiting for driver's GPS...</p>
      </div>
    );

  return (
    <div className="h-64 w-full rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CustomMarker position={position} />
        <MapUpdater center={position} />
      </MapContainer>
    </div>
  );
};

export default OrderMap;