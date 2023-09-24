'use client';
import React, { useEffect, useRef, useState } from 'react';
import EditorJS, { BlockMutationEvent } from '@editorjs/editorjs';
import BannerImage from '../../../public/BannerImage.png';
import {
  EditorText1,
  EditorText2,
  EditorText3,
  EditorSmallText,
  EditorDefault,
} from './editorText';
import Image from 'next/image';
import { EditorCallout, EditorWarning } from './editorCallout';
import { Button } from '../ui/button';
import { mockData } from './data';
import { SavedData } from '@editorjs/editorjs/types/data-formats';

const Editor = () => {
  const [data, setData] = useState<typeof mockData>();
  const ref = useRef<EditorJS>();
  const defRef = useRef<EditorJS>();
  const [event, setEvent] = useState<any>();

  //   useEffect(() => {
  //     const setEditor = async () => {
  //       ref.current?.blocks.update();
  //     };
  //     setEditor();
  //     // setData(mockData);
  //   }, [event]);

  const updateEditor = async (
    id: string,
    data: any,
    event: any,
    editor: number
  ) => {
    // console.log(id, data, event);
    if (editor === 1) await defRef.current?.blocks.update(id, data);
    // if (editor === 2) await ref.current?.blocks.update(id, data);
  };

  useEffect(() => {
    const initEditor = async () => {
      const EditorJs = (await import('@editorjs/editorjs')).default;
      const editor = new EditorJs({
        // data: data,
        holder: 'editorjs',
        placeholder: 'Click to enter text.',
        defaultBlock: 'text',
        data: mockData,

        onChange: async (api, events: BlockMutationEvent) => {
          //   const updatedData = api.blocks;
          //   const response = await events.detail.target.save();
          //   //   console.log(response, updatedData);
          //   if (response) {
          //     const block = api.blocks.getById(response.id);
          //     console.log(block);
          //   }
          console.log(api.blocks);

          /**
           * block-changed
           * block-removed
           */
          //   if (response) {
          //     updateEditor(response.id, response.data, events.type, 1);
          //   }
        },

        tools: {
          text: EditorDefault,
          header1: EditorText1,
          header2: EditorText2,
          header3: EditorText3,
          small: EditorSmallText,
          Callout: EditorCallout,
          Warning: EditorWarning,
        },
      });
      ref.current = editor;
    };
    if (!ref.current) initEditor();
  }, []);

  useEffect(() => {
    const initEditor = async () => {
      const EditorJs = (await import('@editorjs/editorjs')).default;
      const editor = new EditorJs({
        // data: data,
        onChange: async (api, events: BlockMutationEvent) => {
          const updatedData = api.blocks;
          const response = await events.detail.target.save();
          /**
           * block-changed
           * block-removed
           */
          if (response) {
            updateEditor(response.id, response.data, events.type, 2);
          }
        },
        holder: 'fakejs',
        placeholder: 'Click to enter text.',
        defaultBlock: 'text',
        data: mockData,
        tools: {
          text: EditorDefault,
          header1: EditorText1,
          header2: EditorText2,
          header3: EditorText3,
          small: EditorSmallText,
          Callout: EditorCallout,
          Warning: EditorWarning,
        },
      });
      defRef.current = editor;
    };
    if (!defRef.current) initEditor();
  }, []);

  return (
    <React.Fragment>
      <div className="relative ">
        <Image
          src={BannerImage}
          className=" w-full md:h-48 h-20 object-cover "
          alt="Folder Banner Image"
        />
      </div>

      <div className="py-6 px-8 flex">
        <div
          id="editorjs"
          className=""
        />
        <div
          id="fakejs"
          className=""
        />
      </div>
    </React.Fragment>
  );
};

export default Editor;
