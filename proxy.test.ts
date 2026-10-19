/** @jest-environment node */

import { NextRequest } from "next/server";

function createRequest(clientIp: string) {
  return new NextRequest(
    "http://localhost:3000/api/birth-place?query=Salerno&kind=comune",
    {
      headers: {
        "x-real-ip": clientIp,
      },
    },
  );
}

describe("rate limit proxy", () => {
  const originalLimit = process.env.LIMIT_REQ;
  const originalWindow = process.env.WINDOW_MS;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-19T10:00:00.000Z"));
    process.env.LIMIT_REQ = "3";
    process.env.WINDOW_MS = "60000";
  });

  afterEach(() => {
    jest.useRealTimers();

    if (originalLimit === undefined) {
      delete process.env.LIMIT_REQ;
    } else {
      process.env.LIMIT_REQ = originalLimit;
    }

    if (originalWindow === undefined) {
      delete process.env.WINDOW_MS;
    } else {
      process.env.WINDOW_MS = originalWindow;
    }
  });

  it("mantiene il ban per 15 minuti anche dopo il reset della finestra", async () => {
    const { proxy } = await import("./proxy");
    const request = createRequest("192.0.2.1");

    expect(proxy(request).status).toBe(200);
    expect(proxy(request).status).toBe(200);

    const lastAllowedResponse = proxy(request);
    expect(lastAllowedResponse.status).toBe(200);
    expect(lastAllowedResponse.headers.get("X-RateLimit-Remaining")).toBe("0");

    const blockedResponse = proxy(request);
    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.headers.get("Retry-After")).toBe("900");

    jest.advanceTimersByTime(60_001);
    expect(proxy(request).status).toBe(429);

    jest.advanceTimersByTime(14 * 60 * 1_000);
    expect(proxy(request).status).toBe(200);
  });
});
