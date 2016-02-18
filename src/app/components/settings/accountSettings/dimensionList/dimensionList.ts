import {Component, Input, ViewChild} from 'angular2/core';
import {UniHttpService} from '../../../../../framework/data/uniHttpService';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';

@Component({
    selector: 'dimension-list',
    templateUrl: 'app/components/settings/accountSettings/dimensionList/dimensionList.html',
    directives: [UniTable]
})
export class DimensionList {
    @Input() dimensions;
    @ViewChild(UniTable) table: UniTable;
    tableConfig;
    localData = [];
    
    constructor(private http:UniHttpService) {       
        var idCol = new UniTableColumn('ID', 'Dimnr', 'number')
        var typeCol = new UniTableColumn('Type', 'Type', 'string');
        var nameCol = new UniTableColumn('Name', 'Navn', 'string');
        
        idCol.setWidth("4rem");
        
        this.tableConfig = new UniTableBuilder(this.localData, false)
        .setPageSize(5)
        .setSearchable(false)
        .addColumns(idCol, typeCol, nameCol);
    }
    
    ngOnChanges() {
        var data = [];
 
        if (this.dimensions) {
            
            if (this.dimensions.Project != null) {
                data.push({ID: this.dimensions.ProjectID, Type: 'Prosjekt', Name: this.dimensions.Project.Name});
            }
            
            if (this.dimensions.Department != null) {
                data.push({ID: this.dimensions.DepartementID, Type: 'Avdeling', Name: this.dimensions.Departement.Name});
            }
            
            if (this.dimensions.Responsible != null) {
                data.push({ID: this.dimensions.ResponsibleID, Type: 'Ansvar', Name: this.dimensions.Responsible.Name});
            }
            
            if (this.dimensions.Region != null) {
                data.push({ID: this.dimensions.RegionID, Type: 'Region', Name: this.dimensions.Region.Name});
            }
            
            this.localData = data;   
        }
        
        this.localData = data;
        if (this.table != null) {
            this.table.refresh(this.localData);        
        }
    }
}