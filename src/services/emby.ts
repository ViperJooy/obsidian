import axios from 'axios';
import { config } from '../config';

const BASE_URL = config.serverUrl;

export interface EmbyAuth {
  UserId: string;
  AccessToken: string;
  ServerId: string;
}

export interface PlaybackInfo {
  ItemId: string;
  MediaSourceId: string;
  PlaySessionId: string;
  PositionTicks?: number;
}

class EmbyService {
  private auth: EmbyAuth | null = null;
  private deviceId: string = config.deviceId;
  private clientName: string = config.clientName;
  private version: string = config.version;

  constructor() {
    const savedAuth = localStorage.getItem('emby_auth');
    if (savedAuth) {
      this.auth = JSON.parse(savedAuth);
    }
  }

  setAuth(auth: EmbyAuth) {
    this.auth = auth;
    localStorage.setItem('emby_auth', JSON.stringify(auth));
  }

  logout() {
    this.auth = null;
    localStorage.removeItem('emby_auth');
  }

  get isAuthenticated() {
    return !!this.auth;
  }

  get userId() {
    return this.auth?.UserId;
  }

  private get headers() {
    const authHeader = `Emby UserId="${this.auth?.UserId || ''}", Client="${this.clientName}", Device="${this.clientName}", DeviceId="${this.deviceId}", Version="${this.version}", Token="${this.auth?.AccessToken || ''}"`;
    return {
      'X-Emby-Authorization': authHeader,
    };
  }

  async authenticate(username: string, password?: string) {
    const response = await axios.post(`${BASE_URL}/Users/AuthenticateByName`, {
      Username: username,
      Pw: password || '',
    }, { headers: this.headers });

    const authData: EmbyAuth = {
      UserId: response.data.User.Id,
      AccessToken: response.data.AccessToken,
      ServerId: response.data.ServerId,
    };

    this.setAuth(authData);
    return response.data;
  }

  async getViews() {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Users/${this.auth.UserId}/Views`, {
      headers: this.headers,
    });
    return response.data.Items;
  }

  async getLatestItems(parentId?: string, limit: number = 12) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Users/${this.auth.UserId}/Items/Latest`, {
      params: { ParentId: parentId, Limit: limit, Fields: 'PrimaryImageAspectRatio,BasicSyncInfo,CanDelete,MediaSourceCount,ImageTags,BackdropImageTags,Overview' },
      headers: this.headers,
    });
    return response.data;
  }

  async getResumeItems(limit: number = 12) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Users/${this.auth.UserId}/Items/Resume`, {
      params: { 
        Recursive: true,
        MediaTypes: 'Video',
        Limit: limit, 
        Fields: 'BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear,UserData,RunTimeTicks,ImageTags,BackdropImageTags,Overview,Type,ParentIndexNumber,IndexNumber,SeriesName',
        ImageTypeLimit: 1,
        EnableImageTypes: 'Primary,Backdrop,Thumb'
      },
      headers: this.headers,
    });
    return response.data.Items;
  }

  async getItems(params: any = {}) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Users/${this.auth.UserId}/Items`, {
      params: { 
        Recursive: true, 
        Fields: 'PrimaryImageAspectRatio,BasicSyncInfo,CanDelete,MediaSourceCount,Overview,ImageTags,BackdropImageTags',
        ...params 
      },
      headers: this.headers,
    });
    return response.data;
  }

  async getItem(itemId: string) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Users/${this.auth.UserId}/Items/${itemId}`, {
      headers: this.headers,
    });
    return response.data;
  }

  async getPlaybackInfo(itemId: string) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.post(`${BASE_URL}/Items/${itemId}/PlaybackInfo`, {
      UserId: this.auth.UserId,
    }, { headers: this.headers });
    return response.data;
  }

  getItemImageUrl(itemId: string, type: string = 'Primary', options: { width?: number, height?: number, tag?: string } = {}) {
    let url = `${BASE_URL}/Items/${itemId}/Images/${type}`;
    const params = new URLSearchParams();
    if (options.width) params.append('MaxWidth', options.width.toString());
    if (options.height) params.append('MaxHeight', options.height.toString());
    if (options.tag) params.append('Tag', options.tag);
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  getStreamUrl(itemId: string, mediaSourceId: string) {
    // Use Emby's HLS streaming endpoint with proper parameters
    return `${BASE_URL}/Videos/${itemId}/master.m3u8?MediaSourceId=${mediaSourceId}&DeviceId=${this.deviceId}&PlaySessionId=${Date.now()}&api_key=${this.auth?.AccessToken}&VideoCodec=h264&AudioCodec=aac&MaxStreamingBitrate=140000000`;
  }

  getDirectStreamUrl(itemId: string, mediaSourceId: string) {
    // Use Emby's direct streaming endpoint for supported formats
    return `${BASE_URL}/Videos/${itemId}/stream?MediaSourceId=${mediaSourceId}&Static=true&api_key=${this.auth?.AccessToken}`;
  }

  getStreamWithTranscodeUrl(itemId: string, mediaSourceId: string) {
    // Use Emby's streaming endpoint with transcoding to mp4
    return `${BASE_URL}/Videos/${itemId}/stream.mp4?MediaSourceId=${mediaSourceId}&DeviceId=${this.deviceId}&PlaySessionId=${Date.now()}&api_key=${this.auth?.AccessToken}&VideoCodec=h264&AudioCodec=aac&MaxStreamingBitrate=140000000`;
  }

  async getGenres(params: any = {}) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Genres`, {
      params: { UserId: this.auth.UserId, Recursive: true, ...params },
      headers: this.headers,
    });
    return response.data;
  }

  async getMusicGenres(params: any = {}) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/MusicGenres`, {
      params: { UserId: this.auth.UserId, Recursive: true, ...params },
      headers: this.headers,
    });
    return response.data;
  }

  async getArtists(params: any = {}) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Artists`, {
      params: { UserId: this.auth.UserId, Recursive: true, ...params },
      headers: this.headers,
    });
    return response.data;
  }

  async getStudios(params: any = {}) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Studios`, {
      params: { UserId: this.auth.UserId, Recursive: true, ...params },
      headers: this.headers,
    });
    return response.data;
  }

  async getSimilarItems(itemId: string, limit: number = 12) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Items/${itemId}/Similar`, {
      params: { UserId: this.auth.UserId, Limit: limit, Fields: 'PrimaryImageAspectRatio,CanDelete' },
      headers: this.headers,
    });
    return response.data;
  }

  async search(searchTerm: string, params: any = {}) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Items`, {
      params: { 
        SearchTerm: searchTerm, 
        Recursive: true, 
        Fields: 'PrimaryImageAspectRatio,CanDelete,MediaSourceCount',
        ...params 
      },
      headers: this.headers,
    });
    return response.data;
  }

  async getChannels(params: any = {}) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/LiveTv/Channels`, {
      params: { UserId: this.auth.UserId, ...params },
      headers: this.headers,
    });
    return response.data;
  }

  async getPlaylists(params: any = {}) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Items`, {
      params: { 
        IncludeItemTypes: 'Playlist', 
        Recursive: true, 
        UserId: this.auth.UserId,
        ...params 
      },
      headers: this.headers,
    });
    return response.data;
  }

  async getSeasons(seriesId: string) {
    if (!this.auth) throw new Error('Not authenticated');
    const response = await axios.get(`${BASE_URL}/Shows/${seriesId}/Seasons`, {
      params: { UserId: this.auth.UserId, Fields: 'PrimaryImageAspectRatio,CanDelete' },
      headers: this.headers,
    });
    return response.data.Items;
  }

  async getEpisodes(seriesId: string, seasonId: string) {
    const response = await axios.get(`${BASE_URL}/Shows/${seriesId}/Episodes`, {
      params: { SeasonId: seasonId, UserId: this.auth.UserId, Fields: 'PrimaryImageAspectRatio,CanDelete,Overview' },
      headers: this.headers,
    });
    return response.data.Items;
  }

  // Playback reporting methods
  async reportPlaybackStart(info: PlaybackInfo) {
    if (!this.auth) return;
    try {
      await axios.post(`${BASE_URL}/Sessions/Playing`, {
        ItemId: info.ItemId,
        MediaSourceId: info.MediaSourceId,
        PlaySessionId: info.PlaySessionId,
        PositionTicks: info.PositionTicks || 0,
        IsPaused: false,
        IsMuted: false,
        VolumeLevel: 100,
        PlaybackRate: 1,
        PlaybackStartTimeTicks: Date.now() * 10000,
        LiveStreamId: null,
        PlayMethod: 'DirectPlay',
        QueueableMediaTypes: ['Video'],
      }, { headers: this.headers });
      console.log('Reported playback start to Emby');
    } catch (e) {
      // Don't block playback on reporting errors
      console.log('Playback start reporting failed, continuing playback');
    }
  }

  async reportPlaybackProgress(info: PlaybackInfo & { IsPaused?: boolean, EventName?: string }) {
    if (!this.auth) return;
    // Silently report progress - don't block on errors
    fetch(`${BASE_URL}/Sessions/Playing/Progress`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ItemId: info.ItemId,
        MediaSourceId: info.MediaSourceId,
        PlaySessionId: info.PlaySessionId,
        PositionTicks: info.PositionTicks || 0,
        IsPaused: info.IsPaused || false,
        EventName: info.EventName || 'TimeUpdate',
      }),
    }).catch(() => {});
  }

  async reportPlaybackStopped(info: PlaybackInfo) {
    if (!this.auth) return;
    try {
      await axios.post(`${BASE_URL}/Sessions/Playing/Stopped`, {
        ItemId: info.ItemId,
        MediaSourceId: info.MediaSourceId,
        PlaySessionId: info.PlaySessionId,
        PositionTicks: info.PositionTicks || 0,
      }, { headers: this.headers });
      console.log('Reported playback stopped to Emby');
    } catch (e) {
      console.log('Playback stop reporting failed');
    }
  }

  // Mark item as played
  async markAsPlayed(itemId: string) {
    if (!this.auth) return;
    try {
      await axios.post(`${BASE_URL}/Users/${this.auth.UserId}/PlayedItems/${itemId}`, {}, {
        headers: this.headers,
      });
    } catch (e) {
      console.error('Failed to mark as played:', e);
    }
  }

  async markAsUnplayed(itemId: string) {
    if (!this.auth) return;
    try {
      await axios.delete(`${BASE_URL}/Users/${this.auth.UserId}/PlayedItems/${itemId}`, {
        headers: this.headers,
      });
    } catch (e) {
      console.error('Failed to mark as unplayed:', e);
    }
  }

  async markAsFavorite(itemId: string) {
    if (!this.auth) return;
    try {
      await axios.post(`${BASE_URL}/Users/${this.auth.UserId}/FavoriteItems/${itemId}`, {}, {
        headers: this.headers,
      });
    } catch (e) {
      console.error('Failed to mark as favorite:', e);
    }
  }

  async unmarkAsFavorite(itemId: string) {
    if (!this.auth) return;
    try {
      await axios.delete(`${BASE_URL}/Users/${this.auth.UserId}/FavoriteItems/${itemId}`, {
        headers: this.headers,
      });
    } catch (e) {
      console.error('Failed to unmark as favorite:', e);
    }
  }

  async updatePassword(newPassword: string, resetPassword: boolean = false) {
    if (!this.auth) throw new Error('Not authenticated');
    try {
      await axios.post(`${BASE_URL}/Users/${this.auth.UserId}/Password`, {
        Id: this.auth.UserId,
        NewPw: newPassword,
        ResetPassword: resetPassword,
      }, { headers: this.headers });
    } catch (e) {
      console.error('Failed to update password:', e);
      throw e;
    }
  }

  // Update playstate (resume position)
  async updatePlaystate(itemId: string, positionTicks: number) {
    if (!this.auth) return;
    try {
      await axios.post(`${BASE_URL}/Users/${this.auth.UserId}/PlayingItems/${itemId}/Progress`, null, {
        params: {
          MediaSourceId: '',
          PositionTicks: positionTicks
        },
        headers: this.headers
      });
    } catch (e) {
      console.error('Failed to update playstate:', e);
    }
  }

  async getUsers() {
    const response = await axios.get(`${BASE_URL}/Users/Public`, {
      headers: this.headers,
    });
    return response.data;
  }

  getUserImageUrl(userId: string, options: { width?: number, height?: number, tag?: string } = {}) {
    let url = `${BASE_URL}/Users/${userId}/Images/Primary`;
    const params = new URLSearchParams();
    if (options.width) params.append('MaxWidth', options.width.toString());
    if (options.height) params.append('MaxHeight', options.height.toString());
    if (options.tag) params.append('Tag', options.tag);

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }
}

export const emby = new EmbyService();
