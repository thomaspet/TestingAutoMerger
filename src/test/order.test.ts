import {
    iit,
    it,
    ddescribe,
    describe,
    expect,
    inject,
    injectAsync,
    TestComponentBuilder,
    beforeEachProviders,
    fakeAsync,
    tick
} from 'angular2/testing';

import { Component, provide } from 'angular2/angular2';
import {OrderGrid} from "../app/components/order/order.component";
import {OrderDetail} from "../app/components/order/orderDetail.component";
import {Http} from "angular2/http";
import {Router, RouteParams} from "angular2/router";

describe('Order List component', () => {

    beforeEachProviders(()=> [
        provide(Http,{useFactory: () => Http }),
        provide(Router, {useFactory: () => Router}),
        provide(RouteParams, {useFactory: () => new RouteParams({"id":"1"})})
    ]);

    it('should have options defined', injectAsync([TestComponentBuilder],(tbc) => {
        return tbc.createAsync(OrderGrid).then((fixture)=>{
            var component = fixture.debugElement.componentInstance;
            expect(component.kOptions.height).toEqual(600);
        });
    }));


    it('work with route params', injectAsync([TestComponentBuilder],(tbc) => {
        return tbc.createAsync(OrderDetail).then((fixture)=>{
            fixture.detectChanges();
            var component = fixture.debugElement.componentInstance;
            expect(component.params.get('id')).toEqual('1');
        });
    }));
});
