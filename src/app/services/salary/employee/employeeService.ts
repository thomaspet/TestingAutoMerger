import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {
    Employee, EmployeeCategory, CompanySettings, SubEntity, InternationalIDType, OtpStatus, TypeOfPaymentOtp, EmployeeTaxCard, Employment, BusinessRelation
} from '../../../unientities';
import {Observable} from 'rxjs';
import {CompanySettingsService} from '../../common/companySettingsService';
import {SubEntityService} from '../../common/subEntityService';
import {ITag} from '../../../components/common/toolbar/tags';
import {FieldType, UniFieldLayout, UniFormError} from '../../../../framework/ui/uniform/index';
import {ModulusService} from '@app/services/common/modulusService';

interface IFromToFilter {
    from: number;
    to: number;
}

export interface IEmployee {
    Name: string;
    ID: number;
    CategoryIDs: number[];
    TaxCards: EmployeeTaxCard[];
    BusinessRelationID: number;
    DefaultBankAccountID: number;
    SocialSecurityNumber: string;
    Employments: Employment[];
    SubEntity: SubEntity;
    SubEntityID: number;
    EmployeeNumber: number;
}

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

    private InternationalIDTypes: { ID: number, Name: string }[] = [
        { ID: InternationalIDType.notSet, Name: 'Ikke valgt' },
        { ID: InternationalIDType.Passportnumber, Name: 'Passnr'},
        { ID: InternationalIDType.SocialSecurityNumber, Name: 'Social sec. nr'},
        { ID: InternationalIDType.TaxIdentificationNumber, Name: 'Tax identit. nr'},
        { ID: InternationalIDType.ValueAddedTaxNumber, Name: 'Value added nr'}
    ];

    private  periods(): Array<any> {
        return [
            {period: 0, name: 'Ikke valgt'},
            {period: 1, name: 'Januar'},
            {period: 2, name: 'Februar'},
            {period: 3, name: 'Mars'},
            {period: 4, name: 'April'},
            {period: 5, name: 'Mai'},
            {period: 6, name: 'Juni'},
            {period: 7, name: 'Juli'},
            {period: 8, name: 'August'},
            {period: 9, name: 'September'},
            {period: 10, name: 'Oktober'},
            {period: 11, name: 'November'},
            {period: 12, name: 'Desember'}
        ];
      }

    private  otpStatus(): Array<any> {
        return [
            {id: OtpStatus.A, name: 'Aktiv'},
            {id: OtpStatus.S, name: 'Syk'},
            {id: OtpStatus.P, name: 'Permittert'},
            {id: OtpStatus.LP, name: 'Lovfestet Permisjon'},
            {id: OtpStatus.AP, name: 'Avtalt Permisjon'},
        ];
    }

    private typeOfOtpPayments(): Array<any> {
        return [
            {id: TypeOfPaymentOtp.FixedSalary, name: 'Fast'},
            {id: TypeOfPaymentOtp.HourlyPay, name: 'Time'},
            {id: TypeOfPaymentOtp.PaidOnCommission, name: 'Provisjon'},
        ];
    }

    constructor(
        http: UniHttp,
        private companySettingsService: CompanySettingsService,
        private subEntityService: SubEntityService,
        private modulusService: ModulusService,
    ) {
        super(http);
        this.relativeURL = Employee.RelativeUrl;
        this.entityType = Employee.EntityType;
        this.defaultExpand = ['BusinessRelationInfo'];
    }

    private getHelpText(colname: string) {
        let helptext: string = '';
        switch (colname.toLowerCase()) {
            case 'otpexport':
                helptext = 'Fjern krysset hvis den ansatte ikke skal være med i otp-eksporten';
                break;
            case 'status':
                helptext = 'Vedlikeholdes manuelt.' +
                    'Info i dette feltet kommer med i eksporten og brukes av forsikringsselskapet i utregning av pensjonsgrunnlag';
                break;
            case 'empdate':
                helptext = 'Vanligvis lik ansettelsesdato, men ønskes annen innmeldingsdato kan denne datoen settes her.' +
                    'Den ansatte blir med på eksport fom perioden som er lik måned i dette feltet';
                break;
            case 'enddate':
                helptext = 'Vanligvis lik sluttdato på arbeidsforhold.' +
                    'Skal kun settes når den ansatte slutter helt i bedriften og ikke når det er endringer i arbeidsforhold';
                break;
            case 'month':
                helptext = 'Her kan en bestemme hvor mange måneder en ønsker å ha vedkommende med i eksporten etter sluttdato.';
                break;
            case 'year':
                helptext = 'Hører sammen med måned og tilsammen bestemmer disse feltene hvor lenge den ansatte rapporteres i otp';
                break;
            case 'paytype':
                helptext = 'Rapporteres i otp-eksporten.' +
                    'Er den ansatte merket med avlønningsform Fast, rapporteres årslønn fra arbeidsforholdet på den ansatte.' +
                    'Er den ansatte merket timer rapporteres kun lønnsarter som er med i periodelønn.';
                break;
            default:
                break;
        }
        return helptext;
    }

    public getFromToFilter(employees: number[]): IFromToFilter[] {
        let from = 0;
        const ret: IFromToFilter[] = [];
        if (!employees.length) {
            return ret;
        }
        employees.forEach((empID, i) => {
            if (!from) {
                from = empID;
            } else if (i > 0 && employees[i - 1] + 1 !== empID) {
                ret.push({from: from, to: employees[i - 1]});
                from = empID;
            }
        });

        ret.push({from: from, to: employees[employees.length - 1]});

        return ret;
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

    public convertToEmployee(employee: IEmployee): Employee {
        const emp: Employee = <Employee>{};
        Object.keys(employee).filter(key => key !== 'Name').forEach(key => emp[key] = employee[key]);
        emp.BusinessRelationInfo = <BusinessRelation>{Name: employee.Name};
        return emp;
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
            .map(response => response.body);
        // .send({expand: '', filter: 'EmployeeNumber eq ' + id});
    }

    public saveEmployeeCategory(employeeID: number, category: EmployeeCategory): Observable<EmployeeCategory> {
        if (employeeID && category) {

            const endpoint = this.relativeURL
                + '/'
                + employeeID
                + '/category';

            const saveObs = category.ID
                ? this.http.asPUT().withEndPoint(endpoint + '/' + category.ID)
                : this.http.asPOST().withEndPoint(endpoint);

            return saveObs
                .usingBusinessDomain()
                .withBody(category)
                .send()
                .map(response => response.body);
        }
        return Observable.of(null);
    }

    public saveEmployeeTag(employeeID, category: EmployeeCategory): Observable<ITag> {
        return this.saveEmployeeCategory(employeeID, category)
            .filter(cat => !!cat)
            .map(cat => ({ title: cat.Name, linkID: cat.ID }));
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

    public getNext(employeeNumber: number, expand: string[] = null) {
        const expands = expand || this.defaultExpands;
        return super.GetAll(`filter=EmployeeNumber gt ${employeeNumber}&top=1&orderBy=EmployeeNumber`, expands)
            .map(resultSet => resultSet[0]);
    }

    public getPrevious(employeeNumber: number, expand: string[] = null) {
        const expands = expand || this.defaultExpands;
        return super.GetAll(`filter=EmployeeNumber lt ${employeeNumber}&top=1&orderBy=EmployeeNumber desc`, expands)
            .map(resultSet => resultSet[0]);
    }

    public getEmpsUsedThisYear(runStatus: number, expand: string[]): Observable<Employee[]> {
        return super.GetAction(null, 'emps-on-transes', `status=${runStatus}&expand=${expand.join(',')}`);
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

    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Employee',
            Fields: [
                {
                    EntityType: 'Employee',
                    Property: 'EmployeeNumber',
                    FieldType: FieldType.TEXT,
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
                        displayProperty: 'name',
                        hideDeleteButton: true
                    }
                },
                {
                    EntityType: 'Employee',
                    Property: 'FreeText',
                    FieldType: FieldType.TEXTAREA,
                    Classes: 'freeTextField',
                    Label: '',
                    FieldSet: 4,
                    Legend: 'Fritekst',
                    Options: {
                        class: 'freeTextFieldEmployee'
                    },
                    Section: 0,
                },
                {
                    EntityType: 'Employee',
                    Property: 'InternationalID',
                    FieldType: FieldType.TEXT,
                    Label: 'Internasjonal ID',
                    FieldSet: 5,
                    Legend: 'Internasjonal',
                    Section: 0,
                    Options: { },
                },
                {
                    EntityType: 'Employee',
                    Property: 'InternasjonalIDType',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Type',
                    FieldSet: 5,
                    Section: 0,
                    Options: {
                        source: this.InternationalIDTypes,
                        template: (obj) => `${obj.ID} - ${obj.Name}`,
                        valueProperty: 'ID',
                        displayProperty: 'Name'
                    }
                },
                {
                    EntityType: 'Employee',
                    Property: 'InternasjonalIDCountry',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Land',
                    FieldSet: 5,
                    Section: 0,
                },
            ]
        }]);
    }

    public layoutOTP(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Employee',
            Fields: [
                {
                    EntityType: 'Employee',
                    Property: 'OtpExport',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Inkluderes i eksport',
                    FieldSet: 1,
                    Section: 0,
                    Tooltip: {
                        Text: this.getHelpText('otpexport')
                    },
                    Options: { }
                },
                {
                    EntityType: 'Employee',
                    Property: 'OtpStatus',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Status',
                    FieldSet: 1,
                    Section: 0,
                    Tooltip: {
                        Text: this.getHelpText('status')
                    },
                    Options: {
                        source: this.otpStatus(),
                        template: (obj) => `${obj.id} - ${obj.name}`,
                        valueProperty: 'id',
                        displayProperty: 'name'
                    }
                },
                {
                    EntityType: 'Employee',
                    Property: 'EmploymentDateOtp',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Ansettelsesdato OTP',
                    FieldSet: 1,
                    Section: 0,
                    Tooltip: {
                        Text: this.getHelpText('empdate')
                    },
                    Options: { }
                },
                {
                    EntityType: 'Employee',
                    Property: 'EndDateOtp',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Sluttdato',
                    FieldSet: 1,
                    Section: 0,
                    Tooltip: {
                        Text: this.getHelpText('enddate')
                    },
                    Options: { }
                },
                {
                    EntityType: 'Employee',
                    Property: 'IncludeOtpUntilMonth',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Inkl. i eksp tom. måned',
                    FieldSet: 1,
                    Section: 0,
                    Tooltip: {
                        Text: this.getHelpText('month')
                    },
                    Options: {
                        source: this.periods(),
                        template: (obj) => `${obj.period} - ${obj.name}`,
                        valueProperty: 'period',
                        displayProperty: 'name',
                    }
                },
                {
                    EntityType: 'Employee',
                    Property: 'IncludeOtpUntilYear',
                    FieldType: FieldType.TEXT,
                    Label: 'Inkl. i eksp tom. år',
                    FieldSet: 1,
                    Section: 0,
                    Tooltip: {
                        Text: this.getHelpText('year')
                    },
                    Options: { }
                },
                {
                    EntityType: 'Employee',
                    Property: 'TypeOfPaymentOtp',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Avlønningsform',
                    FieldSet: 1,
                    Section: 0,
                    Tooltip: {
                        Text: this.getHelpText('paytype')
                    },
                    Options: {
                        source: this.typeOfOtpPayments(),
                        template: (obj) => `${obj.id} - ${obj.name}`,
                        valueProperty: 'id',
                        displayProperty: 'name'
                    }
                }
            ]
        }]);
    }

}
