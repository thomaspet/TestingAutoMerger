import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {environment} from 'src/environments/environment';
import {tap} from 'rxjs/operators';
import {filterInput, getDeepValue} from '@app/components/common/utils/utils';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {BankJournalSession, ErrorService, IMatchEntry, DebitCreditEntry} from '@app/services/services';
import {BankAccount, BankStatementRule, ValidationLevel} from '@uni-entities';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {IVatType} from '@uni-framework/interfaces/interfaces';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {BankStatementRulesModal} from '../bank-statement-rules/bank-statement-rules';
import {BankStatementRuleService} from '@app/services/bank/bankStatementRuleService';
import {UniModalService, FileFromInboxModal} from '@uni-framework/uni-modal';
import {ImageModal} from '@app/components/common/modals/ImageModal';
import {of, Observable} from 'rxjs';
import {UnsavedAttachmentsModal} from './unsaved-journal-modal/unsaved-attachments-modal';
import {theme, THEMES} from 'src/themes/theme';
import { ValidationMessage } from '@app/models/validationResult';

@Component({
    selector: 'bank-statement-journal-modal',
    templateUrl: './bank-statement-journal-modal.html',
    styleUrls: ['./bank-statement-journal-modal.sass']
})
export class BankStatementJournalModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();
    @ViewChild(AgGridWrapper, { static: true }) table: AgGridWrapper;

    busy: boolean;
    bankAccounts: BankAccount[];
    selectedAccountID: number;
    tableConfig: UniTableConfig;
    data = [];
    cachedQuery = {};
    settings = { journalAsDraft: false };
    errorMessages: ValidationMessage[] = [];

    matchEntries: IMatchEntry[];
    bankStatementRules: BankStatementRule[];
    numberOfActiveRules: number;
    activeItem: DebitCreditEntry;
    autorunRuleLines = [];
    autoRunInfoText: string = '';

    config = {
        template: item => item.DisplayName,
        searchable: false,
        hideDeleteButton: true
    };

    constructor(
        private modalService: UniModalService,
        private errorService: ErrorService,
        private ruleService: BankStatementRuleService,
        public session: BankJournalSession,
    ) {
        this.loadRules();
    }

    ngOnInit() {
        const data = this.options.data || {};
        this.bankAccounts = data.bankAccounts;
        this.selectedAccountID = data.selectedAccountID;

        this.matchEntries = data.entries || [];

        this.busy = true;
        this.session.initialize(0, this.selectedAccountID, 'bank').subscribe(
            () => {
                this.matchEntries.forEach(entry => {
                    this.session.addRowFromMatchEntry(this.selectedAccountID, entry);
                });

                this.session.ensureRowCount(3);
                this.resetTableLayout();
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    public closeEditor() {
        return this.table.finishEdit();
    }

    seriesChange(numberSeries) {
        this.session.series = numberSeries;
    }

    private loadRules() {
        this.ruleService.GetAll().subscribe(rules => {
            this.bankStatementRules = rules || [];
            this.numberOfActiveRules = this.bankStatementRules.reduce((count, rule) => {
                return rule.IsActive ? count + 1 : count;
            }, 0);
            this.runAllRules(true);
        }, err => console.error(err) );
    }

    openJournalingRulesModal() {
        this.modalService.open(BankStatementRulesModal).onClose.subscribe(rulesChanged => {
            if (rulesChanged) {
                this.loadRules();
            }
        });
    }

    runRule(rule: BankStatementRule) {
        this.ruleService.run(rule.ID, <any> this.matchEntries).subscribe(
            lines => this.session.addJournalingLines(lines),
            err => console.error(err)
        );
    }

    runAllRules(isAutorun: boolean = false) {
        this.autorunRuleLines = [];
        this.ruleService.runAll(<any> this.matchEntries).subscribe(
            lines => {
                if (isAutorun) {
                    this.autorunRuleLines = lines || [];
                    this.autoRunInfoText = this.groupUsedRuleNames(this.autorunRuleLines, this.bankStatementRules);
                } else {
                    const alteredLines = this.session.addJournalingLines(this.autorunRuleLines);

                    setTimeout(() => {
                        this.table.flashRows(alteredLines || []);
                    });
                }
            },
            err => console.error(err)
        );
    }

    groupUsedRuleNames(autorunRuleLines: any[], bankStatementRules: BankStatementRule[]): string {
        const rules = [];
        autorunRuleLines?.forEach( x => {
            if (rules.indexOf(x.BankStatementRuleID) < 0) {
                rules.push(x.BankStatementRuleID);
            }
        });
        if (rules.length) {
            return rules.map(id => bankStatementRules.find( r => r.ID === id).Name).join(', ');
        }
        return '';
    }

    useAutorunLines() {
        const alteredLines = this.session.addJournalingLines(this.autorunRuleLines);
        this.autorunRuleLines = [];

        setTimeout(() => {
            this.table.flashRows(alteredLines);
        });
    }

    closeWithoutSaving() {
        this.canDeactivate().subscribe(canClose => {
            if (canClose) {
                this.onClose.emit();
            }
        });
    }

    // Used by modalService! Don't remove unless you know you're supposed to
    canDeactivate(): Observable<boolean> {
        const hasAttachments = this.session.items.some(item => item.files && item.files.length > 0);
        if (hasAttachments) {
            return this.modalService.open(UnsavedAttachmentsModal, {
                data: this.session.items
            }).onClose;
        }

        return of(true);
    }

    save() {
        this.closeEditor().then(() => {
            this.busy = true;
            this.session.save(this.settings.journalAsDraft).subscribe(
                res => this.onClose.emit(res),
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                });
        });
    }

    public resetTableLayout() {
        this.tableConfig = this.createTableConfig();
    }

    public onRowDeleted(event: any) {
        this.session.recalc();
        this.ValidateTableData();
    }

    public onEditChange(event) {
        if (event.field && event.rowModel && event.newValue) {
            event.rowModel = this.session.setValue(event.field, event.newValue, event.originalIndex, event.rowModel) || event.rowModel;
            this.ValidateTableData();
            return event.rowModel;
        } else if (event.field) {
            this.session.items[event.originalIndex][event.field] = event.newValue;
            this.ValidateTableData();
            return;
        }
        this.autorunRuleLines = [];
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
                .setMaxLength(500),

            this.createLookupColumn('Project', 'Prosjekt', 'Project',
                x => this.lookupAny(x, 'projects', 'projectnumber'), 'ProjectNumber' )
                .setWidth('6rem').setVisible(false),

            this.createLookupColumn('Department', 'Avdeling', 'Department',
                x => this.lookupAny(x, 'departments', 'departmentnumber'), 'DepartmentNumber' )
                .setWidth('6rem').setVisible(false),

            new UniTableColumn('files', 'Vedlegg', UniTableColumnType.Attachment)
                .setOptions({
                    addFromInboxHandler: () => this.modalService.open(FileFromInboxModal).onClose,
                    previewHandler: (fileID) => {
                        this.modalService.open(ImageModal, {
                            header: 'Vedlegg',
                            data: {
                                fileIDs: [fileID],
                                readonly: true
                            }
                        });
                    }
                })
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
        const col = new UniTableColumn(name, label, UniTableColumnType.Lookup)
            .setDisplayField(forceDisplay || `${expandCol}.${expandLabel}`)
            .setOptions({
                itemTemplate: (item) => {
                    return (expandKey ? (item[expandKey] + ' - ') : '') + getDeepValue(item, expandLabel);
                },
                lookupFunction: lookupFn,
                debounceTime: 180
            });

        if (name === 'Debet' || name === 'Credit') {
            col.setOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this.lookupAccountByQuery(searchValue);
                },
                showResultAsTable: theme.theme === THEMES.SR,
                resultTableConfig: {
                    fields: [
                        {
                            header: 'Konto',
                            key: 'AccountNumber',
                            class: '',
                            width: '100px'
                        },
                        {
                            header: 'Navn',
                            key: 'AccountName',
                            class: '',
                            width: '250px'
                        },
                        {
                            header: 'Stikkord',
                            key: 'Keywords',
                            class: '',
                            width: '150px'
                        },
                        {
                            header: 'Beskrivelse',
                            key: 'Description',
                            class: '250px'
                        }
                    ],
                },
            });
        }
        return col;
    }

    private ValidateTableData() {
        this.errorMessages = [];

        // Check if any accounts are locked
        const rowsWithInvalidAccounts = this.session?.items.filter(x => (x.Debet && x.Debet.Locked) || (x.Credit && x.Credit.Locked));
        if (rowsWithInvalidAccounts.length > 0) {
            rowsWithInvalidAccounts.forEach(row => {
                let errorMsg = 'Kan ikke avstemme mot kontonr ';
                if (row.Debet && row.Debet.Locked) {
                    errorMsg += row.Debet.AccountNumber;
                    errorMsg += ', kontoen er sperret';
                } else if (row.Credit && row.Credit.Locked) {
                    errorMsg += row.Credit.AccountNumber;
                    errorMsg += ', kontoen er sperret';
                }

                // only notify once about each locked account
                if (!this.errorMessages.find(x => x.Message === errorMsg)) {
                    const message = new ValidationMessage();
                    message.Level = ValidationLevel.Error;
                    message.Message = errorMsg;
                    this.errorMessages.push(message);
                }
            });
        }
    }

    public getValidationLevelCss(validationLevel) {
        if (validationLevel === ValidationLevel.Error) {
            return 'error';
        } else if (validationLevel === ValidationLevel.Warning) {
            return 'warn';
        }
        return 'good';
    }

    public getValidationIcon(validationLevel: number): string {
        const type = this.getValidationLevelCss(validationLevel);
        if (type === 'good') {
            return 'check_circle';
        } else {
            return type === 'error' ? 'error' : 'warning';
        }
    }

    private filterInputAllowPercent(v: string) {
        return v.replace(/[`~!@#$^&*()_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    }

    public lookupAccountByQuery(txt: string) {
        const lcaseText = this.filterInputAllowPercent(txt.toLowerCase());
        const isNumeric = parseInt(lcaseText, 10);

        const cache = this.cachedQuery[lcaseText];
        if (cache) {
            return of(cache);
        }

        let filter = '';
        if (isNumeric > 0) {
            filter = `Visible eq 'true' and startswith(accountnumber,'${lcaseText}')`;
        } else {
            filter = `Visible eq 'true' and ( contains(keywords,'${lcaseText}') or contains(Description,'${lcaseText}')`
            + ` or contains(accountname,'${lcaseText}') )`;
        }
        return this.session.query(
            'accounts',
            'select', 'ID,AccountNumber,AccountName,CustomerID,SupplierID,VatTypeID,Keywords,Description,Locked',
            'filter', filter,
            'orderby', 'AccountNumber',
            'top', 50
        ).pipe(tap(res => this.cachedQuery[lcaseText] = res));
    }

    public lookupVatType(query: string) {
        const lcaseText = query.toLowerCase();
        const vatTypes = this.session.vatTypes.filter((item: IVatType) => {
            return item.VatCode.toString() === query
                || item.VatPercent.toString() === query
                || item.Name.toLowerCase().indexOf(lcaseText) >= 0;
        });

        return of(vatTypes);
    }

    public lookupAny(
        txt: string,
        route: string = 'projects',
        visualIdcol: string = 'id',
        nameCol: string = 'name',
        expand?: string
    ) {
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

        return this.session.query(
            route,
            'select', select,
            'orderby', orderBy,
            'top', '50',
            'filter', filter, 'expand', expand
        );
    }

}
