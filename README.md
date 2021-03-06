# Angular Material Grid
This is an alternative solution for standard [mat-table](https://material.angular.io/components/table/overview), made to simplify and minimize fetch and display data in a grid. It can remember currrent grid state, take one single config object to control columns displayed, order, data sorting, cell display format and pagination. You can apply additional custom filters with its logic, change column display format with a rich template. Mobile view is also supported.

See the [demo here.](https://vguleaev.github.io/Angular-Material-Grid/)

![example](https://pp.userapi.com/c847120/v847120416/b2574/SIM9K3ysiW8.jpg)

## Getting started

Install package via npm
```
npm install @vguleaev/angular-material-grid
```

Requires Angular Material to be installed. 
```
npm install @angular/material @angular/cdk
```

Import module with 
```
import { NgMatAutocompleteModule } from '../../node_modules/@vguleaev/angular-material-autocomplete';
```

Use component somewhere in html template
```
<ng-mat-grid> </ng-mat-grid>
```

For more examples [click here](#examples).

 ## Documentation ##

GridComponent has only two attributes. ( or @Input() properties) 

| Attribute Name   |   Type      |     Required   |
| -------------    | ----------  | -------------- | 
|       config     |  GridConfig |    yes         |
|     gridName     |  string     |     no         |
 
 In order to setup a component you **must** provide a ```config``` object. Read about [GridConfig](#gridconfig) right below. <br/><br/>
 Attribute ```gridName``` is needed **only** when 'rememberState' property of config is set to true. This is used to save current grid state in localStorage and then restore it when neeeded.
 
### GridConfig ###
 
 ```
 export class GridConfig {
    searchPlaceholder = 'Search';
    pageSize = 10;
    source:  GridService;
    columns: GridColumn[];
    filters: Type<AbstractGridFilter>[];
    mobileViewColumnIndex = 0;
    rememberState = false;
}
```
 
| Property        | Default Value   |  Description |
| -------------    | --------------  | ------------- |
| searchPlaceholder| "Search"       | Placeholder for search input. |
| pageSize         | 10             | Number. Represents how many items will be displayed per page. <br/> Even if page size is controlled on the server, this number is needed to correctly display paginator. |
| source           |   null        |  Service which implements **GridService** inreface. <br/> <br/> Interface has only one method called 'fetch' that supose to make a request and return at Observable of type **GridData**. <br/> `fetch(params?: HttpParams): Observable<GridData>` <br/><br/> This means you should map result from your API to object of type [GridData](#griddata). |
| columns          | null          | Array of **GridColumn**. Contains all the columns and their config. [GridColumn](#gridcolumn) has such properties like name, label, searchable, sortable, disabled and content. |
| filters          | null          | Array of **AbstractGridFilter**. Create a component that implements AbstractGridFilter interface to change the GridState for specific cases. |
| mobileViewColumnIndex | 0        | Number. Index of column in columns array. Specifies column will be displayed as card header in mobile view. |
| rememberState | false | Boolean. When active all the changes in [GridState](#gridstate) will be saved in localStorage. When you come back to grid page filters, sorting and query can be restored. Dont forget to remove state item if you need to clear grid state. For example, when user logs out or logs in.|

### GridService ### 

Service provided in "source" property of config should implement this interface.

```
export interface GridService {
    fetch(params?: HttpParams): Observable<GridData>;
}
```

### GridData ###

This object should be returned by service you provided in "source" property of GridConfig. 
```
export interface GridData {
    data: any[];
    totalItems: number;
}
```

### GridState ###

GridState object is used to fetch items from server and remember/restore state.

When any change in grid state is performed (search input, sort, page or filter change) current GridState object is encoded with `btoa()` and a GET request is done with query param called **'query'** containing state hash.

e.g. GET `http://yoursite/api/grid?query=OBJECT_HASH_HERE`


```
export class GridState {
    query: string;
    searchColumns: Array<string>;
    orderDirection: 'asc' | 'desc';
    orderBy: string;
    page: number;
    pageSize: number;
    filters: Array<GridFilter> = new Array<GridFilter>();
}
```

| Property        | Default Value   |  Description |
| -------------    | --------------  | ------------- |
| query            |  ""             | String. Current text in search input. |
| searchColumns    |  null           | Array of string. Columns names (not labels) that are marked as `searchable`. Component collects all the names of searchable columns and put them into array. The backend api should implement the logic when text from `query` contains in any of these columns. It represents search by multimple properties. `(firstName == 'Vlad' OR lastName == 'Vlad')` |
| orderDirection   | 'asc'           |  Can be two strings `'asc' or 'desc'`. Represents order direction. |
| orderBy          | ""              | String. Column name by which order is done. |
| page             |  0              | Number. Current page index. |
| pageSize         |  0              | Number. Can be ignored on the backend if size is fixed. When size if fixed you should set the same page size on the GridConfig and on the backend api.|
| filters          | [ ]              | Array of [GridFilter](#gridfilter). Contains all custom filters if they exist. GridFilter has properties like column name, value and type. The backend api should implement the logic along standard search to support additional filters.<br/> <br/> e.g. Show only items with type == 'New'. <br/><br/> In such case TypeFilter has columName = 'type' and value = 'New'.  It represents filter by additional conditions. `((firstName == 'Vlad' OR lastName == 'Vlad') AND type == 'New')` | 
 
### GridColumn ### 

```
export class GridColumn {
    name: string;
    label: string;
    searchable: boolean;
    sortable: boolean;
    content: TemplateRef<any> | (item: any) => string;
    disabled: boolean;
}
```
*Name*       : Represnets unique name to identify column when implement searching or filterting.  <br/>
*Label*      : String shows in table header. <br/>
*Searcheable*: Saves column name in searchColumns array of GridState. <br/>
*Sortable*   : Make this column available for sorting. <br/>
*Disabled*   : Hides the column from UI. <br/>
*Conent*     : Is used to change display format for column. You can a pass a function or TemplateRef.  <br/><br/>

Function recieves item for current row and does any logic you want. (e.g. (item:any) => item.toLowerCase() ). <br/>
TemplateRef is an HTML template saved as @ViewChild in component from above and passed as a reference. Tempalte should be <ng-template> attribute that recieves item as context.  <br/>
**Note that @ViewChild is not availble in contructor yet. Use ngAfterViewInit() or ngOnInit()!** <br/>

See example below for delete icon template.

```javascript
@ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
gridOptions: GridConfig = new GridConfig();

this.gridOptions.push(
        {
          name: 'actions',
          label: '',       // hides label from table <td>
          searchable: false,
          sortable: false,
          disabled: false,
          content: this.actionsTemplate
        }
)
```

```html
// html tempalte
<ng-template #actionsTemplate let-item="item">
  <div class="actions-buttons">
    <button mat-icon-button (click)="deleteEntity(item)"><mat-icon aria-label="delete">delete</mat-icon></button>
  </div>
</ng-template>

```

 ### GridFilter ### 
 
 ```
 export class GridFilter {
    name: string;
    columnName: string;
    value: string;
    type: GridFilterType;
}

export enum GridFilterType {
    Equals = 1,
    Contains = 2,
    Between = 3
}
```
To add custom filters you should create new component and implement *AbstractGridFilter* interface. This component will be created dynamically through componentFactory and a reference to grid component will be passed to property *filterService: FilterService*.

You can implement any logic to add or remove filters to state and also call fetch by demand. <br/>
**Dont forget to add this component into entryComponents array in your module!**

```javascript
gridOptions: GridConfig = new GridConfig();

this.gridOptions.filters = [PositionFilterComponent];

// position-filter.component.ts
export class PositionFilterComponent implements AbstractGridFilter, OnInit {
  public filterService: FilterService;
  public name: string;
  public savedFilter: GridFilter;
  // ...  
}
```

See here how to implement a [custom filter](#custom-filter).

## Examples

> Component can not be used without proper defined config object.

### Basic usage

This example defines a grid with two columns (Id and Name). Both are displayed and sortable, but search should be implemented only by name, because this column is marked as searchable. 

All fetch logic is implemented in dataService service which should implement [GridService](#gridservice) interface. When any event like search, sort, next page is fired, method with name 'fetch' is called from dataService object. This method is expected to return an Observable of [GridData](#griddata).

```javascript
  // in ts file
  gridConfig: GridConfig = new GridConfig();
  gridName: string = 'usersGrid';
  
  constructor(private dataService: DataService) {
      this.gridOptions = {
        searchPlaceholder: 'Search by name',
        source: this.dataService,
        pageSize: 5,
        mobileViewColumnIndex: 1,
        rememberState: false,
        filters: [],
        columns: [{
          name: 'id',
          label: 'Id',
          searchable: false,
          sortable: true,
          disabled: false,
          content: (item: any) => item.id
        },
        {
          name: 'name',
          label: 'Name',
          searchable: true,
          sortable: true,
          disabled: false,
          content: (item: any) => item.name
        }
      ]} as GridConfig;
  }
```
```html
  // in html template
  <ng-mat-grid [config]="gridConfig" [gridName]="gridName"> </ng-mat-grid>
```
### Content projection

If you want to use the space above the grid right after search input and filters (if they exist), you can use Angular content projection. See example below:

```html
  <ng-mat-grid [config]="gridOptions" [gridName]="'testGrid'">
    <app-grid-settings></app-grid-settings>
  </ng-mat-grid>
```
Use any html or component instead of <app-grid-settings> to render something above the grid but inside GridComponent div.

### Custom filter

Here you can find a simple example how to implement filter by some Outcome type. We create a component and implement AbstractGridFilter.

```
export interface AbstractGridFilter {
    filterService: FilterService;
    name: string;
    savedFilter: GridFilter;
}
```

In tempalte we render a select for types. When user selects it onChange() function fires. It insert a filter to state and calls fetch, so we get a filtered result back. 

If you want to use remeber state feature you must to implement a restore logic to filter from savedFilter property. Name also is required to save/restore filter from localStorage.

```html
<div class="outcome-filter">
    <mat-form-field>
        <mat-select placeholder="Filter by Outcome" [(ngModel)]="selectedValue" (ngModelChange)="onChange($event)">
          <mat-option [value]="null">No filter</mat-option>
          <ng-template ngFor let-item="$implicit" [ngForOf]="outcomes">
              <mat-option [value]="item.name">
                  {{item.name}}
                </mat-option>
          </ng-template>
        </mat-select>
    </mat-form-field>
</div>
```

```javascript
export class OutcomeFilterComponent implements OnInit, AbstractGridFilter {
    public filterService: FilterService;;
    public name = "OutcomeFilter";
    public savedFilter: GridFilter;

    selectedValue = "";
    outcomes: Outcome[] = new Array<Outcome>();

    constructor(private outcomeService: OutcomeService) {
        this.outcomeService.fetch().then(outcomes => this.outcomes = outcomes);
    }

    ngOnInit(): void {
        if (!this.filterService) { throw new Error("FilterService reference is required for filter."); }

        if (this.savedFilter) {
            this.selectedValue = this.savedFilter.value;
        }
    }

    onChange(value: any) {
        if (value) {
            const filter = new GridFilter();
            filter.name = this.name;
            filter.columnName = "outcome";
            filter.value = this.selectedValue;
            filter.type = GridFilterType.Equals;

            this.filterService.upsertFilter(filter);
            this.filterService.fetch();
        } else {
            this.filterService.removeFilter(this.name);
            this.filterService.fetch();
        }
    }
}
```


