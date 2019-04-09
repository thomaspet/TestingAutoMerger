import { Pipe, PipeTransform } from '@angular/core';
import { StatusCodeReInvoice } from '@app/unientities';

@Pipe({name: 'showReinvoiceStatus'})
export class UniShowReinvoiceStatus implements PipeTransform {
    public transform(value: number): string {
        switch (value) {
            case StatusCodeReInvoice.Marked:
                return 'Markert for viderefakturering';
            case StatusCodeReInvoice.Ready:
                return 'Klar for viderefakturering';
            case StatusCodeReInvoice.ReInvoiced:
                return 'Viderefakturert';
            default:
                return '-';
        }
    }
}
