import {Component, Type, Output, EventEmitter, Input} from '@angular/core';
import {AccountDetailsReport} from './accountDetailsReport';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';

export interface IDetailsModalInput {
    modalMode: boolean;
    accountID: number;
    accountNumber: number;
    accountName: string;
    subaccountID: number;
    dimensionType: number;
    dimensionId: number;
    close: any;
}

@Component({
    selector: 'account-details-report-modal',
    template: `
        <section role="dialog" class="uni-modal large">
            <header><h1>Forespørsel konto: {{ config?.accountNumber }}</h1></header>
            <article>
                <accounting-details-report [config]="config"></accounting-details-report>
            </article>
            <footer>

            </footer>
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

    public ngOnInit() {
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
        };
    }

    public close() {
        this.onClose.emit(true);
    }
}
