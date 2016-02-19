import {Component} from 'angular2/core';
import {VatTypeList} from './vattypeList/vatTypeList';
import {VatTypeDetails} from './vattypedetails/vattypedetails';
import {UniHttpService} from '../../../../framework/data/uniHttpService';

@Component({
    selector: 'vat-settings',
    templateUrl: 'app/components/settings/vatSettings/vatSettings.html',
    directives: [VatTypeList, VatTypeDetails]
})
export class VatSettings {
    
}
    