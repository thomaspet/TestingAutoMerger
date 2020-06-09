import {Component, ErrorHandler, EventEmitter} from '@angular/core';
import {IModalOptions} from '@uni-framework/uni-modal';
import {AssetsService} from '@app/services/common/assetsService';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {Router} from '@angular/router';
import {take} from 'rxjs/operators';
import {AssetsStore} from '@app/components/accounting/assets/assets.store';

@Component({
    selector: 'delete-asset-modal',
    templateUrl: './delete-asset-modal.html'
})
export class DeleteAssetModal {
    options: IModalOptions;
    onClose = new EventEmitter();

    constructor(
        private store: AssetsStore,
        private assetService: AssetsService,
        private router: Router,
        private errorHandler: ErrorHandler,
        private toast: ToastService) {}

    remove() {
        // TODO: use assetsActions instead of assetService (avoid circular dependency splittinc actions in different files).
        this.assetService.deleteAsset(this.options.data.assetID).pipe(take(1)).subscribe(result => {
            this.toast.addToast('Eiendel slettet', ToastType.good, 5);
            this.onClose.emit(true);
            this.router.navigateByUrl('/accounting/assets').then(() => {
                this.store.emit(); // tells store observers that something happens into the state
            });
        }, (error) => this.errorHandler.handleError(error));
    }
}
