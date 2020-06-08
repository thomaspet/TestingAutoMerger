import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';
import {Asset} from '@uni-entities';

export interface IAssetState {
    assets: Asset[];
    loadingAssets: boolean;
    currentAsset: Asset | null;
    loadingCurrentAsset: boolean;
    assetIsDirty: boolean;
}

@Injectable()
export class AssetsStore {

    private _state = new BehaviorSubject<IAssetState>({
        assets: [],
        loadingAssets: false,
        currentAsset: null,
        loadingCurrentAsset: false,
        assetIsDirty: false
    });
    readonly state$ = this._state.asObservable();

    constructor(private router: Router) {
    }
    emit() {
        const state = this.state;
        this.state = {...state};
    }
    get state(): IAssetState {
        return this._state.getValue();
    }
    set state(val: IAssetState) {
        this._state.next(val);
    }

    set currentAsset(val: Asset) {
        const state = this.state;
        this.state = {...state, currentAsset: val};
    }
    get currentAsset(): Asset {
        return this._state.getValue().currentAsset;
    }

    set assetIsDirty(val: boolean) {
        const state = this.state;
        this.state = {...state, assetIsDirty: val};
    }
    get assetIsDirty(): boolean {
        return this._state.getValue().assetIsDirty;
    }
}
