import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {ElsaContractType, ElsaProductType, ElsaCategory} from '@app/models';
import {ElsaContractService} from '@app/services/services';
import {forkJoin} from 'rxjs';
import {trigger, state, style, transition, animate, group} from '@angular/animations';

@Component({
    selector: 'contract-types-comparison',
    templateUrl: './contract-types-comparison.html',
    styleUrls: ['./contract-types-comparison.sass'],
    animations: [
        trigger('slideInOut', [
            state('in', style({height: '*', opacity: 0})),
            transition(':leave', [
                style({height: '*', opacity: 1}),
                group([
                    animate(300, style({height: 0})),
                    animate('200ms ease-in-out', style({'opacity': '0'}))
                ])

            ]),
            transition(':enter', [
                style({height: '0', opacity: 0}),
                group([
                    animate(300, style({height: '*'})),
                    animate('400ms ease-in-out', style({'opacity': '1'}))
                ])

            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractTypesComparison {

    busy = false;
    activeContractTypes: ElsaContractType[] = [];
    categories: ElsaCategory[] = [];

    expanded = false;

    constructor(
        private elsaContractService: ElsaContractService,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    fetchData() {
        //  only fetch once
        if (this.categories.length > 0) {
            return;
        }
        forkJoin([
            this.elsaContractService.getCustomContractTypes(),
            this.elsaContractService.getContractTypesCategories(),
        ]).subscribe(
            (res) => {
                this.activeContractTypes = res[0];
                this.categories = res[1];

                this.setCheckmarks();
                this.findMainPackageProduct();
                this.busy = false;
                this.changeDetectorRef.markForCheck();
            },
            (err) => {
                this.busy = false;
            }
        );
    }

    setCheckmarks() {
        this.categories.forEach((category) => {
            category.Features = category.Features.map((feature) => {
                feature.Checkmarks = this.activeContractTypes.map(
                    type => feature.ContainsContractTypes.includes(type.ContractType)
                );
                return feature;
            });
        });
    }

    findMainPackageProduct() {
        this.activeContractTypes.map((type) => {
            type['_MainPackageProduct'] = type.ProductContractTypes.find(
                (pct) => pct.Product.ProductType === ElsaProductType.Package
            );
            type['_MainPackageProduct'] = type['_MainPackageProduct']?.Product;
            return type;
        });
    }
}
