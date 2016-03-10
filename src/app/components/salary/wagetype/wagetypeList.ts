import {Component, OnInit} from 'angular2/core';
import {Router } from 'angular2/router';

import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../framework/uniTable";
import {WageType} from "../../../unientities";

@Component({
    selector: 'wagetypes',       
    templateUrl: 'app/components/salary/wagetype/wagetypeList.html',
    directives: [UniTable]
})
export class WagetypeList implements OnInit{
    
    wagetypelistConfig;
    
    constructor(private _router : Router){

    }
    
    ngOnInit() {
    
    var idCol = new UniTableColumn("ID", "ID", "number");
    idCol.setWidth("10rem");
    
    var nameCol = new UniTableColumn("WageTypeName", "Name", "string");
    
    var descCol = new UniTableColumn("Description", "Description", "string");
    

    this.wagetypelistConfig = new UniTableBuilder("wagetypes", false)            
            .setSelectCallback((selectedWagetype: WageType) => {
                
                this._router.navigateByUrl("/salary/wagetypes/" + selectedWagetype.ID);
            })            
            .addColumns(idCol, nameCol, descCol);
    }
}