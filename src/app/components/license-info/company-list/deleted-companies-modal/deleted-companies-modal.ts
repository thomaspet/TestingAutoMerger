import {Component, EventEmitter, OnInit} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {ErrorService, ElsaContractService, CompanyService} from '@app/services/services';
import {ElsaCompanyLicense} from '@app/models';
import {ListViewColumn} from '../../list-view/list-view';


@Component({
    selector: 'deleted-companies-modal',
    templateUrl: './deleted-companies-modal.html',
})
export class DeletedCompaniesModal implements IUniModal, OnInit {
    options: IModalOptions = {};
    onClose: EventEmitter<boolean> = new EventEmitter();
    deletedCompanies: ElsaCompanyLicense[];
    data: any;
    busy: boolean;
    companyRevived = false;
    columns: ListViewColumn[] = [
        {
            header: 'Selskapsnavn',
            field: 'CompanyName'
        },
        {
            header: 'Organisasjonsnummer',
            field: 'OrgNumber'
        },
        {
            header: 'Slettet dato',
            field: 'UpdatedAt'
        },
        {
            header: 'Slettet av',
            field: 'UpdatedByEmail'
        },
    ];
    contextMenu = [
        {
            label: 'Gjenopprett',
            action: (company: ElsaCompanyLicense) => {
                this.busy = true;
                this.companyService.restoreCompany(company.CompanyKey).subscribe(
                    () => {
                        this.fetchDeletedCompanies();
                        this.companyRevived = true;
                    },
                    err => {
                        this.errorService.handle(err);
                        this.busy = false;
                    }
                );
            }
        }
    ];

    constructor(
        private elsaContractService: ElsaContractService,
        private errorService: ErrorService,
        private companyService: CompanyService,
    ) { }

    ngOnInit() {
        this.data = this.options.data || {};
        this.fetchDeletedCompanies();
    }

    forceCloseValueResolver() {
        return this.companyRevived;
    }

    fetchDeletedCompanies() {
        this.elsaContractService.getDeletedCompanyLicenses(this.data.contractID).subscribe(
            companies => {
                this.deletedCompanies = companies;
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
            }
        );
    }
}
