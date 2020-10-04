import {Component, Output, EventEmitter, Input} from '@angular/core';
import {ElsaCustomer, ElsaContract} from '@app/models';

@Component({
  selector: 'uni-select-license',
  templateUrl: './select-license.component.html',
  styleUrls: ['./select-license.component.sass'],
})
export class SelectLicenseComponent {
    @Input() customers: ElsaCustomer[];
    @Input() selectedContract: ElsaContract;
    @Output() selectedContractChange = new EventEmitter();

}
