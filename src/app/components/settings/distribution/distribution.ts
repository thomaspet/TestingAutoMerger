import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UniTableColumn, UniTableColumnType, UniTableConfig, UniTable, IUniTableConfig} from '../../../../framework/ui/unitable/index';
import {UniForm, FieldType, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {DistributionPlanService} from '@app/services/common/distributionService';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {DistributionPlan, DistributionPlanElementType} from '../../../unientities';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import {SettingsService} from '../settings-service';
declare const _; // lodash

@Component({
    selector: 'uni-distibution',
    templateUrl: './distribution.html'
})

export class UniDistributionSettings {

    @ViewChild(UniTable)
    public table: UniTable;

    public detailsTableConfig: UniTableConfig;
    public unitableConfig: IUniTableConfig;
    public plans: DistributionPlan[];
    public elements: any = [];
    public currentPriority: number = 0;
    public deletedElements: any = [];
    public plan: BehaviorSubject<any> = new BehaviorSubject({});
    public elementTypes: DistributionPlanElementType[];
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public hasUnsavedChanges: boolean = false;
    public planIndex: number = 0;
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
        private settingsService: SettingsService,
        private route: ActivatedRoute,
        private toastService: ToastService
    ) { }

    public ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.planIndex = params['plan'] || 0;
            this.getDistributionPlans();
        });
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
        const plan = this.plan.getValue();

        if (!plan.Name || plan.Name === ' ') {
            this.toastService.addToast('Ikke lagret', ToastType.bad, 5, 'En plan må ha et navn');
            done('Ikke lagret, navn mangler på plan!');
            return;
        }

        const newTypes = [];

        for (let i = 0; i < this.elementTypes.length; i++) {
            if (plan['pri' + (i + 1)] && plan['pri' + (i + 1)].ID) {
                newTypes.push({
                    ID: 0,
                    _createguid: this.distributionPlanService.getNewGuid(),
                    DistributionPlanElementTypeID: plan['pri' + (i + 1)].ID,
                    ElementType: this.elementTypes.filter(type => type.ID ===  plan['pri' + (i + 1)].ID)[0],
                    Priority: newTypes.length + 1
                });
            }
        }

        plan.Elements = this.elements
            .filter(type => !!type.ID)
            .map(type => { type.Deleted = true; return type; })
            .concat(newTypes);

        this.distributionPlanService.saveDistributionPlan(plan).subscribe((savedPlan) => {
            this.hasUnsavedChanges = false;
            this.updateSaveActions();
            this.getDistributionPlans();
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

        this.distributionPlanService.invalidateCache();

        Observable.forkJoin(
            [
                this.distributionPlanService.GetAll(query),
                this.distributionPlanService.getElementTypes()
            ]
        ).subscribe((result) => {
            this.plans = result[0];
            this.elementTypes = result[1];
            this.setUpTable();

            if (this.planIndex > this.plans.length) {
                this.planIndex = 0;
            }

            this.elements = _.cloneDeep(this.plans[this.planIndex].Elements);
            this.plan.next(this.mapDataModelForUniform(this.plans[this.planIndex]));
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

        this.unitableConfig = new UniTableConfig('settings.distribution.planlist', false, true, 15)
            .setSearchable(true)
            .setSortable(false)
            .setColumns([nameCol, statusCol, typeCol])
            .setColumnMenuVisible(false);
    }

    private setUpForm() {
        this.fields$.next([]);
        const plan = this.plan.getValue();
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
            }
        ];

        const filteredElements = this.filterElementTypes(plan.EntityType, this.elementTypes);

        // Dynamically add priority elements
        for (let i = 1; i <= this.elementTypes.length; i++) {
            fields.push(
                {
                    EntityType: 'DistributionPlan',
                    Property: `pri${i}.ID`,
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Prioritet ' + i,
                    Placeholder: '',
                    ReadOnly: i > filteredElements.length,
                    Hidden: i > this.currentPriority,
                    Options: {
                        source: filteredElements,
                        valueProperty: 'ID',
                        debounceTime: 200,
                        displayProperty: 'Name',
                        searchable: false,
                        hideDeleteButton: i === 1
                    }
                }
            );
        }
        this.fields$.next(fields);
    }

    // Filter elementtypes based on what type is set
    private filterElementTypes(type: string, elements: any[]) {
        if (type === 'Models.Sales.CustomerInvoice') {
            return elements;
        } 
        else if (type === 'Models.Sales.CustomerInvoiceReminder') {
            return elements.filter(res => res.ID === 2 || res.ID === 3);
        } else {
            return elements.filter(res => res.ID === 2);
        }
    }

    public onRowSelected(event) {
        // Update local variables and update the form with new plan
        this.planIndex = event.rowModel['_originalIndex'];
        this.elements = _.cloneDeep(event.rowModel.Elements);
        this.plan.next(this.mapDataModelForUniform(event.rowModel));
        this.setUpForm();
    }

    public onFormChange(event) {
        this.hasUnsavedChanges = true;
        this.updateSaveActions();

        let key, value;

        for (const prop in event) {
            if (event.hasOwnProperty(prop)) {
                key = prop;
                value = event[prop];
            }
        }

        // Find the priority changed
        const index = parseInt(key.substr(3, 1), 10);

        // Check to see if selected priority is allowed
        if (key.includes('pri') && value.currentValue) {
            const plan = this.plan.getValue();
            for (let i = 1; i <= this.currentPriority; i++) {

                // An already selected type is selected again
                if (plan['pri' + i].ID === value.currentValue && i !== index) {

                    // If same as first priority and field had no old value to swap, show toast warning
                    // Priority 1 cannot be empty
                    if (i === 1 && !value.previousValue) {
                        this.toastService.addToast('Første prioritet', ToastType.warn, 5,
                        'Dette valget er satt som første prioritet. Du må endre prioritet 1 for å' +
                        ' få sette denne verdien på en lavere prioritet.');
                        plan['pri' + index].ID = 0;

                        // A lower priority is selected and swapped with 0 (Empty)
                    } else if (!value.previousValue) {
                        plan['pri' + i].ID = 0;
                        // Priorities are swapped
                    } else {
                        plan['pri' + i].ID = value.previousValue;
                    }
                    i = 99;
                }
            }
            // Use timeout so the form dont change back after
            setTimeout(() => {
                this.plan.next(plan);
            });
        }
    }

    private mapDataModelForUniform(plan) {
        this.currentPriority = 0;
        const currentPlan: any = plan;
        // Make sure there are at least 3 elements in the array
        const length = currentPlan.Elements.length > 3 ? currentPlan.Elements.length : 3;

        // Set the elementtype-object directly on the planobject to match UniForm buildup
        for (let i = 0; i < length; i++) {
            currentPlan[`pri${i + 1}`] = (currentPlan.Elements[i] && currentPlan.Elements[i].ElementType)
                ? currentPlan.Elements[i].ElementType
                : {ID: 0, Name: ''};
        }

        this.currentPriority = length;

        return currentPlan;
    }

    public addPriority() {

        const fields = this.fields$.getValue();
        const currentPlan: any = this.plan.getValue();

        // Add new PRI-Object to the plan Object
        currentPlan['pri' + (this.currentPriority + 1)] = {ID: 0, Name: ''};
        this.plan.next(currentPlan);
        this.currentPriority++;

        // Find next hidden field and show it
        for (let i = 2; i < fields.length; i++) {
            if (fields[i].Hidden) {
                fields[i].Hidden = false;
                i = 999;
            }
        }
        this.fields$.next(fields);
    }
}
