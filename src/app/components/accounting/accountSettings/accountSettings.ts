import {IToolbarConfig} from '../../common/toolbar/toolbar';
import { Component, SimpleChanges, ViewChild } from '@angular/core';
import {AccountList} from './accountList/accountList';
import {AccountDetails} from './accountDetails/accountDetails';
import {Account} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {AccountService, VatTypeService, ErrorService, UserService, ImportCentralService} from '../../../services/services';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {
    UniModalService, UniConfirmModalV2, ConfirmActions, IModalOptions,
    UniMandatoryDimensionsModal
} from '../../../../framework/uni-modal';
import { ImportUIPermission } from '@app/models/import-central/ImportUIPermissionModel';
import { DisclaimerModal } from '@app/components/import-central/modals/disclaimer/disclaimer-modal';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ImportJobName, TemplateType, ImportStatement } from '@app/models/import-central/ImportDialogModel';
import { ImportTemplateModal } from '@app/components/import-central/modals/import-template/import-template-modal';

@Component({
    selector: 'account-settings',
    templateUrl: './accountSettings.html',
})
export class AccountSettings {
    @ViewChild(AccountList, { static: true }) private accountlist: AccountList;
    @ViewChild(AccountDetails, { static: true }) private accountDetails: AccountDetails;

    saveaction: IUniSaveAction[] = [{
        label: 'Lagre',
        action: (completeEvent) => this.saveSettings(completeEvent),
        main: true,
        disabled: true
    }];

    public account: Account;
    private hasChanges: boolean = false;
    private ledgerPermissions: ImportUIPermission;
    mainLedgerTemplateUrl: string = environment.IMPORT_CENTRAL_TEMPLATE_URLS.MAIN_LEDGER;

    public toolbarconfig: IToolbarConfig = {
        title: 'Kontoplan',
        navigation: {
            add: {
                label: 'Opprett ny',
                action: () => this.account = <Account> {}
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

    constructor(
        private tabService: TabService,
        private accountService: AccountService,
        private vatTypeService: VatTypeService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private modalService: UniModalService,
        private userService: UserService,
        private importCentralService: ImportCentralService,
        private router: Router
    ) {
        this.tabService.addTab({
            name: 'Kontoplan', url: '/accounting/accountsettings',
            moduleID: UniModules.Accountsettings, active: true
        });
        this.getImportAccess();
    }

    updateSaveEnabledState(enabled: boolean) {
        this.saveaction[0].disabled = !enabled;
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
        this.updateSaveEnabledState(false);
    }

    public change(event: SimpleChanges) {
        this.accountService.checkLinkedBankAccountsAndPostPost(this.account.AccountNumber).subscribe(hasLinkedBankAccounts => {
            if (hasLinkedBankAccounts || event && event.UsePostPost && event.UsePostPost.currentValue) {
                this.toastService.addToast(
                    'En eller flere hovedbokskontoer er knyttet mot enten PostPost eller bankkonto.',
                    ToastType.warn,
                    ToastTime.medium,
                    'Vi anbefaler at du ikke har påkrevd dimensjon på disse kontoene.');
            }
        });

        this.hasChanges = true;
        this.updateSaveEnabledState(true);
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
        if (this.hasChanges) {
            this.accountDetails.saveAccount(completeEvent);
        } else {
            completeEvent();
        }
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
                this.accountService.addMandatoryDimensions(data).subscribe(res => {
                    if (res) {
                        this.toastService.toast({
                            title: 'SALES.RECURRING_INVOICE.MISSING_DIM_TOAST_TITLE',
                            message: res,
                            type: ToastType.warn,
                            duration: 5
                        });
                    }
                    this.toastService.addToast(`Påkrevde dimensjoner ble satt på kontoer mellom ${data.FromAccountNo} og ${data.ToAccountNo}`,
                        ToastType.good, 5);
                });
            }
        });
    }

    private getImportAccess() {
        this.userService.getCurrentUser().subscribe(res => {
            const permissions = res['Permissions'];
            this.ledgerPermissions = this.importCentralService.getAccessibleComponents(permissions).ledger;
            if (this.ledgerPermissions.hasComponentAccess) {
                this.saveaction.push(...[{
                    label: 'Importer kontoplan',
                    action: (done) => this.openImportModal(done),
                    main: true,
                    disabled: false
                },
                {
                    label: 'Importlogg',
                    action: this.importLogs.bind(this),
                    main: true,
                    disabled: false
                }]);
            }
        }, err => {
            this.errorService.handle('En feil oppstod, vennligst prøv igjen senere');
        });
    }

    private importLogs() {
        this.router.navigate(['/import/log', { id: TemplateType.MainLedger }])
    }

    private openImportModal(done = () => { }) {
        this.userService.getCurrentUser().subscribe(res => {
            if (res) {
                if (res.HasAgreedToImportDisclaimer) {
                    this.openmainLedgerImportModal();
                } else {
                    this.modalService.open(DisclaimerModal)
                        .onClose.subscribe((val) => {
                            if (val) {
                                this.openmainLedgerImportModal();
                            }
                        });
                }
            }
        });
        done();
    }

    private openmainLedgerImportModal() {
        this.modalService.open(ImportTemplateModal,
            {
                header: 'Importer Kontoplan',
                data: {
                    jobName: ImportJobName.MainLedger,
                    type: 'MainLedger',
                    entity: TemplateType.MainLedger,
                    conditionalStatement: ImportStatement.MainLedgerConditionalStatement,
                    formatStatement: ImportStatement.MainLedgerFormatStatement,
                    downloadStatement: ImportStatement.MainLedgerDownloadStatement,
                    downloadTemplateUrl: this.mainLedgerTemplateUrl,
                    hasTemplateAccess: this.ledgerPermissions.hasTemplateAccess,
                    isExternal: true
                }
            });
    };
}
