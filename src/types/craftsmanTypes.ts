export interface CraftsmanDisplayObject {
    id: string;
    first_name: string;
    last_name: string;
    lat: number;
    lon: number;
    distance_to_user_km: number;
    profile_score: number;
}

export interface CraftsmanDto {
    id: string;
    first_name: string;
    last_name: string;
}