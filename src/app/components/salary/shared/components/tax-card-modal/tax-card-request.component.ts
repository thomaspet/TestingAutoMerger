import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { Employee, EmployeeCategory, AltinnReceipt } from '@uni-entities';
import { UniForm } from '@uni-framework/ui/uniform';
import { AltinnIntegrationService, ErrorService, FinancialYearService, StatisticsService, TaxRequestOption, UniTranslationService } from '@app/services/services';
import { EmployeeCategoryService } from '@app/components/salary/shared/services/category/employee-category.service';
import { AutocompleteOptions } from '@uni-framework/ui/autocomplete/autocomplete';
import { finalize } from 'rxjs/operators';

interface ITaxRequestModel {
    empChoice: TaxRequestOption;
    empsAndChanged: boolean;
    categoryID: number;
}

@Component({
    selector: 'tax-card-request',
    templateUrl: './tax-card-request.component.html',
    styleUrls: ['./tax-card-request.component.sass']
})
export class TaxCardRequestComponent {
    public title: string = '';
    public busy: boolean;
    public error: string = '';

    @Input() public employee: Employee;
    @Output() cancel: EventEmitter<any> = new EventEmitter();

    public model$: BehaviorSubject<ITaxRequestModel> = new BehaviorSubject<ITaxRequestModel>(null);

    @ViewChild(UniForm, { static: true })
    public uniform: UniForm;

    public empCount: number = 0;
    year: number;
    isFutureFinancialYear: boolean;
    autocompleteOptions: AutocompleteOptions = {
        lookup: (query: string) => {
            if (query === null) {
                query = '';
            }
            return this.employeeCategoryService.GetAll(
                `filter=contains(ID, '${query}') or contains(Name, '${query}')`
            ).map(x => x || []);
        },
        itemTemplate: (item: EmployeeCategory) => item?.ID
            ? `${item.ID} - ${item.Name}`
            : '',
        displayFunction: (item: EmployeeCategory) => item?.ID
        ? `${item.ID} - ${item.Name}`
        : '',
        placeholder: 'Kategorisøk'
    };

    constructor(
        private _altinnService: AltinnIntegrationService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private employeeCategoryService: EmployeeCategoryService,
        private statisticsService: StatisticsService,
        private tranlsationService: UniTranslationService,
    ) {}

    ngOnInit() {
        this.year = this.financialYearService.getActiveYear();
        this.isFutureFinancialYear = this.year > new Date().getFullYear();
        this.model$.next(
            {
                empChoice: !this.employee ? 'ALL_EMPS_WITHOUT_ENDDATE' : 'SINGLE_EMP',
                empsAndChanged: !this.isFutureFinancialYear,
                categoryID: 0
            }
        );
        if (!this.employee) {
            this.setEmpsWithNoEndDate();
        }
    }

    public submit() {
        const model = this.model$.value;
        this.taxRequest(model.empChoice, this.employee?.ID, model.empsAndChanged, model.categoryID);
    }

    change(event: EmployeeCategory) {
        this.model$.next({...this.model$.getValue(), categoryID: event.ID});
    }

    multipleEmpChoiceChange(event) {
        if (!event.value) {
            return;
        }
        this.updateCount(event.value);
        this.model$.next({...this.model$.getValue(), empChoice: event.value, categoryID: 0});
    }

    private updateCount(choice: TaxRequestOption) {
        const choices: {choice: TaxRequestOption, update: () => void}[] = [
            {choice: 'ALL_EMPS_WITHOUT_ENDDATE', update: () => this.setEmpsWithNoEndDate()},
            {choice: 'ALL_EMPS', update: () => this.setAllEmps()},
            {choice: 'EMPS_WITHOUT_TAXINFO', update: () => this.setEmpsWithoutTaxInfoForCurrentFinancialYear()},
        ];
        (
            choices.find(c => c.choice === choice)
            || {update: () => this.empCount = 0}
        )
        .update();
    }

    private setEmpsWithNoEndDate() {
        this.statisticsService.GetAllUnwrapped(
            `model=Employee&filter=isnull(employments.enddate,'1900-01-01') eq '1900-01-01'&expand=Employments&select=ID as ID`
        ).subscribe(res => {
            this.empCount = res.length;
        });
    }

    private setAllEmps() {
        this.statisticsService.GetAllUnwrapped(
            `model=Employee&select=count(ID) as count`
        ).subscribe(res => {
            this.empCount = res[0].count;
        });
    }

    private setEmpsWithoutTaxInfoForCurrentFinancialYear() {
        const year = this.financialYearService.getActiveYear();
        const filter = `model=Employee`
                    + `&expand=TaxCards`
                    + `&having=sum(casewhen(TaxCards.Year eq ${year},${year},0)) ne ${year}`
                    + `&select=ID as ID,sum(casewhen(TaxCards.Year eq ${year},${year},0)) as taxyear`;
        this.statisticsService.GetAll(filter).subscribe(res => this.empCount = res.Data.length);
    }

    private taxRequest(option: TaxRequestOption, empId: number = 0, empsAndChanged = false, categoryID: number = 0) {
        this.busy = true;
        this._altinnService.sendTaxRequestAction(option, empId, empsAndChanged, categoryID)
            .pipe(
                finalize(() => this.busy = false),
            )
            .subscribe((response: AltinnReceipt) => {
            if (response.ErrorText) {
                this.title = this.tranlsationService.translate('SALARY.TAX_CARD_REQUEST.TITLE_BAD');
                if (response.ErrorText === 'An error occurred') {
                    this.error =
                    ` Feilmelding fra Altinn: ${response.ErrorText}`
                    + '\n Forslag:'
                    + '\n\t 1. Sjekk at systempålogging stemmer'
                    + '\n\t     (trykk "Test login" på innstillinger under Altinn)'
                    + '\n'
                    + '\n\t 2. Gå til innstillinger og sjekk at orgnr stemmer overens'
                    + '\n\t     med Altinn systempålogging';
                } else {
                    this.error = 'Feilmelding fra Altinn: ' + response.ErrorText;
                }
            } else {
                this.title = this.tranlsationService.translate('SALARY.TAX_CARD_REQUEST.TITLE_GOOD');
            }
        },
            err => this.errorService.handle(err));
    }

    checkboxChange(event) {
        this.model$.next({
            empsAndChanged: !this.model$.value.empsAndChanged,
            empChoice: this.model$.value.empChoice,
            categoryID: this.model$.value.categoryID
        });
    }
}
