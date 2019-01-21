import { Injectable, Type } from '@angular/core';
import {EmployeeCategory, Employee, PayrollRun, UniEntity, StdSystemType} from '@uni-entities';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {UniHttp} from '@uni-framework/core/http/http';
import {map, switchMap, catchError, filter} from 'rxjs/operators';
import {PayrollRunOnCategoryService} from '../payrollRun/payrollRunOnCategoryService';
import {forkJoin, Observable, of as observableOf} from 'rxjs';
import {ErrorService} from '@app/services/common/errorService';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {ITag} from '@app/components/common/toolbar/tags';

@Injectable()
export class EmployeeOnCategoryService extends BizHttp<EmployeeCategory> {

    constructor(
        protected http: UniHttp,
        private runsOnCategory: PayrollRunOnCategoryService,
        private errorService: ErrorService,
        private modalService: UniModalService,
    ) {
        super(http);
        this.entityType = EmployeeCategory.EntityType;
    }

    private getEndPoint(empID: number) {
        return `${Employee.RelativeUrl}/${empID}/category`;
    }

    public getAll(empID: number, query?: string, expands?: string[]) {
        this.relativeURL = this.getEndPoint(empID);
        return super.GetAll(query, expands);
    }

    public get(runID: number, id: number | string, expand?: string[], hateoas?: boolean) {
        this.relativeURL = this.getEndPoint(runID);
        return this.Get(id, expand, hateoas);
    }

    public deleteEmployeeTag(employeeID: number, tag: ITag): Observable<boolean> {
        return (tag && tag.linkID
            ? this.deleteAndAskForForceDelete(tag.linkID, employeeID)
            : Observable.of(false));
    }

    public deleteAndAskForForceDelete(categoryID: number, empID: number) {
        return this.deleteAllAndAskForForceDelete(categoryID, [empID]).pipe(map(res => res[0]));
    }

    public deleteAllAndAskForForceDelete(categoryID: number, empIDs: number[]) {
        if (!empIDs.length) {
            return observableOf([]);
        }
        const failedEmps: number[] = [];
        return forkJoin(empIDs.map(empID => {
            this.relativeURL = this.getEndPoint(empID);
            return this.Remove(categoryID)
                .pipe(catchError((err, obs) => {
                    if (this.hasVariableTranses(err)) {
                        failedEmps.push(empID);
                        return Observable.of(false);
                    }
                    return this.errorService.handleRxCatch(err, obs);
                }));
        }))
        .pipe(switchMap((ret) => this.askAndForceDeleteAll(categoryID, failedEmps).pipe(map(res => [...ret, ...res]))));
    }

    public deleteAll(categoryID: number, empIDs: number[]) {
        return forkJoin(empIDs.map(empID => {
            this.relativeURL = this.getEndPoint(empID);
            return this.Remove(categoryID);
        }));
    }

    private hasVariableTranses(err: any) {
        const validationRules = this.errorService.extractComplexValidationRules(err);
        return validationRules.length === 1 && validationRules.some(rule => rule.ValidationCode === 170001);
    }

    private askAndForceForceDelete(categoryID: number, empID: number) {
        return this.askAndForceDeleteAll(categoryID, [empID]);
    }

    private askAndForceDeleteAll(categoryID: number, empIDs: number[]) {
        if (!empIDs.length) {
            return Observable.of([]);
        }
        return forkJoin(
            this.getPayrollAndCategories(categoryID, empIDs),
            this.getEmployeeAndCategories(categoryID, empIDs)
        )
        .pipe(
            map(([runCats, empCats]) => this.getPayrollRunsWithTransesForDeletion(runCats, empCats)),
            switchMap(runs => this.askIfTheUserWantsToForceDelete(runs)),
            filter(result => result.action === ConfirmActions.ACCEPT),
            map(result => result.runs),
            switchMap((runs) => this.deleteTransesOnRuns(runs)),
            switchMap(() => this.deleteAll(categoryID, empIDs))
        );
    }

    private askIfTheUserWantsToForceDelete(runs: PayrollRun[]): Observable<{action: ConfirmActions, runs: PayrollRun[]}> {
        const emps = runs
            .map(run => run.transactions)
            .reduce((curr, acc) => [...acc, ...curr])
            .map(trans => trans.EmployeeID)
            .filter((emp, index, arr) => {
                const elIndex = arr.findIndex(val => val === emp);
                return elIndex === index;
            });

        return this.modalService
        .confirm({
            header: 'Slette åpne lønnsposter',
            message: `Vi har funnet åpne lønnsposter på ${this.readableList(Employee, emps)} i`
            + ` ${this.readableList(PayrollRun, runs.map(run => run.ID))}.`
            + ` For å slette kategorien må vi først slette lønnspostene.`
            + ` Vil du at vi skal slette lønnspostene også for deg?`,
            buttonLabels: {
                accept: 'Slett lønnsposter',
                cancel: 'Avbryt',
            }
        })
        .onClose
        .pipe(map(action => ({action, runs})));
    }

    private readableList(type: Type<UniEntity>, list: number[]) {
        if (!list.length) {
            return '';
        }

        switch (type) {
            case Employee:
                return `ansatt ${this.idListString(list)}`;
            case PayrollRun:
                return `lønnsavregning ${this.idListString(list)}`;
            default:
                return '';
        }
    }

    private idListString(idList: number[]) {
        let last: number;
        if (idList.length > 1) {
            last = idList.pop();
        }
        return `${idList.join(', ')}${last ? ` og ${last}` : ''}`;
    }

    private getPayrollAndCategories(categoryID: number, empIDs: number[])
        : Observable<{ run: PayrollRun, categories: EmployeeCategory[] }[]> {
        this.relativeURL = PayrollRun.RelativeUrl;
        return super
            .GetAll(`filter=(StatusCode eq null or StatusCode eq 0) and transactions.IsRecurringPost eq false`, ['transactions'])
            .pipe(
                switchMap((runs: PayrollRun[]) =>
                    forkJoin(
                        runs.map(run => this.runsOnCategory
                            .getAll(run.ID)
                            .pipe(map((cats: EmployeeCategory[]) => ({run: run, categories: cats})))
                        )
                    )
                    .pipe(
                        map(runCats => runCats.filter(runCat => runCat.categories.length)),
                        map(runCats => runCats.map(runCat => ({
                            run: this.cleanTransesOnRun(runCat.run),
                            categories: runCat.categories.filter(cat => cat.ID !== categoryID)
                        })))
                    )
                )
            );
    }

    private cleanTransesOnRun(run: PayrollRun) {
        run.transactions = run.transactions
            .filter(trans =>
                trans.SystemType !== StdSystemType.PercentTaxDeduction
                && trans.SystemType !== StdSystemType.TableTaxDeduction
                && trans.SystemType !== StdSystemType.AutoAdvance);
        return run;
    }

    private getEmployeeAndCategories(categoryID: number, empIDs: number[]): Observable<{empID: number, categories: EmployeeCategory[]}[]> {
        return forkJoin(
            empIDs.map(empID => this.getAll(empID).pipe(map(cats => ({empID: empID, categories: cats}))))
        )
        .pipe(
            map((empCats: {empID: number, categories: EmployeeCategory[]}[]) => empCats
                .filter(empCat => empCat.categories.length)
                .map(empCat => ({empID: empCat.empID, categories: empCat.categories.filter(cat => cat.ID !== categoryID)})))
        );
    }

    private getPayrollRunsWithTransesForDeletion(
        runCats: {run: PayrollRun, categories: EmployeeCategory[]}[],
        empCats: {empID: number, categories: EmployeeCategory[]}[]
        ): PayrollRun[] {
        return runCats.map(runCat => {
            runCat.run.transactions = runCat.run.transactions.filter(trans => empCats.some(empCat => empCat.empID === trans.EmployeeID));
            empCats.forEach(empCat => {
                if (!empCat.categories.some(eCat => runCat.categories.some(rCat => rCat.ID === eCat.ID))) {
                    return;
                }
                runCat.run.transactions = runCat.run.transactions.filter(trans => trans.EmployeeID !== empCat.empID);
            });
            return runCat.run;
        });
    }

    private deleteTransesOnRuns(runs: PayrollRun[]): Observable<PayrollRun[]> {
        return forkJoin(runs.map(run => {
            run.transactions.forEach(trans => trans.Deleted = true);
            return this.savePayrollRun(run);
        }));
    }

    private savePayrollRun(run: PayrollRun) {
        this.relativeURL = PayrollRun.RelativeUrl;
        return run.ID
            ? super.Put(run.ID, run)
            : super.Post(run);
    }
}
