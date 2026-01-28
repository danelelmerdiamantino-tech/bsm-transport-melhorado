import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DRIVERS = [
  { id: 'pompilio', name: 'Pompilio', vehicle: 'Nissan Caravan' },
  { id: 'john', name: 'John', vehicle: 'Nissan Caravan' },
  { id: 'tito', name: 'Tito', vehicle: 'Hino Ranger' }
];

const EXPENSE_TYPES = ['combustível', 'manutenção', 'multas', 'outros'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um assistente financeiro para a empresa BSM Transport.
Analise a mensagem do usuário e extraia informações ou responda perguntas.

MOTORISTAS DISPONÍVEIS:
${DRIVERS.map(d => `- ${d.name}: ${d.vehicle}`).join('\n')}

TIPOS DE DESPESA: ${EXPENSE_TYPES.join(', ')}

COMANDOS SUPORTADOS:
1. REGISTRAR RECEITA: "receita [valor] [motorista]" → type: "revenue"
2. REGISTRAR DESPESA: "despesa [tipo] [valor] [motorista]" → type: "expense"
3. REGISTRAR SALÁRIO: "salário [motorista] [valor]" → type: "salary"
4. LISTAR MOTORISTAS: "listar motoristas", "mostrar motoristas", "quem são os motoristas" → type: "list_drivers"
5. LISTAR DESPESAS: "listar despesas", "mostrar despesas", "ver despesas" → type: "list_expenses"
6. LISTAR RECEITAS: "listar receitas", "mostrar receitas", "ver receitas" → type: "list_revenues"
7. LISTAR SALÁRIOS: "listar salários", "mostrar salários", "ver salários" → type: "list_salaries"
8. RESUMO FINANCEIRO: "resumo", "balanço", "como está a empresa", "quanto lucro" → type: "summary"
9. AJUDA: "ajuda", "comandos", "o que você faz" → type: "help"
10. SAUDAÇÃO: "olá", "oi", "bom dia" → type: "greeting"

Responda APENAS com JSON válido no formato:
{
  "type": "revenue" | "expense" | "salary" | "list_drivers" | "list_expenses" | "list_revenues" | "list_salaries" | "summary" | "help" | "greeting" | "question",
  "data": {
    "driver": "nome do motorista (se aplicável)",
    "vehicle": "veículo (auto-preencher baseado no motorista)",
    "amount": número (se aplicável),
    "expenseType": "tipo de despesa (só para despesas)",
    "description": "descrição opcional"
  },
  "response": "resposta amigável em português para o usuário",
  "understood": true/false
}

Para o comando "help", responda com uma lista clara de todos os comandos disponíveis.
Para "list_drivers", explique cada motorista e seu veículo.
Para listas de transações, apenas confirme que vai mostrar os dados (o frontend vai exibir).`;

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
          error: true,
          type: "error",
          response: "⏳ Muitas requisições. Aguarde alguns segundos e tente novamente." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: true,
          type: "error",
          response: "💳 Créditos esgotados. Entre em contato com o suporte." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      parsed = {
        type: "question",
        data: null,
        response: content || "Não entendi. Digite 'ajuda' para ver os comandos disponíveis.",
        understood: false
      };
    }

    // Enrich response for list commands
    if (parsed.type === 'list_drivers') {
      parsed.drivers = DRIVERS;
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: true,
      type: "error",
      response: "❌ Desculpe, ocorreu um erro. Tente novamente."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
