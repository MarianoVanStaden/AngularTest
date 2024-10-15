import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Element {
  id: string;
  name: string;
  data: {
    capacity: string;
    color: string;
    screenSize: string;
    generation: string;
    price: number;
  };
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
  newElement: Element = { id: '', name: '', data: { capacity: '', color: '', screenSize: '', generation: '', price: 0 } };
  selectedElement: Element | null = null;
  editingElement: Element | null = null;
  isPopupVisible = false;
  apiElements: Set<string> = new Set();
  nextLocalId = 1;

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


  
  saveElement() {
    if (this.isNewElementValid()) {
      const newElementWithLocalId = { ...this.newElement, localId: this.nextLocalId };
      this.http.post<Element>(this.url, this.newElement).subscribe(
        (response) => {
          const savedElement = { ...response, localId: this.nextLocalId };
          this.elements.push(savedElement);
          this.nextLocalId++;
          this.resetForm();
          this.cdr.detectChanges();
        },
        (error) => console.error('Error adding element', error)
      );
    } else {
      alert('Please complete all required fields and ensure the price is a number.');
    }
  }
  deleteElement(id: string | number) {
    const elementIndex = this.elements.findIndex(e =>
      (typeof id === 'string' && e.id === id) ||
      (typeof id === 'number' && e.localId === id)
    );
  
    if (elementIndex === -1) return;
  
    const element = this.elements[elementIndex];
  
    if (this.apiElements.has(element.id)) {
      // If the element has an API id, make a DELETE request to the API
      this.http.delete(`${this.url}/${element.id}`).subscribe(
        () => {
          this.removeElementFromList(elementIndex); // Remove element from the list after API deletion
        },
        (error) => console.error('Error deleting element from API', error)
      );
    } else {
      // If the element is a mock (no API id), remove it directly
      this.removeElementFromList(elementIndex); 
    }
  }
  
  removeElementFromList(index: number) {
    this.elements.splice(index, 1);
    this.cdr.detectChanges(); // Notify Angular to update the view
  }
  

  viewElement(element: Element) {
    this.selectedElement = element;
    this.editingElement = JSON.parse(JSON.stringify(element)); // Deep copy
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
    this.selectedElement = null;
    this.editingElement = null;
  }

  updateElement() {
    if (!this.selectedElement || !this.editingElement) return;

    if (this.apiElements.has(this.selectedElement.id)) {
      // Update API element
      this.http.put<Element>(`${this.url}/${this.selectedElement.id}`, this.editingElement).subscribe(
        (response) => {
          this.updateElementInList(response);
        },
        (error) => {
          console.error('Error updating element', error);
        }
      );
    } else {
      // Update mock data
      this.updateElementInList(this.editingElement);
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
    this.newElement = { id: '', name: '', data: { capacity: '', color: '', screenSize: '', generation: '', price: 0 } };
  }

  isNewElementValid() {
    const { name, data } = this.newElement;
    return name && data.capacity && data.color && data.screenSize && data.generation && !isNaN(data.price) && data.price !== 0;
  }

  isApiElement(id: string | number): boolean {
    return typeof id === 'string' && this.apiElements.has(id);
  }

  getDisplayId(element: Element): string | number {
    return element.localId || element.id;
  }
}