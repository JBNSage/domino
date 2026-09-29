import { MAX_POINTS, MAX_TARGET, Players, UNDO_SECONDS } from './game/state';
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
    enters: 'Entra',
  },
  list: {
    emptyTitle: 'Sin manos anotadas',
    emptyBody: 'Toca Anotar, abajo, para apuntar la primera mano.',
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
  menu: {
    a11y: 'Menú',
    title: 'Menú',
    tournament: 'Torneo nuevo',
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
