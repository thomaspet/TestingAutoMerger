import {Component, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {CompanyService, ErrorService} from '@app/services/services';

@Component({
    selector: 'delete-company-modal',
    templateUrl: './delete-company-modal.html',
})
export class DeleteCompanyModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<boolean> = new EventEmitter();
    busy: boolean;

    constructor(
        private companyService: CompanyService,
        private errorService: ErrorService
    ) {}

    deleteCompany() {
        this.busy = true;

        const company = this.options.data || {};
        this.companyService.deleteCompany(company.ID, company.Key).subscribe(
            () => this.onClose.emit(true),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }
}
