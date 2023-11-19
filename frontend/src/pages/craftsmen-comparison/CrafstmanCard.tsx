import {CraftsmanDto} from "../../types/craftsmanTypes.ts";
import {Card, Center, Image, Flex, Text, Circle} from "@chakra-ui/react";
import {StarRating} from "../../ui/StarRating.tsx";

interface CraftsmanCardProps {
    craftsman: CraftsmanDto
}

export default function CraftsmanCard(props: CraftsmanCardProps) {
    const {craftsman} = props;

    const score = Math.round(craftsman.profile_score * 10 / 3);

    return <Card margin={2} padding={4}>
        <Flex>
            <Center padding={2}>
                {
                    craftsman.profile_picture_link ? <Image
                        borderRadius='full'
                        boxSize='70px'
                        src={craftsman.profile_picture_link}
                    /> : <Circle size={70} bg={"#777"}/>
                }

            </Center>
            <Flex padding={2} direction={"column"} justifyContent={"space-between"}>
                <Text fontWeight={700} textAlign={"left"}>{craftsman.first_name + " " + craftsman.last_name}</Text>
                <StarRating score={score}/>
                <Text fontWeight={400} textAlign={"left"}>{craftsman.distance_to_user_km.toFixed(1) + "km away"}</Text>
            </Flex>
        </Flex>
    </Card>
}