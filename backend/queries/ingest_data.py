ingest_data_query ='''
INSERT INTO postcode SELECT * FROM read_parquet('data/postcode.parquet');
INSERT INTO quality_factor_score SELECT * FROM read_parquet('data/quality_factor_score.parquet');
INSERT INTO service_provider_profile SELECT * FROM read_parquet('data/service_provider_profile.parquet');
'''