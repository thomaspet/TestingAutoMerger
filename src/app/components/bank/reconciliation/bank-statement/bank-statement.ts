import {Component, Output, EventEmitter, ViewChild} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {BankService, StatisticsService, ErrorService} from '@app/services/services';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {UniModalService, IModalOptions} from '@uni-framework/uni-modal';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import * as moment from 'moment';
import { IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import {BankStatmentElementsModal} from './bank-statement-elements-modal';

@Component({
    selector: 'uni-bank-statement-list',
    templateUrl: './bank-statement.html',
    styleUrls: ['../reconciliation-list/reconciliation-list.sass']
})

export class BankStatement {
    @ViewChild(AgGridWrapper, { static: true })
    table: AgGridWrapper;

    @Output()
    statementChanged = new EventEmitter<any>();

    lookupFunction: (urlParams: HttpParams) => any;

    uniTableConfig: IUniTableConfig;
    bankStatements: any[] = [];

    constructor (
        private bankService: BankService,
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private errorService: ErrorService,
        private toast: ToastService
    ) { }

    ngOnInit() {
        this.setUpLookupfunction();
        this.uniTableConfig = this.generateUniTableConfig();
    }

    setUpLookupfunction() {
        this.lookupFunction = (urlParams) => {
            urlParams = urlParams.set('model', 'BankStatement');
            urlParams = urlParams.set('select', 'FromDate as FromDate,ToDate as ToDate,ID as ID,count(entry.ID) as count,' +
            'Amount as Amount,Account.AccountName as AccountName,Account.AccountNumber as AccountNumber,StatusCode as StatusCode');
            urlParams = urlParams.set('join', 'BankStatement.ID eq BankStatementEntry.BankStatementID as Entry');
            urlParams = urlParams.set('expand', 'Account');
            let orderBy = urlParams.get('orderby');

            if (!orderBy || orderBy.includes('count')) {
                if (orderBy.includes('asc')) {
                    orderBy = 'count(entry.ID) desc';
                } else {
                    orderBy = 'count(entry.ID) asc';
                }
            }

            urlParams = urlParams.set('orderby', orderBy);

            return this.statisticsService.GetAllByHttpParams(urlParams);
        };
    }

    onActionClick(action: string, statement: any, index: number) {
        switch (action) {
            case 'open':
                this.callBankStatementAction(statement.ID, 'reopen');
                break;
            case 'close':
                this.callBankStatementAction(statement.ID, 'complete');
                break;
            case 'delete':
                this.bankService.deleteBankStatement(statement.ID).subscribe(() => {
                    this.bankStatements.splice(index, 1);
                    this.toast.addToast('Kontoutskrift slettet', ToastType.good, 5);
                    this.statementChanged.emit(true);
                    this.table.refreshTableData();
                }, err => {
                    this.toast.addToast('Kunne ikke slette kontoutskrift', ToastType.bad, 5,
                        err && err.error && err.error.Messages && err.error.Messages[0].Message);
                });
                break;
        }
    }

    callBankStatementAction(id: number, action: string) {
        this.bankService.bankStatementActions(id, action).subscribe((response) => {
            this.table.refreshTableData();
            this.toast.addToast(`${action === 'reopen' ? 'Kontoutskrift gjenåpnet' : 'Kontoutskrift ferdigstilt'}`, ToastType.good, 5);
        }, err => {
            this.errorService.handle(err);
        });
    }

    private generateUniTableConfig(): UniTableConfig {

        const columns = [
            new UniTableColumn('Account.AccountName', 'Kontonavn', UniTableColumnType.Text)
                .setAlias('AccountName')
                .setFilterOperator('contains'),
            new UniTableColumn('Account.AccountNumber', 'Kontonr', UniTableColumnType.Text)
                .setAlias('AccountNumber')
                .setFilterOperator('contains'),
            new UniTableColumn('FromDate', 'Periode', UniTableColumnType.Text)
                .setTemplate(row => {
                    // tslint:disable-next-line:max-line-length
                    return (row && row.FromDate && row.ToDate) ? moment(row.FromDate).format('DD. MMM YYYY') + ' - ' + moment(row.ToDate).format('DD. MMM YYYY') : '';
                }),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                .setTemplate(row => row.StatusCode === 48001 ? 'Åpen' : 'Ferdigstilt'),
            new UniTableColumn('count', 'Antall poster', UniTableColumnType.Link)
                .setLinkClick(row => this.openSubElementsInModal(row))
                .setFilterable(false)
                .setAlignment('center'),
            new UniTableColumn('Amount', 'Sum', UniTableColumnType.Money),
        ];

        return new UniTableConfig('bankstatement.statements.details', false, true)
            .setSearchable(true)
            .setEntityType('BankStatement')
            .setContextMenu([
                {
                    action: (item) => this.onActionClick('delete', item, item._originalIndex),
                    disabled: (item) => false,
                    label: 'Slett kontoutskrift'
                },
                {
                    action: (item) => this.onActionClick('open', item, item._originalIndex),
                    disabled: (item) => item.StatusCode !== 48002,
                    label: 'Gjenåpne avstemming'
                },
                {
                    action: (item) => this.onActionClick('close', item, item._originalIndex),
                    disabled: (item) => item.StatusCode === 48002,
                    label: 'Ferdigstill avstemming'
                }
            ])
            .setColumns(columns);
    }

    openSubElementsInModal(row: any) {
        const modalOptions: IModalOptions = {
            header: `Poster for ${row.AccountNumber} - ${row.AccountName}`,
            data: {
                ID: row.ID
            }
        };

        this.modalService.open(BankStatmentElementsModal, modalOptions);
    }
}
