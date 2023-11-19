import {Center} from '@chakra-ui/react';
import {MapContainer, TileLayer} from 'react-leaflet'
import {LatLng, LatLngTuple} from "leaflet";
import {useDuckDBFunctions} from "../../data/duckdb/DuckDBHooks.ts";
import {useMemo, useState} from "react";
import {CraftsmenPinDisplay} from "./CraftsmenPinDisplay.tsx";
import {CraftsmanDto} from "../../types/craftsmanTypes.ts";
import {useQueryDataContext} from "../../data/query-coordination/QueryDataProvider.tsx";

function throttle(mainFunction: (...args: any[]) => void, delay: number) {
    let timerFlag: any = null; // Variable to keep track of the timer

    // Returning a throttled version 
    return (...args: any[]) => {
        if (timerFlag === null) { // If there is no timer currently running
            mainFunction(...args); // Execute the main function
            timerFlag = setTimeout(() => { // Set a timer to clear the timerFlag after the specified delay
                timerFlag = null; // Clear the timerFlag to allow the main function to be executed again
            }, delay);
        }
    };
}


export default function CraftsmenMap() {
    const position: LatLngTuple = [48.2647643, 11.5890259];

    const {queryCraftsmenByLocation} = useDuckDBFunctions();
    const {prefetchForPosition} = useQueryDataContext();

    const [craftsmen, setCraftsmen] = useState<CraftsmanDto[]>([]);

    const throttledQuery = useMemo(() => throttle((coords: LatLng) => {
        const {lat, lng} = coords;
        queryCraftsmenByLocation(lat, lng).then((data) => {
            setCraftsmen(data);
        });
        prefetchForPosition(lat, lng);
    }, 250), [prefetchForPosition, queryCraftsmenByLocation, setCraftsmen]);

    return <Center height={"100%"} width={"100%"}>
        <MapContainer center={position} zoom={8} scrollWheelZoom={false}
                      style={{width: "80vw", height: "70vh"}}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CraftsmenPinDisplay craftsmen={craftsmen} query={throttledQuery}/>
        </MapContainer>
    </Center>;
}