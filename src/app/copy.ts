import { MAX_POINTS, MAX_TARGET } from './game/state';

export const copy = {
  target: {
    label: 'Se gana con',
    edit: (target: number) => `Se gana con ${target} puntos. Cambiar los ajustes.`,
  },
  settings: {
    title: 'Ajustes de la ronda',
    targetLabel: 'Puntos para ganar',
    targetError: `Escribe un número entre 1 y ${MAX_TARGET}.`,
    quickLabel: 'Puntos rápidos',
    quickError: `Escribe un número entre 1 y ${MAX_POINTS}.`,
    endsRound: (name: string, total: number) =>
      `${name} ya tiene ${total}: al guardar, gana la ronda.`,
    save: 'Guardar',
    saveAndEnd: 'Terminar ronda',
  },
  bar: {
    enter: 'Anotar',
    enterA11y: (team: string) => `Anotar puntos para ${team}`,
    quick: (value: number) => `+${value}`,
    quickA11y: (value: number, team: string) => `Sumar ${value} a ${team}`,
  },
  team: {
    remaining: (points: number) => `Faltan ${points}`,
    rounds: (count: number) => (count === 1 ? '1 ronda' : `${count} rondas`),
    a11y: (name: string, total: number, remaining: number, rounds: number) =>
      [
        `${name}, ${total} puntos`,
        `faltan ${remaining}`,
        rounds === 1 ? '1 ronda ganada' : `${rounds} rondas ganadas`,
      ].join(', '),
    a11yHint: 'Anotar puntos',
    announce: (name: string, total: number) => `${name}: ${total}`,
  },
  list: {
    emptyTitle: 'Sin manos anotadas',
    emptyBody: 'Toca Anotar debajo de un equipo para anotar la primera mano.',
    rowA11y: (hand: number, team: string, points: number) =>
      `Mano ${hand}: ${team} anotó ${points}`,
    rowHint: 'Opciones para eliminarla',
    delete: 'Eliminar',
    deleteA11y: (hand: number) => `Eliminar mano ${hand}`,
    keep: 'Dejar',
  },
  points: {
    nameLabel: 'Anotar para',
    nameA11y: 'Nombre del equipo',
    inputLabel: 'Puntos de la mano',
    placeholder: '—',
    confirm: 'Anotar',
    saveName: 'Guardar nombre',
    error: `Escribe un número entre 1 y ${MAX_POINTS}.`,
  },
  winner: {
    title: '¡Felicidades!',
    body: (name: string) => `${name} gana la ronda`,
    roundsAfter: (count: number) =>
      count === 1 ? 'Primera ronda ganada' : `${count} rondas ganadas`,
    close: 'Nueva ronda',
    correct: 'Corregir última mano',
    restoreTarget: (target: number) => `Volver a meta ${target}`,
    changeTarget: 'Cambiar la meta',
    scoreA11y: (name: string, total: number) => `${name}, ${total} puntos`,
  },
  undo: {
    handDeleted: (hand: number) => `Mano ${hand} eliminada`,
    roundClosed: 'Ronda cerrada',
    handsCleared: 'Manos borradas',
    allReset: 'Todo reiniciado',
    action: 'Deshacer',
  },
  reset: {
    a11y: 'Borrar la ronda o reiniciar todo',
    title: '¿Qué quieres borrar?',
    body:
      'Solo las manos: empieza la ronda de cero y conserva nombres, rondas ganadas y ajustes.\n\n' +
      'Todo: además vuelve a Equipo A y Equipo B, 0 rondas, meta 200 y +30.',
    cancel: 'Cancelar',
    hands: 'Solo las manos',
    all: 'Todo',
  },
  common: {
    cancel: 'Cancelar',
  },
};
