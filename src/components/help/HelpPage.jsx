'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ===== CONTEUDO DAS FAQS EM PT / EN / ES =====
function getFAQData(lang) {
  var d = {
    // =====================================================
    pt: [
      {
        title:'Área Administrativa', emoji:'🔒',
        items:[
          { q:'Existe uma área administrativa?',
            a:'Sim. A URL borarodar.vercel.app/admin é acessível apenas pelo administrador do site (e-mail autorizado). Ela exibe métricas em tempo real como rotas calculadas, viagens compartilhadas, visualizações de links, histórico de usuários logados e dados para apresentação a investidores.' },
          { q:'Quais estatísticas ficam disponíveis no painel admin?',
            a:'O painel exibe: total e crescimento de rotas únicas calculadas, total de links compartilhados criados e suas visualizações, histórico de viagens de usuários cadastrados, corredores mais populares, e um resumo de diferenciais técnicos e modelo de receita para pitch com investidores.' },
        ],
      },
      {
        title:'Página Principal', emoji:'🏠',
        items:[
          { q:'Como funciona a página inicial?',
            a:'A homepage é imersiva: vídeo de fundo toca automaticamente, a medalha 3D animada move-se ao logo do header enquanto você rola, e os cards de navegação aparecem logo abaixo. No mobile, a medalha gira sozinha suavemente.' },
          { q:'O vídeo de fundo não toca. O que fazer?',
            a:'O vídeo roda mutado por padrão — autoplay com som é bloqueado pelos navegadores. Se não aparecer, verifique se o navegador bloqueia iframes de terceiros. No iOS Safari, recarregue a página. O conteúdo funciona normalmente mesmo sem o vídeo.' },
          { q:'Como ativo o som do vídeo?',
            a:'Clique em "Som / Mudo" no canto inferior direito. É necessária uma interação (clique ou scroll) antes de ativar o som — restrição dos navegadores modernos.' },
          { q:'A animação da medalha pode ser desativada?',
            a:'Sim. Se o seu sistema tiver "Reduzir movimento" ativado (Configurações → Acessibilidade), todas as animações são pausadas e o vídeo é substituído por fundo gradiente estático.' },
          { q:'O site é acessível para pessoas com deficiência?',
            a:'Sim. Implementamos: (1) Link "Pular para o conteúdo" para usuários de teclado; (2) Atributos ARIA em todos os elementos interativos; (3) Suporte a prefers-reduced-motion para sensibilidade a movimento; (4) Contraste WCAG AA; (5) Compatibilidade com Windows High Contrast Mode; (6) Navegação completa por teclado (Tab / Enter / Shift+Tab).' },
          { q:'Funciona bem no celular?',
            a:'Sim. Animações são simplificadas em dispositivos touch, o vídeo usa playsinline para não abrir em tela cheia no iOS, a medalha gira automaticamente sem precisar do mouse, cards e botões ficam em coluna para facilitar o toque, e a homepage usa 100svh para corrigir o problema clássico do 100vh no iOS Safari.' },
        ],
      },
      {
        title:'Pedágios, Compartilhar e Elétricos', emoji:'🛣️',
        items:[
          { q:'Os pedágios mostrados são valores reais?',
            a:'Sim! Para rotas no Brasil, consultamos a API calcularpedagio.com.br (dados da ANTT), que retorna cada praça individualmente com valor em dinheiro e TAG (Sem Parar, ConectCar). Os resultados ficam em cache — se outra pessoa planejou a mesma rota recentemente, você vê os dados instantaneamente.' },
          { q:'Como funcionam os pedágios para Argentina, Chile e outros países?',
            a:'Mantemos um banco de informações manual atualizado para Argentina, Chile, Uruguai, Paraguai, Bolívia, Peru e Colômbia. Inclui: se aceita cartão, qual TAG usar, aviso sobre o Free Flow do Chile (que exige cadastro do app Autopista.cl antes de viajar) e estimativa de custo por corredor.' },
          { q:'Por que o Chile tem um aviso especial de pedágio?',
            a:'O Chile usa sistema Free Flow eletrônico nas rodovias modernas: não há cabines físicas. As câmeras fotografam a placa e cobram eletronicamente. Turistas estrangeiros precisam baixar o app "Autopista.cl" e cadastrar a placa ANTES de entrar no Chile, senão a multa vai para o endereço do proprietário do veículo.' },
          { q:'Como compartilho minha viagem?',
            a:'Após calcular a rota, clique em "Link público" no painel de exportação. Um link único é gerado (ex: borarodar.vercel.app/r/abc123) que pode ser enviado pelo WhatsApp, Telegram, redes sociais ou copiado. Quem abre o link vê o roteiro completo sem precisar se cadastrar. O link fica ativo por 6 meses.' },
          { q:'Como exporto o roteiro como PDF?',
            a:'Clique em "Exportar PDF" no painel de exportação. Uma nova janela abre com o roteiro formatado. No diálogo de impressão que aparece, escolha "Salvar como PDF" em vez de uma impressora. O PDF inclui rota, orçamento detalhado e o roteiro dia a dia gerado pela IA.' },
          { q:'O BoraRodar suporta carros elétricos?',
            a:'Sim! Ao selecionar seu veículo, temos 28 modelos elétricos de marcas como BYD, Tesla, Hyundai, Kia, VW, Porsche, BMW e Audi. Para elétricos, calculamos: autonomia máxima, energia necessária para a rota, se precisa de recarga e onde estão os eletropostos ao longo do caminho (dados do OpenChargeMap, gratuito e global).' },
          { q:'Como salvar viagens no meu histórico?',
            a:'Faça login na área de Perfil (ícone de usuário) e, após calcular uma rota, clique em "Salvar no histórico". Suas viagens ficam salvas em sua conta e podem ser acessadas pela página de Perfil para rever rotas e orçamentos anteriores.' },
        ],
      },
      {
        title:'O que é o BoraRodar?', emoji:'🚗',
        items:[
          { q:'O que é o BoraRodar?',
            a:'O BoraRodar é um planejador gratuito de viagens de carro. Informe origem, destino, veículo e perfil de viagem — o app calcula a rota, estima todos os custos, gera um roteiro personalizado com IA, e inclui checklist de documentos, alertas de segurança e previsão do tempo.' },
          { q:'Preciso criar uma conta para usar?',
            a:'Não! Você pode planejar rotas, calcular orçamentos e gerar roteiros sem cadastro. A conta é necessária apenas para salvar suas viagens e participar da comunidade.' },
          { q:'O app é gratuito?',
            a:'Sim, 100% gratuito. Usamos serviços open source para mapas e roteamento (OpenStreetMap + OSRM) e os planos gratuitos do Google Gemini (1.500 req/dia) e Groq/Llama (14.400 req/dia) para os roteiros.' },
          { q:'Funciona para outros países além do Brasil?',
            a:'Sim! O autocomplete de cidades e o cálculo de rotas funcionam para qualquer lugar do mundo. Para destinos internacionais, o app também gera requisitos de cruzamento de fronteira, alertas de segurança específicos do país e dicas de documentação.' },
        ],
      },
      {
        title:'Calcular Rota', emoji:'🗺️',
        items:[
          { q:'Como funciona o autocomplete de cidades?',
            a:'Ao digitar 3 ou mais letras, o app busca cidades automaticamente via OpenStreetMap (Nominatim) e exibe sugestões. Selecione sempre da lista para garantir coordenadas corretas.' },
          { q:'Posso adicionar paradas no meio do caminho?',
            a:'Sim! Clique em "+ Adicionar parada intermediária" para incluir até 4 cidades no percurso. Cada parada aparece no mapa e é incluída no cálculo de distância e custo.' },
          { q:'Quais são os dois modos de planejamento?',
            a:'Planejamento Completo: calcula rota, orçamento completo, pontos de interesse e roteiro IA. Montar Roteiro: gera apenas o itinerário dia a dia sem calcular a rota — ideal para quem já sabe como vai chegar.' },
          { q:'Como funciona "Ida e Volta" e "Evitar Pedágios"?',
            a:'Ida e Volta dobra automaticamente a distância no cálculo de combustível e pedágios. Evitar Pedágios zera os pedágios — mas atenção: rotas alternativas costumam ser mais longas e o custo final pode ser similar.' },
        ],
      },
      {
        title:'Perfis de Viajante', emoji:'👥',
        items:[
          { q:'O que muda com o perfil de viajante?',
            a:'O perfil personaliza todo o roteiro gerado pela IA. Cada perfil recebe sugestões adaptadas às suas necessidades específicas de segurança, acessibilidade, ritmo e tipo de atividade.' },
          { q:'Como funciona o perfil "Só Mulheres"?',
            a:'O roteiro prioriza segurança em primeiro lugar: hospedagem no centro com recepção 24h, atividades noturnas apenas em locais movimentados e bem iluminados, 1 dica de segurança prática por dia (apps, número de emergência local). Para destinos internacionais, inclui alertas sobre vestuário e áreas a evitar.' },
          { q:'Como funciona o perfil "Com Pets"?',
            a:'O roteiro sugere exclusivamente locais pet-friendly: hospedagens que aceitam animais, restaurantes com área externa para pets, atrações ao ar livre onde animais são permitidos (parques, praias, trilhas). Em cada sugestão aparece um aviso para confirmar a política de pets com o estabelecimento — pois essas informações podem mudar.' },
          { q:'Como funciona o perfil "Família com Bebê"?',
            a:'Todo o roteiro prioriza acessibilidade para carrinho (sem escadas, piso plano), restaurantes com cadeira alta e trocador, atrações com duração máxima de 1h30, e atividades que terminam antes das 17h. Cada sugestão de hospedagem e restaurante inclui aviso para confirmar a estrutura para bebês antes de reservar.' },
          { q:'Por que aparece um aviso para confirmar antes de ir (Bebê/Pet)?',
            a:'Políticas de pet-friendly e estrutura para bebês são as que mais mudam nos estabelecimentos — um hotel pode parar de aceitar pets, um restaurante pode não ter mais trocador. Por isso, o app sempre recomenda confirmar diretamente com o local antes de sair.' },
        ],
      },
      {
        title:'Destino Surpresa', emoji:'🎲',
        items:[
          { q:'O que é o Modo Surpresa?',
            a:'É o botão "Me surpreenda! 🎲" no formulário. A IA sugere 3 destinos ideais para você: um Próximo (<3h), um Médio (3-6h) e uma Aventura (+6h ou internacional) — todos baseados na sua cidade de origem, orçamento e perfil de viajante.' },
          { q:'Como usar o Modo Surpresa?',
            a:'Preencha a cidade de origem e clique em "Me surpreenda!". Três opções aparecerão com destino, tempo de viagem, distância, o grande atrativo e uma dica local exclusiva. Clique em "Usar este destino" para preencher automaticamente o formulário.' },
          { q:'Posso gerar outras sugestões?',
            a:'Sim! O botão "Outras sugestões" gera três novos destinos completamente diferentes. Use quantas vezes quiser.' },
        ],
      },
      {
        title:'Roteiro com IA', emoji:'🤖',
        items:[
          { q:'Como o roteiro é gerado?',
            a:'A IA usa um sistema em 2 fases: primeiro planeja um tema único para cada dia (evitando repetições), depois executa gerando atividades, refeições e hospedagem completamente diferentes por dia. Cada roteiro equilibra ~60% de clássicos com ~40% de descobertas locais que a maioria dos guias não menciona.' },
          { q:'O que são as dicas "fora da caixinha"?',
            a:'Em cada dia, a IA inclui pelo menos uma descoberta local autentica — um café escondido, uma vista que os guias não mencionam, um mercado local, uma atividade inusitada. Se um local vale o desvio mesmo sendo distante, a IA o sugere e explica por que.' },
          { q:'O que acontece se o Gemini atingir o limite diário?',
            a:'O app troca automaticamente para o Groq (Llama 3.3 70B) como alternativa — sem intervenção do usuário. O Groq tem limite de 14.400 req/dia (quase 10x o Gemini). Quando Llama está sendo usado, aparece um aviso discreto 🦙 no roteiro.' },
          { q:'Como funcionam os links de Maps, Booking e GetYourGuide?',
            a:'Cada local sugerido tem links diretos para buscar no Google Maps, ver hospedagem no Booking.com e encontrar atividades no GetYourGuide. Todos abrem em nova aba.' },
          { q:'Como funciona o mini-mapa por dia?',
            a:'Cada dia do roteiro tem um botão "Ver no mapa" que geocodifica automaticamente as atrações e mostra um mini-mapa Leaflet com marcadores numerados. O botão "Abrir dia no Google Maps" monta uma rota multi-parada sequencial que você pode seguir com navegação.' },
        ],
      },
      {
        title:'Checklist de Viagem', emoji:'📋',
        items:[
          { q:'O que é a Checklist de Viagem?',
            a:'Após calcular a rota, a IA gera uma checklist personalizada com itens organizados por categoria: documentos pessoais, itens obrigatórios do carro, requisitos de fronteira (se destino internacional), roupas, medicamentos, eletrônicos e contatos de emergência.' },
          { q:'O que a checklist cobre para viagens internacionais?',
            a:'A IA identifica o país e lista os requisitos específicos: Argentina (RG/Passaporte + Carta Verde + extintor + triângulo + colete), Chile (SOAP EX obrigatório + proibição de frutas/carnes na fronteira), Bolívia (dificuldade de abastecimento + altitude), Paraguai (limite aduaneiro), Uruguai (SOAT), México (permiso temporal + seguro mexicano + áreas de risco por cartéis).' },
          { q:'A checklist cobre documentos para Pets e Bebês?',
            a:'Sim. Para Pets: certidão veterinária (máx 10 dias), vacina antirrábica atualizada, microchip, CRMV do veterinário, exigências específicas do país destino. Para Bebês: cadeirinha obrigatória (norma do país), certidão de nascimento, autorização notarial se viajar sem um dos pais.' },
          { q:'Os itens da checklist são confiáveis?',
            a:'A IA usa seu conhecimento sobre os requisitos de cada país, mas políticas e leis podem mudar. Sempre confirme os requisitos atuais diretamente com o consulado do país de destino, DENATRAN e CRMV antes de viajar.' },
        ],
      },
      {
        title:'Alertas de Segurança', emoji:'🛡️',
        items:[
          { q:'O app alerta sobre trechos perigosos?',
            a:'Sim. Ao gerar o roteiro, a IA inclui alertas de segurança específicos para o destino e rota: trechos com alto índice de criminalidade (ex: polígono da Bahia, trecho Foz-SP à noite), áreas dominadas por organizações criminosas em destinos internacionais, horários a evitar e recomendações para viajantes estrangeiros.' },
          { q:'A checklist também tem alertas de segurança?',
            a:'Sim. A checklist gerada inclui uma seção de alertas de segurança com nível de risco (alto/médio/informativo) específicos para o destino e a rota, separados por categoria de gravidade.' },
        ],
      },
      {
        title:'Clima em Tempo Real', emoji:'⛅',
        items:[
          { q:'Como funciona a previsão do tempo?',
            a:'Ao digitar o destino, o app busca automaticamente a previsão de 5 dias via OpenWeatherMap. O widget aparece abaixo dos campos de data e mostra temperatura máxima/mínima, condições e umidade para cada dia.' },
          { q:'O clima em tempo real está disponível para todos?',
            a:'Depende de configuração. O app precisa da chave NEXT_PUBLIC_OPENWEATHER_API_KEY. O plano gratuito do OpenWeatherMap permite até 1.000 consultas/dia — suficiente para uso normal. Sem a chave, o app exibe dicas sazonais baseadas no mês da viagem.' },
        ],
      },
      {
        title:'Passeios de Um Dia', emoji:'📍',
        items:[
          { q:'O que são os Passeios de Um Dia?',
            a:'Na aba Explorar, a seção "Passeios de Um Dia" traz 6 roteiros curados com dados reais: Ouro Preto, Gramado/Canela, Bonito, Campos do Jordão, Chapada dos Veadeiros e Paraty. Cada passeio tem lista de paradas com horários, mini-mapa Leaflet interativo e link para abrir a rota completa no Google Maps.' },
          { q:'Posso usar esses passeios no planejador?',
            a:'Sim! Cada passeio tem um botão "Planejar" que leva direto ao planejador com o destino pré-preenchido.' },
        ],
      },
      {
        title:'PWA e Uso Offline', emoji:'📱',
        items:[
          { q:'Posso instalar o BoraRodar no celular?',
            a:'Sim! O app é um PWA (Progressive Web App). No Chrome/Safari, toque em "Adicionar à tela inicial" para instalar como app nativo, com ícone e tela cheia.' },
          { q:'O app funciona sem internet?',
            a:'As páginas principais ficam disponíveis offline após o primeiro acesso. Funções que exigem rede (cálculo de rota, geração de roteiro IA, clima) precisam de conexão. O roteiro gerado pode ser salvo pelo Service Worker para consulta offline.' },
        ],
      },
      {
        title:'Conta e Login', emoji:'🔐',
        items:[
          { q:'Como faço login com o Google?',
            a:'Vá em Perfil → Continuar com Google. Selecione sua conta e você será redirecionado de volta ao site já logado. Sua foto e nome aparecem no canto superior direito.' },
          { q:'Posso usar sem conta?',
            a:'Sim. Todas as funcionalidades principais (rota, orçamento, roteiro, checklist) funcionam sem login. A conta é necessária apenas para salvar viagens e participar da comunidade.' },
        ],
      },
    ],
    // =====================================================
    en: [
      {
        title:'What is BoraRodar?', emoji:'🚗',
        items:[
          { q:'What is BoraRodar?',
            a:'BoraRodar is a free road trip planner. Enter your origin, destination, vehicle and travel profile — the app calculates the route, estimates all costs, generates an AI-powered personalized itinerary, and includes a document checklist, safety alerts and weather forecast.' },
          { q:'Do I need an account?',
            a:'No! You can plan routes, calculate budgets and generate itineraries without signing up. An account is only needed to save trips and join the community.' },
          { q:'Is it free?',
            a:'100% free. We use open-source maps (OpenStreetMap + OSRM) and the free tiers of Google Gemini (1,500 req/day) and Groq/Llama (14,400 req/day) for AI itineraries.' },
          { q:'Does it work outside Brazil?',
            a:'Yes! Autocomplete and route calculation work worldwide. For international destinations, the app also generates border crossing requirements, country-specific safety alerts and documentation tips.' },
        ],
      },
      {
        title:'Route Planning', emoji:'🗺️',
        items:[
          { q:'How does city autocomplete work?',
            a:'Type 3+ letters and the app searches cities via OpenStreetMap (Nominatim) and shows suggestions. Always select from the list to ensure correct coordinates.' },
          { q:'Can I add stops along the way?',
            a:'Yes! Click "+ Add intermediate stop" to add up to 4 cities along the route. Each stop appears on the map and is included in distance and cost calculations.' },
          { q:'What are the two planning modes?',
            a:'Full Planning: calculates route, full budget, points of interest and AI itinerary. Build Itinerary: generates only the day-by-day schedule without route calculation — ideal for when you already know how you\'re getting there.' },
        ],
      },
      {
        title:'Traveler Profiles', emoji:'👥',
        items:[
          { q:'What changes with the traveler profile?',
            a:'The profile personalizes the entire AI-generated itinerary. Each profile receives suggestions adapted to specific safety, accessibility, pace and activity needs.' },
          { q:'How does the "Women Only" profile work?',
            a:'Safety first: accommodation in central areas with 24h reception, evening activities only in busy and well-lit places, 1 practical safety tip per day. For international destinations, includes alerts about dress codes and areas to avoid.' },
          { q:'How does the "With Pets" profile work?',
            a:'The itinerary suggests only pet-friendly places: accommodations that accept animals, restaurants with outdoor pet-friendly areas, open-air attractions where pets are allowed. Every suggestion includes a reminder to confirm the pet policy with the establishment.' },
          { q:'How does the "Family with Baby" profile work?',
            a:'All suggestions prioritize stroller accessibility (no stairs, flat floors), restaurants with high chairs and changing tables, max 1h30 activities, ending before 5pm. Every accommodation and restaurant suggestion includes a reminder to confirm baby-friendly facilities before booking.' },
        ],
      },
      {
        title:'Surprise Destination', emoji:'🎲',
        items:[
          { q:'What is Surprise Mode?',
            a:'The "Surprise me! 🎲" button in the form. AI suggests 3 ideal destinations: Nearby (<3h), Medium (3-6h) and Adventure (+6h or international) — based on your origin city, budget and traveler profile.' },
          { q:'How do I use Surprise Mode?',
            a:'Fill in your origin city and click "Surprise me!". Three options appear with destination, drive time, distance, the main highlight and an exclusive local tip. Click "Use this destination" to auto-fill the form.' },
        ],
      },
      {
        title:'AI Itinerary', emoji:'🤖',
        items:[
          { q:'How is the itinerary generated?',
            a:'The AI uses a 2-phase approach: first plans a unique theme for each day (avoiding repetition), then executes with completely different activities, meals and accommodation per day. Each itinerary balances ~60% classic spots with ~40% local discoveries most guides miss.' },
          { q:'What happens if Gemini hits its daily limit?',
            a:'The app automatically switches to Groq (Llama 3.3 70B) as a fallback — no user action needed. Groq allows 14,400 req/day (nearly 10x Gemini). A subtle 🦙 notice appears when Llama is being used.' },
          { q:'How does the per-day mini-map work?',
            a:'Each day has a "View on map" button that geocodes attractions and shows a Leaflet mini-map with numbered markers. "Open day in Google Maps" creates a sequential multi-stop route for navigation.' },
        ],
      },
      {
        title:'Travel Checklist', emoji:'📋',
        items:[
          { q:'What is the Travel Checklist?',
            a:'After calculating the route, AI generates a personalized checklist organized by category: personal documents, mandatory car items, border crossing requirements (if international), clothing, medications, electronics and emergency contacts.' },
          { q:'What does the checklist cover for international trips?',
            a:'The AI identifies the country and lists specific requirements: Argentina (ID/Passport + Carta Verde insurance + fire extinguisher + warning triangle + reflective vest), Chile (SOAP EX mandatory + food import ban), Bolivia (fuel difficulties + altitude), Paraguay (customs limits), Uruguay (SOAT), Mexico (temporary import permit + Mexican insurance + cartel-controlled areas).' },
          { q:'Does the checklist cover Pet and Baby documents?',
            a:'Yes. For Pets: veterinary health certificate (max 10 days old), up-to-date rabies vaccine, microchip, vet CRMV, destination country requirements. For Babies: mandatory child seat (country\'s regulation), birth certificate, notarized authorization if traveling without a parent.' },
        ],
      },
      {
        title:'Safety Alerts', emoji:'🛡️',
        items:[
          { q:'Does the app warn about dangerous routes?',
            a:'Yes. When generating the itinerary, AI includes destination and route-specific safety alerts: high-crime areas, cartel-controlled zones in international destinations, times to avoid and recommendations for foreign travelers.' },
        ],
      },
      {
        title:'Real-time Weather', emoji:'⛅',
        items:[
          { q:'How does weather forecast work?',
            a:'When you type the destination, the app automatically fetches a 5-day forecast via OpenWeatherMap. The widget shows max/min temperature, conditions and humidity for each day.' },
          { q:'Is real-time weather available to everyone?',
            a:'It requires the NEXT_PUBLIC_OPENWEATHER_API_KEY setting. OpenWeatherMap\'s free plan allows up to 1,000 queries/day. Without the key, the app shows seasonal tips based on the travel month.' },
        ],
      },
      {
        title:'Day Trips', emoji:'📍',
        items:[
          { q:'What are Day Trips?',
            a:'In the Explore tab, the "Day Trips" section features 6 curated itineraries with real data: Ouro Preto, Gramado/Canela, Bonito, Campos do Jordão, Chapada dos Veadeiros and Paraty. Each trip has stops with times, an interactive Leaflet mini-map and a full Google Maps route link.' },
        ],
      },
      {
        title:'PWA & Offline', emoji:'📱',
        items:[
          { q:'Can I install BoraRodar on my phone?',
            a:'Yes! The app is a PWA. In Chrome/Safari, tap "Add to home screen" to install as a native app with icon and full screen.' },
          { q:'Does the app work without internet?',
            a:'Main pages are available offline after the first visit. Features requiring network (route calculation, AI itinerary, weather) need a connection. Generated itineraries can be saved via Service Worker for offline viewing.' },
        ],
      },
    ],
    // =====================================================
    es: [
      {
        title:'¿Qué es BoraRodar?', emoji:'🚗',
        items:[
          { q:'¿Qué es BoraRodar?',
            a:'BoraRodar es un planificador gratuito de viajes en auto. Ingresa origen, destino, vehículo y perfil de viaje — la app calcula la ruta, estima todos los costos, genera un itinerario personalizado con IA e incluye checklist de documentos, alertas de seguridad y pronóstico del tiempo.' },
          { q:'¿Necesito crear una cuenta?',
            a:'¡No! Puedes planificar rutas, calcular presupuestos y generar itinerarios sin registrarte. La cuenta solo es necesaria para guardar viajes y participar en la comunidad.' },
          { q:'¿Es gratuito?',
            a:'100% gratuito. Usamos mapas open source (OpenStreetMap + OSRM) y los planes gratuitos de Google Gemini (1.500 req/día) y Groq/Llama (14.400 req/día) para los itinerarios.' },
          { q:'¿Funciona fuera de Brasil?',
            a:'¡Sí! El autocompletado de ciudades y el cálculo de rutas funcionan en todo el mundo. Para destinos internacionales, la app también genera requisitos de cruce de frontera, alertas de seguridad específicas del país y consejos de documentación.' },
        ],
      },
      {
        title:'Calcular Ruta', emoji:'🗺️',
        items:[
          { q:'¿Cómo funciona el autocompletado de ciudades?',
            a:'Al escribir 3 o más letras, la app busca ciudades via OpenStreetMap y muestra sugerencias. Siempre selecciona de la lista para garantizar coordenadas correctas.' },
          { q:'¿Puedo agregar paradas en el camino?',
            a:'¡Sí! Haz clic en "+ Agregar parada intermedia" para incluir hasta 4 ciudades en el recorrido.' },
          { q:'¿Cuáles son los dos modos de planificación?',
            a:'Planificación Completa: calcula ruta, presupuesto, puntos de interés e itinerario IA. Armar Itinerario: genera solo el itinerario día a día sin calcular la ruta.' },
        ],
      },
      {
        title:'Perfiles de Viajero', emoji:'👥',
        items:[
          { q:'¿Qué cambia con el perfil de viajero?',
            a:'El perfil personaliza todo el itinerario generado por IA, adaptando sugerencias de seguridad, accesibilidad, ritmo y tipo de actividad.' },
          { q:'¿Cómo funciona el perfil "Solo Mujeres"?',
            a:'Seguridad primero: alojamiento central con recepción 24h, actividades nocturnas solo en lugares concurridos y bien iluminados, 1 consejo de seguridad práctico por día. Para destinos internacionales incluye alertas sobre vestimenta y áreas a evitar.' },
          { q:'¿Cómo funciona el perfil "Con Mascotas"?',
            a:'El itinerario sugiere solo lugares pet-friendly: alojamientos que aceptan animales, restaurantes con área externa, atracciones al aire libre donde se permiten mascotas. Cada sugerencia incluye aviso para confirmar la política de mascotas con el establecimiento.' },
          { q:'¿Por qué aparece un aviso para confirmar antes de ir (Bebé/Mascota)?',
            a:'Las políticas de mascotas y la infraestructura para bebés son las que más cambian. Por eso, la app siempre recomienda confirmar directamente con el lugar antes de salir.' },
        ],
      },
      {
        title:'Destino Sorpresa', emoji:'🎲',
        items:[
          { q:'¿Qué es el Modo Sorpresa?',
            a:'El botón "¡Sorpréndeme! 🎲" en el formulario. La IA sugiere 3 destinos ideales: Cercano (<3h), Medio (3-6h) y Aventura (+6h o internacional) — basados en tu ciudad de origen, presupuesto y perfil.' },
          { q:'¿Cómo usar el Modo Sorpresa?',
            a:'Completa la ciudad de origen y haz clic en "¡Sorpréndeme!". Aparecen tres opciones con destino, tiempo de viaje, distancia y consejo local exclusivo. Haz clic en "Usar este destino" para autocompletar el formulario.' },
        ],
      },
      {
        title:'Itinerario con IA', emoji:'🤖',
        items:[
          { q:'¿Cómo se genera el itinerario?',
            a:'La IA usa un sistema en 2 fases: primero planifica un tema único para cada día (evitando repeticiones), luego ejecuta con actividades, comidas y alojamiento completamente diferentes por día. Equilibra ~60% de clásicos con ~40% de descubrimientos locales.' },
          { q:'¿Qué pasa si Gemini alcanza su límite diario?',
            a:'La app cambia automáticamente a Groq (Llama 3.3 70B) como alternativa. Groq permite 14.400 req/día. Cuando se usa Llama aparece un aviso discreto 🦙.' },
        ],
      },
      {
        title:'Lista de Viaje', emoji:'📋',
        items:[
          { q:'¿Qué es la Lista de Viaje?',
            a:'La IA genera una lista personalizada con documentos personales, elementos obligatorios del auto, requisitos de cruce de frontera (si es internacional), ropa, medicamentos, electrónicos y contactos de emergencia.' },
          { q:'¿Qué cubre para viajes internacionales?',
            a:'La IA identifica el país y lista requisitos: Argentina (Carta Verde + extintor + triángulo + chaleco), Chile (SOAP EX obligatorio + prohibición de frutas/carnes), Bolivia (dificultades de combustible + altitud), Paraguay (límite aduanero), Uruguay (SOAT), México (permiso temporal + seguro mexicano + zonas de riesgo).' },
          { q:'¿Cubre documentos para Mascotas y Bebés?',
            a:'Sí. Mascotas: certificado veterinario (máx 10 días), vacuna antirrábica, microchip, requisitos del país destino. Bebés: silla de seguridad obligatoria, partida de nacimiento, autorización notarial si viajan sin un progenitor.' },
        ],
      },
      {
        title:'Alertas de Seguridad', emoji:'🛡️',
        items:[
          { q:'¿La app avisa sobre rutas peligrosas?',
            a:'Sí. Al generar el itinerario, la IA incluye alertas específicas para el destino y la ruta: zonas de alto riesgo, áreas controladas por organizaciones criminosas en destinos internacionales, horarios a evitar y recomendaciones para viajeros extranjeros.' },
        ],
      },
      {
        title:'Pronóstico del Tiempo', emoji:'⛅',
        items:[
          { q:'¿Cómo funciona el pronóstico del tiempo?',
            a:'Al escribir el destino, la app busca automáticamente el pronóstico de 5 días vía OpenWeatherMap. Sin la clave API, muestra consejos estacionales basados en el mes del viaje.' },
        ],
      },
      {
        title:'Paseos de Un Día', emoji:'📍',
        items:[
          { q:'¿Qué son los Paseos de Un Día?',
            a:'En la pestaña Explorar, la sección "Paseos de Un Día" ofrece 6 itinerarios curados: Ouro Preto, Gramado/Canela, Bonito, Campos do Jordão, Chapada dos Veadeiros y Paraty. Cada paseo tiene paradas con horarios, mini-mapa interactivo y enlace al Google Maps.' },
        ],
      },
      {
        title:'PWA y Uso Sin Conexión', emoji:'📱',
        items:[
          { q:'¿Puedo instalar BoraRodar en mi celular?',
            a:'¡Sí! Es una PWA. En Chrome/Safari, toca "Agregar a la pantalla de inicio" para instalar como app nativa.' },
          { q:'¿Funciona sin internet?',
            a:'Las páginas principales están disponibles sin conexión después del primer acceso. Las funciones que requieren red (cálculo de ruta, itinerario IA, clima) necesitan conexión.' },
        ],
      },
    ],
  };
  return d[lang] || d.pt;
}

// ===== COMPONENTES UI =====
function Accordion({ question, answer }) {
  var [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button onClick={function(){setOpen(!open);}}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/3 transition-colors">
        <span className="font-medium text-sm text-white">{question}</span>
        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 transition-transform"
          style={{transform:open?'rotate(180deg)':'none'}}/>
      </button>
      {open&&(
        <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}

function Section({ title, emoji, children }) {
  return (
    <div className="mb-8">
      <h2 className="font-syne font-bold text-lg mb-4 flex items-center gap-2">
        <span>{emoji}</span>{title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// ===== PAGINA PRINCIPAL =====
export default function HelpPage() {
  var { t, lang } = useLanguage();
  var faq = getFAQData(lang);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-10">
        <span className="text-br-purple font-mono text-xs uppercase tracking-widest">{t('help_tag')}</span>
        <h1 className="font-syne font-extrabold text-3xl sm:text-4xl mt-1">{t('help_title')} ❓</h1>
        <p className="text-gray-500 mt-2">{t('help_sub')}</p>
      </div>

      {faq.map(function(section, si) {
        return (
          <Section key={si} title={section.title} emoji={section.emoji}>
            {section.items.map(function(item, ii) {
              return <Accordion key={ii} question={item.q} answer={item.a}/>;
            })}
          </Section>
        );
      })}
    </div>
  );
}
