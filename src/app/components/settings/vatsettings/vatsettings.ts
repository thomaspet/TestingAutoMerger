import {Component, ViewChild} from '@angular/core';
import {VatTypeList} from './vattypeList/vatTypeList';
import {VatTypeDetails} from './vattypedetails/vattypedetails';
import {VatType} from '../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';

@Component({
    selector: 'vat-settings',
    templateUrl: 'app/components/settings/vatSettings/vatSettings.html',
    directives: [VatTypeList, VatTypeDetails, UniSave]
})
export class VatSettings {
    @ViewChild(VatTypeList) private vatTypeList: VatTypeList;
    @ViewChild(VatTypeDetails) private vatTypeDetails: VatTypeDetails;

    private vatType: VatType;
    private hasChanges: boolean = false;
    
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (event) => this.saveSettings(event),
            main: true,
            disabled: false
        }
    ];

    public changeVatType(vatType) {
        
        setTimeout(() => {
            let doChange: boolean = true;
            
            if (this.hasChanges) {
                if (!confirm('Du har gjort endringer som ikke er lagret, trykk avbryt hvis du vil lagre først!')) {
                    doChange = false;
                }
            }
            
            if (doChange) {
                this.vatType = vatType;
                this.hasChanges = false;
            }
        });
    }
    
    private vatTypeSaved(vatType: VatType) {
        this.vatTypeList.refresh();
        this.hasChanges = false;
    }
    
    private change(vatType: VatType) {
        this.hasChanges = true;
    }
    
    private saveSettings(event) {
        this.vatTypeDetails.saveVatType();        
    }
}

    