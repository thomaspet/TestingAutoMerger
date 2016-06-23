import {Component} from '@angular/core';
import {VatTypeList} from './vattypeList/vatTypeList';
import {VatTypeDetails} from './vattypedetails/vattypedetails';
import {VatType} from '../../../unientities';
import {TabService} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'vat-settings',
    templateUrl: 'app/components/settings/vatSettings/vatSettings.html',
    directives: [VatTypeList, VatTypeDetails]
})
export class VatSettings {

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'MVA-instillinger', url: '/accounting/vatsettings', moduleID: 11, active: true })
    }

    vatType: VatType;

    changeVatType(vatType) {
        this.vatType = vatType;
    }
}
    