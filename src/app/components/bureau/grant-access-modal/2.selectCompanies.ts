import {Component, Output, EventEmitter, Input, SimpleChanges} from '@angular/core';
import {ElsaContractService} from '@app/services/elsa/elsaContractService';
import {ElsaCompanyLicense} from '@app/services/elsa/elsaModels';
import {ErrorService} from '@app/services/common/errorService';
import {GrantAccessData} from '@app/components/bureau/grant-access-modal/grant-access-modal';

@Component({
    selector: 'select-companies-for-bulk-access',
    templateUrl: './2.selectCompanies.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class SelectCompaniesForBulkAccess {
    @Output()
    public next: EventEmitter<void> = new EventEmitter<void>();
    @Input()
    data: GrantAccessData;

    warning: string;
    companyLicenses: ElsaCompanyLicense[];

    constructor(
        private elsaContractService: ElsaContractService,
        private errorService: ErrorService,
    ) {}

    ngOnInit() {
        this.elsaContractService.GetCompanyLicenses(this.data.contract.id)
            .map(companyLicenses => this.reSelectCompanies(companyLicenses))
            .subscribe(
                companyLicenses => this.companyLicenses = companyLicenses,
                err => this.errorService.handle(err),
            )
    }

    isAllSelected() {
        return this.companyLicenses && this.companyLicenses.every(c => !!c['_selected'])
    }

    toggleEverything(target: HTMLInputElement) {
        this.companyLicenses.forEach(c => c['_selected'] = target.checked);
    }

    done() {
        const selectedCompanies = this.companyLicenses.filter(c => !!c['_selected']);
        if (selectedCompanies.length === 0) {
            this.warning = 'Du må velge minst ett selskap!';
            return;
        }
        this.data.companies = selectedCompanies;
        this.next.emit();
    }

    private reSelectCompanies(newCompanies: ElsaCompanyLicense[]): ElsaCompanyLicense[] {
        if (this.data.companies) {
            newCompanies.forEach(newCompany => {
                if (this.data.companies.some(selectedCompany => selectedCompany.id === newCompany.id)) {
                    newCompany['_selected'] = true;
                }
            });
        }
        return newCompanies;
    }
}
