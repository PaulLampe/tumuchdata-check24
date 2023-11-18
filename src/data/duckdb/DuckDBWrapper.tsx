import * as duckdb from '@duckdb/duckdb-wasm';
import {LogLevel} from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import {createContext, PropsWithChildren, useCallback, useEffect, useState} from "react";
import {CraftsmanDto} from "../../types/craftsman.ts";
import {postcodes} from "../../mock/postcodes.ts";
import {quality_factors} from "../../mock/quality_factor_score.ts";
import {craftsmen} from "../../mock/service_provider_profile.ts";

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
    query: (i: string) => Promise<CraftsmanDto[]>
    query2: (lat: number, long: number, dist: number, profile: number) => Promise<CraftsmanDto[]>
}

export const DuckDBWrapperContext = createContext<DuckDBWrapperValues | undefined>(undefined);

export function DuckDBWrapper(props: PropsWithChildren) {
    const {children} = props;

    const [db, setDB] = useState<duckdb.AsyncDuckDB>();
    const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection>();
    const [stmnt, setStmnt] = useState<duckdb.AsyncPreparedStatement>();
    const [stmnt2, setStmnt2] = useState<duckdb.AsyncPreparedStatement>();
    const query = async (code: string) => {
        if (conn && stmnt) {
            const q = await stmnt.query(code);
            return JSON.parse(q.toString());
        }
    }

    const query2 = async (lat: number, long: number, dist: number = 0.5, profile: number = 0.5) => {
        if (conn && stmnt2) {
            const q = await stmnt2.query(lat, long, dist, profile);
            return JSON.parse(q.toString());
        }
    }

    async function setup() {
        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
        const worker = new Worker(bundle.mainWorker!);
        const logger = new duckdb.ConsoleLogger(LogLevel.NONE);
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

        const c = await db.connect();

        const encoder = new TextEncoder();
        const buffer = encoder.encode(JSON.stringify(craftsmen));
        await db.registerFileBuffer("mock_craftsmen", buffer);
        await c.insertJSONFromPath("mock_craftsmen", {schema: "main", name: "mock_craftsmen"});

        const factorBuffer = encoder.encode(JSON.stringify(quality_factors));
        await db.registerFileBuffer("mock_factor", factorBuffer);
        await c.insertJSONFromPath("mock_factor", {schema: "main", name: "mock_factor"});


        const post_code = encoder.encode(JSON.stringify(postcodes));
        await db.registerFileBuffer("post_code", post_code);
        await c.insertJSONFromPath("post_code", {schema: "main", name: "post_codes"});

        const s = await c.prepare(`
            SELECT 
                *,
                ? * PI() / 180 as lat1, 
                ? * PI() / 180 as long1,
                c.lat * PI() / 180 as lat2,
                c.lon * PI() / 180 as long2,
                SIN(lat1) * SIN(lat2) as sin_prod,
                COS(lat1) * COS(lat2) as cos_prod,
                COS(long2 - long1) as cos_diff,
                ACOS(sin_prod + cos_prod * cos_diff) * 6371 as dist,
                80 as default_distance,
                1.00 - (dist/default_distance) as dist_score,
                case when dist > default_distance then 0.01 else 0.15 end as dist_weight,
                profile_picture_score * 0.4 + profile_description_score * 0.6 as profile_score,
                dist_weight * dist_score + (1 - dist_weight) * profile_score as rank,
                case 
                    when postcode_extension_distance_group='group_a' then max_driving_distance
                    when postcode_extension_distance_group='group_b' then max_driving_distance + 2000
                    when postcode_extension_distance_group='group_c' then max_driving_distance + 5000
                end as max_driving_distance
            FROM mock_craftsmen c, post_codes p, mock_factor f
            WHERE 
                p.postcode = ? and 
                dist * 1000 < max_driving_distance and
                f.profile_id = c.id
            ORDER BY rank DESC
            LIMIT 20;
        `);
        setStmnt(s);

        const s2 = await c.prepare(`
            SELECT 
                *,
                ? * PI() / 180 as lat1, 
                ? * PI() / 180 as long1,
                c.lat * PI() / 180 as lat2,
                c.lon * PI() / 180 as long2,
                SIN(lat1) * SIN(lat2) as sin_prod,
                COS(lat1) * COS(lat2) as cos_prod,
                COS(long2 - long1) as cos_diff,
                ACOS(sin_prod + cos_prod * cos_diff) * 6371 as dist,
                80 as default_distance,
                1.00 - (dist/default_distance) as dist_score,
                case when dist > default_distance then 0.01 else 0.15 end as dist_weight,
                profile_picture_score * 0.4 + profile_description_score * 0.6 as profile_score,
                dist_weight * dist_score * ? + (1 - dist_weight) * profile_score * ? as rank
            FROM mock_craftsmen c, mock_factor f
            WHERE 
                dist * 1000 < max_driving_distance and
                f.profile_id = c.id
            ORDER BY rank DESC
            LIMIT 20;
        `);
        setStmnt2(s2);

        setDB(db);
        setConn(c);
    }

    const cleanup = useCallback(async () => {
        if (stmnt) {
            await stmnt.close();
            console.log("cleaned up statement")
        }
        if (stmnt2) {
            await stmnt2.close();
            console.log("cleaned up statement")
        }
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
            cleanup();
        }
    }, [cleanup, db, conn]);

    return <DuckDBWrapperContext.Provider value={{query, query2}}>{children}</DuckDBWrapperContext.Provider>
}