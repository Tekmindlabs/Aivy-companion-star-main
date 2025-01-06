import { Resend } from 'resend';

class ResendService {
  private static instance: ResendService;
  private resend: Resend;

  private constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  public static getInstance(): ResendService {
    if (!ResendService.instance) {
      ResendService.instance = new ResendService();
    }
    return ResendService.instance;
  }

  async sendEmail({ to, subject, html }: { 
    to: string; 
    subject: string; 
    html: string; 
  }) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'AI tutor <onboarding@resend.dev>', // Update with your domain
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}

export const resendService = ResendService.getInstance();