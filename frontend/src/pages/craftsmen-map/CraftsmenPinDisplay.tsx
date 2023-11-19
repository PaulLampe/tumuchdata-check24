import {Marker, useMapEvents, Popup} from "react-leaflet";
import {useState} from "react";
import {CraftsmanDto} from "../../types/craftsmanTypes.ts";
import {LeafletEvent, LatLng, icon, LatLngTuple} from "leaflet";
import greenMarker from '../../assets/map-marker-green.svg';
import redMarker from '../../assets/map-marker.svg';


interface CraftsmenPinDisplayProps {
    query: (coords: LatLng) => void;
    craftsmen: CraftsmanDto[]
}

export function CraftsmenPinDisplay(props: CraftsmenPinDisplayProps) {

    const {craftsmen, query} = props;

    const [center, setCenter] = useState<LatLngTuple>([48.2647643, 11.5890259]);

    const craftsmanIcon = icon({
        iconUrl: greenMarker,
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -40]
    });

    const centerIcon = icon({
        iconUrl: redMarker,
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, 0]
    });

    useMapEvents({
        drag: (event: LeafletEvent) => {
            const coords = event.target.getCenter();
            setCenter(coords);
            query(coords);
        }
    });


    return <>
        {
            craftsmen?.map((c) => <Marker position={[c.lat, c.lon]} key={c.id} // TODO: Format
                                          icon={craftsmanIcon}><Popup>{c.first_name + " " + c.last_name + " " + c.profile_score + "/3"}</Popup></Marker>)
        }
        <Marker position={center} icon={centerIcon}/>
    </>;
}