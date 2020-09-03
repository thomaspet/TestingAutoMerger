import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RecentEmployeesService, IEmployee } from './recent-employees.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'uni-recent-employees',
    templateUrl: './recent-employees.component.html',
    styleUrls: ['./recent-employees.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentEmployeesComponent implements OnInit {
    model: IEmployee[] = [];
    ready: boolean;
    constructor(
        private cdr: ChangeDetectorRef,
        private service: RecentEmployeesService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.service
            .GetEmployees()
            .pipe(
                finalize(() => {
                    this.ready = true;
                    this.cdr.markForCheck();
                }),
            )
            .subscribe(
                emps => this.model = emps,
                err => console.error(err)
            );
    }

    goToEmployee(employee: IEmployee) {
        this.router.navigate(['salary', 'employees', employee.id]);
    }
}
