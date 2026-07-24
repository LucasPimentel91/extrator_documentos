import { Component } from "@angular/core";

@Component({
  selector: "app-human-review-notice",
  standalone: true,
  template: `
    <aside
      class="notice"
      data-testid="human-review-notice"
      aria-labelledby="human-review-title"
    >
      <h2 id="human-review-title">Confirme as informações no documento</h2>
      <p>
        A análise automatizada pode conter erros e não substitui revisão humana
        nem interpretação jurídica.
      </p>
    </aside>
  `,
  styles: `
    .notice {
      padding: 1rem;
      border: 2px solid #b45309;
      border-radius: 0.75rem;
      background: #fffbeb;
      color: #451a03;
    }

    .notice h2 {
      margin-top: 0;
      font-size: 1.1rem;
    }

    .notice p {
      margin-bottom: 0;
    }
  `,
})
export class HumanReviewNoticeComponent {}
