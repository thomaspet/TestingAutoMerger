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
import {VatDeductionGroupSetupModal} from './modals/vatDeductionGroupSetupModal';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import { UniModalService } from '@uni-framework/uni-modal';

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

    public toolbarconfig: IToolbarConfig;
    public saveactions: IUniSaveAction[];

    public activeTabIndex: number = 0;
    public tabs: IUniTab[] = [
        {name: 'MVA innstillinger'},
        {name: 'Forholdsmessig MVA / fradrag'}
    ];

    constructor(private tabService: TabService, private modalService: UniModalService, private toastService: ToastService) {
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
            },
            {
                label: 'Administrer grupper',
                action: (completeEvent) => this.showVatDeductionGroups(completeEvent),
                main: false,
                disabled: false
            }];

            this.toolbarconfig = {
                title: 'Forholdsmessig MVA-innstillinger',
                omitFinalCrumb: true
            };
        }
    }

    public showVatDeductionGroups(completeEvent) {
        completeEvent();

        this.modalService.open(VatDeductionGroupSetupModal, {}).onClose
            .subscribe(result => {
                if (result.didSave) {
                    if (this.vatDeductionSettings.isDirty) {
                        this.toastService.addToast(
                            'Ulagrede endringer',
                            ToastType.warn,
                            ToastTime.long,
                            'Du har endringer i tabellen under som ikke er lagret. ' +
                            'Lagre disse endringene for å få inn oppdaterte/nye grupper i "Gruppe" kolonnen'
                        );
                    } else {
                        this.vatDeductionSettings.loadData();
                    }
                }
            });
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

