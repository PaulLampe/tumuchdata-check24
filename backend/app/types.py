from pydantic import BaseModel

class CraftsmanDto(BaseModel):
    id: int
    first_name: str
    last_name : str
    profile_score: float
    lat: float 
    lon: float
    max_driving_distance: int
    profile_picture_link: str

class PatchRequest(BaseModel):
    maxDrivingDistance : float = None
    profilePictureScore : float = None
    profileDescriptionScore : float = None

class PatchResponse(BaseModel):
    id: int
    updated: PatchRequest