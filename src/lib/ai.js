// src/lib/ai.js
// Provedor 1: Google Gemini 2.0 Flash  (1.500 req/dia gratis)
// Provedor 2: Groq Llama 3.3 70B       (14.400 req/dia gratis — fallback automatico)

var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
var GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
var GROQ_MODEL = 'llama-3.3-70b-versatile';

// Contexto por perfil de viajante
var PROFILE_CONTEXT = {
  solo:          'O viajante esta SOZINHO. Priorize: flexibilidade, areas seguras, opcoes economicas, atividades individuais.',
  couple:        'E um CASAL. Priorize: restaurantes romanticos, mirantes ao por do sol, atividades para dois.',
  family_baby:   'Familia COM BEBE. Priorize: locais acessiveis para carrinho, trocadores, atividades curtas (max 1h30), horarios diurnos.',
  family_senior: 'Grupo COM IDOSOS. Priorize: acessibilidade (rampas/elevadores), passeios curtos, restaurantes tranquilos, sem trilhas íngremes.',
  friends:       'GRUPO DE AMIGOS. Priorize: atividades em grupo, happy hour, opcoes custo-beneficio, programacao animada.',
};

// Monta o prompt compartilhado entre os provedores
function buildPrompt({ destination, days, passengers, interests, budget, travelDate, travelProfile }) {
  var budgetLabel = budget === 'economico'
    ? 'economico (hostel, lanchonetes, evitar gastos desnecessarios)'
    : budget === 'esbanjando'
    ? 'alto (hoteis bons, restaurantes selecionados, passeios premium)'
    : 'moderado (pousadas confortaveis, restaurantes variados)';

  var profileCtx = PROFILE_CONTEXT[travelProfile || 'couple'] || PROFILE_CONTEXT.couple;
  var interestLabel = (interests && interests.length) ? interests.join(', ') : 'gastronomia, natureza, cultura';

  var dateCtx = '';
  if (travelDate) {
    var d = new Date(travelDate + 'T12:00:00');
    var months = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    dateCtx = 'A viagem comeca em ' + d.getDate() + ' de ' + months[d.getMonth()] + ' de ' + d.getFullYear() + '. Considere clima e eventos locais desta epoca.';
  }

  return '## PERFIL DO VIAJANTE\n'
    + profileCtx + '\n\n'
    + '## PARAMETROS\n'
    + '- Destino: ' + destination + '\n'
    + '- Duracao: ' + days + ' dia(s)\n'
    + '- Passageiros: ' + passengers + '\n'
    + '- Orcamento: ' + budgetLabel + '\n'
    + '- Interesses: ' + interestLabel + '\n'
    + (dateCtx ? '- ' + dateCtx + '\n' : '')
    + '\n## REGRAS (siga TODAS)\n'
    + '1. Dia 1 apenas: mencione chegada e check-in UMA vez na manha.\n'
    + '2. Dias 2+: NUNCA mencione check-in ou chegada. Comece direto nas atividades.\n'
    + '3. Ultimo dia (' + days + '): mencione check-out na manha.\n'
    + '4. Cada dia deve ter tema/area DIFERENTE de ' + destination + '.\n'
    + '5. NUNCA repita restaurante ou atracao.\n'
    + '6. Use apenas lugares REAIS de ' + destination + '.\n'
    + '7. Inclua precos medios realistas.\n'
    + '\nRetorne SOMENTE JSON valido (sem markdown, sem texto extra):\n'
    + JSON.stringify({
        destination: destination,
        summary: 'frase curta sobre o destino',
        bestPeriod: 'melhor epoca para visitar',
        totalBudget: 'estimativa total em R$ para ' + passengers + ' pessoa(s) por ' + days + ' dia(s)',
        days: [{
          day: 1,
          title: 'titulo criativo do dia',
          morning: 'atividades da manha',
          morningAttractions: [{ name: 'Nome do Local', mapQuery: 'Nome do Local, ' + destination }],
          afternoon: 'atividades da tarde',
          afternoonAttractions: [{ name: 'Nome do Local', mapQuery: 'Nome do Local, ' + destination }],
          evening: 'atividades da noite',
          tip: 'dica local que turistas nao sabem',
          meals: {
            breakfast: { description: 'texto + preco', placeName: 'Nome do Cafe',  mapQuery: 'Nome do Cafe, '  + destination },
            lunch:     { description: 'texto + preco', placeName: 'Nome do Rest.', mapQuery: 'Nome do Rest., ' + destination },
            dinner:    { description: 'texto + preco', placeName: 'Nome do Rest.', mapQuery: 'Nome do Rest., ' + destination },
          },
          accommodation: {
            description: 'nome e preco por noite',
            placeName:    'Nome da Pousada',
            mapQuery:     'Nome da Pousada, ' + destination,
            bookingQuery: destination,
          },
        }],
      }, null, 0);
}

// Faz parse do JSON retornado pela IA (mesmo formato para ambos os provedores)
function parseJsonResponse(text) {
  var clean = text.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/,'').trim();
  try { return JSON.parse(clean); }
  catch(_) {
    var match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('JSON_PARSE_ERROR');
  }
}

// ===== PROVEDOR 1: GEMINI =====
async function generateWithGemini(params) {
  var apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('KEY_MISSING');

  var res = await fetch(GEMINI_URL + '?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(params) }] }],
      generationConfig: { temperature: 0.75, maxOutputTokens: 6000 },
      safetySettings: [
        { category:'HARM_CATEGORY_HARASSMENT',        threshold:'BLOCK_NONE' },
        { category:'HARM_CATEGORY_HATE_SPEECH',       threshold:'BLOCK_NONE' },
        { category:'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold:'BLOCK_NONE' },
        { category:'HARM_CATEGORY_DANGEROUS_CONTENT', threshold:'BLOCK_NONE' },
      ],
    }),
  });

  if (!res.ok) {
    var err = await res.json().catch(function(){return{};});
    if (res.status === 429 || res.status === 503) throw new Error('RATE_LIMIT');
    throw new Error('GEMINI_ERROR: ' + (err.error && err.error.message || res.status));
  }

  var data = await res.json();
  var text  = data.candidates
    && data.candidates[0]
    && data.candidates[0].content
    && data.candidates[0].content.parts
    && data.candidates[0].content.parts[0]
    && data.candidates[0].content.parts[0].text;
  if (!text) throw new Error('EMPTY_RESPONSE');

  return parseJsonResponse(text);
}

// ===== PROVEDOR 2: GROQ (LLAMA) =====
async function generateWithGroq(params) {
  var apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) throw new Error('KEY_MISSING');

  var res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role:'system', content:'Voce e um especialista em turismo brasileiro. Responda APENAS com JSON valido e completo, sem markdown, sem explicacoes, sem texto fora do JSON.' },
        { role:'user',   content: buildPrompt(params) },
      ],
      temperature: 0.7,
      max_tokens:  5000,
    }),
  });

  if (!res.ok) {
    var err = await res.json().catch(function(){return{};});
    if (res.status === 429 || res.status === 503) throw new Error('RATE_LIMIT');
    throw new Error('GROQ_ERROR: ' + (err.error && err.error.message || res.status));
  }

  var data = await res.json();
  var text  = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!text) throw new Error('EMPTY_RESPONSE');

  return parseJsonResponse(text);
}

// ===== FUNCAO PRINCIPAL: tenta Gemini, fallback para Groq =====
export async function generateItinerary(params) {
  var hasGemini = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  var hasGroq   = !!process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!hasGemini && !hasGroq) throw new Error('NO_API_KEY');

  // Tenta Gemini primeiro
  if (hasGemini) {
    try {
      var result = await generateWithGemini(params);
      result._provider = 'gemini';
      return result;
    } catch(geminiErr) {
      // Se for rate limit ou erro de modelo, tenta Groq
      if (geminiErr.message === 'RATE_LIMIT' || geminiErr.message.includes('GEMINI_ERROR')) {
        if (!hasGroq) throw new Error('RATE_LIMIT'); // nao tem fallback
        console.warn('Gemini indisponivel (' + geminiErr.message + '), tentando Groq...');
      } else {
        throw geminiErr; // erro desconhecido, propaga
      }
    }
  }

  // Tenta Groq como fallback
  if (hasGroq) {
    try {
      var result = await generateWithGroq(params);
      result._provider = 'groq';
      return result;
    } catch(groqErr) {
      if (groqErr.message === 'RATE_LIMIT') throw new Error('ALL_LIMITS_REACHED');
      throw groqErr;
    }
  }

  throw new Error('ALL_LIMITS_REACHED');
}

// ===== HELPERS DE LINK =====
export function mapsLink(mapQuery) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapQuery);
}

export function bookingLink(query) {
  var aid    = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID;
  var params = { ss: query };
  if (aid) params.aid = aid;
  return 'https://www.booking.com/searchresults.html?' + new URLSearchParams(params).toString();
}

export function gygLink(city) {
  var partnerId = process.env.NEXT_PUBLIC_GYG_AFFILIATE_ID;
  var base = 'https://www.getyourguide.com/s/?q=' + encodeURIComponent(city);
  if (partnerId) base += '&partner_id=' + partnerId;
  return base;
}
