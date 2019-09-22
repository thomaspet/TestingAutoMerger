import { Component, EventEmitter, OnInit } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal/interfaces';
import { ErrorService, CompanyService } from '@app/services/services';
import { ElsaCompanyLicense } from '@app/models';

@Component({
    selector: 'uni-delete-company-modal',
    templateUrl: './delete-company-modal.html',
})
export class DeleteCompanyModal implements IUniModal, OnInit {
    options: IModalOptions = {};
    onClose: EventEmitter<boolean> = new EventEmitter();
    company: ElsaCompanyLicense;
    data: any;
    busy: boolean;
    validatorInput: number;
    validatorNumber: number;

    constructor(
        private errorService: ErrorService,
        private companyService: CompanyService,
    ) { }

    ngOnInit() {
        this.data = this.options.data || {};
        this.company = this.options.data || {};
        this.validatorNumber = Math.floor(1000 + Math.random() * 8999);
    }

    deleteCompany() {
        this.busy = true;
        this.companyService.deleteCompany(this.data.company.CompanyKey).subscribe(
            () => {
                this.busy = false;
                this.onClose.emit(true);
            },
            err => {
                this.busy = false;
                this.onClose.emit(false);
                this.errorService.handle(err);
            }
        );
    }
}
