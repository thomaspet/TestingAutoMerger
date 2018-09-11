import { IUniModal } from '@uni-framework/uni-modal/interfaces';
import { IModalOptions } from '@uni-framework/uni-modal';
import { Input, EventEmitter, Output, Component } from '@angular/core';
import { UniSearchCustomerConfig } from '@app/services/services';
import { IUniSearchConfig } from '../../../../framework/ui/unisearch/index';

@Component({
    selector: 'book-payment-manual-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>Velg kunde manuelt</h1>
            </header>
            <article style="min-height: 12rem;">
                <p>Velg en kunde for betaling</p>
                <uni-search
                    [config]="uniSearchConfig"
                    (changeEvent)="customerSelected($event)"
                    [disabled]="false">
                </uni-search>
            </article>

            <footer>
                <button class="good" [disabled]="!selectedCustomerID" (click)="close(selectedCustomerID)">Bøkfor valgt rad</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class MatchCustomerManualModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public customers: any[];
    public selectedCustomerID: number;
    public uniSearchConfig: IUniSearchConfig;
    private customerExpands: string[] = [
        'Info.Addresses',
        'Info.ShippingAddress',
        'Info.InvoiceAddress',
        'Info.DefaultContact.Info',
        'Info.DefaultEmail',
    ];

    constructor( private uniSearchCustomerConfig: UniSearchCustomerConfig ) { }

    public ngOnInit() {
        this.uniSearchConfig = this.uniSearchCustomerConfig.generateForBank(this.customerExpands);
    }

    public customerSelected(customer) {
        this.selectedCustomerID = customer.ID;
    }

    public close(emitValue: any) {
        this.onClose.emit(emitValue);
    }

}
