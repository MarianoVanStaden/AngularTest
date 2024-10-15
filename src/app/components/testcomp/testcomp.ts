import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-testcomp',
  templateUrl: './testcomp.html',
  styleUrls: ['./testcomp.css']
})
export class Testcomp implements OnInit {
  url = 'https://api.restful-api.dev/objects';
  elements: any[] = [];
  newElement: any = { name: '', data: { capacity: '', color: '', screenSize: '', generation: '', price: '' } };
  selectedElement: any = null;
  isPopupVisible = false;
  deleteEnabled = false;
  apiElements: Set<string> = new Set();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadElements();
  }

  loadElements() {
    this.http.get<any[]>(this.url).subscribe(
      (response) => {
        if (Array.isArray(response)) {
          this.elements = response;
          this.apiElements = new Set(response.map(element => element.id));
        } else {
          console.error('Response is not an array');
        }
      },
      (error) => console.error('Failed to load elements', error)
    );
  }
  
  saveElement() {
    if (this.isNewElementValid()) {
      this.http.post<any>(this.url, this.newElement).subscribe(
        (response) => {
          this.elements.push(response);
          this.resetForm();
        },
        (error) => console.error('Error adding element', error)
      );
    } else {
      alert('Por favor completa todos los campos requeridos y asegúrate de que el precio sea un número.');
    }
  }

  deleteElement(id: string) {
    if (!this.apiElements.has(id)) {
      this.http.delete(`${this.url}/${id}`).subscribe(
        () => {
          this.elements = this.elements.filter(e => e.id !== id);
          this.cdr.detectChanges();
        },
        (error) => console.error('Error deleting element', error)
      );
    } else {
      console.warn('Cannot delete API elements');
    }
  }

  viewElement(element: any) {
    this.selectedElement = JSON.parse(JSON.stringify(element));
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
    this.selectedElement = null;
  }

  updateElement() {
    if (!this.apiElements.has(this.selectedElement.id)) {
      this.http.put<any>(`${this.url}/${this.selectedElement.id}`, this.selectedElement).subscribe(
        (response) => {
          const index = this.elements.findIndex(e => e.id === this.selectedElement.id);
          if (index !== -1) {
            this.elements[index] = { ...this.elements[index], ...response };
            this.cdr.detectChanges();
          }
          this.closePopup();
        },
        (error) => {
          console.error('Error updating element', error);
        }
      );
    } else {
      console.warn('Cannot update API elements');
      this.closePopup();
    }
  }

  resetForm() {
    this.newElement = { name: '', data: { capacity: '', color: '', screenSize: '', generation: '', price: '' } };
  }

  isNewElementValid() {
    const { name, data } = this.newElement;
    return name && data.capacity && data.color && data.screenSize && data.generation && !isNaN(data.price) && data.price !== '';
  }

  disableDeleteButtons() {
    this.deleteEnabled = false;
  }
}