import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile, readdir, unlink } from "fs/promises";
import path from "path";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  ...(process.env.WEB_ORIGIN ? [process.env.WEB_ORIGIN] : []),
].filter((o, i, a) => a.indexOf(o) === i);

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const HTML_JS_EXT = [".html", ".htm", ".js", ".mjs", ".cjs"];
const JS_EXT = [".js", ".mjs", ".cjs"];
const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];

const IMAGE_MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function getCorsOrigin(request: NextRequest): string {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0] ?? "http://localhost:3000";
}

function withCors(request: NextRequest, response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", getCorsOrigin(request));
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

function isHtmlOrJs(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return HTML_JS_EXT.includes(ext);
}

function isJsFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return JS_EXT.includes(ext);
}

function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXT.includes(ext);
}

export async function OPTIONS(request: NextRequest) {
  return withCors(request, new NextResponse(null, { status: 204 }));
}

/** GET ?name=file.html → read one file. GET (no name) → list HTML/JS files. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    await mkdir(UPLOAD_DIR, { recursive: true });

    if (name) {
      const safeName = path.basename(name);
      if (!safeName) {
        return withCors(
          request,
          NextResponse.json(
            { ok: false, error: "Missing or invalid 'name' query parameter" },
            { status: 400 },
          ),
        );
      }
      const filePath = path.join(UPLOAD_DIR, safeName);
      let content = await readFile(filePath, "utf8");

      // Đọc tất cả ảnh trong thư mục uploads, convert sang base64 và lưu kèm tên file
      const entries = await readdir(UPLOAD_DIR, { withFileTypes: true });
      const images = await Promise.all(
        entries
          .filter((e) => e.isFile() && isImageFile(e.name))
          .map(async (e) => {
            const imgPath = path.join(UPLOAD_DIR, e.name);
            const buffer = await readFile(imgPath);
            const ext = path.extname(e.name).toLowerCase();
            const mime = IMAGE_MIME_BY_EXT[ext] ?? "application/octet-stream";
            const base64 = buffer.toString("base64");
            return {
              name: e.name,
              mime,
              base64,
            };
          }),
      );

      // Nếu là file JS:
      // - với mỗi ảnh: chỉ cần dòng chứa tên file ảnh (vd: attitude.png)
      //   thì thay nguyên dòng đó bằng
      //   `{type:createjs.AbstractLoader.IMAGE, src:"data:image/webp;base64,..." }`
      let imageLineIndexes: { name: string; lineIndex: number }[] = [];
      if (isJsFile(safeName) && images.length > 0) {
        const lines = content.split(/\r?\n/);

        for (const img of images) {
          const dataUrl = `data:image/webp;base64,${img.base64}`;
          let foundIndex = -1;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.includes(img.name)) continue;

            const idx = line.indexOf(img.name);
            if (idx === -1) continue;

            const afterNameIndex = idx + img.name.length;
            // Bỏ phần query như ?1704703030316 ngay sau tên ảnh, giữ lại phần sau dấu "
            const nextQuoteIndex = line.indexOf('"', afterNameIndex);
            const suffix =
              nextQuoteIndex === -1
                ? line.slice(afterNameIndex)
                : line.slice(nextQuoteIndex);
            // Bỏ bớt 1 dấu " vì suffix đã chứa dấu " đóng chuỗi, tránh thành "...base64""" ,
            const suffixAfterQuote = suffix.startsWith('"') ? suffix.slice(1) : suffix;

            lines[i] = `{type:createjs.AbstractLoader.IMAGE, src:"${dataUrl}"${suffixAfterQuote}`;
            foundIndex = i;
            break;
          }

          imageLineIndexes.push({ name: img.name, lineIndex: foundIndex });
        }

        content = lines.join("\n");
      }

      const convertedImages = imageLineIndexes
        .filter((item) => item.lineIndex >= 0)
        .map((item) => item.name);

      return withCors(
        request,
        NextResponse.json({
          ok: true,
          name: safeName,
          content,
          images,
          imageLineIndexes,
          convertedImages,
        }),
      );
    }

    const entries = await readdir(UPLOAD_DIR, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && isHtmlOrJs(e.name))
      .map((e) => e.name)
      .sort();

    return withCors(
      request,
      NextResponse.json({
        ok: true,
        files,
      }),
    );
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code === "ENOENT") {
      return withCors(
        request,
        NextResponse.json(
          { ok: false, error: "File not found" },
          { status: 404 },
        ),
      );
    }
    const message = error instanceof Error ? error.message : "Read failed";
    return withCors(
      request,
      NextResponse.json({ ok: false, error: message }, { status: 500 }),
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      content?: string;
      images?: { name: string; base64: string }[];
    };

    if (!body.name || body.content === undefined) {
      return withCors(
        request,
        NextResponse.json(
          { ok: false, error: "Missing 'name' or 'content' in body" },
          { status: 400 },
        ),
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });
    const safeName = path.basename(body.name) || "upload.txt";
    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, body.content, "utf8");

    // Nếu client gửi kèm ảnh (base64), lưu từng ảnh xuống thư mục uploads
    if (Array.isArray(body.images) && body.images.length > 0) {
      await Promise.all(
        body.images.map(async (img) => {
          const raw = img.base64.includes(",")
            ? img.base64.split(",")[1]
            : img.base64;
          const buffer = Buffer.from(raw, "base64");
          const imgName = path.basename(img.name || "image.png");
          const imgPath = path.join(uploadDir, imgName);
          await writeFile(imgPath, buffer);
        }),
      );
    }

    return withCors(
      request,
      NextResponse.json({
        ok: true,
        name: safeName,
        path: filePath,
      }),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";

    return withCors(
      request,
      NextResponse.json({ ok: false, error: message }, { status: 500 }),
    );
  }
}

// DELETE → xóa toàn bộ file đã upload trên server (HTML/JS + ảnh)
export async function DELETE(request: NextRequest) {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const entries = await readdir(UPLOAD_DIR, { withFileTypes: true });
    await Promise.all(
      entries
        .filter((e) => e.isFile())
        .map((e) => unlink(path.join(UPLOAD_DIR, e.name)).catch(() => {})),
    );

    return withCors(
      request,
      NextResponse.json({ ok: true, cleared: true }),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Clear failed";
    return withCors(
      request,
      NextResponse.json({ ok: false, error: message }, { status: 500 }),
    );
  }
}
