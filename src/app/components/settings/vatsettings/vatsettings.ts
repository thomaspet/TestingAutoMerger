import {Component} from '@angular/core';
import {VatTypeList} from './vattypeList/vatTypeList';
import {VatTypeDetails} from './vattypedetails/vattypedetails';
import {VatType} from '../../../unientities';

@Component({
    selector: 'vat-settings',
    templateUrl: 'app/components/settings/vatSettings/vatSettings.html',
    directives: [VatTypeList, VatTypeDetails]
})
export class VatSettings {

    vatType: VatType;

    changeVatType(vatType) {
        this.vatType = vatType;
    }
}
    