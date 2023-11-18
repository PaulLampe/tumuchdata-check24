import {Center} from '@chakra-ui/react';
import {MapContainer, TileLayer} from 'react-leaflet'
import {LatLngTuple} from "leaflet";

/*
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
}*/


export default function CraftsmenMap() {
    const position: LatLngTuple = [48.2647643, 11.5890259];

    //const {query2} = useDuckDBFunctions();

    // const [craftsmen, setCraftsmen] = useState<CraftsmanDto[]>([]);

    /*const throttledQuery = useMemo(() => throttle((coords: LatLng) => {
        const {lat, lng} = coords;
        query2(lat, lng, 0.5, 0.5).then(setCraftsmen);
    }, 250), [query2, setCraftsmen]);*/

    return <Center height={"100%"} width={"100%"}>
        <MapContainer center={position} zoom={8} scrollWheelZoom={false}
                      style={{width: "80vw", height: "70vh"}}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/*<CraftsmenPinDisplay craftsmen={craftsmen} query={throttledQuery}/>*/}
        </MapContainer>
    </Center>;
}