import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Altinn, AltinnReceipt} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {SubEntityService} from '../common/subEntityService';
import {IntegrationServerCaller} from './integrationServerCaller';
import {Injectable} from '@angular/core';
import {AltinnAuthenticationData} from '../../models/AltinnAuthenticationData';
import {FieldType} from '../../../framework/ui/uniform/index';

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

    public getPassword(): Observable<string> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=getpassword')
            .send()
            .map(response => response.json());
    }

    public setPassword(password: string): Observable<string> {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=setpassword&password=' + password)
            .send()
            .map(response => response.json());
    }

    public sendTaxRequestAction(
        option: string, 
        empId: number = 0, 
        empsAndChanged: boolean = false): Observable<AltinnReceipt> {
        return this.PostAction(1, 'sendtaxrequest', 'option=' + option + '&empId=' + empId + '&requestAllChanges=' + empsAndChanged);
    }

    public readTaxCard(authData: AltinnAuthenticationData, receiptID: number): Observable<string> {

        const headers = {
            'x-altinn-userid': authData.userID,
            'x-altinn-password': authData.password,
            'x-altinn-pinmethod': authData.preferredLogin,
            'x-altinn-pin': authData.pin
        };

        return this.http
            .asGET()
            .usingBusinessDomain()
            .withHeaders(headers)
            .withEndPoint(`employees/?action=read-tax-cards&receiptID=${receiptID}`)
            .send()
            .map(response => response.json());
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
