
from app.queries import find_craftsmen_by_postcode_query, ingest_data_query, schema_query, update_craftsmen_query
from app.types import PatchRequest, CraftsmanDto
import os.path
import duckdb

db_path = 'data/db'

class Database:
  def __init__(self) -> None:
    self.connection = duckdb.connect(db_path)
    self.connection.sql(schema_query)
    self.connection.sql(ingest_data_query)

  def getCraftsmen(self, postalcode, limit, skip):
    self.connection.execute(find_craftsmen_by_postcode_query.format(postalcode, limit, skip))
    res = []
    val = self.connection.fetchone()
    while val:
        res.append(
            {
                    "id": val[0],
                    "first_name": val[1],
                    "last_name" : val[2],
                    "profile_score": val[3],
                    "lat": val[4],
                    "lon": val[5] ,
                    "max_driving_distance": val[6]
            }
        )
        val = self.connection.fetchone()
    return res 

  def getCraftsmenRange(self, postalcodes, limit, skip):
    print(postalcodes)
    self.connection.execute(find_craftsmen_by_postcode_query.format('80807', limit, skip))
    res = []
    val = self.connection.fetchone()
    while val:
        res.append(
            {
                    "id": val[0],
                    "first_name": val[1],
                    "last_name" : val[2],
                    "profile_score": val[3],
                    "lat": val[4],
                    "lon": val[5] ,
                    "max_driving_distance": val[6]
            }
        )
        val = self.connection.fetchone()
    return res 

  def updateCraftsman(self, id: int, request: PatchRequest):
    self.connection.execute(update_craftsmen_query.format(id, request.maxDrivingDistance, request.profilePictureScore, request.profileDescriptionScore))
    return self.connection.fetchall()

