import * as duckdb from '@duckdb/duckdb-wasm';

//18.194.1.200
export async function fetchCraftsmenAsync(postcode: string, conn?: duckdb.AsyncDuckDBConnection) {
    return fetch("http://localhost:3000/craftsmen?postalcode=" + postcode).then(res => res.json()).then((rows) => {
        if (rows.length != 0) {
            let qs = "INSERT OR REPLACE INTO service_provider_profile(id, first_name, last_name, lat, lon, profile_score) VALUES";
            rows.forEach((row: any) => {
                qs += `(${row.id}, '${row.first_name}', '${row.last_name}', ${row.lat}, ${row.lon}, ${row.profile_score}),`
            });
            conn?.query(qs.slice(0, -1) + ';');
        }
    });
}