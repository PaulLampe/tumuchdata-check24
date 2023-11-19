schema_query ='''
CREATE TABLE IF NOT EXISTS postcode
(
    postcode                          varchar(5)                     not null primary key,
    lon                               double                         not null,
    lat                               double                         not null,
    postcode_extension_distance_group varchar(255) default 'group_a' not null,
    created_at                        datetime                    null ,
    updated_at                        datetime                    null
);

CREATE TABLE IF NOT EXISTS quality_factor_score
(
    profile_id                    int          not null primary key,
    profile_picture_score         double       not null,
    profile_description_score     double       not null
);

CREATE TABLE IF NOT EXISTS service_provider_profile (
  id int NOT NULL,
  first_name varchar(255) DEFAULT NULL,
  last_name varchar(255) DEFAULT NULL,
  city varchar(255) DEFAULT NULL,
  street varchar(255) DEFAULT NULL,
  house_number varchar(255) DEFAULT NULL,
  lon double DEFAULT NULL,
  lat double DEFAULT NULL,
  max_driving_distance int DEFAULT NULL,
  profile_picture_link varchar DEFAULT NULL,
  PRIMARY KEY (id)
);
'''