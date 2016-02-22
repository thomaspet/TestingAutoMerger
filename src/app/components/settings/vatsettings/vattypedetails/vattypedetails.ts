import {Component, Input, ViewChild, ContentChild, ComponentRef} from 'angular2/core';
import {Validators, Control, FormBuilder} from 'angular2/common';
import {Observable} from 'rxjs/Observable';

import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {UNI_CONTROL_TYPES} from '../../../../../framework/controls/types';
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder, UniComboFieldBuilder, UniSectionBuilder} from '../../../../../framework/forms';

import {IVatType, IAccount} from '../../../../../framework/interfaces/interfaces';
import {VatTypeService, AccountService} from '../../../../services/services';

import "rxjs/add/observable/forkjoin";

@Component({
    selector: 'vattype-details',
    templateUrl: 'app/components/settings/vatSettings/vattypedetails/vattypedetails.html',
    directives: [UniForm],
    providers: [VatTypeService, AccountService]
})
export class VatTypeDetails {
    @Input() VatType : IVatType;
    @ViewChild(UniForm) form: UniForm;
    
    config = new UniFormBuilder(); 
    model : IVatType;
    accounts: IAccount[];
   
    constructor(private vatTypeService: VatTypeService, private accountService: AccountService) {
            
    }    
    
    ngOnInit() {
        console.log('vatdetails initializing');
        
        Observable.forkJoin(this.vatTypeService.Get(2),this.accountService.GetAll(null))
        .subscribe(response => {
            var [model,accounts] = response;
            this.model = model;
            this.accounts = accounts;
            this.buildForm();
        });
        /*
        
        //KJETIL EK: Koden under fungerer kun hvis this.accounts har verdi før this.model.
        //Noe med angular lifecycles som er problemet sannsynligvis. Bør vurdere å endre i uniform
        
        this.vatTypeService.Get(2)
            .subscribe(
                data => {
                    this.model = data; 
                    console.log('modell hentet');
                    this.refreshForm();
                },
                error => console.log('error in vatdetails.ngOnInit.vatTypeService.Get: ' + error)
            );    
            
        this.accountService.GetAll(null)    //.delay(1000)
            .subscribe(
                data => {
                    this.accounts = data;    
                    console.log('accounts hentet');            
                    this.refreshForm();            
                }, 
                error => console.log('error in vatdetails.ngOnInit.accountService.GetAll: ' + error)
            )     
          */           
    }  
    
    refreshForm() {
         
        if (this.model && this.accounts) {
            this.buildForm();
        }
    }
    
    onSubmit(value) {        
        if (this.model.ID > 0) {
            this.vatTypeService.Put(this.model.ID, this.model)
                .subscribe(
                    data => this.model = data,
                    error => console.log('error in vatdetails.onSubmit: ' + error)                    
                );              
        } else {
            this.vatTypeService.Post(this.model)
                .subscribe(
                    data => this.model = data,
                    error => console.log('error in vatdetails.onSubmit: ' + error)
                );
        } 
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
            .setModelField('Alias')
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
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DROPDOWN])
            .setKendoOptions({ dataSource: this.accounts, dataValueField: 'ID', dataTextField: 'AccountName' });
            
        var vatAccountIn = new UniFieldBuilder();
        vatAccountIn.setLabel('Inng. konto')
            .setModel(this.model)
            .setModelField('IncomingAccountID')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DROPDOWN])
            .setKendoOptions({ dataSource: this.accounts, dataValueField: 'ID', dataTextField: 'AccountName', filter:'Contains', template: '<span>aaa # :AccountName #aaa</span>' }); 
        
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
        systemSet.addUniElements(vatAvailable, vatLocked, vatVisible);
   
        this.config.addUniElements(vatCode, vatAlias, vatName, vatPercentage, vatDateFrom, vatDateTo, vatAccountOut, vatAccountIn, systemSet); 

    }
}
    