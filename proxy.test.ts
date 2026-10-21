/** @jest-environment node */

import { NextRequest } from "next/server";

const mockHandleI18nRouting = jest.fn(
  () =>
    new Response(null, {
      status: 200,
      headers: { "X-Test-Handler": "i18n" },
    }),
);

const mockCreateMiddleware = jest.fn(() => mockHandleI18nRouting);

jest.mock("next-intl/middleware", () => ({
  __esModule: true,
  default: mockCreateMiddleware,
}));

jest.mock("./i18n/routing", () => ({
  routing: {
    locales: ["it-IT", "en-US"],
    defaultLocale: "it-IT",
    localePrefix: "as-needed",
  },
}));

function createApiRequest(clientIp: string) {
  return new NextRequest(
    "http://localhost:3000/api/birth-place?query=Salerno&kind=comune",
    {
      headers: {
        "x-real-ip": clientIp,
      },
    },
  );
}

function createPageRequest(pathname = "/about") {
  return new NextRequest(`http://localhost:3000${pathname}`);
}

describe("proxy", () => {
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

  it("applica il rate limiting alle richieste API", async () => {
    const { proxy } = await import("./proxy");
    const request = createApiRequest("192.0.2.1");

    expect(proxy(request).status).toBe(200);
    expect(proxy(request).status).toBe(200);

    const lastAllowedResponse = proxy(request);
    expect(lastAllowedResponse.status).toBe(200);
    expect(lastAllowedResponse.headers.get("X-RateLimit-Remaining")).toBe("0");

    const blockedResponse = proxy(request);
    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.headers.get("Retry-After")).toBe("900");
    expect(mockHandleI18nRouting).not.toHaveBeenCalled();

    jest.advanceTimersByTime(60_001);
    expect(proxy(request).status).toBe(429);

    jest.advanceTimersByTime(14 * 60 * 1_000);
    expect(proxy(request).status).toBe(200);
  });

  it("inoltra le richieste di pagina al routing i18n", async () => {
    const { proxy } = await import("./proxy");
    const request = createPageRequest();

    const response = proxy(request);

    expect(mockHandleI18nRouting).toHaveBeenCalledTimes(1);
    expect(mockHandleI18nRouting).toHaveBeenCalledWith(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Test-Handler")).toBe("i18n");
    expect(response.headers.get("X-RateLimit-Limit")).toBeNull();
  });
});
