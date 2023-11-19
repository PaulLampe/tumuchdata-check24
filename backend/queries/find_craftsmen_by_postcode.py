find_craftsmen_by_postcode_query ='''
        SELECT
            id,
            first_name,
            last_name,
            profile_score,
            lat, 
            lon,
            max_driving_distance
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
                max_driving_distance
            FROM
            service_provider_profile c, postcode p, quality_factor_score f
            WHERE 
                p.postcode = {0} and 
                f.profile_id = c.id
        )
        WHERE dist * 1000 < max_driving_distance
        ORDER BY rank DESC
        OFFSET {2} ROWS
        FETCH NEXT {1} ROWS ONLY;
'''