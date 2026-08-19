export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET() {
  return Response.json(
    {
      ok: true,
      sha: process.env.NEXT_PUBLIC_DEPLOYMENT_SHA ?? 'development',
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
