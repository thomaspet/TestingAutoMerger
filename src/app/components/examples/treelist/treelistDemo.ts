import {Component, OnInit} from '@angular/core';
import {TreeList, TreeListItem, TREE_LIST_TYPE} from '../../../../framework/treeList';
import {UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';

@Component({
    selector: 'uni-treelist-demo', 
    template: `
        <h4>Treelist demo</h4>
        <uni-tree-list [treeListItems]="treeListItems"></uni-tree-list>    
    `,
    directives: [TreeList]
})
export class UniTreelistDemo {
    treeListItems: any;
    
    constructor() {}
    
    ngOnInit() {
        var tableConfig = this.createTableConfig();
        console.log(tableConfig);
        
        // Create a few list items
        var item1 = new TreeListItem('Item 1')
            .setType(TREE_LIST_TYPE.TEXT)
            .setContent('HELLO WORLD');
         
        var item2 = new TreeListItem('Item 2')
            .setType(TREE_LIST_TYPE.TABLE)
            .setContent(tableConfig);
        
        var item3 = new TreeListItem('Item 3')
            .setType(TREE_LIST_TYPE.LIST)
            .addTreeListItems([new TreeListItem('Subitem 1'), new TreeListItem('SubItem 2')])
        
        // Create a "main item" that holds the items we created above
        var mainItem = new TreeListItem('Treelist')
            .setType(TREE_LIST_TYPE.LIST)
            .addTreeListItems([item1, item2, item3])
        
        this.treeListItems = [mainItem];
    }
    
    createTableConfig(): any {
        var data = [
            {ID: 1, Name: 'Vare 1', Price: 10},
            {ID: 2, Name: 'Vare 2', Price: 20},
            {ID: 3, Name: 'Vare 3', Price: 30},
            {ID: 4, Name: 'Vare 4', Price: 40},
            {ID: 5, Name: 'Vare 5', Price: 50},
            {ID: 6, Name: 'Vare 6', Price: 60},
        ];
        
        var idCol = new UniTableColumn('ID', 'Produktnummer', 'number')
        .setEditable(false)
        .setNullable(true);
        
        var nameCol = new UniTableColumn('Name', 'Produktnavn', 'string');
        var priceCol = new UniTableColumn('Price', 'Pris', 'number');
        
        return new UniTableBuilder(data, true)
        .setPageSize(5)
        .addColumns(idCol, nameCol, priceCol)
        .setUpdateCallback((updatedItem) => {
            console.log('Updated:');
            console.log(updatedItem);
        })
        .setCreateCallback((createdItem) => {
            console.log('Created:');
            console.log(createdItem);
        })
        .setDeleteCallback((deletedItem) => {
            console.log('Deleted:');
            console.log(deletedItem);
        });
    }
}