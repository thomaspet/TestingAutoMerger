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
            this.sellerLinks = cloneDeep(this.entity.Sellers) || [];
        }
    }

    onSellerLinksChange() {
        const sellerLinks = this.sellerLinks
            .filter(link => !link['_isEmpty'])
            .map(link => {
                if (!link.ID) {
                    link['_createGuid'] = this.sellerLinkService.getNewGuid();
                }

                return link;
            });

        this.entity.Sellers = sellerLinks;
        this.entityChange.emit(this.entity);
    }

    public onSellerLinkDeleted(sellerLink) {
        if (sellerLink.ID && sellerLink.Seller) {
            const defaultSeller = this.entity.DefaultSeller;
            if (defaultSeller && defaultSeller.ID === sellerLink.Seller.ID) {
                this.entity.DefaultSeller = null;
                this.entity.DefaultSellerID = null;
                this.entityChange.emit(this.entity);
            }
        }
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
