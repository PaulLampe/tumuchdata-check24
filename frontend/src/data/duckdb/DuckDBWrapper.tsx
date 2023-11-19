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
import {findCraftsmenByLocation} from "../queries/findCraftsmenByLocation.ts";
import {quality_factor_scores} from "../../mock/quality_factor_score.ts";

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
    queryCraftsmenByPostCode: (postCode: string, limit:number) => Promise<CraftsmanDto[]>;
    queryCraftsmenByLocation: (lat: number, long: number) => Promise<CraftsmanDto[]>;
    conn?: duckdb.AsyncDuckDBConnection;
    db?: duckdb.AsyncDuckDB
}

export const DuckDBWrapperContext = createContext<DuckDBWrapperValues | undefined>(undefined);

export function DuckDBWrapper(props: PropsWithChildren) {
    const {children} = props;

    const [db, setDB] = useState<duckdb.AsyncDuckDB>();
    const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection>();
    const [conn2, setConn2] = useState<duckdb.AsyncDuckDBConnection>();
    const [getByPostalCodeStatement, setGetByPostalCodeStatement] = useState<duckdb.AsyncPreparedStatement>();
    const [getByLocationStatement, setGetByLocationStatement] = useState<duckdb.AsyncPreparedStatement>();

    const queryCraftsmenByPostCode = async (code: string, limit:number) => {
        if (conn && getByPostalCodeStatement) {
            const q = await getByPostalCodeStatement.query(code, limit);
            return q.toArray().map((row: { toJSON: () => CraftsmanDto}) => row.toJSON());
        }
    }

    const queryCraftsmenByLocation = async (lat: number, long: number) => {
        if (conn && getByLocationStatement) {
            const q = await getByLocationStatement.query(lat, long);
            return q.toArray().map((row: { toJSON: () => CraftsmanDto}) => row.toJSON());
        }
    }

    async function setup() {
        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
        const worker = new Worker(bundle.mainWorker!);
        const logger = new duckdb.ConsoleLogger(LogLevel.ERROR);
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

        const c = await db.connect();
        await c.query(schema);

        const encoder = new TextEncoder();
        const post_code = encoder.encode(JSON.stringify(postcodes));
        await db.registerFileBuffer("postcode", post_code);
        await c.insertJSONFromPath("postcode", {name: "postcodes"});

        const scores = encoder.encode(JSON.stringify(quality_factor_scores));
        await db.registerFileBuffer("quality_factor_scores", scores);
        await c.insertJSONFromPath("quality_factor_scores", {name: "quality_factor_scores"});

        const c2 = await db.connect();

        const locationStatement = await c2.prepare(findCraftsmenByLocation);
        setGetByLocationStatement(locationStatement);

        const postalCodeStatement = await c.prepare(findCraftsmenByPostCode);
        setGetByPostalCodeStatement(postalCodeStatement);

        setDB(db);
        setConn(c);
        setConn2(c2);
    }

    const teardown = useCallback(async () => {
        if (getByPostalCodeStatement) {
            await getByPostalCodeStatement.close();
            setGetByPostalCodeStatement(undefined);
            console.log("cleaned up postal code statement")
        }
        if (conn) {
            await conn.close();
            setConn(undefined);
            console.log("cleaned up conn")
        }
        if (conn2) {
            await conn2.close();
            setConn2(undefined);
            console.log("cleaned up conn2")
        }
        if (db) {
            await db.terminate();
            setDB(undefined);
            console.log("cleaned up db")
        }
    }, [conn, db, getByPostalCodeStatement, getByLocationStatement, conn2])

    useEffect(() => {
        setup().then(() => console.log("setup"));
    }, []);

    useEffect(() => {
        return () => {
            teardown();
        }
    }, [teardown, conn, db, conn2]);

    return <DuckDBWrapperContext.Provider value={{queryCraftsmenByPostCode, queryCraftsmenByLocation, conn, db}}>{children}</DuckDBWrapperContext.Provider>
}