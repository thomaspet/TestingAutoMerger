import {Component, ViewChild} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableConfig, UniTable, IUniTableConfig} from '../../../../framework/ui/unitable/index';
import {UniForm, FieldType, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {DistributionPlanService} from '@app/services/common/distributionService';
import {DistributionPlan, DistributionPlanElementType} from '../../../unientities';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import {SettingsService} from '../settings-service';

@Component({
    selector: 'uni-distibution',
    templateUrl: './distribution.html'
})

export class UniDistributionSettings {

    @ViewChild(UniTable)
    public table: UniTable;

    public unitableConfig: IUniTableConfig;
    public plans: DistributionPlan[];
    public plan: BehaviorSubject<any> = new BehaviorSubject({});
    public elementTypes: DistributionPlanElementType[];
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public hasUnsavedChanges: boolean = false;
    public entityTypes = [
        {
            value: 'Models.Sales.CustomerInvoice',
            label: 'Faktura'
        },
        {
            value: 'Models.Sales.CustomerOrder',
            label: 'Ordre'
        },
        {
            value: 'Models.Sales.CustomerQuote',
            label: 'Tilbud'
        },
        {
            value: 'Models.Sales.CustomerInvoiceReminder',
            label: 'Purring'
        },
        {
            value: 'Models.Salary.PayCheck',
            label: 'Lønnsslipp'
        },
        {
            value: 'Models.Salary.AnnualStatement',
            label: 'Årsregnskap'
        }
    ];

    constructor(
        private distributionPlanService: DistributionPlanService,
        private settingsService: SettingsService
    ) {
        this.getDistributionPlans();
    }

    public updateSaveActions() {
        this.settingsService.setSaveActions([
            {
                label: 'Lagre plan',
                action: (done) => this.save(done),
                main: true,
                disabled: !this.hasUnsavedChanges
            },
            // TODO: Implement new plan
            // {
            //     label: 'Ny plan',
            //     action: (done) => this.newPlan(done),
            //     main: false,
            //     disabled: this.hasUnsavedChanges
            // }
        ]);
    }

    private save(done) {
        const currentPlan = this.plan.getValue();

        currentPlan.Elements[0].DistributionPlanElementTypeID = currentPlan.pri1.ID;

        this.distributionPlanService.saveDistributionPlan(currentPlan).subscribe((savedPlan) => {
            this.plan.next(this.mapDataModelForUniform(savedPlan));
            this.hasUnsavedChanges = false;
            this.updateSaveActions();
            done('Plan lagret');
        });

    }

    private newPlan(done) {
        done('Ikke  klart');
    }


    public getDistributionPlans(searchValue?: string) {
        let query = 'expand=Elements,Elements.ElementType';

        if (searchValue) {
            query += `&filter=contains(Name, '${searchValue}') or contains(EntityType, '${searchValue}')`;
        }

        Observable.forkJoin(
            [
                this.distributionPlanService.GetAll(query),
                this.distributionPlanService.getElementTypes()
            ]
        ).subscribe((result) => {
            this.plans = result[0];
            this.elementTypes = result[1];
            this.setUpTable();
            this.plan.next(this.mapDataModelForUniform(this.plans[0]));
            this.setUpForm();
            this.updateSaveActions();
        }, (err) => {
            console.log(err);
        });
    }

    private setUpTable() {
        const nameCol = new UniTableColumn('Name', 'Navn',  UniTableColumnType.Text)
            .setFilterOperator('contains');

        const statusCol = new UniTableColumn('StatusCode', 'Status',  UniTableColumnType.Text)
            .setFilterable(false).setWidth('15%');

        const typeCol = new UniTableColumn('EntityType', 'Type',  UniTableColumnType.Text)
            .setFilterOperator('contains')
            .setTemplate((item) => {
                if (!item || !item.EntityType) {
                    return '';
                }
                return this.entityTypes.filter(res => res.value === item.EntityType)[0].label;
            });

        // Setup table
        this.unitableConfig = new UniTableConfig('settings.distribution.planlist', false, true, 15)
            .setSearchable(true)
            .setColumns([nameCol, statusCol, typeCol])
            .setColumnMenuVisible(false);
    }

    private setUpForm() {
        this.fields$.next([]);
        const fields: any = [
            {
                EntityType: 'DistributionPlan',
                Property: 'Name',
                FieldType: FieldType.TEXT,
                Label: 'Navn',
                Placeholder: 'Navn på distribusjonsplan'
            },
            {
                EntityType: 'DistributionPlan',
                Property: 'EntityType',
                FieldType: FieldType.DROPDOWN,
                Label: 'Type',
                Placeholder: '',
                ReadOnly: true,
                Options: {
                    source: this.entityTypes,
                    valueProperty: 'value',
                    debounceTime: 200,
                    displayProperty: 'label',
                    searchable: false
                }
            },
            {
                EntityType: 'DistributionPlan',
                Property: `pri1.ID`,
                FieldType: FieldType.DROPDOWN,
                Label: 'Prioritet 1',
                Placeholder: '',
                ReadOnly: true,
                Options: {
                    source: this.elementTypes,
                    valueProperty: 'ID',
                    debounceTime: 200,
                    displayProperty: 'Name',
                    searchable: false,
                    hideDeleteButton: true
                }
            },
            {
                EntityType: 'DistributionPlan',
                Property: `pri2.ID`,
                FieldType: FieldType.DROPDOWN,
                Label: 'Prioritet 2',
                Placeholder: 'Ikke valgt',
                ReadOnly: true,
                Options: {
                    source: this.elementTypes,
                    valueProperty: 'ID',
                    debounceTime: 200,
                    displayProperty: 'Name',
                    searchable: false
                }
            },
            {
                EntityType: 'DistributionPlan',
                Property: `pri3.ID`,
                FieldType: FieldType.DROPDOWN,
                Label: 'Prioritet 3',
                Placeholder: 'Ikke valgt',
                ReadOnly: true,
                Options: {
                    source: this.elementTypes,
                    valueProperty: 'ID',
                    debounceTime: 200,
                    displayProperty: 'Name',
                    searchable: false
                }
            }
        ];
        this.fields$.next(fields);
    }

    public onRowSelected(event) {
        this.plan.next(this.mapDataModelForUniform(event.rowModel));
        this.setUpForm();
    }

    public onFormChange(event) {
        this.hasUnsavedChanges = true;
        this.updateSaveActions();
        // TODO: Check for legal updates.. Not allow EHF on quote plan!
    }

    private mapDataModelForUniform(plan) {
        const currentPlan: any = plan;
        const elems = plan.Elements.length;

        for (let index = 0; index < 3 - elems; index++) {
            currentPlan.Elements.push({
                ID: 0,
                _createguid: this.distributionPlanService.getNewGuid(),
                DistributionPlanElementTypeID: 0
            });
        }

        currentPlan.pri1 = currentPlan.Elements[0].ID ? currentPlan.Elements[0].ElementType : {ID: 0, Name: ''};
        currentPlan.pri2 = currentPlan.Elements[1].ID ? currentPlan.Elements[1].ElementType : {ID: 0, Name: ''};
        currentPlan.pri3 = currentPlan.Elements[2].ID ? currentPlan.Elements[2].ElementType : {ID: 0, Name: ''};
        return currentPlan;
    }

}
