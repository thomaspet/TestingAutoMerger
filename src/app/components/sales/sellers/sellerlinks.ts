import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {SellerLink, Seller} from '@uni-entities';
import {UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from '@uni-framework/ui/unitable';
import {ErrorService, SellerService, SellerLinkService} from '@app/services/services';
import {cloneDeep} from 'lodash';

@Component({
    selector: 'seller-links',
    templateUrl: './sellerLinks.html',
})
export class SellerLinks {
    @Input() readonly: boolean;
    @Input() entity;
    @Output() entityChange = new EventEmitter();

    sellerTableConfig: UniTableConfig;
    sellerLinks: SellerLink[];

    sellers: Seller[];

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
                this.recalcSellers(this.sellerLinks[0]);
            } else {
                this.sellerLinks = [];
            }
        }
    }

    recalcSellers(seller) {
        const amount  = this.entity.Items ? this.entity.Items.reduce((prev, next) => prev + next.SumTotalIncVatCurrency, 0) : 0;
        const sellers = this.getCleanSellers().filter(x => !x.Deleted);
        const deletedSellers = this.getCleanSellers().filter(x => x.Deleted);
        seller.Amount = amount * seller.Percent / 100;
        if (!sellers) {
            return;
        }
        if (sellers.length === 1) {
            seller.Percent = 100;
            seller.Amount = amount;
        } else if (sellers.length === 2) {
            const otherSeller = sellers.find(x => x.SellerID !== seller.SellerID);
            otherSeller.Percent = 100 -  seller.Percent;
            otherSeller.Amount = amount * otherSeller.Percent / 100;
        } else {
            const totalPercent = sellers.reduce((prev, next) => prev + next.Percent, 0);
            const totalPercentButSeller = sellers.reduce((prev, next) => prev + (next.SellerID !== seller.SellerID ? next.Percent : 0), 0);
            const surplusPrecent = totalPercentButSeller - 100;
            if (surplusPrecent > 0) {
                seller.Percent = 0;
                seller.Amount = 0;
            } else {
                if (totalPercent > 100) {
                    const surplus = totalPercent - 100;
                    seller.Percent = seller.Percent - surplus;
                    seller.Amount = seller.Amount * seller.Percent / 100;
                } else {
                    seller.Amount = amount * seller.Percent / 100;
                }
            }
        }
        this.sellerLinks = sellers.concat(deletedSellers);
        this.sellerLinks = this.updateSellersGuid();
        this.entity.Sellers = this.sellerLinks;
        this.entityChange.emit(this.entity);
    }

    onSellerChange(event) {
        this.recalcSellers(event.rowModel);
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
