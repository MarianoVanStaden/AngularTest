import { Component } from '@angular/core';
import { device } from '../../modules/device';
import { TestserService } from '../../services/testser.service';

@Component({
  selector: 'app-testcomp',
  templateUrl: './testcomp.component.html',
  styleUrl: './testcomp.component.css'
})
export class TestcompComponent {
  deviceList = new Array<device>()

  constructor(private testService: TestserService){}
  //ngOnInit -> es igual al windowOnload
  ngOnInit(): void{
    this.testService.getAll().subscribe((response)=>{
      this.deviceList = response;
    })
    
  }
}