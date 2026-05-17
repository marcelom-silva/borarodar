// src/lib/ai.js
// Provedor 1: Google Gemini 2.0 Flash  (1.500 req/dia gratis)
// Provedor 2: Groq Llama 3.3 70B       (14.400 req/dia gratis — fallback automatico)

var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
var GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
var GROQ_MODEL = 'llama-3.3-70b-versatile';

// ===== PERFIS DE VIAJANTE =====
var PROFILE_CONTEXT = {
  solo:
    'O viajante esta SOZINHO. Priorize: areas seguras e movimentadas, hostels com areas sociais, '
    + 'opcoes economicas, dicas de seguranca para viajante solo.',
  couple:
    'E um CASAL. Priorize: restaurantes romanticos, mirantes ao por do sol, '
    + 'atividades para dois, pousadas boutique aconchegantes.',
  family_baby:
    'Familia COM BEBE. ATENCAO TOTAL:\n'
    + '- Hospedagem: APENAS locais com berco disponivel, trocador e acesso de carrinho sem escadas\n'
    + '- Restaurantes: highchair obrigatorio, trocador, espaco para carrinho\n'
    + '- Atracoes: max 1h30min, ar livre, sem fila, antes das 17h\n'
    + '- Em CADA sugestao adicione: "CONFIRME estrutura para bebes antes de reservar"',
  family_senior:
    'Grupo COM IDOSOS. Acessibilidade total, passeios curtos (<1km), restaurantes tranquilos, sem trilhas ingremes.',
  friends:
    'GRUPO DE AMIGOS. Atividades em grupo, happy hour, restaurantes para grupos, programacao animada.',
  women_only:
    'Viagem EXCLUSIVA DE MULHERES. SEGURANCA PRIMEIRO:\n'
    + '- Hospedagem central com recepcao 24h, bem avaliada por mulheres\n'
    + '- Noite: apenas locais movimentados e bem iluminados\n'
    + '- Inclua 1 dica de seguranca feminina por dia\n'
    + '- Destinos internacionais: alerte sobre vestuario e areas a evitar',
  pets:
    'Viagem COM PETS. PET-FRIENDLY EM TUDO:\n'
    + '- Hospedagem: APENAS locais que aceitam pets (especifique porte)\n'
    + '- Restaurantes: area externa pet-friendly obrigatoria\n'
    + '- Atracoes: parques, praias e trilhas onde pets sao permitidos\n'
    + '- Em CADA sugestao adicione: "CONFIRME aceitacao de pets, porte e restricoes antes de ir"',
  accessibility:
    'Viagem com ACESSIBILIDADE. MOBILIDADE REDUZIDA / CADEIRA DE RODAS:\n'
    + '- Hospedagem: APENAS locais com rampa ou elevador, banheiro adaptado e quarto acessivel\n'
    + '- Restaurantes: nivel teres, sem degraus, espaco para cadeira de rodas\n'
    + '- Atracoes: calcadas planas, rampas, sem trilhas ingremes — priorize areas revitalizadas\n'
    + '- Em CADA sugestao adicione: "CONFIRME acessibilidade antes de reservar"',
  lgbt_friendly:
    'Viagem LGBT+ FRIENDLY. INCLUSAO E SEGURANCA:\n'
    + '- Hospedagem: APENAS locais com politica inclusiva e boas avaliacoes de hospedes LGBT+\n'
    + '- Bares/restaurantes: estabelecimentos reconhecidamente inclusivos e acolhedores\n'
    + '- Destinos internacionais: alerte sobre leis locais e nivel de aceitacao cultural\n'
    + '- Inclua 1 evento, festival ou point LGBT+ do destino por dia quando houver\n'
    + '- Seguranca: aponte areas ou horarios que exigem maior discricao',
  esporte_aventura:
    'Viagem ESPORTE E AVENTURA. ROTEIRO ATIVO:\n'
    + '- Ao menos 1 atividade fisica ou radical por dia: trilha, escalada, mergulho, ciclismo, rafting, parapente\n'
    + '- Hospedagem: pousadas com estrutura para bikes/equipamentos, cafe cedo, secagem de roupas\n'
    + '- Restaurantes: opcoes proteicas, open early, cardapio para atletas\n'
    + '- Verifique eventos esportivos (maratonas, triatlons, campeonatos) no destino na data da viagem\n'
    + '- Em cada atividade inclua: nivel de dificuldade, equipamento necessario e operadora credenciada local\n'
    + '- Alertas: condicoes climaticas e tecnicas especificas para cada modalidade',
};

// ===== PROMPT DO ROTEIRO (2 fases + seguranca + fora da caixinha) =====
function buildItineraryPrompt({ destination, days, passengers, interests, budget, travelDate, travelProfile }) {
  var budgetLabel = budget==='economico' ? 'economico (hostel, lanchonetes)'
    : budget==='esbanjando' ? 'alto (hoteis, restaurantes premium)'
    : 'moderado (pousadas, restaurantes variados)';
  var profileCtx    = PROFILE_CONTEXT[travelProfile||'couple'] || PROFILE_CONTEXT.couple;
  var interestLabel = (interests&&interests.length) ? interests.join(', ') : 'gastronomia, natureza, cultura';
  var isBabyOrPet   = travelProfile==='family_baby'||travelProfile==='pets';

  var dateCtx='';
  if (travelDate) {
    var d=new Date(travelDate+'T12:00:00');
    var months=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    dateCtx='Viagem em '+d.getDate()+' de '+months[d.getMonth()]+' de '+d.getFullYear()+'.';
  }

  return '## PERFIL\n'+profileCtx+'\n\n'
    +'## PARAMETROS\n'
    +'- Destino: '+destination+'\n'
    +'- Duracao: '+days+' dia(s) | Passageiros: '+passengers+' | Orcamento: '+budgetLabel+'\n'
    +'- Interesses: '+interestLabel+'\n'
    +(dateCtx?'- '+dateCtx+'\n':'')
    +(isBabyOrPet?'\n## CONFIRMACAO OBRIGATORIA\nEm CADA sugestao de hospedagem/restaurante/atracao inclua aviso de confirmacao para bebe/pets.\n':'')
    +'\n## ALERTAS DE SEGURANCA (OBRIGATORIO)\n'
    +'Para '+destination+', identifique e inclua no campo securityAlerts:\n'
    +'- Trechos ou horarios perigosos na rota (ex: nao viajar a noite em determinadas rodovias)\n'
    +'- Areas com alto indice de criminalidade ou dominadas por organizacoes criminosas\n'
    +'- Alertas especificos para estrangeiros se destino internacional\n'
    +'- Se nao houver alertas relevantes, retorne array vazio\n'
    +'\n## FASE 1 — PLANEJAMENTO\nDefina tema unico para cada dia. Nunca repita bairro ou area.\n'
    +'\n## FASE 2 — EXECUCAO\n'
    +'\n## DICAS FORA DA CAIXINHA (obrigatorio)\n'
    +'- 60% classicos + 40% descobertas locais unicas\n'
    +'- Se um local vale o desvio mesmo sendo distante, marque como "Vale o desvio"\n'
    +'- Dica diaria: algo que turistas raramente descobrem\n'
    +'\n## REGRAS DE UNICIDADE\n'
    +'1. Dia 1: check-in UMA vez.\n2. Dias 2+: sem check-in.\n3. Ultimo dia: check-out na manha.\n'
    +'4. Cada dia = area diferente. Sem repeticao de restaurantes ou atracoes.\n'
    +'5. Apenas lugares REAIS de '+destination+'.\n\n'
    +'Retorne SOMENTE JSON valido:\n'
    +JSON.stringify({
      destination,summary:'frase sobre o destino',bestPeriod:'melhor epoca',
      totalBudget:'estimativa total R$ para '+passengers+' pessoa(s) por '+days+' dia(s)',
      securityAlerts:[{level:'alto|medio|info', msg:'descricao do alerta'}],
      days:[{
        day:1,title:'titulo do dia',
        morning:'manha',morningAttractions:[{name:'Local',mapQuery:'Local, '+destination}],
        afternoon:'tarde',afternoonAttractions:[{name:'Local',mapQuery:'Local, '+destination}],
        evening:'noite',tip:'dica local autentica',
        meals:{
          breakfast:{description:'texto+preco',placeName:'Cafe',mapQuery:'Cafe, '+destination},
          lunch:{description:'texto+preco',placeName:'Rest.',mapQuery:'Rest., '+destination},
          dinner:{description:'texto+preco',placeName:'Rest.',mapQuery:'Rest., '+destination},
        },
        accommodation:{description:'nome+preco',placeName:'Pousada',mapQuery:'Pousada, '+destination,bookingQuery:destination},
      }],
    },null,0);
}

// ===== PROMPT CHECKLIST =====
function buildChecklistPrompt({ destination, travelProfile, dateFrom, dateTo }) {
  var profileLabel = {
    solo:'viajante solo',couple:'casal',family_baby:'familia com bebe',
    family_senior:'grupo com idosos',friends:'grupo de amigos',
    women_only:'mulheres viajando sozinhas',pets:'viagem com pets',
    accessibility:'viagem com acessibilidade',lgbt_friendly:'viagem LGBT friendly',esporte_aventura:'esporte e aventura',
  }[travelProfile||'couple'] || 'casal';

  return 'Voce e um especialista em viagens de carro internacionais e nacionais.\n\n'
    +'Gere uma CHECKLIST COMPLETA para esta viagem:\n'
    +'- Destino: '+destination+'\n'
    +'- Perfil: '+profileLabel+'\n'
    +'- Periodo: '+(dateFrom||'flexivel')+(dateTo?' a '+dateTo:'')+'\n\n'
    +'INSTRUCOES CRITICAS:\n'
    +'1. Detecte se o destino e INTERNACIONAL (fora do Brasil)\n'
    +'2. ARGENTINA: RG atualizado ou Passaporte, Carta Verde (seguro obrigatorio), extintor, triangulo de sinalizacao, colete refletivo, macaco e chave de roda, pneu estepe em boas condicoes, permissao para menores se viajarem sem um dos pais\n'
    +'3. CHILE: SOAP EX (seguro obrigatorio — adquira na fronteira), documentos do veiculo, PROIBIDO entrar com frutas/verduras frescas, carne e laticinios\n'
    +'4. BOLIVIA: Dificuldade para abastecer como estrangeiro (leve galao de reserva de combustivel), altitude (altiplano acima de 3.500m — leve oxigenio), documentos traduzidos podem ser exigidos\n'
    +'5. PARAGUAI: RG suficiente (sem passaporte), limite de compras na declaracao aduaneira, nota fiscal de bens\n'
    +'6. URUGUAI: SOAT (seguro obrigatorio), pneu reserva em boas condicoes, documentos do veiculo\n'
    +'7. MEXICO/AMERICA CENTRAL: Permiso de Importacion Temporal (TIP) para o veiculo, seguro mexicano obrigatorio, evitar estados dominados por carteis\n'
    +'8. PETS: Certidao de saude veterinaria (max 10 dias antes), vacina contra raiva atualizada, microchip, certificado de vacinacao, CRMV do veterinario, exigencias especificas do pais destino\n'
    +'9. BEBE/MENOR: Cadeirinha obrigatoria (conferir norma do pais), certidao de nascimento se desacompanhado de um dos pais, autorizacao notarial se viajando com terceiros\n'
    +'10. Inclua ALERTAS DE SEGURANCA especificos: trechos perigosos, horarios a evitar, areas de risco no destino e na rota\n\n'
    +'Retorne SOMENTE JSON valido:\n'
    +JSON.stringify({
      destination,isInternational:false,
      securityAlerts:[{level:'alto|medio|info',msg:'descricao',route:true}],
      borderRequirements:{country:'',items:[{text:'item',required:true,note:'obs'}]},
      categories:[{
        id:'documentos',title:'Documentos Pessoais',icon:'📋',priority:'alta',
        items:[{text:'item',required:true,checked:false,note:'obs opcional'}],
      }],
    },null,0)
    +'\nCATEGORIAS OBRIGATORIAS: documentos, carro, roupas, medicamentos, eletronicos, emergencia'
    +'\nCATEGORIAS CONDICIONAIS: fronteira (se internacional), pets (se pets), bebe (se family_baby)'
    +'\nSEMPRE inclua itens de segurança veicular: extintor, triangulo, macaco, chave de roda, lanterna, cabo de forca';
}

// ===== PROMPT DESTINO SURPRESA =====
function buildSurprisePrompt({ departure, budget, travelProfile, dateFrom }) {
  var profileLabel = {
    solo:'solo',couple:'casal',family_baby:'familia com bebe',
    family_senior:'grupo com idosos',friends:'grupo de amigos',
    women_only:'mulheres',pets:'com pets',
    accessibility:'acessibilidade',lgbt_friendly:'LGBT friendly',esporte_aventura:'esporte e aventura',
  }[travelProfile||'couple'] || 'casal';

  return 'Especialista em road trips. Sugira 3 destinos de viagem de carro saindo de '+departure+'.\n\n'
    +'Perfil: '+profileLabel+' | Orcamento: '+budget+' | Periodo: '+(dateFrom||'flexivel')+'\n\n'
    +'REGRAS:\n'
    +'- 1 destino PROXIMO: max 3h de viagem, ideal para fim de semana\n'
    +'- 1 destino MEDIO: 3 a 6h, ideal para 3-4 dias\n'
    +'- 1 destino AVENTURA: +6h ou internacional, experiencia unica\n'
    +'- Cada destino deve ser diferente e alinhado com o perfil\n'
    +'- Para pets: todos devem ter opcoes pet-friendly confirmadas\n'
    +'- Para bebe: todos devem ter boa infraestrutura\n\n'
    +'Retorne SOMENTE JSON valido (array com 3 objetos):\n'
    +JSON.stringify([{
      type:'proximo|medio|aventura',emoji:'🏔️',
      destination:'Nome da Cidade, Estado/Pais',
      driveTime:'2h30',distanceKm:180,
      why:'por que vale a pena — 2 frases',
      highlight:'o grande atrativo unico deste destino',
      bestFor:'para quem e ideal',
      tip:'dica local exclusiva',
    }],null,0);
}

// ===== HELPERS DE CHAMADA DA API =====
function parseJson(text) {
  var clean=text.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/,'').trim();
  try{return JSON.parse(clean);}catch(_){
    var m=clean.match(/[\[{][\s\S]*/);
    if(m) try{return JSON.parse(m[0].replace(/[\s\S]*?([\[{])/,'$1'));}catch(_){}
    throw new Error('JSON_PARSE_ERROR');
  }
}

async function callGemini(promptText) {
  var apiKey=process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if(!apiKey) throw new Error('KEY_MISSING');
  var res=await fetch(GEMINI_URL+'?key='+apiKey,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      contents:[{parts:[{text:promptText}]}],
      generationConfig:{temperature:0.8,maxOutputTokens:8000},
      safetySettings:[
        {category:'HARM_CATEGORY_HARASSMENT',threshold:'BLOCK_NONE'},
        {category:'HARM_CATEGORY_HATE_SPEECH',threshold:'BLOCK_NONE'},
        {category:'HARM_CATEGORY_SEXUALLY_EXPLICIT',threshold:'BLOCK_NONE'},
        {category:'HARM_CATEGORY_DANGEROUS_CONTENT',threshold:'BLOCK_NONE'},
      ],
    }),
  });
  if(!res.ok){var e=await res.json().catch(function(){return{};});if(res.status===429||res.status===503)throw new Error('RATE_LIMIT');throw new Error('GEMINI_ERROR: '+(e.error&&e.error.message||res.status));}
  var data=await res.json();
  var text=data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts&&data.candidates[0].content.parts[0]&&data.candidates[0].content.parts[0].text;
  if(!text) throw new Error('EMPTY_RESPONSE');
  return parseJson(text);
}

async function callGroq(promptText,systemMsg) {
  var apiKey=process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if(!apiKey) throw new Error('KEY_MISSING');
  var res=await fetch(GROQ_URL,{
    method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},
    body:JSON.stringify({
      model:GROQ_MODEL,
      messages:[{role:'system',content:systemMsg||'Responda APENAS com JSON valido. Sem markdown.'},{role:'user',content:promptText}],
      temperature:0.75,max_tokens:6000,
    }),
  });
  if(!res.ok){var e=await res.json().catch(function(){return{};});if(res.status===429||res.status===503)throw new Error('RATE_LIMIT');throw new Error('GROQ_ERROR: '+(e.error&&e.error.message||res.status));}
  var data=await res.json();
  var text=data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;
  if(!text) throw new Error('EMPTY_RESPONSE');
  return parseJson(text);
}

async function callWithFallback(promptText,systemMsg) {
  var hasGemini=!!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  var hasGroq  =!!process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if(!hasGemini&&!hasGroq) throw new Error('NO_API_KEY');

  if(hasGemini){
    try{var r=await callGemini(promptText);r._provider='gemini';return r;}
    catch(e){if(e.message!=='RATE_LIMIT'&&!e.message.includes('GEMINI_ERROR'))throw e;if(!hasGroq)throw new Error('RATE_LIMIT');}
  }
  if(hasGroq){
    try{var r=await callGroq(promptText,systemMsg);r._provider='groq';return r;}
    catch(e){if(e.message==='RATE_LIMIT')throw new Error('ALL_LIMITS_REACHED');throw e;}
  }
  throw new Error('ALL_LIMITS_REACHED');
}

// ===== EXPORTS PUBLICOS =====

export async function generateItinerary(params) {
  return callWithFallback(
    buildItineraryPrompt(params),
    'Especialista em turismo. JSON valido apenas. Nunca repita lugares entre os dias. Inclua alertas de seguranca.'
  );
}

export async function generateChecklist(params) {
  return callWithFallback(
    buildChecklistPrompt(params),
    'Especialista em viagens internacionais e documentacao. JSON valido apenas. Inclua alertas de seguranca.'
  );
}

export async function generateSurpriseDestinations(params) {
  return callWithFallback(
    buildSurprisePrompt(params),
    'Especialista em road trips. Retorne um array JSON com exatamente 3 destinos. Sem texto extra.'
  );
}

// ===== LINK HELPERS =====
export function mapsLink(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);}
export function bookingLink(q){var p={ss:q};var id=process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID;if(id)p.aid=id;return 'https://www.booking.com/searchresults.html?'+new URLSearchParams(p);}
export function gygLink(c){var b='https://www.getyourguide.com/s/?q='+encodeURIComponent(c);var id=process.env.NEXT_PUBLIC_GYG_AFFILIATE_ID;if(id)b+='&partner_id='+id;return b;}
