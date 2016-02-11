import {Component, Input, AfterViewInit, ElementRef, OnDestroy} from 'angular2/core';
import {UniHttpService, UniHttpRequest} from '../data/uniHttpService';

declare var jQuery;

enum DIRECTIONS { LEFT, RIGHT, UP, DOWN };

@Component({
	selector: 'uni-table',
	templateUrl: 'framework/uniTable/uniTable.html',
})
export class UniTable2 implements AfterViewInit {	
	@Input() config;
    
	tableConfig: kendo.ui.GridOptions = {};
	filterString: string = "";
    totalRows: number; // used for pagination
    
    nativeElement: any;
    table: kendo.ui.Grid;
      
	
	constructor(private uniHttp: UniHttpService, elementRef: ElementRef) {
        this.nativeElement = jQuery(elementRef.nativeElement);
    }

	ngAfterViewInit() {
                
		// Create kendo options from the config
		this.tableConfig = {
			dataSource: {
                // pageSize: this.config.pageSize || 10,
                schema: {
                    model: this.config.schemaModel,
                    total: (response) => {
                        return this.totalRows;
                    }
                }
            },
			columns: this.config.columns,
			filterable: this.config.filterable,
            editable: this.config.editable,
            // TODO: Fix
            pageable: {
                pageSize: 5
            },//this.config.pageable,
            toolbar: this.config.toolbar,
            navigatable: true,
		};
		
        
		if (this.config.remoteData) {
            this.createRemoteDataSource();
        } else {
            this.createLocalDataSource();
        }
        
        // Set up select callback on read-only tables
        if (!this.config.editable && this.config.selectCallback) {
            this.tableConfig.selectable = "row";
            
            var vm = this;
            this.tableConfig.change = function(event: kendo.ui.GridChangeEvent) {
                vm.config.selectCallback(event.sender.dataItem(this.select()));
            }
        }
        
        // Unbind kendo's keybind on numeric inputs so it doesn't interfere with up/down table navigation
        this.tableConfig.edit = (event) => {
            var input = jQuery(this.table.current()).find('.k-numerictextbox input').unbind('keydown');
        }
        
        // Compile grid
        this.table = this.nativeElement.find('table').kendoGrid(this.tableConfig).data('kendoGrid');
        
        // Setup key navigation, this must be done after compiling
        this.setupKeyNavigation();
	}
    
    // Create a datasource that works with local data
    createLocalDataSource() {
        this.tableConfig.dataSource.transport = {
                
            read: (options) => {
                this.totalRows = 6;
                options.success(this.config.data);
            },
                
            update: (options) => {
                if (this.config.updateCallback) {
                    this.config.updateCallback(options.data);
                }
                options.success();        
            },
                
            create: (options) => {
                if (this.config.createCallback) {
                    this.config.createCallback(options.data);
                }
                options.success();
            },
                
            destroy: (options) => {
                if (this.config.deleteCallback) {
                    this.config.deleteCallback(options.data);
                }
                options.success();
            }
        }
    }
    
    // Create a datasource that works with remote data
    createRemoteDataSource() {       
        this.tableConfig.dataSource.type = 'json';
        this.tableConfig.dataSource.serverPaging = true;
        this.tableConfig.dataSource.serverFiltering = true;
        
        var resourceUrl = this.config.data.resource;

        this.tableConfig.dataSource.transport = {

            read: (options) => {
                // TODO: add search filter and pagination stuff!
                               
                this.uniHttp.get(this.config.data).subscribe(
                    (response) => {
                        // TODO: Get count param from response headers (mocked for now)
                        this.totalRows = 20;
                        options.success(response)
                    },
                    (error) => options.error(error)
                );
            },
                
            update: (options) => {
                this.uniHttp.put({
                    resource: resourceUrl + '/' + options.data.ID,
                    body: options.data
                }).subscribe(
                    (response) => options.success(response),
                    (error) => options.error(error)
                );
            },
            
            create: (options) => {
                this.uniHttp.post({
                    resource: resourceUrl,
                    body: options.data
                }).subscribe(
                    (response) => options.success(response),
                    (error) => options.error(error)                    
                );
            },
           
            destroy: (options) => {
                this.uniHttp.delete({resource: resourceUrl + '/' + options.data.ID})
                .subscribe(
                    (response) => options.success(response),
                    (error) => options.error(error)
                );
            },
        }

    }

	filterTable() {
		var filterValue = this.filterString;
		var filter = '';
        
		var fields = this.tableConfig.dataSource.schema.model.fields;
		for (var fieldName of Object.keys(fields)) {
			let field = fields[fieldName];
            
            // Contains filter for text columns
			if (field.type === 'text') {
				filter += ' or contains(' + fieldName + ',\'' + filterValue + '\')';
			}
			
			// Eq filter for number columns
			if (field.type === 'number' && !isNaN(parseInt(filterValue)) ) {
				filter += ' or ' + fieldName + ' eq ' + filterValue;
			}
		}
        
        // Remove leading ' or '
        if (filter.indexOf(' or ') === 0) {
            filter = filter.slice(4);
        }
        
        this.config.odata.filter = filter;
		this.table.dataSource.query({});
	}
    
    setupKeyNavigation() {
        if (!this.config.editable) return;
        
        jQuery(this.table.table).keyup((event) => {
            // Enter
            if (event.keyCode === 13) {
                if (event.shiftKey) {
                    this.move(DIRECTIONS.LEFT);
                } else {
                    this.move(DIRECTIONS.RIGHT);    
                }
            }
                        
            // Up arrow
            if (event.ctrlKey && event.keyCode === 38) {
                event.preventDefault();
                this.move(DIRECTIONS.UP);
            }
            
            // Down arrow
            if (event.ctrlKey && event.keyCode === 40) {
                event.preventDefault();
                this.move(DIRECTIONS.DOWN);
            }
                        
        });
    }
    
    move(direction) {
        var currentCell = jQuery(this.table.current());
        var newCell; 

        switch(direction) {
            case DIRECTIONS.LEFT:
                newCell = currentCell.prevAll('.editable-cell');
                if (!newCell[0]) {  
                    newCell = currentCell.parent('tr').prev().children('.editable-cell:last');
                }
            break;
            
            case DIRECTIONS.RIGHT:
                newCell = currentCell.nextAll('.editable-cell');
                if (!newCell[0]) {
                    newCell = currentCell.parent('tr').next().children('.editable-cell:first');
                }
            break;
            
            case DIRECTIONS.UP:
                var prevRow = currentCell.parent('tr').prev('tr');
                var newCell = jQuery('td:eq(' + currentCell.index() + ')', prevRow);
            break;
            
            case DIRECTIONS.DOWN:
                var nextRow = currentCell.parent('tr').next('tr');
                var newCell = jQuery('td:eq(' + currentCell.index() + ')', nextRow);
            break;
        }
                
        if (newCell.length > 0) {
            currentCell.find('input').blur(); // makes sure any changes are updated (in browser, no http call here) before moving focus
            this.table.current(newCell);
            this.table.editCell(newCell);
        }
    }
    
    // Avoid duplicate uniTable when renavigating
    ngOnDestroy() {
        this.nativeElement.find('.k-grid').remove();
        this.nativeElement.append('<table></table>');
    }
	
}