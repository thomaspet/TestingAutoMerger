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

@Component({
    selector: 'uni-autobank-agreement-list-modal',
    styles: [`.material-icons { line-height: 2; cursor: pointer}`],
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 80vw;">
            <header>{{ options?.header }}</header>

            <article>
                <ag-grid-wrapper
                    class="transquery-grid-font-size"
                    *ngIf="tableData"
                    [config]="tableConfig"
                    [resource]="tableData">
                </ag-grid-wrapper>
            </article>

            <footer class="center">
                <button class="c2a rounded" (click)="close()"> Lukk </button>
            </footer>
        </section>
    `
})

export class UniBankListModal implements IUniModal, OnInit {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public tableData: any[];
    tableConfig: UniTableConfig = this.getTableConfig();

    constructor(
        private modalService: UniModalService,
        private bankService: BankService,
        private fileService: FileService,
        private toastService: ToastService
    ) { }

    public ngOnInit() {
        switch (this.options.listkey) {
            case 'FILE':
                this.tableConfig = this.getFileTableConfig();
                break;
            case 'AGREEMENT':
                this.tableConfig = this.getTableConfig();
                break;
        }
        this.tableData = this.options.list;
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
        const bankNameCol = new UniTableColumn('BankAccount.Bank.Name', 'Bank', UniTableColumnType.Text);
        const emailCol = new UniTableColumn('Email', 'E-post', UniTableColumnType.Text);
        const manualCol = new UniTableColumn('BankAcceptance', 'Manuell godkjenning', UniTableColumnType.Boolean)
            .setAlignment('center');
        const inCol = new UniTableColumn('IsInbound', 'Innbetalinger', UniTableColumnType.Boolean)
            .setAlignment('center');
        const outCol = new UniTableColumn('IsOutgoing', 'Utbetalinger', UniTableColumnType.Boolean)
            .setAlignment('center');
        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setTemplate((row) => {
                return this.getStatusText(row.StatusCode);
            })
            .setAlignment('right');

        return new UniTableConfig('autobank_agreement_list_modal', false, true, 15)
            .setColumns([ bankNameCol, emailCol, manualCol, inCol, outCol, statusCol ])
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
            'Kunne ikke laste ned fil. Prøv å last ned på nytt. Om feilen vedvarer, ta kontakt med kundesenter');
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
                this.bankService.updateAutobankAgreement(agreement.ID, password)
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
