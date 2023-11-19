import {Flex, Input, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs, Text} from "@chakra-ui/react";
import CraftsmenComparisonListView from "./craftsmen-comparison/CraftsmenComparisonListView.tsx";
import CraftsmenMap from "./craftsmen-map/CraftsmenMap.tsx";
import {useQueryDataContext} from "../data/query-coordination/QueryDataProvider.tsx";
import {useState} from "react";
import {useQueryData} from "../data/query-coordination/useQueryData.tsx";

export function CraftsmenComparisonPage() {

    const [postalCode, setPostalCode] = useState("");

    const {prefetchData} = useQueryDataContext();

    const [limit, setLimit] = useState(20);

    const {data, loading} = useQueryData(postalCode, limit);
    const handleChange = (val: string) => {
        setLimit(20);
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
        <SimpleGrid
            width={"100%"}
            backgroundColor={"#063773"}
            padding={8}
            alignItems={"center"}
            gap={{sm: 4, md: 1}}
            columns={{sm: 1, md: 2}}
        >
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
        </SimpleGrid>
        <Tabs isFitted variant='enclosed' width={"100%"} height={"100%"} overflow={"hidden"}>
            <TabList>
                <Tab>List</Tab>
                <Tab>Map</Tab>
            </TabList>
            <TabPanels height={"calc(100% - 42px)"} width={"100%"}>
                <TabPanel height={"100%"} width={"100%"}>
                    {
                        !loading && <CraftsmenComparisonListView craftsmen={data} setLimit={setLimit}/>
                    }
                </TabPanel>
                <TabPanel height={"100%"}>
                    <CraftsmenMap/>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </Flex>
}