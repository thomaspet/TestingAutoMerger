## UniForm

UniForm is a component to display forms based on configuration files.

## UniForm Component

#### API

## `UniForm.ready`

It is an observable that emits form component when all fields are ready.
Ready means that `ngAfterViewInit` has run
``ts
form.ready.subscribe((form:UniForm) => { 
    // do what you want with the form
});
``

This methods is useful when you want to be sure that all the DOM and values are ready

## `UniForm.submit`

It is an observable that emits the form value each time submit button is clicked
``ts
form.submit.subscribe((form: ControlGroup) => { 
    // do what you want with the ControlGroup
});
``

## `UniForm.Value`

This is a getter and setter of the form value
It doesn't set the Model value.
``ts
form.Value = formValue
``

## `UniForm.Model`

This is a getter and setter of the model linked to the form
It refreshes the instance of the model and update form value
``ts
form.Value = formValue
``


## `UniForm.sync`

It sets the model to the form value.
Each time you call sync form sets values in the model
with the same value that the control attached has.
``ts
form.sync()
``

#### Display UniForm in your components
To display a UniForm inside your component you have different ways:

2. Declare it explicitly in a template

```html

<uni-form [config]="config" (uniSubmitEvent)="onSubmit()"></uni-form>

```

Notice you have two elements:
 - an *input*: the **config** 
 - an *output*: the **submit event**
 
3. Load with the `UniComponentLoader`

Template:
```html
<uni-component-loader></uni-component-loader>
```

Component declaration:
```ts
@ViewChild(UniComponentLoader)
uniCmpLoader: UniComponentLoader;
```

Load component explicitly:
```ts
self.uniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
    cmp.instance.config = self.form;
    cmp.instance.ready.subscribe((form:UniForm)=>self.formInstance = form);
});
```

## How to Build a UniField

1. From a configuration object (can come from server):

```ts
interface IFieldLayout {
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}
```

```ts
var field = UniField.fromLayoutConfig(x: IFieldLayout);
```

2. Programatically:

Using the corresponding Builder.

```typescript
var vatCode = new UniFieldBuilder();
vatCode.setLabel('MVA kode.')
    .setModel(this.model)
    .setModelField('VatCode')
    .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT])
```

## Grouping UniFields

Level of grouping has that priority:

`UniForm -> UniSection -> UniFieldset -> UniComboField -> UniField`

UniForm, UniSection, UniFieldset and UniComboField are grouping elements.

That means they have the ability of adding fields:

```ts
var field = new UniField();
var group = new UniSection();
group.addField(field);
```

- **UniForm can't contain other UniForms**
- **UniSection can't contain other UniSections or UniForms**
- **UniFieldset can't contain other UniForms, UniSections or UniFieldsets**
- **UniComboField can't contain other UniForms, UniSections, UniFieldsets or UniComboFields**