// src/lib/vehicleData.js
// Base de dados de veiculos populares no Brasil com consumo estimado (km/L rodovia)

export var BRANDS = [
  { id:'vw',         name:'Volkswagen'   },
  { id:'fiat',       name:'Fiat'         },
  { id:'gm',         name:'Chevrolet'    },
  { id:'ford',       name:'Ford'         },
  { id:'toyota',     name:'Toyota'       },
  { id:'hyundai',    name:'Hyundai'      },
  { id:'honda',      name:'Honda'        },
  { id:'renault',    name:'Renault'      },
  { id:'nissan',     name:'Nissan'       },
  { id:'jeep',       name:'Jeep'         },
  { id:'mitsubishi', name:'Mitsubishi'   },
  { id:'peugeot',    name:'Peugeot'      },
  { id:'citroen',    name:'Citroen'      },
  { id:'kia',        name:'Kia'          },
  { id:'bmw',        name:'BMW'          },
  { id:'mercedes',   name:'Mercedes-Benz'},
  { id:'outro',      name:'Outro / Nao listado' },
];

// kml = consumo estimado em rodovia (gasolina)
export var MODELS = {
  vw: [
    { name:'Gol',        kml:13.5, vtype:'carro' },
    { name:'Polo',       kml:14.0, vtype:'carro' },
    { name:'Virtus',     kml:13.8, vtype:'carro' },
    { name:'Fox',        kml:13.0, vtype:'carro' },
    { name:'T-Cross',    kml:12.0, vtype:'suv'   },
    { name:'Tiguan',     kml:10.5, vtype:'suv'   },
    { name:'Taos',       kml:11.5, vtype:'suv'   },
    { name:'Saveiro',    kml:12.5, vtype:'pickup'},
    { name:'Amarok',     kml:9.0,  vtype:'pickup'},
  ],
  fiat: [
    { name:'Uno',        kml:14.5, vtype:'carro' },
    { name:'Mobi',       kml:15.0, vtype:'carro' },
    { name:'Argo',       kml:13.5, vtype:'carro' },
    { name:'Palio',      kml:13.0, vtype:'carro' },
    { name:'Cronos',     kml:13.0, vtype:'carro' },
    { name:'Pulse',      kml:12.5, vtype:'suv'   },
    { name:'Fastback',   kml:12.0, vtype:'suv'   },
    { name:'Strada',     kml:12.8, vtype:'pickup'},
    { name:'Toro',       kml:10.5, vtype:'pickup'},
    { name:'Doblo',      kml:11.0, vtype:'carro' },
  ],
  gm: [
    { name:'Onix',       kml:14.5, vtype:'carro' },
    { name:'Onix Plus',  kml:14.2, vtype:'carro' },
    { name:'Tracker',    kml:12.0, vtype:'suv'   },
    { name:'Equinox',    kml:10.5, vtype:'suv'   },
    { name:'Cruze',      kml:12.5, vtype:'carro' },
    { name:'S10',        kml:9.5,  vtype:'pickup'},
    { name:'Montana',    kml:12.8, vtype:'pickup'},
    { name:'Trailblazer',kml:9.8,  vtype:'suv'   },
  ],
  ford: [
    { name:'Ka',         kml:14.0, vtype:'carro' },
    { name:'EcoSport',   kml:11.5, vtype:'suv'   },
    { name:'Territory',  kml:11.0, vtype:'suv'   },
    { name:'Maverick',   kml:13.0, vtype:'pickup'},
    { name:'Ranger',     kml:9.0,  vtype:'pickup'},
  ],
  toyota: [
    { name:'Etios',      kml:14.0, vtype:'carro' },
    { name:'Yaris',      kml:14.5, vtype:'carro' },
    { name:'Corolla',    kml:13.0, vtype:'carro' },
    { name:'Corolla Cross',kml:11.5,vtype:'suv'  },
    { name:'RAV4',       kml:11.0, vtype:'suv'   },
    { name:'SW4',        kml:9.5,  vtype:'suv'   },
    { name:'Hilux',      kml:9.0,  vtype:'pickup'},
    { name:'Prius',      kml:20.0, vtype:'carro' },
  ],
  hyundai: [
    { name:'HB20',       kml:14.5, vtype:'carro' },
    { name:'HB20S',      kml:14.0, vtype:'carro' },
    { name:'Creta',      kml:12.0, vtype:'suv'   },
    { name:'Tucson',     kml:10.5, vtype:'suv'   },
    { name:'i30',        kml:12.5, vtype:'carro' },
    { name:'Santa Fe',   kml:9.5,  vtype:'suv'   },
  ],
  honda: [
    { name:'Fit',        kml:14.5, vtype:'carro' },
    { name:'City',       kml:13.5, vtype:'carro' },
    { name:'Civic',      kml:13.0, vtype:'carro' },
    { name:'HR-V',       kml:12.5, vtype:'suv'   },
    { name:'WR-V',       kml:13.0, vtype:'suv'   },
    { name:'CR-V',       kml:10.5, vtype:'suv'   },
  ],
  renault: [
    { name:'Kwid',       kml:15.5, vtype:'carro' },
    { name:'Sandero',    kml:14.0, vtype:'carro' },
    { name:'Logan',      kml:13.5, vtype:'carro' },
    { name:'Captur',     kml:12.0, vtype:'suv'   },
    { name:'Duster',     kml:11.5, vtype:'suv'   },
    { name:'Oroch',      kml:11.0, vtype:'pickup'},
  ],
  nissan: [
    { name:'March',      kml:14.5, vtype:'carro' },
    { name:'Versa',      kml:13.5, vtype:'carro' },
    { name:'Kicks',      kml:12.5, vtype:'suv'   },
    { name:'Sentra',     kml:13.0, vtype:'carro' },
    { name:'Frontier',   kml:9.5,  vtype:'pickup'},
  ],
  jeep: [
    { name:'Renegade',   kml:12.0, vtype:'suv'   },
    { name:'Compass',    kml:11.5, vtype:'suv'   },
    { name:'Commander',  kml:10.5, vtype:'suv'   },
  ],
  mitsubishi: [
    { name:'L200 Triton',kml:9.5,  vtype:'pickup'},
    { name:'Pajero',     kml:9.0,  vtype:'suv'   },
    { name:'Outlander',  kml:10.5, vtype:'suv'   },
    { name:'Eclipse Cross',kml:11.0,vtype:'suv'  },
  ],
  peugeot: [
    { name:'208',        kml:13.5, vtype:'carro' },
    { name:'2008',       kml:12.0, vtype:'suv'   },
    { name:'3008',       kml:11.0, vtype:'suv'   },
    { name:'408',        kml:12.5, vtype:'carro' },
  ],
  citroen: [
    { name:'C3',         kml:14.0, vtype:'carro' },
    { name:'C4 Cactus',  kml:13.0, vtype:'carro' },
    { name:'C4 Lounge',  kml:12.5, vtype:'carro' },
    { name:'Aircross',   kml:12.5, vtype:'suv'   },
  ],
  kia: [
    { name:'Picanto',    kml:15.0, vtype:'carro' },
    { name:'Stonic',     kml:12.5, vtype:'suv'   },
    { name:'Sportage',   kml:11.0, vtype:'suv'   },
    { name:'Sorento',    kml:10.0, vtype:'suv'   },
  ],
  bmw: [
    { name:'Serie 1',    kml:12.0, vtype:'carro' },
    { name:'Serie 3',    kml:11.5, vtype:'carro' },
    { name:'X1',         kml:11.0, vtype:'suv'   },
    { name:'X3',         kml:10.5, vtype:'suv'   },
  ],
  mercedes: [
    { name:'Classe A',   kml:12.0, vtype:'carro' },
    { name:'Classe C',   kml:11.5, vtype:'carro' },
    { name:'GLA',        kml:11.5, vtype:'suv'   },
    { name:'GLC',        kml:10.5, vtype:'suv'   },
  ],
  outro: [
    { name:'Hatch 1.0',  kml:14.5, vtype:'carro' },
    { name:'Hatch 1.4',  kml:14.0, vtype:'carro' },
    { name:'Hatch 1.6',  kml:13.0, vtype:'carro' },
    { name:'Sedan 1.6',  kml:13.0, vtype:'carro' },
    { name:'Sedan 2.0',  kml:11.5, vtype:'carro' },
    { name:'SUV medio',  kml:11.0, vtype:'suv'   },
    { name:'Pickup',     kml:9.5,  vtype:'pickup'},
    { name:'Motorhome',  kml:6.0,  vtype:'motohome'},
    { name:'Moto ate 150cc', kml:28.0, vtype:'moto' },
    { name:'Moto 250cc', kml:22.0, vtype:'moto' },
    { name:'Moto 600cc+',kml:16.0, vtype:'moto' },
  ],
};

// Gera lista de anos (2000 ate ano atual + 1)
export function getYears() {
  var current = new Date().getFullYear();
  var years   = [];
  for (var y = current + 1; y >= 2000; y--) years.push(y);
  return years;
}

// Veiculo padrao: sedan/hatch 1.6
export var DEFAULT_VEHICLE = {
  brand: '',
  model: '',
  year:  '',
  kml:   13.0,
  vtype: 'carro',
};

// ─────────────────────────────────────────────────────────────────────────────
// VEÍCULOS ELÉTRICOS
// batteryKwh = capacidade da bateria
// consumoKwh100 = consumo médio em rodovia (kWh/100km)
// range_km = autonomia estimada (WLTP/ciclo misto)
// ─────────────────────────────────────────────────────────────────────────────
export var EV_BRANDS = [
  { id:'byd',        name:'BYD'          },
  { id:'volkswagen', name:'Volkswagen'   },
  { id:'chevrolet',  name:'Chevrolet'    },
  { id:'fiat',       name:'Fiat'         },
  { id:'hyundai',    name:'Hyundai'      },
  { id:'kia',        name:'Kia'          },
  { id:'tesla',      name:'Tesla'        },
  { id:'renault',    name:'Renault'      },
  { id:'porsche',    name:'Porsche'      },
  { id:'bmw',        name:'BMW'          },
  { id:'audi',       name:'Audi'         },
  { id:'outro_ev',   name:'Outro Elétrico'},
];

export var EV_MODELS = [
  // BYD
  { brand:'byd',        name:'BYD Dolphin',        batteryKwh:44.9, consumoKwh100:14.2, rangeKm:340,  vtype:'ev',      chargeKW:60  },
  { brand:'byd',        name:'BYD Atto 3',          batteryKwh:60.5, consumoKwh100:17.5, rangeKm:350,  vtype:'ev-suv',  chargeKW:70  },
  { brand:'byd',        name:'BYD Seal',            batteryKwh:82.5, consumoKwh100:16.0, rangeKm:510,  vtype:'ev',      chargeKW:150 },
  { brand:'byd',        name:'BYD Han',             batteryKwh:85.4, consumoKwh100:18.0, rangeKm:475,  vtype:'ev',      chargeKW:120 },
  { brand:'byd',        name:'BYD Tang',            batteryKwh:108.8,consumoKwh100:22.0, rangeKm:500,  vtype:'ev-suv',  chargeKW:110 },
  { brand:'byd',        name:'BYD Seal U (DM-i)',   batteryKwh:15.9, consumoKwh100:6.5,  rangeKm:247,  vtype:'ev-suv',  chargeKW:11  },
  // Volkswagen
  { brand:'volkswagen', name:'VW ID.4',             batteryKwh:77.0, consumoKwh100:17.0, rangeKm:450,  vtype:'ev-suv',  chargeKW:135 },
  { brand:'volkswagen', name:'VW ID.3',             batteryKwh:58.0, consumoKwh100:15.5, rangeKm:374,  vtype:'ev',      chargeKW:100 },
  { brand:'volkswagen', name:'VW ID.6',             batteryKwh:84.8, consumoKwh100:20.0, rangeKm:425,  vtype:'ev-suv',  chargeKW:135 },
  // Hyundai / Kia
  { brand:'hyundai',    name:'Hyundai IONIQ 5',     batteryKwh:77.4, consumoKwh100:17.5, rangeKm:481,  vtype:'ev-suv',  chargeKW:220 },
  { brand:'hyundai',    name:'Hyundai IONIQ 6',     batteryKwh:77.4, consumoKwh100:14.3, rangeKm:543,  vtype:'ev',      chargeKW:220 },
  { brand:'hyundai',    name:'Hyundai Kona Electric',batteryKwh:64.8, consumoKwh100:15.4, rangeKm:454, vtype:'ev-suv',  chargeKW:100 },
  { brand:'kia',        name:'Kia EV6',             batteryKwh:77.4, consumoKwh100:16.0, rangeKm:528,  vtype:'ev',      chargeKW:233 },
  { brand:'kia',        name:'Kia EV9',             batteryKwh:99.8, consumoKwh100:21.0, rangeKm:541,  vtype:'ev-suv',  chargeKW:233 },
  // Tesla
  { brand:'tesla',      name:'Tesla Model 3 SR',    batteryKwh:60.0, consumoKwh100:14.5, rangeKm:415,  vtype:'ev',      chargeKW:170 },
  { brand:'tesla',      name:'Tesla Model 3 LR',    batteryKwh:75.0, consumoKwh100:14.0, rangeKm:576,  vtype:'ev',      chargeKW:250 },
  { brand:'tesla',      name:'Tesla Model Y SR',    batteryKwh:60.0, consumoKwh100:16.0, rangeKm:455,  vtype:'ev-suv',  chargeKW:170 },
  { brand:'tesla',      name:'Tesla Model Y LR',    batteryKwh:75.0, consumoKwh100:16.5, rangeKm:533,  vtype:'ev-suv',  chargeKW:250 },
  { brand:'tesla',      name:'Tesla Model S',       batteryKwh:100.0,consumoKwh100:17.0, rangeKm:600,  vtype:'ev',      chargeKW:250 },
  // Renault
  { brand:'renault',    name:'Renault Zoe',         batteryKwh:52.0, consumoKwh100:17.8, rangeKm:315,  vtype:'ev',      chargeKW:50  },
  { brand:'renault',    name:'Renault Megane E-Tech',batteryKwh:60.0,consumoKwh100:16.1, rangeKm:450,  vtype:'ev',      chargeKW:130 },
  // Porsche
  { brand:'porsche',    name:'Porsche Taycan',      batteryKwh:93.4, consumoKwh100:22.0, rangeKm:435,  vtype:'ev',      chargeKW:270 },
  { brand:'porsche',    name:'Porsche Macan EV',    batteryKwh:100.0,consumoKwh100:20.0, rangeKm:516,  vtype:'ev-suv',  chargeKW:270 },
  // BMW / Audi
  { brand:'bmw',        name:'BMW iX3',             batteryKwh:74.0, consumoKwh100:18.0, rangeKm:459,  vtype:'ev-suv',  chargeKW:150 },
  { brand:'bmw',        name:'BMW i4 M50',          batteryKwh:83.9, consumoKwh100:20.0, rangeKm:521,  vtype:'ev',      chargeKW:205 },
  { brand:'audi',       name:'Audi Q4 e-tron',      batteryKwh:82.0, consumoKwh100:19.0, rangeKm:520,  vtype:'ev-suv',  chargeKW:135 },
  { brand:'audi',       name:'Audi e-tron GT',      batteryKwh:93.4, consumoKwh100:21.0, rangeKm:488,  vtype:'ev',      chargeKW:270 },
  // Fiat / GM
  { brand:'fiat',       name:'Fiat 500e',           batteryKwh:42.0, consumoKwh100:14.0, rangeKm:300,  vtype:'ev',      chargeKW:85  },
  { brand:'chevrolet',  name:'Chevy Bolt EV',       batteryKwh:65.0, consumoKwh100:15.6, rangeKm:417,  vtype:'ev',      chargeKW:55  },
  // Genérico
  { brand:'outro_ev',   name:'Outro Elétrico',      batteryKwh:60.0, consumoKwh100:18.0, rangeKm:333,  vtype:'ev',      chargeKW:50  },
];

// Helper: identifica se modelo é EV
export function isEVModel(vehicleType) {
  return vehicleType === 'ev' || vehicleType === 'ev-suv' || vehicleType === 'ev-pickup';
}
