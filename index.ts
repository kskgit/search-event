/// <reference lib="deno.ns" />
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// メインのサーバーハンドラー
Deno.serve(async (req) => {
  // プリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      status: 204
    });
  }

  try {
    console.log("キー取れてる？", Deno.env.get("GEMINI_API_KEY"))
    const key = Deno.env.get("GEMINI_API_KEY")
    // リクエストボディの解析
    const { query, category, targetId } = await req.json();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "contents": [{
          "parts":[{"text": "Explain how AI works"}]
        }]
      })
    });
  
    const data = await response.json();

    // テスト用の簡単なレスポンス
    const testResponse = {
      success: true,
      data: {
        message: "Function is working",
        receivedParams: {
          query,
          category,
          targetId
        },
        response: data
      }
    };

    // レスポンスの返却
    return new Response(
      JSON.stringify(testResponse),
      {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        status: 200
      }
    );

  } catch (error) {
    // エラーハンドリング
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/search-event' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
