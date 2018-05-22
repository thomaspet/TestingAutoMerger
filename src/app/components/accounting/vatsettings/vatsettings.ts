import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {Component, ViewChild} from '@angular/core';
import {VatTypeList} from './vattypelist/vatTypeList';
import {VatTypeDetails} from './vattypedetails/vattypedetails';
import {VatType} from '../../../unientities';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';
import {VatDeductionSettings} from './vatdeductions/vatdeductionsettings';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';

@Component({
    selector: 'vat-settings',
    templateUrl: './vatsettings.html'
})
export class VatSettings {
    @ViewChild(VatTypeList) private vatTypeList: VatTypeList;
    @ViewChild(VatTypeDetails) private vatTypeDetails: VatTypeDetails;
    @ViewChild(VatDeductionSettings) private vatDeductionSettings: VatDeductionSettings;

    private vatType: VatType;
    private hasChanges: boolean = false;

    private toolbarconfig: IToolbarConfig;
    private saveactions: IUniSaveAction[];

    public activeTabIndex: number = 0;
    public tabs: IUniTab[] = [
        {name: 'MVA innstillinger'},
        {name: 'Forholdsmessig MVA / fradrag'}
    ];

    constructor(private tabService: TabService) {
        this.tabService.addTab({
            name: 'MVA-innstillinger',
            url: '/accounting/vatsettings',
            moduleID: UniModules.Vatsettings,
            active: true
        });

        this.onTabIndexChange(0);
    }

    public onTabIndexChange(index: number) {
        this.activeTabIndex = index;

        if (index === 0) {
            this.saveactions = [{
                label: 'Lagre innstillinger',
                action: (completeEvent) => this.saveSettings(completeEvent),
                main: true,
                disabled: false
            }];

            this.toolbarconfig = {
                title: 'MVA-innstillinger',
                omitFinalCrumb: true
            };
        } else {
            this.saveactions = [{
                label: 'Lagre',
                action: (completeEvent) => this.saveSettings(completeEvent),
                main: true,
                disabled: false
            }];

            this.toolbarconfig = {
                title: 'Forholdsvis MVA-innstillinger',
                omitFinalCrumb: true
            };
        }
    }

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

    public vatTypeSaved(vatType: VatType) {
        this.vatTypeList.refresh();
        this.hasChanges = false;
    }

    public onChange(vatType: VatType) {
        this.hasChanges = true;
    }

    private saveSettings(completeEvent) {
        if (this.vatTypeDetails) {
            this.vatTypeDetails.saveVatType(completeEvent);
        } else if (this.vatDeductionSettings) {
            this.vatDeductionSettings.saveVatDeductions(completeEvent);
        }
    }
}

