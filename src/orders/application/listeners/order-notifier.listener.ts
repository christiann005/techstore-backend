import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';

@Injectable()
export class OrderNotifierListener {
  private readonly logger = new Logger(OrderNotifierListener.name);

  constructor(private readonly mailerService: MailerService) {}

  @OnEvent('order.created', { async: true })
  async handleOrderCreatedEvent(event: OrderCreatedEvent) {
    const { order, userEmail } = event;
    const email = userEmail || 'cliente@techstore.com';

    this.logger.log(
      `🔔 Enviando confirmación de creación para Orden: ${order.id}`,
    );

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `🛒 Tu pedido TechStore Pro #${order.id.slice(-6).toUpperCase()} ha sido recibido`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 20px;">
            <h1 style="color: #2563eb; text-align: center;">¡Gracias por tu pedido!</h1>
            <p>Hola, hemos recibido tu pedido en <b>TechStore Pro</b>.</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <p><b>ID de Orden:</b> #${order.id.toUpperCase()}</p>
              <p><b>Total a Pagar:</b> $${order.totalAmount.toLocaleString()}</p>
              <p><b>Estado:</b> PENDIENTE DE PAGO</p>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              Te notificaremos en cuanto confirmemos tu pago a través de Stripe.
            </p>
          </div>
        `,
      });
      this.logger.log(`📧 Correo de creación enviado exitosamente a ${email}`);
    } catch (error) {
      this.logger.error(
        `❌ Error enviando correo de creación: ${error.message}`,
      );
    }
  }

  @OnEvent('order.paid', { async: true })
  async handleOrderPaidEvent(payload: {
    orderId: string;
    userEmail: string;
    amount: number;
  }) {
    const { orderId, userEmail, amount } = payload;
    const email = userEmail || 'cliente@techstore.com';

    this.logger.log(`✅ Enviando confirmación de PAGO para Orden: ${orderId}`);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `🚀 ¡Pago Confirmado! TechStore Pro #${orderId.slice(-6).toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 20px; border-top: 8px solid #10b981;">
            <h1 style="color: #10b981; text-align: center;">¡Pago Confirmado Exitosamente!</h1>
            <p>Tu pago por valor de <b>$${amount.toLocaleString()}</b> ha sido procesado correctamente por Stripe.</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #d1fae5;">
              <p><b>ID de Orden:</b> #${orderId.toUpperCase()}</p>
              <p><b>Estado:</b> PAGADO / LISTO PARA ENVÍO</p>
            </div>
            <p>Nuestro equipo está preparando tu hardware de alto nivel para enviarlo lo antes posible.</p>
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 40px;">
              Gracias por confiar en el ecosistema TechStore Pro.
            </p>
          </div>
        `,
      });
      this.logger.log(`📧 Correo de confirmación de PAGO enviado a ${email}`);
    } catch (error) {
      this.logger.error(`❌ Error enviando correo de pago: ${error.message}`);
    }
  }
}
