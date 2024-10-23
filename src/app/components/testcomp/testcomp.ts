import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';


interface Element {
  id: string;
  name: string;
  data: any; // Cambiado para ser más flexible con la estructura de data.
  localId?: number;
}

@Component({
  selector: 'app-testcomp',
  templateUrl: './testcomp.html',
  styleUrls: ['./testcomp.css']
})
export class Testcomp implements OnInit {
  url = 'https://api.restful-api.dev/objects';
  elements: Element[] = [];
  newElement: Element = { id: '', name: '', data: {} };
  selectedElement: Element | null = null;
  editingElement: Element | null = null;
  isPopupVisible = false;
  apiElements: Set<string> = new Set();
  nextLocalId = 1;
  isLoading = false; 

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadElements();
  }

  loadElements() {
    this.http.get<Element[]>(this.url).subscribe(
      (response) => {
        if (Array.isArray(response)) {
          this.elements = response.map(element => ({ ...element, localId: undefined }));
          this.apiElements = new Set(response.map(element => element.id));
          this.nextLocalId = this.elements.length + 1;
        } else {
          console.error('Response is not an array');
        }
      },
      (error) => console.error('Failed to load elements', error)
    );
  }

  // Función para obtener los valores flexiblemente
  getDataField(data: any, field: string) {
    if (!data) return '-';
    const keys = Object.keys(data);
    const foundKey = keys.find(k => k.toLowerCase() === field.toLowerCase());
    return foundKey ? data[foundKey] : '-';
  }

  saveElement() {
    if (this.isNewElementValid()) {
      this.isLoading = true; // Activa el spinner
    
      const newElementWithLocalId = { ...this.newElement, localId: this.nextLocalId };
      this.http.post<Element>(this.url, newElementWithLocalId).subscribe(
        (response) => {
          const savedElement = { ...response, localId: this.nextLocalId };
          this.elements.push(savedElement);
          this.nextLocalId++;
          this.resetForm();
          this.isLoading = false; // Desactiva el spinner
          this.cdr.detectChanges();
          
          // Mostrar SweetAlert de éxito
          Swal.fire('Success', 'Element added successfully!', 'success');
        },
        (error) => {
          console.error('Error adding element', error);
          this.isLoading = false; // Desactiva el spinner en caso de error
          
          // Mostrar SweetAlert de error
          Swal.fire('Error', 'Failed to add element.', 'error');
        }
      );
    } else {
      Swal.fire('Validation Error', 'Please complete all required fields and ensure the price is a positive number.', 'warning');
    }
  }
  
  
  
  deleteElement(id: string | number) {
    const elementIndex = this.elements.findIndex(e =>
      (typeof id === 'string' && e.id === id) ||
      (typeof id === 'number' && e.localId === id)
    );
  
    if (elementIndex === -1) return;
  
    const element = this.elements[elementIndex];
  
    // Confirmar la eliminación con SweetAlert
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.apiElements.has(element.id)) {
          this.http.delete(`${this.url}/${element.id}`).subscribe(
            () => {
              this.removeElementFromList(elementIndex); 
              Swal.fire('Deleted!', 'Your element has been deleted.', 'success');
            },
            (error) => console.error('Error deleting element from API', error)
          );
        } else {
          this.removeElementFromList(elementIndex); 
          Swal.fire('Deleted!', 'Your element has been deleted.', 'success');
        }
      }
    });
  }
  

  removeElementFromList(index: number) {
    this.elements.splice(index, 1);
    this.cdr.detectChanges(); 
  }

  viewElement(element: Element) {
    this.selectedElement = element;
    this.editingElement = JSON.parse(JSON.stringify(element));
    this.isPopupVisible = true;
    this.cdr.detectChanges();
  }
  
  

  closePopup() {
    this.isPopupVisible = false;
    this.selectedElement = null;
    this.editingElement = null; 
  }
  

  updateElement() {
    if (!this.selectedElement || !this.editingElement) return;
  
    if (this.apiElements.has(this.selectedElement.id)) {
      this.http.put<Element>(`${this.url}/${this.selectedElement.id}`, this.editingElement).subscribe(
        (response) => {
          this.updateElementInList(response);
          Swal.fire('Success', 'Element updated successfully!', 'success');
        },
        (error) => {
          console.error('Error updating element', error);
          Swal.fire('Error', 'Failed to update element.', 'error');
        }
      );
    } else {
      this.updateElementInList(this.editingElement);
      Swal.fire('Success', 'Element updated successfully!', 'success');
    }
    this.closePopup();
  }
  

  updateElementInList(updatedElement: Element) {
    const index = this.elements.findIndex(e => 
      (updatedElement.id && e.id === updatedElement.id) || 
      (updatedElement.localId && e.localId === updatedElement.localId)
    );
    if (index !== -1) {
      this.elements[index] = { ...updatedElement, localId: this.elements[index].localId };
      this.cdr.detectChanges();
    }
  }

  resetForm() {
    this.newElement = { id: '', name: '', data: {} };
  }

  isNewElementValid() {
    const { name, data } = this.newElement;
    const price = Number(data.price); 
    return name && !isNaN(price) && price > 0; 
  }
  

  isApiElement(id: string | number): boolean {
    return typeof id === 'string' && this.apiElements.has(id);
  }

  getDisplayId(element: Element): string | number {
    return element.localId || element.id;
  }
}
