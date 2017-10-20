import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Altinn, AltinnReceipt, TaxCardReadStatus} from '../../unientities';
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
        super.disableCache();

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

    public readTaxCard(authData: AltinnAuthenticationData, receiptID: number): Observable<TaxCardReadStatus> {

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
            Name: 'Altinn',
            BaseEntity: 'Altinn',
            Fields: [
                {
                    EntityType: 'Altinn',
                    Property: 'SystemID',
                    FieldType: FieldType.TEXT,
                    Label: 'ID fra Altinn',
                    Description: 'Description',
                    HelpText: 'Tall, Id fås av Altinn ved oppsett av datasystem (minst 6 tegn)',
                    FieldSet: 0,
                    Section: 0,
                    Legend: 'Legend',
                    hasLineBreak: true
                },
                {
                    EntityType: 'Altinn',
                    Property: 'SystemPw',
                    FieldType: FieldType.PASSWORD,
                    Label: 'Passord',
                    HelpText: 'Samme passord som ble satt opp i Altinn ved oppsett datasystem',
                    FieldSet: 0,
                    Section: 0,
                    hasLineBreak: true
                },
                {
                    EntityType: 'Altinn',
                    Property: 'Language',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Foretrukket språk',
                    Description: '',
                    HelpText: 'Her kan en velge det foretrukne språket for dette firmaet for Altinn (nynorsk, bokmål, samisk, engelsk)',
                    FieldSet: 0,
                    Section: 0,
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
