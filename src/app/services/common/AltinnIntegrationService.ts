import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Altinn, FieldType, AltinnReceipt, AltinnCorrespondanceReader} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {SubEntityService} from '../services';
import {IntegrationServerCaller} from './IntegrationServerCaller';
import {Injectable} from '@angular/core';
import {TaxCardReading} from '../../models/models';

@Injectable()
export class AltinnIntegrationService extends BizHttp<Altinn> {

    public languages: any = [
        { ID: '1044' || null, text: 'Norsk(bokmål)' },
        { ID: '2068', text: 'Norsk(nynorsk)' },
        { ID: '1033', text: 'English' },
        { ID: '1083', text: 'Samisk' },
    ];
    public loginTypes: {ID: number, text: string}[] = [
        { ID: 1 || null || 0, text: 'AltinnPin'},
        { ID: 2, text: 'SMSPin'},
        { ID: 3, text: 'TaxPin'}
    ];
    private inServer: IntegrationServerCaller;

    constructor(http: UniHttp, private subEntityService: SubEntityService, private integrate: IntegrationServerCaller) {
        super(http);
        this.relativeURL = Altinn.RelativeUrl;
        this.entityType = Altinn.EntityType;
        this.inServer = integrate;
    }

    public sendTaxRequestAction(option: string, empId: number = 0): Observable<AltinnReceipt> {
        return this.PostAction(1, 'sendtaxrequest', 'option=' + option + '&empId=' + empId);
    }

    public readTaxCard(taxCardInfo: AltinnCorrespondanceReader) {
        return this.http.usingBusinessDomain().withEndPoint('employees/?action=read-tax-cards').asPUT().withBody(taxCardInfo).send().map(response => response.json());
    }


    public getLayout() {
        return Observable.from([{
            StatusCode: 0,
            Name: 'Altinn',
            BaseEntity: 'Altinn',
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Altinn',
                    Property: 'SystemID',
                    Placement: 1,
                    ID: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'ID fra Altinn',
                    Description: 'Description',
                    HelpText: 'Tall, Id fås av Altinn ved oppsett av datasystem (minst 6 tegn)',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: 'Legend',
                    StatusCode: 0,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    hasLineBreak: true
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Altinn',
                    Property: 'SystemPw',
                    Placement: 2,
                    ID: 1,
                    Hidden: false,
                    FieldType: FieldType.PASSWORD,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Passord',
                    Description: '',
                    HelpText: 'Samme passord som ble satt opp i Altinn ved oppsett datasystem',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    hasLineBreak: true
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Altinn',
                    Property: 'Language',
                    Placement: 3,
                    ID: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Foretrukket språk',
                    Description: '',
                    HelpText: 'Her kan en velge det foretrukne språket for dette firmaet for Altinn (nynorsk, bokmål, samisk, engelsk)',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    IsLookUp: true,
                    Options: {
                        source: this.languages,
                        template: (obj) => `${obj.id} - ${obj.name}`, 
                        valueProperty: 'ID',
                        displayProperty: 'text'
                    },
                    hasLineBreak: true
                }
            ]
        }]);
    }
}
