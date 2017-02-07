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

export * from './sales/addressService';
export * from './sales/businessRelationService';
export * from './sales/customerInvoiceService';
export * from './sales/customerOrderItemService';
export * from './sales/customerOrderService';
export * from './sales/customerInvoiceItemService';
export * from './sales/customerQuoteItemService';
export * from './sales/customerQuoteService';
export * from './sales/customerService';
export * from './sales/phoneService';

@NgModule({
    providers: [
        AddressService,
        BusinessRelationService,
        CustomerInvoiceService,
        CustomerInvoiceItemService,
        CustomerOrderItemService,
        CustomerOrderService,
        CustomerQuoteItemService,
        CustomerQuoteService,
        CustomerService,
        PhoneService
    ]
})
export class SalesServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SalesServicesModule,
            providers: [
                AddressService,
                BusinessRelationService,
                CustomerInvoiceService,
                CustomerInvoiceItemService,
                CustomerOrderItemService,
                CustomerOrderService,
                CustomerQuoteItemService,
                CustomerQuoteService,
                CustomerService,
                PhoneService
            ]
        };
    }
}
