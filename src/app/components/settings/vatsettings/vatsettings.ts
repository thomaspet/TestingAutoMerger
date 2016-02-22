import {Component} from 'angular2/core';
import {VatTypeList} from './vattypeList/vatTypeList';
import {VatTypeDetails} from './vattypedetails/vattypedetails';

@Component({
    selector: 'vat-settings',
    templateUrl: 'app/components/settings/vatSettings/vatSettings.html',
    directives: [VatTypeList, VatTypeDetails]
})
export class VatSettings {
    
}
    