import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', title?: string) {
    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, type, title, message };
    this.toasts.update(list => [...list, newToast]);

    setTimeout(() => {
      this.dismiss(id);
    }, 4500);
  }

  success(message: string, title: string = 'Success') {
    this.show(message, 'success', title);
  }

  error(message: string, title: string = 'Error') {
    this.show(message, 'error', title);
  }

  warning(message: string, title: string = 'Notice') {
    this.show(message, 'warning', title);
  }

  info(message: string, title: string = 'Information') {
    this.show(message, 'info', title);
  }

  dismiss(id: string) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  showSuccess(titleOrMsg: string, details?: string) {
    if (details) {
      this.success(details, titleOrMsg);
    } else {
      this.success(titleOrMsg);
    }
  }

  showError(titleOrMsg: string, details?: string) {
    if (details) {
      this.error(details, titleOrMsg);
    } else {
      this.error(titleOrMsg);
    }
  }

  showInfo(titleOrMsg: string, details?: string) {
    if (details) {
      this.info(details, titleOrMsg);
    } else {
      this.info(titleOrMsg);
    }
  }

  showWarning(titleOrMsg: string, details?: string) {
    if (details) {
      this.warning(details, titleOrMsg);
    } else {
      this.warning(titleOrMsg);
    }
  }
}
