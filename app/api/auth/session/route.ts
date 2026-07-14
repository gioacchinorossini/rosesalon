import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('rose_session');

    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error: any) {
    console.error('Session error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
