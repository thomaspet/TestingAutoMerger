import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employee, Operator, EmployeeCategory, Municipal, CompanySettings, SubEntity} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../../common/errorService';
import {MunicipalService} from '../../common/municipalsService';
import {CompanySettingsService} from '../../common/companySettingsService';
import {SubEntityService} from '../../common/subEntityService';
import {ITag} from '../../../components/common/toolbar/tags';
import {FieldType, UniFieldLayout, UniFormError} from '../../../../framework/ui/uniform/index';
import {UserService} from '../../common/userService';
import {ModulusService} from '@app/services/common/modulusService';

@Injectable()
export class EmployeeService extends BizHttp<Employee> {
    public debounceTime: number = 500;
    private defaultExpands: string[] = [
        'BusinessRelationInfo.Addresses',
        'BusinessRelationInfo.InvoiceAddress',
        'BusinessRelationInfo.Emails',
        'BusinessRelationInfo.DefaultEmail',
        'BusinessRelationInfo.Phones',
        'BusinessRelationInfo.DefaultPhone',
        'BusinessRelationInfo.BankAccounts',
        'BusinessRelationInfo.DefaultBankAccount'
    ];

    private newEntityExpands: string[] = [
        'BusinessRelationInfo.Addresses',
        'BusinessRelationInfo.Emails',
        'BusinessRelationInfo.Phones',
        'BusinessRelationInfo.BankAccounts',
    ];

    constructor(
        http: UniHttp,
        private errorService: ErrorService,
        private userService: UserService,
        private municipalService: MunicipalService,
        private companySettingsService: CompanySettingsService,
        private subEntityService: SubEntityService,
        private modulusService: ModulusService,
    ) {
        super(http);
        this.relativeURL = Employee.RelativeUrl;
        this.entityType = Employee.EntityType;
        this.defaultExpand = ['BusinessRelationInfo'];
    }

    public canAccesssEmployee(id: number): Observable<boolean> {
        if (!id) {
            return Observable.of(true);
        }
        return Observable
            .forkJoin(this.companySettingsService.getCompanySettings(), this.subEntityService.GetAll(''))
            .map((result: [CompanySettings, SubEntity[]]) => {
                const [companySettings, subEntities] = result;
                return !!companySettings.OrganizationNumber &&
                    companySettings.OrganizationNumber !== '-' &&
                    !!subEntities.length;
            });
    }

    public getEmployeeCategories(employeeID: number): Observable<EmployeeCategory[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(
            this.relativeURL
            + '/'
            + employeeID
            + '/category')
            .send()
            .map(response => response.json());
        // .send({expand: '', filter: 'EmployeeNumber eq ' + id});
    }

    public saveEmployeeCategory(employeeID: number, category: EmployeeCategory): Observable<EmployeeCategory> {
        if (employeeID && category) {

            let endpoint = this.relativeURL
                + '/'
                + employeeID
                + '/category';

            let saveObs = category.ID
                ? this.http.asPUT().withEndPoint(endpoint + '/' + category.ID)
                : this.http.asPOST().withEndPoint(endpoint);

            return saveObs
                .usingBusinessDomain()
                .withBody(category)
                .send()
                .map(response => response.json());
        }
        return Observable.of(null);
    }

    public saveEmployeeTag(employeeID, category: EmployeeCategory): Observable<ITag> {
        return this.saveEmployeeCategory(employeeID, category)
            .filter(cat => !!cat)
            .map(cat => { return {title: cat.Name, linkID: cat.ID}; });
    }

    public deleteEmployeeCategory(employeeID: number, categoryID: number): Observable<boolean> {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint(
            this.relativeURL
            + '/'
            + employeeID
            + '/category/'
            + categoryID)
            .send();
    }

    public deleteEmployee(employeeID: number): Observable<boolean> {
         return this.http.asDELETE().usingBusinessDomain().withEndPoint(
             `${this.relativeURL}/${employeeID}`)
             .send();
    }


    public deleteEmployeeTag(employeeID: number, tag: ITag): Observable<boolean> {
        return (tag && tag.linkID
            ? this.deleteEmployeeCategory(employeeID, tag.linkID)
            : Observable.of(false));
    }

    public get(id: number | string, expand: string[] = null): Observable<Employee> {
        if (id === 0) {
            if (expand) {
                return super.GetNewEntity(expand);
            }
            return super.GetNewEntity(this.newEntityExpands);
        } else {
            if (expand) {
                return super.Get(id, expand);
            }
            return super.Get(id, this.defaultExpands);
        }
    }

    public getEmployeeLeave() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('EmployeeLeave')
            .send()
            .map(response => response.json());
    }

    public getNext(employeeNumber: number, expand: string[] = null) {
        let expands = expand || this.defaultExpands;
        return super.GetAll(`filter=EmployeeNumber gt ${employeeNumber}&top=1&orderBy=EmployeeNumber`, expands)
            .map(resultSet => resultSet[0]);
    }

    public getPrevious(employeeNumber: number, expand: string[] = null) {
        let expands = expand || this.defaultExpands;
        return super.GetAll(`filter=EmployeeNumber lt ${employeeNumber}&top=1&orderBy=EmployeeNumber desc`, expands)
            .map(resultSet => resultSet[0]);
    }

    private getMunicipalityOptions(employee: Employee) {
        const defaultValue = Observable
            .of(employee)
            .switchMap(emp => emp && emp.MunicipalityNo
                ? this.municipalService.GetAll(`filter=MunicipalityNo eq ${emp.MunicipalityNo}&top=1`)
                : Observable.of([{MunicipalityNo: '', MunicipalityName: ''}]))
            .take(1);

        return {
            getDefaultData: () => defaultValue,
            template: (obj: Municipal) => obj && obj.MunicipalityNo ? `${obj.MunicipalityNo} - ${obj.MunicipalityName}` : '',
            search: (query: string) => this.municipalService.search(query),
            valueProperty: 'MunicipalityNo',
            displayProperty: 'MunicipalityName',
            debounceTime: 200
        };
    }

    private requiredValidation(warn: boolean = false): (value, field: UniFieldLayout) =>  UniFormError {
        return (value: any, field: UniFieldLayout) => {
            if (!!value) {
                return;
            }

            return {
                field: field,
                value: value,
                errorMessage: `${field.Label} ${warn ? 'er påkrevd' : 'mangler'}`,
                isWarning: warn,
            };
        };
    }

    public layout(layoutID: string, employee: Employee) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Employee',
            Fields: [
                {
                    EntityType: 'Employee',
                    Property: 'EmployeeNumber',
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: true,
                    Label: 'Nr',
                    FieldSet: 1,
                    Legend: 'Ansatt',
                    Section: 0,
                    Placeholder: 'La stå tom for neste ledige',
                    Options: {
                        format: 'none'
                    }
                },
                {
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.Name',
                    FieldType: FieldType.TEXT,
                    Label: 'Navn',
                    FieldSet: 1,
                    Legend: 'Ansatt',
                    Section: 0
                },
                {
                    EntityType: 'Employee',
                    Property: '_EmployeeSearchResult',
                    FieldType: FieldType.UNI_SEARCH,
                    Label: 'Navn',
                    FieldSet: 1,
                    Legend: 'Ansatt',
                    Section: 0
                },
                {
                    EntityType: 'Employee',
                    Property: 'SubEntityID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Virksomhet',
                    FieldSet: 1,
                    Section: 0,
                    Validations: [this.requiredValidation()],
                },
                {
                    EntityType: 'Employee',
                    Property: 'UserID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Bruker',
                    FieldSet: 1,
                    Section: 0,
                },
                {
                    EntityType: 'Employee',
                    Property: 'BusinessRelationInfo.DefaultBankAccount',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'Kontonummer',
                    FieldSet: 1,
                    Section: 0
                },
                {
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.InvoiceAddress',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'Adresse',
                    FieldSet: 2,
                    Legend: 'Kontaktinformasjon',
                    Section: 0,
                    Placeholder: 'Legg til adresse',
                    Sectionheader: 'KONTAKTINFORMASJON',
                },
                {
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.DefaultEmail',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'E-post',
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: 'Legg til e-post'
                },
                {
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.DefaultPhone',
                    FieldType: FieldType.MULTIVALUE,
                    Label: 'Telefon',
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: 'Legg til telefon',
                },
                {
                    EntityType: 'Employee',
                    Property: 'MunicipalityNo',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Options: this.getMunicipalityOptions(employee),
                    Label: 'Kommunenummer',
                    FieldSet: 2,
                    Section: 0
                },
                {
                    EntityType: 'Employee',
                    Property: 'SocialSecurityNumber',
                    FieldType: FieldType.TEXT,
                    Label: 'Fødselsnummer',
                    FieldSet: 3,
                    Legend: 'Fødselsnummer',
                    Section: 0,
                    Options: {
                        mask: '000000 00000'
                    },
                    Validations: [
                        (value: number, field: UniFieldLayout) => {
                            if (!value) {
                                return;
                            }

                            if (!isNaN(+value)) {
                                return;
                            }

                            return {
                                field: field,
                                value: value,
                                errorMessage: 'Fødselsnummer skal bare inneholde tall',
                                isWarning: false
                            };
                        },
                        this.modulusService.ssnValidationUniForm
                    ]
                },
                {
                    EntityType: 'Employee',
                    Property: 'BirthDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Fødselsdato',
                    FieldSet: 3,
                    Section: 0,
                    Options: {
                        denyYearInFuture: true
                    }
                },
                {
                    EntityType: 'Employee',
                    Property: 'Sex',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Kjønn',
                    FieldSet: 3,
                    Section: 0,
                    Options: {
                        source: [
                            { id: 1, name: 'Kvinne' },
                            { id: 2, name: 'Mann' }
                        ],
                        template: (obj) => `${obj.id} - ${obj.name}`,
                        valueProperty: 'id',
                        displayProperty: 'name'
                    }
                }
            ]
        }]);
    }

}
