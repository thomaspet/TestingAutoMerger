import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import { WageType, Account  } from '../../../unientities';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AccountService } from '../../accounting/accountService';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Observable';
import {FieldType} from 'uniform-ng2/main';

export enum WageTypeBaseOptions {
    VacationPay = 0,
    AGA = 1,
    Pension = 2
}

@Injectable()
export class WageTypeService extends BizHttp<WageType> {
    private readOnlyProps: string[] = [
        '_baseOptions',
        'Base_Payment',
        'SpecialAgaRule',
        'taxtype',
        'StandardWageTypeFor'
    ]
    private defaultExpands: any = [
        'SupplementaryInformations'
    ];

    constructor(http: UniHttp, private accountService: AccountService) {
        super(http);
        this.relativeURL = WageType.RelativeUrl;
        this.entityType = WageType.EntityType;
    }

    public getSubEntities() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('subentities')
            .send()
            .map(response => response.json());
    }

    public getTypes() {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint('wagetypes')
            .send()
            .map(response => response.json());
    }

    public syncWagetypes() {
        return this.http
            .usingBusinessDomain()
            .asPUT()
            .withEndPoint(this.relativeURL + '/?action=synchronize')
            .send()
            .map(response => response.json());
    }

    public getWageType(id: number | string, expand: string[] = null): Observable<any> {
        if (id === 0) {
            if (expand) {
                return this.GetNewEntity(expand);
            }
            return this.GetNewEntity(this.defaultExpands);
        } else {
            if (expand) {
                return this.Get(id, expand);
            }
            return this.Get(id, this.defaultExpands);
        }
    }

    public usedInPayrollrun(ID: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '/' + ID + '?action=used-in-payrollrun')
            .send()
            .map(response => response.json());
    }

    public manageReadOnlyIfCalculated(fields: any[], readOnly: boolean) {
        return fields.map(field => {
            if (this.readOnlyProps.some(prop => prop === field.Property)) {
                field.ReadOnly = readOnly;
            }
            return field;
        });
    }

    public getPrevious(wageTypeNumber: number, expands: string[] = null) {
        return super.GetAll(`filter=WageTypeNumber lt ${wageTypeNumber}&top=1&orderBy=WageTypeNumber desc`,
            expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }

    public getNext(wageTypeNumber: number, expands: string[] = null) {
        return super.GetAll(`filter=WageTypeNumber gt ${wageTypeNumber}&top=1&orderBy=WageTypeNumber`,
            expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }

    public getRate(wageTypeID: number, employmentID: number, employeeID: number) {

        employmentID = employmentID ? employmentID : 0;
        employeeID = employeeID ? employeeID : 0;

        if (wageTypeID) {
            return this.http
                .usingBusinessDomain()
                .asGET()
                .withEndPoint(this.relativeURL + `?action=get-rate&wagetypeID=${wageTypeID}&employmentID=${employmentID}&employeeID=${employeeID}`)
                .send()
                .map(response => response.json());
        } else {
            return Observable.of(0);
        }
    }

    private getAccountSearchOptions(wageType$: BehaviorSubject<WageType>, accountProp: string) {
        return {
            getDefaultData: () => {
                return wageType$
                    .take(1)
                    .switchMap(wt => (wt && wt[accountProp])
                        ? this.accountService.GetAll(`filter=AccountNumber eq ${wt[accountProp]}`)
                        : Observable.of([]));
            },
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
            debounceTime: 200,
            search: (query: string) =>  this.accountService
                .GetAll(`top=50&filter=startswith(AccountNumber, '${query}') or contains(AccountName, '${query}')`)
        };
    }

    public layout(layoutID: string, wageType$: BehaviorSubject<WageType>) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'wagetype',
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'WageTypeNumber',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Nr',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Legend: 'lønnsart',
                    Section: 0,
                    Placeholder: 'La stå tom for neste ledige',
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false,
                    Options: {
                        format: 'none'
                    }
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'WageTypeName',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Navn',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'SpecialAgaRule',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Type lønnsart',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'HideFromPaycheck',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Skjul på lønnslipp',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'StandardWageTypeFor',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: 'Name',
                    Options: null,
                    Label: 'Systemets standard lønnsart for',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'GetRateFrom',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sats hentes fra',
                    Legend: 'Sats',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: 'Sats',
                    hasLineBreak: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'Rate',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sats',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'RateFactor',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Utbetales med tillegg i prosent',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: {format: 'percent'},
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'taxtype',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: 'Name',
                    Label: 'Behandlingsregel skattetrekk',
                    Description: null,
                    HelpText: null,
                    FieldSet: 3,
                    Legend: 'Behandling',
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    Options: null,
                    hasLineBreak: false
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: '_baseOptions',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOXGROUP,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Med i grunnlag for: ',
                    Description: null,
                    HelpText: null,
                    FieldSet: 3,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        multivalue: true,
                        source: [
                            { ID: WageTypeBaseOptions.VacationPay, Name: 'Feriepenger' },
                            { ID: WageTypeBaseOptions.AGA, Name: 'Aga' },
                            { ID: WageTypeBaseOptions.Pension, Name: 'Pensjon' }
                        ],
                        valueProperty: 'ID',
                        labelProperty: 'Name'
                    },
                    LineBreak: null,
                    Combo: null,
                    hasLineBreak: false
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'AccountNumber',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Hovedbokskonto',
                    Legend: 'Rengskapsinnstillinger',
                    Description: null,
                    HelpText: null,
                    FieldSet: 4,
                    Section: 0,
                    Placeholder: null,
                    Options: this.getAccountSearchOptions(wageType$, 'AccountNumber'),
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'Base_Payment',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Utbetales',
                    Description: null,
                    HelpText: null,
                    FieldSet: 4,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'AccountNumber_balance',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Motkonto kredit',
                    Description: null,
                    HelpText: null,
                    FieldSet: 4,
                    Section: 0,
                    Placeholder: null,
                    Options: this.getAccountSearchOptions(wageType$, 'AccountNumber_balance'),
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'IncomeType',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Inntektstype',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: 'A-meldingsinformasjon',
                    Legend: 'A-meldingsinformasjon',
                    hasLineBreak: false,
                    openByDefault: true,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'Benefit',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fordel',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'Description',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Beskrivelse',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'SpecialTaxAndContributionsRule',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Skatte- og avgiftsregel',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false,
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'SupplementPackage',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Tilleggsinformasjon pakke',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false,
                },
                {
                    Property: '_AMeldingHelp',
                    FieldType: FieldType.HYPERLINK,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Hjelp',
                    HelpText: 'Hjelp til a-ordningen',
                    FieldSet: 1,
                    Section: 2,
                    Options: {
                        description: 'Veiledning a-ordningen',
                        target: '_blank'
                    },
                    Combo: 0
                }
            ]
        }]);
    }

    public specialSettingsLayout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'wagetype',
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'FixedSalaryHolidayDeduction',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fastlønn og trekk i lønn for ferie',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false
                }
            ]
        }]);
    }
}
