import {Component, EventEmitter} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import {IUniModal, IModalOptions, UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {QueryItem, QueryBuilderField} from './query-builder/query-builder';
import {BankStatementRule} from '@uni-entities';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';
import {StatisticsService, BankStatementRuleService, ErrorService, AccountService} from '@app/services/services';
import {map, catchError, tap} from 'rxjs/operators';
import {QueryParser} from './query-parser';
import {of, forkJoin, Subscription, throwError} from 'rxjs';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import * as moment from 'moment';

@Component({
    templateUrl: './bank-statement-rules.html',
    styleUrls: ['./bank-statement-rules.sass']
})
export class BankStatementRulesModal implements IUniModal {
    options: IModalOptions;
    onClose = new EventEmitter();

    fields: QueryBuilderField[] = this.getFields();
    autocompleteOptions: AutocompleteOptions = this.getAutocompleteOptions();

    rules: BankStatementRule[];
    activeRule: BankStatementRule;
    queryItems: QueryItem[];

    busy = false;
    ruleDeleted = false;
    accountSubscription: Subscription;

    constructor(
        private modalService: UniModalService,
        private toastService: ToastService,
        private statisticsService: StatisticsService,
        private accountService: AccountService,
        private ruleService: BankStatementRuleService,
        private errorService: ErrorService
    ) {}

    ngOnInit() {
        this.busy = true;
        this.ruleService.GetAll().pipe(
            catchError(err => {
                this.errorService.handle(err);
                return of([]);
            })
        ).subscribe(rules => {
            this.rules = (rules && rules.length) ? rules : [{ Name: 'Ny regel', IsActive: true}];
            this.onRuleSelected(this.rules[0]);
            this.busy = false;
        });
    }

    onRuleSelected(rule: BankStatementRule) {
        this.activeRule = rule;
        this.queryItems = [];

        if (rule.Rule) {
            const parser = new QueryParser();
            try {
                this.queryItems = parser.parseExpression(rule.Rule);
            } catch (e) {
                console.error(e);
            }
        }

        // Unsubscribe to avoid timing issue with in-flight requests when switching between rules quickly
        if (this.accountSubscription) {
            this.accountSubscription.unsubscribe();
        }

        if (rule.AccountID) {
            this.accountSubscription = this.accountService.Get(rule.AccountID).subscribe(
                account => this.activeRule['_account'] = account,
                err => console.error(err)
            );
        }
    }

    onQueryChange() {
        this.markActiveRuleDirty();
        this.activeRule.Rule = this.buildQueryString(this.queryItems);
    }

    onAccountChange() {
        const account = this.activeRule['_account'];
        this.activeRule.AccountID = account && account.ID || null;
        this.markActiveRuleDirty();
    }

    markActiveRuleDirty() {
        this.activeRule['_dirty'] = true;
    }

    addRule() {
        this.rules.push(<BankStatementRule> { Name: 'Ny regel', IsActive: true });
        this.activeRule = this.rules[this.rules.length - 1];
        this.queryItems = [];
    }

    deleteRule(rule: BankStatementRule) {
        this.modalService.confirm({
            header: 'Bekreft sletting',
            message: `Vennligst bekreft sletting av regel "${rule.Name}"`,
            buttonLabels: {
                accept: 'Slett',
                reject: 'Avbryt'
            }
        }).onClose.subscribe(res => {
            if (res === ConfirmActions.ACCEPT) {
                if (rule.ID) {
                    this.ruleService.Remove(rule.ID).subscribe(
                        () => {
                            this.rules = this.rules.filter(r => r !== rule);
                            this.activeRule = this.rules[0];
                            this.ruleDeleted = true;
                        },
                        err => this.errorService.handle(err)
                    );
                } else {
                    this.rules = this.rules.filter(r => r !== rule);
                }
            }
        });
    }

    onRuleMoved(event: CdkDragDrop<BankStatementRule[]>) {
        moveItemInArray(this.rules, event.previousIndex, event.currentIndex);
        this.rules.forEach((rule, index) => {
            rule.Priority = index + 1;
            rule['_dirty'] = true;
        });
    }

    save() {
        const requests = [];
        let hasInvalidRule = false;
        this.rules.forEach((rule, index) => {
            if (!rule.Rule || !rule.Rule.length) {
                hasInvalidRule = true;
            }

            if (rule['_dirty']) {
                let req = rule.ID
                    ? this.ruleService.Put(rule.ID, rule)
                    : this.ruleService.Post(rule);

                req = req.pipe(
                    catchError(err => {
                        console.error(err);
                        const errorMessage = this.errorService.extractMessage(err);
                        rule['_error'] = errorMessage;
                        return of(rule);
                    }),
                    tap(updatedRule => {
                        this.rules[index] = updatedRule;
                        if (rule === this.activeRule) {
                            this.activeRule = updatedRule;
                        }
                    })
                );

                requests.push(req);
            }
        });

        if (!requests.length) {
            this.onClose.emit(this.ruleDeleted);
            return;
        }

        if (hasInvalidRule) {
            this.toastService.toast({
                title: 'En eller flere regler er ikke gyldige',
                message: 'Alle regler må ha minimum én fullstendig utfylt betingelse for kjøring',
                type: ToastType.bad,
                duration: 5
            });

            return;
        }

        this.busy = true;
        forkJoin(requests).subscribe(updatedRules => {
            const failed = updatedRules.filter(rule => rule['_error']);
            if (failed.length) {
                this.toastService.toast({
                    type: ToastType.warn,
                    duration: 10,
                    title: `${failed.length} av ${requests.length} lagringer feilet`,
                    message: 'Reglene som ikke ble lagret er markert med et feilmeldingsikon i listen.'
                        + '<br>Du kan holde musepekeren over ikonet for å se årsak.',
                });

                this.busy = false;
            } else {
                this.onClose.emit(true);
            }
        });
    }

    private buildQueryString(items: QueryItem[]) {
        let string = '';
        items.forEach(item => {
            if (!item.field || !item.operator || !item.value) {
                return '';
            }

            if (item.logicalOperator) {
                string += ` ${item.logicalOperator} `;
            }

            const field = this.fields.find(f => f.field === item.field);
            let value = field && field.type === 'date'
                ? moment(item.value).format('YYYY-MM-DD')
                : item.value;

            if (!field || field.type !== 'number') {
                value = `'${value}'`;
            }

            const isFunctionOperator = ['contains', 'startswith', 'endswith'].includes(item.operator);
            const query = isFunctionOperator
                ? `${item.operator}(${item.field},${value})`
                : `${item.field} ${item.operator} ${value}`;

            if (item.siblings && item.siblings.length) {
                string += `(${query}${this.buildQueryString(item.siblings)})`;
            } else {
                string += query;
            }
        });


        return string.replace('  ', ' ');
    }

    private getFields(): QueryBuilderField[] {
        return [
            {
                label: 'Tekst',
                field: 'Entry.Description',
                type: 'text'
            },
            {
                label: 'Beløp',
                field: 'Entry.Amount',
                type: 'number'
            },
            {
                label: 'Dato',
                field: 'Entry.BookingDate',
                type: 'date'
            },
            {
                label: 'Valutabeløp',
                field: 'Entry.AmountCurrency',
                type: 'number'
            },
            {
                label: 'Fakturanummer',
                field: 'Entry.InvoiceNumber',
                type: 'text'
            }
        ];
    }

    private getAutocompleteOptions() {
        return {
            displayFunction: item => `${item.AccountNumber} - ${item.AccountName}`,
            lookup: (query: string) => {
                const select = [
                    'Account.ID as ID',
                    'Account.AccountNumber as AccountNumber',
                    'Account.AccountName as AccountName'
                ].join(',');

                let filter = 'Account.Visible eq 1';
                if (query) {
                    filter += ` and (startswith(Account.AccountNumber,'${query}') or contains(Account.AccountName,'${query}') )`;
                }

                const params = new HttpParams()
                    .set('model', 'Account')
                    .set('top', '50')
                    .set('orderby', 'AccountNumber')
                    .set('select', select)
                    .set('filter', filter);

                return this.statisticsService.GetAllByHttpParams(params).pipe(
                    map(res => res.body && res.body.Data)
                );
            }
        };
    }
}
