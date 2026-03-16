const pkg = require('../../package.json');

const mockNotify = jest.fn();
const mockUpdateNotifier = jest.fn(() => ({ notify: mockNotify }));

jest.mock('update-notifier', () => mockUpdateNotifier);

describe('notifier', () => {
  beforeEach(() => {
    jest.resetModules();
    mockNotify.mockClear();
    mockUpdateNotifier.mockClear();
  });

  it('1. checkForUpdates initialises update-notifier with package.json', () => {
    const { checkForUpdates } = require('../../lib/utils/notifier');
    checkForUpdates();
    expect(mockUpdateNotifier).toHaveBeenCalledWith({ pkg });
  });

  it('2. checkForUpdates calls notify()', () => {
    const { checkForUpdates } = require('../../lib/utils/notifier');
    checkForUpdates();
    expect(mockNotify).toHaveBeenCalledTimes(1);
  });

  it('3. checkForUpdates does not throw when notify() throws', () => {
    mockNotify.mockImplementation(() => {
      throw new Error('network error');
    });
    const { checkForUpdates } = require('../../lib/utils/notifier');
    expect(() => checkForUpdates()).not.toThrow();
  });

  it('4. checkForUpdates does not throw when updateNotifier() throws', () => {
    mockUpdateNotifier.mockImplementation(() => {
      throw new Error('init error');
    });
    const { checkForUpdates } = require('../../lib/utils/notifier');
    expect(() => checkForUpdates()).not.toThrow();
  });
});
