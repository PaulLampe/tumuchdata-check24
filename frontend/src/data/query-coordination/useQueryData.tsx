import {CraftsmanDto} from "../../types/craftsmanTypes.ts";
import {useCallback, useEffect, useState} from "react";
import {useDuckDBFunctions} from "../duckdb/DuckDBHooks.ts";
import {useQueryDataContext} from "./QueryDataProvider.tsx";

export const useQueryData = (postCode: string, limit: number = 20): { loading: boolean, data: CraftsmanDto[] } => {
    const {queryCraftsmenByPostCode} = useDuckDBFunctions();
    const {queryOrSchedule, refetchDataForScroll} = useQueryDataContext();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CraftsmanDto[]>([]);
    const [loadedCode, setLoadedCode] = useState("");

    const queryAndLoad = useCallback(() => queryCraftsmenByPostCode(postCode, limit).then((craftsmen) => {
        setLoadedCode(postCode);
        setData(craftsmen);
        setLoading(false);
    }), [limit, postCode, queryCraftsmenByPostCode]);

    useEffect(() => {
        refetchDataForScroll(postCode, limit);
        queryAndLoad();
    }, [limit, postCode, queryAndLoad]);

    if (!loading && (loadedCode == postCode || postCode.length < 5)) {
        return {loading, data};
    }

    if (postCode.length == 5) {
        queryOrSchedule(postCode, queryAndLoad);
    }

    return {loading, data}
};