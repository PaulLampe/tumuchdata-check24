import {Flex, Input, Tab, TabList, TabPanel, TabPanels, Tabs, Text} from "@chakra-ui/react";
import CraftsmenComparisonListView from "./craftsmen-comparison/CraftsmenComparisonListView.tsx";
import CraftsmenMap from "./craftsmen-map/CraftsmenMap.tsx";
import {useQueryDataContext} from "../data/query-coordinator/QueryDataProvider.tsx";
import {useState} from "react";

export function CraftsmenComparisonPage() {

    const [postalCode, setPostalCode] = useState("");

    const {useData, prefetchData} = useQueryDataContext();

    const {data} = useData(postalCode);
    const handleChange = (val: string) => {
        if (val.length == 4) {
            prefetchData(val);
        }
        setPostalCode(val)
    }

    return <Flex
        height={"100vh"}
        width={"100vw"}
        alignItems={"flex-start"}
        flexDirection={"column"}
    >
        <Flex width={"100%"} height={100} backgroundColor={"#063773"} padding={8} alignItems={"center"}>
            <Text color={"#fff"} fontSize={"3xl"} fontWeight={700} width={600} textAlign={"left"}>TUMuchData
                x Check24</Text>
            <Input
                placeholder='Enter your postal code'
                size={"lg"}
                maxLength={5}
                type={"numeric"}
                value={postalCode}
                onChange={(e) => handleChange(e.target.value)}
                backgroundColor={"#fff"}
            />
        </Flex>
        <Tabs isFitted variant='enclosed' width={"100%"} height={"100%"} overflow={"hidden"}>
            <TabList>
                <Tab>List</Tab>
                <Tab>Map</Tab>
            </TabList>
            <TabPanels height={"calc(100% - 42px)"} width={"100%"}>
                <TabPanel height={"100%"} width={"100%"}>
                    <CraftsmenComparisonListView craftsmen={data}/>
                </TabPanel>
                <TabPanel height={"100%"}>
                    <CraftsmenMap/>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </Flex>
}