import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPool } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM `users` WHERE `username` = ? AND `password` = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Set HTTP-only cookie for session tracking
    const cookieStore = await cookies();
    cookieStore.set('rose_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({ success: true, username: rows[0].username });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
