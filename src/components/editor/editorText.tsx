import { BlockToolData } from '@editorjs/editorjs';

type EditorText = { text: string };

export class EditorDefault {
  data: EditorText;
  element: HTMLElement;

  constructor({ data }: { data: EditorText }) {
    this.data = data;
    this.element = this.createEditorElement('p', '');
  }

  static get isReadOnlySupported() {
    return true;
  }

  createEditorElement(tag: string, className: string) {
    const element = document.createElement(tag);
    element.contentEditable = 'true';
    element.setAttribute(
      'class',
      'bg-transparent outline-none border-none' + className
    );
    element.innerText = this.data.text ? this.data.text : '';
    return element;
  }

  render() {
    return this.element;
  }

  save() {
    return {
      text: this.element.innerText,
    };
  }

  static get toolbox() {
    return {
      title: 'Default Text',
      icon: '<small class="font-bold">T</small>',
    };
  }

  validate() {
    return true;
  }
}

export class EditorText1 {
  data: EditorText;
  element: HTMLElement;

  constructor({ data }: { data: EditorText }) {
    this.data = data;
    this.element = this.createEditorElement(
      'h1',
      'text-3xl sm:text-4xl font-semibold'
    );
  }

  static get isReadOnlySupported() {
    return true;
  }

  createEditorElement(tag: string, className: string) {
    const element = document.createElement(tag);
    element.contentEditable = 'true';
    element.setAttribute(
      'class',
      'bg-transparent outline-none border-none ' + className
    );
    element.innerText = this.data.text ? this.data.text : 'Header';
    return element;
  }

  render() {
    return this.element;
  }

  save() {
    return {
      text: this.element.innerText,
    };
  }

  update(id?: string, data?: BlockToolData) {
    console.log(data);
    if (this.data.text === data.text) {
    } else {
      this.data.text = data.text;
    }
  }

  static get toolbox() {
    return {
      title: 'Header 1',
      icon: '<small class="font-bold">H1</small>',
    };
  }
}

export class EditorText2 {
  data: EditorText;
  element: HTMLElement;

  constructor({ data }: { data: EditorText }) {
    this.data = data;
    this.element = this.createEditorElement(
      'h2',
      'text-3xl sm:text-2xl font-semibold'
    );
  }

  static get isReadOnlySupported() {
    return true;
  }

  createEditorElement(tag: string, className: string) {
    const element = document.createElement(tag);
    element.contentEditable = 'true';
    element.innerText = this.data.text ? this.data.text : 'Header';
    element.setAttribute(
      'class',
      'bg-transparent outline-none border-none ' + className
    );
    return element;
  }

  render() {
    return this.element;
  }

  save() {
    return {
      text: this.element.innerText,
    };
  }

  static get toolbox() {
    return {
      title: 'Header 2',
      icon: '<small class="font-bold">H2</small>',
    };
  }
}

export class EditorText3 {
  data: EditorText;
  element: HTMLElement;

  constructor({ data }: { data: EditorText }) {
    this.data = data;
    this.element = this.createEditorElement(
      'h3',
      'text-3xl sm:text-xl font-semibold'
    );
  }

  static get isReadOnlySupported() {
    return true;
  }

  createEditorElement(tag: string, className: string) {
    const element = document.createElement(tag);
    element.contentEditable = 'true';
    element.innerText = this.data.text ? this.data.text : 'Header';
    element.setAttribute(
      'class',
      'bg-transparent outline-none border-none ' + className
    );
    return element;
  }

  render() {
    return this.element;
  }

  save() {
    return {
      text: this.element.innerText,
    };
  }

  static get toolbox() {
    return {
      title: 'Header 3',
      icon: '<small class="font-bold">H3</small>',
    };
  }
}

export class EditorSmallText {
  data: EditorText;
  element: HTMLElement;

  constructor({ data }: { data: EditorText }) {
    this.data = data;
    this.element = this.createEditorElement(
      'small',
      'dark:text-washed-purple-700'
    );
  }

  static get isReadOnlySupported() {
    return true;
  }

  createEditorElement(tag: string, className: string) {
    const element = document.createElement(tag);
    element.contentEditable = 'true';
    element.innerText = this.data.text ? this.data.text : 'Header';
    element.setAttribute(
      'class',
      'bg-transparent outline-none border-none ' + className
    );
    return element;
  }

  render() {
    return this.element;
  }

  save() {
    return {
      text: this.element.innerText,
    };
  }

  static get toolbox() {
    return {
      title: 'Small',
      icon: '<small class="font-bold">s</small>',
    };
  }
}
