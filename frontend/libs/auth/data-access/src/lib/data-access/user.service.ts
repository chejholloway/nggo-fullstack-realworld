import { inject, Injectable } from '@angular/core';
import { from } from 'rxjs';
import { createClient } from '@connectrpc/connect';
import { AuthService } from '@conduit/gen/auth';
import { CONNECT_TRANSPORT } from '@conduit/shared-data-access';
import { UpdateUserRequest } from '@conduit/gen/auth/v1/auth_pb';

@Injectable({ providedIn: 'root' })
export class UserService {
  private client = createClient({
    transport: inject(CONNECT_TRANSPORT),
    service: AuthService,
  });

  updateUser(request: UpdateUserRequest) {
    return from(this.client.updateUser(request));
  }
}
