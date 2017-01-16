import {Component, Input, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Dimensions} from '../../../../unientities';

@Component({
    selector: 'dimension-list',
    templateUrl: './dimensionList.html'
})
export class DimensionList {
    @Input() public dimensions: Dimensions;
    @ViewChild(UniTable) private table: UniTable;

    private dimensionsTable: UniTableConfig;
    private data: Array<any> = [];

    constructor() {
    }

    public ngOnInit() {
        let typeCol = new UniTableColumn('Type', 'Type', UniTableColumnType.Text);
        let idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number).setWidth('4rem');
        let nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text);

        this.dimensionsTable = new UniTableConfig(false, false, 25)
            .setColumns([typeCol, idCol, nameCol]);
    }

    public ngOnChanges() {
        this.data = [];

        if (this.dimensions) {
            if (this.dimensions.Project) {
                this.data.push({ID: this.dimensions.ProjectID, Type: 'Prosjekt', Name: this.dimensions.Project.Name});
            }

            if (this.dimensions.Department) {
                this.data.push({
                    ID: this.dimensions.DepartmentID,
                    Type: 'Avdeling',
                    Name: this.dimensions.Department.Name
                });
            }

            if (this.dimensions.Responsible) {
                this.data.push({ID: this.dimensions.ResponsibleID, Type: 'Ansvar', Name: this.dimensions.Responsible.Name});
            }

            if (this.dimensions.Region) {
                this.data.push({ID: this.dimensions.RegionID, Type: 'Region', Name: this.dimensions.Region.Name});
            }
        }
    }
}
