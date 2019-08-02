import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {UniHttp} from '../../../framework/core/http/http';

export enum SubscriptionState {
        Unchanged = 0,
        New = 1,
        Deleted = 2,
        Changed = 3
}

export interface IUmhAction {
    id?: string;
    Name?: string;
}

export interface IUmhObjective {
    id?: string;
    Name?: string;
}

export interface IUmhSubscription {
    id?: string;
    Name?: string;
    SubscriberId?: string;
    Url?: string;
    Enabled?: boolean;

    ClusterId?: string;
    AppModuleId?: string;
    ObjectiveId?: string;
    ActionId?: string;

    State?: SubscriptionState;
}

export interface IUmhSubscriber {
    id?: string;
    Name?: string;
    SubscriptionIds?: string[];
    ClusterIds?: string[];
}

export interface IUmhCluster {
    id?: string;
    Name?: string;
    NativeObjectKey?: string;
}

@Injectable()
export class UmhService {
    constructor(private uniHttp: UniHttp) {

    }

    public getActions(): Observable<Array<IUmhAction>> {
        return this.uniHttp.asGET()
            .usingUmhDomain()
            .withEndPoint('om/actions')
            .send()
            .map((res) => {
                return res.body;
            });
    }

    public getObjectives(): Observable<Array<IUmhObjective>> {
        return this.uniHttp.asGET()
            .usingUmhDomain()
            .withEndPoint('om/objectives')
            .send()
            .map((res) => {
                return res.body;
            });
    }

    public getSubscriptions(): Observable<Array<IUmhSubscription>> {
        return this.uniHttp.asGET()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions')
            .send()
            .map((res) => {
                return res.body;
            });
    }

    public createSubscription(subscription: IUmhSubscription): Observable<IUmhSubscription> {
        return this.uniHttp.asPOST()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions')
            .withBody(subscription)
            .send()
            .map((res) => {
                return res.body;
            });
    }

    public updateSubscription(subscription: IUmhSubscription): Observable<IUmhSubscription> {
        return this.uniHttp.asPUT()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions')
            .withBody(subscription)
            .send()
            .map((res) => {
                return res.body;
            });
    }

    public deleteSubscription(subscriptionId: string): Observable<any> {
        return this.uniHttp.asDELETE()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions/' + subscriptionId)
            .send()
            .map((res) => {
                console.log(res);
                return res.body;
            });
    }

    public enableWebhooks(): Observable<IUmhSubscriber> {
        return this.uniHttp.asPOST()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions/enable')
            .send()
            .map((res) => {
                return res.body;
            });
    }

    public isEnabled(): Observable<boolean> {
        return this.uniHttp.asGET()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions/is-enabled')
            .send()
            .map((res) => {
                return res.body;
            });
    }

    public isPermitted(writeOperation: boolean): Observable<boolean> {
        return this.uniHttp.asGET()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions/is-permitted?writeOperation=' + writeOperation)
            .send()
            .map((res) => {
                return res.body;
            });
    }

    public save(subscriptions: IUmhSubscription[]): Observable<any> {
        var save = Observable.from(subscriptions). mergeMap((subscription: IUmhSubscription) => {
            console.log('SAVE:' + JSON.stringify(subscription));
            switch (subscription.State) {
                case SubscriptionState.New:
                    console.log('POST');
                    return this.createSubscription(subscription).map((res) => { return res; });
                case SubscriptionState.Deleted:
                    console.log('DELETE');
                    return this.deleteSubscription(subscription.id);
                case SubscriptionState.Changed:
                    console.log('PUSH');
                    return this.updateSubscription(subscription);
                default:
                    ;
            }
        });
        return save;
    }
}
