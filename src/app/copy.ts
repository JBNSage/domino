import {
  DEFAULT_NAMES,
  DEFAULT_QUICK_VALUE,
  DEFAULT_TARGET,
  MAX_POINTS,
  MAX_TARGET,
  Players,
  UNDO_SECONDS,
} from './game/state';
import { MAX_SAVED_TEAMS, MAX_TABLES, MAX_TABLE_PLAYERS } from './game/tables';
import { MAX_COUNT, MAX_TEAMS, Rule } from './game/tournament';

const dateFormat = new Intl.DateTimeFormat('es', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** "Ana, Luis y Marta". */
export function joinNames(names: string[]): string {
  if (typeof Intl.ListFormat !== 'function') return names.join(', ');
  return new Intl.ListFormat('es', { type: 'conjunction' }).format(names);
}

const percentFormat = new Intl.NumberFormat('es', { style: 'percent', maximumFractionDigits: 0 });
const dayFormat = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const matches = (count: number) => (count === 1 ? '1 partida' : `${count} partidas`);
const wins = (count: number) => (count === 1 ? '1 victoria' : `${count} victorias`);
const players = (count: number) => (count === 1 ? '1 jugador' : `${count} jugadores`);
const teams = (count: number) => (count === 1 ? '1 equipo' : `${count} equipos`);

export const copy = {
  date: (time: number) => dateFormat.format(time),
  home: {
    title: 'Dominó',
    quick: 'Partida rápida',
    /** What the grid plays, said for each of the matches it can hold. */
    gridA11y: (
      kind: 'quick' | 'prepared' | 'rematch',
      a: string,
      b: string,
      target: number,
      quick: number,
    ) => {
      const match = `${a} contra ${b}, meta ${target}, puntos rápidos +${quick}`;
      if (kind === 'prepared') return `Empezar partida: ${match}`;
      if (kind === 'rematch') return `Revancha: ${match}, como la última partida`;
      return `Partida rápida: ${match}`;
    },
    start: 'Empezar partida',
    quickShort: 'Rápida',
    rematch: 'Revancha',
    facts: (target: number, quick: number) => `Meta ${target} · Puntos rápidos +${quick}`,
    /** The quick match as a choice, once the grid holds another match. */
    quickHelp: `${DEFAULT_NAMES.a} vs ${DEFAULT_NAMES.b} · Meta ${DEFAULT_TARGET}`,
    quickChoiceA11y: `Partida rápida: ${DEFAULT_NAMES.a} contra ${DEFAULT_NAMES.b}, meta ${DEFAULT_TARGET}, puntos rápidos +${DEFAULT_QUICK_VALUE}`,
    custom: 'Personalizar partida',
    customShort: 'Personalizar',
    customHelp: 'Equipos, jugadores y reglas',
    tournament: 'Torneo',
    tournamentHelp: 'Varios equipos, por turnos',
    choices: 'Otras formas de jugar',
  },
  setup: {
    title: 'Personalizar partida',
    lead: 'Toca un equipo para cambiar su nombre o sus jugadores.',
    leadTable: 'Toca un equipo para cambiar sus jugadores o poner otro equipo de la mesa.',
    rules: 'Reglas',
    target: 'Meta',
    targetA11y: (target: number) => `Meta: ${target} puntos para ganar. Cambiar`,
    quick: 'Rápidos',
    quickA11y: (value: number) => `Puntos rápidos: +${value}. Cambiar`,
  },
  target: {
    label: 'Meta',
    edit: (target: number) => `Meta: ${target} puntos para ganar. Cambiar los ajustes.`,
  },
  settings: {
    title: 'Ajustes',
    targetLabel: 'Meta: puntos para ganar',
    targetError: `Escribe un número entre 1 y ${MAX_TARGET}.`,
    quickLabel: 'Puntos rápidos: el botón +',
    quickError: `Escribe un número entre 1 y ${MAX_POINTS}.`,
    endsRound: (name: string, total: number) =>
      `${name} ya tiene ${total}: al guardar, la partida termina a su favor.`,
    save: 'Guardar',
    saveAndEnd: 'Terminar partida',
  },
  bar: {
    enter: 'Anotar',
    enterA11y: (team: string) => `Anotar puntos para ${team}`,
    quick: (value: number) => `+${value}`,
    quickA11y: (value: number, team: string) => `Sumar ${value} a ${team}`,
  },
  team: {
    remaining: (points: number) => `Faltan ${points}`,
    wins,
    a11y: (name: string, players: Players | null, total: number, remaining: number, won: number) =>
      [
        players ? `${name}, ${joinNames(players)}` : name,
        `${total} puntos`,
        `faltan ${remaining}`,
        won === 1 ? '1 partida ganada' : `${won} partidas ganadas`,
      ].join(', '),
    a11yHint: 'Anotar puntos',
    announce: (name: string, total: number) => `${name}: ${total}`,
  },
  moments: {
    lead: '¡Se pone delante!',
    vs: 'VS',
    match: (position: number) => `Partida ${position}`,
    tieBreak: 'Desempate',
    matchPoint: (points: number) => `Faltan ${points} para ganar`,
    toWin: 'para ganar',
    enters: 'Entra',
  },
  list: {
    emptyTitle: 'Sin manos anotadas',
    emptyBody: 'Toca Anotar, abajo, para apuntar la primera mano.',
    watchingBody: 'Las manos aparecen aquí cuando alguien de la mesa las anota.',
    rowA11y: (hand: number, team: string, points: number) => `Mano ${hand}: ${points} para ${team}`,
    rowHint: 'Opciones',
    edit: 'Corregir',
    editA11y: (hand: number) => `Corregir mano ${hand}`,
    delete: 'Eliminar',
    deleteA11y: (hand: number) => `Eliminar mano ${hand}`,
    keep: 'Cancelar',
  },
  points: {
    nameLabel: 'Anotar para',
    nameA11y: 'Nombre del equipo',
    nameEdit: 'Cambiar el nombre',
    dialogA11y: (team: string) => `Anotar para ${team}`,
    inputLabel: 'Puntos de la mano',
    confirm: 'Anotar',
    saveName: 'Guardar nombre',
    error: `Escribe un número entre 1 y ${MAX_POINTS}, sin signos ni decimales.`,
    editTitle: (hand: number, team: string) => `Corregir mano ${hand} de ${team}`,
    editConfirm: 'Guardar',
  },
  winner: {
    title: '¡Felicidades!',
    // A team name can be singular or plural, so no verb depends on it.
    body: (name: string) => `Victoria de ${name}`,
    winsAfter: (count: number) =>
      count === 1 ? 'Primera partida ganada' : `${count} partidas ganadas`,
    close: 'Nueva partida',
    correct: 'Corregir última mano',
    restoreTarget: (target: number) => `Volver a meta ${target}`,
    undoEdit: 'Deshacer la corrección',
    changeTarget: 'Cambiar la meta',
    rotate: 'Cambiar equipos',
    rotateA11y: 'Contar la victoria y elegir otros equipos o jugadores',
  },
  undo: {
    handDeleted: (hand: number) => `Mano ${hand} eliminada`,
    handEdited: (hand: number, points: number) => `Mano ${hand} corregida a ${points}`,
    quickAdded: (value: number, team: string) => `+${value} a ${team}`,
    roundClosed: 'Partida cerrada',
    // What a start from Inicio replaced, named so the offer to undo it is understood.
    before: ({
      teams,
      target,
      quick,
    }: {
      teams: [string, string] | null;
      target: number | null;
      quick: number | null;
    }) =>
      [
        teams === null ? null : `${teams[0]} vs ${teams[1]}`,
        target === null ? null : `meta ${target}`,
        quick === null ? null : `+${quick}`,
      ]
        .filter((part) => part !== null)
        .join(', ') || 'las victorias',
    quickMatch: (before: string) => `Partida rápida. Antes: ${before}`,
    rematch: (before: string) => `Revancha. Antes: ${before}`,
    handsCleared: 'Manos borradas',
    allReset: 'Todo reiniciado',
    matchDeleted: 'Partida eliminada',
    tournamentDeleted: 'Torneo eliminado',
    historyCleared: 'Historial borrado',
    tournamentStarted: 'Torneo empezado',
    tournamentEnded: 'Torneo terminado',
    tournamentCancelled: 'Torneo cancelado',
    tournamentSaved: 'Torneo guardado',
    tieBreakStarted: 'Desempate empezado',
    tableDeleted: 'Mesa eliminada',
    playerDeleted: 'Jugador eliminado',
    teamDeleted: 'Equipo eliminado',
    action: 'Deshacer',
    done: 'Deshecho',
  },
  reset: {
    a11y: 'Borrar la partida o reiniciar todo',
    title: '¿Qué quieres borrar?',
    hands: 'Solo las manos',
    handsHelp: 'La partida empieza de cero. Se conservan equipos, victorias y ajustes.',
    all: 'Todo',
    allHelp:
      'También vuelve a Equipo A y Equipo B sin jugadores, 0 victorias, meta 200 y +30. El historial se conserva.',
    undoNote: 'Las dos opciones se pueden deshacer.',
    undoNoteOne: 'Se puede deshacer.',
    tournament: 'Estás en un torneo. Se termina desde la tabla.',
    openTable: 'Abrir la tabla',
    cancel: 'Cancelar',
  },
  appearance: {
    label: 'Apariencia',
    system: 'Sistema',
    light: 'Claro',
    dark: 'Oscuro',
    announce: (name: string) => `Apariencia: ${name}`,
  },
  me: {
    /** What a new phone is called until its person picks a name: domino words, 16 letters at most. */
    names: [
      'Doble Seis',
      'Doble Cinco',
      'Doble Blanco',
      'Capicúa',
      'La Mula',
      'El Tranque',
      'Pase Corto',
      'Ficha Alta',
      'Seis Doble',
      'La Chiva',
      'El Capicúa',
      'Mano Firme',
      'Puntos Locos',
      'Tranca Fina',
      'El Ahorcado',
      'Pollona',
      'La Caja',
      'El Repique',
      'Blanca Doble',
      'Tres y Dos',
      'Cuatro Cuatro',
      'Ficha Tapada',
      'Salida Seca',
      'Cierre Limpio',
    ],
    label: 'Tu nombre',
    a11y: (name: string) => `Tu nombre: ${name}. Cambiar`,
    title: 'Tu nombre',
    fieldLabel: 'Cómo te ven en las mesas compartidas',
    empty: 'Escribe un nombre.',
    save: 'Guardar',
  },
  share: {
    title: 'Compartir mesa',
    lead: (mesa: string) =>
      `Quien abra el enlace se une a ${mesa} con su propio nombre y ve sus partidas. Tú decides quién anota.`,
    preparing: 'Preparando el enlace…',
    whatsapp: 'Enviar por WhatsApp',
    copy: 'Copiar enlace',
    copied: 'Enlace copiado',
    copyFailed: 'No se pudo copiar. Mantén pulsado el enlace para copiarlo.',
    native: 'Compartir…',
    message: (mesa: string, link: string) => `Únete a la mesa ${mesa} en Dominó: ${link}`,
    qr: (mesa: string) => `Código QR para unirse a ${mesa}`,
    people: (count: number) => (count === 1 ? '1 persona' : `${count} personas`),
    you: 'Tú',
    owner: 'Dueño',
    ownerHelp: 'Cambia la mesa y decide quién entra',
    scores: 'Anota',
    scoresHelp: 'Puede sumar puntos en la partida',
    ownerA11y: (name: string) => `${name} es dueño de la mesa`,
    scoresA11y: (name: string) => `${name} puede anotar`,
    remove: 'Quitar',
    removeA11y: (name: string) => `Quitar a ${name} de la mesa`,
    removed: (name: string) => `${name} ya no está en la mesa`,
    removeTitle: (name: string) => `¿Quitar a ${name} de la mesa?`,
    removeBody:
      'Deja de ver la mesa y sus partidas. Sus manos y partidas se quedan. Para volver necesita un enlace.',
    newLink: 'Crear enlace nuevo',
    newLinkHelp: 'El enlace anterior deja de servir para entrar.',
    newLinkDone: 'Enlace nuevo creado',
    start: 'Compartir',
    startA11y: (mesa: string) => `Compartir ${mesa}`,
    starting: 'Compartiendo…',
    failed: 'No se pudo compartir. Revisa la conexión y vuelve a intentarlo.',
  },
  join: {
    title: (mesa: string) => (mesa === '' ? 'Unirse a una mesa' : `Unirse a ${mesa}`),
    lead: 'Verás sus jugadores, equipos y partidas. Cuando un dueño te deje, también podrás anotar.',
    as: 'Te unes como',
    asA11y: (name: string) => `Te unes como ${name}. Cambiar nombre`,
    join: 'Unirse',
    joining: 'Uniéndote…',
    later: 'Ahora no',
    offline: 'Sin conexión. Para unirte hace falta internet una vez.',
    refused: 'Este enlace ya no sirve. Pide uno nuevo a un dueño de la mesa.',
    joined: (mesa: string) => `Te uniste a ${mesa}`,
    inApp:
      '¿Tienes Dominó instalado? Para unirte desde la app, ábrela y en Mesas toca Escanear QR, o copia este enlace y pégalo en Unirse con un enlace.',
    inAppIosTitle: '¿Usas la app instalada?',
    inAppIos:
      'En iPhone los enlaces y los QR siempre abren Safari, no la app. Para unirte desde la app: ábrela, ve a Mesas y toca Escanear QR, o copia este enlace y pégalo en Unirse con un enlace.',
    here: 'O únete aquí, en Safari:',
    copyLink: 'Copiar enlace',
    copied: 'Enlace copiado',
    byLink: 'Unirse con un enlace',
    linkTitle: 'Unirse con un enlace',
    linkLabel: 'Enlace de la mesa',
    linkHelp: 'Pega el enlace que te mandaron por WhatsApp o que copiaste.',
    linkWrong: 'Ese enlace no es de una mesa de Dominó.',
    paste: 'Pegar',
    continue: 'Seguir',
    scan: 'Escanear QR',
    scanTitle: 'Escanear QR',
    scanLead: 'Apunta al código QR de la mesa, en el teléfono de quien la comparte.',
    scanStarting: 'Abriendo la cámara…',
    scanDenied:
      'Para escanear hace falta la cámara. Permítela en los ajustes del teléfono, o pega el enlace.',
    scanUnavailable: 'Este teléfono no deja usar la cámara aquí. Pega el enlace.',
    scanWrong: 'Ese código no es de una mesa de Dominó.',
    scanVideo: 'Vista de la cámara',
  },
  menu: {
    a11y: 'Menú',
    title: 'Menú',
    home: 'Inicio',
    homeHelp: 'Elige cómo jugar',
    tournament: 'Torneo',
    table: 'Tabla del torneo',
    history: 'Historial',
    stats: 'Estadísticas',
    mesas: 'Mesas',
    mesa: (name: string | null) => (name === null ? 'Ninguna en uso' : `En uso: ${name}`),
    mesaA11y: (name: string | null) =>
      name === null
        ? 'Mesas: los jugadores y equipos de cada lugar. Ninguna en uso'
        : `Mesas. En uso: ${name}`,
    teams: 'Equipos y jugadores',
    teamA11y: (name: string) => `Cambiar el equipo ${name} y sus jugadores`,
    reset: 'Borrar',
    close: 'Cerrar',
  },
  players: {
    title: 'Equipo',
    newTitle: 'Equipo nuevo',
    nameLabel: 'Nombre del equipo',
    first: 'Jugador 1',
    second: 'Jugador 2',
    optional: 'Los jugadores son opcionales: escribe los dos o ninguno.',
    incomplete: 'Falta un jugador. Escribe los dos, o deja los dos en blanco.',
    optionalPick: 'Los jugadores son opcionales: elige los dos o ninguno.',
    incompletePick: 'Falta un jugador. Elige los dos, o quita el que está.',
    limit: (length: number) => `Los nombres tienen ${length} caracteres como máximo.`,
    taken: 'Ya hay un equipo con ese nombre.',
    save: 'Guardar',
    add: 'Añadir',
    remove: 'Eliminar equipo',
    pair: (players: Players) => `${players[0]} · ${players[1]}`,
    none: 'Sin jugadores',
  },
  history: {
    title: 'Historial',
    filter: 'Mostrar',
    all: 'Todo',
    matches: 'Partidas',
    tournaments: 'Torneos',
    emptyTitle: 'Sin partidas terminadas',
    emptyBody: 'Cuando un equipo llega a la meta y cierras la partida, queda guardada aquí.',
    noMatchesTitle: 'Sin partidas sueltas',
    noMatchesBody: 'Aquí aparecen las partidas jugadas fuera de un torneo.',
    noTournamentsTitle: 'Sin torneos terminados',
    noTournamentsBody: 'Empieza uno desde el menú, con «Torneo nuevo».',
    clear: 'Borrar historial',
    clearTitle: '¿Borrar el historial?',
    clearShared: 'Las partidas de las mesas compartidas se quedan en sus mesas.',
    clearBody: (single: number, tournaments: number) => {
      const parts = [
        ...(single > 0 ? [matches(single)] : []),
        ...(tournaments > 0
          ? [
              tournaments === 1
                ? '1 torneo con sus partidas'
                : `${tournaments} torneos con sus partidas`,
            ]
          : []),
      ];
      return `Se borra todo: ${joinNames(parts)}.`;
    },
    clearUndo: `Se puede deshacer durante ${UNDO_SECONDS} segundos.`,
    matchNumber: (position: number) => `Partida ${position}`,
    matchTitle: 'Partida',
    tournamentTitle: 'Torneo',
    target: (target: number) => `Meta ${target}`,
    hands: (count: number) => (count === 1 ? '1 mano' : `${count} manos`),
    winner: 'Ganador',
    champion: 'Campeón',
    noChampion: 'Sin campeón',
    summary: (teams: number, played: number) => `${teams} equipos · ${matches(played)}`,
    tieBreak: 'Desempate',
    inTournament: 'Partida de torneo',
    table: (name: string) => `Mesa ${name}`,
    ranking: 'Clasificación',
    matchesHeading: 'Partidas',
    missing: 'Las partidas de este torneo ya no están guardadas.',
    delete: 'Eliminar',
    matchA11y: (
      date: string,
      winner: string,
      winnerTotal: number,
      loser: string,
      loserTotal: number,
    ) =>
      `${date}. Victoria de ${winner}, ${winnerTotal} a ${loserTotal}, contra ${loser}. Ver la partida`,
    tournamentA11y: (date: string, teams: number, played: number, champion: string | null) =>
      [
        `${date}. Torneo de ${teams} equipos, ${matches(played)}`,
        champion ? `Campeón: ${champion}` : 'Sin campeón',
        'Ver el torneo',
      ].join('. '),
    handA11y: (hand: number, team: string, points: number) =>
      `Mano ${hand}: ${points} para ${team}`,
  },
  tournament: {
    setupTitle: 'Torneo nuevo',
    teams: 'Equipos',
    teamA11y: (position: number, name: string, players: Players | null) =>
      `Equipo ${position}: ${name}, ${players ? joinNames(players) : 'sin jugadores'}. Cambiar`,
    add: 'Añadir equipo',
    addSavedA11y: (name: string, pair: Players | null) =>
      `${pair ? `${name}, ${joinNames(pair)}` : name}. Añadir al torneo`,
    full: `Un torneo tiene ${MAX_TEAMS} equipos como máximo.`,
    defaultName: (position: number) => `Equipo ${position}`,
    ruleLabel: 'Final del torneo',
    firstTo: 'Primero a',
    bestOf: 'Mejor de',
    free: 'Libre',
    firstToLabel: 'Victorias para ganar',
    bestOfLabel: 'Al mejor de cuántas partidas',
    countError: `Escribe un número entre 1 y ${MAX_COUNT}.`,
    needs: (count: number) =>
      count === 1
        ? 'Gana el primer equipo que gane una partida.'
        : `Gana el primer equipo que llegue a ${count} victorias.`,
    // With three teams or more the wins are shared out, so the count of matches is not fixed.
    needsMajority: (count: number, of: number, teams: number) =>
      teams > 2
        ? `Gana el primer equipo que llegue a ${wins(count)}, la mayoría de ${of}. Con ${teams} equipos pueden hacer falta más de ${of} partidas.`
        : `Gana el primer equipo que llegue a ${wins(count)}, la mayoría de ${of}.`,
    rotation:
      'En cada partida el ganador se queda y entra el equipo que más ha esperado. Antes de empezar cada una puedes cambiar quién juega.',
    status: (needed: number | null, match: number, tieBreak: boolean) => {
      const goal = needed === null ? 'Torneo libre' : `Gana con ${wins(needed)}`;
      return `${tieBreak ? 'Desempate' : goal} · Partida ${match}`;
    },
    statusA11y: (status: string) => `${status}. Ver la tabla del torneo`,
    playing: 'En juego',
    freeNote: 'Sin límite: el torneo sigue hasta que lo termines desde la tabla.',
    clears: 'Al empezar, el marcador vuelve a cero. Se puede deshacer.',
    start: 'Empezar torneo',
    rule: (rule: Rule) => {
      if (rule.kind === 'free') return 'Libre';
      return rule.kind === 'firstTo' ? `Primero a ${rule.count}` : `Mejor de ${rule.count}`;
    },
    table: 'Tabla',
    tableA11y: 'Ver la tabla del torneo',
    played: (count: number) =>
      count === 0
        ? 'Sin partidas jugadas'
        : `${matches(count)} ${count === 1 ? 'jugada' : 'jugadas'}`,
    columnTeam: 'Equipo',
    columnWon: 'G',
    columnLost: 'P',
    columnsA11y: 'G: partidas ganadas. P: partidas perdidas.',
    rankA11y: (
      position: number,
      name: string,
      players: Players | null,
      won: number,
      lost: number,
      playing: boolean,
    ) =>
      [
        `Puesto ${position}: ${name}`,
        ...(players ? [joinNames(players)] : []),
        won === 1 ? '1 ganada' : `${won} ganadas`,
        lost === 1 ? '1 perdida' : `${lost} perdidas`,
        ...(playing ? ['en juego'] : []),
      ].join(', '),
    wins,
    end: 'Terminar torneo',
    endTitle: '¿Terminar el torneo?',
    endLeader: (name: string) => `Si termina ahora, el campeón es ${name}.`,
    endStillTied: (names: string[]) =>
      `El desempate sigue igualado entre ${joinNames(names)}. Si termina ahora, no hay campeón.`,
    endTie: (names: string[]) =>
      `Hay empate en el primer lugar: ${joinNames(names)}. Un desempate decide el campeón.`,
    endEmpty: 'No se ha jugado ninguna partida. El torneo se cancela y no se guarda.',
    endDiscards: 'Las manos de la partida en curso se descartan.',
    endUndo: 'Se puede deshacer.',
    playTieBreak: 'Jugar desempate',
    endWithout: 'Terminar sin campeón',
    cancelTournament: 'Cancelar torneo',
    keep: 'Seguir jugando',
    nextTitle: 'Siguiente partida',
    firstTitle: 'Primera partida',
    tieBreakTitle: 'Desempate',
    nextBody: 'El ganador se queda. Toca un equipo para cambiarlo o cambiar sus jugadores.',
    firstBody: 'Toca un equipo para cambiarlo o cambiar sus jugadores.',
    nextFixed: 'No hay otros equipos esperando.',
    tableBody: 'Toca un equipo para cambiar sus jugadores o poner otro equipo.',
    shared: (name: string) =>
      `${name} está en los dos equipos. Cambia uno de los dos para empezar.`,
    seatA11y: (name: string, players: Players | null, won: number) =>
      `${players ? `${name}, ${joinNames(players)}` : name}, ${wins(won)}. Cambiar este equipo`,
    seatFixedA11y: (name: string, players: Players | null, won: number) =>
      `${players ? `${name}, ${joinNames(players)}` : name}, ${wins(won)}`,
    waiting: 'Esperan turno',
    startMatch: 'Empezar partida',
    pickTitle: (name: string) => `¿Quién juega en lugar de ${name}?`,
    pickA11y: (name: string, won: number) => `${name}, ${wins(won)}. Elegir`,
    next: 'Siguiente partida',
    result: 'Ver resultado',
    championTitle: 'Campeón del torneo',
    endedTitle: 'Torneo terminado',
    tied: (names: string[]) => `Sin campeón: empate entre ${joinNames(names)}.`,
    finish: 'Guardar y salir',
    undoA11y: (message: string) => `Deshacer: ${message}`,
    tieBreakNote: (names: string[]) => `Desempate entre ${joinNames(names)}.`,
    announceChampion: (name: string) => `Campeón del torneo: ${name}`,
  },
  tables: {
    title: 'Mesas',
    intro:
      'Una mesa guarda a quienes suelen jugar en un lugar y los equipos que forman. Al jugar en ella, eliges a los jugadores de una lista.',
    none: 'Sin mesa',
    playingAt: (name: string) => `Juegas en ${name}.`,
    playingNone: 'Juegas sin mesa: los jugadores se escriben a mano.',
    leave: 'Jugar sin mesa',
    play: 'Jugar en esta mesa',
    playA11y: (name: string) => `Jugar en la mesa ${name}`,
    rename: 'Cambiar nombre',
    summary: (playerCount: number, teamCount: number) =>
      `${players(playerCount)} · ${teams(teamCount)}`,
    inUse: 'En uso',
    openA11y: (name: string, summary: string, inUse: boolean) =>
      `${name}, ${summary}${inUse ? ', en uso' : ''}. Abrir`,
    add: 'Mesa nueva',
    full: `Hay ${MAX_TABLES} mesas como máximo.`,
    newTitle: 'Mesa nueva',
    nameTitle: 'Nombre de la mesa',
    nameLabel: 'Nombre de la mesa',
    namePlaceholder: 'Casa de Ana',
    nameTaken: 'Ya hay una mesa con ese nombre.',
    nameEmpty: 'Escribe un nombre para la mesa.',
    nameA11y: (name: string) => `Nombre: ${name}. Cambiar`,
    create: 'Crear',
    players: (count: number) => `Jugadores (${count})`,
    showAll: (count: number) => `Ver los ${count}`,
    showFewer: 'Ver menos',
    noPlayers: 'Todavía no hay jugadores. Añade a quienes suelen jugar aquí.',
    addPlayer: 'Añadir jugador',
    playersFull: `Una mesa tiene ${MAX_TABLE_PLAYERS} jugadores como máximo.`,
    playerTitle: 'Jugador',
    newPlayerTitle: 'Jugador nuevo',
    playerLabel: 'Nombre del jugador',
    playerTaken: 'Ya hay un jugador con ese nombre en esta mesa.',
    playerEmpty: 'Escribe el nombre del jugador.',
    playerA11y: (name: string) => `${name}. Cambiar el nombre o eliminar`,
    playerInUse: (names: string[]) =>
      `Juega en ${joinNames(names)}. Para eliminarlo, cambia o elimina ese equipo antes.`,
    removePlayer: 'Eliminar jugador',
    shared: 'Compartida',
    sharedSummary: (people: number) =>
      people === 1 ? 'Compartida con 1 persona' : `Compartida con ${people} personas`,
    people: (count: number) => `Personas (${count})`,
    person: 'Persona',
    personA11y: (name: string, owner: boolean, scores: boolean) =>
      `${name}${owner ? ', dueño' : scores ? ', anota' : ', mira'}`,
    watchOnly: 'Solo los dueños cambian esta mesa.',
    leaveMesa: 'Salir de la mesa',
    leaveTitle: (name: string) => `¿Salir de ${name}?`,
    leaveBody: 'Dejarás de ver sus partidas. Para volver necesitas un enlace de un dueño.',
    leaving: (name: string) => `Saliste de ${name}`,
    view: 'Ver esta mesa',
    removeShared: 'Se borra para todos, con sus partidas. No se puede deshacer.',
    removeFailed: 'No se pudo eliminar. Revisa la conexión y vuelve a intentarlo.',
    playerAdded: (name: string) => `${name} está en la mesa`,
    teams: (count: number) => `Equipos guardados (${count})`,
    noTeams: 'Sin equipos guardados. Añade uno aquí o márcalo en la partida.',
    addTeam: 'Añadir equipo',
    teamsFull: `Una mesa guarda ${MAX_SAVED_TEAMS} equipos como máximo.`,
    teamA11y: (name: string, pair: Players | null, won: number) =>
      `${pair ? `${name}, ${joinNames(pair)}` : name}, ${wins(won)}. Cambiar o eliminar`,
    remove: 'Eliminar mesa',
    removeTitle: (name: string) => `¿Eliminar la mesa ${name}?`,
    removeBody: (playerCount: number, teamCount: number) =>
      `Se borran ${players(playerCount)} y ${teams(teamCount)} guardados. El historial se conserva.`,
    removeUndo: `Se puede deshacer durante ${UNDO_SECONDS} segundos.`,
    status: (name: string) => `Mesa: ${name}`,
    watching: (name: string) => `Mesa: ${name} · Mirando`,
    watchingA11y: (name: string) =>
      `Mesa ${name}. Solo miras: un dueño de la mesa decide quién anota. Ver las mesas`,
    withTournament: (status: string, name: string) => `${status} · ${name}`,
    statusA11y: (name: string) => `Mesa: ${name}. Cambiar de mesa`,
    announce: (name: string | null) => (name === null ? 'Sin mesa' : `Mesa: ${name}`),
  },
  picker: {
    empty: 'Elegir',
    slotA11y: (label: string, name: string | null) =>
      name === null ? `${label}: sin elegir` : `${label}: ${name}. Quitar`,
    search: 'Buscar o añadir jugador',
    list: (count: number) => `Jugadores de la mesa (${count})`,
    add: (name: string) => `Añadir «${name}» a la mesa`,
    addA11y: (name: string) => `Añadir a ${name} a la mesa y elegirlo`,
    blocked: 'En el otro equipo',
    playerA11y: (name: string, chosen: boolean, blocked: boolean) => {
      if (blocked) return `${name}, en el otro equipo`;
      return chosen ? `${name}, elegido. Quitar` : `${name}. Elegir`;
    },
    chosen: (name: string, slot: string) => `${name} en ${slot}`,
    cleared: (slot: string) => `${slot} sin elegir`,
    noMatch: 'Ningún jugador con ese nombre.',
    noPlayers: 'La mesa no tiene jugadores. Escribe un nombre para añadirlo.',
    full: `La mesa ya tiene ${MAX_TABLE_PLAYERS} jugadores.`,
    keep: 'Guardar en la mesa',
    keepOn: 'Queda en los equipos de la mesa, con sus victorias.',
    keepOff: 'Solo para esta partida.',
    keepOffSaved: (name: string) =>
      `${name} queda en la mesa como está. Con otros jugadores, juega otro equipo.`,
    keepOnSaved: (name: string) => `${name} pasa a tener estos jugadores y sus victorias.`,
    keepFull: `La mesa ya guarda ${MAX_SAVED_TEAMS} equipos.`,
  },
  stats: {
    title: 'Estadísticas',
    view: 'Ver',
    players: 'Jugadores',
    couples: 'Parejas',
    percent: (rate: number) => percentFormat.format(rate),
    table: (name: string) => `Mesa: ${name}`,
    tableA11y: (name: string) => `Mesa: ${name}. Cambiar`,
    dates: (label: string) => `Fechas: ${label}`,
    datesA11y: (label: string) => `Fechas: ${label}. Cambiar`,
    allTables: 'Todas',
    noTable: 'Sin mesa',
    tableTitle: 'Mesa',
    datesTitle: 'Fechas',
    all: 'Siempre',
    today: 'Hoy',
    week: '7 días',
    month: '30 días',
    custom: 'Fechas…',
    range: (from: number | null, to: number | null) => {
      if (from === null && to === null) return 'Siempre';
      if (from === null) return `hasta ${dayFormat.format(to as number)}`;
      if (to === null) return `desde ${dayFormat.format(from)}`;
      const one = dayFormat.format(from);
      const other = dayFormat.format(to);
      return one === other ? one : `${one} – ${other}`;
    },
    from: 'Desde',
    to: 'Hasta',
    rangeHelp: 'Deja una fecha en blanco para no poner límite por ese lado.',
    rangeError: 'La fecha «Hasta» es anterior a «Desde».',
    apply: 'Aplicar',
    facts: (played: number, count: number, kind: 'players' | 'couples') =>
      `${matches(played)} · ${
        kind === 'players' ? players(count) : count === 1 ? '1 pareja' : `${count} parejas`
      }`,
    record: (won: number, played: number) =>
      played === 1 ? `${won} de 1 ganada` : `${won} de ${played} ganadas`,
    detail: (won: number, lost: number) =>
      `${won === 1 ? '1 ganada' : `${won} ganadas`} · ${lost === 1 ? '1 perdida' : `${lost} perdidas`}`,
    few: (min: number) => `Menos de ${min} partidas`,
    fewNote: 'Con pocas partidas un porcentaje dice poco, así que van aparte y sin puesto.',
    playerMissingTitle: 'Sin partidas con estos filtros',
    playerMissingBody: (name: string) =>
      `${name} no jugó ninguna partida en esa mesa y esas fechas.`,
    partners: 'Con cada pareja',
    rowA11y: (place: string, name: string, rate: number, won: number, played: number) =>
      `${place}${name}, ${percentFormat.format(rate)}, ${won} de ${played} ${played === 1 ? 'ganada' : 'ganadas'}`,
    place: (place: number | null, shared: boolean) =>
      place === null ? '' : `Puesto ${place}${shared ? ', empatado' : ''}: `,
    open: 'Ver sus parejas',
    emptyTitle: 'Sin partidas terminadas',
    emptyBody:
      'Las estadísticas salen del historial. Cuando termines una partida con jugadores, aparecen aquí.',
    noPlayersTitle: 'Sin jugadores en las partidas',
    noPlayersBody:
      'Las estadísticas cuentan a los jugadores de cada equipo. Añádelos en el menú, en «Equipos y jugadores», o juega en una mesa.',
    nothingTitle: 'Nada con estos filtros',
    nothingBody: 'No hay partidas con jugadores en esa mesa y esas fechas.',
    clear: 'Quitar filtros',
    filtered: (table: string, dates: string) => `Mesa: ${table} · Fechas: ${dates}`,
  },
  seat: {
    changePlayers: 'Cambiar jugadores',
    newTeam: 'Equipo nuevo',
    saved: 'Equipos de la mesa',
    waiting: 'Esperan turno',
    noSaved: 'No hay otros equipos guardados en la mesa.',
    optionA11y: (name: string, pair: Players | null, won: number) =>
      `${pair ? `${name}, ${joinNames(pair)}` : name}, ${wins(won)}. Poner este equipo`,
    announce: (name: string) => `Ahora juega ${name}`,
  },
  install: {
    prompt: 'Instálala para abrirla desde la pantalla de inicio, también sin conexión.',
    ios: 'Para instalarla: toca Compartir y luego «Agregar a pantalla de inicio».',
    action: 'Instalar',
    dismiss: 'Ahora no',
  },
  update: {
    ready: 'Hay una versión nueva',
    action: 'Actualizar',
  },
  common: {
    cancel: 'Cancelar',
    back: 'Volver',
  },
};
