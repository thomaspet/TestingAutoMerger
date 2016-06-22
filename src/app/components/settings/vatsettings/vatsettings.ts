import {Component, ViewChild} from '@angular/core';
import {VatTypeList} from './vattypeList/vatTypeList';
import {VatTypeDetails} from './vattypedetails/vattypedetails';
import {VatType} from '../../../unientities';

@Component({
    selector: 'vat-settings',
    templateUrl: 'app/components/settings/vatSettings/vatSettings.html',
    directives: [VatTypeList, VatTypeDetails]
})
export class VatSettings {
    @ViewChild(VatTypeList) private vatTypeList: VatTypeList;

    private vatType: VatType;

    public changeVatType(vatType) {
        this.vatType = vatType;
    }
    
    private vatTypeSaved(vatType: VatType) {
        this.vatTypeList.refresh();
    }
}

    