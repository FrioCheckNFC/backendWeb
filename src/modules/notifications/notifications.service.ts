import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification, NotificationChannel, NotificationEvent, NotificationStatus } from './entities/notification.entity';

/**
 * Servicio central de notificaciones
 * Soporta múltiples canales: Push (FCM), Email, SMS, In-App
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  /**
   * Enviar notificación multicanal
   * Soporta PUSH (FCM), EMAIL, SMS, IN_APP
   */
  async sendNotification(options: {
    tenantId: string;
    userId: string;
    event: NotificationEvent;
    title: string;
    message: string;
    channels: NotificationChannel[];
    data?: any;
    entityId?: string;
    entityType?: string;
  }): Promise<Notification[]> {
    const { tenantId, userId, event, title, message, channels, data, entityId, entityType } = options;

    // Crear registros de notificación para cada canal
    const notifications: Notification[] = [];

    for (const channel of channels) {
      const notification = this.notificationRepo.create({
        tenantId,
        userId,
        channel,
        event,
        title,
        message,
        data: data || {},
        entityId,
        entityType,
        status: NotificationStatus.PENDING,
      });

      await this.notificationRepo.save(notification);
      notifications.push(notification);

      // Enviar según el canal
      try {
        switch (channel) {
          case NotificationChannel.PUSH:
            await this.sendPushNotification(notification);
            break;
          case NotificationChannel.EMAIL:
            await this.sendEmailNotification(notification);
            break;
          case NotificationChannel.SMS:
            await this.sendSmsNotification(notification);
            break;
          case NotificationChannel.IN_APP:
            await this.sendInAppNotification(notification);
            break;
        }
      } catch (error) {
        this.logger.error(`Error sending ${channel} notification: ${error.message}`);
        notification.status = NotificationStatus.FAILED;
        notification.errorMessage = error.message;
        await this.notificationRepo.save(notification);
      }
    }

    return notifications;
  }

  /**
   * Enviar notificación Push (FCM)
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    this.logger.debug(`Enviando push notification a usuario ${notification.userId}`);

    // TODO: Integrar con Firebase Cloud Messaging (FCM)
    // 1. Obtener tokens FCM del usuario
    // 2. Enviar mensaje a través de FCM Admin SDK
    // 3. Actualizar estado en BD

    // Simulación por ahora
    notification.status = NotificationStatus.SENT;
    notification.trackingId = `FCM-${Date.now()}`;
    notification.sentAt = new Date();
    await this.notificationRepo.save(notification);
  }

  /**
   * Enviar notificación por Email
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    this.logger.debug(`Enviando email notification a usuario ${notification.userId}`);

    // TODO: Integrar con servicio de email (SendGrid, AWS SES, etc)
    // 1. Obtener email del usuario de la BD
    // 2. Renderizar plantilla de email
    // 3. Enviar a través del proveedor
    // 4. Actualizar estado en BD

    // Simulación por ahora
    notification.status = NotificationStatus.SENT;
    notification.trackingId = `EMAIL-${Date.now()}`;
    notification.sentAt = new Date();
    await this.notificationRepo.save(notification);
  }

  /**
   * Enviar notificación por SMS
   */
  private async sendSmsNotification(notification: Notification): Promise<void> {
    this.logger.debug(`Enviando SMS notification a usuario ${notification.userId}`);

    // TODO: Integrar con servicio de SMS (Twilio, AWS SNS, etc)
    // 1. Obtener teléfono del usuario de la BD
    // 2. Formatear mensaje SMS (máx 160 caracteres)
    // 3. Enviar a través del proveedor
    // 4. Actualizar estado en BD

    // Simulación por ahora
    notification.status = NotificationStatus.SENT;
    notification.trackingId = `SMS-${Date.now()}`;
    notification.sentAt = new Date();
    await this.notificationRepo.save(notification);
  }

  /**
   * Enviar notificación In-App
   */
  private async sendInAppNotification(notification: Notification): Promise<void> {
    this.logger.debug(`Enviando in-app notification a usuario ${notification.userId}`);

    // In-app: solo guardar en BD, se mostrará cuando el usuario abra la app
    notification.status = NotificationStatus.SENT;
    notification.trackingId = `INAPP-${Date.now()}`;
    notification.sentAt = new Date();
    await this.notificationRepo.save(notification);

    // TODO: Opcionalmente enviar evento WebSocket si hay conexión activa
  }

  /**
   * Obtener notificaciones pendientes de un usuario
   */
  async getPendingNotifications(tenantId: string, userId: string): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: {
        tenantId,
        userId,
        status: NotificationStatus.PENDING,
        deletedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Obtener notificaciones de un usuario
   */
  async getUserNotifications(
    tenantId: string,
    userId: string,
    skip = 0,
    take = 20,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: {
        tenantId,
        userId,
        deletedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return { notifications, total };
  }

  /**
   * Marcar notificación como reconocida/leída
   */
  async acknowledgeNotification(notificationId: string, tenantId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, tenantId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.status = NotificationStatus.ACKNOWLEDGED;
    notification.acknowledgedAt = new Date();
    return this.notificationRepo.save(notification);
  }

  /**
   * Eliminar notificación (soft delete)
   */
  async deleteNotification(notificationId: string, tenantId: string): Promise<void> {
    await this.notificationRepo.softDelete({
      id: notificationId,
      tenantId,
    });
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getNotificationStats(tenantId: string): Promise<{
    total: number;
    sent: number;
    pending: number;
    failed: number;
    acknowledged: number;
  }> {
    const total = await this.notificationRepo.count({
      where: { tenantId, deletedAt: IsNull() },
    });

    const sent = await this.notificationRepo.count({
      where: { tenantId, status: NotificationStatus.SENT, deletedAt: IsNull() },
    });

    const pending = await this.notificationRepo.count({
      where: { tenantId, status: NotificationStatus.PENDING, deletedAt: IsNull() },
    });

    const failed = await this.notificationRepo.count({
      where: { tenantId, status: NotificationStatus.FAILED, deletedAt: IsNull() },
    });

    const acknowledged = await this.notificationRepo.count({
      where: { tenantId, status: NotificationStatus.ACKNOWLEDGED, deletedAt: IsNull() },
    });

    return { total, sent, pending, failed, acknowledged };
  }
}
