import * as duckdb from '@duckdb/duckdb-wasm';
import {LogLevel} from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import {createContext, PropsWithChildren, useCallback, useEffect, useState} from "react";
import {CraftsmanDto} from "../../types/craftsmanTypes.ts";
import {postcodes} from "../../mock/postcodes.ts";
import {schema} from "../queries/initSchema.ts";
import {findCraftsmenByPostCode} from "../queries/findCraftsmenByPostCode.ts";

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
    mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
    },
    eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: eh_worker,
    },
};

export interface DuckDBWrapperValues {
    query: (i: string) => Promise<CraftsmanDto[]>;
    //query2: (lat: number, long: number, dist: number, profile: number) => Promise<CraftsmanDto[]>;
    conn?: duckdb.AsyncDuckDBConnection;
    db?: duckdb.AsyncDuckDB
}

export const DuckDBWrapperContext = createContext<DuckDBWrapperValues | undefined>(undefined);

export function DuckDBWrapper(props: PropsWithChildren) {
    const {children} = props;

    const [db, setDB] = useState<duckdb.AsyncDuckDB>();
    const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection>();
    const [getByPostalCodeStatement, setGetByPostalCodeStatement] = useState<duckdb.AsyncPreparedStatement>();
    // const [stmnt2, setStmnt2] = useState<duckdb.AsyncPreparedStatement>();
    const query = async (code: string) => {
        if (conn && getByPostalCodeStatement) {
            const q = await getByPostalCodeStatement.query(code);
            return q.toArray().map((row: { toJSON: () => CraftsmanDto}) => row.toJSON());
        }
    }

    /*const query2 = async (lat: number, long: number, dist: number = 0.5, profile: number = 0.5) => {
        if (conn && stmnt2) {
            const q = await stmnt2.query(lat, long, dist, profile);
            return q.toArray().map((row: unknown) => (row as any).toJSON());
        }
    }*/

    async function setup() {
        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
        const worker = new Worker(bundle.mainWorker!);
        const logger = new duckdb.ConsoleLogger(LogLevel.NONE);
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

        const c = await db.connect();
        await c.query(schema);

        const encoder = new TextEncoder();
        const post_code = encoder.encode(JSON.stringify(postcodes));
        await db.registerFileBuffer("postcode", post_code);
        await c.insertJSONFromPath("postcode", {name: "postcodes"});

        const postalCodeStatement = await c.prepare(findCraftsmenByPostCode);
        setGetByPostalCodeStatement(postalCodeStatement);

        //const s2 = await c.prepare(findCraftsmenByLocation);
        //setStmnt2(s2);

        setDB(db);
        setConn(c);
    }

    const teardown = useCallback(async () => {
        if (getByPostalCodeStatement) {
            await getByPostalCodeStatement.close();
            console.log("cleaned up statement")
        }
        /*if (stmnt2) {
            await stmnt2.close();
            console.log("cleaned up statement")
        }*/
        if (conn) {
            await conn.close();
            console.log("cleaned up conn")
        }
        if (db) {
            await db.terminate();
            console.log("cleaned up db")
        }
    }, [conn, db])

    useEffect(() => {
        setup().then(() => console.log("setup"));
    }, []);

    useEffect(() => {
        return () => {
            teardown();
        }
    }, [teardown, db, conn]);

    return <DuckDBWrapperContext.Provider value={{query, /*query2,*/ conn, db}}>{children}</DuckDBWrapperContext.Provider>
}