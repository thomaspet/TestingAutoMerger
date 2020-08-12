import {Component, Input, Output, EventEmitter} from '@angular/core';
import {ErrorService, ElsaContractService} from '@app/services/services';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniHttp} from '@uni-framework/core/http/http';
import {KpiCompany} from '@app/components/bureau/kpiCompanyModel';
import {AuthService} from '@app/authService';
import {SubCompany} from '@uni-entities';

@Component({
    selector: 'uni-subcompany-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>Opprett selskap i lokalt kunderegister</header>

            <article>
                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>

                <section *ngIf="existingSubCompany && !errorMessage" class="alert warn">
                    Selskapet er allerede knyttet mot en kunde
                </section>

                <section *ngIf="errorMessage" class="alert warn">
                    {{errorMessage}}
                </section>

                <section *ngIf="!existingSubCompany && !errorMessage">
                    Vennligst bekreft oppretting av kunde "{{options?.data?.Name}}"?
                </section>

            </article>

            <footer>
                <button (click)="onClose.emit(false)" class="secondary">Avbryt</button>

                <button
                    class="c2a"
                    [disabled]="existingSubCompany || errorMessage"
                    [attr.aria-busy]="busy"
                    (click)="createCustomer()">

                    Opprett kunde
                </button>
            </footer>
        </section>
    `
})
export class SubCompanyModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter<boolean>();

    busy = false;

    kpiCompany: KpiCompany;
    existingSubCompany: SubCompany;

    errorMessage: string;

    constructor(
        private errorService: ErrorService,
        private http: UniHttp,
        private authService: AuthService,
        private elsaContractService: ElsaContractService,
    ) {}

    ngOnInit() {
        this.kpiCompany = this.options?.data;
        this.existingSubCompany = this.kpiCompany && this.kpiCompany['SubCompany'];

        const isLicenseAdmin = this.authService.currentUser?.License?.CustomerAgreement?.CanAgreeToLicense;

        if (isLicenseAdmin) {
            this.busy = true;
            const contractID = this.authService.currentUser.License.Company?.ContractID;
            this.elsaContractService.getCompanyLicenses(contractID).subscribe(
                companies => {
                    const companyIsOnLicense = companies.some(c => c.CompanyKey === this.kpiCompany.Key);
                    if (!companyIsOnLicense) {
                        this.errorMessage = `${this.kpiCompany?.Name || 'Selskapet'} er ikke knyttet til samme lisens som selskapet du er logget inn på`;
                    }

                    this.busy = false;
                },
                err => {
                    this.errorService.handle(err);
                    this.errorMessage = `${this.kpiCompany?.Name || 'Selskapet'} er ikke knyttet til samme lisens som selskapet du er logget inn på`;
                    this.busy = false;
                }
            );
        } else {
            this.errorMessage = 'Det er kun lisensadministratorer som kan sette opp kobling mot lokal kunde';
        }
    }

    createCustomer() {
        this.busy = true;
        this.createCustomerWithSubCompany().subscribe(
            () => this.onClose.emit(true),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    private createCustomerWithSubCompany() {
        const company = this.kpiCompany;
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody({
                Info: {
                    Name: company.Name
                },
                Companies: [{
                    CompanyKey: company.Key,
                    CompanyName: company.Name
                }]
            })
            .withEndPoint('customers')
            .send()
            .map(response => response.body);
    }
}
