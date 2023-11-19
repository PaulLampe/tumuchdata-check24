import {CraftsmanDto} from "../../types/craftsmanTypes.ts";
import {useState} from "react";
import {useDuckDBFunctions} from "../duckdb/DuckDBHooks.ts";
import {useQueryDataContext} from "./QueryDataProvider.tsx";

export const useQueryData = (postCode: string): { loading: boolean, data: CraftsmanDto[] } => {
    const {queryCraftsmenByPostCode} = useDuckDBFunctions();
    const {queryOrSchedule} = useQueryDataContext();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CraftsmanDto[]>([]);
    const [loadedCode, setLoadedCode] = useState("");

    if (!loading && (loadedCode == postCode || postCode.length < 5)) {
        return {loading, data};
    }

    if (postCode.length == 5) {
        const queryAndLoad = () => queryCraftsmenByPostCode(postCode).then((craftsmen) => {
            setLoadedCode(postCode);
            setData(craftsmen);
            setLoading(false);
        });

        queryOrSchedule(postCode, queryAndLoad);
    }


    return {loading, data}
};