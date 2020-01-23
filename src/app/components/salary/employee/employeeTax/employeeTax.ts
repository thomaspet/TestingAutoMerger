import {Component, OnInit, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs';
import {EmployeeTaxCard, Employee} from '../../../../unientities';
import {UniView} from '../../../../../framework/core/uniView';
import {
    UniCacheService, ErrorService, EmployeeTaxCardService
} from '../../../../services/services';
import {Observable} from 'rxjs';

@Component({
    selector: 'employee-tax',
    templateUrl: './employeeTax.html',
    styleUrls: ['./employeeTax.sass']
})

export class EmployeeTax extends UniView implements OnInit {
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public employeeTaxCard$: BehaviorSubject<EmployeeTaxCard> = new BehaviorSubject(new EmployeeTaxCard());
    private previousYear: number = 0;

    constructor(
        protected cacheService: UniCacheService,
        protected router: Router,
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private employeeTaxCardService: EmployeeTaxCardService
    ) {
        super(router.url, cacheService);
        this.route.parent.params.subscribe((params) => {
            super.updateCacheKey(this.router.url);
            const employeeTaxCard$ = super.getStateSubject('employeeTaxCard');
            const employee$ = super.getStateSubject('employee');
            const taxOptions$ = super.getStateSubject('taxCardModalCallback');

            this.fields$
                .asObservable()
                .take(1)
                .filter(fields => !fields.length)
                .switchMap(fields => Observable.combineLatest(employeeTaxCard$, employee$, taxOptions$))
                .take(1)
                .subscribe((result: [EmployeeTaxCard, Employee, any]) => {
                    const [employeeTaxCard, employee, taxOptions] = result;
                    this.getTaxLayout(taxOptions, employee, employeeTaxCard);
                });
            employeeTaxCard$
                .map((employeeTaxCard: EmployeeTaxCard) => {
                    employeeTaxCard['_lastUpdated'] = employeeTaxCard.UpdatedAt || employeeTaxCard.CreatedAt;
                    return employeeTaxCard;
                })
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .subscribe((employeeTaxCard: EmployeeTaxCard) => {
                    if (this.previousYear !== 0 && (this.previousYear !== employeeTaxCard.Year)) {
                        this.refreshLayout(employeeTaxCard);
                    }
                    this.previousYear = employeeTaxCard.Year;
                    this.employeeTaxCard$.next(employeeTaxCard);
                });

            employee$
                .filter(emp => emp && emp.ID)
                .subscribe((emp) => this.fields$.next(this.toggleTaxButtonActive(emp)));
        });
    }

    public ngOnInit() { }

    private getTaxLayout(
        taxCardOptions: { openModal: () => void },
        employee: Employee,
        employeeTaxCard: EmployeeTaxCard) {
        this.employeeTaxCardService.getLayout('EmployeeTaxCardForm', employeeTaxCard).subscribe(
            layout => {
                const taxButton = this.findByProperty(layout.Fields, 'TaxBtn');
                taxButton.Options = {
                    click: (event) => {
                        taxCardOptions.openModal();
                    }
                };
                this.updateFields(layout, employeeTaxCard);
                this.toggleTaxButtonActive(employee, <any>layout.Fields);
                this.fields$.next(layout.Fields);
            },
            err => this.errorService.handle(err)
        );
    }

    public onFormChange(changes: SimpleChanges) {
        this.employeeTaxCard$
            .asObservable()
            .take(1)
            .filter(empTax => Object
                .keys(changes)
                .some(key => changes[key].currentValue !== changes[key].previousValue) && !!empTax.EmployeeID)
            .subscribe(empTax => super.updateState('employeeTaxCard', empTax, true));
    }

    private findByProperty(fields, name): UniFieldLayout {
        return fields.find((fld) => fld.Property === name);
    }

    private toggleTaxButtonActive(employee: Employee, fields?: UniFieldLayout[]): UniFieldLayout[] {
        fields = fields || this.fields$.getValue();

        if (employee && fields.length) {
            const field = this.findByProperty(fields, 'TaxBtn');
            field.ReadOnly = !employee.SocialSecurityNumber || !employee.ID || super.isDirty('employee');
        }
        return fields;
    }

    private refreshLayout(employeeTaxcard: EmployeeTaxCard) {
        this.employeeTaxCardService.getLayout('EmployeeTaxCardForm', employeeTaxcard)
            .subscribe(layout => {
                this.updateFields(layout, employeeTaxcard);
                this.fields$.next(layout.Fields);
            }, err => this.errorService.handle(err));
    }

    private updateFields(layout: any, employeeTaxcard: EmployeeTaxCard) {
        const taxButton = this.findByProperty(layout.Fields, 'TaxBtn');
        taxButton.Options = {
            click: (event) => {
                this.getStateSubject('taxCardModalCallback')
                    .subscribe(options => {
                        options.openModal();
                    });
            }
        };
    }
}
