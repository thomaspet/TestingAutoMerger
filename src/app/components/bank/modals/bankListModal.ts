import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {
    UniModalService,
    IModalOptions,
    IUniModal,
    UniConfirmModalV2,
    ConfirmActions
} from '@uni-framework/uni-modal';
import {BankService} from '@app/services/accounting/bankService';
import {UniBankUserPasswordModal} from '@app/components/bank/modals/bank-user-password.modal';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {FileService} from '@app/services/services';
import {saveAs} from 'file-saver';
import { BankIntegrationAgreement } from '@uni-entities';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'uni-autobank-agreement-list-modal',
    styles: [`.material-icons { line-height: 2; cursor: pointer}`],
    templateUrl: './bankListModal.html'
})

export class UniBankListModal implements IUniModal, OnInit {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public bankAgreements: BankIntegrationAgreement[];
    tableConfig: UniTableConfig = this.getTableConfig();
    currentAgreement: BankIntegrationAgreement;
    isDirty: boolean;
    password: string;
    errorMessage: string;
    initBankStatementValue: boolean;
    displayInfo: boolean;

    constructor(
        private modalService: UniModalService,
        private bankService: BankService,
        private fileService: FileService,
        private toastService: ToastService
    ) {}

    public ngOnInit() {
        switch (this.options.listkey) {
            case 'FILE':
                this.tableConfig = this.getFileTableConfig();
                break;
            case 'AGREEMENT':
                this.tableConfig = this.getTableConfig();
                break;
        }
        this.bankAgreements = this.options.list;
        this.currentAgreement = {...this.bankAgreements[0]};
    }

    public onBankSelected(event: BankIntegrationAgreement) {
        this.password = '';
        this.errorMessage = '';
        this.isDirty = false;
        this.currentAgreement = {...event};
        this.initBankStatementValue = this.currentAgreement.IsBankBalance;
        this.displayInfo = false;
    }

    public updateAutobankAgreement() {
        this.errorMessage = '';
        const payload =  {
            IsInbound: this.currentAgreement.IsInbound,
            IsOutgoing: this.currentAgreement.IsOutgoing,
            IsBankStatement : this.currentAgreement.IsBankBalance,
            IsBankBalance : this.currentAgreement.IsBankBalance,
            Password : this.password,
        };

        this.bankService.updateAutobankAgreement(this.currentAgreement.ID, payload).subscribe(
            response => {
                this.toastService.addToast('Godkjent', ToastType.good, ToastTime.medium,
                'Autobankavtalen er oppdatert');
                if (this.initBankStatementValue !== this.currentAgreement.IsBankBalance && this.currentAgreement.IsBankBalance) {
                    this.displayInfo = true;
                }
            });
    }

    public getStatusText(code: number) {
        let statusText = '';
        switch (code) {
            case 700001:
                statusText = 'Startet';
                break;
            case 700002:
                statusText = 'Venter på signering';
                break;
            case 700003:
                statusText = 'Venter på godkjenning';
                break;
            case 700004:
                statusText = 'Venter på meldingssentral';
                break;
            case 700005:
                statusText = 'Aktiv';
                break;
            case 700006:
                statusText = 'Kansellert';
                break;
            default:
                break;
        }
        return statusText;
    }

    private getTableConfig() {
        const bankNameCol = new UniTableColumn('Name', 'Bank', UniTableColumnType.Text);

        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setWidth(150, false)
            .setTemplate((row) => {
                return this.getStatusText(row.StatusCode);
            });


        const contextMenuItems: any[] = [
            {
                action: () => this.deleteAgreements(this.currentAgreement),
                label: 'Kanseller avtale',
                disabled: () => false
            }
        ];

        return new UniTableConfig('autobank_agreement_list_modal', false, true, 15)
            .setColumns([ bankNameCol, statusCol])
            .setColumnMenuVisible(false);
    }

    private getFileTableConfig() {
        const bankNameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text);
        const emailCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);
        const manualCol = new UniTableColumn('CreatedAt', 'Dato', UniTableColumnType.LocalDate);
        const inCol = new UniTableColumn('', '', UniTableColumnType.Link)
            .setLinkClick((file) => {
                this.downloadFile(file);
            })
            .setAlignment('center')
            .setTemplate(row => 'Last ned fil');

        return new UniTableConfig('autobank_agreement_list_modal', false, true, 15)
            .setColumns([ bankNameCol, emailCol, manualCol, inCol ])
            .setColumnMenuVisible(false);
    }

    public downloadFile(file: any) {
        this.fileService.downloadXml(file.ID).subscribe((blob) => {
            saveAs(blob, file.Name);
        }, err => {
            this.toastService.addToast('Noe gikk galt', ToastType.bad, ToastTime.medium,
            'Kunne ikke laste ned fil. Prøv å last ned på nytt. Om feilen vedvarer, ta kontakt med Uni Micro kundeservice');
            console.log(err);
        });
    }

    // Not implemented yet in view
    public deleteAgreements(agreement) {
        const modalOptions: IModalOptions = {
            buttonLabels: {
                accept: 'Ja',
                cancel: 'Avbryt'
            },
            header: 'Slett autobankavtale',
            message: 'Er du helt sikker på at du vil slette autobankavtalen for ' + agreement.Name + ' ?',
            warning: 'Dette kan ikke angres, og for å aktivere igjen, må du gjennomgå oppstartsprosessen på nytt.'
        };

        this.modalService.open(UniConfirmModalV2, modalOptions).onClose.subscribe((res) => {
            if (res === ConfirmActions.ACCEPT) {
                // Delete
            }
        });
    }

    public close() {
        this.onClose.emit();
    }

    // Not implemented yet in view
    public refreshStatus(agreement) {
        this.modalService.open(UniBankUserPasswordModal).onClose.subscribe(password => {
            if (!password) {
                return;
            } else {
                this.bankService.updateAutobankAgreementStatus(agreement.ID, password)
                    .finally(() => {
                        this.onClose.emit();
                    })
                    .subscribe(x => {
                        agreement.StatusCode = x.StatusCode;
                    });
            }
        });
    }
}
