import { MAX_POINTS, MAX_TARGET } from './game/state';

export const copy = {
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
    body: (name: string) => `${name} gana la ronda`,
    roundsAfter: (count: number) =>
      count === 1 ? 'Primera ronda ganada' : `${count} rondas ganadas`,
    close: 'Nueva ronda',
    correct: 'Corregir última mano',
    restoreTarget: (target: number) => `Volver a meta ${target}`,
    undoEdit: 'Deshacer la corrección',
    changeTarget: 'Cambiar la meta',
  },
  undo: {
    handDeleted: (hand: number) => `Mano ${hand} eliminada`,
    handEdited: (hand: number, points: number) => `Mano ${hand} corregida a ${points}`,
    quickAdded: (value: number, team: string) => `+${value} a ${team}`,
    roundClosed: 'Ronda cerrada',
    handsCleared: 'Manos borradas',
    allReset: 'Todo reiniciado',
    action: 'Deshacer',
    done: 'Deshecho',
  },
  reset: {
    a11y: 'Borrar la ronda o reiniciar todo',
    title: '¿Qué quieres borrar?',
    hands: 'Solo las manos',
    handsHelp: 'La ronda empieza de cero. Se conservan nombres, rondas ganadas y ajustes.',
    all: 'Todo',
    allHelp: 'También vuelve a Equipo A y Equipo B, 0 rondas, meta 200 y +30.',
    undoNote: 'Las dos opciones se pueden deshacer.',
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
  },
};
