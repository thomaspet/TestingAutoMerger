import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {SellerLink, Seller} from '@uni-entities';
import {UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from '@uni-framework/ui/unitable';
import {ErrorService, SellerService} from '@app/services/services';
import {cloneDeep} from 'lodash';

@Component({
    selector: 'seller-links',
    templateUrl: './sellerlinks.html',
    styleUrls: ['./sellerlinks.sass']
})
export class SellerLinks {
    @Input() readonly: boolean;
    @Input() entity;
    @Output() entityChange = new EventEmitter();

    sellerTableConfig: UniTableConfig;
    sellerLinks: SellerLink[];

    sellers: Seller[];
    totalPercent = 0;

    constructor(
        private router: Router,
        private errorService: ErrorService,
        private sellerService: SellerService,
    ) {
        this.sellerService.GetAll().subscribe(
            sellers => {
                this.sellers = sellers;
                this.setupTable();
            },
            err => {
                this.errorService.handle(err);
                this.sellers = [];
                this.setupTable();
            }
        );
    }

    public ngOnChanges() {
        if (this.entity) {
            const sellers = cloneDeep(this.entity.Sellers || []);
            this.sellerLinks = this.setAmountsOnSellers(this.entity, sellers);
            this.updateTotalPercent();
        }
    }

    private setAmountsOnSellers(entity, sellers) {
        const totalAmount = (entity.Items || []).reduce((sum, item) => {
            if (item.Deleted) {
                return sum;
            }

            return sum + (item.SumTotalIncVatCurrency || 0);
        }, 0);

        return (sellers || []).map(seller => {
            if (!seller['_isEmpty'] && !seller.Deleted) {
                seller.Amount = totalAmount * (seller.Percent / 100);
            }

            return seller;
        });
    }

    private setCreateGuidsOnSellers(sellers: SellerLink[]): SellerLink[] {
        return sellers.map(seller => {
            if (!seller.ID && !seller.Deleted) {
                seller._createguid = this.sellerService.getNewGuid();
            }

            return seller;
        });
    }

    private updateTotalPercent() {
        this.totalPercent = this.sellerLinks.reduce((sum, seller) => {
            if (seller.Deleted) {
                return sum;
            }
            return sum + (seller.Percent || 0);
        }, 0);
    }

    onSellerChange(event) {
        if (!event) {
            return;
        }

        const tableData = this.sellerLinks.filter(link => !link['_isEmpty']);

        let sellers = tableData.filter(link => !link.Deleted);
        const deletedSellers = tableData.filter(link => link.Deleted);
        const editedSeller = event.rowModel;

        if (event.field === 'Seller' && sellers.length === 1) {
            editedSeller.Percent = 100;
        } else if (event.field === 'Percent' && sellers.length === 2) {
            const otherSeller = sellers.find(x => event.rowModel !== x);
            if (editedSeller.Percent > 100) {
                editedSeller.Percent = 100;
            }
            otherSeller.Percent = 100 -  editedSeller.Percent;
        }

        sellers = sellers.concat(deletedSellers);
        sellers = this.setCreateGuidsOnSellers(sellers);
        sellers = this.setAmountsOnSellers(this.entity, sellers);

        this.sellerLinks = sellers;
        this.entity.Sellers = this.sellerLinks.filter(s => !s['_isEmpty']);
        this.entityChange.emit(this.entity);

        this.updateTotalPercent();
    }

    public onSellerLinkDeleted(sellerLink) {
        if (sellerLink.ID && sellerLink.Seller) {
            const defaultSeller = this.entity.DefaultSeller;
            if (defaultSeller && defaultSeller.ID === sellerLink.Seller.ID) {
                this.entity.DefaultSeller = null;
                this.entity.DefaultSellerID = null;
            }
        }

        this.entity.Sellers = this.sellerLinks.filter(s => !s['_isEmpty']);
        this.entityChange.emit(this.entity);
        this.updateTotalPercent();
    }

    private setupTable() {
        const sellerCol = new UniTableColumn('Seller', 'Selger',  UniTableColumnType.Select)
            .setDisplayField('Seller.Name')
            .setOptions({
                resource: this.sellers || [],
                displayField: 'Name'
            });

        const percentCol = new UniTableColumn('Percent', 'Prosent', UniTableColumnType.Number);
        const amountCol = new UniTableColumn('Amount', 'Beløp (ink.mva)', UniTableColumnType.Money, false);

        const contextMenuItems: IContextMenuItem[] = [
            {
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
            }
        ];

        this.sellerTableConfig = new UniTableConfig('common.seller.sellerlinks', !this.readonly, true, 15)
            .setDefaultRowData({SellerID: 0})
            .setDeleteButton(!this.readonly)
            .setContextMenu(contextMenuItems)
            .setColumns([sellerCol, percentCol, amountCol])
            .setChangeCallback(event => {
                if (event && event.field === 'Seller') {
                    event.rowModel.SellerID = event.rowModel.Seller.ID;
                }
            });
    }
}
