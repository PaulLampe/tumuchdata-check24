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
                    p.lat * PI() / 180 as lat1,
                    p.lon * PI() / 180 as long1,
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
                FROM 
                    mock_craftsmen c, post_codes p, mock_factor f
                WHERE 
                    p.postcode = ? and 
                    f.profile_id = c.id
            )
            WHERE dist * 1000 < max_driving_distance
            ORDER BY rank DESC
            LIMIT 20;
        `;