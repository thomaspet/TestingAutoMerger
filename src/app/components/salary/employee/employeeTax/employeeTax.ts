import {Component, OnInit, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {EmployeeTaxCard, Employee} from '../../../../unientities';
import {UniView} from '../../../../../framework/core/uniView';
import {
    UniCacheService,ErrorService,EmployeeTaxCardService
} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import { SimpleChange } from '@angular/core/src/change_detection/change_detection_util';

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
        private employeeTaxCardService: EmployeeTaxCardService
    ) {
        super(router.url, cacheService);
        route.parent.params.subscribe((params) => {
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
                    if (employeeTaxCard['ResultatStatus'] === 'ikkeTrekkplikt') {
                        employeeTaxCard['ikkeTrekkPlikt'] = 1;
                    }
                    return employeeTaxCard;
                })
                .do(employeeTaxCard => this.fields$.next(this.toggleReadOnly(employeeTaxCard)))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .subscribe(employeeTaxCard => this.employeeTaxCard$.next(employeeTaxCard));

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
        this.employeeTaxCardService.getLayout('EmployeeTaxCardForm', employeeTaxCard).subscribe(layout => {
            let taxButton = this.findByProperty(layout.Fields, 'TaxBtn');
            taxButton.Options = {
                click: (event) => {
                    taxCardOptions.openModal();
                }
            };
            this.updateFields(layout, employeeTaxCard);
            this.toggleTaxButtonActive(employee, <any>layout.Fields);
            this.toggleReadOnly(employeeTaxCard, <any>layout.Fields);
            this.fields$.next(layout.Fields);
        }, err => this.errorService.handle(err));
    }

    public onFormChange(changes: SimpleChanges) {
        this.employeeTaxCard$
            .asObservable()
            .take(1)
            .filter(empTax => Object
                .keys(changes)
                .some(key => changes[key].currentValue !== changes[key].previousValue) && !!empTax.EmployeeID)
            .map(model => {
                if (changes['loennFraHovedarbeidsgiver.Table']
                    || changes['loennFraBiarbeidsgiver.Table']
                    || changes['pensjon.Table']
                    || changes['loennKunTrygdeavgiftTilUtenlandskBorger.Table']
                    || changes['loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger.Table']) {
                    this.refreshLayout(model);
                }
                return model;
            })
            .subscribe(empTax => super.updateState('employeeTaxCard', empTax, true));
    }

    private findByProperty(fields, name): UniFieldLayout {
        return fields.find((fld) => fld.Property === name);
    }

    private toggleTaxButtonActive(employee: Employee, fields: UniFieldLayout[] = undefined): UniFieldLayout[] {
        fields = fields || this.fields$.getValue();

        if (employee && fields.length) {
            let field = this.findByProperty(fields, 'TaxBtn');
            field.ReadOnly = !employee.SocialSecurityNumber || !employee.ID || super.isDirty('employee');
        }
        return fields;
    }

    private toggleReadOnly(taxCard: EmployeeTaxCard, fields: UniFieldLayout[] = undefined): UniFieldLayout[] {
        fields = fields || this.fields$.getValue();
        fields.filter(field =>
            field.Property !== 'TaxBtn')
                .forEach(field =>
                    field.Property === '_lastUpdated' ? field.ReadOnly = true : field.ReadOnly = !taxCard.EmployeeID
                );
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
        let trekkAlreadyVisible = false;
        let freeamountAlreadyVisible = false;
        
        if (employeeTaxcard.Year > 2017) {
            let hovedarbeidsgiverField = this.findByProperty(layout.Fields, 'loennFraHovedarbeidsgiver.AntallMaanederForTrekk');
            hovedarbeidsgiverField.Hidden = this.layoutFieldHidden(employeeTaxcard, 'loennFraHovedarbeidsgiver', 'Table');
            trekkAlreadyVisible = !hovedarbeidsgiverField.Hidden;

            let biarbeidsgiverField = this.findByProperty(layout.Fields, 'loennFraBiarbeidsgiver.AntallMaanederForTrekk');
            biarbeidsgiverField.Hidden = trekkAlreadyVisible ? true : this.layoutFieldHidden(employeeTaxcard, 'loennFraBiarbeidsgiver', 'Table');
            if (!trekkAlreadyVisible) {
                trekkAlreadyVisible = !biarbeidsgiverField.Hidden;
            }

            let pensjonField = this.findByProperty(layout.Fields, 'pensjon.AntallMaanederForTrekk');
            pensjonField.Hidden = trekkAlreadyVisible ? true : this.layoutFieldHidden(employeeTaxcard, 'pensjon', 'Table');
            if (!trekkAlreadyVisible) {
                trekkAlreadyVisible = !pensjonField.Hidden;
            }

            let utlendingField = this.findByProperty(layout.Fields, 'loennKunTrygdeavgiftTilUtenlandskBorger.AntallMaanederForTrekk');
            utlendingField.Hidden = trekkAlreadyVisible ? true : this.layoutFieldHidden(employeeTaxcard, 'loennKunTrygdeavgiftTilUtenlandskBorger', 'Table');
            if (!trekkAlreadyVisible) {
                trekkAlreadyVisible = !utlendingField.Hidden;
            }

            let grensegjengerField = this.findByProperty(layout.Fields, 'loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger.AntallMaanederForTrekk');
            grensegjengerField.Hidden = trekkAlreadyVisible ? true : this.layoutFieldHidden(employeeTaxcard, 'loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger', 'Table');
            if (!trekkAlreadyVisible) {
                trekkAlreadyVisible = !grensegjengerField.Hidden;
            }

            let freeAmountTypeMain = this.findByProperty(layout.Fields, 'loennFraHovedarbeidsgiver.freeAmountType');
            freeAmountTypeMain.Hidden = this.layoutFieldHidden(employeeTaxcard, 'loennFraHovedarbeidsgiver', 'freeAmountType');
            freeamountAlreadyVisible = !freeAmountTypeMain.Hidden;

            let freeAmountTypePensjon = this.findByProperty(layout.Fields, 'pensjon.freeAmountType');
            freeAmountTypePensjon.Hidden = freeamountAlreadyVisible ? true : this.layoutFieldHidden(employeeTaxcard, 'pensjon', 'freeAmountType');
            if (!freeamountAlreadyVisible) {
                freeamountAlreadyVisible = !freeAmountTypePensjon.Hidden;
            }
        }
    }

    private layoutFieldHidden(employeeTaxcard: EmployeeTaxCard, prop: string, propname: string) : boolean {
        let hide = false;
        if (employeeTaxcard.hasOwnProperty(prop) && !!employeeTaxcard[prop]) {
            if (employeeTaxcard[prop][propname] === null || employeeTaxcard[prop][propname] === '' || employeeTaxcard[prop][propname] === '0') {
                hide = true;
            }
        }
        return hide;
    }
}
