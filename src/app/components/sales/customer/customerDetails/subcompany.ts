import {Component, Input, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Customer } from '@uni-entities';
import { UniHttp } from '@uni-framework/core/http/http';
import { Observable } from 'rxjs/Observable';
import { GuidService } from '@app/services/services';
import { FieldType, UniForm } from '@uni-framework/ui/uniform';
import { AuthService } from '@app/authService';

export interface ISubCompany {
    ID?: number;
    CustomerID?: number;
    CompanyName: string;
    CompanyID?: number;
    CompanyType?: CompanyTypeEnum;
    CompanyKey?: string;
    StatusCode?: number;
    Deleted?: boolean;
    _createguid?: string;
}

interface ICompanyLicense {
    id: number;
    companyName: string;
    companyKey: string;
    orgNumber: string;
    contractType: number;
    contractTypeName?: string;
}

export enum CompanyTypeEnum {
    ChildOfBureau = 1,
    Subsidiary = 2
}

const ContractTypes = [
    { id: 0, name: 'Demo'}, { id: 1, name: 'Intern'},
    { id: 3, name: 'Partner'}, { id: 4, name: 'Pilot'},
    { id: 5, name: 'Skole'}, { id: 10, name: 'Standard'},
    { id: 11, name: 'Byrå'}, { id: 12, name: 'Lag/forening'}
];

@Component({
    selector: 'subcompanycomponent',
    template: `<article [attr.aria-busy]="busy">
        <uni-form [config]="config$"
              [fields]="fields$"
              [model]="subCompany$"
              (changeEvent)="onChange($event)">
        </uni-form>

        </article>
    `
})
export class SubCompanyComponent implements OnInit {
    @Input() public customer: BehaviorSubject<Customer> = new BehaviorSubject(null);
    @Output() public change: EventEmitter<ISubCompany> = new EventEmitter<ISubCompany>();
    @ViewChild(UniForm) private uniForm: UniForm;

    public subCompany$: BehaviorSubject<ISubCompany> = new BehaviorSubject(null);
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public canDelete = false;
    public candidates: Array<ICompanyLicense> = [];
    public busy = false;

    private layout: { Name: string, BaseEntity: string, Fields: Array<any> };
    private activeCompanyKey = '';
    private activated = false;
    private subCompanies: Array<any> = [];
    private currentCustomerID = 0;
    constructor(private http: UniHttp, private guidService: GuidService, authService: AuthService) {
        authService.authentication$.subscribe((authDetails) => {
            this.activeCompanyKey = authDetails.activeCompany.Key;
        });
    }

    public ngOnInit(): void {

        this.initFormLayout();

        if (this.customer) {
            this.customer.subscribe( c => this.onParentCustomerChange(c) );
        }
    }

    public activate() {
        if (!this.activated) {
            this.activated = true;
            this.getLicenseCustomers();
            this.onParentCustomerChange(this.customer.getValue());
        } else {
            if (this.candidates.length === 0) {
                this.getLicenseCustomers();
            }
        }
    }

    public refresh() {
        this.currentCustomerID = 0;
        this.canDelete = false;
        this.onParentCustomerChange(this.customer.getValue());
    }

    public onChange(event) {
        const value = this.subCompany$.getValue();
        const change = event['_licenseCompany'];
        if (change) {
            const match = this.candidates.find( x => x.id === change.currentValue);
            if (match) {
                value.CompanyKey = match.companyKey;
                value.CompanyName = match.companyName;
                this.subCompany$.next(value);
            }
        }
        this.updateParent(value);
    }

    public onDelete() {
        const item = this.subCompany$.getValue();
        if (item.ID) {
            item.Deleted = true;
            this.canDelete = false;
            this.uniForm.readMode();
            this.updateParent(item);
        }
    }

    private updateParent(item: ISubCompany) {
        this.subCompanies[0] = item;
        const cust = this.customer.getValue();
        cust['Companies'] = this.subCompanies;
        this.customer.next(cust);
        this.change.emit(item);
    }

    private initFormLayout() {
        this.layout = this.createFormLayout();
        this.fields$.next(this.layout.Fields);
    }


    private onParentCustomerChange(c: Customer) {
        if (!this.activated) { return; }
        if (c && c.ID && (c.ID !== this.currentCustomerID)) {
            this.busy = true;
            this.currentCustomerID = c.ID;
            this.GET(`subcompanies?filter=customerid eq ${c.ID}`)
                .finally( () => this.busy = false )
                .subscribe( (list: Array<ISubCompany>) => {
                    if (list && list.length > 0) {
                        this.subCompanies = list;
                    } else {
                        this.subCompanies = [this.factory()];
                    }
                    this.uniForm.editMode();
                    this.canDelete = this.subCompanies[0].ID !== undefined;
                    this.attachLicense(this.subCompanies[0]);
                    this.subCompany$.next(this.subCompanies[0]);
                });
            return;
        }
        this.subCompanies = this.subCompanies || [];
    }

    private factory(): ISubCompany {
        return {
            CompanyName: '',
            _createguid: this.guidService.guid()
        };
    }

    private GET(route: string, params?: any, useStatistics = false ): Observable<any> {
        if (useStatistics) {
            return this.http.asGET().usingStatisticsDomain()
            .withEndPoint(route).send(params)
            .map(response => response.json().Data);
        }
        return this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send(params)
        .map(response => response.json());
    }

    private ElsaGet(route: string, params?: any): Observable<any> {
        return this.http.asGET().usingElsaDomain()
        .withEndPoint(route).send(params)
        .map(response => response.json());
    }

    private createFormLayout() {
        return {
            Name: 'SubCompany',
            BaseEntity: 'SubCompany',
            Fields: [
                { FieldSet: 1, Legend: 'Kobling mot underselskap', Property: '_licenseCompany',
                    FieldType: FieldType.DROPDOWN, Label: 'Oppslag', Section: 0, ReadOnly: true, Options:  {
                        source: [],
                        valueProperty: 'id',
                        template: item => `${item.companyName} (${item.contractTypeName})`,
                        hideDeleteButton: false
                    }
                 },
                { FieldSet: 1, Property: 'CompanyName',
                    FieldType: FieldType.TEXT, Label: 'Navn', Section: 0 },
                { FieldSet: 1, Property: 'CompanyKey',
                    FieldType: FieldType.TEXT, Label: 'Nøkkel', Section: 0 },
                { FieldSet: 1, Property: 'CompanyType',
                    FieldType: FieldType.DROPDOWN, Label: 'Type', Section: 0, Options:  {
                        source: [ { ID: 1, Name: 'Byråklient' }, { ID: 2, Name: 'Datterselskap' }],
                        valueProperty: 'ID',
                        template: item => item.Name,
                        hideDeleteButton: true
                    }
                 },
                 { FieldSet: 1, Property: 'DeleteButton',
                    FieldType: FieldType.BUTTON, Label: 'Fjern kobling', Section: 0, Options: {
                        click: () => {
                            this.onDelete();
                        }
                    }
                }
            ]
        };
    }

    private getLicenseCustomers() {
        this.ElsaGet('/api/companylicenses')
            .subscribe( list => this.processLicenseList(list));
    }

    private processLicenseList(licenses: Array<ICompanyLicense>) {

        const list = licenses
            .filter( x => x.companyKey !== this.activeCompanyKey )
            .sort((a, b) => a.companyName.toLowerCase() > b.companyName.toLowerCase() ? 1 : a.companyName === b.companyName ? 0 : -1 );

        list.forEach( ctr => {
            const tp = ContractTypes.find( x => x.id === ctr.contractType);
            if (tp) {
                ctr.contractTypeName = tp.name;
            }
        });

        this.showLicenses(list);

    }

    private showLicenses(list: Array<ICompanyLicense>) {

        this.candidates = list;

        // Set the combo-value?
        const current = this.subCompany$.getValue();
        if (current && current.CompanyKey) {
            this.attachLicense(current);
            this.subCompany$.next(current);
        }

        // Update combo in form-view:
        const combo = this.layout.Fields.find( x => x.Property === '_licenseCompany');
        if (combo) {
            combo.ReadOnly = this.candidates.length === 0;
            combo.Options.source = this.candidates;
            this.fields$.next(this.layout.Fields);
        }
    }

    private attachLicense(value: ISubCompany) {
        const match = this.candidates.find( x => x.companyKey === value.CompanyKey);
        value.CompanyType = value.CompanyType || 1;
        value['_licenseCompany'] = match ? match.id : undefined;
    }
}
