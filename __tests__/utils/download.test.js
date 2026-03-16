const DownloadManager = require('../../lib/utils/download');
const axios = require('axios');
const fs = require('fs-extra');

// Mock dependencies
jest.mock('axios');
jest.mock('fs-extra');

describe('DownloadManager', () => {
  let downloadManager;
  let mockStream;

  beforeEach(() => {
    downloadManager = new DownloadManager();
    mockStream = {
      pipe: jest.fn(),
      on: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('downloadFile', () => {
    test('should download file successfully', async () => {
      const mockResponse = {
        data: mockStream,
      };

      axios.mockResolvedValue(mockResponse);
      fs.ensureDir.mockResolvedValue();
      fs.createWriteStream.mockReturnValue(mockStream);

      // Mock successful write stream
      mockStream.on.mockImplementation((event, callback) => {
        if (event === 'finish') {
          setTimeout(callback, 0);
        }
      });

      await expect(
        downloadManager.downloadFile('https://example.com/file.txt', './test-file.txt')
      ).resolves.toBeUndefined();

      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://example.com/file.txt',
        responseType: 'stream',
        timeout: 30000,
        headers: {
          'User-Agent': 'contextkit-cli/1.0.0',
        },
      });
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.createWriteStream).toHaveBeenCalledWith('./test-file.txt');
    });

    test('should retry on failure', async () => {
      const mockError = new Error('Network error');

      axios.mockRejectedValueOnce(mockError);
      axios.mockRejectedValueOnce(mockError);

      const mockResponse = {
        data: mockStream,
      };
      axios.mockResolvedValueOnce(mockResponse);

      fs.ensureDir.mockResolvedValue();
      fs.createWriteStream.mockReturnValue(mockStream);

      // Mock successful write stream on retry
      mockStream.on.mockImplementation((event, callback) => {
        if (event === 'finish') {
          setTimeout(callback, 0);
        }
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await expect(
        downloadManager.downloadFile('https://example.com/file.txt', './test-file.txt')
      ).resolves.toBeUndefined();

      expect(axios).toHaveBeenCalledTimes(3); // 2 failures + 1 success
      expect(consoleSpy).toHaveBeenCalledWith('Retrying download (1/3)...');
      expect(consoleSpy).toHaveBeenCalledWith('Retrying download (2/3)...');

      consoleSpy.mockRestore();
    });

    test('should throw error after max retries', async () => {
      const mockError = new Error('Network error');
      axios.mockRejectedValue(mockError);
      fs.ensureDir.mockResolvedValue();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await expect(
        downloadManager.downloadFile('https://example.com/file.txt', './test-file.txt')
      ).rejects.toThrow('Failed to download https://example.com/file.txt: Network error');

      expect(axios).toHaveBeenCalledTimes(4); // 3 retries + 1 initial
      expect(consoleSpy).toHaveBeenCalledWith('Retrying download (1/3)...');
      expect(consoleSpy).toHaveBeenCalledWith('Retrying download (2/3)...');
      expect(consoleSpy).toHaveBeenCalledWith('Retrying download (3/3)...');

      consoleSpy.mockRestore();
    });

    test('should handle write stream error', async () => {
      const mockResponse = {
        data: mockStream,
      };

      axios.mockResolvedValue(mockResponse);
      fs.ensureDir.mockResolvedValue();
      fs.createWriteStream.mockReturnValue(mockStream);

      const writeError = new Error('Write error');
      mockStream.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          setTimeout(() => callback(writeError), 0);
        }
      });

      await expect(
        downloadManager.downloadFile('https://example.com/file.txt', './test-file.txt')
      ).rejects.toThrow('Write error');
    });
  });

  describe('downloadMultiple', () => {
    test('should download multiple files', async () => {
      const files = [
        { url: 'https://example.com/file1.txt', path: './file1.txt' },
        { url: 'https://example.com/file2.txt', path: './file2.txt' },
      ];

      const mockResponse = {
        data: mockStream,
      };

      axios.mockResolvedValue(mockResponse);
      fs.ensureDir.mockResolvedValue();
      fs.createWriteStream.mockReturnValue(mockStream);

      // Mock successful write stream
      mockStream.on.mockImplementation((event, callback) => {
        if (event === 'finish') {
          setTimeout(callback, 0);
        }
      });

      await expect(downloadManager.downloadMultiple(files)).resolves.toEqual([
        undefined,
        undefined,
      ]);

      expect(axios).toHaveBeenCalledTimes(2);
      expect(fs.ensureDir).toHaveBeenCalledTimes(2);
    });

    test('should handle mixed success and failure', async () => {
      const files = [
        { url: 'https://example.com/file1.txt', path: './file1.txt' },
        { url: 'https://example.com/file2.txt', path: './file2.txt' },
      ];

      const mockResponse = {
        data: mockStream,
      };

      // First file succeeds, second file fails after retries
      axios.mockResolvedValueOnce(mockResponse);
      axios.mockRejectedValue(new Error('Network error')); // All subsequent calls fail

      fs.ensureDir.mockResolvedValue();
      fs.createWriteStream.mockReturnValue(mockStream);

      // Mock successful write stream for first file
      mockStream.on.mockImplementation((event, callback) => {
        if (event === 'finish') {
          setTimeout(callback, 0);
        }
      });

      // downloadMultiple uses Promise.all, so it will reject if any promise rejects
      await expect(downloadManager.downloadMultiple(files)).rejects.toThrow(
        'Failed to download https://example.com/file2.txt: Network error'
      );
    });
  });
});
