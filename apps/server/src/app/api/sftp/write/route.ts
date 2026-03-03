import { NextRequest, NextResponse } from "next/server";
import { writeSftpFile } from "../../../../lib/sftpClient";

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
  response.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS(request: NextRequest) {
  return withCors(request, new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      path?: string;
      content?: string;
    };

    if (!body.path) {
      return withCors(
        request,
        NextResponse.json(
          { ok: false, error: "Missing 'path' field in body" },
          { status: 400 },
        ),
      );
    }

    await writeSftpFile(body.path, body.content ?? "");

    return withCors(
      request,
      NextResponse.json({
        ok: true,
        path: body.path,
      }),
    );
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

