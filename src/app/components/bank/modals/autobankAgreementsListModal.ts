import {Component, Input, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {
    UniModalService,
    IModalOptions,
    IUniModal,
    UniConfirmModalV2,
    ConfirmActions,
    UniAutobankAgreementModal
} from '@uni-framework/uni-modal';
import {BankService} from '@app/services/accounting/bankService';
import {UniBankUserPasswordModal} from '@app/components/bank/modals/bank-user-password.modal';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
@Component({
    selector: 'uni-autobank-agreement-list-modal',
    styles: [`.material-icons { line-height: 2; cursor: pointer}`],
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 80vw;">
            <header><h1>Mine autobankavtaler</h1></header>

            <article>
                <ag-grid-wrapper
                    class="transquery-grid-font-size"
                    *ngIf="agreements"
                    [config]="tableConfig"
                    [resource]="agreements">
                </ag-grid-wrapper>
            </article>

            <footer class="center">
                <button class="c2a rounded" (click)="close()"> Lukk </button>
            </footer>
        </section>
    `
})

export class UniAutobankAgreementListModal implements IUniModal, OnInit {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild(AgGridWrapper)
    private table: AgGridWrapper;

    public agreements: any[];
    tableConfig: UniTableConfig = this.getTableConfig();

    constructor(
        private modalService: UniModalService,
        private bankService: BankService
    ) { }

    public ngOnInit() {
        if (this.options &&  this.options.data) {
            this.options.data.agreements.forEach((item) => {
                item.deleteTagged = false;
            });

            this.agreements = this.options.data.agreements;
        }
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
