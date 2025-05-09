// Questo file rende tutte le API routes dinamiche nella build di produzione
// È necessario per evitare errori relativi a nextUrl.searchParams e headers durante la build

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Gestisce le richieste OPTIONS per CORS
export async function OPTIONS(_request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Serve solo come config, le route effettive sono nelle rispettive directory
export async function GET() {
  return new Response(JSON.stringify({ message: 'API root' }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 