import { inject, Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { createClient } from "@connectrpc/connect";
import { ProfileService as ConnectProfileService } from "@conduit/gen/profile";
import { CONNECT_TRANSPORT } from "@conduit/shared-data-access";
import type {
  GetProfileRequest,
  GetProfileResponse,
  FollowRequest,
  FollowResponse,
  UnfollowRequest,
  UnfollowResponse,
} from "@conduit/gen/profile";

export interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

@Injectable({ providedIn: "root" })
export class ProfileService {
  private transport = inject(CONNECT_TRANSPORT);
  private client = createClient(ConnectProfileService, this.transport);

  getProfile(username: string): Observable<GetProfileResponse> {
    return from(this.client.getProfile({ username }));
  }

  followUser(username: string): Observable<FollowResponse> {
    return from(this.client.follow({ username }));
  }

  unfollowUser(username: string): Observable<UnfollowResponse> {
    return from(this.client.unfollow({ username }));
  }
}
