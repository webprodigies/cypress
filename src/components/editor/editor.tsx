'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import EditorJS, {
  BlockMutationEvent,
  OutputBlockData,
} from '@editorjs/editorjs';
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
import { workspace } from '@/lib/supabase/supabase.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { updateBlocks } from '@/lib/supabase/queries';

interface EditorProps {
  defaultData: workspace[] | [];
}

const Editor: React.FC<EditorProps> = ({ defaultData }) => {
  const supabase = createClientComponentClient();

  //This will be an object with blocks : an array
  const [defaultBlocks, setDefaultBlocks] = useState<any>(
    defaultData[0].blocks
  );
  console.log(defaultBlocks);
  //Blocks will be stringify
  const [blocks, setBlocks] = useState<any>('');
  const editorRef = useRef<EditorJS>();

  function findDifferentBlock(websocketBlocks: any) {
    const parsedBlocks = JSON.parse(blocks);
    const changes: any = [];

    const localBlockMap = new Map(
      parsedBlocks.map((block: any) => [block.id, block])
    );

    // Find updates and deletions
    websocketBlocks.forEach((block: any) => {
      const localBlock: any = localBlockMap.get(block.id);

      if (localBlock) {
        if (JSON.stringify(localBlock.data) !== JSON.stringify(block.data)) {
          changes.push({
            type: 'update',
            blockId: block.id,
            data: block.data,
          });
        }
      } else {
        // Block exists in websocketBlocks but not in parsedBlocks
        changes.push({
          type: 'add',
          blockId: block.id,
          data: block.data,
        });
      }
    });

    // Find additions
    parsedBlocks.forEach((block: any) => {
      if (!websocketBlocks.some((wb: any) => wb.id === block.id)) {
        changes.push({
          type: 'delete',
          blockId: block.id,
          data: block.data,
        });
      }
    });

    return changes;
  }

  useEffect(() => {
    if (blocks !== JSON.stringify(defaultBlocks) && blocks) {
      console.log('UPDATED DATABASE');
      const response = updateBlocks(defaultData[0].id, JSON.parse(blocks));
    }
  }, [blocks]);

  useEffect(() => {
    const channel = supabase
      .channel('content-updated')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'workspaces' },
        (payload) => {
          console.log('WEBSOCKET FIRED');
          setDefaultBlocks(payload.new.blocks);
          //WIP set it to an empty object by defauly in the schema
          // type Response = { blocks: OutputBlockData[] } | { blocks: [] };
          // const newBlocks: Response = payload.new.blocks;

          // const differentBlock = findDifferentBlock(newBlocks);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, blocks]);

  useEffect(() => {
    const initEditor = async () => {
      const EditorJs = (await import('@editorjs/editorjs')).default;
      const editor = new EditorJs({
        // data: data,
        holder: 'editorjs',
        placeholder: 'Click to enter text.',
        defaultBlock: 'text',
        onReady: () => {
          editor.render(defaultBlocks);
        },
        onChange: async (api, events: BlockMutationEvent) => {
          const exportedData = await editor.save();
          setBlocks(JSON.stringify({ blocks: exportedData.blocks }));
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
      editorRef.current = editor;
    };
    if (!editorRef.current) initEditor();
  }, [defaultData]);

  return (
    <React.Fragment>
      <div className="relative ">
        <Image
          src={BannerImage}
          className=" w-full md:h-48 h-20 object-cover "
          alt="Folder Banner Image"
        />
      </div>

      <div className="py-6 px-8 ">
        <div
          id="editorjs"
          className=""
        />
      </div>
    </React.Fragment>
  );
};

export default Editor;
