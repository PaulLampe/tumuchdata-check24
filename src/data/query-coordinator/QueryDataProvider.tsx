import {createContext, PropsWithChildren, useContext, useMemo, useRef, useState} from "react";
import {useDuckDBFunctions} from "../duckdb/DuckDBHooks.ts";
import {CraftsmanDto} from "../../types/craftsmanTypes.ts";
import {fetchCraftsmenAsync} from "./asyncFetcher.tsx";


interface QueryDataContextValues {
    prefetchData: (prefix: string) => void;
    useData: (postCode: string) => { loading: boolean, data: CraftsmanDto[] }
}

const QueryDataContext = createContext<QueryDataContextValues | undefined>(undefined)

// Keeps track of cached data and asynchronously fetches new data, as well as triggers renders on data that is first fetched
export function QueryDataProvider({children}: PropsWithChildren) {
    const cacheRef = useRef<Map<string, boolean>>(new Map());
    const callbackRef = useRef<Map<string, (() => void)[]>>(new Map());

    const {conn, query} = useDuckDBFunctions();

    async function getPostCodesForPrefix(prefix: string): Promise<string[]> {
        return conn?.query(`select postcode from postcodes where postcode like '${prefix}%';`)
            .then((postcodes) => postcodes.toArray())
            .then((arr) => arr.map((row: { toJSON: () => { postcode: string } }) => row.toJSON().postcode));
    }

    function prefetchData(prefix: string) {
        getPostCodesForPrefix(prefix).then((postCodes) => {
            postCodes.forEach(code => {
                    if (cacheRef.current.has(code)) {
                        return;
                    }
                    cacheRef.current.set(code, false);
                    fetchCraftsmenAsync(code, conn).then(() => {
                        cacheRef.current.set(code, true);
                        callbackRef.current.get(code)?.forEach((fn) => {
                            fn();
                        })
                        callbackRef.current.set(code, []);
                    })
                }
            )
        })
    }

    function useData(postCode: string): { loading: boolean, data: CraftsmanDto[] } {
        const [loading, setLoading] = useState(true);
        const [data, setData] = useState<CraftsmanDto[]>([]);
        const [loadedCode, setLoadedCode] = useState("");

        if (postCode.length < 5) {
            return {loading: true, data: []};
        }

        if (!loading && loadedCode == postCode) {
            return {loading, data};
        }

        const queryAndLoad = () => query(postCode).then((craftsmen) => {
            setLoadedCode(postCode);
            setData(craftsmen);
            setLoading(false);
        });

        if (cacheRef.current.has(postCode)) {
            if (cacheRef.current.get(postCode)) {
                console.log("cached");
                queryAndLoad();
            } else {
                console.log("waiting for cache");
                callbackRef.current.set(postCode, [...(callbackRef.current.get(postCode) ?? []), queryAndLoad])
            }
        } else {
            fetchCraftsmenAsync(postCode, conn).then(() => {
                queryAndLoad();
            })
        }

        return {loading, data}
    }

    const value = useMemo(() => ({
        useData,
        prefetchData
    }), [useData, prefetchData]);

    return <QueryDataContext.Provider value={value}>
        {children}
    </QueryDataContext.Provider>
}

export const useQueryDataContext = () => {
    const values = useContext(QueryDataContext);
    if (!values) {
        throw Error("No QueryDataContext found. Most likely this Component is not wrapped in a QueryDataProvider")
    }
    return values;
}
