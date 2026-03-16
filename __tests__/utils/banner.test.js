jest.mock('chalk', () => {
  const rgb = jest.fn(() => (str) => str);
  const mock = {
    red: (str) => str,
    green: (str) => str,
    yellow: (str) => str,
    blue: (str) => str,
    magenta: (str) => str,
    cyan: (str) => str,
    bold: (str) => str,
    dim: (str) => str,
    rgb,
  };
  return mock;
});

describe('banner', () => {
  let printBanner;
  let hslToRgb;

  beforeEach(() => {
    delete require.cache[require.resolve('../../lib/utils/banner')];
    ({ printBanner, hslToRgb } = require('../../lib/utils/banner'));
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  it('1. printBanner() outputs the correct number of lines', () => {
    printBanner();
    // 5 art lines + 2 blank lines (before and after)
    expect(console.log).toHaveBeenCalledTimes(7);
  });

  it('2. printBanner() does not throw in non-color environments', () => {
    expect(() => printBanner()).not.toThrow();
  });

  it('3. hslToRgb converts primary hues correctly', () => {
    const [r0, g0, b0] = hslToRgb(0, 100, 50); // hue 0 = red
    expect(r0).toBe(255);
    expect(g0).toBe(0);
    expect(b0).toBe(0);

    const [r1, g1, b1] = hslToRgb(120, 100, 50); // hue 120 = green
    expect(r1).toBe(0);
    expect(g1).toBe(255);
    expect(b1).toBe(0);

    const [r2, g2, b2] = hslToRgb(240, 100, 50); // hue 240 = blue
    expect(r2).toBe(0);
    expect(g2).toBe(0);
    expect(b2).toBe(255);
  });
});
