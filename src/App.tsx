import './App.css'
//import CraftsmenComparison from "./pages/craftsmen-comparison/CraftsmenComparison.tsx";
import {DuckDBWrapper} from "./data/duckdb/DuckDBWrapper.tsx";
import { Center } from '@chakra-ui/react';
import CraftsmenMap from "./pages/craftsmen-map/CraftsmenMap.tsx";


// AppRoot -> Full Screen SPA wrapper
function App() {

    return (
        <DuckDBWrapper>
            <Center height={"100vh"} width={"100vw"}>
                <CraftsmenMap/>
            </Center>
        </DuckDBWrapper>
    )
}

export default App
