import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UniFieldLayout } from '../../../../../framework/ui/uniform/index';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EmployeeTaxCard, Employee, Municipal } from '../../../../unientities';
import { UniView } from '../../../../../framework/core/uniView';
import { 
    UniCacheService, 
    ErrorService, 
    EmployeeTaxCardService, 
    MunicipalService 
} from '../../../../services/services';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'employee-tax',
    templateUrl: './employeeTax.html'
})

export class EmployeeTax extends UniView implements OnInit {
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    private employeeTaxCard$: BehaviorSubject<EmployeeTaxCard> = new BehaviorSubject(new EmployeeTaxCard());
    constructor(
        protected cacheService: UniCacheService,
        protected router: Router,
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private employeeTaxCardService: EmployeeTaxCardService,
        private municipalService: MunicipalService
    ) {
        super(router.url, cacheService);
        route.parent.params.subscribe((params) => {
            super.updateCacheKey(this.router.url);
            const taxCard$ = super.getStateSubject('employeeTaxCard');
            const employee$ = super.getStateSubject('employee');
            const taxOptions$ = super.getStateSubject('taxCardModalCallback');

            this.fields$
                .take(1)
                .filter(fields => !fields.length)
                .switchMap(fields => Observable.combineLatest(taxCard$, employee$, taxOptions$))
                .take(1)
                .subscribe((result: [EmployeeTaxCard, Employee, any]) => {
                    const [taxCard, employee, taxOptions] = result;
                    this.getTaxLayout(taxOptions, employee, taxCard);
                });

            taxCard$
                .map((taxCard: EmployeeTaxCard) => {
                    taxCard['_lastUpdated'] = taxCard.UpdatedAt || taxCard.CreatedAt;
                    return taxCard;
                })
                .do(taxCard => this.fields$.next(this.toggleReadOnly(taxCard)))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .subscribe(taxCard => this.employeeTaxCard$.next(taxCard));
            
            employee$
                .subscribe((emp) => this.fields$.next(this.toggleTaxButtonActive(emp)));
        });
    }

    public ngOnInit() { }

    private getTaxLayout(
        taxCardOptions: { openModal: () => void }, 
        employee: Employee, 
        employeeTaxCard: EmployeeTaxCard) {
        this.employeeTaxCardService.getLayout('EmployeeTaxCardForm').subscribe(layout => {
            let taxButton = this.findByProperty(layout.Fields, 'TaxBtn');
            taxButton.Options = {
                click: (event) => {
                    taxCardOptions.openModal();
                }
            };

            this.toggleTaxButtonActive(employee, <any>layout.Fields);
            this.toggleReadOnly(employeeTaxCard, <any>layout.Fields);

            let municipality = this.findByProperty(layout.Fields, 'MunicipalityNo');
            municipality.Options = {
                getDefaultData: () => employeeTaxCard && employeeTaxCard.MunicipalityNo
                    ? this.municipalService
                        .GetAll(`filter=MunicipalityNo eq ${employeeTaxCard.MunicipalityNo}`)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                    : Observable.of([]),
                search: (query: string) => this.municipalService
                    .GetAll(`filter=
                        startswith(MunicipalityNo, '${query}')
                        or contains(MunicipalityName, '${query}')
                        &top=50`)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
                valueProperty: 'MunicipalityNo',
                displayProperty: 'MunicipalityNo',
                debounceTime: 200,
                template: (obj: Municipal) => obj
                    ? `${obj.MunicipalityNo} - ${obj.MunicipalityName.substr(0, 1).toUpperCase()
                    + obj.MunicipalityName.substr(1).toLowerCase()}`
                    : ''
            };
            this.fields$.next(layout.Fields);
        }, err => this.errorService.handle(err));
    }

    public onFormChange(changes: SimpleChanges) {
        this.employeeTaxCard$
            .take(1)
            .filter(empTax => Object
                .keys(changes)
                .some(key => changes[key].currentValue !== changes[key].previousValue) && !!empTax.EmployeeID)
            .subscribe(empTax => super.updateState('employeeTaxCard', empTax, true));
    }

    private findByProperty(fields, name): UniFieldLayout {
        return fields.find((fld) => fld.Property === name);
    }

    private toggleTaxButtonActive(employee: Employee, fields: UniFieldLayout[] = undefined): UniFieldLayout[] {
        fields = fields || this.fields$.getValue();
        if (employee && fields.length && !super.isDirty('employee')) {
            let field = this.findByProperty(fields, 'TaxBtn');
            field.ReadOnly = !employee.SocialSecurityNumber || !employee.ID;
        }
        return fields;
    }

    private toggleReadOnly(taxCard: EmployeeTaxCard, fields: UniFieldLayout[] = undefined): UniFieldLayout[] {
        fields = fields || this.fields$.getValue();
        fields.filter(field => field.Property !== 'TaxBtn').forEach(field => field.ReadOnly = !taxCard.EmployeeID);
        return fields;
    }
}
