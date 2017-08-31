import {Component, Output, EventEmitter, ViewChild, OnDestroy, Renderer} from '@angular/core';
import {Supplier} from '../../../../unientities';
import {SupplierDetails} from './supplierDetails';
import {KeyCodes} from '../../../../services/common/KeyCodes';

@Component({
    selector: 'supplier-detail-modal',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">
            <button (click)="close()" class="closeBtn"></button>
            <article class="modal-content">
                <supplier-details
                    [modalMode]="true"
                    (createdNewSupplier)="onNewSupplier($event)"
                ></supplier-details>
            </article>
        </dialog>
    `
})
export class SupplierDetailsModal implements OnDestroy {
    public isOpen: boolean = false;

    @Output() public change: EventEmitter<Supplier> = new EventEmitter<Supplier>();
    @Output() public cancel: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild(SupplierDetails) public supplierDetailsView: SupplierDetails;

    private escListener: Function;

    constructor(private renderer: Renderer) {
        this.escListener = renderer.listenGlobal('document', 'keyup', (event: any) => {
            if (event.keyCode === KeyCodes.ESCAPE) {
                this.isOpen = false;
            }
        });
    }

    public onNewSupplier(newSupplier: Supplier) {
        this.change.emit(newSupplier);
        this.isOpen = false;
    }

    public close() {
        this.cancel.emit(true);
        this.isOpen = false;
    }

    public open() {
        this.supplierDetailsView.resetViewToNewSupplierState();
        this.isOpen = true;
    }

    public ngOnDestroy() {
        this.escListener();
    }
}
