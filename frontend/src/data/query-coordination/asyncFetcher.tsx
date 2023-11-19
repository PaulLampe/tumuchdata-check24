import * as duckdb from '@duckdb/duckdb-wasm';
import {CraftsmanDto} from "../../types/craftsmanTypes.ts";

export async function fetchCraftsmenAsync(postcode: string, conn?: duckdb.AsyncDuckDBConnection , limit: number = 20, offset: number = 0) {
    const queryString = `postalcode=${postcode}&limit=${limit}&offset=${offset}`;
    return fetch("http://localhost:8000/craftsmen?" + queryString).then(res => res.json()).then((rows) => {
        if (rows.length != 0) {
            // TODO: Check if there is any way to make this somehow at least a bit performant. As of no wthere is no upserting with json streams
            let qs = "INSERT OR REPLACE INTO service_provider_profile(id, first_name, last_name, lat, lon, profile_score, max_driving_distance, profile_picture_link) VALUES";
            rows.forEach((row: CraftsmanDto) => {
                qs += `(${row.id}, '${row.first_name}', '${row.last_name}', ${row.lat}, ${row.lon}, ${row.profile_score}, ${row.max_driving_distance}, '${row.profile_picture_link}'),`
            });
            conn?.query(qs.slice(0, -1) + ';');
        }
    });
}

export async function fetchCraftsmenBatchAsync(postcodes: string[], conn?: duckdb.AsyncDuckDBConnection) {
    const queryString = `postalcodes=${postcodes.join(",")}&limit=40&skip=0`;
    return fetch("http://localhost:8000/craftsmen_range?" + queryString).then(res => res.json()).then((rows) => {
        if (rows.length != 0) {
            const s = new Set<string>();
            // TODO: Check if there is any way to make this somehow at least a bit performant. As of no wthere is no upserting with json streams
            let qs = "INSERT OR REPLACE INTO service_provider_profile(id, first_name, last_name, lat, lon, profile_score, max_driving_distance) VALUES";
            rows.forEach((row: CraftsmanDto) => {
                if(!s.has(row.id)) {
                    s.add(row.id);
                    qs += `(${row.id}, '${row.first_name}', '${row.last_name}', ${row.lat}, ${row.lon}, ${row.profile_score}, ${row.max_driving_distance}),`;
                }
            });
            conn?.query(qs.slice(0, -1) + ';');
        }
    });
}