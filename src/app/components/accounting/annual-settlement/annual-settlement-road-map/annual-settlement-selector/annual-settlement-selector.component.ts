import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'annual-settlement-selector-component',
    templateUrl: './annual-settlement-selector.component.html',
    styleUrls: ['./annual-settlement-selector-component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AnnualSettlementSelectorComponent {
    @Input() annualSettlements;
    @Input() selectedAnnualSettlement;
    @Output() selectAnnualSettlement = new EventEmitter();

    onSelectOption(annualSettlement){
        this.selectAnnualSettlement.emit(annualSettlement);
    }
}
