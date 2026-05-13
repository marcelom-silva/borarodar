'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Map, Coins, Sparkles, Users, Lock, Wrench, MessageCircle, Car, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================
// DADOS DO FAQ
// ============================================================
function getFAQData(t) {
  return [
    {
      category: 'Como funciona o BoraRodar?',
      icon: Car,
      color: '#39FF14',
      items: [
        {
          q: 'O que e o BoraRodar?',
          a: 'O BoraRodar e um planejador de viagens de carro feito para o Brasil. Voce informa a origem, o destino e quantos dias vai ficar, e o site calcula a rota, o orcamento completo, sugere paradas incriveis e ainda gera um roteiro dia a dia usando inteligencia artificial.',
        },
        {
          q: 'E gratis mesmo?',
          a: 'Sim! 100% gratis. O BoraRodar usa tecnologias abertas como OpenStreetMap e OSRM para os mapas e rotas, e o Google Gemini Flash (que tem 1.500 consultas por dia gratuitas) para gerar os roteiros. Nao ha cobranca para usar.',
        },
        {
          q: 'Preciso me cadastrar para usar?',
          a: 'Nao! Voce pode planejar rotas, calcular orcamentos e ver o roteiro sem criar conta. O cadastro e opcional e serve para salvar suas viagens, participar da comunidade e ganhar medalhas.',
        },
        {
          q: 'Funciona em celular?',
          a: 'Sim! O site foi criado com Mobile First — funciona muito bem no celular, tablet e computador. Abra pelo navegador do seu smartphone sem precisar instalar nada.',
        },
      ],
    },
    {
      category: 'Planejando sua rota',
      icon: Map,
      color: '#00D4FF',
      items: [
        {
          q: 'Como funciona o calculo da rota?',
          a: 'Usamos o OSRM (Open Source Routing Machine) com dados do OpenStreetMap. Voce informa origem e destino (e pode adicionar ate 4 paradas intermediarias), e o sistema calcula o melhor caminho, a distancia e o tempo estimado.',
        },
        {
          q: 'Posso adicionar paradas no meio do caminho?',
          a: 'Sim! Na pagina de planejamento, clique em "Adicionar parada intermediaria" para incluir ate 4 cidades ou pontos no caminho. Cada parada e geocodificada e aparece no mapa com um marcador laranja numerado.',
        },
        {
          q: 'Quais cidades o BoraRodar cobre?',
          a: 'O BoraRodar cobre todo o Brasil — qualquer cidade ou endereco que esteja no OpenStreetMap (que cobre o pais inteiro). Se uma cidade nao for encontrada, tente ser mais especifico: "Sao Paulo, SP" ao inves de apenas "Sao Paulo".',
        },
        {
          q: 'O mapa usa dados em tempo real?',
          a: 'As rotas e a geocodificacao usam dados atualizados do OpenStreetMap. O trafico em tempo real nao esta disponivel no momento. Dicas sobre condicoes da estrada vem da nossa comunidade de usuarios.',
        },
      ],
    },
    {
      category: 'Orcamento detalhado',
      icon: Coins,
      color: '#FF6B35',
      items: [
        {
          q: 'Como e calculado o combustivel?',
          a: 'Simples: (distancia em km / km por litro do seu carro) x preco do litro. Voce informa o consumo do seu veiculo (ex: 12 km/L) e o preco atual do combustivel na sua regiao. O resultado e o custo real de combustivel da viagem.',
        },
        {
          q: 'Como sao calculados os pedagios?',
          a: 'Os pedagios sao estimados com base em uma media por km para rodovias federais brasileiras (aproximadamente R$ 0,07 por km). E uma estimativa — os valores reais variam por concessionaria e tipo de veiculo. Use como referencia, nao como valor exato.',
        },
        {
          q: 'E a alimentacao e hospedagem?',
          a: 'Sao medias nacionais calculadas com base no numero de passageiros, dias e distancia. Alimentacao: ~R$ 25 por pessoa por refeicao. Hospedagem: ~R$ 150 por quarto por noite. Esses valores podem variar muito dependendo do destino e do seu estilo de viagem.',
        },
        {
          q: 'Como aumentar a precisao do orcamento?',
          a: 'Informe exatamente o consumo do seu carro (km/L) e o preco atual do combustivel na sua regiao. Para hospedagem, use o numero de noites real que pretende ficar. Os outros valores sao medias, mas servem bem para planejar.',
        },
      ],
    },
    {
      category: 'Roteiro com Inteligencia Artificial',
      icon: Sparkles,
      color: '#B24BF3',
      items: [
        {
          q: 'Que IA gera o roteiro?',
          a: 'Usamos o Google Gemini Flash, um modelo de linguagem gratuito (ate 1.500 consultas por dia). Voce informa o destino, numero de dias, perfil de orcamento e seus interesses, e o Gemini gera um roteiro completo dia a dia em portugues.',
        },
        {
          q: 'O roteiro e confiavel?',
          a: 'O roteiro usa lugares e estabelecimentos reais que o Gemini conhece. Porem, como qualquer IA, pode ocasionalmente sugerir um horario desatualizado ou um restaurante que mudou. Sempre confirme detalhes importantes no Google antes da viagem.',
        },
        {
          q: 'E se nao tiver a chave do Gemini configurada?',
          a: 'O site tem um banco de roteiros estaticos para os destinos mais populares (Campos do Jordao, Gramado, Ouro Preto, etc.). Se o Gemini nao estiver disponivel, esse roteiro base e exibido automaticamente como fallback.',
        },
        {
          q: 'Posso gerar varios roteiros?',
          a: 'Sim! Clique em "Gerar novo roteiro" para tentar diferentes combinacoes de interesses e orcamento. Cada geracao usa uma consulta do seu limite diario gratuito (1.500 por dia).',
        },
        {
          q: 'O que significa "Vale o Desvio"?',
          a: 'Atracoes marcadas como "Vale o Desvio" ficam a mais de 40 km da rota principal, mas sao tao boas que vale o esforco extra. O site informa a distancia exata para voce decidir se faz sentido incluir na viagem.',
        },
      ],
    },
    {
      category: 'Comunidade',
      icon: Users,
      color: '#39FF14',
      items: [
        {
          q: 'O que e o feed da comunidade?',
          a: 'E um espaco onde os viajantes compartilham dicas em tempo real: condicoes de estradas, postos com preco bom, restaurantes recomendados, alertas de perigo, etc. As atualizacoes aparecem ao vivo usando Supabase Realtime.',
        },
        {
          q: 'O que sao as medalhas?',
          a: 'Sao conquistas que voce desbloqueia usando o BoraRodar. Exemplos: "Primeira Viagem" ao planejar sua primeira rota, "Cacador de Cachoeiras" ao visitar uma rota tematica de cachoeiras, "Rei do Asfalto" ao acumular 10.000 km planejados.',
        },
        {
          q: 'Como funciona o ranking?',
          a: 'O ranking mostra os usuarios com mais km planejados, mais viagens realizadas e mais dicas publicadas. E uma forma divertida de reconhecer os grandes exploradores da comunidade.',
        },
      ],
    },
    {
      category: 'Conta e privacidade',
      icon: Lock,
      color: '#00D4FF',
      items: [
        {
          q: 'Meus dados sao seguros?',
          a: 'Sim. Usamos Supabase (infraestrutura de nivel enterprise) com Row Level Security — cada usuario so ve e acessa os proprios dados. Nenhum dado e vendido ou compartilhado com terceiros.',
        },
        {
          q: 'Posso manter minhas viagens privadas?',
          a: 'Sim! Por padrao todas as viagens salvas sao privadas. Voce escolhe quais quer tornar publicas para compartilhar na comunidade.',
        },
        {
          q: 'Como funciona o login com Google?',
          a: 'Usamos o OAuth 2.0 do Google via Supabase Auth. Nao armazenamos sua senha — apenas um token seguro que identifica voce. Voce pode revogar o acesso a qualquer momento nas configuracoes da sua conta Google.',
        },
        {
          q: 'Como excluir minha conta?',
          a: 'No momento, envie um e-mail para o suporte solicitando a exclusao. Em breve adicionaremos essa opcao diretamente no perfil.',
        },
      ],
    },
    {
      category: 'Duvidas tecnicas',
      icon: Wrench,
      color: '#FF6B35',
      items: [
        {
          q: 'O mapa nao esta carregando. O que fazer?',
          a: 'Verifique sua conexao com a internet. O mapa usa tiles do OpenStreetMap — se o servico estiver temporariamente fora, pode demorar alguns segundos. Tente recarregar a pagina.',
        },
        {
          q: 'O calculo de rota deu erro. E agora?',
          a: 'Verifique se os nomes das cidades estao corretos. Use sempre o formato "Cidade, Estado" (ex: "Curitiba, PR"). Se o erro persistir, pode ser uma indisponibilidade temporaria do OSRM — tente novamente em alguns minutos.',
        },
        {
          q: 'O site esta lento no celular.',
          a: 'O mapa Leaflet pode ser pesado em conexoes lentas. Experimente usar em uma conexao Wi-Fi. Em futuras atualizacoes adicionaremos modo leve para redes moveis.',
        },
        {
          q: 'Encontrei um bug ou quero sugerir algo.',
          a: 'Adoramos feedback! Abra uma issue no GitHub (github.com/marcelom-silva/borarodar) ou entre em contato pela comunidade. Toda sugestao e muito bem-vinda.',
        },
      ],
    },
  ];
}

// ============================================================
// ACCORDION ITEM
// ============================================================
function AccordionItem({ item, accentColor }) {
  var [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        type="button"
        onClick={function() { setOpen(!open); }}
        className="w-full flex items-center justify-between gap-4 py-4 text-left transition-colors hover:text-white"
      >
        <span className="font-syne font-semibold text-sm text-gray-300 leading-snug">{item.q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }}/>
          : <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-600"/>
        }
      </button>
      {open && (
        <div className="pb-4 pr-8">
          <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGINA DE AJUDA
// ============================================================
export default function HelpPage() {
  var { t } = useLanguage();
  var [activeSection, setActiveSection] = useState(null);
  var faqData = getFAQData(t);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">

      {/* HERO */}
      <div className="text-center mb-14">
        <span className="text-br-green font-mono text-xs uppercase tracking-[0.2em]">{t('help_tag')}</span>
        <h1 className="font-syne font-extrabold text-4xl sm:text-5xl mt-3 mb-4 leading-tight">
          {t('help_title')} 🛣️
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">{t('help_sub')}</p>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
          {[
            { href: '/planejar',   icon: Map,      label: 'Planejar rota', color: '#39FF14' },
            { href: '/comunidade', icon: Users,    label: 'Comunidade',    color: '#00D4FF' },
            { href: '/explorar',   icon: Zap,      label: 'Explorar',      color: '#B24BF3' },
            { href: '/perfil',     icon: MessageCircle, label: 'Meu perfil', color: '#FF6B35' },
          ].map(function({ href, icon: Icon, label, color }) {
            return (
              <Link
                key={href}
                href={href}
                className="br-card p-4 flex flex-col items-center gap-2 hover:-translate-y-1 transition-transform group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '15' }}>
                  <Icon className="w-4 h-4" style={{ color: color }}/>
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* FAQ SECTIONS */}
      <div className="space-y-4">
        {faqData.map(function(section, si) {
          var isOpen = activeSection === si;
          return (
            <div key={si} className="br-card overflow-hidden">
              {/* Section header */}
              <button
                type="button"
                onClick={function() { setActiveSection(isOpen ? null : si); }}
                className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-white/2"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: section.color + '15' }}>
                  <section.icon className="w-5 h-5" style={{ color: section.color }}/>
                </div>
                <div className="flex-1">
                  <h2 className="font-syne font-bold text-base">{section.category}</h2>
                  <p className="text-xs text-gray-600 mt-0.5">{section.items.length} perguntas</p>
                </div>
                {isOpen
                  ? <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: section.color }}/>
                  : <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-600"/>
                }
              </button>

              {/* Accordion items */}
              {isOpen && (
                <div className="px-5 pb-1 border-t border-white/5">
                  {section.items.map(function(item, ii) {
                    return <AccordionItem key={ii} item={item} accentColor={section.color}/>;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA final */}
      <div
        className="mt-12 rounded-2xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(57,255,20,0.06) 0%, rgba(0,212,255,0.06) 100%)',
          border: '1px solid rgba(57,255,20,0.15)',
        }}
      >
        <MessageCircle className="w-10 h-10 text-br-green mx-auto mb-3 opacity-70"/>
        <h3 className="font-syne font-extrabold text-xl mb-2">Ainda com duvidas?</h3>
        <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
          Pergunte para a comunidade ou abra uma issue no GitHub.
          A galera adora ajudar!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/comunidade" className="btn-neon px-8 flex items-center justify-center gap-2">
            <Users className="w-4 h-4"/> Perguntar na comunidade
          </Link>
          <a
            href="https://github.com/marcelom-silva/borarodar/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost px-8 flex items-center justify-center gap-2"
          >
            Abrir issue no GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
