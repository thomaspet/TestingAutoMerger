import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import { Employee, Operator, EmployeeCategory } from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import {ErrorService} from '../../common/errorService';
import { ITag } from '../../../components/common/toolbar/tags';
import {FieldType} from 'uniform-ng2/main';
import { UserService } from '../../common/userService';

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
        private userService: UserService) {
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

    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Employee',
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.Name',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Navn',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',

                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: '_EmployeeSearchResult',
                    Placement: 1,
                    Hidden: true,
                    FieldType: FieldType.UNI_SEARCH,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Navn',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    Options: null
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'SocialSecurityNumber',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fødselsnummer',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        mask: '000000 00000'
                    },
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'BirthDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fødselsdato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'Sex',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kjønn',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: true,
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
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'BusinessRelationInfo.DefaultBankAccount',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kontonummer',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Options: null
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'SubEntityID',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Virksomhet',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Options: {
                        valueProperty: 'ID',
                        displayProperty: 'BusinessRelationInfo.Name',
                        debounceTime: 200
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
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'UserID',
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Bruker',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: '',
                    Placement: 7,
                    Hidden: true,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Overordnet',
                    Description: null,
                    HelpText: 'Ikke implementert enda',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.InvoiceAddress',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Adresse',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: 'Legg til adresse',
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: 'KONTAKTINFORMASJON',
                    IsLookUp: false,
                    openByDefault: true
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.DefaultEmail',
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Epost',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: 'Legg til e-post',
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.DefaultPhone',
                    Placement: 8,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Telefon',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: 'Legg til telefon',
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false
                }

                // ,{
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
