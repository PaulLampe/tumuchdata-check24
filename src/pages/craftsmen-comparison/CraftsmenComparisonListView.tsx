import {
    Center,
    List,
    ListItem,
} from "@chakra-ui/react";
import CraftsmanCard from "./CrafstmanCard.tsx";
import {CraftsmanDto} from "../../types/craftsmanTypes.ts";


export default function CraftsmenComparisonListView({craftsmen}: { craftsmen: CraftsmanDto[] }) {
    return (
        <Center flex={1} width={"100%"} height={"100%"}>
            <List overflow={"scroll"} width={"100%"} height={"100%"} maxWidth={"container.lg"}>
                {
                    craftsmen?.map((c) => (
                        <ListItem key={c.id}>
                            <CraftsmanCard craftsman={c}/>
                        </ListItem>
                    ))
                }
            </List>
        </Center>
    );
}