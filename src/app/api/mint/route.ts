import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: 'Hello from minting api!' });
}

export async function POST(request: Request) {
  return NextResponse.json({ data: request.formData() });
}
