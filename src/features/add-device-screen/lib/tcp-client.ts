// eslint-disable-next-line unicorn/prefer-node-protocol -- React Native runtime doesn't support node: protocol
import { Buffer } from 'buffer';
import TcpSocket from 'react-native-tcp-socket';
import { AP_CONNECT_TIMEOUT, AP_GATEWAY_IP, AP_PORT } from '../constants';

type TcpSocketClient = ReturnType<typeof TcpSocket.createConnection>;

export class TcpClient {
  private client: TcpSocketClient | null = null;
  private dataBuffer = '';

  /**
   * Connect to the chip's TCP server via AP mode
   */
  connect(
    ip: string = AP_GATEWAY_IP,
    port: number = AP_PORT,
    timeout: number = AP_CONNECT_TIMEOUT,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.disconnect();
        reject(new Error(`TCP connection timeout after ${timeout}ms`));
      }, timeout);

      this.client = TcpSocket.createConnection(
        { host: ip, port },
        () => {
          clearTimeout(timer);
          resolve();
        },
      );

      this.client.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });

      this.client.on('close', () => {
        this.client = null;
      });

      // Accumulate incoming data in buffer
      this.client.on('data', (data) => {
        this.dataBuffer += data.toString('utf-8');
      });
    });
  }

  /**
   * Send a JSON message to the chip (appends newline delimiter)
   */
  send(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('TCP client not connected'));
        return;
      }

      this.client.write(`${data}\n`, 'utf-8', (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  /**
   * Send raw bytes to the chip (for encrypted payloads)
   */
  sendBytes(bytes: number[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('TCP client not connected'));
        return;
      }

      // Convert to base64 string + newline delimiter
      const base64 = Buffer.from(bytes).toString('base64');
      this.client.write(`${base64}\n`, 'utf-8', (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  /**
   * Wait for a JSON response from the chip (newline delimited)
   */
  receive(timeout: number = AP_CONNECT_TIMEOUT): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`TCP receive timeout after ${timeout}ms`));
      }, timeout);

      // Check if we already have a complete message in the buffer
      const checkBuffer = () => {
        const newlineIndex = this.dataBuffer.indexOf('\n');
        if (newlineIndex !== -1) {
          clearTimeout(timer);
          const message = this.dataBuffer.slice(0, newlineIndex);
          this.dataBuffer = this.dataBuffer.slice(newlineIndex + 1);
          resolve(message);
          return true;
        }
        return false;
      };

      // Check buffer immediately
      if (checkBuffer()) return;

      // Otherwise wait for new data
      const onData = () => {
        if (checkBuffer()) {
          this.client?.removeListener('data', onData);
        }
      };

      this.client?.on('data', onData);
    });
  }

  /**
   * Disconnect from the chip
   */
  disconnect(): void {
    if (this.client) {
      this.client.destroy();
      this.client = null;
    }
    this.dataBuffer = '';
  }

  isConnected(): boolean {
    return this.client !== null;
  }
}

export const tcpClient = new TcpClient();
