import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'No code provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For Python code execution using Piston API
    const pistonResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language || 'python',
        version: '*',
        files: [
          {
            name: language === 'javascript' ? 'main.js' : 'main.py',
            content: code,
          },
        ],
      }),
    });

    if (!pistonResponse.ok) {
      throw new Error('Failed to execute code');
    }

    const result = await pistonResponse.json();
    const output = result.run.output || result.run.stderr || 'No output';

    return new Response(
      JSON.stringify({ output }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in execute-code function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
