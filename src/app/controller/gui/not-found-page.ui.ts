import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * 404ページ
 */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <div class="grid h-full place-items-center">
      <div class="flex flex-col place-items-center">
        <h2>404</h2>
        <p>指定されたURLのページは見つかりませんでした！</p>
        <a routerLink="/">トップページに戻る</a>
      </div>
    </div>
  `,
  styles: ``,
})
export class NotFoundPageUi {}
