import { Directive, effect, ElementRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * routerのナビゲーション後にフォーカスを当てます。
 */
@Directive({
  selector: '[appFocusAfterNavigation]',
})
export class FocusAfterNavigation {
  readonly elementRef = inject<ElementRef<unknown>>(ElementRef);
  readonly router = inject(Router);
  readonly navigationEnd = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
  );

  constructor() {
    effect(() => {
      const event = this.navigationEnd();
      if (event == undefined) {
        return;
      }
      if (!(this.elementRef.nativeElement instanceof HTMLElement)) {
        throw new Error('elementRefがHTMLElementではありません');
      }
      this.elementRef.nativeElement.focus();
    });
  }
}
