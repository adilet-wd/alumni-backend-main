import { createTransport, type SentMessageInfo, type Transporter } from 'nodemailer';
class Service {
  transporter: Transporter<SentMessageInfo>;
  constructor () {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: 'alumnimailsender@gmail.com',
        pass: 'gaqu bjzx frqp xyli'
      }
    });
  }

  async sendActivationMail (to: string, link: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Активация аккаунта на ' + process.env.API_URL,
      text: '',
      html:
                `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
    });
  }

  async sendOtpCode (to: string, code: number): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Ваш код потверждения',
      text: '',
      html:
              `
                    <div>
                        <h1>Ведите код в приложении</h1>
                        <div">Ваш код потверждения ${code}</div>
                    </div>
              `
    });
  }
}

export const MailService = new Service();