import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import {Router} from '@angular/router';
import {SellerLink, Seller} from '@uni-entities';
import {UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from '@uni-framework/ui/unitable';
import {ErrorService, SellerService, SellerLinkService} from '@app/services/services';
import {cloneDeep} from 'lodash';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'seller-links',
    templateUrl: './sellerLinks.html',
})
export class SellerLinks {
    @Input() readonly: boolean;
    @Input() entity;
    @Output() entityChange = new EventEmitter();
    @ViewChild('table') table: AgGridWrapper;

    sellerTableConfig: UniTableConfig;
    sellerLinks: SellerLink[];

    sellers: Seller[];
    totalPercent = 0;

    constructor(
        private router: Router,
        private errorService: ErrorService,
        private sellerService: SellerService,
        private sellerLinkService: SellerLinkService
    ) {
        this.sellerService.GetAll().subscribe(
            sellers => {
                this.sellers = sellers;
                this.setupTable();
            },
            err => {
                this.errorService.handle(err);
                this.setupTable();
            }
        );
    }

    public ngOnChanges() {
        if (this.entity) {
            if (this.entity.Sellers && this.entity.Sellers.length > 0) {
                this.sellerLinks = cloneDeep(this.entity.Sellers);
            } else {
                this.sellerLinks = [];
            }
            this.totalPercent = this.sellerLinks.reduce((prev, next) => prev + next.Percent, 0);
        }
    }

    manageSellers(event) {
        if (!event) {
            return;
        }
        const amount  = this.entity.Items ? this.entity.Items.reduce((prev, next) => prev + next.SumTotalIncVatCurrency, 0) : 0;
        const sellers = this.getCleanSellers().filter(x => !x.Deleted);
        const deletedSellers = this.getCleanSellers().filter(x => x.Deleted);
        const seller = event.rowModel;
        const numberOfSellers = sellers.length;
        let focusRow = false;
        let totalPercent = 0;

        if (event.field === 'Seller' && numberOfSellers === 1) {
            seller.Percent = 100;
            seller.Amount = amount * seller.Percent / 100;
        } else if (event.field === 'Percent' && numberOfSellers === 2) {
            const otherSeller = sellers.find(x => event.rowModel !== x);
            if (seller.Percent > 100) {
                seller.Percent = 100;
            }
            seller.Amount = amount * seller.Percent / 100;
            otherSeller.Percent = 100 -  seller.Percent;
            otherSeller.Amount = amount * otherSeller.Percent / 100;
        } else if (event.field === 'Percent') {
            totalPercent = sellers.reduce((prev, next) => prev + next.Percent, 0);
            totalPercent = totalPercent > 100 ? 100 : totalPercent;
            if (totalPercent < 100) {
                sellers.push(<SellerLink>{
                    Seller: null,
                    Percent: 100 - totalPercent,
                    Amount: amount * (100 - totalPercent) / 100,
                    Deleted: false,
                });
                focusRow = true;
            }
            sellers.forEach(s => s.Amount = amount * s.Percent / 100);
        }
        this.sellerLinks = sellers.concat(deletedSellers);
        this.sellerLinks = this.updateSellersGuid();
        this.entity.Sellers = this.sellerLinks;
        this.entityChange.emit(this.entity);
        this.totalPercent = this.sellerLinks.reduce((prev, next) => prev + next.Percent, 0);
        if (focusRow) {
            this.table.focusRow(numberOfSellers);
        }
    }

    onSellerChange(event) {
        this.manageSellers(event);
    }

    getCleanSellers() {
        return this.sellerLinks.filter(link => !link['_isEmpty']);
    }

     updateSellersGuid() {
        const sellerLinks = this.getCleanSellers().map(link => {
                if (!link.ID && !link.Deleted) {
                    link['_createguid'] = this.sellerLinkService.getNewGuid();
                }
                return link;
            });
        return sellerLinks;
    }

    public onSellerLinkDeleted(sellerLink) {
        if (sellerLink.ID && sellerLink.Seller) {
            const defaultSeller = this.entity.DefaultSeller;
            if (defaultSeller && defaultSeller.ID === sellerLink.Seller.ID) {
                this.entity.DefaultSeller = null;
                this.entity.DefaultSellerID = null;
            }
        }
        this.sellerLinks = this.updateSellersGuid();
        this.entity.Sellers = this.sellerLinks;
        this.entityChange.emit(this.entity);
    }

    private changeCallback(event) {
        const rowModel = event.rowModel;
        if (event.field === 'Seller') {
            rowModel.SellerID = rowModel.Seller.ID;
        }

        return rowModel;
    }

    private setupTable() {
        const sellerCol = new UniTableColumn('Seller', 'Selger',  UniTableColumnType.Select)
            .setTemplate((row) => row.Seller ? row.Seller.Name : '')
            .setOptions({
                resource: this.sellers || [],
                itemTemplate: (item) => `${item.ID}: ${item.Name}`
            });

        const percentCol = new UniTableColumn('Percent', 'Prosent', UniTableColumnType.Number);
        const amountCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Number)
            .setEditable(false);

        const defaultRowModel = {
            SellerID: 0
        };

        const contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Vis selgerdetaljer',
            action: (rowModel) => {
                this.router.navigateByUrl('/sales/sellers/' + rowModel.Seller.ID);
            },
            disabled: (rowModel) => !rowModel.SellerID
        },
        {
            label: 'Vis selger sine salg',
            action: (rowModel) => {
                this.router.navigateByUrl('/sales/sellers/' + rowModel.Seller.ID + '/sales');
            },
            disabled: (rowModel) => !rowModel.SellerID
        });

        // Setup table
        this.sellerTableConfig = new UniTableConfig('common.seller.sellerlinks', !this.readonly, true, 15)
            .setSearchable(false)
            .setSortable(false)
            .setDefaultRowData(defaultRowModel)
            .setDeleteButton(!this.readonly)
            .setContextMenu(contextMenuItems)
            .setChangeCallback(event => this.changeCallback(event))
            .setColumns([sellerCol, percentCol, amountCol]);
    }
}
