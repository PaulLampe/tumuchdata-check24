import {
    Center,
    List,
    ListItem,
} from "@chakra-ui/react";
import CraftsmanCard from "./CrafstmanCard.tsx";
import {CraftsmanDto} from "../../types/craftsmanTypes.ts";
import {useRef} from "react";


export default function CraftsmenComparisonListView({craftsmen}: { craftsmen: CraftsmanDto[] }) {

    const lastCount = useRef(0);

    function loadMore() {
        if (lastCount.current != craftsmen.length) {
            lastCount.current = craftsmen.length;
            console.log("loadMore");
        }
    }

    return (
        <Center flex={1} width={"100%"} height={"100%"}>
            <List
                overflow={"scroll"}
                width={"100%"}
                height={"100%"}
                maxWidth={"container.lg"}
                onScroll={(e) => {
                    if ((e.currentTarget.scrollTop + e.currentTarget.clientHeight) / e.currentTarget.scrollHeight > 0.8) {
                        loadMore();
                    }
                }}
            >
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