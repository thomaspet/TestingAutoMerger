import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UniTableConfig, UniTableColumn, UniTableColumnType, UniTable } from 'unitable-ng2/main';
import { IUniSaveAction } from '../../../../framework/save/save';
import { IToolbarConfig } from '../../common/toolbar/toolbar';
import {
    PayrollrunService, EmployeeService, ErrorService,
    SalaryTransactionService, YearService, SupplementService
} from '../../../services/services';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import {
    PayrollRun, SalaryTransaction, Employee, SalaryTransactionSupplement,
    Valuetype
} from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { UniConfirmModal, ConfirmActions } from '../../../../framework/modals/confirm';

type HashMap<T> = {
    [key: string]: T;
}
@Component({
    selector: 'salary-transaction-supplement-list',
    templateUrl: './salaryTransactionSupplementsList.html'
})
export class SalaryTransactionSupplementList implements OnInit {

    private model$: Observable<SalaryTransactionSupplement[]>;
    private tableConfig$: ReplaySubject<UniTableConfig>;
    private transactions: SalaryTransaction[];
    private saveActions: IUniSaveAction[] = [{
        action: this.save.bind(this),
        disabled: true,
        label: 'Lagre',
        main: true
    }];
    private toolbarConfig: IToolbarConfig = {
        title: 'Tilleggsopplysninger'
    }
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    constructor(
        private payrollRunService: PayrollrunService,
        private salaryTransactionService: SalaryTransactionService,
        private employeeService: EmployeeService,
        private errorService: ErrorService,
        private yearService: YearService,
        private supplementService: SupplementService,
        private tabService: TabService,
        private route: ActivatedRoute) {
        this.tableConfig$ = new ReplaySubject<UniTableConfig>(1);
        this.route.params.subscribe(params => {
            let payrollRunID = +params['runID'] || undefined;
            this.updateTabStrip();
            this.yearService.selectedYear$.subscribe( year => {
                if((!this.model$ || !payrollRunID)){
                    this.model$ = this.getModel(payrollRunID, year);
                }
            });            
        });
    }

    public ngOnInit() {
        this.tableConfig$.next(this.getConfig());
    }

    private getConfig(): UniTableConfig {
        const employeeCol = new UniTableColumn('', 'Ansatt', UniTableColumnType.Text, false)
            .setTemplate((rowModel: SalaryTransactionSupplement) =>
                `${rowModel['_Employee'].EmployeeNumber} - ${rowModel['_Employee'].BusinessRelationInfo.Name}`);
        const wageTypeCol = new UniTableColumn('_WageTypeNumber', 'Lønnsart', UniTableColumnType.Number, false)
            .setWidth('5.5rem');
        const textCol = new UniTableColumn('_Text', 'Tekst', UniTableColumnType.Text, false);
        const supplementTextCol = new UniTableColumn('WageTypeSupplement.Description', 'Opplysningsfelt',
            UniTableColumnType.Text, false);
        const valueCol = new UniTableColumn('_Value', 'Verdi', UniTableColumnType.Text, true)
            .setTemplate((rowModel: SalaryTransactionSupplement) => this.showValue(rowModel));
        const fromDate = new UniTableColumn('_FromDate', 'Fra dato', UniTableColumnType.LocalDate, false)
            .setWidth('6rem');
        const toDate = new UniTableColumn('_ToDate', 'Til dato', UniTableColumnType.LocalDate, false)
            .setWidth('6rem');
        const runCol = new UniTableColumn('_PayrollRunID', 'Avregning', UniTableColumnType.Number, false)
            .setWidth('6rem');
        const amountCol = new UniTableColumn('_Amount', 'Antall', UniTableColumnType.Number, false);
        const sumCol = new UniTableColumn('_Sum', 'Beløp', UniTableColumnType.Money, false);

        return new UniTableConfig()
            .setAutoAddNewRow(false)
            .setColumns([employeeCol, wageTypeCol, textCol, supplementTextCol, valueCol,
                fromDate, toDate, runCol, amountCol, sumCol])
            .setSearchable(true)
            .setChangeCallback((event) => {
                let row = event.rowModel;
                if (row.WageTypeSupplement) {
                    row['_isDirty'] = true;
                    this.saveActions[0].disabled = false;
                }
                return this.updateValue(row, row['_Value']);
            });
    }

    public canDeactivate(): Observable<boolean> {
        return this.transactions.some(x => x['_isDirty'])
            ? Observable
                .fromPromise(this.confirmModal.confirmSave())
                .map((response: ConfirmActions) => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.save(() => { });
                        return true;
                    } else {
                        return response === ConfirmActions.REJECT;
                    }
                })
                .map(canDeactivate => {
                    if (!canDeactivate) {
                        this.updateTabStrip();
                    }
                    return canDeactivate;
                })
            : Observable.of(true);
    }

    private getModel(payrollRunID: number, year: number): Observable<SalaryTransactionSupplement[]> {
        return this.transObservable(payrollRunID, year)
            .switchMap((response: [SalaryTransaction[], number[]]) => {
                let [transes, empIDs] = response;
                this.transactions = transes;
                return Observable.forkJoin(
                    Observable.of(transes),
                    this.employeeObservable(empIDs));
            })
            .map((result: [SalaryTransaction[], Employee[]]) => {
                let [transes, employees] = result;
                return transes
                    .map(trans =>
                        trans
                            .Supplements
                            .map(supplement => {
                                supplement['_Employee'] = employees.find(emp => emp.ID === trans.EmployeeID);
                                supplement['_WageTypeNumber'] = trans.WageTypeNumber;
                                supplement['_PayrollRunID'] = trans.PayrollRunID;
                                supplement['_Text'] = trans.Text;
                                supplement['_FromDate'] = trans.FromDate;
                                supplement['_ToDate'] = trans.ToDate;
                                supplement['_Amount'] = trans.Amount;
                                supplement['_Sum'] = trans.Sum;
                                return supplement;
                            }))
                    .reduce((prev, curr, arr) => [...prev, ...curr], []);
            });
    }

    private employeeObservable(empIDs: number[]) {
        return empIDs.length
            ? this.employeeService
                .GetAll(`filter=${empIDs.map(x => 'ID eq ' + x).join(' or ')}`,
                ['BusinessRelationInfo'])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            : Observable.of([]);
    }

    private transObservable(payrollRunID: number, year: number) {
        return (payrollRunID
            ? this.salaryTransactionService
                .GetAll(`filter=PayrollRunID eq ${payrollRunID}`
                , ['Supplements.WageTypeSupplement'])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .map((transes: SalaryTransaction[]) => {
                    let empIDs = [];
                    return [
                        transes.filter(trans => trans.Supplements && trans.Supplements.length).map(trans => {
                            if (!empIDs.some(x => x === trans.EmployeeID)) {
                                empIDs.push(trans.EmployeeID);
                            }
                            return trans;
                        }), empIDs];
                })
            : this.payrollRunService
                .GetAll(
                `filter=StatusCode ge 1 and year(PayDate) eq ${year}`
                , ['transactions.Supplements.WageTypeSupplement'])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .map((payrollRuns: PayrollRun[]) => {
                    let empIDs: number[] = [];
                    return [
                        payrollRuns
                            .map(run => run.transactions)
                            .reduce((prev, curr, index, arr) => [...prev, ...curr], [])
                            .filter(trans => trans.Supplements && trans.Supplements.length)
                            .map(trans => {
                                if (!empIDs.some(x => x === trans.EmployeeID)) {
                                    empIDs.push(trans.EmployeeID);
                                }
                                return trans;
                            }), empIDs];
                }));
    }

    private updateTabStrip() {
        this.tabService.addTab({
            moduleID: UniModules.Supplements,
            name: 'Tilleggsopplysninger',
            url: 'salary/supplements'
        });
    }

    private save(done: (message: string) => void) {
        let saveStatus: { started: number, completed: number, error: number } = {
            started: 0,
            completed: 0,
            error: 0
        };

        this.table
            .getTableData()
            .filter(supp => supp['_isDirty'])
            .forEach((supp: SalaryTransactionSupplement) => {
                saveStatus.started ++;
                this.supplementService
                    .Put(supp.ID, supp)
                    .finally(() => {
                        if (saveStatus.started === (saveStatus.completed + saveStatus.error)) {
                            saveStatus.error ? done('Feil ved lagring') : done('Lagret');
                            this.toggleSave();
                        }
                    })
                    .subscribe(saved => {
                        supp['_isDirty'] = false;
                        this.table.updateRow(supp['_originalIndex'], this.updateValue(supp, this.showValue(saved)));
                        saveStatus.completed++;
                    }
                    , err => {
                        this.errorService.handle(err);
                        saveStatus.error++;
                    });
            });
    }

    private showValue(supplement: SalaryTransactionSupplement): string {
        if (supplement.WageTypeSupplement) {
            switch (supplement.WageTypeSupplement.ValueType) {
                case Valuetype.IsBool:
                    return supplement.ValueBool.toString();
                case Valuetype.IsDate:
                    return supplement.ValueDate.toString();
                case Valuetype.IsMoney:
                    return supplement.ValueMoney.toString();
                case Valuetype.IsString:
                    return supplement.ValueString;
                case Valuetype.Period:
                    return `${supplement.ValueDate} - ${supplement.ValueDate2}`;
            }
        }
    }

    private updateValue(supplement: SalaryTransactionSupplement, value: string): SalaryTransactionSupplement {
        if (supplement.WageTypeSupplement) {
            switch (supplement.WageTypeSupplement.ValueType) {
                case Valuetype.IsBool:
                    supplement.ValueBool = value === 'true' || +value > 0;
                    break;
                case Valuetype.IsDate:
                    supplement.ValueDate = new Date(value);
                    break;
                case Valuetype.IsMoney:
                    supplement.ValueMoney = +value;
                    break;
                case Valuetype.IsString:
                    supplement.ValueString = value;
                    break;
                case Valuetype.Period:
                    let dates: Date[] = value.split('-').map(date => new Date(date));
                    if (dates.length > 0) {
                        supplement.ValueDate = dates[0];
                        supplement.ValueDate2 = dates[0];
                    }
            }
        }
        return supplement;
    }

    private toggleSave() {
        this.saveActions[0].disabled = !this.table.getTableData().some(trans => trans['_isDirty']);
    }
}
