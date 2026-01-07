export interface NotificationChannel {
  send(to: string, message: number): Promise<void>;
}
