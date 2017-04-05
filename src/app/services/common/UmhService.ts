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
            .sendToUrl(AppConfig.UNI_MESSAGE_HUB_URL + 'actions');
    }

    public getObjectives(): Observable<Array<IUmhObjective>> {
        return this.uniHttp.asGET()
            .sendToUrl(AppConfig.UNI_MESSAGE_HUB_URL + 'objectives');
    }

    public getSubscriptions(subscriberId: string): Observable<Array<IUmhSubscription>> {
        return this.uniHttp.asGET()
            .sendToUrl(AppConfig.UNI_MESSAGE_HUB_URL + 'subscribers/' + subscriberId + '/subscriptions');
    }

    public createSubscription(subscriberId: string, subscription: IUmhSubscription):
                                                            Observable<Array<IUmhObjective>> {
        return this.uniHttp.asPOST()
            .withBody(subscription)
            .sendToUrl(AppConfig.UNI_MESSAGE_HUB_URL + 'subscribers/' + subscriberId + '/subscriptions');
    }

    public updateSubscription(subscriberId: string, subscription: IUmhSubscription):
                                                            Observable<Array<IUmhObjective>> {
        return this.uniHttp.asPUT()
            .withBody(subscription)
            .sendToUrl(AppConfig.UNI_MESSAGE_HUB_URL + 'subscribers/' + subscriberId
                                                    + '/subscriptions/' + subscription.id);
    }

    public deleteSubscription(subscriberId: string, subscriptionId: string): Observable<Array<IUmhObjective>> {
        return this.uniHttp.asDELETE()
            .sendToUrl(AppConfig.UNI_MESSAGE_HUB_URL + 'subscribers/' + subscriberId
                                                    + '/subscriptions/' + subscriptionId);
    }

    public createSubscriber(subscriber: IUmhSubscriber): Observable<IUmhSubscriber> {
        return this.uniHttp.asPOST()
            .withBody(subscriber)
            .sendToUrl(AppConfig.UNI_MESSAGE_HUB_URL + 'subscribers');
    }

    public getSubscriber(subscriberId: string): Observable<IUmhSubscription> {
        return this.uniHttp.asGET()
            .sendToUrl(AppConfig.UNI_MESSAGE_HUB_URL + 'subscribers/' + subscriberId);
    }

    public getCluster(clusterId: string): Observable<IUmhSubscription> {
        return this.uniHttp.asGET()
            .sendToUrl(AppConfig.UNI_MESSAGE_HUB_URL + 'clusters/' + clusterId);
    }
    
    public createCluster(cluster: IUmhCluster): Observable<IUmhSubscriber> {
        return this.uniHttp.asPOST()
            .withBody(cluster)
            .sendToUrl(AppConfig.UNI_MESSAGE_HUB_URL + 'clusters');
    }
}
