// Calculates the rank etc. of each craftsman based on a postal code
// TODO: Can be manipulated by shifting the weights on the dist_score or profile_score
// Returns: CraftsmanDisplayObject
export const findCraftsmenByPostCode = `
    SELECT
        id,
        first_name,
        last_name,
        dist as distance_to_user_km,
        profile_score,
        lat, 
        lon
    FROM (
        SELECT
            *,
            p.lat::double * PI() / 180 as lat1,
            p.lon::double * PI() / 180 as long1,
            c.lat::double * PI() / 180 as lat2,
            c.lon::double * PI() / 180 as long2,
            SIN(lat1) * SIN(lat2) as sin_prod,
            COS(lat1) * COS(lat2) as cos_prod,
            COS(long2 - long1) as cos_diff,
            ACOS(sin_prod + cos_prod * cos_diff) * 6371 as dist,
            80::double as default_distance,
            1.00 - (dist::double/default_distance::double) as dist_score,
            case when dist::double > default_distance::double then 0.01::double else 0.15::double end as dist_weight,
            dist_weight::double * dist_score::double + (1.00::double - dist_weight::double) * profile_score::double as rank,
        FROM 
            service_provider_profile c, postcodes p
        WHERE 
            p.postcode = ? and dist * 1000 < max_driving_distance
    )
    ORDER BY rank DESC
    LIMIT ?;
`;