import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RecentPayrollRunsService, IPayrollRun } from './recent-payroll-runs.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'uni-recent-payroll-runs',
    templateUrl: './recent-payroll-runs.component.html',
    styleUrls: ['./recent-payroll-runs.component.sass']
})
export class RecentPayrollRunsComponent implements OnInit {
    model: IPayrollRun[] = [];
    ready;
    constructor(
        private cdr: ChangeDetectorRef,
        private service: RecentPayrollRunsService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.service
            .getData()
            .pipe(
                finalize(() => {
                    this.ready = true;
                    this.cdr.markForCheck();
                })
            )
            .subscribe(
                data => this.model = data,
                err => console.error(err),
            );
    }

    goToRun(run: IPayrollRun) {
        this.router.navigate(['salary', 'payrollrun', run.id]);
    }

}
