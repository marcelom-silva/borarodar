// src/lib/ai.js
// Provedor 1: Google Gemini 2.0 Flash  (1.500 req/dia gratis)
// Provedor 2: Groq Llama 3.3 70B       (14.400 req/dia gratis — fallback automatico)

var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
var GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
var GROQ_MODEL = 'llama-3.3-70b-versatile';

var PROFILE_CONTEXT = {
  solo:          'O viajante esta SOZINHO. Priorize: areas seguras, atividades individuais, opcoes economicas, hostels.',
  couple:        'E um CASAL. Priorize: restaurantes romanticos, mirantes, spa, atividades para dois.',
  family_baby:   'Familia COM BEBE. Priorize: locais com carrinho acessivel, trocadores, atividades curtas (max 1h30min), horarios diurnos.',
  family_senior: 'Grupo COM IDOSOS. Priorize: acessibilidade, passeios curtos, restaurantes tranquilos, sem trilhas ingremes.',
  friends:       'GRUPO DE AMIGOS. Priorize: atividades em grupo, happy hour, opcoes custo-beneficio, programacao animada.',
};

// ===== PROMPT EM 2 FASES para evitar repeticao de dias =====
function buildPrompt({ destination, days, passengers, interests, budget, travelDate, travelProfile }) {
  var budgetLabel = budget === 'economico'
    ? 'economico (hostel, lanchonetes, custo baixo)'
    : budget === 'esbanjando'
    ? 'alto (hoteis bons, restaurantes premium, passeios pagos)'
    : 'moderado (pousadas confortaveis, restaurantes variados)';

  var profileCtx   = PROFILE_CONTEXT[travelProfile||'couple'] || PROFILE_CONTEXT.couple;
  var interestLabel= (interests&&interests.length) ? interests.join(', ') : 'gastronomia, natureza, cultura';

  var dateCtx = '';
  if (travelDate) {
    var d = new Date(travelDate+'T12:00:00');
    var months = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    dateCtx = 'Viagem em '+d.getDate()+' de '+months[d.getMonth()]+' de '+d.getFullYear()+'. Considere clima e eventos locais.';
  }

  // Gera a lista de temas planejados para cada dia
  var dayThemesExample = [];
  for (var i = 1; i <= days; i++) {
    if (i === 1)    dayThemesExample.push('"Dia ' + i + ': [tema de chegada + area do centro ou primeiro bairro]"');
    else if (i === days) dayThemesExample.push('"Dia ' + i + ': [tema diferente de todos os outros + check-out]"');
    else dayThemesExample.push('"Dia ' + i + ': [tema completamente diferente dos dias anteriores]"');
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
    + '\n'
    + '## FASE 1 — PLANEJAMENTO (obrigatorio antes de escrever o roteiro)\n'
    + 'Antes de gerar qualquer dia, defina UM TEMA UNICO para cada um dos ' + days + ' dias.\n'
    + 'Cada tema deve cobrir uma AREA GEOGRAFICA ou TIPO DE ATIVIDADE diferente de ' + destination + '.\n'
    + 'Exemplos de temas: "Centro Historico", "Natureza e Trilhas", "Gastronomia Local", "Arte e Cultura", "Praia e Mar", etc.\n'
    + 'NUNCA repita o mesmo bairro, area ou tema em dois dias diferentes.\n'
    + '\n'
    + '## FASE 2 — EXECUCAO (siga os temas definidos)\n'
    + 'Agora gere o roteiro completo. Para cada dia, use APENAS lugares que nao apareceram em NENHUM outro dia.\n'
    + '\n'
    + '## REGRAS CRITICAS (violacao = roteiro invalido)\n'
    + '1. DIA 1 SOMENTE: mencione chegada e check-in UMA VEZ na manha.\n'
    + '2. DIAS 2 a ' + (days-1) + ': NUNCA mencione check-in, chegada ou acomodacao inicial.\n'
    + '3. DIA ' + days + ' (ultimo): mencione check-out e retorno apenas na manha.\n'
    + '4. CADA DIA = AREA/TEMA DIFERENTE. Verificacao obrigatoria antes de cada dia.\n'
    + '5. RESTAURANTES: cada refeicao em cada dia deve ser em estabelecimento DIFERENTE de todos os outros dias.\n'
    + '6. ATRACOES: cada ponto turistico pode aparecer em APENAS UM DIA.\n'
    + '7. Use APENAS lugares REAIS e conhecidos de ' + destination + '.\n'
    + '\n'
    + 'Retorne SOMENTE JSON valido (sem markdown, sem texto extra):\n'
    + JSON.stringify({
        destination: destination,
        summary: 'frase curta e inspiradora sobre o destino',
        bestPeriod: 'melhor epoca para visitar',
        totalBudget: 'estimativa total em R$ para '+passengers+' pessoa(s) por '+days+' dia(s)',
        days: [{
          day: 1,
          title: 'titulo unico e descritivo refletindo o tema do dia',
          morning: 'atividades da manha (check-in apenas no dia 1)',
          morningAttractions: [{name:'Nome do Local',mapQuery:'Nome do Local, '+destination}],
          afternoon: 'atividades da tarde em area diferente da manha se possivel',
          afternoonAttractions: [{name:'Nome do Local',mapQuery:'Nome do Local, '+destination}],
          evening: 'atividades da noite',
          tip: 'dica local exclusiva que turistas nao sabem',
          meals: {
            breakfast: {description:'texto com preco', placeName:'Nome do Cafe',  mapQuery:'Nome do Cafe, '+destination},
            lunch:     {description:'texto com preco', placeName:'Nome do Rest.', mapQuery:'Nome do Rest., '+destination},
            dinner:    {description:'texto com preco', placeName:'Nome do Rest.', mapQuery:'Nome do Rest., '+destination},
          },
          accommodation: {
            description:'nome da pousada/hotel e preco por noite',
            placeName:'Nome da Pousada',
            mapQuery:'Nome da Pousada, '+destination,
            bookingQuery:destination,
          },
        }],
      }, null, 0);
}

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

  var res = await fetch(GEMINI_URL+'?key='+apiKey, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      contents:[{parts:[{text: buildPrompt(params)}]}],
      generationConfig:{temperature:0.75, maxOutputTokens:8000},
      safetySettings:[
        {category:'HARM_CATEGORY_HARASSMENT',        threshold:'BLOCK_NONE'},
        {category:'HARM_CATEGORY_HATE_SPEECH',       threshold:'BLOCK_NONE'},
        {category:'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold:'BLOCK_NONE'},
        {category:'HARM_CATEGORY_DANGEROUS_CONTENT', threshold:'BLOCK_NONE'},
      ],
    }),
  });

  if (!res.ok) {
    var err = await res.json().catch(function(){return{};});
    if (res.status===429||res.status===503) throw new Error('RATE_LIMIT');
    throw new Error('GEMINI_ERROR: '+(err.error&&err.error.message||res.status));
  }

  var data = await res.json();
  var text  = data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts&&data.candidates[0].content.parts[0]&&data.candidates[0].content.parts[0].text;
  if (!text) throw new Error('EMPTY_RESPONSE');
  return parseJsonResponse(text);
}

// ===== PROVEDOR 2: GROQ (LLAMA) =====
async function generateWithGroq(params) {
  var apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) throw new Error('KEY_MISSING');

  var res = await fetch(GROQ_URL, {
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages:[
        {role:'system', content:'Voce e um especialista em turismo brasileiro. Responda APENAS com JSON valido e completo. Nunca repita restaurantes, hoteis ou atracoes entre os dias do roteiro.'},
        {role:'user',   content: buildPrompt(params)},
      ],
      temperature:0.7,
      max_tokens:6000,
    }),
  });

  if (!res.ok) {
    var err = await res.json().catch(function(){return{};});
    if (res.status===429||res.status===503) throw new Error('RATE_LIMIT');
    throw new Error('GROQ_ERROR: '+(err.error&&err.error.message||res.status));
  }

  var data = await res.json();
  var text  = data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;
  if (!text) throw new Error('EMPTY_RESPONSE');
  return parseJsonResponse(text);
}

// ===== FUNCAO PRINCIPAL: Gemini → Groq → erro =====
export async function generateItinerary(params) {
  var hasGemini = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  var hasGroq   = !!process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!hasGemini&&!hasGroq) throw new Error('NO_API_KEY');

  if (hasGemini) {
    try {
      var result = await generateWithGemini(params);
      result._provider = 'gemini';
      return result;
    } catch(err) {
      if (err.message==='RATE_LIMIT'||err.message.includes('GEMINI_ERROR')) {
        if (!hasGroq) throw new Error('RATE_LIMIT');
      } else { throw err; }
    }
  }

  if (hasGroq) {
    try {
      var result = await generateWithGroq(params);
      result._provider = 'groq';
      return result;
    } catch(err) {
      if (err.message==='RATE_LIMIT') throw new Error('ALL_LIMITS_REACHED');
      throw err;
    }
  }

  throw new Error('ALL_LIMITS_REACHED');
}

// ===== HELPERS =====
export function mapsLink(mapQuery) {
  return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(mapQuery);
}
export function bookingLink(query) {
  var aid={ss:query};
  var id=process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID;
  if(id) aid.aid=id;
  return 'https://www.booking.com/searchresults.html?'+new URLSearchParams(aid).toString();
}
export function gygLink(city) {
  var base='https://www.getyourguide.com/s/?q='+encodeURIComponent(city);
  var id=process.env.NEXT_PUBLIC_GYG_AFFILIATE_ID;
  if(id) base+='&partner_id='+id;
  return base;
}
