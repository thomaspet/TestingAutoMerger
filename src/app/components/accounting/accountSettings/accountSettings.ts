import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {Component, ViewChild} from '@angular/core';
import {AccountList} from './accountList/accountList';
import {AccountDetails} from './accountDetails/accountDetails';
import {Account} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {AccountService, VatTypeService, ErrorService} from '../../../services/services';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {
    UniModalService, UniConfirmModalV2, ConfirmActions, IModalOptions,
    UniMandatoryDimensionsModal
} from '../../../../framework/uni-modal';

@Component({
    selector: 'account-settings',
    templateUrl: './accountSettings.html',
})
export class AccountSettings {
    @ViewChild(AccountList) private accountlist: AccountList;
    @ViewChild(AccountDetails) private accountDetails: AccountDetails;

    public account: Account;

    private hasChanges: boolean = false;

    public toolbarconfig: IToolbarConfig = {
        title: 'Kontoplan',
        navigation: {
            add: {
                label: 'Opprett ny',
                action: () => this.account = new Account()
            }
        },
        contextmenu: [
            {
                label: 'Synkroniser kontoplan NS4102',
                action: () => this.SynchronizeNS4102()
            },
            {
                label: 'Sett påkrevde dimensjoner',
                action: () => this.openMandatoryDimensionsModal()
            }
        ]
    };

    public saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.saveSettings(completeEvent),
            main: true,
            disabled: false
        }
    ];

    constructor(
        private tabService: TabService,
        private accountService: AccountService,
        private vatTypeService: VatTypeService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private modalService: UniModalService
    ) {
        this.tabService.addTab({
            name: 'Kontoplan', url: '/accounting/accountsettings',
            moduleID: UniModules.Accountsettings, active: true
        });
    }

    public changeAccount(account: Account) {
        setTimeout(() => {
            if (this.account && this.account.ID === account.ID) {
                return;
            }

            if (!this.hasChanges) {
                this.changeRow(account);
            }

            this.checkSave().then((success: boolean) => {
                if (success) {
                    this.changeRow(account);
                }
            });
        }, 100);
    }

    private changeRow(account: Account) {
        this.account = account;
        this.hasChanges = false;
    }

    public change(account: Account) {
        this.hasChanges = true;
    }

    public accountSaved(account: Account) {
        this.accountlist.refresh();
        this.hasChanges = false;
    }

    private checkSave(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.hasChanges) {
                resolve(true);
                return;
            }

            this.modalService.confirm({
                header: 'Ulagrede endringer',
                message: 'Ønsker du å lagre endringer før vi fortsetter?',
                buttonLabels: {
                    accept: 'Lagre',
                    reject: 'Forkast'/*,
                    cancel: 'Avbryt'*/
                }
            }).onClose.subscribe(response => {
                switch (response) {
                    case ConfirmActions.ACCEPT:
                        this.save()
                            .then(() => resolve(true))
                            .catch(() => resolve(false))
                            ;
                    break;
                    case ConfirmActions.REJECT:
                        resolve(true); // discard changes
                    break;
                    default:
                        resolve(false);
                    break;
                }
            });
        });
    }

    private save(done?: any): Promise<boolean> {
        return this.accountDetails.save(done);
    }
    private saveSettings(completeEvent) {
        this.accountDetails.saveAccount(completeEvent);
    }

    public SynchronizeNS4102() {


        const options: IModalOptions = {
            header: 'Bekreft synkronisering',
            message: 'Synkronisering av kontoer vil overskrive endringer gjort i standardkontoer i kontoplanen. Vil du fortsette?'
        };
        this.modalService.open(UniConfirmModalV2, options).onClose.subscribe(res => {
            if (res === ConfirmActions.ACCEPT) {
                this.toastService.addToast('Kontoplanen m/mvakoder synkroniseres ... vennligst vent', ToastType.good, 2);
                this.accountService.PutAction(null, 'synchronize-ns4102-as')
                .subscribe(
                (response: any) => {
                    this.vatTypeService.PutAction(null, 'synchronize')
                    .subscribe(
                    (response2: any) => {
                        this.toastService.addToast('Kontoplanen ble synkronsert',
                            ToastType.good, 5, 'Kontoplanen NS4102 m/mvakoder ble synkronsert');
                    },
                    err2 => this.errorService.handle(err2));
                },
                err => this.errorService.handle(err));

            }
            return;
        });
    }

    public openMandatoryDimensionsModal() {
        this.modalService.open(UniMandatoryDimensionsModal, {
            header: 'Bekreft synkronisering',
            message: 'Synkronisering av kontoer vil overskrive endringer gjort i standardkontoer i kontoplanen. Vil du fortsette?'
        }).onClose.subscribe(data => {
            if (data) {
                this.accountService.addManatoryDimensions(data).subscribe(res => {
                    this.toastService.addToast(`Påkrevde dimensjoner ble satt på kontoer mellom ${data.FromAccountNo} og ${data.ToAccountNo}`,
                        ToastType.good, 5);
                });
            }
        });
    }
}
