import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emby } from './emby';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('EmbyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    emby.logout();
  });

  describe('authenticate', () => {
    it('应该成功认证并保存认证信息', async () => {
      const mockResponse = {
        data: {
          User: { Id: 'user123' },
          AccessToken: 'token123',
          ServerId: 'server123',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await emby.authenticate('testuser', 'testpass');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/Users/AuthenticateByName'),
        { Username: 'testuser', Pw: 'testpass' },
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
      expect(emby.isAuthenticated).toBe(true);
      expect(emby.userId).toBe('user123');
      expect(localStorage.getItem('emby_auth')).toBeTruthy();
    });

    it('应该处理认证失败', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' },
        },
      };
      mockedAxios.post.mockRejectedValue(mockError);

      await expect(emby.authenticate('wronguser', 'wrongpass')).rejects.toEqual(mockError);
      expect(emby.isAuthenticated).toBe(false);
    });

    it('应该支持空密码', async () => {
      const mockResponse = {
        data: {
          User: { Id: 'user123' },
          AccessToken: 'token123',
          ServerId: 'server123',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await emby.authenticate('testuser');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/Users/AuthenticateByName'),
        { Username: 'testuser', Pw: '' },
        expect.any(Object)
      );
    });
  });

  describe('logout', () => {
    it('应该清除认证信息', async () => {
      const mockResponse = {
        data: {
          User: { Id: 'user123' },
          AccessToken: 'token123',
          ServerId: 'server123',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);
      await emby.authenticate('testuser', 'testpass');

      emby.logout();

      expect(emby.isAuthenticated).toBe(false);
      expect(localStorage.getItem('emby_auth')).toBeNull();
    });
  });

  describe('认证头信息', () => {
    it('应该在请求中包含正确的认证头', async () => {
      const mockResponse = {
        data: {
          User: { Id: 'user123' },
          AccessToken: 'token123',
          ServerId: 'server123',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);
      await emby.authenticate('testuser', 'testpass');

      mockedAxios.get.mockResolvedValue({ data: { Items: [] } });
      await emby.getViews();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/Views'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Emby-Authorization': expect.stringContaining('Token="token123"'),
          }),
        })
      );
    });
  });
});