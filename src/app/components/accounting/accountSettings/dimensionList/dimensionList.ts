import {Component, Input} from '@angular/core';
import {
    UniTableColumn, UniTableColumnType, UniTableConfig
} from '../../../../../framework/ui/unitable/index';
import {Dimensions} from '../../../../unientities';

@Component({
    selector: 'dimension-list',
    templateUrl: './dimensionList.html'
})
export class DimensionList {
    @Input() public dimensions: Dimensions;

    private dimensionsTable: UniTableConfig;
    private data: Array<any> = [];

    constructor() {
    }

    public ngOnInit() {
        let typeCol = new UniTableColumn('Type', 'Type', UniTableColumnType.Text);
        let idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number).setWidth('4rem');
        let nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text);

        this.dimensionsTable = new UniTableConfig('accounting.accountSettings.dimensionList', false, false, 25)
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
                this.data.push(
                    {ID: this.dimensions.ResponsibleID, Type: 'Ansvar', Name: this.dimensions.Responsible.Name}
                );
            }

            if (this.dimensions.Region) {
                this.data.push({ID: this.dimensions.RegionID, Type: 'Region', Name: this.dimensions.Region.Name});
            }
        }
    }
}
