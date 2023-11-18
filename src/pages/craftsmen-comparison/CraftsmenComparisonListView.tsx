import {
    Flex,
    List,
    ListItem,
} from "@chakra-ui/react";
import CraftsmanCard from "./CrafstmanCard.tsx";
import {CraftsmanDto} from "../../types/craftsmanTypes.ts";


export default function CraftsmenComparisonListView({craftsmen}: { craftsmen: CraftsmanDto[] }) {
    return <>
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
    </>
}