import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal/modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

@Component({
  selector: 'app-confirm-control',
  templateUrl: './confirm-control.component.html'
})
export class ConfirmControlComponent {
  @ViewChild('childModal') public childModal: ModalDirective;
  public modalRef: BsModalRef;
  title: string = '';
  text: string = '';
  style: string = '';
  buttonOkText: string = 'Aceptar';
  buttonOkStyle: string = 'btn-success';
  buttonOkIcon: string = 'fa fa-check';
  buttonCancelText: string = 'Cancelar';
  fnOnAccept: any = null;
  fnOnCancel: any = null;


  constructor(private modalService: BsModalService) {
  }

  openModal(options: any) {
    this.style = options.style;
    this.title = options.title;
    this.text = options.text;
    if (options.buttons) {
      if (options.buttons.ok) {
        this.buttonOkText = options.buttons.ok.text;
        if (options.buttons.ok.style) {
          this.buttonOkStyle = options.buttons.ok.style;
        }
        if (options.buttons.ok.icon) {
          this.buttonOkIcon = options.buttons.ok.icon;
        }
      }
      if (options.buttons.cancel) {
        this.buttonCancelText = options.buttons.cancel.text;
      }
    }
    this.fnOnAccept = options.onAccept
    this.fnOnCancel = options.onCancel
    this.childModal.show();
  }

  public accept = () => {
    this.childModal.hide();
    if (this.fnOnAccept) {
      this.fnOnAccept();
    }
  }

  public close() {
    this.childModal.hide();
  }

  public cancel() {
    this.childModal.hide();
    if (this.fnOnCancel) {
      this.fnOnCancel();
    }
  }

}
