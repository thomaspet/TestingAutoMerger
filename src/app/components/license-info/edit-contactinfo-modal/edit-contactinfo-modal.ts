import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import { ElsaCustomersService, ErrorService } from '@app/services/services';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'edit-contactinfo-modal',
    templateUrl: './edit-contactinfo-modal.html',
    styleUrls: ['./edit-contactinfo-modal.sass']
})
export class EditContactInfoModal implements IUniModal {
    onClose = new EventEmitter();
    options: IModalOptions = {};
    customerID: number;

    form = new FormGroup({
        ContactPerson: new FormControl('', Validators.required),
        ContactEmail: new FormControl('', Validators.required),
        ContactPhone: new FormControl('', Validators.required),
    });

    constructor(
        private elsaCustomersService: ElsaCustomersService,
        private errorService: ErrorService,
    ) {}

    ngOnInit() {
        const customer = this.options.data.customer;
        this.customerID = customer.ID;
        this.form.patchValue({
            ContactPerson: customer.ContactPerson,
            ContactEmail: customer.ContactEmail,
            ContactPhone: customer.ContactPhone
        });
    }

    saveContactInfo() {
        if (!this.form.valid) {
            return;
        }
        const contactInfo = this.form.value;
        this.elsaCustomersService.editCustomerContactInfo(this.customerID, contactInfo).subscribe(
            () => this.onClose.emit(true),
            err => this.errorService.handle(err)
        );
    }
}
