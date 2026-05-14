'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function Accordion({ question, answer }) {
  var [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={function() { setOpen(!open); }}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/3 transition-colors">
        <span className="font-medium text-sm text-white">{question}</span>
        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}/>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
          {typeof answer === 'string' ? <p>{answer}</p> : answer}
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

export default function HelpPage() {
  var { t, lang } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-10">
        <span className="text-br-purple font-mono text-xs uppercase tracking-widest">{t('help_tag')}</span>
        <h1 className="font-syne font-extrabold text-3xl sm:text-4xl mt-1">{t('help_title')} ❓</h1>
        <p className="text-gray-500 mt-2">{t('help_sub')}</p>
      </div>

      {/* ===== GERAL ===== */}
      <Section title="O que e o BoraRodar?" emoji="🚗">
        <Accordion
          question="O que e o BoraRodar?"
          answer="O BoraRodar e um planejador gratuito de viagens de carro. Voce informa origem, destino, tipo de veiculo e perfil de viagem, e o app calcula a rota, estima os custos (combustivel, pedagios, alimentacao, hospedagem) e gera um roteiro personalizado para o seu destino."
        />
        <Accordion
          question="Preciso criar uma conta para usar?"
          answer="Nao! Voce pode planejar rotas, calcular orcamentos e gerar roteiros sem cadastro. A conta e necessaria apenas para salvar suas viagens e participar da comunidade."
        />
        <Accordion
          question="O app e gratuito?"
          answer="Sim, 100% gratuito. Usamos servicos open source para mapas e roteamento (OpenStreetMap e OSRM) e o plano gratuito do Google Gemini para os roteiros (1.500 req/dia)."
        />
        <Accordion
          question="O BoraRodar funciona para outros paises alem do Brasil?"
          answer="Sim! O autocomplete de cidades e o calculo de rotas funcionam para qualquer lugar do mundo. Os roteiros gerados pela IA tambem sao personalizados para o destino escolhido, seja no Brasil ou no exterior."
        />
      </Section>

      {/* ===== ROTA ===== */}
      <Section title="Calcular Rota" emoji="🗺️">
        <Accordion
          question="Como funciona o autocomplete de cidades?"
          answer="Ao digitar 3 ou mais letras no campo de Origem ou Destino, o app busca automaticamente cidades na base do OpenStreetMap (Nominatim) e mostra uma lista de sugestoes. Selecione a cidade correta da lista para garantir que a rota seja calculada corretamente."
        />
        <Accordion
          question="Posso adicionar paradas no meio do caminho?"
          answer="Sim! No planejador, clique em '+ Adicionar parada intermediaria' para incluir ate 4 cidades pelo caminho. Cada parada aparece no mapa com um marcador numerado e e incluida no calculo de distancia e custo."
        />
        <Accordion
          question="O que sao os dois modos de planejamento?"
          answer={
            <div>
              <p className="mb-2"><strong className="text-white">Planejamento Completo:</strong> calcula a rota no mapa, estima todos os custos (veiculo + roteiro), mostra pit stops e atracoes, e gera o roteiro com IA.</p>
              <p><strong className="text-white">Montar Roteiro:</strong> gera apenas o itinerario dia a dia para o destino, sem o calculo de rota e sem os campos de veiculo. Ideal para quem ja sabe como vai e quer apenas organizar o que fazer la.</p>
            </div>
          }
        />
        <Accordion
          question="Como funciona 'Ida e Volta'?"
          answer="Ao ativar o toggle 'Ida e Volta', o app dobra automaticamente a distancia percorrida no calculo de combustivel e pedagios. A hospedagem e alimentacao nao sao dobradas pois sao pagas apenas uma vez no destino."
        />
        <Accordion
          question="O que acontece se eu marcar 'Evitar Pedagios'?"
          answer="O custo de pedagio fica zerado no orcamento. Porem, na vida real, rotas sem pedagio costumam ser mais longas e consumir mais combustivel — o custo final pode ser igual ou ate maior. O aviso amarelo no formulario lembra disso."
        />
      </Section>

      {/* ===== VEICULO ===== */}
      <Section title="Veiculo e Combustivel" emoji="🚗">
        <Accordion
          question="Como funciona o seletor de veiculo?"
          answer="Selecione a Marca, depois o Modelo e o Ano do seu veiculo. O app sugere automaticamente o consumo medio em rodovia (km/L) para aquele modelo. Voce pode aceitar o valor sugerido ou alterar manualmente o campo Km/L."
        />
        <Accordion
          question="E se eu nao selecionar nenhum veiculo?"
          answer="O app usa um consumo padrao de 13 km/L, equivalente a um sedan ou hatchback 1.6 popular. Este valor e adequado para a maioria dos carros de passeio comuns no Brasil."
        />
        <Accordion
          question="Por que o custo de pedagio muda com o tipo de veiculo?"
          answer="As cancelas de pedagio cobram valores diferentes por tipo de veiculo (numero de eixos e categoria). Motos pagam ~50% do valor de um carro; pickups pagam ~150%; motorhomes pagam ~200%. O app aplica esses multiplicadores automaticamente ao estimar os pedagios."
        />
        <Accordion
          question="Quais combustiveis sao suportados?"
          answer="Gasolina, Etanol, Diesel, e veiculos Flex (gasolina ou etanol). O preco por litro e editavel — mantenha atualizado com o preco atual no seu posto para um calculo mais preciso."
        />
      </Section>

      {/* ===== ORCAMENTO ===== */}
      <Section title="Orcamento e Custos" emoji="💰">
        <Accordion
          question="Como os custos sao divididos?"
          answer={
            <div>
              <p className="mb-2"><strong className="text-white">Custos do Veiculo:</strong> combustivel + pedagios. Sao os gastos diretamente relacionados a conducao.</p>
              <p className="mb-2"><strong className="text-white">Custos do Roteiro:</strong> alimentacao + hospedagem. Sao os gastos no destino e no percurso.</p>
              <p><strong className="text-white">Racha por pessoa:</strong> o total geral dividido pelo numero de passageiros, para facilitar o rateio entre os participantes.</p>
            </div>
          }
        />
        <Accordion
          question="O que muda com o 'Estilo de Viagem'?"
          answer={
            <div>
              <p className="mb-1"><strong className="text-white">Economico 💰:</strong> Hostel/camping (~R$ 80/quarto/noite), lanchonetes (~R$ 15/refeicao/pessoa).</p>
              <p className="mb-1"><strong className="text-white">Moderado ⚖️:</strong> Pousada simples (~R$ 150/quarto/noite), restaurantes variados (~R$ 28/refeicao/pessoa).</p>
              <p><strong className="text-white">Esbanjando ✨:</strong> Hoteis e pousadas boutique (~R$ 420/quarto/noite), restaurantes selecionados (~R$ 75/refeicao/pessoa).</p>
            </div>
          }
        />
        <Accordion
          question="Os valores do orcamento sao exatos?"
          answer="Nao — sao estimativas baseadas em medias nacionais. Os pedagios sao calculados pela distancia total x uma media por km para o tipo de veiculo. Para valores exatos de pedagio, consulte o site da concessionaria da rodovia."
        />
      </Section>

      {/* ===== PERFIL DE VIAJANTE ===== */}
      <Section title="Perfil de Viajante e Roteiro" emoji="👥">
        <Accordion
          question="O que e o 'Perfil de Viajante'?"
          answer={
            <div className="space-y-1.5">
              <p>O perfil de viajante personaliza todo o roteiro gerado. Cada perfil recebe sugestoes adaptadas:</p>
              <p><strong className="text-white">🧍 Solo:</strong> areas seguras, flexibilidade de horarios, opcoes economicas, dicas de sociabilidade.</p>
              <p><strong className="text-white">👫 Casal:</strong> locais romanticos, mirantes ao por do sol, restaurantes intimistas, atividades para dois.</p>
              <p><strong className="text-white">👶 Familia+Bebe:</strong> locais acessiveis para carrinho, trocadores, atividades curtas, horarios diurnos.</p>
              <p><strong className="text-white">👴 Com Idosos:</strong> acessibilidade (rampas, elevadores), passeios curtos, restaurantes tranquilos, ritmo relaxado.</p>
              <p><strong className="text-white">👥 Grupo:</strong> atividades em grupo, happy hour, opcoes custo-beneficio, programacao noturna.</p>
            </div>
          }
        />
        <Accordion
          question="Como funciona o roteiro gerado?"
          answer="O roteiro e gerado pelo Google Gemini (IA) com base no destino, numero de dias, perfil de viajante, interesses e estilo de orcamento. Cada dia tem atividades para manha, tarde e noite, sugestoes de refeicoes e hospedagem, alem de uma dica local exclusiva."
        />
        <Accordion
          question="O roteiro repete atividades ou check-in?"
          answer="Nao! A IA e instruida explicitamente para: mencionar check-in apenas no Dia 1, nunca repetir atracao ou restaurante ao longo dos dias, e cada dia ter um tema ou area diferente do destino. No ultimo dia, a IA sugere o check-out e a preparacao para o retorno."
        />
        <Accordion
          question="Como funcionam os links de 'Ver no Maps', 'Booking.com' e 'Atividades'?"
          answer="Cada local sugerido no roteiro tem um link para o Google Maps (abre a busca pelo local), Booking.com (busca de hospedagem na cidade) e GetYourGuide (atividades e passeios no destino). Todos os links abrem em uma nova aba, fora do BoraRodar. Futuramente, ao nos cadastrar nos programas de afiliados, os links incluirao IDs de rastreamento."
        />
      </Section>

      {/* ===== PERIODO / CLIMA ===== */}
      <Section title="Periodo da Viagem e Clima" emoji="📅">
        <Accordion
          question="Por que informar a data de ida e retorno?"
          answer="Com as datas preenchidas, o app exibe dicas automaticas sobre o clima e o que levar (protetor solar, agasalho, repelente), alem de avisos sobre eventos que podem afetar a viagem como Carnaval, Semana Santa e Festas Juninas."
        />
        <Accordion
          question="As dicas de clima sao especificas para o destino?"
          answer="As dicas sazonais sao baseadas na estacao do ano para o Hemisferio Sul (que engloba o Brasil). Para dicas especificas de microclima do destino, o roteiro gerado pela IA tambem considera a data informada."
        />
      </Section>

      {/* ===== CONTA E LOGIN ===== */}
      <Section title="Conta e Login" emoji="🔐">
        <Accordion
          question="Como faço login com o Google?"
          answer="Va em Perfil > Continuar com Google. Uma janela de selecao de conta Google sera exibida. Escolha sua conta e voce sera redirecionado de volta ao site ja logado. Sua foto e nome aparecerao no canto superior direito da pagina."
        />
        <Accordion
          question="Por que nao apareceu a janela de selecao do Google?"
          answer="Isso pode acontecer se o navegador ja tem uma conta Google ativa e tenta usar ela automaticamente. Para forcar a selecao de conta, clique em 'Sair' no BoraRodar e tente logar novamente — a janela de selecao sera exibida."
        />
        <Accordion
          question="Posso usar o BoraRodar sem criar conta?"
          answer="Sim! Todas as funcionalidades principais (calculo de rota, orcamento e roteiro) funcionam sem login. A conta e necessaria apenas para salvar viagens e participar da comunidade com dicas e avaliacoes."
        />
      </Section>

      {/* ===== TECNICO ===== */}
      <Section title="Tecnico e Privacidade" emoji="⚙️">
        <Accordion
          question="Quais tecnologias o BoraRodar usa?"
          answer="Frontend: Next.js + Tailwind CSS. Mapas: Leaflet + OpenStreetMap (gratuito e open source). Roteamento: OSRM. IA: Google Gemini Flash. Banco de dados e autenticacao: Supabase. Deploy: Vercel."
        />
        <Accordion
          question="Meus dados ficam salvos?"
          answer="Dados de sessao e preferencias ficam no navegador (localStorage). Viagens salvas e perfil ficam no Supabase, acessiveis apenas com login. Nao vendemos nem compartilhamos dados com terceiros."
        />
        <Accordion
          question="O app tem publicidade?"
          answer="Nao exibimos anuncios. Futuramente podemos usar links de afiliados em hoteis e atividades (Booking.com, GetYourGuide) — voce sera avisado sempre que um link for de afiliado."
        />
      </Section>
    </div>
  );
}
