import { inject, Injectable } from "@angular/core";
import { from } from "rxjs";
import { createClient } from "@connectrpc/connect";
import { CommentService } from "@conduit/gen/comments";
import { CONNECT_TRANSPORT } from "@conduit/shared-data-access";

@Injectable({ providedIn: "root" })
export class CommentsService {
  private transport = inject(CONNECT_TRANSPORT);
  private client = createClient(CommentService, this.transport);

  getComments(slug: string) {
    return from(this.client.getComments({ slug }));
  }

  addComment(slug: string, body: string) {
    return from(this.client.addComment({ slug, body }));
  }

  deleteComment(slug: string, id: number) {
    return from(this.client.deleteComment({ slug, id }));
  }
}
