import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthStore } from "@conduit/auth-data-access";

const API_BASE = "/conduit-api";

export interface Comment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: {
    username: string;
    bio: string;
    image: string;
    following: boolean;
  };
}

interface CommentsResponse { comments: Comment[]; }
interface CommentResponse  { comment: Comment; }

@Injectable({ providedIn: "root" })
export class CommentsService {
  private http      = inject(HttpClient);
  private authStore = inject(AuthStore);

  private authHeaders(): HttpHeaders {
    const token = this.authStore.token();
    return token
      ? new HttpHeaders({ Authorization: `Token ${token}` })
      : new HttpHeaders();
  }

  getComments(articleSlug: string): Observable<CommentsResponse> {
    return this.http.get<CommentsResponse>(
      `${API_BASE}/articles/${articleSlug}/comments`,
      { headers: this.authHeaders() }
    );
  }

  addComment(articleSlug: string, body: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(
      `${API_BASE}/articles/${articleSlug}/comments`,
      { comment: { body } },
      { headers: this.authHeaders() }
    );
  }

  deleteComment(articleSlug: string, id: number): Observable<void> {
    return this.http.delete<void>(
      `${API_BASE}/articles/${articleSlug}/comments/${id}`,
      { headers: this.authHeaders() }
    );
  }
}
