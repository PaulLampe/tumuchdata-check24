import {Center, Flex, Text, Slider, SliderTrack, SliderFilledTrack, SliderThumb} from '@chakra-ui/react';
import {MapContainer, TileLayer} from 'react-leaflet'
import {LatLngTuple, LatLng} from "leaflet";
import {useDuckDBFunctions} from "../../data/duckdb/DuckDBHooks.ts";
import {CraftsmenPinDisplay} from "./CraftsmenPinDisplay.tsx";
import {useState, useMemo} from "react";
import {CraftsmanDto} from "../../types/craftsman.ts";

function throttle(mainFunction : (...args: any[]) => void, delay: number) {
    let timerFlag: any = null; // Variable to keep track of the timer
  
    // Returning a throttled version 
    return (...args : any[]) => {
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

    const {query2} = useDuckDBFunctions();


    const [craftsmen, setCraftsmen] = useState<CraftsmanDto[]>([]);
    const [currentCoords, setCurrentCoords] = useState<LatLng>({lat: position[0], lng: position[1]} as LatLng);
    const [sliderVal, setSliderVal] = useState<number>(50);

    const throttledSliderQuery = useMemo(() => throttle((newVal: number) => {
        setSliderVal(newVal);
        query2(currentCoords.lat, currentCoords!.lng, (newVal / 100), (100 - newVal) / 100).then(setCraftsmen);
    }, 250), [query2, setCraftsmen, currentCoords]);

    const throttledQuery = useMemo(() => throttle((coords: LatLng) => {
        const {lat, lng} = coords;
        setCurrentCoords(coords);
        query2(lat, lng, (sliderVal / 100), (100 - sliderVal) / 100).then(setCraftsmen);
    }, 250), [query2, setCraftsmen, sliderVal]);

    return <Center height={"100vh"} maxWidth={"container.lg"} width={"100vw"} alignItems={"flex-start"}
                   paddingY={"5vh"}>
        <Flex gap={6} width={"100%"} height={"100%"} paddingX={16} overflow={"hidden"} flexDirection={"column"}>
            <Center>
                <Text fontSize='4xl' fontWeight={700}>Check24 x TUMuchData - Craftsmen Comparison</Text>
            </Center>
            <Center>
                <Slider aria-label='slider-ex-1' value={sliderVal} onChange={(val) => throttledSliderQuery(val)} min={0} max={100}>
                    <SliderTrack>
                        <SliderFilledTrack/>
                    </SliderTrack>
                    <SliderThumb/>
                </Slider>
            </Center>
            <Center padding={2} flex={1} width={"100%"} overflow={"hidden"}>
                <MapContainer center={position} zoom={13} scrollWheelZoom={false}
                              style={{width: "80vw", height: "70vh"}}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CraftsmenPinDisplay craftsmen={craftsmen} query={throttledQuery}/>
                </MapContainer>
            </Center>
        </Flex>
    </Center>;
}