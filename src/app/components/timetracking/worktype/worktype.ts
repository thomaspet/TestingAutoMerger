import {Component, ViewChild} from '@angular/core';
import {createFormField, ControlTypes, filterInput, debounce} from '../../common/utils/utils';
import {IViewConfig} from '../genericview/detail';
import {WorkType, WageType, StatusCodeProduct} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';
import {SYSTEMTYPES} from '../../common/utils/pipes';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';
import {Observable} from 'rxjs';
import {ProductService, WageTypeService, ErrorService} from '@app/services/services';
import {HttpParams} from '@angular/common/http';
import {isString} from 'util';

const defaultSystemType = 1; // 1 - Hours (default)

@Component({
    selector: 'worktypes',
    template: '<genericdetail [viewconfig]="viewconfig"></genericdetail>'
})
export class WorktypeDetailview {
    @ViewChild(GenericDetailview) private genericDetail: GenericDetailview;
    public viewconfig: IViewConfig;
    private productService: ProductService;
    private wagetypeService: WageTypeService;
    private errorService: ErrorService;
    private wagetypes: WageType[] = [];

    constructor(productservice: ProductService, wagetypeservice: WageTypeService, errorservice: ErrorService) {
        this.productService = productservice;
        this.wagetypeService = wagetypeservice;
        this.errorService = errorservice;
        this.viewconfig = this.createLayout();
    }

    public canDeactivate() {
        return this.genericDetail.canDeactivate();
    }

    private getWagetypesObs(): Observable<WageType[]> {
        return this.wagetypes.length > 0
            ? Observable.of(this.wagetypes)
            : this.wagetypeService
                .GetAll('')
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .map(wageTypes => {
                this.wagetypes = wageTypes;
                return wageTypes;
            });
    }

    private createLayout(): IViewConfig {

        const layout: IViewConfig = {
            moduleID: UniModules.WorkTypes,
            baseUrl: '/timetracking/worktypes',
            titleProperty: 'Name',
            labels: {
                single: 'Mal',
                plural: 'Maler',
                createNew: 'Ny Timeart',
                ask_delete: 'Er du sikker på at du vil slette denne timearten? (Obs: Kan ikke angres)'
            },
            data: {
                model: 'worktype',
                route: 'worktypes', expand: 'product',
                factory: () => {
                        const item = new WorkType();
                        item.SystemType = defaultSystemType;
                        return item;
                    },
                check: (item) => {
                    item.SystemType = item.SystemType || defaultSystemType;
                }
            },
            formFields: [
                createFormField('Name', 'Navn',  ControlTypes.TextInput, undefined, undefined, 1, 'Timeart'),
                createFormField('SystemType', 'Type', 3, undefined, false, 1, 'Timerart', {
                    source: SYSTEMTYPES, valueProperty: 'id', displayProperty: 'label'
                }),
                createFormField('Description', 'Kommentar', ControlTypes.TextareaInput, undefined, true, 1, 'Timart'),
                createFormField('ProductID', 'Produkt', ControlTypes.AutocompleteInput, undefined, false, 2, 'Priser', {
                     search: (value) => this.findProduct(value),
                     template: (obj) => obj ? `${obj.PartName} - ${obj.Name}` : '',
                     valueProperty: 'ID',
                     displayProperty: 'Name',
                     debounceTime: 150,
                     getDefaultData: () => this.getDefaultProduct()
                }),
                createFormField('Price', 'Pris', ControlTypes.TextInput, undefined, false, 2, 'Priser'),
                createFormField('WagetypeNumber', 'Lønnsart', ControlTypes.AutocompleteInput, undefined, false, 3, 'Time til lønn', {
                    search: (query) => this.getWagetypesObs().map(wageTypes => {
                        return wageTypes
                            .filter(wt =>
                                !query ||
                                `${wt.WageTypeNumber}`.startsWith(query) ||
                                `${wt.WageTypeName}`.includes(query));
                    }),
                    template: (obj) => obj ? `${obj.WageTypeNumber} - ${obj.WageTypeName}` : '',
                    valueProperty: 'WageTypeNumber',
                    debounceTime: 150,
                    getDefaultData: () => this.getWagetypesObs().map(wageTypes => {
                        const model: WorkType = this.genericDetail.current$.getValue();
                        if (!model || !model.WagetypeNumber) {
                            return [];
                        }
                        return wageTypes.filter(wt => wt.WageTypeNumber === model.WagetypeNumber);
                    })
                }),
            ],
        };
        return layout;
    }

    private getDefaultProduct() {
        const model = this.genericDetail.current$.getValue()
            ? this.genericDetail.current$.getValue() : null;
        if (model && model.Product) {
            return Observable.of([model.Product]);
        } else {
            return Observable.of([]);
        }
    }

    private findProduct(value: string, ignoreFilter = false) {
        let search = new HttpParams();
        const txt = filterInput( isString(value) ? value : '');
        search = search.append('select', 'id,partname,name,priceexvat');
        search = search.append('hateoas', 'false');
        let filter = `statuscode eq '${StatusCodeProduct.Active}'`;
        if (txt && (!ignoreFilter)) {
            filter = filter + ` and (partname eq '${txt}' or startswith(name,'${txt}'))`;
        }
        search = search.append('filter', filter);
        return this.productService.GetAllByHttpParams(search)
            .map((res) => res.body);
    }
}
