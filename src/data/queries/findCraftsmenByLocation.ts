// Calculates the rank etc. of each craftsman based on a (lat, long) point-
// Can be manipulated by shifting the weights on the dist_score or profile_score
// Returns: CraftsmanDisplayObject
export const findCraftsmenByLocation = `
            SELECT 
                id,
                first_name,
                last_name,
                dist as distance_to_user_km,
                profile_score,
                lat, 
                lon,
                test
             FROM (
                SELECT
                    *,
                    ?::double * PI() / 180 as lat1, 
                    ?::double * PI() / 180 as long1,
                    c.lat::double * PI() / 180 as lat2,
                    c.lon::double * PI() / 180 as long2,
                    SIN(lat1::double) * SIN(lat2::double) as sin_prod,
                    COS(lat1::double) * COS(lat2::double) as cos_prod,
                    COS(long2::double - long1::double) as cos_diff,
                    ACOS(sin_prod + cos_prod * cos_diff) * 6371 as dist,
                    80.00::double as default_distance,
                    1.00::double - (dist::double/default_distance::double) as dist_score,
                    case when dist > default_distance then 0.01::double else 0.15::double end as dist_weight,
                    100 * dist_weight as test,
                    f.profile_picture_score::double * .40::double + f.profile_description_score::double * .60::double as profile_score,
                    dist_weight::double * dist_score * ? + (1.00::double - dist_weight::double) * profile_score * ? as rank
                FROM 
                    mock_craftsmen c, mock_factor f
                WHERE 
                    f.profile_id = c.id
            )
            WHERE dist * 1000 < max_driving_distance
            ORDER BY rank DESC
            LIMIT 20;
        `;