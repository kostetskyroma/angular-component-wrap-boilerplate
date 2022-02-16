import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnInit,
  Optional,
  Self,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormControlDirective,
  FormControlName,
  FormGroupDirective,
  NgControl,
  NgModel,
} from '@angular/forms';
// import { DestroyableFeature, Features, FormStateDispatcher } from '@app/core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// @Features([DestroyableFeature()])
export class InputComponent implements OnInit, ControlValueAccessor {
  @Input() public label: string | undefined;
  @Input() public placeholder: string = '';
  @Input() public type: string = 'text';
  @Input() public prefixIcon: string | undefined;
  @Input() public autocomplete: 'on' | 'off' = 'off';
  @Input() public readonly: boolean = false;
  @Input() public maxlength: number | undefined;
  @Input()
  @HostBinding('attr.disabled')
  set disabled(disabled: boolean) {
    this.setDisabledState(disabled);
  }

  public readonly destroyed$!: Observable<unknown>;
  public control: FormControl | undefined;

  get required(): boolean {
    if (!this.control?.validator) {
      return false;
    }
    const validation = this.control.validator(new FormControl());
    return validation?.['required'] === true;
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    // @Optional() private readonly formState: FormStateDispatcher | null,
    @Optional() @Self() private readonly ngControl: NgControl
  ) {
    if (this.ngControl !== null) {
      // Setting the value accessor directly (instead of using the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }
  ngOnInit(): void {
    this.setControl();
    // this.subscribeOnSubmitListener();
  }

  setControl(): void {
    if (this.ngControl instanceof FormControlName) {
      const formGroupDirective = this.ngControl
        .formDirective as FormGroupDirective;
      if (formGroupDirective) {
        this.control = formGroupDirective.form.controls[
          this.ngControl.name as string
        ] as FormControl;
      }
    } else if (this.ngControl instanceof FormControlDirective) {
      this.control = this.ngControl.control;
    } else if (this.ngControl instanceof NgModel) {
      this.control = this.ngControl.control;
      this.control.valueChanges
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => this.ngControl.viewToModelUpdate(this.control?.value));
    } else if (!this.ngControl) {
      this.control = new FormControl();
    }
  }

  // subscribeOnSubmitListener(): void {
  //   this.formState?.onSubmit.listen
  //     .pipe(takeUntil(this.destroyed$))
  //     .subscribe(() => {
  //       this.control?.markAsTouched();
  //       this.changeDetectorRef.markForCheck();
  //     });
  // }

  setDisabledState(disabled: boolean): void {
    if (disabled) {
      return this.control?.disable({ emitEvent: false });
    }
    this.control?.enable();
  }

  // These methods are just to make Angular happy.
  // Not needed since the control is passed to the child input (child value accessor)
  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
}
