import {Component, Input, ViewChild} from "angular2/core";
import {UniHttp} from "../../../../../framework/core/http";
import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../../framework/uniTable";
import {IDimensions} from "../../../../interfaces";

@Component({
    selector: "dimension-list",
    templateUrl: "app/components/settings/accountSettings/dimensionList/dimensionList.html",
    directives: [UniTable]
})
export class DimensionList {
    @Input()
    dimensions: IDimensions;
    @ViewChild(UniTable)
    table: UniTable;

    tableConfig: any;
    localData = [];

    constructor(private http: UniHttp) {
    }

    ngOnInit() {
        var idCol = new UniTableColumn("ID", "Dimnr", "number");
        var typeCol = new UniTableColumn("Type", "Type", "string");
        var nameCol = new UniTableColumn("Name", "Navn", "string");

        idCol.setWidth("4rem");

        this.tableConfig = new UniTableBuilder(this.localData, false)
            .setPageSize(100)
            .setPageable(false)
            .setSearchable(false)
            .addColumns(idCol, typeCol, nameCol);
    }

    ngOnChanges() {
        var data = [];

        if (this.dimensions) {

            if (this.dimensions.Project != null) {
                data.push({ID: this.dimensions.ProjectID, Type: "Prosjekt", Name: this.dimensions.Project.Name});
            }

            if (this.dimensions.Departement != null) {
                data.push({
                    ID: this.dimensions.DepartementID,
                    Type: "Avdeling",
                    Name: this.dimensions.Departement.Name
                });
            }

            if (this.dimensions.Responsible != null) {
                data.push({ID: this.dimensions.ResponsibleID, Type: "Ansvar", Name: this.dimensions.Responsible.Name});
            }

            if (this.dimensions.Region != null) {
                data.push({ID: this.dimensions.RegionID, Type: "Region", Name: this.dimensions.Region.Name});
            }

            this.localData = data;
        }

        this.localData = data;
        if (this.table != null) {
            this.table.refresh(this.localData);
        }
    }
}
