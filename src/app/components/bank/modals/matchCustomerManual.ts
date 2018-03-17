import { IUniModal } from '@uni-framework/uniModal/interfaces';
import { IModalOptions } from '@uni-framework/uniModal/barrel';
import { Input, EventEmitter, Output, Component } from '@angular/core';
import { CustomerService } from '@app/services/services';

@Component({
    selector: 'book-payment-manual-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>Valg kunde manuelt</h1>
            </header>
            <article>
                <p>Valg enn kunde for betaling</p>
                <label>Kunde:
                    <select style='width:300px'
                        [(ngModel)]="selectedCustomerID">
                        <option></option>
                        <option *ngFor="let customer of customers"
                            [value]="customer.ID">
                            ({{customer.CustomerNumber}}) {{customer.Info.Name}}
                        </option>
                    </select>
                </label>
            </article>

            <footer>
                <button class="good" [disabled]="!selectedCustomerID" (click)="close(true)">Bøkfor valgt rad</button>
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

    private customers: any[];
    private selectedCustomerID: number;

    constructor(
        private customerService: CustomerService,
    ) { }

    public ngOnInit() {
        this.customerService.GetAll(null, ['Info']).subscribe(data => this.customers = data);
    }

    public onCustomerFilterChange(event) {

    }

    public close(emitValue?: boolean) {
        let value: any;
        if (emitValue) {
            value = this.selectedCustomerID;
        }

        this.onClose.emit(value);
    }

}
