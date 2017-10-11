import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employee, Operator, EmployeeCategory, Municipal} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../../common/errorService';
import {MunicipalService} from '../../common/municipalsService';
import {ITag} from '../../../components/common/toolbar/tags';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {UserService} from '../../common/userService';

@Injectable()
export class EmployeeService extends BizHttp<Employee> {

    private defaultExpands: any = [
        'BusinessRelationInfo.Addresses',
        'BusinessRelationInfo.InvoiceAddress',
        'BusinessRelationInfo.Emails',
        'BusinessRelationInfo.DefaultEmail',
        'BusinessRelationInfo.Phones',
        'BusinessRelationInfo.DefaultPhone',
        'BusinessRelationInfo.BankAccounts',
        'BusinessRelationInfo.DefaultBankAccount'
    ];
    public debounceTime: number = 500;

    constructor(
        http: UniHttp,
        private errorService: ErrorService,
        private userService: UserService,
        private municipalService: MunicipalService
    ) {
        super(http);
        this.relativeURL = Employee.RelativeUrl;
        this.entityType = Employee.EntityType;
        this.defaultExpand = ['BusinessRelationInfo'];
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
            return super.GetNewEntity(this.defaultExpands);
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

    public getNext(id: number, expand: string[] = null) {
        let expands = expand || this.defaultExpands;
        return super.GetAll(`filter=ID gt ${id}&top=1&orderBy=ID`, expands)
            .map(resultSet => resultSet[0]);
    }

    public getPrevious(id: number, expand: string[] = null) {
        let expands = expand || this.defaultExpands;
        return super.GetAll(`filter=ID lt ${id}&top=1&orderBy=ID desc`, expands)
            .map(resultSet => resultSet[0]);
    }

    private queryMunicipals(query: string): Observable<Municipal> {
        return this.municipalService
            .GetAll(`filter=startswith(MunicipalityNo,'${query}') or contains(MunicipalityName,'${query}')`);
    }

    private getMunicipalityOptions(employee: Employee) {
        let defaultValue = employee.MunicipalityNo
            ? this.municipalService.GetAll(`filter=MunicipalityNo eq ${employee.MunicipalityNo}&top=1`)
            : Observable.of([{MunicipalityNo: '', MunicipalityName: ''}]);

        return {
            getDefaultData: () => defaultValue,
            template: (obj: Municipal) => obj && obj.MunicipalityNo ? `${obj.MunicipalityNo} - ${obj.MunicipalityName}` : '',
            search: (query: string) => this.queryMunicipals(query),
            valueProperty: 'MunicipalityNo',
            debounceTime: 200
        };
    }

    public layout(layoutID: string, employee: Employee) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Employee',
            Fields: [
                {
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.Name',
                    FieldType: FieldType.TEXT,
                    Label: 'Navn',
                    FieldSet: 1,
                    Legend: 'Ansatt',
                    Section: 0,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
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
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
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
                    Label: 'Epost',
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
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    EntityType: 'Employee',
                    Property: 'BirthDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Fødselsdato',
                    FieldSet: 3,
                    Section: 0,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
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
                    },
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: Operator.Required
                        }
                    ]
                },

                // {
                //     ComponentLayoutID: 1,
                //
                //     EntityType: 'Employee',
                //     Property: '',
                //     Placement: 7,
                //     Hidden: true,
                //     FieldType: FieldType.TEXT,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'Overordnet',
                //     Description: null,
                //     HelpText: 'Ikke implementert enda',
                //     FieldSet: 0,
                //     Section: 0,
                //     Placeholder: null,
                //     Options: null,
                //     LineBreak: null,
                //     Combo: null,
                //     Sectionheader: '',
                //     IsLookUp: false,
                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // },
                // {
                //     ComponentLayoutID: 1,

                //     EntityType: 'Employee',
                //     Property: 'InternationalID',
                //     Placement: 1,
                //     Hidden: false,
                //     FieldType: FieldType.TEXT,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'Nummer',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 1,
                //     Section: 3,
                //     Placeholder: null,
                //     Options: null,
                //     LineBreak: null,
                //     Combo: null,
                //     Legend: 'Internasjonal ID/Bank',
                //     Sectionheader: 'INTERNASJONAL',
                //     IsLookUp: false,
                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // },
                // {
                //     ComponentLayoutID: 1,
                //     EntityType: 'Employee',
                //     Property: 'InternasjonalIDType',
                //     Placement: 2,
                //     Hidden: false,
                //     FieldType: FieldType.TEXT,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'Type',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 1,
                //     Section: 3,
                //     Placeholder: null,
                //     Options: null,
                //     LineBreak: null,
                //     Sectionheader: null,
                //     Legend: null,
                //     IsLookUp: false,

                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // },
                // {
                //     ComponentLayoutID: 1,
                //     EntityType: 'Employee',
                //     Property: 'InternasjonalIDCountry',
                //     Placement: 3,
                //     Hidden: false,
                //     FieldType: FieldType.TEXT,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'Utstedelsesland',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 1,
                //     Section: 3,
                //     Placeholder: null,
                //     Options: null,
                //     LineBreak: null,
                //     Sectionheader: null,
                //     Legend: null,
                //     IsLookUp: false,

                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // },
                // {
                //     ComponentLayoutID: 1,
                //     EntityType: 'Employee',
                //     Property: 'TaxTable',
                //     Placement: 1,
                //     Hidden: false,
                //     FieldType: FieldType.TEXT,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'IBAN/Kontonr.',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 2,
                //     Section: 3,
                //     Placeholder: null,
                //     Options: null,
                //     LineBreak: null,
                //     Combo: null,
                //     Sectionheader: null,
                //     Legend: 'Internasjonal bankkonto',
                //     IsLookUp: false,
                //     openByDefault: true,

                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // }

                /*
                 Add fields for
                 --------SPESIALINNSTILLINGER FOR DEN ANSATTE----
                 */
            ]
        }]);
    }

}
