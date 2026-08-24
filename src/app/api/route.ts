import { NextResponse } from "next/server";

/**
 * /api 根路径没有对应接口。
 * 这里明确返回 404：既避免 Next.js 渲染出空白页，
 * 也避免未登录访问时被中间件强制跳转到登录页。
 */
export async function GET() {
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

export async function HEAD() {
  return new Response(null, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}
