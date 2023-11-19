update_craftsmen_query = '''
        BEGIN TRANSACTION;
        UPDATE service_provider_profile 
        SET max_driving_distance = {1}::int
        WHERE id = {0}::int;
        UPDATE quality_factor_score 
        SET profile_picture_score = {2}::double, profile_description_score = {3}::double 
        WHERE profile_id = {0}::int;
        COMMIT;
'''