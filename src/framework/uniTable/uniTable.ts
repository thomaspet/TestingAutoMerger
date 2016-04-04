import {Component, Input, OnChanges, SimpleChange, ElementRef, OnDestroy} from 'angular2/core';
import {UniHttp} from '../core/http/http';
import {UniTableBuilder} from './UniTableBuilder';

declare var jQuery;

enum directions { LEFT, RIGHT, UP, DOWN };

@Component({
    selector: 'uni-table',
    templateUrl: 'framework/uniTable/uniTable.html',
})
export class UniTable implements OnChanges, OnDestroy {
    @Input()
    private config: UniTableBuilder;

    private tableConfig: kendo.ui.GridOptions = {};
    private filterString: string = '';
    private totalRows: number; // used for pagination

    private nativeElement: any;
    private table: kendo.ui.Grid;
    
    constructor(private uniHttp: UniHttp, elementRef: ElementRef) {
        this.nativeElement = jQuery(elementRef.nativeElement);
    }
    
    public refresh(data?: any) {
        if (data && !this.config.remoteData) {
            this.config.resource = data;
        }
        this.table.dataSource.read();
    }
    
    public updateFilter(filter: string) {
        this.config.filter = filter;
        this.table.dataSource.read();
    }
    
    public hideColumn(field: string): void {
        this.table.hideColumn(field);
    }
    
    public showColumn(field: string): void {
        this.table.showColumn(field);
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        var current = changes['config'].currentValue;
        
        if (!this.table && current) {
            this.setupAndCompile();
        }
    }
    
    public ngAfterViewInit() {
        if (!this.table && this.config) {
            this.setupAndCompile();
        }
    }

    private setupAndCompile() {

        if (this.config.commands.length > 0) {
            this.config.columns.push({
                command: this.config.commands
            });
        }

        this.tableConfig = {
            dataSource: {
                schema: {
                    model: this.config.schemaModel,
                    total: (response) => {
                        return this.totalRows;
                    }
                },
                sort: this.config.orderBy
            },
            columns: this.config.columns,
            filterable: this.config.filterable,
            editable: this.config.editable,
            toolbar: this.config.toolbar,
            navigatable: true,
            sortable: true,
        };

        if (this.config.pageable) {
            this.tableConfig.pageable = {pageSize: this.config.pageSize};
        }

        if (this.config.remoteData) {
            this.createRemoteDataSource();
        } else {
            this.createLocalDataSource();
        }

        // Set up select callback on read-only tables
        if (!this.config.editable && this.config.selectCallback) {
            this.tableConfig.selectable = 'row';

            var vm = this;
            this.tableConfig.change = function (event: kendo.ui.GridChangeEvent) {
                let unflattened = vm.unflattenData(event.sender.dataItem(this.select()));
                vm.config.selectCallback(unflattened);
            };
        }

        // Unbind kendo's keybind on numeric inputs 
        // so it doesn't interfere with up/down table navigation
        this.tableConfig.edit = (event) => {
            jQuery(this.table.current()).find('.k-numerictextbox input').unbind('keydown');
        };

        // Compile grid and set up key navigation
        this.table = this.nativeElement.find('table').kendoGrid(this.tableConfig).data('kendoGrid');
        this.setupKeyNavigation();
    }

    // Create a datasource that works with local data
    private createLocalDataSource() {
        this.tableConfig.dataSource.transport = {

            read: (options) => {
                this.totalRows = this.config.resource.length;
                options.success(this.flattenData(this.config.resource));
            },

            update: (options) => {
                if (this.config.updateCallback) {
                    this.config.updateCallback(this.unflattenData(options.data));
                }
                options.success();
            },

            create: (options) => {
                if (this.config.createCallback) {
                    this.config.createCallback(this.unflattenData(options.data));
                }
                options.success();
            },

            destroy: (options) => {
                if (this.config.deleteCallback) {
                    this.config.deleteCallback(options.data);
                }
                options.success();
            }
        };
    }

    // Create a datasource that works with remote data
    private createRemoteDataSource() {
        this.tableConfig.dataSource.type = 'json';
        this.tableConfig.dataSource.serverPaging = true;
        this.tableConfig.dataSource.serverFiltering = true;
        this.tableConfig.dataSource.serverSorting = true;
        
        
        this.tableConfig.dataSource.transport = {
            
            read: (options) => {
                var requestOptions = {
                    returnResponseHeaders: true,
                    expand: this.config.expand,
                    filter: this.buildOdataFilter(options.data.filter)
                };
                                                
                if (options.data.sort && options.data.sort[0]) {
                    var sortField = options.data.sort[0].field;
                    if (sortField.split('$').length) {
                        sortField = sortField.split('$').join('.');
                    }
                    requestOptions['orderBy'] = sortField + ' ' + options.data.sort[0].dir;
                }
                                
                if (this.config.pageable) {
                    requestOptions['top'] = options.data.take;
                    requestOptions['skip'] = options.data.skip;
                }

                this.uniHttp
                    .asGET()
                    .usingBusinessDomain()
                    .withEndPoint(this.config.resource.toString())
                    .send(requestOptions)
                    .subscribe(
                        (response) => {
                            this.totalRows = response.headers.get('count');
                            options.success(this.flattenData(response.json()));
                        },
                        (error) => options.error(error)
                );
            },

            update: (options) => {                
                let data = this.unflattenData(options.data);
                
                this.uniHttp
                    .asPUT()
                    .usingBusinessDomain()
                    .withBody(data)
                    .withEndPoint(this.config.resource + '/' + options.data.ID)
                    .send()
                    .subscribe(
                        (response) => options.success(this.flattenObject(response)),
                        (error) => options.error(error)
                    );
            },

            create: (options) => {
                this.uniHttp
                    .asPOST()
                    .usingBusinessDomain()
                    .withEndPoint(this.config.resource.toString())
                    .withBody(this.unflattenData(options.data))
                    .send()
                    .subscribe(
                        (response) => options.success(this.flattenObject(response)),
                        (error) => options.error(error)
                    );
            },

            destroy: (options) => {
                this.uniHttp
                    .asDELETE()
                    .usingBusinessDomain()
                    .withEndPoint(this.config.resource + '/' + options.data.ID)
                    .send()
                    .subscribe(
                        (response) => options.success(response),
                        (error) => options.error(error)
                    );
            },
        };
    }
    
    private flattenData(data) {
        let flattened = [];
        data.forEach((row) => {
            flattened.push(this.flattenObject(row)); 
        });
        
        return flattened;
    }
    
    private flattenObject(obj) {
        let result = {};

        let step = (object, prevKey) => {
            Object.keys(object).forEach((key) => {
                let value = object[key];
                let newKey = prevKey ? (prevKey + '$' + key) : key;

                if (value instanceof Object
                    && !Array.isArray(value)
                    && Object.keys(value).length) {
                    return step(value, newKey);
                }

                result[newKey] = value;
            });
        };

        step(obj, '');
        return result;
    }
    
    private unflattenData(data) {
        // Base case
        if (Object.prototype.toString.call(data) !== '[object Object]') {
            return data;
        }
        
        const keys = Object.keys(data);
        let result = {};
        
        keys.forEach((item) => {
            
            let current = result;
            let key = item.split('$');
            let target = key.shift();
            
            while (key[0]) {
                if (!current[target]) {
                    current[target] = {};
                }
                
                current = current[target];
                
                if (key.length) {
                    target = key.shift();
                }
            }
            
            current[target] = this.unflattenData(data[item]);
        });
        
        return result;  
    }

    private buildOdataFilter(kendoFilter): string {
        var stringified = '';

        if (!kendoFilter) {
            return this.config.filter;
        }

        kendoFilter.filters.forEach((filter: any) => {
            
            if (filter.operator === 'contains') {
                stringified += `contains(${filter.field},'${filter.value}') or `;
                // stringified += "contains(" + filter.field + ",'" + filter.value + "') or ";
            }

            if (filter.operator === 'eq') {
                stringified += `${filter.field} eq ${filter.value} or `;
                // stringified += filter.field + " eq " + filter.value + " or "
            }

        });

        // Remove trailing " or "
        if (stringified.length > 0) {
            stringified = stringified.slice(0, -4);
        }

        // If there is no filter defined in the config we just return the stringified kendo filter
        if (this.config.filter.length === 0) {
            return stringified;
        }

        // Return config filter combined with the stringified kendo filter
        return `(${this.config.filter}) and (${stringified})`
        // return '(' + this.config.filter + ')' + " and (" + stringified + ")";
    }

    private filterTable() {

        var filter = {
            logic: 'or',
            filters: [],
        };

        var fields = this.tableConfig.dataSource.schema.model.fields;

        Object.keys(fields).forEach((key) => {
            let fieldName = key.split('$').join('.');
            let field = fields[key];
            
            // contains filter for text columns
            if (field.type === 'string') {
                filter.filters.push({
                    field: fieldName,
                    operator: 'contains',
                    value: this.filterString
                });
            }

            // eq filter for number columns
            if (field.type === 'number') {
                let filterValue = parseInt(this.filterString);
                if (!isNaN(filterValue)) {
                    filter.filters.push({field: fieldName, operator: 'eq', value: filterValue});
                }
            }
        });

        // for (var fieldName of Object.keys(fields)) {
        //     let field = fields[fieldName];

        //     // contains filter for text columns
        //     if (field.type === 'string') {
        //         filter.filters.push({
        //             field: fieldName,
        //             operator: 'contains',
        //             value: this.filterString
        //         });
        //     }

        //     // eq filter for number columns
        //     if (field.type === 'number') {
        //         var filterValue = parseInt(this.filterString);
        //         if (!isNaN(filterValue)) {
        //             filter.filters.push({field: fieldName, operator: 'eq', value: filterValue});
        //         }
        //     }
        // }

        this.table.dataSource.filter(filter);
    }

    private setupKeyNavigation() {
        if (!this.config.editable) return;

        jQuery(this.table.table).keyup((event) => {
            // Enter
            if (event.keyCode === 13) {
                if (event.shiftKey) {
                    this.move(directions.LEFT);
                } else {
                    this.move(directions.RIGHT);
                }
            }

            // Up arrow
            if (event.ctrlKey && event.keyCode === 38) {
                event.preventDefault();
                this.move(directions.UP);
            }

            // Down arrow
            if (event.ctrlKey && event.keyCode === 40) {
                event.preventDefault();
                this.move(directions.DOWN);
            }

        });
    }

    private move(direction) {
        var currentCell = jQuery(this.table.current());
        var nextCell;

        switch (direction) {
            case directions.LEFT:
                nextCell = currentCell.prevAll('.editable-cell')[0];
                if (!nextCell) {
                    nextCell = currentCell.parent('tr').prev().children('.editable-cell:last');
                }
                break;

            case directions.RIGHT:
                nextCell = currentCell.nextAll('.editable-cell')[0];
                if (!nextCell) {
                    nextCell = currentCell.parent('tr').next().children('.editable-cell:first');
                }
                break;

            case directions.UP:
                var prevRow = currentCell.parent('tr').prev('tr');
                var nextCell = jQuery('td:eq(' + currentCell.index() + ')', prevRow);
                break;

            case directions.DOWN:
                var nextRow = currentCell.parent('tr').next('tr');
                var nextCell = jQuery('td:eq(' + currentCell.index() + ')', nextRow);
                break;
        }

        if (nextCell) {
            // makes sure the kendo grid catches the changes before moving focus
            currentCell.find('input').blur();
            this.table.current(nextCell);
            this.table.editCell(nextCell);
        }
    }

    // Avoid duplicate uniTable when renavigating
    public ngOnDestroy() {
        this.nativeElement.find('.k-grid').remove();
        this.nativeElement.append('<table></table>');
    }

}
