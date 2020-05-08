import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';

import {BehaviorSubject} from 'rxjs';
import { Employee, FieldLayout, FieldType, EmployeeCategory, AltinnReceipt } from '@uni-entities';
import { UniForm } from '@uni-framework/ui/uniform';
import { AltinnIntegrationService, ErrorService, FinancialYearService, EmployeeCategoryService, EmployeeService, StatisticsService } from '@app/services/services';

interface ITaxRequestModel {
    singleEmpChoice: number;
    multiEmpChoice: number;
    empsAndChanged: boolean;
    categoryID: number;
}

@Component({
    selector: 'tax-card-request',
    templateUrl: './taxCardRequest.html'
})
export class TaxCardRequest {
    public title: string = '';
    public exitButton: string = '';
    public busy: boolean;
    public sendAltinnVisible: boolean = false;
    public error: string = '';
    public isActive: boolean = false;

    @Input() public employee: Employee;

    @Output() public newReceipt: EventEmitter<boolean> = new EventEmitter<boolean>(true);

    public model$: BehaviorSubject<ITaxRequestModel> = new BehaviorSubject<ITaxRequestModel>(
        { singleEmpChoice: 1, multiEmpChoice: 1, empsAndChanged: true, categoryID: 0});
    public fields$: BehaviorSubject<FieldLayout[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});

    @ViewChild(UniForm, { static: true })
    public uniform: UniForm;

    public empCount: number = 0;
    private filter: string = 'filter=employments.endDate eq null&expand=employments';

    constructor(
        private _altinnService: AltinnIntegrationService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private employeeCategoryService: EmployeeCategoryService,
        private employeeService: EmployeeService,
        private statisticsService: StatisticsService,
    ) {}

    ngOnInit() {
        this.initialize();
    }

    public initialize() {
        this.busy = true;
        this.sendAltinnVisible = true;
        this.title = 'Send forespørsel om skattekort';
        this.exitButton = 'Avbryt';
        this.error = '';
        this.model$.next({ singleEmpChoice: 1, multiEmpChoice: 1, empsAndChanged: true, categoryID: 0 });
        const multipleChoice: any = {
            FieldSet: 0,
            Section: 0,
            Combo: 0,
            FieldType: FieldType.RADIOGROUP,
            Hidden: true,
            Property: 'multiEmpChoice',
            ReadOnly: false,
            Placeholder: 'Select',
            Options: {
                source: [
                    { id: 1, text: 'Alle ansatte uten sluttdato på minst ett arbeidsforhold' },
                    { id: 2, text: 'Alle ansatte' },
                    { id: 3, text: `Ansatte uten skatteopplysninger i ${this.financialYearService.getActiveYear()}` },
                    { id: 4, text: 'Ansatte i kategori' },
                    { id: 5, text: 'Hent kun endrede skattekort'}
                ],
                labelProperty: 'text',
                valueProperty: 'id'
            }
        };

        const category: any =  {
            FieldSet: 0,
            Section: 0,
            Combo: 0,
            FieldType: FieldType.AUTOCOMPLETE,
            Hidden: true,
            Property: 'categoryID',
            ReadOnly: false,
            Placeholder: 'Velg kategori',
            Options: {
                displayProperty: 'Name',
                valueProperty: 'ID',
                template: (item: EmployeeCategory) => {
                    return item && item.ID ? item.ID + ' - ' + item.Name : '';
                },
                search: (query: string) => {
                    if (query === null) {
                        query = '';
                    }
                    return this.employeeCategoryService.GetAll(
                        `filter=contains(ID, '${query}') or contains(Name, '${query}')`
                    ).map(x => x || []);
                },
                events: {
                    select: () => {
                        const categoryID = this.model$.value.categoryID;
                        const filter = `model=EmployeeCategoryLink&select=count(employeeID)&filter=EmployeeCategoryID eq ${categoryID}`;
                        this.statisticsService.GetAll(filter).subscribe(res => this.empCount = res.Data[0]['countemployeeID']);
                    }
                }
            }
        };
        this.fields$.next([multipleChoice, category]);
        this.busy = false;
    }

    public submit() {
        const model = this.model$.value;
        let option = '';
        if (model.singleEmpChoice === 2) {
            switch (model.multiEmpChoice) {
                case 1:
                    option = 'ALL_EMPS_WITHOUT_ENDDATE';
                    break;
                case 2:
                    option = 'ALL_EMPS';
                    break;
                case 3:
                    option = 'EMPS_WITHOUT_TAXINFO';
                    break;
                case 4:
                    option = 'EMPS_IN_CATEGORY';
                    break;
                case 5:
                    option = 'CHANGED_ONLY';
                    break;
                default:
                    option = 'SINGLE_EMP';
            }
        } else {
            option = 'SINGLE_EMP';
        }
        this.taxRequest(option, this.employee.ID, model.empsAndChanged, model.categoryID);
    }

    change(event: any) {
        const model = this.model$.value;
        this.uniform.Hidden = false;
        const fields = this.fields$.getValue();
        if (event.multiEmpChoice && event.multiEmpChoice.currentValue === 4) {
            fields[1].Hidden = false;
        } else if (event.multiEmpChoice && event.multiEmpChoice.currentValue !== 4) {
            fields[1].Hidden = true;
        }
        this.fields$.next(fields);

        switch (model.multiEmpChoice) {
            case 1:
                this.statisticsService.GetAllUnwrapped(
                    `model=Employee&filter=isnull(employments.enddate,'1900-01-01') eq '1900-01-01'&expand=Employments&select=ID as ID`
                ).subscribe(res => {
                    this.empCount = res.length;
                });
                break;
            case 2:
                this.statisticsService.GetAllUnwrapped(
                    `model=Employee&select=count(ID) as count`
                ).subscribe(res => {
                    this.empCount = res[0].count;
                });
                break;
            case 3:
                this.getEmpsWithoutTaxInfoForCurrentFinancialYear();
                break;
            case 4:
                this.empCount = 0;
                break;
            case 5:
                this.empCount = 0;
                break;
        }
    }

    getEmpsWithoutTaxInfoForCurrentFinancialYear() {
        const year = this.financialYearService.getActiveYear();
        const filter = `model=Employee`
                    + `&expand=TaxCards`
                    + `&having=sum(casewhen(TaxCards.Year eq ${year},${year},0)) ne ${year}`
                    + `&select=ID as ID,sum(casewhen(TaxCards.Year eq ${year},${year},0)) as taxyear`;
        this.statisticsService.GetAll(filter).subscribe(res => this.empCount = res.Data.length);
    }

    multipleChoiceChange(event) {
        const model = this.model$.value;
        this.uniform.Hidden = false;
        const fields = this.fields$.getValue();
        if (parseInt(event.value, 10) === 2) {
            fields[0].Hidden = false;
            this.change(model);
        } else {
            fields[0].Hidden = true;
            fields[1].Hidden = true;
            this.empCount = 0;
        }
        this.fields$.next(fields);

        this.model$.next({
            singleEmpChoice: parseInt(event.value, 10),
            empsAndChanged: this.model$.value.empsAndChanged,
            multiEmpChoice: this.model$.value.multiEmpChoice,
            categoryID: this.model$.value.categoryID
        });
    }

    private taxRequest(option: string, empId: number = 0, empsAndChanged = false, categoryID: number = 0) {
        this.busy = true;
        this._altinnService.sendTaxRequestAction(option, empId, empsAndChanged, categoryID)
            .subscribe((response: AltinnReceipt) => {
            if (response.ErrorText) {
                this.title = 'Feil angående Altinn-forespørsel';
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
                this.title = 'Skatteforespørsel er sendt';
                this.newReceipt.emit(true);
            }
            this.exitButton = 'OK';
            this.busy = false;
        },
            err => this.errorService.handle(err));
    }

    checkboxChange(event) {
        this.model$.next({
            singleEmpChoice: this.model$.value.singleEmpChoice,
            empsAndChanged: !this.model$.value.empsAndChanged,
            multiEmpChoice: this.model$.value.multiEmpChoice,
            categoryID: this.model$.value.categoryID
        });
    }

    public close() {
        this.initialize();
        this.uniform.Hidden = false;
    }
}
