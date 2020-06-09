import {Component, Input, SimpleChanges} from '@angular/core';
import {of} from 'rxjs';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {FieldType} from '@uni-framework/ui/uniform';
import {Account, Asset} from '@uni-entities';
import {AssetDetailFormConfigBuilder} from '@app/components/accounting/assets/asset-detail/asset-detail-form-config-builder';

@Component({
    selector: 'depreciation-form',
    templateUrl: './depreciation-form.html'
})
export class DepreciationFormComponent {
    @Input() asset: Asset;
    @Input() supplierInvoiceID: number;

    fieldsConfig = [];
    projects = null;
    departments = null;
    constructor(
        private assetsFormService: AssetDetailFormConfigBuilder,
        private actions: AssetsActions
    ) {
    }

    ngOnChanges() {
        if (this.asset) {
            this.getProjectsAndDepartments().subscribe(([projects, departments]) => {
                this.fieldsConfig = this.buildFieldsConfig(projects, departments, this.asset);
            });

        }
    }

    onChangeEvent(changes: SimpleChanges) {
        this.actions.markAssetAsDirty();
        this.actions.updateCurrentAssetFromChanges(changes);
    }

    getProjectsAndDepartments() {
        if (this.projects && this.departments) {
            return of([this.projects, this.departments]);
        } else {
            return this.assetsFormService.getProjectsAndDepartments();
        }
    }

    buildFieldsConfig(projects, departments, asset) {
        return [
            {
                Property: 'DepreciationAccount',
                Label: 'Avskrivningskonto',
                FieldType: FieldType.AUTOCOMPLETE,
                Options: {
                    search: (args) => this.assetsFormService.accountSearch(args),
                    template: (account: Account) => account ? `${account.AccountNumber} ${account.AccountName }` : '',
                    valueProperty: 'AccountNumber',
                    getDefaultData: (() => {
                        if (!this.asset?.DepreciationAccountID) {
                            return of([]);
                        }
                        return this.assetsFormService.getAccount(this.asset?.DepreciationAccountID)
                    })
                }
            },
            {
                Property: 'NetFinancialValue',
                Label: 'Inngående regnskapsmessig verdi',
                FieldType: FieldType.NUMERIC,
                Tooltip: {
                    Text:   'Denne verdien skal være lik kjøpspris om du registrerer en ny eiendel. Dersom du har lagt over saldo' +
                            ' fra et annet regnskapsprogram, er det verdi på eiendelen i balansen som skal legges inn ' +
                            '(Kjøpspris fratrukket tidligere avskrivninger og evt nedskrivninger)'
                },
                ReadOnly: this.asset.ID || this.supplierInvoiceID,
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            {
                Property: 'ScrapValue',
                Label: 'Utrangeringsverdi',
                FieldType: FieldType.NUMERIC,
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            {
                Property: 'Dimensions.ProjectID',
                Label: 'Prosjekt',
                FieldType: FieldType.AUTOCOMPLETE,
                Placeholder: 'Projekt',
                Options: {
                    source: projects,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
                    },
                    debounceTime: 200,
                    getDefaultData: () => {
                        if (asset?.Dimensions?.ProjectID) {
                            return of([projects.find(p => p.ID === asset.Dimensions.ProjectID)]);
                        }
                        return this.assetsFormService.getProjectFromDimensionID(this.asset.DimensionsID, projects);
                    }
                }
            },
            {
                Property: 'Dimensions.DepartmentID',
                Label: 'Avdeling',
                FieldType: FieldType.AUTOCOMPLETE,
                Placeholder: 'Avdeling',
                Options: {
                    source: departments,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
                    },
                    debounceTime: 200,
                    getDefaultData: () => {
                        if (asset?.Dimensions?.DepartmentID) {
                            return of([departments.find(p => p.ID === asset.Dimensions.DepartmentID)]);
                        }
                        return this.assetsFormService.getDepartmentFromDimensionID(this.asset.DimensionsID, departments);
                    }
                }
            }
        ];
    }
}
