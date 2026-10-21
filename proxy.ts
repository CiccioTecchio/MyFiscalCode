import moment, { type Moment } from "moment";
import { NextRequest, NextResponse } from "next/server";
import process from "process";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handlei18nRouting = createMiddleware(routing);

function getPositiveInteger(value: string | undefined, fallback: number) {
  const parsedValue = Number.parseInt(value ?? "", 10);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

const LIMIT_REQ = getPositiveInteger(process.env.LIMIT_REQ, 100);
const WINDOW_MS = getPositiveInteger(process.env.WINDOW_MS, 60_000);
const BAN_DURATION_MS = moment.duration(15, "minutes").asMilliseconds();
const CLEANUP_INTERVAL_MS = moment.duration(1, "hour").asMilliseconds();

type RateLimitEntry = {
  count: number;
  resetAt: Moment;
  blockedUntil?: Moment;
};

const requests = new Map<string, RateLimitEntry>();

function removeExpiredEntries() {
  const now = moment();

  for (const [clientIp, entry] of requests) {
    const rateWindowExpired = now.isSameOrAfter(entry.resetAt);
    const banExpired =
      !entry.blockedUntil || now.isSameOrAfter(entry.blockedUntil);

    if (rateWindowExpired && banExpired) {
      requests.delete(clientIp);
    }
  }
}

const cleanupInterval = setInterval(removeExpiredEntries, CLEANUP_INTERVAL_MS);
cleanupInterval.unref();

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function createAllowedResponse(remaining: number) {
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(LIMIT_REQ));
  response.headers.set("X-RateLimit-Remaining", String(remaining));

  return response;
}

function createRateLimitedResponse(blockedUntil: Moment, now: Moment) {
  const retryAfter = Math.max(
    1,
    Math.ceil(blockedUntil.diff(now, "seconds", true)),
  );

  return NextResponse.json(
    {
      error: "Too many requests",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(LIMIT_REQ),
        "X-RateLimit-Remaining": "0",
        "Cache-Control": "no-store",
      },
    },
  );
}

export function handleRateLimit(request: NextRequest) {
  const now = moment();
  const clientIp = getClientIP(request);
  const existing = requests.get(clientIp);

  if (existing?.blockedUntil && now.isBefore(existing.blockedUntil)) {
    return createRateLimitedResponse(existing.blockedUntil, now);
  }

  const availableEntry = existing?.blockedUntil ? undefined : existing;
  const entry: RateLimitEntry =
    !availableEntry || now.isSameOrAfter(availableEntry.resetAt)
      ? { count: 1, resetAt: now.clone().add(WINDOW_MS, "milliseconds") }
      : {
          count: availableEntry.count + 1,
          resetAt: availableEntry.resetAt,
        };

  if (entry.count === LIMIT_REQ) {
    entry.blockedUntil = now.clone().add(BAN_DURATION_MS, "milliseconds");
  }

  requests.set(clientIp, entry);

  const remaining = Math.max(0, LIMIT_REQ - entry.count);

  return createAllowedResponse(remaining);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  return pathname === "/api" || pathname.startsWith("/api/")
    ? handleRateLimit(request)
    : handlei18nRouting(request);
}

export const config = {
  matcher: ["/api/:path*", "/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
