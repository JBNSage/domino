import { TeamId } from './state';
import {
  Rule,
  Tournament,
  available,
  champion,
  create,
  end,
  lastWinningSeat,
  leaders,
  parseTournament,
  recordResult,
  renameTeam,
  setSeat,
  standings,
  startMatch,
  startTieBreak,
  winsNeeded,
} from './tournament';

const team = (id: string) => ({ id, name: id.toUpperCase(), players: null });

function start(ids: string[], rule: Rule = { kind: 'free' }): Tournament {
  return startMatch(create('x', 1, ids.map(team), rule));
}

let matches = 0;

/** The team on `winner`'s side wins the match on the table, then the next one starts. */
function win(tournament: Tournament, winner: TeamId, points = 200, against = 100): Tournament {
  matches += 1;
  const totals = winner === 'a' ? { a: points, b: against } : { a: against, b: points };
  return startMatch(recordResult(tournament, `m${matches}`, winner, totals));
}

const order = (tournament: Tournament) => standings(tournament).map((row) => row.id);

describe('the rule', () => {
  it('needs the wins it names, or the majority of the matches', () => {
    expect(winsNeeded({ kind: 'firstTo', count: 3 })).toBe(3);
    expect(winsNeeded({ kind: 'bestOf', count: 5 })).toBe(3);
    expect(winsNeeded({ kind: 'bestOf', count: 4 })).toBe(3);
    expect(winsNeeded({ kind: 'bestOf', count: 1 })).toBe(1);
    expect(winsNeeded({ kind: 'free' })).toBeNull();
  });
});

describe('starting', () => {
  it('lets more than two teams choose who opens', () => {
    const tournament = create('x', 1, ['a', 'b', 'c'].map(team), { kind: 'free' });
    expect(tournament.phase).toBe('between');
    expect(tournament.seats).toEqual({ a: 'a', b: 'b' });
    expect(tournament.waiting).toEqual(['c']);
  });

  it('goes straight to the board with two teams', () => {
    expect(create('x', 1, ['a', 'b'].map(team), { kind: 'free' }).phase).toBe('playing');
  });
});

describe('after a match', () => {
  it('keeps the winner and brings in the team that waited longest', () => {
    let tournament = start(['a', 'b', 'c', 'd']);
    tournament = recordResult(tournament, 'm', 'a', { a: 200, b: 90 });
    expect(tournament.phase).toBe('between');
    expect(tournament.seats).toEqual({ a: 'a', b: 'c' });
    expect(tournament.waiting).toEqual(['d', 'b']);

    tournament = win(startMatch(tournament), 'b');
    expect(tournament.seats).toEqual({ a: 'd', b: 'c' });
    expect(tournament.waiting).toEqual(['b', 'a']);
  });

  it('keeps both teams when nobody is waiting', () => {
    const tournament = recordResult(start(['a', 'b']), 'm', 'b', { a: 10, b: 200 });
    expect(tournament.phase).toBe('playing');
    expect(tournament.seats).toEqual({ a: 'a', b: 'b' });
  });

  it('lets either side be given to a waiting team', () => {
    let tournament = recordResult(start(['a', 'b', 'c', 'd']), 'm', 'a', { a: 200, b: 0 });
    tournament = setSeat(tournament, 'a', 'd');
    expect(tournament.seats).toEqual({ a: 'd', b: 'c' });
    // The team that gave up its place is next in line.
    expect(tournament.waiting).toEqual(['a', 'b']);
  });

  it('only changes the table between matches, and only for a team that is waiting', () => {
    const playing = start(['a', 'b', 'c']);
    expect(setSeat(playing, 'a', 'c')).toBe(playing);

    const between = recordResult(playing, 'm', 'a', { a: 200, b: 0 });
    expect(setSeat(between, 'a', between.seats.b)).toBe(between);
    expect(setSeat(between, 'a', 'nobody')).toBe(between);
  });
});

describe('the table', () => {
  it('orders by wins, then fewer defeats, then points, then order of entry', () => {
    let tournament = start(['a', 'b', 'c', 'd']);
    tournament = win(tournament, 'a'); // a beats b; c comes in
    tournament = win(tournament, 'b'); // c beats a; d comes in for a
    tournament = win(tournament, 'b'); // c beats d
    expect(standings(tournament).map(({ id, won, lost }) => [id, won, lost])).toEqual([
      ['c', 2, 0],
      ['a', 1, 1],
      ['b', 0, 1],
      ['d', 0, 1],
    ]);
  });

  it('separates level teams by the points they scored', () => {
    let tournament = start(['a', 'b']);
    tournament = win(tournament, 'a', 200, 150);
    tournament = win(tournament, 'b', 250, 20);
    // One win and one defeat each: b scored 400, a scored 220.
    expect(order(tournament)).toEqual(['b', 'a']);
    expect(leaders(tournament).map((row) => row.id)).toEqual(['b', 'a']);
  });
});

describe('ending on a number of wins', () => {
  it('is decided by the first team to reach it', () => {
    let tournament = start(['a', 'b', 'c'], { kind: 'firstTo', count: 2 });
    tournament = win(tournament, 'a');
    expect(tournament.phase).toBe('playing');
    tournament = win(tournament, 'a');
    expect(tournament.phase).toBe('done');
    expect(champion(tournament)?.id).toBe('a');
    expect(lastWinningSeat(tournament, 'a')).toBe('a');
  });

  it('is decided by the majority in a best of five', () => {
    let tournament = start(['a', 'b'], { kind: 'bestOf', count: 5 });
    tournament = win(tournament, 'a');
    tournament = win(tournament, 'b');
    tournament = win(tournament, 'b');
    expect(tournament.phase).toBe('playing');
    tournament = win(tournament, 'b');
    expect(tournament.phase).toBe('done');
    expect(champion(tournament)?.id).toBe('b');
    expect(lastWinningSeat(tournament, 'b')).toBe('b');
  });

  it('never ends on its own when it is free', () => {
    let tournament = start(['a', 'b']);
    for (let count = 0; count < 20; count += 1) tournament = win(tournament, 'a');
    expect(tournament.phase).toBe('playing');
  });
});

describe('ending by hand', () => {
  it('crowns whoever leads alone', () => {
    const tournament = end(win(start(['a', 'b', 'c']), 'b'));
    expect(tournament.phase).toBe('done');
    expect(champion(tournament)?.id).toBe('b');
  });

  it('has no champion while first place is shared', () => {
    let tournament = start(['a', 'b', 'c']);
    tournament = win(tournament, 'a'); // a beats b; c in for b
    tournament = win(tournament, 'b'); // c beats a
    expect(leaders(tournament).map((row) => row.id)).toEqual(['c', 'a']);
    expect(champion(end(tournament))).toBeNull();
  });

  it('has no champion when nothing was played', () => {
    expect(champion(end(start(['a', 'b'])))).toBeNull();
  });
});

describe('breaking a tie', () => {
  function tied(): Tournament {
    let tournament = start(['a', 'b', 'c', 'd']);
    tournament = win(tournament, 'a'); // a beats b
    tournament = win(tournament, 'b'); // c beats a
    return tournament; // c and a lead with one win
  }

  it('seats the tied teams and lets nobody else in', () => {
    const tournament = startTieBreak(tied());
    expect(tournament.tieBreak).toEqual(['c', 'a']);
    expect(tournament.seats).toEqual({ a: 'c', b: 'a' });
    expect(tournament.phase).toBe('playing');
    expect(available(tournament)).toEqual([]);
  });

  it('ends as soon as one team leads', () => {
    const tournament = win(startTieBreak(tied()), 'b');
    expect(tournament.phase).toBe('done');
    expect(champion(tournament)?.id).toBe('a');
    expect(tournament.results.at(-1)?.tieBreak).toBe(true);
  });

  it('lets three tied teams choose who plays, and only them', () => {
    let tournament = start(['a', 'b', 'c', 'd']);
    tournament = win(tournament, 'a'); // a beats b
    tournament = win(tournament, 'b'); // c beats a
    tournament = win(tournament, 'a'); // d beats c
    tournament = startTieBreak(tournament);
    expect(tournament.phase).toBe('between');
    expect([tournament.seats.a, tournament.seats.b, ...available(tournament)].sort()).toEqual([
      'a',
      'c',
      'd',
    ]);
    expect(setSeat(tournament, 'a', 'b')).toBe(tournament);
  });

  it('does nothing when one team already leads', () => {
    const tournament = win(start(['a', 'b']), 'a');
    expect(startTieBreak(tournament)).toBe(tournament);
  });
});

describe('teams', () => {
  it('keep a new name and new players', () => {
    const tournament = renameTeam(start(['a', 'b']), 'b', 'Las Tías', ['Marta', 'Rosa']);
    expect(tournament.teams[1]).toEqual({ id: 'b', name: 'Las Tías', players: ['Marta', 'Rosa'] });
  });
});

describe('parseTournament', () => {
  it('round-trips a tournament under way', () => {
    const tournament = win(start(['a', 'b', 'c'], { kind: 'bestOf', count: 5 }), 'a');
    expect(parseTournament(JSON.parse(JSON.stringify(tournament)))).toEqual(tournament);
  });

  it('rejects malformed data', () => {
    const tournament = start(['a', 'b', 'c']);
    expect(parseTournament(null)).toBeNull();
    expect(parseTournament({ ...tournament, teams: [team('a')] })).toBeNull();
    expect(parseTournament({ ...tournament, rule: { kind: 'firstTo', count: 0 } })).toBeNull();
    expect(parseTournament({ ...tournament, waiting: [] })).toBeNull();
    expect(parseTournament({ ...tournament, phase: 'paused' })).toBeNull();
    expect(parseTournament({ ...tournament, seats: { a: 'a', b: 'z' } })).toBeNull();
  });
});
