export class OnlineStatusManager {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  
  constructor(
    private wsEndpoint: string,
    private authToken: string,
    private onStatusChange: (userId: string, isOnline: boolean) => void
  ) {}

  connect() {
    this.ws = new WebSocket(`${this.wsEndpoint}/status`);
    
    this.ws.onopen = () => {
      this.sendAuthentication();
      this.startPingInterval();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status_update') {
        this.onStatusChange(data.userId, data.isOnline);
      }
    };

    this.ws.onclose = () => {
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
      }
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
  }

  private sendAuthentication() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'auth',
        token: this.authToken
      }));
    }
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}