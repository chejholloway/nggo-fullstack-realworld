import { ResultAsync } from 'neverthrow';
import { firstValueFrom, Observable } from 'rxjs';

/**
 * Structured error type for all Conduit API calls.
 *
 * `fields` holds per-field validation messages exactly as the API returns
 * them: `{ "email": ["is invalid"], "password": ["is too short"] }`.
 * `message` is a human-readable fallback for errors with no field detail.
 */
export interface ApiError {
  message: string;
  fields: Record<string, string[]>;
}

/**
 * Converts an unknown thrown value (from HttpClient or firstValueFrom) into
 * a typed ApiError. Handles both the Conduit `{ errors: { field: string[] } }`
 * envelope and plain Error objects.
 */
export function mapApiError(thrown: unknown): ApiError {
  if (thrown && typeof thrown === 'object') {
    const e = thrown as Record<string, unknown>;

    // HttpErrorResponse shape: { error: { errors: { field: string[] } } }
    const body = e['error'] as Record<string, unknown> | undefined;
    if (body?.['errors'] && typeof body['errors'] === 'object') {
      const raw = body['errors'] as Record<string, unknown>;
      const fields: Record<string, string[]> = {};
      for (const [field, msgs] of Object.entries(raw)) {
        fields[field] = Array.isArray(msgs) ? (msgs as string[]) : [String(msgs)];
      }
      const message = Object.entries(fields)
        .map(([f, ms]) => `${f} ${ms.join(', ')}`)
        .join('; ');
      return { message, fields };
    }

    // Plain Error
    if (typeof e['message'] === 'string') {
      return { message: e['message'], fields: {} };
    }
  }

  return { message: 'An unexpected error occurred.', fields: {} };
}

/**
 * Wraps an Observable into a `ResultAsync<T, ApiError>`.
 *
 * Use this at the component boundary for mutation calls — wherever you'd
 * otherwise write `firstValueFrom(obs$)` inside a try/catch. Read-only
 * streaming operations that use `.subscribe()` should stay as Observables.
 */
export function fromObservable<T>(obs: Observable<T>): ResultAsync<T, ApiError> {
  return ResultAsync.fromPromise(firstValueFrom(obs), mapApiError);
}
