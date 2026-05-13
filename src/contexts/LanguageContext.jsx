'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '@/lib/translations';

var LanguageContext = createContext({
  lang:    'pt',
  setLang: function() {},
  t:       function(k) { return k; },
});

export function LanguageProvider({ children }) {
  var [lang, setLangState] = useState('pt');

  // Restaura idioma salvo ao carregar
  useEffect(function() {
    try {
      var saved = localStorage.getItem('br-lang');
      if (saved && ['pt', 'en', 'es'].includes(saved)) {
        setLangState(saved);
      }
    } catch (_) {}
  }, []);

  // Troca idioma e salva no localStorage
  var setLang = useCallback(function(code) {
    if (!['pt', 'en', 'es'].includes(code)) return;
    setLangState(code);
    try { localStorage.setItem('br-lang', code); } catch (_) {}
  }, []);

  // Funcao de traducao: t('chave') -> string no idioma atual
  var t = useCallback(function(key) {
    return (
      (translations[lang]  && translations[lang][key])  ||
      (translations['pt']  && translations['pt'][key])  ||
      key
    );
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang: lang, setLang: setLang, t: t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook para usar em qualquer componente client
export function useLanguage() {
  return useContext(LanguageContext);
}
