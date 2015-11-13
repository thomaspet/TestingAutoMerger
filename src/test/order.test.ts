import {
    RootTestComponent,
    TestComponentBuilder,
    afterEach,
    beforeEachProviders,
    beforeEach,
    describe,
    expect,
    inject,
    injectAsync,
    it
} from 'angular2/testing';

import { DOM } from 'angular2/src/core/dom/dom_adapter';

import { ObservableWrapper } from 'angular2/src/facade/async';

import {
    Component,
    provide,
    Injector,
    bind,
    View,
    EventEmitter
} from 'angular2/angular2';

import {
    MockBackend,
    MockConnection,
    ConnectionBackend,
    BaseRequestOptions,
    ResponseOptions,
    Response,
    Http
} from 'angular2/http';

import {Router, RouteParams} from "angular2/router";

import {OrderGrid} from "../app/components/order/order.component";
import {OrderDetail} from "../app/components/order/orderDetail.component";
import {OrderSvc} from "../app/components/order/orderSvc";

describe('Order List component', () => {
    var backend: MockBackend;
    var response;

    beforeEachProviders(()=> [
        BaseRequestOptions,
        MockBackend,
        provide(Http, {
            useFactory: (connectionBackend: ConnectionBackend, defaultOptions: BaseRequestOptions) => {
                return new Http(connectionBackend, defaultOptions);
            },
            deps: [
                MockBackend,
                BaseRequestOptions
            ]
        }),
        provide(OrderSvc, {
            useFactory: (http: Http) => {
                return new OrderSvc(http);
            },
            deps: [
                Http
            ]
        }),
        provide(Router, {useFactory: () => Router}),
        provide(RouteParams, {useFactory: () => new RouteParams({"id":"1"})})
    ]);

    beforeEach(inject([MockBackend], (mockBackend) => {
        var options = new ResponseOptions({
            body: '{"name":"Jeff"}'
        });
        backend = mockBackend;
        response = new Response(options);
    }));

    afterEach(() => backend.verifyNoPendingRequests());

    it('should have options defined', injectAsync([TestComponentBuilder],(tbc) => {
        return tbc.createAsync(OrderGrid).then((fixture)=>{
            var component = fixture.debugElement.componentInstance;
            expect(component.kOptions.height).toEqual(600);
        });
    }));


    it('should work with route params', injectAsync([TestComponentBuilder],(tbc) => {
        return tbc.createAsync(OrderDetail).then((fixture)=>{
            fixture.detectChanges();
            var component = fixture.debugElement.componentInstance;
            expect(component.params.get('id')).toEqual('1');
        });
    }));

    it('should run an async operation',injectAsync([TestComponentBuilder], (tcb) => {
        let ee: any = new EventEmitter();
        backend.connections.subscribe((connection: MockConnection) => {
            connection.mockRespond(response);
            ee.next(2);
        });
        return tcb
            .createAsync(OrderDetail)
            .then((rtc: RootTestComponent) => {
                let comp = rtc.debugElement.componentInstance;
                rtc.detectChanges();
                return new Promise((resolve) => {
                    expect(comp.order.name).toBe('Jeff');
                    resolve();
                });
            });
    }));
});
