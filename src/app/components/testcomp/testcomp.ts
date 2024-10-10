import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-testcomp',
  templateUrl: './testcomp.html',
  styleUrls: ['./testcomp.css']
})
export class Testcomp implements OnInit {
  url = 'https://api.restful-api.dev/objects';
  elements: any[] = [];
  newElement: any = { name: '', data: { capacity: '', screenSize: '', generation: '', price: '' } };
  selectedElement: any = null;
  originalElement: any = null; // Guarda el elemento original para el rollback
  isPopupVisible = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadElements();
  }

  loadElements() {
    this.http.get<any[]>(this.url).subscribe(
      (response) => {
        if (Array.isArray(response)) {
          this.elements = response;
        } else {
          console.error('Response is not an array');
        }
      },
      (error) => console.error('Failed to load elements', error)
    );
  }

  saveElement() {
    // Validar campos antes de guardar
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
    this.http.delete(`${this.url}/${id}`).subscribe(
      () => this.elements = this.elements.filter(e => e.id !== id),
      (error) => console.error('Error deleting element', error)
    );
  }

  viewElement(element: any) {
    this.originalElement = JSON.parse(JSON.stringify(element)); // Clona el elemento
    this.selectedElement = { ...element }; // Clona para la edición
    this.isPopupVisible = true;
  }

  closePopup() {
    // Restaurar los cambios del elemento original al cerrar el modal
    if (this.originalElement) {
      Object.assign(this.selectedElement, this.originalElement);
    }
    this.isPopupVisible = false;
  }

  updateElement() {
    this.http.put<any>(`${this.url}/${this.selectedElement.id}`, this.selectedElement).subscribe(
      (response) => {
        const index = this.elements.findIndex(e => e.id === this.selectedElement.id);
        if (index !== -1) {
          this.elements[index] = response;
        }
        this.isPopupVisible = false;
      },
      (error) => console.error('Error updating element', error)
    );
  }

  resetForm() {
    this.newElement = { name: '', data: { capacity: '', screenSize: '', generation: '', price: '' } };
  }

  isNewElementValid() {
    const { name, data } = this.newElement;
    return name && data.capacity && data.color && data.screenSize && data.generation && !isNaN(data.price) && data.price !== '';
  }
}

