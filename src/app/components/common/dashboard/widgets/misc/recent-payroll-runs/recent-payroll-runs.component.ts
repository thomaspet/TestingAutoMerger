import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { RecentPayrollRunsService, IPayrollRun } from './recent-payroll-runs.service';
import { switchMap, takeUntil} from 'rxjs/operators';
import { Router } from '@angular/router';
import { FinancialYearService } from '@app/services/services';
import { Subject } from 'rxjs';

@Component({
    selector: 'uni-recent-payroll-runs',
    templateUrl: './recent-payroll-runs.component.html',
    styleUrls: ['./recent-payroll-runs.component.sass']
})
export class RecentPayrollRunsComponent implements OnInit, OnDestroy {
    model: IPayrollRun[] = [];
    destroy$: Subject<any> = new Subject();
    ready;
    constructor(
        private cdr: ChangeDetectorRef,
        private service: RecentPayrollRunsService,
        private router: Router,
        private yearService: FinancialYearService,
    ) { }

    ngOnInit(): void {
        this.yearService
            .lastSelectedFinancialYear$
            .pipe(
                takeUntil(this.destroy$),
                switchMap(financialYear => this.service.getData(financialYear.Year)),
            )
            .subscribe(
                data => {
                    this.model = data;
                    this.ready = true;
                    this.cdr.markForCheck();
                },
                err => {
                    console.error(err);
                    this.ready = true;
                }
            );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    goToRun(run: IPayrollRun) {
        this.router.navigate(['salary', 'payrollrun', run.id]);
    }

}
