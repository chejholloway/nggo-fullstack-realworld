import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthStore } from "@conduit/auth-data-access";

const API_BASE = "/conduit-api";

export interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

interface ProfileResponse { profile: Profile; }

@Injectable({ providedIn: "root" })
export class ProfileService {
  private http      = inject(HttpClient);
  private authStore = inject(AuthStore);

  private authHeaders(): HttpHeaders {
    const token = this.authStore.token();
    return token
      ? new HttpHeaders({ Authorization: `Token ${token}` })
      : new HttpHeaders();
  }

  getProfile(username: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(
      `${API_BASE}/profiles/${username}`,
      { headers: this.authHeaders() }
    );
  }

  followUser(username: string): Observable<ProfileResponse> {
    return this.http.post<ProfileResponse>(
      `${API_BASE}/profiles/${username}/follow`,
      {},
      { headers: this.authHeaders() }
    );
  }

  unfollowUser(username: string): Observable<ProfileResponse> {
    return this.http.delete<ProfileResponse>(
      `${API_BASE}/profiles/${username}/follow`,
      { headers: this.authHeaders() }
    );
  }
}
