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

  // ===== BEBE — reforçado =====
  family_baby:
    'Familia COM BEBE. ATENCAO TOTAL AS NECESSIDADES DO BEBE em cada sugestao:\n'
    + '- Hospedagem: busque EXCLUSIVAMENTE hoteis/pousadas que aceitam bebes, com berco/cama extra disponivel, '
    + 'trocador no quarto ou banheiro, e espaco seguro para o bebe se locomover\n'
    + '- Acessibilidade OBRIGATORIA: TODOS os locais devem ter acesso para carrinho de bebe (sem degraus, piso plano, rampas). '
    + 'Elimine qualquer sugestao com escadas ou terreno irregular\n'
    + '- Restaurantes: apenas estabelecimentos com cadeira alta para bebe (highchair), espaco para o carrinho e trocador no banheiro\n'
    + '- Atracoes: atividades curtas (max 1h30min), preferencialmente ao ar livre, sem fila longa, sem barulho intenso\n'
    + '- Horarios: todas as atividades devem terminar antes de 17h para respeitar a rotina do bebe\n'
    + '- Em CADA sugestao de hospedagem e restaurante, adicione a frase: "CONFIRME disponibilidade de estrutura para bebes antes de reservar"\n'
    + '- Inclua na dica diaria: farmacia ou UPA mais proximo como referencia de seguranca',

  family_senior:
    'Grupo COM IDOSOS. Priorize: acessibilidade total (rampas, elevadores, pouco desnivel), '
    + 'passeios maximos de 1km a pe, ritmo tranquilo com intervalos de descanso, '
    + 'restaurantes calmos com cadeiras confortaveis. Evite trilhas ingremes.',

  friends:
    'GRUPO DE AMIGOS. Priorize: atividades em grupo (buggy, arvorismo, passeio de barco), '
    + 'happy hours e bares locais animados, restaurantes para grupos grandes, '
    + 'opcoes custo-beneficio, programacao noturna adequada ao destino.',

  women_only:
    'Viagem EXCLUSIVA DE MULHERES — solo ou grupo feminino. SEGURANCA E BEM-ESTAR EM PRIMEIRO LUGAR:\n'
    + '- Hospedagem: prefira pousadas/hoteis no centro, com recepcao 24h, bem avaliados por mulheres viajantes\n'
    + '- Passeios: priorize atracoes movimentadas; evite trilhas isoladas sem guia\n'
    + '- Noite: apenas locais publicos, movimentados, bem iluminados e com boa reputacao\n'
    + '- Por dia: inclua 1 dica pratica de seguranca feminina (app recomendado, numero de emergencia local)\n'
    + '- Destinos internacionais: alerte sobre vestuario, comportamento e areas a evitar\n'
    + '- Valorize experiencias de conexao: tours guiados por mulheres locais, workshops criativos',

  // ===== PETS — novo perfil =====
  pets:
    'Viagem COM PETS (caes, gatos ou outros animais de estimacao). PET-FRIENDLY EM PRIMEIRO LUGAR em TODAS as sugestoes:\n'
    + '- Hospedagem: busque EXCLUSIVAMENTE hoteis, pousadas ou glamping que aceitam pets. '
    + 'Especifique que o local deve ter politica clara de aceitacao de animais\n'
    + '- Restaurantes: priorize estabelecimentos com area EXTERNA pet-friendly, varandas ou jardins onde animais sao bem-vindos. '
    + 'Evite restaurantes internos fechados onde pets nao sao permitidos\n'
    + '- Atracoes: prefira parques ao ar livre, praias pet-friendly, trilhas onde animais sao permitidos, '
    + 'jardins e espacos abertos. EVITE museus, shoppings, atrações internas onde pets nao entram\n'
    + '- Horarios: para passeios ao ar livre, sugira horarios frescos (antes das 10h ou apos as 16h) para o conforto do animal\n'
    + '- Em CADA sugestao de hospedagem, restaurante e atracao, adicione: "CONFIRME aceitacao de pets, porte permitido e restricoes antes de ir"\n'
    + '- Dica de seguranca: mencione o veterinario ou pet shop mais proximo do destino\n'
    + '- Inclua dicas de parques, pracas e espacos abertos onde o pet pode passear livremente sem coleira (se houver)',
};

// ===== PROMPT EM 2 FASES + FORA DA CAIXINHA =====
function buildPrompt({ destination, days, passengers, interests, budget, travelDate, travelProfile }) {
  var budgetLabel = budget === 'economico'
    ? 'economico (hostel, lanchonetes, custo baixo)'
    : budget === 'esbanjando'
    ? 'alto (hoteis bons, restaurantes premium, passeios pagos)'
    : 'moderado (pousadas confortaveis, restaurantes variados)';

  var profileCtx    = PROFILE_CONTEXT[travelProfile||'couple'] || PROFILE_CONTEXT.couple;
  var interestLabel = (interests&&interests.length) ? interests.join(', ') : 'gastronomia, natureza, cultura';
  var isBabyOrPet   = travelProfile === 'family_baby' || travelProfile === 'pets';

  var dateCtx = '';
  if (travelDate) {
    var d = new Date(travelDate+'T12:00:00');
    var months=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    dateCtx = 'Viagem em '+d.getDate()+' de '+months[d.getMonth()]+' de '+d.getFullYear()+'. Considere clima e eventos locais.';
  }

  var confirmationNote = isBabyOrPet
    ? '\n## AVISO DE CONFIRMACAO (OBRIGATORIO para este perfil)\n'
      + 'Em CADA sugestao de hospedagem, restaurante e atracao, inclua no campo "description" uma nota clara '
      + '(ex: "CONFIRME aceitacao de bebes/pets diretamente com o local antes de reservar — politicas podem mudar"). '
      + 'Isso e fundamental para evitar frustracao dos viajantes.\n'
    : '';

  return '## PERFIL DO VIAJANTE\n'
    + profileCtx + '\n\n'
    + '## PARAMETROS\n'
    + '- Destino: ' + destination + '\n'
    + '- Duracao: ' + days + ' dia(s)\n'
    + '- Passageiros: ' + passengers + '\n'
    + '- Orcamento: ' + budgetLabel + '\n'
    + '- Interesses: ' + interestLabel + '\n'
    + (dateCtx ? '- ' + dateCtx + '\n' : '')
    + confirmationNote
    + '\n'
    + '## FASE 1 — PLANEJAMENTO\n'
    + 'Defina UM TEMA UNICO para cada um dos ' + days + ' dias, cobrindo area geografica ou tipo de atividade diferente de ' + destination + '.\n'
    + 'NUNCA repita bairro, area ou tema entre os dias.\n'
    + '\n'
    + '## FASE 2 — EXECUCAO\n'
    + '\n'
    + '## DICAS FORA DA CAIXINHA (obrigatorio em todo roteiro)\n'
    + '- Equilibre: ~60% atracoes classicas + ~40% descobertas locais unicas (cafes escondidos, vistas secretas, mercados locais)\n'
    + '- Se um local vale o desvio mesmo sendo mais distante, sugira-o! Marque como "Vale o desvio" e explique por que\n'
    + '- A dica local ("tip") de cada dia deve ser especialmente autentica e inusitada\n'
    + '- Pense como um morador local apaixonado, nao como um guia turistico generico\n'
    + '\n'
    + '## REGRAS CRITICAS DE UNICIDADE\n'
    + '1. DIA 1 SOMENTE: mencione chegada e check-in UMA VEZ na manha.\n'
    + '2. DIAS 2 a ' + (days > 2 ? days-1 : 2) + ': NUNCA mencione check-in ou chegada.\n'
    + '3. DIA ' + days + ' (ultimo): mencione check-out e retorno apenas na manha.\n'
    + '4. Cada dia = area/tema diferente. Verificacao obrigatoria antes de cada dia.\n'
    + '5. Restaurantes: estabelecimento diferente em cada refeicao de cada dia.\n'
    + '6. Atracoes: cada local pode aparecer em apenas um dia.\n'
    + '7. Use apenas lugares REAIS e conhecidos de ' + destination + '.\n'
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
          morning: 'atividades da manha',
          morningAttractions: [{name:'Nome do Local',mapQuery:'Nome do Local, '+destination}],
          afternoon: 'atividades da tarde — inclua ao menos 1 descoberta local',
          afternoonAttractions: [{name:'Nome do Local',mapQuery:'Nome do Local, '+destination}],
          evening: 'atividades da noite',
          tip: 'dica local autentica e inusitada',
          meals: {
            breakfast:{description:'texto com preco e nota de confirmacao se bebe/pet',placeName:'Nome do Cafe',  mapQuery:'Nome do Cafe, '+destination},
            lunch:    {description:'texto com preco e nota de confirmacao se bebe/pet',placeName:'Nome do Rest.', mapQuery:'Nome do Rest., '+destination},
            dinner:   {description:'texto com preco e nota de confirmacao se bebe/pet',placeName:'Nome do Rest.', mapQuery:'Nome do Rest., '+destination},
          },
          accommodation:{
            description:'nome, preco por noite e nota de confirmacao se bebe/pet',
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
    method:'POST', headers:{'Content-Type':'application/json'},
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
    var err=await res.json().catch(function(){return{};});
    if(res.status===429||res.status===503) throw new Error('RATE_LIMIT');
    throw new Error('GEMINI_ERROR: '+(err.error&&err.error.message||res.status));
  }
  var data=await res.json();
  var text=data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts&&data.candidates[0].content.parts[0]&&data.candidates[0].content.parts[0].text;
  if(!text) throw new Error('EMPTY_RESPONSE');
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
        {role:'system', content:'Voce e um especialista em turismo. Responda APENAS com JSON valido. Nao repita lugares entre os dias. Para perfis bebe/pets, inclua avisos de confirmacao em cada sugestao.'},
        {role:'user',   content: buildPrompt(params)},
      ],
      temperature:0.75, max_tokens:6000,
    }),
  });
  if (!res.ok) {
    var err=await res.json().catch(function(){return{};});
    if(res.status===429||res.status===503) throw new Error('RATE_LIMIT');
    throw new Error('GROQ_ERROR: '+(err.error&&err.error.message||res.status));
  }
  var data=await res.json();
  var text=data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;
  if(!text) throw new Error('EMPTY_RESPONSE');
  return parseJsonResponse(text);
}

// ===== FUNCAO PRINCIPAL =====
export async function generateItinerary(params) {
  var hasGemini = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  var hasGroq   = !!process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!hasGemini&&!hasGroq) throw new Error('NO_API_KEY');

  if (hasGemini) {
    try {
      var result=await generateWithGemini(params);
      result._provider='gemini'; return result;
    } catch(err) {
      if(err.message==='RATE_LIMIT'||err.message.includes('GEMINI_ERROR')){
        if(!hasGroq) throw new Error('RATE_LIMIT');
      } else { throw err; }
    }
  }
  if (hasGroq) {
    try {
      var result=await generateWithGroq(params);
      result._provider='groq'; return result;
    } catch(err) {
      if(err.message==='RATE_LIMIT') throw new Error('ALL_LIMITS_REACHED');
      throw err;
    }
  }
  throw new Error('ALL_LIMITS_REACHED');
}

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
