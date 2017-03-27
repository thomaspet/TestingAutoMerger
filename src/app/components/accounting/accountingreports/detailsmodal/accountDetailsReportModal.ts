import {Component, Type, ViewChild} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {AccountDetailsReport} from './accountDetailsReport';
import {ConfirmActions} from '../../../../../framework/modals/confirm';

@Component({
    selector: 'account-details-report-modal',
    template: '<uni-modal [type]="type" [config]="config" (close)="onClose()"></uni-modal>'
})
export class AccountDetailsReportModal {
    public config: { close: () => void, modalMode: boolean, accountID: number, subaccountID: number, accountNumber: number, accountName: string, dimensionType: number, dimensionId: number };
    public type: Type<any> = AccountDetailsReport;

    @ViewChild(UniModal) private modal: UniModal;

    public ngOnInit() {
        this.config = {
            close: () => {
                this.onClose();
            },
            modalMode: false,
            accountID: null,
            subaccountID: null,
            accountNumber: null,
            accountName: null,
            dimensionId: null,
            dimensionType: null,
        };
    }

    private onClose: () => void = () => {};

    public open(accountID: number, accountNumber: number, accountName: string, dimensionType: number, dimensionId: number): Promise<number>  {
        return new Promise((resolve) => {
            this.config.accountID = accountID;
            this.config.subaccountID = null;
            this.config.accountNumber = accountNumber;
            this.config.accountName = accountName;
            this.config.dimensionId = dimensionId;
            this.config.dimensionType = dimensionType;
            this.config.modalMode = true;

            this.modal.getContent().then((component: AccountDetailsReport) => {
                component.loadData();
            });

            this.onClose = () => {
                resolve(ConfirmActions.CANCEL);
            };

            this.modal.open();
        });
    }
}
