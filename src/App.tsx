import './App.css'
import {DuckDBWrapper} from "./data/duckdb/DuckDBWrapper.tsx";
import {Center} from '@chakra-ui/react';
import {CraftsmenComparisonPage} from "./pages/CraftsmenComparisonPage.tsx";
import {QueryDataProvider} from "./data/query-coordination/QueryDataProvider.tsx";


// AppRoot -> Full Screen SPA wrapper
function App() {

    return (
        <DuckDBWrapper>
            <QueryDataProvider>
                <Center height={"100vh"} width={"100vw"}>
                    <CraftsmenComparisonPage/>
                </Center>
            </QueryDataProvider>
        </DuckDBWrapper>
    )
}

export default App
