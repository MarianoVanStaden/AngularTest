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
  newElement: any = { name: '', data: { capacity: '', color: '', screenSize: '', generation: '', price: '' } };
  selectedElement: any = null;
  originalElement: any = null;
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
    // Clona el elemento original para el rollback
    this.originalElement = JSON.parse(JSON.stringify(element));
    this.selectedElement = element; // Usa directamente el elemento para data binding
    this.isPopupVisible = true;
  }

  closePopup() {
    // Restaura el elemento original al cerrar el modal
    if (this.originalElement) {
      const index = this.elements.findIndex(e => e.id === this.originalElement.id);
      if (index !== -1) {
        this.elements[index] = this.originalElement; // Restaura el valor original
      }
    }
    this.isPopupVisible = false;
  }

  updateElement() {
    this.http.put<any>(`${this.url}/${this.selectedElement.id}`, this.selectedElement).subscribe(
      (response) => {
        const index = this.elements.findIndex(e => e.id === this.selectedElement.id);
        if (index !== -1) {
          this.elements[index] = response; // Actualiza el elemento en la lista
        }
        this.isPopupVisible = false; // Cierra el modal después de actualizar
      },
      (error) => console.error('Error updating element', error)
    );
  }

  resetForm() {
    this.newElement = { name: '', data: { capacity: '', color: '', screenSize: '', generation: '', price: '' } };
  }

  isNewElementValid() {
    const { name, data } = this.newElement;
    return name && data.capacity && data.color && data.screenSize && data.generation && !isNaN(data.price) && data.price !== '';
  }
}
