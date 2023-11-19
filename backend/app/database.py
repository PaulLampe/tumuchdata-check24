
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
    self.update_websockets = Set[WebSocket]

  def getSingleCraftsman(self, id):
    self.connection.execute("""
        SELECT
            id,
            first_name,
            last_name,
            profile_picture_score * 0.4 + profile_description_score * 0.6 as profile_score,
            lat,
            lon,
            max_driving_distance
        FROM
            service_provider_profile c, quality_factor_score f
        WHERE
            c.id = f.profile_id AND c.id = """ + id + ";")

    val = self.connection.fetchone()
    return {
           "id": val[0],
           "first_name": val[1],
           "last_name" : val[2],
           "profile_score": val[3],
           "lat": val[4],
           "lon": val[5] ,
           "max_driving_distance": val[6]
   }

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
                    "max_driving_distance": val[6],
                    "profile_picture_link": val[7]
            }
        )
        val = self.connection.fetchone()
    return res 

  def getCraftsmenRange(self, postalcodes, limit):
    arr = postalcodes.split(",")
    res = []
    for val in arr:
        print(val)
        self.connection.execute(find_craftsmen_by_postcode_query.format(val, 40, 0))

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

  def connect_ws(self, websocket: WebSocket):
    self.update_websockets.add(websocket)

  def disconnect_ws(self, websocket: WebSocket):
    self.update_websockets.remove(websocket)

  def updateCraftsman(self, id: int, request: PatchRequest):
    self.connection.execute(update_craftsmen_query.format(id, request.maxDrivingDistance, request.profilePictureScore, request.profileDescriptionScore))
    for ws in self.update_websockets:
        ws.send_text(id)
    return self.connection.fetchall()

