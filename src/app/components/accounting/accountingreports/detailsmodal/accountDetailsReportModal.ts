import {Component, Type, Output, EventEmitter, Input} from '@angular/core';
import {AccountDetailsReport} from './accountDetailsReport';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {PeriodFilter} from '../periodFilter/periodFilter';

export interface IDetailsModalInput {
    periodFilter1: PeriodFilter;
    periodFilter2: PeriodFilter;
    modalMode: boolean;
    accountID: number;
    accountNumber: number;
    accountName: string;
    subaccountID: number;
    dimensionType: number;
    dimensionId: number;
    close: any;
    filter: any;
}

@Component({
    selector: 'account-details-report-modal',
    template: `
        <section role="dialog" class="uni-modal large">
            <header>Søk på konto: {{ config?.accountNumber }}</header>
            <article>
                <accounting-details-report [config]="config"></accounting-details-report>
            </article>
        </section>
    `
})
export class AccountDetailsReportModal implements IUniModal {
    public config: IDetailsModalInput;
    public type: Type<any> = AccountDetailsReport;

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public ngAfterViewInit() {
        this.setConfig();
    }

    public ngOnInit() {
        this.setConfig();
    }

    public close() {
        this.onClose.emit(true);
    }

    private setConfig() {
        this.config = {
            close: () => {
                this.close();
            },
            modalMode: true,
            accountID: this.options.data.accountID,
            subaccountID: null,
            accountNumber: this.options.data.accountNumber,
            accountName: this.options.data.accountName,
            dimensionId: this.options.data.dimensionId,
            dimensionType: this.options.data.dimensionType,
            periodFilter1: this.options.data.periodFilter1,
            periodFilter2: this.options.data.periodFilter2,
            filter: this.options.data.filter
        };
    }
}
