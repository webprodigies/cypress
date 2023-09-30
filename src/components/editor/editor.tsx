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
import { fakeType, workspace } from '@/lib/supabase/supabase.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { updateBlocks } from '@/lib/supabase/queries';

interface EditorProps {
  defaultData: fakeType[] | [];
}
type Blocks = { blocks: [] | OutputBlockData[] };

const Editor: React.FC<EditorProps> = ({ defaultData }) => {
  const supabase = createClientComponentClient();

  //This will be an object with blocks : an array

  const defaultBlocks = useMemo(
    () => defaultData[0].blocks as Blocks,
    [defaultData]
  );

  const [updatingBlocks, setUpdatingBlocks] = useState(false);
  const [socketMounted, setSocketMounted] = useState(false);

  //Blocks will be stringify
  const [blocks, setBlocks] = useState<string>(
    JSON.stringify({ blocks: defaultBlocks.blocks })
  );
  const editorRef = useRef<EditorJS>();

  function findDifferentBlock(websocketBlocks: OutputBlockData[]) {
    let parsedLocalBlocks;

    if (blocks) {
      try {
        parsedLocalBlocks = JSON.parse(blocks) as Blocks;
        // Proceed with parsedBlocks...
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return [];
      }
    } else return [];
    const changes: {
      type: 'add' | 'update' | 'delete';
      blockId?: string | undefined; // the block ID in the OutputBlockData is for somreason undefined
      data: OutputBlockData;
      index: number;
    }[] = [];
    console.log(websocketBlocks, parsedLocalBlocks);

    /**
    insert(
    type?: string,
    data?: BlockToolData,
    config?: ToolConfig,
    index?: number,
    needToFocus?: boolean,
    replace?: boolean,
    id?: string,
  ): BlockAPI;
     */

    const localBlockMap = new Map(
      parsedLocalBlocks.blocks.map((block) => [block.id, block])
    );

    // Find updates and deletions
    websocketBlocks.forEach((block, index) => {
      const localBlock = localBlockMap.get(block.id);

      if (localBlock) {
        if (JSON.stringify(localBlock.data) !== JSON.stringify(block.data)) {
          changes.push({
            type: 'update',
            blockId: block.id,
            data: block.data,
            index,
          });
        }
      } else {
        // Block exists in websocketBlocks but not in localblocksMap
        changes.push({
          index,
          type: 'add',
          blockId: block.id,
          data: block.data,
        });
      }
    });

    // Find additions
    parsedLocalBlocks.blocks.forEach((block, index) => {
      if (!websocketBlocks.some((wb) => wb.id === block.id)) {
        changes.push({
          type: 'delete',
          blockId: block.id,
          index,
          data: block.data,
        });
      }
    });

    return changes;
  }

  useEffect(() => {
    if (blocks !== JSON.stringify(defaultBlocks) && blocks && !updatingBlocks) {
      console.log('UPDATED DATABASE');
      const response = updateBlocks(defaultData[0].id, JSON.parse(blocks));
    }
  }, [blocks]);

  useEffect(() => {
    if (socketMounted) return;
    let channel: any;
    channel = supabase
      .channel('content-updated')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'workspaces' },
        (payload: { new: { blocks: Blocks } }) => {
          setUpdatingBlocks(true);
          console.log('🔥 WEBSOCKET FIRED', payload);
          //WIP set it to an empty object by defauly in the schema
          const changesToBeMade = findDifferentBlock(payload.new.blocks.blocks);
          changesToBeMade.forEach((change) => {
            switch (change.type) {
              case 'update':
                return editorRef.current?.blocks.update(
                  change.blockId as string,
                  change.data
                );
              case 'delete':
                return editorRef.current?.blocks.delete(change.index);
              case 'add':
                return editorRef.current?.blocks.insert(
                  change.data.type,
                  change.data.data,
                  undefined,
                  change.index
                );
            }
          });
          setUpdatingBlocks(false);
        }
      )
      .subscribe();
    setSocketMounted(true);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, blocks, editorRef.current]);

  useEffect(() => {
    const initEditor = async () => {
      const EditorJs = (await import('@editorjs/editorjs')).default;
      const editor = new EditorJs({
        // data: data,
        holder: 'editorjs',
        defaultBlock: 'text',
        onReady: () => {
          if (defaultBlocks.blocks.length > 0) editor.render(defaultBlocks);
        },
        onChange: async (api, events: BlockMutationEvent) => {
          console.log('Editor Change Occured');
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
