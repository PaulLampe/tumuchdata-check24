import {CraftsmanDto} from "../../types/craftsman.ts";
import {Card, Grid, Text} from "@chakra-ui/react";

interface CraftsmanCardProps {
    craftsman: CraftsmanDto
}

export default function CraftsmanCard(props: CraftsmanCardProps) {
    const {craftsman} = props;

    return <Card margin={2} padding={4}>
        <Grid>
            <Text fontWeight={500} textAlign={"left"}>{craftsman.first_name + " " + craftsman.last_name}</Text>
        </Grid>
    </Card>
}