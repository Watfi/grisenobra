import { Component, input } from '@angular/core';
import { ContactContent } from '../../../core/models/site-content.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  contact = input<ContactContent>();
  year = new Date().getFullYear();
}
