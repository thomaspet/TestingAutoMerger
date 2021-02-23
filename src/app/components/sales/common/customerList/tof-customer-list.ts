import {Component, Input, Output, EventEmitter} from '@angular/core';
import { MultipleCustomerSelection } from '@app/components/common/modals/selectCustomersModal';


@Component({
    selector: 'tof-customer-list',
    template: `
    <section class="info">
        <p >
            <span>{{ entityNames }}</span>
            <button (click)="editCustomerList.emit()" class="tertiary c2a">
                Åpne liste
            </button>
        </p>
        Oppretter totalt {{entities?.length}} faktura{{entities?.length > 1 ? "er" : ""}} 
    </section>
    `,
    styleUrls: ["./tof-customer-list.sass"]
})
export class TofCustomerList {
    @Input() entities: MultipleCustomerSelection[];
    @Output() editCustomerList: EventEmitter<any> = new EventEmitter();

    entityNames: string;

    public ngOnInit() {
        this.entityNames = this.entities?.map(e => e.Name)?.join(", ");
    }

    public ngOnChanges() {
        if (this.entities) {
            this.entityNames = this.entities?.map(e => e.Name)?.join(", ");
        }
    }
}
