import { Message, RoomUser } from '../types';

type MessageCallback = (message: Message) => void;
type LogCallback = (log: string) => void;
type UserJoinedCallback = (roomId: string, user: RoomUser) => void;
type UserLeftCallback = (roomId: string, userId: string, userName: string) => void;

// Resolve backend URL from env or localStorage
const getBackendUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_BACKEND_URL;
  const lsUrl = typeof window !== 'undefined' ? localStorage.getItem('BACKEND_URL') : null;
  return (envUrl || lsUrl || '').trim();
};

const toWsUrl = (httpUrl: string): string => {
  if (!httpUrl) return '';
  try {
    const url = new URL(httpUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = url.pathname.replace(/\/$/, '') + '/ws';
    return url.toString();
  } catch {
    return '';
  }
};

class ImvuService {
    private messageCallback: MessageCallback | null = null;
    private logCallback: LogCallback | null = null;
    private userJoinedCallback: UserJoinedCallback | null = null;
    private userLeftCallback: UserLeftCallback | null = null;
    private ws: WebSocket | null = null;
    private reconnectTimer: any = null;

    constructor() {
        // WebSocket disabled - Vercel doesn't support persistent WebSockets
        // this.connectWebSocket();
    }

    private get BACKEND_URL() { return getBackendUrl(); }
    private get WS_URL() { return toWsUrl(this.BACKEND_URL); }

    private connectWebSocket() {
        // WebSocket disabled - Vercel doesn't support persistent WebSockets
        // Will use polling or SSE in future implementation
        this.log('[Info] Real-time updates via WebSocket not available on Vercel deployment');
    }

    public onMessage(callback: MessageCallback) { this.messageCallback = callback; }
    public onLog(callback: LogCallback) { this.logCallback = callback; }
    public onUserJoined(callback: UserJoinedCallback) { this.userJoinedCallback = callback; }
    public onUserLeft(callback: UserLeftCallback) { this.userLeftCallback = callback; }
    
    public async login(botId: string, username: string, password?: string): Promise<boolean> {
        if (!password) {
            this.log(`[${username}] Login failed: Password is required.`);
            return false;
        }

        if (!this.BACKEND_URL) {
            this.log(`[ERROR] Backend URL not configured! Set it in Settings page.`);
            this.log(`Current backend URL: ${this.BACKEND_URL || 'NOT SET'}`);
            return false;
        }

        try {
            this.log(`[${username}] Connecting to backend: ${this.BACKEND_URL}`);
            this.log(`[${username}] Attempting to login via backend...`);
            
            const response = await fetch(`${this.BACKEND_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            this.log(`[${username}] Backend response status: ${response.status}`);
            
            const data = await response.json();
            this.log(`[${username}] Backend response: ${JSON.stringify(data)}`);

            if (!response.ok || !data.success) {
                this.log(`[${username}] Login failed: ${data.error || 'Unknown error'}`);
                return false;
            }

            this.log(`[${username}] Successfully logged in!`);
            return true;
        } catch (error: any) {
            this.log(`[${username}] ERROR: ${error.message}`);
            this.log(`[ERROR] Failed to connect to backend at: ${this.BACKEND_URL}`);
            this.log(`[ERROR] Make sure backend is running and URL is correct in Settings.`);
            console.error('Login error:', error);
            return false;
        }
    }

    public async logout(botId: string): Promise<void> {
        if (!this.BACKEND_URL) return;
        try {
            await fetch(`${this.BACKEND_URL}/bots/${botId}/logout`, {
                method: 'POST'
            });
            this.log(`[${botId}] Logged out`);
        } catch (error: any) {
            this.log(`[${botId}] Logout failed: ${error.message}`);
            console.error('Logout error:', error);
        }
    }

    public async getRooms(botId: string): Promise<{id: string, name: string}[]> {
        if (!this.BACKEND_URL) return [];
        try {
            this.log(`[${botId}] Fetching public rooms...`);
            
            const response = await fetch(`${this.BACKEND_URL}/bots/${botId}/rooms/search`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                this.log(`[${botId}] Failed to fetch rooms: ${data.error || 'Unknown error'}`);
                return [];
            }

            return data.rooms.map((room: any) => ({ 
                id: room.id, 
                name: room.name 
            }));
        } catch (error: any) {
            this.log(`[${botId}] Failed to fetch rooms: ${error.message}`);
            console.error('Get rooms error:', error);
            return [];
        }
    }

    public async joinRoom(botId: string, roomName: string): Promise<string | null> {
        if (!this.BACKEND_URL) return null;
        try {
            this.log(`[${botId}] Joining room: ${roomName}...`);
            
            const response = await fetch(`${this.BACKEND_URL}/bots/${botId}/rooms/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ room: roomName })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                this.log(`[${botId}] Failed to join room: ${data.error || 'Unknown error'}`);
                return null;
            }

            return data.roomId;
        } catch (error: any) {
            this.log(`[${botId}] Failed to join room: ${error.message}`);
            console.error('Join room error:', error);
            return null;
        }
    }

    public async leaveRoom(botId: string, roomId: string): Promise<void> {
        if (!this.BACKEND_URL) return;
        try {
            await fetch(`${this.BACKEND_URL}/bots/${botId}/rooms/${roomId}/leave`, {
                method: 'POST'
            });
            this.log(`[${botId}] Left room ${roomId}`);
        } catch (error: any) {
            this.log(`[${botId}] Failed to leave room: ${error.message}`);
            console.error('Leave room error:', error);
        }
    }

    public async sendMessage(botId: string, roomId: string, text: string): Promise<void> {
        if (!this.BACKEND_URL) return;
        try {
            await fetch(`${this.BACKEND_URL}/bots/${botId}/rooms/${roomId}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });
        } catch (error: any) {
            this.log(`[${botId}] Failed to send message: ${error.message}`);
            console.error('Send message error:', error);
        }
    }

    private log(logMessage: string) {
        const timestamp = new Date().toLocaleTimeString();
        this.logCallback?.(`[${timestamp}] ${logMessage}`);
    }
}

export const imvuService = new ImvuService();
