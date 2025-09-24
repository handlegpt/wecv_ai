import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// 允许的域名白名单
const ALLOWED_DOMAINS = [
  'images.unsplash.com',
  'picsum.photos',
  'via.placeholder.com',
  'loremflickr.com',
  'source.unsplash.com',
  'cdn.pixabay.com',
  'images.pexels.com',
  'cdn.stocksnap.io',
  'picsum.photos',
  'placekitten.com',
  'placehold.co',
  'dummyimage.com'
];

// 允许的图片类型
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

// 最大文件大小 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 请求超时时间 (30秒)
const REQUEST_TIMEOUT = 30000;

// 检查是否为内网IP
function isPrivateIP(hostname: string): boolean {
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (localhost)
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
    /^::1$/,                    // IPv6 localhost
    /^fc00:/,                   // IPv6 private
    /^fe80:/,                   // IPv6 link-local
  ];
  
  return privateRanges.some(range => range.test(hostname));
}

// 检查域名是否在白名单中
function isAllowedDomain(hostname: string): boolean {
  return ALLOWED_DOMAINS.includes(hostname);
}

// resolve image proxy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "缺少图片URL参数" }, { status: 400 });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl);
    } catch (e) {
      return NextResponse.json({ error: "图片URL格式不正确" }, { status: 400 });
    }

    // 只允许 HTTPS 协议
    if (parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "只支持HTTPS协议" },
        { status: 400 }
      );
    }

    // 检查是否为内网IP
    if (isPrivateIP(parsedUrl.hostname)) {
      return NextResponse.json(
        { error: "不允许访问内网地址" },
        { status: 403 }
      );
    }

    // 检查域名白名单
    if (!isAllowedDomain(parsedUrl.hostname)) {
      return NextResponse.json(
        { error: "不允许的图片源域名" },
        { status: 403 }
      );
    }

    let response;
    try {
      // 创建 AbortController 用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      response = await fetch(imageUrl, {
        headers: {
          // 模拟浏览器请求
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          Referer: parsedUrl.origin,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: "请求超时" },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: "获取图片失败" },
        { status: 500 }
      );
    }

    // 检查响应状态
    if (!response.ok) {
      return NextResponse.json(
        { error: "获取图片失败" },
        { status: response.status }
      );
    }

    // 检查内容类型
    const contentType = response.headers.get("content-type") || "";
    if (!ALLOWED_CONTENT_TYPES.some(type => contentType.includes(type))) {
      return NextResponse.json(
        { error: "不支持的文件类型" },
        { status: 415 }
      );
    }

    // 检查文件大小
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "文件过大" },
        { status: 413 }
      );
    }

    let imageBuffer;
    try {
      imageBuffer = await response.arrayBuffer();
    } catch (error: any) {
      return NextResponse.json(
        { error: "读取图片内容失败" },
        { status: 500 }
      );
    }

    // 再次检查实际文件大小
    if (imageBuffer.byteLength === 0) {
      return NextResponse.json({ error: "图片内容为空" }, { status: 400 });
    }

    if (imageBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "文件过大" },
        { status: 413 }
      );
    }

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // 缓存1小时
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "https://wecv.com",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "3600",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "处理图片请求时出错" },
      { status: 500 }
    );
  }
}
