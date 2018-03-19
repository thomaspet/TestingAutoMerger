import {Component, OnInit, ChangeDetectorRef, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {IUniSaveAction} from '../../../../framework/save/save';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {Project, Department, Region, Responsible} from '../../../unientities';
import {
    CustomDimensionService,
    DimensionSettingsService,
    ProjectService,
    DepartmentService
} from '../../../services/commonServicesModule';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {UniTableConfig, UniTableColumnType, UniTableColumn, IUniTableConfig, UniTable} from '../../../../framework/ui/unitable/index';

@Component({
    selector: 'uni-dimension-view',
    templateUrl: './dimension.html'
})

export class UniDimensionView implements OnInit {

    @ViewChild(UniTable)
    private table: UniTable;

    public currentDimension: any = 5;
    public currentItem;
    public dimensionList: any[];
    public dimensionMetaData;
    public numberKey: string;
    private tableConfig: IUniTableConfig;

    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private model$: BehaviorSubject<any> = new BehaviorSubject(null);

    public saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.save(completeEvent),
            main: true,
            disabled: false
        }
    ];

    public toolbarconfig: IToolbarConfig = {
        title: 'Dimensjoner',
        navigation: {
            add: () => this.add()
        },
        subheads: [ { title: '' } ]
    };

    constructor (
        private tabService: TabService,
        private customDimensionService: CustomDimensionService,
        private dimensionSettingsService: DimensionSettingsService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) { }

    public ngOnInit () {
        // Subscribe to routes to direct link!
        this.route.params.subscribe((param) => {
            this.currentDimension = +param['id'];

            this.tabService.addTab({
                url: '/dimensions/overview/' + this.currentDimension,
                name: 'Dimensjoner',
                active: true,
                moduleID: UniModules.Dimensions
            });

            this.getDimensions();
        });
    }

    // Gets all dimension-types and adds them to local array, then calls getDimensionsList
    public getDimensions() {
        this.dimensionMetaData = this.getDefaultDims();
        this.dimensionSettingsService.GetAll(null).subscribe((res) => {
            res.forEach((dim) => {
                this.dimensionMetaData.push(dim);
            });
            this.fields$.next(this.getDimensionFields());
            this.getDimensionlist().subscribe((dims) => {
                this.dimensionList = dims;
                this.currentItem = dims[0];
                this.model$.next(dims[0]);
                this.setUpListTable(this.numberKey);
                this.cdr.markForCheck();
                this.updateToolbarConfig();
            });
        });
    }

    // Gets a list of specific dimension type based on currentDimension number
    public getDimensionlist() {
        let query;
        if (this.currentDimension >= 5 && this.currentDimension <= 10) {
            query = this.customDimensionService.getCustomDimensionList(this.currentDimension);
            this.numberKey = 'Number';
        } else if (this.currentDimension === 1) {
           this.numberKey = 'ProjectNumber';
            query = this.projectService.GetAll(null);
        } else if (this.currentDimension === 2) {
            this.numberKey = 'DepartmentNumber';
            query = this.departmentService.GetAll(null);
        }
        return query;
    }

    // Sets up the table to show the list of dimensions at the left side of the view
    public setUpListTable(numberKey: string = 'Number', nameKey: string = 'Name') {
        const idCol = new UniTableColumn(numberKey, 'Nr').setWidth('20%');

        const nameCol = new UniTableColumn(nameKey, 'Navn', UniTableColumnType.Text);

        this.tableConfig = new UniTableConfig('dimension.custom', false)
            .setColumns([idCol, nameCol])
            .setSearchable(true);
    }

    public onRowSelected(item) {
        this.model$.next(item.rowModel);
    }

    // Called when dimension type is changed in the dropdown
    public dimChange(item) {
        this.currentDimension = parseInt(item, 10);
        this.fields$.next(this.getDimensionFields());
        this.getDimensionlist().subscribe((dims) => {
            this.dimensionList = dims;
            this.currentItem = dims[0];
            this.model$.next(dims[0]);
            this.setUpListTable(this.numberKey);
            this.cdr.markForCheck();
            this.updateToolbarConfig();
        });
    }

    public add() {
        this.currentItem = this.getNewDimension();
        this.model$.next(this.currentItem);
    }

    public save(done) {
        if (this.checkDimension()) {
            const query = this.getSaveOption().subscribe((res) => {
                done('Lagring vellykket');
                this.currentItem = res;
                this.model$.next(this.currentItem);
                this.getDimensionlist().subscribe((dims) => {
                    this.dimensionList = dims;
                });
            },
            (err) => {
                done('Lagring feilet');
            });
        } else {
            done('Ikke lagret. Sjekk at feltene er fylt ut.');
        }
    }

    public updateToolbarConfig() {
        this.toolbarconfig.subheads[0].title = this.dimensionMetaData.find(item => item.Dimension === this.currentDimension).Label;
    }

    public getDefaultDims() {
        return [
            {
                Label: 'Prosjekt',
                Dimension: 1
            },
            {
                Label: 'Avdeling',
                Dimension: 2
            },
            /*{
                Label: 'Ansvar',
                Dimension: 3
            },
            {
                Label: 'Område',
                Dimension: 4
            },*/
        ];
    }

    private getDimensionFields(): UniFieldLayout[] {
        this.fields$.next([]);
        switch (this.currentDimension) {
            case 1:  // Project
                return [
                    <any>{
                        FieldType: FieldType.NUMERIC,
                        Label: 'Prosjektnummer',
                        Property: 'ProjectNumber',
                        Placeholder: 'Autogenerert hvis blank',
                        FieldSet: 1,
                        Legend: 'Prosjekt',
                        FieldSetColumn: 1
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Navn',
                        Property: 'Name',
                        FieldSet: 1,
                        FieldSetColumn: 2
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Prosjektleder',
                        Property: 'ProjectLeadName',
                        FieldSet: 1,
                        FieldSetColumn: 1
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Beskrivelse',
                        Property: 'Description',
                        FieldSet: 1,
                        FieldSetColumn: 2
                    }
                ];
            case 2: // Department
                return [
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Avdelingsnummer',
                        Property: 'DepartmentNumber',
                        Placeholder: 'Autogenerert hvis blank',
                        Legend: 'Avdeling',
                        FieldSet: 1,
                        FieldSetColumn: 1
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Navn',
                        Property: 'Name',
                        FieldSet: 1,
                        FieldSetColumn: 2
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Avdelingsleder',
                        Property: 'DepartmentManagerName',
                        FieldSet: 1,
                        FieldSetColumn: 1
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Beskrivelse',
                        Property: 'Description',
                        FieldSet: 1,
                        FieldSetColumn: 2
                    }
                ];
            default:
                return [
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Nummer',
                        Property: 'Number',
                        FieldSet: 1,
                        FieldSetColumn: 1,
                        Legend: this.dimensionMetaData.find(item => item.Dimension === this.currentDimension).Label
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Navn',
                        Property: 'Name',
                        FieldSet: 1,
                        FieldSetColumn: 2,
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Beskrivelse',
                        Property: 'Description',
                        FieldSet: 1,
                        FieldSetColumn: 1
                    },
                    <any>{
                        FieldType: FieldType.DATE_TIME_PICKER,
                        Label: 'Opprettet',
                        Property: 'CreatedAt',
                        FieldSet: 1,
                        FieldSetColumn: 2,
                        ReadOnly: true
                    }
                ];
        }
    }

    public checkDimension(): boolean {
        const dim = this.model$.getValue();
        if (!dim) {
            return false;
        }
        switch (this.currentDimension) {
            case 1:
                return true;
            case 2:
                return true;
            default:
                return dim.Number && dim.Name !== '';
        }
    }

    private getNewDimension() {
        switch (this.currentDimension) {
            case 1:
                return {
                    Name: '',
                    ProjectNumber: null,
                    Description: '',
                    ProjectLeadName: ''
                };
            case 2:
                return {
                    Name: '',
                    DepartmentNumber: null,
                    Description: '',
                    DepartmentManagerName: ''
                };
            case 3:
                return {
                    Name: '',
                    ID: null,
                    Description: '',
                    NameOfResponsible: ''
                };
            case 4:
                return {
                    Name: '',
                    ID: null,
                    Description: '',
                    RegionCode: ''
                };
            default:
                return {
                    Name: '',
                    Number: 0,
                    Description: '',
                };
        }
    }

    private getSaveOption() {
        this.currentItem = this.model$.getValue();
        switch (this.currentDimension) {
            case 1:
                if (this.currentItem.ID) {
                    return this.projectService.Put(this.currentItem.ID, this.currentItem);
                } else {
                    return this.projectService.Post(this.currentItem);
                }
            case 2:
                if (this.currentItem.ID) {
                    return this.departmentService.Put(this.currentItem.ID, this.currentItem);
                } else {
                    return this.departmentService.Post(this.currentItem);
                }
            default:
                return this.customDimensionService.saveCustomDimension(this.currentDimension, this.currentItem);
        }
    }
}

