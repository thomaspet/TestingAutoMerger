import {Component, ViewChild, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {UniForm, FieldType, UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {ProductCategory} from '../../../../unientities';
import {
    ProductCategoryService,
    ErrorService,
    StatisticsService
} from '../../../../services/services';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
declare const _; // lodash

@Component({
    selector: 'group-details',
    templateUrl: './groupDetails.html'
})
export class GroupDetails implements OnInit {
    @ViewChild(UniForm)
    public form: UniForm;

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public group$: BehaviorSubject<ProductCategory> = new BehaviorSubject(new ProductCategory());

    constructor(
        private productCategoryService: ProductCategoryService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
    ) {}

    public ngOnInit() {
        this.fields$.next(this.getComponentFields());

        this.productCategoryService.currentProductGroup.subscribe(
            (productGroup) => {
                if (productGroup) {
                    this.group$.next(productGroup);
                } else {
                    this.group$.next(new ProductCategory);
                    this.productCategoryService.currentProductGroup.next(this.group$.getValue());
                }
            });
    }

    public change(changes: any) {
        this.productCategoryService.currentProductGroup.next(this.group$.getValue());
        this.productCategoryService.isDirty = true;
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Gruppe nøkkel',
                Property: '_key',
                Placeholder: 'Nøkkel til gruppen'
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Gruppenavn',
                Property: 'Name',
                Placeholder: 'Navn på produktgruppen'
            },
            <any>{
                FieldType: FieldType.TEXTAREA,
                Label: 'Beskrivelse',
                Property: 'Description',
                Placeholder: 'Beskrivelse av produktgruppe'
            }
        ];
    }
}
