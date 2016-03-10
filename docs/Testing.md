# Testing

# how to run test

```ts

npm run tests

```

Open a browser `http://localhost:9999/tests.html`

All tests should be green


# Write a test

Test should be in the same folder as the file you want to test.

Example:
```    
    if you want to test "./src/app/app.ts"
    You will write a file called "./src/app/app.spec.ts"
```


# Angular2 testing

See an example in `./src/app/app.spec.ts`

## How to create custom matchers

```ts
isValidInvoice: () => ({
    compare: invoice => {
      let result = {};
      result.pass = invoice.ID > 0 && invoice.Date !== null;

      if (result.pass) {
        result.message = `Expected Invoice ${Invoice.ID} to be valid`;
      } else {
        result.message = `Expected Invoice ${Invoice.ID} to be valid, but it was not`;
      }
      return result;
    }
})
```

## How to test a service

**Method 1**: Using the sync injector

```ts
describe('Service: LanguagesService', () => {
  beforeEachProviders(() => [LanguagesService]);

  it('contains English', inject([LanguagesService], (service) => {
    expect(service.get()).toContain('en');
  }));
})
```

**Method 2: ** Using the async injector
```ts
describe('Service: LanguagesService', () => {
  beforeEachProviders(() => [LanguagesService]);

  it('contains English', injectAsync([LanguagesService], (service) => {
    return service.get().then((languages)=>{
        expect(languages).toContain('en');
    });
  }));
})
```

**Method 3**: Instantiting the service
```ts
describe('Service: LanguagesService', () => {
  //without using inject
  beforeEachProviders(() => [LanguagesService]);
  
  it('contains English', () => { 
    let service = new LanguageService();
    expect(service.get()).toContain('en');
  }));
})
```

**Method 4**: Inject the injector
```ts
let counter, greeter;

//using inject API
beforeEach(inject([Counter, Greeter], (c, g) => {
  counter = c;
  greeter = g;
}))

//using Injector
//accepts any number of dependencies without changing inject signature
beforeEach(inject([Injector], injector => {
  counter = injector.get(Counter);
  greeter = injector.get(Greeter);
  ...
})
```

## How to test a Component

Testing a simple component with an @input
```ts
// Usage:    <greeter name="Joe"></greeter> 
// Renders:  <h1>Hello Joe!</h1>
@Component({
  selector: 'greeter',
  template: `<h1>Hello {{name}}!</h1>`
})
export class Greeter { 
  @Input() name;
}
```

We inject the TestComponentBuilder and the component, then we load the component and test it.
```ts

describe('Greeter: component', () => {
  let tcb;
  
  //setup
  beforeEachProviders(() => [
    TestComponentBuilder,
    Greeter
  ]);
  
  beforeEach(inject([TestComponentBuilder], _tcb => { 
    tcb = _tcb
  }));
  
  //specs
  it('should render `Hello World!`', done => {
    tcb.createAsync(Greeter).then(fixture => {
      //get the component class instance
      let greeter = fixture.componentInstance;
      
      //get the rendered template
      let element = fixture.nativeElement;
      
      //set inputs
      greeter.name = 'World';
      
      //apply inputs
      fixture.detectChanges(); //trigger change detection
      
      //check specs
      expect(element.querySelector('h1').innerText).toBe('Hello World!');
      
      //finish the async test
      done();
    })
    .catch(e => done.fail(e));
  });
}) 
```


Read more about Angular2 testing in:

- https://developers.livechatinc.com/blog/testing-angular-2-apps-part-1-beginning/
- https://medium.com/google-developer-experts/angular-2-unit-testing-with-jasmine-defe20421584#.a10w2j3un
- http://blog.jhades.org/
- https://www.xplatform.rocks/2016/02/01/testing-angular2-apps-with-jasmine-and-typescript/

# Code Coverage (TODO)