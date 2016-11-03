import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import { WageType, FieldType } from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class WageTypeService extends BizHttp<WageType> {

    private defaultExpands: any = [
        'SupplementaryInformations'
    ];

    constructor(http: UniHttp) {
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
    
    public getPrevious(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID lt ${ID}&top=1&orderBy=ID desc`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }
    
    public getNext(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID gt ${ID}&top=1&orderBy=ID`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }
    
    public layout(layoutID: string) {
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
                    FieldSet: 0,
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
                    Property: 'WageTypeName',
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
                    FieldSet: 0,
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
                    Property: 'AccountNumber',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Hovedbokskonto',
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
                    FieldSet: 0,
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
                    Property: 'Base_Vacation',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Grunnlag Feriepenger',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Legend: 'Med i grunnlag for',
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    hasLineBreak: false,
                    openByDefault: true
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'Base_EmploymentTax',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Grunnlag aga',
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
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'Base_div1',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Grunnlag pensjon',
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
                }, 
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'HideFromPaycheck',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Skjul på lønnslipp',
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
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'Base_Payment',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Utbetales',
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
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
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
                    Property: 'Rate',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sats',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
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
                    Label: 'Utbetales med tillegg',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
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
                    Property: 'AccountNumber_balance',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Motkonto kredit',
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
                    FieldSet: 0,
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
                    Property: 'IncomeType',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Inntektstype',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: 'A-meldingsinformasjon',
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
                    FieldSet: 0,
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
                    FieldSet: 0,
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
                    Label: 'Skatte-avg-regel',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
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
                    EntityType: 'packages',
                    Property: '_uninavn',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Tilleggsinformasjon pakke',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
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
                    FieldSet: 0,
                    Section: 2,
                    Options: {
                        description: 'Veiledning a-ordningen',
                        target: '_blank'
                    },
                    Combo: 0
                }
            ]
        }]);
    };
}
