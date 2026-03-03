import { NextRequest, NextResponse } from "next/server";
import { testSftpConnection } from "../../../../lib/sftpClient";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  ...(process.env.WEB_ORIGIN ? [process.env.WEB_ORIGIN] : []),
].filter((o, i, a) => a.indexOf(o) === i);

function getCorsOrigin(request: NextRequest): string {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0] ?? "http://localhost:3000";
}

function withCors(request: NextRequest, response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", getCorsOrigin(request));
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS(request: NextRequest) {
  return withCors(request, new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      host?: string;
      port?: number;
      username?: string;
      password?: string;
    };

    const result = await testSftpConnection({
      host: body.host,
      port: body.port,
      username: body.username,
      password: body.password,
    });

    return withCors(request, NextResponse.json(result));
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown SFTP error";

    return withCors(
      request,
      NextResponse.json(
        {
          ok: false,
          error: message,
        },
        { status: 500 },
      ),
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await testSftpConnection({});
    return withCors(request, NextResponse.json(result));
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown SFTP error";

    return withCors(
      request,
      NextResponse.json(
        {
          ok: false,
          error: message,
        },
        { status: 500 },
      ),
    );
  }
}

