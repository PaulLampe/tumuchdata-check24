export const schema = `
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
  lat double DEFAULT NULL,
  lon double DEFAULT NULL,
  profile_score double NOT NULL,
  max_driving_distance int NOT NULL,
  profile_picture_link varchar(1024) NULL,
  PRIMARY KEY (id)
);
        `