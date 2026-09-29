import { MAX_POINTS, MAX_TARGET, Players } from './game/state';
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

const matches = (count: number) => (count === 1 ? '1 partida' : `${count} partidas`);
const wins = (count: number) => (count === 1 ? '1 victoria' : `${count} victorias`);

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
      `${name} ya tiene ${total}: al guardar, gana la partida.`,
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
  list: {
    emptyTitle: 'Sin manos anotadas',
    emptyBody: 'Toca Anotar, abajo, para apuntar la primera mano.',
    rowA11y: (hand: number, team: string, points: number) =>
      `Mano ${hand}: ${team} anotó ${points}`,
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
    body: (name: string) => `${name} gana la partida`,
    winsAfter: (count: number) =>
      count === 1 ? 'Primera partida ganada' : `${count} partidas ganadas`,
    close: 'Nueva partida',
    correct: 'Corregir última mano',
    restoreTarget: (target: number) => `Volver a meta ${target}`,
    undoEdit: 'Deshacer la corrección',
    changeTarget: 'Cambiar la meta',
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
    tournament: 'Estás en un torneo. Para terminarlo, abre la tabla.',
    cancel: 'Cancelar',
  },
  appearance: {
    label: 'Apariencia',
    system: 'Sistema',
    light: 'Claro',
    dark: 'Oscuro',
    toLight: 'Cambiar a modo claro',
    toDark: 'Cambiar a modo oscuro',
    announce: (name: string) => `Apariencia: ${name}`,
  },
  menu: {
    a11y: 'Menú',
    title: 'Menú',
    tournament: 'Torneo nuevo',
    table: 'Tabla del torneo',
    history: 'Historial',
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
    taken: 'Ya hay un equipo con ese nombre.',
    save: 'Guardar',
    add: 'Añadir',
    remove: 'Quitar equipo',
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
    ) => `${date}. ${winner} ganó ${winnerTotal} a ${loserTotal} contra ${loser}. Ver la partida`,
    tournamentA11y: (date: string, teams: number, played: number, champion: string | null) =>
      [
        `${date}. Torneo de ${teams} equipos, ${matches(played)}`,
        champion ? `Campeón: ${champion}` : 'Sin campeón',
        'Ver el torneo',
      ].join('. '),
    handA11y: (hand: number, team: string, points: number) =>
      `Mano ${hand}: ${team} anotó ${points}`,
  },
  tournament: {
    setupTitle: 'Torneo nuevo',
    teams: 'Equipos',
    teamA11y: (position: number, name: string, players: Players | null) =>
      `Equipo ${position}: ${name}, ${players ? joinNames(players) : 'sin jugadores'}. Cambiar`,
    add: 'Añadir equipo',
    full: `Un torneo tiene ${MAX_TEAMS} equipos como máximo.`,
    defaultName: (position: number) => `Equipo ${position}`,
    ruleLabel: 'Final del torneo',
    firstTo: 'Primero a',
    bestOf: 'Mejor de',
    free: 'Libre',
    firstToLabel: 'Victorias para ganar',
    bestOfLabel: 'Partidas en total',
    countError: `Escribe un número entre 1 y ${MAX_COUNT}.`,
    needs: (count: number) =>
      count === 1
        ? 'Gana el primer equipo que gane una partida.'
        : `Gana el primer equipo que llegue a ${count} victorias.`,
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
    rankA11y: (position: number, name: string, won: number, lost: number) =>
      [
        `Puesto ${position}: ${name}`,
        won === 1 ? '1 ganada' : `${won} ganadas`,
        lost === 1 ? '1 perdida' : `${lost} perdidas`,
      ].join(', '),
    wins,
    end: 'Terminar torneo',
    endTitle: '¿Terminar el torneo?',
    endLeader: (name: string) => `${name} va primero y queda campeón.`,
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
    nextBody: 'El ganador se queda. Toca un equipo para cambiarlo.',
    firstBody: 'Toca un equipo para cambiarlo.',
    nextFixed: 'No hay otros equipos esperando.',
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
    goBack: 'Volver atrás',
    tieBreakNote: (names: string[]) => `Desempate entre ${joinNames(names)}.`,
    announceChampion: (name: string) => `${name} gana el torneo`,
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
