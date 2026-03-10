import { InjectionToken } from "@angular/core";
import { createConnectTransport } from "@connectrpc/connect-web";
import type { Transport } from "@connectrpc/connect";

export const CONNECT_TRANSPORT = new InjectionToken<Transport>("CONNECT_TRANSPORT");

export const connectTransport = createConnectTransport({
  baseUrl: "http://localhost:8080",
});
