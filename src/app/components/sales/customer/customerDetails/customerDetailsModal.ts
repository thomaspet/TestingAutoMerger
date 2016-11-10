import {Component, Output, EventEmitter, ViewChild} from '@angular/core';
import {Customer} from '../../../../unientities';
import {CustomerDetails} from './customerDetails';

@Component({
    selector: 'customer-details-modal',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">
            <button (click)="close()" class="closeBtn"></button>
            <article class="modal-content">
                <customer-details [modalMode]="true" (customerCreated)="onCustomerCreated($event)"></customer-details>
            </article>
        </dialog>
    `
})
export class CustomerDetailsModal {
    @ViewChild(CustomerDetails)
    private customerDetails: CustomerDetails;

    @Output() public newCustomer: EventEmitter<Customer> = new EventEmitter<Customer>();
    @Output() public cancel: EventEmitter<boolean> = new EventEmitter<boolean>();

    public isOpen: boolean = false;
    private keyListener: any;

    constructor() {
        this.keyListener = document.addEventListener('keyup', (event: KeyboardEvent) => {
            const key = event.which || event.keyCode;
            if (key === 27) {
                this.close();
                document.removeEventListener('keydown', this.keyListener);
            }
        });
    }

    public onCustomerCreated(customer: Customer) {
        this.newCustomer.emit(customer);
        this.isOpen = false;
    }

    public open() {
        this.customerDetails.reset();
        this.isOpen = true;
    }

    public close() {
        this.cancel.emit(true);
        this.isOpen = false;
    }
}
