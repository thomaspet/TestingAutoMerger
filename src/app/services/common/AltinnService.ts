import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Altinn, FieldType, Employee, SubEntity} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import { Observable } from 'rxjs/Observable';
import { SubEntityService } from '../services';
import {AppConfig} from '../../../app/AppConfig';

export class AltinnService extends BizHttp<Altinn> {
    private altinnHeaders: any = {
        'sysusername': '1440',
        'syspassword': 'uni12345',
        'lang': '1033',
        'orgno': '910142763',
        'Cache-Control': 'no-cache'
    };

    private subEntityService: SubEntityService;

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
        let employeeSSN: string[] = [];
        employees.forEach((employee: Employee) => {
            employeeSSN.push(employee.SocialSecurityNumber);
        });
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
        console.log('sending tax request with body: ' + JSON.stringify(body));
        this.http.withHeaders(this.altinnHeaders);
        
        return this.http
            .asPOST()
            .withBody(body)
            .send({baseUrl: AppConfig.BASE_URL_INTEGRATION, apiDomain: AppConfig.INTEGRATION_DOMAINS.ALTINN, endPoint: 'form/RF-1211'});
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
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
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
