import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DRIVERS = ['Pompilio', 'John', 'Tito'];
const VEHICLES: Record<string, string> = {
  'Pompilio': 'Nissan Caravan',
  'John': 'Nissan Caravan',
  'Tito': 'Hino Ranger'
};
const EXPENSE_TYPES = ['combustível', 'manutenção', 'multas', 'outros'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um assistente financeiro para a empresa BSM Transport.
Analise a mensagem do usuário e extraia informações financeiras.

MOTORISTAS DISPONÍVEIS: ${DRIVERS.join(', ')}
VEÍCULOS: Pompilio e John usam Nissan Caravan, Tito usa Hino Ranger
TIPOS DE DESPESA: ${EXPENSE_TYPES.join(', ')}

Responda APENAS com JSON válido no formato:
{
  "type": "revenue" | "expense" | "salary" | "question" | "greeting",
  "data": {
    "driver": "nome do motorista",
    "vehicle": "veículo (auto-preencher baseado no motorista)",
    "amount": número,
    "expenseType": "tipo de despesa (só para despesas)",
    "description": "descrição opcional"
  },
  "response": "resposta amigável para o usuário",
  "understood": true/false
}

Exemplos:
- "receita 5000 pompilio" → type: revenue, driver: Pompilio, amount: 5000
- "despesa combustível 1500 tito" → type: expense, driver: Tito, amount: 1500, expenseType: combustível
- "salário john 8000" → type: salary, driver: John, amount: 8000
- "olá" → type: greeting
- "quanto lucro temos?" → type: question`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Muitas requisições. Tente novamente em alguns segundos." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    // Try to parse the JSON response
    let parsed;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      // If parsing fails, return a generic response
      parsed = {
        type: "question",
        data: null,
        response: content || "Não entendi. Tente: 'receita 5000 Pompilio' ou 'despesa combustível 1500 Tito'",
        understood: false
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro desconhecido",
      type: "error",
      response: "Desculpe, ocorreu um erro. Tente novamente."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
