import {
    Center,
    Flex,
    Input,
    List,
    ListItem,
    Slider,
    SliderFilledTrack, SliderThumb,
    SliderTrack,
    Text
} from "@chakra-ui/react";
import CraftsmanCard from "./CrafstmanCard.tsx";
import {useDuckDBFunctions} from "../../data/duckdb/DuckDBHooks.ts";
import {useState} from "react";
import {CraftsmanDto} from "../../types/craftsmanTypes.ts";

const post_codes = ["91541", "84562", "55546", "48612", "21770", "56829", "91239", "67655", "67141", "91217"];

export default function CraftsmenComparison() {
    const {query} = useDuckDBFunctions();

    const [craftsmen, setCraftsmen] = useState<CraftsmanDto[]>([]);

    const queryAndUpdate = (code: string) => {
        query(code).then((men) => {
            setCraftsmen(men);
        });
    }

    return <Center height={"100vh"} maxWidth={"container.lg"} width={"100vw"} alignItems={"flex-start"}
                            paddingY={"5vh"}>
        <Flex gap={6} width={"100%"} height={"100%"} paddingX={16} overflow={"hidden"} flexDirection={"column"}>
            <Center>
                <Text fontSize='4xl' fontWeight={700}>Check24 x TUMuchData - Craftsmen Comparison</Text>
            </Center>

            <Center padding={2}>
                <Input placeholder='Enter your postal code' size={"lg"}/>
            </Center>
            <Center>
                <Slider aria-label='slider-ex-1' defaultValue={4} onChange={(val) => queryAndUpdate(post_codes[val])} min={0}
                        max={9}>
                    <SliderTrack>
                        <SliderFilledTrack/>
                    </SliderTrack>
                    <SliderThumb/>
                </Slider>
            </Center>
            <Flex overflow={"scroll"} flex={1} width={"100%"}>
                <List width={"100%"}>
                    {
                        craftsmen?.map((c) => (
                            <ListItem key={c.id}>
                                <CraftsmanCard craftsman={c}></CraftsmanCard>
                            </ListItem>
                        ))
                    }
                </List>
            </Flex>
        </Flex>
    </Center>
}