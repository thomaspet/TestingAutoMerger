import {Component, Input} from 'angular2/core';
//import {Validators, Control, FormBuilder} from 'angular2/common';
//import {Observable} from 'rxjs/Observable';
//import {UniHttpService} from '../../../../../framework/data/uniHttpService';

import {IVatType} from '../../../../../framework/interfaces/interfaces';
import {VatTypeService} from '../../../../services/services';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {UNI_CONTROL_TYPES} from '../../../../../framework/controls/types';
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder, UniComboGroupBuilder, UniGroupBuilder} from '../../../../../framework/forms';


//KE: Burde ikke dette være mulig?
//import {UNIFORM_COMPONENTS} from '../../../../../framework/forms';

@Component({
    selector: 'vattype-details',
    templateUrl: 'app/components/settings/vatSettings/vattypedetails/vattypedetails.html',
    directives: [UniForm],
    providers: [VatTypeService]
})
export class VatTypeDetails {
    @Input() VatType : IVatType;
    
    config = new UniFormBuilder();
    private model : IVatType;
    
    constructor(private vatTypeService: VatTypeService) {
        
    }    
    
    ngOnInit() {
        console.log('vatdetails initializing');
        this.model = this.VatType;
        this.buildForm();
    }  
    
    onSubmit(value) {
        console.log('vatdetails onsubmit - NOT IMPLEMENTED. Model: ', this.model);
       // this.vatTypeService.Post(this.model.ID, this.Model);               
    }
    
    buildForm() {        
        var vatCode = new UniFieldBuilder();
        vatCode.setLabel('MVA kode.')
            .setModel(this.model)
            .setModelField('VatCode')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT])
                                         
        var vatAlias = new UniFieldBuilder();
        vatAlias.setLabel('Alias')
            .setModel(this.model)
            .setModelField('VatCodeRelation.Alias[0].Name')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT]);
        
        var vatName = new UniFieldBuilder();
        vatName.setLabel('Navn')
            .setModel(this.model)
            .setModelField('Name')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT])

        var vatPercentage = new UniFieldBuilder();
        vatPercentage.setLabel('Sats (prosent)')
            .setModel(this.model)
            .setModelField('VatPercent')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.NUMERIC])

        var vatDateFrom = new UniFieldBuilder();
        vatDateFrom.setLabel('Dato fra')
            .setModel(this.model)
            .setModelField('ValidFrom')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DATEPICKER])

        var vatDateTo = new UniFieldBuilder();
        vatDateTo.setLabel('Dato til')
            .setModel(this.model)
            .setModelField('ValidTo')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DATEPICKER])
                        
        var vatAccountOut = new UniFieldBuilder();
        vatAccountOut.setLabel('Utg. konto')
            .setModel(this.model)
            .setModelField('OutgoingAccountID')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DROPDOWN]);
            //.setKendoOptions({ dataSource: this.currencies, dataValueField: 'ID', dataTextField: 'Code' })
            
        var vatAccountIn = new UniFieldBuilder();
        vatAccountIn.setLabel('Inng. konto')
            .setModel(this.model)
            .setModelField('IncomingAccountID')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DROPDOWN]);
            //.setKendoOptions({ dataSource: this.currencies, dataValueField: 'ID', dataTextField: 'Code' })
        
        var vatAvailable = new UniFieldBuilder();
        vatAvailable.setDescription('Tilgjengelig i moduler')
            .setModel(this.model)
            .setModelField('AvailableInModules')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);      
                     
            
        var vatLocked = new UniFieldBuilder();
        vatLocked.setDescription('Sperret')
            .setModel(this.model)
            .setModelField('Locked')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);      
                   
        var vatVisible = new UniFieldBuilder();
        vatVisible.setDescription('Synlig')
            .setModel(this.model)
            .setModelField('Visible')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);      
        
        var systemSet = new UniFieldsetBuilder();
        systemSet.addFields(vatAvailable, vatLocked, vatVisible);
   
        this.config.addFields(vatCode, vatAlias, vatName, vatPercentage, vatDateFrom, vatDateTo, vatAccountOut, vatAccountIn, systemSet); 

    }
              
   
}
    