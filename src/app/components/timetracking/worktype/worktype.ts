import {Component, ViewChild} from '@angular/core';
import {View} from '../../../models/view/view';
import {createFormField, ControlTypes, filterInput, debounce} from '../../common/utils/utils';
import {IViewConfig} from '../genericview/list';
import {WorkType} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';
import {SYSTEMTYPES} from '../../common/utils/pipes';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';
import {Observable} from 'rxjs/Observable';
import {ProductService} from '@app/services/services';
import {URLSearchParams} from '@angular/http';
import {isObject, isString} from 'util';

export let view = new View('worktypes', 'Timeart', 'WorktypeDetailview', true, '');

const defaultSystemType = 1; // 1 - Hours (default)

@Component({
    selector: view.name,
    template: '<genericdetail [viewconfig]="viewconfig"></genericdetail>'
})
export class WorktypeDetailview {
    @ViewChild(GenericDetailview) private genericDetail: GenericDetailview;
    private viewconfig: IViewConfig;
    private productService: ProductService;

    constructor(productservice: ProductService) {
        this.viewconfig = this.createLayout();
        this.productService = productservice;
    }

    public canDeactivate() {
        return this.genericDetail.canDeactivate();
    }

    private createLayout(): IViewConfig {

        const layout: IViewConfig = {
            moduleID: UniModules.WorkTypes,
            labels: {
                single: 'Mal',
                plural: 'Maler',
                createNew: 'Ny Timeart',
                ask_delete: 'Er du sikker på at du vil slette denne timearten? (Obs: Kan ikke angres)'
            },
            detail: { routeBackToList: '/timetracking/worktypes'},
            tab: view,
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
                createFormField('Price', 'Pris', ControlTypes.TextInput, undefined, false, 2, 'Priser')
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
        const search = new URLSearchParams();
        const txt = filterInput( isString(value) ? value : '');
        search.append('select', 'id,partname,name,priceexvat');
        search.append('hateoas', 'false');
        if (txt && (!ignoreFilter)) {
            search.append('filter', `partname eq '${txt}' or startswith(name,'${txt}')`);
        }
        return this.productService.GetAllByUrlSearchParams(search)
            .map((res) => res.json());
    }
}

view.component = WorktypeDetailview;
