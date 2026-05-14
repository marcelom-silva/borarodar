// src/lib/ai.js
var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Contexto por perfil de viajante
var PROFILE_CONTEXT = {
  solo: 'O viajante esta SOZINHO. Priorize: flexibilidade de horarios, hospedagens que facilitem conhecer outras pessoas (hostels, pousadas compartilhadas), areas seguras para solo traveler, opcoes economicas, atividades que podem ser feitas individualmente. Mencione dicas de seguranca relevantes.',
  couple: 'E um CASAL. Priorize: restaurantes com ambiente romantico e intimo, mirantes e pontos para assistir ao por do sol juntos, passeios a dois (trilhas leves, barco, spa), hospedagem mais aconchegante como pousadas boutique. Sugira experiencias memoraveis e unicas.',
  family_baby: 'Viaja uma FAMILIA COM BEBE. Priorize: locais totalmente acessiveis para carrinho de bebe (sem escadas, piso plano), restaurantes com espaço para acomodo do bebe e trocadores, atividades curtas de no maximo 1h30min, horarios de atividades mais cedo (antes de 16h), evite calor intenso e locais muito barulhentos, mencione se ha fraldario disponivel.',
  family_senior: 'O GRUPO INCLUI IDOSOS. Priorize: locais com boa acessibilidade (rampas, elevadores, pouco desnivel), restaurantes com ambiente calmo e cardapio variado, passeios de no maximo 1km a pe, ritmo tranquilo com bastante tempo de descanso, evite trilhas com subidas ingreme ou superficies irregulares. Mencione opcoes de transporte alternativo (van, carrinho eletrico).',
  friends: 'E um GRUPO DE AMIGOS. Priorize: atividades em grupo que criam momentos memoraveis (buggy, quadriciclo, arvorismo, passeios de barco), happy hours e bares locais com boa musica, restaurantes com espaco para grupos grandes, opcoes custo-beneficio, atividades de aventura (se o destino oferecer), programacao noturna adequada ao destino.',
};

export async function generateItinerary({ destination, days, passengers, interests, budget, travelDate, travelProfile }) {
  var apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_KEY_MISSING');

  var budgetLabel = budget === 'economico'
    ? 'economico (hostel ou pousada simples, lanchonetes e restaurantes populares, evitar gastos desnecessarios)'
    : budget === 'esbanjando'
    ? 'alto (hoteis e pousadas de qualidade, restaurantes selecionados, passeios premium)'
    : 'moderado (pousadas confortaveis, restaurantes variadoas, equilibrando custo e qualidade)';

  var profileContext = PROFILE_CONTEXT[travelProfile || 'couple'] || PROFILE_CONTEXT.couple;
  var interestLabel  = (interests && interests.length) ? interests.join(', ') : 'gastronomia, natureza, cultura';

  // Formatacao da data para contexto de clima
  var dateContext = '';
  if (travelDate) {
    var d = new Date(travelDate + 'T12:00:00');
    var months = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    dateContext = 'A viagem comeca em ' + d.getDate() + ' de ' + months[d.getMonth()] + ' de ' + d.getFullYear() + '. Considere o clima e eventos locais dessa epoca.';
  }

  var prompt = 'Voce e um especialista em turismo brasileiro com conhecimento profundo sobre ' + destination + '.\n\n'
    + '## PERFIL DO VIAJANTE\n'
    + profileContext + '\n\n'
    + '## PARAMETROS DA VIAGEM\n'
    + '- Destino: ' + destination + '\n'
    + '- Duracao: ' + days + ' dia(s)\n'
    + '- Passageiros: ' + passengers + '\n'
    + '- Orcamento: ' + budgetLabel + '\n'
    + '- Interesses: ' + interestLabel + '\n'
    + (dateContext ? '- ' + dateContext + '\n' : '')
    + '\n'
    + '## REGRAS OBRIGATORIAS (siga TODAS sem excecao)\n'
    + '1. DIA 1 APENAS: mencione "chegada" e "check-in" UMA UNICA VEZ na manha do Dia 1.\n'
    + '2. DIAS 2 em diante: NUNCA mencione check-in, chegada, acomodacao inicial. Comece DIRETAMENTE com as atividades do dia.\n'
    + '3. ULTIMO DIA (' + days + '): mencione check-out e preparacao para retorno na MANHA do ultimo dia.\n'
    + '4. Cada dia deve explorar uma AREA ou TEMA DIFERENTE de ' + destination + '. Nunca repita.\n'
    + '5. Cada refeicao deve ser em um restaurante DIFERENTE. Nunca repita o mesmo.\n'
    + '6. Cada atracao deve aparecer apenas UMA VEZ em todo o roteiro.\n'
    + '7. Os titulos dos dias devem ser variados e criativos, refletindo o tema do dia.\n'
    + '8. Use APENAS lugares REAIS e conhecidos em ' + destination + '.\n'
    + '9. Inclua precos medios realistas para ' + destination + '.\n'
    + '\n'
    + 'Retorne SOMENTE um JSON valido (sem markdown, sem texto extra) com esta estrutura:\n'
    + JSON.stringify({
        destination: destination,
        summary: 'frase curta sobre o destino',
        bestPeriod: 'melhor epoca para visitar',
        totalBudget: 'estimativa total em R$ para ' + passengers + ' pessoa(s) por ' + days + ' dia(s)',
        days: [{
          day: 1,
          title: 'titulo criativo e unico do dia',
          morning: 'descricao das atividades da manha (check-in apenas no dia 1)',
          morningAttractions: [{ name: 'Nome do Local', mapQuery: 'Nome do Local, ' + destination }],
          afternoon: 'descricao das atividades da tarde',
          afternoonAttractions: [{ name: 'Nome do Local', mapQuery: 'Nome do Local, ' + destination }],
          evening: 'descricao do fim de tarde e noite',
          tip: 'dica local que turistas nao costumam saber',
          meals: {
            breakfast: { description: 'texto com preco', placeName: 'Nome do Cafe', mapQuery: 'Nome do Cafe, ' + destination },
            lunch:     { description: 'texto com preco', placeName: 'Nome do Rest.', mapQuery: 'Nome do Rest., ' + destination },
            dinner:    { description: 'texto com preco', placeName: 'Nome do Rest.', mapQuery: 'Nome do Rest., ' + destination },
          },
          accommodation: {
            description: 'nome e preco por noite',
            placeName: 'Nome da Pousada',
            mapQuery: 'Nome da Pousada, ' + destination,
            bookingQuery: destination,
          },
        }],
      }, null, 0);

  var res = await fetch(GEMINI_URL + '?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
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
    var errData = await res.json().catch(function() { return {}; });
    if (res.status === 429) throw new Error('RATE_LIMIT');
    throw new Error('GEMINI_ERROR: ' + (errData.error && errData.error.message || res.status));
  }

  var data = await res.json();
  var text  = data.candidates
    && data.candidates[0]
    && data.candidates[0].content
    && data.candidates[0].content.parts
    && data.candidates[0].content.parts[0]
    && data.candidates[0].content.parts[0].text;
  if (!text) throw new Error('EMPTY_RESPONSE');

  var clean = text.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/,'').trim();
  try {
    return JSON.parse(clean);
  } catch (_) {
    var match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('JSON_PARSE_ERROR');
  }
}

// Link Google Maps
export function mapsLink(mapQuery) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapQuery);
}

// Link Booking.com (placeholder afiliado — substituir quando receber ID)
export function bookingLink(query) {
  var aid    = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID;
  var params = { ss: query };
  if (aid) params.aid = aid;
  return 'https://www.booking.com/searchresults.html?' + new URLSearchParams(params).toString();
}

// Link GetYourGuide (placeholder afiliado — substituir quando receber ID)
export function gygLink(city) {
  var partnerId = process.env.NEXT_PUBLIC_GYG_AFFILIATE_ID;
  var base = 'https://www.getyourguide.com/s/?q=' + encodeURIComponent(city);
  if (partnerId) base += '&partner_id=' + partnerId;
  return base;
}
