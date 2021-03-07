import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
  DoCheck,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'mat-select-autocomplete',
  template: `
    <mat-form-field class="select-autocomplete" appearance="{{ appearance }}">
    <mat-label *ngIf="fieldLabel">{{ fieldLabel }}</mat-label>
      <mat-select
        #selectElem
        id="{{fieldsSelectors?.selectField}}"
        [placeholder]="placeholder"
        [(ngModel)]="selectedValue"
        [formControl]="fieldFormControl"
        [multiple]="multiple"
        (selectionChange)="onSelectionChange($event)"
      >
        <div class="box-search">
          <mat-checkbox
            *ngIf="multiple"
            color="primary"
            class="box-select-all"
            [(ngModel)]="selectAllChecked"
            (change)="toggleSelectAll($event)"
          ></mat-checkbox>
          <input
            #searchInput
            id="{{fieldsSelectors?.inputField}}"
            type="text"
            [ngClass]="{ 'pl-1': !multiple }"
            (input)="filterItem(searchInput.value)"
            [placeholder]="selectPlaceholder"
          />
          <div
            class="box-search-icon"
            (click)="filterItem(''); searchInput.value = ''"
          >
            <button mat-icon-button class="search-button">
              <mat-icon class="mat-24" aria-label="Search icon" id="{{fieldsSelectors?.clearFieldIcon}}">clear</mat-icon>
            </button>
          </div>
        </div>
        <mat-select-trigger>
          {{ onDisplayString() }}
        </mat-select-trigger>
        <mat-option
          *ngFor="let option of options; trackBy: trackByFn"
          [disabled]="option.disabled"
          [value]="option[value]"
          [style.display]="hideOption(option) ? 'none' : 'flex'"
          >{{ option[display] }}
        </mat-option>
      </mat-select>
      <mat-hint style="color:red" *ngIf="showErrorMsg">{{ errorMsg }}</mat-hint>
    </mat-form-field>
  `,
  styles: [
    `
      .box-search {
        margin: 8px;
        border-radius: 2px;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16),
          0 0 0 1px rgba(0, 0, 0, 0.08);
        transition: box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
      }
      .box-search input {
        flex: 1;
        border: none;
        outline: none;
      }
      .box-select-all {
        width: 36px;
        line-height: 33px;
        color: #808080;
        text-align: center;
      }
      .search-button {
        width: 36px;
        height: 36px;
        line-height: 33px;
        color: #808080;
      }
      .select-autocomplete{
        width: 100%;
        font-size: 15px;
      }
      ::ng-deep .select-autocomplete label {
        font-weight: bold;
      }
      .pl-1 {
        padding-left: 1rem;
      }
    `
  ]
})
export class SelectAutocompleteComponent implements OnChanges, OnInit, DoCheck {
  @Input() selectPlaceholder = 'search...';
  @Input() placeholder: string;
  @Input() options$;
  @Input() disabled = false;
  @Input() display = 'display';
  @Input() value = 'value';
  @Input() fieldFormControl: FormControl = new FormControl();
  @Input() errorMsg = 'Field is required';
  @Input() showErrorMsg = false;
  @Input() selectedOptions;
  @Input() multiple = true;
  @Input() fieldLabel: string;
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  // New Options
  @Input() labelCount = 1;
  @Input() appearance: 'standard' | 'fill' | 'outline' = 'standard';
  @Input() fieldsSelectors: ElementsSelectors;

  @Output()
  selectionChange: EventEmitter<any> = new EventEmitter();

  @ViewChild('selectElem') selectElem;
  @ViewChild('searchInput') searchInput;

  filteredOptions: Array<any> = [];
  selectedValue: Array<any> = [];
  selectAllChecked = false;
  displayString = '';
  options: Array<any> = [];
  constructor() { }

  ngOnChanges() {
    if (this.disabled) {
      this.fieldFormControl.disable();
    } else {
      this.fieldFormControl.enable();
    }
    if (this.selectedOptions) {
      this.selectedValue = this.selectedOptions;
    } else if (this.fieldFormControl.value) {
      this.selectedValue = this.fieldFormControl.value;
    }
  }

  ngOnInit() {
    this.onSearch.emit('');
    this.options$.subscribe(res => {
      this.filteredOptions = res;
      this.options = [...res, ...this.options];
    });
  }

  ngDoCheck() {
    if (!this.selectedValue.length) {
      this.selectionChange.emit(this.selectedValue);
    }
  }

  toggleDropdown() {
    this.selectElem.toggle();
  }

  toggleSelectAll(val) {
    if (val.checked) {
      this.filteredOptions.forEach(option => {
        if (!this.selectedValue.includes(option[this.value])) {
          this.selectedValue = this.selectedValue.concat([option[this.value]]);
        }
      });
    } else {
      const filteredValues = this.getFilteredOptionsValues();
      this.selectedValue = this.selectedValue.filter(
        item => !filteredValues.includes(item)
      );
    }
    this.selectionChange.emit(this.selectedValue);
  }

  filterItem(value) {
    /**
     * search in the static options
     */
    // this.filteredOptions = this.options.filter(
    //   item =>
    //     item[this.display].toLowerCase().indexOf(value.toLowerCase()) > -1);
    // this.selectAllChecked = true;
    // this.filteredOptions.forEach(item => {
    //   if (!this.selectedValue.includes(item[this.value])) {
    //     this.selectAllChecked = false;
    //   }
    // });
    // if (!this.filteredOptions.length) {
    //   this.selectAllChecked = false;
    // }
    /**
     * emit event with written value to search with api call
     */
    this.onSearch.emit(value);
  }

  hideOption(option) {
    return !(this.filteredOptions.indexOf(option) > -1);
  }

  // Returns plain strings array of filtered values
  getFilteredOptionsValues() {
    const filteredValues = [];
    this.filteredOptions.forEach(option => {
      filteredValues.push(option[this.value]);
    });
    return filteredValues;
  }

  onDisplayString() {
    this.displayString = '';
    if (this.selectedValue && this.selectedValue.length) {
      let displayOption = [];
      if (this.multiple) {
        // Multi select display
        for (let i = 0; i < this.labelCount; i++) {
          displayOption[i] = this.options.filter(
            option => option[this.value] === this.selectedValue[i]
          )[0];
        }
        if (displayOption.length) {
          for (let i = 0; i < displayOption.length; i++) {
            if (displayOption[i] && displayOption[i][this.display]) {
              this.displayString += displayOption[i][this.display] + ',';
            }
          }
          this.displayString = this.displayString.slice(0, -1);
          if (
            this.selectedValue.length > 1 &&
            this.selectedValue.length > this.labelCount
          ) {
            this.displayString += ` (+${this.selectedValue.length -
              this.labelCount} others)`;
          }
        }
      } else {
        // Single select display
        displayOption = this.options.filter(
          option => option[this.value] === this.selectedValue
        );
        if (displayOption.length) {
          this.displayString = displayOption[0][this.display];
        }
      }
    }
    return this.displayString;
  }

  onSelectionChange(val) {
    const filteredValues = this.getFilteredOptionsValues();
    let count = 0;
    if (this.multiple) {
      this.selectedValue.filter(item => {
        if (filteredValues.includes(item)) {
          count++;
        }
      });
      this.selectAllChecked = count === this.filteredOptions.length;
    }
    this.selectedValue = val.value;
    this.selectionChange.emit(this.selectedValue);
    this.searchInput.nativeElement.value = '';
    this.onSearch.emit('');
  }

  public trackByFn(index, item) {
    return item[this.value];
  }
}

export interface ElementsSelectors {
  inputField: string;
  selectField: string;
  clearFieldIcon: string;
}
