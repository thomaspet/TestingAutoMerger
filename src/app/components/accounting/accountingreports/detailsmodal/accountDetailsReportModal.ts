import {Component, Type, ViewChild, Input} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {AccountDetailsReport} from './accountDetailsReport';

declare const _; // lodash

@Component({
    selector: 'account-details-report-modal',
    template: '<uni-modal [type]="type" [config]="config"></uni-modal>'
})
export class AccountDetailsReportModal {
    public config: { close: () => void, accountID: number, accountNumber: number, accountName: string, dimensionType: number, dimensionId: number };
    public type: Type<any> = AccountDetailsReport;

    @ViewChild(UniModal) private modal: UniModal;

    constructor() {
        this.config = {
            close: () => {
                this.modal.getContent().then((component: AccountDetailsReport) => {
                    this.modal.close();
                });
            },
            accountID: null,
            accountNumber: null,
            accountName: null,
            dimensionId: null,
            dimensionType: null
        };
    }

    public open(accountID: number, accountNumber: number, accountName: string, dimensionType: number, dimensionId: number) {
        this.modal.open();

        this.config.accountID = accountID;
        this.config.accountNumber = accountNumber;
        this.config.accountName = accountName;
        this.config.dimensionId = dimensionId;
        this.config.dimensionType = dimensionType;

        this.modal.getContent().then((component: AccountDetailsReport) => {
            component.config = this.config;
            component.loadData();
        });
    }
}
