import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
} from '@angular/core';
import {PaymentBatchService, ElsaPurchaseService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {IUniWidget} from '../uniWidget';

import {BankIntegrationAgreement} from '@uni-entities';

@Component({
    selector: 'bank-balance-widget',
    template: `
        <section class="widget-wrapper">
            <section class="header">
                <span>{{ widget.description }}</span>
            </section>

            <section *ngIf="missingData" class="no-content" style="flex-direction: column; text-align: center; padding: 2rem;">
                <i class="material-icons" style="margin-bottom: 1rem; font-size: 3rem; color: var(--alert-info);"> {{ icon }} </i>
                <span [innerHtml]="msg" style="font-size: 14px"></span>
            </section>

            <bank-balance-chart *ngIf="showChart"></bank-balance-chart>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankBalanceWidget implements AfterViewInit {
    widget: IUniWidget;

    missingData: boolean = false;
    agreements: any[];
    agreement: BankIntegrationAgreement;
    msg: string = '';
    icon: string = '';

    showChart: boolean;

    constructor(
        private elsaPurchasesService: ElsaPurchaseService,
        private paymentBatchService: PaymentBatchService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) {}

    public ngAfterViewInit() {
        if (this.authService.activeCompany.IsTest) {
            this.showChart = true;
            this.cdr.markForCheck();
            return;
        }

        if (this.widget) {
            this.elsaPurchasesService.getPurchaseByProductName('Autobank').subscribe(res => {
                if (res) {
                    this.paymentBatchService.checkAutoBankAgreement().subscribe(agreements => {
                        this.agreements = agreements;
                        if (this.agreements.length) {
                            this.showChart = true;
                        } else {
                            this.msg = 'Du har aktivert Autobank, men har ingen aktive avtaler med banken. <br/>' +
                                '<a href="/#/bank/ticker?code=bank_list">Gå til Bank</a> for å koble sammen bank og regnskap';
                            this.icon = 'domain_disabled';
                            this.missingData = true;
                        }

                        this.cdr.markForCheck();
                    });
                } else {
                    this.msg = 'For å se saldo på bankkonto, trenger du en autobankavtale med banken. <br/>' +
                        '<a href="/#/bank/ticker?code=bank_list">Gå til Bank</a> for å koble sammen bank og regnskap';
                    this.icon = 'sync_disabled';
                    this.missingData = true;
                    this.cdr.markForCheck();
                }
            }, err => {
                this.msg = 'Kunne ikke hente data';
                this.icon = 'sync_problem';
                this.missingData = true;
                this.cdr.markForCheck();
            });
        }
    }
}
