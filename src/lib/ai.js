// src/lib/ai.js
var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export async function generateItinerary({ destination, days, passengers, interests, budget, travelDate }) {
  var apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_KEY_MISSING');

  var budgetLabel = budget === 'economico'
    ? 'economico (hostel, lanchonetes, evitar gastos desnecessarios)'
    : budget === 'esbanjando'
    ? 'alto (hoteis bons, restaurantes selecionados, passeios pagos)'
    : 'moderado (pousadas, restaurantes comuns)';

  var dateHint = travelDate
    ? 'O viajante vai entre ' + travelDate + '.'
    : '';

  var interestLabel = (interests && interests.length)
    ? interests.join(', ')
    : 'gastronomia, natureza, cultura';

  var prompt = 'Voce e um especialista em turismo brasileiro com conhecimento profundo sobre ' + destination + '.\n\n'
    + 'Crie um roteiro de viagem DETALHADO com:\n'
    + '- Destino: ' + destination + '\n'
    + '- Duracao: ' + days + ' dia(s)\n'
    + '- Pessoas: ' + passengers + '\n'
    + '- Orcamento: ' + budgetLabel + '\n'
    + '- Interesses: ' + interestLabel + '\n'
    + (dateHint ? '- ' + dateHint + '\n' : '')
    + '\nREGRAS IMPORTANTES:\n'
    + '1. Use APENAS lugares REAIS e conhecidos em ' + destination + '\n'
    + '2. Para cada lugar (restaurante, pousada, atracao), inclua o campo mapQuery com "Nome do Lugar, ' + destination + '" para busca no Google Maps\n'
    + '3. Para hospedagem, inclua bookingQuery com o nome da cidade para busca no Booking.com\n'
    + '4. Mencione precos medios (cafe, almoco, jantar, hospedagem)\n'
    + '5. Inclua 1 dica local por dia que turistas nao costumam saber\n\n'
    + 'Retorne SOMENTE um JSON valido (sem markdown) com esta estrutura EXATA:\n'
    + '{\n'
    + '  "destination": "' + destination + '",\n'
    + '  "summary": "frase curta sobre o destino",\n'
    + '  "bestPeriod": "melhor epoca",\n'
    + '  "totalBudget": "estimativa total em R$ para ' + passengers + ' pessoa(s) por ' + days + ' dia(s)",\n'
    + '  "days": [\n'
    + '    {\n'
    + '      "day": 1,\n'
    + '      "title": "titulo do dia",\n'
    + '      "morning": "descricao das atividades da manha",\n'
    + '      "morningAttractions": [\n'
    + '        { "name": "Nome do Local", "mapQuery": "Nome do Local, ' + destination + '" }\n'
    + '      ],\n'
    + '      "afternoon": "descricao das atividades da tarde",\n'
    + '      "afternoonAttractions": [\n'
    + '        { "name": "Nome do Local", "mapQuery": "Nome do Local, ' + destination + '" }\n'
    + '      ],\n'
    + '      "evening": "descricao do fim de tarde e noite",\n'
    + '      "tip": "dica local importante",\n'
    + '      "meals": {\n'
    + '        "breakfast": { "description": "texto", "placeName": "Nome do Cafe", "mapQuery": "Nome do Cafe, ' + destination + '" },\n'
    + '        "lunch":     { "description": "texto", "placeName": "Nome do Rest.", "mapQuery": "Nome do Rest., ' + destination + '" },\n'
    + '        "dinner":    { "description": "texto", "placeName": "Nome do Rest.", "mapQuery": "Nome do Rest., ' + destination + '" }\n'
    + '      },\n'
    + '      "accommodation": {\n'
    + '        "description": "texto com preco",\n'
    + '        "placeName": "Nome da Pousada",\n'
    + '        "mapQuery": "Nome da Pousada, ' + destination + '",\n'
    + '        "bookingQuery": "' + destination + '"\n'
    + '      }\n'
    + '    }\n'
    + '  ]\n'
    + '}';

  var res = await fetch(GEMINI_URL + '?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      safetySettings: [
        { category:'HARM_CATEGORY_HARASSMENT',        threshold:'BLOCK_NONE' },
        { category:'HARM_CATEGORY_HATE_SPEECH',       threshold:'BLOCK_NONE' },
        { category:'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold:'BLOCK_NONE' },
        { category:'HARM_CATEGORY_DANGEROUS_CONTENT', threshold:'BLOCK_NONE' },
      ],
    }),
  });

  if (!res.ok) {
    var errData = await res.json().catch(function(){return{};});
    if (res.status === 429) throw new Error('RATE_LIMIT');
    throw new Error('GEMINI_ERROR: '+(errData.error&&errData.error.message||res.status));
  }

  var data = await res.json();
  var text = data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts&&data.candidates[0].content.parts[0]&&data.candidates[0].content.parts[0].text;
  if (!text) throw new Error('EMPTY_RESPONSE');

  var clean = text.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/,'').trim();
  try {
    return JSON.parse(clean);
  } catch(_) {
    var match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('JSON_PARSE_ERROR');
  }
}

// Gera link para Google Maps
export function mapsLink(mapQuery) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapQuery);
}

// Gera link para Booking.com (com ID de afiliado se configurado)
export function bookingLink(query, checkIn, checkOut) {
  var aid    = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID;
  var params = { ss: query };
  if (aid)     params.aid      = aid;
  if (checkIn) params.checkin  = checkIn;
  if (checkOut)params.checkout = checkOut;
  return 'https://www.booking.com/searchresults.html?' + new URLSearchParams(params).toString();
}

// Gera link para GetYourGuide (atividades)
export function gygLink(city) {
  var partnerId = process.env.NEXT_PUBLIC_GYG_AFFILIATE_ID;
  var base = 'https://www.getyourguide.com/s/?q=' + encodeURIComponent(city);
  if (partnerId) base += '&partner_id=' + partnerId;
  return base;
}
