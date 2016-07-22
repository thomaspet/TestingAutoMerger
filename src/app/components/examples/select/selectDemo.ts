import {Component, ViewChild} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {UniSelect, ISelectConfig} from '../../../../framework/controls/select/select';
import {UniHttp} from '../../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'select-demo',
    template: `
        <label>
            Changes triggering a class function which logs result<br>
            <uni-select [config]="selectConfig1" 
                        [items]="products$ | async"
                        [value]="initProduct"
                        (valueChange)="onSelect($event)">
            </uni-select>
        </label>
        <br><br>
        <label>
            Double data binding to a class variable<br>
            <uni-select [config]="selectConfig2"
                        [items]="vatTypes"
                        [(value)]="currentVatType">
            </uni-select>
        </label>
        Selected vattype: {{currentVatType?.Name}}
    `,
    directives: [UniSelect],
    pipes: [AsyncPipe],
})
export class UniSelectDemo {
    @ViewChild(UniSelect)
    private select: UniSelect;

    private initProduct: any; // for first demo select
    private currentVatType: any; // for second demo select
    private products$: Observable<any>;
    private vatTypes: Observable<any>;
    private selectConfig1: ISelectConfig;
    private selectConfig2: ISelectConfig;

    constructor(private uniHttp: UniHttp) {
        this.initProduct = JSON.parse('{"PartName":"FELG-04","Name":null,"CostPrice":null,"ListPrice":null,"PriceIncVat":null,"PriceExVat":null,"AverageCost":null,"ImageFileID":null,"Description":null,"VariansParentID":0,"Type":0,"Unit":null,"DefaultProductCategoryID":0,"CalculateGrossPriceBasedOnNetPrice":false,"VatTypeID":null,"AccountID":null,"StatusCode":null,"ID":21,"Deleted":false,"CreatedAt":"2016-06-07T11:12:26.587","UpdatedAt":null,"CreatedBy":"5ee7a70d-147f-424c-bcdf-0668c0ae71f0","UpdatedBy":null,"CustomValues":{},"_links":{"actions":{"first":{"href":"/api/biz/products/21?action=first","method":"GET","label":"","description":""},"last":{"href":"/api/biz/products/21?action=last","method":"GET","label":"","description":""},"previous":{"href":"/api/biz/products/21?action=previous","method":"GET","label":"","description":""},"next":{"href":"/api/biz/products/21?action=next","method":"GET","label":"","description":""}},"relations":{"Self":{"href":"/api/biz/products/21","method":"GET","label":"","description":""},"ProductCategoryLinks":{"href":"/api/biz/productcategorylinks?filter=ProductID eq 21","method":"GET","label":"","description":""}},"transitions":{}}}');

        // Using observable directly with async pipe in markup
        this.products$ = this.uniHttp.asGET()
            .usingBusinessDomain()
            .withEndPoint('products')
            .send()
            .map(response => response.json());

        // Subscribing to result and setting data variable
        this.uniHttp.asGET()
            .usingBusinessDomain()
            .withEndPoint('vattypes')
            .send()
            .map(response => response.json())
            .subscribe(response => this.vatTypes = response);


        this.selectConfig1 = {
            displayField: 'PartName',
            // searchable: false,
            // template: (item) => {
            //     return (item.ID + ' - ' + item.PartName);
            // }
        };

        this.selectConfig2 = {
            // displayField: 'VatCode'
            template: (item) => {
                return (item.VatCode + ' - ' + item.Name);
            }
        };
    }

    private onSelect(event) {
        console.log(event);
    }

}
