// src/pages/api/test.ts
export async function GET() {
  return new Response(JSON.stringify({ 
    message: "API fonctionne!", 
    timestamp: new Date().toISOString() 
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
