import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';

export interface MyFatoorahPaymentMethod {
  paymentMethodId: number;
  nameEn: string;
  nameAr: string;
  imageUrl: string;
  serviceCharge: number;
  totalAmount: number;
}

export interface InitiatedPayment {
  invoiceId: string;
  paymentUrl: string;
}

export interface PaymentStatusResult {
  invoiceId: string;
  invoiceStatus: string;
  isPaid: boolean;
  paidAmount: number;
  customerReference?: string;
}

interface MyFatoorahEnvelope {
  IsSuccess: boolean;
  Message?: string;
  Data?: Record<string, any>;
}

// Thin wrapper around MyFatoorah's v2 REST API — https://apitest.myfatoorah.com
// (sandbox) / https://api.myfatoorah.com (live), selected via
// MYFATOORAH_BASE_URL. No SDK dependency: three POST calls, Bearer-token
// auth, JSON in/out (see config/myfatoorah.config.ts for the env vars).
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  // Lists the payment methods enabled on this merchant account for a given
  // amount (fees/surcharges vary by method and are amount-dependent) — used
  // to let the customer pick a paymentMethodId before checkout.
  async listPaymentMethods(amount: number): Promise<MyFatoorahPaymentMethod[]> {
    const data = await this.request('/v2/InitiatePayment', {
      InvoiceAmount: amount,
      CurrencyIso: this.currency(),
    });
    const methods = (data.PaymentMethods ?? []) as Record<string, any>[];
    return methods.map((m) => ({
      paymentMethodId: m.PaymentMethodId as number,
      nameEn: m.PaymentMethodEn as string,
      nameAr: m.PaymentMethodAr as string,
      imageUrl: m.ImageUrl as string,
      serviceCharge: m.ServiceCharge as number,
      totalAmount: m.TotalAmount as number,
    }));
  }

  // Charges a specific payment method and returns a hosted PaymentURL for
  // the client to open (card entry / 3DS happens on MyFatoorah's page, not
  // ours) — MyFatoorah redirects the browser to callBackUrl on success or
  // errorUrl on failure/cancellation once the customer finishes there.
  async executePayment(params: {
    paymentMethodId: number;
    amount: number;
    customerName: string;
    customerEmail?: string;
    customerMobile?: string;
    callBackUrl: string;
    errorUrl: string;
    customerReference: string;
  }): Promise<InitiatedPayment> {
    const data = await this.request('/v2/ExecutePayment', {
      PaymentMethodId: params.paymentMethodId,
      CustomerName: params.customerName,
      CustomerEmail: params.customerEmail,
      CustomerMobile: params.customerMobile,
      MobileCountryCode: this.configService.get('myfatoorah.countryCode', {
        infer: true,
      }),
      DisplayCurrencyIso: this.currency(),
      InvoiceValue: params.amount,
      CallBackUrl: params.callBackUrl,
      ErrorUrl: params.errorUrl,
      Language: 'en',
      CustomerReference: params.customerReference,
    });
    return {
      invoiceId: String(data.InvoiceId),
      paymentUrl: data.PaymentURL as string,
    };
  }

  // Authoritative source of truth for whether a payment actually succeeded
  // — the redirect to CallBackUrl only means the customer *finished* the
  // hosted flow, not that it was approved, so the callback handler must
  // call this rather than trusting the redirect alone (see
  // OrdersService.finalizeCheckout).
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    const data = await this.request('/v2/GetPaymentStatus', {
      Key: paymentId,
      KeyType: 'PaymentId',
    });
    const status = (data.InvoiceStatus as string) ?? 'Unknown';
    return {
      invoiceId: String(data.InvoiceId),
      invoiceStatus: status,
      isPaid: status === 'Paid',
      paidAmount: data.InvoiceValue as number,
      customerReference: data.CustomerReference as string | undefined,
    };
  }

  private currency(): string {
    return (
      this.configService.get('myfatoorah.currency', { infer: true }) ?? 'KWD'
    );
  }

  private async request(
    path: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, any>> {
    const token = this.configService.get('myfatoorah.token', {
      infer: true,
    });
    const baseUrl = this.configService.get('myfatoorah.baseUrl', {
      infer: true,
    });
    if (!token || !baseUrl) {
      throw new AppException(
        ERROR_CODES.PAYMENT_GATEWAY_ERROR,
        'Payment gateway is not configured',
        500,
      );
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      this.logger.error(
        `MyFatoorah request to ${path} failed: ${(error as Error).message}`,
      );
      throw new AppException(
        ERROR_CODES.PAYMENT_GATEWAY_ERROR,
        'Could not reach the payment gateway',
        502,
      );
    }

    const json = (await response
      .json()
      .catch(() => null)) as MyFatoorahEnvelope | null;

    if (!response.ok || !json || json.IsSuccess === false) {
      this.logger.error(
        `MyFatoorah ${path} responded ${response.status}: ${json?.Message ?? 'unknown error'}`,
      );
      throw new AppException(
        ERROR_CODES.PAYMENT_GATEWAY_ERROR,
        json?.Message || 'Payment gateway request failed',
        502,
      );
    }

    return json.Data ?? {};
  }
}
