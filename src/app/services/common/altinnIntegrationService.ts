import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Altinn, AltinnReceipt, TaxCardReadStatus, A06Options} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {SubEntityService} from '../common/subEntityService';
import {IntegrationServerCaller} from './integrationServerCaller';
import {Injectable} from '@angular/core';
import {RequestMethod} from '@uni-framework/core/http';
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

    public checkLogin(): Observable<boolean> {
        return super.GetAction(null, 'checklogin');
    }

    public getPassword(): Observable<string> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=getpassword')
            .send()
            .map(response => response.body);
    }

    public setPassword(password: string): Observable<string> {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=setpassword&password=' + password)
            .send()
            .map(response => response.body);
    }

    public sendTaxRequestAction(
        option: string,
        empId: number = 0,
        empsAndChanged: boolean = false,
        categoryID: number = 0): Observable<AltinnReceipt> {
        return this.PostAction(
            1,
            'sendtaxrequest',
            'option=' + option
                + '&empId=' + empId
                + '&requestAllChanges=' + empsAndChanged
                + '&categoryID=' + categoryID
        );
    }

    public sendReconciliationRequest(option: A06Options): Observable<AltinnReceipt> {
        return this.ActionWithBody(null, option, 'send-a06-request', RequestMethod.Post);
    }

    public readTaxCard(authData: AltinnAuthenticationData, receiptID: number): Observable<TaxCardReadStatus> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withHeaders(this.getHeaders(authData))
            .withEndPoint(`employees/?action=read-tax-cards&receiptID=${receiptID}`)
            .send()
            .map(response => response.body);
    }

    public getA07Response(authData: AltinnAuthenticationData, receiptID: number) {
        this.http.withHeaders(this.getHeaders(authData));
        return this.GetAction(null, 'get-a07-response', `receiptID=${receiptID}`).do(response => console.log(response));
    }

    private getHeaders(authData: AltinnAuthenticationData): any {
        return {
            'x-altinn-userid': authData.userID,
            'x-altinn-password': authData.password,
            'x-altinn-pinmethod': authData.preferredLogin,
            'x-altinn-pin': authData.pin
        };
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
                    Tooltip: {
                        Text: 'Tall, Id fås av Altinn ved oppsett av datasystem (minst 6 tegn)'
                    },
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
                    Tooltip: {
                        Text: 'Samme passord som ble satt opp i Altinn ved oppsett datasystem'
                    },
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
                    Tooltip: {
                        Text: 'Her kan en velge det foretrukne språket for dette firmaet for Altinn (nynorsk, bokmål, samisk, engelsk)'
                    },
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
