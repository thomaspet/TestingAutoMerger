import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Altinn, FieldType, Employee, SubEntity} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import { Observable } from 'rxjs/Observable';
import { SubEntityService } from '../services';

export class AltinnService extends BizHttp<Altinn> {
    private altinnHeaders: any = {
        'sysusername': '1440',
        'syspassword': 'uni12345',
        'lang': '1033',
        'orgno': '910142763',
        /*'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1laWQiOiI2NmJiODkwMy0xYzdkLTQ4YzUtYjE4MC1hOWFiZjU3NzQyYjQiLCJ1bmlxdWVfbmFtZSI6ImJlbiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vYWNjZXNzY29udHJvbHNlcnZpY2UvMjAxMC8wNy9jbGFpbXMvaWRlbnRpdHlwcm92aWRlciI6IkFTUC5ORVQgSWRlbnRpdHkiLCJBc3BOZXQuSWRlbnRpdHkuU2VjdXJpdHlTdGFtcCI6IjgxZWU1NWE0LTFiZjYtNDg5Mi05ZDY5LTRlNjhlOTRhN2ZiNiIsInJvbGUiOiJVc2VyIiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS51bmllY29ub215Lm5vIiwiYXVkIjoiNDE0ZTE5MjdhMzg4NGY2OGFiYzc5ZjcyODM4MzdmZDEiLCJleHAiOjE0NjE1Mjc0NTQsIm5iZiI6MTQ2MTQ0MTA1NH0.tAkRm7EZXf7H8eUBrkh05ZzjPIPY1r7d1FRkIOn5gAE',
        */
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    };

    private subEntityService: SubEntityService;

    private BASE_URL: string = 'http://localhost:17100/';
    private API_DOMAIN: string = 'api/altinn/';

    public languages: any = [
        { ID: '1044' || null, text: 'Norsk(bokmål)' },
        { ID: '2068', text: 'Norsk(nynorsk)' },
        { ID: '1033', text: 'English' },
        { ID: '1083', text: 'Samisk' },
    ];
    constructor(http: UniHttp, subEntityService: SubEntityService) {
        super(http);
        this.subEntityService = subEntityService;
        this.relativeURL = Altinn.RelativeUrl;
    }

    public sendTaxRequest(employees: Employee[]) {
        console.log('sending tax request');
        let employeeSSN: string[] = [];
        employees.forEach((employee: Employee) => {
            employeeSSN.push(employee.SocialSecurityNumber);
        });
        console.log('sendTaxRequest 1');
        console.log('sendTaxRequest 2');
        let body: any = {
            callType: 'Warn',
            askType: 'FILE_AND_CHANGED',
            contactInfo: {
                orgno: '910142763',
                orgname: 'Jubel AS',
                contact: 'Robben S.Vindel',
                contactemail: 'svindel@svindel.com',
                contactphone: '99886655'
            },
            request: employeeSSN
        };
        console.log('sending tax request with body: ' + body);
        this.http.withHeaders(this.altinnHeaders);
        
        return this.http
            .asPOST()
            .withBody(JSON.stringify(body))
            .send({baseUrl: this.BASE_URL, apiDomain: this.API_DOMAIN, endPoint: 'form/RF-1211'})
    }

    public getLayout() {
        return Observable.from([{
            StatusCode: 0,
            Name: 'Altinn',
            BaseEntity: 'Altinn',
            Deleted: false,
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
                    HelpText: 'Tall, Id fås av altinn ved oppsett av datasystem (minst 6 tegn)',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: 'Legend',
                    StatusCode: 0,
                    Deleted: false,
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
                    HelpText: 'Samme passord som ble satt opp i altinn ved oppsett datasystem',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    Deleted: false,
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
                    HelpText: 'Her kan en velge det foretrukne språket for dette firmaet for altinn(nynorsk, bokmål, samisk, engelsk)',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    Deleted: false,
                    CustomFields: null,
                    kendoOptions: {
                        dataSource: this.languages,
                        dataTextField: 'text',
                        dataValueField: 'ID'
                    },
                    hasLineBreak: true
                }
            ]
        }]);
    }
}
