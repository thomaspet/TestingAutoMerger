import { ICellClickEvent } from '@uni-framework/ui/ag-grid/interfaces';
import { SalaryTransactionSupplementService } from '@app/components/salary/shared/services/salary-transaction/salary-transaction-supplement.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { SalaryTransactionSupplement, SalaryTransaction, Employee, PayrollRun, Valuetype } from '@uni-entities';
import { ReplaySubject, Observable, forkJoin } from 'rxjs';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { PayrollrunService, SalaryTransactionService, EmployeeService, ErrorService, FinancialYearService, StatisticsService } from '@app/services/services';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { ActivatedRoute } from '@angular/router';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { UniSupplementEditModal } from '@app/components/salary/salary-transaction-supplement/edit-value-modal.component';

@Component({
    selector: 'salary-transaction-supplement-list',
    templateUrl: './salary-transaction-supplement-list.component.html'
})
export class SalaryTransactionSupplementListComponent implements OnInit {

    @ViewChild(AgGridWrapper, { static: true })
    private table: AgGridWrapper;

    public model$: SalaryTransactionSupplement[] = [];
    public tableConfig$: ReplaySubject<UniTableConfig>;

    year: number = 0;
    payrollRunID: number = 0;

    public toolbarConfig: IToolbarConfig = {
        title: 'Tilleggsopplysninger'
    };

    constructor(
        private payrollRunService: PayrollrunService,
        private salaryTransactionService: SalaryTransactionService,
        private employeeService: EmployeeService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private supplementService: SalaryTransactionSupplementService,
        private tabService: TabService,
        private route: ActivatedRoute,
        private modalService: UniModalService,
        private statisticsService: StatisticsService
    ) {
        this.tableConfig$ = new ReplaySubject<UniTableConfig>(1);

        this.tabService.addTab({
            moduleID: UniModules.Supplements,
            name: 'Tilleggsopplysninger',
            url: 'salary/supplements'
        });

        this.route.params.subscribe(params => {
            this.year = this.financialYearService.getActiveYear();

            this.payrollRunID = +params['runID'] || undefined;

            if ((!this.model$ || !this.payrollRunID)) {
                this.getModel(this.payrollRunID, this.year).subscribe(res => this.model$ = res);
            }
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
        const supplementTextCol = new UniTableColumn('_Name', 'Opplysningsfelt',
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

        let pageSize = window.innerHeight - 350;

        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34);

        return new UniTableConfig('salary.salaryTransactionSupplementsList', false, true, pageSize)
            .setAutoAddNewRow(false)
            .setColumns([employeeCol, wageTypeCol, textCol, supplementTextCol, valueCol,
                fromDate, toDate, runCol, amountCol, sumCol])
            .setSearchable(true)
            .setContextMenu([{
                label: 'Rediger verdi',
                action: line => this.editValue(line)
            }])
            .setChangeCallback((event) => {
                const row = event.rowModel;
                if (row.WageTypeSupplement) {
                    row['_isDirty'] = true;
                }
                return this.updateValue(row, row['_Value']);
            });
    }

    onCellClick(clickEvent: ICellClickEvent) {
        if (clickEvent && clickEvent.column && clickEvent.column.field === '_Value') {
            this.editValue(clickEvent.row);
        }
    }

    public editValue(line) {
        this.modalService.open(UniSupplementEditModal, { data: { line: line } }).onClose.subscribe((newLine) => {
            // Replace old line with new line in the array. No need to get data again.
            if (newLine) {
                this.model$.splice(line._originalIndex, 1, newLine);
                this.model$ = [...this.model$];
            }
        });
    }

    public canDeactivate(): Observable<boolean> {
        if (!this.table.getTableData().some(row => row['_isDirty'])) {
            return Observable.of(true);
        }

        return this.modalService
            .openUnsavedChangesModal()
            .onClose
            .map(result => {
                if (result === ConfirmActions.ACCEPT) {
                    this.save(m => {});
                }

                return result !== ConfirmActions.CANCEL;
            });
    }

    private getModel(payrollRunID: number, year: number): Observable<SalaryTransactionSupplement[]> {
        return this.transObservable(payrollRunID, year)
            .switchMap((response: [SalaryTransaction[], number[]]) => {
                const [transes, empIDs] = response;
                return Observable.forkJoin(
                    Observable.of(transes),
                    this.employeeObservable(empIDs));
            })
            .map((result: [SalaryTransaction[], Employee[]]) => {
                const [transes, employees] = result;

                return transes
                    .map(trans =>
                        trans
                            .Supplements
                            .filter(supplement => !supplement.WageTypeSupplement?.GetValueFromTrans)
                            .map(supplement => {
                                const wtSupp = supplement && supplement.WageTypeSupplement;
                                supplement['_Employee'] = employees.find(emp => emp.ID === trans.EmployeeID);
                                supplement['_WageTypeNumber'] = trans.WageTypeNumber;
                                supplement['_PayrollRunID'] = trans.PayrollRunID;
                                supplement['_Text'] = trans.Text;
                                supplement['_FromDate'] = trans.FromDate;
                                supplement['_ToDate'] = trans.ToDate;
                                supplement['_Amount'] = trans.Amount;
                                supplement['_Sum'] = trans.Sum;
                                supplement['_Name'] = (wtSupp && (wtSupp.Description || wtSupp.Name));
                                return supplement;
                            })
                            .filter(wtS => !!wtS.WageTypeSupplement && !wtS.WageTypeSupplement.Deleted))
                    .reduce((prev, curr, arr) => [...prev, ...curr], []);
            });
    }

    // TODO: switch to helper function when merged
    private employeeObservable(empIDs: number[]) {
        const empObservables = [];
        const empRanges = this.employeeService.getFromToFilter(empIDs);
        let removeIdx = 50;

        for (let i = 0;  i < empRanges.length; i += 50) {
            let empFilter = 'filter=';
            const max50Ranges = empRanges.slice(i, removeIdx);

            empFilter += '(' + max50Ranges.map(({from, to}) => {
                if (from !== to) {
                    return `(ID ge ${from} and ID le ${to})`;
                }
                return `ID eq ${from}`;
            }).join(' or ') + ') ';

            empObservables.push(
                this.employeeService.GetAll(empFilter, ['BusinessRelationInfo'])
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            );

            removeIdx += 50;
        }

        return  empObservables.length
            ? forkJoin(empObservables).map((results: Array<Employee>[]) => results.reduce((acc, curr) => [...acc, ...curr], []))
            : Observable.of([]);
    }

    private transObservable(payrollRunID: number, year: number) {
        return (payrollRunID
            ? this.salaryTransactionService
                .GetAll(`filter=PayrollRunID eq ${payrollRunID}`
                , ['Supplements.WageTypeSupplement'])
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .map((transes: SalaryTransaction[]) => {
                    const empIDs = [];
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
                    const empIDs: number[] = [];
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

    private save(done: (message: string) => void) {
        const saveStatus: { started: number, completed: number, error: number } = {
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
                    const dates: Date[] = value.split('-').map(date => new Date(date));
                    if (dates.length > 0) {
                        supplement.ValueDate = dates[0];
                        supplement.ValueDate2 = dates[0];
                    }
            }
        }
        return supplement;
    }
}
