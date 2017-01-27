import {Component, Output, EventEmitter, ViewChild} from '@angular/core';
import {CustomerDetails} from './customerDetails';
import {Customer} from '../../../../unientities';

@Component({
    selector: 'customer-details-modal',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">
            <button (click)="close()" class="closeBtn"></button>
            <article class="modal-content" *ngIf="isOpen">
                <customer-details [modalMode]="true" (customerUpdated)="onCustomerUpdated($event)"></customer-details>
            </article>
        </dialog>
    `
})
export class CustomerDetailsModal {
    @ViewChild(CustomerDetails)
    private customerDetails: CustomerDetails;

    @Output() public customerUpdated: EventEmitter<Customer> = new EventEmitter<Customer>();
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

    public onCustomerUpdated(customer: Customer) {
        this.customerUpdated.emit(customer);
        this.isOpen = false;
    }

    public open(customerID: number) {
        this.isOpen = true;
        setTimeout(() => {
            this.customerDetails.openInModalMode(customerID);
        });
    }

    public close() {
        this.cancel.emit(true);
        this.isOpen = false;
    }
}
