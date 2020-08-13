import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';

@Component({
    selector: 'make-amelding-status-modal',
    templateUrl: './make-a-melding-payment-modal.component.html',
    styleUrls: ['./make-a-melding-payment-modal.component.sass']
})
export class MakeAmeldingPaymentModalComponent implements OnInit, IUniModal {

    public options: IModalOptions;
    public onClose: EventEmitter<any> = new EventEmitter<any>();

    tooltip = `
        Infotekst:
        Øredifferanse på skyldige kontoer for arbeidsgiveravgift, forskuddstrekk og evt finansskatt vil føres vekk så lenge differansen er under 5 kr per lønnsavregning i perioden.
        Husk at lønnsavregningen må bokføres for at øredifferanser skal kunne korrigeres.
    `;

    dto = {
        payAga: true,
        payTaxDraw: true,
        payFinancialTax: true,
        payDate: new Date(),
        correctPennyDiff: true
    };

    showFinanceTax: boolean;
    totalFtrekkFeedbackStr: string;
    totalAGAFeedbackStr: string;
    totalFinancialFeedbackStr: string;
    period: number;

    ngOnInit(): void {
        this.period = this.options.data.period;
        this.showFinanceTax = this.options.data.showFinanceTax;
        this.totalFtrekkFeedbackStr = this.options.data.totalFtrekkFeedbackStr;
        this.totalAGAFeedbackStr = this.options.data.totalAGAFeedbackStr;
        this.totalFinancialFeedbackStr = this.options.data.totalFinancialFeedbackStr;
        this.dto.payFinancialTax = this.showFinanceTax;
        this.dto.payDate = new Date(this.options.data.payDate);
    }

    close(makePayment: boolean) {
        this.onClose.emit(makePayment ? this.dto : null);
    }
}
