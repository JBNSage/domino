import { buildInvite, parseInvite } from './invite';

describe('invite links', () => {
  const invite = { id: 'm123-1abcd', token: 'k9z', name: 'Casa de Ana & Cía' };

  it('carry the mesa, its code and its name, and read back the same', () => {
    const link = buildInvite('https://jbnsage.github.io/domino/', invite);
    expect(link.startsWith('https://jbnsage.github.io/domino/#unirse?')).toBe(true);
    expect(parseInvite(new URL(link).hash)).toEqual(invite);
  });

  it('keep the app address without an earlier hash', () => {
    expect(buildInvite('https://x.test/domino/#old', invite)).toMatch(
      /^https:\/\/x\.test\/domino\/#unirse\?/,
    );
  });

  it('ignore any other address', () => {
    expect(parseInvite('')).toBeNull();
    expect(parseInvite('#otra?m=1&k=2')).toBeNull();
    expect(parseInvite('#unirse?m=&k=2')).toBeNull();
    expect(parseInvite('#unirse?m=a/b&k=2')).toBeNull();
  });
});
