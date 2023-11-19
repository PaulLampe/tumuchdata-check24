export const findCloseByPostalCodes = (lat: number, long: number) =>  `
SELECT postcode
FROM (
    SELECT
        p.postcode,
        ${lat}::double * PI() / 180 as lat1, 
        ${long}::double * PI() / 180 as long1,
        p.lat::double * PI() / 180 as lat2,
        p.lon::double * PI() / 180 as long2,
        SIN(lat1::double) * SIN(lat2::double) as sin_prod,
        COS(lat1::double) * COS(lat2::double) as cos_prod,
        COS(long2::double - long1::double) as cos_diff,
        ACOS(sin_prod + cos_prod * cos_diff) * 6371 as dist,
    FROM postcodes p
    WHERE dist < 10
);
`