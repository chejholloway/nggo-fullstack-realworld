import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

const API_BASE = "https://api.realworld.io/api";

export interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

interface ProfileResponse {
  profile: Profile;
}

@Injectable({ providedIn: "root" })
export class ProfileService {
  private http = inject(HttpClient);

  getProfile(username: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${API_BASE}/profiles/${username}`);
  }

  followUser(username: string): Observable<ProfileResponse> {
    return this.http.post<ProfileResponse>(
      `${API_BASE}/profiles/${username}/follow`,
      {}
    );
  }

  unfollowUser(username: string): Observable<ProfileResponse> {
    return this.http.delete<ProfileResponse>(
      `${API_BASE}/profiles/${username}/follow`
    );
  }
}
