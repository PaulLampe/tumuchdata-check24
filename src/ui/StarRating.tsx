import {Flex, Text} from "@chakra-ui/react";
import {FaStar} from 'react-icons/fa6';
import {FaStarHalfStroke} from 'react-icons/fa6';


export function StarRating({score}: { score: number }) {
    const startVals = [];

    while (score > 0) {
        startVals.push(Math.min(score, 2));
        score -= 2;
    }

    while (startVals.length < 5) {
        startVals.push(0);
    }

    const numberOfRatings = Math.round(Math.random() * 150);

    return <Flex alignItems={"center"}>
        {startVals.map((val, i) => {
            switch (val) {
                case 2:
                    return <FaStar color={"#FFC300"} key={val.toString() + "_" + i.toString()}/>;
                case 1:
                    return <FaStarHalfStroke color={"#FFC300"} key={val.toString() + "_" + i.toString()}/>
            }
        })}
        <Text color={"#FFC300"}>{`(${numberOfRatings})`}</Text>
    </Flex>;
}