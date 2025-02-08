import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-auth',
  imports: [MatButtonModule],
  template: `
    <button
      mat-button
      type="button"
      (click)="onSubmit()"
      class="button block"
      [disabled]="loading"
    >
      {{ loading ? 'Loading' : 'Send magic link' }}
    </button>
  `,
})
export class AuthComponent {
  loading = false;
  supabase = inject(SupabaseService);
  formBuilder = inject(FormBuilder);

  async onSubmit(): Promise<void> {
    try {
      this.loading = true;
      const { error } = await this.supabase.signIn();
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }
}
