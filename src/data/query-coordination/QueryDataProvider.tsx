import {createContext, PropsWithChildren, useCallback, useContext, useMemo, useRef} from "react";
import {useDuckDBFunctions} from "../duckdb/DuckDBHooks.ts";
import {fetchCraftsmenAsync} from "./asyncFetcher.tsx";
import {findCloseByPostalCodes} from "../queries/findCloseBypostalCodes.ts";


interface QueryDataContextValues {
    prefetchData: (prefix: string) => void;
    prefetchForPosition: (lat: number, long: number) => void;
    queryOrSchedule: (postCode: string, query: () => void) => void;
}

const QueryDataContext = createContext<QueryDataContextValues | undefined>(undefined)

// Keeps track of cached data and asynchronously fetches new data, as well as triggers renders on data that is first fetched
export function QueryDataProvider({children}: PropsWithChildren) {
    const cacheRef = useRef<Map<string, boolean>>(new Map());
    const callbackRef = useRef<Map<string, (() => void)[]>>(new Map());

    const {conn} = useDuckDBFunctions();

    const getPostCodesForPrefix = useCallback(async (prefix: string): Promise<string[]> => {
        return conn?.query(`select postcode from postcodes where postcode like '${prefix}%';`)
            .then((postcodes) => postcodes.toArray())
            .then((arr) => arr.map((row: { toJSON: () => { postcode: string } }) => row.toJSON().postcode));
    }, [conn]);

    const prefetchCodes =
        (postCodes: string[] | undefined) => {
            postCodes?.forEach(code => {
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
        }

    const prefetchData = useCallback((prefix: string) => {
                getPostCodesForPrefix(prefix).then((postCodes) => {
                    prefetchCodes(postCodes);
                })
            },
            [conn, getPostCodesForPrefix]
        )
    ;

    const prefetchForPosition = (lat: number, long: number) => {
        conn?.query(
            findCloseByPostalCodes(lat, long)
        )
            .then((res) => res.toArray().map(
                (row: { toJSON: () => { postcode: string } }) => row.toJSON().postcode)
            ).then((codes) => {
                prefetchCodes(codes);
            }
        )
    }

    const queryOrSchedule =
        (postCode: string, query: () => void) => {
            if (cacheRef.current.has(postCode)) {
                if (cacheRef.current.get(postCode)) {
                    query();
                } else {
                    callbackRef.current.set(postCode, [...(callbackRef.current.get(postCode) ?? []), query])
                }
            } else {
                fetchCraftsmenAsync(postCode, conn).then(() => {
                    query();
                })
            }
        }

    const value = useMemo(() => ({
        prefetchData,
        prefetchForPosition,
        queryOrSchedule
    }), [prefetchData, prefetchForPosition, queryOrSchedule]);

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
