// src/lib/ai.js
// Integracao com Google Gemini Flash (gratis: 1.500 req/dia)
// Chave em: https://aistudio.google.com/app/apikey

var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export async function generateItinerary({ destination, days, passengers, interests, budget }) {
  var apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_KEY_MISSING');

  var budgetLabel = budget === 'economico' ? 'economico (hospedagem simples, comida barata)'
    : budget === 'medio' ? 'medio (pousadas, restaurantes razoaveis)'
    : 'confortavel (hoteis bons, restaurantes selecionados)';

  var interestLabel = (interests && interests.length) ? interests.join(', ') : 'gastronomia, natureza, cultura';

  var prompt = 'Voce e um especialista em turismo brasileiro com conhecimento profundo sobre ' + destination + '.\n\n'
    + 'Crie um roteiro de viagem DETALHADO com estas informacoes:\n'
    + '- Destino: ' + destination + '\n'
    + '- Duracao: ' + days + ' dia(s)\n'
    + '- Pessoas: ' + passengers + ' pessoa(s)\n'
    + '- Orcamento: ' + budgetLabel + '\n'
    + '- Interesses: ' + interestLabel + '\n\n'
    + 'REGRAS IMPORTANTES:\n'
    + '1. Sugira apenas lugares REAIS que existem em ' + destination + '\n'
    + '2. Inclua horarios de funcionamento quando souber\n'
    + '3. Para restaurantes, mencione o prato tipico e preco medio por pessoa\n'
    + '4. Para hospedagem, mencione bairros ou pousadas conhecidas\n'
    + '5. Inclua 1 dica local que turistas nao costumam saber\n'
    + '6. Se uma atracao fica distante do centro, indique quantos km\n\n'
    + 'Retorne SOMENTE um JSON valido (sem texto antes ou depois, sem markdown) com esta estrutura:\n'
    + '{\n'
    + '  "destination": "' + destination + '",\n'
    + '  "summary": "frase curta descrevendo o destino",\n'
    + '  "bestPeriod": "melhor epoca para visitar",\n'
    + '  "totalBudget": "estimativa total em R$ para ' + passengers + ' pessoa(s) por ' + days + ' dia(s)",\n'
    + '  "days": [\n'
    + '    {\n'
    + '      "day": 1,\n'
    + '      "title": "titulo do dia",\n'
    + '      "morning": "descricao das atividades da manha com nomes dos lugares",\n'
    + '      "afternoon": "descricao das atividades da tarde com nomes dos lugares",\n'
    + '      "evening": "descricao do fim de tarde e noite",\n'
    + '      "tip": "dica local importante para este dia",\n'
    + '      "meals": {\n'
    + '        "breakfast": "nome do lugar + o que comer + preco estimado",\n'
    + '        "lunch": "nome do lugar + prato sugerido + preco estimado",\n'
    + '        "dinner": "nome do lugar + prato sugerido + preco estimado"\n'
    + '      },\n'
    + '      "accommodation": "sugestao de onde dormir com faixa de preco por noite"\n'
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
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }),
  });

  if (!res.ok) {
    var errData = await res.json().catch(function() { return {}; });
    if (res.status === 429) throw new Error('RATE_LIMIT');
    throw new Error('GEMINI_ERROR: ' + (errData.error && errData.error.message || res.status));
  }

  var data = await res.json();
  var text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
  if (!text) throw new Error('EMPTY_RESPONSE');

  // Limpar possivel markdown do retorno
  var clean = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/,    '')
    .trim();

  try {
    return JSON.parse(clean);
  } catch (_) {
    // Tenta extrair JSON do meio do texto
    var match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('JSON_PARSE_ERROR');
  }
}
