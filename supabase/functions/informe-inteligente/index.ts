// supabase/functions/informe-inteligente/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from 'openai';

// Inicializa el cliente de OpenAI para OpenRouter
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: Deno.env.get("OPENROUTER_API_KEY"),
});

serve(async (req) => {
  // Manejo de la petición OPTIONS (pre-vuelo CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extraer los datos del formulario
    const formData = await req.formData();
    const transcription = formData.get('transcription') as string;
    const sessionNotes = formData.get('sessionNotes') as string;

    // Validar que los datos necesarios están presentes
    if (!transcription && !sessionNotes) {
      return new Response(JSON.stringify({ error: 'No se proporcionó ni transcripción ni notas de sesión.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Construir el prompt para la IA
    const content = `
      Transcripción de la sesión:
      ${transcription}

      ---

      Notas adicionales del terapeuta:
      ${sessionNotes}
    `;

    // Realizar la llamada a la API usando la librería de OpenAI
    const completion = await client.chat.completions.create({
      extraHeaders: {
        "HTTP-Referer": "https://inforia.app", // O la URL de desarrollo
        "X-Title": "iNFORiA",
      },
      model: "openai/gpt-4o-mini", // Asegúrate de que este es el modelo correcto
      messages: [
        {
          role: "system",
          content: "Eres un asistente experto en la redacción de informes psicológicos para el software iNFORiA. Tu tarea es generar un informe claro, estructurado y profesional en formato Markdown, basándote en la transcripción y las notas proporcionadas."
        },
        {
          role: "user",
          content: content
        }
      ]
    });

    const generatedReport = completion.choices[0].message.content;

    // Devolver el informe generado
    return new Response(JSON.stringify({ report: generatedReport }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error en la función Edge:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
