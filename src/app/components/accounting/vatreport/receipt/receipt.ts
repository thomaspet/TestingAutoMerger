import {Component, Input} from '@angular/core';
import {VatReport} from '../../../../unientities';
import {UniCurrencyPipe} from '../../../../pipes/UniCurrencyPipe';
import {UniAccountNumberPipe} from '../../../../pipes/UniAccountNumberPipe';
import {UniDateFormatPipe} from '../../../../pipes/UniDateFormatPipe';

@Component({
    selector: 'vatreport-receipt-view',
    templateUrl: 'app/components/accounting/vatreport/receipt/receipt.html',
    pipes: [UniCurrencyPipe, UniAccountNumberPipe, UniDateFormatPipe]
})
export class ReceiptVat {
    @Input() public vatReport: VatReport;
}
