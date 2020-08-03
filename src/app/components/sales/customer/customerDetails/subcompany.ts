import {Component, Input, Output, EventEmitter} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Customer, SubCompany, CompanyRelation} from '@uni-entities';
import {UniHttp} from '@uni-framework/core/http/http';
import {GuidService, ElsaContractService, ErrorService} from '@app/services/services';
import {FieldType} from '@uni-framework/ui/uniform';
import {AuthService} from '@app/authService';
import {ElsaCompanyLicense} from '@app/models';
import {cloneDeep} from 'lodash';

@Component({
    selector: 'subcompanycomponent',
    styleUrls: ['./subcompany.sass'],
    template: `

        <section class="uni-card">
            <section class="uni-card-header">
                <h1>Kobling mot underselskap</h1>
                <button class="tertiary bad pull-right"
                    *ngIf="isLicenseAdmin"
                    (click)="removeSubCompany()"
                    [disabled]="!(subCompany$ | async)?.CompanyKey"
                    [attr.aria-busy]="deleteBusy">

                    Slett kobling
                </button>
            </section>

            <section class="uni-card-content">
                <section *ngIf="!isLicenseAdmin || licenseCompanies?.length === 0" class="alert warn">
                    Det er kun lisensadministratorer som kan redigere kobling mot underselskap
                </section>

                <uni-form
                    [config]="{autoFocus: true}"
                    [fields]="fields$"
                    [model]="subCompany$"
                    (changeEvent)="onFormChange()">
                </uni-form>
            </section>
        </section>
    `
})
export class SubCompanyComponent {
    @Input() customer: Customer;
    @Output() customerChange = new EventEmitter<Customer>();

    deleteBusy: boolean;
    isLicenseAdmin: boolean;
    licenseCompanies: ElsaCompanyLicense[];

    fields$ = new BehaviorSubject([]);
    subCompany$ = new BehaviorSubject<Partial<SubCompany>>(null);

    constructor(
        private http: UniHttp,
        private guidService: GuidService,
        private authService: AuthService,
        private elsaContractService: ElsaContractService,
        private errorService: ErrorService,
    ) {}

    ngOnInit() {
        this.isLicenseAdmin = this.authService.currentUser?.License?.CustomerAgreement?.CanAgreeToLicense;

        if (this.isLicenseAdmin) {
            const contractID = this.authService.currentUser.License.Company?.ContractID;
            this.elsaContractService.getCompanyLicenses(contractID).subscribe(
                companies => {
                    this.licenseCompanies = companies;
                    this.fields$.next(this.getFields());
                },
                err => this.errorService.handle(err)
            );
        } else {
            this.fields$.next(this.getFields());
        }
    }

    ngOnChanges() {
        if (this.customer) {
            let subCompany: Partial<SubCompany> = this.customer.Companies && this.customer.Companies[0];
            if (!subCompany) {
                subCompany = {
                    CompanyKey: null,
                    CustomerID: this.customer.ID,
                    _createguid: this.guidService.guid()
                };
            }

            this.subCompany$.next(cloneDeep(subCompany));
        }
    }

    ngOnDestroy() {
        this.fields$.complete();
        this.subCompany$.complete();
    }

    onFormChange() {
        const subCompany = <SubCompany> this.subCompany$.getValue();
        if (subCompany.CompanyKey) {
            const company = this.licenseCompanies.find(c => c.CompanyKey === subCompany.CompanyKey);
            subCompany.CompanyName = company?.CompanyName;
            subCompany.CompanyType = subCompany.CompanyType || CompanyRelation.ChildOfBeurea,

            this.subCompany$.next(subCompany);
            this.customer.Companies = [subCompany];
            this.customerChange.emit(cloneDeep(this.customer));
        }
    }

    removeSubCompany() {
        const subCompanyID = this.subCompany$.value?.ID;

        if (subCompanyID) {
            this.deleteBusy = true;
            this.http.asDELETE()
                .usingBusinessDomain()
                .withEndPoint('subcompanies/' + subCompanyID)
                .send()
                .subscribe(
                    () => {
                        this.customer.Companies = null;
                        this.customerChange.emit(cloneDeep(this.customer));
                        this.deleteBusy = false;
                    },
                    err => {
                        this.errorService.handle(err);
                        this.deleteBusy = false;
                    }
                );
        } else {
            this.customer.Companies = null;
            this.customerChange.emit(cloneDeep(this.customer));
        }
    }

    private getFields() {
        let companyField;
        if (this.isLicenseAdmin && this.licenseCompanies?.length) {
            companyField = {
                Property: 'CompanyKey',
                FieldType: FieldType.DROPDOWN,
                Label: 'Selskap',
                Options:  {
                    source: this.licenseCompanies,
                    valueProperty: 'CompanyKey',
                    template: (item: ElsaCompanyLicense) => item.CompanyName,
                    hideDeleteButton: true
                }
            };
        } else {
            companyField = {
                Property: 'CompanyName',
                FieldType: FieldType.TEXT,
                Label: 'Selskap',
                ReadOnly: true
            };
        }

        return [
            companyField,
            {
                Property: 'CompanyType',
                FieldType: FieldType.DROPDOWN,
                Label: 'Type',
                ReadOnly: !this.isLicenseAdmin,
                Options:  {
                    source: [ { ID: 1, Name: 'Byråklient' }, { ID: 2, Name: 'Datterselskap' }],
                    valueProperty: 'ID',
                    template: item => item.Name,
                    hideDeleteButton: true
                }
            },
        ];
    }
}
