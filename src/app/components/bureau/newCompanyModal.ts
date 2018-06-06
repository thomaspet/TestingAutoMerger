import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {IUniSearchConfig, UniSearch} from '@uni-framework/ui/unisearch';
import {ErrorService} from '@app/services/common/errorService';
import {CompanySettings, Company} from '@app/unientities';
import {Observable} from 'rxjs';
import {UniHttp} from '@uni-framework/core/http/http';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {CompanyService} from '@app/services/common/companyService';
import {BusinessRelationService} from '@app/services/sales/businessRelationService';
import {IBrRegCompanyInfo} from '@uni-framework/uni-modal';
import {CompanyTypeService} from '@app/services/common/companyTypeService';

type FormModel = {companyName: string, companySettings: CompanySettings};

const MAX_RESULTS = 50;

@Component({
    selector: 'uni-new-company-modal',
    template: `
        <section role="dialog" class="uni-modal"
                (keydown.esc)="cancel()">
            <p class="warn" *ngIf="options?.warning">
                {{options.warning}}
            </p>
            <header>
                <h1>{{options.header || 'Opprett nytt selskap'}}</h1>
            </header>
            <article [attr.aria-busy]="busy" style="width: 100%;">
                <main>
                    <uni-search [config]="uniSearchConfig"></uni-search>
                    <p>
                        {{formData.companyName}}<br />
                        {{formData.companySettings?.OrganizationNumber ? 'Org.nr. ' + formData.companySettings.OrganizationNumber : ''}}<br />
                        {{formData.companySettings?.DefaultAddress?.AddressLine1}} {{formData.companySettings?.DefaultAddress?.City}} {{formData.companySettings?.DefaultAddress?.PostalCode}}<br />
                    </p>
                </main>
            </article>
            <footer>
                <button class="good" (click)="ok()">Ok</button>
                <button class="bad" (click)="cancel()">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniNewCompanyModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<Company> = new EventEmitter();

    @ViewChild(UniSearch) public uniSearchElement: UniSearch;
    public uniSearchConfig: IUniSearchConfig;
    public busy: boolean = false;

    public formData: FormModel;

    constructor(
        private errorService: ErrorService,
        private uniHttp: UniHttp,
        private toastService: ToastService,
        private companyService: CompanyService,
        private businessRelationService: BusinessRelationService,
        private companyTypeService: CompanyTypeService,
    ) {}

    public ngOnInit() {
        this.formData = <FormModel>{};
        this.uniSearchConfig = <IUniSearchConfig>{
            lookupFn: query => {
                this.formData.companyName = query;
                this.formData.companySettings = null;
                return this.businessRelationService.search(query)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
            },
            onSelect: (selectedItem: IBrRegCompanyInfo) => {
                this.busy = true;
                return this.companyTypeService.GetAll(null)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                    .do(() => this.busy = false)
                    .map(companyTypes => {
                        const companySettings = new CompanySettings();
                        this.businessRelationService.updateCompanySettingsWithBrreg(
                            companySettings,
                            selectedItem,
                            companyTypes,
                        );
                        this.formData.companyName = companySettings.CompanyName;
                        this.formData.companySettings = companySettings;
                        return companySettings
                    });
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Navn', 'Org. nr.'],
            rowTemplateFn: (item: IBrRegCompanyInfo) => [
                item.navn,
                item.orgnr,
            ],
            inputTemplateFn: (item: CompanySettings) => item.CompanyName,
            maxResultsLength: MAX_RESULTS,
        }
        this.uniSearchElement.focus();
    }

    public ok() {
        this.busy = true;
        const orgNr = this.formData.companySettings && this.formData.companySettings.OrganizationNumber;
        new Promise((resolve, reject) => {
            if (orgNr) {
                this.companyService.GetAll(null).subscribe(
                    companies => companies.some(company => company.OrganizationNumber === orgNr)
                        ? reject()
                        : resolve(),
                    err => this.errorService.handle(err),
                )
            } else {
                resolve();
            }
        })
            .then(() =>
                this.createCompany(this.formData.companyName, this.formData.companySettings)
                    .finally(() => this.busy = false)
                    .subscribe(
                        company => {
                            this.onClose.emit(company);
                            this.toastService.addToast(
                                `Selskap ${company.Name} opprettet`,
                                ToastType.good,
                                ToastTime.medium,
                            );
                        },
                        err => {
                            if (err.status === 403) {
                                this.toastService.addToast(
                                    'Du har ikke tilgang til å opprette nye selskaper',
                                    ToastType.bad,
                                    ToastTime.long,
                                );
                            } else {
                                this.errorService.handle(err);
                            }
                        }
                    )
            )
            .catch(() => {
                this.busy = false;
                this.toastService.addToast(
                    `Du har allerede et selskap med Org.nr ${orgNr}`,
                    ToastType.bad,
                    ToastTime.long,
                )
            })

    }

    public cancel() {
        this.onClose.emit()
    }

    private createCompany(name: string, companySettings: CompanySettings): Observable<Company> {
        return this.uniHttp
            .asPUT()
            .withEndPoint('companies?action=create-company')
            .withBody({
                CompanyName : name,
                CompanySettings: companySettings,
            })
            .send()
            .map(response => response.json());
    }
}
