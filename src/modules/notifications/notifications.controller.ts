import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications
   * Obtener notificaciones del usuario actual
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener notificaciones del usuario',
    description: 'Retorna las notificaciones del usuario paginadas',
  })
  @ApiQuery({ name: 'skip', required: false, description: 'Saltar N registros', type: Number })
  @ApiQuery({ name: 'take', required: false, description: 'Cantidad de registros', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones obtenidas exitosamente',
    schema: {
      properties: {
        notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
        total: { type: 'number' },
      },
    },
  })
  async getNotifications(
    @GetUser() user: User,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.notificationsService.getUserNotifications(
      user.tenantId,
      user.id,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  /**
   * GET /notifications/pending
   * Obtener notificaciones pendientes
   */
  @Get('pending')
  @ApiOperation({
    summary: 'Obtener notificaciones pendientes',
    description: 'Retorna solo las notificaciones pendientes de envío',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones pendientes obtenidas',
    type: [Notification],
  })
  async getPendingNotifications(
    @GetUser() user: User,
  ) {
    return this.notificationsService.getPendingNotifications(user.tenantId, user.id);
  }

  /**
   * GET /notifications/stats
   * Obtener estadísticas de notificaciones
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Estadísticas de notificaciones',
    description: 'Retorna conteos de notificaciones por estado',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas',
    schema: {
      properties: {
        total: { type: 'number' },
        sent: { type: 'number' },
        pending: { type: 'number' },
        failed: { type: 'number' },
        acknowledged: { type: 'number' },
      },
    },
  })
  async getStats(@GetUser() user: User) {
    return this.notificationsService.getNotificationStats(user.tenantId);
  }

  /**
   * GET /notifications/:id
   * Obtener una notificación específica
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener notificación por ID',
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 200,
    description: 'Notificación obtenida',
    type: Notification,
  })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async getNotificationById(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    return { id, tenantId: user.tenantId };
  }

  /**
   * PUT /notifications/:id/acknowledge
   * Marcar notificación como leída/reconocida
   */
  @Put(':id/acknowledge')
  @ApiOperation({
    summary: 'Marcar notificación como leída',
    description: 'Actualiza el estado de la notificación a reconocida',
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 200,
    description: 'Notificación marcada como leída',
    type: Notification,
  })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async acknowledgeNotification(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    return await this.notificationsService.acknowledgeNotification(id, user.tenantId);
  }

  /**
   * DELETE /notifications/:id
   * Eliminar notificación
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar notificación',
    description: 'Realiza soft delete de la notificación',
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 204,
    description: 'Notificación eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async deleteNotification(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    await this.notificationsService.deleteNotification(id, user.tenantId);
    return { success: true };
  }
}
