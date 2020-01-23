import {Component, Input, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Customer} from '@uni-entities';
import {UniHttp} from '@uni-framework/core/http/http';
import {GuidService} from '@app/services/services';
import {FieldType, UniForm} from '@uni-framework/ui/uniform';
import {AuthService} from '@app/authService';
import {ElsaCompanyLicense} from '@app/models';

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

export enum CompanyTypeEnum {
    ChildOfBureau = 1,
    Subsidiary = 2
}

@Component({
    selector: 'subcompanycomponent',
    template: `
        <article [attr.aria-busy]="busy">
            <uni-form
                [config]="{}"
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
    @ViewChild(UniForm, { static: true }) private uniForm: UniForm;

    public subCompany$: BehaviorSubject<ISubCompany> = new BehaviorSubject(null);
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public canDelete = false;
    public candidates: ElsaCompanyLicense[] = [];
    public busy = false;

    private layout: { Name: string, BaseEntity: string, Fields: Array<any> };
    private activeCompanyKey = '';
    private activated = false;
    private subCompanies = [];
    public currentCustomerID = 0;

    constructor(private http: UniHttp, private guidService: GuidService, authService: AuthService) {
        authService.authentication$.take(1).subscribe(auth => {
            this.activeCompanyKey = auth && auth.activeCompany.Key;
        });
    }

    ngOnInit(): void {
        this.layout = this.createFormLayout();
        this.fields$.next(this.layout.Fields);

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
            const match = this.candidates.find( x => x.ID === change.currentValue);
            if (match) {
                value.CompanyKey = match.CompanyKey;
                value.CompanyName = match.CompanyName;
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

    public onParentCustomerChange(c: Customer) {
        if (!this.activated) { return; }
        if (c && c.ID && (c.ID !== this.currentCustomerID)) {
            this.busy = true;
            this.currentCustomerID = c.ID;

            this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint(`subcompanies?filter=customerid eq ${c.ID}`)
                .send()
                .map(res => res.body)
                .subscribe(
                    res => {
                        if (res && res.length) {
                            this.subCompanies = res;
                        } else {
                            this.subCompanies = [{
                                CompanyName: '',
                                _createguid: this.guidService.guid()
                            }];
                        }


                        this.uniForm.editMode();
                        this.canDelete = this.subCompanies[0].ID !== undefined;
                        this.attachLicense(this.subCompanies[0]);
                        this.subCompany$.next(this.subCompanies[0]);
                        this.busy = false;
                    },
                    err => {
                        console.error(err);
                        this.busy = false;
                    }
                );
        }

        this.subCompanies = this.subCompanies || [];
    }

    private createFormLayout() {
        return {
            Name: 'SubCompany',
            BaseEntity: 'SubCompany',
            Fields: [
                {
                    FieldSet: 1,
                    Legend: 'Kobling mot underselskap',
                    Property: '_licenseCompany',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Oppslag',
                    ReadOnly: true,
                    Options:  {
                        source: [],
                        valueProperty: 'ID',
                        template: (item: ElsaCompanyLicense) => item.CompanyName,
                        hideDeleteButton: false
                    }
                 },
                {
                    FieldSet: 1,
                    Property: 'CompanyName',
                    FieldType: FieldType.TEXT,
                    Label: 'Navn',
                },
                {
                    FieldSet: 1,
                    Property: 'CompanyKey',
                    FieldType: FieldType.TEXT,
                    Label: 'Nøkkel',
                },
                {
                    FieldSet: 1,
                    Property: 'CompanyType',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Type',
                    Options:  {
                        source: [ { ID: 1, Name: 'Byråklient' }, { ID: 2, Name: 'Datterselskap' }],
                        valueProperty: 'ID',
                        template: item => item.Name,
                        hideDeleteButton: true
                    }
                 },
                 {
                    FieldSet: 1,
                    Property: 'DeleteButton',
                    FieldType: FieldType.BUTTON,
                    Label: 'Fjern kobling',
                    Options: {
                        class: 'bad',
                        click: () => {
                            this.onDelete();
                        }
                    }
                }
            ]
        };
    }

    private getLicenseCustomers() {
        return this.http.asGET()
            .usingElsaDomain()
            .withEndPoint('/api/companylicenses')
            .send()
            .subscribe(
                res => this.showLicenses(res.body),
                err => console.error(err)
            );
    }

    private showLicenses(list: ElsaCompanyLicense[]) {
        this.candidates = (list || [])
            .filter( x => x.CompanyKey !== this.activeCompanyKey )
            .sort((a, b) => (a.CompanyName || '').localeCompare(b.CompanyName));

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
        const match = this.candidates.find( x => x.CompanyKey === value.CompanyKey);
        value.CompanyType = value.CompanyType || 1;
        value['_licenseCompany'] = match ? match.ID : undefined;
    }
}
