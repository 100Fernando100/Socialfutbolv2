export type Language = 'en' | 'es' | 'pt';

export interface Translations {
  header: {
    fanZone: string;
    myClub: string;
  };
  liveMatch: {
    live: string;
    possession: string;
    shots: string;
    onTarget: string;
  };
  squad: {
    topPlayers: string;
    menFirstTeam: string;
    aiTacticalRating: string;
    positions: {
      st: string;
      fw: string;
      rw: string;
      cm: string;
      gk: string;
    };
  };
  ticker: {
    breakingNews: string;
    news1: string;
    news2: string;
    news3: string;
    news4: string;
  };
  transparency: {
    title: string;
    subtitle: string;
    description: string;
    viewDetails: string;
    revenueTitle: string;
    expensesTitle: string;
    sponsorships: string;
    ticketSales: string;
    merchandise: string;
    salaries: string;
    operations: string;
    academy: string;
  };
  stadiumVote: {
    title: string;
    subtitle: string;
    description: string;
    option1: string;
    option2: string;
    option3: string;
    vote: string;
    votesCount: string;
  };
  suggestions: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    successMessage: string;
  };
  carpool: {
    title: string;
    subtitle: string;
    description: string;
    findRide: string;
    offersCount: string;
  };
  fanAnalysts: {
    title: string;
    subtitle: string;
    description: string;
    joinDiscussion: string;
    analystsCount: string;
  };
  fanCam: {
    title: string;
    subtitle: string;
    description: string;
    uploadVideo: string;
    videosCount: string;
  };
  faq: {
    title: string;
    subtitle: string;
    question1: string;
    answer1: string;
    question2: string;
    answer2: string;
    question3: string;
    answer3: string;
  };
  help: {
    title: string;
    subtitle: string;
    description: string;
    getHelp: string;
  };
  socialLinks: {
    title: string;
    subtitle: string;
    followUs: string;
  };
  settings: {
    title: string;
    subtitle: string;
    notifications: string;
    darkMode: string;
    language: string;
    privacy: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    markAllRead: string;
    notification1: string;
    notification2: string;
    notification3: string;
  };
  sponsors: {
    officialAirline: string;
    officialKitSupplier: string;
    sponsored: string;
    shopNow: string;
    bookFlight: string;
    freeShipping: string;
    newSeasonCollection: string;
    exclusiveOffers: string;
    flyWorldwide: string;
    unleashFandom: string;
    latestGear: string;
  };
  bottomNav: {
    home: string;
    squad: string;
    tickets: string;
    news: string;
    profile: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    header: {
      fanZone: 'FAN ZONE',
      myClub: 'MY CLUB',
    },
    liveMatch: {
      live: 'Live',
      possession: 'Possession',
      shots: 'Shots',
      onTarget: 'On Target',
    },
    squad: {
      topPlayers: 'TOP PLAYERS',
      menFirstTeam: 'Men First Team',
      aiTacticalRating: 'AI TACTICAL RATING',
      positions: {
        st: 'ST',
        fw: 'FW',
        rw: 'RW',
        cm: 'CM',
        gk: 'GK',
      },
    },
    ticker: {
      breakingNews: 'BREAKING NEWS',
      news1: 'Transfer Window: Club announces 3 new signings worth $45M',
      news2: 'Youth Academy: 5 players called up to senior squad for Champions League',
      news3: 'Stadium Upgrade: New VIP section opening next month with 2,000 seats',
      news4: 'Community Program: Free football clinics for 1,000 local kids this summer',
    },
    transparency: {
      title: 'FINANCIAL TRANSPARENCY',
      subtitle: 'Club Budget Overview',
      description: 'See exactly how your club invests in success. Full financial reports published quarterly.',
      viewDetails: 'View Details',
      revenueTitle: 'Revenue',
      expensesTitle: 'Expenses',
      sponsorships: 'Sponsorships',
      ticketSales: 'Ticket Sales',
      merchandise: 'Merchandise',
      salaries: 'Salaries',
      operations: 'Operations',
      academy: 'Academy',
    },
    stadiumVote: {
      title: 'STADIUM DECISIONS',
      subtitle: 'Vote on Club Matters',
      description: 'Should we add a retractable roof to the stadium?',
      option1: 'Yes, add roof',
      option2: 'No, keep open',
      option3: 'Need more info',
      vote: 'Vote',
      votesCount: 'fans voted',
    },
    suggestions: {
      title: 'VOICE YOUR IDEAS',
      subtitle: 'Send Suggestions',
      placeholder: 'Share your ideas to improve the fan experience...',
      send: 'Send Suggestion',
      successMessage: 'Thank you! Your suggestion has been sent.',
    },
    carpool: {
      title: 'MATCH DAY CARPOOL',
      subtitle: 'Share Rides to Stadium',
      description: 'Connect with fans heading to the match. Save money and reduce emissions.',
      findRide: 'Find a Ride',
      offersCount: 'active offers',
    },
    fanAnalysts: {
      title: 'FAN ANALYSTS',
      subtitle: 'Tactical Discussion',
      description: 'Share your tactical insights and debate formations with fellow fans.',
      joinDiscussion: 'Join Discussion',
      analystsCount: 'active analysts',
    },
    fanCam: {
      title: 'FAN CAM',
      subtitle: 'Share Your Passion',
      description: 'Upload your best moments from the stands. Get featured on the big screen.',
      uploadVideo: 'Upload Video',
      videosCount: 'videos uploaded',
    },
    faq: {
      title: 'FAQ',
      subtitle: 'Frequently Asked Questions',
      question1: 'How do I purchase season tickets?',
      answer1: 'Visit our ticketing section or call our box office at +1-555-0123.',
      question2: 'Can I vote on multiple stadium decisions?',
      answer2: 'Yes, all verified fans can vote on every proposal.',
      question3: 'How are financial reports verified?',
      answer3: 'All reports are audited by independent third-party firms.',
    },
    help: {
      title: 'NEED HELP?',
      subtitle: 'Support Center',
      description: 'Our support team is available 24/7 to assist you with any questions.',
      getHelp: 'Get Help',
    },
    socialLinks: {
      title: 'CONNECT WITH US',
      subtitle: 'Follow on Social Media',
      followUs: 'Follow Us',
    },
    settings: {
      title: 'SETTINGS',
      subtitle: 'Preferences',
      notifications: 'Push Notifications',
      darkMode: 'Dark Mode',
      language: 'Language',
      privacy: 'Privacy Settings',
    },
    notifications: {
      title: 'NOTIFICATIONS',
      subtitle: 'Recent Updates',
      markAllRead: 'Mark All Read',
      notification1: 'Match starts in 2 hours! Get your tickets now.',
      notification2: 'New financial report published for Q4 2023.',
      notification3: 'Your stadium vote on roof installation is live.',
    },
    sponsors: {
      officialAirline: 'Official Airline Partner',
      officialKitSupplier: 'Official Kit Supplier',
      sponsored: 'Sponsored',
      shopNow: 'Shop Now',
      bookFlight: 'Book Flight',
      freeShipping: 'Free Shipping',
      newSeasonCollection: 'New season collection',
      exclusiveOffers: 'Exclusive member offers',
      flyWorldwide: 'Fly to 200+ destinations',
      unleashFandom: 'Unleash Your Fandom',
      latestGear: 'Get the latest fan gear, limited edition jerseys, and exclusive boots. Show your team pride with authentic merchandise.',
    },
    bottomNav: {
      home: 'Home',
      squad: 'Squad',
      tickets: 'Tickets',
      news: 'News',
      profile: 'Profile',
    },
  },
  es: {
    header: {
      fanZone: 'ZONA DE FANS',
      myClub: 'MI CLUB',
    },
    liveMatch: {
      live: 'En Vivo',
      possession: 'Posesión',
      shots: 'Tiros',
      onTarget: 'Al Arco',
    },
    squad: {
      topPlayers: 'MEJORES JUGADORES',
      menFirstTeam: 'Primer Equipo Masculino',
      aiTacticalRating: 'RATING TÁCTICO IA',
      positions: {
        st: 'DC',
        fw: 'DEL',
        rw: 'ED',
        cm: 'MC',
        gk: 'ARQ',
      },
    },
    ticker: {
      breakingNews: 'ÚLTIMA HORA',
      news1: 'Mercado de Pases: El club anuncia 3 fichajes por $45M',
      news2: 'Academia: 5 jugadores convocados al primer equipo para Champions League',
      news3: 'Mejora del Estadio: Nueva sección VIP abre el próximo mes con 2,000 asientos',
      news4: 'Programa Comunitario: Clínicas de fútbol gratis para 1,000 niños locales este verano',
    },
    transparency: {
      title: 'TRANSPARENCIA FINANCIERA',
      subtitle: 'Resumen del Presupuesto',
      description: 'Mira exactamente cómo tu club invierte en el éxito. Informes financieros publicados trimestralmente.',
      viewDetails: 'Ver Detalles',
      revenueTitle: 'Ingresos',
      expensesTitle: 'Gastos',
      sponsorships: 'Patrocinios',
      ticketSales: 'Venta de Entradas',
      merchandise: 'Mercancía',
      salaries: 'Salarios',
      operations: 'Operaciones',
      academy: 'Academia',
    },
    stadiumVote: {
      title: 'DECISIONES DEL ESTADIO',
      subtitle: 'Vota en Asuntos del Club',
      description: '¿Deberíamos agregar un techo retráctil al estadio?',
      option1: 'Sí, agregar techo',
      option2: 'No, mantener abierto',
      option3: 'Necesito más info',
      vote: 'Votar',
      votesCount: 'fans votaron',
    },
    suggestions: {
      title: 'EXPRESA TUS IDEAS',
      subtitle: 'Enviar Sugerencias',
      placeholder: 'Comparte tus ideas para mejorar la experiencia del fan...',
      send: 'Enviar Sugerencia',
      successMessage: '¡Gracias! Tu sugerencia ha sido enviada.',
    },
    carpool: {
      title: 'COMPARTIR AUTO AL PARTIDO',
      subtitle: 'Comparte Viajes al Estadio',
      description: 'Conecta con fans que van al partido. Ahorra dinero y reduce emisiones.',
      findRide: 'Buscar Viaje',
      offersCount: 'ofertas activas',
    },
    fanAnalysts: {
      title: 'ANALISTAS FANS',
      subtitle: 'Discusión Táctica',
      description: 'Comparte tus análisis tácticos y debate formaciones con otros fans.',
      joinDiscussion: 'Unirse a Discusión',
      analystsCount: 'analistas activos',
    },
    fanCam: {
      title: 'CÁMARA DE FANS',
      subtitle: 'Comparte tu Pasión',
      description: 'Sube tus mejores momentos desde las gradas. Aparece en la pantalla grande.',
      uploadVideo: 'Subir Video',
      videosCount: 'videos subidos',
    },
    faq: {
      title: 'PREGUNTAS FRECUENTES',
      subtitle: 'Preguntas Frecuentes',
      question1: '¿Cómo compro abonos de temporada?',
      answer1: 'Visita nuestra sección de tickets o llama a nuestra boletería al +1-555-0123.',
      question2: '¿Puedo votar en múltiples decisiones del estadio?',
      answer2: 'Sí, todos los fans verificados pueden votar en cada propuesta.',
      question3: '¿Cómo se verifican los informes financieros?',
      answer3: 'Todos los informes son auditados por firmas independientes de terceros.',
    },
    help: {
      title: '¿NECESITAS AYUDA?',
      subtitle: 'Centro de Soporte',
      description: 'Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier pregunta.',
      getHelp: 'Obtener Ayuda',
    },
    socialLinks: {
      title: 'CONÉCTATE CON NOSOTROS',
      subtitle: 'Síguenos en Redes Sociales',
      followUs: 'Síguenos',
    },
    settings: {
      title: 'CONFIGURACIÓN',
      subtitle: 'Preferencias',
      notifications: 'Notificaciones Push',
      darkMode: 'Modo Oscuro',
      language: 'Idioma',
      privacy: 'Configuración de Privacidad',
    },
    notifications: {
      title: 'NOTIFICACIONES',
      subtitle: 'Actualizaciones Recientes',
      markAllRead: 'Marcar Todas Leídas',
      notification1: '¡El partido comienza en 2 horas! Consigue tus entradas ahora.',
      notification2: 'Nuevo informe financiero publicado para Q4 2023.',
      notification3: 'Tu voto sobre la instalación del techo está activo.',
    },
    sponsors: {
      officialAirline: 'Aerolínea Oficial',
      officialKitSupplier: 'Proveedor Oficial de Indumentaria',
      sponsored: 'Patrocinado',
      shopNow: 'Comprar Ahora',
      bookFlight: 'Reservar Vuelo',
      freeShipping: 'Envío Gratis',
      newSeasonCollection: 'Colección nueva temporada',
      exclusiveOffers: 'Ofertas exclusivas para socios',
      flyWorldwide: 'Vuela a más de 200 destinos',
      unleashFandom: 'Libera tu Pasión',
      latestGear: 'Consigue el último equipamiento de fan, camisetas de edición limitada y botines exclusivos. Muestra el orgullo de tu equipo con mercancía auténtica.',
    },
    bottomNav: {
      home: 'Inicio',
      squad: 'Plantel',
      tickets: 'Entradas',
      news: 'Noticias',
      profile: 'Perfil',
    },
  },
  pt: {
    header: {
      fanZone: 'ZONA DOS TORCEDORES',
      myClub: 'MEU CLUBE',
    },
    liveMatch: {
      live: 'Ao Vivo',
      possession: 'Posse',
      shots: 'Chutes',
      onTarget: 'No Gol',
    },
    squad: {
      topPlayers: 'MELHORES JOGADORES',
      menFirstTeam: 'Equipe Masculina Principal',
      aiTacticalRating: 'AVALIAÇÃO TÁTICA IA',
      positions: {
        st: 'ATA',
        fw: 'ATA',
        rw: 'PD',
        cm: 'MC',
        gk: 'GOL',
      },
    },
    ticker: {
      breakingNews: 'ÚLTIMA NOTÍCIA',
      news1: 'Janela de Transferências: Clube anuncia 3 novas contratações no valor de $45M',
      news2: 'Academia: 5 jogadores convocados para o time principal para a Liga dos Campeões',
      news3: 'Melhoria do Estádio: Nova seção VIP abrindo no próximo mês com 2.000 assentos',
      news4: 'Programa Comunitário: Clínicas de futebol gratuitas para 1.000 crianças locais neste verão',
    },
    transparency: {
      title: 'TRANSPARÊNCIA FINANCEIRA',
      subtitle: 'Visão Geral do Orçamento',
      description: 'Veja exatamente como seu clube investe no sucesso. Relatórios financeiros publicados trimestralmente.',
      viewDetails: 'Ver Detalhes',
      revenueTitle: 'Receita',
      expensesTitle: 'Despesas',
      sponsorships: 'Patrocínios',
      ticketSales: 'Venda de Ingressos',
      merchandise: 'Produtos',
      salaries: 'Salários',
      operations: 'Operações',
      academy: 'Academia',
    },
    stadiumVote: {
      title: 'DECISÕES DO ESTÁDIO',
      subtitle: 'Vote em Assuntos do Clube',
      description: 'Devemos adicionar um teto retrátil ao estádio?',
      option1: 'Sim, adicionar teto',
      option2: 'Não, manter aberto',
      option3: 'Preciso mais informações',
      vote: 'Votar',
      votesCount: 'torcedores votaram',
    },
    suggestions: {
      title: 'EXPRESSE SUAS IDEIAS',
      subtitle: 'Enviar Sugestões',
      placeholder: 'Compartilhe suas ideias para melhorar a experiência do torcedor...',
      send: 'Enviar Sugestão',
      successMessage: 'Obrigado! Sua sugestão foi enviada.',
    },
    carpool: {
      title: 'CARONA NO DIA DO JOGO',
      subtitle: 'Compartilhe Caronas para o Estádio',
      description: 'Conecte-se com torcedores indo ao jogo. Economize dinheiro e reduza emissões.',
      findRide: 'Encontrar Carona',
      offersCount: 'ofertas ativas',
    },
    fanAnalysts: {
      title: 'ANALISTAS TORCEDORES',
      subtitle: 'Discussão Tática',
      description: 'Compartilhe suas análises táticas e debata formações com outros torcedores.',
      joinDiscussion: 'Participar da Discussão',
      analystsCount: 'analistas ativos',
    },
    fanCam: {
      title: 'CÂMERA DOS TORCEDORES',
      subtitle: 'Compartilhe sua Paixão',
      description: 'Envie seus melhores momentos das arquibancadas. Apareça no telão.',
      uploadVideo: 'Enviar Vídeo',
      videosCount: 'vídeos enviados',
    },
    faq: {
      title: 'PERGUNTAS FREQUENTES',
      subtitle: 'Perguntas Frequentes',
      question1: 'Como compro ingressos de temporada?',
      answer1: 'Visite nossa seção de ingressos ou ligue para nossa bilheteria em +1-555-0123.',
      question2: 'Posso votar em várias decisões do estádio?',
      answer2: 'Sim, todos os torcedores verificados podem votar em cada proposta.',
      question3: 'Como os relatórios financeiros são verificados?',
      answer3: 'Todos os relatórios são auditados por empresas independentes de terceiros.',
    },
    help: {
      title: 'PRECISA DE AJUDA?',
      subtitle: 'Centro de Suporte',
      description: 'Nossa equipe de suporte está disponível 24 horas por dia, 7 dias por semana, para ajudá-lo com qualquer dúvida.',
      getHelp: 'Obter Ajuda',
    },
    socialLinks: {
      title: 'CONECTE-SE CONOSCO',
      subtitle: 'Siga nas Redes Sociais',
      followUs: 'Siga-nos',
    },
    settings: {
      title: 'CONFIGURAÇÕES',
      subtitle: 'Preferências',
      notifications: 'Notificações Push',
      darkMode: 'Modo Escuro',
      language: 'Idioma',
      privacy: 'Configurações de Privacidade',
    },
    notifications: {
      title: 'NOTIFICAÇÕES',
      subtitle: 'Atualizações Recentes',
      markAllRead: 'Marcar Todas como Lidas',
      notification1: 'A partida começa em 2 horas! Compre seus ingressos agora.',
      notification2: 'Novo relatório financeiro publicado para o Q4 2023.',
      notification3: 'Sua votação sobre a instalação do teto está ativa.',
    },
    sponsors: {
      officialAirline: 'Companhia Aérea Oficial',
      officialKitSupplier: 'Fornecedor Oficial de Uniformes',
      sponsored: 'Patrocinado',
      shopNow: 'Comprar Agora',
      bookFlight: 'Reservar Voo',
      freeShipping: 'Frete Grátis',
      newSeasonCollection: 'Coleção nova temporada',
      exclusiveOffers: 'Ofertas exclusivas para membros',
      flyWorldwide: 'Voe para mais de 200 destinos',
      unleashFandom: 'Liberte sua Paixão',
      latestGear: 'Obtenha os últimos equipamentos de torcedor, camisas de edição limitada e chuteiras exclusivas. Mostre o orgulho do seu time com produtos autênticos.',
    },
    bottomNav: {
      home: 'Início',
      squad: 'Elenco',
      tickets: 'Ingressos',
      news: 'Notícias',
      profile: 'Perfil',
    },
  },
};
