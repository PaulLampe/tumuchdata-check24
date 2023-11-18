import {useContext} from "react";
import {DuckDBWrapperContext, DuckDBWrapperValues} from "./DuckDBWrapper.tsx";

export const useDuckDBFunctions = (): DuckDBWrapperValues => {
    const values = useContext(DuckDBWrapperContext);
    if (!values) {
        throw Error("DuckDBWrapperContext not found! Component is most likely not wrapped in a DuckDBWrapper!")
    }
    return values;
}