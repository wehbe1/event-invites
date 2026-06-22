export type DeliveryResult = {
  providerMessageId?: string;
  status: "queued" | "sent" | "failed" | "link_generated";
};

export interface SmsGateway {
  sendSms(input: {
    to: string;
    body: string;
  }): Promise<DeliveryResult>;
}

export interface WhatsAppBusinessGateway {
  sendTemplate(input: {
    to: string;
    templateName: string;
    variables: Record<string, string>;
  }): Promise<DeliveryResult>;
}

export interface BitBusinessPayments {
  createPaymentLink(input: {
    guestId: string;
    eventId: string;
    amount?: number;
  }): Promise<{ url: string; providerPaymentId?: string }>;
}

export class TwilioSmsPlaceholder implements SmsGateway {
  async sendSms(): Promise<DeliveryResult> {
    return { status: "link_generated" };
  }
}

export class WhatsAppBusinessPlaceholder implements WhatsAppBusinessGateway {
  async sendTemplate(): Promise<DeliveryResult> {
    return { status: "link_generated" };
  }
}

export class BitBusinessPlaceholder implements BitBusinessPayments {
  async createPaymentLink(_input: {
    guestId: string;
    eventId: string;
    amount?: number;
  }) {
    return {
      url:
        process.env.BIT_PAYMENT_URL ??
        "https://www.bitpay.co.il/app/business/example"
    };
  }
}
