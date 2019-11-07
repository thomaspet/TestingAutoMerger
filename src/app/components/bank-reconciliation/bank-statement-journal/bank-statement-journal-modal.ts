import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {BankJournalSession, ErrorService, IMatchEntry, DebitCreditEntry} from '@app/services/services';
import {BankAccount} from '@uni-entities';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable/index';
import {filterInput, getDeepValue} from '@app/components/common/utils/utils';
import {Observable} from 'rxjs';
import { IVatType } from '@uni-framework/interfaces/interfaces';
import { tap } from 'rxjs/operators';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'bank-statement-journal-modal',
    templateUrl: './bank-statement-journal-modal.html',
    styleUrls: ['./bank-statement-journal-modal.sass']
})
export class BankStatementJournalModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();
    @ViewChild(AgGridWrapper) table: AgGridWrapper;

    busy: boolean;
    bankAccounts: BankAccount[];
    selectedAccountID: number;
    tableConfig: UniTableConfig;
    data = [];
    cachedQuery = {};
    settings = { journalAsDraft: false };

    constructor(
        private errorService: ErrorService,
        public session: BankJournalSession
    ) {}

    public closeEditor() {
        return this.table.finishEdit();
    }

    import() {
        this.closeEditor().then( () => this.save() );
    }

    save() {
        this.busy = true;
        this.session.save(this.settings.journalAsDraft)
            .finally( () => this.busy = false)
            .subscribe( x => {
            this.onClose.emit(x);
        }, err => this.errorService.handle(err));
    }

    ngOnInit() {
        const data = this.options.data || {};
        this.bankAccounts = data.bankAccounts;
        this.selectedAccountID = data.selectedAccountID;

        const input: IMatchEntry[] = data.entries || [];

        this.busy = true;
        this.session.initialize(0, this.selectedAccountID, 'bank').subscribe(
            res => {
                for (let i = 0; i < input.length; i++) {
                    this.session.addRow(this.selectedAccountID, input[i].Amount, input[i].Date, input[i].Description);
                }
                this.session.ensureRowCount(5);
                this.resetTableLayout();
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    public resetTableLayout() {
        this.tableConfig = this.createTableConfig();
    }

    public onRowSelected(event: any) {
    }

    public onRowDeleted(event: any) {
        this.session.recalc();
    }

    public onEditChange(event) {
        if (event.field && event.rowModel) {
            event.rowModel = this.session.setValue(event.field, event.newValue, event.originalIndex, event.rowModel) || event.rowModel;
            return event.rowModel;
        }
    }

    private createTableConfig(): UniTableConfig {
        const cfg = new UniTableConfig('bank.bankstatementjournal', true, true, 30);
        cfg.setColumns( [

            new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.DateTime)
                .setWidth('5rem'),

            this.createLookupColumn('Debet', 'Debet', 'Debet',
                x => this.lookupAccountByQuery(x), 'AccountNumber', 'AccountName', 'Debet.superLabel').setWidth('6rem'),

            this.createLookupColumn('Credit', 'Kredit', 'Credit',
                x => this.lookupAccountByQuery(x), 'AccountNumber', 'AccountName', 'Credit.superLabel').setWidth('6rem'),

            this.createLookupColumn('VatType', 'Mva', 'VatType',
                x => this.lookupVatType(x), 'VatCode', 'superLabel').setWidth('5rem'),

            new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                .setWidth('6rem').setAlignment('right').setConditionalCls( x => x.Amount >= 0 ? 'number-good' : 'number-bad'),

            new UniTableColumn('Description', 'Beskrivelse')
                .setWidth('20%').setMaxLength(500),

            this.createLookupColumn('Project', 'Prosjekt', 'Project',
                x => this.lookupAny(x, 'projects', 'projectnumber'), 'ProjectNumber' )
                .setWidth('6rem').setVisible(false),

            this.createLookupColumn('Department', 'Avdeling', 'Department',
                x => this.lookupAny(x, 'departments', 'departmentnumber'), 'DepartmentNumber' )
                .setWidth('6rem').setVisible(false)

        ]);
        cfg.deleteButton = true;
        cfg.autoAddNewRow = true;
        cfg.columnMenuVisible = true;
        cfg.setChangeCallback( x => this.onEditChange(x) );
        cfg.autoScrollIfNewCellCloseToBottom = true;
        cfg.defaultRowData = new DebitCreditEntry();
        return cfg;
    }

    public createLookupColumn(
        name: string, label: string, expandCol: string, lookupFn?: any,
        expandKey = 'ID', expandLabel = 'Name', forceDisplay?: string): UniTableColumn {
        return new UniTableColumn(name, label, UniTableColumnType.Lookup)
            .setDisplayField(forceDisplay || `${expandCol}.${expandLabel}`)
            .setOptions({
                itemTemplate: (item) => {
                    return (expandKey ? (item[expandKey] + ' - ') : '') + getDeepValue(item, expandLabel);
                },
                lookupFunction: lookupFn,
                debounceTime: 180
        });
    }

    private filterInputAllowPercent(v: string) {
        return v.replace(/[`~!@#$^&*()_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    }

    public lookupAccountByQuery(txt: string) {
        const lcaseText = this.filterInputAllowPercent(txt.toLowerCase());
        const isNumeric = parseInt(lcaseText, 10);

        const cache = this.cachedQuery[lcaseText];
        if (cache) {
            return Observable.from([cache]);
        }

        let filter = '';
        if (isNumeric > 0) {
            filter = `startswith(accountnumber,'${lcaseText}')`;
        } else {
            filter = `contains(accountname,'${lcaseText}')`;
        }
        return this.session
            .query('accounts', 'select', 'ID,AccountNumber,AccountName,CustomerID,SupplierID,VatTypeID'
                , 'filter', filter, 'orderby', 'AccountNumber', 'top', 50)
                .pipe(tap(res => { this.cachedQuery[lcaseText] = res; }));
    }

    public lookupVatType(txt: string) {
        const list = this.session.vatTypes;
        const lcaseText = txt.toLowerCase();
        const sublist = list.filter((item: IVatType) => {
            return (item.VatCode.toString() === txt || item.Name.toLowerCase().indexOf(lcaseText) >= 0); } );
        return Observable.from([sublist]);
    }

    public lookupAny(txt: string, route: string = 'projects',
                     visualIdcol: string = 'id', nameCol: string = 'name', expand?: string) {
        let filter = '', orderBy = nameCol;
        const filtered = filterInput(txt);
        let select = 'id,' + nameCol;

        if (filtered.length > 0) {
            const num = parseInt(filtered, 10);
            if (num > 0) {
                filter = `startswith(${visualIdcol}, '${num}')`;
                orderBy = visualIdcol;
            } else {
                filter = `contains(${nameCol},'${filtered}')`;
            }
        }
        select = visualIdcol === 'id' ? select : select + ',' + visualIdcol;

        return this.session.query(route,
            'select', select,
            'orderby', orderBy,
            'top', '50',
            'filter', filter, 'expand', expand);
    }

}
