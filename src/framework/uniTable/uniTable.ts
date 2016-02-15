import { Component, Input, AfterViewInit, ElementRef} from "angular2/core";
import {Http, Headers, URLSearchParams} from "angular2/http";
import {NgIf} from "angular2/common";
declare var jQuery;

enum DIRECTIONS { LEFT, RIGHT, UP, DOWN }

@Component({
    selector: "uni-table",
    templateUrl: "framework/uniTable/uniTable.html",
    directives: [NgIf]
})
export class UniTable implements AfterViewInit {
    @Input() config;
    tableConfig: kendo.ui.GridOptions = {};

    filterString: string = "";
    nativeElement: any;
    table: kendo.ui.Grid;

    totalRows: number; // used for pagination


    constructor(private http: Http, elementRef: ElementRef) {
        this.nativeElement = jQuery(elementRef.nativeElement);
    }

    ngAfterViewInit() {
        var httpHeaders;
        httpHeaders = {
            "Client": "client1"
        };

        // create kendo options from the config
        this.tableConfig = {
            dataSource: {
                type: "json",
                transport: {
                    // read defined as a function instead of using kendo so we can get the number of rows from response headers
                    read: (options: any) => {
                        var urlParams = jQuery.extend({}, this.config.odata, options.data);
                        var searchMap = new URLSearchParams();

                        Object.keys(urlParams).forEach((key: string) => {
                            if (urlParams[key]) {
                                searchMap.append(key, urlParams[key]);
                            }
                        });

                        this.http.get(
                            this.config.resourceUrl,
                            {
                                headers: new Headers({"Client": "client1"}),
                                search: searchMap
                            }
                            )
                            .subscribe((response: any) => {
                                var data = response.json();
                                this.totalRows = parseInt(response.headers.get("Total"), 10) || data.length;
                                options.success(data);
                            });
                    },
                    update: {
                        url: (item: any) => {
                            return this.config.resourceUrl + "/" + item.ID;
                        },
                        type: "PUT",
                        headers: httpHeaders
                    },
                    create: {
                        url: this.config.resourceUrl,
                        type: "POST",
                        headers: httpHeaders
                    },
                    destroy: {
                        url: (item: any) => {
                            return this.config.resourceUrl + "/" + item.ID;
                        },
                        type: "DELETE",
                        headers: httpHeaders
                    },
                    parameterMap: (options: any, operation: any) => {
                        if (operation === "read") {
                            return jQuery.extend({}, this.config.odata, options);
                        }

                        if (operation !== "read" && options) {
                            return kendo.stringify(options);
                        }
                    }
                },
                schema: {
                    model: this.config.dsModel,
                    total: () => {
                        return this.totalRows;
                    }
                },
                pageSize: this.config.pageSize || 10,
                serverPaging: true,
                serverFiltering: true,
            },
            columns: this.config.columns,
            filterable: true,
            editable: this.config.editable,
            navigatable: true,
            pageable: true,
        };


        if (this.config.editable) {
            this.setupEditableTable();
        } else {
            this.setupReadOnlyTable();
        }
    }

    // settings specific to read-only uniTable
    setupReadOnlyTable() {

        if (this.config.onSelect) {
            this.tableConfig.selectable = "row";

            var vm = this;
            this.tableConfig.change = function (event: kendo.ui.GridChangeEvent) {
                vm.config.onSelect(event.sender.dataItem(this.select()));
            };
        }

        // compile kendo grid
        this.table = this.nativeElement.find("table").kendoGrid(this.tableConfig).data("kendoGrid");
    }

    // settings specific to editable uniTable
    setupEditableTable() {
        this.tableConfig.toolbar = ["create", "save", "cancel"];

        // add editable-cell class to the columns that are set to editable in the model
        this.tableConfig.columns.forEach((column: any) => {
            var modelField = this.tableConfig.dataSource.schema.model.fields[column.field];

            // check if the model field has editable = true or undefined (will be editable unless specified as false)
            if (modelField && (modelField.editable || modelField.editable === undefined)) {
                if (column.attributes) {
                    column.attributes.class = (column.attributes.class || "") + " editable-cell";
                } else {
                    column.attributes = {"class": "editable-cell"};
                }
            }
        });

        // unbind kendo"s keybind on numeric inputs so it doesn"t interfere with up/down table navigation
        this.tableConfig.edit = () => {
            jQuery(this.table.current()).find(".k-numerictextbox input").unbind("keydown");
        };

        // compile kendo grid
        this.table = this.nativeElement.find("table").kendoGrid(this.tableConfig).data("kendoGrid");

        this.setupKeyNavigation();
    }

    buildOdataString() {
        if (!this.config.odata) {
            return "";
        }

        var odataStr = "";
        odataStr += (this.config.odata.expand) ? ("expand=" + this.config.odata.expand + "&") : "";
        odataStr += (this.config.odata.filter) ? ("filter=" + this.config.odata.filter) : "";

        // // Remove trailing "&"
        if (odataStr[odataStr.length - 1] === "&") {
            odataStr = odataStr.slice(0, -1);
        }

        return odataStr;
    }

    filterTable() {
        var filterValue = this.filterString;
        var filter = "";

        var fields = this.tableConfig.dataSource.schema.model.fields;
        for (var fieldName of Object.keys(fields)) {
            let field = fields[fieldName];

            // contains filter for text columns
            if (field.type === "text") {
                filter += " or contains(" + fieldName + ",\"" + filterValue + "\")";
            }

            // eq filter for number columns
            if (field.type === "number" && !isNaN(parseInt(filterValue, 10))) {
                filter += " or " + fieldName + " eq " + filterValue;
            }
        }

        // remove leading " or "
        if (filter.indexOf(" or ") === 0) {
            filter = filter.slice(4);
        }

        this.config.odata.filter = filter;
        this.table.dataSource.query({});
    }

    setupKeyNavigation() {
        jQuery(this.table.table).keyup((event: any) => {
            // enter
            if (event.keyCode === 13) {
                if (event.shiftKey) {
                    this.move(DIRECTIONS.LEFT);
                } else {
                    this.move(DIRECTIONS.RIGHT);
                }
            }

            // up arrow
            if (event.ctrlKey && event.keyCode === 38) {
                event.preventDefault();
                this.move(DIRECTIONS.UP);
            }

            // down arrow
            if (event.ctrlKey && event.keyCode === 40) {
                event.preventDefault();
                this.move(DIRECTIONS.DOWN);
            }

        });
    }

    move(direction: any) {
        var currentCell = jQuery(this.table.current());
        var newCell;

        switch (direction) {
            case DIRECTIONS.LEFT:
                newCell = currentCell.prevAll(".editable-cell");
                if (!newCell[0]) {
                    newCell = currentCell.parent("tr").prev().children(".editable-cell:last");
                }
                break;

            case DIRECTIONS.RIGHT:
                newCell = currentCell.nextAll(".editable-cell");
                if (!newCell[0]) {
                    newCell = currentCell.parent("tr").next().children(".editable-cell:first");
                }
                break;

            case DIRECTIONS.UP:
                var prevRow = currentCell.parent("tr").prev("tr");
                newCell = jQuery("td:eq(" + currentCell.index() + ")", prevRow);
                break;

            case DIRECTIONS.DOWN:
                var nextRow = currentCell.parent("tr").next("tr");
                newCell = jQuery("td:eq(" + currentCell.index() + ")", nextRow);
                break;
        }

        if (newCell.length > 0) {
            currentCell.find("input").blur(); // makes sure any changes are updated (in browser, no http call here) before moving focus
            this.table.current(newCell);
            this.table.editCell(newCell);
        }
    }

    // avoid duplicate uniTable when renavigating
    ngOnDestroy() {
        this.nativeElement.find(".k-grid").remove();
        this.nativeElement.append("<table></table>");
    }

}
