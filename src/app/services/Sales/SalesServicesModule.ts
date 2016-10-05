import {NgModule} from '@angular/core';
import {AddressService} from './AddressService';
import {BusinessRelationService} from './BusinessRelationService';
import {CustomerInvoiceService} from './CustomerInvoiceService';
import {CustomerOrderItemService} from './CustomerOrderItemService';
import {CustomerOrderService} from './CustomerOrderService';
import {CustomerInvoiceItemService} from './CustomerInvoiceItemService';
import {CustomerQuoteItemService} from './CustomerQuoteItemService';
import {CustomerQuoteService} from './CustomerQuoteService';
import {CustomerService} from './CustomerService';
import {EmailService} from './EmailService';
import {PhoneService} from './PhoneService';


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
        EmailService,
        PhoneService
    ]
})
export class SalesServicesModule { }
