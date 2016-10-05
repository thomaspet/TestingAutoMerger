import {Component, ViewChild} from '@angular/core';
import {VatTypeList} from './vattypelist/vatTypeList';
import {VatTypeDetails} from './vattypedetails/vattypedetails';
import {VatType} from '../../../unientities';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'vat-settings',
    templateUrl: 'app/components/settings/vatsettings/vatsettings.html'
})
export class VatSettings {
    @ViewChild(VatTypeList) private vatTypeList: VatTypeList;
    @ViewChild(VatTypeDetails) private vatTypeDetails: VatTypeDetails;

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'MVA-innstillinger', url: '/accounting/vatsettings', moduleID: UniModules.Vatsettings, active: true })
    }

    private vatType: VatType;
    private hasChanges: boolean = false;

    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.saveSettings(completeEvent),
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
        }, 100);
    }

    private vatTypeSaved(vatType: VatType) {
        this.vatTypeList.refresh();
        this.hasChanges = false;
    }

    private onChange(vatType: VatType) {
        this.hasChanges = true;
    }

    private saveSettings(completeEvent) {
        this.vatTypeDetails.saveVatType(completeEvent);
    }
}

