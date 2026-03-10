import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '@conduit/shared-data-access';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api'; // Assuming a REST API for profiles

  getProfile(username: string): Observable<{ profile: Profile }> {
    return this.http.get<{ profile: Profile }>(`${this.baseUrl}/profiles/${username}`);
  }

  followUser(username: string): Observable<{ profile: Profile }> {
    return this.http.post<{ profile: Profile }>(`${this.baseUrl}/profiles/${username}/follow`, {});
  }

  unfollowUser(username: string): Observable<{ profile: Profile }> {
    return this.http.delete<{ profile: Profile }>(`${this.baseUrl}/profiles/${username}/follow`);
  }
}
