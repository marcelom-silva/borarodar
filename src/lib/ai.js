// src/lib/ai.js
// Provedor 1: Google Gemini 2.0 Flash  (1.500 req/dia gratis)
// Provedor 2: Groq Llama 3.3 70B       (14.400 req/dia gratis — fallback automatico)

var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
var GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
var GROQ_MODEL = 'llama-3.3-70b-versatile';

// ===== CONTEXTO POR PERFIL =====
var PROFILE_CONTEXT = {
  solo:
    'O viajante esta SOZINHO. Priorize: areas seguras e movimentadas, atividades que permitem conhecer pessoas, '
    + 'hostels com areas sociais, opcoes economicas, dicas de seguranca para viajante solo.',

  couple:
    'E um CASAL. Priorize: restaurantes romanticos e intimistas, mirantes para assistir ao por do sol, '
    + 'atividades para dois (trilha leve, barco, spa), pousadas boutique aconchegantes.',

  family_baby:
    'Familia COM BEBE. Priorize EXCLUSIVAMENTE: locais 100% acessiveis para carrinho (sem escadas, piso plano), '
    + 'restaurantes com trocador e espaco para bebe, atividades curtas (max 1h30min), horarios diurnos (terminar antes de 17h), '
    + 'evite barulho intenso, calor extremo e locais superlotados.',

  family_senior:
    'Grupo COM IDOSOS. Priorize: acessibilidade total (rampas, elevadores, pouco desnivel), '
    + 'passeios maximos de 1km a pe, ritmo tranquilo com intervalos de descanso, '
    + 'restaurantes calmos com cadeiras confortaveis, evite trilhas íngremes ou superficies irregulares.',

  friends:
    'GRUPO DE AMIGOS. Priorize: atividades em grupo (buggy, arvorismo, passeio de barco), '
    + 'happy hours e bares locais com boa musica, restaurantes para grupos grandes, '
    + 'opcoes custo-beneficio, programacao noturna animada adequada ao destino.',

  // ===== NOVO: VIAGEM SO DE MULHERES =====
  women_only:
    'Viagem EXCLUSIVA DE MULHERES — solo ou grupo feminino. '
    + 'SEGURANCA E BEM-ESTAR EM PRIMEIRO LUGAR em todas as sugestoes:\n'
    + '- Hospedagem: prefira pousadas/hoteis no centro da cidade, com recepcao 24h, bem avaliados especificamente por mulheres viajantes\n'
    + '- Passeios: priorize atracoes movimentadas e com presenca de outros turistas; evite trilhas isoladas sem guia\n'
    + '- Noite: sugira apenas locais publicos, movimentados, bem iluminados e com boa reputacao de seguranca\n'
    + '- Por dia, inclua 1 dica pratica de seguranca feminina (ex: app de seguranca recomendado, numero de emergencia local, dica de postura em areas movimentadas)\n'
    + '- Se destino internacional com costumes conservadores: alerte sobre vestuario adequado, comportamento esperado e areas a evitar\n'
    + '- Sugira cafes, restaurantes e espacos reconhecidos por serem acolhedores para mulheres\n'
    + '- Valorize experiencias de conexao: tours guiados por mulheres locais, mercados de artesas, workshops criativos\n'
    + '- Mencione o contato do Consulado ou Embaixada se destino internacional',
};

// ===== PROMPT EM 2 FASES + DICAS FORA DA CAIXINHA =====
function buildPrompt({ destination, days, passengers, interests, budget, travelDate, travelProfile }) {
  var budgetLabel = budget === 'economico'
    ? 'economico (hostel, lanchonetes, custo baixo)'
    : budget === 'esbanjando'
    ? 'alto (hoteis bons, restaurantes premium, passeios pagos)'
    : 'moderado (pousadas confortaveis, restaurantes variados)';

  var profileCtx    = PROFILE_CONTEXT[travelProfile||'couple'] || PROFILE_CONTEXT.couple;
  var interestLabel = (interests&&interests.length) ? interests.join(', ') : 'gastronomia, natureza, cultura';

  var dateCtx = '';
  if (travelDate) {
    var d = new Date(travelDate+'T12:00:00');
    var months = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    dateCtx = 'Viagem em '+d.getDate()+' de '+months[d.getMonth()]+' de '+d.getFullYear()+'. Considere clima e eventos locais.';
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
    + '## FASE 1 — PLANEJAMENTO (obrigatorio antes de escrever)\n'
    + 'Defina UM TEMA UNICO para cada um dos ' + days + ' dias, cobrindo area geografica ou tipo de atividade diferente.\n'
    + 'NUNCA repita bairro, area ou tema entre os dias.\n'
    + '\n'
    + '## FASE 2 — EXECUCAO (siga os temas e use lugares unicos por dia)\n'
    + '\n'
    + '## DICAS FORA DA CAIXINHA (obrigatorio em todo roteiro)\n'
    + 'Para CADA DIA do roteiro:\n'
    + '- Equilibre: ~60% atracoes classicas que todo turista deve ver + ~40% descobertas locais que fazem a viagem ser unica\n'
    + '- Inclua pelo menos 1 experiencia inusitada: um cafe escondido, uma vista que guias nao mencionam, um mercado local, '
    + 'uma atividade autentica, um ponto pouco conhecido mas incrivel\n'
    + '- Se houver um local que vale a pena mesmo sendo mais distante, sugira-o! Indique que "vale o desvio" e explique por que\n'
    + '- Pense como um MORADOR LOCAL apaixonado pela cidade, nao como um guia turistico generico\n'
    + '- A dica local ("tip") deve ser ESPECIALMENTE autentica e inusitada — algo que turistas raramente descobrem sozinhos\n'
    + '\n'
    + '## REGRAS CRITICAS DE UNICIDADE\n'
    + '1. DIA 1 SOMENTE: mencione chegada e check-in UMA VEZ na manha.\n'
    + '2. DIAS 2 a ' + (days-1>1?days-1:2) + ': NUNCA mencione check-in, chegada ou acomodacao inicial.\n'
    + '3. DIA ' + days + ' (ultimo): mencione check-out e retorno apenas na manha.\n'
    + '4. CADA DIA = AREA/TEMA DIFERENTE. Verificacao obrigatoria antes de cada dia.\n'
    + '5. RESTAURANTES: estabelecimento DIFERENTE em cada refeicao de cada dia.\n'
    + '6. ATRACOES: cada local pode aparecer em APENAS UM DIA.\n'
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
          title: 'titulo unico refletindo o tema do dia',
          morning: 'atividades da manha (check-in apenas no dia 1)',
          morningAttractions: [{name:'Nome do Local',mapQuery:'Nome do Local, '+destination}],
          afternoon: 'atividades da tarde — inclua ao menos 1 descoberta local',
          afternoonAttractions: [{name:'Nome do Local',mapQuery:'Nome do Local, '+destination}],
          evening: 'atividades da noite',
          tip: 'dica local autentica e inusitada — algo que turistas raramente descobrem',
          meals: {
            breakfast:{description:'texto com preco',placeName:'Nome do Cafe',  mapQuery:'Nome do Cafe, '+destination},
            lunch:    {description:'texto com preco',placeName:'Nome do Rest.', mapQuery:'Nome do Rest., '+destination},
            dinner:   {description:'texto com preco',placeName:'Nome do Rest.', mapQuery:'Nome do Rest., '+destination},
          },
          accommodation:{
            description:'nome e preco por noite',
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
      generationConfig:{temperature:0.8, maxOutputTokens:8000},
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
        {role:'system', content:'Voce e um especialista em turismo brasileiro. Responda APENAS com JSON valido. Nunca repita restaurantes, hoteis ou atracoes entre os dias. Inclua sempre dicas locais autenticas e inusitadas.'},
        {role:'user',   content: buildPrompt(params)},
      ],
      temperature:0.75,
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
  var p={ss:query}; var id=process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID; if(id) p.aid=id;
  return 'https://www.booking.com/searchresults.html?'+new URLSearchParams(p).toString();
}
export function gygLink(city) {
  var base='https://www.getyourguide.com/s/?q='+encodeURIComponent(city);
  var id=process.env.NEXT_PUBLIC_GYG_AFFILIATE_ID; if(id) base+='&partner_id='+id;
  return base;
}
