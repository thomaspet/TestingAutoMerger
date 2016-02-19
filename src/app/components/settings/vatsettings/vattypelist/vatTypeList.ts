import {Component} from 'angular2/core';
import {IVatType} from '../../../../../framework/interfaces/interfaces';
import {VatTypeService} from '../../../../services/services';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {UNI_CONTROL_TYPES} from '../../../../../framework/controls/types';
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder, UniComboGroupBuilder, UniGroupBuilder} from '../../../../../framework/forms';

@Component({
    selector: 'vattype-list',
    templateUrl: 'app/components/settings/vatSettings/vattypelist/vattypelist.html',
    providers: [VatTypeService]
})
export class VatTypeList {
    
    constructor(private vatTypeService: VatTypeService) {
        
    }
    
    ngOnInit() {
        console.log('vatlist initializing');   
        
        //var vattype = this.vatTypeService.Get(XX);             
    }    
}
    