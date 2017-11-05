import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {CustomerDetails} from './customerDetails';
import {Customer} from '../../../../unientities';
import {IUniModal, IModalOptions} from '../../../../../framework/uniModal/barrel';

@Component({
    selector: 'customer-details-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 80vw">
            <header><h1>Rediger kunde</h1></header>

            <article>
                <customer-details [modalMode]="true" (customerUpdated)="close($event)"></customer-details>
            </article>

            <footer>
            </footer>
        </section>
    `
})
export class CustomerDetailsModal implements IUniModal {
    @ViewChild(CustomerDetails)
    private customerDetails: CustomerDetails;

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    private keyListener: any;

    constructor() {
        this.keyListener = document.addEventListener('keyup', (event: KeyboardEvent) => {
            const key = event.which || event.keyCode;
            if (key === 27) {
                this.close();
            }
        });
    }

    public ngOnInit() {
        if (this.options) {
            let that = this;
            setTimeout(function() {
                that.customerDetails.openInModalMode(that.options.data.ID);
            });
        }
    }

    public close(customer?: Customer) {
        document.removeEventListener('keydown', this.keyListener);
        this.onClose.emit(customer || null);
    }
}
