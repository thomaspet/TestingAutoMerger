import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../AppConfig';
import {UniHttp} from '../../../framework/core/http/http';

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
                return res.json();
            });
    }

    public getObjectives(): Observable<Array<IUmhObjective>> {
        return this.uniHttp.asGET()
            .usingUmhDomain()
            .withEndPoint('om/objectives')
            .send()
            .map((res) => {
                return res.json();
            });
    }

    public getSubscriptions(): Observable<Array<IUmhSubscription>> {
        return this.uniHttp.asGET()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions')
            .send()
            .map((res) => {
                return res.json();
            });
    }

    public createSubscription(subscription: IUmhSubscription):
                                                            Observable<Array<IUmhObjective>> {
        return this.uniHttp.asPOST()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions')
            .withBody(subscription)
            .send()
            .map((res) => {
                return res.json();
            });
    }

    public updateSubscription(subscription: IUmhSubscription):
                                                            Observable<Array<IUmhObjective>> {
        return this.uniHttp.asPUT()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions')
            .withBody(subscription)
            .send()
            .map((res) => {
                return res.json();
            });
    }

    public deleteSubscription(subscriptionId: string): Observable<Array<IUmhObjective>> {
        return this.uniHttp.asDELETE()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions/' + subscriptionId)
            .send()
            .map((res) => {
                return res.json();
            });

    }

    public enableWebhooks(): Observable<IUmhSubscriber> {
        return this.uniHttp.asPOST()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions/enable')
            .send()
            .map((res) => {
                return res.json();
            });
    }

    public isEnabled(): Observable<boolean> {
        return this.uniHttp.asGET()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions/is-enabled')
            .send()
            .map((res) => {
                return res.json();
            });
    }

    public isPermitted(writeOperation: boolean): Observable<boolean> {
        return this.uniHttp.asGET()
            .usingUmhDomain()
            .withEndPoint('web-hooks/subscriptions/is-permitted?writeOperation=' + writeOperation)
            .send()
            .map((res) => {
                return res.json();
            });
    }
}
