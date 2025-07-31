import nodemailer from 'nodemailer';
import { Transporter, SendMailOptions } from 'nodemailer';
import ApiError from '../errors/error.js';
import { config } from 'dotenv';

config();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT
  ? parseInt(process.env.SMTP_PORT, 10)
  : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SENDER_EMAIL_NAME = process.env.SENDER_EMAIL_NAME ?? 'Sistema';

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  console.warn(
    'ADVERTENCIA: Variables de entorno SMTP incompletas. Modo depuración activado.'
  );
}

class EmailService {
  private transporter: Transporter;
  private useJsonTransport: boolean;
  private maxRetries = 3;
  private initialRetryDelayMs = 1000;

  constructor() {
    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
      this.useJsonTransport = false;
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
    } else {
      this.useJsonTransport = true;
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    }
    this.transporter.verify((err) => {
      if (err) console.error('Error al verificar SMTP:', err);
      else console.log('Servidor SMTP listo.');
    });
  }

  public async sendEmail(
    to: string[],
    subject: string,
    body: string,
    attachments?: {
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }[]
  ): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"${SENDER_EMAIL_NAME}" <${SMTP_USER}>`,
      to: to.join(', '),
      subject,
      html: body,
      attachments: attachments ?? [],
    };

    let currentRetry = 0;
    while (currentRetry < this.maxRetries) {
      try {
        console.log(
          `Intento ${currentRetry + 1}/${this.maxRetries} a: ${to.join(', ')}`
        );
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.messageId);
        if (this.useJsonTransport) {
          console.log(
            'Depuración: Contenido del email:',
            JSON.stringify(
              JSON.parse((info as any).message ?? (info as any).response),
              null,
              2
            )
          );
        }
        return;
      } catch (error: any) {
        currentRetry++;
        console.error(
          `Error en envío (intento ${currentRetry}): ${error.message}`
        );
        if (currentRetry < this.maxRetries) {
          const delay =
            this.initialRetryDelayMs * Math.pow(2, currentRetry - 1);
          console.log(`Reintentando en ${delay / 1000}s...`);
          await new Promise((r) => setTimeout(r, delay));
        } else {
          throw new ApiError(
            `Fallo tras ${this.maxRetries} intentos enviando a ${to.join(', ')}: ${error.message}`,
            500
          );
        }
      }
    }
  }
}

export default new EmailService();
