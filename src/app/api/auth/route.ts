export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === process.env.SITE_PASSWORD) {
    return Response.json({ success: true });
  }
  return Response.json({ success: false }, { status: 401 });
}
