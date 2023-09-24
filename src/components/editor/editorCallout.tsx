import React from 'react';
import { createRoot } from 'react-dom/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const EditorCalloutComponent = ({ ...props }) => {
  return (
    <Alert {...props}>
      <Info className="h-4 w-4" />
      <AlertTitle
        id="callout--title"
        contentEditable={true}
        className="editorFocus"
      >
        {props.title}
      </AlertTitle>
      <AlertDescription
        id="callout--description"
        contentEditable={true}
        className="editorFocus"
      >
        {props.description}
      </AlertDescription>
    </Alert>
  );
};

type CalloutType = { title: string; description: string };
export class EditorCallout {
  data;
  element: HTMLElement;

  constructor({ data }: { data: CalloutType }) {
    this.data = data;
    this.element = this.createEditorElement(data);
  }

  createEditorElement(data: CalloutType) {
    const container = document.createElement('div');
    const root = createRoot(container);

    root.render(
      <EditorCalloutComponent
        title={data.title ? data.title : 'Something to note!'}
        description={
          data.description
            ? data.description
            : 'You should subscribe to Web Prodigies'
        }
      ></EditorCalloutComponent>
    );
    return container;
  }
  //Tool box details
  static get toolbox() {
    return {
      title: 'Callout',
      icon: '<small class="font-bold">i</small>',
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  render() {
    return this.element;
  }

  save() {
    return {
      title:
        this.element.querySelector<HTMLElement>('#callout--title')?.innerText ||
        '',
      description:
        this.element.querySelector<HTMLElement>('#callout--description')
          ?.innerText || '',
    };
  }
}

type WarningType = {
  title?: string;
  description?: string;
};

export class EditorWarning {
  data: WarningType;
  element: HTMLElement;

  constructor({ data }: { data: WarningType }) {
    this.data = data;
    this.element = this.createEditorElement(data);
  }

  createEditorElement(data: WarningType) {
    const container = document.createElement('div');
    const root = createRoot(container);

    root.render(
      <EditorCalloutComponent
        variant="destructive"
        title={data.title ? data.title : 'Warning!'}
        description={
          data.description ? data.description : 'This is a warning message.'
        }
      ></EditorCalloutComponent>
    );
    return container;
  }

  // Tool box details
  static get toolbox() {
    return {
      title: 'Error',
      icon: '<small class="font-bold">!</small>',
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  render() {
    return this.element;
  }

  save(blockContent: HTMLElement) {
    return {
      title:
        blockContent.querySelector<HTMLElement>('#callout--title')?.innerText ||
        '',
      description:
        blockContent.querySelector<HTMLElement>('#callout--description')
          ?.innerText || '',
    };
  }
}
