import {NgModule, ModuleWithProviders} from '@angular/core';
import {AddressService} from './sales/addressService';
import {BusinessRelationService} from './sales/businessRelationService';
import {CustomerInvoiceService} from './sales/customerInvoiceService';
import {CustomerOrderItemService} from './sales/customerOrderItemService';
import {CustomerOrderService} from './sales/customerOrderService';
import {CustomerInvoiceItemService} from './sales/customerInvoiceItemService';
import {CustomerQuoteItemService} from './sales/customerQuoteItemService';
import {CustomerQuoteService} from './sales/customerQuoteService';
import {CustomerService} from './sales/customerService';
import {PhoneService} from './sales/phoneService';
import {CustomerInvoiceReminderService} from './sales/customerInvoiceReminderService';
import {CustomerInvoiceReminderSettingsService} from './sales/customerInvoiceReminderSettingsService';
import {CustomerInvoiceReminderRuleService} from './sales/customerInvoiceReminderRuleService';
import {SellerService} from './sales/sellerService';
import {SellerLinkService} from './sales/sellerLinkService';
import {RecurringInvoiceService} from './sales/recurringInvoiceService';
import {PaymentInfoTypeService} from './sales/paymentInfoTypeService';
import {BatchInvoiceService} from './sales/batchInvoiceService';

export * from './sales/addressService';
export * from './sales/businessRelationService';
export * from './sales/customerService';
export * from './sales/customerInvoiceService';
export * from './sales/customerOrderItemService';
export * from './sales/customerOrderService';
export * from './sales/customerInvoiceItemService';
export * from './sales/customerQuoteItemService';
export * from './sales/customerQuoteService';
export * from './sales/phoneService';
export * from './sales/customerInvoiceReminderService';
export * from './sales/customerInvoiceReminderSettingsService';
export * from './sales/customerInvoiceReminderRuleService';
export * from './sales/sellerService';
export * from './sales/sellerLinkService';
export * from './sales/paymentInfoTypeService';
export * from './sales/recurringInvoiceService';

@NgModule({})
export class SalesServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SalesServicesModule,
            providers: [
                AddressService,
                BusinessRelationService,
                CustomerInvoiceService,
                RecurringInvoiceService,
                CustomerInvoiceItemService,
                CustomerOrderItemService,
                CustomerOrderService,
                CustomerQuoteItemService,
                CustomerQuoteService,
                CustomerService,
                PhoneService,
                CustomerInvoiceReminderService,
                CustomerInvoiceReminderSettingsService,
                CustomerInvoiceReminderRuleService,
                SellerService,
                SellerLinkService,
                PaymentInfoTypeService,
                BatchInvoiceService
            ]
        };
    }
}
