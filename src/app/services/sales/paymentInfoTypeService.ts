import { Injectable, } from '@angular/core';

import { BizHttp, } from '../../../framework/core/http/BizHttp';
import { PaymentInfoType, PaymentInfoTypePart, } from '../../unientities';
import { UniHttp, } from '../../../framework/core/http/http';
import { ErrorService, } from '../common/errorService';
import { Observable } from 'rxjs';

@Injectable()
export class PaymentInfoTypeService extends BizHttp<PaymentInfoType> {

    kidTypes: any[] = [
        { Type: 1, Text: 'Vanlig'},
        { Type: 2, Text: 'Saldo'},
        { Type: 3, Text: 'Innkreving'},
        { Type: 4, Text: 'Spesial'}
    ];

    macros: any[] = [
        { Macro: '<invoice_number>', Text: 'Fakturanr.'},
        { Macro: '<customer_number>', Text: 'Kundenr.'},
        { Macro: '<reminder_execute_number>', Text: 'Kjørenr.'},
        { Macro: '<modulus10>', Text: 'Kontrollsiffer'}
    ];

    statusTypes: any[] = [
        { Code: 42400, Text: 'Aktiv' },
        { Code: 42401, Text: 'Inaktiv' },
    ];

    constructor(
        http: UniHttp,
        private errorService: ErrorService,
    ) {
        super(http);
        this.relativeURL = PaymentInfoType.RelativeUrl;
        this.entityType = PaymentInfoType.EntityType;
        this.DefaultOrderBy = 'Type,PaymentInfoTypeParts.SortIndex asc';
        this.defaultExpand = ['PaymentInfoTypeParts'];
    }
}
