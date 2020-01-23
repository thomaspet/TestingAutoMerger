import {Component, Input, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {defaultOperators} from '@uni-framework/ui/ag-grid/filters/filter-operators';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {BankService} from '@app/services/accounting/bankService';
import { IUniSearchConfig } from '@uni-framework/ui/unisearch';
import { UniSearchAccountConfig } from '@app/services/services';
import {BankRule} from '@uni-entities';
import { Observable } from 'rxjs';

@Component({
    selector: 'journaling-rules-modal',
    templateUrl: './journaling-rules-modal.html',
    styleUrls: ['./journaling-rules-modal.sass']
})

export class JournalingRulesModal implements OnInit, IUniModal {
    @ViewChild('listTable', { static: true })
    public detailsTable: AgGridWrapper;

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    actions: any = [
        { label: 'Bokfør uten match',   value: 1 },
        { label: 'Ikke bokfør',         value: 2 },
        { label: 'Ignorer betaling',    value: 3 },
        { label: 'Bokfør til konto:',   value: 4 }
    ];
    busy: boolean = false;
    dirty: boolean = false;
    filters: any[] = [];
    columns: any[] = [];
    bankRules: BankRule[] = [];
    currentRule: BankRule = new BankRule();
    originalRule: BankRule;
    tableConfig: UniTableConfig;
    uniSearchConfig: IUniSearchConfig;

    priorityHasChanged: boolean = false;
    accountSearchActive: boolean = false;
    hasInitialNewRule: boolean = false;
    activeIndex = 0;

    constructor(
        private bankService: BankService,
        private toast: ToastService,
        private uniSearchAccountConfig: UniSearchAccountConfig
    ) { }

    public ngOnInit() {
        this.busy = true;
        this.columns = this.options.data.headers;
        this.uniSearchConfig = this.uniSearchAccountConfig.generateAllAccountsConfig();
        this.uniSearchConfig.placeholder = 'Søk på konto';
        this.hasInitialNewRule = !!this.options.data.rule;
        this.getData();
    }

    public formatRules(rule: string) {
        this.filters = [];
        const ruleArray = rule.split(' and ');

        ruleArray.forEach((r) => {
            if (r.startsWith('contains') || r.startsWith('startswith') || r.startsWith('endswith')) {
                const values = r.split('(');
                const fieldAndValue = values[1].split(',');

                // Remove ' ' from value if added by backend
                let value = fieldAndValue[1].substr(0, fieldAndValue[1].length - 1);
                if (value.substr(0, 1) === `'` ) { value = value.substr(1, value.length); }
                if (value.substr(value.length - 1, 1) === `'` ) { value = value.substr(0, value.length - 1); }
                const newFilter = {
                    field: fieldAndValue[0],
                    operator: values[0],
                    value: value.replace(/^\s+/, '') || '',
                    _availableOperators: defaultOperators
                };
                this.filters.push(newFilter);
            } else {
                const values = r.split(' ');

                // Remove ' ' from value if added by backend
                let value = values.splice(2, values.length - 1).join(' ') || ' ';
                if (value.substr(0, 1) === `'` ) { value = value.substr(1, value.length); }
                if (value.substr(value.length - 1, 1) === `'` ) { value = value.substr(0, value.length - 1); }
                this.filters.push({
                    field: values[0],
                    operator: values[1],
                    value: value.replace(/^\s+/, '') || '',
                    _availableOperators: defaultOperators
                });
            }
        });
    }

    public getData() {
        this.bankService.getAllRules().subscribe((rules) => {
            let isEmtpyWithNew: boolean = false;

            if ((!rules || !rules.length) && !this.hasInitialNewRule) {
                rules = [ this.getNewBankRule() ];
                isEmtpyWithNew = true;
            }

            this.setTableConfig();
            this.bankRules = rules || [];

            if (this.hasInitialNewRule) {
                this.bankRules = [].concat(this.bankRules, [this.options.data.rule]);
                this.activeIndex = this.bankRules.length - 1;

                this.currentRule = this.bankRules[this.activeIndex];
                this.currentRule.Priority = this.bankRules.length;
                isEmtpyWithNew = true;
                this.hasInitialNewRule = false;
            } else {
                if (this.activeIndex >= this.bankRules.length || this.activeIndex < 0) {
                    this.activeIndex = 0;
                }
                this.currentRule = rules[this.activeIndex];
                this.uniSearchConfig.initialItem$.next(this.currentRule.Account || null);
                this.accountSearchActive = this.currentRule.ActionCode !== 4;
                this.originalRule = JSON.parse(JSON.stringify(this.currentRule));
            }

            this.formatRules(this.currentRule.Rule);
            this.busy = false;

            setTimeout(() => {
                this.detailsTable.focusRow(this.activeIndex);
                this.setDirtyOrClean(isEmtpyWithNew);
            }, 100);
        }, err => {
            this.busy = false;
            this.toast.addToast('Noe gikk galt', ToastType.bad, 10, 'Klarer ikke hente opp regler. Lukk modal og prøv igjen.');
        });
    }

    public regretChanges() {
        this.currentRule = this.originalRule;
        this.setDirtyOrClean(false);
        this.formatRules(this.currentRule.Rule);
        this.accountSearchActive = this.currentRule.ActionCode !== 4;
        this.uniSearchConfig.initialItem$.next(this.currentRule.Account || null);
    }

    addFilter() {
        this.setDirtyOrClean(true);
        this.filters.push({
            field: '',
            operator: '',
            value: '',
            _availableOperators: defaultOperators
        });
    }

    checkActiveRule() {
        this.setDirtyOrClean(true);
    }

    onActionChange(action) {
        this.setDirtyOrClean(true);
        this.currentRule.ActionCode = action.value;
        this.accountSearchActive = action.value !== 4;
    }

    public setDirtyOrClean(dirty: boolean) {
        this.dirty = dirty;
        this.detailsTable.setRowDragSuppressed(dirty);
        this.detailsTable.setRowClickSuppressed(dirty);
    }

    public onRowSelect(rule: BankRule, isNew: boolean = false) {
        if (this.dirty) {
            return;
        }

        this.setDirtyOrClean(isNew);
        this.currentRule = rule;
        this.activeIndex = rule['_originalIndex'];
        this.originalRule = JSON.parse(JSON.stringify(this.currentRule));
        this.formatRules(this.currentRule.Rule);
        this.accountSearchActive = this.currentRule.ActionCode !== 4;
        this.uniSearchConfig.initialItem$.next(this.currentRule.Account || null);
        setTimeout(() => {
            this.detailsTable.focusRow(this.activeIndex);
        });
    }

    public onRowDelete(row) {
        row.Deleted = true;
        this.toast.addToast('Regel slettet', ToastType.good, 10);
    }

    public onPriorityChange(event) {
        if (event && event.filter(rule => rule.Priority !== (rule._originalIndex + 1) || rule.Deleted).length) {
            this.priorityHasChanged = true;
            this.dirty = true;
            this.activeIndex = event.findIndex(rule => rule.ID === this.currentRule.ID);

            event.map((rule) => {
                rule.Priority = rule['_originalIndex'] + 1;
                return rule;
            });

            this.bankRules = [...event];
            this.saveRules();
        }
    }

    public onAccountSelected(account) {
        this.currentRule.AccountID = account.ID;
        this.currentRule['Account'] = account;
        this.setDirtyOrClean(true);
    }

    public removeFilter(index) {
        if (this.filters.length === 1) {
            this.toast.addToast('Kan ikke fjerne siste regel', ToastType.warn);
            return;
        }

        this.filters.splice(index, 1);
        this.setDirtyOrClean(true);
    }

    public saveRules() {
        this.busy = true;

        if (this.priorityHasChanged) {
            Observable.forkJoin(
                this.bankRules.map(rule => {
                    return this.bankService.saveRule(rule);
                })
            ).subscribe(() => {
                this.setDirtyOrClean(false);
                this.priorityHasChanged = false;
                this.toast.addToast('Ny rekkefølge lagret', ToastType.good, 5);
                this.getData();
            }, err => {
                this.busy = false;
                this.toast.addToast('Kunne ikke lagre', ToastType.bad, 10, 'Noe gikk galt ved lagring av rekkefølgen på reglene.');
            });
        } else {
            const rule = [];
            this.filters.forEach((f) => {
                let filter = '';
                if (defaultOperators.slice(0, 3).find(op => op.operator === f.operator )) {
                    filter = `${f.operator}(${f.field},'${f.value}')`;
                } else {
                    filter = f.field + ' ' + f.operator + ' ' + (!f.value ? `''` : `'` + f.value + `'`);
                }
                rule.push(filter);
            });
            this.currentRule.Rule = rule.join(' and ');

            // Check if rules are valid..
            this.bankService.saveRule(this.currentRule).subscribe(res => {
                this.toast.addToast('Regel lagret', ToastType.good, 5);
                this.setDirtyOrClean(false);
                this.getData();
            }, err => {
                this.busy = false;
                this.toast.addToast('Kunne ikke lagre', ToastType.bad, 10, 'Sjekk at alle felter er fylt ut og prøv igjen.');
            });
        }
    }

    public close() {
        this.onClose.emit();
    }

    public setTableConfig() {
        this.tableConfig = new UniTableConfig(
            'sales.kidsettings.details', false, true, 15)
            .setColumnMenuVisible(false)
            .setSortable(false)
            .setRowDraggable(true)
            .setDeleteButton(true)
            .setColumns([ new UniTableColumn('Name', 'Beskrivelse', UniTableColumnType.Text) ]);
    }

    public newRule() {
        this.bankRules = [].concat(this.bankRules, [this.getNewBankRule()]);
        this.activeIndex = this.bankRules.length - 1;
        this.onRowSelect(this.bankRules[this.activeIndex], true);
    }

    public getNewBankRule() {
        const newRule = new BankRule();
        newRule.ActionCode = 1;
        newRule.Name = 'Min nye regel';
        newRule.Priority = this.bankRules.length + 1;
        newRule.Rule = `${this.columns[0].Field} ${defaultOperators[0].operator} verdi`;
        newRule.StatusCode = 30001;
        newRule.IsActive = true;
        newRule['_originalIndex'] = this.bankRules.length;
        return newRule;
    }
}
