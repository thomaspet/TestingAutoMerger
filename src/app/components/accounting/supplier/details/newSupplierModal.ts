import {Component, Output, Input, EventEmitter, ViewChild} from '@angular/core';
import {Supplier} from '../../../../unientities';
import {SupplierDetails} from '../../supplier/details/supplierDetails';
import {IUniModal, IModalOptions} from './../../../../../framework/uni-modal';
import {ErrorService} from '../../../../services/services';

@Component({
    selector: 'uni-new-supplier-modal',
    template: `
        <section role ="dialog" class="uni-modal large">
            <header>Ny leverandør</header>

            <article class="modal-content">
                <supplier-details
                    [modalMode]="true">
                </supplier-details>
            </article>

            <footer>
                <button class="good" (click)="close(true)">Lagre</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniNewSupplierModal implements IUniModal {
    @ViewChild(SupplierDetails)
    private supplierDetails: SupplierDetails;

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<Supplier> = new EventEmitter();

    constructor(private errorService: ErrorService) {}

    public ngOnInit() {
        this.supplierDetails.openInModalMode(0, this.options.data);
    }

    public close(emitValue: boolean) {
        if (emitValue) {
            this.supplierDetails.saveSupplier()
                .subscribe(
                    res => this.onClose.emit(res),
                    err => this.errorService.handle(err)
                );
        } else {
            this.onClose.emit(null);
        }
    }
}
